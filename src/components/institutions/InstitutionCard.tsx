import React, { useState } from 'react';
import { Institution } from '../../types/institution';
import { InstitutionsService } from '../../services/institutionsService';
import { resolveInstitutionBackground } from '../../utils/cardBackgrounds';
import {
  MapPin,
  Clock,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Bookmark,
  Building2,
  CreditCard
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
  isSaved = false,
  onToggleSave,
}) => {
  const [imageError, setImageError] = useState(false);
  const nearest = InstitutionsService.getNearestActiveDeadline(institution);
  const primaryCycle = institution.admissionCycles[0];
  const bgMedia = resolveInstitutionBackground(institution);

  const getStatusBadge = () => {
    switch (institution.overallAdmissionStatus) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50/95 text-emerald-700 border border-emerald-200/90 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Admissions Open
          </span>
        );
      case 'CLOSING_SOON':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50/95 text-amber-800 border border-amber-300/90 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Closing Soon
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100/95 text-slate-600 border border-slate-200/90">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100/95 text-slate-700 border border-slate-200/90">
            Not Announced
          </span>
        );
    }
  };

  return (
    <div className="relative bg-white rounded-xl border border-slate-200/90 hover:border-emerald-600/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Subtle African Human / Student Background Visual Layer */}
      <div
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
        aria-hidden="true"
      >
        {!imageError && bgMedia.imageUrl ? (
          <>
            <img
              src={bgMedia.imageUrl}
              alt={bgMedia.alt}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover ${bgMedia.focalPointClass} opacity-[0.22] sm:opacity-[0.24] group-hover:opacity-[0.30] group-hover:scale-105 transition-all duration-700 ease-out saturate-[1.08] contrast-[1.04]`}
            />
            {/* Directional Readability Overlays: Softly reveals student photography in upper-right while guaranteeing crisp text contrast */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/92 via-white/74 to-white/38" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/70 to-white/95" />
            <div className={`absolute inset-0 bg-gradient-to-bl ${bgMedia.tintClass}`} />
          </>
        ) : (
          /* Clean Academic Fallback Gradient if image fails to load */
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50/80" />
        )}
      </div>

      {/* Top Banner & Header (Preserved Card Content) */}
      <div className="relative z-10">
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-white/90 backdrop-blur-[2px] text-slate-800 border border-slate-200/90 shadow-2xs">
                <Building2 className="w-3 h-3 text-slate-600" />
                {institution.institutionType}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-sky-50/95 backdrop-blur-[2px] text-sky-700 border border-sky-200/90 shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-sky-600" />
                GTEC Accredited
              </span>
            </div>

            {onToggleSave && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(institution.id);
                }}
                title={isSaved ? 'Remove from saved' : 'Save institution'}
                className={`p-1.5 rounded-lg border transition-colors backdrop-blur-[2px] shadow-2xs ${
                  isSaved
                    ? 'bg-emerald-50/95 text-emerald-600 border-emerald-200'
                    : 'bg-white/85 text-slate-400 hover:text-slate-600 border-slate-200/90 hover:bg-white'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600' : ''}`} />
              </button>
            )}
          </div>

          {/* Title & Short Name */}
          <div className="flex items-baseline gap-2.5 mb-1.5">
            <h3
              onClick={() => onNavigate(`/institutions/${institution.slug}`)}
              className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors cursor-pointer leading-snug drop-shadow-[0_1px_0_rgba(255,255,255,0.85)]"
            >
              {institution.name}
            </h3>
            <span className="text-xs font-semibold px-1.5 py-0.5 bg-white/90 backdrop-blur-[2px] text-slate-700 border border-slate-200/80 rounded shrink-0">
              {institution.shortName}
            </span>
          </div>

          {/* Location */}
          <p className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mb-3 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
            <MapPin className="w-3.5 h-3.5 text-emerald-700/80 shrink-0" />
            <span>
              {institution.location.city}, {institution.location.region} Region
            </span>
          </p>

          {/* Admission Status & Deadline Countdown */}
          <div className="bg-white/85 backdrop-blur-[3px] rounded-lg p-3 border border-slate-200/80 shadow-2xs mb-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-medium text-slate-600">
                {institution.primaryAcademicYear} Admissions:
              </span>
              {getStatusBadge()}
            </div>

            {nearest ? (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                <span className="text-slate-700 font-medium truncate max-w-[190px]">
                  {nearest.cycle.category}:
                </span>
                <span
                  className={`font-semibold ${
                    nearest.deadlineInfo.isClosingSoon
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {nearest.deadlineInfo.label}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 text-slate-500">
                <span>Application cycle:</span>
                <span>{primaryCycle?.title || 'Check Portal'}</span>
              </div>
            )}
          </div>

          {/* Fee & Voucher Info snippet */}
          {primaryCycle?.feeInfo && (
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium mb-3">
              <CreditCard className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">
                Voucher: {primaryCycle.feeInfo.amountGHS ? `GH¢${primaryCycle.feeInfo.amountGHS}` : 'Not published'}
                {primaryCycle.feeInfo.ussdCode ? ` via ${primaryCycle.feeInfo.ussdCode}` : ''}
              </span>
            </div>
          )}

          {/* Popular Programmes preview */}
          {institution.programmesSummary.featuredProgrammes.length > 0 && (
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                Popular Programmes
              </span>
              <div className="flex flex-wrap gap-1">
                {institution.programmesSummary.featuredProgrammes.slice(0, 3).map((prog, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded bg-white/90 backdrop-blur-[2px] border border-slate-200/80 text-slate-700 font-medium max-w-[240px] truncate shadow-2xs"
                    title={prog.name}
                  >
                    {prog.name}
                  </span>
                ))}
                {institution.programmesSummary.featuredProgrammes.length > 3 && (
                  <span className="text-[11px] px-1.5 py-0.5 text-slate-600 font-semibold">
                    +{institution.programmesSummary.featuredProgrammes.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="relative z-10 p-4 pt-3 bg-slate-50/85 backdrop-blur-[3px] border-t border-slate-200/70 flex items-center justify-between gap-2">
        <a
          href={institution.applicationPortalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          Portal <ExternalLink className="w-3 h-3" />
        </a>

        <button
          onClick={() => onNavigate(`/institutions/${institution.slug}`)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
        >
          View Full Details
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
