import React, { useState, useEffect } from 'react';
import { Resource, OpportunityStatus, VerificationStatus } from '../../types/database';
import { ResourcesService } from '../../services/resourcesService';
import { RESOURCE_CATEGORIES, RESOURCE_TYPES } from '../../data/categories';
import { VerificationBadge } from '../../components/common/VerificationBadge';
import { ResourceFormModal } from './ResourceFormModal';
import { AuditHistoryModal } from './AuditHistoryModal';
import { useAuth } from '../../services/authContext';
import {
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Edit2,
  Trash2,
  Copy,
  Clock,
  ShieldCheck,
  Archive,
  Eye,
  History,
  BookOpen,
  Award,
  DollarSign
} from 'lucide-react';

export const AdminResources: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterFree, setFilterFree] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  // History modal
  const [historyTarget, setHistoryTarget] = useState<{ id: string; title: string } | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Single delete confirmation
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<Resource | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await ResourcesService.getAll({ includeUnpublished: true });
      setResources(items);
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

  const handleOpenCreate = () => {
    setEditingResource(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (res: Resource) => {
    setEditingResource(res);
    setIsFormOpen(true);
  };

  const handleSaveResource = async (res: Resource, targetStatus: OpportunityStatus) => {
    await ResourcesService.saveResource(res, author);
    await loadData();
  };

  const handleDuplicate = async (id: string) => {
    await ResourcesService.duplicate(id, author);
    await loadData();
  };

  const handleStatusChange = async (id: string, newStatus: OpportunityStatus) => {
    await ResourcesService.updateStatus(id, newStatus, author);
    await loadData();
  };

  const handleVerificationChange = async (id: string, newVerification: VerificationStatus) => {
    await ResourcesService.updateVerification(id, newVerification, author);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    await ResourcesService.delete(id, author);
    setDeleteConfirmTarget(null);
    setSelectedIds(prev => prev.filter(i => i !== id));
    await loadData();
  };

  // Bulk Actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredResources.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const executeBulkAction = async (action: string) => {
    if (selectedIds.length === 0) return;

    switch (action) {
      case 'publish':
        await ResourcesService.bulkUpdateStatus(selectedIds, 'published', author);
        break;
      case 'unpublish':
        await ResourcesService.bulkUpdateStatus(selectedIds, 'draft', author);
        break;
      case 'archive':
        await ResourcesService.bulkArchive(selectedIds, author);
        break;
      case 'mark_verified':
        await ResourcesService.bulkUpdateVerification(selectedIds, 'verified', author);
        break;
      case 'delete':
        await ResourcesService.bulkDelete(selectedIds, author);
        break;
    }

    setSelectedIds([]);
    setBulkDeleteConfirm(false);
    await loadData();
  };

  // Filters
  const filteredResources = resources.filter(res => {
    if (filterStatus !== 'all' && res.status !== filterStatus) return false;
    if (filterCategory !== 'all' && res.category.toLowerCase() !== filterCategory.toLowerCase()) return false;
    if (filterFree === 'free' && !res.isFree) return false;
    if (filterFree === 'paid' && res.isFree) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchTitle = res.title.toLowerCase().includes(q);
      const matchProv = (res.providerName || '').toLowerCase().includes(q);
      const matchCat = (res.category || '').toLowerCase().includes(q);
      if (!matchTitle && !matchProv && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-space">
            Learning Resource Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer free & paid online courses, certifications, bootcamps, and skills training tracks.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Resource</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resource, provider..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
            />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Drafts Only</option>
              <option value="pending_review">Pending Review</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
            >
              <option value="all">All Categories</option>
              {RESOURCE_CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterFree}
              onChange={(e) => setFilterFree(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
            >
              <option value="all">All Pricing</option>
              <option value="free">Free Courses Only</option>
              <option value="paid">Paid / Tuition</option>
            </select>
          </div>
        </div>

        {/* Selected Items Bulk Toolbar */}
        {selectedIds.length > 0 && (
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-indigo-50/70 p-3 rounded-xl border border-indigo-200">
            <span className="text-xs font-bold text-indigo-950">
              {selectedIds.length} resource selected
            </span>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => executeBulkAction('publish')}
                className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg cursor-pointer"
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
                onClick={() => executeBulkAction('archive')}
                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg cursor-pointer"
              >
                Archive
              </button>
              <button
                onClick={() => setBulkDeleteConfirm(true)}
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

      {/* Main Table (Section 4 specifications) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredResources.length > 0 &&
                      selectedIds.length === filteredResources.length
                    }
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Title</th>
                <th className="py-3 px-3">Provider</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Free / Paid</th>
                <th className="py-3 px-3">Certificate</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Last Verified</th>
                <th className="py-3 px-3 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Loading courses & learning resources...
                  </td>
                </tr>
              ) : filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No resources match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredResources.map((res) => {
                  const isSelected = selectedIds.includes(res.id);

                  return (
                    <tr
                      key={res.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(res.id)}
                          className="w-3.5 h-3.5 rounded cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-bold text-slate-900 truncate" title={res.title}>
                          {res.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {res.level} • {res.duration}
                        </div>
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-700">
                        {res.providerName || 'Provider pending'}
                      </td>

                      <td className="py-3 px-3 capitalize text-slate-600 font-medium">
                        {res.resourceType.replace('_', ' ')}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          {res.category}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {res.isFree ? (
                          <span className="font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                            Free
                          </span>
                        ) : (
                          <span className="font-bold text-slate-800 text-[11px]">
                            {res.currency} {res.cost.toLocaleString()}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {res.hasCertificate ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            Yes
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No cert</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            res.status === 'published'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : res.status === 'pending_review'
                              ? 'bg-amber-50 text-amber-800 border border-amber-300'
                              : res.status === 'closed'
                              ? 'bg-slate-100 text-slate-600 border border-slate-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {res.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-[11px] text-slate-500 whitespace-nowrap font-mono">
                        {res.lastVerifiedAt
                          ? new Date(res.lastVerifiedAt).toLocaleDateString('en-GB')
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right pr-4 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="View on Public Website"
                            onClick={() => onNavigate(`/resources/${res.slug || res.id}`)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Edit Resource"
                            onClick={() => handleOpenEdit(res)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Duplicate as Draft"
                            onClick={() => handleDuplicate(res.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {res.status === 'published' ? (
                            <button
                              title="Unpublish (Convert to Draft)"
                              onClick={() => handleStatusChange(res.id, 'draft')}
                              className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              title="Publish Live"
                              onClick={() => handleStatusChange(res.id, 'published')}
                              className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            title="View Audit Change History"
                            onClick={() => setHistoryTarget({ id: res.id, title: res.title })}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Delete Resource"
                            onClick={() => setDeleteConfirmTarget(res)}
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

      {/* Resource Form Modal */}
      {isFormOpen && (
        <ResourceFormModal
          isOpen={isFormOpen}
          resourceToEdit={editingResource}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveResource}
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
                Confirm Resource Deletion
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Are you sure you want to permanently delete &ldquo;
                <strong className="text-slate-900">{deleteConfirmTarget.title}</strong>&rdquo;?
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

      {/* Bulk Delete Modal */}
      {bulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Confirm Bulk Deletion ({selectedIds.length} resources)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Permanently delete {selectedIds.length} selected learning resources?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBulkDeleteConfirm(false)}
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
