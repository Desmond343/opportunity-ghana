import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../services/authContext';
import { AlertSubscriptionsService } from '../../services/alertSubscriptionsService';
import { AlertSubscription, AlertSubscriberMetrics } from '../../types/database';
import { OPPORTUNITY_CATEGORIES } from '../../data/categories';
import {
  Mail,
  Users,
  UserCheck,
  UserX,
  Sparkles,
  Search,
  Filter,
  Download,
  RotateCw,
  Send,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Phone,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Layers,
  Copy,
  Check,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

interface AdminAlertSubscribersProps {
  onNavigate: (path: string) => void;
}

export const AdminAlertSubscribers: React.FC<AdminAlertSubscribersProps> = ({ onNavigate }) => {
  const { currentUser, getIdToken, isEditorOrAdmin } = useAuth();

  const [subscribers, setSubscribers] = useState<AlertSubscription[]>([]);
  const [metrics, setMetrics] = useState<AlertSubscriberMetrics>({
    total: 0,
    active: 0,
    unsubscribed: 0,
    newThisMonth: 0,
    newThisWeek: 0
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [frequencyFilter, setFrequencyFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'email_asc' | 'email_desc'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Notifications / Feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Fetch subscribers from server & database
  const loadSubscribers = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await AlertSubscriptionsService.getAdminSubscribers(
        {
          search: searchTerm,
          status: statusFilter,
          category: categoryFilter,
          frequency: frequencyFilter,
          sortBy,
          page: currentPage,
          limit: 20
        },
        getIdToken
      );

      if (res && res.success) {
        setSubscribers(res.subscribers || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      }
    } catch (err: any) {
      console.error('Failed to load alert subscribers:', err);
      setActionError(err.message || 'Could not load alert subscribers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, [searchTerm, statusFilter, categoryFilter, frequencyFilter, sortBy, currentPage]);

  // Listen for subscriber change events
  useEffect(() => {
    const handleUpdate = () => {
      loadSubscribers(true);
    };
    window.addEventListener('alert-subscribers-changed', handleUpdate);
    return () => window.removeEventListener('alert-subscribers-changed', handleUpdate);
  }, [searchTerm, statusFilter, categoryFilter, frequencyFilter, sortBy, currentPage]);

  // Handle Status Toggle (Active <-> Unsubscribed)
  const handleToggleStatus = async (subscriber: AlertSubscription) => {
    const nextStatus = (subscriber.status === 'active' || subscriber.active === true) ? 'unsubscribed' : 'active';
    try {
      const ok = await AlertSubscriptionsService.updateSubscriberStatus(subscriber.id, nextStatus, getIdToken);
      if (ok) {
        setActionSuccess(`Subscriber ${subscriber.email} marked as ${nextStatus}.`);
        setTimeout(() => setActionSuccess(null), 4000);
        loadSubscribers(true);
      } else {
        setActionError('Failed to update status');
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to update status');
    }
  };

  // Handle Delete Subscriber
  const handleDelete = async (subscriber: AlertSubscription) => {
    if (!window.confirm(`Are you sure you want to delete ${subscriber.email}? This action cannot be undone.`)) {
      return;
    }
    try {
      const ok = await AlertSubscriptionsService.deleteSubscriber(subscriber.id, getIdToken);
      if (ok) {
        setActionSuccess(`Subscriber ${subscriber.email} removed.`);
        setTimeout(() => setActionSuccess(null), 4000);
        loadSubscribers(true);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete subscriber');
    }
  };

  // Copy email to clipboard
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  // Trigger Daily Digest Dispatch
  const handleDispatchDaily = async () => {
    if (metrics.active === 0) {
      alert('There are currently no active subscribers to dispatch alerts to.');
      return;
    }
    if (!window.confirm(`Trigger Daily Alert Digest to all ${metrics.active} active subscribers now?`)) {
      return;
    }

    setDispatching(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = await AlertSubscriptionsService.dispatchDailyDigest(getIdToken);
      if (res.success) {
        setActionSuccess(res.message || `Alert digest dispatched to ${res.sentCount} subscribers.`);
        setTimeout(() => setActionSuccess(null), 6000);
        loadSubscribers(true);
      } else {
        setActionError(res.message || 'Dispatch failed.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Could not trigger daily alert digest.');
    } finally {
      setDispatching(false);
    }
  };

  // Export to Excel (All vs Filtered)
  const handleExport = async (scope: 'all' | 'filtered') => {
    setExportDropdownOpen(false);
    try {
      let exportList: AlertSubscription[] = [];

      if (scope === 'all') {
        // Fetch full list without limit
        const allRes = await AlertSubscriptionsService.getAdminSubscribers(
          { limit: 10000, page: 1, sortBy },
          getIdToken
        );
        exportList = allRes.subscribers || [];
      } else {
        // Fetch all matching active filters
        const filteredRes = await AlertSubscriptionsService.getAdminSubscribers(
          {
            search: searchTerm,
            status: statusFilter,
            category: categoryFilter,
            frequency: frequencyFilter,
            sortBy,
            limit: 10000,
            page: 1
          },
          getIdToken
        );
        exportList = filteredRes.subscribers || [];
      }

      if (exportList.length === 0) {
        alert('No subscribers available to export for the selected filter.');
        return;
      }

      const filename = AlertSubscriptionsService.exportToExcel(
        exportList,
        scope === 'all'
          ? 'opportunity-ghana-daily-alert-subscribers-all'
          : 'opportunity-ghana-daily-alert-subscribers-filtered',
        {
          email: currentUser?.email || 'admin@opportunityghana.com',
          name: currentUser?.name || 'Administrator'
        },
        scope,
        getIdToken
      );

      setActionSuccess(`Successfully exported ${exportList.length} subscriber rows to ${filename}!`);
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      console.error('Export error:', err);
      setActionError('Failed to generate Excel export file.');
    }
  };

  return (
    <div className="space-y-7 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-[#006B3F] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <Mail className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-[#006B3F] dark:text-emerald-400 uppercase tracking-wider font-space">
              Notification Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-space">
            Daily Alert Subscribers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage all visitors who subscribed to free daily opportunity alerts. View preferences, dispatch digests, and export verified records to Microsoft Excel.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => loadSubscribers(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141B29] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Refresh subscriber records"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Send Daily Digest Button */}
          <button
            onClick={handleDispatchDaily}
            disabled={dispatching || metrics.active === 0}
            className="px-3.5 py-2.5 rounded-xl bg-[#006B3F] hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            title="Queue daily alert digest to all active subscribers"
          >
            <Send className={`w-3.5 h-3.5 ${dispatching ? 'animate-bounce' : ''}`} />
            <span>{dispatching ? 'Queuing Dispatch...' : 'Send Daily Digest'}</span>
          </button>

          {/* Export to Excel Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Export to Excel</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {exportDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setExportDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => handleExport('all')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-[#006B3F] dark:hover:text-emerald-300 rounded-xl flex items-center justify-between cursor-pointer"
                  >
                    <span>Export All Subscribers</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md font-mono text-slate-500">
                      {metrics.total}
                    </span>
                  </button>

                  <button
                    onClick={() => handleExport('filtered')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-[#006B3F] dark:hover:text-emerald-300 rounded-xl flex items-center justify-between cursor-pointer"
                  >
                    <span>Export Filtered Results</span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-[#006B3F] dark:text-emerald-300 px-1.5 py-0.5 rounded-md font-mono">
                      {totalCount}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Subscribers */}
        <div className="bg-white dark:bg-[#141B29] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Subscribers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-space">
              {metrics.total.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            All registered alert emails
          </p>
        </div>

        {/* Active Subscribers */}
        <div className="bg-white dark:bg-[#141B29] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Subscribers</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#006B3F] dark:text-emerald-400 font-space">
              {metrics.active.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Eligible for daily dispatches
          </p>
        </div>

        {/* Unsubscribed */}
        <div className="bg-white dark:bg-[#141B29] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Unsubscribed</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-700 dark:text-slate-300 font-space">
              {metrics.unsubscribed.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Opted out of daily emails
          </p>
        </div>

        {/* New Subscribers */}
        <div className="bg-white dark:bg-[#141B29] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">New This Month</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-space">
              {metrics.newThisMonth.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {metrics.newThisWeek} subscribed this week
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#141B29] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by email address or phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Status: All Subscribers</option>
              <option value="active">Status: Active Only</option>
              <option value="unsubscribed">Status: Unsubscribed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {OPPORTUNITY_CATEGORIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="email_asc">Sort: Email A–Z</option>
              <option value="email_desc">Sort: Email Z–A</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Active filters:</span>
            {searchTerm && (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-rose-500 cursor-pointer">×</button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('all')} className="hover:text-rose-500 cursor-pointer">×</button>
              </span>
            )}
            {categoryFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                Category: {categoryFilter}
                <button onClick={() => setCategoryFilter('all')} className="hover:text-rose-500 cursor-pointer">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
                setFrequencyFilter('all');
              }}
              className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer ml-auto"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#141B29] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-space">
              Subscribers Directory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Showing {subscribers.length} of {totalCount} matching records
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#006B3F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Loading daily alert subscribers...
            </p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Mail className="w-10 h-10 text-slate-400 mx-auto opacity-70" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-space">
              No Subscribers Found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No subscriber records matched your filter criteria. Try adjusting or clearing your search.'
                : 'No alert subscriptions have been submitted yet. Visitors will appear here when they enter their email on the homepage or alerts page.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-5">Email Address</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Subscription Date</th>
                  <th className="py-3.5 px-4">Alert Preferences</th>
                  <th className="py-3.5 px-4">Last Alert Sent</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4 sm:px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {subscribers.map((sub) => {
                  const isActive = sub.status === 'active' || sub.active === true;
                  return (
                    <tr
                      key={sub.id || sub.email}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Email Address */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                            {sub.email}
                          </span>
                          <button
                            onClick={() => handleCopyEmail(sub.email)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            title="Copy email to clipboard"
                          >
                            {copiedEmail === sub.email ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {sub.phone && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <Smartphone className="w-3 h-3 text-slate-400" />
                            <span>{sub.phone}</span>
                            {sub.whatsappEnabled && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">(WhatsApp)</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-[#006B3F] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-[#006B3F] dark:bg-emerald-400' : 'bg-slate-400'
                            }`}
                          />
                          <span>{isActive ? 'Active' : 'Unsubscribed'}</span>
                        </span>
                      </td>

                      {/* Subscription Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {sub.createdAt
                              ? new Date(sub.createdAt).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : 'Unknown'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono pl-5">
                          {sub.createdAt
                            ? new Date(sub.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : ''}
                        </span>
                      </td>

                      {/* Alert Preferences */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-[240px]">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase">
                              {sub.frequency || 'Daily'}
                            </span>
                            {sub.regions && sub.regions.length > 0 && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {sub.regions.join(', ')}
                              </span>
                            )}
                          </div>
                          {sub.categories && sub.categories.length > 0 ? (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                              {sub.categories.join(', ')}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic">All Categories</p>
                          )}
                        </div>
                      </td>

                      {/* Last Alert Sent */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {sub.lastAlertSentAt ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-medium">
                              <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>
                                {new Date(sub.lastAlertSentAt).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            {sub.lastAlertTitle && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                                {sub.lastAlertTitle}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Never sent yet</span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
                        <span className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                          {sub.source || 'Homepage Daily Alerts'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(sub)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                              isActive
                                ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                : 'border-emerald-200 dark:border-emerald-800 text-[#006B3F] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                            }`}
                            title={isActive ? 'Deactivate subscriber' : 'Reactivate subscriber'}
                          >
                            {isActive ? 'Unsubscribe' : 'Activate'}
                          </button>

                          <button
                            onClick={() => handleDelete(sub)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="Delete subscriber permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 px-3">
                {currentPage}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
