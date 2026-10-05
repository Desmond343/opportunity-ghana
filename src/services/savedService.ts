import { db, isFirebaseConfigured } from './firebase';
import { OpportunitiesService } from './opportunitiesService';
import { Opportunity } from '../types/database';
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  deleteDoc
} from 'firebase/firestore';

export interface SavedItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  type: string;
  organizationName?: string;
  deadline?: string;
  savedAt: string;
}

export interface SavedOpportunityRecord {
  id: string;
  userId: string;
  opportunityId: string;
  savedAt: string;
  title?: string;
  slug?: string;
  category?: string;
  type?: string;
  organizationName?: string;
  deadline?: string;
}

class SavedOpportunitiesManager {
  private currentUserId: string | null = null;
  private currentUserTokenGetter: (() => Promise<string | null>) | null = null;
  private activeSavedIds: Set<string> = new Set();
  private cachedOpportunities: Map<string, SavedItem> = new Map();
  private inFlightRequests: Map<string, Promise<boolean>> = new Map();
  private isSyncing = false;

  constructor() {
    // Attempt to initialize from stored user session or guest storage
    try {
      const authUserRaw = localStorage.getItem('opp_gh_auth_user');
      if (authUserRaw) {
        const authUser = JSON.parse(authUserRaw);
        if (authUser?.id) {
          this.currentUserId = authUser.id;
          this.loadLocalCacheForUser(authUser.id);
          return;
        }
      }
    } catch {}

    // Fallback: load guest saved items
    this.loadLocalCacheForUser('guest');
  }

  private loadLocalCacheForUser(userId: string) {
    try {
      const idsRaw = localStorage.getItem(`opp_gh_saved_${userId}`);
      if (idsRaw) {
        const ids = JSON.parse(idsRaw);
        if (Array.isArray(ids)) {
          this.activeSavedIds = new Set(ids);
        }
      } else {
        this.activeSavedIds.clear();
      }

      const metaRaw = localStorage.getItem(`opp_gh_saved_meta_${userId}`);
      if (metaRaw) {
        const items = JSON.parse(metaRaw);
        if (Array.isArray(items)) {
          this.cachedOpportunities = new Map(items.map((i: SavedItem) => [i.id, i]));
        }
      } else {
        this.cachedOpportunities.clear();
      }
    } catch {}
  }

  private persistLocalCacheForUser(userId: string) {
    try {
      localStorage.setItem(`opp_gh_saved_${userId}`, JSON.stringify(Array.from(this.activeSavedIds)));
      localStorage.setItem(
        `opp_gh_saved_meta_${userId}`,
        JSON.stringify(Array.from(this.cachedOpportunities.values()))
      );
    } catch {}
  }

  /**
   * Initialize or sync state when user logs in or auth state changes
   */
  public async initForUser(
    userId: string | null,
    tokenGetter?: () => Promise<string | null>
  ): Promise<void> {
    if (tokenGetter) {
      this.currentUserTokenGetter = tokenGetter;
    }

    if (!userId) {
      this.clearUser();
      return;
    }

    const previousUserId = this.currentUserId;
    this.currentUserId = userId;

    // Check if there are any guest saved items to migrate into the user's account
    const guestItems = this.getGuestSavedItems();

    // Load user's local cache
    this.loadLocalCacheForUser(userId);

    // If guest items exist, merge them into the user's active set
    if (guestItems.length > 0) {
      for (const item of guestItems) {
        this.activeSavedIds.add(item.id);
        this.cachedOpportunities.set(item.id, item);
      }
      this.persistLocalCacheForUser(userId);
      this.clearGuestStorage();

      // Persist migrated guest items to database in background
      guestItems.forEach((item) => {
        this.persistSingleSaveToDatabase(item, userId, tokenGetter);
      });
    }

    // Always fetch authoritative latest state from database
    await this.syncFromDatabase(userId);

    window.dispatchEvent(
      new CustomEvent('saved-opportunities-changed', { detail: { userId } })
    );
  }

  /**
   * Retrieve guest saved items if any were saved before logging in
   */
  private getGuestSavedItems(): SavedItem[] {
    try {
      const metaRaw = localStorage.getItem('opp_gh_saved_meta_guest');
      if (metaRaw) {
        const items = JSON.parse(metaRaw);
        if (Array.isArray(items)) return items;
      }
    } catch {}
    return [];
  }

