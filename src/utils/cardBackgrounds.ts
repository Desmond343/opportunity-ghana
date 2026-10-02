/**
 * cardBackgrounds.ts
 *
 * Professional visual background and gradient system for Opportunity Ghana cards.
 * Implements strict hierarchy:
 * 1. Valid uploaded / existing image
 * 2. Specialty scholarship / field image (STEM, medical, business, government, university, etc.)
 * 3. Category image fallback (scholarships.jpg, jobs.jpg, etc.)
 * 4. Professional category-based gradient
 * 5. Default executive gradient
 */

import { Opportunity, Resource } from '../types/database';

export interface CategoryGradientConfig {
  id: string;
  name: string;
  /** Tailwind gradient classes */
  gradientClass: string;
  /** High-fidelity CSS linear-gradient string */
  cssGradient: string;
  /** Primary accent color (hex) */
  accentColor: string;
  /** Accent text color (hex or Tailwind) */
  accentTextColor: string;
  /** Subtle SVG pattern name */
  pattern: 'dots' | 'grid' | 'circuit' | 'rings' | 'cross' | 'waves' | 'kente';
  /** Icon name for visual identification */
  iconName: string;
  /** Subtle badge style */
  badgeBg: string;
  badgeText: string;
}

/**
 * Reusable mapping of category gradients tailored to Opportunity Ghana branding
 */
