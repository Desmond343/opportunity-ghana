import { Organization, Skill, Submission, ContentReport, PipelineMetrics, User, Opportunity, Resource } from '../types/database';
import { STANDARD_CAREER_TRACKS } from '../data/categories';
import { VERIFIED_ORGANIZATIONS } from '../data/verifiedOpportunities';
import { OpportunitiesService } from './opportunitiesService';
import { ResourcesService } from './resourcesService';
import { calculateDeadlineInfo } from './deadlineService';
import { db, isFirebaseConfigured } from './firebase';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

const ORG_STORAGE_KEY = 'opp_gh_orgs_store';
const SKILLS_STORAGE_KEY = 'opp_gh_skills_store';
const SUBMISSIONS_STORAGE_KEY = 'opp_gh_submissions_store';
const REPORTS_STORAGE_KEY = 'opp_gh_reports_store';
const USERS_STORAGE_KEY = 'opp_gh_users_store';

export const AdminService = {
  getOrganizations(): Organization[] {
    try {
      const raw = localStorage.getItem(ORG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Purge demo organizations
          const cleaned = parsed.filter(o => o && o.id && !o.id.startsWith('org-demo-'));
          return cleaned;
        }
      }
    } catch (e) {
      console.error('Error loading organizations:', e);
    }
    return [];
  },

  async loadOrganizationsFromFirestore(): Promise<Organization[]> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'organizations'));
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Organization))
          .filter(o => !o.id.startsWith('org-demo-'));
        localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(list));
        return list;
      } catch (err) {
        console.warn('Firestore loadOrganizations error:', err);
      }
    }
    return this.getOrganizations();
  },

  saveOrganization(org: Organization) {
    const orgs = this.getOrganizations();
    const idx = orgs.findIndex(o => o.id === org.id);
    if (idx >= 0) {
      orgs[idx] = { ...org, updatedAt: new Date().toISOString() };
    } else {
      orgs.unshift({ ...org, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(orgs));

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'organizations', org.id), org, { merge: true }).catch(err =>
        console.warn('Firestore saveOrganization error:', err)
      );
    }
  },

  getSkills(): Skill[] {
    try {
      const raw = localStorage.getItem(SKILLS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading skills:', e);
    }
    // Default to the standard Ghana career and skills taxonomy
    localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(STANDARD_CAREER_TRACKS));
    return STANDARD_CAREER_TRACKS;
  },

  saveSkill(skill: Skill) {
    const list = this.getSkills();
    const idx = list.findIndex(s => s.id === skill.id);
    if (idx >= 0) {
      list[idx] = { ...skill, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...skill, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(list));

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'skills', skill.id), skill, { merge: true }).catch(err =>
        console.warn('Firestore saveSkill error:', err)
      );
    }
  },

  getSubmissions(filters?: {
    status?: string;
    type?: string;
    category?: string;
    dateRange?: string;
    search?: string;
  }): Submission[] {
    let list: Submission[] = [];
    try {
      const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          list = parsed.filter(s => s && s.id && !s.id.startsWith('sub-0'));
        }
      }
    } catch (e) {
      console.error(e);
    }

    if (filters) {
      if (filters.status && filters.status !== 'all') {
        list = list.filter(s => s.status === filters.status);
      }
      if (filters.type && filters.type !== 'all') {
        list = list.filter(s => s.type === filters.type);
      }
      if (filters.category && filters.category !== 'all') {
        const cat = filters.category.toLowerCase();
        list = list.filter(s => (s.category && s.category.toLowerCase() === cat) || ((s.data as any)?.category && (s.data as any).category.toLowerCase() === cat));
      }
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(s =>
          s.title?.toLowerCase().includes(q) ||
          s.submittedByName?.toLowerCase().includes(q) ||
          s.submittedByEmail?.toLowerCase().includes(q) ||
          s.organizationName?.toLowerCase().includes(q)
        );
      }
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = Date.now();
        list = list.filter(s => {
          const date = new Date(s.createdAt).getTime();
          if (isNaN(date)) return true;
          const diffHours = (now - date) / (1000 * 60 * 60);
          if (filters.dateRange === 'today') return diffHours <= 24;
          if (filters.dateRange === 'week') return diffHours <= 168;
          if (filters.dateRange === 'month') return diffHours <= 720;
          return true;
        });
      }
    }

    // Sort: Pending first, then newest
    return list.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  },

  async loadSubmissionsFromFirestore(): Promise<Submission[]> {
    let list: Submission[] = [];
    if (isFirebaseConfigured && db) {
      try {
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 3000)
        );
        const snap: any = await Promise.race([getDocs(collection(db, 'submissions')), timeout]);
        list = snap.docs
          .map((d: any) => ({ id: d.id, ...d.data() } as Submission))
          .filter((s: any) => !s.id.startsWith('sub-0'));
      } catch (err) {
        // Continue to fallback
      }
    }

    if (list.length === 0) {
      list = this.getSubmissions();
    }

    // Sync any user-submitted opportunities that might have been submitted directly
    try {
      const opps = await OpportunitiesService.getAll({ includeUnpublished: true });
      const userOpps = opps.filter(o => o.isUserSubmitted);
      for (const opp of userOpps) {
        const subId = `sub_${opp.id}`;
        const existingIdx = list.findIndex(s => s.id === subId || s.data?.id === opp.id);
        const subStatus: 'pending' | 'approved' | 'rejected' =
          opp.submissionStatus === 'approved' || opp.status === 'published'
            ? 'approved'
            : opp.submissionStatus === 'rejected'
            ? 'rejected'
            : 'pending';

        const subItem: Submission = {
          id: subId,
          type: 'opportunity',
          title: opp.title,
          organizationName: opp.organizationName || 'Community Contributor',
          category: opp.category,
          location: opp.location,
          submittedByEmail: opp.createdByEmail || opp.submittedByEmail || 'user@opportunityghana.com',
          submittedByName: opp.createdByName || opp.submittedByName || 'Community Contributor',
          submittedByUserId: opp.createdByUserId || opp.submittedByUserId,
          data: opp,
          status: subStatus,
          reviewedBy: opp.reviewedBy,
          reviewedByEmail: opp.reviewedByEmail,
          reviewedAt: opp.reviewedAt,
          publishedAt: opp.publishedAt,
          rejectionReason: opp.rejectionReason,
          createdAt: opp.submittedAt || opp.createdAt,
          updatedAt: opp.updatedAt
        };

        if (existingIdx >= 0) {
          list[existingIdx] = { ...list[existingIdx], ...subItem };
        } else {
          list.unshift(subItem);
        }
      }

      // Sync any user-submitted resources
      const resources = await ResourcesService.getAll({ includeUnpublished: true });
      const userResources = resources.filter(r => r.isUserSubmitted);
      for (const res of userResources) {
        const subId = `sub_${res.id}`;
        const existingIdx = list.findIndex(s => s.id === subId || s.data?.id === res.id);
        const subStatus: 'pending' | 'approved' | 'rejected' =
          res.submissionStatus === 'approved' || res.status === 'published'
            ? 'approved'
            : res.submissionStatus === 'rejected'
            ? 'rejected'
            : 'pending';

        const subItem: Submission = {
          id: subId,
          type: 'resource',
          title: res.title,
          organizationName: res.providerName || 'Community Contributor',
          category: res.category,
          location: res.location,
          submittedByEmail: res.createdByEmail || 'user@opportunityghana.com',
          submittedByName: res.createdByName || 'Community Contributor',
          submittedByUserId: res.createdByUserId,
          data: res,
          status: subStatus,
          reviewedBy: res.lastEditedByName,
          reviewedByEmail: res.verifiedByEmail,
          reviewedAt: res.lastVerifiedAt,
          publishedAt: res.publishedAt,
          rejectionReason: res.rejectionReason,
          createdAt: res.submittedAt || res.createdAt,
          updatedAt: res.updatedAt
        };

        if (existingIdx >= 0) {
          list[existingIdx] = { ...list[existingIdx], ...subItem };
        } else {
          list.unshift(subItem);
        }
      }
    } catch (e) {
      console.warn('Error syncing submissions from entity stores:', e);
    }

    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));
    return list;
  },

  saveSubmission(sub: Submission) {
    const list = this.getSubmissions();
    const idx = list.findIndex(s => s.id === sub.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...sub, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...sub, createdAt: sub.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'submissions', sub.id), sub, { merge: true }).catch(err =>
        console.warn('Firestore saveSubmission error:', err)
      );
    }
  },

  updateSubmissionStatus(id: string, status: 'approved' | 'rejected', notes?: string) {
    const list = this.getSubmissions();
    const idx = list.findIndex(s => s.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      list[idx].reviewedAt = new Date().toISOString();
      if (notes) list[idx].notes = notes;
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));

      if (isFirebaseConfigured && db) {
        updateDoc(doc(db, 'submissions', id), {
          status,
          reviewedAt: list[idx].reviewedAt,
          notes: list[idx].notes || ''
        }).catch(err => console.warn('Firestore updateSubmission error:', err));
      }
    }
  },

  async updateSubmissionData(id: string, updatedData: Partial<Opportunity | Resource>): Promise<void> {
    const list = this.getSubmissions();
    const idx = list.findIndex(s => s.id === id);
    if (idx >= 0) {
      list[idx].data = { ...list[idx].data, ...updatedData };
      if ((updatedData as any).title) list[idx].title = (updatedData as any).title;
      if ((updatedData as any).organizationName) list[idx].organizationName = (updatedData as any).organizationName;
      if ((updatedData as any).category) list[idx].category = (updatedData as any).category;
      if ((updatedData as any).location) list[idx].location = (updatedData as any).location;
      list[idx].updatedAt = new Date().toISOString();
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));

      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'submissions', id), {
          data: list[idx].data,
          title: list[idx].title,
          updatedAt: list[idx].updatedAt
        }).catch(err => console.warn('Firestore updateSubmissionData error:', err));
      }
    }
  },

  async approveSubmission(
    id: string,
    adminUser: { email: string; name: string },
    editedData?: Partial<Opportunity | Resource>
  ): Promise<{ success: boolean; error?: string; opportunity?: Opportunity; resource?: Resource }> {
    const submissions = await this.loadSubmissionsFromFirestore();
    const sub = submissions.find(s => s.id === id);
    if (!sub) {
      return { success: false, error: 'Submission record not found in system.' };
    }

    const now = new Date().toISOString();
    const mergedData = { ...(sub.data || {}), ...(editedData || {}) };

    if (sub.type === 'opportunity') {
      const oppData = mergedData as Opportunity;
      if (!oppData.title?.trim()) {
        return { success: false, error: 'Opportunity title is required to approve & publish.' };
      }
      if (!oppData.category) {
        return { success: false, error: 'Opportunity category is required.' };
      }
      if (!oppData.applicationUrl?.trim()) {
        return { success: false, error: 'Valid application URL is required.' };
      }

      // Publish the opportunity
      const publishedOpp = await OpportunitiesService.reviewOpportunitySubmission(
        oppData.id,
        'approved',
        adminUser,
        undefined,
        oppData
      );

      // Update submission record
      sub.status = 'approved';
      sub.reviewedAt = now;
      sub.reviewedBy = adminUser.name;
      sub.reviewedByEmail = adminUser.email;
      sub.publishedAt = now;
      sub.data = publishedOpp || oppData;
      this.saveSubmission(sub);

      return { success: true, opportunity: publishedOpp || oppData };
    } else if (sub.type === 'resource') {
      const resData = mergedData as Resource;
      if (!resData.title?.trim()) {
        return { success: false, error: 'Resource title is required to approve & publish.' };
      }
      if (!resData.enrollmentUrl?.trim()) {
        return { success: false, error: 'Valid enrollment URL is required.' };
      }

      await ResourcesService.reviewResourceSubmission(
        resData.id,
        'approved',
        adminUser
      );

      sub.status = 'approved';
      sub.reviewedAt = now;
      sub.reviewedBy = adminUser.name;
      sub.reviewedByEmail = adminUser.email;
      sub.publishedAt = now;
      sub.data = {
        ...resData,
        status: 'published',
        verificationStatus: 'verified',
        publishedAt: now
      };
      this.saveSubmission(sub);

      return { success: true, resource: sub.data as Resource };
    }

    return { success: false, error: 'Unsupported submission type.' };
  },

  async rejectSubmission(
    id: string,
    rejectionReason: string,
    adminUser: { email: string; name: string }
  ): Promise<{ success: boolean; error?: string }> {
    const submissions = await this.loadSubmissionsFromFirestore();
    const sub = submissions.find(s => s.id === id);
    if (!sub) {
      return { success: false, error: 'Submission record not found in system.' };
    }

    const now = new Date().toISOString();
    const reasonText = rejectionReason.trim() || 'Declined during editorial verification review.';

    if (sub.type === 'opportunity' && sub.data?.id) {
      await OpportunitiesService.reviewOpportunitySubmission(
        sub.data.id,
        'rejected',
        adminUser,
        reasonText
      );
    } else if (sub.type === 'resource' && sub.data?.id) {
      await ResourcesService.reviewResourceSubmission(
        sub.data.id,
        'rejected',
        adminUser,
        reasonText
      );
    }

    sub.status = 'rejected';
    sub.rejectionReason = reasonText;
    sub.reviewedAt = now;
    sub.reviewedBy = adminUser.name;
    sub.reviewedByEmail = adminUser.email;
    if (sub.data) {
      (sub.data as any).status = 'draft';
      (sub.data as any).submissionStatus = 'rejected';
      (sub.data as any).rejectionReason = reasonText;
    }
    this.saveSubmission(sub);

    return { success: true };
  },

  getPendingSubmissionsCount(): number {
    return this.getSubmissions().filter(s => s.status === 'pending').length;
  },

  getReports(): ContentReport[] {
    try {
      const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter(r => r && r.id && !r.id.startsWith('rep-0'));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  async loadReportsFromFirestore(): Promise<ContentReport[]> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'reports'));
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as ContentReport))
          .filter(r => !r.id.startsWith('rep-0'));
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(list));
        return list;
      } catch (err) {
        console.warn('Firestore loadReports error:', err);
      }
    }
    return this.getReports();
  },

  updateReportStatus(id: string, status: ContentReport['status']) {
    const reports = this.getReports();
    const idx = reports.findIndex(r => r.id === id);
    if (idx >= 0) {
      reports[idx].status = status;
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));

      if (isFirebaseConfigured && db) {
        updateDoc(doc(db, 'reports', id), { status }).catch(err =>
          console.warn('Firestore updateReport error:', err)
        );
      }
    }
  },

  getUsers(): User[] {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter(u => 
            u && 
            u.id && 
            !u.id.startsWith('user-0') && 
            !u.id.startsWith('user-admin-') && 
            !u.id.startsWith('user-standard-') &&
            !u.email?.includes('example.com')
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  async loadUsersFromFirestore(): Promise<User[]> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as User))
          .filter(u => !u.email?.includes('example.com') && !u.id.startsWith('user-0'));
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(list));
        return list;
      } catch (err) {
        console.warn('Firestore loadUsers error:', err);
      }
    }
    return this.getUsers();
  },

  updateUserRole(id: string, role: User['role']) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx >= 0) {
      users[idx].role = role;
      users[idx].updatedAt = new Date().toISOString();
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      if (isFirebaseConfigured && db) {
        updateDoc(doc(db, 'users', id), { role, updatedAt: users[idx].updatedAt }).catch(err =>
          console.warn('Firestore updateUserRole error:', err)
        );
      }
    }
  },

  async getPipelineMetrics(): Promise<PipelineMetrics> {
    const opps = await OpportunitiesService.getAll({ includeUnpublished: true });
    const resources = await ResourcesService.getAll({ includeUnpublished: true });
    const orgs = await this.loadOrganizationsFromFirestore();
    const subs = await this.loadSubmissionsFromFirestore();
    const reps = await this.loadReportsFromFirestore();
    const users = await this.loadUsersFromFirestore();

    const closingSoon = opps.filter(o => {
      if (o.status !== 'published') return false;
      const info = calculateDeadlineInfo(o.deadline);
      return !info.isClosed && info.daysRemaining <= 7;
    });

    const closedOpps = opps.filter(o => o.status === 'closed' || calculateDeadlineInfo(o.deadline).isClosed);

    const pendingOppSubmissions = opps.filter(o => 
      o.status === 'pending' || 
      (o.status as string) === 'pending_review' || 
      o.submissionStatus === 'pending'
    ).length;

    const pendingResSubmissions = resources.filter(r => 
      r.status === 'pending' || 
      (r.status as string) === 'pending_review' || 
      r.submissionStatus === 'pending'
    ).length;

    const pendingPartnerSubs = subs.filter(s => s.status === 'pending').length;

    return {
      totalOpportunities: opps.length,
      publishedCount: opps.filter(o => o.status === 'published' && !calculateDeadlineInfo(o.deadline).isClosed).length,
      draftCount: opps.filter(o => o.status === 'draft').length,
      pendingReviewCount: pendingOppSubmissions,
      needsVerificationCount: opps.filter(o => o.verificationStatus === 'needs_verification').length,
      closingSoonCount: closingSoon.length,
      closedCount: closedOpps.length,
      totalResources: resources.length,
      pendingResourceSubmissions: pendingResSubmissions,
      totalUsers: users.length,
      totalOrganizations: orgs.length,
      pendingSubmissionsCount: pendingOppSubmissions + pendingResSubmissions + pendingPartnerSubs,
      openReportsCount: reps.filter(r => r.status === 'open' || r.status === 'investigating').length
    };
  }
};
