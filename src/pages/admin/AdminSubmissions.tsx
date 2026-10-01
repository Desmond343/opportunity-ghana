import React, { useState } from 'react';
import { Submission } from '../../types/database';
import { AdminService } from '../../services/adminService';
import { AdminResourceSubmissions } from './AdminResourceSubmissions';
import { Inbox, Building, Sparkles, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface AdminSubmissionsProps {
  onNavigate: (path: string) => void;
}

export const AdminSubmissions: React.FC<AdminSubmissionsProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'user-resources' | 'partner-proposals'>('user-resources');
  const [partnerSubmissions, setPartnerSubmissions] = useState<Submission[]>(() => AdminService.getSubmissions());

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    AdminService.updateSubmissionStatus(id, status, `Reviewed on ${new Date().toLocaleDateString('en-GB')}`);
    setPartnerSubmissions(AdminService.getSubmissions());
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('user-resources')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'user-resources'
              ? 'border-[#006B3F] text-[#006B3F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>User Resource Submissions</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-[#E8F5EF] text-[#006B3F] font-bold">
            Live Queue
          </span>
        </button>

        <button
          onClick={() => setActiveTab('partner-proposals')}
          className={`px-5 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'partner-proposals'
              ? 'border-[#006B3F] text-[#006B3F]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Partner Organization Proposals</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
            {partnerSubmissions.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'user-resources' ? (
        <AdminResourceSubmissions onNavigate={onNavigate} />
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-space">
              Partner Inbound Submissions Queue
            </h2>
            <p className="text-xs text-slate-500">
              Incoming opportunities and course proposals submitted by registered organizations.
            </p>
          </div>

          <div className="space-y-4">
            {partnerSubmissions.length > 0 ? (
              partnerSubmissions.map((sub) => (
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
                        className="px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 cursor-pointer"
                      >
                        Reject Proposal
                      </button>
                      <button
                        onClick={() => handleAction(sub.id, 'approved')}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-[#006B3F] hover:bg-[#005530] rounded-xl shadow-xs cursor-pointer"
                      >
                        Approve into Drafts
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
                No partner organization submissions in queue.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
