import React, { useState, useEffect } from 'react';
import { Skill } from '../../types/database';
import { CardVisualHeader } from './CardVisualHeader';
import { resolveSkillMedia } from '../../utils/cardBackgrounds';
import { SavedService } from '../../services/savedService';
import { useAuth } from '../../services/authContext';
import { Bookmark, ArrowRight, TrendingUp } from 'lucide-react';

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
      className="floating-glass-tablet specular-rim-highlight group relative rounded-xl md:rounded-2xl cursor-pointer flex flex-col justify-between overflow-hidden transition-all duration-200 h-full"
    >
      {/* Visual Header Banner */}
      <CardVisualHeader
        media={media}
        alt={skill.imageAlt || skill.name}
        title={skill.name}
        subtitle={skill.category}
        heightClass="h-[104px] min-[431px]:h-[88px] md:h-40"
        badgeTopLeft={
          <span className="text-[9px] min-[431px]:text-[8.5px] md:text-[10px] font-bold uppercase tracking-wider px-1.5 md:px-2.5 py-[2px] md:py-0.5 rounded md:rounded-md bg-slate-950/80 md:backdrop-blur-md text-white border border-white/15 shadow-xs truncate max-w-[96px] min-[431px]:max-w-[76px] md:max-w-[180px]">
            {skill.category}
          </span>
        }
        actionsTopRight={
          <button
            type="button"
            onClick={toggleSave}
            title={isSaved ? 'Remove from saved' : 'Save skill'}
            aria-label={isSaved ? 'Remove from saved' : 'Save skill'}
            className={`p-1 md:p-1.5 rounded-md md:rounded-lg backdrop-blur-md transition-all shadow-xs cursor-pointer ${
              isSaved
                ? 'bg-[#006B3F] text-[#FCD116] border border-emerald-400/50'
                : 'bg-slate-950/70 text-white/90 hover:bg-slate-950/90 hover:text-white border border-white/20'
            }`}
          >
            <Bookmark className={`w-3 h-3 md:w-3.5 md:h-3.5 ${isSaved ? 'fill-[#FCD116]' : ''}`} />
          </button>
        }
      />

      {/* Main Content Body */}
      <div className="p-2 min-[431px]:p-1.5 md:p-4 flex-1 flex flex-col justify-between gap-1.5 md:gap-3 min-w-0">
        <div className="space-y-0.5 md:space-y-1.5 min-w-0">
          {/* Mobile Compact Demand Label */}
          <p className="md:hidden text-[10.5px] min-[431px]:text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 truncate leading-tight">
            {skill.demandLevel || 'High'} Demand
          </p>

          {/* Desktop Demand Label */}
          <div className="hidden md:flex items-center justify-between text-xs">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${getDemandBadgeColor(
                skill.demandLevel
              )}`}
            >
              <TrendingUp className="w-3 h-3 shrink-0" />
              <span>{skill.demandLevel || 'High'} Demand</span>
            </span>
          </div>

          {/* Skill Title */}
          <h3 className="text-[12.5px] min-[431px]:text-[11.5px] md:text-[17px] font-semibold md:font-bold text-[#111111] dark:text-white group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 transition-colors font-serif md:font-sans leading-[1.25] min-[431px]:leading-[1.22] md:leading-snug md:min-h-[46px] line-clamp-2 text-left">
            {skill.name}
          </h3>
        </div>

        {/* Mobile Compact Footer */}
        <div className="md:hidden pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1 text-[10px] min-[431px]:text-[9.5px] leading-tight min-w-0">
          <span className="font-medium text-slate-500 dark:text-slate-400 truncate">
            {skill.level || 'All Levels'}
          </span>
          <span className="font-bold text-[#006B3F] dark:text-emerald-400 shrink-0">
            Explore
          </span>
        </div>

        {/* Desktop Compact Footer */}
        <div className="hidden md:flex pt-2.5 border-t border-slate-100 dark:border-slate-800/80 items-center justify-between gap-2 text-xs">
          <span className="font-medium text-slate-500 dark:text-slate-400 truncate">
            {skill.level || 'All Levels'}
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-[#006B3F] dark:text-emerald-400">
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </article>
  );
};
