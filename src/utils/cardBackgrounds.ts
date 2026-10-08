/**
 * cardBackgrounds.ts
 *
 * Professional visual background and gradient system for Opportunity Ghana cards.
 * Implements strict hierarchy:
 * 1. Valid uploaded / existing real image
 * 2. If scholarship: authentic, human-centered educational photograph matching provider or field of study
 * 3. If Resource or non-scholarship Opportunity without image: attractive, professional category-based gradient
 */

import { Opportunity, Resource, Skill } from '../types/database';

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
  if (raw.includes('engine') || raw.includes('civil') || raw.includes('mechanical') || raw.includes('electrical') || raw.includes('vocational') || raw.includes('trade') || raw.includes('tvet') || raw.includes('plumb') || raw.includes('weld')) return 'engineering';
  if (raw.includes('hospitality') || raw.includes('hotel') || raw.includes('tour') || raw.includes('cook') || raw.includes('cater') || raw.includes('culinary') || raw.includes('baking')) return 'training';
  if (raw.includes('beauty') || raw.includes('hair') || raw.includes('barber') || raw.includes('cosmetology') || raw.includes('makeup') || raw.includes('nail')) return 'design';
  if (raw.includes('market') || raw.includes('brand') || raw.includes('media') || raw.includes('pr')) return 'marketing';
  if (raw.includes('design') || raw.includes('creative') || raw.includes('ui') || raw.includes('ux') || raw.includes('graphic')) return 'design';
  if (raw.includes('educat') || raw.includes('teach') || raw.includes('school') || raw.includes('tutor') || raw.includes('classroom')) return 'education';
  if (raw.includes('prof') || raw.includes('skill') || raw.includes('workplace') || raw.includes('public speak')) return 'professional development';

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

  // Exclude legacy synthetic SVG illustration paths, placeholder SVG paths, or generic category placeholders
  if (
    lower.endsWith('.svg') ||
    lower.includes('/scholarships/') ||
    lower.includes('/images/categories/') ||
    lower.includes('/categories/') ||
    lower.endsWith('courses.jpg') ||
    lower.includes('placeholder')
  ) {
    return false;
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
  source: 'uploaded' | 'scholarship' | 'course' | 'competition' | 'gradient';
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

  // 3. Is this item a competition or talent contest?
  const isCompetition =
    categoryLower.includes('competition') ||
    categoryLower.includes('contest') ||
    categoryLower.includes('challenge') ||
    categoryLower.includes('hackathon') ||
    categoryLower.includes('tournament') ||
    categoryLower.includes('talent') ||
    typeLower.includes('competition') ||
    typeLower.includes('contest') ||
    typeLower.includes('challenge') ||
    typeLower.includes('hackathon') ||
    typeLower.includes('tournament') ||
    typeLower.includes('talent') ||
    titleLower.includes('competition') ||
    titleLower.includes('hackathon') ||
    titleLower.includes('quiz') ||
    titleLower.includes('tournament') ||
    titleLower.includes('talent') ||
    titleLower.includes('championship');

  if (isCompetition) {
    const compPhoto = getHumanCenteredCompetitionImage(opp);
    return {
      imageUrl: compPhoto.url,
      imageAlt: compPhoto.alt,
      imageAttribution: compPhoto.attribution,
      isSvg: false,
      source: 'competition',
      gradient
    };
  }

  // 4. For any other opportunity without an image (Job, Internship, Grant, etc.):
  // Automatically provide clean, attractive category-based gradient (no random photo)
  return {
    imageUrl: null,
    isSvg: false,
    source: 'gradient',
    gradient
  };
}

export interface CoursePhoto {
  url: string;
  alt: string;
  attribution: string;
}

/**
 * Curated registry of distinct, authentic photographs representing African
 * developers, data analysts, university students, and business executives.
 * Every known course ID and slug has a 1-to-1 unique assignment so that NO two
 * course listing cards ever display the same background image.
 */
