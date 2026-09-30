import React, { useState } from 'react';
import { Opportunity } from '../../types/database';
import { DeadlineBadge } from '../common/DeadlineBadge';
import { VerificationBadge } from '../common/VerificationBadge';
import { Badge } from '../common/Badge';
import { MapPin, Bookmark, Building, ArrowUpRight, GraduationCap } from 'lucide-react';

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
  const [isSaved, setIsSaved] = useState(false);

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <article
      onClick={() => onNavigate(`/opportunities/${opportunity.slug}`)}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden ${
        featured
          ? 'border-emerald-600/30 shadow-md ring-1 ring-emerald-500/10 hover:shadow-lg'
          : 'border-slate-200/90 shadow-2xs hover:border-emerald-500/40 hover:shadow-sm'
      }`}
    >
      {/* Top Banner for Demo Records */}
      {opportunity.isDemo && (
        <div className="bg-amber-500/10 border-b border-amber-200/60 px-4 py-1 flex items-center justify-between text-[11px] text-amber-900 font-medium">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            DEV DEMO RECORD
          </span>
          <span className="text-amber-800/80 text-[10px]">Sample Architecture Data</span>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        {/* Header: Organization & Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {opportunity.organizationLogo ? (
              <img
                src={opportunity.organizationLogo}
                alt={opportunity.organizationName || 'Organization'}
                className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                <Building className="w-5 h-5 text-emerald-700" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">
                {opportunity.organizationName || 'Ghana Partner'}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{opportunity.location}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={toggleSave}
              title={isSaved ? 'Remove from saved' : 'Save opportunity'}
              className={`p-1.5 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-slate-50/70 border-slate-200/80 text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-700' : ''}`} />
            </button>
          </div>
        </div>

        {/* Opportunity Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug mb-2">
          {opportunity.title}
        </h3>

        {/* Short description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed flex-1">
          {opportunity.description}
        </p>

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <Badge variant="emerald">{opportunity.category}</Badge>
          <Badge variant="blue">{opportunity.opportunityType}</Badge>
          {opportunity.educationLevel && (
            <Badge variant="slate" className="truncate max-w-[170px]">
              <GraduationCap className="w-3 h-3" />
              {opportunity.educationLevel}
            </Badge>
          )}
        </div>
      </div>

      {/* Footer bar */}
      <div className="bg-slate-50/80 border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-2">
        <DeadlineBadge deadline={opportunity.deadline} />
        <div className="flex items-center gap-2">
          <VerificationBadge status={opportunity.verificationStatus} isDemo={opportunity.isDemo} />
          <span className="text-slate-400 group-hover:text-emerald-700 transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </article>
  );
};
