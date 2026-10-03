import { Institution, InstitutionFilterOptions } from '../../types/institution';
import { PUBLIC_UNIVERSITIES } from './publicUniversities';
import { TECHNICAL_UNIVERSITIES } from './technicalUniversities';
import { PRIVATE_AND_COLLEGES } from './privateAndColleges';

export const ALL_INSTITUTIONS: Institution[] = [
  ...PUBLIC_UNIVERSITIES,
  ...TECHNICAL_UNIVERSITIES,
  ...PRIVATE_AND_COLLEGES,
];

export function getInstitutionBySlug(slug: string): Institution | undefined {
  if (!slug) return undefined;
  const normalized = slug.trim().toLowerCase();
  return ALL_INSTITUTIONS.find(
    (inst) => inst.slug.toLowerCase() === normalized || inst.id.toLowerCase() === normalized
  );
}

export function getFeaturedInstitutions(): Institution[] {
  return ALL_INSTITUTIONS.filter((inst) => inst.isFeatured);
}

export const GHANA_REGIONS = [
  'All Regions',
  'Greater Accra',
  'Ashanti',
  'Central',
  'Eastern',
  'Western',
  'Northern',
  'Volta',
  'Bono',
  'Upper East',
  'Upper West',
  'Western North',
  'Ahafo',
  'Bono East',
  'Oti',
  'North East',
  'Savannah',
] as const;

export const INSTITUTION_TYPES = [
  'All Types',
  'Public Traditional University',
  'Public Technical University',
  'Chartered Private University',
  'Private University College',
  'Public College of Education',
  'Public Nursing & Health Training College',
  'Public Professional & Specialised Institution',
] as const;

export function filterInstitutions(
  institutions: Institution[],
  filters: Partial<InstitutionFilterOptions>
): Institution[] {
  return institutions.filter((inst) => {
    // 1. Text Search
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = inst.name.toLowerCase().includes(q);
      const matchShort = inst.shortName.toLowerCase().includes(q);
      const matchCity = inst.location.city.toLowerCase().includes(q);
      const matchRegion = inst.location.region.toLowerCase().includes(q);
      const matchProg = inst.programmesSummary.featuredProgrammes.some((p) =>
        p.name.toLowerCase().includes(q)
      );
      if (!matchName && !matchShort && !matchCity && !matchRegion && !matchProg) {
        return false;
      }
    }

    // 2. Type filter
    if (filters.institutionType && filters.institutionType !== 'All Types') {
      if (inst.institutionType !== filters.institutionType) {
        return false;
      }
    }

    // 3. Region filter
    if (filters.region && filters.region !== 'All Regions') {
      if (inst.location.region !== filters.region && !inst.location.region.includes(filters.region)) {
        return false;
      }
    }

    // 4. Admission Status
    if (filters.admissionStatus && filters.admissionStatus !== 'All') {
      if (inst.overallAdmissionStatus !== filters.admissionStatus) {
        return false;
      }
    }

    // 5. Accreditation Status
    if (filters.accreditationStatus && filters.accreditationStatus !== 'All') {
      if (inst.accreditationStatus !== filters.accreditationStatus) {
        return false;
      }
    }

    return true;
  });
}
