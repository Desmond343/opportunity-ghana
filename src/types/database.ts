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

export type OpportunityStatus = 'draft' | 'pending_review' | 'verified' | 'published' | 'closed' | 'archived' | 'pending' | 'approved' | 'rejected';
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
  locationType?: 'ghana' | 'abroad' | 'online' | string;
  country: string;
  destinationCountry?: string;
  region: string; // e.g. "Greater Accra", "Ashanti", "Western", "Northern"
  
  // Eligibility
  eligibleCountries?: string[];
  isGhanaEligible?: boolean;
  educationLevel?: string; // e.g. "Undergraduate", "Masters", "SHS Graduate", "Any"
  fieldOfStudy?: string;
  experienceLevel?: string; // e.g. "Entry Level", "Mid Level", "Student"
  ageRequirement?: string;
  nationality?: string; // e.g. "Ghanaian citizens only", "All nationalities"
  
  // Specific Job & Internship Metadata
  workArrangement?: 'On-site' | 'Hybrid' | 'Remote' | string;
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Temporary' | 'Freelance' | 'Graduate Programme' | string;
  internshipType?: 'Paid' | 'Unpaid' | 'Not Specified' | string;
  salary?: string;
  salaryCurrency?: string;
  salaryFrequency?: 'monthly' | 'yearly' | 'hourly' | 'project' | string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  skills?: string[];
  responsibilities?: string[];
  visaSupport?: string;
  relocationSupport?: string;
  employerWebsite?: string;
  isDeadlineSpecified?: boolean;

  // Benefits
  fundingType?: string; // e.g. "Fully Funded", "Tuition Only", "Paid", "Unpaid Stipend", "Grant"
  fundingAmount?: string;
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
  imageLicense?: string;

  // Application
  requirements: string[];
  documentsRequired?: string[];
  applicationUrl: string;
  officialApplicationUrl?: string;
  applicationMethod: 'online_form' | 'email' | 'external_portal' | 'in_person';
  applicationInstructions?: string;
  deadline: string; // ISO date string or formatted date
  deadlineAt?: string; // Optional precise timestamp
  deadlineTimezone?: string; // e.g. 'GMT', 'UTC', 'Africa/Accra'
  openingDate?: string;
  academicYear?: string;
  studyLevel?: string;
  fundingDetails?: string;
  
  // Verification & Editorial
  sourceName?: string;
  sourceUrl?: string;
  sourceLastChecked?: string;
  status: OpportunityStatus;
  verificationStatus: VerificationStatus;
  lastVerifiedAt?: string;
  verificationNotes?: string;
  verifiedBy?: string;
  isResearchDiscovered?: boolean;
  researchRunId?: string;

  // User Submission & Moderation Fields
  submittedBy?: string;
  submittedByName?: string;
  submittedByEmail?: string;
  submittedByUserId?: string;
  createdByUserId?: string;
  isUserSubmitted?: boolean;
  submissionStatus?: SubmissionStatus;
  submittedAt?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactInfo?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewedByEmail?: string;
  rejectionReason?: string;
  adminNotes?: string;
  
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

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export type CourseCostType =
  | 'free'
  | 'free_to_audit'
  | 'free_with_paid_certificate'
  | 'paid';

export type CertificateType =
  | 'Included Free'
  | 'Optional Paid Certificate'
  | 'Professional Certification'
  | 'Digital Skill Badge'
  | 'Statement of Participation'
  | 'Certificate of Completion'
  | 'None';

export interface Resource {
  id: string;
  title: string;
  slug: string;
  description: string;
  providerId: string;
  providerName?: string;
  providerLogo?: string;
  providerWebsiteUrl?: string;
  providerWebsite?: string;
  resourceType: ResourceType;
  category: ResourceCategory | string;
  subcategory?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels' | 'Not specified';
  format: 'Self-paced Online' | 'Live Online' | 'In-person' | 'Hybrid' | 'Recorded' | 'Cohort-based';
  location?: string;
  duration: string;
  estimatedWorkload?: string;
  cost: number;
  currency: string;
  isFree: boolean;
  costType?: CourseCostType;
  costDescription?: string;
  pricingFrequency?: 'one-time' | 'monthly' | 'annual' | 'free';
  freeStatus?: string;
  hasCertificate: boolean;
  certificateType?: CertificateType;
  certificateStatus?: string;
  certificateCost?: string;
  financialAid?: boolean;
  financialAidUrl?: string;
  startDate?: string;
  endDate?: string;
  enrollmentDeadline?: string;
  enrollmentNotes?: string;
  assessmentMethod?: string;
  geographicRestrictions?: string;
  requiredSoftware?: string;
  skills: string[];
  prerequisites?: string[];
  whoIsThisFor?: string[];
  whatYouWillLearn?: string[];
  learningOutcomes?: string[];
  enrollmentUrl: string;
  courseUrl?: string;
  officialCourseUrl?: string;
  language?: string;
  subtitles?: string[] | string;
  ghanaAccessibility?: string;
  accreditationNotes?: string;
  imageUrl?: string;
  imagePath?: string;
  imageSourceUrl?: string;
  imageSourceName?: string;

