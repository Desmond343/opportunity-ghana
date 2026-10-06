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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
        {skills.map((skill) => (
          <article
            key={skill.id}
            className="floating-glass-tablet specular-rim-highlight group relative rounded-2xl sm:rounded-[22px] p-6 pb-4 flex flex-col justify-between overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="emerald">{skill.category}</Badge>
                <span className="text-[11px] font-bold text-[#006B3F] bg-emerald-50/90 border border-[#006B3F]/20 px-2.5 py-0.5 rounded-lg backdrop-blur-xs shadow-2xs">
                  {skill.demandLevel} Demand
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#006B3F] transition-colors font-space">{skill.name}</h3>

              <p className="text-xs text-slate-600 leading-relaxed">{skill.description}</p>

              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 font-space">
                  Top Associated Careers:
                </p>
                <div className="space-y-1.5">
                  {skill.topCareers?.map((career, i) => (
                    <div
                      key={i}
                      className="text-xs font-semibold text-slate-800 flex items-center gap-2 p-2 bg-white/85 backdrop-blur-xs rounded-xl border border-slate-200/80 shadow-2xs"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-[#006B3F] shrink-0" />
                      <span>{career}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5 font-space">
                  Related Competencies:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {skill.relatedSkills.map((sub, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium bg-white/85 backdrop-blur-xs text-slate-700 border border-slate-200/80 px-2.5 py-0.5 rounded-lg shadow-2xs"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Internal Frosted Shelf Footer */}
            <div className="glass-subpanel mt-5 -mx-2 px-4 py-2.5 rounded-xl flex items-center justify-between">
              <button
                onClick={() => onNavigate(`/opportunities?search=${encodeURIComponent(skill.name)}`)}
                className="text-xs font-bold text-[#006B3F] hover:text-[#005530] flex items-center gap-1 cursor-pointer"
              >
                <span>Find Related Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate(`/resources?search=${encodeURIComponent(skill.name)}`)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
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
