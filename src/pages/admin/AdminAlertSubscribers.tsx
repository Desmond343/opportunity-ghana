import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { auth } from '../../services/firebase/authService';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { AlertSubscriptionsService } from '../../services/alertSubscriptionsService';
import { AlertSubscription, AlertSubscriberMetrics, GoogleSheetsConfig } from '../../types/database';
import { OPPORTUNITY_CATEGORIES, GHANA_REGIONS } from '../../data/categories';
import {
  Mail,
  Users,
  Search,
  RotateCw,
  Send,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  ShieldCheck,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  Plus,
  Key,
  Unlink,
  Eye,
  X,
  FileText,
  MapPin,
  Sliders,
  CheckSquare,
  Square
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

  // Inspect subscriber details modal
  const [inspectSubscriber, setInspectSubscriber] = useState<AlertSubscription | null>(null);

  // Google Sheets Integration State
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>({
    isConnected: false,
    sheetName: 'Email Subscribers'
  });
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [sheetsSyncing, setSheetsSyncing] = useState(false);
  const [showSheetsConfigModal, setShowSheetsConfigModal] = useState(false);
  const [showSelectSpreadsheetModal, setShowSelectSpreadsheetModal] = useState(false);
  const [customClientId, setCustomClientId] = useState('');
  const [customClientSecret, setCustomClientSecret] = useState('');
  const [inputSpreadsheetId, setInputSpreadsheetId] = useState('');
  const [inputSheetName, setInputSheetName] = useState('Email Subscribers');
  const [redirectUriDisplay, setRedirectUriDisplay] = useState('');

  // Check URL parameters for OAuth return flags
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('sheets_connected') === 'true') {
        setActionSuccess('Google Sheets connected successfully! You can now select or synchronize your spreadsheet.');
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
      const err = params.get('sheets_error');
      if (err) {
        setActionError(`Google authorization failed: ${decodeURIComponent(err)}`);
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {}
  }, []);

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

  // Fetch Google Sheets integration status
  const loadSheetsStatus = async () => {
    setSheetsLoading(true);
    try {
      const res = await AlertSubscriptionsService.getGoogleSheetsStatus(getIdToken);
      if (res && res.success) {
        setSheetsConfig({
          isConnected: res.isConnected,
          connectedEmail: res.connectedEmail,
          connectedAt: res.connectedAt,
          spreadsheetId: res.spreadsheetId,
          spreadsheetName: res.spreadsheetName,
          sheetName: res.sheetName || 'Email Subscribers',
          spreadsheetUrl: res.spreadsheetUrl,
          lastSyncAt: res.lastSyncAt,
          lastSyncCount: res.lastSyncCount,
          lastSyncStatus: res.lastSyncStatus,
          lastSyncError: res.lastSyncError,
          hasCredentials: res.hasCredentials,
          clientIdConfigured: res.clientIdConfigured
        });
        if (res.redirectUri) {
          setRedirectUriDisplay(res.redirectUri);
        }
      }
    } catch (err: any) {
      console.warn('Could not load Google Sheets status:', err.message);
    } finally {
      setSheetsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, [searchTerm, statusFilter, categoryFilter, frequencyFilter, sortBy, currentPage]);

  useEffect(() => {
    loadSheetsStatus();
  }, []);

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
        if (inspectSubscriber && inspectSubscriber.id === subscriber.id) {
          setInspectSubscriber({
            ...inspectSubscriber,
            status: nextStatus,
            active: nextStatus === 'active',
            unsubscribedAt: nextStatus === 'unsubscribed' ? new Date().toISOString() : null
          });
        }
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
        if (inspectSubscriber && inspectSubscriber.id === subscriber.id) {
          setInspectSubscriber(null);
        }
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

  // Export to Excel or CSV
  const handleExport = async (format: 'xlsx' | 'csv', scope: 'all' | 'filtered') => {
    setExportDropdownOpen(false);
    try {
      let exportList: AlertSubscription[] = [];

      if (scope === 'all') {
        const allRes = await AlertSubscriptionsService.getAdminSubscribers(
          { limit: 10000, page: 1, sortBy },
          getIdToken
        );
        exportList = allRes.subscribers || [];
      } else {
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

      const auditUser = {
        email: currentUser?.email || 'admin@opportunityghana.com',
        name: currentUser?.name || 'Administrator'
      };

      const filenamePrefix = scope === 'all'
        ? 'opportunity-ghana-email-subscribers-all'
        : 'opportunity-ghana-email-subscribers-filtered';

      let filename = '';
      if (format === 'csv') {
        filename = AlertSubscriptionsService.exportToCsv(exportList, filenamePrefix, auditUser, scope, getIdToken);
      } else {
        filename = AlertSubscriptionsService.exportToExcel(exportList, filenamePrefix, auditUser, scope, getIdToken);
      }

      setActionSuccess(`Successfully exported ${exportList.length} subscriber rows to ${filename}!`);
      setTimeout(() => setActionSuccess(null), 5000);
    } catch (err: any) {
      console.error('Export error:', err);
      setActionError(`Failed to generate ${format.toUpperCase()} export file.`);
    }
  };

  // Direct Google Popup Authorization (Firebase Google Provider with Sheets Scopes)
  const handleDirectGooglePopup = async () => {
    if (!auth) {
      setShowSheetsConfigModal(true);
      return;
    }
    setSheetsLoading(true);
    setActionError(null);
    try {
      const sheetsProvider = new GoogleAuthProvider();
      sheetsProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
      sheetsProvider.addScope('https://www.googleapis.com/auth/drive.file');
      sheetsProvider.setCustomParameters({ prompt: 'consent select_account' });

      const result = await signInWithPopup(auth, sheetsProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (!accessToken) {
        throw new Error('Google authorization completed, but no access token was returned.');
      }

      const res = await AlertSubscriptionsService.connectGoogleSheetsToken(
        accessToken,
        result.user.email || undefined,
        getIdToken
      );

      if (res && res.success) {
        setActionSuccess('Google Sheets connected successfully! You can now select or create a destination spreadsheet.');
        setShowSheetsConfigModal(false);
        await loadSheetsStatus();
      } else {
        setActionError(res?.error || 'Failed to register Google Sheets token.');
      }
    } catch (err: any) {
      console.warn('Google popup connection:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setActionError('Google connection popup was closed before completion.');
      } else {
        setActionError(err.message || 'Google authorization failed.');
        setShowSheetsConfigModal(true);
      }
    } finally {
      setSheetsLoading(false);
    }
  };

  const handleConnectGoogleSheets = async () => {
    setActionError(null);
    try {
      const res = await AlertSubscriptionsService.getGoogleSheetsAuthUrl(getIdToken);
      if (res.success && res.authUrl) {
        // Redirect to Google's official OAuth 2.0 authorization screen
        window.location.href = res.authUrl;
        return;
      }
      
      // If server does not have OAuth credentials preconfigured, use Google popup with Sheets scope
      if (auth) {
        await handleDirectGooglePopup();
        return;
      }

      setShowSheetsConfigModal(true);
    } catch (err: any) {
      if (auth) {
        await handleDirectGooglePopup();
        return;
      }
      setActionError(err.message || 'Could not connect to Google Sheets');
      setShowSheetsConfigModal(true);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customClientId.trim() || !customClientSecret.trim()) {
      alert('Please enter both Google Client ID and Client Secret.');
      return;
    }

    try {
      const res = await AlertSubscriptionsService.saveGoogleSheetsCredentials(
        customClientId.trim(),
        customClientSecret.trim(),
        getIdToken
      );
      if (res.success) {
        setShowSheetsConfigModal(false);
        setActionSuccess('Google OAuth credentials saved. Starting authorization...');
        // Now trigger authorization
        const authRes = await AlertSubscriptionsService.getGoogleSheetsAuthUrl(getIdToken);
        if (authRes.success && authRes.authUrl) {
          window.location.href = authRes.authUrl;
        } else {
          loadSheetsStatus();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save Google credentials');
    }
  };

  const handleCreateSpreadsheet = async () => {
    setSheetsLoading(true);
    setActionError(null);
    try {
      const res = await AlertSubscriptionsService.createGoogleSpreadsheet(
        'Opportunity Ghana - Email Subscribers',
        getIdToken
      );
      if (res.success) {
        setActionSuccess(`Spreadsheet created: "${res.spreadsheetName}". You can now sync subscriber records.`);
        loadSheetsStatus();
      } else {
        setActionError(res.error || 'Failed to create Google Spreadsheet');
      }
    } catch (err: any) {
      setActionError(err.message || 'Could not create spreadsheet');
    } finally {
      setSheetsLoading(false);
    }
  };

  const handleSelectSpreadsheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSpreadsheetId.trim()) {
      alert('Please enter a Google Spreadsheet ID or URL.');
      return;
    }

    setSheetsLoading(true);
    setActionError(null);
    try {
      const res = await AlertSubscriptionsService.selectGoogleSpreadsheet(
        inputSpreadsheetId.trim(),
        inputSheetName.trim() || 'Email Subscribers',
        getIdToken
      );
      if (res.success) {
        setShowSelectSpreadsheetModal(false);
        setActionSuccess(`Connected to spreadsheet "${res.spreadsheetName}".`);
        loadSheetsStatus();
      } else {
        setActionError(res.error || 'Could not access spreadsheet');
      }
    } catch (err: any) {
      setActionError(err.message || 'Could not connect spreadsheet');
    } finally {
      setSheetsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setSheetsLoading(true);
    setActionError(null);
    try {
      const res = await AlertSubscriptionsService.testGoogleSheetsConnection(getIdToken);
      if (res.success) {
        setActionSuccess(res.message || 'Google Sheets connection verified and operational.');
        setTimeout(() => setActionSuccess(null), 6000);
      } else {
        setActionError(res.error || 'Connection test failed');
      }
    } catch (err: any) {
      setActionError(err.message || 'Connection test failed');
    } finally {
      setSheetsLoading(false);
    }
  };

  const handleSyncSubscribers = async () => {
    setSheetsSyncing(true);
    setActionError(null);
    try {
      const res = await AlertSubscriptionsService.syncGoogleSheets(getIdToken);
      if (res.success) {
        setActionSuccess(
          res.message || `Successfully synchronized ${res.totalSubscribers} subscribers (${res.addedCount} added, ${res.updatedCount} updated in-place).`
        );
        loadSheetsStatus();
      } else {
        setActionError(res.error || 'Spreadsheet synchronization failed');
      }
    } catch (err: any) {
      setActionError(err.message || 'Spreadsheet sync failed');
    } finally {
      setSheetsSyncing(false);
    }
  };

  const handleDisconnectGoogleSheets = async () => {
    if (!window.confirm('Disconnect Google Sheets from Opportunity Ghana? Current spreadsheet data will remain in your Google Drive.')) {
      return;
    }

    setSheetsLoading(true);
    try {
      const res = await AlertSubscriptionsService.disconnectGoogleSheets(getIdToken);
      if (res.success) {
        setActionSuccess('Google Sheets disconnected successfully.');
        loadSheetsStatus();
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to disconnect');
    } finally {
      setSheetsLoading(false);
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
              Audience & Subscriber Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-space">
            Email Subscribers & Google Sheets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage verified email subscriptions, monitor opportunity category preferences, dispatch curated opportunity alerts, and synchronize records with Google Sheets.
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
            <span>{dispatching ? 'Queuing Dispatch...' : `Dispatch Digest (${metrics.active})`}</span>
          </button>

          {/* Export Dropdown (Excel + CSV) */}
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {exportDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setExportDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Microsoft Excel (.xlsx)
                  </div>
                  <button
                    onClick={() => handleExport('xlsx', 'all')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-[#006B3F] dark:hover:text-emerald-300 rounded-xl flex items-center justify-between cursor-pointer"
                  >
                    <span>Excel — All ({metrics.total})</span>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  </button>

                  <button
                    onClick={() => handleExport('xlsx', 'filtered')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-[#006B3F] dark:hover:text-emerald-300 rounded-xl flex items-center justify-between cursor-pointer"
                  >
                    <span>Excel — Filtered ({totalCount})</span>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Comma-Separated Values (.csv)
                  </div>
                  <button
                    onClick={() => handleExport('csv', 'all')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-[#006B3F] dark:hover:text-emerald-300 rounded-xl flex items-center justify-between cursor-pointer"
                  >
                    <span>CSV — All ({metrics.total})</span>
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                  </button>

                  <button
                    onClick={() => handleExport('csv', 'filtered')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-[#006B3F] dark:hover:text-emerald-300 rounded-xl flex items-center justify-between cursor-pointer"
                  >
                    <span>CSV — Filtered ({totalCount})</span>
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-2.5 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 dark:text-emerald-400 hover:opacity-75 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center justify-between gap-2.5 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-rose-700 dark:text-rose-400 hover:opacity-75 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
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
            Registered subscriber records
          </p>
        </div>

        {/* Active Subscribers */}
        <div className="bg-white dark:bg-[#141B29] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Subscribers</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#006B3F] dark:text-emerald-400 font-space">
              {metrics.active.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Receiving daily/weekly alerts
          </p>
        </div>

        {/* Unsubscribed */}
        <div className="bg-white dark:bg-[#141B29] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Unsubscribed</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-space">
              {metrics.unsubscribed.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Opted out of email digests
          </p>
        </div>

        {/* Growth */}
        <div className="bg-white dark:bg-[#141B29] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Recent Growth</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-space">
              +{metrics.newThisMonth.toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {metrics.newThisWeek} subscribed this week
          </p>
        </div>
      </div>

      {/* =========================================================================
          GOOGLE SHEETS INTEGRATION PANEL
         ========================================================================= */}
      <div className="bg-white dark:bg-[#141B29] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Google Sheets Icon */}
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shrink-0 shadow-2xs">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="5" fill="#0F9D58" />
                <path d="M6 7H18V9H6V7Z" fill="white" />
                <path d="M6 11H18V13H6V11Z" fill="white" />
                <path d="M6 15H18V17H6V15Z" fill="white" />
                <line x1="12" y1="7" x2="12" y2="17" stroke="#0F9D58" strokeWidth="1.5" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-space">
                  Google Sheets Integration
                </h3>
                {sheetsConfig.isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-[#006B3F] dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Google Sheets: Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Google Sheets: Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Synchronize subscriber email addresses, opportunity preferences, and subscription status into an organized Google spreadsheet.
              </p>
            </div>
          </div>

          {/* Connect / Disconnect Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!sheetsConfig.isConnected ? (
              <>
                <button
                  onClick={handleConnectGoogleSheets}
                  disabled={sheetsLoading}
                  className="px-4 py-2.5 rounded-xl bg-[#0F9D58] hover:bg-[#0B8043] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path d="M6 7H18V9H6V7Z" fill="white" />
                    <path d="M6 11H18V13H6V11Z" fill="white" />
                    <path d="M6 15H18V17H6V15Z" fill="white" />
                  </svg>
                  <span>Connect Google Sheets</span>
                </button>

                <button
                  onClick={() => setShowSheetsConfigModal(true)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                  title="Configure Google OAuth Credentials"
                >
                  <Key className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSyncSubscribers}
                  disabled={sheetsSyncing || sheetsLoading}
                  className="px-4 py-2.5 rounded-xl bg-[#006B3F] hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${sheetsSyncing ? 'animate-spin' : ''}`} />
                  <span>{sheetsSyncing ? 'Synchronizing...' : 'Sync Subscribers'}</span>
                </button>

                <button
                  onClick={handleTestConnection}
                  disabled={sheetsLoading || sheetsSyncing}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Test Connection</span>
                </button>

                <button
                  onClick={handleDisconnectGoogleSheets}
                  disabled={sheetsLoading}
                  className="px-3 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Disconnect Google account"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Disconnect</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Connected Details Grid */}
        {sheetsConfig.isConnected ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {/* Account Info */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Connected Google Account</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {sheetsConfig.connectedEmail || 'Authorized Administrator'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Connected on {sheetsConfig.connectedAt ? new Date(sheetsConfig.connectedAt).toLocaleDateString('en-GB') : 'Active session'}
              </p>
            </div>

            {/* Destination Spreadsheet */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Destination Spreadsheet</span>
                {sheetsConfig.spreadsheetUrl && (
                  <a
                    href={sheetsConfig.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Open Sheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {sheetsConfig.spreadsheetName || 'No spreadsheet selected'}
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={() => setShowSelectSpreadsheetModal(true)}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Select / Change
                </button>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <button
                  onClick={handleCreateSpreadsheet}
                  disabled={sheetsLoading}
                  className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Create New
                </button>
              </div>
            </div>

            {/* Sync Status */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Last Synchronization</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {sheetsConfig.lastSyncAt ? new Date(sheetsConfig.lastSyncAt).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Never synced yet'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {sheetsConfig.lastSyncCount ? `${sheetsConfig.lastSyncCount} rows organized in sheet` : 'Ready to synchronize records'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Need to keep an external Google Spreadsheet in sync with Opportunity Ghana subscribers?
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Click "Connect Google Sheets" above to authorize. Once connected, you can create a spreadsheet or link an existing one to automatically organize subscribers by category and region.
              </p>
            </div>
            <button
              onClick={() => setShowSheetsConfigModal(true)}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 cursor-pointer flex items-center gap-1"
            >
              <Key className="w-3.5 h-3.5" />
              <span>OAuth Settings & Guide</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          SUBSCRIBER TABLE & SEARCH/FILTER CONTROLS
         ========================================================================= */}
      <div className="bg-white dark:bg-[#141B29] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row gap-3 lg:items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by email address or source..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">Status: All Records</option>
              <option value="active">Status: Active</option>
              <option value="unsubscribed">Status: Unsubscribed</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none max-w-[170px]"
            >
              <option value="all">Category: All</option>
              {OPPORTUNITY_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="email_asc">Sort: Email (A to Z)</option>
              <option value="email_desc">Sort: Email (Z to A)</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">
            <RotateCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
            Loading email subscribers...
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
                : 'No alert subscriptions have been submitted yet. Visitors will appear here when they subscribe on the website.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-5">Email Address</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Opportunity Preferences</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Subscription Date</th>
                  <th className="py-3.5 px-4 sm:px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {subscribers.map((sub) => {
                  const isActive = sub.status === 'active' || sub.active === true;
                  const categories = Array.isArray(sub.categories) ? sub.categories : [];
                  const regions = Array.isArray(sub.regions) ? sub.regions : ['All Ghana'];

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
                        <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                          ID: {sub.id?.slice(0, 16)}...
                        </span>
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

                      {/* Opportunity Preferences */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-[260px]">
                          <div className="flex flex-wrap gap-1">
                            {categories.slice(0, 3).map((cat) => (
                              <span
                                key={cat}
                                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium"
                              >
                                {cat}
                              </span>
                            ))}
                            {categories.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                                +{categories.length - 3}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            Frequency: {(sub.frequency || 'Daily').toUpperCase()}
                          </span>
                        </div>
                      </td>

                      {/* Location Preferences */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{regions.join(', ')}</span>
                        </div>
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
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect details button */}
                          <button
                            onClick={() => setInspectSubscriber(sub)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Inspect subscriber details & preferences"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Toggle Active / Unsubscribed */}
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

                          {/* Delete permanently */}
                          <button
                            onClick={() => handleDelete(sub)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
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
              Page {currentPage} of {totalPages} ({totalCount} total)
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

      {/* =========================================================================
          SUBSCRIBER DETAILS INSPECT MODAL
         ========================================================================= */}
      {inspectSubscriber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[11px] font-bold text-[#006B3F] dark:text-emerald-400 uppercase tracking-wider">
                  Subscriber Profile & Preferences
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-space mt-0.5">
                  {inspectSubscriber.email}
                </h3>
              </div>
              <button
                onClick={() => setInspectSubscriber(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Status and Consent Overview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Subscription Status</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5 capitalize">
                    {inspectSubscriber.status || 'Active'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Consent Captured</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {inspectSubscriber.consentGiven ?? true ? 'Yes (Verified Opt-in)' : 'Standard registration'}
                  </p>
                </div>
              </div>

              {/* Target Categories */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  Selected Opportunity Categories ({inspectSubscriber.categories?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectSubscriber.categories && inspectSubscriber.categories.length > 0 ? (
                    inspectSubscriber.categories.map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold"
                      >
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">All Categories</span>
                  )}
                </div>
              </div>

              {/* Location Preferences */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  Location Preferences
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {inspectSubscriber.regions && inspectSubscriber.regions.length > 0
                    ? inspectSubscriber.regions.join(', ')
                    : 'All Ghana'}
                </p>
              </div>

              {/* Metadata Details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subscriber ID:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{inspectSubscriber.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dispatch Frequency:</span>
                  <span className="font-semibold capitalize">{inspectSubscriber.frequency || 'Daily'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Subscription Source:</span>
                  <span>{inspectSubscriber.source || 'Website'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date Subscribed:</span>
                  <span>{inspectSubscriber.createdAt ? new Date(inspectSubscriber.createdAt).toLocaleString('en-GB') : 'Unknown'}</span>
                </div>
                {inspectSubscriber.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Preferences Update:</span>
                    <span>{new Date(inspectSubscriber.updatedAt).toLocaleString('en-GB')}</span>
                  </div>
                )}
                {inspectSubscriber.unsubscribedAt && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400">
                    <span>Unsubscribed Date:</span>
                    <span>{new Date(inspectSubscriber.unsubscribedAt).toLocaleString('en-GB')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Alerts Received:</span>
                  <span className="font-bold">{inspectSubscriber.alertsCount || 0}</span>
                </div>
                {inspectSubscriber.lastAlertTitle && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Opportunity Dispatched:</span>
                    <span className="truncate max-w-[220px] font-medium">{inspectSubscriber.lastAlertTitle}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleToggleStatus(inspectSubscriber)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                {inspectSubscriber.status === 'active' || inspectSubscriber.active ? 'Unsubscribe User' : 'Reactivate User'}
              </button>

              <button
                onClick={() => setInspectSubscriber(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          GOOGLE SHEETS OAUTH CREDENTIALS SETUP MODAL
         ========================================================================= */}
      {showSheetsConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-400 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-space">
                    Google OAuth Setup
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Configure Google Cloud Console OAuth 2.0 Credentials
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSheetsConfigModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Connect with Google Button */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 text-center space-y-2.5">
              <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                Instant Connect with your Google Account
              </p>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                Grant Opportunity Ghana direct permission to create and organize your subscribers spreadsheet in Google Sheets.
              </p>
              <button
                type="button"
                onClick={handleDirectGooglePopup}
                disabled={sheetsLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#006B3F] hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9c-.2-.7-.4-1.5-.4-2.4z"/>
                  <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
                </svg>
                <span>Authorize with Google Account (Popup)</span>
              </button>
            </div>

            <div className="flex items-center gap-2 my-1">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">or Server OAuth Configuration</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Instruction Box */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-white">
                Step-by-Step Google Cloud Configuration:
              </p>
              <ol className="list-decimal pl-4 space-y-1 text-[11px] leading-relaxed">
                <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 underline font-bold">Google Cloud Console &gt; Credentials</a>.</li>
                <li>Create an <strong>OAuth 2.0 Client ID</strong> (Application type: <strong>Web application</strong>).</li>
                <li>
                  Add this exact <strong>Authorized redirect URI</strong>:
                  <div className="mt-1 p-2 rounded-lg bg-slate-900 text-emerald-300 font-mono text-[10px] select-all break-all">
                    {redirectUriDisplay || 'https://opportunityghana.site/api/admin/google-sheets/callback'}
                  </div>
                </li>
                <li>Enable the <strong>Google Sheets API</strong> and <strong>Google Drive API</strong> in your Cloud Project.</li>
                <li>Paste the Client ID and Client Secret below, or add them to your environment variables (<code className="text-emerald-600 font-bold">GOOGLE_CLIENT_ID</code>, <code className="text-emerald-600 font-bold">GOOGLE_CLIENT_SECRET</code>).</li>
              </ol>
            </div>

            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google Client ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                  value={customClientId}
                  onChange={(e) => setCustomClientId(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google Client Secret
                </label>
                <input
                  type="password"
                  required
                  placeholder="GOCSPX-..."
                  value={customClientSecret}
                  onChange={(e) => setCustomClientSecret(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSheetsConfigModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#006B3F] hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Save & Connect Google
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SELECT DESTINATION SPREADSHEET MODAL
         ========================================================================= */}
      {showSelectSpreadsheetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-space">
                  Select Google Spreadsheet
                </h3>
              </div>
              <button
                onClick={() => setShowSelectSpreadsheetModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSelectSpreadsheet} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Spreadsheet URL or ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://docs.google.com/spreadsheets/d/... or ID"
                  value={inputSpreadsheetId}
                  onChange={(e) => setInputSpreadsheetId(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  You can paste the entire browser link to the Google Sheet.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Worksheet (Tab) Name
                </label>
                <input
                  type="text"
                  placeholder="Email Subscribers"
                  value={inputSheetName}
                  onChange={(e) => setInputSheetName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSelectSpreadsheetModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sheetsLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#006B3F] hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {sheetsLoading ? 'Connecting...' : 'Connect Spreadsheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
