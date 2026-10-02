import React, { useState } from 'react';
import { Resource } from '../../types/database';
import { Award, Clock, ArrowUpRight, Bookmark } from 'lucide-react';
import { resolveResourceMedia } from '../../utils/cardBackgrounds';
import { CardVisualHeader } from './CardVisualHeader';

interface ResourceCardProps {
  resource: Resource;
  onNavigate: (route: string) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onNavigate }) => {
  const [isSaved, setIsSaved] = useState(false);
  const media = resolveResourceMedia(resource);

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
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white border border-white/10 shadow-xs font-space">
              {resource.category}
            </span>
            {resource.resourceType && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-600/90 text-white shadow-xs capitalize">
                {resource.resourceType}
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
          <p className="text-xs font-semibold text-slate-500">
            By <span className="text-slate-800 font-bold">{resource.providerName || 'Certified Partner'}</span>
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
      <div className="bg-slate-50/80 border-t border-slate-100 px-5 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-slate-600">
          {resource.duration && (
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {resource.duration}
            </span>
          )}
          {resource.hasCertificate && (
            <span className="flex items-center gap-1 text-emerald-700 font-semibold" title="Certificate provided">
              <Award className="w-3.5 h-3.5" />
              Certificate
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {resource.isFree ? (
            <span className="text-xs font-bold text-[#006B3F] bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
              FREE
            </span>
          ) : (
            <span className="text-xs font-bold text-slate-900">
              {resource.currency} {resource.cost}
            </span>
          )}
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#006B3F] transition-colors" />
        </div>
      </div>
    </article>
  );
};
