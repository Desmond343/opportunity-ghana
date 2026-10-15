import React, { useState, useEffect } from 'react';
import { Institution } from '../../types/institution';
import { InstitutionsService } from '../../services/institutionsService';
import { SavedService } from '../../services/savedService';
import { useAuth } from '../../services/authContext';
import {
  Building2,
  MapPin,
  ShieldCheck,
  Bookmark,
  ExternalLink,
  ChevronRight,
  Clock,
  Calendar,
  CreditCard,
  GraduationCap
} from 'lucide-react';

interface InstitutionCardProps {
  institution: Institution;
  onNavigate: (path: string) => void;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

export const InstitutionCard: React.FC<InstitutionCardProps> = ({
  institution,
  onNavigate,
  isSaved: propIsSaved,
  onToggleSave
}) => {
  const { currentUser, getIdToken } = useAuth();
  const [isSaved, setIsSaved] = useState(() => {
    if (typeof propIsSaved === 'boolean') return propIsSaved;
    return SavedService.isSaved(institution.id) || InstitutionsService.isSaved(institution.id);
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (typeof propIsSaved === 'boolean') {
      setIsSaved(propIsSaved);
    } else {
      setIsSaved(SavedService.isSaved(institution.id) || InstitutionsService.isSaved(institution.id));
    }

    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.id === institution.id || e.detail.userId !== undefined) {
        setIsSaved(SavedService.isSaved(institution.id) || InstitutionsService.isSaved(institution.id));
      }
    };
    window.addEventListener('saved-opportunities-changed', handleUpdate);
    return () => window.removeEventListener('saved-opportunities-changed', handleUpdate);
  }, [institution.id, propIsSaved]);

  const nearest = InstitutionsService.getNearestActiveDeadline(institution);
  const primaryCycle = institution.admissionCycles && institution.admissionCycles.length > 0
    ? institution.admissionCycles[0]
    : undefined;

  // Derive top-left category badge label
  const getHeaderCategoryBadge = () => {
    const type = institution.institutionType || '';
    if (type.includes('Technical')) return 'TECHNICAL UNIVERSITY';
    if (type.includes('College of Education')) return 'COLLEGE OF EDUCATION';
    if (type.includes('Nursing') || type.includes('Health')) return 'HEALTH TRAINING';
    if (type.includes('Private')) return 'PRIVATE UNIVERSITY';
    if (type.includes('Professional')) return 'PROFESSIONAL INST.';
    return 'UNIVERSITY';
  };

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (onToggleSave) {
        onToggleSave(institution.id);
      }
      InstitutionsService.toggleSave(institution.id);
      const updated = await SavedService.toggleSave(
        {
          id: institution.id,
          slug: institution.slug,
          title: institution.name,
          category: 'Admissions',
          type: institution.institutionType,
          organizationName: institution.shortName,
          deadline: nearest?.cycle.applicationCloseDate || nearest?.cycle.extendedDeadline
        },
        currentUser?.id,
        getIdToken
      );
      setIsSaved(updated);
    } catch (err: any) {
      console.warn('Bookmark error on institution card:', err?.message || err);
    } finally {
      setIsSaving(false);
    }
  };

  // Status badge logic
  const getAdmissionStatusBadge = () => {
    switch (institution.overallAdmissionStatus) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-[#E6F0EB]/90 dark:bg-emerald-950/75 text-[#006B3F] dark:text-emerald-300 border border-[#006B3F]/20 dark:border-emerald-500/35 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            Admissions Open
          </span>
        );
      case 'CLOSING_SOON':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-amber-50 dark:bg-amber-950/75 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-2xs">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Closing Soon
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Status Unavailable
          </span>
        );
    }
  };

  return (
    <article
      onClick={() => onNavigate(`/institutions/${institution.slug}`)}
      className="floating-glass-tablet specular-rim-highlight group relative rounded-xl sm:rounded-2xl cursor-pointer flex flex-col justify-between overflow-hidden transition-all duration-200 bg-white dark:bg-[#141B29] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md"
    >
      {/* ========================================================================= */}
      {/* SECTION A: Header section (Navy-to-bright-blue gradient, rings pattern)   */}
      {/* ========================================================================= */}
      <div
        className="relative w-full h-28 sm:h-32 overflow-hidden select-none specular-rim-highlight"
        style={{
          background: 'linear-gradient(135deg, #070B1F 0%, #172554 50%, #0284C7 100%)'
        }}
      >
        {/* Concentric rings SVG pattern overlay matching internship card header */}
        <svg
          className="absolute -right-8 -bottom-8 w-44 h-44 opacity-20 pointer-events-none"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="45" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="18" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>

        {/* Decorative watermark icon */}
        <div className="absolute -right-2 -bottom-2 opacity-15 pointer-events-none text-[#38BDF8] transition-transform duration-500 group-hover:scale-110">
          <GraduationCap className="w-20 h-20 sm:w-24 sm:h-24" />
        </div>

        {/* Top-Left Category Badge */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-20 flex items-center gap-1.5 pointer-events-auto">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[#FCD116] border border-white/20 shadow-xs font-space">
            {getHeaderCategoryBadge()}
          </span>
          {institution.isFeatured && (
            <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FCD116]/95 backdrop-blur-md text-[#111111] border border-white/40 shadow-xs">
              Featured
            </span>
          )}
        </div>

        {/* Top-Right Bookmark Button */}
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 pointer-events-auto">
          <button
            onClick={handleToggleBookmark}
            disabled={isSaving}
            title={isSaved ? 'Remove from saved' : 'Save institution'}
            aria-label={isSaved ? 'Remove from saved' : 'Save institution'}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-all duration-200 cursor-pointer hover:scale-105 ${
              isSaved
                ? 'bg-[#006B3F] text-[#FCD116] border border-emerald-400/50 shadow-xs'
                : 'bg-slate-950/70 hover:bg-slate-950/90 text-white/95 hover:text-white border border-white/20 shadow-xs'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#FCD116]' : ''}`} />
          </button>
        </div>

        {/* Header Title & Subtitle */}
        <div className="relative z-10 w-full h-full flex flex-col justify-end p-3 sm:p-3.5 space-y-0.5 max-w-[88%]">
          <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-[#38BDF8] font-space block">
            ACCREDITED TERTIARY INSTITUTION
          </span>
          <h2 className="text-sm sm:text-[15px] font-bold text-white group-hover:text-[#FCD116] transition-colors leading-snug line-clamp-1 font-space drop-shadow-sm">
            {institution.name}
          </h2>
          <p className="text-[10px] sm:text-[11px] font-medium text-slate-300/90 line-clamp-1 truncate">
            {institution.institutionType} · {institution.shortName}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION B: Institution information section (Clean white background)       */}
      {/* ========================================================================= */}
      <div className="p-3.5 sm:p-4 pb-2.5 sm:pb-3 flex-1 flex flex-col justify-between space-y-2.5">
        <div className="space-y-2">
          {/* Institution Name & Abbreviation Header */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <Building2 className="w-3.5 h-3.5 text-[#006B3F] dark:text-emerald-400 shrink-0" />
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 transition-colors">
                {institution.name}
              </span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shrink-0">
              {institution.shortName}
            </span>
          </div>

          {/* Location Badge */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-200 text-[10px] sm:text-[11px] font-medium bg-white/80 dark:bg-slate-800/85 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700/80 px-1.5 py-0.5 rounded shadow-2xs">
              <MapPin className="w-2.5 h-2.5 text-[#006B3F] dark:text-emerald-400 shrink-0" />
              <span className="truncate max-w-[210px]">
                {institution.location.city}, {institution.location.region} Region
              </span>
            </span>
          </div>

          {/* Accreditation & Institution Type Metadata Pills */}
          <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-[11px]">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-sky-50/90 dark:bg-sky-950/75 text-sky-800 dark:text-sky-300 border border-sky-200/80 dark:border-sky-700/60 shadow-2xs">
              <ShieldCheck className="w-2.5 h-2.5 text-sky-600 dark:text-sky-400" />
              GTEC Accredited
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs truncate max-w-[170px]">
              {institution.institutionType}
            </span>
            {institution.isChartered && (
              <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-[#E6F0EB]/90 dark:bg-emerald-950/75 text-[#006B3F] dark:text-emerald-300 border border-[#006B3F]/20 dark:border-emerald-500/35 shadow-2xs">
                📜 Chartered
              </span>
            )}
          </div>

          {/* ========================================================================= */}
          {/* SECTION C: Admissions information (Academic year, status, countdown, fee) */}
          {/* ========================================================================= */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300">
                {institution.primaryAcademicYear || '2026/2027'} Admissions:
              </span>
              {getAdmissionStatusBadge()}
            </div>

            {/* Countdown / Cycle Deadline Subpanel */}
            {nearest && !nearest.deadlineInfo.isClosed ? (
              <div className="flex items-center justify-between text-[11px] sm:text-xs bg-slate-50 dark:bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-200/70 dark:border-slate-700/70">
                <span className="text-slate-600 dark:text-slate-300 truncate max-w-[150px] font-medium">
                  {nearest.cycle.category}:
                </span>
                <span
                  className={`font-bold ${
                    nearest.deadlineInfo.isClosingSoon
                      ? 'text-amber-700 dark:text-amber-300'
                      : 'text-[#006B3F] dark:text-emerald-400'
                  }`}
                >
                  {nearest.deadlineInfo.label}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-[11px] sm:text-xs bg-slate-50 dark:bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-200/70 dark:border-slate-700/70 text-slate-600 dark:text-slate-300">
                <span>Application cycle:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                  {primaryCycle?.title || 'Check Official Portal'}
                </span>
              </div>
            )}

            {/* Application Voucher Highlight Box (Styled like internship compensation box) */}
            <div className="p-2 rounded-lg bg-[#E6F0EB]/90 dark:bg-emerald-950/60 border border-[#006B3F]/20 dark:border-emerald-600/30 text-[10px] sm:text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <CreditCard className="w-3.5 h-3.5 text-[#006B3F] dark:text-emerald-400 shrink-0" />
              <span className="truncate font-semibold">
                {primaryCycle?.feeInfo?.amountGHS
                  ? `Voucher: GH¢${primaryCycle.feeInfo.amountGHS}${primaryCycle.feeInfo.ussdCode ? ` via ${primaryCycle.feeInfo.ussdCode}` : ''}`
                  : 'Voucher: Check official portal for fee'}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION D: Popular programmes (Clean tags with +N more)                   */}
          {/* ========================================================================= */}
          {institution.programmesSummary && institution.programmesSummary.featuredProgrammes.length > 0 && (
            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Popular Programmes
              </span>
              <div className="flex flex-wrap gap-1">
                {institution.programmesSummary.featuredProgrammes.slice(0, 2).map((prog, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs truncate max-w-[180px]"
                    title={prog.name}
                  >
                    {prog.name}
                  </span>
                ))}
                {institution.programmesSummary.featuredProgrammes.length > 2 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-300 font-semibold border border-slate-200/70 dark:border-slate-700 shadow-2xs">
                    +{institution.programmesSummary.featuredProgrammes.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION E: Footer section (Layered Frosted Glass Footer Shelf)             */}
      {/* ========================================================================= */}
      <div className="glass-subpanel mx-2.5 mb-2.5 sm:mx-3 sm:mb-3 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: Days remaining or status indicator */}
        <div>
          {nearest && !nearest.deadlineInfo.isClosed ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
              <Calendar className="w-3 h-3 text-[#006B3F] dark:text-emerald-400" />
              <span>{nearest.deadlineInfo.daysRemaining !== null ? `${nearest.deadlineInfo.daysRemaining} days left` : nearest.deadlineInfo.label}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
              <Building2 className="w-3 h-3 text-[#006B3F] dark:text-emerald-400" />
              <span>{institution.shortName}</span>
            </span>
          )}
        </div>

        {/* Right: Verified badge + Portal Link + Green View Details button */}
        <div className="flex items-center gap-1.5">
          <span
            title="Verified against official GTEC register."
            className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden xs:inline">Verified</span>
          </span>

          <a
            href={institution.applicationPortalUrl || institution.officialWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Open official admissions portal"
            className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 px-2 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
          >
            Portal <ExternalLink className="w-2.5 h-2.5" />
          </a>

          <button
            onClick={() => onNavigate(`/institutions/${institution.slug}`)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold bg-[#006B3F] hover:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer"
          >
            <span>View Details</span>
            <ChevronRight className="w-3 h-3 text-[#FCD116]" />
          </button>
        </div>
      </div>
    </article>
  );
};
