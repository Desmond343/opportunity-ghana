/**
 * Opportunity Ghana - Accredited Tertiary Institutions & Admissions Directory
 * Regulatory Master: Ghana Tertiary Education Commission (GTEC)
 * In accordance with Education Regulatory Bodies Act, 2020 (Act 1023)
 */

export type InstitutionType =
  | 'Public Traditional University'
  | 'Public Technical University'
  | 'Chartered Private University'
  | 'Private University College'
  | 'Public College of Education'
  | 'Private College of Education'
  | 'Public Nursing & Health Training College'
  | 'Private Nursing & Health Training College'
  | 'Public Professional & Specialised Institution';

export type AccreditationStatus =
  | 'FULLY_ACCREDITED'
  | 'RE_ACCREDITATION_IN_PROGRESS'
  | 'INTERIM_ACCREDITATION'
  | 'UNDER_REVIEW';

export type AdmissionStatus =
  | 'OPEN'
  | 'CLOSING_SOON'
  | 'CLOSED'
  | 'UPCOMING'
  | 'NOT_YET_ANNOUNCED'
  | 'SUSPENDED'
  | 'UNKNOWN';

export type AdmissionCategoryType =
  | 'Undergraduate Regular'
  | 'Mature Applicants'
  | 'Diploma / Top-Up'
  | 'Postgraduate'
  | 'Distance / Sandwich'
  | 'International Students'
  | 'Teacher Education (PRINCOF)'
  | 'Health Training / Nursing';

export interface AdmissionFeeInfo {
  amountGHS?: number;
  amountUSD?: number;
  voucherVendor: string;
  ussdCode?: string;
  bankPartners?: string[];
  notes?: string;
  isPublished: boolean;
}

export interface ProgrammeCutOff {
  programme: string;
  degreeType: string; // 'BSc', 'BA', 'MBChB', 'LLB', 'BEd', 'BTech', 'Diploma', 'MPhil', 'MSc', etc.
  faculty: string;
  cutOffPoint?: number | string;
  academicYear: string;
  specialRequirements?: string;
  stream?: string; // 'Regular', 'Fee-paying', etc.
}

export interface AdmissionCycle {
  id: string;
  category: AdmissionCategoryType;
  academicYear: string;
  title: string;
  description: string;
  applicationOpenDate?: string; // YYYY-MM-DD
  applicationCloseDate?: string; // YYYY-MM-DD
  originalDeadline?: string;
  extendedDeadline?: string;
  isExtended?: boolean;
  status: AdmissionStatus;
  feeInfo: AdmissionFeeInfo;
  eligibility: string[];
  targetAudience: string;
  entranceExamDate?: string;
  interviewDate?: string;
  applicationPortalUrl: string;
  notes?: string;
}

export interface Institution {
  id: string;
  slug: string;
  name: string;
  shortName: string; // e.g. 'UG', 'KNUST', 'ATU', 'AcCE'
  institutionType: InstitutionType;
  logoUrl?: string;
  coverImageUrl?: string;
  badgeColor?: string;

  // Accreditation Information (GTEC master)
  accreditationStatus: AccreditationStatus;
  accreditingBody: string; // 'Ghana Tertiary Education Commission (GTEC)', plus 'Nursing and Midwifery Council (NMC)', etc.
  accreditationDetails: string;
  accreditationStartDate?: string;
  accreditationExpiryDate?: string;
  isChartered: boolean;
  presidentialCharterYear?: number;
  affiliatedTo?: string; // e.g., for Colleges of Education affiliated to UCC/UEW/UG

  // Location & Campus
  location: {
    region: string;
    city: string;
    townOrSubCity?: string;
    campus: string;
    address: string;
    postalAddress?: string;
    gpsDigitalAddress?: string; // GhanaPost GPS
  };

  // Contact Information
  contact: {
    mainPhone: string[];
    admissionsPhone: string[];
    mainEmail: string[];
    admissionsEmail: string[];
    helpdesk?: string;
  };

  // URLs (Verified official sources)
  officialWebsiteUrl: string;
  admissionsPageUrl: string;
  applicationPortalUrl: string;
  programmesCatalogueUrl?: string;

  // Overall Admission State
  overallAdmissionStatus: AdmissionStatus;
  primaryAcademicYear: string;
  highlightNotice?: string; // Important applicant warnings e.g. "Fraud Warning: Do not pay individuals"

  // Multiple Deadlines & Cycles
  admissionCycles: AdmissionCycle[];

  // Programmes
  programmesSummary: {
    undergraduateCount?: number;
    postgraduateCount?: number;
    diplomaCount?: number;
    faculties: string[];
    featuredProgrammes: Array<{
      name: string;
      level: 'Undergraduate' | 'Postgraduate' | 'Diploma' | 'HND' | 'Certificate';
      faculty: string;
      durationYears: number;
    }>;
  };

  // Entry Requirements
  entryRequirements: {
    generalWassce: string[];
    matureApplicants: string[];
    diplomaHndHolders: string[];
    internationalApplicants: string[];
    postgraduateApplicants?: string[];
    specialNotes: string[];
    requirementsVaryByProgramme: boolean;
  };

  // Cut-off points
  publishedCutOffs: ProgrammeCutOff[];

  // Application Guide
  applicationSteps: string[];
  requiredDocuments: string[];

  // Metadata
  verifiedBy: string;
  verifiedDate: string;
  lastUpdated: string;
  isFeatured?: boolean;
}

export interface InstitutionFilterOptions {
  searchQuery: string;
  institutionType: string;
  region: string;
  admissionStatus: string;
  accreditationStatus: string;
  degreeLevel?: string;
  sortBy: 'name' | 'deadline' | 'region' | 'type';
}
