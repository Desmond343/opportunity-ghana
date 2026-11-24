import React from 'react';
import {
  GraduationCap,
  Briefcase,
  Compass,
  Coins,
  Award,
  BookOpen,
  Layers,
  Trophy,
  Landmark,
  TrendingUp,
  Globe,
  Rocket,
  ArrowRight
} from 'lucide-react';

interface OpportunityCategorySectionProps {
  onNavigate: (path: string) => void;
}

interface CompactCategoryItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
}

export const OpportunityCategorySection: React.FC<OpportunityCategorySectionProps> = ({
  onNavigate
}) => {
  const categories: CompactCategoryItem[] = [
    {
      id: 'scholarships',
      label: 'Scholarships',
      icon: GraduationCap,
      href: '/opportunities?category=Scholarships'
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: Briefcase,
      href: '/opportunities?category=Jobs'
    },
    {
      id: 'internships',
      label: 'Internships',
      icon: Compass,
      href: '/opportunities?category=Internships'
    },
    {
      id: 'grants',
      label: 'Grants',
      icon: Coins,
      href: '/opportunities?category=Grants'
    },
    {
      id: 'fellowships',
      label: 'Fellowships',
      icon: Award,
      href: '/opportunities?category=Fellowships'
    },
    {
      id: 'training',
      label: 'Training',
      icon: Layers,
      href: '/opportunities?category=Training'
    },
    {
      id: 'admissions',
      label: 'Admissions & Study',
      icon: BookOpen,
      href: '/institutions'
    },
    {
      id: 'competitions',
      label: 'Competitions',
      icon: Trophy,
      href: '/opportunities?category=Competitions'
    },
    {
      id: 'government',
      label: 'Government',
      icon: Landmark,
      href: '/opportunities?category=Government+Programmes'
    },
    {
      id: 'graduate',
      label: 'Graduate Schemes',
      icon: TrendingUp,
      href: '/opportunities?category=Graduate+Programmes'
    },
    {
      id: 'study-abroad',
      label: 'Study Abroad',
      icon: Globe,
      href: '/opportunities?category=Study+Abroad'
    },
    {
      id: 'entrepreneurship',
      label: 'Startups',
      icon: Rocket,
      href: '/opportunities?category=Entrepreneurship'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          Explore Opportunities by Category
        </h2>
        <button
          type="button"
          onClick={() => onNavigate('/categories')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#006B3F] dark:text-emerald-400 hover:underline shrink-0 cursor-pointer py-1"
        >
          <span>All categories</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onNavigate(cat.href)}
              aria-label={`Explore ${cat.label}`}
              className="group min-h-[44px] bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 hover:border-[#006B3F]/60 dark:hover:border-emerald-500/50 rounded-xl px-3 py-2.5 flex items-center gap-2.5 text-left transition-colors cursor-pointer"
            >
              <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </span>
              <span className="text-xs sm:text-[13px] font-medium text-slate-800 dark:text-slate-200 group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 truncate">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
