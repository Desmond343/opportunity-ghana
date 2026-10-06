import React, { useEffect, useState } from 'react';
import { Resource } from '../../types/database';
import { ResourcesService } from '../../services/resourcesService';
import { useAuth } from '../../services/authContext';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface UserSubmissionsListProps {
  onOpenSubmitModal: () => void;
  onNavigate?: (path: string) => void;
}

export const UserSubmissionsList: React.FC<UserSubmissionsListProps> = ({
  onOpenSubmitModal,
  onNavigate
}) => {
  const { currentUser } = useAuth();
  const [submissions, setSubmissions] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSubmissions = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const items = await ResourcesService.getUserSubmissions(currentUser.id);
      setSubmissions(items);
    } catch (e) {
      console.error('Failed to load user submissions', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [currentUser?.id]);

  const handleDelete = async (id: string, title: string) => {
    if (!currentUser) return;
    if (!window.confirm(`Are you sure you want to withdraw your submission for "${title}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await ResourcesService.deleteUserSubmission(id, currentUser.id);
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    } catch (e: any) {
      alert(e?.message || 'Could not delete submission.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#006B3F]" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-space">
              My Resource Submissions
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track verification status and administrator feedback for learning resources you submitted.
          </p>
        </div>

        <button
          onClick={onOpenSubmitModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#FCD116]" />
          <span>Submit a Resource</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#006B3F] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Checking submission statuses...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="py-10 text-center space-y-3 bg-[#F7F8FA] rounded-2xl p-6 border border-slate-200/80">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800 font-space">
              No Submissions Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Know an accredited free course, bootcamp, or professional certification beneficial for Ghanaian learners?
            </p>
          </div>
          <button
            onClick={onOpenSubmitModal}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#006B3F]" />
            <span>Submit First Resource</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const isPending = sub.status === 'pending' || (sub.status as string) === 'pending_review';
            const isApproved = sub.status === 'published' || (sub.status as string) === 'approved';
            const isRejected = (sub.status as string) === 'rejected';
            const isChangesRequested = (sub.status as string) === 'changes_requested';

            return (
              <div
                key={sub.id}
                className="floating-glass-tablet specular-rim-highlight p-4 sm:p-5 rounded-2xl space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 font-space truncate">
                        {sub.title}
                      </h4>
                      {/* Status Badges */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pending Verification
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006B3F] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-[#006B3F]" />
                          Approved & Published
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Rejected
                        </span>
                      )}
                      {isChangesRequested && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                          <AlertCircle className="w-3 h-3 text-blue-600" />
                          Changes Requested
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {sub.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>Category: <strong className="text-slate-700">{sub.category}</strong></span>
                      <span>&bull;</span>
                      <span>Type: <strong className="text-slate-700 capitalize">{sub.resourceType}</strong></span>
                      <span>&bull;</span>
                      <span>Submitted: {new Date(sub.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start shrink-0 pt-1 sm:pt-0">
                    {sub.enrollmentUrl && (
                      <a
                        href={sub.enrollmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#006B3F] transition-colors"
                        title="Visit Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {(isPending || isChangesRequested || isRejected) && (
                      <button
                        onClick={() => handleDelete(sub.id, sub.title)}
                        disabled={deletingId === sub.id}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                        title="Withdraw / Delete Submission"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Review Feedback / Rejection Reason Box */}
                {(sub.rejectionReason || sub.adminNotes) && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Reviewer Feedback:</span>
                    </p>
                    {sub.rejectionReason && (
                      <p className="text-rose-700 font-medium">{sub.rejectionReason}</p>
                    )}
                    {sub.adminNotes && (
                      <p className="text-slate-600 text-[11px]">{sub.adminNotes}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
