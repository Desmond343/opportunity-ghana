import { OpportunityCategory, ResourceCategory, Skill } from '../types/database';

export const OPPORTUNITY_CATEGORIES: {
  id: OpportunityCategory;
  name: string;
  description: string;
  iconName: string;
  badgeColor: string;
}[] = [
  {
    id: 'Scholarships',
    name: 'Scholarships',
    description: 'Undergraduate, post-graduate, merit and need-based tuition aid for Ghanaians.',
    iconName: 'GraduationCap',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  },
  {
    id: 'Jobs',
    name: 'Jobs',
    description: 'Verified professional, graduate trainee, and skilled roles across Ghana.',
    iconName: 'Briefcase',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    id: 'Internships',
    name: 'Internships',
    description: 'National Service, vacation internships, and paid student placements.',
    iconName: 'Compass',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  },
  {
    id: 'Grants',
    name: 'Grants',
    description: 'Non-repayable funding for Ghanaian entrepreneurs, researchers, and innovators.',
    iconName: 'Coins',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  {
    id: 'Fellowships',
    name: 'Fellowships',
    description: 'Prestigious leadership, research, and professional residency opportunities.',
    iconName: 'Award',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200'
  },
  {
    id: 'Admissions',
    name: 'Admissions',
    description: 'Direct university entry, polytechnic, and vocational application windows.',
    iconName: 'BookOpen',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200'
  },
  {
    id: 'Training',
    name: 'Training',
    description: 'Practical workforce development, vocational, and digital upskilling cohorts.',
    iconName: 'Layers',
    badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200'
  },
  {
    id: 'Competitions',
    name: 'Competitions',
    description: 'Hackathons, innovation challenges, case contests, and prize awards.',
    iconName: 'Trophy',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    id: 'Government Programmes',
    name: 'Government Programmes',
    description: 'Official Ghana public sector initiatives, GEA, NEIP, and Youth in Tech funds.',
    iconName: 'Landmark',
    badgeColor: 'bg-emerald-900 text-emerald-100 border-emerald-800'
  },
  {
    id: 'Graduate Programmes',
    name: 'Graduate Programmes',
    description: 'Corporate management trainee pipelines and rotational fast-tracks.',
    iconName: 'TrendingUp',
    badgeColor: 'bg-violet-50 text-violet-800 border-violet-200'
  },
  {
    id: 'Study Abroad',
    name: 'Study Abroad',
    description: 'Erasmus+, Chevening, Mastercard Foundation, DAAD, and international mobility.',
    iconName: 'Globe',
    badgeColor: 'bg-sky-50 text-sky-800 border-sky-200'
  },
  {
    id: 'Entrepreneurship',
    name: 'Entrepreneurship',
    description: 'Incubators, accelerators, venture capital pitch days, and seed funds.',
    iconName: 'Rocket',
    badgeColor: 'bg-orange-50 text-orange-800 border-orange-200'
  }
];

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  'Technology',
  'Business',
  'Finance',
  'Healthcare',
  'Engineering',
  'Agriculture',
  'Marketing',
  'Design',
  'Data',
  'Cybersecurity',
  'AI',
  'Education',
  'Entrepreneurship',
  'Professional Development'
];

export const RESOURCE_TYPES = [
  'course',
  'certification',
  'training',
  'bootcamp',
  'workshop',
  'event',
  'learning_resource'
];

export const GHANA_REGIONS = [
  'All Ghana',
  'Greater Accra',
  'Ashanti',
  'Western',
  'Central',
  'Eastern',
  'Volta',
  'Northern',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
  'Oti',
  'Savannah',
  'North East',
  'Western North',
  'Remote / Online'
];

export const EDUCATION_LEVELS = [
  'All Education Levels',
  'Junior High School (JHS)',
  'Senior High School (SHS)',
  'Vocational / Technical (TVET)',
  'Diploma / HND',
  'Undergraduate (Bachelor)',
  'Postgraduate (Master / PhD)',
  'No Formal Requirement'
];

import { VERIFIED_REAL_SKILLS } from './verifiedSkills';

export const SKILL_CATEGORIES = [
  'All Categories',
  'Technology & Digital',
  'Business & Entrepreneurship',
  'Career & Professional',
  'Creative Arts & Media',
  'Vocational & Technical Trades',
  'Agriculture & Agribusiness',
  'Hospitality, Food & Tourism',
  'Beauty & Personal Care',
  'Healthcare & Community',
  'Education & Teaching'
] as const;

export const STANDARD_CAREER_TRACKS: Skill[] = VERIFIED_REAL_SKILLS;