export const CATEGORY_GRADIENTS: Record<string, CategoryGradientConfig> = {
  // --- TECH & DIGITAL ---
  technology: {
    id: 'technology',
    name: 'Technology',
    gradientClass: 'bg-gradient-to-br from-[#061E38] via-[#0B3558] to-[#0284C7]',
    cssGradient: 'linear-gradient(135deg, #051930 0%, #0B3558 55%, #0284C7 100%)',
    accentColor: '#38BDF8',
    accentTextColor: '#38BDF8',
    pattern: 'circuit',
    iconName: 'Cpu',
    badgeBg: 'bg-sky-950/80 border-sky-500/30',
    badgeText: 'text-sky-300'
  },
  programming: {
    id: 'programming',
    name: 'Programming',
    gradientClass: 'bg-gradient-to-br from-[#0A102A] via-[#1E1B4B] to-[#2563EB]',
    cssGradient: 'linear-gradient(135deg, #070B1F 0%, #1E1B4B 50%, #2563EB 100%)',
    accentColor: '#60A5FA',
    accentTextColor: '#60A5FA',
    pattern: 'circuit',
    iconName: 'Code',
    badgeBg: 'bg-indigo-950/80 border-indigo-500/30',
    badgeText: 'text-indigo-300'
  },
  ai: {
    id: 'ai',
    name: 'AI & Data Science',
    gradientClass: 'bg-gradient-to-br from-[#160B2E] via-[#3B0764] to-[#4F46E5]',
    cssGradient: 'linear-gradient(135deg, #100624 0%, #3B0764 50%, #4F46E5 100%)',
    accentColor: '#C084FC',
    accentTextColor: '#C084FC',
    pattern: 'circuit',
    iconName: 'Sparkles',
    badgeBg: 'bg-purple-950/80 border-purple-500/30',
    badgeText: 'text-purple-300'
  },
  cybersecurity: {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    gradientClass: 'bg-gradient-to-br from-[#031B1E] via-[#064E3B] to-[#0284C7]',
    cssGradient: 'linear-gradient(135deg, #021417 0%, #064E3B 50%, #0284C7 100%)',
    accentColor: '#34D399',
    accentTextColor: '#34D399',
    pattern: 'grid',
    iconName: 'Shield',
    badgeBg: 'bg-emerald-950/80 border-emerald-500/30',
    badgeText: 'text-emerald-300'
  },

  // --- BUSINESS, FINANCE & ENTREPRENEURSHIP ---
  business: {
    id: 'business',
    name: 'Business',
    gradientClass: 'bg-gradient-to-br from-[#061826] via-[#0E354A] to-[#0D9488]',
    cssGradient: 'linear-gradient(135deg, #04101A 0%, #0E354A 55%, #0D9488 100%)',
    accentColor: '#2DD4BF',
    accentTextColor: '#2DD4BF',
    pattern: 'grid',
    iconName: 'Briefcase',
    badgeBg: 'bg-teal-950/80 border-teal-500/30',
    badgeText: 'text-teal-300'
  },
  finance: {
    id: 'finance',
    name: 'Finance',
    gradientClass: 'bg-gradient-to-br from-[#02231A] via-[#064E3B] to-[#0F766E]',
    cssGradient: 'linear-gradient(135deg, #011812 0%, #064E3B 55%, #0F766E 100%)',
    accentColor: '#FCD116',
    accentTextColor: '#FCD116',
    pattern: 'grid',
    iconName: 'Coins',
    badgeBg: 'bg-emerald-950/80 border-[#006B3F]/50',
    badgeText: 'text-[#FCD116]'
  },
  entrepreneurship: {
    id: 'entrepreneurship',
    name: 'Entrepreneurship',
    gradientClass: 'bg-gradient-to-br from-[#271004] via-[#431407] to-[#0D9488]',
    cssGradient: 'linear-gradient(135deg, #1C0A02 0%, #431407 50%, #0D9488 100%)',
    accentColor: '#FB923C',
    accentTextColor: '#FB923C',
    pattern: 'waves',
    iconName: 'Rocket',
    badgeBg: 'bg-amber-950/80 border-amber-500/30',
    badgeText: 'text-amber-300'
  },

  // --- EDUCATION & SCHOLARSHIPS ---
  education: {
    id: 'education',
    name: 'Education',
    gradientClass: 'bg-gradient-to-br from-[#0B1538] via-[#1E295E] to-[#6366F1]',
    cssGradient: 'linear-gradient(135deg, #070E28 0%, #1E295E 55%, #6366F1 100%)',
    accentColor: '#818CF8',
    accentTextColor: '#818CF8',
    pattern: 'rings',
    iconName: 'GraduationCap',
    badgeBg: 'bg-indigo-950/80 border-indigo-500/30',
    badgeText: 'text-indigo-300'
  },
  scholarships: {
    id: 'scholarships',
    name: 'Scholarships',
    gradientClass: 'bg-gradient-to-br from-[#022216] via-[#006B3F] to-[#064E3B]',
    cssGradient: 'linear-gradient(135deg, #01170F 0%, #006B3F 55%, #064E3B 100%)',
    accentColor: '#FCD116',
    accentTextColor: '#FCD116',
    pattern: 'kente',
    iconName: 'GraduationCap',
    badgeBg: 'bg-emerald-950/90 border-[#006B3F]',
    badgeText: 'text-[#FCD116]'
  },

  // --- HEALTH & MEDICINE ---
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    gradientClass: 'bg-gradient-to-br from-[#032320] via-[#0D5D56] to-[#059669]',
    cssGradient: 'linear-gradient(135deg, #021715 0%, #0D5D56 55%, #059669 100%)',
    accentColor: '#34D399',
    accentTextColor: '#34D399',
    pattern: 'cross',
    iconName: 'HeartPulse',
    badgeBg: 'bg-teal-950/80 border-teal-500/30',
    badgeText: 'text-teal-300'
  },
  health: {
    id: 'health',
    name: 'Health',
    gradientClass: 'bg-gradient-to-br from-[#032320] via-[#0D5D56] to-[#059669]',
    cssGradient: 'linear-gradient(135deg, #021715 0%, #0D5D56 55%, #059669 100%)',
    accentColor: '#34D399',
    accentTextColor: '#34D399',
    pattern: 'cross',
    iconName: 'HeartPulse',
    badgeBg: 'bg-teal-950/80 border-teal-500/30',
    badgeText: 'text-teal-300'
  },

  // --- AGRICULTURE & ENVIRONMENT ---
  agriculture: {
    id: 'agriculture',
    name: 'Agriculture',
    gradientClass: 'bg-gradient-to-br from-[#122206] via-[#244211] to-[#D97706]',
    cssGradient: 'linear-gradient(135deg, #0B1703 0%, #244211 55%, #D97706 100%)',
    accentColor: '#A3E635',
    accentTextColor: '#A3E635',
    pattern: 'waves',
    iconName: 'Sprout',
    badgeBg: 'bg-emerald-950/80 border-lime-500/30',
    badgeText: 'text-lime-300'
  },

  // --- ENGINEERING & STEM ---
  engineering: {
    id: 'engineering',
    name: 'Engineering',
    gradientClass: 'bg-gradient-to-br from-[#071927] via-[#1E293B] to-[#0284C7]',
    cssGradient: 'linear-gradient(135deg, #04101A 0%, #1E293B 55%, #0284C7 100%)',
    accentColor: '#38BDF8',
    accentTextColor: '#38BDF8',
    pattern: 'grid',
    iconName: 'Wrench',
    badgeBg: 'bg-slate-900/80 border-sky-500/30',
    badgeText: 'text-sky-300'
  },

  // --- MARKETING & CREATIVE ---
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    gradientClass: 'bg-gradient-to-br from-[#2D0B18] via-[#5F162A] to-[#EA580C]',
    cssGradient: 'linear-gradient(135deg, #1F0610 0%, #5F162A 55%, #EA580C 100%)',
    accentColor: '#FB7185',
    accentTextColor: '#FB7185',
    pattern: 'waves',
    iconName: 'Megaphone',
    badgeBg: 'bg-rose-950/80 border-rose-500/30',
    badgeText: 'text-rose-300'
  },
  design: {
    id: 'design',
    name: 'Design',
    gradientClass: 'bg-gradient-to-br from-[#22072D] via-[#4A0E60] to-[#DB2777]',
    cssGradient: 'linear-gradient(135deg, #17041F 0%, #4A0E60 55%, #DB2777 100%)',
    accentColor: '#F472B6',
    accentTextColor: '#F472B6',
    pattern: 'waves',
    iconName: 'Palette',
    badgeBg: 'bg-fuchsia-950/80 border-fuchsia-500/30',
    badgeText: 'text-fuchsia-300'
  },

  // --- CAREER & OPPORTUNITIES ---
  'career development': {
    id: 'career development',
    name: 'Career Development',
    gradientClass: 'bg-gradient-to-br from-[#091530] via-[#1E1B4B] to-[#3B82F6]',
    cssGradient: 'linear-gradient(135deg, #050E22 0%, #1E1B4B 55%, #3B82F6 100%)',
    accentColor: '#60A5FA',
    accentTextColor: '#60A5FA',
    pattern: 'rings',
    iconName: 'TrendingUp',
    badgeBg: 'bg-blue-950/80 border-blue-500/30',
    badgeText: 'text-blue-300'
  },
  'professional development': {
    id: 'professional development',
    name: 'Professional Development',
    gradientClass: 'bg-gradient-to-br from-[#091530] via-[#1E1B4B] to-[#3B82F6]',
    cssGradient: 'linear-gradient(135deg, #050E22 0%, #1E1B4B 55%, #3B82F6 100%)',
    accentColor: '#60A5FA',
    accentTextColor: '#60A5FA',
    pattern: 'rings',
    iconName: 'TrendingUp',
    badgeBg: 'bg-blue-950/80 border-blue-500/30',
    badgeText: 'text-blue-300'
  },
  jobs: {
    id: 'jobs',
    name: 'Jobs',
    gradientClass: 'bg-gradient-to-br from-[#07182E] via-[#1E293B] to-[#1D4ED8]',
    cssGradient: 'linear-gradient(135deg, #041020 0%, #1E293B 55%, #1D4ED8 100%)',
    accentColor: '#60A5FA',
    accentTextColor: '#60A5FA',
    pattern: 'grid',
    iconName: 'Briefcase',
    badgeBg: 'bg-slate-900/80 border-blue-500/30',
    badgeText: 'text-blue-300'
  },
  internships: {
    id: 'internships',
    name: 'Internships',
    gradientClass: 'bg-gradient-to-br from-[#0E132B] via-[#2A1C5A] to-[#0284C7]',
    cssGradient: 'linear-gradient(135deg, #080B1C 0%, #2A1C5A 55%, #0284C7 100%)',
    accentColor: '#38BDF8',
    accentTextColor: '#38BDF8',
    pattern: 'rings',
    iconName: 'Compass',
    badgeBg: 'bg-indigo-950/80 border-sky-500/30',
    badgeText: 'text-sky-300'
  },
  grants: {
    id: 'grants',
    name: 'Grants',
    gradientClass: 'bg-gradient-to-br from-[#251004] via-[#451A03] to-[#059669]',
    cssGradient: 'linear-gradient(135deg, #190902 0%, #451A03 55%, #059669 100%)',
    accentColor: '#FCD116',
    accentTextColor: '#FCD116',
    pattern: 'grid',
    iconName: 'Coins',
    badgeBg: 'bg-amber-950/80 border-amber-500/30',
    badgeText: 'text-[#FCD116]'
  },
  fellowships: {
    id: 'fellowships',
    name: 'Fellowships',
    gradientClass: 'bg-gradient-to-br from-[#1C0830] via-[#3B0764] to-[#1E1B4B]',
    cssGradient: 'linear-gradient(135deg, #130422 0%, #3B0764 55%, #1E1B4B 100%)',
    accentColor: '#E9D5FF',
    accentTextColor: '#E9D5FF',
    pattern: 'rings',
    iconName: 'Award',
    badgeBg: 'bg-purple-950/80 border-purple-500/30',
    badgeText: 'text-purple-300'
  },
  'government programmes': {
    id: 'government programmes',
    name: 'Government Programmes',
    gradientClass: 'bg-gradient-to-br from-[#022A1C] via-[#004D2C] to-[#15803D]',
    cssGradient: 'linear-gradient(135deg, #011A11 0%, #004D2C 55%, #15803D 100%)',
    accentColor: '#FCD116',
    accentTextColor: '#FCD116',
    pattern: 'kente',
    iconName: 'Landmark',
    badgeBg: 'bg-emerald-950/90 border-[#006B3F]',
    badgeText: 'text-[#FCD116]'
  },
  'study abroad': {
    id: 'study abroad',
    name: 'Study Abroad',
    gradientClass: 'bg-gradient-to-br from-[#032336] via-[#075985] to-[#0284C7]',
    cssGradient: 'linear-gradient(135deg, #021724 0%, #075985 55%, #0284C7 100%)',
    accentColor: '#7DD3FC',
    accentTextColor: '#7DD3FC',
    pattern: 'rings',
    iconName: 'Globe',
    badgeBg: 'bg-sky-950/80 border-sky-500/30',
    badgeText: 'text-sky-300'
  },
  competitions: {
    id: 'competitions',
    name: 'Competitions',
    gradientClass: 'bg-gradient-to-br from-[#2D0613] via-[#5C0C27] to-[#BE123C]',
    cssGradient: 'linear-gradient(135deg, #1E030C 0%, #5C0C27 55%, #BE123C 100%)',
    accentColor: '#FDA4AF',
    accentTextColor: '#FDA4AF',
    pattern: 'waves',
    iconName: 'Trophy',
    badgeBg: 'bg-rose-950/80 border-rose-500/30',
    badgeText: 'text-rose-300'
  },
  admissions: {
    id: 'admissions',
    name: 'Admissions',
    gradientClass: 'bg-gradient-to-br from-[#081730] via-[#172554] to-[#1D4ED8]',
    cssGradient: 'linear-gradient(135deg, #040E20 0%, #172554 55%, #1D4ED8 100%)',
    accentColor: '#93C5FD',
    accentTextColor: '#93C5FD',
    pattern: 'grid',
    iconName: 'BookOpen',
    badgeBg: 'bg-blue-950/80 border-blue-500/30',
    badgeText: 'text-blue-300'
  },
  training: {
    id: 'training',
    name: 'Training',
    gradientClass: 'bg-gradient-to-br from-[#042436] via-[#0E4868] to-[#0F766E]',
    cssGradient: 'linear-gradient(135deg, #021825 0%, #0E4868 55%, #0F766E 100%)',
    accentColor: '#5EEAD4',
    accentTextColor: '#5EEAD4',
    pattern: 'grid',
    iconName: 'Layers',
    badgeBg: 'bg-cyan-950/80 border-cyan-500/30',
    badgeText: 'text-cyan-300'
  },

  // --- DEFAULT / FALLBACK ---
  default: {
    id: 'default',
    name: 'Opportunity Ghana',
    gradientClass: 'bg-gradient-to-br from-[#022216] via-[#006B3F] to-[#0F172A]',
    cssGradient: 'linear-gradient(135deg, #01170F 0%, #006B3F 55%, #0F172A 100%)',
    accentColor: '#FCD116',
    accentTextColor: '#FCD116',
    pattern: 'kente',
    iconName: 'Sparkles',
    badgeBg: 'bg-emerald-950/90 border-[#006B3F]',
    badgeText: 'text-[#FCD116]'
  }
};