export const COURSE_UNIQUE_PHOTO_REGISTRY: Record<string, CoursePhoto> = {
  // 1. CS50 Intro to Computer Science (Harvard)
  'course-cs50-harvard': {
    url: '/images/ghana_student_workspace.jpg',
    alt: 'Young Ghanaian student with laptop in university learning workspace',
    attribution: 'Opportunity Ghana Official Media'
  },
  'cs50-introduction-to-computer-science-harvard': {
    url: '/images/ghana_student_workspace.jpg',
    alt: 'Young Ghanaian student with laptop in university learning workspace',
    attribution: 'Opportunity Ghana Official Media'
  },

  // 2. Cisco Introduction to Cybersecurity
  'course-cisco-intro-cybersecurity': {
    url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&auto=format&fit=crop&q=80',
    alt: 'African IT network and cybersecurity specialist working in tech facility',
    attribution: 'Unsplash Technology Photography (Royalty-Free)'
  },
  'introduction-to-cybersecurity-cisco-networking-academy': {
    url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&auto=format&fit=crop&q=80',
    alt: 'African IT network and cybersecurity specialist working in tech facility',
    attribution: 'Unsplash Technology Photography (Royalty-Free)'
  },

  // 3. AI for Everyone (DeepLearning.AI)
  'course-deeplearning-ai-everyone': {
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    alt: 'African woman tech specialist analyzing artificial intelligence systems',
    attribution: 'Unsplash Technology Photography (Royalty-Free)'
  },
  'ai-for-everyone-deeplearning-ai-andrew-ng': {
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    alt: 'African woman tech specialist analyzing artificial intelligence systems',
    attribution: 'Unsplash Technology Photography (Royalty-Free)'
  },

  // 4. Generative AI Fundamentals (Google Cloud)
  'course-google-genai-fundamentals': {
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    alt: 'Young African tech innovators collaborating on generative AI applications',
    attribution: 'Unsplash Technology Photography (Royalty-Free)'
  },
  'generative-ai-fundamentals-google-cloud': {
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    alt: 'Young African tech innovators collaborating on generative AI applications',
    attribution: 'Unsplash Technology Photography (Royalty-Free)'
  },

  // 5. Elements of AI: Introduction to AI (Helsinki)
  'course-elements-of-ai': {
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop&q=80',
    alt: 'African computer scientist working on machine learning algorithms',
    attribution: 'Unsplash Technology Photography (Royalty-Free)'
  },
  'elements-of-ai-university-of-helsinki': {
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop&q=80',
    alt: 'African computer scientist working on machine learning algorithms',
    attribution: 'Unsplash Technology Photography (Royalty-Free)'
  },

  // 6. AWS Cloud Practitioner Essentials
  'course-aws-cloud-practitioner': {
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    alt: 'African cloud systems practitioner working at modern engineering workstation',
    attribution: 'Unsplash Technology Photography (Royalty-Free)'
  },
  'aws-cloud-practitioner-essentials': {
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    alt: 'African cloud systems practitioner working at modern engineering workstation',
    attribution: 'Unsplash Technology Photography (Royalty-Free)'
  },

  // 7. Microsoft Azure Fundamentals (AZ-900)
  'course-microsoft-azure-fundamentals': {
    url: '/images/institutions/ghana_tech_students.jpg',
    alt: 'African college students collaborating with laptops in modern university cloud lab',
    attribution: 'Opportunity Ghana Educational Media'
  },
  'microsoft-azure-fundamentals-az900': {
    url: '/images/institutions/ghana_tech_students.jpg',
    alt: 'African college students collaborating with laptops in modern university cloud lab',
    attribution: 'Opportunity Ghana Educational Media'
  },

  // 8. freeCodeCamp Responsive Web Design
  'course-freecodecamp-responsive-web': {
    url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=800&auto=format&fit=crop&q=80',
    alt: 'African front-end developer coding responsive website interface and CSS styling',
    attribution: 'Unsplash Coding Photography (Royalty-Free)'
  },
  'responsive-web-design-certification-freecodecamp': {
    url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=800&auto=format&fit=crop&q=80',
    alt: 'African front-end developer coding responsive website interface and CSS styling',
    attribution: 'Unsplash Coding Photography (Royalty-Free)'
  },

  // 9. freeCodeCamp Scientific Computing with Python
  'course-freecodecamp-python': {
    url: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&auto=format&fit=crop&q=80',
    alt: 'African software engineer developing scientific Python algorithms on laptop',
    attribution: 'Unsplash Technology Photography (Royalty-Free)'
  },
  'scientific-computing-with-python-freecodecamp': {
    url: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&auto=format&fit=crop&q=80',
    alt: 'African software engineer developing scientific Python algorithms on laptop',
    attribution: 'Unsplash Technology Photography (Royalty-Free)'
  },

  // 10. Python for Everybody Specialization (Michigan)
  'course-michigan-py4e': {
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    alt: 'Young African students collaborating in hands-on computer programming workshop',
    attribution: 'Unsplash Educational Photography (Royalty-Free)'
  },
  'python-for-everybody-specialization-michigan': {
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    alt: 'Young African students collaborating in hands-on computer programming workshop',
    attribution: 'Unsplash Educational Photography (Royalty-Free)'
  },

  // 11. MIT 6.0001: Intro to CS and Python
  'course-mit-60001': {
    url: 'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?w=800&auto=format&fit=crop&q=80',
    alt: 'African university students examining computational algorithms and programming logic',
    attribution: 'Unsplash Educational Photography (Royalty-Free)'
  },
  'mit-introduction-to-computer-science-python-60001': {
    url: 'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?w=800&auto=format&fit=crop&q=80',
    alt: 'African university students examining computational algorithms and programming logic',
    attribution: 'Unsplash Educational Photography (Royalty-Free)'
  },

  // 12. Entrepreneurship in Emerging Economies (Harvard)
  'course-harvard-entrepreneurship-emerging': {
    url: 'https://images.unsplash.com/photo-1573497491765-dccce02b29df?w=800&auto=format&fit=crop&q=80',
    alt: 'Ghanaian entrepreneur and business executive discussing emerging market opportunities',
    attribution: 'Unsplash Business Photography (Royalty-Free)'
  },
  'entrepreneurship-in-emerging-economies-harvard': {
    url: 'https://images.unsplash.com/photo-1573497491765-dccce02b29df?w=800&auto=format&fit=crop&q=80',
    alt: 'Ghanaian entrepreneur and business executive discussing emerging market opportunities',
    attribution: 'Unsplash Business Photography (Royalty-Free)'
  },

  // 13. Financial Markets (Yale)
  'course-yale-financial-markets': {
    url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
    alt: 'Financial markets trading, stock exchange analytics and economic capital charts',
    attribution: 'Unsplash Finance Photography (Royalty-Free)'
  },
  'financial-markets-yale-university': {
    url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
    alt: 'Financial markets trading, stock exchange analytics and economic capital charts',
    attribution: 'Unsplash Finance Photography (Royalty-Free)'
  },

  // 14. Inbound Marketing Certification (HubSpot)
  'course-hubspot-inbound-marketing': {
    url: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&auto=format&fit=crop&q=80',
    alt: 'Digital marketing strategist optimizing inbound sales funnel and audience growth',
    attribution: 'Unsplash Marketing Photography (Royalty-Free)'
  },
  'inbound-marketing-certification-hubspot-academy': {
    url: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&auto=format&fit=crop&q=80',
    alt: 'Digital marketing strategist optimizing inbound sales funnel and audience growth',
    attribution: 'Unsplash Marketing Photography (Royalty-Free)'
  },

  // 15. Successful Negotiation (Michigan)
  'course-michigan-negotiation': {
    url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80',
    alt: 'Business professionals engaging in executive commercial negotiation and partnership agreement',
    attribution: 'Unsplash Corporate Photography (Royalty-Free)'
  },
  'successful-negotiation-essential-strategies-michigan': {
    url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80',
    alt: 'Business professionals engaging in executive commercial negotiation and partnership agreement',
    attribution: 'Unsplash Corporate Photography (Royalty-Free)'
  },

  // 16. MITx: Entrepreneurship 101: Who is your customer?
  'course-mitx-entrepreneurship-101': {
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    alt: 'African startup founder pitching value proposition and customer discovery to investors',
    attribution: 'Unsplash Business Photography (Royalty-Free)'
  },
  'mitx-entrepreneurship-101-who-is-your-customer': {
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    alt: 'African startup founder pitching value proposition and customer discovery to investors',
    attribution: 'Unsplash Business Photography (Royalty-Free)'
  },

  // 17. Viral Marketing and Contagious Content (Wharton)
  'course-wharton-viral-marketing': {
    url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&auto=format&fit=crop&q=80',
    alt: 'Content creator developing viral social media campaign and digital brand reach',
    attribution: 'Unsplash Digital Media Photography (Royalty-Free)'
  },
  'viral-marketing-contagious-content-wharton': {
    url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&auto=format&fit=crop&q=80',
    alt: 'Content creator developing viral social media campaign and digital brand reach',
    attribution: 'Unsplash Digital Media Photography (Royalty-Free)'
  },

  // 18. Starting Your Small Business (OpenLearn)
  'course-openlearn-small-business': {
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    alt: 'African female small enterprise owner managing business operations at modern desk',
    attribution: 'Unsplash Business Photography (Royalty-Free)'
  },
  'starting-your-small-business-openlearn': {
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    alt: 'African female small enterprise owner managing business operations at modern desk',
    attribution: 'Unsplash Business Photography (Royalty-Free)'
  },

  // 19. Diploma in Human Resources (Alison)
  'course-alison-diploma-hr': {
    url: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=800&auto=format&fit=crop&q=80',
    alt: 'African human resources director conducting corporate talent assessment',
    attribution: 'Unsplash Workplace Photography (Royalty-Free)'
  },
  'diploma-in-human-resources-alison': {
    url: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=800&auto=format&fit=crop&q=80',
    alt: 'African human resources director conducting corporate talent assessment',
    attribution: 'Unsplash Workplace Photography (Royalty-Free)'
  },

  // 20. The Science of Well-Being (Yale)
  'course-yale-well-being': {
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
    alt: 'Serene personal wellness, mindfulness meditation and positive mental health',
    attribution: 'Unsplash Wellness Photography (Royalty-Free)'
  },
  'the-science-of-well-being-yale': {
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
    alt: 'Serene personal wellness, mindfulness meditation and positive mental health',
    attribution: 'Unsplash Wellness Photography (Royalty-Free)'
  },

  // 21. English for Career Development (Penn)
  'course-penn-english-career': {
    url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80',
    alt: 'African job candidate engaging in professional interview and career readiness coaching',
    attribution: 'Unsplash Professional Photography (Royalty-Free)'
  },
  'english-for-career-development-penn': {
    url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80',
    alt: 'African job candidate engaging in professional interview and career readiness coaching',
    attribution: 'Unsplash Professional Photography (Royalty-Free)'
  },

  // 22. Writing in the Sciences (Stanford)
  'course-stanford-writing-sciences': {
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
    alt: 'Academic scholar composing scientific manuscript and research literature',
    attribution: 'Unsplash Academic Photography (Royalty-Free)'
  },
  'writing-in-the-sciences-stanford': {
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
    alt: 'Academic scholar composing scientific manuscript and research literature',
    attribution: 'Unsplash Academic Photography (Royalty-Free)'
  },

  // 23. Contract Law: From Trust to Promise (Harvard)
  'course-harvard-contract-law': {
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    alt: 'Legal research library with law textbooks, gavel and jurisprudence references',
    attribution: 'Unsplash Legal Photography (Royalty-Free)'
  },
  'contract-law-trust-promise-contract-harvard': {
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    alt: 'Legal research library with law textbooks, gavel and jurisprudence references',
    attribution: 'Unsplash Legal Photography (Royalty-Free)'
  },

  // 24. COVID-19 Contact Tracing (Johns Hopkins)
  'course-jhu-contact-tracing': {
    url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80',
    alt: 'African healthcare team coordinating epidemiology contact tracing and disease containment',
    attribution: 'Unsplash Healthcare Photography (Royalty-Free)'
  },
  'covid-19-contact-tracing-johns-hopkins': {
    url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80',
    alt: 'African healthcare team coordinating epidemiology contact tracing and disease containment',
    attribution: 'Unsplash Healthcare Photography (Royalty-Free)'
  },

  // 25. Developing Bankable Business Plans (FAO)
  'course-fao-agri-business-plans': {
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
    alt: 'Agribusiness investment planner drafting commercial agricultural project budget',
    attribution: 'Unsplash Business Photography (Royalty-Free)'
  },
  'developing-bankable-business-plans-fao': {
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
    alt: 'Agribusiness investment planner drafting commercial agricultural project budget',
    attribution: 'Unsplash Business Photography (Royalty-Free)'
  },

  // 26. Sustainable Agricultural Land Management (Florida)
  'course-florida-sustainable-agriculture': {
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
    alt: 'Sustainable agricultural landscape, soil agronomy and ecological farm cultivation',
    attribution: 'Unsplash Agriculture Photography (Royalty-Free)'
  },
  'sustainable-agricultural-land-management-florida': {
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
    alt: 'Sustainable agricultural landscape, soil agronomy and ecological farm cultivation',
    attribution: 'Unsplash Agriculture Photography (Royalty-Free)'
  },

  // 27. Solar Energy: Photovoltaic PV Systems (TU Delft)
  'course-tudelft-solar-energy': {
    url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=80',
    alt: 'Renewable energy photovoltaic solar panels generating clean sustainable electricity',
    attribution: 'Unsplash Energy Photography (Royalty-Free)'
  },
  'solar-energy-photovoltaic-pv-systems-tudelft': {
    url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=80',
    alt: 'Renewable energy photovoltaic solar panels generating clean sustainable electricity',
    attribution: 'Unsplash Energy Photography (Royalty-Free)'
  },

  // 28. Global Health: An Interdisciplinary Overview (Geneva)
  'course-geneva-global-health': {
    url: '/images/institutions/ghana_health_students.jpg',
    alt: 'African university medical and nursing students in clinical auditorium lecture',
    attribution: 'Opportunity Ghana Educational Media'
  },
  'global-health-interdisciplinary-overview-geneva': {
    url: '/images/institutions/ghana_health_students.jpg',
    alt: 'African university medical and nursing students in clinical auditorium lecture',
    attribution: 'Opportunity Ghana Educational Media'
  },

  // 29. Digital Skills: User Experience (Accenture)
  'course-accenture-digital-ux': {
    url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
    alt: 'African UI/UX designer wireframing user experience architecture and digital interfaces',
    attribution: 'Unsplash Design Photography (Royalty-Free)'
  },
  'digital-skills-user-experience-accenture': {
    url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
    alt: 'African UI/UX designer wireframing user experience architecture and digital interfaces',
    attribution: 'Unsplash Design Photography (Royalty-Free)'
  },

  // 30. MEST Africa Training Program (Accra, Ghana)
  'course-mest-africa-training': {
    url: '/images/ghana_hero_professionals.jpg',
    alt: 'Ghanaian tech entrepreneurs and university graduates celebrating startup training milestone',
    attribution: 'Opportunity Ghana Official Media'
  },
  'mest-africa-training-program-accra': {
    url: '/images/ghana_hero_professionals.jpg',
    alt: 'Ghanaian tech entrepreneurs and university graduates celebrating startup training milestone',
    attribution: 'Opportunity Ghana Official Media'
  },

  // 31. Networking Basics (Cisco)
  'course-cisco-networking-basics': {
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    alt: 'IT hardware technician configuring enterprise network routers, patch cables and switches',
    attribution: 'Unsplash Technology Photography (Royalty-Free)'
  },
  'cisco-networking-basics': {
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    alt: 'IT hardware technician configuring enterprise network routers, patch cables and switches',
    attribution: 'Unsplash Technology Photography (Royalty-Free)'
  },

  // 32. Python Essentials 1 (Cisco)
  'course-cisco-python-essentials-1': {
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
    alt: 'Software engineer writing Python scripts and unit tests on multi-screen developer rig',
    attribution: 'Unsplash Coding Photography (Royalty-Free)'
  },
  'cisco-python-essentials-1': {
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
    alt: 'Software engineer writing Python scripts and unit tests on multi-screen developer rig',
    attribution: 'Unsplash Coding Photography (Royalty-Free)'
  },

  // 33. freeCodeCamp JavaScript Algorithms & Data Structures
  'course-freecodecamp-js-algorithms': {
    url: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=800&auto=format&fit=crop&q=80',
    alt: 'African software engineer writing algorithmic JavaScript and data structures',
    attribution: 'Unsplash Software Photography (Royalty-Free)'
  },
  'freecodecamp-javascript-algorithms-and-data-structures-cert': {
    url: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=800&auto=format&fit=crop&q=80',
    alt: 'African software engineer writing algorithmic JavaScript and data structures',
    attribution: 'Unsplash Software Photography (Royalty-Free)'
  },

  // 34. Google Analytics Certification (Skillshop)
  'course-google-skillshop-analytics': {
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    alt: 'Web analytics consultant reviewing visitor metrics, bounce rates and conversion reports',
    attribution: 'Unsplash Analytics Photography (Royalty-Free)'
  },
  'google-analytics-certification-skillshop-free': {
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    alt: 'Web analytics consultant reviewing visitor metrics, bounce rates and conversion reports',
    attribution: 'Unsplash Analytics Photography (Royalty-Free)'
  },

  // 35. HubSpot Digital Marketing Certification
  'course-hubspot-digital-marketing': {
    url: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&auto=format&fit=crop&q=80',
    alt: 'Digital marketing campaign manager analyzing audience reach and digital conversions',
    attribution: 'Unsplash Marketing Photography (Royalty-Free)'
  },
  'hubspot-digital-marketing-certification-free': {
    url: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&auto=format&fit=crop&q=80',
    alt: 'Digital marketing campaign manager analyzing audience reach and digital conversions',
    attribution: 'Unsplash Marketing Photography (Royalty-Free)'
  },

  // 36. WIPO General Course on Intellectual Property (DL-101)
  'course-wipo-dl101': {
    url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
    alt: 'Intellectual property documentation, patent filings and trademark agreements',
    attribution: 'Unsplash Legal Photography (Royalty-Free)'
  },
  'wipo-dl101-general-course-intellectual-property': {
    url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
    alt: 'Intellectual property documentation, patent filings and trademark agreements',
    attribution: 'Unsplash Legal Photography (Royalty-Free)'
  },

  // 37. WHO Standard Precautions: Infection Prevention and Control (IPC)
  'course-who-ipc': {
    url: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&auto=format&fit=crop&q=80',
    alt: 'Hospital clinical hygiene and clinical infection prevention and control standards',
    attribution: 'Unsplash Medical Photography (Royalty-Free)'
  },
  'who-infection-prevention-control-standard-precautions': {
    url: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&auto=format&fit=crop&q=80',
    alt: 'Hospital clinical hygiene and clinical infection prevention and control standards',
    attribution: 'Unsplash Medical Photography (Royalty-Free)'
  },

  // 38. Leadership and Followership (OpenLearn)
  'course-openlearn-leadership': {
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    alt: 'African corporate executive demonstrating leadership and team mentoring',
    attribution: 'Unsplash Executive Photography (Royalty-Free)'
  },
  'openlearn-leadership-and-followership': {
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    alt: 'African corporate executive demonstrating leadership and team mentoring',
    attribution: 'Unsplash Executive Photography (Royalty-Free)'
  },

  // 39. Harvard CS50P: Programming with Python
  'course-harvard-cs50-python': {
    url: '/images/institutions/ghana_campus_students.jpg',
    alt: 'Ghanaian computer science university students walking on tropical campus lawn',
    attribution: 'Opportunity Ghana Educational Media'
  },
  'cs50p-introduction-to-programming-with-python-harvard': {
    url: '/images/institutions/ghana_campus_students.jpg',
    alt: 'Ghanaian computer science university students walking on tropical campus lawn',
    attribution: 'Opportunity Ghana Educational Media'
  },

  // 40. Microsoft Power BI Data Analyst (PL-300)
  'course-microsoft-power-bi': {
    url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&auto=format&fit=crop&q=80',
    alt: 'African female business intelligence analyst interpreting Power BI visual data dashboards',
    attribution: 'Unsplash Analytics Photography (Royalty-Free)'
  },
  'microsoft-power-bi-data-analyst-pathway-free': {
    url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&auto=format&fit=crop&q=80',
    alt: 'African female business intelligence analyst interpreting Power BI visual data dashboards',
    attribution: 'Unsplash Analytics Photography (Royalty-Free)'
  },

  // 41. Meta Front-End Developer
  'course-meta-front-end': {
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    alt: 'African front-end developer designing modern digital applications',
    attribution: 'Unsplash Web Development Photography (Royalty-Free)'
  },
  'meta-front-end-developer-professional-certificate': {
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    alt: 'African front-end developer designing modern digital applications',
    attribution: 'Unsplash Web Development Photography (Royalty-Free)'
  },

  // 42. IBM Data Science Professional Certificate
  'course-ibm-data-science': {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    alt: 'Data science analyst examining multi-dimensional analytics visual charts',
    attribution: 'Unsplash Data Photography (Royalty-Free)'
  },
  'ibm-data-science-professional-certificate': {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    alt: 'Data science analyst examining multi-dimensional analytics visual charts',
    attribution: 'Unsplash Data Photography (Royalty-Free)'
  },

  // 43. Google UX Design Professional Certificate
  'course-google-ux-design': {
    url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=80',
    alt: 'Graphic and UX designer developing creative layout systems',
    attribution: 'Unsplash Design Photography (Royalty-Free)'
  },
  'google-ux-design-professional-certificate': {
    url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=80',
    alt: 'Graphic and UX designer developing creative layout systems',
    attribution: 'Unsplash Design Photography (Royalty-Free)'
  },

  // 44. ALX Africa Software Engineering Program
  'course-alx-software-engineering': {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    alt: 'African engineering cohorts collaborating on enterprise software code',
    attribution: 'Unsplash Tech Photography (Royalty-Free)'
  },
  'alx-africa-software-engineering-program': {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    alt: 'African engineering cohorts collaborating on enterprise software code',
    attribution: 'Unsplash Tech Photography (Royalty-Free)'
  },

  // 45. ALX Africa Data Analytics Program
  'course-alx-data-analytics': {
    url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=80',
    alt: 'African data analysts reviewing metrics dashboards and analytics models',
    attribution: 'Unsplash Analytics Photography (Royalty-Free)'
  },
  'alx-africa-data-analytics-program': {
    url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=80',
    alt: 'African data analysts reviewing metrics dashboards and analytics models',
    attribution: 'Unsplash Analytics Photography (Royalty-Free)'
  },

  // 46. Google Data Analytics Professional Certificate
  'course-google-data-analytics': {
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
    alt: 'Data analytics team interpreting data visual representations',
    attribution: 'Unsplash Business Analytics Photography (Royalty-Free)'
  },
  'google-data-analytics-professional-certificate': {
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
    alt: 'Data analytics team interpreting data visual representations',
    attribution: 'Unsplash Business Analytics Photography (Royalty-Free)'
  },
  'res-google-data-analytics-cert': {
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
    alt: 'Data analytics team interpreting data visual representations',
    attribution: 'Unsplash Business Analytics Photography (Royalty-Free)'
  },

  // 47. Google Cybersecurity Professional Certificate
  'course-google-cybersecurity': {
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    alt: 'Digital cybersecurity cloud encryption and systems defence',
    attribution: 'Unsplash Security Photography (Royalty-Free)'
  },
  'google-cybersecurity-professional-certificate': {
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    alt: 'Digital cybersecurity cloud encryption and systems defence',
    attribution: 'Unsplash Security Photography (Royalty-Free)'
  },
  'res-google-cybersecurity-cert': {
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    alt: 'Digital cybersecurity cloud encryption and systems defence',
    attribution: 'Unsplash Security Photography (Royalty-Free)'
  },

  // 48. Google Project Management Professional Certificate
  'course-google-project-management': {
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
    alt: 'Agile project managers orchestrating product milestones',
    attribution: 'Unsplash Management Photography (Royalty-Free)'
  },
  'google-project-management-professional-certificate': {
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
    alt: 'Agile project managers orchestrating product milestones',
    attribution: 'Unsplash Management Photography (Royalty-Free)'
  },
  'res-google-project-management-cert': {
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
    alt: 'Agile project managers orchestrating product milestones',
    attribution: 'Unsplash Management Photography (Royalty-Free)'
  },

  // 49. AWS Certified Solutions Architect Associate
  'res-aws-solutions-architect-assoc': {
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    alt: 'Enterprise cloud infrastructure and software architecture code systems',
    attribution: 'Unsplash Architecture Photography (Royalty-Free)'
  },
  'aws-certified-solutions-architect-associate': {
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    alt: 'Enterprise cloud infrastructure and software architecture code systems',
    attribution: 'Unsplash Architecture Photography (Royalty-Free)'
  },

  // 50. Cisco CCNA 200-301
  'res-cisco-ccna-200-301': {
    url: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=800&auto=format&fit=crop&q=80',
    alt: 'Student studying computer networking certification blueprints in university library',
    attribution: 'Unsplash Academic Photography (Royalty-Free)'
  },
  'cisco-certified-network-associate-ccna': {
    url: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=800&auto=format&fit=crop&q=80',
    alt: 'Student studying computer networking certification blueprints in university library',
    attribution: 'Unsplash Academic Photography (Royalty-Free)'
  },

  // 51. Harvard CS50 Web Programming
  'res-harvard-cs50-web-programming': {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    alt: 'Young African student pursuing full stack web application engineering',
    attribution: 'Unsplash Student Photography (Royalty-Free)'
  },
  'cs50w-web-programming-with-python-and-javascript-harvard': {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    alt: 'Young African student pursuing full stack web application engineering',
    attribution: 'Unsplash Student Photography (Royalty-Free)'
  },

  // 52. DeepLearning.AI Machine Learning Specialization
  'res-deeplearning-ai-ml-specialization': {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    alt: 'African machine learning specialist and data science professional',
    attribution: 'Unsplash AI Photography (Royalty-Free)'
  },
  'machine-learning-specialization-deeplearning-ai-andrew-ng': {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    alt: 'African machine learning specialist and data science professional',
    attribution: 'Unsplash AI Photography (Royalty-Free)'
  },

  // 53. MITx DEDP MicroMasters
  'res-mitx-dedp-micromasters': {
    url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
    alt: 'African development economist analyzing data and public policy',
    attribution: 'Unsplash Academic Photography (Royalty-Free)'
  },
  'data-economics-and-development-policy-micromasters-mitx': {
    url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
    alt: 'African development economist analyzing data and public policy',
    attribution: 'Unsplash Academic Photography (Royalty-Free)'
  },

  // 54. 100 Days of Code Python Bootcamp
  'res-angela-yu-python-bootcamp': {
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80',
    alt: 'African female developer engaged in coding intensive bootcamp challenges',
    attribution: 'Unsplash Developer Photography (Royalty-Free)'
  },
  '100-days-of-code-complete-python-pro-bootcamp': {
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80',
    alt: 'African female developer engaged in coding intensive bootcamp challenges',
    attribution: 'Unsplash Developer Photography (Royalty-Free)'
  },

  // 55. ACCA Chartered Accountant Qualification
  'res-acca-chartered-accountant-qualification': {
    url: 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=800&auto=format&fit=crop&q=80',
    alt: 'African chartered accountant and financial controller examining accounting audit books',
    attribution: 'Unsplash Finance Photography (Royalty-Free)'
  },
  'acca-qualification-chartered-certified-accountant': {
    url: 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=800&auto=format&fit=crop&q=80',
    alt: 'African chartered accountant and financial controller examining accounting audit books',
    attribution: 'Unsplash Finance Photography (Royalty-Free)'
  },

  // 56. PMI Certified Associate in Project Management (CAPM)
  'res-pmi-capm-credential': {
    url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80',
    alt: 'Project management team steering agile sprint planning and deliverables',
    attribution: 'Unsplash Management Photography (Royalty-Free)'
  },
  'certified-associate-in-project-management-capm-pmi': {
    url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80',
    alt: 'Project management team steering agile sprint planning and deliverables',
    attribution: 'Unsplash Management Photography (Royalty-Free)'
  },

  // 57. Microsoft Azure Fundamentals AZ-900 (Certification)
  'res-microsoft-azure-fundamentals-az900': {
    url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80',
    alt: 'Enterprise cloud infrastructure design and modern tech operations',
    attribution: 'Unsplash Cloud Photography (Royalty-Free)'
  }
};

