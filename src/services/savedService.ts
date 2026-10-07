import { db, isFirebaseConfigured, FirebaseAuthService, sanitizeForFirestore } from './firebase';
import { OpportunitiesService, ALL_VERIFIED_INITIAL_OPPORTUNITIES } from './opportunitiesService';
import { ResourcesService, LEGACY_RESOURCE_ID_MAP } from './resourcesService';
import { VERIFIED_REAL_RESOURCES } from '../data/verifiedResources';
import { InstitutionsService } from './institutionsService';
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

export type SavedItemEntityType = 'opportunity' | 'resource' | 'institution';

export interface SavedItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  type: string;
  itemType?: SavedItemEntityType;
  targetPath?: string;
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
  itemType?: SavedItemEntityType;
  targetPath?: string;
  organizationName?: string;
  deadline?: string;
}

export interface SavedFeedbackDetail {
  id: string;
  title: string;
  isSaved: boolean;
  isGuest: boolean;
  requiresAuth?: boolean;
  status?: 'saving' | 'saved' | 'removed' | 'error';
  targetPath: string;
  error?: string;
}

function withFirestoreTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('firestore_timeout')), ms)
    )
  ]);
}

export function resolveSavedItemPath(item: Partial<SavedItem>): string {
  const slugOrId = item.slug || item.id || '';
  if (
    item.itemType === 'resource' ||
    item.category === 'Courses & Resources' ||
    (item.id && (item.id.startsWith('res-') || item.id.startsWith('res_') || item.id.startsWith('course-')))
  ) {
    return `/resources/${slugOrId}`;
  }
  if (
    item.itemType === 'institution' ||
    (item.id && item.id.startsWith('inst-')) ||
    item.category === 'Tertiary Institution'
  ) {
    return `/institutions/${slugOrId}`;
  }
  if (item.targetPath && item.targetPath.startsWith('/')) {
    return item.targetPath;
  }
  return `/opportunities/${slugOrId}`;
}

class SavedOpportunitiesManager {
  private currentUserId: string | null = null;
  private currentUserTokenGetter: (() => Promise<string | null>) | null = null;
  private activeSavedIds: Set<string> = new Set();
  private cachedOpportunities: Map<string, SavedItem> = new Map();
  private locallyRemovedIds: Set<string> = new Set();
  private inFlightRequests: Map<string, Promise<boolean>> = new Map();
  private activeSyncPromise: Promise<void> | null = null;

  constructor() {
    const resolvedUid = this.detectStoredUserId();
    if (resolvedUid) {
      this.currentUserId = resolvedUid;
      this.loadLocalCacheForUser(resolvedUid);
    } else {
      this.loadLocalCacheForUser('guest');
    }
    this.migrateLegacySavedInstitutions();
  }

  private detectStoredUserId(): string | null {
    try {
      const fbUid = FirebaseAuthService.getAuthInstance()?.currentUser?.uid;
      if (fbUid) return fbUid;
    } catch {}

    try {
      const authUserRaw = localStorage.getItem('opp_gh_auth_user');
      if (authUserRaw) {
        const authUser = JSON.parse(authUserRaw);
        if (authUser?.id && typeof authUser.id === 'string' && authUser.id !== 'guest') {
          return authUser.id;
        }
      }
    } catch {}

    return null;
  }

  public resolveActiveUserId(explicitUserId?: string | null): string {
    if (explicitUserId && explicitUserId !== 'guest') {
      if (this.currentUserId !== explicitUserId) {
        this.currentUserId = explicitUserId;
        this.loadLocalCacheForUser(explicitUserId);
      }
      return explicitUserId;
    }
    if (this.currentUserId && this.currentUserId !== 'guest') {
      return this.currentUserId;
    }
    const storedUid = this.detectStoredUserId();
    if (storedUid) {
      this.currentUserId = storedUid;
      this.loadLocalCacheForUser(storedUid);
      return storedUid;
    }
    return 'guest';
  }

