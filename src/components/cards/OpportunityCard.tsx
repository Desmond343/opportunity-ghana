import React, { useState, useEffect } from 'react';
import { Opportunity } from '../../types/database';
import { DeadlineBadge } from '../common/DeadlineBadge';
import { VerificationBadge } from '../common/VerificationBadge';
import { MapPin, Bookmark, Building, ArrowUpRight, GraduationCap, Briefcase, Compass, Clock } from 'lucide-react';
import { SavedService } from '../../services/savedService';
import { useAuth } from '../../services/authContext';
import { resolveOpportunityMedia } from '../../utils/cardBackgrounds';
import { CardVisualHeader } from './CardVisualHeader';

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
  const { currentUser, getIdToken } = useAuth();
  const [isSaved, setIsSaved] = useState(() => SavedService.isSaved(opportunity.id));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsSaved(SavedService.isSaved(opportunity.id));
    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.id === opportunity.id || e.detail.userId !== undefined) {
        setIsSaved(SavedService.isSaved(opportunity.id));
      }
    };
    window.addEventListener('saved-opportunities-changed', handleUpdate);
    return () => window.removeEventListener('saved-opportunities-changed', handleUpdate);
  }, [opportunity.id]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const updated = await SavedService.toggleSave(
        {
          id: opportunity.id,
          slug: opportunity.slug,
          title: opportunity.title,
          category: opportunity.category,
          type: opportunity.opportunityType,
          organizationName: opportunity.organizationName,
          deadline: opportunity.deadline
        },
        currentUser?.id,
        getIdToken
      );
      setIsSaved(updated);
    } catch (err: any) {
      console.warn('Save error on card:', err?.message || err);
    } finally {
      setIsSaving(false);
    }
  };

  const isActuallyFeatured = featured || opportunity.featured;
  const media = resolveOpportunityMedia(opportunity);
  const isJob = opportunity.category === 'Jobs';
  const isInternship = opportunity.category === 'Internships';

  return (
    <article
      onClick={() => onNavigate(`/opportunities/${opportunity.slug}`)}
      className={`floating-glass-tablet specular-rim-highlight group relative rounded-2xl sm:rounded-[22px] cursor-pointer flex flex-col justify-between overflow-hidden ${
        isActuallyFeatured ? 'featured-tablet' : ''
      }`}
    >
      {/* Featured Top Highlight */}
      {isActuallyFeatured && (
        <div className="bg-gradient-to-r from-[#006B3F] via-[#FCD116] to-[#006B3F] h-1.5 w-full relative z-20" />
      )}

      {/* Visual Header (Image with subtle dark gradient overlay, or category gradient fallback) */}
      <CardVisualHeader
        media={media}
        alt={opportunity.title}
        title={opportunity.title}
        subtitle={opportunity.organizationName || 'Opportunity Ghana'}
        badgeTopLeft={
          <>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-950/75 backdrop-blur-md text-[#FCD116] border border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] font-space">
              {opportunity.category}
            </span>
            {isActuallyFeatured && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-[#FCD116]/95 backdrop-blur-md text-[#111111] border border-white/40 shadow-xs">
                Featured
              </span>
            )}
          </>
        }
        actionsTopRight={
          <button
            onClick={toggleSave}
            title={isSaved ? 'Remove from saved' : 'Save opportunity'}
            aria-label={isSaved ? 'Remove from saved' : 'Save opportunity'}
            className={`p-2 rounded-xl backdrop-blur-md transition-all duration-200 cursor-pointer hover:scale-105 ${
              isSaved
                ? 'bg-[#006B3F] text-[#FCD116] border border-emerald-400/50 shadow-[0_4px_12px_rgba(0,107,63,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]'
                : 'bg-slate-950/70 hover:bg-slate-950/90 text-white/95 hover:text-white border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#FCD116]' : ''}`} />
          </button>
        }
      />

      {/* Card Content Area */}
      <div className="p-5 pb-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Organization & Location Header */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 truncate max-w-[200px]">
              {opportunity.organizationLogo ? (
                <img
                  src={opportunity.organizationLogo}
                  alt={opportunity.organizationName || 'Organization'}
                  className="w-4 h-4 rounded object-contain shrink-0"
                />
              ) : (
                <Building className="w-3.5 h-3.5 text-[#006B3F] shrink-0" />
              )}
              <span className="font-semibold text-slate-800 truncate">
                {opportunity.organizationName || 'Verified Partner'}
              </span>
            </div>

            {/* Location / Region Badge */}
            {(opportunity.location || opportunity.region || opportunity.country) && (
              <span className="inline-flex items-center gap-1 text-slate-600 text-[11px] font-medium bg-white/80 backdrop-blur-xs border border-slate-200/80 px-2 py-0.5 rounded-md shadow-2xs">
                <MapPin className="w-3 h-3 text-[#006B3F] shrink-0" />
                <span className="truncate">
                  {opportunity.location || `${opportunity.region ? opportunity.region + ', ' : ''}${opportunity.country || 'Ghana'}`}
                </span>
              </span>
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

        {/* Tag pills: Ghanaian eligibility, work arrangement, employment/internship type, salary/funding */}
        <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
          {/* Ghanaian Eligibility Badge */}
          {(opportunity.isGhanaEligible || opportunity.nationality?.toLowerCase().includes('ghana') || opportunity.eligibleCountries?.includes('Ghana')) && (
            <span className="px-2 py-0.5 rounded-md bg-[#E6F0EB]/90 backdrop-blur-xs text-[#006B3F] font-bold border border-[#006B3F]/20 shadow-2xs">
              🇬🇭 Open to Ghanaians
            </span>
          )}

          {/* Work Arrangement (Remote / Hybrid / On-site) */}
          {opportunity.workArrangement && (
            <span className={`px-2 py-0.5 rounded-md font-semibold backdrop-blur-xs shadow-2xs ${
              opportunity.workArrangement.toLowerCase() === 'remote'
                ? 'bg-sky-50/90 text-sky-800 border border-sky-200/80'
                : opportunity.workArrangement.toLowerCase() === 'hybrid'
                ? 'bg-purple-50/90 text-purple-800 border border-purple-200/80'
                : 'bg-white/80 text-slate-700 border border-slate-200/80'
            }`}>
              {opportunity.workArrangement.toLowerCase() === 'remote' ? '🌐 Remote' : opportunity.workArrangement.toLowerCase() === 'hybrid' ? '🔄 Hybrid' : '🏢 On-site'}
            </span>
          )}

          {/* Employment Type for Jobs */}
          {isJob && opportunity.employmentType && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50/90 backdrop-blur-xs text-blue-800 font-semibold border border-blue-200/80 shadow-2xs">
              {opportunity.employmentType}
            </span>
          )}

          {/* Internship Type (Paid vs Unpaid) */}
          {isInternship && opportunity.internshipType && (
            <span className={`px-2 py-0.5 rounded-md font-bold backdrop-blur-xs shadow-2xs ${
              opportunity.internshipType.toLowerCase() === 'paid'
                ? 'bg-emerald-50/90 text-emerald-800 border border-emerald-200/80'
                : 'bg-white/80 text-slate-700 border border-slate-200/80'
            }`}>
              {opportunity.internshipType.toLowerCase() === 'paid' ? '💰 Paid Internship' : '📄 Unpaid Internship'}
            </span>
          )}

          {/* Duration for Internships */}
          {isInternship && opportunity.duration && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50/90 backdrop-blur-xs text-indigo-800 font-medium border border-indigo-200/80 shadow-2xs">
              <Clock className="w-3 h-3 text-indigo-600" />
              <span>{opportunity.duration}</span>
            </span>
          )}

          {/* Salary where officially provided */}
          {opportunity.salary && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50/90 backdrop-blur-xs text-[#006B3F] font-bold border border-emerald-200/80 shadow-2xs">
              💵 {opportunity.salary}
            </span>
          )}

          {/* Funding Type for Scholarships */}
          {!isJob && !isInternship && opportunity.fundingType && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50/90 backdrop-blur-xs text-[#006B3F] font-semibold border border-emerald-200/70 shadow-2xs">
              {opportunity.fundingType}
            </span>
          )}

          {/* Experience level for Jobs */}
          {opportunity.experienceLevel && (
            <span className="px-2 py-0.5 rounded-md bg-white/80 backdrop-blur-xs border border-slate-200/80 text-slate-700 font-medium truncate max-w-[150px] shadow-2xs">
              {opportunity.experienceLevel}
            </span>
          )}

          {/* Study level / education */}
          {(opportunity.studyLevel || opportunity.educationLevel) && !opportunity.experienceLevel && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/80 backdrop-blur-xs border border-slate-200/80 text-slate-700 truncate max-w-[150px] shadow-2xs">
              <GraduationCap className="w-3 h-3 shrink-0 text-slate-500" />
              <span className="truncate">{opportunity.studyLevel || opportunity.educationLevel}</span>
            </span>
          )}
        </div>
      </div>

      {/* Layered Frosted Glass Footer Shelf */}
      <div className="glass-subpanel mx-3 mb-3 px-4 py-2.5 rounded-xl flex items-center justify-between gap-2">
        <DeadlineBadge
          deadline={opportunity.deadline}
          isDeadlineSpecified={opportunity.isDeadlineSpecified}
        />
        <div className="flex items-center gap-2">
          <VerificationBadge status={opportunity.verificationStatus} />
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/90 group-hover:bg-[#006B3F] text-slate-700 group-hover:text-white border border-slate-200/80 group-hover:border-[#006B3F] shadow-2xs transition-all">
            <span className="hidden sm:inline">View</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#006B3F] group-hover:text-[#FCD116] transition-colors" />
          </span>
        </div>
      </div>
    </article>
  );
};
