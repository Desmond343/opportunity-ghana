import React from 'react';
import { Clock, AlertTriangle, Archive, Calendar, CalendarClock } from 'lucide-react';
import {
  useCurrentTime,
  getOpportunityLifecycleStatus,
  getReopeningInfo
} from '../../services/deadlineService';

interface DeadlineBadgeProps {
  deadline?: string;
  isDeadlineSpecified?: boolean;
  status?: string;
  openingDate?: string;
  previousDeadline?: string;
  nextOpeningDate?: string;
  nextOpeningType?: 'confirmed' | 'estimated' | 'unknown';
  nextOpeningNote?: string;
  className?: string;
  compact?: boolean;
  showDate?: boolean;
  statusOnly?: boolean;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({
  deadline,
  isDeadlineSpecified,
  status,
  openingDate,
  previousDeadline,
  nextOpeningDate,
  nextOpeningType,
  nextOpeningNote,
  className = '',
  compact = false,
  showDate = false,
  statusOnly = false
}) => {
  const isCompact = compact || statusOnly;
  const now = useCurrentTime();
  const lifecycle = getOpportunityLifecycleStatus(
    {
      status,
      deadline,
      openingDate,
      previousDeadline,
      nextOpeningDate,
      nextOpeningType,
      nextOpeningNote,
      isDeadlineSpecified
    },
    now
  );
  const info = lifecycle.deadlineInfo;

  // Closed / Expired State
  if (lifecycle.isClosed) {
    const reopening = getReopeningInfo({
      status,
      deadline,
      openingDate,
      previousDeadline,
      nextOpeningDate,
      nextOpeningType,
      nextOpeningNote
    });
    const closedTooltip = [
      reopening.previousDeadlineFormatted
        ? `Previous deadline: ${reopening.previousDeadlineFormatted}.`
        : info.detailText,
      reopening.message
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
        {showDate && reopening.previousDeadlineFormatted && (
          <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium font-mono">
            Was: {reopening.previousDeadlineFormatted}
          </span>
        )}
        <span
          title={closedTooltip}
          className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-[1px] sm:py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-2xs whitespace-nowrap"
          role="status"
          aria-label={closedTooltip}
        >
          <Archive className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
          <span>{isCompact ? 'Closed' : 'Closed • Deadline passed'}</span>
        </span>
      </div>
    );
  }

  // Upcoming Cycle State (openingDate is in the future)
  if (lifecycle.isUpcoming) {
    const label = lifecycle.opensFormatted
      ? `Upcoming • Opens ${lifecycle.opensFormatted}`
      : 'Upcoming';
    const tooltip = `${label}. Applications close ${info.formattedDeadline}.`;
    return (
      <div className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
        {showDate && info.targetDate && (
          <span className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-medium font-mono">
            Closes: {info.formattedDate}
          </span>
        )}
        <span
          title={tooltip}
          className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-[1px] sm:py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-700/60 shadow-2xs truncate max-w-[180px] sm:max-w-none"
          role="status"
          aria-label={tooltip}
        >
          <CalendarClock className="w-3 h-3 text-sky-600 dark:text-sky-400 shrink-0" />
          <span className="truncate">{label}</span>
        </span>
      </div>
    );
  }

  // Open without specified fixed deadline
  if (isDeadlineSpecified === false || info.status === 'rolling') {
    const rollingText =
      isDeadlineSpecified === false && info.status !== 'rolling'
        ? compact
          ? 'Open • No deadline'
          : 'Open • Deadline not specified'
        : compact
        ? 'Open • Rolling'
        : 'Open • Rolling Basis';
    return (
      <span
        title={info.detailText}
        className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-1.5 sm:px-2 py-[1px] sm:py-0.5 rounded-full bg-[#E6F0EB] dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-300 border border-[#006B3F]/20 dark:border-emerald-700/60 shadow-2xs whitespace-nowrap ${className}`}
        role="status"
        aria-label={info.detailText}
      >
        <Clock className="w-3 h-3 text-[#006B3F] dark:text-emerald-400 shrink-0" />
        <span>{rollingText}</span>
      </span>
    );
  }

  // Critical State: Deadline is today, or 1-3 days left
  if (info.urgency === 'critical') {
    return (
      <div className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
        {showDate && (
          <span className="text-[10px] sm:text-[11px] text-slate-700 dark:text-slate-300 font-semibold font-mono">
            Deadline: {info.formattedDate}
          </span>
        )}
        <span
          title={info.detailText}
          className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold px-1.5 sm:px-2 py-[1px] sm:py-0.5 rounded-full bg-[#FCE8EA] dark:bg-rose-950/60 text-[#CE1126] dark:text-rose-300 border border-[#CE1126]/30 dark:border-rose-700/60 shadow-2xs whitespace-nowrap ${
            info.isToday ? 'animate-pulse ring-2 ring-[#CE1126]/20' : ''
          }`}
          role="status"
          aria-label={info.detailText}
        >
          <AlertTriangle className="w-3 h-3 text-[#CE1126] dark:text-rose-400 shrink-0" />
          <span>{isCompact ? info.label : `Closing Soon • ${info.label}`}</span>
        </span>
      </div>
    );
  }

  // Warning State: 4 to 7 days left (Closing soon)
  if (info.urgency === 'warning') {
    return (
      <div className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
        {showDate && (
          <span className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-medium font-mono">
            Deadline: {info.formattedDate}
          </span>
        )}
        <span
          title={info.detailText}
          className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-[1px] sm:py-0.5 rounded-full bg-[#FEF9E7] dark:bg-amber-950/60 text-[#8C6D00] dark:text-amber-300 border border-[#FCD116]/60 dark:border-amber-700/60 shadow-2xs whitespace-nowrap"
          role="status"
          aria-label={info.detailText}
        >
          <Clock className="w-3 h-3 text-[#8C6D00] dark:text-amber-400 shrink-0" />
          <span>{isCompact ? info.label : `Closing Soon • ${info.label}`}</span>
        </span>
      </div>
    );
  }

  // Normal Open State: 8+ days left
  return (
    <div className={`inline-flex items-center gap-1.5 min-w-0 ${className}`}>
      {showDate && (
        <span className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-medium font-mono">
          Deadline: {info.formattedDate}
        </span>
      )}
      <span
        title={info.detailText}
        className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-1.5 sm:px-2 py-[1px] sm:py-0.5 rounded-full bg-[#E6F0EB] dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-300 border border-[#006B3F]/20 dark:border-emerald-700/60 whitespace-nowrap"
        role="status"
        aria-label={info.detailText}
      >
        <Calendar className="w-3 h-3 text-[#006B3F] dark:text-emerald-400 shrink-0" />
        <span>{isCompact ? `Open • ${info.label}` : `Open • ${info.label}`}</span>
      </span>
    </div>
  );
};