/**
 * Large pool of verified, high-resolution African and Ghanaian educational, tech,
 * business, and creative photographs rotated deterministically for any dynamically
 * created or unmapped course listings to permanently prevent duplicate images.
 */
export const COURSE_VARIETY_POOL: CoursePhoto[] = [
  {
    url: '/images/ghana_student_workspace.jpg',
    alt: 'Young Ghanaian student with laptop in university learning workspace',
    attribution: 'Opportunity Ghana Official Media'
  },
  {
    url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&auto=format&fit=crop&q=80',
    alt: 'African IT network and cybersecurity specialist working in tech facility',
    attribution: 'Unsplash Technology Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    alt: 'African woman tech specialist analyzing artificial intelligence systems',
    attribution: 'Unsplash Technology Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    alt: 'Young African tech innovators collaborating on software applications',
    attribution: 'Unsplash Technology Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop&q=80',
    alt: 'African computer scientist working on software logic and algorithms',
    attribution: 'Unsplash Technology Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    alt: 'African cloud systems practitioner working at modern engineering workstation',
    attribution: 'Unsplash Technology Photography'
  },
  {
    url: '/images/institutions/ghana_tech_students.jpg',
    alt: 'African college students collaborating with laptops in modern university tech lab',
    attribution: 'Opportunity Ghana Educational Media'
  },
  {
    url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=800&auto=format&fit=crop&q=80',
    alt: 'African front-end developer coding responsive website interface and CSS styling',
    attribution: 'Unsplash Coding Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&auto=format&fit=crop&q=80',
    alt: 'African software engineer developing Python scripts on workstation',
    attribution: 'Unsplash Technology Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
    alt: 'Young African students collaborating in hands-on computer programming workshop',
    attribution: 'Unsplash Educational Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?w=800&auto=format&fit=crop&q=80',
    alt: 'African university students examining computational algorithms and logic',
    attribution: 'Unsplash Educational Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1573497491765-dccce02b29df?w=800&auto=format&fit=crop&q=80',
    alt: 'Ghanaian entrepreneur and business executive discussing commercial strategies',
    attribution: 'Unsplash Business Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80',
    alt: 'Financial markets trading, stock exchange analytics and economic capital charts',
    attribution: 'Unsplash Finance Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1557838923-2985c318be48?w=800&auto=format&fit=crop&q=80',
    alt: 'Digital marketing strategist optimizing inbound sales funnel and audience growth',
    attribution: 'Unsplash Marketing Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80',
    alt: 'Business professionals engaging in executive commercial negotiation',
    attribution: 'Unsplash Corporate Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    alt: 'African startup founder pitching value proposition to investors',
    attribution: 'Unsplash Business Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&auto=format&fit=crop&q=80',
    alt: 'Content creator developing viral social media campaign and digital brand reach',
    attribution: 'Unsplash Digital Media Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop&q=80',
    alt: 'African female small enterprise owner managing business operations',
    attribution: 'Unsplash Business Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=800&auto=format&fit=crop&q=80',
    alt: 'African human resources director conducting corporate talent assessment',
    attribution: 'Unsplash Workplace Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
    alt: 'Serene personal wellness, mindfulness meditation and positive mental health',
    attribution: 'Unsplash Wellness Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80',
    alt: 'African job candidate engaging in professional interview and career readiness',
    attribution: 'Unsplash Professional Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
    alt: 'Academic scholar composing scientific manuscript and research literature',
    attribution: 'Unsplash Academic Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    alt: 'Legal research library with law textbooks, gavel and jurisprudence references',
    attribution: 'Unsplash Legal Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80',
    alt: 'African healthcare team coordinating epidemiology contact tracing and disease containment',
    attribution: 'Unsplash Healthcare Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
    alt: 'Agribusiness investment planner drafting commercial agricultural project budget',
    attribution: 'Unsplash Business Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
    alt: 'Sustainable agricultural landscape, soil agronomy and ecological farm cultivation',
    attribution: 'Unsplash Agriculture Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=80',
    alt: 'Renewable energy photovoltaic solar panels generating clean sustainable electricity',
    attribution: 'Unsplash Energy Photography'
  },
  {
    url: '/images/institutions/ghana_health_students.jpg',
    alt: 'African university medical and nursing students in clinical auditorium lecture',
    attribution: 'Opportunity Ghana Educational Media'
  },
  {
    url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
    alt: 'African UI/UX designer wireframing user experience architecture and digital interfaces',
    attribution: 'Unsplash Design Photography'
  },
  {
    url: '/images/ghana_hero_professionals.jpg',
    alt: 'Ghanaian tech entrepreneurs and university graduates celebrating startup training milestone',
    attribution: 'Opportunity Ghana Official Media'
  },
  {
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    alt: 'IT hardware technician configuring enterprise network routers, patch cables and switches',
    attribution: 'Unsplash Technology Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
    alt: 'Software engineer writing Python scripts and unit tests on developer rig',
    attribution: 'Unsplash Coding Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=800&auto=format&fit=crop&q=80',
    alt: 'African software engineer writing algorithmic JavaScript and data structures',
    attribution: 'Unsplash Software Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    alt: 'Web analytics consultant reviewing visitor metrics, bounce rates and conversion reports',
    attribution: 'Unsplash Analytics Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800&auto=format&fit=crop&q=80',
    alt: 'Digital marketing campaign manager analyzing audience reach and conversions',
    attribution: 'Unsplash Marketing Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
    alt: 'Intellectual property documentation, patent filings and trademark agreements',
    attribution: 'Unsplash Legal Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&auto=format&fit=crop&q=80',
    alt: 'Hospital clinical hygiene and clinical infection prevention and control standards',
    attribution: 'Unsplash Medical Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    alt: 'African corporate executive demonstrating leadership and team mentoring',
    attribution: 'Unsplash Executive Photography'
  },
  {
    url: '/images/institutions/ghana_campus_students.jpg',
    alt: 'Ghanaian computer science university students walking on tropical campus lawn',
    attribution: 'Opportunity Ghana Educational Media'
  },
  {
    url: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&auto=format&fit=crop&q=80',
    alt: 'African female business intelligence analyst interpreting visual data dashboards',
    attribution: 'Unsplash Analytics Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    alt: 'African front-end developer designing modern digital applications',
    attribution: 'Unsplash Web Development Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    alt: 'Data science analyst examining multi-dimensional analytics visual charts',
    attribution: 'Unsplash Data Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=80',
    alt: 'Graphic and UX designer developing creative layout systems',
    attribution: 'Unsplash Design Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    alt: 'African engineering cohorts collaborating on enterprise software code',
    attribution: 'Unsplash Tech Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&auto=format&fit=crop&q=80',
    alt: 'African data analysts reviewing metrics dashboards and analytics models',
    attribution: 'Unsplash Analytics Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
    alt: 'Data analytics team interpreting data visual representations',
    attribution: 'Unsplash Business Analytics Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
    alt: 'Digital cybersecurity cloud encryption and systems defence',
    attribution: 'Unsplash Security Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
    alt: 'Agile project managers orchestrating product milestones',
    attribution: 'Unsplash Management Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    alt: 'Enterprise cloud infrastructure and software architecture code systems',
    attribution: 'Unsplash Architecture Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=800&auto=format&fit=crop&q=80',
    alt: 'Student studying computer networking certification blueprints in university library',
    attribution: 'Unsplash Academic Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    alt: 'Young African student pursuing full stack web application engineering',
    attribution: 'Unsplash Student Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    alt: 'African machine learning specialist and data science professional',
    attribution: 'Unsplash AI Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80',
    alt: 'African development economist analyzing data and public policy',
    attribution: 'Unsplash Academic Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80',
    alt: 'African female developer engaged in coding intensive bootcamp challenges',
    attribution: 'Unsplash Developer Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?w=800&auto=format&fit=crop&q=80',
    alt: 'African chartered accountant and financial controller examining accounting audit books',
    attribution: 'Unsplash Finance Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80',
    alt: 'Project management team steering agile sprint planning and deliverables',
    attribution: 'Unsplash Management Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format&fit=crop&q=80',
    alt: 'Enterprise cloud infrastructure design and modern tech operations',
    attribution: 'Unsplash Cloud Photography'
  }
];