  private clearGuestStorage() {
    try {
      localStorage.removeItem('opp_gh_saved_guest');
      localStorage.removeItem('opp_gh_saved_meta_guest');
    } catch {}
  }

  /**
   * Clears user-specific memory on sign out and resets to guest state
   */
  public clearUser(): void {
    this.currentUserId = null;
    this.currentUserTokenGetter = null;
    this.activeSavedIds.clear();
    this.cachedOpportunities.clear();
    this.loadLocalCacheForUser('guest');
    window.dispatchEvent(
      new CustomEvent('saved-opportunities-changed', { detail: { userId: null } })
    );
  }

  /**
   * Authoritative synchronization from Firestore and /api/saved
   */
  public async syncFromDatabase(userId: string): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const fetchedIds = new Set<string>();
      const fetchedMeta = new Map<string, SavedItem>();

      // 1. Query Firestore saved_opportunities collection
      if (db && isFirebaseConfigured) {
        try {
          const q = query(collection(db, 'saved_opportunities'), where('userId', '==', userId));
          const snap = await getDocs(q);
          snap.docs.forEach((d) => {
            const data = d.data();
            if (data.opportunityId) {
              fetchedIds.add(data.opportunityId);
              if (data.title || data.slug) {
                fetchedMeta.set(data.opportunityId, {
                  id: data.opportunityId,
                  slug: data.slug || data.opportunityId,
                  title: data.title || '',
                  category: data.category || 'General',
                  type: data.type || '',
                  organizationName: data.organizationName || '',
                  deadline: data.deadline || '',
                  savedAt: data.savedAt || new Date().toISOString()
                });
              }
            }
          });
        } catch (err: any) {
          console.warn('[SavedService] Firestore query note:', err?.message || err);
        }
      }

