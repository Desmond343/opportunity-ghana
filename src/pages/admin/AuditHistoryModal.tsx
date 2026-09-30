import React from 'react';
import { AuditLogEntry } from '../../types/database';
import { AuditService } from '../../services/auditService';
import { X, Clock, User, ShieldCheck, CheckCircle2, Copy, Trash2, Edit3, PlusCircle, Archive } from 'lucide-react';

interface AuditHistoryModalProps {
  entityId: string;
  entityTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({
  entityId,
  entityTitle,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const logs = AuditService.getLogs(entityId);

  const getActionIcon = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'created':
        return <PlusCircle className="w-4 h-4 text-emerald-600" />;
      case 'published':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'verified':
        return <ShieldCheck className="w-4 h-4 text-sky-600" />;
      case 'duplicated':
        return <Copy className="w-4 h-4 text-indigo-600" />;
      case 'closed':
      case 'archived':
        return <Archive className="w-4 h-4 text-slate-500" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-rose-600" />;
      default:
        return <Edit3 className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <h2 className="text-base font-bold text-slate-900 font-space">
                Audit Trail & Change History
              </h2>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-md mt-0.5" title={entityTitle}>
              {entityTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-6">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No previous audit history recorded for this entry yet.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {logs.map((log) => {
                const date = new Date(log.timestamp);
                const formattedDate = date.toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={log.id} className="relative group">
                    {/* Bullet marker */}
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-2xs">
                      {getActionIcon(log.action)}
                    </div>

                    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 capitalize flex items-center gap-1.5">
                          <span>{log.action.replace('_', ' ')}</span>
                          {log.newStatus && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                              {log.newStatus}
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {formattedDate}
                        </span>
                      </div>

                      {log.details && (
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {log.details}
                        </p>
                      )}

                      {log.changesSummary && (
                        <p className="text-[11px] font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600">
                          {log.changesSummary}
                        </p>
                      )}

                      <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold text-slate-700">{log.performedByName}</span>
                        <span className="text-slate-400">({log.performedByEmail})</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
