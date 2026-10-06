import React, { useEffect, useState } from 'react';
import { PipelineMetrics } from '../../types/database';
import { AdminService } from '../../services/adminService';
import { OpportunitiesService } from '../../services/opportunitiesService';
import { ResourcesService } from '../../services/resourcesService';
import {
  Compass,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Inbox,
  ArrowRight,
  Plus,
  BookOpen,
  Building,
  Sparkles,
  Database,
  Bell,
  Layers,
  Users,
  Archive,
  Hourglass,
  FileText
} from 'lucide-react';

interface PendingQueueItem {
  id: string;
  type: 'opportunity' | 'resource' | 'partner';
  title: string;
  provider: string;
  submitter: string;
  submittedAt: string;
  category: string;
}

export const AdminDashboard: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null);
  const [pendingQueue, setPendingQueue] = useState<PendingQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetricsAndQueue() {
      try {
        const [data, opps, resList, partners] = await Promise.all([
          AdminService.getPipelineMetrics(),
          OpportunitiesService.getPendingSubmissions(),
          ResourcesService.getPendingSubmissions(),
          AdminService.loadSubmissionsFromFirestore()
        ]);
        setMetrics(data);

        const unified: PendingQueueItem[] = [
          ...opps.map(o => ({
            id: o.id,
            type: 'opportunity' as const,
            title: o.title,
            provider: o.organizationName || 'Offering Organization',
            submitter: o.submittedByName || o.createdByName || 'Community Contributor',
            submittedAt: o.submittedAt || o.createdAt,
            category: o.category
          })),
          ...resList.map(r => ({
            id: r.id,
            type: 'resource' as const,
            title: r.title,
            provider: r.providerName || 'Learning Provider',
            submitter: r.submittedByName || r.createdByName || 'Contributor',
            submittedAt: r.submittedAt || r.createdAt,
            category: r.category
          })),
          ...partners.filter(p => p.status === 'pending').map(p => ({
            id: p.id,
            type: 'partner' as const,
            title: p.title,
            provider: p.organizationName,
            submitter: p.submittedByName,
            submittedAt: p.createdAt,
            category: p.type === 'opportunity' ? 'Partner Opportunity' : 'Partner Resource'
          }))
        ].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

        setPendingQueue(unified.slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard metrics or queue:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetricsAndQueue();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight font-space">
            Opportunity Ghana CMS Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Content management workflow: Create → Draft → Review → Verify → Publish → Update → Close/Archive
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/admin/ai-assistant')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>AI Content Assistant</span>
          </button>
          <button
            onClick={() => onNavigate('/admin/opportunities')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Opportunity</span>
          </button>
          <button
            onClick={() => onNavigate('/admin/resources')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold shadow-2xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>New Resource</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD METRICS TILES (Specified in Section 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {/* 1. Total Opportunities */}
        <div
          onClick={() => onNavigate('/admin/opportunities')}
          className="p-5 bg-white dark:bg-[#141B29] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Opportunities</p>
            <Compass className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-emerald-700 dark:group-hover:text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 font-space">
            {metrics?.totalOpportunities ?? 0}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across all statuses and categories</p>
        </div>

        {/* 2. Published Opportunities */}
        <div
          onClick={() => onNavigate('/admin/opportunities')}
          className="p-5 bg-white dark:bg-[#141B29] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Published</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-2 font-space">
            {metrics?.publishedCount ?? 0}
          </p>
          <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-1">Active &amp; visible on public website</p>
        </div>

        {/* 3. Pending Review */}
        <div
          onClick={() => onNavigate('/admin/submissions')}
          className="p-5 bg-white dark:bg-[#141B29] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Review</p>
            <Hourglass className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2 font-space">
            {metrics?.pendingReviewCount ?? 0}
          </p>
          <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-1">Awaiting admin review &amp; publishing</p>
        </div>

        {/* 4. Closing Soon */}
        <div
          onClick={() => onNavigate('/admin/opportunities')}
          className="p-5 bg-white dark:bg-[#141B29] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-rose-300 dark:hover:border-rose-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Closing Soon</p>
            <Clock className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <p className="text-3xl font-extrabold text-rose-700 dark:text-rose-400 mt-2 font-space">
            {metrics?.closingSoonCount ?? 0}
          </p>
          <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-1">Closes in ≤ 7 days</p>
        </div>

        {/* 5. Closed Opportunities */}
        <div
          onClick={() => onNavigate('/admin/opportunities')}
          className="p-5 bg-white dark:bg-[#141B29] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-400 dark:hover:border-slate-600 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Closed Opportunities</p>
            <Archive className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-600 dark:text-slate-400 mt-2 font-space">
            {metrics?.closedCount ?? 0}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Deadline passed; alternatives offered</p>
        </div>

        {/* 6. Total Resources */}
        <div
          onClick={() => onNavigate('/admin/resources')}
          className="p-5 bg-white dark:bg-[#141B29] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Resources</p>
            <BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-emerald-700 dark:group-hover:text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 font-space">
            {metrics?.totalResources ?? 0}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Free &amp; paid courses, certs &amp; bootcamps</p>
        </div>

        {/* 7. Pending Resource Submissions */}
        <div
          onClick={() => onNavigate('/admin/submissions')}
          className="p-5 bg-white dark:bg-[#141B29] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Submissions</p>
            <Inbox className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-400 mt-2 font-space">
            {metrics?.pendingSubmissionsCount ?? 0}
          </p>
          <p className="text-[11px] text-indigo-800 dark:text-indigo-300 mt-1">
            {metrics?.pendingResourceSubmissions ?? 0} resource proposal awaiting review
          </p>
        </div>

        {/* 8. Total Users */}
        <div
          onClick={() => onNavigate('/admin/users')}
          className="p-5 bg-white dark:bg-[#141B29] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Users</p>
            <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 font-space">
            {metrics?.totalUsers ?? 0}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Students, jobseekers &amp; editors</p>
        </div>

        {/* 9. Reports Requiring Attention */}
        <div
          onClick={() => onNavigate('/admin/reports')}
          className="p-5 bg-white dark:bg-[#141B29] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-rose-300 dark:hover:border-rose-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reports Requiring Attention</p>
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-3xl font-extrabold text-rose-700 dark:text-rose-400 mt-2 font-space">
            {metrics?.openReportsCount ?? 0}
          </p>
          <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-1">Dead links, expired items &amp; feedback</p>
        </div>
      </div>

      {/* CONTENT WORKFLOW FUNNEL VISUALIZATION */}
      <div className="bg-white dark:bg-[#141B29] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-space">
              Publishing Lifecycle: Create → Draft → Review → Verify → Publish → Update → Close
            </h2>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Standard Operating Procedure
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">1. Draft</span>
            <div className="font-bold text-slate-800 dark:text-slate-200 py-1">{metrics?.draftCount || 0} Drafts</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Private to editors</span>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">2. Review</span>
            <div className="font-bold text-amber-900 dark:text-amber-200 py-1">{metrics?.pendingReviewCount || 0} In Review</div>
            <span className="text-[10px] text-amber-700 dark:text-amber-400">Editorial verification</span>
          </div>

          <div className="p-3 bg-sky-50 dark:bg-sky-950/30 rounded-2xl border border-sky-200 dark:border-sky-800/60 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase">3. Verify</span>
            <div className="font-bold text-sky-900 dark:text-sky-200 py-1">{metrics?.needsVerificationCount || 0} Queued</div>
            <span className="text-[10px] text-sky-700 dark:text-sky-400">Source checked</span>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">4. Publish</span>
            <div className="font-bold text-emerald-800 dark:text-emerald-200 py-1">{metrics?.publishedCount || 0} Live</div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Appears on website</span>
          </div>

          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-800/60 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">5. Closing Soon</span>
            <div className="font-bold text-rose-900 dark:text-rose-200 py-1">{metrics?.closingSoonCount || 0} Due ≤ 7d</div>
            <span className="text-[10px] text-rose-700 dark:text-rose-400">Urgency badges</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/70 dark:border-slate-700 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">6. Closed / Archive</span>
            <div className="font-bold text-slate-700 dark:text-slate-300 py-1">{metrics?.closedCount || 0} Closed</div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Auto-closed on deadline</span>
          </div>
        </div>
      </div>

      {/* QUICK WORKSPACE LANES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Queue Preview */}
        <div className="bg-white dark:bg-[#141B29] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Pending Submission Review Queue</span>
            </h3>
            <button
              onClick={() => onNavigate('/admin/submissions')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              View All ({metrics?.pendingSubmissionsCount ?? 0}) →
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {loading ? (
              <div className="p-4 text-center text-slate-400 dark:text-slate-500 text-xs">Loading queue...</div>
            ) : pendingQueue.length === 0 ? (
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <p className="font-bold text-emerald-950 dark:text-emerald-200 text-xs">All Caught Up</p>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  There are currently no community or partner submissions awaiting editorial review.
                </p>
              </div>
            ) : (
              pendingQueue.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-2xl border border-slate-200/70 dark:border-slate-700 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                          item.type === 'opportunity'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : item.type === 'resource'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {new Date(item.submittedAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate" title={item.title}>
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {item.provider} • By {item.submitter}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('/admin/submissions')}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-emerald-700 hover:text-white hover:border-emerald-700 cursor-pointer shrink-0 transition-colors shadow-2xs"
                  >
                    Review
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Database & Deployment Status */}
        <div className="bg-white dark:bg-[#141B29] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Database &amp; Storage Architecture</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span>Firebase Admin SDK</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Authenticated (opportunity-ghana)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span>Client State Sync</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Real-time Local + Cloud Fallback</span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span>Deadline Automation</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">Active (Auto-closes on expiry)</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('/admin/settings')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              View System Settings &amp; Environment →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
