import React, { useState, useEffect } from 'react';
import { Opportunity } from '../../types/database';
import { Bookmark, Building, Calendar } from 'lucide-react';
import { SavedService } from '../../services/savedService';
import { useAuth } from '../../services/authContext';
import { resolveOpportunityMedia } from '../../utils/cardBackgrounds';
import { CardVisualHeader } from './CardVisualHeader';
import {
  getOpportunityLifecycleStatus,
  getReopeningInfo,
  useCurrentTime
} from '../../services/deadlineService';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onNavigate: (route: string) => void;
  featured?: boolean;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onNavigate,
  featured = false
}) => {
  const { currentUser, getIdToken } = useAuth();
  const [isSaved, setIsSaved] = useState(() => SavedService.isSaved(opportunity.id));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsSaved(SavedService.isSaved(opportunity.id));
    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.id === opportunity.id || e.detail.userId !== undefined) {
        setIsSaved(SavedService.isSaved(opportunity.id));
      }
    };
    window.addEventListener('saved-opportunities-changed', handleUpdate);
    return () => window.removeEventListener('saved-opportunities-changed', handleUpdate);
  }, [opportunity.id]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const updated = await SavedService.toggleSave(
        {
          id: opportunity.id,
          slug: opportunity.slug,
          title: opportunity.title,
          category: opportunity.category,
          type: opportunity.opportunityType,
          organizationName: opportunity.organizationName,
          deadline: opportunity.deadline
        },
        currentUser?.id,
        getIdToken
      );
      setIsSaved(updated);
    } catch (err: any) {
      console.warn('Save error on card:', err?.message || err);
    } finally {
      setIsSaving(false);
    }
  };

  const now = useCurrentTime();
  const lifecycle = getOpportunityLifecycleStatus(opportunity, now);
  const reopening = lifecycle.isClosed ? getReopeningInfo(opportunity) : null;
  const isActuallyFeatured = featured || opportunity.featured;
  const media = resolveOpportunityMedia(opportunity);

  const mobileStatus = (() => {
    if (lifecycle.isClosed) {
      return {
        label: 'Closed',
        labelClass: 'text-slate-500 dark:text-slate-400',
        deadline: reopening?.previousDeadlineFormatted || 'Ended'
      };
    }
    if (lifecycle.isUpcoming) {
      return {
        label: 'Upcoming',
        labelClass: 'text-sky-700 dark:text-sky-300',
        deadline: lifecycle.opensFormatted || 'Soon'
      };
    }
    if (opportunity.isDeadlineSpecified === false || lifecycle.deadlineInfo.status === 'rolling') {
      return {
        label: 'Open',
        labelClass: 'text-[#006B3F] dark:text-emerald-400',
        deadline: 'Rolling'
      };
    }
    if (lifecycle.deadlineInfo.isToday) {
      return {
        label: 'Closing Soon',
        labelClass: 'text-[#CE1126] dark:text-rose-400',
        deadline: 'Today'
      };
    }
    if (lifecycle.deadlineInfo.isClosingSoon) {
      return {
        label: 'Closing Soon',
        labelClass: 'text-amber-700 dark:text-amber-400',
        deadline: `${lifecycle.deadlineInfo.daysLeft}d left`
      };
    }
    return {
      label: 'Open',
      labelClass: 'text-[#006B3F] dark:text-emerald-400',
      deadline: `${lifecycle.deadlineInfo.daysLeft}d left`
    };
  })();

  const desktopStatus = (() => {
    if (lifecycle.isClosed) {
      return {
        label: 'Closed',
        badgeClass:
          'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        dotClass: 'bg-slate-400 dark:bg-slate-500',
        deadlineText:
          reopening?.previousDeadlineFormatted ||
          (lifecycle.deadlineInfo.formattedDate !== 'Rolling Basis'
            ? lifecycle.deadlineInfo.formattedDate
            : 'Ended')
      };
    }
    if (lifecycle.isUpcoming) {
      return {
        label: 'Upcoming',
        badgeClass:
          'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60',
        dotClass: 'bg-sky-500 dark:bg-sky-400',
        deadlineText: lifecycle.opensFormatted
          ? `Opens ${lifecycle.opensFormatted}`
          : lifecycle.deadlineInfo.formattedDate !== 'Rolling Basis'
          ? lifecycle.deadlineInfo.formattedDate
          : 'Coming soon'
      };
    }
    if (opportunity.isDeadlineSpecified === false || lifecycle.deadlineInfo.status === 'rolling') {
      return {
        label: 'Open',
        badgeClass:
          'bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
        dotClass: 'bg-[#006B3F] dark:bg-emerald-400',
        deadlineText: 'Rolling'
      };
    }
    if (lifecycle.deadlineInfo.urgency === 'critical') {
      return {
        label: 'Closing Soon',
        badgeClass:
          'bg-rose-50 dark:bg-rose-950/60 text-[#CE1126] dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
        dotClass: 'bg-[#CE1126] dark:bg-rose-400',
        deadlineText: lifecycle.deadlineInfo.isToday
          ? 'Closes today'
          : lifecycle.deadlineInfo.formattedDate
      };
    }
    if (lifecycle.deadlineInfo.isClosingSoon) {
      return {
        label: 'Closing Soon',
        badgeClass:
          'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
        dotClass: 'bg-amber-500 dark:bg-amber-400',
        deadlineText: lifecycle.deadlineInfo.formattedDate
      };
    }
    return {
      label: 'Open',
      badgeClass:
        'bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      dotClass: 'bg-[#006B3F] dark:bg-emerald-400',
      deadlineText: lifecycle.deadlineInfo.formattedDate
    };
  })();

  return (
    <article
      onClick={() => {
        if (opportunity.customNavigationPath) {
          onNavigate(opportunity.customNavigationPath);
        } else if (opportunity.category === 'Admissions' && opportunity.institutionSlug) {
          onNavigate(`/institutions/${opportunity.institutionSlug}`);
        } else {
          onNavigate(`/opportunities/${opportunity.slug}`);
        }
      }}
      className={`floating-glass-tablet specular-rim-highlight group relative rounded-xl md:rounded-2xl cursor-pointer flex flex-col justify-between overflow-hidden transition-all duration-200 h-full ${
        isActuallyFeatured ? 'featured-tablet' : ''
      }`}
    >
      {/* Featured Top Accent */}
      {isActuallyFeatured && (
        <div className="bg-gradient-to-r from-[#006B3F] via-[#FCD116] to-[#006B3F] h-0.5 md:h-1 w-full relative z-20 shrink-0" />
      )}

      {/* Visual Header */}
      <CardVisualHeader
        media={media}
        alt={opportunity.title}
        title={opportunity.title}
        subtitle={opportunity.organizationName || 'Opportunity Ghana'}
        heightClass="h-[104px] min-[431px]:h-[88px] md:h-40"
        badgeTopLeft={
          <span className="text-[9px] min-[431px]:text-[8.5px] md:text-[10px] font-bold uppercase tracking-wider px-1.5 md:px-2.5 py-[2px] md:py-0.5 rounded md:rounded-md bg-slate-950/80 md:backdrop-blur-md text-[#FCD116] border border-white/20 shadow-xs font-space truncate max-w-[96px] min-[431px]:max-w-[76px] md:max-w-[180px]">
            {opportunity.category}
          </span>
        }
        actionsTopRight={
          <button
            onClick={toggleSave}
            title={isSaved ? 'Remove from saved' : 'Save opportunity'}
            aria-label={isSaved ? 'Remove from saved' : 'Save opportunity'}
            className={`p-1 md:p-1.5 rounded-md md:rounded-lg backdrop-blur-md transition-all duration-200 cursor-pointer md:hover:scale-105 ${
              isSaved
                ? 'bg-[#006B3F] text-[#FCD116] border border-emerald-400/50 shadow-xs'
                : 'bg-slate-950/70 hover:bg-slate-950/90 text-white/95 hover:text-white border border-white/20 shadow-xs'
            }`}
          >
            <Bookmark className={`w-3 h-3 md:w-3.5 md:h-3.5 ${isSaved ? 'fill-[#FCD116]' : ''}`} />
          </button>
        }
      />

      {/* Card Content Area */}
      <div className="p-2 min-[431px]:p-1.5 md:p-4 flex-1 flex flex-col justify-between gap-1.5 md:gap-3 min-w-0">
        <div className="space-y-0.5 md:space-y-1.5 min-w-0">
          {/* Mobile Compact 1-Line Organisation */}
          <p className="md:hidden text-[10.5px] min-[431px]:text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate leading-tight">
            {opportunity.organizationName || 'Verified Partner'}
          </p>

          {/* Desktop 1-Line Organisation */}
          <div className="hidden md:flex items-center gap-1.5 min-w-0 text-xs text-slate-600 dark:text-slate-300">
            {opportunity.organizationLogo ? (
              <img
                src={opportunity.organizationLogo}
                alt={opportunity.organizationName || 'Organization'}
                className="w-4 h-4 rounded object-contain shrink-0 bg-white/90 dark:bg-slate-800 p-0.5"
              />
            ) : (
              <Building className="w-3.5 h-3.5 text-[#006B3F] dark:text-emerald-400 shrink-0" />
            )}
            <span className="font-medium text-slate-600 dark:text-slate-300 truncate">
              {opportunity.organizationName || 'Verified Partner'}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-[12.5px] min-[431px]:text-[11.5px] md:text-[17px] font-semibold md:font-bold text-[#111111] dark:text-slate-50 group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-[1.25] min-[431px]:leading-[1.22] md:leading-snug md:min-h-[46px] font-serif md:font-sans text-left">
            {opportunity.title}
          </h3>
        </div>

        {/* Mobile Compact Status & Deadline Strip */}
        <div className="md:hidden pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1 text-[10px] min-[431px]:text-[9.5px] leading-tight min-w-0">
          <span className={`font-bold truncate ${mobileStatus.labelClass}`}>
            {mobileStatus.label}
          </span>
          <span className="font-semibold text-slate-600 dark:text-slate-300 tabular-nums shrink-0 truncate max-w-[68px]">
            {mobileStatus.deadline}
          </span>
        </div>

        {/* Desktop Clean Status & Deadline Footer */}
        <div className="hidden md:flex pt-2.5 border-t border-slate-100 dark:border-slate-800/80 items-center justify-between gap-2 text-xs min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 font-semibold px-2 py-0.5 rounded-md border shrink-0 ${desktopStatus.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${desktopStatus.dotClass}`} />
            <span>{desktopStatus.label}</span>
          </span>

          {desktopStatus.deadlineText && (
            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium tabular-nums truncate">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate">{desktopStatus.deadlineText}</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
