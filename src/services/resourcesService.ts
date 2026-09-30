import { Resource, OpportunityStatus, VerificationStatus } from '../types/database';
import { db, isFirebaseConfigured } from './firebase';
import { AuditService } from './auditService';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'opp_gh_resources_store';

function getStoredResources(): Resource[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(r => 
          r && 
          r.id && 
          !r.id.startsWith('res-demo-') && 
          !r.title?.includes('[DEMO RECORD]') &&
          !r.enrollmentUrl?.includes('example.com')
        );
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
        }
        return cleaned;
      }
    }
  } catch (e) {
    console.error('Failed to load local resources storage', e);
  }
  return [];
}

function saveStoredResources(items: Resource[]) {
  try {
    const cleaned = items.filter(r => 
      r && 
      r.id && 
      !r.id.startsWith('res-demo-') && 
      !r.title?.includes('[DEMO RECORD]')
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
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
          setTimeout(() => reject(new Error('timeout')), 3000)
        );
        const snapshot: any = await Promise.race([getDocs(resRef), timeout]);
        const results = snapshot.docs
          .map((d: any) => ({ id: d.id, ...d.data() } as Resource))
          .filter((r: Resource) => !r.id.startsWith('res-demo-') && !r.title?.includes('[DEMO RECORD]'));
        items = results;
        saveStoredResources(items);
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
    if (isFirebaseConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, 'resources', id));
        if (docSnap.exists()) {
          const item = { id: docSnap.id, ...docSnap.data() } as Resource;
          if (!item.id.startsWith('res-demo-') && !item.title.includes('[DEMO RECORD]')) {
            return item;
          }
        }
      } catch (err) {
        console.warn('Firestore getById resource error:', err);
      }
    }
    const items = getStoredResources();
    return items.find(r => r.id === id) || null;
  },

  async getBySlug(slug: string): Promise<Resource | null> {
    const items = await this.getAll({ includeUnpublished: true });
    return items.find(r => r.slug === slug) || null;
  },

  async saveResource(
    resource: Resource,
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' }
  ): Promise<Resource> {
    const items = getStoredResources();
    const index = items.findIndex(r => r.id === resource.id);
    const now = new Date().toISOString();

    const isNew = index < 0;
    const previousStatus = isNew ? undefined : items[index].status;

    const toSave: Resource = {
      ...resource,
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

    if (index >= 0) {
      items[index] = toSave;
    } else {
      items.unshift(toSave);
    }

    saveStoredResources(items);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'resources', toSave.id), toSave, { merge: true });
      } catch (err) {
        console.warn('Firestore saveResource error:', err);
      }
    }

    AuditService.log({
      entityType: 'resource',
      entityId: toSave.id,
      entityTitle: toSave.title,
      action: isNew ? 'created' : toSave.status === 'published' ? 'published' : 'updated',
      performedByEmail: author.email,
      performedByName: author.name,
      details: isNew ? `Created resource course/credential.` : `Updated resource.`,
      previousStatus,
      newStatus: toSave.status
    });

    return toSave;
  },

  async updateStatus(
    id: string,
    status: OpportunityStatus,
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' }
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
      lastEditedByName: author.name,
      ...(status === 'published' && !items[index].publishedAt ? { publishedAt: now, publishedByEmail: author.email } : {})
    };

    items[index] = updated;
    saveStoredResources(items);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'resources', id), {
          status,
          updatedAt: now,
          lastEditedByEmail: author.email,
          lastEditedByName: author.name,
          ...(status === 'published' ? { publishedAt: now, publishedByEmail: author.email } : {})
        });
      } catch (err) {
        console.warn('Firestore updateStatus error:', err);
      }
    }

    AuditService.log({
      entityType: 'resource',
      entityId: id,
      entityTitle: updated.title,
      action: status === 'published' ? 'published' : 'updated',
      performedByEmail: author.email,
      performedByName: author.name,
      details: `Status set to ${status}.`,
      previousStatus,
      newStatus: status
    });
  },

  async delete(
    id: string,
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' }
  ): Promise<void> {
    const items = getStoredResources();
    const item = items.find(r => r.id === id);
    const updated = items.filter(r => r.id !== id);
    saveStoredResources(updated);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'resources', id));
      } catch (err) {
        console.warn('Firestore delete resource error:', err);
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

  async updateVerification(
    id: string,
    verificationStatus: VerificationStatus,
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' },
    notes?: string
  ): Promise<void> {
    const items = getStoredResources();
    const index = items.findIndex(r => r.id === id);
    if (index < 0) return;

    const previousVerification = items[index].verificationStatus;
    const now = new Date().toISOString();

    const updated: Resource = {
      ...items[index],
      verificationStatus,
      lastVerifiedAt: now,
      verificationNotes: notes || items[index].verificationNotes,
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
          updatedAt: now
        });
      } catch (err) {
        console.warn('Firestore updateVerification error:', err);
      }
    }

    AuditService.log({
      entityType: 'resource',
      entityId: id,
      entityTitle: updated.title,
      action: 'verified',
      performedByEmail: author.email,
      performedByName: author.name,
      details: notes || `Verification set to ${verificationStatus}. Checked against official provider sources.`,
      changesSummary: `Verification: ${previousVerification} → ${verificationStatus}`
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

  async bulkUpdateStatus(
    ids: string[],
    newStatus: OpportunityStatus,
    author: { email: string; name: string } = { email: 'admin@opportunityghana.com', name: 'Administrator' }
  ): Promise<void> {
    for (const id of ids) {
      await this.updateStatus(id, newStatus, author);
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

  async getFreeCourses(limit: number = 3): Promise<Resource[]> {
    const items = await this.getAll({ isFree: true });
    return items.slice(0, limit);
  }
};
