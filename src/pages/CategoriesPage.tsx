import React, { useEffect, useState } from 'react';
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
import { OPPORTUNITY_CATEGORIES } from '../data/categories';
import { OpportunitiesService, matchesCategory } from '../services/opportunitiesService';
import { getOpportunityLifecycleStatus } from '../services/deadlineService';

interface CategoriesPageProps {
  onNavigate: (path: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
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
  Rocket
};

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onNavigate }) => {
  const [counts, setCounts] = useState<Record<string, { total: number; open: number }>>({});

  useEffect(() => {
    let mounted = true;
    OpportunitiesService.getAll()
      .then((all) => {
        if (!mounted) return;
        const map: Record<string, { total: number; open: number }> = {};
        for (const cat of OPPORTUNITY_CATEGORIES) {
          const matching = all.filter((o) => matchesCategory(o, cat.id));
          const openCount = matching.filter(
            (o) => !getOpportunityLifecycleStatus(o).isClosed
          ).length;
          map[cat.id] = { total: matching.length, open: openCount };
        }
        setCounts(map);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Browse by Category
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Select a category to view verified scholarships, jobs, internships, grants, and programmes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {OPPORTUNITY_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.iconName] || Compass;
          const stats = counts[cat.id];
          const targetRoute =
            cat.id === 'Admissions'
              ? '/institutions'
              : `/opportunities?category=${encodeURIComponent(cat.id)}`;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onNavigate(targetRoute)}
              className="group text-left bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 hover:border-[#006B3F]/60 dark:hover:border-emerald-500/50 rounded-xl p-4 flex items-start gap-3 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 truncate">
                    {cat.name}
                  </h2>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 shrink-0" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
                {stats && (
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums pt-0.5">
                    {stats.open} open · {stats.total} total listings
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Additional Resource Shortcuts */}
      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('/courses')}
          className="text-left bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 hover:border-[#006B3F]/60 rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer"
        >
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Free Courses &amp; Certifications
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified tech, business, and professional learning resources
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/institutions')}
          className="text-left bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 hover:border-[#006B3F]/60 rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer"
        >
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Accredited Ghanaian Institutions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Universities, admissions portals, cut-off points, and fees
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 shrink-0" />
        </button>
      </div>
    </div>
  );
};
