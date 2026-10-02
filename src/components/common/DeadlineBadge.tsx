import React from 'react';
import { Clock, AlertTriangle, Archive, Calendar } from 'lucide-react';
import { useDeadlineInfo } from '../../services/deadlineService';

interface DeadlineBadgeProps {
  deadline?: string;
  className?: string;
  compact?: boolean;
  showDate?: boolean;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({
  deadline,
  className = '',
  compact = false,
  showDate = false
}) => {
  // Live reactive hook that recalculates automatically as time advances
  const info = useDeadlineInfo(deadline);

  // Closed / Expired State
  if (info.isClosed) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        {showDate && (
          <span className="text-[11px] text-slate-500 font-medium font-mono">
            Deadline: {info.formattedDate}
          </span>
        )}
        <span
          title={info.detailText}
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 shadow-2xs"
          role="status"
          aria-label={info.detailText}
        >
          <Archive className="w-3 h-3 text-slate-500 shrink-0" />
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
          <span className="text-[11px] text-slate-700 font-semibold font-mono">
            Deadline: {info.formattedDate}
          </span>
        )}
        <span
          title={info.detailText}
          className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#FCE8EA] text-[#CE1126] border border-[#CE1126]/30 shadow-2xs ${
            info.isToday ? 'animate-pulse ring-2 ring-[#CE1126]/20' : ''
          }`}
          role="status"
          aria-label={info.detailText}
        >
          <AlertTriangle className="w-3 h-3 text-[#CE1126] shrink-0" />
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
          <span className="text-[11px] text-slate-600 font-medium font-mono">
            Deadline: {info.formattedDate}
          </span>
        )}
        <span
          title={info.detailText}
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF9E7] text-[#8C6D00] border border-[#FCD116]/60 shadow-2xs"
          role="status"
          aria-label={info.detailText}
        >
          <Clock className="w-3 h-3 text-[#8C6D00] shrink-0" />
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
        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
        role="status"
        aria-label={info.detailText}
      >
        <Clock className="w-3 h-3 text-slate-500 shrink-0" />
        <span>Rolling Basis</span>
      </span>
    );
  }

  // Normal Open State: 8+ days left
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {showDate && (
        <span className="text-[11px] text-slate-600 font-medium font-mono">
          Deadline: {info.formattedDate}
        </span>
      )}
      <span
        title={info.detailText}
        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E6F0EB] text-[#006B3F] border border-[#006B3F]/20"
        role="status"
        aria-label={info.detailText}
      >
        <Calendar className="w-3 h-3 text-[#006B3F] shrink-0" />
        <span>{info.label}</span>
      </span>
    </div>
  );
};
