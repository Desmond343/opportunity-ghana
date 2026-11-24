import React, { useState } from 'react';
import { Resource } from '../../types/database';
import { Award, Clock, Bookmark } from 'lucide-react';
import { resolveResourceMedia } from '../../utils/cardBackgrounds';
import { CardVisualHeader } from './CardVisualHeader';

interface ResourceCardProps {
  resource: Resource;
  onNavigate: (route: string) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onNavigate }) => {
  const [isSaved, setIsSaved] = useState(false);
  const media = resolveResourceMedia(resource);

  const getCostBadge = () => {
    if (!resource.isFree) {
      return (
        <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/75 border border-amber-200/90 dark:border-amber-700/60 px-2 py-0.5 rounded-md font-mono whitespace-nowrap">
          {resource.currency === 'USD' ? '$' : resource.currency === 'GBP' ? '£' : `${resource.currency} `}
          {resource.cost.toLocaleString()}
          {resource.pricingModel === 'monthly'
            ? '/mo'
            : resource.pricingModel === 'per-course'
            ? ' /course'
            : resource.pricingModel === 'per-exam'
            ? ' /paper'
            : ''}
        </span>
      );
    }

    if (resource.costType === 'free_to_audit') {
      return (
        <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/75 border border-sky-200/90 dark:border-sky-700/60 px-2 py-0.5 rounded-md tracking-wider uppercase font-space whitespace-nowrap">
          Free Audit
        </span>
      );
    }

    if (resource.costType === 'free_with_paid_certificate') {
      return (
        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/75 border border-amber-200/90 dark:border-amber-700/60 px-2 py-0.5 rounded-md tracking-wider uppercase font-space whitespace-nowrap">
          Free (Paid Cert)
        </span>
      );
    }

    return (
      <span className="text-[10px] font-bold text-[#006B3F] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/75 border border-emerald-300 dark:border-emerald-600/50 px-2 py-0.5 rounded-md tracking-wider uppercase font-space whitespace-nowrap">
        100% Free
      </span>
    );
  };

  const mobileCostText = resource.isFree
    ? 'Free'
    : `${resource.currency === 'USD' ? '$' : resource.currency === 'GBP' ? '£' : `${resource.currency} `}${resource.cost.toLocaleString()}`;

  return (
    <article
      onClick={() => onNavigate(`/resources/${resource.slug}`)}
      className="floating-glass-tablet specular-rim-highlight group relative rounded-xl md:rounded-2xl cursor-pointer flex flex-col justify-between overflow-hidden transition-all duration-200 h-full"
    >
      {/* Visual Header Banner */}
      <CardVisualHeader
        media={media}
        alt={resource.title}
        title={resource.title}
        subtitle={resource.providerName || 'Certified Partner'}
        heightClass="h-[104px] min-[431px]:h-[88px] md:h-40"
        badgeTopLeft={
          <span className="text-[9px] min-[431px]:text-[8.5px] md:text-[10px] font-bold uppercase tracking-wider px-1.5 md:px-2.5 py-[2px] md:py-0.5 rounded md:rounded-md bg-slate-950/80 md:backdrop-blur-md text-white border border-white/20 shadow-xs font-space truncate max-w-[96px] min-[431px]:max-w-[76px] md:max-w-[180px]">
            {resource.category}
          </span>
        }
        actionsTopRight={
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSaved(!isSaved);
            }}
            title={isSaved ? 'Remove from saved' : 'Save resource'}
            aria-label={isSaved ? 'Remove from saved' : 'Save resource'}
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
          {/* Provider Name */}
          <p className="text-[10.5px] min-[431px]:text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400 truncate leading-tight">
            {resource.providerName || 'Certified Partner'}
          </p>

          {/* Title */}
          <h3 className="text-[12.5px] min-[431px]:text-[11.5px] md:text-[17px] font-semibold md:font-bold text-slate-900 dark:text-slate-50 group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-[1.25] min-[431px]:leading-[1.22] md:leading-snug md:min-h-[46px] font-serif md:font-sans text-left">
            {resource.title}
          </h3>
        </div>

        {/* Mobile Compact Footer */}
        <div className="md:hidden pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1 text-[10px] min-[431px]:text-[9.5px] leading-tight min-w-0">
          <span className={`font-bold truncate ${resource.isFree ? 'text-[#006B3F] dark:text-emerald-400' : 'text-amber-700 dark:text-amber-300'}`}>
            {mobileCostText}
          </span>
          <span className="font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[70px]">
            {resource.hasCertificate ? 'Certificate' : resource.duration || 'Self-paced'}
          </span>
        </div>

        {/* Desktop Clean Cost & Duration Footer */}
        <div className="hidden md:flex pt-2.5 border-t border-slate-100 dark:border-slate-800/80 items-center justify-between gap-2 text-xs min-w-0">
          {getCostBadge()}
          <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium truncate">
            {resource.duration ? (
              <>
                <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="truncate">{resource.duration}</span>
              </>
            ) : resource.hasCertificate ? (
              <>
                <Award className="w-3.5 h-3.5 text-[#006B3F] dark:text-emerald-400 shrink-0" />
                <span>Certificate</span>
              </>
            ) : (
              <span>Self-paced</span>
            )}
          </span>
        </div>
      </div>
    </article>
  );
};
