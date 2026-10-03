import { Opportunity, OpportunityStatus, VerificationStatus } from '../types/database';
import { db, isFirebaseConfigured } from './firebase';
import { FirebaseStorageService } from './firebase/storageService';
import { AuditService } from './auditService';
import { isOpportunityActuallyClosed, calculateDeadlineInfo } from './deadlineService';
import { VERIFIED_REAL_SCHOLARSHIPS } from '../data/verifiedOpportunities';
import { VERIFIED_REAL_JOBS_AND_INTERNSHIPS } from '../data/verifiedJobsAndInternships';
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

export const ALL_VERIFIED_INITIAL_OPPORTUNITIES: Opportunity[] = [
  ...VERIFIED_REAL_SCHOLARSHIPS,
  ...VERIFIED_REAL_JOBS_AND_INTERNSHIPS
];

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

        // Merge in verified opportunities (scholarships, jobs, and internships)
        for (const verified of ALL_VERIFIED_INITIAL_OPPORTUNITIES) {
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

  // Initial populate with verified real scholarships, jobs, and internships
  const initial = ALL_VERIFIED_INITIAL_OPPORTUNITIES.map(syncWithDeadlineAutomation);
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
  locationType?: 'all' | 'ghana' | 'abroad' | 'online' | string;
  destinationCountry?: string;
  opportunityType?: string;
  educationLevel?: string;
  studyLevel?: string;
  fundingType?: string;
  workArrangement?: string;
  employmentType?: string;
  internshipType?: string;
  experienceLevel?: string;
  skills?: string[];
  isGhanaEligible?: boolean;
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
          // Merge in any missing verified opportunities (scholarships, jobs, and internships)
          for (const verified of ALL_VERIFIED_INITIAL_OPPORTUNITIES) {
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

    // By default, public website displays ONLY published & active (or closed) records, NOT drafts/pending/rejected
    if (!filters?.includeUnpublished) {
      items = items.filter(o =>
        (o.status === 'published' || o.status === 'closed') &&
        o.submissionStatus !== 'pending' &&
        o.submissionStatus !== 'rejected'
      );
    }

    if (filters) {
      if (filters.status) {
        items = items.filter(o => o.status === filters.status);
      }
      if (filters.verificationStatus) {
        items = items.filter(o => o.verificationStatus === filters.verificationStatus);
      }
      if (filters.category && filters.category !== 'All') {
        const catQuery = filters.category.toLowerCase();
        items = items.filter(o => {
          if (o.category.toLowerCase() === catQuery) return true;
          // Support searching 'Study Abroad' to include international study abroad programs
          if (catQuery === 'study abroad') {
            return o.category.toLowerCase() === 'study abroad' ||
              (o.locationType === 'abroad') ||
              (o.category.toLowerCase() === 'scholarships' && o.country && o.country.toLowerCase() !== 'ghana');
          }
          return false;
        });
      }
      if (filters.region && filters.region !== 'All Regions' && filters.region !== 'All Ghana') {
        items = items.filter(o => o.region?.toLowerCase() === filters.region!.toLowerCase());
      }
      if (filters.locationType && filters.locationType !== 'all') {
        const locType = filters.locationType.toLowerCase();
        items = items.filter(o => {
          if (locType === 'ghana') {
            return o.locationType === 'ghana' || (!o.locationType && o.country?.toLowerCase() === 'ghana');
          }
          if (locType === 'abroad') {
            return o.locationType === 'abroad' || (!o.locationType && o.country && o.country.toLowerCase() !== 'ghana');
          }
          if (locType === 'online') {
            return o.locationType === 'online' || o.location?.toLowerCase().includes('online') || o.opportunityType?.toLowerCase().includes('remote') || o.workArrangement?.toLowerCase() === 'remote';
          }
          return true;
        });
      }
      if (filters.destinationCountry && filters.destinationCountry !== 'All') {
        const dCountry = filters.destinationCountry.toLowerCase();
        items = items.filter(o =>
          (o.destinationCountry && o.destinationCountry.toLowerCase().includes(dCountry)) ||
          (o.country && o.country.toLowerCase().includes(dCountry))
        );
      }
      if (filters.isGhanaEligible) {
        items = items.filter(o =>
          o.isGhanaEligible !== false && (
            o.isGhanaEligible === true ||
            o.nationality?.toLowerCase().includes('ghana') ||
            (o.eligibleCountries && o.eligibleCountries.some(c => c.toLowerCase().includes('ghana')))
          )
        );
      }
      if (filters.workArrangement && filters.workArrangement !== 'All') {
        const arr = filters.workArrangement.toLowerCase();
        items = items.filter(o => o.workArrangement?.toLowerCase() === arr);
      }
      if (filters.employmentType && filters.employmentType !== 'All') {
        const emp = filters.employmentType.toLowerCase();
        items = items.filter(o => o.employmentType?.toLowerCase().includes(emp));
      }
      if (filters.internshipType && filters.internshipType !== 'All') {
        const intType = filters.internshipType.toLowerCase();
        items = items.filter(o => o.internshipType?.toLowerCase() === intType);
      }
      if (filters.experienceLevel && filters.experienceLevel !== 'All') {
        const exp = filters.experienceLevel.toLowerCase();
        items = items.filter(o => o.experienceLevel?.toLowerCase().includes(exp));
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
        const fType = filters.fundingType.toLowerCase();
        items = items.filter(o =>
          o.fundingType && o.fundingType.toLowerCase().includes(fType)
        );
      }
      if (filters.onlyActive) {
        items = items.filter(o => o.status === 'published' && !isOpportunityActuallyClosed(o.status, o.deadline));
      }
      if (filters.search && filters.search.trim().length > 0) {
        const rawQ = filters.search.toLowerCase().trim();
        // Split into tokens for multi-term matching (e.g. "software engineer accra" or "graduate internship")
        const tokens = rawQ.split(/\s+/).filter(t => t.length > 1 && !['for', 'the', 'and', 'with', 'from', 'in', 'at'].includes(t));
        
        items = items.filter(o => {
          const searchable = [
            o.title,
            o.description,
            o.organizationName || '',
            o.category,
            o.subcategory || '',
            o.location || '',
            o.country || '',
            o.region || '',
            o.destinationCountry || '',
            o.nationality || '',
            o.fieldOfStudy || '',
            o.fundingType || '',
            o.studyLevel || '',
            o.workArrangement || '',
            o.employmentType || '',
            o.internshipType || '',
            o.experienceLevel || '',
            o.educationLevel || '',
            o.skills?.join(' ') || '',
            o.responsibilities?.join(' ') || ''
          ].join(' ').toLowerCase();

          // If exact match
          if (searchable.includes(rawQ)) return true;
          // Or all significant tokens match
          if (tokens.length > 0) {
            return tokens.every(token => searchable.includes(token));
          }
          return false;
        });
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
      .map(o => ({ item: o, info: calculateDeadlineInfo(o.deadline) }))
      .filter(({ info }) => !info.isClosed && info.diffMs > 0 && info.status !== 'rolling')
      .sort((a, b) => a.info.diffMs - b.info.diffMs)
      .map(({ item }) => item)
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
  },

  /**
   * Submits a new opportunity from an authenticated community member for review.
   * Saved strictly with status: 'pending' and does NOT appear on public website until approved.
   */
  async submitUserOpportunity(
    data: Partial<Opportunity>,
    user: { uid: string; email: string; name: string }
  ): Promise<Opportunity> {
    if (!data.title?.trim()) {
      throw new Error('Opportunity title is required.');
    }
    if (!data.category?.trim()) {
      throw new Error('Opportunity category is required.');
    }
    if (!data.description?.trim()) {
      throw new Error('Description is required.');
    }
    if (!data.applicationUrl?.trim()) {
      throw new Error('Application link is required.');
    }

    const id = 'opp_sub_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    const now = new Date().toISOString();
    const rawSlug = (data.title || 'opportunity')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const slug = `${rawSlug}-${id.substring(8, 14)}`;

    const submission: Opportunity = {
      id,
      slug: data.slug || slug,
      title: data.title.trim(),
      description: data.description.trim(),
      organizationId: data.organizationId || user.uid,
      organizationName: data.organizationName?.trim() || 'Community Partner',
      organizationLogo: data.organizationLogo,
      category: data.category || 'Scholarships',
      subcategory: data.subcategory || '',
      opportunityType: data.opportunityType || 'Full-time',
      location: data.location?.trim() || 'Ghana / Remote',
      country: data.country?.trim() || 'Ghana',
      region: data.region?.trim() || 'All Ghana',
      educationLevel: data.educationLevel || 'Undergraduate',
      fieldOfStudy: data.fieldOfStudy || 'All Fields',
      experienceLevel: data.experienceLevel || 'Entry Level',
      ageRequirement: data.ageRequirement || '',
      nationality: data.nationality || 'Ghanaian citizens',
      fundingType: data.fundingType || 'Fully Funded',
      funding: data.funding || '',
      tuition: data.tuition || '',
      accommodation: data.accommodation || '',
      stipend: data.stipend || '',
      travel: data.travel || '',
      otherBenefits: data.otherBenefits || '',
      benefits: Array.isArray(data.benefits) ? data.benefits : (data.benefits ? [data.benefits] : []),
      requirements: Array.isArray(data.requirements) ? data.requirements : (data.requirements ? [data.requirements] : []),
      documentsRequired: Array.isArray(data.documentsRequired) ? data.documentsRequired : [],
      applicationUrl: data.applicationUrl.trim(),
      officialApplicationUrl: data.officialApplicationUrl?.trim() || data.applicationUrl.trim(),
      applicationMethod: data.applicationMethod || 'online_form',
      applicationInstructions: data.applicationInstructions || '',
      deadline: data.deadline || '',
      openingDate: data.openingDate || '',
      studyLevel: data.studyLevel || data.educationLevel || '',
      fundingDetails: data.fundingDetails || '',
      imageUrl: data.imageUrl,
      imagePath: data.imagePath,
      sourceName: data.sourceName || data.organizationName || 'User Contribution',
      sourceUrl: data.sourceUrl?.trim() || data.applicationUrl.trim(),

      // Strict moderation workflow
      status: 'pending',
      submissionStatus: 'pending',
      verificationStatus: 'needs_verification',
      verificationNotes: `Submitted by user ${user.name} (${user.email}). Awaiting editorial review.`,

      // User Submitter attribution
      isUserSubmitted: true,
      submittedBy: user.uid,
      submittedByName: user.name || 'User',
      submittedByEmail: user.email,
      submittedAt: now,
      contactEmail: data.contactEmail || user.email,
      contactPhone: data.contactPhone || '',
      contactInfo: data.contactInfo || '',

      createdAt: now,
      updatedAt: now,
      views: 0,
      saves: 0
    };

    const items = getStoredOpportunities();
    items.unshift(submission);
    saveStoredOpportunities(items);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'opportunities', id), submission);
      } catch (err: any) {
        console.warn('Firestore submitUserOpportunity error:', err?.message || err);
      }
    }

    AuditService.log({
      entityType: 'opportunity',
      entityId: id,
      entityTitle: submission.title,
      action: 'created',
      performedByEmail: user.email,
      performedByName: user.name || 'User',
      details: `User submitted opportunity for editorial review: "${submission.title}". Status: pending review.`,
      newStatus: 'pending'
    });

    return submission;
  },

  /**
   * Retrieves submissions submitted by a specific user.
   */
  async getUserSubmissions(userId: string, userEmail?: string): Promise<Opportunity[]> {
    if (!userId) return [];

    let items = getStoredOpportunities().filter(o =>
      o.submittedBy === userId ||
      o.createdByUserId === userId ||
      (userEmail && o.submittedByEmail?.toLowerCase() === userEmail.toLowerCase()) ||
      (userEmail && o.createdByEmail?.toLowerCase() === userEmail.toLowerCase())
    );

    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'opportunities'), where('submittedBy', '==', userId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const remoteItems = snap.docs.map(d => ({ id: d.id, ...d.data() } as Opportunity));
          const otherItems = getStoredOpportunities().filter(o => o.submittedBy !== userId && o.createdByUserId !== userId);
          items = remoteItems;
          saveStoredOpportunities([...remoteItems, ...otherItems]);
        }
      } catch (err) {
        console.warn('Firestore getUserSubmissions opportunities error:', err);
      }
    }

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Administrator approval, rejection, or changes requested workflow for Opportunity.
   */
  async reviewOpportunitySubmission(
    id: string,
    decision: 'approved' | 'rejected' | 'changes_requested',
    admin: { email: string; name: string; uid?: string },
    rejectionReason?: string,
    editedData?: Partial<Opportunity>
  ): Promise<Opportunity | null> {
    return this.reviewSubmission(
      id,
      decision,
      { uid: admin.uid || 'admin', email: admin.email, name: admin.name },
      rejectionReason,
      undefined,
      editedData
    );
  },

  async reviewSubmission(
    id: string,
    decision: 'approved' | 'rejected' | 'changes_requested',
    admin: { uid: string; email: string; name: string },
    rejectionReason?: string,
    adminNotes?: string,
    editedData?: Partial<Opportunity>
  ): Promise<Opportunity | null> {
    const items = getStoredOpportunities();
    const index = items.findIndex(o => o.id === id);
    const now = new Date().toISOString();

    const previousItem = index >= 0 ? items[index] : await this.getById(id);
    if (!previousItem) return null;

    const isApproval = decision === 'approved';
    const isRejection = decision === 'rejected';

    const updated: Opportunity = {
      ...previousItem,
      ...(editedData || {}),
      status: isApproval ? 'published' : isRejection ? 'rejected' : 'pending',
      submissionStatus: decision,
      verificationStatus: isApproval ? 'verified' : previousItem.verificationStatus,
      lastVerifiedAt: isApproval ? now : previousItem.lastVerifiedAt,
      verifiedBy: isApproval ? admin.name : previousItem.verifiedBy,
      verifiedByEmail: isApproval ? admin.email : previousItem.verifiedByEmail,
      publishedAt: isApproval ? now : previousItem.publishedAt,
      publishedByEmail: isApproval ? admin.email : previousItem.publishedByEmail,
      reviewedAt: now,
      reviewedBy: admin.name,
      reviewedByEmail: admin.email,
      rejectionReason: isRejection ? rejectionReason?.trim() : (decision === 'changes_requested' ? rejectionReason?.trim() : undefined),
      adminNotes: adminNotes?.trim() || previousItem.adminNotes,
      verificationNotes: isApproval
        ? `Verified and published by ${admin.name} on ${new Date().toLocaleDateString('en-GB')}`
        : previousItem.verificationNotes,
      updatedAt: now
    };

    if (index >= 0) {
      items[index] = updated;
    } else {
      items.unshift(updated);
    }
    saveStoredOpportunities(items);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'opportunities', id), {
          ...updated,
          updatedAt: now
        });
      } catch (err: any) {
        console.warn('Firestore reviewSubmission opportunity error:', err?.message || err);
      }
    }

    AuditService.log({
      entityType: 'opportunity',
      entityId: id,
      entityTitle: updated.title,
      action: isApproval ? 'published' : 'updated',
      performedByEmail: admin.email,
      performedByName: admin.name,
      details: isApproval
        ? `Submission approved and published to public site by ${admin.name}.`
        : `Submission ${decision.toUpperCase()} by ${admin.name}.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      previousStatus: previousItem.status,
      newStatus: updated.status
    });

    return updated;
  },

  /**
   * Retrieves all opportunities waiting for review or submitted by users.
   */
  async getPendingSubmissions(): Promise<Opportunity[]> {
    const all = await this.getAll({ includeUnpublished: true });
    return all.filter(o =>
      o.isUserSubmitted ||
      o.status === 'pending' ||
      (o.status as string) === 'pending_review' ||
      o.submissionStatus === 'pending'
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
};
