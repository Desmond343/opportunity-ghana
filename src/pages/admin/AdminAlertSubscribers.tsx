import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../services/authContext';
import { AlertSubscriptionsService } from '../../services/alertSubscriptionsService';
import { AlertSubscription, AlertSubscriberMetrics, GoogleSheetsConfig } from '../../types/database';
import { FirebaseAuthService } from '../../services/firebase/authService';
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
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  Settings,
  Link2,
  Plus,
  Unlink,
  X
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

  // Google Sheets Integration State
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>({
    isConnected: false,
    lastSyncStatus: 'idle',
    lastSyncCount: 0
  });
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [sheetsSyncing, setSheetsSyncing] = useState(false);
  const [sheetsTesting, setSheetsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Spreadsheet Settings Modal State
  const [showSpreadsheetModal, setShowSpreadsheetModal] = useState(false);
  const [spreadsheetMode, setSpreadsheetMode] = useState<'create' | 'link'>('create');
  const [newSheetTitle, setNewSheetTitle] = useState('Opportunity Ghana - Email Subscribers');
  const [existingSheetInput, setExistingSheetInput] = useState('');
  const [existingTabName, setExistingTabName] = useState('Email Subscribers');
  const [sheetActionLoading, setSheetActionLoading] = useState(false);

  const loadSheetsStatus = async () => {
    try {
      const res = await AlertSubscriptionsService.getGoogleSheetsStatus(getIdToken);
      if (res && res.success) {
        setSheetsConfig(res);
      }
    } catch (err) {
      console.warn('[AdminAlertSubscribers] Error loading sheets status:', err);
    }
  };

  useEffect(() => {
    loadSheetsStatus();

    // Check for redirect callback params
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('sheets_connected') === 'true') {
        setActionSuccess('Google Sheets connected successfully!');
        setTimeout(() => setActionSuccess(null), 6000);
        window.history.replaceState({}, '', window.location.pathname);
      } else if (params.get('sheets_error')) {
        setActionError(`Google Sheets note: ${params.get('sheets_error')}`);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const handleConnectGoogleSheets = async () => {
    setSheetsLoading(true);
    setActionError(null);
    try {
      // 1. First attempt direct client-side popup OAuth with Google Sheets & Drive scopes
      try {
        const { accessToken, email } = await FirebaseAuthService.requestSheetsAccessToken();
        const connectRes = await AlertSubscriptionsService.connectGoogleSheetsToken(accessToken, email, getIdToken);
        if (connectRes && connectRes.success) {
          setActionSuccess('Google Sheets connected successfully!');
          await loadSheetsStatus();
          setTimeout(() => setActionSuccess(null), 5000);
          return;
        }
      } catch (popupErr: any) {
        if (popupErr?.code === 'auth/popup-closed-by-user') {
          return;
        }
        console.warn('[AdminAlertSubscribers] Popup auth note, checking fallback:', popupErr);
        // Fall back to server auth-url if available
        const res = await AlertSubscriptionsService.getGoogleSheetsAuthUrl(getIdToken);
        if (res && res.success && res.authUrl) {
          window.location.href = res.authUrl;
          return;
        }
        throw popupErr;
      }
    } catch (err: any) {
      setActionError(err.message || 'Could not connect Google Sheets');
    } finally {
      setSheetsLoading(false);
    }
  };

  const handleSyncSubscribers = async () => {
    setSheetsSyncing(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = await AlertSubscriptionsService.syncGoogleSheets(getIdToken);
      if (res && res.success) {
        setActionSuccess(res.message || 'Subscribers successfully synced to Google Sheets!');
        loadSheetsStatus();
        setTimeout(() => setActionSuccess(null), 6000);
      } else {
        setActionError(res.error || 'Failed to sync with Google Sheets');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error syncing with Google Sheets');
    } finally {
      setSheetsSyncing(false);
    }
  };

  const handleTestConnection = async () => {
    setSheetsTesting(true);
    setTestResult(null);
    setActionError(null);
    try {
      const res = await AlertSubscriptionsService.testGoogleSheetsConnection(getIdToken);
      if (res && res.success) {
        setTestResult({
          success: true,
          message: res.message || `Verified read & write access on "${res.spreadsheetTitle}" (tab: "${res.sheetName}").`
        });
        setTimeout(() => setTestResult(null), 7000);
      } else {
        setTestResult({
          success: false,
          message: res.error || 'Connection test failed. Check spreadsheet sharing permissions.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to verify spreadsheet permissions.'
      });
    } finally {
      setSheetsTesting(false);
    }
  };

  const handleCreateSpreadsheet = async () => {
    if (!newSheetTitle.trim()) return;
    setSheetActionLoading(true);
    setActionError(null);
    try {
      const res = await AlertSubscriptionsService.createGoogleSpreadsheet(newSheetTitle.trim(), getIdToken);
      if (res && res.success) {
        setActionSuccess(res.message || 'Spreadsheet created successfully!');
        setShowSpreadsheetModal(false);
        await loadSheetsStatus();
        setTimeout(() => setActionSuccess(null), 5000);
      } else {
        setActionError(res.error || 'Failed to create spreadsheet');
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to create spreadsheet');
    } finally {
      setSheetActionLoading(false);
    }
  };

  const handleLinkSpreadsheet = async () => {
    if (!existingSheetInput.trim()) return;
    setSheetActionLoading(true);
    setActionError(null);
    try {
      const res = await AlertSubscriptionsService.selectGoogleSpreadsheet(
        existingSheetInput.trim(),
        existingTabName.trim() || undefined,
        getIdToken
      );
      if (res && res.success) {
        setActionSuccess(res.message || 'Spreadsheet linked successfully!');
        setShowSpreadsheetModal(false);
        await loadSheetsStatus();
        setTimeout(() => setActionSuccess(null), 5000);
      } else {
        setActionError(res.error || 'Could not link spreadsheet. Verify URL/ID and sharing permissions.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Could not link spreadsheet');
    } finally {
      setSheetActionLoading(false);
    }
  };

  const handleDisconnectGoogleSheets = async () => {
    if (!window.confirm('Are you sure you want to disconnect Google Sheets? Daily alert subscriber synchronization will be paused until reconnected.')) {
      return;
    }
    setSheetsLoading(true);
    setActionError(null);
    try {
      const res = await AlertSubscriptionsService.disconnectGoogleSheets(getIdToken);
      if (res && res.success) {
        setActionSuccess('Google Sheets disconnected safely.');
        await loadSheetsStatus();
        setTimeout(() => setActionSuccess(null), 4000);
      } else {
        setActionError(res.error || 'Failed to disconnect');
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to disconnect Google Sheets');
    } finally {
      setSheetsLoading(false);
    }
  };

  // Fetch subscribers from server & database
  const loadSubscribers = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);
    setActionError(null);

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
      } else if (res && (res as any).error) {
        setActionError((res as any).error);
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
            Email Subscribers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage all verified visitors who subscribed to opportunity alerts. View preferences, dispatch digests, synchronize with Google Sheets, and export records to Microsoft Excel or CSV.
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

          {/* Connect Google Sheets / Sync Button (Prominent in Export Controls) */}
          {!sheetsConfig.isConnected ? (
            <button
              onClick={handleConnectGoogleSheets}
              disabled={sheetsLoading}
              className="px-3.5 py-2.5 rounded-xl bg-[#0F9D58] hover:bg-[#0B8043] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              title="Connect Google Sheets to organize subscriber data"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#0F9D58" />
                <path d="M6 7H18V9H6V7Z" fill="white" />
                <path d="M6 11H18V13H6V11Z" fill="white" />
                <path d="M6 15H18V17H6V15Z" fill="white" />
                <line x1="12" y1="7" x2="12" y2="17" stroke="#0F9D58" strokeWidth="1.5" />
              </svg>
              <span>{sheetsLoading ? 'Connecting...' : 'Connect Google Sheets'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSyncSubscribers}
                disabled={sheetsSyncing || sheetsLoading}
                className="px-3.5 py-2.5 rounded-xl bg-[#0F9D58] hover:bg-[#0B8043] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Synchronize subscribers with connected Google Sheet"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${sheetsSyncing ? 'animate-spin' : ''}`} />
                <span>{sheetsSyncing ? 'Syncing...' : 'Sync Google Sheets'}</span>
              </button>
              {sheetsConfig.spreadsheetUrl && (
                <a
                  href={sheetsConfig.spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141B29] text-emerald-700 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Open connected Google Sheet"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
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

      {/* Google Sheets Integration Card */}
      <div className="bg-white dark:bg-[#141B29] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F9D58]/10 text-[#0F9D58] flex items-center justify-center shrink-0 border border-[#0F9D58]/20">
              <FileSpreadsheet className="w-5 h-5 text-[#0F9D58]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-space">
                  Google Sheets Integration
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Activepieces Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time subscriber mirror for your daily personalized email automation. Firebase Firestore remains the primary database.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {sheetsConfig.isConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-[#006B3F] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-[#006B3F] dark:bg-emerald-400 animate-pulse" />
                <span>Connected</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Not Connected</span>
              </span>
            )}
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* If Connected: Details and Actions */}
        {sheetsConfig.isConnected ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Account */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                  Connected Google Account
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-1" title={sheetsConfig.connectedEmail}>
                  {sheetsConfig.connectedEmail || 'Google Administrator'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  OAuth 2.0 Authenticated
                </span>
              </div>

              {/* Target Spreadsheet */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                  Target Spreadsheet
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-1" title={sheetsConfig.spreadsheetName}>
                  {sheetsConfig.spreadsheetName || 'Opportunity Ghana - Email Subscribers'}
                </span>
                {sheetsConfig.spreadsheetUrl ? (
                  <a
                    href={sheetsConfig.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-[#006B3F] dark:text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    <span>Open in Google Sheets</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-400 block mt-0.5">ID: {sheetsConfig.spreadsheetId?.slice(0, 10)}...</span>
                )}
              </div>

              {/* Sheet Tab */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                  Worksheet Tab
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-1">
                  {sheetsConfig.sheetName || 'Email Subscribers'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium">
                  20 columns formatted
                </span>
              </div>

              {/* Synchronization Status */}
              <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                  Sync Status
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Auto-Sync Active
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {sheetsConfig.lastSyncAt
                    ? `Last synced: ${new Date(sheetsConfig.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${sheetsConfig.lastSyncCount || 0} rows)`
                    : 'Awaiting initial sync'}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSyncSubscribers}
                  disabled={sheetsSyncing || sheetsLoading}
                  className="px-4 py-2 rounded-xl bg-[#0F9D58] hover:bg-[#0B8043] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  title="Run full sync between Firestore and Google Sheets"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${sheetsSyncing ? 'animate-spin' : ''}`} />
                  <span>{sheetsSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>

                <button
                  onClick={handleTestConnection}
                  disabled={sheetsTesting || sheetsLoading}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#141B29] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  title="Test read and edit permissions on destination spreadsheet"
                >
                  <ShieldCheck className={`w-3.5 h-3.5 text-emerald-600 ${sheetsTesting ? 'animate-pulse' : ''}`} />
                  <span>{sheetsTesting ? 'Testing...' : 'Test Permissions'}</span>
                </button>

                <button
                  onClick={() => setShowSpreadsheetModal(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#141B29] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Create or select a different spreadsheet or tab"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>Spreadsheet Settings</span>
                </button>
              </div>

              <button
                onClick={handleDisconnectGoogleSheets}
                disabled={sheetsLoading}
                className="px-3 py-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Disconnect Google Sheets safely"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="space-y-1 max-w-xl">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Connect your Google Account to enable automated Sheets synchronization
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Whenever someone subscribes or changes preferences, Opportunity Ghana will automatically update the designated Google Sheet for your Activepieces email triggers.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> Automatic sync on new subscriptions</span>
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> In-place deduplication</span>
                <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" /> Activepieces compatible</span>
              </div>
            </div>

            <button
              onClick={handleConnectGoogleSheets}
              disabled={sheetsLoading}
              className="px-4 py-2.5 rounded-xl bg-[#0F9D58] hover:bg-[#0B8043] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#0F9D58" />
                <path d="M6 7H18V9H6V7Z" fill="white" />
                <path d="M6 11H18V13H6V11Z" fill="white" />
                <path d="M6 15H18V17H6V15Z" fill="white" />
                <line x1="12" y1="7" x2="12" y2="17" stroke="#0F9D58" strokeWidth="1.5" />
              </svg>
              <span>{sheetsLoading ? 'Connecting...' : 'Connect Google Sheets'}</span>
            </button>
          </div>
        )}
      </div>

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

            {/* Quick Sheets Sync/Connect in Table Filter Bar */}
            {!sheetsConfig.isConnected ? (
              <button
                onClick={handleConnectGoogleSheets}
                disabled={sheetsLoading}
                className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-[#006B3F] dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                title="Connect Google Sheets"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#0F9D58]" />
                <span>Connect Sheets</span>
              </button>
            ) : (
              <button
                onClick={handleSyncSubscribers}
                disabled={sheetsSyncing || sheetsLoading}
                className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-[#006B3F] dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                title="Sync Subscribers to Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#0F9D58] ${sheetsSyncing ? 'animate-spin' : ''}`} />
                <span>{sheetsSyncing ? 'Syncing...' : 'Sync to Sheets'}</span>
              </button>
            )}
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

      {/* Spreadsheet Settings Modal */}
      {showSpreadsheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#0F9D58]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-space">
                  Spreadsheet Settings
                </h3>
              </div>
              <button
                onClick={() => setShowSpreadsheetModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1">
              <button
                onClick={() => setSpreadsheetMode('create')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  spreadsheetMode === 'create'
                    ? 'bg-white dark:bg-[#141B29] text-[#006B3F] dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Create New Spreadsheet
              </button>
              <button
                onClick={() => setSpreadsheetMode('link')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  spreadsheetMode === 'link'
                    ? 'bg-white dark:bg-[#141B29] text-[#006B3F] dark:text-emerald-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Link Existing Spreadsheet
              </button>
            </div>

            {spreadsheetMode === 'create' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Spreadsheet Title
                  </label>
                  <input
                    type="text"
                    value={newSheetTitle}
                    onChange={(e) => setNewSheetTitle(e.target.value)}
                    placeholder="Opportunity Ghana - Email Subscribers"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Will create a formatted spreadsheet in your Google Drive with Ghanaian flag headers and 20 categorized alert preference columns.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setShowSpreadsheetModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSpreadsheet}
                    disabled={sheetActionLoading || !newSheetTitle.trim()}
                    className="px-4 py-2 rounded-xl bg-[#006B3F] hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{sheetActionLoading ? 'Creating...' : 'Create Spreadsheet'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Google Spreadsheet URL or ID
                  </label>
                  <input
                    type="text"
                    value={existingSheetInput}
                    onChange={(e) => setExistingSheetInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/... or spreadsheet ID"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Worksheet Tab Name
                  </label>
                  <input
                    type="text"
                    value={existingTabName}
                    onChange={(e) => setExistingTabName(e.target.value)}
                    placeholder="Email Subscribers"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter the sheet tab name (e.g. "Email Subscribers" or "Sheet1") where subscribers should be synced.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setShowSpreadsheetModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLinkSpreadsheet}
                    disabled={sheetActionLoading || !existingSheetInput.trim()}
                    className="px-4 py-2 rounded-xl bg-[#006B3F] hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>{sheetActionLoading ? 'Linking...' : 'Link Spreadsheet'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