  // Pricing & Accessibility Details
  pricingModel?: 'one-time' | 'monthly' | 'subscription' | 'annual' | 'per-course' | 'per-exam' | 'free';
  targetAudience?: string;
  paymentNotes?: string;
  accessGhanaNotes?: string;
  
  // Verification & Editorial
  sourceUrl?: string;
  status: OpportunityStatus | SubmissionStatus;
  verificationStatus?: VerificationStatus;
  lastVerifiedAt?: string;
  lastPriceVerifiedAt?: string;
  verificationNotes?: string;
  
  // User Submission & Moderation Fields
  submittedBy?: string; // Authenticated user UID
  submittedByName?: string;
  submittedByEmail?: string;
  contactEmail?: string;
  contactPhone?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  adminNotes?: string;

  // Audit & Authorship
  createdByEmail?: string;
  createdByName?: string;
  createdByUserId?: string;
  isUserSubmitted?: boolean;
  submissionStatus?: 'pending' | 'approved' | 'rejected' | 'changes_requested';
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

export type SkillStatus = 'published' | 'pending' | 'review' | 'rejected' | 'archived';
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
export type SkillDemandLevel = 'High' | 'Very High' | 'Growing' | 'Stable';

export interface SkillLearningResource {
  title: string;
  provider: string;
  url: string;
  isFree?: boolean;
  type?: string;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  detailedDescription?: string;
  level?: SkillLevel;
  demandLevel?: SkillDemandLevel;
  whatItIsUsedFor?: string[];
  whyUsefulInGhana?: string;
  careerOpportunities?: string[];
  topCareers?: string[];
  relatedJobs?: string[];
  industries?: string[];
  prerequisites?: string[];
  toolsAndSoftware?: string[];
  relatedSkills: string[];
  certifications?: string[];
  practicalProjects?: string[];
  learningResources?: SkillLearningResource[];
  source?: string;
  sourceUrl?: string;
  verificationStatus?: 'verified' | 'official' | 'partner';
  lastVerifiedAt?: string;
  imageUrl?: string;
  imageAlt?: string;
  status?: SkillStatus;
  views?: number;
  saves?: number;
  isCustom?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  type: 'opportunity' | 'resource' | 'organization';
  title: string;
  organizationName: string;
  submittedByEmail: string;
  submittedByName: string;
  submittedByUserId?: string;
  category?: string;
  location?: string;
  data: Partial<Opportunity | Resource | Organization>;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedByEmail?: string;
  reviewedAt?: string;
  publishedAt?: string;
  rejectionReason?: string;
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
  regions?: string[];
  frequency: 'instant' | 'daily' | 'weekly';
  status: 'active' | 'unsubscribed';
  active: boolean;
  source?: string;
  lastAlertSentAt?: string | null;
  lastAlertTitle?: string | null;
  alertsCount?: number;
  unsubscribedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AlertSubscriberMetrics {
  total: number;
  active: number;
  unsubscribed: number;
  newThisMonth: number;
  newThisWeek: number;
}

export type SuccessStoryStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';

export interface SuccessStory {
  id: string;
  slug: string;
  title: string;
  storytellerName: string;
  personName?: string;
  storytellerRole?: string;
  personRoleOrTitle?: string;
  storytellerAvatar?: string;
  imageUrl?: string;
  imagePath?: string;
  benefitedOpportunityTitle: string;
  opportunityBenefitedFrom?: string;
  benefitedOpportunityId?: string;
  opportunityId?: string;
  opportunitySlug?: string;
  opportunityCategory?: string;
  institutionOrCareer?: string;
  institutionOrCareerInfo?: string;
  location?: string;
  year?: string;
  quote?: string;
  summary?: string;
  content: string;
  storyContent?: string;
  keyTakeaways?: string[];
  keyAdvice?: string;
  status: SuccessStoryStatus;
  isFeatured?: boolean;
  featured?: boolean;
  publishedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  verificationStatus?: 'verified' | 'needs_verification' | 'warning' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface SuccessStoryMetrics {
  total: number;
  published: number;
  draft: number;
  pending: number;
  rejected: number;
  archived: number;
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
  successStoriesMetrics?: SuccessStoryMetrics;
}

export interface AuditLogEntry {
  id: string;
  entityType: 'opportunity' | 'resource' | 'organization' | 'submission' | 'success_story' | 'alert_subscribers';
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
    | 'bulk_action'
    | 'exported';
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