      // 2. Query /api/saved endpoint
      const tokenGetter = this.currentUserTokenGetter;
      if (tokenGetter) {
        try {
          const token = await tokenGetter();
          if (token) {
            const res = await fetch('/api/saved', {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              if (data.saved && Array.isArray(data.saved)) {
                data.saved.forEach((record: any) => {
                  if (record.opportunityId) {
                    fetchedIds.add(record.opportunityId);
                    if (record.title || record.slug) {
                      fetchedMeta.set(record.opportunityId, {
                        id: record.opportunityId,
                        slug: record.slug || record.opportunityId,
                        title: record.title || '',
                        category: record.category || 'General',
                        type: record.type || '',
                        organizationName: record.organizationName || '',
                        deadline: record.deadline || '',
                        savedAt: record.savedAt || new Date().toISOString()
                      });
                    }
                  }
                });
              }
            }
          }
        } catch (apiErr: any) {
          console.warn('[SavedService] API sync note:', apiErr?.message || apiErr);
        }
      }

      // 3. Hydrate any missing metadata from OpportunitiesService
      const missingMetaIds = Array.from(fetchedIds).filter(id => !fetchedMeta.has(id));
      if (missingMetaIds.length > 0) {
        await Promise.all(
          missingMetaIds.map(async (id) => {
            try {
              const opp = await OpportunitiesService.getById(id);
              if (opp) {
                fetchedMeta.set(opp.id, {
                  id: opp.id,
                  slug: opp.slug,
                  title: opp.title,
                  category: opp.category,
                  type: opp.opportunityType || '',
                  organizationName: opp.organizationName || '',
                  deadline: opp.deadline || '',
                  savedAt: new Date().toISOString()
                });
              }
            } catch {}
          })
        );
      }

      // Merge into local cache
      if (fetchedIds.size > 0 || (db && isFirebaseConfigured)) {
        this.activeSavedIds = fetchedIds;
        for (const [id, item] of fetchedMeta.entries()) {
          this.cachedOpportunities.set(id, item);
        }
        // Remove cached opportunities that are no longer in fetchedIds
        for (const id of Array.from(this.cachedOpportunities.keys())) {
          if (!fetchedIds.has(id)) {
            this.cachedOpportunities.delete(id);
          }
        }
        this.persistLocalCacheForUser(userId);
        window.dispatchEvent(
          new CustomEvent('saved-opportunities-changed', { detail: { userId } })
        );
      }
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Helper to write a single save record to Firestore and backend API
   */
  private async persistSingleSaveToDatabase(
    item: SavedItem,
    userId: string,
    tokenGetter?: () => Promise<string | null>
  ): Promise<boolean> {
    const oppId = item.id;
    const docId = `${userId}_${oppId}`;
    let success = false;

    // 1. Direct Firestore write
    if (db && isFirebaseConfigured) {
      try {
        await setDoc(
          doc(db, 'saved_opportunities', docId),
          {
            id: docId,
            userId,
            opportunityId: oppId,
            title: item.title,
            slug: item.slug,
            category: item.category,
            type: item.type,
            organizationName: item.organizationName || '',
            deadline: item.deadline || '',
            savedAt: item.savedAt || new Date().toISOString()
          },
          { merge: true }
        );
        success = true;
      } catch (err: any) {
        console.warn('[SavedService] Background Firestore write error:', err?.message || err);
      }
    }

    // 2. Server API write
    const getToken = tokenGetter || this.currentUserTokenGetter;
    if (getToken) {
      try {
        const token = await getToken();
        if (token) {
          const res = await fetch('/api/saved', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              opportunityId: oppId,
              title: item.title,
              slug: item.slug,
              category: item.category,
              type: item.type,
              organizationName: item.organizationName,
              deadline: item.deadline
            })
          });
          if (res.ok) success = true;
        }
      } catch (err: any) {
        console.warn('[SavedService] Background API write error:', err?.message || err);
      }
    }

    return success;
  }

  /**
   * Synchronously checks if an opportunity is saved for active user or guest
   */
  public isSaved(opportunityId: string): boolean {
    if (!opportunityId) return false;
    if (this.activeSavedIds.has(opportunityId)) return true;

    // Check user-scoped or guest storage fallback
    const targetKey = this.currentUserId || 'guest';
    try {
      const raw = localStorage.getItem(`opp_gh_saved_${targetKey}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.includes(opportunityId)) {
          this.activeSavedIds.add(opportunityId);
          return true;
        }
      }
    } catch {}
    return false;
  }

  /**
   * Returns all saved opportunity IDs for active session
   */
  public getSavedIds(): string[] {
    return Array.from(this.activeSavedIds);
  }

  /**
   * Toggles save status for an opportunity with full database persistence,
   * optimistic UI updates, duplicate prevention, and rollback on error.
   */
  public async toggleSave(
    item: {
      id: string;
      slug?: string;
      title?: string;
      category?: string;
      type?: string;
      opportunityType?: string;
      organizationName?: string;
      deadline?: string;
    },
    userId?: string,
    tokenGetter?: () => Promise<string | null>
  ): Promise<boolean> {
    const oppId = item.id;
    if (!oppId) throw new Error('Valid opportunity ID is required');

    if (userId) {
      this.currentUserId = userId;
    }
    if (tokenGetter) {
      this.currentUserTokenGetter = tokenGetter;
    }

    const targetUserId = userId || this.currentUserId || 'guest';

    const inflightKey = `${targetUserId}_${oppId}`;
    if (this.inFlightRequests.has(inflightKey)) {
      return this.inFlightRequests.get(inflightKey)!;
    }

    const wasSaved = this.activeSavedIds.has(oppId);
    const willBeSaved = !wasSaved;

    const savedItemData: SavedItem = {
      id: oppId,
      slug: item.slug || oppId,
      title: item.title || '',
      category: item.category || 'General',
      type: item.type || item.opportunityType || '',
      organizationName: item.organizationName || '',
      deadline: item.deadline || '',
      savedAt: new Date().toISOString()
    };

    // 1. Optimistic UI update
    if (willBeSaved) {
      this.activeSavedIds.add(oppId);
      this.cachedOpportunities.set(oppId, savedItemData);
    } else {
      this.activeSavedIds.delete(oppId);
      this.cachedOpportunities.delete(oppId);
    }

    this.persistLocalCacheForUser(targetUserId);

    window.dispatchEvent(
      new CustomEvent('saved-opportunities-changed', {
        detail: { id: oppId, isSaved: willBeSaved, userId: targetUserId }
      })
    );

    // 2. Perform persistent database write (for authenticated user)
    const writePromise = (async (): Promise<boolean> => {
      // If guest user, localStorage is already persisted
      if (targetUserId === 'guest') {
        return willBeSaved;
      }

      const docId = `${targetUserId}_${oppId}`;
      let writeSucceeded = false;

      // Direct write to Firestore
      if (db && isFirebaseConfigured) {
        try {
          if (willBeSaved) {
            await setDoc(
              doc(db, 'saved_opportunities', docId),
              {
                id: docId,
                userId: targetUserId,
                opportunityId: oppId,
                title: savedItemData.title,
                slug: savedItemData.slug,
                category: savedItemData.category,
                type: savedItemData.type,
                organizationName: savedItemData.organizationName,
                deadline: savedItemData.deadline,
                savedAt: savedItemData.savedAt
              },
              { merge: true }
            );
          } else {
            await deleteDoc(doc(db, 'saved_opportunities', docId));
          }
          writeSucceeded = true;
        } catch (err: any) {
          console.warn('[SavedService] Firestore write note:', err?.message || err);
        }
      }

      // Write to server API route /api/saved
      const getToken = tokenGetter || this.currentUserTokenGetter;
      if (getToken) {
        try {
          const token = await getToken();
          if (token) {
            const res = await fetch(willBeSaved ? '/api/saved' : `/api/saved/${encodeURIComponent(oppId)}`, {
              method: willBeSaved ? 'POST' : 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: willBeSaved
                ? JSON.stringify({
                    opportunityId: oppId,
                    title: savedItemData.title,
                    slug: savedItemData.slug,
                    category: savedItemData.category,
                    type: savedItemData.type,
                    organizationName: savedItemData.organizationName,
                    deadline: savedItemData.deadline
                  })
                : undefined
            });
            if (res.ok) {
              writeSucceeded = true;
            }
          }
        } catch (apiErr: any) {
          console.warn('[SavedService] API endpoint write note:', apiErr?.message || apiErr);
        }
      }

      return willBeSaved;
    })();

    this.inFlightRequests.set(inflightKey, writePromise);

    try {
      await writePromise;
      return willBeSaved;
    } catch (error) {
      // Rollback optimistic state on actual rejection
      if (wasSaved) {
        this.activeSavedIds.add(oppId);
        this.cachedOpportunities.set(oppId, savedItemData);
      } else {
        this.activeSavedIds.delete(oppId);
        this.cachedOpportunities.delete(oppId);
      }
      this.persistLocalCacheForUser(targetUserId);

      window.dispatchEvent(
        new CustomEvent('saved-opportunities-changed', {
          detail: { id: oppId, isSaved: wasSaved, userId: targetUserId }
        })
      );
      throw new Error('Unable to save this opportunity. Please check your connection and try again.');
    } finally {
      this.inFlightRequests.delete(inflightKey);
    }
  }

  /**
   * Loads full Opportunity records for all saved items belonging to the user.
   * Gracefully synthesizes or falls back for any deleted / archived listings.
   */
  public async getSavedOpportunities(
    userId?: string,
    tokenGetter?: () => Promise<string | null>
  ): Promise<Opportunity[]> {
    const targetUserId = userId || this.currentUserId;
    if (targetUserId && targetUserId !== 'guest') {
      await this.syncFromDatabase(targetUserId);
    }

    const savedIds = Array.from(this.activeSavedIds);
    if (savedIds.length === 0) return [];

    const oppPromises = savedIds.map(async (id) => {
      try {
        const opp = await OpportunitiesService.getById(id);
        if (opp) return opp;

        // Fallback to cached item metadata if full record was deleted/archived
        if (this.cachedOpportunities.has(id)) {
          const cached = this.cachedOpportunities.get(id)!;
          return {
            id: cached.id,
            title: cached.title,
            slug: cached.slug,
            category: cached.category,
            opportunityType: cached.type,
            organizationName: cached.organizationName,
            deadline: cached.deadline,
            description: '',
            status: 'published',
            verificationStatus: 'verified',
            createdAt: cached.savedAt,
            updatedAt: cached.savedAt
          } as Opportunity;
        }
        return null;
      } catch {
        if (this.cachedOpportunities.has(id)) {
          const cached = this.cachedOpportunities.get(id)!;
          return {
            id: cached.id,
            title: cached.title,
            slug: cached.slug,
            category: cached.category,
            opportunityType: cached.type,
            organizationName: cached.organizationName,
            deadline: cached.deadline,
            description: '',
            status: 'published',
            verificationStatus: 'verified',
            createdAt: cached.savedAt,
            updatedAt: cached.savedAt
          } as Opportunity;
        }
        return null;
      }
    });

    const results = await Promise.all(oppPromises);
    return results.filter((o): o is Opportunity => o !== null);
  }

  /**
   * Fast synchronous details retrieval from cache
   */
  public getAllSavedDetails(): SavedItem[] {
    return Array.from(this.cachedOpportunities.values());
  }
}

export const SavedService = new SavedOpportunitiesManager();

