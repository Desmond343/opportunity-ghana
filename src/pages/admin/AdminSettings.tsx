import React, { useState } from 'react';
import { Database, ShieldCheck, CheckCircle2, Globe, RefreshCw, KeyRound, UserCheck, ShieldAlert } from 'lucide-react';
import { isFirebaseConfigured, firebaseConfig, testFirestoreConnection } from '../../services/firebase';
import { useAuth } from '../../services/authContext';

export const AdminSettings: React.FC<{ onNavigate: (path: string) => void }> = () => {
  const { currentUser, firebaseUser, claims, isAdmin, refreshClaims } = useAuth();
  const [testResult, setTestResult] = useState<{ connected: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [refreshingToken, setRefreshingToken] = useState(false);
  const [tokenNotice, setTokenNotice] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await testFirestoreConnection();
      setTestResult(res);
    } finally {
      setTesting(false);
    }
  };

  const handleRefreshToken = async () => {
    setRefreshingToken(true);
    setTokenNotice(null);
    try {
      const isAdm = await refreshClaims();
      setTokenNotice(
        isAdm
          ? 'Token claims refreshed successfully: admin = true confirmed.'
          : 'Token claims refreshed: no admin claim found on account.'
      );
    } catch {
      setTokenNotice('Error refreshing token from authentication service.');
    } finally {
      setRefreshingToken(false);
    }
  };

  // Mask UID for security (e.g. Abcd••••wxyz)
  const rawUid = firebaseUser?.uid || currentUser?.id || 'Not available';
  const maskedUid = rawUid.length > 8 ? `${rawUid.slice(0, 4)}••••${rawUid.slice(-4)}` : rawUid;
  const isEmailVerified = firebaseUser?.emailVerified ? 'Yes' : 'No';

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 font-space">
          System Infrastructure & Administrator Diagnostics
        </h1>
        <p className="text-xs text-slate-500">
          Connected to primary Firebase project: <strong className="text-emerald-800">opportunity-ghana</strong>
        </p>
      </div>

      {/* Section 14: Administrator-Only Authentication Diagnostic Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-slate-900 font-space">
              Authentication & Authorization Diagnostics
            </h2>
          </div>
          <button
            onClick={handleRefreshToken}
            disabled={refreshingToken}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshingToken ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{refreshingToken ? 'Refreshing Token...' : 'Refresh ID Token'}</span>
          </button>
        </div>

        {tokenNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{tokenNotice}</span>
          </div>
        )}

        <div className="font-mono bg-slate-900 text-slate-100 p-5 rounded-2xl space-y-2 border border-slate-800 text-xs shadow-inner">
          <div className="text-emerald-400 font-bold tracking-wider text-[11px] pb-1 border-b border-slate-800 uppercase">
            Authentication
          </div>
          <div className="text-slate-400 text-[10px]">--------------------------------------------------</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 pt-1">
            <div>
              <span className="text-slate-400">Email:</span>{' '}
              <span className="text-white font-semibold">{currentUser?.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400">Firebase UID:</span>{' '}
              <span className="text-emerald-300 font-semibold">{maskedUid}</span>
            </div>
            <div>
              <span className="text-slate-400">Email Verified:</span>{' '}
              <span className={firebaseUser?.emailVerified ? 'text-emerald-400 font-semibold' : 'text-amber-300 font-semibold'}>
                {isEmailVerified}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Admin Claim:</span>{' '}
              <span className={claims?.admin ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {claims?.admin ? 'true' : 'false'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">CMS Access:</span>{' '}
              <span className={isAdmin ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {isAdmin ? 'Enabled' : 'Restricted'}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Claims Object:</span>{' '}
              <span className="text-slate-300 text-[11px]">
                {JSON.stringify(claims)}
              </span>
            </div>
          </div>
          <div className="text-slate-400 text-[10px] pt-1">--------------------------------------------------</div>
          <p className="text-[10px] text-slate-400">
            Note: Sensitive tokens, passwords, and private service-account keys are strictly protected and never rendered.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
            Provisioning Additional Administrators
          </p>
          <p className="leading-relaxed">
            To provision an administrator account, run the trusted server script from the repository root:
          </p>
          <code className="block p-2 bg-white rounded-lg border border-slate-200 text-slate-800 font-mono text-[10px]">
            npm run set-admin -- &lt;user-email&gt;
          </code>
          <p className="text-[10px] text-slate-500">
            Example: <span className="font-mono">npm run set-admin -- aimarketing429@gmail.com</span>
          </p>
        </div>
      </div>

      {/* Backend Infrastructure Info */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5 text-xs">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-700" />
            <span>Target Backend Configuration</span>
          </h3>
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full uppercase">
            Project: {firebaseConfig.projectId}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Project ID</span>
            <div className="font-bold text-slate-800 text-sm">{firebaseConfig.projectId}</div>
            <p className="text-[10px] text-slate-500">Fixed target project</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Hosting Site</span>
            <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>opportunity-ghana</span>
            </div>
            <p className="text-[10px] text-slate-500">Target site for web deployments</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Storage Bucket</span>
            <div className="font-bold text-slate-800 text-sm truncate">{firebaseConfig.storageBucket}</div>
            <p className="text-[10px] text-slate-500">User resumes & public logos</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Firestore Connection & Health</span>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-3 py-1 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>
          <p className="text-[11px] text-emerald-800">
            {testResult
              ? testResult.message
              : isFirebaseConfigured
              ? `Connected directly to Google Cloud Firestore in '${firebaseConfig.projectId}'.`
              : `App is configured for existing project '${firebaseConfig.projectId}'. When running with client secrets, reads/writes stream directly to live Firestore.`}
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
            Security & Content Rules
          </h4>
          <div className="space-y-2 text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>RBAC rules active in firestore.rules (Strict user data isolation with custom claims)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Only accounts with trusted Firebase custom claim &apos;admin: true&apos; can access the CMS</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Server-side verification of Firebase ID tokens on all administrative API endpoints</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