/**
 * Normalizes category string to lookup key
 */
function normalizeCategoryKey(category?: string | null): string {
  if (!category) return 'default';
  const raw = category.trim().toLowerCase();
  
  if (raw.includes('tech') || raw.includes('software') || raw.includes('computer')) return 'technology';
  if (raw.includes('program') || raw.includes('coding') || raw.includes('developer') || raw.includes('web dev')) return 'programming';
  if (raw.includes('ai') || raw.includes('artificial') || raw.includes('data') || raw.includes('machine learning')) return 'ai';
  if (raw.includes('cyber') || raw.includes('security')) return 'cybersecurity';
  if (raw.includes('scholarship')) return 'scholarships';
  if (raw.includes('job') || raw.includes('employment') || raw.includes('career')) return 'jobs';
  if (raw.includes('intern') || raw.includes('national service') || raw.includes('nss')) return 'internships';
  if (raw.includes('grant') || raw.includes('funding')) return 'grants';
  if (raw.includes('fellowship')) return 'fellowships';
  if (raw.includes('gov') || raw.includes('ministry') || raw.includes('public sector') || raw.includes('statutory')) return 'government programmes';
  if (raw.includes('abroad') || raw.includes('international') || raw.includes('global') || raw.includes('mobility')) return 'study abroad';
  if (raw.includes('compete') || raw.includes('hackathon') || raw.includes('contest') || raw.includes('challenge')) return 'competitions';
  if (raw.includes('admiss') || raw.includes('entry') || raw.includes('tertiary')) return 'admissions';
  if (raw.includes('train') || raw.includes('bootcamp') || raw.includes('course') || raw.includes('workshop')) return 'training';
  if (raw.includes('biz') || raw.includes('business') || raw.includes('management') || raw.includes('mba')) return 'business';
  if (raw.includes('finance') || raw.includes('banking') || raw.includes('accounting') || raw.includes('economic')) return 'finance';
  if (raw.includes('entrepreneur') || raw.includes('startup') || raw.includes('incubator') || raw.includes('accelerator')) return 'entrepreneurship';
  if (raw.includes('health') || raw.includes('medic') || raw.includes('nurs') || raw.includes('pharm') || raw.includes('clinic')) return 'health';
  if (raw.includes('agri') || raw.includes('farm') || raw.includes('crop') || raw.includes('food')) return 'agriculture';
  if (raw.includes('engine') || raw.includes('civil') || raw.includes('mechanical') || raw.includes('electrical')) return 'engineering';
  if (raw.includes('market') || raw.includes('brand') || raw.includes('media') || raw.includes('pr')) return 'marketing';
  if (raw.includes('design') || raw.includes('creative') || raw.includes('ui') || raw.includes('ux') || raw.includes('graphic')) return 'design';
  if (raw.includes('educat') || raw.includes('teach') || raw.includes('school')) return 'education';
  if (raw.includes('prof') || raw.includes('skill')) return 'professional development';

  return CATEGORY_GRADIENTS[raw] ? raw : 'default';
}

