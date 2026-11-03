import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../services/authContext';
import { AlertSubscriptionsService } from '../../services/alertSubscriptionsService';
import { AlertSubscription, AlertSubscriberMetrics, GoogleSheetsConfig } from '../../types/database';
import { OPPORTUNITY_CATEGORIES } from '../../data/categories';
import { auth } from '../../services/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
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
  ChevronUp,
  Layers,
  Copy,
  Check,
  ShieldCheck,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  Plus,
  Sliders,
  CheckCircle,
  Unlink,
  Settings,
  Database
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
  const [sheetsExpanded, setSheetsExpanded] = useState(true);
  const [linkingModalOpen, setLinkingModalOpen] = useState(false);
  const [customTitleInput, setCustomTitleInput] = useState('Opportunity Ghana Daily Alerts');
  const [customSpreadsheetInput, setCustomSpreadsheetInput] = useState('');
  const [customSubscribersTabInput, setCustomSubscribersTabInput] = useState('Subscribers');
  const [customSentLogTabInput, setCustomSentLogTabInput] = useState('SentLog');
  const [testResult, setTestResult] = useState<any>(null);

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

    // Check URL parameters for OAuth callback feedback
    const params = new URLSearchParams(window.location.search);
    if (params.get('sheets_connected') === 'true') {
      setActionSuccess('Google Sheets connected successfully! Your subscribers are ready to sync.');
      window.history.replaceState({}, document.title, window.location.pathname);
      loadSheetsStatus();
    }
    const sheetsError = params.get('sheets_error');
    if (sheetsError) {
      setActionError(`Google Sheets Authorization: ${decodeURIComponent(sheetsError)}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      loadSheetsStatus();
    }
  }, []);

  // 1-Click Popup OAuth Authorization using Firebase Auth
  const handleGooglePopupConnect = async () => {
    setSheetsLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      if (!auth) {
        throw new Error('Authentication service is not available. Please try the standard OAuth redirect.');
      }
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.setCustomParameters({ prompt: 'consent', access_type: 'offline' });

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (!accessToken) {
        throw new Error('Could not retrieve Google authorization token from popup. Please try again or use the redirect flow.');
      }

      const res = await AlertSubscriptionsService.connectGoogleSheetsToken(
        accessToken,
        result.user?.email || undefined,
        getIdToken
      );

      if (res && res.success) {
        setActionSuccess(`Connected successfully as ${res.connectedEmail || 'Google Administrator'}!`);
        await loadSheetsStatus();
        setTimeout(() => setActionSuccess(null), 5000);
      } else {
        throw new Error(res.error || 'Failed to complete Google Sheets connection.');
      }
    } catch (err: any) {
      console.warn('[GooglePopupConnect] Popup error:', err);
      // If popup was blocked or failed, fall back to OAuth redirect
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        setActionError('Google popup was closed or blocked. Redirecting to standard Google consent page...');
        handleConnectGoogleSheets();
      } else {
        setActionError(err.message || 'Google authorization failed.');
      }
    } finally {
      setSheetsLoading(false);
    }
  };

  // Standard OAuth Redirect Flow
  const handleConnectGoogleSheets = async () => {
    setSheetsLoading(true);
    setActionError(null);
    try {
      const res = await AlertSubscriptionsService.getGoogleSheetsAuthUrl(getIdToken);
      if (res && res.success && res.authUrl) {
        window.location.href = res.authUrl;
      } else {
        setActionError(res.error || 'Google OAuth client credentials are not configured on the server.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Could not initiate Google Sheets connection');
    } finally {
      setSheetsLoading(false);
    }
  };

  // Create "Opportunity Ghana Daily Alerts" spreadsheet with Subscribers and SentLog worksheets
  const handleCreateDailyAlertsSpreadsheet = async () => {
    setSheetsLoading(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = await AlertSubscriptionsService.createGoogleSpreadsheet(
        customTitleInput || 'Opportunity Ghana Daily Alerts',
        customSubscribersTabInput || 'Subscribers',
        customSentLogTabInput || 'SentLog',
        getIdToken
      );
      if (res && res.success) {
        setActionSuccess(res.message || 'Spreadsheet created successfully with Subscribers and SentLog tabs!');
        setLinkingModalOpen(false);
        await loadSheetsStatus();
        setTimeout(() => setActionSuccess(null), 6000);
      } else {
        setActionError(res.error || 'Failed to create spreadsheet.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error creating spreadsheet.');
    } finally {
      setSheetsLoading(false);
    }
  };

  // Select / Link existing spreadsheet
  const handleSelectExistingSpreadsheet = async () => {
    if (!customSpreadsheetInput.trim()) {
      setActionError('Please provide a Google Spreadsheet ID or URL.');
      return;
    }
    setSheetsLoading(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = await AlertSubscriptionsService.selectGoogleSpreadsheet(
        customSpreadsheetInput.trim(),
        customSubscribersTabInput || 'Subscribers',
        customSentLogTabInput || 'SentLog',
        getIdToken
      );
      if (res && res.success) {
        setActionSuccess(res.message || 'Spreadsheet linked successfully!');
        setLinkingModalOpen(false);
        await loadSheetsStatus();
        setTimeout(() => setActionSuccess(null), 6000);
      } else {
        setActionError(res.error || 'Failed to connect to specified spreadsheet.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error selecting spreadsheet.');
    } finally {
      setSheetsLoading(false);
    }
  };

  // Test connection permissions and worksheets
  const handleTestConnection = async () => {
    setSheetsTesting(true);
    setTestResult(null);
    setActionError(null);
    try {
      const res = await AlertSubscriptionsService.testGoogleSheetsConnection(getIdToken);
      if (res && res.success) {
        setTestResult(res);
        setActionSuccess(`Verified! Both "${res.sheetName}" and "${res.sentLogSheetName}" worksheets are accessible.`);
        setTimeout(() => setActionSuccess(null), 5000);
      } else {
        setActionError(res.error || 'Connection test failed.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to test connection.');
    } finally {
      setSheetsTesting(false);
    }
  };

  // Synchronize CMS subscribers to Google Sheets with duplicate prevention
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

  // Disconnect Google Sheets
  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Google Sheets? Daily alerts won\'t sync to the sheet until reconnected.')) {
      return;
    }
    setSheetsLoading(true);
    try {
      const res = await AlertSubscriptionsService.disconnectGoogleSheets(getIdToken);
      if (res && res.success) {
        setActionSuccess('Google Sheets disconnected safely.');
        loadSheetsStatus();
        setTimeout(() => setActionSuccess(null), 5000);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to disconnect.');
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

      {/* =========================================================================
          GOOGLE SHEETS INTEGRATION SECTION (DAILY PERSONALIZED EMAIL ALERTS)
         ========================================================================= */}
      <div className="bg-white dark:bg-[#141B29] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm overflow-hidden transition-all">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#0F9D58" />
                <path d="M6 7H18V9H6V7Z" fill="white" />
                <path d="M6 11H18V13H6V11Z" fill="white" />
                <path d="M6 15H18V17H6V15Z" fill="white" />
                <line x1="12" y1="7" x2="12" y2="17" stroke="#0F9D58" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-space">
                  Google Sheets Integration
                </h3>
                {/* Connection Status Badge */}
                {sheetsConfig.isConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-[#006B3F] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Connected</span>
                  </span>
                ) : sheetsConfig.lastSyncStatus === 'failed' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Connection Error</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span>Disconnected</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automated subscriber synchronization & Activepieces daily alert dispatch pipeline. Single source of truth remains the Opportunity Ghana database.
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {sheetsConfig.isConnected && (
              <button
                onClick={handleSyncSubscribers}
                disabled={sheetsSyncing || sheetsLoading}
                className="px-3.5 py-2 rounded-xl bg-[#006B3F] hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                title="Synchronize subscribers to Google Sheets now"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${sheetsSyncing ? 'animate-spin' : ''}`} />
                <span>{sheetsSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            )}

            {sheetsConfig.spreadsheetUrl && (
              <a
                href={sheetsConfig.spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Open connected Google Sheet"
              >
                <ExternalLink className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
              </a>
            )}

            <button
              onClick={() => setSheetsExpanded(!sheetsExpanded)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs transition-colors cursor-pointer"
              title={sheetsExpanded ? 'Collapse panel' : 'Expand panel'}
            >
              {sheetsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {sheetsExpanded && (
          <div className="pt-4 space-y-4 animate-in fade-in duration-150">
            {/* If Disconnected: Prominent Connect Action */}
            {!sheetsConfig.isConnected ? (
              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
                    <span>Connect Google Sheets to enable automated alerts workflow</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Connecting Google Sheets creates a synchronized subscriber repository with dedicated <strong>Subscribers</strong> (10 columns) and <strong>SentLog</strong> (9 columns) worksheets for Activepieces daily personalized email dispatch.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {/* Option 1: Fast Popup Google OAuth */}
                  <button
                    onClick={handleGooglePopupConnect}
                    disabled={sheetsLoading}
                    className="px-4 py-2.5 rounded-xl bg-[#006B3F] hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <rect width="24" height="24" rx="4" fill="white" />
                      <path d="M12 5C15.87 5 18 7.5 18 7.5L15.5 10C14.5 9 13.5 8.5 12 8.5C9.5 8.5 7.5 10.5 7.5 12C7.5 13.5 9.5 15.5 12 15.5C14.5 15.5 15.5 14 15.7 13H12V10.5H18.5C18.7 11.2 18.8 11.9 18.8 12.6C18.8 16.5 15.8 19 12 19C8.1 19 5 15.9 5 12C5 8.1 8.1 5 12 5Z" fill="#006B3F" />
                    </svg>
                    <span>{sheetsLoading ? 'Connecting...' : 'Connect Google Sheets'}</span>
                  </button>

                  {/* Option 2: Standard Server Redirect Flow */}
                  <button
                    onClick={handleConnectGoogleSheets}
                    disabled={sheetsLoading}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#141B29] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    title="Authorize via standard Google OAuth redirect"
                  >
                    <span>OAuth Redirect</span>
                  </button>
                </div>
              </div>
            ) : (
              /* If Connected: Active Configuration & Diagnostics */
              <div className="space-y-4">
                {/* Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Account */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Connected Google Account
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#006B3F] dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {sheetsConfig.connectedEmail?.charAt(0).toUpperCase() || 'G'}
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={sheetsConfig.connectedEmail}>
                        {sheetsConfig.connectedEmail || 'Authorized Administrator'}
                      </span>
                    </div>
                    {sheetsConfig.connectedAt && (
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Connected on {new Date(sheetsConfig.connectedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Destination Spreadsheet */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Active Spreadsheet
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={sheetsConfig.spreadsheetName || 'Opportunity Ghana Daily Alerts'}>
                        {sheetsConfig.spreadsheetName || 'Opportunity Ghana Daily Alerts'}
                      </span>
                      {sheetsConfig.spreadsheetUrl && (
                        <a
                          href={sheetsConfig.spreadsheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-[#006B3F] dark:text-emerald-400 hover:underline flex items-center gap-0.5 shrink-0"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block font-mono truncate">
                      ID: {sheetsConfig.spreadsheetId || 'Not configured'}
                    </span>
                  </div>

                  {/* Worksheets & Synchronization */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                      Worksheets & Sync Status
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-[#006B3F] dark:text-emerald-300 font-bold text-[11px]">
                        {sheetsConfig.sheetName || 'Subscribers'}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-bold text-[11px]">
                        {sheetsConfig.sentLogSheetName || 'SentLog'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      {sheetsConfig.lastSyncAt ? (
                        <span>Last synced: {new Date(sheetsConfig.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({sheetsConfig.lastSyncCount} rows)</span>
                      ) : (
                        <span>Ready to sync</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Test Result Feedback Box */}
                {testResult && (
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{testResult.message}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      <span>Subscribers tab: {testResult.subscriberCount} rows</span>
                      <span>•</span>
                      <span>SentLog tab: {testResult.sentLogCount} rows</span>
                    </div>
                  </div>
                )}

                {/* If Sync Error: Clear Banner */}
                {sheetsConfig.lastSyncError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-800 dark:text-rose-300 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span><strong>Sync Note:</strong> {sheetsConfig.lastSyncError}</span>
                    </div>
                    <button
                      onClick={handleSyncSubscribers}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 cursor-pointer shrink-0"
                    >
                      Retry Sync
                    </button>
                  </div>
                )}

                {/* Integration Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Sync Now */}
                    <button
                      onClick={handleSyncSubscribers}
                      disabled={sheetsSyncing || sheetsLoading}
                      className="px-4 py-2 rounded-xl bg-[#006B3F] hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${sheetsSyncing ? 'animate-spin' : ''}`} />
                      <span>{sheetsSyncing ? 'Synchronizing Records...' : 'Sync Now'}</span>
                    </button>

                    {/* Test Connection */}
                    <button
                      onClick={handleTestConnection}
                      disabled={sheetsTesting || sheetsLoading}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#141B29] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle className={`w-3.5 h-3.5 text-emerald-600 ${sheetsTesting ? 'animate-spin' : ''}`} />
                      <span>{sheetsTesting ? 'Testing...' : 'Test Connection'}</span>
                    </button>

                    {/* Link / Change Spreadsheet */}
                    <button
                      onClick={() => setLinkingModalOpen(!linkingModalOpen)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#141B29] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#006B3F] dark:text-emerald-400" />
                      <span>Change Spreadsheet</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Reconnect */}
                    <button
                      onClick={handleGooglePopupConnect}
                      disabled={sheetsLoading}
                      className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Refresh Google authorization"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Reconnect</span>
                    </button>

                    {/* Disconnect */}
                    <button
                      onClick={handleDisconnect}
                      disabled={sheetsLoading}
                      className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Safely disconnect Google Sheets"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>

                {/* Inline Spreadsheet Management Form (when Change Spreadsheet clicked) */}
                {linkingModalOpen && (
                  <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-space">
                        Spreadsheet Destination Setup
                      </h5>
                      <button
                        onClick={() => setLinkingModalOpen(false)}
                        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Option A: Create New "Opportunity Ghana Daily Alerts" */}
                      <div className="p-3.5 bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          Create New Spreadsheet
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Creates a pristine Google Spreadsheet in your Google Drive with both <strong>Subscribers</strong> and <strong>SentLog</strong> tabs formatted with Ghana green headers.
                        </p>
                        <input
                          type="text"
                          value={customTitleInput}
                          onChange={(e) => setCustomTitleInput(e.target.value)}
                          placeholder="Opportunity Ghana Daily Alerts"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        />
                        <button
                          onClick={handleCreateDailyAlertsSpreadsheet}
                          disabled={sheetsLoading}
                          className="w-full py-2 rounded-lg bg-[#006B3F] hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create "Opportunity Ghana Daily Alerts"</span>
                        </button>
                      </div>

                      {/* Option B: Link Existing Google Sheet */}
                      <div className="p-3.5 bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                          Link Existing Spreadsheet
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Paste your existing Google Spreadsheet URL or Spreadsheet ID. We will ensure the <strong>Subscribers</strong> and <strong>SentLog</strong> tabs exist.
                        </p>
                        <input
                          type="text"
                          value={customSpreadsheetInput}
                          onChange={(e) => setCustomSpreadsheetInput(e.target.value)}
                          placeholder="Paste Google Sheets URL or ID..."
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={customSubscribersTabInput}
                            onChange={(e) => setCustomSubscribersTabInput(e.target.value)}
                            placeholder="Subscribers tab"
                            className="text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                            title="Subscribers worksheet title"
                          />
                          <input
                            type="text"
                            value={customSentLogTabInput}
                            onChange={(e) => setCustomSentLogTabInput(e.target.value)}
                            placeholder="SentLog tab"
                            className="text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                            title="SentLog worksheet title"
                          />
                        </div>
                        <button
                          onClick={handleSelectExistingSpreadsheet}
                          disabled={sheetsLoading || !customSpreadsheetInput.trim()}
                          className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Link This Spreadsheet</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
    </div>
  );
};
