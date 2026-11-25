/**
 * opportunityHeroMedia.ts
 *
 * Client-only hero and editorial media resolver for OpportunityDetailPage
 * and related opportunity previews. Maps every category, organisation,
 * and sector to high-resolution local or generated 16:9 corporate/academic
 * photographs with deterministic variety and zero fragile external URLs.
 */

import { Opportunity } from '../types/database';
import { getCategoryGradient, isValidImageUrl, CategoryGradientConfig } from './cardBackgrounds';

// Bespoke 16:9 corporate & career hero photography
import heroCorporateAdvisory from '../assets/images/hero_corporate_advisory_1795623852094.jpg';
import heroTechCybersecurity from '../assets/images/hero_tech_cybersecurity_1795623852855.jpg';
import heroBankingFinance from '../assets/images/hero_banking_finance_1795623853417.jpg';
import heroFellowshipSummit from '../assets/images/hero_fellowship_summit_1795623853409.jpg';
import heroStartupInnovation from '../assets/images/hero_startup_innovation_1795623854357.jpg';

export interface HeroMediaAsset {
  primaryUrl: string;
  fallbackUrl: string;
  alt: string;
  gradient: CategoryGradientConfig;
}

function hashText(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Checks whether an explicit image URL on the opportunity is a custom
 * local or non-Unsplash uploaded asset (safe and reliable to render first).
 */
function isReliableCustomUrl(url?: string | null): boolean {
  if (!isValidImageUrl(url)) return false;
  const lower = url!.trim().toLowerCase();
  if (
    lower.endsWith('.svg') ||
    lower.includes('unsplash.com') ||
    lower.includes('/scholarships/') ||
    lower.includes('/images/categories/') ||
    lower.includes('placeholder')
  ) {
    return false;
  }
  return true;
}

interface DomainMatchRule {
  pattern: RegExp;
  url: string;
  alt: string;
}

const SECTOR_HERO_RULES: DomainMatchRule[] = [
  // Big 4, Audit, Tax, Legal & Management Advisory
  {
    pattern: /\b(kpmg|pwc|pricewaterhouse|deloitte|ey|ernst\s*&\s*young|audit|taxation|advisory|assurance|management\s+consult|corporate\s+law|legal|compliance)\b/i,
    url: heroCorporateAdvisory,
    alt: 'Corporate audit and advisory professionals collaborating in an Accra boardroom'
  },
  // Technology, Cybersecurity, Software, AI, Telecom & Engineering
  {
    pattern: /\b(cyber|infosec|cisa|cissp|software|developer|engineer|cloud|devops|data\s+science|analytics|\bai\b|artificial\s+intelligence|machine\s+learning|mtn|vodafone|telecel|airteltigo|hubtel|andela|google|microsoft|cisco|aws|telecom)\b/i,
    url: heroTechCybersecurity,
    alt: 'Software engineers and cybersecurity analysts working inside a modern Accra tech center'
  },
  // Banking, Finance, Accounting, FinTech, Insurance & Economics
  {
    pattern: /\b(bank|stanbic|ecobank|gcb|absa|fidelity|calbank|access\s+bank|zenith|uba|paystack|zeepay|fintech|finance|financial|accounting|icag|acca|cfa|investment|treasury|economics|microfinance)\b/i,
    url: heroBankingFinance,
    alt: 'Banking and corporate finance professionals discussing strategy in a modern office lounge'
  },
  // Fellowships, Policy, Governance, Diplomatic & International Conferences
  {
    pattern: /\b(fellowship|mandela\s+washington|yali|policy|governance|ministry|government|public\s+sector|parliament|gra\b|nss|national\s+service|afdb|world\s+bank|united\s+nations|\bun\b|unesco|unicef|giz|diplomacy)\b/i,
    url: heroFellowshipSummit,
    alt: 'African policy fellows and graduate leaders networking in a conference auditorium'
  },
  // Entrepreneurship, Grants, Startups, Incubators & Innovation
  {
    pattern: /\b(grant|startup|entrepreneur|founder|incubator|accelerator|mest|tony\s+elumelu|venture|innovation|agribusiness|sme|business\s+funding|seed\s+fund|hackathon)\b/i,
    url: heroStartupInnovation,
    alt: 'Young Ghanaian founders and product builders collaborating in an innovation hub'
  },
  // Healthcare, Medical, Nursing & Pharmacy
  {
    pattern: /\b(health|medic|nurs|clinical|hospital|pharmacy|mpharma|biomedical|public\s+health|doctor|midwif)\b/i,
    url: '/images/institutions/ghana_health_students.jpg',
    alt: 'Ghanaian healthcare and medical professionals in training'
  },
  // International Study Abroad & Postgraduate Research Scholarships
  {
    pattern: /\b(chevening|commonwealth|cambridge|oxford|clarendon|fulbright|erasmus|daad|rhodes|study\s+abroad|phd|doctoral|research|postgraduate)\b/i,
    url: '/images/institutions/african_library_research_students.jpg',
    alt: 'African postgraduate scholars conducting research in a university library'
  },
  // Ghanaian Universities & Campus Admissions / Scholarships
  {
    pattern: /\b(knust|ug\b|university\s+of\s+ghana|ashesi|ucc|university\s+of\s+cape\s+coast|umat|uds|uhas|gimpa|upsa|getfund|gsa\b|scholarships?\s+authority)\b/i,
    url: '/images/institutions/ghana_campus_students.jpg',
    alt: 'Ghanaian university scholars on a modern campus'
  },
  // Internships, Graduate Trainees & Vocational Training
  {
    pattern: /\b(intern|trainee|graduate\s+programme|apprenticeship|bootcamp|workshop|training|cohort)\b/i,
    url: '/images/ghana_internship_training_1793142343043.jpg',
    alt: 'Young Ghanaian trainees and interns participating in a corporate development session'
  }
];

const CATEGORY_POOLS: Record<string, { url: string; alt: string }[]> = {
  jobs: [
    { url: heroCorporateAdvisory, alt: 'Corporate professionals in an Accra advisory office' },
    { url: heroBankingFinance, alt: 'Executive finance and corporate specialists in a glass office tower' },
    { url: heroTechCybersecurity, alt: 'Technology and engineering professionals at modern workstations' },
    { url: '/images/ghana_corporate_professionals_1793142343322.jpg', alt: 'Ghanaian corporate professionals collaborating in a modern workplace' },
    { url: '/images/ghana_hero_professionals.jpg', alt: 'Ambitious Ghanaian professionals leading workplace projects' }
  ],
  scholarships: [
    { url: '/images/ghana_scholarships_students_1793142405390.jpg', alt: 'Ghanaian university scholars studying with academic resources' },
    { url: '/images/institutions/ghana_graduates_celebrate.jpg', alt: 'Ghanaian university scholars celebrating academic achievement' },
    { url: '/images/institutions/ashesi_library_students.jpg', alt: 'African university scholars researching in an academic library' },
    { url: '/images/institutions/ghana_campus_students.jpg', alt: 'University students walking across campus grounds' },
    { url: '/images/ghana_student_workspace.jpg', alt: 'Ghanaian scholar preparing scholarship research at a workspace' }
  ],
  internships: [
    { url: '/images/ghana_internship_training_1793142343043.jpg', alt: 'Ghanaian interns and trainees collaborating in an office workshop' },
    { url: heroCorporateAdvisory, alt: 'Graduate trainees and associates collaborating in an Accra office' },
    { url: '/images/institutions/ug_students_workshop.jpg', alt: 'Young Ghanaian graduates in a career skills workshop' },
    { url: heroTechCybersecurity, alt: 'Tech interns working in a modern engineering hub' }
  ],
  fellowships: [
    { url: heroFellowshipSummit, alt: 'Policy fellows and emerging leaders in a conference auditorium' },
    { url: '/images/institutions/ucc_tertiary_conference.jpg', alt: 'Fellows engaging in a leadership and policy summit' },
    { url: '/images/institutions/ghana_seminar_students.jpg', alt: 'Scholars participating in a leadership seminar' }
  ],
  grants: [
    { url: heroStartupInnovation, alt: 'Founders and grant innovators prototyping in an Accra studio' },
    { url: '/images/institutions/african_students_laptop_group.jpg', alt: 'Team reviewing project funding proposals on laptops' },
    { url: heroBankingFinance, alt: 'Program leaders reviewing funding and grant impact metrics' }
  ],
  entrepreneurship: [
    { url: heroStartupInnovation, alt: 'Startup founders building products in an innovation workspace' },
    { url: '/images/ghana_corporate_professionals_1793142343322.jpg', alt: 'Ghanaian entrepreneurs discussing business growth strategy' }
  ],
  training: [
    { url: '/images/institutions/african_university_training_session.jpg', alt: 'Professionals and students in an intensive skills training cohort' },
    { url: '/images/institutions/ug_students_seminar.jpg', alt: 'Participants engaged in a hands-on seminar session' },
    { url: heroTechCybersecurity, alt: 'Digital skills trainees at engineering workstations' }
  ],
  competitions: [
    { url: '/images/institutions/ashesi_lecture_students.jpg', alt: 'Students competing and presenting ideas in a packed lecture hall' },
    { url: heroFellowshipSummit, alt: 'Finalists presenting solutions at an innovation conference' },
    { url: '/images/institutions/ghana_tech_students.jpg', alt: 'Student teams building solutions for a national challenge' }
  ],
  'government programmes': [
    { url: heroFellowshipSummit, alt: 'Public sector leaders and civic fellows at a national forum' },
    { url: '/images/ghana_hero_professionals.jpg', alt: 'Ghanaian young professionals advancing national development' }
  ],
  'study abroad': [
    { url: '/images/institutions/african_library_research_students.jpg', alt: 'International scholars studying in a global university library' },
    { url: '/images/institutions/west_african_campus_students_1.jpg', alt: 'International scholars collaborating on campus' }
  ],
  'graduate programmes': [
    { url: heroCorporateAdvisory, alt: 'Graduate associates in an executive consulting boardroom' },
    { url: '/images/institutions/ghana_graduates_celebrate.jpg', alt: 'Recent Ghanaian graduates stepping into corporate leadership' }
  ],
  admissions: [
    { url: '/images/institutions/ghana_campus_students.jpg', alt: 'University students on a vibrant Ghanaian campus' },
    { url: '/images/institutions/west_african_campus_students_2.jpg', alt: 'Prospective university scholars touring campus' }
  ]
};

/**
 * Resolves a dependable, sector-appropriate 16:9 hero photograph + fallback
 * for any Opportunity record across the platform.
 */
export function resolveOpportunityHeroMedia(opp: Partial<Opportunity>): HeroMediaAsset {
  const gradient = getCategoryGradient(opp.category, 'opportunity');

  const combinedText = [
    opp.organizationName || '',
    opp.title || '',
    opp.subcategory || '',
    opp.opportunityType || '',
    opp.fieldOfStudy || '',
    opp.category || '',
    opp.description?.slice(0, 260) || ''
  ].join(' ');

  // Determine best local/generated sector photograph first (used either as primary or fallback)
  let sectorMatch: { url: string; alt: string } | null = null;
  for (const rule of SECTOR_HERO_RULES) {
    if (rule.pattern.test(combinedText)) {
      sectorMatch = { url: rule.url, alt: rule.alt };
      break;
    }
  }

  const catKey = (opp.category || 'jobs').trim().toLowerCase();
  const pool = CATEGORY_POOLS[catKey] || CATEGORY_POOLS.jobs;
  const seed = `${opp.id || ''}-${opp.slug || ''}-${opp.organizationName || ''}-${opp.title || ''}`;
  const pooled = pool[hashText(seed) % pool.length];

  const dependableLocal = sectorMatch || pooled;

  // If the record carries a genuine custom/local uploaded image, prefer it with dependableLocal as fallback
  const customUrl = opp.imageUrl || (opp as any).coverImage || (opp as any).featuredImage;
  if (isReliableCustomUrl(customUrl)) {
    return {
      primaryUrl: customUrl!.trim(),
      fallbackUrl: dependableLocal.url,
      alt: `${opp.title || 'Opportunity'} — ${opp.organizationName || 'Opportunity Ghana'}`,
      gradient
    };
  }

  return {
    primaryUrl: dependableLocal.url,
    fallbackUrl: '/images/ghana_corporate_professionals_1793142343322.jpg',
    alt: `${opp.title || 'Opportunity'} — ${dependableLocal.alt}`,
    gradient
  };
}
