import { Opportunity, VerificationStatus, OpportunityStatus } from './database';

export interface CompetitionResearchParams {
  categoryFocus?:
    | 'all'
    | 'talent_shows'
    | 'music_singing'
    | 'dance'
    | 'acting_theatre'
    | 'poetry_comedy'
    | 'creative_arts_film'
    | 'fashion_beauty'
    | 'sports'
    | 'esports_gaming'
    | 'tech_hackathons'
    | 'business_pitch'
    | 'academic_quizzes'
    | 'science_research'
    | 'agriculture_environment'
    | 'youth_social_impact';
  regionFocus?: 'all' | 'Greater Accra' | 'Ashanti' | 'Northern' | 'Central' | 'Western' | 'Nationwide' | 'Online';
  query?: string;
  maxResults?: number;
}

export interface CompetitionResearchRun {
  id: string;
  startedAt: string;
  completedAt?: string;
  triggeredByEmail: string;
  triggeredByName: string;
  query: string;
  categoryFilter: string;
  regionFilter: string;
  sourcesChecked: string[];
  opportunitiesFound: number;
  opportunitiesCreated: number;
  opportunitiesUpdated: number;
  opportunitiesFlagged: number;
  status: 'running' | 'completed' | 'failed';
  error?: string;
}

export interface DiscoveredCompetitionCandidate {
  id: string;
  title: string;
  slug: string;
  organizerName: string;
  organizerLogo?: string;
  organizerWebsite?: string;
  category: 'Competitions';
  subcategory: string; // e.g. "Talent Shows", "Technology & Hackathons", "Sports", etc.
  competitionType: string; // e.g. "Talent Show", "Hackathon", "National Tournament", "Pitch Competition"
  description: string;
  location: string;
  region: string;
  locationType: 'physical' | 'online' | 'hybrid' | 'nationwide';
  country: string;

  // Eligibility
  ghanaEligibilityConfirmed: boolean;
  eligibilityDescription: string;
  nationality: string;
  ageRange?: string;
  educationLevel?: string;
  experienceLevel?: string;
  profession?: string;
  teamOrIndividual: 'Individual' | 'Team' | 'Pair or Group' | 'Any';
  teamSize?: string;
  requirements: string[];

  // Financial & Prizes
  entryFee: string; // e.g. "Free ($0 GHS)", "No Entry Fee"
  prize: string; // e.g. "GH₵ 100,000 Cash Prize + Recording Contract"
  cashPrize?: string;
  benefits: string[];

  // Talent Show & Performance Specific Data
  isTalentShow?: boolean;
  talentType?: string; // e.g. "Singing", "Dance", "Rap / Freestyle", "Acting", "General Variety"
  auditionDates?: string;
  auditionLocation?: string;
  selectionProcess?: string;
  performanceRequirements?: string;
  tvOrRadioBroadcaster?: string;

  // Deadlines & Dates
  registrationOpeningDate?: string;
  deadline: string; // ISO date string e.g. "2026-11-30T23:59:59Z"
  isDeadlineVerified: boolean;
  competitionDates?: string;
  finalVenue?: string;

  // Application & Sources
  officialApplicationUrl: string;
  applicationInstructions: string;
  documentsRequired?: string[];

  // Source Traceability
  sourceName: string;
  sourceUrl: string;
  sourceTier: 'tier1_official_organizer' | 'tier2_government_institution' | 'tier3_verified_broadcast_media';
  sourceLastChecked: string;

  // Media & Rights
  imageUrl: string;
  imageAlt?: string;
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

export interface CompetitionRecheckSummary {
  checkedCount: number;
  activeCount: number;
  closedCount: number;
  flaggedCount: number;
  timestamp: string;
  updatedItems: Array<{
    id: string;
    title: string;
    oldStatus: string;
    newStatus: string;
    reason: string;
  }>;
}
