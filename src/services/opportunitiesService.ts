import { Opportunity, OpportunityStatus, VerificationStatus } from '../types/database';
import { db, isFirebaseConfigured } from './firebase';
import { FirebaseStorageService } from './firebase/storageService';
import { AuditService } from './auditService';
import { isOpportunityActuallyClosed } from './deadlineService';
import { VERIFIED_REAL_SCHOLARSHIPS } from '../data/verifiedOpportunities';
import { detectDuplicates } from './duplicateDetection';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'opp_gh_opportunities_store';

function syncWithDeadlineAutomation(opp: Opportunity): Opportunity {
  if (opp.status !== 'archived' && opp.status !== 'draft') {
    if (isOpportunityActuallyClosed(opp.status, opp.deadline) && opp.status !== 'closed') {
      return {
        ...opp,
        status: 'closed',
        verificationStatus: 'closed',
        closedAt: opp.closedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }
  return opp;
}

function getStoredOpportunities(): Opportunity[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Purge any old demo/mock records from storage
        let cleaned = parsed.filter(o => 
          o && 
          o.id && 
          !o.id.startsWith('opp-demo-') && 
          !o.title?.includes('[DEMO RECORD]') &&
          !o.applicationUrl?.includes('example.com')
        );

        // Merge in verified scholarships if any are missing or need updating
        for (const verified of VERIFIED_REAL_SCHOLARSHIPS) {
          const existingIdx = cleaned.findIndex(o => 
            o.id === verified.id || 
            o.slug === verified.slug || 
            (o.applicationUrl && verified.applicationUrl && o.applicationUrl.toLowerCase() === verified.applicationUrl.toLowerCase())
          );
          if (existingIdx >= 0) {
            // Update fields with freshest verified data
            cleaned[existingIdx] = {
              ...cleaned[existingIdx],
              ...verified,
              views: cleaned[existingIdx].views || 0,
              saves: cleaned[existingIdx].saves || 0
            };
          } else {
            cleaned.push(verified);
          }
        }

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
        return cleaned.map(syncWithDeadlineAutomation);
      }
    }
  } catch (e) {
    console.error('Failed to load local opportunities storage', e);
  }

  // Initial populate with verified real scholarships
  const initial = VERIFIED_REAL_SCHOLARSHIPS.map(syncWithDeadlineAutomation);
  saveStoredOpportunities(initial);
  return initial;
}

