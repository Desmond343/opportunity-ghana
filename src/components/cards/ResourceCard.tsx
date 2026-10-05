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
        <span className="text-[11px] font-black text-amber-900 bg-amber-50 border border-amber-200/90 px-2 py-0.5 rounded-md font-mono">
          {resource.currency === 'USD' ? '$' : resource.currency === 'GBP' ? '£' : `${resource.currency} `}
          {resource.cost.toLocaleString()}
          {resource.pricingModel === 'monthly' ? '/mo' : resource.pricingModel === 'per-course' ? ' /course' : resource.pricingModel === 'per-exam' ? ' /paper' : ''}
        </span>
      );
    }

    if (resource.costType === 'free_to_audit') {
      return (
        <span className="text-[10px] font-extrabold text-sky-800 bg-sky-50 border border-sky-200/90 px-2 py-0.5 rounded-md tracking-wider uppercase font-space">
          FREE AUDIT
        </span>
      );
    }

    if (resource.costType === 'free_with_paid_certificate') {
      return (
        <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200/90 px-2 py-0.5 rounded-md tracking-wider uppercase font-space">
          FREE (PAID CERT)
        </span>
      );
    }

    return (
      <span className="text-[10px] font-extrabold text-[#006B3F] bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md tracking-wider uppercase font-space">
        100% FREE
      </span>
    );
  };

  const getCertBadge = () => {
    if (!resource.hasCertificate) {
      return (
        <span className="text-[10px] text-slate-500 font-medium">
          No Certificate
        </span>
      );
    }

    const type = resource.certificateType || '';
    const cost = (resource.certificateCost || '').toLowerCase();

    if (cost.includes('free') || cost.includes('$0') || type === 'Included Free' || type === 'Digital Skill Badge') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          Free Certificate
        </span>
      );
    }

    if (resource.costType === 'free_to_audit') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded">
          <Award className="w-3 h-3 text-sky-600 shrink-0" />
          Optional Paid Cert
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
        <Award className="w-3 h-3 text-slate-500 shrink-0" />
        Certificate
      </span>
    );
  };

  return (
    <article
      onClick={() => onNavigate(`/resources/${resource.slug}`)}
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-[#006B3F]/40 hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden hover:-translate-y-0.5"
    >
      {/* Visual Header Banner: Prioritizes uploaded image, or provides category gradient fallback */}
      <CardVisualHeader
        media={media}
        alt={resource.title}
        title={resource.title}
        subtitle={resource.providerName || 'Certified Partner'}
        heightClass="h-36 sm:h-40"
        badgeTopLeft={
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-white border border-white/10 shadow-xs font-space">
              {resource.category}
            </span>
            {resource.level && resource.level !== 'Not specified' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-white/90 text-slate-800 border border-slate-200/80 shadow-xs">
                {resource.level}
              </span>
            )}
            {resource.isFree && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-[#006B3F] text-[#FCD116] shadow-xs uppercase tracking-wider">
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
            className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-xs cursor-pointer ${
              isSaved
                ? 'bg-[#006B3F] text-[#FCD116] border border-[#006B3F]'
                : 'bg-slate-950/70 hover:bg-slate-950 text-white/90 hover:text-white border border-white/15'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#FCD116]' : ''}`} />
          </button>
        }
      />

      {/* Card Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Provider */}
          <p className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>By <strong className="text-slate-800">{resource.providerName || 'Certified Partner'}</strong></span>
            {getCertBadge()}
          </p>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#006B3F] transition-colors line-clamp-2 leading-snug font-space">
            {resource.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        </div>

        {/* Skills pill list */}
        {resource.skills && resource.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {resource.skills.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
              >
                {skill}
              </span>
            ))}
            {resource.skills.length > 3 && (
              <span className="text-[11px] text-slate-400 self-center">
                +{resource.skills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Meta Footer */}
      <div className="bg-slate-50/90 border-t border-slate-100 px-5 py-3 flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-3 text-slate-600 min-w-0">
          {resource.duration && (
            <span className="flex items-center gap-1 font-medium truncate">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{resource.duration}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {getCostBadge()}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/resources/${resource.slug}`);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#006B3F] text-white hover:bg-emerald-800 transition-colors cursor-pointer shadow-2xs"
          >
            <span>{resource.isFree ? 'View Free Course' : 'View Course'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
