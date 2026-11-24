import React, { useState } from 'react';
import { Resource } from '../../types/database';
import { Award, Clock, ArrowUpRight, Bookmark, CheckCircle2, ShieldCheck, GraduationCap } from 'lucide-react';
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
        <span className="text-[10px] sm:text-[11px] font-black text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/75 border border-amber-200/90 dark:border-amber-700/60 px-1.5 sm:px-2 py-[1px] sm:py-0.5 rounded-md font-mono whitespace-nowrap">
          {resource.currency === 'USD' ? '$' : resource.currency === 'GBP' ? '£' : `${resource.currency} `}
          {resource.cost.toLocaleString()}
          {resource.pricingModel === 'monthly' ? '/mo' : resource.pricingModel === 'per-course' ? ' /course' : resource.pricingModel === 'per-exam' ? ' /paper' : ''}
        </span>
      );
    }

    if (resource.costType === 'free_to_audit') {
      return (
        <span className="text-[9.5px] sm:text-[10px] font-extrabold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/75 border border-sky-200/90 dark:border-sky-700/60 px-1.5 sm:px-2 py-[1px] sm:py-0.5 rounded-md tracking-wider uppercase font-space whitespace-nowrap">
          FREE AUDIT
        </span>
      );
    }

    if (resource.costType === 'free_with_paid_certificate') {
      return (
        <span className="text-[9.5px] sm:text-[10px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/75 border border-amber-200/90 dark:border-amber-700/60 px-1.5 sm:px-2 py-[1px] sm:py-0.5 rounded-md tracking-wider uppercase font-space whitespace-nowrap">
          FREE (PAID CERT)
        </span>
      );
    }

    return (
      <span className="text-[9.5px] sm:text-[10px] font-extrabold text-[#006B3F] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/75 border border-emerald-300 dark:border-emerald-600/50 px-1.5 sm:px-2 py-[1px] sm:py-0.5 rounded-md tracking-wider uppercase font-space whitespace-nowrap">
        100% FREE
      </span>
    );
  };

  const getCertBadge = () => {
    if (!resource.hasCertificate) {
      return (
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
          No Certificate
        </span>
      );
    }

    const type = resource.certificateType || '';
    const cost = (resource.certificateCost || '').toLowerCase();

    if (cost.includes('free') || cost.includes('$0') || type === 'Included Free' || type === 'Digital Skill Badge') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/75 border border-emerald-200 dark:border-emerald-700/60 px-1.5 py-[1px] sm:py-0.5 rounded whitespace-nowrap">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          Free Certificate
        </span>
      );
    }

    if (resource.costType === 'free_to_audit') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/75 border border-sky-200 dark:border-sky-700/60 px-1.5 py-[1px] sm:py-0.5 rounded whitespace-nowrap">
          <Award className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
          Optional Paid Cert
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-[1px] sm:py-0.5 rounded whitespace-nowrap">
        <Award className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
        Certificate
      </span>
    );
  };

  const mobileCostText = resource.isFree
    ? 'Free'
    : `${resource.currency === 'USD' ? '$' : resource.currency === 'GBP' ? '£' : `${resource.currency} `}${resource.cost.toLocaleString()}`;

  return (
    <article
      onClick={() => onNavigate(`/resources/${resource.slug}`)}
      className="floating-glass-tablet specular-rim-highlight group relative rounded-xl md:rounded-2xl cursor-pointer flex flex-col justify-between overflow-hidden transition-all duration-200"
    >
      {/* Visual Header Banner: Prioritizes uploaded image, or provides category gradient fallback */}
      <CardVisualHeader
        media={media}
        alt={resource.title}
        title={resource.title}
        subtitle={resource.providerName || 'Certified Partner'}
        heightClass="h-[104px] min-[431px]:h-[88px] md:h-32"
        badgeTopLeft={
          <div className="flex items-center gap-1 md:gap-1.5 flex-wrap">
            <span className="text-[9px] min-[431px]:text-[8.5px] md:text-[10px] font-bold uppercase tracking-wider px-1.5 md:px-2 py-[2px] md:py-0.5 rounded bg-slate-950/80 md:backdrop-blur-md text-white border border-white/20 shadow-xs font-space truncate max-w-[96px] min-[431px]:max-w-[76px] md:max-w-none">
              {resource.category}
            </span>
            {resource.level && resource.level !== 'Not specified' && (
              <span className="hidden md:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/85 backdrop-blur-md text-slate-800 dark:text-slate-100 border border-white/60 dark:border-white/20 shadow-xs">
                {resource.level}
              </span>
            )}
            {resource.isFree && (
              <span className="hidden md:inline-block text-[10px] font-black px-1.5 py-0.5 rounded-md bg-[#006B3F]/95 backdrop-blur-md text-[#FCD116] border border-emerald-400/40 shadow-xs uppercase tracking-wider">
                FREE
              </span>
            )}
          </div>
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
      <div className="p-2 min-[431px]:p-1.5 md:p-4 md:pb-3 flex-1 flex flex-col justify-between gap-1.5 md:gap-0 md:space-y-2">
        <div className="space-y-0.5 md:space-y-1.5 min-w-0">
          {/* Mobile Compact Provider */}
          <p className="md:hidden text-[10.5px] min-[431px]:text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate leading-tight">
            {resource.providerName || 'Certified Partner'}
          </p>

          {/* Desktop Provider + Cert Badge */}
          <p className="hidden md:flex text-xs font-semibold text-slate-500 dark:text-slate-400 items-center justify-between gap-2">
            <span className="truncate">By <strong className="text-slate-800 dark:text-slate-200">{resource.providerName || 'Certified Partner'}</strong></span>
            {getCertBadge()}
          </p>

          {/* Title */}
          <h3 className="text-[12.5px] min-[431px]:text-[11.5px] md:text-xl font-semibold text-slate-900 dark:text-slate-50 group-hover:text-[#0056B3] dark:group-hover:text-sky-300 transition-colors line-clamp-2 leading-[1.25] min-[431px]:leading-[1.22] md:leading-snug font-serif text-left">
            {resource.title}
          </h3>

          {/* Description (Desktop only) */}
          <p className="hidden md:block text-[16px] text-[#333333] dark:text-slate-200 line-clamp-3 leading-relaxed font-serif text-left">
            {resource.description}
          </p>
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

        {/* Skills pill list (Desktop only) */}
        {resource.skills && resource.skills.length > 0 && (
          <div className="hidden md:flex flex-wrap gap-1 pt-0.5">
            {resource.skills.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="text-[11px] font-medium bg-white/85 dark:bg-slate-800/85 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-md shadow-2xs"
              >
                {skill}
              </span>
            ))}
            {resource.skills.length > 3 && (
              <span className="text-[10px] text-slate-400 dark:text-slate-400 self-center font-medium">
                +{resource.skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Desktop Layered Frosted Glass Meta Footer */}
      <div className="hidden md:flex glass-subpanel mx-3 mb-3 px-3 py-2 rounded-xl items-center justify-between text-xs gap-2 min-w-0">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 min-w-0">
          {resource.duration && (
            <span className="flex items-center gap-1 font-medium truncate text-[11px]">
              <Clock className="w-3 h-3 text-[#006B3F] dark:text-emerald-400 shrink-0" />
              <span className="truncate">{resource.duration}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {getCostBadge()}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/resources/${resource.slug}`);
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-[#006B3F] text-white hover:bg-emerald-800 transition-all cursor-pointer shadow-xs whitespace-nowrap"
          >
            <span>
              {resource.resourceType === 'event'
                ? 'View Event'
                : resource.isFree
                ? 'Free Course'
                : 'View'}
            </span>
            <ArrowUpRight className="w-3 h-3 text-[#FCD116]" />
          </button>
        </div>
      </div>
    </article>
  );
};
