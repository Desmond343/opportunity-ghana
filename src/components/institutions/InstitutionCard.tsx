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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Admissions Open
          </span>
        );
      case 'CLOSING_SOON':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 shadow-2xs">
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
    <div className="relative rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group bg-slate-100 dark:bg-[#131926]">
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

        {/* Light Mode Subtle Readability Gradient */}
        <div
          className="absolute inset-0 dark:hidden"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.32) 28%, rgba(255,255,255,0.65) 58%, rgba(255,255,255,0.90) 84%, rgba(255,255,255,0.97) 100%)',
          }}
        />

        {/* Dark Mode Subtle Readability Gradient (African student remains visible, text is crisp) */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background:
              'linear-gradient(180deg, rgba(11,15,23,0.30) 0%, rgba(11,15,23,0.50) 28%, rgba(19,25,38,0.80) 58%, rgba(19,25,38,0.95) 84%, rgba(19,25,38,0.98) 100%)',
          }}
        />
      </div>

      {/* Top Banner & Header Content */}
      <div className="relative z-10">
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-white/95 dark:bg-[#1A2333]/90 backdrop-blur-xs text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs">
                <Building2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                {institution.institutionType}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-sky-50/95 dark:bg-sky-950/70 backdrop-blur-xs text-sky-800 dark:text-sky-300 border border-sky-200/90 dark:border-sky-800/60 shadow-2xs">
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
                className={`p-1.5 rounded-lg border backdrop-blur-xs shadow-2xs transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-50/95 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                    : 'bg-white/90 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border-slate-200/90 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
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
              className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors cursor-pointer leading-snug drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-space"
            >
              {institution.name}
            </h3>
            <span className="text-xs font-bold px-1.5 py-0.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xs text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 rounded shadow-2xs shrink-0">
              {institution.shortName}
            </span>
          </div>

          {/* Location */}
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 mb-3 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] dark:drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>
              {institution.location.city}, {institution.location.region} Region
            </span>
          </p>

          {/* Admission Status & Deadline Countdown */}
          <div className="bg-white/90 dark:bg-[#1A2333]/90 backdrop-blur-sm rounded-lg p-3 border border-slate-200/90 dark:border-slate-700/80 mb-3.5 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                {institution.primaryAcademicYear} Admissions:
              </span>
              {getStatusBadge()}
            </div>

            {nearest ? (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/70 dark:border-slate-700/60">
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[190px] font-medium">
                  {nearest.cycle.category}:
                </span>
                <span
                  className={`font-semibold ${
                    nearest.deadlineInfo.isClosingSoon
                      ? 'text-amber-800 dark:text-amber-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {nearest.deadlineInfo.label}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/70 dark:border-slate-700/60 text-slate-600 dark:text-slate-400">
                <span>Application cycle:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{primaryCycle?.title || 'Check Portal'}</span>
              </div>
            )}
          </div>

          {/* Fee & Voucher Info snippet */}
          {primaryCycle?.feeInfo && (
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 mb-3 bg-white/80 dark:bg-[#1A2333]/80 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-200/70 dark:border-slate-700/60 w-fit">
              <CreditCard className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span className="truncate">
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
              <div className="flex flex-wrap gap-1">
                {institution.programmesSummary.featuredProgrammes.slice(0, 3).map((prog, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium px-2 py-0.5 rounded bg-white/90 dark:bg-[#1A2333]/90 backdrop-blur-xs text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/70 shadow-2xs max-w-[240px] truncate"
                    title={prog.name}
                  >
                    {prog.name}
                  </span>
                ))}
                {institution.programmesSummary.featuredProgrammes.length > 3 && (
                  <span className="text-[11px] px-1.5 py-0.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs rounded text-slate-600 dark:text-slate-400 font-semibold border border-slate-200/60 dark:border-slate-700">
                    +{institution.programmesSummary.featuredProgrammes.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="relative z-10 p-4 pt-3 bg-white/95 dark:bg-[#0E1420] backdrop-blur-sm border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
        <a
          href={institution.applicationPortalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
        >
          Portal <ExternalLink className="w-3 h-3" />
        </a>

        <button
          onClick={() => onNavigate(`/institutions/${institution.slug}`)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
        >
          View Full Details
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

