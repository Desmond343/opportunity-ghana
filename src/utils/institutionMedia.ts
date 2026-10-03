import { Institution } from '../types/institution';

export interface InstitutionMedia {
  url: string;
  alt: string;
  position: string;
}

/**
 * Curated high-resolution photographs of African university students,
 * tertiary scholars, and collegiate environments across Ghana.
 * Positions are tailored so human subjects are prominently visible in the upper card area.
 * All images feature authentic Black African and Ghanaian university students in higher education.
 */
const INSTITUTION_MEDIA_MAP: Record<string, InstitutionMedia> = {
  // 1. University of Ghana (UG Legon)
  'inst-ug-legon': {
    url: '/images/institutions/ghana_campus_students.jpg',
    alt: 'African university students walking on campus grounds',
    position: 'center 20%',
  },
  // 2. Kwame Nkrumah University of Science and Technology (KNUST)
  'inst-knust-kumasi': {
    url: '/images/institutions/ghana_tech_students.jpg',
    alt: 'African university students collaborating with laptops in modern study hall',
    position: 'center 20%',
  },
  // 3. University of Cape Coast (UCC)
  'inst-ucc-capecoast': {
    url: '/images/institutions/ghana_seminar_students.jpg',
    alt: 'African university scholars in academic seminar lecture discussion',
    position: 'center 20%',
  },
  // 4. University of Education, Winneba (UEW)
  'inst-uew-winneba': {
    url: '/images/institutions/ghana_seminar_students.jpg',
    alt: 'African educators and university scholars in academic lecture hall',
    position: 'center 20%',
  },
  // 5. University for Development Studies (UDS)
  'inst-uds-tamale': {
    url: '/images/institutions/ghana_campus_students.jpg',
    alt: 'African university students on campus grounds',
    position: 'center 20%',
  },
  // 6. University of Mines and Technology (UMaT)
  'inst-umat-tarkwa': {
    url: '/images/institutions/ghana_tech_students.jpg',
    alt: 'African engineering and technology university students in workshop',
    position: 'center 20%',
  },
  // 7. University of Energy and Natural Resources (UENR)
  'inst-uenr-sunyani': {
    url: '/images/institutions/ghana_tech_students.jpg',
    alt: 'African scholars engaged in scientific research and learning',
    position: 'center 20%',
  },
  // 8. University of Health and Allied Sciences (UHAS)
  'inst-uhas-ho': {
    url: '/images/institutions/ghana_health_students.jpg',
    alt: 'African medical and healthcare university students in academic training',
    position: 'center 20%',
  },
  // 9. Simon Diedong Dombo UBIDS
  'inst-sd-dombo-ubids': {
    url: '/images/institutions/ghana_campus_students.jpg',
    alt: 'African university students in higher education academic setting',
    position: 'center 20%',
  },
  // 10. C.K. Tedam University of Technology and Applied Sciences
  'inst-csk-cktdut': {
    url: '/images/institutions/ghana_tech_students.jpg',
    alt: 'African university students in applied science and technology setting',
    position: 'center 20%',
  },
  // 11. Accra Technical University (ATU)
  'inst-atu-accra': {
    url: '/images/institutions/ghana_tech_students.jpg',
    alt: 'African technical university students in engineering workshop',
    position: 'center 20%',
  },
  // 12. Kumasi Technical University (KsTU)
  'inst-kstu-kumasi': {
    url: '/images/institutions/ghana_tech_students.jpg',
    alt: 'African university students in applied technology laboratory',
    position: 'center 20%',
  },
  // 13. Takoradi Technical University (TTU)
  'inst-ttu-takoradi': {
    url: '/images/institutions/ghana_campus_students.jpg',
    alt: 'African university students on collegiate campus grounds',
    position: 'center 20%',
  },
  // 14. Ho Technical University (HTU)
  'inst-htu-ho': {
    url: '/images/institutions/ghana_tech_students.jpg',
    alt: 'African technical university students working with computer systems',
    position: 'center 20%',
  },
  // 15. Cape Coast Technical University (CCTU)
  'inst-ctu-capecoast': {
    url: '/images/institutions/ghana_campus_students.jpg',
    alt: 'African university students walking on collegiate grounds',
    position: 'center 20%',
  },
  // 16. Koforidua Technical University (KTU)
  'inst-kstu-koforidua': {
    url: '/images/institutions/ghana_tech_students.jpg',
    alt: 'African university students engaged in collaborative technical coursework',
    position: 'center 20%',
  },
  // 17. Ashesi University
  'inst-ashesi-berekuso': {
    url: '/images/ghana_student_workspace.jpg',
    alt: 'Young Ghanaian student with laptop in university learning workspace',
    position: 'center 20%',
  },
  // 18. Central University
  'inst-central-miteco': {
    url: '/images/institutions/ghana_graduates_celebrate.jpg',
    alt: 'Ghanaian university graduates celebrating academic convocation milestone',
    position: 'center 20%',
  },
  // 19. Valley View University
  'inst-vvu-oyibi': {
    url: '/images/institutions/ghana_campus_students.jpg',
    alt: 'African university students on campus lawn',
    position: 'center 20%',
  },
  // 20. Accra College of Education
  'inst-accra-coe': {
    url: '/images/institutions/ghana_seminar_students.jpg',
    alt: 'African student teachers and education scholars in academic seminar',
    position: 'center 20%',
  },
  // 21. Korle-Bu Nursing and Midwifery Training College
  'inst-korlebu-nmc': {
    url: '/images/institutions/ghana_health_students.jpg',
    alt: 'African nursing and healthcare students in clinical medical training',
    position: 'center 20%',
  },
};

