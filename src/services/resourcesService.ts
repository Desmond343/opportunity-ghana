import { Resource, OpportunityStatus, VerificationStatus } from '../types/database';
import { db, isFirebaseConfigured } from './firebase';
import { sanitizeForFirestore } from './firebase/firestoreService';
import { auth } from './firebase/authService';
import { FirebaseStorageService, validateImageFile } from './firebase/storageService';
import { AuditService } from './auditService';
import { VERIFIED_REAL_RESOURCES } from '../data/verifiedResources';
import { ensureUniqueCourseImages } from '../utils/cardBackgrounds';
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

// Legacy ID canonical aliases mapping: maps any historic or variant resource IDs to canonical identifiers
export const LEGACY_RESOURCE_ID_MAP: Record<string, string> = {
  'res-cisco-intro-cybersecurity': 'course-cisco-intro-cybersecurity',
  'res-yale-financial-markets': 'course-yale-financial-markets',
  'res-aws-cloud-practitioner': 'course-aws-cloud-practitioner',
  'res-openlearn-leadership': 'course-openlearn-leadership',
  'res-google-data-analytics': 'res-google-data-analytics-cert',
  'res-google-cybersecurity': 'res-google-cybersecurity-cert',
  'res-google-project-management': 'res-google-project-management-cert',
  'course-google-data-analytics': 'res-google-data-analytics-cert',
  'course-google-cybersecurity': 'res-google-cybersecurity-cert',
  'course-google-project-management': 'res-google-project-management-cert'
};

/**
 * Deduplicates an array of resources by canonical ID and by canonical slug.
 * Ensures that no duplicate records or non-unique React keys ever emerge.
 */
export function deduplicateResources(items: Resource[]): Resource[] {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const result: Resource[] = [];

  for (const item of items) {
    if (!item || !item.id) continue;
    const canonicalId = LEGACY_RESOURCE_ID_MAP[item.id] || item.id;
    const cleanItem = canonicalId !== item.id ? { ...item, id: canonicalId } : item;

    if (seenIds.has(cleanItem.id)) continue;
    if (cleanItem.slug && seenSlugs.has(cleanItem.slug)) continue;

    seenIds.add(cleanItem.id);
    if (cleanItem.slug) seenSlugs.add(cleanItem.slug);
    result.push(cleanItem);
  }

  return result;
}

function getStoredResources(): Resource[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return ensureUniqueCourseImages(deduplicateResources([...VERIFIED_REAL_RESOURCES]));
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    let list: Resource[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        list = parsed
          .filter(r => 
            r && 
            r.id && 
            !r.id.startsWith('res-demo-') && 
            !r.title?.includes('[DEMO RECORD]') &&
            !r.enrollmentUrl?.includes('example.com')
          )
          .map(r => {
            const canonicalId = LEGACY_RESOURCE_ID_MAP[r.id];
            return canonicalId ? { ...r, id: canonicalId } : r;
          });
      }
    }

    // Refresh existing items with newest verified curriculum fields (whatYouWillLearn, whoIsThisFor, costType, etc.)
    const verifiedIdMap = new Map<string, Resource>();
    const verifiedSlugMap = new Map<string, Resource>();
    for (const v of VERIFIED_REAL_RESOURCES) {
      verifiedIdMap.set(v.id, v);
      if (v.slug) verifiedSlugMap.set(v.slug, v);
    }

    list = list.map(item => {
      const canonicalId = LEGACY_RESOURCE_ID_MAP[item.id] || item.id;
      const verifiedMatch = verifiedIdMap.get(canonicalId) || (item.slug ? verifiedSlugMap.get(item.slug) : undefined);
      if (verifiedMatch) {
        return {
          ...item,
          ...verifiedMatch,
          id: verifiedMatch.id
        };
      }
      return canonicalId !== item.id ? { ...item, id: canonicalId } : item;
    });

    // Ensure all curated verified resources are present
    const existingIds = new Set(list.map(r => r.id));
    const existingSlugs = new Set(list.map(r => r.slug).filter(Boolean));
    let hasNew = false;
    for (const verified of VERIFIED_REAL_RESOURCES) {
      if (!existingIds.has(verified.id) && !existingSlugs.has(verified.slug)) {
        list.push(verified);
        existingIds.add(verified.id);
        if (verified.slug) existingSlugs.add(verified.slug);
        hasNew = true;
      }
    }

    // Always ensure strict uniqueness
    list = deduplicateResources(list);

    if (hasNew || !raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    }
    return ensureUniqueCourseImages(list);
  } catch (e) {
    console.error('Failed to load local resources storage', e);
  }
  return ensureUniqueCourseImages(deduplicateResources([...VERIFIED_REAL_RESOURCES]));
}