  private migrateLegacySavedInstitutions() {
    try {
      const legacyRaw = localStorage.getItem('opportunity_ghana_saved_institutions');
      if (!legacyRaw) return;
      const legacyIds = JSON.parse(legacyRaw);
      if (Array.isArray(legacyIds) && legacyIds.length > 0) {
        const targetKey = this.currentUserId || 'guest';
        let changed = false;
        for (const id of legacyIds) {
          if (typeof id === 'string' && id && !this.locallyRemovedIds.has(id)) {
            const hydrated = this.hydrateSyncMetadata(id);
            if (hydrated) {
              this.activeSavedIds.add(hydrated.id);
              this.cachedOpportunities.set(hydrated.id, hydrated);
              changed = true;
            }
          }
        }
        if (changed) {
          this.persistLocalCacheForUser(targetKey);
        }
      }
      localStorage.removeItem('opportunity_ghana_saved_institutions');
    } catch {}
  }

  private hydrateSyncMetadata(id: string, fallbackSavedAt?: string): SavedItem | null {
    if (!id) return null;
    const savedAt = fallbackSavedAt || new Date().toISOString();

    // 1. Check local opportunities store & verified initial opportunities
    try {
      const oppsRaw = localStorage.getItem('opp_gh_opportunities_store');
      if (oppsRaw) {
        const parsedOpps = JSON.parse(oppsRaw);
        if (Array.isArray(parsedOpps)) {
          const found = parsedOpps.find((o: any) => o && (o.id === id || o.slug === id));
          if (found) {
            return {
              id: found.id,
              slug: found.slug || found.id,
              title: found.title,
              category: found.category || 'Opportunities',
              type: found.opportunityType || '',
              itemType: 'opportunity',
              targetPath: `/opportunities/${found.slug || found.id}`,
              organizationName: found.organizationName || '',
              deadline: found.deadline || '',
              savedAt
            };
          }
        }
      }
    } catch {}

    const verifiedOpp = ALL_VERIFIED_INITIAL_OPPORTUNITIES.find(
      (o) => o.id === id || o.slug === id
    );
    if (verifiedOpp) {
      return {
        id: verifiedOpp.id,
        slug: verifiedOpp.slug || verifiedOpp.id,
        title: verifiedOpp.title,
        category: verifiedOpp.category || 'Opportunities',
        type: verifiedOpp.opportunityType || '',
        itemType: 'opportunity',
        targetPath: `/opportunities/${verifiedOpp.slug || verifiedOpp.id}`,
        organizationName: verifiedOpp.organizationName || '',
        deadline: verifiedOpp.deadline || '',
        savedAt
      };
    }

    // 2. Check local resources store & verified resources
    const canonicalResId = LEGACY_RESOURCE_ID_MAP[id] || id;
    try {
      const resRaw = localStorage.getItem('opp_gh_resources_store');
      if (resRaw) {
        const parsedRes = JSON.parse(resRaw);
        if (Array.isArray(parsedRes)) {
          const foundRes = parsedRes.find(
            (r: any) => r && (r.id === canonicalResId || r.id === id || r.slug === id)
          );
          if (foundRes) {
            return {
              id: foundRes.id,
              slug: foundRes.slug || foundRes.id,
              title: foundRes.title,
              category: foundRes.category || 'Courses & Resources',
              type: foundRes.isFree ? 'Free Course' : 'Course / Credential',
              itemType: 'resource',
              targetPath: `/resources/${foundRes.slug || foundRes.id}`,
              organizationName: foundRes.providerName || '',
              deadline: '',
              savedAt
            };
          }
        }
      }
    } catch {}

    const verifiedRes = VERIFIED_REAL_RESOURCES.find(
      (r) => r.id === canonicalResId || r.id === id || r.slug === id
    );
    if (verifiedRes) {
      return {
        id: verifiedRes.id,
        slug: verifiedRes.slug || verifiedRes.id,
        title: verifiedRes.title,
        category: verifiedRes.category || 'Courses & Resources',
        type: verifiedRes.isFree ? 'Free Course' : 'Course / Credential',
        itemType: 'resource',
        targetPath: `/resources/${verifiedRes.slug || verifiedRes.id}`,
        organizationName: verifiedRes.providerName || '',
        deadline: '',
        savedAt
      };
    }

    // 3. Check InstitutionsService
    try {
      const inst = InstitutionsService.getById(id);
      if (inst) {
        const nearest = InstitutionsService.getNearestActiveDeadline(inst);
        const primaryCycle = inst.admissionCycles?.[0];
        const deadline =
          nearest?.cycle?.extendedDeadline ||
          nearest?.cycle?.applicationCloseDate ||
          primaryCycle?.extendedDeadline ||
          primaryCycle?.applicationCloseDate ||
          '';
        return {
          id: inst.id,
          slug: inst.slug || inst.id,
          title: inst.name,
          category: 'Tertiary Institution',
          type: inst.institutionType,
          itemType: 'institution',
          targetPath: `/institutions/${inst.slug || inst.id}`,
          organizationName: `${inst.shortName} • ${inst.location.region} Region`,
          deadline,
          savedAt
        };
      }
    } catch {}

    return null;
  }