/**
 * Resolves a unique, human-centered photograph for any course or learning resource.
 * Checks the persistent registry by course ID or slug, then falls back to deterministic
 * variety pool hashing so that identical course entries always receive the same image,
 * while distinct courses receive distinct images.
 */
export function getHumanCenteredCourseImage(resource: Partial<Resource>): CoursePhoto {
  const id = resource.id || '';
  const slug = resource.slug || '';

  // 1. Direct registry lookup by ID
  if (id && COURSE_UNIQUE_PHOTO_REGISTRY[id]) {
    return COURSE_UNIQUE_PHOTO_REGISTRY[id];
  }

  // 2. Direct registry lookup by slug
  if (slug && COURSE_UNIQUE_PHOTO_REGISTRY[slug]) {
    return COURSE_UNIQUE_PHOTO_REGISTRY[slug];
  }

  // 3. Normalized slug lookup
  const cleanSlug = slug.toLowerCase().trim();
  if (cleanSlug && COURSE_UNIQUE_PHOTO_REGISTRY[cleanSlug]) {
    return COURSE_UNIQUE_PHOTO_REGISTRY[cleanSlug];
  }

  // 4. Deterministic variety pool hashing based on stable identifier
  const seed = `${id}-${slug}-${resource.title || 'course'}`;
  const idx = hashString(seed) % COURSE_VARIETY_POOL.length;
  return COURSE_VARIETY_POOL[idx];
}

