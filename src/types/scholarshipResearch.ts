import { Opportunity, VerificationStatus, OpportunityStatus } from './database';

export interface ScholarshipResearchParams {
  studyLevel?: 'all' | 'undergraduate' | 'masters' | 'phd' | 'fellowship';
  providerFocus?: 'all' | 'government' | 'universities' | 'foundations' | 'international';
  query?: string;
  maxResults?: number;
}

export interface ScholarshipResearchRun {
  id: string;
  startedAt: string;
  completedAt?: string;
  triggeredByEmail: string;
  triggeredByName: string;
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

export interface DiscoveredScholarshipCandidate {
  id: string;
  title: string;
  slug: string;
  providerName: string;
  providerType: 'government' | 'university' | 'foundation' | 'international' | 'bilateral';
  category: 'Scholarships';
  studyLevel: 'Undergraduate' | 'Master\'s' | 'PhD' | 'Postdoctoral' | 'Fellowship' | 'Research' | 'All Levels';
  fieldOfStudy: string;
  description: string;
  location: string;
  country: string;
  
  // Eligibility
  ghanaEligibilityConfirmed: boolean;
  eligibilityDescription: string;
  nationality: string;
  academicRequirements: string[];
  workExperienceRequired?: string;
  ageRequirement?: string;

  // Funding Breakdown
  fundingType: 'Fully Funded' | 'Partially Funded' | 'Tuition Waiver' | 'Stipend Only' | 'Research Grant';
  fundingDetails: string;
  benefits: string[];
  tuition?: string;
  stipend?: string;
  travel?: string;
  accommodation?: string;

  // Deadlines & Dates
  openingDate?: string;
  deadline: string; // ISO date or verified formatted string
  isDeadlineVerified: boolean;
  academicYear: string; // e.g. "2026/2027"

  // Application & Sources
  officialApplicationUrl: string;
  applicationInstructions: string;
  documentsRequired: string[];
  
  // Source Traceability (Strict Tier 1 / Tier 2)
  sourceName: string;
  sourceUrl: string;
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
}

export interface RecheckSummary {
  checkedCount: number;
  activeCount: number;
  closedCount: number;
  flaggedCount: number;
  timestamp: string;
  updatedItems: Array<{
    id: string;
    title: string;
    previousStatus: string;
    newStatus: string;
    reason: string;
  }>;
}
