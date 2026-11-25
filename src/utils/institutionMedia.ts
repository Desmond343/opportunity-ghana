import { Institution } from '../types/institution';

export interface InstitutionMedia {
  url: string;
  alt: string;
  position: string;
}

/**
 * Curated 1-to-1 registry of campus, academic, and student environment photographs
 * across all 21 institutions in the GTEC Accredited Master Source Directory.
 * Every institution maps to a distinct image representing its campus and academic focus.
 */
const INSTITUTION_MEDIA_MAP: Record<string, InstitutionMedia> = {
  // 1. University of Ghana (UG Legon)
  'inst-ug-legon': {
    url: '/images/institutions/campus_legon_courtyard.jpg',
    alt: 'University of Ghana Legon historic colonnade walkways and shaded palm gardens with scholars',
    position: 'center 35%',
  },
  // 2. Kwame Nkrumah University of Science and Technology (KNUST)
  'inst-knust-kumasi': {
    url: '/images/institutions/campus_engineering_labs.jpg',
    alt: 'KNUST modern engineering campus and technology students collaborating outdoors',
    position: 'center 35%',
  },
  // 3. University of Cape Coast (UCC)
  'inst-ucc-capecoast': {
    url: '/images/institutions/campus_coastal_university.jpg',
    alt: 'University of Cape Coast coastal campus overlooking palm groves and ocean shoreline',
    position: 'center 35%',
  },
  // 4. University of Education, Winneba (UEW)
  'inst-uew-winneba': {
    url: '/images/institutions/ghana_seminar_students.jpg',
    alt: 'University of Education, Winneba students and educators in lecture seminar discussion',
    position: 'center 25%',
  },
  // 5. University for Development Studies (UDS)
  'inst-uds-tamale': {
    url: '/images/institutions/ghana_campus_students.jpg',
    alt: 'University for Development Studies scholars walking across campus grounds',
    position: 'center 25%',
  },
  // 6. University of Health and Allied Sciences (UHAS)
  'inst-uhas-ho': {
    url: '/images/institutions/campus_medical_simulation.jpg',
    alt: 'UHAS health sciences clinical skills centre and medical students on campus',
    position: 'center 35%',
  },
  // 7. University of Mines and Technology (UMaT)
  'inst-umat-tarkwa': {
    url: '/images/institutions/african_university_training_session.jpg',
    alt: 'UMaT engineering and applied earth sciences scholars in technical seminar',
    position: 'center 25%',
  },
  // 8. University of Professional Studies, Accra (UPSA)
  'inst-upsa-accra': {
    url: '/images/institutions/campus_business_law.jpg',
    alt: 'UPSA modern business school and law faculty courtyard in Accra',
    position: 'center 35%',
  },
  // 9. University of Energy and Natural Resources (UENR)
  'inst-uenr-sunyani': {
    url: '/images/institutions/ug_students_workshop.jpg',
    alt: 'UENR energy and natural resources scholars collaborating in a campus workshop',
    position: 'center 25%',
  },
  // 10. Ghana Communication Technology University (GCTU)
  'inst-gctu-accra': {
    url: '/images/institutions/african_students_computing.jpg',
    alt: 'GCTU computing and telecommunications engineering students working on systems',
    position: 'center 25%',
  },
  // 11. Accra Technical University (ATU)
  'inst-atu-accra': {
    url: '/images/institutions/ghana_tech_students.jpg',
    alt: 'Accra Technical University students collaborating with laptops in technology studio',
    position: 'center 25%',
  },
  // 12. Kumasi Technical University (KsTU)
  'inst-kstu-kumasi': {
    url: '/images/institutions/african_students_laptop_group.jpg',
    alt: 'Kumasi Technical University engineering and applied science cohort on campus',
    position: 'center 25%',
  },
  // 13. Takoradi Technical University (TTU)
  'inst-ttu-takoradi': {
    url: '/images/institutions/west_african_campus_students_1.jpg',
    alt: 'Takoradi Technical University students walking across technical campus grounds',
    position: 'center 25%',
  },
  // 14. Cape Coast Technical University (CCTU)
  'inst-cctu-capecoast': {
    url: '/images/institutions/ucc_tertiary_conference.jpg',
    alt: 'Cape Coast Technical University students at an academic and career symposium',
    position: 'center 25%',
  },
  // 15. Koforidua Technical University (KTU)
  'inst-ktu-koforidua': {
    url: '/images/institutions/ug_students_laptops.jpg',
    alt: 'Koforidua Technical University students working on computing and engineering projects',
    position: 'center 25%',
  },
  // 16. Ho Technical University (HTU)
  'inst-htu-ho': {
    url: '/images/institutions/ug_students_seminar.jpg',
    alt: 'Ho Technical University students participating in hospitality and engineering seminar',
    position: 'center 25%',
  },
  // 17. Ashesi University
  'inst-ashesi-berekuso': {
    url: '/images/institutions/ashesi_lecture_students.jpg',
    alt: 'Ashesi University scholars engaged in interactive seminar in modern campus hall',
    position: 'center 25%',
  },
  // 18. Central University
  'inst-central-accra': {
    url: '/images/institutions/ghana_graduates_celebrate.jpg',
    alt: 'Central University scholars celebrating academic excellence on campus',
    position: 'center 25%',
  },
  // 19. Ghana Institute of Management and Public Administration (GIMPA)
  'inst-gimpa-accra': {
    url: '/images/institutions/ashesi_library_students.jpg',
    alt: 'GIMPA law, governance, and executive management scholars researching in library',
    position: 'center 25%',
  },
  // 20. Public Colleges of Education (PRINCOF)
  'inst-princof-coe-ghana': {
    url: '/images/institutions/west_african_campus_students_2.jpg',
    alt: 'Public Colleges of Education teacher trainees collaborating on campus',
    position: 'center 25%',
  },
  // 21. Public Nursing and Health Training Colleges (MOH)
  'inst-moh-nursing-ghana': {
    url: '/images/institutions/african_nursing_college_students.jpg',
    alt: 'Nursing and Midwifery Training College students in clinical healthcare training',
    position: 'center 25%',
  },
};