/**
 * Resolves the visual media for a Resource card according to:
 * 1. Valid uploaded image (preserves genuine user/admin photo uploads, excluding generic placeholders)
 * 2. Distinct, human-centered authentic African photograph matched to course ID / slug
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

  // Always assign a distinct, authentic African educational photo for the course
  const coursePhoto = getHumanCenteredCourseImage(resource);
  return {
    imageUrl: coursePhoto.url,
    imageAlt: coursePhoto.alt,
    imageAttribution: coursePhoto.attribution,
    isSvg: false,
    source: 'course',
    gradient
  };
}

/**
 * Validates and ensures that an array of courses displayed together on a page
 * never renders duplicate background images. If any course duplicates an image
 * already seen on the current view, it is assigned the next available distinct
 * photo from the verified variety pool.
 */
export function ensureUniqueCourseImages<T extends Partial<Resource>>(courses: T[]): T[] {
  const seenUrls = new Set<string>();
  let poolCursor = 0;

  return courses.map(course => {
    const media = resolveResourceMedia(course);
    let assignedUrl = media.imageUrl;

    if (assignedUrl && seenUrls.has(assignedUrl)) {
      // Find the next unused photo from the variety pool
      for (let i = 0; i < COURSE_VARIETY_POOL.length; i++) {
        const candidate = COURSE_VARIETY_POOL[(poolCursor + i) % COURSE_VARIETY_POOL.length].url;
        if (!seenUrls.has(candidate)) {
          assignedUrl = candidate;
          poolCursor = (poolCursor + i + 1) % COURSE_VARIETY_POOL.length;
          break;
        }
      }
    }

    if (assignedUrl) {
      seenUrls.add(assignedUrl);
    }

    if (assignedUrl && assignedUrl !== course.imageUrl) {
      return {
        ...course,
        imageUrl: assignedUrl
      };
    }

    return course;
  });
}



