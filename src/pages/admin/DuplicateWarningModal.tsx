import React from 'react';
import { Opportunity, DuplicateMatch } from '../../types/database';
import { AlertTriangle, X, Check, ExternalLink, Calendar, Building, ShieldAlert } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

interface DuplicateWarningModalProps {
  isOpen: boolean;
  candidateTitle: string;
  matches: DuplicateMatch[];
  onConfirmPublish: () => void;
  onCancel: () => void;
}

export const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  isOpen,
  candidateTitle,
  matches,
  onConfirmPublish,
  onCancel
}) => {
  if (!isOpen || matches.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-amber-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-amber-200 bg-amber-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-950 font-space flex items-center gap-2">
                <span>Possible Duplicate Detected</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  {matches.length} Match{matches.length > 1 ? 'es' : ''}
                </span>
              </h2>
              <p className="text-xs text-amber-800 mt-0.5">
                The opportunity you are publishing shares key attributes with existing database listings.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full hover:bg-amber-200 text-amber-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matches list */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <span className="font-bold text-slate-800">Current Candidate:</span> {candidateTitle}
          </div>

          <div className="space-y-4">
            {matches.map(({ existingItem, confidence, reasons }) => (
              <div
                key={existingItem.id}
                className="bg-white border-2 border-amber-200/80 rounded-2xl p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {existingItem.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {existingItem.organizationName}
                      </span>
                      <span>•</span>
                      <span>Category: {existingItem.category}</span>
                      <span>•</span>
                      <span className="capitalize">Status: <strong>{existingItem.status}</strong></span>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                    {confidence}% Match
                  </span>
                </div>

                {/* Match Reasons */}
                <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5 text-xs text-amber-900">
                  <p className="font-bold mb-1 text-[11px] uppercase tracking-wider text-amber-800">
                    Triggered duplicate rules:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Details comparison */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block font-medium">Application URL</span>
                    <a
                      href={existingItem.applicationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:underline truncate block font-mono"
                    >
                      {existingItem.applicationUrl}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Deadline</span>
                    <span className="font-medium text-slate-700">
                      {existingItem.deadline ? new Date(existingItem.deadline).toLocaleDateString('en-GB') : 'Rolling'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            Per editorial policy, review existing listings before creating identical records.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
            >
              Cancel & Edit Details
            </button>
            <button
              onClick={onConfirmPublish}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Publish Anyway</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
