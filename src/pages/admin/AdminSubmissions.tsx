import React, { useState, useEffect } from 'react';
import { Opportunity, Resource, Submission, DuplicateMatch } from '../../types/database';
import { OpportunitiesService } from '../../services/opportunitiesService';
import { ResourcesService } from '../../services/resourcesService';
import { AdminService } from '../../services/adminService';
import { detectDuplicates } from '../../services/duplicateDetection';
import { useAuth } from '../../services/authContext';
import { OPPORTUNITY_CATEGORIES, RESOURCE_CATEGORIES } from '../../data/categories';
import {
  Inbox,
  Compass,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  ExternalLink,
  Eye,
  Filter,
  ShieldCheck,
  Building,
  MapPin,
  Calendar,
  X,
  Sparkles,
  ChevronDown,
  Layers,
  GraduationCap,
  Briefcase,
  BookOpen,
  DollarSign,
  AlertTriangle,
  Edit3,
  RefreshCw,
  Check,
  FileText
} from 'lucide-react';

interface AdminSubmissionsProps {
  onNavigate: (path: string) => void;
}

type UnifiedSubmissionType = 'opportunity' | 'resource' | 'partner';

interface UnifiedSubmissionItem {
  id: string;
  type: UnifiedSubmissionType;
  title: string;
  providerName: string;
  category: string;
  submittedByName: string;
  submittedByEmail: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  rejectionReason?: string;
  adminNotes?: string;
  location?: string;
  applicationUrl?: string;
  imageUrl?: string;
  originalOpp?: Opportunity;
  originalRes?: Resource;
  originalPartner?: Submission;
}

