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
        <span className="text-[11px] font-black text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/75 border border-amber-200/90 dark:border-amber-700/60 px-2 py-0.5 rounded-md font-mono">
          {resource.currency === 'USD' ? '$' : resource.currency === 'GBP' ? '£' : `${resource.currency} `}
          {resource.cost.toLocaleString()}
          {resource.pricingModel === 'monthly' ? '/mo' : resource.pricingModel === 'per-course' ? ' /course' : resource.pricingModel === 'per-exam' ? ' /paper' : ''}
        </span>
      );
    }

    if (resource.costType === 'free_to_audit') {
      return (
        <span className="text-[10px] font-extrabold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/75 border border-sky-200/90 dark:border-sky-700/60 px-2 py-0.5 rounded-md tracking-wider uppercase font-space">
          FREE AUDIT
        </span>
      );
    }

    if (resource.costType === 'free_with_paid_certificate') {
      return (
        <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/75 border border-amber-200/90 dark:border-amber-700/60 px-2 py-0.5 rounded-md tracking-wider uppercase font-space">
          FREE (PAID CERT)
        </span>
      );
    }

    return (
      <span className="text-[10px] font-extrabold text-[#006B3F] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/75 border border-emerald-300 dark:border-emerald-600/50 px-2 py-0.5 rounded-md tracking-wider uppercase font-space">
        100% FREE
      </span>
    );
  };

  const getCertBadge = () => {
    if (!resource.hasCertificate) {
      return (
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          No Certificate
        </span>
      );
    }

    const type = resource.certificateType || '';
    const cost = (resource.certificateCost || '').toLowerCase();

    if (cost.includes('free') || cost.includes('$0') || type === 'Included Free' || type === 'Digital Skill Badge') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/75 border border-emerald-200 dark:border-emerald-700/60 px-1.5 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          Free Certificate
        </span>
      );
    }

    if (resource.costType === 'free_to_audit') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/75 border border-sky-200 dark:border-sky-700/60 px-1.5 py-0.5 rounded">
          <Award className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
          Optional Paid Cert
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded">
        <Award className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
        Certificate
      </span>
    );
  };

  return (
    <article
      onClick={() => onNavigate(`/resources/${resource.slug}`)}
      className="floating-glass-tablet specular-rim-highlight group relative rounded-xl sm:rounded-2xl cursor-pointer flex flex-col justify-between overflow-hidden transition-all duration-200"
    >
      {/* Visual Header Banner: Prioritizes uploaded image, or provides category gradient fallback */}
      <CardVisualHeader
        media={media}
        alt={resource.title}
        title={resource.title}
        subtitle={resource.providerName || 'Certified Partner'}
        heightClass="h-24 sm:h-28 md:h-32"
        badgeTopLeft={
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-white border border-white/20 shadow-xs font-space">
              {resource.category}
            </span>
            {resource.level && resource.level !== 'Not specified' && (
              <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-white/90 dark:bg-slate-900/85 backdrop-blur-md text-slate-800 dark:text-slate-100 border border-white/60 dark:border-white/20 shadow-xs">
                {resource.level}
              </span>
            )}
            {resource.isFree && (
              <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md bg-[#006B3F]/95 backdrop-blur-md text-[#FCD116] border border-emerald-400/40 shadow-xs uppercase tracking-wider">
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
            className={`p-1.5 rounded-lg backdrop-blur-md transition-all duration-200 cursor-pointer hover:scale-105 ${
              isSaved
                ? 'bg-[#006B3F] text-[#FCD116] border border-emerald-400/50 shadow-xs'
                : 'bg-slate-950/70 hover:bg-slate-950/90 text-white/95 hover:text-white border border-white/20 shadow-xs'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#FCD116]' : ''}`} />
          </button>
        }
      />

      {/* Card Content Area */}
      <div className="p-3.5 sm:p-4 pb-2.5 sm:pb-3 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1.5">
          {/* Provider */}
          <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between gap-2">
            <span className="truncate">By <strong className="text-slate-800 dark:text-slate-200">{resource.providerName || 'Certified Partner'}</strong></span>
            {getCertBadge()}
          </p>

          {/* Title */}
          <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-slate-50 group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug font-space">
            {resource.title}
          </h3>

          {/* Description */}
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        </div>

        {/* Skills pill list */}
        {resource.skills && resource.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {resource.skills.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="text-[10px] sm:text-[11px] font-medium bg-white/85 dark:bg-slate-800/85 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-md shadow-2xs"
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

      {/* Layered Frosted Glass Meta Footer */}
      <div className="glass-subpanel mx-2.5 mb-2.5 sm:mx-3 sm:mb-3 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl flex items-center justify-between text-xs gap-1.5 sm:gap-2">
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
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold bg-[#006B3F] text-white hover:bg-emerald-800 transition-all cursor-pointer shadow-xs"
          >
            <span>{resource.isFree ? 'Free Course' : 'View'}</span>
            <ArrowUpRight className="w-3 h-3 text-[#FCD116]" />
          </button>
        </div>
      </div>
    </article>
  );
};
