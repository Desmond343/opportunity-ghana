import React from 'react';
import { Clock, AlertTriangle, Archive, Calendar } from 'lucide-react';
import { calculateDeadlineInfo } from '../../services/deadlineService';

interface DeadlineBadgeProps {
  deadline?: string;
  className?: string;
  compact?: boolean;
}

export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({
  deadline,
  className = '',
  compact = false
}) => {
  const info = calculateDeadlineInfo(deadline);

  if (info.isClosed) {
    return (
      <span
        title={info.detailText}
        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 ${className}`}
      >
        <Archive className="w-3 h-3 text-slate-500" />
        <span>Closed</span>
      </span>
    );
  }

  if (info.urgency === 'critical') {
    return (
      <span
        title={info.detailText}
        className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#FCE8EA] text-[#CE1126] border border-[#CE1126]/30 shadow-2xs animate-pulse ${className}`}
      >
        <AlertTriangle className="w-3 h-3 text-[#CE1126]" />
        <span>{info.label}</span>
      </span>
    );
  }

  if (info.urgency === 'warning') {
    return (
      <span
        title={info.detailText}
        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF9E7] text-[#8C6D00] border border-[#FCD116]/50 ${className}`}
      >
        <Clock className="w-3 h-3 text-[#8C6D00]" />
        <span>{info.label}</span>
      </span>
    );
  }

  return (
    <span
      title={info.detailText}
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#E6F0EB] text-[#006B3F] border border-[#006B3F]/20 ${className}`}
    >
      <Calendar className="w-3 h-3 text-[#006B3F]" />
      <span>{compact ? info.label : info.label}</span>
    </span>
  );
};