/**
 * Reusable function to obtain a professional gradient configuration for any category
 */
export function getCategoryGradient(category?: string | null, _type?: 'opportunity' | 'resource'): CategoryGradientConfig {
  const key = normalizeCategoryKey(category);
  return CATEGORY_GRADIENTS[key] || CATEGORY_GRADIENTS.default;
}

/**
 * Inspects whether an image string is valid and safe to render
 */
export function isValidImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length < 4) return false;
  if (trimmed === 'null' || trimmed === 'undefined' || trimmed === '[object Object]') return false;
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:text/html')) return false;
  return true;
}

/**
 * Mapping of known institutions / keywords to tailored scholarship SVGs
 */
const KNOWN_SCHOLARSHIP_IMAGES: { pattern: RegExp; image: string }[] = [
  { pattern: /chevening/i, image: '/images/scholarships/chevening_uk.svg' },
  { pattern: /commonwealth/i, image: '/images/scholarships/commonwealth_csc.svg' },
  { pattern: /gates[\s-_]?cambridge/i, image: '/images/scholarships/gates_cambridge.svg' },
  { pattern: /knight[\s-_]?hennessy/i, image: '/images/scholarships/knight_hennessy.svg' },
  { pattern: /ireland/i, image: '/images/scholarships/ireland_postgrad.svg' },
  { pattern: /mandela[\s-_]?washington/i, image: '/images/scholarships/mandela_washington.svg' },
  { pattern: /swiss/i, image: '/images/scholarships/swiss_excellence.svg' },
  { pattern: /edinburgh/i, image: '/images/scholarships/edinburgh_mcf.svg' },
  { pattern: /eiffel/i, image: '/images/scholarships/eiffel_excellence.svg' },
  { pattern: /weidenfeld/i, image: '/images/scholarships/weidenfeld_hoffmann.svg' },
  { pattern: /mo[\s-_]?ibrahim/i, image: '/images/scholarships/mo_ibrahim.svg' },
  { pattern: /ghana\s+scholarships\s+authority|scholarships\.gov\.gh|\bgsa\b/i, image: '/images/scholarships/gsa_ghana.svg' },
  { pattern: /gnpc/i, image: '/images/scholarships/gnpc_foundation.svg' },
  { pattern: /mtn/i, image: '/images/scholarships/mtn_bright.svg' },
  { pattern: /getfund/i, image: '/images/scholarships/getfund_ghana.svg' },
  { pattern: /knust/i, image: '/images/scholarships/knust_mcf.svg' },
  { pattern: /ashesi/i, image: '/images/scholarships/ashesi_mcf.svg' },
  { pattern: /fulbright/i, image: '/images/scholarships/fulbright_ghana.svg' },
  { pattern: /daad/i, image: '/images/scholarships/daad_epos.svg' },
  { pattern: /rhodes/i, image: '/images/scholarships/rhodes_oxford.svg' },
  { pattern: /pau|pan[\s-_]?african\s+university/i, image: '/images/scholarships/pau_african_union.svg' },
  { pattern: /mandela[\s-_]?rhodes/i, image: '/images/scholarships/mandela_rhodes.svg' },
  { pattern: /world[\s-_]?bank|jjwbgsp/i, image: '/images/scholarships/world_bank_jjwbgsp.svg' },
  { pattern: /reach[\s-_]?oxford/i, image: '/images/scholarships/reach_oxford.svg' },
  { pattern: /clarendon/i, image: '/images/scholarships/clarendon_oxford.svg' },
  { pattern: /erasmus/i, image: '/images/scholarships/erasmus_mundus.svg' },
  { pattern: /hungaricum|hungary/i, image: '/images/scholarships/stipendium_hungaricum.svg' },
  { pattern: /swedish|sweden/i, image: '/images/scholarships/swedish_institute.svg' },
  { pattern: /flanders|master[\s-_]?mind/i, image: '/images/scholarships/master_mind_flanders.svg' },
  { pattern: /lester[\s-_]?b?\.?[\s-_]?pearson|toronto/i, image: '/images/scholarships/lester_b_pearson.svg' },
  { pattern: /singa|singapore/i, image: '/images/scholarships/singa_singapore.svg' },
  { pattern: /tony[\s-_]?elumelu/i, image: '/images/scholarships/tony_elumelu.svg' },
  { pattern: /afdb|jads/i, image: '/images/scholarships/afdb_jads.svg' }
];

