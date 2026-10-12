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
  FileJson
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
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [webhookSecretInput, setWebhookSecretInput] = useState('');
  const [scheduleCron, setScheduleCron] = useState('0 8 * * *');
  const [scheduleTime, setScheduleTime] = useState('08:00 UTC (Daily)');
  const [enabled, setEnabled] = useState(true);
  const [fallbackPolicy, setFallbackPolicy] = useState<'highlights' | 'skip'>('highlights');
  const [emailProvider, setEmailProvider] = useState<'activepieces_email' | 'smtp' | 'gmail' | 'simulated'>('activepieces_email');
  const [fromEmail, setFromEmail] = useState('alerts@opportunityghana.com');
  const [fromName, setFromName] = useState('Opportunity Ghana Daily Alerts');

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
      console.error('Failed to load Activepieces config:', err);
      setActionError(err.message || 'Could not load Activepieces configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

      if (apiKeyInput.trim()) {
        updates.apiKey = apiKeyInput.trim();
      }
      if (webhookSecretInput.trim()) {
        updates.webhookSecret = webhookSecretInput.trim();
      }

      const res = await AlertSubscriptionsService.updateActivepiecesConfig(updates, getIdToken);
      if (res && res.success) {
        setConfig(res.config);
        setApiKeyInput('');
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

            {/* Key overrides */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Security & Authentication Overrides (Optional)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Set Custom API Key (Current: <code className="font-mono">{config?.apiKeyMasked}</code>)
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep existing key"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Set Webhook Secret (HMAC verification)
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

          {/* Activepieces 7-Step Workflow Architecture */}
          <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white font-space flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-600" />
              Activepieces 7-Step Workflow Spec
            </h4>
            <ol className="space-y-2 list-decimal list-inside text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              <li><strong>Schedule trigger:</strong> Runs every 24 hours at 08:00 UTC.</li>
              <li><strong>Fetch subscribers:</strong> Retrieves opted-in subscribers with categories.</li>
              <li><strong>Fetch opportunities:</strong> Retrieves approved, published listings.</li>
              <li><strong>Match preferences:</strong> Selects candidates matching saved subscriber categories & region.</li>
              <li><strong>Prepare emails:</strong> Generates branded HTML email cards with deadlines & links.</li>
              <li><strong>Send emails:</strong> Dispatches via Activepieces Email Piece / SMTP / Gmail.</li>
              <li><strong>Track results:</strong> Records delivery status, timestamps, and sent IDs to prevent duplicates.</li>
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
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <Workflow className="w-3.5 h-3.5" />
                  Activepieces Cloud Import Instructions:
                </span>
                <ol className="list-decimal list-inside space-y-0.5 text-emerald-900/90 dark:text-emerald-300/90">
                  <li>Log in to your Activepieces dashboard (<a href="https://cloud.activepieces.com/mcp/platform" target="_blank" rel="noopener noreferrer" className="underline font-bold">cloud.activepieces.com/mcp/platform</a>).</li>
                  <li>Click <strong>New Flow</strong> &rarr; <strong>Import Flow</strong>.</li>
                  <li>Upload the downloaded <code className="font-mono bg-white/60 dark:bg-black/30 px-1 py-0.5 rounded">opportunity-ghana-activepieces-flow.json</code> or paste the JSON.</li>
                  <li>Confirm the API endpoints &amp; Bearer token, then toggle the workflow to <strong>Published / Active</strong>!</li>
                </ol>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-emerald-300 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-[350px] leading-relaxed border border-slate-800 shadow-inner">
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
    </div>
  );
};
