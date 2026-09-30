import React, { useState } from 'react';
import { Info, X, ShieldAlert, Database, ArrowRight } from 'lucide-react';
import { useAuth } from '../../services/authContext';

export const DemoNoticeBanner: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [dismissed, setDismissed] = useState(false);
  const { isFirebaseActive, currentUser } = useAuth();

  if (dismissed) return null;

  return (
    <div className="bg-slate-900 text-white border-b border-emerald-900/60 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded bg-emerald-800 text-emerald-100 text-[10px] uppercase tracking-wider">
            Architecture Ready
          </span>
          <span className="text-slate-300">
            Database & CMS foundation active. Seed records are marked with{' '}
            <strong className="text-amber-400 font-bold">[DEMO RECORD]</strong> per Opportunity Ghana’s strict verification policy.
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => onNavigate('/admin')}
            className="text-emerald-400 hover:text-emerald-300 font-bold underline inline-flex items-center gap-1"
          >
            Explore Admin CMS
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-white p-0.5"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
