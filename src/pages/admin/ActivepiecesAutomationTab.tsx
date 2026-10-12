import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { AlertSubscriptionsService } from '../../services/alertSubscriptionsService';
import {
  Workflow,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  ExternalLink,
  Clock,
  Send,
  Download,
  Key,
  Webhook,
  Sliders,
  ShieldCheck,
  FileCode,
  Info,
  Check,
  Copy,
  Code,
  Eye,
  X,
  FileJson,
  ShieldAlert,
  AlertTriangle,
  Lock,
  RefreshCw
} from 'lucide-react';

interface ActivepiecesTabProps {
  onTriggerSuccess?: () => void;
}

export const ActivepiecesAutomationTab: React.FC<ActivepiecesTabProps> = ({ onTriggerSuccess }) => {
  const { currentUser, getIdToken, isAdmin, isEditorOrAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [downloadingFlow, setDownloadingFlow] = useState(false);
  const [copyingFlow, setCopyingFlow] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [workflowJsonData, setWorkflowJsonData] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [config, setConfig] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [endpoints, setEndpoints] = useState<any>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form State
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecretInput, setWebhookSecretInput] = useState('');
  const [scheduleCron, setScheduleCron] = useState('0 8 * * *');
  const [scheduleTime, setScheduleTime] = useState('08:00 UTC (Daily)');
  const [enabled, setEnabled] = useState(true);
  const [fallbackPolicy, setFallbackPolicy] = useState<'highlights' | 'skip'>('highlights');
  const [emailProvider, setEmailProvider] = useState<'activepieces_email' | 'smtp' | 'gmail' | 'simulated'>('activepieces_email');
  const [fromEmail, setFromEmail] = useState('alerts@opportunityghana.com');
  const [fromName, setFromName] = useState('Opportunity Ghana Daily Alerts');

  // Secure API Key Management State
  const [newlyGeneratedApiKey, setNewlyGeneratedApiKey] = useState<string | null>(null);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [revokingKey, setRevokingKey] = useState(false);
  const [showRevokeConfirmModal, setShowRevokeConfirmModal] = useState(false);
  const [showRotateConfirmModal, setShowRotateConfirmModal] = useState(false);
  const [copiedRawKey, setCopiedRawKey] = useState(false);
  const [keyCardError, setKeyCardError] = useState<string | null>(null);
  const [keyCardSuccess, setKeyCardSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const res = await AlertSubscriptionsService.getActivepiecesConfig(getIdToken);
      if (res && res.success) {
        setConfig(res.config);
        setReports(res.reports || []);
        setEndpoints(res.endpoints);

        // Prepopulate form
        setWebhookUrl(res.config.webhookUrl || '');
        setScheduleCron(res.config.scheduleCron || '0 8 * * *');
        setScheduleTime(res.config.scheduleTime || '08:00 UTC (Daily)');
        setEnabled(res.config.enabled !== false);
        setFallbackPolicy(res.config.fallbackPolicy || 'highlights');
        setEmailProvider(res.config.emailProvider || 'activepieces_email');
        setFromEmail(res.config.fromEmail || 'alerts@opportunityghana.com');
        setFromName(res.config.fromName || 'Opportunity Ghana Daily Alerts');
      }
    } catch (err: any) {
      console.warn('Failed to load Activepieces config:', err);
      setActionError(err.message || 'Could not load Activepieces configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateKey = async () => {
    setGeneratingKey(true);
    setActionError(null);
    setActionSuccess(null);
    setKeyCardError(null);
    setKeyCardSuccess(null);
    try {
      const res = await AlertSubscriptionsService.generateActivepiecesApiKey(getIdToken);
      if (res && res.success && res.apiKey) {
        setNewlyGeneratedApiKey(res.apiKey);
        setShowRotateConfirmModal(false);
        const successMsg = 'Cryptographically secure API key generated! Please copy it now and update your Activepieces workflow.';
        setActionSuccess(successMsg);
        setKeyCardSuccess('API key generated successfully and persisted to Cloud Firestore database! Copy your key above.');
        await loadData();
      } else {
        const errorMsg = res.error || 'Failed to generate API key';
        setActionError(errorMsg);
        setKeyCardError(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error generating API key';
      setActionError(errorMsg);
      setKeyCardError(errorMsg);
    } finally {
      setGeneratingKey(false);
    }
  };

  const handleRevokeKey = async () => {
    setRevokingKey(true);
    setActionError(null);
    setActionSuccess(null);
    setKeyCardError(null);
    setKeyCardSuccess(null);
    try {
      const res = await AlertSubscriptionsService.revokeActivepiecesApiKey(getIdToken);
      if (res && res.success) {
        setShowRevokeConfirmModal(false);
        setNewlyGeneratedApiKey(null);
        const successMsg = 'Activepieces API key has been revoked. All incoming integration requests using this key will now be rejected with HTTP 401.';
        setActionSuccess(successMsg);
        setKeyCardSuccess(successMsg);
        await loadData();
      } else {
        const errorMsg = res.error || 'Failed to revoke API key';
        setActionError(errorMsg);
        setKeyCardError(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error revoking API key';
      setActionError(errorMsg);
      setKeyCardError(errorMsg);
    } finally {
      setRevokingKey(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const updates: any = {
        webhookUrl: webhookUrl.trim(),
        scheduleCron: scheduleCron.trim(),
        scheduleTime: scheduleTime.trim(),
        enabled,
        fallbackPolicy,
        emailProvider,
        fromEmail: fromEmail.trim(),
        fromName: fromName.trim()
      };

      if (webhookSecretInput.trim()) {
        updates.webhookSecret = webhookSecretInput.trim();
      }

      const res = await AlertSubscriptionsService.updateActivepiecesConfig(updates, getIdToken);
      if (res && res.success) {
        setConfig(res.config);
        setWebhookSecretInput('');
        setActionSuccess('Activepieces configuration saved successfully!');
        setTimeout(() => setActionSuccess(null), 5000);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to save Activepieces configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestRun = async () => {
    if (!window.confirm('Run Activepieces Daily Alert Matching Cycle now? This will match approved opportunities to active subscribers.')) {
      return;
    }

    setTesting(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      const res = await AlertSubscriptionsService.triggerActivepiecesTestRun(getIdToken);
      if (res && res.success) {
        setActionSuccess(
          `Alert automation completed! Delivered: ${res.deliveredCount}, Skipped: ${res.skippedCount}, Errors: ${res.failedCount}.`
        );
        loadData();
        if (onTriggerSuccess) onTriggerSuccess();
      } else {
        setActionError(res.error || 'Execution failed');
      }
    } catch (err: any) {
      setActionError(err.message || 'Activepieces test run failed');
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadFlow = async () => {
    setActionSuccess(null);
    setActionError(null);

    if (!currentUser) {
      setActionError('You are currently signed out. Please sign in with an administrator account to download the automation workflow.');
      return;
    }

    setDownloadingFlow(true);
    try {
      const res = await AlertSubscriptionsService.downloadActivepiecesFlow(getIdToken);
      if (res.success) {
        if (res.data) setWorkflowJsonData(res.data);
        setActionSuccess('Activepieces workflow JSON (opportunity-ghana-activepieces-flow.json) downloaded successfully! You can now import it directly into Activepieces.');
        setTimeout(() => setActionSuccess(null), 6000);
      } else {
        setActionError(res.error || 'Failed to download workflow definition.');
      }
    } catch (err: any) {
      setActionError(err.message || 'An unexpected error occurred while downloading the workflow.');
    } finally {
      setDownloadingFlow(false);
    }
  };

  const handleCopyFlow = async () => {
    setActionSuccess(null);
    setActionError(null);

    if (!currentUser) {
      setActionError('You are currently signed out. Please sign in with an administrator account to copy the automation workflow.');
      return;
    }

    setCopyingFlow(true);
    try {
      let flowData = workflowJsonData || config?.flowJson;
      if (!flowData) {
        const res = await AlertSubscriptionsService.fetchActivepiecesFlowJson(getIdToken);
        if (res.success && res.data) {
          flowData = res.data;
          setWorkflowJsonData(res.data);
        } else {
          setActionError(res.error || 'Failed to fetch workflow JSON for copying.');
          setCopyingFlow(false);
          return;
        }
      }

      await navigator.clipboard.writeText(JSON.stringify(flowData, null, 2));
      setCopiedKey('flow-json');
      setActionSuccess('Activepieces workflow JSON copied to clipboard! You can paste it directly into Activepieces.');
      setTimeout(() => {
        setCopiedKey(null);
        setActionSuccess(null);
      }, 5000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to copy workflow to clipboard.');
    } finally {
      setCopyingFlow(false);
    }
  };

  const handleViewFlow = async () => {
    setActionError(null);
    if (!currentUser) {
      setActionError('You are currently signed out. Please sign in with an administrator account to inspect the automation workflow.');
      return;
    }

    if (!workflowJsonData && !config?.flowJson) {
      try {
        const res = await AlertSubscriptionsService.fetchActivepiecesFlowJson(getIdToken);
        if (res.success && res.data) {
          setWorkflowJsonData(res.data);
        }
      } catch (e: any) {
        console.warn('Flow preview fetch note:', e.message);
      }
    }
    setShowWorkflowModal(true);
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3 bg-white dark:bg-[#141B29] rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="w-8 h-8 border-3 border-[#006B3F] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Loading Activepieces integration & delivery reports...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#006B3F] to-emerald-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#FCD116] text-[11px] font-bold tracking-wider uppercase font-space">
            <Workflow className="w-3.5 h-3.5" />
            Activepieces External Automation Platform
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-space tracking-tight">
            Automated Daily Subscriber Alert Engine
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Opportunity Ghana uses <strong>Activepieces Cloud</strong> as its external automation orchestrator. Every 24 hours, Activepieces fetches active subscribers, queries approved opportunities, performs category matching, and dispatches personalized HTML email digests.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="https://cloud.activepieces.com/mcp/platform"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-emerald-950 text-xs font-extrabold hover:bg-emerald-50 transition-colors shadow-xs"
            >
              <span>Open Activepieces MCP Platform</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={handleDownloadFlow}
              disabled={downloadingFlow}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
            >
              <Download className={`w-3.5 h-3.5 text-emerald-200 ${downloadingFlow ? 'animate-bounce' : ''}`} />
              <span>{downloadingFlow ? 'Downloading...' : 'Download Flow JSON'}</span>
            </button>
            <button
              onClick={handleCopyFlow}
              disabled={copyingFlow}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-900/90 hover:bg-emerald-900 border border-emerald-600/70 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
            >
              {copiedKey === 'flow-json' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 text-emerald-200" />}
              <span>{copiedKey === 'flow-json' ? 'Copied to Clipboard!' : 'Copy Flow JSON'}</span>
            </button>
            <button
              onClick={handleViewFlow}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-200" />
              <span>Inspect Flow JSON</span>
            </button>
            <button
              onClick={handleTestRun}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FCD116] hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Executing Run...' : 'Test Run Automation Now'}</span>
            </button>
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

      {/* Key Metric Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Delivered</span>
          <div className="text-2xl font-extrabold text-[#006B3F] dark:text-emerald-400 mt-1 font-space">
            {(config?.totalDelivered || 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Successful alert emails</p>
        </div>

        <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Delivery Errors</span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 font-space">
            {(config?.totalErrors || 0).toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Failed attempts logged</p>
        </div>

        <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Schedule Trigger</span>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-2 font-mono">
            {config?.scheduleCron || '0 8 * * *'}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">{config?.scheduleTime || 'Every day at 08:00 UTC'}</p>
        </div>

        <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Last Execution</span>
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 truncate">
            {config?.lastRunAt ? new Date(config.lastRunAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Never'}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Status: <span className="font-bold uppercase text-emerald-600">{config?.lastRunStatus || 'idle'}</span>
          </p>
        </div>
      </div>

      {/* 1. API Key One-Time Display Alert (shown immediately after generation) */}
      {newlyGeneratedApiKey && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-emerald-500 dark:border-emerald-400 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white font-space flex items-center gap-2">
                  <span>New Activepieces API Key Generated</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold uppercase tracking-wider">
                    One-Time View
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
                  Please copy this key now. For your security, this key is hashed with SHA-256 on the server and will <strong>never be shown again</strong>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setNewlyGeneratedApiKey(null)}
              className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 text-emerald-300 font-mono text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
            <div className="truncate w-full font-bold tracking-wider select-all break-all">
              {newlyGeneratedApiKey}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(newlyGeneratedApiKey);
                  setCopiedRawKey(true);
                  setTimeout(() => setCopiedRawKey(false), 3000);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                {copiedRawKey ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-emerald-100" />}
                <span>{copiedRawKey ? 'Copied to Clipboard!' : 'Copy Complete Key'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Paste this key into Activepieces HTTP Request Steps (Header: Authorization: Bearer &lt;API_KEY&gt;)</span>
            </div>
            <button
              onClick={() => setNewlyGeneratedApiKey(null)}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              I have safely copied &amp; saved this key &rarr;
            </button>
          </div>
        </div>
      )}

      {/* 2. Dedicated API Key Management Card */}
      <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-space">
                  Activepieces Integration API Key
                </h3>
                {config?.apiKeyInfo?.status === 'active' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active &amp; Authorized
                  </span>
                ) : config?.apiKeyInfo?.status === 'revoked' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Revoked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    Not Generated
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cryptographically authenticates Activepieces requests to <code className="font-mono text-emerald-600 dark:text-emerald-400">/api/activepieces/*</code>. Stored securely as a SHA-256 hash.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {config?.apiKeyInfo?.status === 'active' ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowRotateConfirmModal(true)}
                  disabled={generatingKey || revokingKey}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generatingKey ? 'animate-spin' : ''}`} />
                  <span>Rotate Key</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowRevokeConfirmModal(true)}
                  disabled={generatingKey || revokingKey}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Revoke Key</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleGenerateKey}
                disabled={generatingKey}
                className="px-4 py-2 rounded-xl bg-[#006B3F] hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Key className={`w-3.5 h-3.5 ${generatingKey ? 'animate-spin' : ''}`} />
                <span>{generatingKey ? 'Generating...' : 'Generate New API Key'}</span>
              </button>
            )}
          </div>
        </div>

        {keyCardError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{keyCardError}</span>
          </div>
        )}

        {keyCardSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{keyCardSuccess}</span>
          </div>
        )}

        {/* Key Display & Audit Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Key Identifier (Masked)
            </span>
            <div className="font-mono text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>{config?.apiKeyInfo?.maskedDisplay || 'No API key generated yet'}</span>
              {config?.apiKeyInfo?.status === 'active' && (
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  SHA-256 Hashed
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              Only the hash is stored on the server. The full key is never stored in plaintext.
            </p>
          </div>

          <div className="md:col-span-6 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Created</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] mt-0.5 block truncate">
                {config?.apiKeyInfo?.createdAt ? new Date(config.apiKeyInfo.createdAt).toLocaleString('en-GB') : '—'}
              </span>
              <span className="text-[10px] text-slate-400 truncate block">
                {config?.apiKeyInfo?.createdByEmail || 'Administrator'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Last Authenticated</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] mt-0.5 block truncate">
                {config?.apiKeyInfo?.lastUsedAt ? new Date(config.apiKeyInfo.lastUsedAt).toLocaleString('en-GB') : 'Never used yet'}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                {config?.apiKeyInfo?.status === 'active' ? 'Ready for requests' : 'Authentication blocked'}
              </span>
            </div>
          </div>
        </div>

        {/* Step-by-Step Activepieces Connection Guide */}
        <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold">
            <ShieldCheck className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
            <span>How to Configure this API Key in Activepieces:</span>
          </div>
          <ol className="list-decimal list-inside text-[11px] text-emerald-950 dark:text-emerald-300 space-y-1.5 leading-relaxed">
            <li>Generate or copy your Activepieces API key using the controls above.</li>
            <li>In Activepieces Cloud (<a href="https://cloud.activepieces.com" target="_blank" rel="noopener noreferrer" className="underline font-bold">cloud.activepieces.com</a>), open your imported workflow.</li>
            <li>
              For <strong>Step 1</strong> (<code className="font-mono bg-white/70 dark:bg-black/30 px-1 py-0.2 rounded text-[10px]">/subscribers</code>), <strong>Step 2</strong> (<code className="font-mono bg-white/70 dark:bg-black/30 px-1 py-0.2 rounded text-[10px]">/opportunities</code>), and <strong>Step 3</strong> (<code className="font-mono bg-white/70 dark:bg-black/30 px-1 py-0.2 rounded text-[10px]">/trigger-daily-run</code>):
              <div className="pl-4 pt-1 font-mono text-[10px] text-emerald-800 dark:text-emerald-300">
                Header name: <code className="bg-white/80 dark:bg-black/40 px-1 py-0.5 rounded font-bold">Authorization</code> &rarr; Header value: <code className="bg-white/80 dark:bg-black/40 px-1 py-0.5 rounded font-bold">Bearer &lt;YOUR_API_KEY&gt;</code>
              </div>
            </li>
            <li>Verify all 3 steps connect to the mandatory production base URL: <code className="font-mono bg-white/70 dark:bg-black/30 px-1 py-0.2 rounded text-[10px] font-bold">https://opportunityghana.site</code>.</li>
            <li>Click <strong>Test Step</strong> in Activepieces, then toggle the workflow to <strong>Published</strong>.</li>
          </ol>
        </div>
      </div>

      {/* Integration Setup & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Configuration */}
        <div className="lg:col-span-7 bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-space">
                Activepieces Integration Parameters
              </h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${enabled ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'}`}>
              {enabled ? 'Automation Enabled' : 'Disabled'}
            </span>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            {/* Enable toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Enable Automated Daily Alert Automation</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Allows Activepieces workflows and server webhook dispatch</span>
              </div>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>

            {/* Webhook URL */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Activepieces Webhook URL (For instant subscriber sync)
              </label>
              <input
                type="url"
                placeholder="https://cloud.activepieces.com/api/v1/webhooks/YOUR_FLOW_WEBHOOK_ID"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Triggered whenever a user subscribes, updates alert preferences, or unsubscribes.
              </p>
            </div>

            {/* Schedule & Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Schedule Cron Expression
                </label>
                <input
                  type="text"
                  value={scheduleCron}
                  onChange={(e) => setScheduleCron(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-slate-100"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Default: '0 8 * * *' (Every day at 8:00 AM UTC)</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Schedule Display Label
                </label>
                <input
                  type="text"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Fallback Policy & Email Provider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Policy when no new matching opportunities exist:
                </label>
                <select
                  value={fallbackPolicy}
                  onChange={(e) => setFallbackPolicy(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="highlights">Send Verified Highlights (Top open listings)</option>
                  <option value="skip">Skip email (Send nothing until new matches drop)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Activepieces Connected Email Provider
                </label>
                <select
                  value={emailProvider}
                  onChange={(e) => setEmailProvider(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="activepieces_email">Activepieces Email Piece / SMTP</option>
                  <option value="gmail">Google Workspace / Gmail Integration</option>
                  <option value="smtp">Custom Transactional SMTP Provider</option>
                  <option value="simulated">Diagnostic Sandbox (Safe preview mode)</option>
                </select>
              </div>
            </div>

            {/* From Email / Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sender Email Address
                </label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Outbound Webhook Security */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Outbound Webhook Security (HMAC-SHA256)
              </span>
              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Webhook Secret (Used to sign subscriber event payloads with HMAC-SHA256)
                </label>
                <input
                  type="password"
                  placeholder="Leave blank to keep existing secret"
                  value={webhookSecretInput}
                  onChange={(e) => setWebhookSecretInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-xl bg-[#006B3F] hover:bg-emerald-800 text-white font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving Configuration...' : 'Save Activepieces Settings'}
            </button>
          </form>
        </div>

        {/* Endpoints & Integration Guide */}
        <div className="lg:col-span-5 space-y-5">
          {/* Secured API Endpoints for Activepieces HTTP Pieces */}
          <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-slate-900 dark:text-white font-space">
                Activepieces Authenticated API Endpoints
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-semibold text-slate-500 block mb-1">1. Fetch Active Subscribers:</span>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">GET</span>
                  <span className="truncate flex-1">{endpoints?.subscribers}</span>
                  <button
                    onClick={() => copyToClipboard(endpoints?.subscribers || '', 'subscribers')}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {copiedKey === 'subscribers' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-500 block mb-1">2. Fetch Approved Opportunities:</span>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">GET</span>
                  <span className="truncate flex-1">{endpoints?.opportunities}</span>
                  <button
                    onClick={() => copyToClipboard(endpoints?.opportunities || '', 'opportunities')}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {copiedKey === 'opportunities' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-500 block mb-1">3. Trigger Alert Matcher & Dispatch:</span>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">POST</span>
                  <span className="truncate flex-1">{endpoints?.triggerDailyRun}</span>
                  <button
                    onClick={() => copyToClipboard(endpoints?.triggerDailyRun || '', 'trigger')}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {copiedKey === 'trigger' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-500 block mb-1">4. Download Workflow Template (Admin Protected):</span>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                  <span className="text-purple-700 dark:text-purple-400 font-bold">GET</span>
                  <span className="truncate flex-1">{endpoints?.flowImport}</span>
                  <button
                    onClick={() => copyToClipboard(endpoints?.flowImport || '', 'flowImport')}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedKey === 'flowImport' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleDownloadFlow}
                    disabled={downloadingFlow}
                    className="text-emerald-600 hover:text-emerald-700 cursor-pointer ml-1"
                    title="Download Workflow File"
                  >
                    <Download className={`w-3.5 h-3.5 ${downloadingFlow ? 'animate-bounce' : ''}`} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Protected endpoint: Requires Firebase ID Token with Administrator privileges.
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1">
              <span className="font-bold text-amber-800 dark:text-amber-300 block">HTTP Piece Authentication Header</span>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                In your Activepieces HTTP piece, set Header: <code className="font-mono bg-white/60 dark:bg-black/30 px-1 py-0.5 rounded">Authorization: Bearer {'<API_KEY>'}</code> or <code className="font-mono bg-white/60 dark:bg-black/30 px-1 py-0.5 rounded">x-api-key: {'<API_KEY>'}</code>.
              </p>
            </div>
          </div>

          {/* Activepieces Authentic 5-Step Workflow Architecture */}
          <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white font-space flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-600" />
              Activepieces Daily Alert Workflow Spec
            </h4>
            <ol className="space-y-2 list-decimal list-inside text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              <li><strong>Trigger (@activepieces/piece-schedule):</strong> Runs every 24 hours at 08:00 UTC (<code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">every_day</code>).</li>
              <li><strong>Step 1 (HTTP GET):</strong> Fetches active subscribers with alert preferences (<code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">/api/activepieces/subscribers</code>).</li>
              <li><strong>Step 2 (HTTP GET):</strong> Queries approved, non-expired opportunity listings (<code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">/api/activepieces/opportunities</code>).</li>
              <li><strong>Step 3 (HTTP POST):</strong> Dispatches the matching engine &amp; emails (<code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">/api/activepieces/trigger-daily-run</code>).</li>
              <li><strong>Step 4 (Code Step):</strong> Records execution metrics, counts deliveries, and verifies success status.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Recent Delivery Reports Table */}
      <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-space">
              Recent Activepieces Delivery Logs & Reports
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Audit trail of automated runs, subscriber matches, and delivery statuses.
            </p>
          </div>
          <button
            onClick={loadData}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Refresh Logs</span>
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Clock className="w-8 h-8 text-slate-400 mx-auto opacity-70" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">No Automation Runs Recorded Yet</h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Click "Test Run Automation Now" above or wait for the scheduled daily execution to see delivery reports here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-5">Timestamp</th>
                  <th className="py-3 px-4">Run ID</th>
                  <th className="py-3 px-4">Subscribers Checked</th>
                  <th className="py-3 px-4">Delivered</th>
                  <th className="py-3 px-4">Skipped (No Matches)</th>
                  <th className="py-3 px-4">Errors</th>
                  <th className="py-3 px-4 sm:px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {reports.map((rep) => {
                  const isOk = rep.failedCount === 0;
                  return (
                    <tr key={rep.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 sm:px-5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {new Date(rep.timestamp).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{rep.runId}</td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{rep.totalSubscribers}</td>
                      <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">{rep.deliveredCount}</td>
                      <td className="py-3 px-4 text-slate-500">{rep.skippedCount}</td>
                      <td className="py-3 px-4 text-rose-600 dark:text-rose-400 font-bold">{rep.failedCount}</td>
                      <td className="py-3 px-4 sm:px-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isOk
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isOk ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span>{isOk ? 'Success' : 'With Errors'}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Workflow JSON Template Inspector Modal */}
      {showWorkflowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <FileCode className="w-4 h-4 text-emerald-100" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-space">
                    Activepieces Automation Workflow Spec
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Importable JSON structure for Activepieces Cloud workflow builder
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyFlow}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey === 'flow-json' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'flow-json' ? 'Copied!' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={handleDownloadFlow}
                  disabled={downloadingFlow}
                  className="px-3 py-1.5 rounded-xl bg-[#006B3F] hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Download className={`w-3.5 h-3.5 ${downloadingFlow ? 'animate-bounce' : ''}`} />
                  <span>{downloadingFlow ? 'Downloading...' : 'Download'}</span>
                </button>
                <button
                  onClick={() => setShowWorkflowModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* Import Instructions Callout */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-[11px] text-emerald-900 dark:text-emerald-200 space-y-2">
                <span className="font-bold flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <Workflow className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Activepieces Cloud Import Instructions:
                </span>
                <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                  <li>Log in to your Activepieces dashboard (<a href="https://cloud.activepieces.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-emerald-700 dark:text-emerald-300">cloud.activepieces.com</a>).</li>
                  <li>Click <strong>Import Flow</strong> on your dashboard, or open a flow and click <strong>... &rarr; Import Flow</strong>.</li>
                  <li>Select the downloaded <code className="font-mono bg-white/70 dark:bg-black/40 px-1 py-0.5 rounded text-[10px] font-semibold">opportunity-ghana-activepieces-flow.json</code> file.</li>
                  <li>Activepieces will parse the template and populate the 5 workflow steps into your builder canvas.</li>
                </ol>
              </div>

              {/* Step Architecture & Post-Import Configuration Details */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] text-slate-700 dark:text-slate-300 space-y-2.5">
                <span className="font-bold text-slate-900 dark:text-white block text-xs">
                  Post-Import Configuration &amp; Connection Setup:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                    <span className="font-semibold text-slate-900 dark:text-white block">1. Set API Key Header</span>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed">
                      In Step 1, 2, and 3 (<code className="font-mono">HTTP send_request</code>), replace <code className="font-mono bg-slate-100 dark:bg-slate-700 px-1 py-0.2 rounded">REPLACE_WITH_OPPORTUNITY_GHANA_API_KEY</code> in the Authorization header with your API Key.
                    </p>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                    <span className="font-semibold text-slate-900 dark:text-white block">2. Verify Base URL</span>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed">
                      Confirm endpoint URLs point to <code className="font-mono bg-slate-100 dark:bg-slate-700 px-1 py-0.2 rounded">https://opportunityghana.site</code>.
                    </p>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                    <span className="font-semibold text-slate-900 dark:text-white block">3. Schedule Timing</span>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed">
                      Trigger is pre-configured to run daily at 08:00 UTC using the official <code className="font-mono">@activepieces/piece-schedule</code> piece.
                    </p>
                  </div>
                  <div className="p-2.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                    <span className="font-semibold text-slate-900 dark:text-white block">4. Publish Flow</span>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed">
                      Toggle the top-right switch in Activepieces to <strong>Published</strong> to begin automated daily alert runs!
                    </p>
                  </div>
                </div>
              </div>

              {/* JSON Code Viewer */}
              <div className="relative">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 rounded-t-xl text-[10px] text-slate-400 font-mono">
                  <span>opportunity-ghana-activepieces-flow.json</span>
                  <span className="text-emerald-400">Activepieces Template Schema v28 (Valid)</span>
                </div>
                <pre className="p-4 bg-slate-900 text-emerald-300 rounded-b-2xl font-mono text-[11px] overflow-x-auto max-h-[300px] leading-relaxed border border-slate-800 shadow-inner">
                  {JSON.stringify(workflowJsonData || config?.flowJson || {}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
              <span className="text-[11px] text-slate-500 font-medium">
                Target: Opportunity Ghana Automated Daily Alert Engine
              </span>
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Revoke API Key Modal */}
      {showRevokeConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#141B29] border border-rose-200 dark:border-rose-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-space">
                Revoke Activepieces API Key?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Revoking this API key will <strong>immediately reject</strong> all scheduled and manual automation requests from Activepieces with <strong>HTTP 401 Unauthorized</strong>.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRevokeConfirmModal(false)}
                disabled={revokingKey}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevokeKey}
                disabled={revokingKey}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {revokingKey ? 'Revoking...' : 'Yes, Revoke Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rotate API Key Modal */}
      {showRotateConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#141B29] border border-amber-200 dark:border-amber-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-space">
                Rotate Integration API Key?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Generating a replacement key will <strong>immediately revoke the existing key</strong>. You will need to update the Authorization header in your Activepieces workflow steps with the new key.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRotateConfirmModal(false)}
                disabled={generatingKey}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateKey}
                disabled={generatingKey}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {generatingKey ? 'Generating...' : 'Generate Replacement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