const AFRICAN_STUDENTS_VARIETY_POOL: InstitutionMedia[] = [
  {
    url: '/images/institutions/campus_legon_courtyard.jpg',
    alt: 'Ghanaian university campus courtyard and students',
    position: 'center 35%',
  },
  {
    url: '/images/institutions/campus_engineering_labs.jpg',
    alt: 'Engineering and applied science students on campus',
    position: 'center 35%',
  },
  {
    url: '/images/institutions/ghana_campus_students.jpg',
    alt: 'African university students walking on campus grounds',
    position: 'center 25%',
  },
  {
    url: '/images/institutions/ghana_tech_students.jpg',
    alt: 'African university students collaborating with laptops in modern study hall',
    position: 'center 25%',
  },
  {
    url: '/images/institutions/ghana_health_students.jpg',
    alt: 'African medical and healthcare university students in academic training',
    position: 'center 25%',
  },
  {
    url: '/images/institutions/ghana_seminar_students.jpg',
    alt: 'African university scholars in academic seminar lecture discussion',
    position: 'center 25%',
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
 * Returns a tailored, high-resolution campus or academic photograph for each institution.
 */
export function getInstitutionMedia(institution: Institution): InstitutionMedia {
  if (institution.coverImageUrl && institution.coverImageUrl.trim().length > 0) {
    return {
      url: institution.coverImageUrl.trim(),
      alt: `${institution.name} campus and student life`,
      position: 'center 25%',
    };
  }

  if (institution.id && INSTITUTION_MEDIA_MAP[institution.id]) {
    return INSTITUTION_MEDIA_MAP[institution.id];
  }

  const type = institution.institutionType || '';
  if (type.includes('Nursing') || type.includes('Health')) {
    return {
      url: '/images/institutions/african_nursing_college_students.jpg',
      alt: 'Nursing and healthcare students in clinical training',
      position: 'center 25%',
    };
  }
  if (type.includes('Technical') || type.includes('Technology')) {
    return {
      url: '/images/institutions/campus_engineering_labs.jpg',
      alt: 'Technical university students in applied engineering environment',
      position: 'center 35%',
    };
  }
  if (type.includes('Education') || type.includes('Teacher')) {
    return {
      url: '/images/institutions/west_african_campus_students_2.jpg',
      alt: 'Teacher education scholars in academic training',
      position: 'center 25%',
    };
  }

  const seed = `${institution.id || ''}-${institution.slug || institution.name}`;
  const index = hashString(seed) % AFRICAN_STUDENTS_VARIETY_POOL.length;
  return AFRICAN_STUDENTS_VARIETY_POOL[index];
}