/**
 * Finds a thematic scholarship banner matching field of study, audience, or degree
 */
function findThematicScholarshipImage(opp: Partial<Opportunity>): string | null {
  const text = [
    opp.title || '',
    opp.description || '',
    opp.fieldOfStudy || '',
    opp.educationLevel || '',
    opp.opportunityType || '',
    opp.organizationName || ''
  ].join(' ').toLowerCase();

  // Women in Tech / STEM
  if (text.includes('women') || text.includes('female') || text.includes('girls in tech')) {
    return '/images/scholarships/women_in_stem.svg';
  }

  // STEM / Science / Engineering / Computing / Tech / AI
  if (
    text.includes('stem') ||
    text.includes('engineering') ||
    text.includes('computer') ||
    text.includes('software') ||
    text.includes('artificial intelligence') ||
    text.includes('data science') ||
    text.includes('technology') ||
    text.includes('mathematics') ||
    text.includes('physics')
  ) {
    return '/images/scholarships/stem_scholarship.svg';
  }

  // Medical / Health / Nursing / Pharmacy
  if (
    text.includes('medic') ||
    text.includes('health') ||
    text.includes('nurs') ||
    text.includes('pharm') ||
    text.includes('clinical') ||
    text.includes('biomedical')
  ) {
    return '/images/scholarships/medical_scholarship.svg';
  }

  // Business / MBA / Economics / Finance / Leadership
  if (
    text.includes('mba') ||
    text.includes('business') ||
    text.includes('finance') ||
    text.includes('economics') ||
    text.includes('management') ||
    text.includes('entrepreneurship')
  ) {
    return '/images/scholarships/business_scholarship.svg';
  }

  // Research / PhD / Doctoral / Postdoc
  if (
    text.includes('phd') ||
    text.includes('doctoral') ||
    text.includes('doctorate') ||
    text.includes('postdoctoral') ||
    text.includes('research fellowship')
  ) {
    return '/images/scholarships/research_scholarship.svg';
  }

  // Government / Ministry / Bilateral / Statutory
  if (
    text.includes('ministry') ||
    text.includes('government') ||
    text.includes('bursary') ||
    text.includes('statutory') ||
    text.includes('district')
  ) {
    return '/images/scholarships/government_scholarship.svg';
  }

  // International Study Abroad / Mobility
  if (
    (opp.country && opp.country.toLowerCase() !== 'ghana') ||
    text.includes('study abroad') ||
    text.includes('international student') ||
    text.includes('exchange')
  ) {
    return '/images/scholarships/international_scholarship.svg';
  }

  // Default university campus academic image
  return '/images/scholarships/university_scholarship.svg';
}

