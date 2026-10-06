import React from 'react';
import { Clock, AlertTriangle, Archive, Calendar } from 'lucide-react';
import { useDeadlineInfo } from '../../services/deadlineService';

interface DeadlineBadgeProps {
  deadline?: string;
  isDeadlineSpecified?: boolean;
  className?: string;
  compact?: boolean;
  showDate?: boolean;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({
  deadline,
  isDeadlineSpecified,
  className = '',
  compact = false,
  showDate = false
}) => {
  // If the employer did not specify a deadline (Section 7 critical requirement)
  if (isDeadlineSpecified === false) {
    return (
      <span
        title="Application deadline is not specified by the employer — check the official listing."
        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs ${className}`}
        role="status"
      >
        <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
        <span>{compact ? 'No deadline specified' : 'Deadline not specified — check official listing'}</span>
      </span>
    );
  }

  // Live reactive hook that recalculates automatically as time advances
  const info = useDeadlineInfo(deadline);

  // Closed / Expired State
  if (info.isClosed) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {showDate && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium font-mono">
            Deadline: {info.formattedDate}
          </span>
        )}
        <span
          title={info.detailText}
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 shadow-2xs"
          role="status"
          aria-label={info.detailText}
        >
          <Archive className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
          <span>{compact ? 'Closed' : 'Deadline passed'}</span>
        </span>
      </div>
    );
  }

  // Critical State: Deadline is today, or 1-3 days left
  if (info.urgency === 'critical') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {showDate && (
          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold font-mono">
            Deadline: {info.formattedDate}
          </span>
        )}
        <span
          title={info.detailText}
          className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#FCE8EA] dark:bg-rose-950/60 text-[#CE1126] dark:text-rose-300 border border-[#CE1126]/30 dark:border-rose-700/60 shadow-2xs ${
            info.isToday ? 'animate-pulse ring-2 ring-[#CE1126]/20' : ''
          }`}
          role="status"
          aria-label={info.detailText}
        >
          <AlertTriangle className="w-3 h-3 text-[#CE1126] dark:text-rose-400 shrink-0" />
          <span>{info.label}</span>
        </span>
      </div>
    );
  }

  // Warning State: 4 to 7 days left (Closing soon)
  if (info.urgency === 'warning') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {showDate && (
          <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium font-mono">
            Deadline: {info.formattedDate}
          </span>
        )}
        <span
          title={info.detailText}
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF9E7] dark:bg-amber-950/60 text-[#8C6D00] dark:text-amber-300 border border-[#FCD116]/60 dark:border-amber-700/60 shadow-2xs"
          role="status"
          aria-label={info.detailText}
        >
          <Clock className="w-3 h-3 text-[#8C6D00] dark:text-amber-400 shrink-0" />
          <span>{info.label}</span>
        </span>
      </div>
    );
  }

  // Rolling basis state
  if (info.status === 'rolling') {
    return (
      <span
        title={info.detailText}
        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}
        role="status"
        aria-label={info.detailText}
      >
        <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
        <span>Rolling Basis</span>
      </span>
    );
  }

  // Normal Open State: 8+ days left
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {showDate && (
        <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium font-mono">
          Deadline: {info.formattedDate}
        </span>
      )}
      <span
        title={info.detailText}
        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E6F0EB] dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-300 border border-[#006B3F]/20 dark:border-emerald-700/60"
        role="status"
        aria-label={info.detailText}
      >
        <Calendar className="w-3 h-3 text-[#006B3F] dark:text-emerald-400 shrink-0" />
        <span>{info.label}</span>
      </span>
    </div>
  );
};
