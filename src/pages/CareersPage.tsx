import React, { useState, useEffect } from 'react';
import { AdminService } from '../services/adminService';
import { Skill } from '../types/database';
import { Badge } from '../components/common/Badge';
import { TrendingUp, Compass, ArrowRight, Briefcase, Sparkles, BookOpen } from 'lucide-react';

export const CareersPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [skills, setSkills] = useState<Skill[]>(() => AdminService.getSkills());

  useEffect(() => {
    setSkills(AdminService.getSkills());
  }, []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-emerald-700" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Workforce Intelligence
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-space">
          Ghana Career Pathways & Skill Mapping
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Connect your field of study and current skills to high-growth career tracks in Ghana. Discover which certifications and entry-level jobs unlock each pathway.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => (
          <article
            key={skill.id}
            className="floating-glass-tablet group relative rounded-2xl sm:rounded-3xl p-6 flex flex-col justify-between overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="emerald">{skill.category}</Badge>
                <span className="text-[11px] font-bold text-[#006B3F] dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/60 border border-[#006B3F]/20 dark:border-emerald-500/30 px-2.5 py-0.5 rounded-lg backdrop-blur-xs shadow-2xs">
                  {skill.demandLevel} Demand
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-space">{skill.name}</h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{skill.description}</p>

              <div>
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2 font-space">
                  Top Associated Careers:
                </p>
                <div className="space-y-1.5">
                  {skill.topCareers?.map((career, i) => (
                    <div
                      key={i}
                      className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 p-2 bg-slate-100/80 dark:bg-white/[0.05] rounded-xl border border-slate-200/60 dark:border-white/10"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-[#006B3F] dark:text-emerald-400 shrink-0" />
                      <span>{career}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1.5 font-space">
                  Related Competencies:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {skill.relatedSkills.map((sub, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium bg-slate-100/80 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10 px-2.5 py-0.5 rounded-lg shadow-2xs"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Internal Frosted Shelf Footer */}
            <div className="glass-subpanel mt-5 p-3 rounded-xl sm:rounded-2xl flex items-center justify-between">
              <button
                onClick={() => onNavigate(`/opportunities?search=${encodeURIComponent(skill.name)}`)}
                className="text-xs font-bold text-[#006B3F] dark:text-emerald-400 hover:text-[#005530] flex items-center gap-1 cursor-pointer"
              >
                <span>Find Related Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate(`/resources?search=${encodeURIComponent(skill.name)}`)}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Find Courses
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
