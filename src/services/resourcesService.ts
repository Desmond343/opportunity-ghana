import { Resource, OpportunityStatus, VerificationStatus } from '../types/database';
import { db, isFirebaseConfigured } from './firebase';
import { FirebaseStorageService } from './firebase/storageService';
import { AuditService } from './auditService';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit as firestoreLimit,
  orderBy
} from 'firebase/firestore';

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

    // Default to published or approved only for public views
    if (!filters?.includeUnpublished) {
      items = items.filter(r => r.status === 'published' || (r.status as string) === 'approved');
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

  /**
   * Normal Authenticated User Resource Submission
   * Submits a resource in 'pending_review' status with moderation status 'pending'
   */
  async submitUserResource(
    submissionData: {
      title: string;
      description: string;
      category: string;
      resourceType: Resource['resourceType'];
      format?: Resource['format'];
      level?: Resource['level'];
      providerName?: string;
      location?: string;
      enrollmentUrl: string;
      isFree: boolean;
      cost?: number;
      currency?: string;
      hasCertificate: boolean;
      skills?: string[];
      contactInfo?: string;
      imageUrl?: string;
      imagePath?: string;
    },
    user: {
      uid: string;
      email: string;
      name: string;
    }
  ): Promise<Resource> {
    const now = new Date().toISOString();
    const id = 'res_sub_' + Math.random().toString(36).substring(2, 10);
    const cleanSlug = submissionData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'resource';
    const slug = `${cleanSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const newResource: Resource = {
      id,
      title: submissionData.title.trim(),
      slug,
      description: submissionData.description.trim(),
      providerId: 'external_submission',
      providerName: submissionData.providerName?.trim() || 'Community Contributor',
      resourceType: submissionData.resourceType || 'course',
      category: submissionData.category || 'Technology',
      level: submissionData.level || 'All Levels',
      format: submissionData.format || 'Self-paced Online',
      location: submissionData.location || 'Online / Ghana',
      duration: 'Flexible',
      cost: submissionData.isFree ? 0 : Number(submissionData.cost || 0),
      currency: submissionData.currency || 'GHS',
      isFree: Boolean(submissionData.isFree),
      hasCertificate: Boolean(submissionData.hasCertificate),
      skills: submissionData.skills || [],
      enrollmentUrl: submissionData.enrollmentUrl.trim(),
      imageUrl: submissionData.imageUrl,
      imagePath: submissionData.imagePath,
      sourceUrl: submissionData.enrollmentUrl.trim(),
      
      // Strict moderation isolation: NOT published until administrator reviews
      status: 'pending_review',
      verificationStatus: 'needs_verification',
      verificationNotes: `Submitted by user ${user.name} (${user.email}) on ${new Date().toLocaleDateString('en-GB')}. Awaiting verification.`,

      // Authorship & Moderation metadata
      createdByEmail: user.email,
      createdByName: user.name,
      createdByUserId: user.uid,
      isUserSubmitted: true,
      submissionStatus: 'pending',
      submittedAt: now,
      contactInfo: submissionData.contactInfo,

      createdAt: now,
      updatedAt: now,
      views: 0,
      saves: 0
    };

    const items = getStoredResources();
    items.unshift(newResource);
    saveStoredResources(items);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'resources', newResource.id), newResource);
      } catch (err) {
        console.warn('Firestore submitUserResource error:', err);
      }
    }

    AuditService.log({
      entityType: 'resource',
      entityId: newResource.id,
      entityTitle: newResource.title,
      action: 'created',
      performedByEmail: user.email,
      performedByName: user.name,
      details: `User submitted new resource for administrative verification: "${newResource.title}". Status: pending review.`
    });

    return newResource;
  },

  /**
   * Administrator moderation of user-submitted resource
   */
  async reviewResourceSubmission(
    id: string,
    decision: 'approved' | 'rejected' | 'changes_requested',
    admin: { email: string; name: string },
    notes?: string
  ): Promise<void> {
    const items = getStoredResources();
    const index = items.findIndex(r => r.id === id);
    if (index < 0) return;

    const current = items[index];
    const now = new Date().toISOString();

    const isApproval = decision === 'approved';
    const updated: Resource = {
      ...current,
      submissionStatus: decision,
      status: isApproval ? 'published' : current.status === 'published' ? 'draft' : current.status,
      verificationStatus: isApproval ? 'verified' : current.verificationStatus,
      lastVerifiedAt: isApproval ? now : current.lastVerifiedAt,
      verifiedByEmail: isApproval ? admin.email : current.verifiedByEmail,
      publishedAt: isApproval ? now : current.publishedAt,
      publishedByEmail: isApproval ? admin.email : current.publishedByEmail,
      rejectionReason: decision === 'rejected' ? notes : undefined,
      verificationNotes: notes || current.verificationNotes,
      updatedAt: now,
      lastEditedByEmail: admin.email,
      lastEditedByName: admin.name
    };

    items[index] = updated;
    saveStoredResources(items);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'resources', id), {
          submissionStatus: decision,
          status: updated.status,
          verificationStatus: updated.verificationStatus,
          lastVerifiedAt: updated.lastVerifiedAt || '',
          verifiedByEmail: updated.verifiedByEmail || '',
          publishedAt: updated.publishedAt || '',
          publishedByEmail: updated.publishedByEmail || '',
          rejectionReason: updated.rejectionReason || '',
          verificationNotes: updated.verificationNotes || '',
          updatedAt: now,
          lastEditedByEmail: admin.email,
          lastEditedByName: admin.name
        });
      } catch (err) {
        console.warn('Firestore reviewResourceSubmission error:', err);
      }
    }

    AuditService.log({
      entityType: 'resource',
      entityId: id,
      entityTitle: updated.title,
      action: isApproval ? 'published' : 'verified',
      performedByEmail: admin.email,
      performedByName: admin.name,
      details: `Resource submission reviewed: ${decision.toUpperCase()}. ${notes || ''}`,
      newStatus: updated.status
    });
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

    if (item?.imagePath) {
      try {
        await FirebaseStorageService.deleteFile(item.imagePath);
      } catch (err) {
        console.warn('Storage delete image error:', err);
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
  },

  /**
   * Allows normal authenticated users to submit a resource for review.
   * Enforces status: 'pending' and submittedBy: user.uid
   */
  async submitResource(
    data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'saves' | 'status'>,
    user: { uid: string; email: string; name: string }
  ): Promise<Resource> {
    if (!user || !user.uid) {
      throw new Error('You must be signed in to submit a resource.');
    }

    const id = 'res_sub_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    const now = new Date().toISOString();
    const slug = (data.title || 'resource')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + id.substring(0, 6);

    const submission: Resource = {
      ...data,
      id,
      slug: data.slug || slug,
      status: 'pending',
      submittedBy: user.uid,
      submittedByName: user.name || 'Community Member',
      submittedByEmail: user.email,
      providerId: data.providerId || user.uid,
      providerName: data.providerName || user.name || 'Community Contribution',
      createdAt: now,
      updatedAt: now,
      views: 0,
      saves: 0
    };

    const items = getStoredResources();
    items.unshift(submission);
    saveStoredResources(items);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'resources', id), submission);
      } catch (err: any) {
        console.warn('Firestore submitResource error:', err?.message || err);
      }
    }

    AuditService.log({
      entityType: 'resource',
      entityId: id,
      entityTitle: submission.title,
      action: 'created',
      performedByEmail: user.email,
      performedByName: user.name || 'User',
      details: `User submitted resource for administrative review and verification.`,
      newStatus: 'pending'
    });

    return submission;
  },

  /**
   * Retrieves all submissions created by a specific user.
   */
  async getUserSubmissions(userId: string, userEmail?: string): Promise<Resource[]> {
    if (!userId) return [];

    let items = getStoredResources().filter(r => 
      r.submittedBy === userId || 
      r.createdByUserId === userId || 
      (userEmail && r.createdByEmail?.toLowerCase() === userEmail.toLowerCase()) ||
      (userEmail && r.submittedByEmail?.toLowerCase() === userEmail.toLowerCase())
    );

    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'resources'), where('submittedBy', '==', userId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const remoteItems = snap.docs.map(d => ({ id: d.id, ...d.data() } as Resource));
          const otherItems = getStoredResources().filter(r => r.submittedBy !== userId && r.createdByUserId !== userId);
          items = remoteItems;
          saveStoredResources([...remoteItems, ...otherItems]);
        }
      } catch (err) {
        console.warn('Firestore getUserSubmissions error:', err);
      }
    }

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Retrieves the pending queue for administrators.
   */
  async getPendingSubmissions(): Promise<Resource[]> {
    const all = await this.getAll({ includeUnpublished: true });
    return all.filter(r =>
      r.status === 'pending' ||
      (r.status as string) === 'pending_review' ||
      (r.status as string) === 'changes_requested'
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Administrator approval/rejection review workflow.
   */
  async reviewSubmission(
    id: string,
    decision: 'approved' | 'rejected' | 'changes_requested',
    admin: { uid: string; email: string; name: string },
    rejectionReason?: string,
    adminNotes?: string,
    editedData?: Partial<Resource>
  ): Promise<Resource | null> {
    const items = getStoredResources();
    const index = items.findIndex(r => r.id === id);
    const now = new Date().toISOString();

    const targetStatus = decision === 'approved' ? 'published' : decision;

    const previousItem = index >= 0 ? items[index] : await this.getById(id);
    if (!previousItem) return null;

    const isApproval = decision === 'approved';
    const isRejection = decision === 'rejected';

    const updated: Resource = {
      ...previousItem,
      ...(editedData || {}),
      status: isApproval ? 'published' : isRejection ? 'rejected' : 'pending',
      submissionStatus: decision,
      verificationStatus: isApproval ? 'verified' : previousItem.verificationStatus,
      lastVerifiedAt: isApproval ? now : previousItem.lastVerifiedAt,
      verifiedByEmail: isApproval ? admin.email : previousItem.verifiedByEmail,
      reviewedAt: now,
      reviewedBy: admin.name,
      rejectionReason: isRejection ? rejectionReason?.trim() : (decision === 'changes_requested' ? rejectionReason?.trim() : undefined),
      adminNotes: adminNotes?.trim() || previousItem.adminNotes,
      updatedAt: now,
      lastEditedByEmail: admin.email,
      lastEditedByName: admin.name,
      ...(isApproval ? { publishedAt: now, publishedByEmail: admin.email } : {})
    };

    if (index >= 0) {
      items[index] = updated;
    } else {
      items.unshift(updated);
    }
    saveStoredResources(items);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'resources', id), {
          ...updated,
          updatedAt: now
        });
      } catch (err) {
        console.warn('Firestore reviewSubmission error:', err);
      }
    }

    AuditService.log({
      entityType: 'resource',
      entityId: id,
      entityTitle: updated.title,
      action: isApproval ? 'published' : 'updated',
      performedByEmail: admin.email,
      performedByName: admin.name,
      details: isApproval
        ? `Resource submission approved and published to public site by ${admin.name}.`
        : `Resource submission ${decision.toUpperCase()} by ${admin.name}.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      previousStatus: previousItem.status,
      newStatus: targetStatus
    });

    return updated;
  },

  /**
   * Normal user editing their own pending submission.
   */
  async updateUserSubmission(
    id: string,
    updates: Partial<Resource>,
    user: { uid: string; email: string; name: string }
  ): Promise<Resource | null> {
    const item = await this.getById(id);
    if (!item) throw new Error('Resource not found.');
    if (item.submittedBy !== user.uid) {
      throw new Error('Unauthorized: You can only edit your own submissions.');
    }
    if (item.status !== 'pending' && (item.status as string) !== 'changes_requested') {
      throw new Error('Only pending submissions or submissions requiring changes can be edited.');
    }

    const now = new Date().toISOString();
    const updated: Resource = {
      ...item,
      ...updates,
      id: item.id,
      status: 'pending', // Resubmits to pending review
      submittedBy: item.submittedBy,
      updatedAt: now
    };

    const items = getStoredResources();
    const idx = items.findIndex(r => r.id === id);
    if (idx >= 0) items[idx] = updated;
    saveStoredResources(items);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'resources', id), {
          ...updates,
          status: 'pending',
          updatedAt: now
        });
      } catch (e) {
        console.warn('Firestore updateUserSubmission error:', e);
      }
    }

    return updated;
  },

  /**
   * Normal user deleting their own pending or rejected submission.
   */
  async deleteUserSubmission(id: string, userId: string): Promise<void> {
    const item = await this.getById(id);
    if (!item) return;
    if (item.submittedBy !== userId) {
      throw new Error('Unauthorized: You can only delete your own submissions.');
    }
    if (item.status !== 'pending' && (item.status as string) !== 'changes_requested' && (item.status as string) !== 'rejected') {
      throw new Error('Only pending, changes requested, or rejected submissions can be deleted.');
    }

    const items = getStoredResources().filter(r => r.id !== id);
    saveStoredResources(items);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'resources', id));
      } catch (err) {
        console.warn('Firestore deleteUserSubmission error:', err);
      }
    }
  }
};
