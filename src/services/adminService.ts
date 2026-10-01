import { Organization, Skill, Submission, ContentReport, PipelineMetrics, User } from '../types/database';
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

  getSubmissions(): Submission[] {
    try {
      const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.filter(s => s && s.id && !s.id.startsWith('sub-0'));
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  },

  async loadSubmissionsFromFirestore(): Promise<Submission[]> {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'submissions'));
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() } as Submission))
          .filter(s => !s.id.startsWith('sub-0'));
        localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));
        return list;
      } catch (err) {
        console.warn('Firestore loadSubmissions error:', err);
      }
    }
    return this.getSubmissions();
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

    return {
      totalOpportunities: opps.length,
      publishedCount: opps.filter(o => o.status === 'published' && !calculateDeadlineInfo(o.deadline).isClosed).length,
      draftCount: opps.filter(o => o.status === 'draft').length,
      pendingReviewCount: opps.filter(o => o.status === 'pending_review').length,
      needsVerificationCount: opps.filter(o => o.verificationStatus === 'needs_verification').length,
      closingSoonCount: closingSoon.length,
      closedCount: closedOpps.length,
      totalResources: resources.length,
      pendingResourceSubmissions: subs.filter(s => s.type === 'resource' && s.status === 'pending').length,
      totalUsers: users.length,
      totalOrganizations: orgs.length,
      pendingSubmissionsCount: subs.filter(s => s.status === 'pending').length,
      openReportsCount: reps.filter(r => r.status === 'open' || r.status === 'investigating').length
    };
  }
};