function saveStoredOpportunities(items: Opportunity[]) {
  try {
    const cleaned = items.filter(o => 
      o && 
      o.id && 
      !o.id.startsWith('opp-demo-') && 
      !o.title?.includes('[DEMO RECORD]')
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
  } catch (e) {
    console.error('Failed to save opportunities', e);
  }
}

export interface OpportunityFilters {
  category?: string;
  search?: string;
  region?: string;
  opportunityType?: string;
  educationLevel?: string;
  studyLevel?: string;
  fundingType?: string;
  status?: OpportunityStatus;
  verificationStatus?: VerificationStatus;
  onlyActive?: boolean;
  includeUnpublished?: boolean; // True for admin views, false for public
}

export const OpportunitiesService = {
  async getAll(filters?: OpportunityFilters): Promise<Opportunity[]> {
    let items = getStoredOpportunities();

    // Query Firestore if configured
    if (isFirebaseConfigured && db) {
      try {
        const oppsRef = collection(db, 'opportunities');
        let q = query(oppsRef);
        if (filters?.category && filters.category !== 'All') {
          q = query(oppsRef, where('category', '==', filters.category));
        }
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 3000)
        );
        const snapshot: any = await Promise.race([getDocs(q), timeout]);
        const results = snapshot.docs
          .map((d: any) => syncWithDeadlineAutomation({ id: d.id, ...d.data() } as Opportunity))
          .filter((o: Opportunity) => !o.id.startsWith('opp-demo-') && !o.title?.includes('[DEMO RECORD]'));
        
        if (results.length > 0) {
          // Merge in any missing verified scholarships
          for (const verified of VERIFIED_REAL_SCHOLARSHIPS) {
            if (!results.some((r: Opportunity) => r.id === verified.id || r.slug === verified.slug)) {
              results.push(verified);
              setDoc(doc(db, 'opportunities', verified.id), verified, { merge: true }).catch(() => {});
            }
          }
          items = results;
          saveStoredOpportunities(items);
        } else {
          // Seed Firestore with verified items
          for (const opp of items) {
            setDoc(doc(db, 'opportunities', opp.id), opp, { merge: true }).catch(() => {});
          }
        }
      } catch (err: any) {
        if (err?.code !== 'unavailable' && err?.message !== 'timeout') {
          console.warn('Firestore opportunities read error:', err?.message || err);
        }
      }
    }

    // By default, public website displays ONLY published & active (or closed) records, NOT drafts/pending
    if (!filters?.includeUnpublished) {
      items = items.filter(o => o.status === 'published' || o.status === 'closed');
    }

    if (filters) {
      if (filters.status) {
        items = items.filter(o => o.status === filters.status);
      }
      if (filters.verificationStatus) {
        items = items.filter(o => o.verificationStatus === filters.verificationStatus);
      }
      if (filters.category && filters.category !== 'All') {
        items = items.filter(o => o.category.toLowerCase() === filters.category!.toLowerCase());
      }
      if (filters.region && filters.region !== 'All Regions' && filters.region !== 'All Ghana') {
        items = items.filter(o => o.region?.toLowerCase() === filters.region!.toLowerCase());
      }
      if (filters.opportunityType && filters.opportunityType !== 'All') {
        items = items.filter(o => o.opportunityType?.toLowerCase().includes(filters.opportunityType!.toLowerCase()));
      }
      if (filters.educationLevel && filters.educationLevel !== 'All Levels' && filters.educationLevel !== 'All Education Levels') {
        items = items.filter(o =>
          !o.educationLevel ||
          o.educationLevel.toLowerCase().includes(filters.educationLevel!.toLowerCase()) ||
          o.educationLevel === 'Any'
        );
      }
      if (filters.studyLevel && filters.studyLevel !== 'All') {
        items = items.filter(o =>
          (o.studyLevel && o.studyLevel.toLowerCase().includes(filters.studyLevel!.toLowerCase())) ||
          (o.educationLevel && o.educationLevel.toLowerCase().includes(filters.studyLevel!.toLowerCase()))
        );
      }
      if (filters.fundingType && filters.fundingType !== 'All') {
        items = items.filter(o =>
          (o.fundingType && o.fundingType.toLowerCase().includes(filters.fundingType!.toLowerCase()))
        );
      }
      if (filters.onlyActive) {
        items = items.filter(o => o.status === 'published' && !isOpportunityActuallyClosed(o.status, o.deadline));
      }
      if (filters.search && filters.search.trim().length > 0) {
        const q = filters.search.toLowerCase().trim();
        items = items.filter(o =>
          o.title.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          (o.organizationName && o.organizationName.toLowerCase().includes(q)) ||
          o.category.toLowerCase().includes(q) ||
          (o.location && o.location.toLowerCase().includes(q))
        );
      }
    }

    return items;
  },

  async getById(id: string): Promise<Opportunity | null> {
    if (isFirebaseConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, 'opportunities', id));
        if (docSnap.exists()) {
          const item = syncWithDeadlineAutomation({ id: docSnap.id, ...docSnap.data() } as Opportunity);
          if (!item.id.startsWith('opp-demo-') && !item.title.includes('[DEMO RECORD]')) {
            return item;
          }
        }
      } catch (err) {
        console.warn('Firestore getById error:', err);
      }
    }
    const items = getStoredOpportunities();
    return items.find(o => o.id === id) || null;
  },

  async getBySlug(slug: string): Promise<Opportunity | null> {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'opportunities'), where('slug', '==', slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const doc = snap.docs[0];
          const item = syncWithDeadlineAutomation({ id: doc.id, ...doc.data() } as Opportunity);
          if (!item.id.startsWith('opp-demo-') && !item.title.includes('[DEMO RECORD]')) {
            return item;
          }
        }
      } catch (err) {
        console.warn('Firestore getBySlug error:', err);
      }
    }
    const items = getStoredOpportunities();
    return items.find(o => o.slug === slug) || null;
  },

  async saveOpportunity(
    opp: Opportunity,
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' }
  ): Promise<Opportunity> {
    const items = getStoredOpportunities();
    const index = items.findIndex(o => o.id === opp.id);
    const now = new Date().toISOString();

    const isNew = index < 0;
    const previousStatus = isNew ? undefined : items[index].status;

    const toSave: Opportunity = {
      ...opp,
      updatedAt: now,
      lastEditedByEmail: author.email,
      lastEditedByName: author.name
    };

    if (isNew) {
      toSave.createdAt = now;
      toSave.createdByEmail = author.email;
      toSave.createdByName = author.name;
      toSave.views = 0;
      toSave.saves = 0;
    }

    if (toSave.status === 'published' && (!toSave.publishedAt || previousStatus !== 'published')) {
      toSave.publishedAt = now;
      toSave.publishedByEmail = author.email;
    }

    if (toSave.status === 'closed' && !toSave.closedAt) {
      toSave.closedAt = now;
    }

    if (index >= 0) {
      items[index] = toSave;
    } else {
      items.unshift(toSave);
    }

    saveStoredOpportunities(items);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'opportunities', toSave.id), toSave, { merge: true });
      } catch (err) {
        console.warn('Firestore saveOpportunity error:', err);
      }
    }

    AuditService.log({
      entityType: 'opportunity',
      entityId: toSave.id,
      entityTitle: toSave.title,
      action: isNew ? 'created' : toSave.status === 'published' ? 'published' : 'updated',
      performedByEmail: author.email,
      performedByName: author.name,
      details: isNew 
        ? `Created opportunity with status "${toSave.status}".` 
        : `Updated opportunity fields. Status is "${toSave.status}".`,
      previousStatus,
      newStatus: toSave.status
    });

    return toSave;
  },

  async updateStatus(
    id: string,
    status: OpportunityStatus,
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' },
    notes?: string
  ): Promise<void> {
    const items = getStoredOpportunities();
    const index = items.findIndex(o => o.id === id);
    if (index < 0) return;

    const previousStatus = items[index].status;
    const now = new Date().toISOString();

    const updated: Opportunity = {
      ...items[index],
      status,
      updatedAt: now,
      lastEditedByEmail: author.email,
      lastEditedByName: author.name
    };

    if (status === 'published' && !updated.publishedAt) {
      updated.publishedAt = now;
      updated.publishedByEmail = author.email;
    }

    if (status === 'closed' && !updated.closedAt) {
      updated.closedAt = now;
    }

    if (status === 'archived' && !updated.archivedAt) {
      updated.archivedAt = now;
    }

    items[index] = updated;
    saveStoredOpportunities(items);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'opportunities', id), {
          status,
          updatedAt: now,
          lastEditedByEmail: author.email,
          lastEditedByName: author.name,
          ...(status === 'published' ? { publishedAt: now, publishedByEmail: author.email } : {}),
          ...(status === 'closed' ? { closedAt: now } : {}),
          ...(status === 'archived' ? { archivedAt: now } : {})
        });
      } catch (err) {
        console.warn('Firestore updateStatus error:', err);
      }
    }

    AuditService.log({
      entityType: 'opportunity',
      entityId: id,
      entityTitle: updated.title,
      action: status === 'published' ? 'published' : status === 'closed' ? 'closed' : status === 'archived' ? 'archived' : 'updated',
      performedByEmail: author.email,
      performedByName: author.name,
      details: notes || `Status changed from ${previousStatus} to ${status}.`,
      previousStatus,
      newStatus: status
    });
  },

  async updateVerification(
    id: string,
    verificationStatus: VerificationStatus,
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' },
    notes?: string
  ): Promise<void> {
    const items = getStoredOpportunities();
    const index = items.findIndex(o => o.id === id);
    if (index < 0) return;

    const previousVerification = items[index].verificationStatus;
    const now = new Date().toISOString();

    const updated: Opportunity = {
      ...items[index],
      verificationStatus,
      lastVerifiedAt: now,
      verificationNotes: notes || items[index].verificationNotes,
      verifiedByEmail: author.email,
      updatedAt: now
    };

    items[index] = updated;
    saveStoredOpportunities(items);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'opportunities', id), {
          verificationStatus,
          lastVerifiedAt: now,
          verificationNotes: notes || '',
          verifiedByEmail: author.email,
          updatedAt: now
        });
      } catch (err) {
        console.warn('Firestore updateVerification error:', err);
      }
    }

    AuditService.log({
      entityType: 'opportunity',
      entityId: id,
      entityTitle: updated.title,
      action: 'verified',
      performedByEmail: author.email,
      performedByName: author.name,
      details: notes || `Verification set to ${verificationStatus}. Checked against official sources.`,
      changesSummary: `Verification: ${previousVerification} → ${verificationStatus}`
    });
  },

  async duplicate(
    id: string,
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' }
  ): Promise<Opportunity | null> {
    const original = await this.getById(id);
    if (!original) return null;

    const newId = 'opp_' + Math.random().toString(36).substring(2, 9);
    const newTitle = `[Copy] ${original.title}`;
    const newSlug = `${original.slug}-copy-${Math.random().toString(36).substring(2, 5)}`;
    const now = new Date().toISOString();

    const duplicatedItem: Opportunity = {
      ...original,
      id: newId,
      title: newTitle,
      slug: newSlug,
      status: 'draft',
      verificationStatus: 'needs_verification',
      publishedAt: undefined,
      publishedByEmail: undefined,
      createdAt: now,
      updatedAt: now,
      views: 0,
      saves: 0,
      createdByEmail: author.email,
      createdByName: author.name,
      lastEditedByEmail: author.email,
      lastEditedByName: author.name
    };

    const items = getStoredOpportunities();
    items.unshift(duplicatedItem);
    saveStoredOpportunities(items);

    AuditService.log({
      entityType: 'opportunity',
      entityId: newId,
      entityTitle: newTitle,
      action: 'duplicated',
      performedByEmail: author.email,
      performedByName: author.name,
      details: `Duplicated from original opportunity ID: ${id} ("${original.title}"). Saved as Draft.`
    });

    return duplicatedItem;
  },

  async delete(
    id: string,
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' }
  ): Promise<void> {
    const items = getStoredOpportunities();
    const item = items.find(o => o.id === id);
    const updatedList = items.filter(o => o.id !== id);
    saveStoredOpportunities(updatedList);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'opportunities', id));
      } catch (err) {
        console.warn('Firestore delete error:', err);
      }
    }

    if (item?.imagePath) {
      try {
        await FirebaseStorageService.deleteFile(item.imagePath);
      } catch (err) {
        console.warn('Storage delete image error:', err);
      }
    }

    if (item) {
      AuditService.log({
        entityType: 'opportunity',
        entityId: id,
        entityTitle: item.title,
        action: 'deleted',
        performedByEmail: author.email,
        performedByName: author.name,
        details: `Deleted opportunity from database.`
      });
    }
  },

  async bulkUpdateStatus(
    ids: string[],
    newStatus: OpportunityStatus,
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' }
  ): Promise<void> {
    for (const id of ids) {
      await this.updateStatus(id, newStatus, author, `Bulk action: set to ${newStatus}`);
    }
  },

  async bulkUpdateVerification(
    ids: string[],
    newVerification: VerificationStatus,
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' }
  ): Promise<void> {
    for (const id of ids) {
      await this.updateVerification(id, newVerification, author, `Bulk verification update to ${newVerification}`);
    }
  },

  async bulkArchive(
    ids: string[],
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' }
  ): Promise<void> {
    await this.bulkUpdateStatus(ids, 'archived', author);
  },

  async bulkDelete(
    ids: string[],
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' }
  ): Promise<void> {
    for (const id of ids) {
      await this.delete(id, author);
    }
  },

  async recordView(id: string): Promise<void> {
    const items = getStoredOpportunities();
    const index = items.findIndex(o => o.id === id);
    if (index >= 0) {
      items[index].views = (items[index].views || 0) + 1;
      saveStoredOpportunities(items);
    }
  },

  async getClosingSoon(limit: number = 4): Promise<Opportunity[]> {
    const items = await this.getAll({ onlyActive: true });
    return items
      .filter(o => o.deadline)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, limit);
  },

  async getNewlyAdded(limit: number = 6): Promise<Opportunity[]> {
    const items = await this.getAll({ onlyActive: true });
    return items
      .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
      .slice(0, limit);
  },

  async getSlideshowOpportunities(limit: number = 6): Promise<Opportunity[]> {
    const items = await this.getAll({ onlyActive: true });
    // Prioritize explicitly flagged slideshow items
    const slideshowItems = items.filter(o => o.featuredInSlideshow || o.featured);
    if (slideshowItems.length > 0) {
      return slideshowItems
        .sort((a, b) => (a.slideshowPriority ?? 99) - (b.slideshowPriority ?? 99))
        .slice(0, limit);
    }
    // Fallback: Return top active opportunities
    return items.slice(0, limit);
  },

  async getFeatured(limit: number = 6): Promise<Opportunity[]> {
    const items = await this.getAll({ onlyActive: true });
    const featured = items.filter(o => o.featured);
    if (featured.length > 0) {
      return featured.slice(0, limit);
    }
    return items.slice(0, limit);
  }
};
