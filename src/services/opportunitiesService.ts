import { Opportunity, OpportunityStatus, VerificationStatus } from '../types/database';
import { DEMO_OPPORTUNITIES } from '../data/demoData';
import { db, isFirebaseConfigured } from './firebase';
import { AuditService } from './auditService';
import { isOpportunityActuallyClosed } from './deadlineService';
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
        // Run deadline automation pass on read
        return parsed.map(syncWithDeadlineAutomation);
      }
    }
  } catch (e) {
    console.error('Failed to load local opportunities storage', e);
  }
  const initialized = DEMO_OPPORTUNITIES.map(syncWithDeadlineAutomation);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialized));
  return initialized;
}

function saveStoredOpportunities(items: Opportunity[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
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
          setTimeout(() => reject(new Error('timeout')), 2000)
        );
        const snapshot: any = await Promise.race([getDocs(q), timeout]);
        const results = snapshot.docs.map((d: any) => syncWithDeadlineAutomation({ id: d.id, ...d.data() } as Opportunity));
        if (results.length > 0) {
          items = results;
        }
      } catch (err: any) {
        if (err?.code !== 'unavailable' && err?.message !== 'timeout') {
          console.warn('Firestore read fallback to local repository:', err?.message || err);
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
      if (filters.region && filters.region !== 'All Regions') {
        items = items.filter(o => o.region.toLowerCase() === filters.region!.toLowerCase());
      }
      if (filters.opportunityType && filters.opportunityType !== 'All') {
        items = items.filter(o => o.opportunityType.toLowerCase().includes(filters.opportunityType!.toLowerCase()));
      }
      if (filters.educationLevel && filters.educationLevel !== 'All Levels') {
        items = items.filter(o =>
          !o.educationLevel ||
          o.educationLevel.toLowerCase().includes(filters.educationLevel!.toLowerCase()) ||
          o.educationLevel === 'Any'
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
          o.location.toLowerCase().includes(q)
        );
      }
    }

    return items;
  },

  async getById(id: string): Promise<Opportunity | null> {
    const items = getStoredOpportunities();
    const found = items.find(o => o.id === id);
    if (found) return syncWithDeadlineAutomation(found);

    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'opportunities', id));
        if (snap.exists()) {
          return syncWithDeadlineAutomation({ id: snap.id, ...snap.data() } as Opportunity);
        }
      } catch (err) {
        console.warn('Firestore getById error:', err);
      }
    }
    return null;
  },

  async getBySlug(slug: string): Promise<Opportunity | null> {
    const items = getStoredOpportunities();
    const found = items.find(o => o.slug === slug || o.id === slug);
    if (found) return syncWithDeadlineAutomation(found);
    return null;
  },

  async saveOpportunity(
    item: Opportunity,
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' }
  ): Promise<Opportunity> {
    const isNew = !item.id || !getStoredOpportunities().some(o => o.id === item.id);
    const now = new Date().toISOString();
    
    const finalItem: Opportunity = {
      ...item,
      id: item.id || 'opp_' + Math.random().toString(36).substring(2, 9),
      slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      createdAt: item.createdAt || now,
      updatedAt: now,
      views: item.views || 0,
      saves: item.saves || 0,
      lastEditedByEmail: author.email,
      lastEditedByName: author.name,
      createdByEmail: item.createdByEmail || author.email,
      createdByName: item.createdByName || author.name
    };

    if (finalItem.status === 'published' && !finalItem.publishedAt) {
      finalItem.publishedAt = now;
      finalItem.publishedByEmail = author.email;
    }

    // Save to Firestore if available
    if (isFirebaseConfigured && db) {
      try {
        const oppDoc = doc(db, 'opportunities', finalItem.id);
        await setDoc(oppDoc, finalItem, { merge: true });
      } catch (err) {
        console.warn('Firestore save error:', err);
      }
    }

    // Save to local cache
    const items = getStoredOpportunities();
    const index = items.findIndex(o => o.id === finalItem.id);
    if (index >= 0) {
      items[index] = finalItem;
    } else {
      items.unshift(finalItem);
    }
    saveStoredOpportunities(items);

    // Audit log
    AuditService.log({
      entityType: 'opportunity',
      entityId: finalItem.id,
      entityTitle: finalItem.title,
      action: isNew ? 'created' : 'updated',
      performedByEmail: author.email,
      performedByName: author.name,
      details: isNew ? `Created opportunity in status: ${finalItem.status}` : `Updated details and specifications.`,
      changesSummary: isNew ? `New listing created as ${finalItem.status}` : `Fields updated; status is ${finalItem.status}`,
      newStatus: finalItem.status
    });

    return finalItem;
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
          ...(status === 'published' ? { publishedAt: now, publishedByEmail: author.email } : {})
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
      changesSummary: `Status: ${previousStatus} → ${status}`,
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

  // Bulk Management Actions
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
    // Sort by soonest deadline
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
  }
};