export const AdminSubmissions: React.FC<AdminSubmissionsProps> = ({ onNavigate }) => {
  const { currentUser, isEditorOrAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [partnerSubs, setPartnerSubs] = useState<Submission[]>([]);

  // Filters
  const [typeFilter, setTypeFilter] = useState<'all' | 'opportunity' | 'resource' | 'partner'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'changes_requested'>('pending');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [search, setSearch] = useState('');

  // Review Modal State
  const [selectedItem, setSelectedItem] = useState<UnifiedSubmissionItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  // Confirmations
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionNotification, setActionNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Duplicates State
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [opps, resList, partners] = await Promise.all([
        OpportunitiesService.getAll({ includeUnpublished: true }),
        ResourcesService.getAll({ includeUnpublished: true }),
        AdminService.loadSubmissionsFromFirestore()
      ]);
      setOpportunities(opps);
      setResources(resList);
      setPartnerSubs(partners);
    } catch (e) {
      console.error('Failed to load submissions queue:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Map to unified list
  const unifiedItems: UnifiedSubmissionItem[] = [];

  // 1. Opportunities that are submitted or pending review
  for (const opp of opportunities) {
    const isSub = opp.isUserSubmitted || opp.status === 'pending' || (opp.status as string) === 'pending_review' || opp.submissionStatus !== undefined;
    if (isSub) {
      let status: 'pending' | 'approved' | 'rejected' | 'changes_requested' = 'pending';
      if (opp.submissionStatus === 'approved' || opp.status === 'published') {
        status = 'approved';
      } else if (opp.submissionStatus === 'rejected' || opp.status === 'rejected') {
        status = 'rejected';
      } else if (opp.submissionStatus === 'changes_requested') {
        status = 'changes_requested';
      }

      unifiedItems.push({
        id: opp.id,
        type: 'opportunity',
        title: opp.title,
        providerName: opp.organizationName || 'Offering Organization',
        category: opp.category,
        submittedByName: opp.submittedByName || opp.createdByName || 'Community Contributor',
        submittedByEmail: opp.submittedByEmail || opp.createdByEmail || 'N/A',
        submittedAt: opp.submittedAt || opp.createdAt,
        status,
        rejectionReason: opp.rejectionReason,
        adminNotes: opp.adminNotes,
        location: opp.location,
        applicationUrl: opp.applicationUrl,
        imageUrl: opp.imageUrl,
        originalOpp: opp
      });
    }
  }

  // 2. Resources that are submitted or pending review
  for (const res of resources) {
    const isSub = res.isUserSubmitted || res.submittedBy || res.status === 'pending' || (res.status as string) === 'pending_review' || res.submissionStatus !== undefined;
    if (isSub) {
      let status: 'pending' | 'approved' | 'rejected' | 'changes_requested' = 'pending';
      if (res.submissionStatus === 'approved' || res.status === 'published' || (res.status as string) === 'approved') {
        status = 'approved';
      } else if (res.submissionStatus === 'rejected' || (res.status as string) === 'rejected') {
        status = 'rejected';
      } else if (res.submissionStatus === 'changes_requested' || (res.status as string) === 'changes_requested') {
        status = 'changes_requested';
      }

      unifiedItems.push({
        id: res.id,
        type: 'resource',
        title: res.title,
        providerName: res.providerName || 'Learning Provider',
        category: res.category,
        submittedByName: res.submittedByName || res.createdByName || 'Contributor',
        submittedByEmail: res.submittedByEmail || res.createdByEmail || 'N/A',
        submittedAt: res.submittedAt || res.createdAt,
        status,
        rejectionReason: res.rejectionReason,
        adminNotes: res.adminNotes,
        location: res.location || res.format,
        applicationUrl: res.enrollmentUrl,
        imageUrl: res.imageUrl,
        originalRes: res
      });
    }
  }

  // 3. Partner proposals
  for (const p of partnerSubs) {
    unifiedItems.push({
      id: p.id,
      type: 'partner',
      title: p.title,
      providerName: p.organizationName,
      category: p.type === 'opportunity' ? 'Partner Opportunity' : 'Partner Resource',
      submittedByName: p.submittedByName,
      submittedByEmail: p.submittedByEmail,
      submittedAt: p.createdAt,
      status: p.status === 'approved' ? 'approved' : p.status === 'rejected' ? 'rejected' : 'pending',
      adminNotes: p.notes,
      originalPartner: p
    });
  }

  // Sort newest first
  unifiedItems.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  // Count metrics dynamically
  const pendingOpportunitiesCount = unifiedItems.filter(
    (i) => i.type === 'opportunity' && i.status === 'pending'
  ).length;

  const pendingResourcesCount = unifiedItems.filter(
    (i) => i.type === 'resource' && i.status === 'pending'
  ).length;

  const pendingPartnerCount = unifiedItems.filter(
    (i) => i.type === 'partner' && i.status === 'pending'
  ).length;

  const totalPendingCount = pendingOpportunitiesCount + pendingResourcesCount + pendingPartnerCount;

  // Filter pipeline
  const filteredSubmissions = unifiedItems.filter((item) => {
    // Type filter
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;

    // Status filter
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;

    // Category filter
    if (categoryFilter !== 'all' && item.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;

    // Date filter
    if (dateFilter !== 'all') {
      const itemDate = new Date(item.submittedAt).getTime();
      const now = Date.now();
      const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
      if (dateFilter === 'today' && diffDays > 1) return false;
      if (dateFilter === 'week' && diffDays > 7) return false;
      if (dateFilter === 'month' && diffDays > 30) return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchProvider = item.providerName.toLowerCase().includes(q);
      const matchSubmitter = item.submittedByName.toLowerCase().includes(q) || item.submittedByEmail.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      if (!matchTitle && !matchProvider && !matchSubmitter && !matchCat) return false;
    }

    return true;
  });

  // Open review modal
  const handleOpenReview = (item: UnifiedSubmissionItem) => {
    setSelectedItem(item);
    setIsEditing(false);
    setShowApproveConfirm(false);
    setShowRejectConfirm(false);
    setRejectionReasonInput(item.rejectionReason || '');
    setAdminNotesInput(item.adminNotes || '');

    // Duplicate detection check
    if (item.type === 'opportunity' && item.originalOpp) {
      const publishedOpps = opportunities.filter((o) => o.status === 'published' && o.id !== item.id);
      const matches = detectDuplicates(item.originalOpp, publishedOpps, item.id);
      setDuplicateMatches(matches.filter((m) => m.confidence >= 40));
    } else {
      setDuplicateMatches([]);
    }

    // Set initial edit data
    if (item.type === 'opportunity' && item.originalOpp) {
      setEditFormData({
        title: item.originalOpp.title,
        organizationName: item.originalOpp.organizationName,
        category: item.originalOpp.category,
        location: item.originalOpp.location,
        deadline: item.originalOpp.deadline,
        applicationUrl: item.originalOpp.applicationUrl,
        description: item.originalOpp.description
      });
    } else if (item.type === 'resource' && item.originalRes) {
      setEditFormData({
        title: item.originalRes.title,
        providerName: item.originalRes.providerName,
        category: item.originalRes.category,
        enrollmentUrl: item.originalRes.enrollmentUrl,
        description: item.originalRes.description
      });
    }
  };

  // Handle Approve & Publish
  const handleApproveAndPublish = async () => {
    if (!selectedItem || !currentUser || !isEditorOrAdmin) return;

    setIsProcessing(true);
    try {
      const adminCreds = {
        uid: currentUser.id,
        email: currentUser.email,
        name: currentUser.name || 'Administrator'
      };

      if (selectedItem.type === 'opportunity') {
        const editedData = isEditing ? editFormData : undefined;
        await OpportunitiesService.reviewSubmission(
          selectedItem.id,
          'approved',
          adminCreds,
          undefined,
          adminNotesInput.trim() || undefined,
          editedData
        );
      } else if (selectedItem.type === 'resource') {
        const editedData = isEditing ? editFormData : undefined;
        await ResourcesService.reviewSubmission(
          selectedItem.id,
          'approved',
          adminCreds,
          undefined,
          adminNotesInput.trim() || undefined,
          editedData
        );
      } else if (selectedItem.type === 'partner') {
        AdminService.updateSubmissionStatus(selectedItem.id, 'approved', adminNotesInput || 'Approved proposal');
      }

      setActionNotification({
        message: 'Submission approved and published successfully. It is now live on Opportunity Ghana!',
        type: 'success'
      });
      setTimeout(() => setActionNotification(null), 5000);

      setShowApproveConfirm(false);
      setSelectedItem(null);
      await loadAllData();
    } catch (err: any) {
      console.error('Approval failed:', err);
      alert(err?.message || 'Unable to publish this submission. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Reject
  const handleRejectSubmission = async () => {
    if (!selectedItem || !currentUser || !isEditorOrAdmin) return;

    if (!rejectionReasonInput.trim()) {
      alert('Please provide a reason for rejecting this submission.');
      return;
    }

    setIsProcessing(true);
    try {
      const adminCreds = {
        uid: currentUser.id,
        email: currentUser.email,
        name: currentUser.name || 'Administrator'
      };

      if (selectedItem.type === 'opportunity') {
        await OpportunitiesService.reviewSubmission(
          selectedItem.id,
          'rejected',
          adminCreds,
          rejectionReasonInput.trim(),
          adminNotesInput.trim() || undefined
        );
      } else if (selectedItem.type === 'resource') {
        await ResourcesService.reviewSubmission(
          selectedItem.id,
          'rejected',
          adminCreds,
          rejectionReasonInput.trim(),
          adminNotesInput.trim() || undefined
        );
      } else if (selectedItem.type === 'partner') {
        AdminService.updateSubmissionStatus(selectedItem.id, 'rejected', rejectionReasonInput.trim());
      }

      setActionNotification({
        message: 'Submission rejected and recorded in database. It remains unpublished.',
        type: 'success'
      });
      setTimeout(() => setActionNotification(null), 5000);

      setShowRejectConfirm(false);
      setSelectedItem(null);
      await loadAllData();
    } catch (err: any) {
      console.error('Rejection failed:', err);
      alert(err?.message || 'Unable to reject submission. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats (Requirement 4, 19) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E8F5EF] text-[#006B3F] border border-emerald-200 flex items-center justify-center font-bold">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-space">
                  Submissions & Verification Queue
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review user and organization submissions before publishing live to Opportunity Ghana.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={loadAllData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Counter KPI Tiles (Requirement 4 & 19: Live count from actual database) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div
            onClick={() => setStatusFilter('pending')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Pending Reviews
              </span>
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-700 mt-2 font-space">
              {totalPendingCount}
            </p>
            <p className="text-[10px] text-amber-900 font-medium mt-1">
              {pendingOpportunitiesCount} opps • {pendingResourcesCount} resources
            </p>
          </div>

          <div
            onClick={() => {
              setTypeFilter('opportunity');
              setStatusFilter('pending');
            }}
            className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100/70 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Pending Opps
              </span>
              <Compass className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-space">
              {pendingOpportunitiesCount}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Scholarships, jobs & grants</p>
          </div>

          <div
            onClick={() => {
              setTypeFilter('resource');
              setStatusFilter('pending');
            }}
            className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100/70 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Pending Courses
              </span>
              <BookOpen className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-space">
              {pendingResourcesCount}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Bootcamps & certifications</p>
          </div>

          <div
            onClick={() => setStatusFilter('approved')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              statusFilter === 'approved'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Published & Live
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2 font-space">
              {unifiedItems.filter((i) => i.status === 'approved').length}
            </p>
            <p className="text-[10px] text-emerald-800 mt-1">Approved submissions</p>
          </div>
        </div>
      </div>

      {actionNotification && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 border shadow-xs animate-in fade-in ${
            actionNotification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionNotification.message}</span>
        </div>
      )}

      {/* Filter and Control Bar (Requirement 18: Filters by Status, Type, Category, Date) */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        {/* Top Filter Buttons for Type & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'pending', label: 'Pending Review', count: totalPendingCount },
              { id: 'approved', label: 'Approved & Published', count: unifiedItems.filter((i) => i.status === 'approved').length },
              { id: 'rejected', label: 'Rejected', count: unifiedItems.filter((i) => i.status === 'rejected').length },
              { id: 'all', label: 'All Submissions', count: unifiedItems.length }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === st.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <span>{st.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    statusFilter === st.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {st.count}
                </span>
              </button>
            ))}
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'all', label: 'All Types' },
              { id: 'opportunity', label: 'Opportunities' },
              { id: 'resource', label: 'Resources' },
              { id: 'partner', label: 'Partners' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  typeFilter === t.id
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search, Category, and Date Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, provider, submitter name or email..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="all">All Categories</option>
              {OPPORTUNITY_CATEGORIES.map((c) => (
                <option key={`opp-${c.id}`} value={c.name}>
                  Opp: {c.name}
                </option>
              ))}
              {RESOURCE_CATEGORIES.map((c) => (
                <option key={`res-${c}`} value={c}>
                  Course: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-none"
            >
              <option value="all">All Dates</option>
              <option value="today">Submitted Today</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions Table / Cards List (Requirements 5, 29, 30, 31) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#006B3F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading database submissions queue...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No submissions waiting for review</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no submissions matching your active status and type filters. New community submissions will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                  <th className="py-3 px-4">Title & Item</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Submitter</th>
                  <th className="py-3 px-3">Submitted</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map((sub) => {
                  return (
                    <tr key={`${sub.type}-${sub.id}`} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 truncate" title={sub.title}>
                          {sub.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {sub.providerName} • {sub.location || 'Ghana / Online'}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                            sub.type === 'opportunity'
                              ? 'bg-emerald-50 text-[#006B3F] border border-emerald-200'
                              : sub.type === 'resource'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {sub.type === 'opportunity' && <Compass className="w-3 h-3 text-[#006B3F]" />}
                          {sub.type === 'resource' && <BookOpen className="w-3 h-3 text-purple-600" />}
                          {sub.type === 'partner' && <Building className="w-3 h-3 text-slate-500" />}
                          <span>{sub.type}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          {sub.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-medium text-slate-800">{sub.submittedByName}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-[130px]">
                          {sub.submittedByEmail}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(sub.submittedAt).toLocaleDateString('en-GB')}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {sub.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending Review
                          </span>
                        )}
                        {sub.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#006B3F] border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-[#006B3F]" />
                            Published
                          </span>
                        )}
                        {sub.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Rejected
                          </span>
                        )}
                        {sub.status === 'changes_requested' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                            <AlertCircle className="w-3 h-3 text-blue-600" />
                            Changes Requested
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenReview(sub)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#006B3F] hover:text-white text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
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

      {/* DETAILED SUBMISSION INSPECTION & REVIEW MODAL (Requirements 6, 7, 8, 10, 11, 12, 22, 24) */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FCD116] font-space">
                    {selectedItem.type.toUpperCase()} SUBMISSION REVIEW
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      selectedItem.status === 'approved'
                        ? 'bg-emerald-800 text-emerald-200'
                        : selectedItem.status === 'rejected'
                        ? 'bg-rose-800 text-rose-200'
                        : 'bg-amber-800 text-amber-200'
                    }`}
                  >
                    {selectedItem.status}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold font-space truncate max-w-xl">
                  {selectedItem.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isEditing ? 'bg-amber-500 text-slate-950 font-black' : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title="Edit details before approving"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden sm:inline">{isEditing ? 'Viewing Edit Mode' : 'Edit Before Approval'}</span>
                </button>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
              {/* DUPLICATE WARNING CARD (Requirement 24) */}
              {duplicateMatches.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Potential Duplicate Warning ({duplicateMatches.length} existing record match)</span>
                  </div>
                  <p className="text-amber-800 text-[11px]">
                    Before approving, verify that this is not an accidental double submission of an existing published opportunity.
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {duplicateMatches.map((m) => (
                      <div
                        key={m.existingItem.id}
                        className="p-2 bg-white/80 rounded-xl border border-amber-200 text-[11px] flex items-center justify-between"
                      >
                        <div>
                          <strong className="text-slate-900">{m.existingItem.title}</strong>
                          <div className="text-slate-500">
                            Confidence: <strong>{m.confidence}%</strong> • {m.reasons.join(', ')}
                          </div>
                        </div>
                        <a
                          href={`/opportunities/${m.existingItem.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#006B3F] font-bold hover:underline shrink-0"
                        >
                          View Existing
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Preview (Photo / Logo) */}
              {selectedItem.imageUrl && (
                <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* IN-MODAL EDITING FORM (Requirement 22) */}
              {isEditing ? (
                <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <span className="font-bold text-amber-900">Editorial Correction Mode</span>
                    <span className="text-[11px] text-amber-700">Correct spelling, category, or links before publishing</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-slate-800">Title</label>
                      <input
                        type="text"
                        value={editFormData.title || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-800">Provider / Organization</label>
                      <input
                        type="text"
                        value={editFormData.organizationName || editFormData.providerName || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, organizationName: e.target.value, providerName: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-800">Category</label>
                      <input
                        type="text"
                        value={editFormData.category || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-slate-800">Application / Registration Link</label>
                      <input
                        type="url"
                        value={editFormData.applicationUrl || editFormData.enrollmentUrl || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, applicationUrl: e.target.value, enrollmentUrl: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-mono"
                      />
                    </div>

                    {editFormData.deadline !== undefined && (
                      <div className="space-y-1">
                        <label className="font-bold text-slate-800">Deadline</label>
                        <input
                          type="date"
                          value={editFormData.deadline ? editFormData.deadline.split('T')[0] : ''}
                          onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900"
                        />
                      </div>
                    )}

                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-bold text-slate-800">Description</label>
                      <textarea
                        rows={3}
                        value={editFormData.description || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* READ-ONLY COMPLETE SUBMISSION VIEW (Requirements 6 & 7) */
                <div className="space-y-5">
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Type</span>
                      <span className="font-bold text-slate-800 capitalize">{selectedItem.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Category</span>
                      <span className="font-bold text-slate-800">{selectedItem.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Provider</span>
                      <span className="font-bold text-slate-800 truncate block">{selectedItem.providerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase">Location</span>
                      <span className="font-bold text-[#006B3F] truncate block">
                        {selectedItem.location || 'Ghana'}
                      </span>
                    </div>
                  </div>

                  {/* Opportunity Specific Fields */}
                  {selectedItem.originalOpp && (
                    <div className="space-y-4">
                      {/* Grid 1: Academic & Geographic Scope */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Destination Country</span>
                          <span className="font-bold text-slate-800">{selectedItem.originalOpp.country || 'Ghana'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Region in Ghana</span>
                          <span className="font-bold text-slate-800">{selectedItem.originalOpp.region || 'Nationwide'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Study / Career Level</span>
                          <span className="font-bold text-slate-800">{selectedItem.originalOpp.educationLevel || selectedItem.originalOpp.studyLevel || 'All Levels'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Field of Study</span>
                          <span className="font-bold text-slate-800 truncate block">{selectedItem.originalOpp.fieldOfStudy || 'All Disciplines'}</span>
                        </div>
                      </div>

                      {/* Grid 2: Funding & Key Dates */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                        <div>
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Funding Type</span>
                          <span className="font-bold text-[#006B3F]">{selectedItem.originalOpp.fundingType || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Tuition Coverage</span>
                          <span className="font-bold text-slate-800 truncate block">{selectedItem.originalOpp.tuition || 'Included / Covered'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Living Stipend</span>
                          <span className="font-bold text-slate-800 truncate block">{selectedItem.originalOpp.stipend || 'Provided'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Application Deadline</span>
                          <span className="font-bold text-slate-900 font-mono">
                            {selectedItem.originalOpp.deadline
                              ? new Date(selectedItem.originalOpp.deadline).toLocaleDateString('en-GB')
                              : 'Open / Rolling'}
                          </span>
                        </div>
                      </div>

                      {/* Eligibility & Nationality */}
                      {(selectedItem.originalOpp.nationality || selectedItem.originalOpp.accommodation) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                          {selectedItem.originalOpp.nationality && (
                            <div>
                              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Target Nationality / Citizenship</span>
                              <span className="font-semibold text-slate-800">{selectedItem.originalOpp.nationality}</span>
                            </div>
                          )}
                          {selectedItem.originalOpp.accommodation && (
                            <div>
                              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Housing / Accommodation</span>
                              <span className="font-semibold text-slate-800">{selectedItem.originalOpp.accommodation}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Requirements List */}
                      {selectedItem.originalOpp.requirements && selectedItem.originalOpp.requirements.length > 0 && (
                        <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                          <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">
                            Eligibility & Application Requirements ({selectedItem.originalOpp.requirements.length})
                          </span>
                          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
                            {selectedItem.originalOpp.requirements.map((req, idx) => (
                              <li key={idx}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Benefits & Coverage */}
                      {selectedItem.originalOpp.benefits && selectedItem.originalOpp.benefits.length > 0 && (
                        <div className="space-y-1.5 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/70">
                          <span className="text-emerald-900 block text-[10px] font-bold uppercase tracking-wider">
                            Scholarship / Program Benefits ({selectedItem.originalOpp.benefits.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {selectedItem.originalOpp.benefits.map((b, idx) => (
                              <span key={idx} className="px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-900">
                                ✓ {b}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Application Instructions */}
                      {selectedItem.originalOpp.applicationInstructions && (
                        <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                          <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">
                            Application Instructions
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                            {selectedItem.originalOpp.applicationInstructions}
                          </p>
                        </div>
                      )}

                      {/* Source URL if different from application URL */}
                      {selectedItem.originalOpp.sourceUrl && selectedItem.originalOpp.sourceUrl !== selectedItem.applicationUrl && (
                        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                          <div className="truncate pr-3 font-mono text-slate-700">
                            <span className="font-bold mr-1">Official Source Website:</span> {selectedItem.originalOpp.sourceUrl}
                          </div>
                          <a
                            href={selectedItem.originalOpp.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors shrink-0"
                          >
                            <span>Visit Source</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resource Specific Fields */}
                  {selectedItem.originalRes && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Level</span>
                        <span className="font-bold text-slate-800">{selectedItem.originalRes.level || 'All Levels'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Format</span>
                        <span className="font-bold text-slate-800">{selectedItem.originalRes.format}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Pricing</span>
                        <span className="font-bold text-[#006B3F]">
                          {selectedItem.originalRes.isFree ? '100% Free' : `${selectedItem.originalRes.cost} ${selectedItem.originalRes.currency}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Certificate</span>
                        <span className="font-bold text-slate-800">
                          {selectedItem.originalRes.hasCertificate ? 'Yes (Included)' : 'No'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Description Box */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Submitted Description
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 whitespace-pre-line">
                      {selectedItem.originalOpp?.description || selectedItem.originalRes?.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Application Link with Test Button */}
                  {selectedItem.applicationUrl && (
                    <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs">
                      <div className="truncate pr-3 font-mono text-emerald-950">
                        <span className="font-bold mr-1">Link:</span> {selectedItem.applicationUrl}
                      </div>
                      <a
                        href={selectedItem.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#006B3F] text-white font-bold hover:bg-[#005530] transition-colors shrink-0"
                      >
                        <span>Test Link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Submitter & Audit Info (Requirement 17: Traceability) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#006B3F]" />
                  <span>Submitter & Audit Trail</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>Name: <strong className="text-slate-800">{selectedItem.submittedByName}</strong></div>
                  <div>Email: <strong className="text-slate-800">{selectedItem.submittedByEmail}</strong></div>
                  <div>Submitted Date: <span className="font-mono text-slate-600">{new Date(selectedItem.submittedAt).toLocaleString('en-GB')}</span></div>
                  <div>Database ID: <span className="font-mono text-slate-500">{selectedItem.id}</span></div>
                </div>

                {selectedItem.rejectionReason && (
                  <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px]">
                    <strong>Recorded Rejection Reason:</strong> {selectedItem.rejectionReason}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions & Confirmation Bars */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {/* Reject Button Trigger */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setShowRejectConfirm(true)}
                  className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Reject Submission</span>
                </button>

                {/* Approve & Publish Button Trigger */}
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setShowApproveConfirm(true)}
                  className="px-6 py-2 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#FCD116]" />
                  <span>Approve & Publish</span>
                </button>
              </div>
            </div>

            {/* APPROVAL CONFIRMATION DIALOG (Requirement 12) */}
            {showApproveConfirm && (
              <div className="absolute inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#006B3F] border border-emerald-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div className="text-center space-y-1.5">
                    <h4 className="text-base font-bold text-slate-900 font-space">
                      Approve and publish this submission?
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      This will make <strong>"{selectedItem.title}"</strong> immediately visible to all visitors on the public Opportunity Ghana website and accessible to search.
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Internal Administrator Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={adminNotesInput}
                      onChange={(e) => setAdminNotesInput(e.target.value)}
                      placeholder="e.g. Verified official website accreditation"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setShowApproveConfirm(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleApproveAndPublish}
                      className="px-5 py-2 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#FCD116]" />
                          <span>Approve & Publish</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* REJECTION CONFIRMATION DIALOG (Requirement 11) */}
            {showRejectConfirm && (
              <div className="absolute inset-0 z-60 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
                    <XCircle className="w-6 h-6" />
                  </div>

                  <div className="text-center space-y-1.5">
                    <h4 className="text-base font-bold text-slate-900 font-space">
                      Reject this submission?
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      This item will <strong>not</strong> be published on Opportunity Ghana. It will be recorded as rejected in the database.
                    </p>
                  </div>

                  <div className="space-y-3 pt-1 text-left">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-800">
                          Reason for rejection <span className="text-rose-600">*</span>
                        </label>
                        <span className="text-[10px] text-slate-400">Visible to submitter in profile</span>
                      </div>

                      {/* Common Reason Pills */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {[
                          'Broken or invalid application URL',
                          'Application deadline has already passed',
                          'Duplicate of an existing published opportunity',
                          'Incomplete eligibility details or description',
                          'Unverified offering provider or organization',
                          'Commercial application fee required (policy violation)'
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setRejectionReasonInput(preset)}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-[10px] font-medium border border-slate-200 transition-colors text-left cursor-pointer"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={2}
                        required
                        value={rejectionReasonInput}
                        onChange={(e) => setRejectionReasonInput(e.target.value)}
                        placeholder="Please provide a clear reason for rejecting this submission..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Internal Notes (Private to administrators)
                      </label>
                      <input
                        type="text"
                        value={adminNotesInput}
                        onChange={(e) => setAdminNotesInput(e.target.value)}
                        placeholder="e.g. Contacted organization; cohort is cancelled"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setShowRejectConfirm(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleRejectSubmission}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Rejecting...</span>
                        </>
                      ) : (
                        <span>Reject Submission</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
