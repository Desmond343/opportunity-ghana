import React, { useState, useEffect } from 'react';
import { Skill } from '../../types/database';
import { Badge } from '../common/Badge';
import { CardVisualHeader } from './CardVisualHeader';
import { resolveSkillMedia } from '../../utils/cardBackgrounds';
import { SavedService } from '../../services/savedService';
import { useAuth } from '../../services/authContext';
import {
  Briefcase,
  Bookmark,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';

interface SkillCardProps {
  skill: Skill;
  onNavigate: (path: string) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, onNavigate }) => {
  const { currentUser, getIdToken } = useAuth();
  const [isSaved, setIsSaved] = useState(() => SavedService.isSaved(skill.id));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsSaved(SavedService.isSaved(skill.id));
    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.id === skill.id || e.detail.userId !== undefined) {
        setIsSaved(SavedService.isSaved(skill.id));
      }
    };
    window.addEventListener('saved-opportunities-changed', handleUpdate);
    return () => window.removeEventListener('saved-opportunities-changed', handleUpdate);
  }, [skill.id]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const updated = await SavedService.toggleSave(
        {
          id: skill.id,
          slug: skill.slug,
          title: skill.name,
          category: skill.category,
          type: 'Skill',
          itemType: 'skill',
          targetPath: `/skills/${skill.slug}`
        },
        currentUser?.id,
        getIdToken
      );
      setIsSaved(updated);
    } catch (err: any) {
      console.warn('Save error on skill card:', err?.message || err);
    } finally {
      setIsSaving(false);
    }
  };

  const media = resolveSkillMedia(skill);

  // Demand badge styling helper
  const getDemandBadgeColor = (demand?: string) => {
    switch (demand) {
      case 'Very High':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'High':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
      case 'Growing':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30';
    }
  };

  return (
    <article
      onClick={() => onNavigate(`/skills/${skill.slug}`)}
      className="floating-glass-tablet specular-rim-highlight group relative rounded-2xl sm:rounded-[22px] cursor-pointer flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Visual Header Banner */}
      <CardVisualHeader
        media={media}
        alt={skill.imageAlt || skill.name}
        title={skill.name}
        subtitle={skill.category}
        heightClass="h-36 sm:h-40"
        badgeTopLeft={
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-white border border-white/10 shadow-xs">
              {skill.category}
            </span>
            {skill.level && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 border border-white/20 shadow-xs">
                {skill.level}
              </span>
            )}
          </div>
        }
        actionsTopRight={
          <button
            type="button"
            onClick={toggleSave}
            title={isSaved ? 'Remove from saved' : 'Save skill'}
            aria-label={isSaved ? 'Remove from saved' : 'Save skill'}
            className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-xs cursor-pointer ${
              isSaved
                ? 'bg-[#006B3F] text-[#FCD116] ring-1 ring-emerald-400'
                : 'bg-slate-950/60 text-white/90 hover:bg-slate-950/80 hover:text-white'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#FCD116]' : ''}`} />
          </button>
        }
      />

      {/* Main Content Body */}
      <div className="p-5 pb-3.5 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-2.5">
          {/* Header Row: Demand Level */}
          <div className="flex items-center justify-between text-xs">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${getDemandBadgeColor(
                skill.demandLevel
              )}`}
            >
              <TrendingUp className="w-3 h-3 shrink-0" />
              <span>{skill.demandLevel || 'High'} Demand</span>
            </span>

            {skill.certifications && skill.certifications.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <Award className="w-3 h-3 text-[#006B3F] dark:text-emerald-400" />
                <span>Certified Path</span>
              </span>
            )}
          </div>

          {/* Skill Title */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 transition-colors font-space leading-snug">
            {skill.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {skill.description}
          </p>

          {/* Top Careers */}
          {skill.topCareers && skill.topCareers.length > 0 && (
            <div className="pt-1">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-[#006B3F] dark:text-emerald-400" />
                <span>Target Career Roles</span>
              </p>
              <div className="flex flex-wrap gap-1">
                {skill.topCareers.slice(0, 2).map((career, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-semibold bg-slate-100/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700/80 truncate max-w-[210px]"
                  >
                    {career}
                  </span>
                ))}
                {skill.topCareers.length > 2 && (
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 self-center">
                    +{skill.topCareers.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Related Skills Pills */}
          {skill.relatedSkills && skill.relatedSkills.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {skill.relatedSkills.slice(0, 3).map((sub, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-2 py-0.5 rounded-md"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(`/opportunities?search=${encodeURIComponent(skill.name)}`);
              }}
              className="font-bold text-[#006B3F] dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Jobs
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(`/resources?search=${encodeURIComponent(skill.name)}`);
              }}
              className="font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Courses
            </button>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 transition-colors">
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </article>
  );
};
