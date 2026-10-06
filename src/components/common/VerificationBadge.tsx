import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, Archive } from 'lucide-react';
import { VerificationStatus } from '../../types/database';

interface VerificationBadgeProps {
  status: VerificationStatus;
  isDemo?: boolean;
  className?: string;
  showIcon?: boolean;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  className = '',
  showIcon = true
}) => {
  switch (status) {
    case 'verified':
      return (
        <span
          title="Verified against official institutional source."
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E6F0EB] dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-300 border border-[#006B3F]/30 dark:border-emerald-700/60 shadow-2xs ${className}`}
        >
          {showIcon && <ShieldCheck className="w-3.5 h-3.5 text-[#006B3F] dark:text-emerald-400" />}
          <span>Verified</span>
        </span>
      );

    case 'needs_verification':
      return (
        <span
          title="Community submitted or waiting for primary source check."
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF9E7] dark:bg-amber-950/60 text-[#8C6D00] dark:text-amber-300 border border-[#FCD116]/50 dark:border-amber-700/60 ${className}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-[#8C6D00] dark:text-amber-400" />}
          <span>Needs Verification</span>
        </span>
      );

    case 'warning':
      return (
        <span
          title="Caution: Unconfirmed details, reported discrepancies, or broken links."
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FCE8EA] dark:bg-rose-950/60 text-[#CE1126] dark:text-rose-300 border border-[#CE1126]/30 dark:border-rose-700/60 ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-[#CE1126] dark:text-rose-400" />}
          <span>Warning</span>
        </span>
      );

    case 'closed':
    default:
      return (
        <span
          title="Opportunity or resource listing is currently closed."
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F7F9F8] dark:bg-slate-800 text-[#5F6368] dark:text-slate-400 border border-[#E5E7EB] dark:border-slate-700 ${className}`}
        >
          {showIcon && <Archive className="w-3.5 h-3.5 text-[#737373] dark:text-slate-400" />}
          <span>Closed</span>
        </span>
      );
  }
};
