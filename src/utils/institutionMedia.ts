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
 */
const INSTITUTION_MEDIA_MAP: Record<string, InstitutionMedia> = {
  // 1. University of Ghana (UG Legon)
  'inst-ug-legon': {
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&auto=format&fit=crop&q=80',
    alt: 'African university scholars walking on campus grounds with books',
    position: 'center 15%',
  },
  // 2. Kwame Nkrumah University of Science and Technology (KNUST)
  'inst-knust-kumasi': {
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80',
    alt: 'African university students collaborating with laptops on campus lawn',
    position: 'center 20%',
  },
  // 3. University of Cape Coast (UCC)
  'inst-ucc-capecoast': {
    url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=900&auto=format&fit=crop&q=80',
    alt: 'University study group of African students reviewing academic coursework',
    position: 'center 22%',
  },
  // 4. University of Education, Winneba (UEW)
  'inst-uew-winneba': {
    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=900&auto=format&fit=crop&q=80',
    alt: 'African scholars and educators in academic seminar discussion',
    position: 'center 18%',
  },
  // 5. University for Development Studies (UDS)
  'inst-uds-tamale': {
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop&q=80',
    alt: 'Team of African students collaborating around university study table',
    position: 'center 20%',
  },
  // 6. University of Mines and Technology (UMaT)
  'inst-umat-tarkwa': {
    url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=900&auto=format&fit=crop&q=80',
    alt: 'African engineering and technology university student in laboratory',
    position: 'center 16%',
  },
  // 7. University of Energy and Natural Resources (UENR)
  'inst-uenr-sunyani': {
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop&q=80',
    alt: 'Young African scholar engaged in digital scientific research with laptop',
    position: 'center 18%',
  },
  // 8. University of Health and Allied Sciences (UHAS)
  'inst-uhas-ho': {
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
    alt: 'African healthcare and medical science students in university training',
    position: 'center 20%',
  },
  // 9. Simon Diedong Dombo UBIDS
  'inst-sd-dombo-ubids': {
    url: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=900&auto=format&fit=crop&q=80',
    alt: 'African university students collaborating on development studies project',
    position: 'center 18%',
  },
  // 10. C.K. Tedam University of Technology and Applied Sciences
  'inst-csk-cktdut': {
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&auto=format&fit=crop&q=80',
    alt: 'Diverse smiling African university students on modern campus grounds',
    position: 'center 20%',
  },
  // 11. Accra Technical University (ATU)
  'inst-atu-accra': {
    url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=900&auto=format&fit=crop&q=80',
    alt: 'African technical university student in engineering workshop',
    position: 'center 20%',
  },
  // 12. Kumasi Technical University (KsTU)
  'inst-kstu-kumasi': {
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=80',
    alt: 'African woman university student in applied technology lecture',
    position: 'center 15%',
  },
  // 13. Takoradi Technical University (TTU)
  'inst-ttu-takoradi': {
    url: 'https://images.unsplash.com/photo-1534644107580-3a4dbd494a95?w=900&auto=format&fit=crop&q=80',
    alt: 'Young African university scholar on collegiate campus with backpack',
    position: 'center 18%',
  },
  // 14. Ho Technical University (HTU)
  'inst-htu-ho': {
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop&q=80',
    alt: 'African technical university student working with computer software',
    position: 'center 20%',
  },
  // 15. Cape Coast Technical University (CCTU)
  'inst-ctu-capecoast': {
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&auto=format&fit=crop&q=80',
    alt: 'Young African college students smiling on university lawn',
    position: 'center 20%',
  },
  // 16. Koforidua Technical University (KTU)
  'inst-kstu-koforidua': {
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop&q=80',
    alt: 'African university students engaged in collaborative project work',
    position: 'center 18%',
  },
  // 17. Ashesi University
  'inst-ashesi-berekuso': {
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80',
    alt: 'African students collaborating with laptops at Ashesi campus',
    position: 'center 18%',
  },
  // 18. Central University
  'inst-central-miteco': {
    url: '/images/ghana_hero_professionals.jpg',
    alt: 'Ghanaian university graduates and scholars celebrating academic milestone',
    position: 'center 20%',
  },
  // 19. Valley View University
  'inst-vvu-oyibi': {
    url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=900&auto=format&fit=crop&q=80',
    alt: 'African students studying on campus lawn at Valley View University',
    position: 'center 22%',
  },
  // 20. Accra College of Education
  'inst-accra-coe': {
    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=900&auto=format&fit=crop&q=80',
    alt: 'African student teachers and education scholars in academic seminar',
    position: 'center 18%',
  },
  // 21. Korle-Bu Nursing and Midwifery Training College
  'inst-korlebu-nmc': {
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
    alt: 'African nursing and healthcare students in clinical medical training',
    position: 'center 20%',
  },
};

/**
 * Fallback pool of high-resolution African university students photos
 * for any newly added or custom institutions.
 */
const AFRICAN_STUDENTS_VARIETY_POOL: InstitutionMedia[] = [
  {
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&auto=format&fit=crop&q=80',
    alt: 'African university scholars walking on campus with books and satchels',
    position: 'center 18%',
  },
  {
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop&q=80',
    alt: 'African university students collaborating with laptops on campus lawn',
    position: 'center 20%',
  },
  {
    url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=900&auto=format&fit=crop&q=80',
    alt: 'University study group of African students studying together',
    position: 'center 22%',
  },
  {
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&auto=format&fit=crop&q=80',
    alt: 'Young African university students smiling on collegiate grounds',
    position: 'center 20%',
  },
  {
    url: '/images/ghana_student_workspace.jpg',
    alt: 'Young Ghanaian student with laptop in university learning workspace',
    position: 'center 18%',
  },
  {
    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=900&auto=format&fit=crop&q=80',
    alt: 'African university scholars in seminar lecture discussion',
    position: 'center 18%',
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
      url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop&q=80',
      alt: 'African nursing and healthcare students in clinical medical training',
      position: 'center 20%',
    };
  }
  if (type.includes('Technical') || type.includes('Technology')) {
    return {
      url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=900&auto=format&fit=crop&q=80',
      alt: 'African technical university student in engineering workshop',
      position: 'center 18%',
    };
  }
  if (type.includes('Education') || type.includes('Teacher')) {
    return {
      url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=900&auto=format&fit=crop&q=80',
      alt: 'African student teachers and education scholars in academic seminar',
      position: 'center 18%',
    };
  }

  // 4. Deterministic fallback from variety pool based on institution slug/id
  const seed = `${institution.id || ''}-${institution.slug || institution.name}`;
  const index = hashString(seed) % AFRICAN_STUDENTS_VARIETY_POOL.length;
  return AFRICAN_STUDENTS_VARIETY_POOL[index];
}