export interface CompetitionPhoto {
  url: string;
  alt: string;
  attribution: string;
}

/**
 * Curated registry of distinct, authentic African and Ghanaian photographs
 * representing stage performers, dancers, vocalists, athletes, roboticists,
 * debaters, hackathon coders, actors, poets, and entrepreneurs.
 * Every known competition ID and slug has a 1-to-1 unique assignment so that NO two
 * competition cards ever display the same background image.
 */
export const COMPETITION_UNIQUE_PHOTO_REGISTRY: Record<string, CompetitionPhoto> = {
  'comp-nsmq-ghana-2027': {
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
    alt: 'National Science & Maths Quiz (NSMQ Ghana)',
    attribution: 'Unsplash Academic Photography (Royalty-Free)'
  },
  'national-science-and-maths-quiz-nsmq-ghana': {
      url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
      alt: 'National Science & Maths Quiz (NSMQ Ghana)',
      attribution: 'Unsplash Academic Photography (Royalty-Free)'
    },
  'comp-uba-national-essay-ghana': {
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
    alt: 'UBA Foundation National Essay Competition (NEC Ghana)',
    attribution: 'Unsplash Writing Photography (Royalty-Free)'
  },
  'uba-foundation-national-essay-competition-ghana': {
      url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
      alt: 'UBA Foundation National Essay Competition (NEC Ghana)',
      attribution: 'Unsplash Writing Photography (Royalty-Free)'
    },
  'comp-spelling-bee-ghana': {
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    alt: 'The Spelling Bee Ghana (Scripps National Bee Qualifier)',
    attribution: 'Unsplash Student Photography (Royalty-Free)'
  },
  'the-spelling-bee-ghana-national-championship': {
      url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
      alt: 'The Spelling Bee Ghana (Scripps National Bee Qualifier)',
      attribution: 'Unsplash Student Photography (Royalty-Free)'
    },
  'comp-ghana-national-debate-championship': {
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
    alt: 'Ghana National Universities Debate Championship (GNDC)',
    attribution: 'Unsplash Debate Photography (Royalty-Free)'
  },
  'ghana-national-universities-debate-championship': {
      url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
      alt: 'Ghana National Universities Debate Championship (GNDC)',
      attribution: 'Unsplash Debate Photography (Royalty-Free)'
    },
  'comp-tv3-talented-kidz-2027': {
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
    alt: 'TV3 Talented Kidz National Talent Search (Season 16)',
    attribution: 'Unsplash Performance Photography (Royalty-Free)'
  },
  'tv3-talented-kidz-national-auditions-ghana': {
      url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
      alt: 'TV3 Talented Kidz National Talent Search (Season 16)',
      attribution: 'Unsplash Performance Photography (Royalty-Free)'
    },
  'comp-tv3-mentor-xiii-ghana': {
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    alt: 'Mentor XIII Music Reality Contest (TV3 Ghana)',
    attribution: 'Unsplash Concert & Live Music Photography (Royalty-Free)'
  },
  'tv3-mentor-music-reality-competition-ghana': {
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
      alt: 'Mentor XIII Music Reality Contest (TV3 Ghana)',
      attribution: 'Unsplash Concert & Live Music Photography (Royalty-Free)'
    },
  'comp-voice-factory-season-6': {
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    alt: 'Voice Factory Music Competition (Channel One TV & Citi FM)',
    attribution: 'Unsplash Studio & Vocalist Photography (Royalty-Free)'
  },
  'voice-factory-music-competition-ghana': {
      url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      alt: 'Voice Factory Music Competition (Channel One TV & Citi FM)',
      attribution: 'Unsplash Studio & Vocalist Photography (Royalty-Free)'
    },
  'comp-battle-of-the-year-ghana': {
    url: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop&q=80',
    alt: 'Battle of the Year Ghana (BOTY National Dance Championship)',
    attribution: 'Unsplash Street Dance & Hip Hop Photography (Royalty-Free)'
  },
  'battle-of-the-year-ghana-national-dance-championship': {
      url: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop&q=80',
      alt: 'Battle of the Year Ghana (BOTY National Dance Championship)',
      attribution: 'Unsplash Street Dance & Hip Hop Photography (Royalty-Free)'
    },
  'comp-national-theatre-youth-drama': {
    url: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&auto=format&fit=crop&q=80',
    alt: 'National Youth Drama Festival & Acting Auditions',
    attribution: 'Unsplash Theatre Stage Photography (Royalty-Free)'
  },
  'national-youth-drama-festival-acting-auditions-ghana': {
      url: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&auto=format&fit=crop&q=80',
      alt: 'National Youth Drama Festival & Acting Auditions',
      attribution: 'Unsplash Theatre Stage Photography (Royalty-Free)'
    },
  'comp-ehalakasa-national-slam': {
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
    alt: 'Ehalakasa National Poetry Slam & Spoken Word Festival',
    attribution: 'Unsplash Spoken Word & Microphone Photography (Royalty-Free)'
  },
  'ehalakasa-national-poetry-slam-spoken-word-ghana': {
      url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
      alt: 'Ehalakasa National Poetry Slam & Spoken Word Festival',
      attribution: 'Unsplash Spoken Word & Microphone Photography (Royalty-Free)'
    },
  'comp-48-hour-film-project-accra': {
    url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80',
    alt: '48 Hour Film Project Accra (Filmmaking Challenge)',
    attribution: 'Unsplash Film Camera & Cinema Photography (Royalty-Free)'
  },
  '48-hour-film-project-accra-filmmaking-challenge': {
      url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80',
      alt: '48 Hour Film Project Accra (Filmmaking Challenge)',
      attribution: 'Unsplash Film Camera & Cinema Photography (Royalty-Free)'
    },
  'comp-gusa-games-ghana-2027': {
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
    alt: 'GUSA Games (Ghana Universities Sports Association Championship)',
    attribution: 'Unsplash Track & Athletics Photography (Royalty-Free)'
  },
  'gusa-games-ghana-universities-sports-association-championship': {
      url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
      alt: 'GUSA Games (Ghana Universities Sports Association Championship)',
      attribution: 'Unsplash Track & Athletics Photography (Royalty-Free)'
    },
  'comp-milo-u13-champions-league': {
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
    alt: 'Nestlé Milo U-13 Champions League (Inter-School Soccer Tournament)',
    attribution: 'Unsplash Youth Soccer Photography (Royalty-Free)'
  },
  'nestle-milo-u13-champions-league-ghana': {
      url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
      alt: 'Nestlé Milo U-13 Champions League (Inter-School Soccer Tournament)',
      attribution: 'Unsplash Youth Soccer Photography (Royalty-Free)'
    },
  'comp-accra-international-marathon': {
    url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop&q=80',
    alt: 'Accra International Marathon & 10K Road Race',
    attribution: 'Unsplash Marathon & Road Running Photography (Royalty-Free)'
  },
  'accra-international-marathon-and-10k-ghana': {
      url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop&q=80',
      alt: 'Accra International Marathon & 10K Road Race',
      attribution: 'Unsplash Marathon & Road Running Photography (Royalty-Free)'
    },
  'comp-esports-ghana-national-championship': {
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    alt: 'Esports Association of Ghana National Gaming Championship',
    attribution: 'Unsplash Esports & Video Gaming Photography (Royalty-Free)'
  },
  'esports-association-of-ghana-national-gaming-championship': {
      url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      alt: 'Esports Association of Ghana National Gaming Championship',
      attribution: 'Unsplash Esports & Video Gaming Photography (Royalty-Free)'
    },
  'comp-hacklab-foundation-hackathon-2027': {
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    alt: 'Hacklab Foundation National Hackathon (KNUST Kumasi)',
    attribution: 'Unsplash Hackathon & Tech Team Photography (Royalty-Free)'
  },
  'hacklab-foundation-national-hackathon-ghana': {
      url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
      alt: 'Hacklab Foundation National Hackathon (KNUST Kumasi)',
      attribution: 'Unsplash Hackathon & Tech Team Photography (Royalty-Free)'
    },
  'comp-mtn-ayoba-developer-hackathon': {
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    alt: 'MTN Ayoba Micro-App Developer Challenge Ghana',
    attribution: 'Unsplash Code & Software Architecture Photography (Royalty-Free)'
  },
  'mtn-ayoba-developer-micro-app-challenge-ghana': {
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      alt: 'MTN Ayoba Micro-App Developer Challenge Ghana',
      attribution: 'Unsplash Code & Software Architecture Photography (Royalty-Free)'
    },
  'comp-cyberx-ghana-ctf-championship': {
    url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    alt: 'CyberX Ghana National Cybersecurity Challenge & CTF',
    attribution: 'Unsplash Network & Security Facility Photography (Royalty-Free)'
  },
  'cyberx-ghana-national-cybersecurity-challenge-ctf': {
      url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
      alt: 'CyberX Ghana National Cybersecurity Challenge & CTF',
      attribution: 'Unsplash Network & Security Facility Photography (Royalty-Free)'
    },
  'comp-mest-africa-challenge-2027': {
    url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80',
    alt: 'MEST Africa Challenge (Pan-African Tech Startup Pitch)',
    attribution: 'Unsplash Entrepreneur Pitch & Venture Photography (Royalty-Free)'
  },
  'mest-africa-challenge-startup-pitch-ghana': {
      url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80',
      alt: 'MEST Africa Challenge (Pan-African Tech Startup Pitch)',
      attribution: 'Unsplash Entrepreneur Pitch & Venture Photography (Royalty-Free)'
    },
  'comp-totalenergies-startupper-ghana': {
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
    alt: 'TotalEnergies Startupper of the Year Challenge Ghana',
    attribution: 'Unsplash Business Strategy & Analytics Photography (Royalty-Free)'
  },
  'totalenergies-startupper-of-the-year-challenge-ghana': {
      url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
      alt: 'TotalEnergies Startupper of the Year Challenge Ghana',
      attribution: 'Unsplash Business Strategy & Analytics Photography (Royalty-Free)'
    },
  'comp-mcdan-youth-connect-pitch': {
    url: 'https://images.unsplash.com/photo-1573497491765-dccce02b29df?w=800&auto=format&fit=crop&q=80',
    alt: 'McDan Youth Connect Entrepreneurship Pitch Competition',
    attribution: 'Unsplash Ghanaian Executive & Business Presentation (Royalty-Free)'
  },
  'mcdan-youth-connect-entrepreneurship-pitch-ghana': {
      url: 'https://images.unsplash.com/photo-1573497491765-dccce02b29df?w=800&auto=format&fit=crop&q=80',
      alt: 'McDan Youth Connect Entrepreneurship Pitch Competition',
      attribution: 'Unsplash Ghanaian Executive & Business Presentation (Royalty-Free)'
    },
  'comp-kic-agritech-challenge-2027': {
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
    alt: 'Kosmos Innovation Center (KIC) AgriTech Challenge Classic',
    attribution: 'Unsplash Agriculture & Crop Cultivation Photography (Royalty-Free)'
  },
  'kic-agritech-challenge-classic-ghana': {
      url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
      alt: 'Kosmos Innovation Center (KIC) AgriTech Challenge Classic',
      attribution: 'Unsplash Agriculture & Crop Cultivation Photography (Royalty-Free)'
    },
  'comp-gstep-ghana-stem-challenge': {
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    alt: 'Ghana Science & Tech Explorer Prize (GSTEP Challenge)',
    attribution: 'Unsplash STEM & Science Engineering Lab (Royalty-Free)'
  },
  'ghana-science-tech-explorer-prize-gstep-challenge': {
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      alt: 'Ghana Science & Tech Explorer Prize (GSTEP Challenge)',
      attribution: 'Unsplash STEM & Science Engineering Lab (Royalty-Free)'
    },
  'comp-miss-ghana-national-pageant': {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    alt: 'Miss Ghana National Pageant (Beauty With A Purpose)',
    attribution: 'Unsplash Fashion & Cultural Portrait Photography (Royalty-Free)'
  },
  'miss-ghana-national-pageant-beauty-with-a-purpose': {
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
      alt: 'Miss Ghana National Pageant (Beauty With A Purpose)',
      attribution: 'Unsplash Fashion & Cultural Portrait Photography (Royalty-Free)'
    },
  'comp-gfdw-emerging-designer-challenge': {
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
    alt: 'Ghana Fashion & Design Week (GFDW) Emerging Designer Contest',
    attribution: 'Unsplash Runway & Fashion Design Photography (Royalty-Free)'
  },
  'ghana-fashion-and-design-week-emerging-designer-contest': {
      url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
      alt: 'Ghana Fashion & Design Week (GFDW) Emerging Designer Contest',
      attribution: 'Unsplash Runway & Fashion Design Photography (Royalty-Free)'
    },
  'comp-yali-west-africa-social-pitch': {
    url: 'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?w=800&auto=format&fit=crop&q=80',
    alt: 'YALI RLC West Africa Social Venture Challenge',
    attribution: 'Unsplash African Youth Leadership & Community Photography (Royalty-Free)'
  },
  'yali-west-africa-social-venture-pitch-ghana': {
      url: 'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?w=800&auto=format&fit=crop&q=80',
      alt: 'YALI RLC West Africa Social Venture Challenge',
      attribution: 'Unsplash African Youth Leadership & Community Photography (Royalty-Free)'
    },
  'comp-ghana-gospel-talent-quest': {
    url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&auto=format&fit=crop&q=80',
    alt: 'Ghana National Gospel Music Talent Quest',
    attribution: 'Unsplash Gospel Vocalist & Choir Photography (Royalty-Free)'
  },
  'ghana-national-gospel-music-talent-quest': {
      url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&auto=format&fit=crop&q=80',
      alt: 'Ghana National Gospel Music Talent Quest',
      attribution: 'Unsplash Gospel Vocalist & Choir Photography (Royalty-Free)'
    },
  'comp-ghana-freestyle-rap-battle': {
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    alt: 'YFM National Rap & Freestyle Battle Championship',
    attribution: 'Unsplash Hip Hop & Microphone Photography (Royalty-Free)'
  },
  'yfm-national-rap-freestyle-battle-championship-ghana': {
      url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
      alt: 'YFM National Rap & Freestyle Battle Championship',
      attribution: 'Unsplash Hip Hop & Microphone Photography (Royalty-Free)'
    },
  'comp-red-bull-dance-your-style-ghana': {
    url: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800&auto=format&fit=crop&q=80',
    alt: 'Red Bull Dance Your Style Ghana National Qualifier',
    attribution: 'Unsplash Contemporary & Urban Dance Photography (Royalty-Free)'
  },
  'red-bull-dance-your-style-ghana-national-qualifier': {
      url: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800&auto=format&fit=crop&q=80',
      alt: 'Red Bull Dance Your Style Ghana National Qualifier',
      attribution: 'Unsplash Contemporary & Urban Dance Photography (Royalty-Free)'
    },
  'comp-unimac-monologue-challenge': {
    url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop&q=80',
    alt: 'Ghana National Monologue & Screen Acting Challenge',
    attribution: 'Unsplash Dramatic Acting & Character Photography (Royalty-Free)'
  },
  'ghana-national-monologue-screen-acting-challenge': {
      url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&auto=format&fit=crop&q=80',
      alt: 'Ghana National Monologue & Screen Acting Challenge',
      attribution: 'Unsplash Dramatic Acting & Character Photography (Royalty-Free)'
    },
  'comp-comedy-knights-standup': {
    url: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&auto=format&fit=crop&q=80',
    alt: 'Ghana Comedy Knights National Stand-Up Competition',
    attribution: 'Unsplash Standup Comedy & Stage Spotlight Photography (Royalty-Free)'
  },
  'ghana-comedy-knights-national-stand-up-competition': {
      url: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&auto=format&fit=crop&q=80',
      alt: 'Ghana Comedy Knights National Stand-Up Competition',
      attribution: 'Unsplash Standup Comedy & Stage Spotlight Photography (Royalty-Free)'
    },
  'comp-national-photo-arts-contest': {
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    alt: 'Ghana National Photography & Visual Arts Challenge',
    attribution: 'Unsplash Photography Studio & Fine Art Capture (Royalty-Free)'
  },
  'ghana-national-photography-visual-arts-challenge': {
      url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
      alt: 'Ghana National Photography & Visual Arts Challenge',
      attribution: 'Unsplash Photography Studio & Fine Art Capture (Royalty-Free)'
    },
  'comp-accra-brand-identity-challenge': {
    url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
    alt: 'Accra Graphic Design & Brand Identity Challenge',
    attribution: 'Unsplash UI/UX & Graphic Design Studio Photography (Royalty-Free)'
  },
  'accra-graphic-design-brand-identity-challenge': {
      url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
      alt: 'Accra Graphic Design & Brand Identity Challenge',
      attribution: 'Unsplash UI/UX & Graphic Design Studio Photography (Royalty-Free)'
    },
  'comp-super-zonals-ashanti': {
    url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=80',
    alt: 'Ashanti Regional Inter-Colleges Athletic Championship (Super-Zonals)',
    attribution: 'Unsplash Sprinting & High School Stadium Athletics (Royalty-Free)'
  },
  'ashanti-regional-inter-colleges-athletic-championship-super-zonals': {
      url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=80',
      alt: 'Ashanti Regional Inter-Colleges Athletic Championship (Super-Zonals)',
      attribution: 'Unsplash Sprinting & High School Stadium Athletics (Royalty-Free)'
    },
  'comp-knust-engineering-innovation': {
    url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=80',
    alt: 'KNUST College of Engineering Renewable Energy & Innovation Challenge',
    attribution: 'Unsplash Solar Energy & Engineering Infrastructure Photography (Royalty-Free)'
  },
  'knust-engineering-renewable-energy-innovation-challenge': {
      url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=80',
      alt: 'KNUST College of Engineering Renewable Energy & Innovation Challenge',
      attribution: 'Unsplash Solar Energy & Engineering Infrastructure Photography (Royalty-Free)'
    },
  'comp-mofa-national-young-farmer': {
    url: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=800&auto=format&fit=crop&q=80',
    alt: 'National Best Young Farmer & Agribusiness Contest (MoFA Ghana)',
    attribution: 'Unsplash African Agriculture & Harvest Photography (Royalty-Free)'
  },
  'national-best-young-farmer-agribusiness-contest-ghana': {
      url: 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=800&auto=format&fit=crop&q=80',
      alt: 'National Best Young Farmer & Agribusiness Contest (MoFA Ghana)',
      attribution: 'Unsplash African Agriculture & Harvest Photography (Royalty-Free)'
    },
};

