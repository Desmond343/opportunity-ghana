import React, { useState } from 'react';
import { Resource } from '../../types/database';
import { Badge } from '../common/Badge';
import { BookOpen, Award, Clock, ArrowUpRight, Bookmark, Sparkles } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onNavigate: (route: string) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onNavigate }) => {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <article
      onClick={() => onNavigate(`/resources/${resource.slug}`)}
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-500/40 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="indigo" size="sm" className="capitalize">
              {resource.resourceType}
            </Badge>
            <Badge variant="slate" size="sm">
              {resource.category}
            </Badge>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSaved(!isSaved);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-700 text-emerald-700' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug mb-2">
          {resource.title}
        </h3>

        {/* Provider */}
        <p className="text-xs font-semibold text-slate-600 mb-2">
          By {resource.providerName || 'Certified Partner'}
        </p>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed flex-1">
          {resource.description}
        </p>

        {/* Skills pill list */}
        <div className="flex flex-wrap gap-1 mb-4">
          {resource.skills.slice(0, 3).map((skill, i) => (
            <span
              key={i}
              className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
            >
              {skill}
            </span>
          ))}
          {resource.skills.length > 3 && (
            <span className="text-[11px] text-slate-500 self-center">
              +{resource.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Meta Footer */}
      <div className="bg-slate-50/80 border-t border-slate-100 px-5 py-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-slate-600">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {resource.duration}
          </span>
          {resource.hasCertificate && (
            <span className="flex items-center gap-1 text-emerald-700 font-semibold" title="Certificate provided">
              <Award className="w-3.5 h-3.5" />
              Certificate
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {resource.isFree ? (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
              FREE
            </span>
          ) : (
            <span className="text-xs font-bold text-slate-900">
              {resource.currency} {resource.cost}
            </span>
          )}
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
        </div>
      </div>
    </article>
  );
};
