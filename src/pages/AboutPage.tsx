import React from 'react';
import { ShieldCheck, CalendarClock, CheckCircle2, ArrowRight, Bell } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          About Opportunity Ghana
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Opportunity Ghana helps Ghanaian students, graduates, entrepreneurs, and professionals find verified scholarships, jobs, internships, grants, fellowships, and training programmes in one clean directory.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
          <ShieldCheck className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Verified Official Sources
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Every listing links directly to the issuing university, employer, NGO, or government portal.
          </p>
        </div>

        <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
          <CalendarClock className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Transparent Deadlines
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Listings clearly display OPEN, CLOSING SOON, UPCOMING, or CLOSED status along with previous and expected next cycle dates.
          </p>
        </div>

        <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2">
          <CheckCircle2 className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Zero Application Fees
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Opportunity Ghana never charges users to view opportunities or apply through official portals.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Ready to explore active opportunities?
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Browse open listings or subscribe to deadline notifications.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigate('/opportunities')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#006B3F] hover:bg-[#005632] text-white text-xs font-semibold cursor-pointer min-h-[44px]"
          >
            <span>Browse Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('/alerts')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer min-h-[44px]"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Deadline Alerts</span>
          </button>
        </div>
      </div>
    </div>
  );
};
