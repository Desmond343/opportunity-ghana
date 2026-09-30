import { Opportunity, Resource, OpportunityCategory, ResourceCategory, ResourceType } from './database';

export interface QualityControlFlag {
  id: string;
  type:
    | 'missing_deadline'
    | 'suspicious_url'
    | 'missing_application_url'
    | 'contradictory_dates'
    | 'missing_eligibility'
    | 'potential_duplicate'
    | 'unclear_organization'
    | 'possible_outdated';
  label: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
}

export interface VerificationChecklist {
  sourceLegitimate: boolean;
  organizationIdentifiable: boolean;
  deadlineVerified: boolean;
  eligibilityVerified: boolean;
  applicationUrlVerified: boolean;
  informationCurrent: boolean;
}

export interface ExtractedAIResponse {
  detectedType: 'opportunity' | 'resource';
  confidenceScore: number;
  rawSummary: string;
  sourceUrl?: string;
  analyzedAt: string;
  qualityFlags: QualityControlFlag[];
  needsAttentionFields: string[];

  // Opportunity Extracted Fields
  opportunityData?: {
    title: string;
    organizationName: string;
    opportunityType: string;
    category: string;
    subcategory?: string;
    description: string;
    location: string;
    country: string;
    region?: string;
    educationLevel: string;
    fieldOfStudy: string;
    experienceLevel: string;
    eligibilitySummary: string;
    ageRequirement: string;
    nationality: string;
    fundingType: string;
    tuition?: string;
    accommodation?: string;
    stipend?: string;
    travel?: string;
    otherBenefits?: string;
    benefits: string[];
    requirements: string[];
    documentsRequired: string[];
    deadline: string; // ISO date string or "Not found"
    applicationUrl: string;
    sourceUrl: string;
    verificationNotes?: string;
  };

  // Resource Extracted Fields
  resourceData?: {
    title: string;
    providerName: string;
    resourceType: ResourceType;
    category: string;
    subcategory?: string;
    description: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
    format: 'Self-paced Online' | 'Live Online' | 'In-person' | 'Hybrid';
    location: string;
    duration: string;
    cost: number;
    currency: string;
    isFree: boolean;
    hasCertificate: boolean;
    financialAid: boolean;
    skills: string[];
    prerequisites: string[];
    enrollmentUrl: string;
    sourceUrl: string;
    verificationNotes?: string;
  };
}
