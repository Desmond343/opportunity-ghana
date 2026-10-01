import React, { useState, useEffect } from 'react';
import { Opportunity } from '../../types/database';
import { DeadlineBadge } from '../common/DeadlineBadge';
import { VerificationBadge } from '../common/VerificationBadge';
import { MapPin, Bookmark, Building, ArrowUpRight, GraduationCap, Sparkles } from 'lucide-react';
import { SavedService } from '../../services/savedService';

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
  const [isSaved, setIsSaved] = useState(() => SavedService.isSaved(opportunity.id));

  useEffect(() => {
    setIsSaved(SavedService.isSaved(opportunity.id));
    const handleUpdate = (e: any) => {
      if (e.detail?.id === opportunity.id) {
        setIsSaved(e.detail.isSaved);
      }
    };
    window.addEventListener('saved-opportunities-changed', handleUpdate);
    return () => window.removeEventListener('saved-opportunities-changed', handleUpdate);
  }, [opportunity.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = SavedService.toggleSave({
      id: opportunity.id,
      slug: opportunity.slug,
      title: opportunity.title,
      category: opportunity.category,
      type: opportunity.opportunityType,
      organizationName: opportunity.organizationName,
      deadline: opportunity.deadline
    });
    setIsSaved(updated);
  };

  const isActuallyFeatured = featured || opportunity.featured;

  return (
    <article
      onClick={() => onNavigate(`/opportunities/${opportunity.slug}`)}
      className={`group relative bg-white rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 ${
        isActuallyFeatured
          ? 'border-[#006B3F]/30 shadow-sm hover:border-[#006B3F] hover:shadow-md'
          : 'border-slate-200/90 shadow-2xs hover:border-[#006B3F]/50 hover:shadow-md'
      }`}
    >
      {/* Featured Top Highlight */}
      {isActuallyFeatured && (
        <div className="bg-gradient-to-r from-[#006B3F] via-[#FCD116] to-[#006B3F] h-1 w-full" />
      )}

      {/* Opportunity Photo Banner (or tasteful branded fallback banner) */}
      <div className="relative w-full h-40 sm:h-44 overflow-hidden bg-slate-900">
        {opportunity.imageUrl ? (
          <img
            src={opportunity.imageUrl}
            alt={opportunity.title}
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-[#006B3F] to-slate-900 flex items-center justify-center p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FCD116_1px,transparent_1px)] [background-size:14px_14px]" />
            <div className="relative z-10 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FCD116] font-space block">
                {opportunity.category}
              </span>
              <p className="text-xs font-bold text-white font-space truncate max-w-[200px] mx-auto">
                {opportunity.organizationName || 'Opportunity Ghana'}
              </p>
            </div>
          </div>
        )}

        {/* Floating Category Badge over image */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[#FCD116] border border-white/10 shadow-xs font-space">
            {opportunity.category}
          </span>
          {isActuallyFeatured && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#FCD116] text-[#111111] shadow-xs">
              Featured
            </span>
          )}
        </div>

        {/* Floating Save Button */}
        <div className="absolute top-3 right-3">
          <button
            onClick={toggleSave}
            title={isSaved ? 'Remove from saved' : 'Save opportunity'}
            aria-label={isSaved ? 'Remove from saved' : 'Save opportunity'}
            className={`p-2 rounded-xl backdrop-blur-md transition-all shadow-xs cursor-pointer ${
              isSaved
                ? 'bg-[#006B3F] text-[#FCD116] border border-[#006B3F]'
                : 'bg-slate-950/70 hover:bg-slate-950 text-white/90 hover:text-white border border-white/15'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#FCD116]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Organization & Location Header */}
          <div className="flex items-center gap-2 text-xs text-slate-600">
            {opportunity.organizationLogo ? (
              <img
                src={opportunity.organizationLogo}
                alt={opportunity.organizationName || 'Organization'}
                className="w-4 h-4 rounded object-contain"
              />
            ) : (
              <Building className="w-3.5 h-3.5 text-[#006B3F] shrink-0" />
            )}
            <span className="font-semibold text-slate-800 truncate">
              {opportunity.organizationName || 'Verified Partner'}
            </span>
            {opportunity.location && (
              <>
                <span className="text-slate-300">•</span>
                <span className="truncate text-slate-500 text-[11px]">{opportunity.location}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-[#111111] group-hover:text-[#006B3F] transition-colors line-clamp-2 leading-snug font-space">
            {opportunity.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {opportunity.description}
          </p>
        </div>

        {/* Tag pills: Education level, funding, type */}
        <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
          {opportunity.opportunityType && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
              {opportunity.opportunityType}
            </span>
          )}

          {opportunity.fundingType && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#006B3F] font-semibold border border-emerald-100/60">
              {opportunity.fundingType}
            </span>
          )}

          {opportunity.educationLevel && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 truncate max-w-[140px]">
              <GraduationCap className="w-3 h-3 shrink-0 text-slate-400" />
              <span className="truncate">{opportunity.educationLevel}</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer bar with deadline & verification */}
      <div className="bg-slate-50/80 border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-2">
        <DeadlineBadge deadline={opportunity.deadline} />
        <div className="flex items-center gap-2">
          <VerificationBadge status={opportunity.verificationStatus} />
          <span className="p-1 rounded-lg text-slate-400 group-hover:text-[#006B3F] group-hover:bg-emerald-50 transition-all">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </article>
  );
};
