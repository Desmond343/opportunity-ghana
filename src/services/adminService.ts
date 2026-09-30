import { Organization, Skill, Submission, ContentReport, PipelineMetrics, User } from '../types/database';
import { DEMO_ORGANIZATIONS, DEMO_SKILLS } from '../data/demoData';
import { OpportunitiesService } from './opportunitiesService';
import { ResourcesService } from './resourcesService';
import { calculateDeadlineInfo } from './deadlineService';

const ORG_STORAGE_KEY = 'opp_gh_orgs_store';
const SKILLS_STORAGE_KEY = 'opp_gh_skills_store';
const SUBMISSIONS_STORAGE_KEY = 'opp_gh_submissions_store';
const REPORTS_STORAGE_KEY = 'opp_gh_reports_store';
const USERS_STORAGE_KEY = 'opp_gh_users_store';

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-01',
    type: 'opportunity',
    title: 'Graduate Environmental Analyst Programme',
    organizationName: 'Ghana EPA',
    submittedByEmail: 'hr@epa.gov.gh',
    submittedByName: 'EPA Careers Officer',
    data: {
      title: 'Graduate Environmental Analyst Programme',
      category: 'Jobs',
      opportunityType: 'Full-time',
      location: 'Accra, Ghana',
      region: 'Greater Accra',
      deadline: '2026-11-15T23:59:59Z'
    },
    status: 'pending',
    createdAt: '2026-09-28T10:00:00Z',
    updatedAt: '2026-09-28T10:00:00Z',
    notes: 'Submitted via public partner portal. Needs official letterhead verification.'
  },
  {
    id: 'sub-02',
    type: 'resource',
    title: 'Free GIS Mapping & Drone Piloting Bootcamp',
    organizationName: 'UCC Geomatics Lab',
    submittedByEmail: 'gis@ucc.edu.gh',
    submittedByName: 'Dr. Evans Mensah',
    data: {
      title: 'Free GIS Mapping & Drone Piloting Bootcamp',
      category: 'Engineering',
      isFree: true,
      hasCertificate: true,
      duration: '4 Weeks'
    },
    status: 'pending',
    createdAt: '2026-09-27T14:30:00Z',
    updatedAt: '2026-09-27T14:30:00Z',
    notes: 'Awaiting venue room confirmation at UCC campus.'
  }
];

const INITIAL_REPORTS: ContentReport[] = [
  {
    id: 'rep-01',
    targetType: 'opportunity',
    targetId: 'opp-demo-04',
    targetTitle: 'Digital Marketing & Growth Internship',
    reason: 'broken_link',
    details: 'The official applicant form link returned 404 for 20 minutes yesterday.',
    reportedBy: 'user@example.com',
    status: 'investigating',
    createdAt: '2026-09-28T15:20:00Z'
  },
  {
    id: 'rep-02',
    targetType: 'opportunity',
    targetId: 'opp-demo-02',
    targetTitle: 'Mastercard Foundation Scholars Program at KNUST',
    reason: 'incorrect_info',
    details: 'Application fee is stated as 0, but user asked for confirmation of hostel bond.',
    reportedBy: 'student@knust.edu.gh',
    status: 'open',
    createdAt: '2026-09-29T08:00:00Z'
  }
];

const INITIAL_USERS: User[] = [
  {
    id: 'user-01',
    name: 'Kwadwo Asare',
    email: 'admin@opportunityghana.com',
    role: 'admin',
    location: 'Accra, Ghana',
    university: 'University of Ghana',
    course: 'Computer Science',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-09-29T00:00:00Z'
  },
  {
    id: 'user-02',
    name: 'Ama Serwaa Mensah',
    email: 'editor@opportunityghana.com',
    role: 'editor',
    location: 'Kumasi, Ghana',
    university: 'KNUST',
    course: 'Development Planning',
    createdAt: '2026-02-14T00:00:00Z',
    updatedAt: '2026-09-29T00:00:00Z'
  },
  {
    id: 'user-03',
    name: 'Emmanuel Osei',
    email: 'emmanuel.osei@gmail.com',
    role: 'user',
    location: 'Takoradi, Ghana',
    university: 'University of Cape Coast',
    course: 'B.Ed Mathematics',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-09-29T00:00:00Z'
  },
  {
    id: 'user-04',
    name: 'Abena Frimpong',
    email: 'abena.f@ashesi.edu.gh',
    role: 'user',
    location: 'Berekuso, Ghana',
    university: 'Ashesi University',
    course: 'Business Administration',
    createdAt: '2026-04-12T00:00:00Z',
    updatedAt: '2026-09-29T00:00:00Z'
  }
];

export const AdminService = {
  getOrganizations(): Organization[] {
    try {
      const raw = localStorage.getItem(ORG_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(DEMO_ORGANIZATIONS));
    return DEMO_ORGANIZATIONS;
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
  },

  getSkills(): Skill[] {
    try {
      const raw = localStorage.getItem(SKILLS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(DEMO_SKILLS));
    return DEMO_SKILLS;
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
  },

  getSubmissions(): Submission[] {
    try {
      const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(INITIAL_SUBMISSIONS));
    return INITIAL_SUBMISSIONS;
  },

  updateSubmissionStatus(id: string, status: 'approved' | 'rejected', notes?: string) {
    const list = this.getSubmissions();
    const idx = list.findIndex(s => s.id === id);
    if (idx >= 0) {
      list[idx].status = status;
      list[idx].reviewedAt = new Date().toISOString();
      if (notes) list[idx].notes = notes;
      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(list));
    }
  },

  getReports(): ContentReport[] {
    try {
      const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(INITIAL_REPORTS));
    return INITIAL_REPORTS;
  },

  updateReportStatus(id: string, status: ContentReport['status']) {
    const reports = this.getReports();
    const idx = reports.findIndex(r => r.id === id);
    if (idx >= 0) {
      reports[idx].status = status;
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
    }
  },

  getUsers(): User[] {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  },

  updateUserRole(id: string, role: User['role']) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx >= 0) {
      users[idx].role = role;
      users[idx].updatedAt = new Date().toISOString();
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  },

  async getPipelineMetrics(): Promise<PipelineMetrics> {
    const opps = await OpportunitiesService.getAll({ includeUnpublished: true });
    const resources = await ResourcesService.getAll({ includeUnpublished: true });
    const orgs = this.getOrganizations();
    const subs = this.getSubmissions();
    const reps = this.getReports();
    const users = this.getUsers();

    // Closing soon: within 7 days and still active
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
