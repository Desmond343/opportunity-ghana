import React, { useState, useEffect } from 'react';
import { Opportunity, OpportunityStatus, VerificationStatus } from '../../types/database';
import { OpportunitiesService } from '../../services/opportunitiesService';
import { OPPORTUNITY_CATEGORIES } from '../../data/categories';
import { VerificationBadge } from '../../components/common/VerificationBadge';
import { DeadlineBadge } from '../../components/common/DeadlineBadge';
import { OpportunityFormModal } from './OpportunityFormModal';
import { AuditHistoryModal } from './AuditHistoryModal';
import { useAuth } from '../../services/authContext';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Edit2,
  Trash2,
  Copy,
  Clock,
  ShieldCheck,
  Check,
  Archive,
  Eye,
  MoreVertical,
  X,
  History,
  Layers
} from 'lucide-react';

export const AdminOpportunities: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVerification, setFilterVerification] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState<Opportunity | null>(null);

  // History Modal
  const [historyTarget, setHistoryTarget] = useState<{ id: string; title: string } | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionConfirm, setBulkActionConfirm] = useState<{ action: string; count: number } | null>(null);

  // Delete single confirmation
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<Opportunity | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await OpportunitiesService.getAll({ includeUnpublished: true });
      setOpportunities(items);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const author = {
    email: currentUser?.email || 'admin@opportunityghana.com',
    name: currentUser?.name || 'Administrator'
  };

  // Actions
  const handleOpenCreate = () => {
    setEditingOpp(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (opp: Opportunity) => {
    setEditingOpp(opp);
    setIsFormOpen(true);
  };

  const handleSaveOpportunity = async (opp: Opportunity, targetStatus: OpportunityStatus) => {
    await OpportunitiesService.saveOpportunity(opp, author);
    await loadData();
  };

  const handleDuplicate = async (id: string) => {
    await OpportunitiesService.duplicate(id, author);
    await loadData();
  };

  const handleStatusChange = async (id: string, newStatus: OpportunityStatus) => {
    await OpportunitiesService.updateStatus(id, newStatus, author);
    await loadData();
  };

  const handleVerificationChange = async (id: string, newVerification: VerificationStatus) => {
    await OpportunitiesService.updateVerification(id, newVerification, author);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    await OpportunitiesService.delete(id, author);
    setDeleteConfirmTarget(null);
    setSelectedIds(prev => prev.filter(item => item !== id));
    await loadData();
  };

  // Bulk Actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredOpportunities.map(o => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const executeBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return;

    switch (action) {
      case 'publish':
        await OpportunitiesService.bulkUpdateStatus(selectedIds, 'published', author);
        break;
      case 'unpublish':
        await OpportunitiesService.bulkUpdateStatus(selectedIds, 'draft', author);
        break;
      case 'archive':
        await OpportunitiesService.bulkArchive(selectedIds, author);
        break;
      case 'mark_verified':
        await OpportunitiesService.bulkUpdateVerification(selectedIds, 'verified', author);
        break;
      case 'mark_closed':
        await OpportunitiesService.bulkUpdateStatus(selectedIds, 'closed', author);
        break;
      case 'delete':
        await OpportunitiesService.bulkDelete(selectedIds, author);
        break;
    }

    setSelectedIds([]);
    setBulkActionConfirm(null);
    await loadData();
  };

  // Filter pipeline
  const filteredOpportunities = opportunities.filter(opp => {
    if (filterStatus !== 'all' && opp.status !== filterStatus) return false;
    if (filterVerification !== 'all' && opp.verificationStatus !== filterVerification) return false;
    if (filterCategory !== 'all' && opp.category.toLowerCase() !== filterCategory.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchTitle = opp.title.toLowerCase().includes(q);
      const matchOrg = (opp.organizationName || '').toLowerCase().includes(q);
      const matchCat = (opp.category || '').toLowerCase().includes(q);
      if (!matchTitle && !matchOrg && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-space">
            Opportunity Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full lifecycle control: Draft → Review → Verify → Publish → Update → Close/Archive
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Opportunity</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, organization..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Drafts Only</option>
              <option value="pending_review">Pending Review</option>
              <option value="verified">Verified</option>
              <option value="published">Published (Live)</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Verification Filter */}
          <div>
            <select
              value={filterVerification}
              onChange={(e) => setFilterVerification(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified Source</option>
              <option value="needs_verification">Needs Verification</option>
              <option value="warning">Warning / Flagged</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
            >
              <option value="all">All Categories</option>
              {OPPORTUNITY_CATEGORIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Items / Bulk Management Toolbar */}
        {selectedIds.length > 0 && (
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
            <span className="text-xs font-bold text-emerald-950">
              {selectedIds.length} opportunity selected
            </span>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => executeBulkAction('publish')}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer"
              >
                Publish Selected
              </button>
              <button
                onClick={() => executeBulkAction('unpublish')}
                className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold rounded-lg cursor-pointer"
              >
                Unpublish
              </button>
              <button
                onClick={() => executeBulkAction('mark_verified')}
                className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg cursor-pointer"
              >
                Mark Verified
              </button>
              <button
                onClick={() => executeBulkAction('mark_closed')}
                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer"
              >
                Mark Closed
              </button>
              <button
                onClick={() => executeBulkAction('archive')}
                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg cursor-pointer"
              >
                Archive
              </button>
              <button
                onClick={() => setBulkActionConfirm({ action: 'delete', count: selectedIds.length })}
                className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold rounded-lg cursor-pointer"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-slate-500 hover:text-slate-800 underline px-2 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table (Specified in Section 2) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredOpportunities.length > 0 &&
                      selectedIds.length === filteredOpportunities.length
                    }
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Title & Organization</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Verification</th>
                <th className="py-3 px-3">Deadline</th>
                <th className="py-3 px-3">Last Verified</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading opportunities catalog...
                  </td>
                </tr>
              ) : filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No opportunities match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOpportunities.map((opp) => {
                  const isSelected = selectedIds.includes(opp.id);
                  const isClosed = opp.status === 'closed';

                  return (
                    <tr
                      key={opp.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(opp.id)}
                          className="w-3.5 h-3.5 rounded cursor-pointer"
                        />
                      </td>

                      {/* Title & Org */}
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-bold text-slate-900 truncate" title={opp.title}>
                          {opp.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {opp.organizationName || 'Institution pending'}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          {opp.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            opp.status === 'published'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : opp.status === 'pending_review'
                              ? 'bg-amber-50 text-amber-800 border border-amber-300'
                              : opp.status === 'closed'
                              ? 'bg-slate-100 text-slate-600 border border-slate-300'
                              : opp.status === 'archived'
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {opp.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Verification */}
                      <td className="py-3 px-3">
                        <VerificationBadge status={opp.verificationStatus} isDemo={opp.isDemo} />
                      </td>

                      {/* Deadline */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <DeadlineBadge deadline={opp.deadline} compact />
                      </td>

                      {/* Last Verified */}
                      <td className="py-3 px-3 text-[11px] text-slate-500 whitespace-nowrap font-mono">
                        {opp.lastVerifiedAt
                          ? new Date(opp.lastVerifiedAt).toLocaleDateString('en-GB')
                          : 'Not checked'}
                      </td>

                      {/* Created */}
                      <td className="py-3 px-3 text-[11px] text-slate-400 whitespace-nowrap font-mono">
                        {opp.createdAt
                          ? new Date(opp.createdAt).toLocaleDateString('en-GB')
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right pr-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View public */}
                          <button
                            title="View on Public Website"
                            onClick={() => onNavigate(`/opportunities/${opp.slug || opp.id}`)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            title="Edit Opportunity Details"
                            onClick={() => handleOpenEdit(opp)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate */}
                          <button
                            title="Duplicate as Draft"
                            onClick={() => handleDuplicate(opp.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Publish / Unpublish */}
                          {opp.status === 'published' ? (
                            <button
                              title="Unpublish (Convert to Draft)"
                              onClick={() => handleStatusChange(opp.id, 'draft')}
                              className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              title="Publish Live"
                              onClick={() => handleStatusChange(opp.id, 'published')}
                              className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* History */}
                          <button
                            title="View Audit Change History"
                            onClick={() => setHistoryTarget({ id: opp.id, title: opp.title })}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            title="Delete Opportunity"
                            onClick={() => setDeleteConfirmTarget(opp)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Opportunity Form Modal */}
      {isFormOpen && (
        <OpportunityFormModal
          isOpen={isFormOpen}
          opportunityToEdit={editingOpp}
          existingOpportunities={opportunities}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveOpportunity}
        />
      )}

      {/* Audit History Modal */}
      {historyTarget && (
        <AuditHistoryModal
          isOpen={Boolean(historyTarget)}
          entityId={historyTarget.id}
          entityTitle={historyTarget.title}
          onClose={() => setHistoryTarget(null)}
        />
      )}

      {/* Single Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Confirm Opportunity Deletion
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Are you sure you want to permanently delete &ldquo;
                <strong className="text-slate-900">{deleteConfirmTarget.title}</strong>&rdquo;? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmTarget.id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {bulkActionConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Confirm Bulk Deletion ({bulkActionConfirm.count} records)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                You are about to permanently delete {bulkActionConfirm.count} selected opportunities. Are you sure you wish to proceed?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBulkActionConfirm(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => executeBulkAction('delete')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Bulk Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
