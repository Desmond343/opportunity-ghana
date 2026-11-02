import React, { useState } from 'react';
import { Institution } from '../../types/institution';
import { InstitutionsService } from '../../services/institutionsService';
import { getInstitutionMedia } from '../../utils/institutionMedia';
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
  const nearest = InstitutionsService.getNearestActiveDeadline(institution);
  const primaryCycle = institution.admissionCycles[0];
  const media = getInstitutionMedia(institution);
  const [imgSrc, setImgSrc] = useState(media.url);

  const getStatusBadge = () => {
    switch (institution.overallAdmissionStatus) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            Admissions Open
          </span>
        );
      case 'CLOSING_SOON':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-2xs">
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
    <div className="bg-white dark:bg-[#141B29] rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden group hover:-translate-y-1">
      {/* 1. Dedicated Image Section (approx 35-42% of card height) */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
        <img
          src={imgSrc}
          alt={media.alt}
          referrerPolicy="no-referrer"
          onError={() => {
            if (imgSrc !== '/images/institutions/ghana_campus_students.jpg') {
              setImgSrc('/images/institutions/ghana_campus_students.jpg');
            }
          }}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          style={{
            objectPosition: media.position,
          }}
          loading="lazy"
        />

        {/* Subtle Scrim for Top Badge Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges: Institution Type & GTEC Accreditation */}
        <div className="absolute top-3 left-3 right-12 flex items-center gap-1.5 flex-wrap z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-800 dark:text-slate-100 border border-white/60 dark:border-slate-700 shadow-xs">
            <Building2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate max-w-[150px] sm:max-w-[180px]">{institution.institutionType}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold bg-emerald-700/90 dark:bg-emerald-600/90 backdrop-blur-md text-white border border-emerald-600/50 shadow-xs">
            <ShieldCheck className="w-3 h-3 text-white shrink-0" />
            <span>GTEC Accredited</span>
          </span>
        </div>

        {/* Save / Bookmark Button */}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(institution.id);
            }}
            title={isSaved ? 'Remove from saved' : 'Save institution'}
            aria-label={isSaved ? 'Remove from saved' : 'Save institution'}
            className={`absolute top-3 right-3 z-10 p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer shadow-md ${
              isSaved
                ? 'bg-emerald-600 text-white border border-emerald-500 hover:bg-emerald-700'
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-white/60 dark:border-slate-700 hover:bg-white'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        )}

        {/* Short Name Pill at bottom-right of image */}
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md text-xs font-black bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 shadow-md border border-white/50 dark:border-slate-700 tracking-wider">
            {institution.shortName}
          </span>
        </div>
      </div>

      {/* 2. Structured Content Section (Solid White / Dark Slate Background) */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white dark:bg-[#141B29]">
        <div className="space-y-3">
          {/* Institution Title */}
          <div>
            <h3
              onClick={() => onNavigate(`/institutions/${institution.slug}`)}
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors cursor-pointer leading-snug line-clamp-1"
              title={institution.name}
            >
              {institution.name}
            </h3>

            {/* Location */}
            <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">
                {institution.location.city}, {institution.location.region} Region
              </span>
            </p>
          </div>

          {/* Admission Status & Deadline Countdown Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {institution.primaryAcademicYear} Admissions:
              </span>
              {getStatusBadge()}
            </div>

            {nearest ? (
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/70 dark:border-slate-700/70">
                <span className="text-slate-600 dark:text-slate-300 truncate max-w-[170px] font-medium">
                  {nearest.cycle.category}:
                </span>
                <span
                  className={`font-bold ${
                    nearest.deadlineInfo.isClosingSoon
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {nearest.deadlineInfo.label}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/70 dark:border-slate-700/70 text-slate-500 dark:text-slate-400">
                <span>Application cycle:</span>
                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                  {primaryCycle?.title || 'Check Portal'}
                </span>
              </div>
            )}
          </div>

          {/* Voucher Information */}
          {primaryCycle?.feeInfo && (
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/40 px-2.5 py-1.5 rounded-lg border border-slate-200/70 dark:border-slate-700/50">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate font-medium">
                Voucher: {primaryCycle.feeInfo.amountGHS ? `GH¢${primaryCycle.feeInfo.amountGHS}` : 'Not published'}
                {primaryCycle.feeInfo.ussdCode ? ` via ${primaryCycle.feeInfo.ussdCode}` : ''}
              </span>
            </div>
          )}

          {/* Popular Programmes */}
          {institution.programmesSummary.featuredProgrammes.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
                Popular Programmes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {institution.programmesSummary.featuredProgrammes.slice(0, 2).map((prog, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/70 max-w-[190px] truncate"
                    title={prog.name}
                  >
                    {prog.name}
                  </span>
                ))}
                {institution.programmesSummary.featuredProgrammes.length > 2 && (
                  <span className="text-[11px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800/90 rounded-md text-slate-600 dark:text-slate-400 font-semibold border border-slate-200/80 dark:border-slate-700/70">
                    +{institution.programmesSummary.featuredProgrammes.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Separate Footer Actions (Bottom of Card) */}
        <div className="pt-3.5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <a
            href={institution.applicationPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-1.5"
          >
            <span>Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => onNavigate(`/institutions/${institution.slug}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#006B3F] hover:bg-emerald-800 text-white shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#FCD116]" />
          </button>
        </div>
      </div>
    </div>
  );
};

