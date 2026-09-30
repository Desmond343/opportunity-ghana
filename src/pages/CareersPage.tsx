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
          <div
            key={skill.id}
            className="bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col justify-between shadow-2xs hover:border-emerald-500/40 hover:shadow-sm transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="emerald">{skill.category}</Badge>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {skill.demandLevel} Demand
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{skill.name}</h3>

              <p className="text-xs text-slate-600 leading-relaxed">{skill.description}</p>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Top Associated Careers:
                </p>
                <div className="space-y-1.5">
                  {skill.topCareers?.map((career, i) => (
                    <div
                      key={i}
                      className="text-xs font-semibold text-slate-800 flex items-center gap-2 p-1.5 bg-slate-50 rounded-lg"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      <span>{career}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Related Competencies:
                </p>
                <div className="flex flex-wrap gap-1">
                  {skill.relatedSkills.map((sub, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onNavigate(`/opportunities?search=${encodeURIComponent(skill.name)}`)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Find Related Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate(`/resources?search=${encodeURIComponent(skill.name)}`)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Find Courses
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
