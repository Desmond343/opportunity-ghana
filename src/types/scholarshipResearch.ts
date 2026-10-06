import { Opportunity, VerificationStatus, OpportunityStatus } from './database';

export type UniversalCategory =
  | 'All'
  | 'Scholarships'
  | 'Grants'
  | 'Internships'
  | 'Jobs'
  | 'Admissions'
  | 'Fellowships'
  | 'Competitions'
  | 'Training'
  | 'Courses'
  | 'Study Abroad'
  | 'Exchange Programmes'
  | 'Research'
  | 'Volunteering'
  | 'Conferences'
  | 'Bootcamps'
  | 'Apprenticeships'
  | 'Other';

export type GhanaEligibilityStatus = 'Confirmed' | 'Not Eligible' | 'Unknown';

export interface UniversalResearchParams {
  category?: UniversalCategory | string;
  studyLevel?: 'all' | 'undergraduate' | 'masters' | 'phd' | 'fellowship' | 'entry_level' | 'mid_level' | 'student' | string;
  providerFocus?: 'all' | 'government' | 'universities' | 'foundations' | 'corporate' | 'international' | string;
  eligibilityFilter?: 'all' | 'confirmed' | 'unknown';
  query?: string;
  maxResults?: number;
}

export interface UniversalResearchRun {
  id: string;
  startedAt: string;
  completedAt?: string;
  triggeredByEmail: string;
  triggeredByName: string;
  category?: string;
  query: string;
  studyLevelFilter: string;
  providerFocus: string;
  sourcesChecked: string[];
  opportunitiesFound: number;
  opportunitiesCreated: number;
  opportunitiesUpdated: number;
  opportunitiesFlagged: number;
  status: 'running' | 'completed' | 'failed';
  error?: string;
}

export interface DiscoveredOpportunityCandidate {
  id: string;
  title: string;
  slug: string;
  providerName: string;
  providerType: 'government' | 'university' | 'foundation' | 'international' | 'corporate' | 'ngo' | 'bilateral';
  category: UniversalCategory | string;
  subcategory?: string;
  studyLevel?: 'Undergraduate' | 'Master\'s' | 'PhD' | 'Postdoctoral' | 'Fellowship' | 'Research' | 'All Levels' | string;
  fieldOfStudy?: string;
  description: string;
  location: string;
  country: string;
  destinationCountry?: string;
  region?: string;
  
  // Ghana Eligibility
  ghanaEligibilityConfirmed: boolean;
  ghanaEligibilityStatus: GhanaEligibilityStatus;
  eligibilityDescription: string;
  nationality?: string;
  eligibleCountries?: string[];
  academicRequirements?: string[];
  requirements?: string[];
  workExperienceRequired?: string;
  ageRequirement?: string;

  // Funding & Compensation
  fundingType: string;
  fundingAmount?: string;
  fundingDetails: string;
  benefits: string[];
  salary?: string;
  tuition?: string;
  stipend?: string;
  travel?: string;
  accommodation?: string;

  // Deadlines & Dates
  openingDate?: string;
  deadline: string; // ISO date string YYYY-MM-DD or ISO timestamp
  isDeadlineVerified: boolean;
  academicYear?: string;

  // Application & Separate Sources
  officialApplicationUrl: string; // Official portal link
  applicationInstructions: string;
  documentsRequired?: string[];
  
  // Source Traceability
  sourceName: string;
  sourceUrl: string; // Official announcement link
  sourceTier: 'tier1_official_provider' | 'tier2_government_education' | 'tier3_verified_secondary';
  sourceLastChecked: string;

  // Media & Rights
  imageUrl?: string;
  imageSourceUrl?: string;
  imageSourceName?: string;
  imageLicense?: string;
  isImageVerified: boolean;

  // Quality Control & Verification
  verificationStatus: VerificationStatus;
  qualityScore: number; // 0-100
  qualityFlags: Array<{
    id: string;
    type: 'deadline_alert' | 'url_warning' | 'eligibility_note' | 'info';
    label: string;
    severity: 'critical' | 'warning' | 'info';
    description: string;
  }>;
  duplicateStatus: 'new' | 'existing_match' | 'cycle_update';
  matchedExistingId?: string;

  // Editorial
  verificationNotes: string;
  status: OpportunityStatus;
  researchRunId: string;
  createdAt: string;
  publishedAt?: string;
  publishedSlug?: string;
  publishedOpportunityId?: string;
}

// Backward-compatibility aliases
export type DiscoveredScholarshipCandidate = DiscoveredOpportunityCandidate;
export type ScholarshipResearchParams = UniversalResearchParams;
export type ScholarshipResearchRun = UniversalResearchRun;

export interface RecheckSummary {
  checkedCount: number;
  activeCount: number;
  closedCount: number;
  flaggedCount: number;
  timestamp: string;
  updatedItems: Array<{
    id: string;
    title: string;
    previousStatus: OpportunityStatus;
    newStatus: OpportunityStatus;
    deadline: string;
  }>;
}
