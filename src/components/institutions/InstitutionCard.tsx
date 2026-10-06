import React, { useState } from 'react';
import { Institution } from '../../types/institution';
import { InstitutionsService } from '../../services/institutionsService';
import { getInstitutionMedia } from '../../utils/institutionMedia';
import {
  GraduationCap,
  MapPin,
  Clock,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Bookmark,
  Building2,
  Calendar,
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
  const nearest = InstitutionsService.getNearestActiveDeadline(institution);
  const primaryCycle = institution.admissionCycles[0];
  const media = getInstitutionMedia(institution);
  const [imgSrc, setImgSrc] = useState(media.url);

  const getStatusBadge = () => {
    switch (institution.overallAdmissionStatus) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/75 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            Admissions Open
          </span>
        );
      case 'CLOSING_SOON':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/75 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Closing Soon
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Not Announced
          </span>
        );
    }
  };

  return (
    <div className="floating-glass-tablet specular-rim-highlight rounded-2xl sm:rounded-[22px] flex flex-col justify-between overflow-hidden group">
      {/* Background African Student / Human Photograph */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={imgSrc}
          alt={media.alt}
          referrerPolicy="no-referrer"
          onError={() => {
            if (imgSrc !== '/images/institutions/ghana_campus_students.jpg') {
              setImgSrc('/images/institutions/ghana_campus_students.jpg');
            }
          }}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          style={{
            objectPosition: media.position,
            filter: 'contrast(1.05) saturate(1.06) brightness(0.98)',
          }}
          loading="lazy"
        />

        {/* Adaptive Readability Gradient (Light wash in light mode, dark slate glass wash in dark mode) */}
        <div className="absolute inset-0 institution-card-overlay" />
      </div>

      {/* Top Banner & Header Content */}
      <div className="relative z-10">
        <div className="p-5 pb-3.5">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-white/92 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-100 border border-white/90 dark:border-slate-700 shadow-xs">
                <Building2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                {institution.institutionType}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-sky-50/92 dark:bg-sky-950/85 backdrop-blur-md text-sky-800 dark:text-sky-300 border border-sky-200/90 dark:border-sky-700/60 shadow-xs">
                <ShieldCheck className="w-3 h-3 text-sky-600 dark:text-sky-400" />
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
                className={`p-1.5 rounded-xl glass-floating-btn cursor-pointer ${
                  isSaved
                    ? '!bg-emerald-50/95 dark:!bg-emerald-950/90 text-emerald-600 dark:text-emerald-400 !border-emerald-300 dark:!border-emerald-600'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600 dark:fill-emerald-400' : ''}`} />
              </button>
            )}
          </div>

          {/* Title & Short Name */}
          <div className="flex items-baseline gap-2.5 mb-1.5">
            <h3
              onClick={() => onNavigate(`/institutions/${institution.slug}`)}
              className="text-lg font-bold text-slate-900 dark:text-slate-50 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors cursor-pointer leading-snug drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] font-space"
            >
              {institution.name}
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 bg-white/92 dark:bg-slate-800/90 backdrop-blur-md text-slate-700 dark:text-slate-200 border border-white/90 dark:border-slate-700 rounded-md shadow-xs shrink-0">
              {institution.shortName}
            </span>
          </div>

          {/* Location */}
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 mb-3 drop-shadow-[0_1px_1px_rgba(255,255,255,0.75)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>
              {institution.location.city}, {institution.location.region} Region
            </span>
          </p>

          {/* Admission Status & Deadline Countdown (Layered Frosted Subpanel) */}
          <div className="glass-subpanel rounded-xl p-3.5 mb-3.5 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {institution.primaryAcademicYear} Admissions:
              </span>
              {getStatusBadge()}
            </div>

            {nearest ? (
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/70 dark:border-slate-700/70">
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[190px] font-medium">
                  {nearest.cycle.category}:
                </span>
                <span
                  className={`font-bold ${
                    nearest.deadlineInfo.isClosingSoon
                      ? 'text-amber-800 dark:text-amber-300'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {nearest.deadlineInfo.label}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/70 dark:border-slate-700/70 text-slate-600 dark:text-slate-300">
                <span>Application cycle:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{primaryCycle?.title || 'Check Portal'}</span>
              </div>
            )}
          </div>

          {/* Fee & Voucher Info snippet */}
          {primaryCycle?.feeInfo && (
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 mb-3 bg-white/88 dark:bg-slate-800/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-2xs w-fit">
              <CreditCard className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span className="truncate font-medium">
                Voucher: {primaryCycle.feeInfo.amountGHS ? `GH¢${primaryCycle.feeInfo.amountGHS}` : 'Not published'}
                {primaryCycle.feeInfo.ussdCode ? ` via ${primaryCycle.feeInfo.ussdCode}` : ''}
              </span>
            </div>
          )}

          {/* Popular Programmes preview */}
          {institution.programmesSummary.featuredProgrammes.length > 0 && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Popular Programmes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {institution.programmesSummary.featuredProgrammes.slice(0, 3).map((prog, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs max-w-[240px] truncate"
                    title={prog.name}
                  >
                    {prog.name}
                  </span>
                ))}
                {institution.programmesSummary.featuredProgrammes.length > 3 && (
                  <span className="text-[11px] px-2 py-0.5 bg-white/85 dark:bg-slate-800/85 backdrop-blur-xs rounded-lg text-slate-600 dark:text-slate-300 font-semibold border border-slate-200/70 dark:border-slate-700 shadow-2xs">
                    +{institution.programmesSummary.featuredProgrammes.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Layered Frosted Glass Footer Actions */}
      <div className="relative z-10 glass-subpanel mx-3 mb-3 px-4 py-2.5 rounded-xl flex items-center justify-between gap-2">
        <a
          href={institution.applicationPortalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
        >
          Portal <ExternalLink className="w-3 h-3" />
        </a>

        <button
          onClick={() => onNavigate(`/institutions/${institution.slug}`)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#006B3F] hover:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer"
        >
          View Full Details
          <ChevronRight className="w-3.5 h-3.5 text-[#FCD116]" />
        </button>
      </div>
    </div>
  );
};