  private loadLocalCacheForUser(userId: string) {
    try {
      const removedRaw = localStorage.getItem(`opp_gh_unsaved_${userId}`);
      if (removedRaw) {
        const parsedRemoved = JSON.parse(removedRaw);
        if (Array.isArray(parsedRemoved)) {
          this.locallyRemovedIds = new Set(parsedRemoved);
        } else {
          this.locallyRemovedIds.clear();
        }
      } else {
        this.locallyRemovedIds.clear();
      }

      const idsRaw = localStorage.getItem(`opp_gh_saved_${userId}`);
      if (idsRaw) {
        const ids = JSON.parse(idsRaw);
        if (Array.isArray(ids)) {
          this.activeSavedIds = new Set(
            ids.filter((id: string) => Boolean(id) && !this.locallyRemovedIds.has(id))
          );
        } else {
          this.activeSavedIds.clear();
        }
      } else {
        this.activeSavedIds.clear();
      }

      const metaRaw = localStorage.getItem(`opp_gh_saved_meta_${userId}`);
      const validEntries = new Map<string, SavedItem>();
      if (metaRaw) {
        const items = JSON.parse(metaRaw);
        if (Array.isArray(items)) {
          for (const i of items) {
            if (i && i.id && !this.locallyRemovedIds.has(i.id)) {
              this.activeSavedIds.add(i.id);
              validEntries.set(i.id, {
                ...i,
                targetPath: resolveSavedItemPath(i)
              });
            }
          }
        }
      }

      // Ensure every ID in activeSavedIds has metadata in cachedOpportunities
      for (const id of this.activeSavedIds) {
        if (!validEntries.has(id) || !validEntries.get(id)?.title) {
          const synced = this.hydrateSyncMetadata(id, validEntries.get(id)?.savedAt);
          if (synced) {
            validEntries.set(id, synced);
          }
        }
      }

      this.cachedOpportunities = validEntries;
    } catch {}
  }

  private persistLocalCacheForUser(userId: string) {
    try {
      localStorage.setItem(
        `opp_gh_saved_${userId}`,
        JSON.stringify(Array.from(this.activeSavedIds))
      );
      localStorage.setItem(
        `opp_gh_saved_meta_${userId}`,
        JSON.stringify(Array.from(this.cachedOpportunities.values()))
      );
      localStorage.setItem(
        `opp_gh_unsaved_${userId}`,
        JSON.stringify(Array.from(this.locallyRemovedIds))
      );
    } catch {}
  }

