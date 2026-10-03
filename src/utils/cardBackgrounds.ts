/**
 * cardBackgrounds.ts
 *
 * Professional visual background and gradient system for Opportunity Ghana cards.
 * Implements strict hierarchy:
 * 1. Valid uploaded / existing real image
 * 2. If scholarship: authentic, human-centered educational photograph matching provider or field of study
 * 3. If Resource or non-scholarship Opportunity without image: attractive, professional category-based gradient
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
 * Designed with rich tones: Ghana green (#006B3F), Ghana gold (#FCD116), deep navy, teal, and slate.
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
  data: {
    id: 'data',
    name: 'Data & Analytics',
    gradientClass: 'bg-gradient-to-br from-[#0A1A2F] via-[#133E68] to-[#0284C7]',
    cssGradient: 'linear-gradient(135deg, #081426 0%, #133E68 55%, #0284C7 100%)',
    accentColor: '#38BDF8',
    accentTextColor: '#38BDF8',
    pattern: 'grid',
    iconName: 'Cpu',
    badgeBg: 'bg-sky-950/80 border-sky-500/30',
    badgeText: 'text-sky-300'
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
  if (raw.includes('ai') || raw.includes('artificial') || raw.includes('machine learning')) return 'ai';
  if (raw.includes('data')) return 'data';
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
 * Determines whether a given image URL represents a genuine, user- or admin-uploaded photograph
 * or custom photography URL (as opposed to empty values or legacy synthetic SVG placeholders).
 */
export function isUploadedRealImage(url?: string | null): boolean {
  if (!isValidImageUrl(url)) return false;
  const lower = url!.trim().toLowerCase();

  // Exclude legacy synthetic SVG illustration paths or placeholder SVG paths
  if (lower.endsWith('.svg') || lower.includes('/scholarships/')) {
    if (lower.includes('.svg') || lower.includes('/scholarships/')) return false;
  }

  return true;
}

export interface ScholarshipPhoto {
  url: string;
  alt: string;
  attribution: string;
}

/**
 * Curated registry of authentic, human-centered photographs for flagship scholarship schemes.
 * All images are royalty-free (Unsplash Educational Media or Opportunity Ghana licensed assets).
 * Every major scheme has its own unique photo to avoid visual repetition across listings.
 */
