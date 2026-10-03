import React, { useState } from 'react';
import { Resource } from '../../types/database';
import { Award, Clock, ArrowUpRight, Bookmark, Globe } from 'lucide-react';
import { resolveResourceMedia } from '../../utils/cardBackgrounds';
import { CardVisualHeader } from './CardVisualHeader';

interface ResourceCardProps {
  resource: Resource;
  onNavigate: (route: string) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onNavigate }) => {
  const [isSaved, setIsSaved] = useState(false);
  const media = resolveResourceMedia(resource);

  const getFreeStatusLabel = () => {
    if (!resource.isFree) return null;
    if (resource.freeStatus === 'free_to_audit') return 'Course: Free to Audit';
    if (resource.freeStatus === 'free_with_paid_certificate') return 'Course: Free';
    return 'Course: Free';
  };

  const getCertificateLabel = () => {
    if (resource.certificateStatus === 'free_certificate') return 'Certificate: Free';
    if (resource.certificateStatus === 'paid_certificate') return 'Certificate: Paid';
    if (resource.certificateStatus === 'no_certificate') return 'Certificate: Not provided';
    return resource.hasCertificate ? 'Certificate: Included' : 'Certificate: Not provided';
  };

  return (
    <article
      onClick={() => onNavigate(`/resources/${resource.slug}`)}
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-[#006B3F]/40 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden hover:-translate-y-0.5"
    >
      {/* Visual Header Banner */}
      <CardVisualHeader
        media={media}
        alt={resource.title}
        title={resource.title}
        subtitle={resource.providerName || 'Certified Partner'}
        heightClass="h-36 sm:h-40"
        badgeTopLeft={
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white border border-white/10 shadow-xs font-space">
              {resource.category}
            </span>
            {resource.level && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-900/75 text-slate-100 border border-white/10 shadow-xs">
                {resource.level}
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
          {/* Provider & Format metadata */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
            <span className="font-bold text-slate-800 truncate">{resource.providerName || 'Certified Partner'}</span>
            {resource.subcategory && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate text-slate-500">{resource.subcategory}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#006B3F] transition-colors line-clamp-2 leading-snug font-space">
            {resource.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        </div>

        <div className="space-y-2.5 pt-1">
          {/* Free & Certificate Transparency Line */}
          {resource.isFree && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold pt-1 border-t border-slate-100">
              <span className="text-[#006B3F] font-bold">{getFreeStatusLabel()}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span
                className={
                  resource.certificateStatus === 'free_certificate'
                    ? 'text-emerald-700 font-bold'
                    : resource.certificateStatus === 'paid_certificate'
                    ? 'text-amber-700 font-semibold'
                    : 'text-slate-500 font-medium'
                }
              >
                {getCertificateLabel()}
              </span>
            </div>
          )}

          {/* Skills list */}
          {resource.skills && resource.skills.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
              <span className="truncate">
                {resource.skills.slice(0, 3).join(' · ')}
              </span>
              {resource.skills.length > 3 && (
                <span className="text-slate-400 shrink-0">+{resource.skills.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Meta Footer */}
      <div className="bg-slate-50/80 border-t border-slate-100 px-5 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-slate-600 truncate">
          {resource.duration && (
            <span className="flex items-center gap-1 font-medium truncate">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{resource.duration.split('(')[0].trim()}</span>
            </span>
          )}
          <span className="flex items-center gap-1 text-slate-500 text-[11px] shrink-0" title="Accessible to learners in Ghana">
            <Globe className="w-3 h-3 text-emerald-700" />
            <span>Ghana</span>
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {resource.isFree ? (
            <span className="text-[11px] font-bold text-[#006B3F]">
              {resource.certificateStatus === 'free_certificate'
                ? 'Free + Free Cert'
                : resource.freeStatus === 'free_to_audit'
                ? 'Free to Audit'
                : '100% Free'}
            </span>
          ) : (
            <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">
              {resource.currency === 'USD' ? '$' : resource.currency === 'GBP' ? '£' : `${resource.currency} `}
              {resource.cost.toLocaleString()}
              {resource.pricingModel === 'monthly' ? '/mo' : resource.pricingModel === 'per-course' ? '/course' : resource.pricingModel === 'per-exam' ? '/paper' : ''}
            </span>
          )}
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#006B3F] transition-colors" />
        </div>
      </div>
    </article>
  );
};