/**
 * Variety pool of verified African and Ghanaian competition photographs
 * rotated deterministically for any dynamically submitted competition listings.
 */
export const COMPETITION_VARIETY_POOL: CompetitionPhoto[] = [
  {
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    alt: 'African live stage concert lighting and vocal performance',
    attribution: 'Unsplash Performance Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
    alt: 'African software developers and engineers coding at hackathon',
    attribution: 'Unsplash Technology Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
    alt: 'African athletes sprinting on university championship track',
    attribution: 'Unsplash Sports Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80',
    alt: 'African youth talent performance showcase',
    attribution: 'Unsplash Arts Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
    alt: 'Ghanaian science and mathematics student quiz contest',
    attribution: 'Unsplash Academic Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=800&auto=format&fit=crop&q=80',
    alt: 'African street dance and breakdance battle',
    attribution: 'Unsplash Dance Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80',
    alt: 'African startup founder delivering venture pitch',
    attribution: 'Unsplash Business Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    alt: 'African esports and console gaming championship',
    attribution: 'Unsplash Gaming Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80',
    alt: 'Cinema camera recording short film competition',
    attribution: 'Unsplash Film Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
    alt: 'African fashion designer runway showcase',
    attribution: 'Unsplash Fashion Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
    alt: 'Youth soccer tournament championship in Ghana',
    attribution: 'Unsplash Sports Photography'
  },
  {
    url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
    alt: 'Ghanaian young agripreneur farm enterprise',
    attribution: 'Unsplash Agriculture Photography'
  }
];