const FLAGSHIP_SCHOLARSHIP_PHOTOS: { pattern: RegExp; photo: ScholarshipPhoto }[] = [
  {
    pattern: /chevening/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
      alt: 'University scholars walking on collegiate campus lawn with notebooks and satchels',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /commonwealth.*(phd|doctor|research)/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      alt: 'Doctoral research scholar studying at academic desk with research manuscripts',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /commonwealth/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop&q=80',
      alt: 'University study group collaborating on academic coursework',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /knust/i,
    photo: {
      url: '/images/ghana_student_workspace.jpg',
      alt: 'Young Ghanaian student with laptop in university learning workspace',
      attribution: 'Opportunity Ghana Official Media'
    }
  },
  {
    pattern: /ashesi/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80',
      alt: 'Young African university students on modern campus courtyard',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /ghana\s+scholarships\s+authority|scholarships\.gov\.gh|\bgsa\b|local\s+tertiary/i,
    photo: {
      url: '/images/ghana_hero_professionals.jpg',
      alt: 'Ghanaian university graduates and tertiary scholars celebrating academic achievement',
      attribution: 'Opportunity Ghana Official Media'
    }
  },
  {
    pattern: /getfund/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
      alt: 'Students engaged in lecture hall seminar discussion',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /daad/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&auto=format&fit=crop&q=80',
      alt: 'University students actively participating in seminar lecture room',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /erasmus/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&auto=format&fit=crop&q=80',
      alt: 'Diverse international students studying on university campus steps',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /gates[\s-_]?cambridge/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
      alt: 'University scholars walking across collegiate campus lawn',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /clarendon/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1460518451282-474b15696894?w=800&auto=format&fit=crop&q=80',
      alt: 'Postgraduate scholars studying alongside historic library window',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /reach[\s-_]?oxford/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
      alt: 'University students gathered with laptops on university lawn',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /rhodes/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1526976668912-1a811878dd37?w=800&auto=format&fit=crop&q=80',
      alt: 'University scholars walking through collegiate arches on sunny afternoon',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /weidenfeld[\s-_]?hoffmann/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1534644107580-3a4dbd494a95?w=800&auto=format&fit=crop&q=80',
      alt: 'University student studying in historic academic library surrounded by book stacks',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /edinburgh/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
      alt: 'Diverse scholars collaborating around wooden study table with laptops and books',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /fulbright/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
      alt: 'Scholar studying with research books in university library',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /mtn/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&auto=format&fit=crop&q=80',
      alt: 'University student with laptop engaged in digital learning',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /gnpc/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&auto=format&fit=crop&q=80',
      alt: 'Engineering and technology student working in university laboratory',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /tony[\s-_]?elumelu|mo[\s-_]?ibrahim/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
      alt: 'Young African business entrepreneurs and scholars in strategy workshop',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /mandela[\s-_]?washington/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80',
      alt: 'Young African leadership scholars in academic auditorium',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /mandela[\s-_]?rhodes/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=800&auto=format&fit=crop&q=80',
      alt: 'University student on campus lawn with backpack and textbooks',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /swiss/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
      alt: 'Scientific research scholar working with precision instruments in laboratory',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /swedish/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      alt: 'Professional scholar focused on laptop and research notes in modern academic space',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /eiffel/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
      alt: 'Graduate scholar in smart academic attire in university study hall',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /hungaricum/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
      alt: 'Students in academic lecture hall engaged in interactive coursework',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /master[\s-_]?mind/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80',
      alt: 'Students in university library reading room surrounded by high bookshelves',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /ireland/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80',
      alt: 'Postgraduate students and researchers in academic seminar discussion',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /singa|singapore/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=800&auto=format&fit=crop&q=80',
      alt: 'Science and engineering PhD researchers in high-tech laboratory',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /knight[\s-_]?hennessy/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80',
      alt: 'Graduate university scholars at modern campus commons discussing coursework',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /lester[\s-_]?b?\.?[\s-_]?pearson/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
      alt: 'Diverse group of undergraduate university scholars smiling on campus',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /pan\s+african\s+university|\bpau\b/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1524749292158-7540c2494485?w=800&auto=format&fit=crop&q=80',
      alt: 'Diverse students collaborating with open books and notebooks in study commons',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  {
    pattern: /world[\s-_]?bank|afdb|jads/i,
    photo: {
      url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
      alt: 'Graduate development economics scholars analyzing data and reports together',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  }
];

/**
 * Thematic scholarship photographs matching field of study, audience, or degree
 */
const THEMATIC_SCHOLARSHIP_PHOTOS: { match: (text: string) => boolean; photo: ScholarshipPhoto }[] = [
  // 1. Women in STEM & Higher Education
  {
    match: (text) => text.includes('women') || text.includes('female') || text.includes('girls in tech'),
    photo: {
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
      alt: 'Young woman university student in computer science seminar',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  // 2. STEM / Engineering / Computing / Robotics
  {
    match: (text) =>
      text.includes('stem') ||
      text.includes('engineer') ||
      text.includes('computer') ||
      text.includes('software') ||
      text.includes('data science') ||
      text.includes('robotics') ||
      text.includes('technology'),
    photo: {
      url: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&auto=format&fit=crop&q=80',
      alt: 'Engineering and technology students working in university lab',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  // 3. Medical, Nursing, Healthcare, Pharmacy
  {
    match: (text) =>
      text.includes('medic') ||
      text.includes('health') ||
      text.includes('nurs') ||
      text.includes('pharm') ||
      text.includes('clinical') ||
      text.includes('biomedical'),
    photo: {
      url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
      alt: 'Health sciences students in clinical education seminar',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  // 4. Business, MBA, Finance, Economics, Entrepreneurship
  {
    match: (text) =>
      text.includes('business') ||
      text.includes('mba') ||
      text.includes('finance') ||
      text.includes('econom') ||
      text.includes('entrepreneur') ||
      text.includes('accounting') ||
      text.includes('management'),
    photo: {
      url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
      alt: 'Business and economics students in strategy workshop',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  // 5. Agriculture, Food Security, Environment, Botany
  {
    match: (text) =>
      text.includes('agri') ||
      text.includes('farm') ||
      text.includes('crop') ||
      text.includes('botany') ||
      text.includes('environmental') ||
      text.includes('food security'),
    photo: {
      url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
      alt: 'Students learning agricultural and environmental science',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  // 6. Research, PhD, Doctoral, Postdoc
  {
    match: (text) =>
      text.includes('phd') ||
      text.includes('doctoral') ||
      text.includes('doctorate') ||
      text.includes('postdoctoral') ||
      text.includes('research fellowship') ||
      text.includes('thesis'),
    photo: {
      url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      alt: 'Doctoral researcher studying at academic desk with books',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  // 7. Law, Public Policy, Governance, Social Sciences
  {
    match: (text) =>
      text.includes('law') ||
      text.includes('public policy') ||
      text.includes('governance') ||
      text.includes('social science') ||
      text.includes('international relations'),
    photo: {
      url: 'https://images.unsplash.com/photo-1534644107580-3a4dbd494a95?w=800&auto=format&fit=crop&q=80',
      alt: 'Student researching in academic library',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  // 8. International Study Abroad
  {
    match: (text) =>
      text.includes('study abroad') ||
      text.includes('international student') ||
      text.includes('overseas') ||
      text.includes('exchange'),
    photo: {
      url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
      alt: 'Diverse international students smiling together on university campus',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  // 9. Master's Degree (General)
  {
    match: (text) => text.includes('master') || text.includes('postgraduate') || text.includes('graduate'),
    photo: {
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80',
      alt: 'Graduate university students walking on campus with notebooks',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  },
  // 10. Undergraduate Degree (General)
  {
    match: (text) =>
      text.includes('undergraduate') ||
      text.includes('bachelor') ||
      text.includes('first degree') ||
      text.includes('tertiary'),
    photo: {
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
      alt: 'University students studying together with laptop on campus',
      attribution: 'Unsplash Educational Photography (Royalty-Free)'
    }
  }
];

/**
 * Curated pool of authentic African and Ghanaian educational photos rotated deterministically
 * to prevent visual repetition when no specific subject matches.
 */
const SCHOLARSHIP_VARIETY_POOL: ScholarshipPhoto[] = [
  {
    url: '/images/institutions/ghana_campus_students.jpg',
    alt: 'African university scholars walking on campus grounds with books',
    attribution: 'Opportunity Ghana Educational Media'
  },
  {
    url: '/images/institutions/ghana_tech_students.jpg',
    alt: 'African university students collaborating with laptops in modern study hall',
    attribution: 'Opportunity Ghana Educational Media'
  },
  {
    url: '/images/institutions/ghana_health_students.jpg',
    alt: 'African medical and healthcare university students in academic training',
    attribution: 'Opportunity Ghana Educational Media'
  },
  {
    url: '/images/institutions/ghana_seminar_students.jpg',
    alt: 'African university scholars in academic seminar lecture discussion',
    attribution: 'Opportunity Ghana Educational Media'
  },
  {
    url: '/images/institutions/ghana_graduates_celebrate.jpg',
    alt: 'Ghanaian university graduates celebrating academic convocation milestone',
    attribution: 'Opportunity Ghana Educational Media'
  },
  {
    url: '/images/ghana_student_workspace.jpg',
    alt: 'Young Ghanaian student with laptop in university workspace',
    attribution: 'Opportunity Ghana Official Media'
  },
  {
    url: '/images/ghana_hero_professionals.jpg',
    alt: 'Ghanaian university graduates celebrating academic milestone',
    attribution: 'Opportunity Ghana Official Media'
  }
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
 * Resolves a human-centered photograph for a scholarship opportunity based on
 * institution, subject, degree level, or deterministic variety pool.
 */
export function getHumanCenteredScholarshipImage(opp: Partial<Opportunity>): ScholarshipPhoto {
  const oppString = `${opp.title || ''} ${opp.organizationName || ''} ${opp.sourceUrl || ''}`;

  // 1. Check flagship providers
  for (const item of FLAGSHIP_SCHOLARSHIP_PHOTOS) {
    if (item.pattern.test(oppString)) {
      return item.photo;
    }
  }

  // 2. Check thematic keywords across opportunity fields
  const fullText = [
    opp.title || '',
    opp.description || '',
    opp.fieldOfStudy || '',
    opp.educationLevel || '',
    opp.opportunityType || '',
    opp.subcategory || '',
    opp.organizationName || ''
  ]
    .join(' ')
    .toLowerCase();

  for (const item of THEMATIC_SCHOLARSHIP_PHOTOS) {
    if (item.match(fullText)) {
      return item.photo;
    }
  }

  // 3. Fallback to deterministic variety rotation so cards don't repeat the same image
  const seed = `${opp.id || ''}-${opp.title || 'scholarship'}`;
  const idx = hashString(seed) % SCHOLARSHIP_VARIETY_POOL.length;
  return SCHOLARSHIP_VARIETY_POOL[idx];
}

export interface ResolvedCardMedia {
  /** If present, image URL to load */
  imageUrl: string | null;
  /** Image alternative text */
  imageAlt?: string;
  /** Image attribution or source note */
  imageAttribution?: string;
  /** Whether the image is a vector SVG */
  isSvg: boolean;
  /** Resolution hierarchy level */
  source: 'uploaded' | 'scholarship' | 'gradient';
  /** Gradient configuration for background or fallback */
  gradient: CategoryGradientConfig;
}

/**
 * Resolves the visual media for an Opportunity card according to the strict priority system:
 * 1. Valid uploaded / existing real image (preserves user/admin uploads)
 * 2. If scholarship: authentic, human-centered educational photograph matching provider or field of study
 * 3. If non-scholarship opportunity without image (Job, Internship, Grant, etc.): attractive category-based gradient
 */
export function resolveOpportunityMedia(opp: Partial<Opportunity>): ResolvedCardMedia {
  const gradient = getCategoryGradient(opp.category, 'opportunity');

  // 1. Check existing / uploaded image fields (preserves real photo uploads)
  const existingUrl =
    opp.imageUrl ||
    (opp as any).image ||
    (opp as any).coverImage ||
    (opp as any).thumbnail ||
    (opp as any).featuredImage;

  if (isUploadedRealImage(existingUrl)) {
    return {
      imageUrl: existingUrl!.trim(),
      isSvg: existingUrl!.endsWith('.svg'),
      source: 'uploaded',
      gradient
    };
  }

  // 2. Is this item a scholarship?
  const categoryLower = (opp.category || '').toLowerCase();
  const titleLower = (opp.title || '').toLowerCase();
  const typeLower = (opp.opportunityType || '').toLowerCase();

  const isScholarship =
    categoryLower.includes('scholarship') ||
    titleLower.includes('scholarship') ||
    titleLower.includes('bursary') ||
    typeLower.includes('scholarship') ||
    typeLower.includes('bursary');

  if (isScholarship) {
    const scholarshipPhoto = getHumanCenteredScholarshipImage(opp);
    return {
      imageUrl: scholarshipPhoto.url,
      imageAlt: scholarshipPhoto.alt,
      imageAttribution: scholarshipPhoto.attribution,
      isSvg: false,
      source: 'scholarship',
      gradient
    };
  }

  // 3. For any non-scholarship opportunity without an image (Job, Internship, Grant, etc.):
  // Automatically provide clean, attractive category-based gradient (no random photo)
  return {
    imageUrl: null,
    isSvg: false,
    source: 'gradient',
    gradient
  };
}

/**
 * Resolves the visual media for a Resource card according to:
 * 1. Valid uploaded image (preserves user/admin uploads)
 * 2. If no image: attractive, professional category-based gradient
 */
export function resolveResourceMedia(resource: Partial<Resource>): ResolvedCardMedia {
  const gradient = getCategoryGradient(resource.category, 'resource');

  const existingUrl =
    resource.imageUrl ||
    (resource as any).image ||
    (resource as any).coverImage ||
    (resource as any).thumbnail;

  if (isUploadedRealImage(existingUrl)) {
    return {
      imageUrl: existingUrl!.trim(),
      isSvg: existingUrl!.endsWith('.svg'),
      source: 'uploaded',
      gradient
    };
  }

  // No image: return clean, professional category gradient
  return {
    imageUrl: null,
    isSvg: false,
    source: 'gradient',
    gradient
  };
}
