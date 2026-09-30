import { Resource, OpportunityStatus, VerificationStatus } from '../types/database';
import { DEMO_RESOURCES } from '../data/demoData';
import { db, isFirebaseConfigured } from './firebase';
import { AuditService } from './auditService';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'opp_gh_resources_store';

function getStoredResources(): Resource[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load local resources storage', e);
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEMO_RESOURCES));
  return DEMO_RESOURCES;
}

function saveStoredResources(items: Resource[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save resources', e);
  }
}

export interface ResourceFilters {
  category?: string;
  resourceType?: string;
  isFree?: boolean;
  search?: string;
  hasCertificate?: boolean;
  status?: OpportunityStatus;
  includeUnpublished?: boolean;
}

export const ResourcesService = {
  async getAll(filters?: ResourceFilters): Promise<Resource[]> {
    let items = getStoredResources();

    if (isFirebaseConfigured && db) {
      try {
        const resRef = collection(db, 'resources');
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 2000)
        );
        const snapshot: any = await Promise.race([getDocs(resRef), timeout]);
        const results = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as Resource));
        if (results.length > 0) items = results;
      } catch (e: any) {
        if (e?.code !== 'unavailable' && e?.message !== 'timeout') {
          console.warn('Firestore resources read error:', e?.message || e);
        }
      }
    }

    // Default to published only for public views
    if (!filters?.includeUnpublished) {
      items = items.filter(r => r.status === 'published');
    }

    if (filters) {
      if (filters.status) {
        items = items.filter(r => r.status === filters.status);
      }
      if (filters.category && filters.category !== 'All') {
        items = items.filter(r => r.category.toLowerCase() === filters.category!.toLowerCase());
      }
      if (filters.resourceType && filters.resourceType !== 'All') {
        items = items.filter(r => r.resourceType === filters.resourceType);
      }
      if (filters.isFree !== undefined) {
        items = items.filter(r => r.isFree === filters.isFree);
      }
      if (filters.hasCertificate !== undefined) {
        items = items.filter(r => r.hasCertificate === filters.hasCertificate);
      }
      if (filters.search && filters.search.trim().length > 0) {
        const q = filters.search.toLowerCase().trim();
        items = items.filter(r =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.skills.some(s => s.toLowerCase().includes(q)) ||
          (r.providerName && r.providerName.toLowerCase().includes(q))
        );
      }
    }

    return items;
  },

  async getById(id: string): Promise<Resource | null> {
    const items = getStoredResources();
    return items.find(r => r.id === id) || null;
  },

  async getBySlug(slug: string): Promise<Resource | null> {
    const items = getStoredResources();
    return items.find(r => r.slug === slug || r.id === slug) || null;
  },

  async getFreeCourses(limit: number = 4): Promise<Resource[]> {
    const items = await this.getAll({ isFree: true });
    return items.slice(0, limit);
  },

  async saveResource(
    res: Resource,
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' }
  ): Promise<Resource> {
    const isNew = !res.id || !getStoredResources().some(r => r.id === res.id);
    const now = new Date().toISOString();

    const finalItem: Resource = {
      ...res,
      id: res.id || 'res_' + Math.random().toString(36).substring(2, 9),
      slug: res.slug || res.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      createdAt: res.createdAt || now,
      updatedAt: now,
      views: res.views || 0,
      saves: res.saves || 0,
      lastEditedByEmail: author.email,
      lastEditedByName: author.name,
      createdByEmail: res.createdByEmail || author.email,
      createdByName: res.createdByName || author.name,
      verificationStatus: res.verificationStatus || 'verified'
    };

    if (finalItem.status === 'published' && !finalItem.publishedAt) {
      finalItem.publishedAt = now;
      finalItem.publishedByEmail = author.email;
    }

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'resources', finalItem.id), finalItem, { merge: true });
      } catch (e) {
        console.warn('Firestore save resource error:', e);
      }
    }

    const items = getStoredResources();
    const index = items.findIndex(r => r.id === finalItem.id);
    if (index >= 0) {
      items[index] = finalItem;
    } else {
      items.unshift(finalItem);
    }
    saveStoredResources(items);

    AuditService.log({
      entityType: 'resource',
      entityId: finalItem.id,
      entityTitle: finalItem.title,
      action: isNew ? 'created' : 'updated',
      performedByEmail: author.email,
      performedByName: author.name,
      details: isNew ? `Created new course/resource in status: ${finalItem.status}` : 'Updated resource curriculum and metadata.',
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
    const items = getStoredResources();
    const index = items.findIndex(r => r.id === id);
    if (index < 0) return;

    const previousStatus = items[index].status;
    const now = new Date().toISOString();

    const updated: Resource = {
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

    items[index] = updated;
    saveStoredResources(items);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'resources', id), {
          status,
          updatedAt: now,
          ...(status === 'published' ? { publishedAt: now, publishedByEmail: author.email } : {})
        });
      } catch (e) {
        console.warn('Firestore updateStatus error:', e);
      }
    }

    AuditService.log({
      entityType: 'resource',
      entityId: id,
      entityTitle: updated.title,
      action: status === 'published' ? 'published' : 'updated',
      performedByEmail: author.email,
      performedByName: author.name,
      details: notes || `Resource status changed from ${previousStatus} to ${status}.`,
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
    const items = getStoredResources();
    const index = items.findIndex(r => r.id === id);
    if (index < 0) return;

    const now = new Date().toISOString();
    const updated: Resource = {
      ...items[index],
      verificationStatus,
      lastVerifiedAt: now,
      verificationNotes: notes || items[index].verificationNotes,
      verifiedByEmail: author.email,
      updatedAt: now
    };

    items[index] = updated;
    saveStoredResources(items);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'resources', id), {
          verificationStatus,
          lastVerifiedAt: now,
          verificationNotes: notes || '',
          verifiedByEmail: author.email,
          updatedAt: now
        });
      } catch (e) {
        console.warn('Firestore updateVerification error:', e);
      }
    }

    AuditService.log({
      entityType: 'resource',
      entityId: id,
      entityTitle: updated.title,
      action: 'verified',
      performedByEmail: author.email,
      performedByName: author.name,
      details: notes || `Resource verification status updated to ${verificationStatus}.`
    });
  },

  async duplicate(
    id: string,
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' }
  ): Promise<Resource | null> {
    const original = await this.getById(id);
    if (!original) return null;

    const newId = 'res_' + Math.random().toString(36).substring(2, 9);
    const newTitle = `[Copy] ${original.title}`;
    const newSlug = `${original.slug}-copy-${Math.random().toString(36).substring(2, 5)}`;
    const now = new Date().toISOString();

    const duplicatedItem: Resource = {
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

    const items = getStoredResources();
    items.unshift(duplicatedItem);
    saveStoredResources(items);

    AuditService.log({
      entityType: 'resource',
      entityId: newId,
      entityTitle: newTitle,
      action: 'duplicated',
      performedByEmail: author.email,
      performedByName: author.name,
      details: `Duplicated from original resource ID: ${id} ("${original.title}"). Saved as Draft.`
    });

    return duplicatedItem;
  },

  async delete(
    id: string,
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' }
  ): Promise<void> {
    const items = getStoredResources();
    const item = items.find(r => r.id === id);
    const updatedList = items.filter(r => r.id !== id);
    saveStoredResources(updatedList);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'resources', id));
      } catch (e) {
        console.warn('Firestore delete error:', e);
      }
    }

    if (item) {
      AuditService.log({
        entityType: 'resource',
        entityId: id,
        entityTitle: item.title,
        action: 'deleted',
        performedByEmail: author.email,
        performedByName: author.name,
        details: `Deleted resource from database.`
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
  }
};
