import React, { useState, useEffect } from 'react';
import { Resource, SubmissionStatus } from '../../types/database';
import { ResourcesService } from '../../services/resourcesService';
import { useAuth } from '../../services/authContext';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  ExternalLink,
  Eye,
  Filter,
  ArrowRight,
  ShieldCheck,
  Building,
  MapPin,
  Calendar,
  X,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface AdminResourceSubmissionsProps {
  onNavigate: (path: string) => void;
}

export const AdminResourceSubmissions: React.FC<AdminResourceSubmissionsProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [submissions, setSubmissions] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [search, setSearch] = useState('');

  // Selected Submission for Review Modal
  const [selectedSub, setSelectedSub] = useState<Resource | null>(null);
  const [decisionAction, setDecisionAction] = useState<'approve' | 'reject' | 'changes' | null>(null);
  const [feedbackReason, setFeedbackReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const all = await ResourcesService.getAll({ includeUnpublished: true });
      // Keep items that were submitted by users or flagged as pending review
      const filtered = all.filter(r => r.submittedBy || r.status !== 'published');
      setSubmissions(filtered);
    } catch (e) {
      console.error('Failed to load submissions queue', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewDecision = async (decision: 'approved' | 'rejected' | 'changes_requested') => {
    if (!selectedSub || !currentUser) return;

    if (decision === 'rejected' && !feedbackReason.trim()) {
      alert('Please provide a reason for rejecting this submission.');
      return;
    }

    if (decision === 'changes_requested' && !feedbackReason.trim()) {
      alert('Please explain what changes are requested for this submission.');
      return;
    }

    setIsProcessing(true);
    try {
      const updated = await ResourcesService.reviewSubmission(
        selectedSub.id,
        decision,
        {
          uid: currentUser.id,
          email: currentUser.email,
          name: currentUser.name
        },
        feedbackReason.trim() || undefined,
        adminNotes.trim() || undefined
      );

      if (updated) {
        setSubmissions(prev => prev.map(s => (s.id === updated.id ? updated : s)));
        setActionSuccessMessage(`Submission marked as ${decision.toUpperCase()}`);
        setTimeout(() => setActionSuccessMessage(null), 4000);
      }
      setSelectedSub(null);
      setDecisionAction(null);
      setFeedbackReason('');
      setAdminNotes('');
    } catch (err: any) {
      alert(err?.message || 'Error processing review decision.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const isPending = sub.status === 'pending' || (sub.status as string) === 'pending_review';
    const isApproved = sub.status === 'published' || (sub.status as string) === 'approved';
    const isRejected = (sub.status as string) === 'rejected';
    const isChanges = (sub.status as string) === 'changes_requested';

    if (filterStatus === 'pending' && !isPending) return false;
    if (filterStatus === 'approved' && !isApproved) return false;
    if (filterStatus === 'rejected' && !isRejected) return false;
    if (filterStatus === 'changes_requested' && !isChanges) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = sub.title.toLowerCase().includes(q);
      const matchSubmitter = (sub.submittedByName || '').toLowerCase().includes(q) || (sub.submittedByEmail || '').toLowerCase().includes(q);
      const matchCategory = (sub.category || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSubmitter && !matchCategory) return false;
    }

    return true;
  });

  const pendingCount = submissions.filter(
    (s) => s.status === 'pending' || (s.status as string) === 'pending_review'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#006B3F] border border-emerald-100 flex items-center justify-center font-bold">
                <Inbox className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 font-space tracking-tight">
                Resource Submissions Queue
              </h1>
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold font-mono">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Review and verify user-submitted courses, learning guides, and practical cohorts before publishing them to the public Opportunity Ghana portal.
            </p>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>Refresh Queue</span>
          </button>
        </div>

        {actionSuccessMessage && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-[#006B3F] rounded-2xl text-xs font-bold animate-in fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 mt-6">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'all', label: 'All Submissions' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
              { id: 'changes_requested', label: 'Changes Requested' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-[#006B3F] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, submitter..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#006B3F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading submissions queue...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No submissions found</h3>
            <p className="text-xs text-slate-400">
              There are no resource submissions matching the selected status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                  <th className="py-3 px-4">Resource Title</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Submitter</th>
                  <th className="py-3 px-3">Submitted</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map((sub) => {
                  const isPending = sub.status === 'pending' || (sub.status as string) === 'pending_review';
                  const isApproved = sub.status === 'published' || (sub.status as string) === 'approved';
                  const isRejected = (sub.status as string) === 'rejected';
                  const isChanges = (sub.status as string) === 'changes_requested';

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 truncate" title={sub.title}>
                          {sub.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {sub.providerName || 'Provider not stated'}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          {sub.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800">
                          {sub.submittedByName || 'Anonymous User'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-[140px]">
                          {sub.submittedByEmail || sub.submittedBy || 'N/A'}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(sub.createdAt).toLocaleDateString('en-GB')}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-[#006B3F] border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-[#006B3F]" />
                            Approved
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Rejected
                          </span>
                        )}
                        {isChanges && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                            <AlertCircle className="w-3 h-3 text-blue-600" />
                            Changes
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedSub(sub);
                            setFeedbackReason(sub.rejectionReason || '');
                            setAdminNotes(sub.adminNotes || '');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#006B3F] hover:text-white text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Moderation Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FCD116] font-space block">
                  Submission Verification
                </span>
                <h3 className="text-base sm:text-lg font-bold font-space truncate max-w-md">
                  {selectedSub.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Resource Photo if available */}
              {selectedSub.imageUrl && (
                <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={selectedSub.imageUrl}
                    alt={selectedSub.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Core Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Category</span>
                  <span className="font-bold text-slate-800">{selectedSub.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Type</span>
                  <span className="font-bold text-slate-800 capitalize">{selectedSub.resourceType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Format</span>
                  <span className="font-bold text-slate-800">{selectedSub.format}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Pricing</span>
                  <span className="font-bold text-[#006B3F]">
                    {selectedSub.isFree ? '100% Free' : `${selectedSub.cost} ${selectedSub.currency}`}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Resource Description
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {selectedSub.description}
                </p>
              </div>

              {/* Official URL */}
              {selectedSub.enrollmentUrl && (
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                  <div className="truncate pr-3 font-mono text-emerald-900">
                    <span className="font-bold mr-1">Link:</span> {selectedSub.enrollmentUrl}
                  </div>
                  <a
                    href={selectedSub.enrollmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#006B3F] font-bold hover:underline shrink-0"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Submitter Information */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#006B3F]" />
                  <span>Submitter Information</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>Name: <strong className="text-slate-800">{selectedSub.submittedByName || 'N/A'}</strong></div>
                  <div>Email: <strong className="text-slate-800">{selectedSub.submittedByEmail || 'N/A'}</strong></div>
                  <div>UID: <span className="font-mono text-slate-500">{selectedSub.submittedBy || 'N/A'}</span></div>
                  <div>Submitted: <span className="font-mono text-slate-500">{new Date(selectedSub.createdAt).toLocaleString('en-GB')}</span></div>
                </div>
              </div>

              {/* Decision Section */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-slate-800 block">
                  Feedback / Rejection Reason (Visible to submitter if rejected or changes requested)
                </label>
                <textarea
                  rows={2}
                  value={feedbackReason}
                  onChange={(e) => setFeedbackReason(e.target.value)}
                  placeholder="e.g. Please provide a direct registration link instead of a social media post."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                />

                <label className="text-xs font-bold text-slate-800 block pt-1">
                  Internal Administrative Notes (Private)
                </label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Verified official accreditation with ministry directory."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleReviewDecision('changes_requested')}
                  className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Request Changes
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleReviewDecision('rejected')}
                  className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-all cursor-pointer"
                >
                  Reject Submission
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleReviewDecision('approved')}
                  className="px-6 py-2 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#FCD116]" />
                  <span>Approve & Publish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