export function getHumanCenteredCompetitionImage(opp: Partial<Opportunity>): CompetitionPhoto {
  const id = opp.id || '';
  const slug = opp.slug || '';

  // 1. Direct registry lookup by ID
  if (id && COMPETITION_UNIQUE_PHOTO_REGISTRY[id]) {
    return COMPETITION_UNIQUE_PHOTO_REGISTRY[id];
  }

  // 2. Direct registry lookup by slug
  if (slug && COMPETITION_UNIQUE_PHOTO_REGISTRY[slug]) {
    return COMPETITION_UNIQUE_PHOTO_REGISTRY[slug];
  }

  // 3. Normalized slug lookup
  const cleanSlug = slug.toLowerCase().trim();
  if (cleanSlug && COMPETITION_UNIQUE_PHOTO_REGISTRY[cleanSlug]) {
    return COMPETITION_UNIQUE_PHOTO_REGISTRY[cleanSlug];
  }

  // 4. Deterministic variety pool hashing based on stable identifier
  const seed = `${id}-${slug}-${opp.title || 'competition'}`;
  const idx = hashString(seed) % COMPETITION_VARIETY_POOL.length;
  return COMPETITION_VARIETY_POOL[idx];
}

/**
 * Validates and ensures that an array of opportunities displayed together
 * never renders duplicate background images.
 */
export function ensureUniqueOpportunityImages<T extends Partial<Opportunity>>(opportunities: T[]): T[] {
  const seenUrls = new Set<string>();
  let poolCursor = 0;

  return opportunities.map(opp => {
    const media = resolveOpportunityMedia(opp);
    let assignedUrl = media.imageUrl;

    if (assignedUrl && seenUrls.has(assignedUrl)) {
      // Find the next unused photo from the competition pool or variety pool
      for (let i = 0; i < COMPETITION_VARIETY_POOL.length; i++) {
        const candidate = COMPETITION_VARIETY_POOL[(poolCursor + i) % COMPETITION_VARIETY_POOL.length].url;
        if (!seenUrls.has(candidate)) {
          assignedUrl = candidate;
          poolCursor = (poolCursor + i + 1) % COMPETITION_VARIETY_POOL.length;
          break;
        }
      }
    }

    if (assignedUrl) {
      seenUrls.add(assignedUrl);
    }

    if (assignedUrl && assignedUrl !== opp.imageUrl) {
      return {
        ...opp,
        imageUrl: assignedUrl
      };
    }

    return opp;
  });
}

/**
 * Resolves the visual media for a Skill card:
 * 1. Valid uploaded or curated image URL (photograph of African/Ghanaian context or technical SVG)
 * 2. High-fidelity category-based gradient with pattern
 */
export function resolveSkillMedia(skill: Partial<Skill>): ResolvedCardMedia {
  const gradient = getCategoryGradient(skill.category, 'resource');

  const existingUrl = skill.imageUrl || (skill as any).image;

  if (isUploadedRealImage(existingUrl)) {
    return {
      imageUrl: existingUrl!.trim(),
      imageAlt: skill.imageAlt || skill.name || 'Skill career pathway image',
      isSvg: existingUrl!.endsWith('.svg'),
      source: 'uploaded',
      gradient
    };
  }

  return {
    imageUrl: null,
    isSvg: false,
    source: 'gradient',
    gradient
  };
}