  private async hydrateSingleItemMetadata(
    id: string,
    fallbackSavedAt?: string
  ): Promise<SavedItem | null> {
    const syncHydrated = this.hydrateSyncMetadata(id, fallbackSavedAt);
    if (syncHydrated && syncHydrated.title) {
      return syncHydrated;
    }

    try {
      const opp = await OpportunitiesService.getById(id);
      if (opp) {
        return {
          id: opp.id,
          slug: opp.slug || opp.id,
          title: opp.title,
          category: opp.category || 'Opportunities',
          type: opp.opportunityType || '',
          itemType: 'opportunity',
          targetPath: `/opportunities/${opp.slug || opp.id}`,
          organizationName: opp.organizationName || '',
          deadline: opp.deadline || '',
          savedAt: fallbackSavedAt || new Date().toISOString()
        };
      }
    } catch {}

    try {
      const res = await ResourcesService.getById(id);
      if (res) {
        return {
          id: res.id,
          slug: res.slug || res.id,
          title: res.title,
          category: res.category || 'Courses & Resources',
          type: res.isFree ? 'Free Course' : 'Course / Credential',
          itemType: 'resource',
          targetPath: `/resources/${res.slug || res.id}`,
          organizationName: res.providerName || '',
          deadline: '',
          savedAt: fallbackSavedAt || new Date().toISOString()
        };
      }
    } catch {}

    return syncHydrated;
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

    if (!userId || userId === 'guest') {
      this.clearUser();
      return;
    }

    this.currentUserId = userId;

    // Check if there are any guest saved items or pending save item to migrate into the user's account
    const guestItems = this.getGuestSavedItems();
    const pendingItem = this.consumePendingSaveItem();
    if (pendingItem && !guestItems.some((g) => g.id === pendingItem.id)) {
      guestItems.push(pendingItem);
    }

    // Load user's local cache
    this.loadLocalCacheForUser(userId);

    // If guest/pending items exist, merge them into the user's active set
    if (guestItems.length > 0) {
      for (const item of guestItems) {
        if (!item || !item.id) continue;
        this.locallyRemovedIds.delete(item.id);
        this.activeSavedIds.add(item.id);
        this.cachedOpportunities.set(item.id, {
          ...item,
          targetPath: resolveSavedItemPath(item)
        });
      }
      this.persistLocalCacheForUser(userId);
      this.clearGuestStorage();

      window.dispatchEvent(
        new CustomEvent('saved-opportunities-changed', { detail: { userId } })
      );

      // Persist migrated guest items to database
      await Promise.allSettled(
        guestItems.map((item) => this.persistSingleSaveToDatabase(item, userId, tokenGetter))
      );
    }

    // Fetch authoritative latest state from database and merge
    await this.syncFromDatabase(userId);

    window.dispatchEvent(
      new CustomEvent('saved-opportunities-changed', { detail: { userId } })
    );
  }

