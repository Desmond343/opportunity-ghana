import React, { useState } from 'react';
import { Submission } from '../../types/database';
import { AdminService } from '../../services/adminService';
import { Badge } from '../../components/common/Badge';
import { Inbox, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const AdminSubmissions: React.FC<{ onNavigate: (path: string) => void }> = () => {
  const [submissions, setSubmissions] = useState<Submission[]>(() => AdminService.getSubmissions());

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    AdminService.updateSubmissionStatus(id, status, `Reviewed on ${new Date().toLocaleDateString('en-GB')}`);
    setSubmissions(AdminService.getSubmissions());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-space">
            Partner Inbound Submissions Queue
          </h1>
          <p className="text-xs text-slate-500">
            Incoming opportunities and course proposals submitted by registered organizations.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {submissions.map((sub) => (
          <div key={sub.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {sub.type} submission
                </span>
                <h3 className="text-base font-bold text-slate-900">{sub.title}</h3>
                <p className="text-xs text-slate-500">
                  By {sub.submittedByName} ({sub.submittedByEmail}) • {sub.organizationName}
                </p>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase self-start sm:self-auto ${
                  sub.status === 'pending'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : sub.status === 'approved'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {sub.status}
              </span>
            </div>

            {sub.notes && (
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                <strong>Internal Note:</strong> {sub.notes}
              </div>
            )}

            {sub.status === 'pending' && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleAction(sub.id, 'rejected')}
                  className="px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200"
                >
                  Reject Proposal
                </button>
                <button
                  onClick={() => handleAction(sub.id, 'approved')}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  Approve into Drafts
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
