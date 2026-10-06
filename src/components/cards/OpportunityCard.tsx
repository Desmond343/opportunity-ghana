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

      {/* Visual Header (Image with subtle dark gradient overlay, or category gradient fallback) */}
      <CardVisualHeader
        media={media}
        alt={opportunity.title}
        title={opportunity.title}
        subtitle={opportunity.organizationName || 'Opportunity Ghana'}
        badgeTopLeft={
          <>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[#FCD116] border border-white/10 shadow-xs font-space">
              {opportunity.category}
            </span>
            {isActuallyFeatured && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#FCD116] text-[#111111] shadow-xs">
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
              <span className="inline-flex items-center gap-1 text-slate-600 text-[11px] font-medium bg-slate-100/80 px-2 py-0.5 rounded-md">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
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
            <span className="px-2 py-0.5 rounded-md bg-[#E6F0EB] text-[#006B3F] font-bold border border-[#006B3F]/20">
              🇬🇭 Open to Ghanaians
            </span>
          )}

          {/* Work Arrangement (Remote / Hybrid / On-site) */}
          {opportunity.workArrangement && (
            <span className={`px-2 py-0.5 rounded-md font-semibold ${
              opportunity.workArrangement.toLowerCase() === 'remote'
                ? 'bg-sky-50 text-sky-800 border border-sky-200'
                : opportunity.workArrangement.toLowerCase() === 'hybrid'
                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {opportunity.workArrangement.toLowerCase() === 'remote' ? '🌐 Remote' : opportunity.workArrangement.toLowerCase() === 'hybrid' ? '🔄 Hybrid' : '🏢 On-site'}
            </span>
          )}

          {/* Employment Type for Jobs */}
          {isJob && opportunity.employmentType && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-semibold border border-blue-200">
              {opportunity.employmentType}
            </span>
          )}

          {/* Internship Type (Paid vs Unpaid) */}
          {isInternship && opportunity.internshipType && (
            <span className={`px-2 py-0.5 rounded-md font-bold ${
              opportunity.internshipType.toLowerCase() === 'paid'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {opportunity.internshipType.toLowerCase() === 'paid' ? '💰 Paid Internship' : '📄 Unpaid Internship'}
            </span>
          )}

          {/* Duration for Internships */}
          {isInternship && opportunity.duration && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 font-medium border border-indigo-100">
              <Clock className="w-3 h-3 text-indigo-600" />
              <span>{opportunity.duration}</span>
            </span>
          )}

          {/* Salary where officially provided */}
          {opportunity.salary && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#006B3F] font-bold border border-emerald-200/80">
              💵 {opportunity.salary}
            </span>
          )}

          {/* Funding Type for Scholarships */}
          {!isJob && !isInternship && opportunity.fundingType && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#006B3F] font-semibold border border-emerald-100/60">
              {opportunity.fundingType}
            </span>
          )}

          {/* Experience level for Jobs */}
          {opportunity.experienceLevel && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium truncate max-w-[150px]">
              {opportunity.experienceLevel}
            </span>
          )}

          {/* Study level / education */}
          {(opportunity.studyLevel || opportunity.educationLevel) && !opportunity.experienceLevel && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 truncate max-w-[150px]">
              <GraduationCap className="w-3 h-3 shrink-0 text-slate-500" />
              <span className="truncate">{opportunity.studyLevel || opportunity.educationLevel}</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer bar with deadline & verification */}
      <div className="bg-slate-50/80 border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-2">
        <DeadlineBadge
          deadline={opportunity.deadline}
          isDeadlineSpecified={opportunity.isDeadlineSpecified}
        />
        <div className="flex items-center gap-2">
          <VerificationBadge status={opportunity.verificationStatus} />
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 group-hover:text-[#006B3F] transition-colors">
            <span className="hidden sm:inline">View Listing</span>
            <ArrowUpRight className="w-4 h-4 text-[#006B3F]" />
          </span>
        </div>
      </div>
    </article>
  );
};
