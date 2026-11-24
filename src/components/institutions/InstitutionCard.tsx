import React, { useState } from 'react';
import { Institution } from '../../types/institution';
import { InstitutionsService } from '../../services/institutionsService';
import { getInstitutionMedia } from '../../utils/institutionMedia';
import {
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Bookmark,
  Building2
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
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            Admissions Open
          </span>
        );
      case 'CLOSING_SOON':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Closing Soon
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Not Announced
          </span>
        );
    }
  };

  const mobileStatus = (() => {
    switch (institution.overallAdmissionStatus) {
      case 'OPEN':
        return { label: 'Open', labelClass: 'text-[#006B3F] dark:text-emerald-400' };
      case 'CLOSING_SOON':
        return { label: 'Closing Soon', labelClass: 'text-amber-700 dark:text-amber-400' };
      case 'CLOSED':
        return { label: 'Closed', labelClass: 'text-slate-500 dark:text-slate-400' };
      default:
        return { label: 'TBA', labelClass: 'text-slate-500 dark:text-slate-400' };
    }
  })();

  const mobileDeadlineText = nearest
    ? nearest.deadlineInfo.label
        .replace(' days left', 'd left')
        .replace(' day left', 'd left')
        .replace('Closes today', 'Today')
        .replace('Deadline passed', 'Ended')
    : 'Portal';

  return (
    <div
      onClick={() => onNavigate(`/institutions/${institution.slug}`)}
      className="bg-white dark:bg-[#141B29] rounded-xl md:rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xs md:shadow-sm md:hover:shadow-lg transition-all duration-200 flex flex-col h-full overflow-hidden group cursor-pointer md:hover:-translate-y-0.5"
    >
      {/* 1. Dedicated Image Section */}
      <div className="relative h-[104px] min-[431px]:h-[88px] md:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
        <img
          src={imgSrc}
          alt={media.alt}
          referrerPolicy="no-referrer"
          onError={() => {
            if (imgSrc !== '/images/institutions/ghana_campus_students.jpg') {
              setImgSrc('/images/institutions/ghana_campus_students.jpg');
            }
          }}
          className="w-full h-full object-cover transition-transform duration-700 ease-out md:group-hover:scale-105"
          style={{
            objectPosition: media.position,
          }}
          loading="lazy"
        />

        {/* Subtle Scrim for Top Badge Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/35 pointer-events-none" />

        {/* Mobile Single Compact Badge (top-left) */}
        <div className="md:hidden absolute top-1.5 left-1.5 z-10 pointer-events-none">
          <span className="inline-block px-1.5 py-[2px] rounded text-[9px] min-[431px]:text-[8.5px] font-extrabold bg-slate-950/80 text-white border border-white/20 tracking-wider">
            {institution.shortName}
          </span>
        </div>

        {/* Desktop Single Category/Type Badge (top-left) */}
        <div className="hidden md:flex absolute top-3 left-3 right-12 items-center z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-950/80 backdrop-blur-md text-white border border-white/20 shadow-xs">
            <Building2 className="w-3 h-3 text-[#FCD116] shrink-0" />
            <span className="truncate max-w-[180px]">{institution.institutionType}</span>
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
            className={`absolute top-1.5 right-1.5 md:top-3 md:right-3 z-10 p-1 md:p-1.5 rounded-md md:rounded-lg backdrop-blur-md transition-all cursor-pointer shadow-xs ${
              isSaved
                ? 'bg-[#006B3F] text-[#FCD116] border border-emerald-400/50'
                : 'bg-slate-950/70 hover:bg-slate-950/90 text-white/95 hover:text-white border border-white/20'
            }`}
          >
            <Bookmark className={`w-3 h-3 md:w-3.5 md:h-3.5 ${isSaved ? 'fill-[#FCD116]' : ''}`} />
          </button>
        )}
      </div>

      {/* 2. Structured Content Section (Solid White / Dark Slate Background) */}
      <div className="p-2 min-[431px]:p-1.5 md:p-4 flex-1 flex flex-col justify-between gap-1.5 md:gap-3 bg-white dark:bg-[#141B29]">
        <div className="space-y-0.5 md:space-y-2.5 min-w-0">
          {/* Mobile Compact 1-Line Location */}
          <p className="md:hidden text-[10.5px] min-[431px]:text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium leading-tight">
            {institution.location.city}, {institution.location.region}
          </p>

          {/* Institution Title & Desktop Location */}
          <div className="space-y-1">
            <p className="hidden md:flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#006B3F] dark:text-emerald-400 shrink-0" />
              <span className="truncate">
                {institution.location.city}, {institution.location.region} Region
              </span>
            </p>
            <h3
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(`/institutions/${institution.slug}`);
              }}
              className="text-[12.5px] min-[431px]:text-[11.5px] md:text-[17px] font-bold text-slate-900 dark:text-white group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 transition-colors cursor-pointer leading-[1.25] min-[431px]:leading-[1.22] md:leading-snug line-clamp-2 md:line-clamp-2 md:min-h-[46px]"
              title={institution.name}
            >
              {institution.name}
            </h3>
          </div>

          {/* Desktop Admission Status & Deadline Summary */}
          <div className="hidden md:flex flex-col gap-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/60 text-xs">
            <div className="flex items-center justify-between gap-2">
              {getStatusBadge()}
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
                {institution.primaryAcademicYear}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/70 dark:border-slate-700/70">
              <span className="text-slate-600 dark:text-slate-300 truncate font-medium">
                {nearest ? nearest.cycle.category : 'Cycle'}
              </span>
              <span
                className={`font-bold shrink-0 ${
                  nearest?.deadlineInfo.isClosingSoon
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {nearest ? nearest.deadlineInfo.label : primaryCycle?.title || 'Check Portal'}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Compact Status & Deadline Strip */}
        <div className="md:hidden pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1 text-[10px] min-[431px]:text-[9.5px] leading-tight min-w-0">
          <span className={`font-bold truncate ${mobileStatus.labelClass}`}>
            {mobileStatus.label}
          </span>
          <span className="font-semibold text-slate-600 dark:text-slate-300 tabular-nums shrink-0 truncate max-w-[68px]">
            {mobileDeadlineText}
          </span>
        </div>

        {/* 3. Desktop Separate Footer Actions (Bottom of Card) */}
        <div className="hidden md:flex pt-2.5 border-t border-slate-100 dark:border-slate-800/80 items-center justify-between gap-3">
          <a
            href={institution.applicationPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors py-1"
          >
            <span>Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/institutions/${institution.slug}`);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#006B3F] hover:bg-emerald-800 text-white shadow-2xs transition-all cursor-pointer"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#FCD116]" />
          </button>
        </div>
      </div>
    </div>
  );
};