/**
 * Standard category image paths in public/images/categories/
 */
const CATEGORY_IMAGE_PATHS: Record<string, string> = {
  scholarships: '/images/categories/scholarships.jpg',
  jobs: '/images/categories/jobs.jpg',
  internships: '/images/categories/internships.jpg',
  grants: '/images/categories/grants.jpg',
  fellowships: '/images/categories/fellowships.jpg',
  courses: '/images/categories/courses.jpg'
};

export interface ResolvedCardMedia {
  /** If present, image URL to load */
  imageUrl: string | null;
  /** Whether the image is a vector SVG */
  isSvg: boolean;
  /** Resolution hierarchy level */
  source: 'uploaded' | 'specialty' | 'category' | 'gradient';
  /** Gradient configuration for background or fallback */
  gradient: CategoryGradientConfig;
}

/**
 * Resolves the visual media for an Opportunity card according to the strict hierarchy:
 * 1. Valid uploaded / existing image
 * 2. Relevant scholarship specialty / thematic vector image
 * 3. Configured category image
 * 4. Professional gradient fallback
 */
export function resolveOpportunityMedia(opp: Partial<Opportunity>): ResolvedCardMedia {
  const gradient = getCategoryGradient(opp.category, 'opportunity');

  // 1. Check existing / uploaded image fields
  const existingUrl =
    opp.imageUrl ||
    (opp as any).image ||
    (opp as any).coverImage ||
    (opp as any).thumbnail ||
    (opp as any).featuredImage;

  if (isValidImageUrl(existingUrl)) {
    return {
      imageUrl: existingUrl.trim(),
      isSvg: existingUrl.endsWith('.svg'),
      source: 'uploaded',
      gradient
    };
  }

  const categoryLower = (opp.category || '').toLowerCase();
  const isScholarship =
    categoryLower === 'scholarships' ||
    (opp.title && /scholarship|bursary|fellowship/i.test(opp.title));

  // 2. If it's a scholarship, check for institution or thematic SVG
  if (isScholarship) {
    const oppString = `${opp.title || ''} ${opp.organizationName || ''} ${opp.sourceUrl || ''}`;
    for (const item of KNOWN_SCHOLARSHIP_IMAGES) {
      if (item.pattern.test(oppString)) {
        return {
          imageUrl: item.image,
          isSvg: true,
          source: 'specialty',
          gradient
        };
      }
    }

    const thematic = findThematicScholarshipImage(opp);
    if (thematic) {
      return {
        imageUrl: thematic,
        isSvg: true,
        source: 'specialty',
        gradient
      };
    }
  }

  // 3. Category image fallback (if category has a curated photo)
  const catKey = normalizeCategoryKey(opp.category);
  if (CATEGORY_IMAGE_PATHS[catKey]) {
    return {
      imageUrl: CATEGORY_IMAGE_PATHS[catKey],
      isSvg: false,
      source: 'category',
      gradient
    };
  }

  // 4. Clean professional category gradient
  return {
    imageUrl: null,
    isSvg: false,
    source: 'gradient',
    gradient
  };
}

/**
 * Resolves the visual media for a Resource card according to:
 * 1. Valid uploaded / existing image
 * 2. Professional category-based gradient
 */
export function resolveResourceMedia(resource: Partial<Resource>): ResolvedCardMedia {
  const gradient = getCategoryGradient(resource.category, 'resource');

  const existingUrl =
    resource.imageUrl ||
    (resource as any).image ||
    (resource as any).coverImage ||
    (resource as any).thumbnail;

  if (isValidImageUrl(existingUrl)) {
    return {
      imageUrl: existingUrl.trim(),
      isSvg: existingUrl.endsWith('.svg'),
      source: 'uploaded',
      gradient
    };
  }

  // No image: return clean category gradient
  return {
    imageUrl: null,
    isSvg: false,
    source: 'gradient',
    gradient
  };
}