function saveStoredResources(items: Resource[]) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
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
  pricingModel?: string;
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
        if (results.length > 0) {
          const mappedResults = results.map((r: Resource) => {
            const canonicalId = LEGACY_RESOURCE_ID_MAP[r.id];
            return canonicalId ? { ...r, id: canonicalId } : r;
          });
          const remoteIds = new Set(mappedResults.map((r: Resource) => r.id));
          const remoteSlugs = new Set(mappedResults.map((r: Resource) => r.slug).filter(Boolean));
          const merged = [...mappedResults];
          for (const v of VERIFIED_REAL_RESOURCES) {
            if (!remoteIds.has(v.id) && !remoteSlugs.has(v.slug)) {
              merged.push(v);
              remoteIds.add(v.id);
              if (v.slug) remoteSlugs.add(v.slug);
            }
          }
          items = deduplicateResources(merged);
          saveStoredResources(items);
        }
      } catch (e: any) {
        if (e?.code !== 'unavailable' && e?.message !== 'timeout') {
          console.warn('Firestore resources read error:', e?.message || e);
        }
      }
    }

    // Default to published or approved only for public views
    if (!filters?.includeUnpublished) {
      items = items.filter(r =>
        (r.status === 'published' || (r.status as string) === 'approved') &&
        r.submissionStatus !== 'pending' &&
        r.submissionStatus !== 'rejected' &&
        r.status !== 'pending' &&
        (r.status as string) !== 'pending_review' &&
        (r.status as string) !== 'rejected'
      );
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
      if (filters.pricingModel && filters.pricingModel !== 'All') {
        items = items.filter(r => r.pricingModel === filters.pricingModel);
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

    return ensureUniqueCourseImages(deduplicateResources(items));
  },

  async getById(id: string): Promise<Resource | null> {
    const canonicalId = LEGACY_RESOURCE_ID_MAP[id] || id;
    if (isFirebaseConfigured && db) {
      try {
        const docSnap = await getDoc(doc(db, 'resources', canonicalId));
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
    return items.find(r => r.id === canonicalId || r.id === id) || null;
  },

  async getBySlug(slug: string): Promise<Resource | null> {
    if (!slug) return null;
    const clean = decodeURIComponent(slug).trim().toLowerCase().replace(/\/$/, '');

    // Map common legacy IDs to canonical records
    const legacyAliases: Record<string, string> = {
      ...LEGACY_RESOURCE_ID_MAP,
      'course-google-data-analytics': 'google-data-analytics-professional-certificate',
      'course-google-cybersecurity': 'google-cybersecurity-professional-certificate',
      'course-google-project-management': 'google-project-management-professional-certificate',
      'res-google-data-analytics-cert': 'google-data-analytics-professional-certificate',
      'res-google-cybersecurity-cert': 'google-cybersecurity-professional-certificate',
      'res-google-project-management-cert': 'google-project-management-professional-certificate',
      'res-cisco-intro-cybersecurity': 'introduction-to-cybersecurity-cisco-networking-academy',
      'course-cisco-intro-cybersecurity': 'introduction-to-cybersecurity-cisco-networking-academy',
      'res-yale-financial-markets': 'financial-markets-yale-university',
      'course-yale-financial-markets': 'financial-markets-yale-university',
      'res-aws-cloud-practitioner': 'aws-cloud-practitioner-essentials',
      'course-aws-cloud-practitioner': 'aws-cloud-practitioner-essentials',
      'res-openlearn-leadership': 'openlearn-leadership-and-followership',
      'course-openlearn-leadership': 'openlearn-leadership-and-followership'
    };

    const targetSlug = legacyAliases[clean] || clean;

    const items = await this.getAll({ includeUnpublished: true });

    // 1. Direct slug match
    let found = items.find(r => r.slug && r.slug.toLowerCase() === targetSlug);
    if (found) return found;

    // 2. Direct ID match
    found = items.find(r => r.id && r.id.toLowerCase() === clean);
    if (found) return found;

    // 3. Fallback check for raw clean slug
    found = items.find(r => r.slug && r.slug.toLowerCase() === clean);
    if (found) return found;

    // 4. Try Firestore directly if available
    if (isFirebaseConfigured && db) {
      try {
        const snap = await this.getById(clean);
        if (snap) return snap;
      } catch (e) {
        // ignore
      }
    }

    return null;
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
        const cleanData = sanitizeForFirestore(toSave);
        await setDoc(doc(db, 'resources', toSave.id), cleanData, { merge: true });
      } catch (err) {
        console.warn('Firestore saveResource error:', err);
      }
    }

    // Mirror to backend server endpoint for resilient cross-device persistence
    try {
      let token: string | null = null;
      if (auth?.currentUser) {
        token = await auth.currentUser.getIdToken().catch(() => null);
      }
      fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(toSave)
      }).catch(err => console.debug('[ResourcesService] Server mirror notice:', err));
    } catch {}

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
   * Rebuilt User Learning Resource Submission Flow using Firebase.
   * Uploads photos directly to Firebase Storage with real-time progress.
   * Saves strictly with initial status: 'pending_review' and submissionStatus: 'pending'.
   * Does NOT appear on public website until approved by admin.
   */
  async submitUserResource(
    submissionData: {
      id?: string;
      title: string;
      description: string;
      category: string;
      resourceType: Resource['resourceType'];
      format?: Resource['format'];
      level?: Resource['level'];
      providerName?: string;
      location?: string;
      duration?: string;
      enrollmentUrl: string;
      isFree: boolean;
      cost?: number;
      currency?: string;
      hasCertificate: boolean;
      skills?: string[];
      contactInfo?: string;
      imageUrl?: string;
      imagePath?: string;
      slug?: string;
    },
    user: {
      uid: string;
      email: string;
      name: string;
    },
    imageFile?: File | null,
    onProgress?: (progressPercent: number) => void
  ): Promise<Resource> {
    if (!submissionData.title?.trim() || submissionData.title.trim().length < 5) {
      throw new Error('Please enter a resource title of at least 5 characters.');
    }
    if (!submissionData.providerName?.trim()) {
      throw new Error('Please specify the institution, academy, or provider name.');
    }
    if (!submissionData.category?.trim()) {
      throw new Error('Please select a resource category.');
    }
    if (!submissionData.description?.trim() || submissionData.description.trim().length < 25) {
      throw new Error('Please provide an informative description of at least 25 characters.');
    }
    if (!submissionData.enrollmentUrl?.trim() || !submissionData.enrollmentUrl.trim().startsWith('http')) {
      throw new Error('Please enter a valid website link starting with http:// or https://');
    }

    const id = submissionData.id || `res_sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    let imageUrl = submissionData.imageUrl;
    let imagePath = submissionData.imagePath;

    // 1. Upload photo directly to Firebase Storage with real-time progress
    if (imageFile) {
      const val = validateImageFile(imageFile);
      if (!val.valid) {
        throw new Error(val.error || 'Invalid image file.');
      }
      const uploaded = await FirebaseStorageService.uploadResourcePhoto(id, imageFile, onProgress);
      imageUrl = uploaded.imageUrl;
      imagePath = uploaded.imagePath;
    }

    const rawSlug = submissionData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'resource';
    const slug = submissionData.slug || `${rawSlug}-${id.substring(8, 14)}`;

    const newResource: Resource = {
      id,
      slug,
      title: submissionData.title.trim(),
      description: submissionData.description.trim(),
      providerId: 'external_submission',
      providerName: (submissionData.providerName || 'Community Contributor').trim(),
      category: submissionData.category || 'Technology',
      resourceType: submissionData.resourceType || 'course',
      level: submissionData.level || 'All Levels',
      format: submissionData.format || 'Self-paced Online',
      location: (submissionData.location || 'Online / Ghana').trim(),
      duration: submissionData.duration || 'Flexible',
      enrollmentUrl: submissionData.enrollmentUrl.trim(),
      sourceUrl: submissionData.enrollmentUrl.trim(),
      isFree: Boolean(submissionData.isFree),
      cost: submissionData.isFree ? 0 : Number(submissionData.cost || 0),
      currency: submissionData.currency || 'GHS',
      hasCertificate: Boolean(submissionData.hasCertificate),
      skills: Array.isArray(submissionData.skills) ? submissionData.skills : [],
      contactInfo: submissionData.contactInfo?.trim(),
      imageUrl,
      imagePath,
      // Strict moderation workflow: always initial status 'pending_review'
      status: 'pending_review',
      submissionStatus: 'pending',
      verificationStatus: 'needs_verification',
      verificationNotes: `Submitted by ${user.name || 'User'} (${user.email}) on ${now}. Awaiting editorial verification.`,
      isUserSubmitted: true,
      submittedBy: user.uid,
      submittedByName: user.name || 'User',
      submittedByEmail: user.email,
      createdByUserId: user.uid,
      createdByName: user.name || 'User',
      createdByEmail: user.email,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
      views: 0,
      saves: 0
    };

    // 2. Persist directly to Firestore
    if (isFirebaseConfigured && db) {
      try {
        const cleanData = sanitizeForFirestore(newResource);
        await setDoc(doc(db, 'resources', id), cleanData, { merge: true });
      } catch (err: any) {
        console.warn('[ResourcesService] Direct Firestore save notice:', err?.message || err);
      }
    }

    // 3. Cache locally in client
    const items = getStoredResources();
    const existingIdx = items.findIndex(i => i.id === newResource.id);
    if (existingIdx >= 0) {
      items[existingIdx] = newResource;
    } else {
      items.unshift(newResource);
    }
    saveStoredResources(items);

    // 4. Synchronize with backend API route
    try {
      let token: string | null = null;
      if (auth?.currentUser) {
        token = await auth.currentUser.getIdToken().catch(() => null);
      }
      await fetch('/api/submissions/resource', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newResource)
      });
    } catch (apiErr) {
      console.warn('[ResourcesService] Server sync note:', apiErr);
    }

    AuditService.log({
      entityType: 'resource',
      entityId: newResource.id,
      entityTitle: newResource.title,
      action: 'created',
      performedByEmail: user.email,
      performedByName: user.name,
      details: `User submitted new resource for administrative verification: "${newResource.title}". Status: pending review.`,
      newStatus: 'pending'
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

    // Mirror to submissions store
    try {
      const rawSub = localStorage.getItem('opp_gh_submissions_store');
      if (rawSub) {
        const subList = JSON.parse(rawSub) || [];
        const sIdx = subList.findIndex((s: any) => s.id === `sub_${id}` || s.data?.id === id);
        if (sIdx >= 0) {
          subList[sIdx].status = isApproval ? 'approved' : 'rejected';
          subList[sIdx].reviewedAt = now;
          subList[sIdx].reviewedBy = admin.name;
          subList[sIdx].reviewedByEmail = admin.email;
          if (isApproval) subList[sIdx].publishedAt = now;
          if (decision === 'rejected') subList[sIdx].rejectionReason = notes;
          subList[sIdx].data = updated;
          localStorage.setItem('opp_gh_submissions_store', JSON.stringify(subList));

          if (isFirebaseConfigured && db) {
            const cleanSubUpdate = sanitizeForFirestore({
              status: isApproval ? 'approved' : 'rejected',
              reviewedAt: now,
              reviewedBy: admin.name,
              reviewedByEmail: admin.email,
              publishedAt: isApproval ? now : null,
              rejectionReason: decision === 'rejected' ? (notes || '') : null,
              data: updated,
              updatedAt: now
            });
            updateDoc(doc(db, 'submissions', subList[sIdx].id), cleanSubUpdate).catch(() => {});
          }
        }
      }
    } catch (e) {
      console.warn('Mirroring resource review to submission store error:', e);
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
    user: { uid: string; email: string; name: string },
    imageFile?: File | null
  ): Promise<Resource> {
    if (!user || !user.uid) {
      throw new Error('You must be signed in to submit a resource.');
    }

    return this.submitUserResource(
      {
        title: data.title,
        description: data.description,
        category: data.category,
        resourceType: data.resourceType,
        level: data.level,
        format: data.format,
        location: data.location,
        providerName: data.providerName,
        enrollmentUrl: data.enrollmentUrl,
        isFree: data.isFree,
        cost: data.cost,
        currency: data.currency,
        hasCertificate: data.hasCertificate,
        skills: data.skills,
        contactInfo: data.contactEmail ? `Email: ${data.contactEmail}` : undefined,
        imageUrl: data.imageUrl,
        imagePath: data.imagePath
      },
      user,
      imageFile
    );
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
        const cleanData = sanitizeForFirestore({
          ...updated,
          updatedAt: now
        });
        await setDoc(doc(db, 'resources', id), cleanData, { merge: true });
      } catch (err) {
        console.warn('Firestore reviewSubmission error:', err);
      }
    }

    // Sync review decision to server moderation endpoint
    try {
      let token: string | null = null;
      if (auth?.currentUser) {
        token = await auth.currentUser.getIdToken().catch(() => null);
      }
      fetch('/api/submissions/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          type: 'resource',
          id,
          decision,
          rejectionReason,
          adminNotes,
          editedData
        })
      }).catch(err => console.debug('[ResourcesService] Server review sync notice:', err));
    } catch {}

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
