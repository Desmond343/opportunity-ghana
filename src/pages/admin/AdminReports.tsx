import React, { useState } from 'react';
import { ContentReport } from '../../types/database';
import { AdminService } from '../../services/adminService';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const AdminReports: React.FC<{ onNavigate: (path: string) => void }> = () => {
  const [reports, setReports] = useState<ContentReport[]>(() => AdminService.getReports());

  const handleUpdate = (id: string, status: ContentReport['status']) => {
    AdminService.updateReportStatus(id, status);
    setReports(AdminService.getReports());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 font-space">
          Content Integrity & Dead-Link Reports
        </h1>
        <p className="text-xs text-slate-500">
          Community reports, broken URL notifications, and suspected listing anomalies.
        </p>
      </div>

      <div className="space-y-4">
        {reports.map((rep) => (
          <div key={rep.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full uppercase">
                {rep.reason.replace('_', ' ')}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 capitalize">Status: {rep.status}</span>
            </div>

            <h3 className="text-sm font-bold text-slate-900">{rep.targetTitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
              "{rep.details}"
            </p>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
              <span>Reported: {new Date(rep.createdAt).toLocaleDateString('en-GB')}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdate(rep.id, 'dismissed')}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => handleUpdate(rep.id, 'resolved')}
                  className="px-3 py-1 bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
