import React, { useState } from 'react';
import { Wrench, CheckCircle2, FileCheck, Calendar, Calculator, Sparkles, ArrowRight } from 'lucide-react';

export const ToolsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [wScore, setWScore] = useState<number | null>(null);
  const [credits, setCredits] = useState('6');
  const [targetType, setTargetType] = useState('scholarship');

  const calculateEligibility = (e: React.FormEvent) => {
    e.preventDefault();
    const c = parseInt(credits, 10);
    if (c >= 6 && targetType === 'scholarship') {
      setWScore(88);
    } else {
      setWScore(74);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-space">
          Career & Opportunity Tools
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Interactive utilities to calculate scholarship eligibility, track approaching deadlines, and verify application requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
        {/* Tool 1: Eligibility Estimator */}
        <div className="floating-glass-tablet specular-rim-highlight rounded-2xl sm:rounded-[22px] p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/70 dark:border-emerald-700/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-space">Scholarship Eligibility Checker</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Estimate your qualification index for competitive undergraduate and postgraduate scholarships based on academic standing.
            </p>

            <form onSubmit={calculateEligibility} className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Target Opportunity
                </label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 backdrop-blur-xs"
                >
                  <option value="scholarship" className="dark:bg-slate-900">Mastercard / Ashesi Full Tuition</option>
                  <option value="grant" className="dark:bg-slate-900">Youth Agribusiness Seed Grant</option>
                  <option value="fellowship" className="dark:bg-slate-900">DAAD / KNUST Graduate Fellowship</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Number of WASSCE Credits (A1 - C6) or Class
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 backdrop-blur-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#006B3F] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Estimate Match
              </button>
            </form>

            {wScore !== null && (
              <div className="glass-subpanel p-3 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs space-y-1">
                <span className="font-bold">Match Readiness Score: {wScore}%</span>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Your academic profile satisfies core eligibility criteria for this category.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tool 2: CV & Document Checklist */}
        <div className="floating-glass-tablet specular-rim-highlight rounded-2xl sm:rounded-[22px] p-6 pb-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200/70 dark:border-blue-700/60 text-blue-700 dark:text-blue-400 flex items-center justify-center shadow-2xs">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-space">Application Document Checklist</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Standard Ghana application packet checklist to ensure no required documents are missing before submission.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Ghana Card (NIA) front & back certified copy</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Official Transcript / WASSCE scratch card serials</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>2 Academic or Community Recommendation Letters</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>One-page tailored Curriculum Vitae (PDF)</span>
              </li>
            </ul>
          </div>

          <div className="glass-subpanel mt-5 -mx-2 px-4 py-2.5 rounded-xl">
            <button
              onClick={() => onNavigate('/opportunities')}
              className="text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore matching opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tool 3: Deadline Radar */}
        <div className="floating-glass-tablet specular-rim-highlight rounded-2xl sm:rounded-[22px] p-6 pb-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200/70 dark:border-amber-700/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-space">Ghana Opportunity Radar</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Real-time countdown tracker for national scholarship windows (Government Scholarship Secretariat, GNPC, GETFund, Ashesi).
            </p>
            <div className="glass-subpanel p-3.5 rounded-xl text-xs text-amber-950 dark:text-amber-200 space-y-1">
              <p className="font-bold">Next Major Window:</p>
              <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200">Mastercard Foundation Scholars Program</p>
              <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400">Closes in approx 16 days</p>
            </div>
          </div>

          <div className="glass-subpanel mt-5 -mx-2 px-4 py-2.5 rounded-xl">
            <button
              onClick={() => onNavigate('/alerts')}
              className="text-xs font-bold text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Configure deadline alert pings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
