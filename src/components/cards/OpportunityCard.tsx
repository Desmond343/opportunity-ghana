import React, { useState, useEffect } from 'react';
import { Opportunity } from '../../types/database';
import { DeadlineBadge } from '../common/DeadlineBadge';
import { VerificationBadge } from '../common/VerificationBadge';
import { Badge } from '../common/Badge';
import { MapPin, Bookmark, Building, ArrowUpRight, GraduationCap } from 'lucide-react';
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

  return (
    <article
      onClick={() => onNavigate(`/opportunities/${opportunity.slug}`)}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden ${
        featured
          ? 'border-[#FCD116]/70 shadow-sm ring-1 ring-[#FCD116]/30 hover:shadow-md'
          : 'border-[#E5E7EB] shadow-2xs hover:border-[#006B3F]/40 hover:shadow-sm'
      }`}
    >
      {/* Featured Gold Top Accent Line */}
      {featured && (
        <div className="bg-[#FCD116] h-1 w-full" />
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
              <div className="w-10 h-10 rounded-xl bg-[#E6F0EB] border border-[#006B3F]/20 text-[#006B3F] flex items-center justify-center font-bold text-xs shrink-0">
                <Building className="w-5 h-5 text-[#006B3F]" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#111111] truncate">
                {opportunity.organizationName || 'Ghana Partner'}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#5F6368]">
                <MapPin className="w-3 h-3 text-[#737373] shrink-0" />
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
                  ? 'bg-[#E6F0EB] border-[#006B3F]/30 text-[#006B3F]'
                  : 'bg-[#F7F9F8] border-[#E5E7EB] text-[#737373] hover:text-[#111111] hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#006B3F]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Opportunity Title */}
        <h3 className="text-base font-bold text-[#111111] group-hover:text-[#006B3F] transition-colors line-clamp-2 leading-snug mb-2">
          {opportunity.title}
        </h3>

        {/* Short description */}
        <p className="text-xs text-[#5F6368] line-clamp-2 mb-4 leading-relaxed flex-1">
          {opportunity.description}
        </p>

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <Badge variant={opportunity.category === 'Scholarships' ? 'ghana-gold' : 'ghana-green'}>
            {opportunity.category}
          </Badge>
          <Badge variant="slate">{opportunity.opportunityType}</Badge>
          {featured && (
            <Badge variant="ghana-gold" size="sm">Featured</Badge>
          )}
          {opportunity.educationLevel && (
            <Badge variant="slate" className="truncate max-w-[170px]">
              <GraduationCap className="w-3 h-3" />
              {opportunity.educationLevel}
            </Badge>
          )}
        </div>
      </div>

      {/* Footer bar */}
      <div className="bg-[#F7F9F8] border-t border-[#E5E7EB] px-5 py-3 flex items-center justify-between gap-2">
        <DeadlineBadge deadline={opportunity.deadline} />
        <div className="flex items-center gap-2">
          <VerificationBadge status={opportunity.verificationStatus} />
          <span className="text-[#737373] group-hover:text-[#006B3F] transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </article>
  );
};
