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
  isDemo = false,
  className = '',
  showIcon = true
}) => {
  if (isDemo) {
    return (
      <span
        title="Sample development record. Clearly marked per Opportunity Ghana verification policy."
        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-300 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
        DEMO
      </span>
    );
  }

  switch (status) {
    case 'verified':
      return (
        <span
          title="Verified against official institutional source."
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs ${className}`}
        >
          {showIcon && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
          <span>Verified</span>
        </span>
      );

    case 'needs_verification':
      return (
        <span
          title="Community submitted or waiting for primary source check."
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 ${className}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600" />}
          <span>Needs Verification</span>
        </span>
      );

    case 'warning':
      return (
        <span
          title="Caution: Unconfirmed details, reported discrepancies, or broken links."
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300 ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
          <span>Warning</span>
        </span>
      );

    case 'closed':
    default:
      return (
        <span
          title="Opportunity or resource listing is currently closed."
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${className}`}
        >
          {showIcon && <Archive className="w-3.5 h-3.5 text-slate-500" />}
          <span>Closed</span>
        </span>
      );
  }
};