/**
 * Fallback pool of high-resolution authentic African university students photos
 * for any newly added or custom institutions.
 */
const AFRICAN_STUDENTS_VARIETY_POOL: InstitutionMedia[] = [
  {
    url: '/images/institutions/ghana_campus_students.jpg',
    alt: 'African university students walking on campus grounds',
    position: 'center 20%',
  },
  {
    url: '/images/institutions/ghana_tech_students.jpg',
    alt: 'African university students collaborating with laptops in modern study hall',
    position: 'center 20%',
  },
  {
    url: '/images/institutions/ghana_health_students.jpg',
    alt: 'African medical and healthcare university students in academic training',
    position: 'center 20%',
  },
  {
    url: '/images/institutions/ghana_seminar_students.jpg',
    alt: 'African university scholars in academic seminar lecture discussion',
    position: 'center 20%',
  },
  {
    url: '/images/institutions/ghana_graduates_celebrate.jpg',
    alt: 'Ghanaian university graduates celebrating academic convocation milestone',
    position: 'center 20%',
  },
  {
    url: '/images/ghana_student_workspace.jpg',
    alt: 'Young Ghanaian student with laptop in university learning workspace',
    position: 'center 20%',
  },
  {
    url: '/images/ghana_hero_professionals.jpg',
    alt: 'Ghanaian tertiary scholars and university students on collegiate grounds',
    position: 'center 20%',
  },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Returns the authentic African student/human background photograph for an institution.
 * Prioritizes custom coverImageUrl if provided, then specific institution mapping,
 * then institution type matching, and finally deterministic rotation.
 */
export function getInstitutionMedia(institution: Institution): InstitutionMedia {
  // 1. Direct cover image if explicitly set
  if (institution.coverImageUrl && institution.coverImageUrl.trim().length > 0) {
    return {
      url: institution.coverImageUrl.trim(),
      alt: `${institution.name} campus and student life`,
      position: 'center 20%',
    };
  }

  // 2. Specific institution ID lookup
  if (institution.id && INSTITUTION_MEDIA_MAP[institution.id]) {
    return INSTITUTION_MEDIA_MAP[institution.id];
  }

  // 3. Institution type specific matching
  const type = institution.institutionType || '';
  if (type.includes('Nursing') || type.includes('Health')) {
    return {
      url: '/images/institutions/ghana_health_students.jpg',
      alt: 'African medical and healthcare university students in academic training',
      position: 'center 20%',
    };
  }
  if (type.includes('Technical') || type.includes('Technology')) {
    return {
      url: '/images/institutions/ghana_tech_students.jpg',
      alt: 'African technical university students in engineering workshop',
      position: 'center 20%',
    };
  }
  if (type.includes('Education') || type.includes('Teacher')) {
    return {
      url: '/images/institutions/ghana_seminar_students.jpg',
      alt: 'African student teachers and education scholars in academic seminar',
      position: 'center 20%',
    };
  }

  // 4. Deterministic fallback from variety pool based on institution slug/id
  const seed = `${institution.id || ''}-${institution.slug || institution.name}`;
  const index = hashString(seed) % AFRICAN_STUDENTS_VARIETY_POOL.length;
  return AFRICAN_STUDENTS_VARIETY_POOL[index];
}
