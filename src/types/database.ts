/**
 * Opportunity Ghana - Database Entity Types & Schema Definitions
 */

export type UserRole = 'user' | 'admin' | 'editor' | 'moderator' | 'organization';

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  location?: string;
  region?: string;
  educationLevel?: string;
  university?: string;
  course?: string;
  graduationYear?: number;
  skills?: string[];
  careerInterests?: string[];
  preferredOpportunityTypes?: string[];
  preferredLocations?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description: string;
  website?: string;
  organizationType: 'university' | 'corporate' | 'ngo' | 'government' | 'foundation' | 'startup' | 'international';
  location: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OpportunityStatus = 'draft' | 'pending_review' | 'verified' | 'published' | 'closed' | 'archived';
export type VerificationStatus = 'verified' | 'needs_verification' | 'warning' | 'closed';

export type OpportunityCategory =
  | 'Jobs'
  | 'Scholarships'
  | 'Internships'
  | 'Grants'
  | 'Fellowships'
  | 'Admissions'
  | 'Training'
  | 'Competitions'
  | 'Government Programmes'
  | 'Graduate Programmes'
  | 'Study Abroad'
  | 'Entrepreneurship';

export interface Opportunity {
  id: string;
  title: string;
  slug: string;
  description: string;
  organizationId: string;
  organizationName?: string;
  organizationLogo?: string;
  category: OpportunityCategory | string;
  subcategory?: string;
  opportunityType: string; // e.g. "Full-time", "Partial Scholarship", "Undergraduate", "Remote"
  location: string; // e.g. "Accra, Ghana", "Kumasi, Ghana", "Remote"
  country: string;
  region: string; // e.g. "Greater Accra", "Ashanti", "Western", "Northern"
  
  // Eligibility
  educationLevel?: string; // e.g. "Undergraduate", "Masters", "SHS Graduate", "Any"
  fieldOfStudy?: string;
  experienceLevel?: string; // e.g. "Entry Level", "Mid Level", "Student"
  ageRequirement?: string;
  nationality?: string; // e.g. "Ghanaian citizens only", "All nationalities"
  
  // Benefits
  fundingType?: string; // e.g. "Fully Funded", "Tuition Only", "Paid", "Unpaid Stipend"
  funding?: string;
  tuition?: string;
  accommodation?: string;
  stipend?: string;
  travel?: string;
  otherBenefits?: string;
  benefits: string[];
  
  // Media & Attachments
  imageUrl?: string;
  imagePath?: string;
  imageSourceUrl?: string;
  imageSourceName?: string;

  // Application
  requirements: string[];
  documentsRequired?: string[];
  applicationUrl: string;
  applicationMethod: 'online_form' | 'email' | 'external_portal' | 'in_person';
  deadline: string; // ISO date string or formatted date
  
  // Verification & Editorial
  sourceUrl?: string;
  status: OpportunityStatus;
  verificationStatus: VerificationStatus;
  lastVerifiedAt?: string;
  verificationNotes?: string;
  
  // Audit & Authorship
  createdByEmail?: string;
  createdByName?: string;
  lastEditedByEmail?: string;
  lastEditedByName?: string;
  verifiedByEmail?: string;
  publishedByEmail?: string;
  publishedAt?: string;
  closedAt?: string;
  archivedAt?: string;

  createdAt: string;
  updatedAt: string;
  views?: number;
  saves?: number;
  featured?: boolean;
  featuredInSlideshow?: boolean;
  slideshowPriority?: number;
}

export type ResourceType =
  | 'course'
  | 'certification'
  | 'training'
  | 'bootcamp'
  | 'workshop'
  | 'event'
  | 'learning_resource';

export type ResourceCategory =
  | 'Technology'
  | 'Business'
  | 'Finance'
  | 'Healthcare'
  | 'Engineering'
  | 'Agriculture'
  | 'Marketing'
  | 'Design'
  | 'Data'
  | 'Cybersecurity'
  | 'AI'
  | 'Education'
  | 'Entrepreneurship'
  | 'Professional Development';

export interface Resource {
  id: string;
  title: string;
  slug: string;
  description: string;
  providerId: string;
  providerName?: string;
  providerLogo?: string;
  resourceType: ResourceType;
  category: ResourceCategory | string;
  subcategory?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  format: 'Self-paced Online' | 'Live Online' | 'In-person' | 'Hybrid';
  location?: string;
  duration: string;
  cost: number;
  currency: string;
  isFree: boolean;
  hasCertificate: boolean;
  financialAid?: boolean;
  skills: string[];
  prerequisites?: string[];
  enrollmentUrl: string;
  imageUrl?: string;
  imagePath?: string;
  
  // Verification & Editorial
  sourceUrl?: string;
  status: OpportunityStatus;
  verificationStatus?: VerificationStatus;
  lastVerifiedAt?: string;
  verificationNotes?: string;
  
  // Audit & Authorship
  createdByEmail?: string;
  createdByName?: string;
  createdByUserId?: string;
  isUserSubmitted?: boolean;
  submissionStatus?: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  rejectionReason?: string;
  submittedAt?: string;
  contactInfo?: string;
  lastEditedByEmail?: string;
  lastEditedByName?: string;
  verifiedByEmail?: string;
  publishedByEmail?: string;
  publishedAt?: string;

  createdAt: string;
  updatedAt: string;
  views: number;
  saves: number;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  relatedSkills: string[];
  createdAt: string;
  updatedAt: string;
  demandLevel?: 'High' | 'Very High' | 'Growing' | 'Stable';
  topCareers?: string[];
}

export interface Submission {
  id: string;
  type: 'opportunity' | 'resource' | 'organization';
  title: string;
  organizationName: string;
  submittedByEmail: string;
  submittedByName: string;
  data: Partial<Opportunity | Resource | Organization>;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentReport {
  id: string;
  targetType: 'opportunity' | 'resource';
  targetId: string;
  targetTitle: string;
  reason: 'expired' | 'broken_link' | 'incorrect_info' | 'suspected_scam' | 'duplicate' | 'other';
  details: string;
  reportedBy?: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AlertSubscription {
  id: string;
  userId?: string;
  email: string;
  phone?: string;
  whatsappEnabled?: boolean;
  categories: string[];
  regions: string[];
  frequency: 'instant' | 'daily' | 'weekly';
  createdAt: string;
  active: boolean;
}

export interface PipelineMetrics {
  totalOpportunities: number;
  publishedCount: number;
  draftCount: number;
  pendingReviewCount: number;
  needsVerificationCount: number;
  closingSoonCount: number;
  closedCount: number;
  totalResources: number;
  pendingResourceSubmissions: number;
  totalUsers: number;
  totalOrganizations: number;
  pendingSubmissionsCount: number;
  openReportsCount: number;
}

export interface AuditLogEntry {
  id: string;
  entityType: 'opportunity' | 'resource' | 'organization' | 'submission';
  entityId: string;
  entityTitle: string;
  action:
    | 'created'
    | 'updated'
    | 'verified'
    | 'published'
    | 'unpublished'
    | 'closed'
    | 'archived'
    | 'duplicated'
    | 'deleted'
    | 'bulk_action';
  performedByEmail: string;
  performedByName: string;
  timestamp: string;
  details?: string;
  changesSummary?: string;
  previousStatus?: string;
  newStatus?: string;
}

export interface DuplicateMatch {
  existingItem: Opportunity;
  confidence: number; // 0 - 100
  reasons: string[];
}