  private consumePendingSaveItem(): SavedItem | null {
    try {
      const raw = localStorage.getItem('opp_gh_pending_save_item');
      if (raw) {
        localStorage.removeItem('opp_gh_pending_save_item');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.id) {
          return parsed as SavedItem;
        }
      }
    } catch {}
    return null;
  }

  private getGuestSavedItems(): SavedItem[] {
    try {
      const result = new Map<string, SavedItem>();
      const metaRaw = localStorage.getItem('opp_gh_saved_meta_guest');
      if (metaRaw) {
        const items = JSON.parse(metaRaw);
        if (Array.isArray(items)) {
          for (const i of items) {
            if (i && i.id) result.set(i.id, i);
          }
        }
      }
      const idsRaw = localStorage.getItem('opp_gh_saved_guest');
      if (idsRaw) {
        const ids = JSON.parse(idsRaw);
        if (Array.isArray(ids)) {
          for (const id of ids) {
            if (id && !result.has(id)) {
              const hydrated = this.hydrateSyncMetadata(id);
              if (hydrated) result.set(id, hydrated);
            }
          }
        }
      }
      return Array.from(result.values());
    } catch {}
    return [];
  }

  private clearGuestStorage() {
    try {
      localStorage.removeItem('opp_gh_saved_guest');
      localStorage.removeItem('opp_gh_saved_meta_guest');
      localStorage.removeItem('opp_gh_unsaved_guest');
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
    this.locallyRemovedIds.clear();
    this.loadLocalCacheForUser('guest');
    window.dispatchEvent(
      new CustomEvent('saved-opportunities-changed', { detail: { userId: null } })
    );
  }

  private async getAuthToken(tokenGetter?: () => Promise<string | null>): Promise<string | null> {
    const getter = tokenGetter || this.currentUserTokenGetter;
    if (getter) {
      try {
        const token = await getter();
        if (token) return token;
      } catch {}
    }
    try {
      const fbUser = FirebaseAuthService.getAuthInstance()?.currentUser;
      if (fbUser) {
        return await fbUser.getIdToken();
      }
    } catch {}
    return null;
  }

  /**
   * Authoritative synchronization from Firestore and /api/saved.
   * Executes Firestore and Backend API reads in parallel with strict timeouts so UI never hangs.
   */
  public async syncFromDatabase(userId?: string): Promise<void> {
    const targetUserId = this.resolveActiveUserId(userId);
    if (!targetUserId || targetUserId === 'guest') {
      this.loadLocalCacheForUser('guest');
      return;
    }

    // Wait for any in-flight save/unsave mutations to finish first
    if (this.inFlightRequests.size > 0) {
      await Promise.allSettled(Array.from(this.inFlightRequests.values()));
    }

    // If a sync is already running, wait for it to finish so callers get fresh data
    if (this.activeSyncPromise) {
      await this.activeSyncPromise;
      return;
    }

    this.activeSyncPromise = (async () => {
      try {
        if (this.currentUserId !== targetUserId || this.cachedOpportunities.size === 0) {
          this.currentUserId = targetUserId;
          this.loadLocalCacheForUser(targetUserId);
        }

        const remoteIds = new Set<string>();
        const remoteMeta = new Map<string, SavedItem>();

        // 1. Firestore query (with 2.5s timeout so slow WebChannel never blocks)
        const firestoreReadTask = (async () => {
          if (!db || !isFirebaseConfigured) return;
          try {
            const q = query(
              collection(db, 'saved_opportunities'),
              where('userId', '==', targetUserId)
            );
            const snap = await withFirestoreTimeout(getDocs(q), 2500);
            snap.docs.forEach((d) => {
              const data = d.data();
              const oppId = data.opportunityId;
              if (oppId && !this.locallyRemovedIds.has(oppId)) {
                remoteIds.add(oppId);
                if (data.title || data.slug) {
                  const item: SavedItem = {
                    id: oppId,
                    slug: data.slug || oppId,
                    title: data.title || '',
                    category: data.category || 'General',
                    type: data.type || '',
                    itemType: data.itemType || 'opportunity',
                    targetPath: data.targetPath || '',
                    organizationName: data.organizationName || '',
                    deadline: data.deadline || '',
                    savedAt: data.savedAt || new Date().toISOString()
                  };
                  item.targetPath = resolveSavedItemPath(item);
                  remoteMeta.set(oppId, item);
                }
              }
            });
          } catch (err: any) {
            console.debug('[SavedService] Firestore query note:', err?.message || err);
          }
        })();

        // 2. Backend /api/saved query (runs in parallel with Firestore)
        const apiReadTask = (async () => {
          try {
            const headers: Record<string, string> = {
              'X-User-Id': targetUserId
            };
            const token = await this.getAuthToken();
            if (token) {
              headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch('/api/saved', { headers });
            if (res.ok) {
              const data = await res.json();
              if (data.saved && Array.isArray(data.saved)) {
                data.saved.forEach((record: any) => {
                  const oppId = record.opportunityId;
                  if (oppId && !this.locallyRemovedIds.has(oppId)) {
                    remoteIds.add(oppId);
                    if (record.title || record.slug) {
                      const item: SavedItem = {
                        id: oppId,
                        slug: record.slug || oppId,
                        title: record.title || '',
                        category: record.category || 'General',
                        type: record.type || '',
                        itemType: record.itemType || 'opportunity',
                        targetPath: record.targetPath || '',
                        organizationName: record.organizationName || '',
                        deadline: record.deadline || '',
                        savedAt: record.savedAt || new Date().toISOString()
                      };
                      item.targetPath = resolveSavedItemPath(item);
                      remoteMeta.set(oppId, item);
                    }
                  }
                });
              }
            }
          } catch (apiErr: any) {
            console.debug('[SavedService] API sync note:', apiErr?.message || apiErr);
          }
        })();

        await Promise.allSettled([firestoreReadTask, apiReadTask]);

        // 3. Merge local user items + remote items (excluding locallyRemovedIds)
        const mergedIds = new Set<string>();
        const mergedMeta = new Map<string, SavedItem>();

        for (const id of this.activeSavedIds) {
          if (!this.locallyRemovedIds.has(id)) {
            mergedIds.add(id);
            const localItem = this.cachedOpportunities.get(id);
            if (localItem) {
              mergedMeta.set(id, localItem);
            }
          }
        }

        for (const id of remoteIds) {
          if (!this.locallyRemovedIds.has(id)) {
            mergedIds.add(id);
            const rItem = remoteMeta.get(id);
            if (rItem && (!mergedMeta.has(id) || rItem.title)) {
              mergedMeta.set(id, rItem);
            }
          }
        }

        // 4. Hydrate any missing metadata from Opportunities / Resources / Institutions services
        const missingMetaIds = Array.from(mergedIds).filter(
          (id) => !mergedMeta.has(id) || !mergedMeta.get(id)?.title
        );
        if (missingMetaIds.length > 0) {
          await Promise.all(
            missingMetaIds.map(async (id) => {
              const hydrated = await this.hydrateSingleItemMetadata(
                id,
                mergedMeta.get(id)?.savedAt
              );
              if (hydrated) {
                mergedMeta.set(id, hydrated);
              }
            })
          );
        }

        // 5. Push any local items not yet present in remote storage up to database in background
        for (const [id, item] of mergedMeta.entries()) {
          if (!remoteIds.has(id) && !this.locallyRemovedIds.has(id)) {
            this.persistSingleSaveToDatabase(
              item,
              targetUserId,
              this.currentUserTokenGetter || undefined
            ).catch(() => {});
          }
        }

        this.activeSavedIds = mergedIds;
        this.cachedOpportunities = mergedMeta;
        this.persistLocalCacheForUser(targetUserId);

        window.dispatchEvent(
          new CustomEvent('saved-opportunities-changed', { detail: { userId: targetUserId } })
        );
      } finally {
        this.activeSyncPromise = null;
      }
    })();

    await this.activeSyncPromise;
  }

  /**
   * Helper to write a single save record to Firestore and backend API in parallel
   */
  private async persistSingleSaveToDatabase(
    item: SavedItem,
    userId: string,
    tokenGetter?: () => Promise<string | null>
  ): Promise<boolean> {
    const oppId = item.id;
    const docId = `${userId}_${oppId}`;
    let success = false;

    const payload = sanitizeForFirestore({
      id: docId,
      userId,
      opportunityId: oppId,
      title: item.title || '',
      slug: item.slug || oppId,
      category: item.category || 'General',
      type: item.type || '',
      itemType: item.itemType || 'opportunity',
      targetPath: resolveSavedItemPath(item),
      organizationName: item.organizationName || '',
      deadline: item.deadline || '',
      savedAt: item.savedAt || new Date().toISOString()
    });

    // 1. Direct Firestore write (with 2.5s timeout)
    const firestoreWrite = (async () => {
      if (db && isFirebaseConfigured) {
        try {
          await withFirestoreTimeout(
            setDoc(doc(db, 'saved_opportunities', docId), payload, { merge: true }),
            2500
          );
          success = true;
        } catch (err: any) {
          console.debug('[SavedService] Firestore write note:', err?.message || err);
        }
      }
    })();

    // 2. Server API write (/api/saved) - runs in parallel with Firestore
    const apiWrite = (async () => {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        };
        const token = await this.getAuthToken(tokenGetter);
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch('/api/saved', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          success = true;
        }
      } catch (err: any) {
        console.debug('[SavedService] API write note:', err?.message || err);
      }
    })();

    await Promise.allSettled([firestoreWrite, apiWrite]);
    return success;
  }

  /**
   * Helper to delete a single save record from Firestore and backend API in parallel
   */
  private async removeSingleSaveFromDatabase(
    oppId: string,
    userId: string,
    tokenGetter?: () => Promise<string | null>
  ): Promise<boolean> {
    const docId = `${userId}_${oppId}`;
    let success = false;

    // 1. Direct Firestore delete (with 2.5s timeout)
    const firestoreDelete = (async () => {
      if (db && isFirebaseConfigured) {
        try {
          await withFirestoreTimeout(deleteDoc(doc(db, 'saved_opportunities', docId)), 2500);
          success = true;
        } catch (err: any) {
          console.debug('[SavedService] Firestore delete note:', err?.message || err);
        }
      }
    })();

    // 2. Server API delete (/api/saved/:id) - runs in parallel with Firestore
    const apiDelete = (async () => {
      try {
        const headers: Record<string, string> = {
          'X-User-Id': userId
        };
        const token = await this.getAuthToken(tokenGetter);
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`/api/saved/${encodeURIComponent(oppId)}`, {
          method: 'DELETE',
          headers
        });
        if (res.ok) {
          success = true;
        }
      } catch (err: any) {
        console.debug('[SavedService] API delete note:', err?.message || err);
      }
    })();

    await Promise.allSettled([firestoreDelete, apiDelete]);
    return success;
  }

  /**
   * Synchronously checks if an opportunity/resource/institution is saved
   */
  public isSaved(opportunityId: string): boolean {
    if (!opportunityId) return false;
    this.resolveActiveUserId();
    if (this.locallyRemovedIds.has(opportunityId)) return false;
    if (this.activeSavedIds.has(opportunityId)) return true;

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
   * Returns all saved IDs for active session
   */
  public getSavedIds(): string[] {
    this.resolveActiveUserId();
    return Array.from(this.activeSavedIds).filter((id) => !this.locallyRemovedIds.has(id));
  }

  /**
   * Toggles save status for any opportunity, scholarship, job, internship, course, or institution
   * with full database persistence, duplicate prevention, and user feedback events.
   */
  public async toggleSave(
    item: {
      id: string;
      slug?: string;
      title?: string;
      category?: string;
      type?: string;
      opportunityType?: string;
      itemType?: SavedItemEntityType;
      targetPath?: string;
      organizationName?: string;
      deadline?: string;
    },
    userId?: string,
    tokenGetter?: () => Promise<string | null>
  ): Promise<boolean> {
    const oppId = item.id;
    if (!oppId) throw new Error('Valid opportunity ID is required');

    if (tokenGetter) {
      this.currentUserTokenGetter = tokenGetter;
    }

    const targetUserId = this.resolveActiveUserId(userId);

    const inflightKey = `${targetUserId}_${oppId}`;
    if (this.inFlightRequests.has(inflightKey)) {
      return this.inFlightRequests.get(inflightKey)!;
    }

    const wasSaved = this.isSaved(oppId);
    const willBeSaved = !wasSaved;

    // Hydrate metadata if only an ID was passed
    let savedItemData: SavedItem = {
      id: oppId,
      slug: item.slug || oppId,
      title: item.title || '',
      category: item.category || 'General',
      type: item.type || item.opportunityType || '',
      itemType: item.itemType || 'opportunity',
      targetPath: item.targetPath || '',
      organizationName: item.organizationName || '',
      deadline: item.deadline || '',
      savedAt: new Date().toISOString()
    };
    savedItemData.targetPath = resolveSavedItemPath(savedItemData);

    if (!savedItemData.title) {
      const hydrated = await this.hydrateSingleItemMetadata(oppId, savedItemData.savedAt);
      if (hydrated) {
        savedItemData = hydrated;
      }
    }

    // 1. Optimistic state update
    if (willBeSaved) {
      this.locallyRemovedIds.delete(oppId);
      this.activeSavedIds.add(oppId);
      this.cachedOpportunities.set(oppId, savedItemData);
    } else {
      this.locallyRemovedIds.add(oppId);
      this.activeSavedIds.delete(oppId);
      this.cachedOpportunities.delete(oppId);
    }

    this.persistLocalCacheForUser(targetUserId);

    window.dispatchEvent(
      new CustomEvent('saved-opportunities-changed', {
        detail: { id: oppId, isSaved: willBeSaved, userId: targetUserId }
      })
    );

    // If user is not signed in, store pending item and trigger sign-in prompt
    if (targetUserId === 'guest' && willBeSaved) {
      try {
        localStorage.setItem('opp_gh_pending_save_item', JSON.stringify(savedItemData));
      } catch {}
    }

    const feedbackDetail: SavedFeedbackDetail = {
      id: oppId,
      title: savedItemData.title || 'Opportunity',
      isSaved: willBeSaved,
      isGuest: targetUserId === 'guest',
      requiresAuth: targetUserId === 'guest' && willBeSaved,
      status: willBeSaved ? 'saved' : 'removed',
      targetPath: savedItemData.targetPath || `/opportunities/${savedItemData.slug}`
    };
    window.dispatchEvent(
      new CustomEvent('saved-opportunity-feedback', { detail: feedbackDetail })
    );

    // 2. Persistent database write (for authenticated user)
    const writePromise = (async (): Promise<boolean> => {
      if (targetUserId === 'guest') {
        return willBeSaved;
      }

      if (willBeSaved) {
        await this.persistSingleSaveToDatabase(savedItemData, targetUserId, tokenGetter);
      } else {
        await this.removeSingleSaveFromDatabase(oppId, targetUserId, tokenGetter);
      }
      return willBeSaved;
    })();

    this.inFlightRequests.set(inflightKey, writePromise);

    try {
      await writePromise;
      return willBeSaved;
    } finally {
      this.inFlightRequests.delete(inflightKey);
    }
  }

  /**
   * Loads full Opportunity records for all saved items belonging to the user.
   */
  public async getSavedOpportunities(
    userId?: string,
    tokenGetter?: () => Promise<string | null>
  ): Promise<Opportunity[]> {
    const targetUserId = this.resolveActiveUserId(userId);
    if (tokenGetter) {
      this.currentUserTokenGetter = tokenGetter;
    }
    if (targetUserId && targetUserId !== 'guest') {
      await this.syncFromDatabase(targetUserId);
    }

    const details = this.getAllSavedDetails();
    if (details.length === 0) return [];

    const oppPromises = details.map(async (cached) => {
      try {
        const opp = await OpportunitiesService.getById(cached.id);
        if (opp) return opp;
      } catch {}

      return {
        id: cached.id,
        title: cached.title,
        slug: cached.slug,
        category: cached.category as any,
        opportunityType: cached.type,
        organizationName: cached.organizationName,
        deadline: cached.deadline,
        description: '',
        status: 'published',
        verificationStatus: 'verified',
        createdAt: cached.savedAt,
        updatedAt: cached.savedAt
      } as Opportunity;
    });

    return Promise.all(oppPromises);
  }

  /**
   * Returns all saved item details sorted by most recently saved, without duplicates.
   * Ensures every activeSavedId is hydrated even if cachedOpportunities was missing metadata.
   */
  public getAllSavedDetails(): SavedItem[] {
    const targetKey = this.resolveActiveUserId();
    const unique = new Map<string, SavedItem>();
    let needsPersist = false;

    for (const id of this.activeSavedIds) {
      if (!id || this.locallyRemovedIds.has(id)) continue;

      let item = this.cachedOpportunities.get(id);
      if (!item || !item.title) {
        const hydrated = this.hydrateSyncMetadata(id, item?.savedAt);
        if (hydrated) {
          item = hydrated;
          this.cachedOpportunities.set(id, hydrated);
          needsPersist = true;
        }
      }

      if (item && item.title) {
        unique.set(id, {
          ...item,
          targetPath: resolveSavedItemPath(item)
        });
      }
    }

    if (needsPersist) {
      this.persistLocalCacheForUser(targetKey);
    }

    return Array.from(unique.values()).sort(
      (a, b) => new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime()
    );
  }
}

export const SavedService = new SavedOpportunitiesManager();
