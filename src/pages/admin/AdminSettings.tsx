import React, { useState } from 'react';
import { Database, ShieldCheck, Bell, Server, CheckCircle2, Globe, RefreshCw } from 'lucide-react';
import { isFirebaseConfigured, firebaseConfig, testFirestoreConnection } from '../../services/firebase';

export const AdminSettings: React.FC<{ onNavigate: (path: string) => void }> = () => {
  const [testResult, setTestResult] = useState<{ connected: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await testFirestoreConnection();
      setTestResult(res);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 font-space">
          System Infrastructure & Firebase Project Settings
        </h1>
        <p className="text-xs text-slate-500">
          Connected to primary Firebase project: <strong className="text-emerald-800">opportunity-ghana</strong>
        </p>
      </div>

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
              <span>RBAC rules active in firestore.rules (Strict user data isolation)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Only verified editors and administrators can publish or modify opportunities</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Firebase Hosting configured with single-page app rewrites to /index.html</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

