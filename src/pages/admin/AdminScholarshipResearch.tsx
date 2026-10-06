import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { ScholarshipResearchService } from '../../services/scholarshipResearchService';
import { calculateDeadlineInfo } from '../../services/deadlineService';
import type {
  DiscoveredOpportunityCandidate,
  UniversalResearchRun,
  RecheckSummary,
  UniversalCategory
} from '../../types/scholarshipResearch';
import {
  Sparkles,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Clock,
  Building,
  Calendar,
  Globe,
  Award,
  Layers,
  FileCheck,
  ArrowRight,
  Filter,
  Check,
  X,
  History,
  Info,
  GraduationCap,
  Briefcase,
  Compass,
  Coins,
  BookOpen,
  Trophy,
  Rocket,
  Edit3,
  Save,
  Tag,
  MapPin,
  HelpCircle,
  Eye
} from 'lucide-react';

const CATEGORY_OPTIONS: { id: UniversalCategory; label: string; icon: any; color: string }[] = [
  { id: 'All', label: 'All Categories', icon: Sparkles, color: 'text-slate-600 bg-slate-100' },
  { id: 'Scholarships', label: 'Scholarships', icon: GraduationCap, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: 'Grants', label: 'Grants & Seed Funding', icon: Coins, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { id: 'Internships', label: 'Internships & Trainees', icon: Compass, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { id: 'Jobs', label: 'Jobs & Careers', icon: Briefcase, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { id: 'Admissions', label: 'University Admissions', icon: BookOpen, color: 'text-teal-700 bg-teal-50 border-teal-200' },
  { id: 'Fellowships', label: 'Fellowships & Residencies', icon: Award, color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { id: 'Competitions', label: 'Competitions & Prizes', icon: Trophy, color: 'text-rose-700 bg-rose-50 border-rose-200' },
  { id: 'Training', label: 'Training & Bootcamps', icon: Layers, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
  { id: 'Study Abroad', label: 'Study Abroad & Exchange', icon: Globe, color: 'text-sky-700 bg-sky-50 border-sky-200' },
  { id: 'Other', label: 'Other Opportunities', icon: Tag, color: 'text-slate-700 bg-slate-50 border-slate-200' }
];

const PRESET_QUERIES = [
  { label: 'Scholarships 2026/2027', category: 'Scholarships', query: 'fully funded scholarships for Ghanaian students' },
  { label: 'Youth Grants Ghana', category: 'Grants', query: 'youth entrepreneurship grants Ghana NEIP GEA' },
  { label: 'Tech Internships', category: 'Internships', query: 'software engineering internships graduate trainee Ghana' },
  { label: 'Remote Jobs for Ghana', category: 'Jobs', query: 'remote entry-level jobs open to Ghanaian citizens' },
  { label: 'University Admissions', category: 'Admissions', query: 'Ghana university undergraduate admissions 2026 2027' },
  { label: 'African Fellowships', category: 'Fellowships', query: 'leadership fellowships open to Ghanaians Africa' },
  { label: 'Free Bootcamps', category: 'Training', query: 'free tech training bootcamps AWS cloud Ghana' },
  { label: 'Study Abroad Mobility', category: 'Study Abroad', query: 'study abroad exchange programmes Ghanaian citizens' }
];

export const AdminScholarshipResearch: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  // Research Form Controls
  const [selectedCategory, setSelectedCategory] = useState<UniversalCategory>('All');
  const [studyLevel, setStudyLevel] = useState<string>('all');
  const [providerFocus, setProviderFocus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [currentRun, setCurrentRun] = useState<UniversalResearchRun | null>(null);
  const [pastRuns, setPastRuns] = useState<UniversalResearchRun[]>([]);

  // Discovered Candidates State
  const [candidates, setCandidates] = useState<DiscoveredOpportunityCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<DiscoveredOpportunityCandidate | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'published' | 'rejected'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [eligibilityFilter, setEligibilityFilter] = useState<'all' | 'confirmed' | 'unknown'>('all');

  // Candidate Edit Modal State
  const [isEditingCandidate, setIsEditingCandidate] = useState(false);
  const [editedCandidate, setEditedCandidate] = useState<DiscoveredOpportunityCandidate | null>(null);

  // Publishing & Recheck State
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [isRechecking, setIsRechecking] = useState(false);
  const [recheckResult, setRecheckResult] = useState<RecheckSummary | null>(null);

  // Notification / Feedback State with Link to Live Opportunity
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    liveUrl?: string;
    slug?: string;
  } | null>(null);

  useEffect(() => {
    loadPastRuns();
    runInitialDiscovery();
  }, []);

  const loadPastRuns = async () => {
    const runs = await ScholarshipResearchService.getRuns();
    setPastRuns(runs);
  };

  const runInitialDiscovery = async () => {
    setIsResearching(true);
    try {
      const { run, candidates: results } = await ScholarshipResearchService.startResearch({
        category: 'All',
        studyLevel: 'all',
        providerFocus: 'all'
      });
      setCurrentRun(run);
      setCandidates(results);
    } catch (e) {
      console.error('Error during initial discovery:', e);
    } finally {
      setIsResearching(false);
    }
  };

  const handleStartResearch = async (e?: React.FormEvent, overrideParams?: { category?: UniversalCategory; query?: string }) => {
    if (e) e.preventDefault();
    setIsResearching(true);
    setFeedback(null);

    const categoryToUse = overrideParams?.category || selectedCategory;
    const queryToUse = overrideParams?.query !== undefined ? overrideParams.query : searchQuery;

    try {
      const { run, candidates: results } = await ScholarshipResearchService.startResearch({
        category: categoryToUse,
        studyLevel,
        providerFocus,
        query: queryToUse
      });
      setCurrentRun(run);
      setCandidates(results);
      setFeedback({
        type: 'success',
        message: `Discovery complete! Found ${results.length} legitimate opportunities across ${categoryToUse === 'All' ? 'all universal categories' : categoryToUse}.`
      });
      loadPastRuns();
    } catch (e: any) {
      setFeedback({
        type: 'error',
        message: `Research run encountered an error: ${e.message || 'Network error'}`
      });
    } finally {
      setIsResearching(false);
    }
  };

  const handleRecheckDeadlines = async () => {
    setIsRechecking(true);
    setFeedback(null);
    try {
      const summary = await ScholarshipResearchService.recheckDeadlines();
      setRecheckResult(summary);
      setFeedback({
        type: 'info',
        message: `Audit complete: ${summary.checkedCount} opportunities checked. ${summary.closedCount} marked as closed.`
      });
    } catch (e) {
      setFeedback({
        type: 'error',
        message: 'Failed to execute deadline recheck.'
      });
    } finally {
      setIsRechecking(false);
    }
  };

  const handlePublish = async (candidate: DiscoveredOpportunityCandidate) => {
    setPublishingId(candidate.id);
    setFeedback(null);

    const author = {
      email: currentUser?.email || 'admin@opportunityghana.com',
      name: currentUser?.name || currentUser?.email?.split('@')[0] || 'Administrator'
    };

    try {
      const result = await ScholarshipResearchService.publishOpportunity(candidate, author);
      if (result.success && result.opportunity) {
        const publishedSlug = result.slug || result.opportunity.slug;

        // Update local state
        setCandidates(prev =>
          prev.map(c =>
            c.id === candidate.id || c.title === candidate.title
              ? {
                  ...c,
                  status: 'published',
                  verificationStatus: 'verified',
                  publishedSlug,
                  publishedOpportunityId: result.opportunity?.id
                }
              : c
          )
        );

        if (selectedCandidate && selectedCandidate.id === candidate.id) {
          setSelectedCandidate({
            ...selectedCandidate,
            status: 'published',
            verificationStatus: 'verified',
            publishedSlug
          });
        }

        setFeedback({
          type: 'success',
          message: `Successfully verified and published "${candidate.title}" to the public platform!`,
          liveUrl: `/opportunities/${publishedSlug}`,
          slug: publishedSlug
        });
      } else {
        setFeedback({
          type: 'error',
          message: result.error || 'Failed to publish opportunity. Please check network or review credentials.'
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Publication error occurred.'
      });
    } finally {
      setPublishingId(null);
    }
  };

  const handleReject = (candidateId: string) => {
    setCandidates(prev =>
      prev.map(c => (c.id === candidateId ? { ...c, status: 'archived' } : c))
    );
    if (selectedCandidate && selectedCandidate.id === candidateId) {
      setSelectedCandidate(null);
    }
    setFeedback({
      type: 'info',
      message: 'Candidate rejected and permanently excluded from public listings.'
    });
  };

  const handleSaveEditedCandidate = () => {
    if (!editedCandidate) return;
    setCandidates(prev =>
      prev.map(c => (c.id === editedCandidate.id ? editedCandidate : c))
    );
    setSelectedCandidate(editedCandidate);
    setIsEditingCandidate(false);
    setFeedback({
      type: 'success',
      message: 'Candidate details updated. Ready to verify and publish.'
    });
  };

  // Filter pipeline
  const filteredCandidates = candidates.filter(c => {
    // Status tab
    if (filterTab === 'pending' && c.status !== 'pending_review') return false;
    if (filterTab === 'published' && c.status !== 'published') return false;
    if (filterTab === 'rejected' && c.status !== 'archived') return false;

    // Category filter
    if (categoryFilter !== 'All') {
      const cNorm = c.category.toLowerCase();
      const filterNorm = categoryFilter.toLowerCase();
      if (!cNorm.includes(filterNorm) && !filterNorm.includes(cNorm)) return false;
    }

    // Eligibility filter
    if (eligibilityFilter === 'confirmed' && !c.ghanaEligibilityConfirmed) return false;
    if (eligibilityFilter === 'unknown' && c.ghanaEligibilityConfirmed) return false;

    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#131926] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F0EB] text-[#006B3F] text-xs font-bold mb-3 border border-[#006B3F]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Universal Opportunity Discovery & Verification Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white font-space tracking-tight">
            Universal Opportunity Research & Publishing
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Live discovery pipeline that searches the web for verified scholarships, grants, internships, jobs, university admissions, fellowships, competitions, and bootcamps with confirmed Ghanaian eligibility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRecheckDeadlines}
            disabled={isRechecking}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 text-slate-500 ${isRechecking ? 'animate-spin' : ''}`} />
            <span>{isRechecking ? 'Auditing All Deadlines...' : 'Recheck Active Deadlines'}</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner with Direct Live Link */}
      {feedback && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
            feedback.type === 'success'
              ? 'bg-[#E6F0EB] border-[#006B3F]/30 text-[#006B3F]'
              : feedback.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#006B3F]" />
            ) : feedback.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
            ) : (
              <Info className="w-5 h-5 shrink-0 text-blue-600" />
            )}
            <div className="text-xs sm:text-sm font-bold">
              <span>{feedback.message}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {feedback.liveUrl && (
              <button
                onClick={() => onNavigate(feedback.liveUrl!)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#006B3F] hover:bg-[#005632] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Live on Website</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setFeedback(null)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Research Controls Card */}
      <div className="bg-white dark:bg-[#131926] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <h2 className="text-base font-bold text-[#111111] dark:text-white font-space flex items-center gap-2">
            <Search className="w-4 h-4 text-[#006B3F]" />
            <span>Launch Real-Time Opportunity Discovery Run</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Queries live web with Google Search & official Tier-1 provider registries
          </span>
        </div>

        {/* Quick Presets Pills */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Quick Discovery Presets:
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_QUERIES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedCategory(preset.category as UniversalCategory);
                  setSearchQuery(preset.query);
                  handleStartResearch(undefined, {
                    category: preset.category as UniversalCategory,
                    query: preset.query
                  });
                }}
                disabled={isResearching}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-[#E6F0EB] hover:border-[#006B3F]/40 hover:text-[#006B3F] text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={e => handleStartResearch(e)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Opportunity Category
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as UniversalCategory)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] outline-none transition-all"
            >
              {CATEGORY_OPTIONS.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Target Level / Candidate Scope
            </label>
            <select
              value={studyLevel}
              onChange={e => setStudyLevel(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] outline-none transition-all"
            >
              <option value="all">All Levels / Open Eligibility</option>
              <option value="undergraduate">Undergraduate Students</option>
              <option value="masters">Master's / Postgraduates</option>
              <option value="phd">PhD / Doctoral Researchers</option>
              <option value="fellowship">Postdoctoral & Fellowship</option>
              <option value="entry_level">Fresh Graduates & National Service</option>
              <option value="mid_level">Experienced Professionals</option>
              <option value="student">High School / WASSCE Leavers</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Provider Scope
            </label>
            <select
              value={providerFocus}
              onChange={e => setProviderFocus(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] outline-none transition-all"
            >
              <option value="all">All Official Providers</option>
              <option value="government">Government & Bilateral (Secretariat, NEIP, GEA)</option>
              <option value="universities">Universities (UG, KNUST, Ashesi)</option>
              <option value="foundations">Foundations (Mastercard, Tony Elumelu, DAAD)</option>
              <option value="corporate">Corporate Employers (MTN, Ecobank, Unilever)</option>
              <option value="international">Multilateral / International (EU, UN, AfDB)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Keyword Filter (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. AgriTech, STEM, Cloud, Fully Funded"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] outline-none transition-all"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-2">
            <button
              type="submit"
              disabled={isResearching}
              className="inline-flex items-center justify-center gap-2 py-3 px-6 text-xs font-bold text-white bg-[#006B3F] hover:bg-[#005632] rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isResearching ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Researching Universal Opportunities across Web...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Discovery Run ({selectedCategory})</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Current Run Audit Info */}
        {currentRun && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#006B3F]" />
              <span>Run ID: <strong className="font-mono text-slate-800 dark:text-slate-200">{currentRun.id}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Category: <strong>{currentRun.category || 'All'}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Official Portals Checked: <strong>{currentRun.sourcesChecked.length}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Total Discovered: <strong>{currentRun.opportunitiesFound}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 text-[11px]">
                Tier 1 & Tier 2 Verified
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Verification Queue & Results */}
      <div className="space-y-4">
        {/* Filter Controls Header */}
        <div className="bg-white dark:bg-[#131926] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#111111] dark:text-white font-space">
                Admin Verification Queue ({filteredCandidates.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect details, confirm Ghanaian eligibility, and verify official links before publishing live.
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterTab === 'all'
                    ? 'bg-white dark:bg-slate-700 text-[#006B3F] dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All ({candidates.length})
              </button>
              <button
                onClick={() => setFilterTab('pending')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterTab === 'pending'
                    ? 'bg-white dark:bg-slate-700 text-[#006B3F] dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Pending Verification ({candidates.filter(c => c.status === 'pending_review').length})
              </button>
              <button
                onClick={() => setFilterTab('published')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterTab === 'published'
                    ? 'bg-white dark:bg-slate-700 text-[#006B3F] dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Published Live ({candidates.filter(c => c.status === 'published').length})
              </button>
              <button
                onClick={() => setFilterTab('rejected')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterTab === 'rejected'
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Archived ({candidates.filter(c => c.status === 'archived').length})
              </button>
            </div>
          </div>

          {/* Sub-Filters: Category & Ghana Eligibility */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600 dark:text-slate-400">Category:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
              >
                <option value="All">All Categories</option>
                {CATEGORY_OPTIONS.filter(c => c.id !== 'All').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600 dark:text-slate-400">Ghana Eligibility:</span>
              <select
                value={eligibilityFilter}
                onChange={e => setEligibilityFilter(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
              >
                <option value="all">All Eligibility</option>
                <option value="confirmed">Confirmed Only</option>
                <option value="unknown">Needs Confirmation</option>
              </select>
            </div>
          </div>
        </div>

        {/* Candidate List */}
        <div className="space-y-4">
          {filteredCandidates.map(candidate => {
            const isPublished = candidate.status === 'published';
            const isArchived = candidate.status === 'archived';
            const isCurrentlyPublishing = publishingId === candidate.id;
            const deadlineInfo = calculateDeadlineInfo(candidate.deadline);

            return (
              <div
                key={candidate.id}
                className="bg-white dark:bg-[#131926] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs hover:border-[#006B3F]/40 transition-all space-y-5"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {/* Universal Category Badge */}
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#E6F0EB] text-[#006B3F] border border-[#006B3F]/20">
                        {candidate.category}
                      </span>
                      {candidate.studyLevel && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {candidate.studyLevel}
                        </span>
                      )}
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#FEF9E7] text-[#9A7B00] border border-[#FCD116]/40">
                        {candidate.fundingType}
                      </span>
                      {candidate.academicYear && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Cycle {candidate.academicYear}
                        </span>
                      )}
                      {candidate.duplicateStatus === 'existing_match' && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Existing Record Matched
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#111111] dark:text-white font-space tracking-tight">
                      {candidate.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{candidate.providerName}</strong>
                      <span className="text-slate-300">•</span>
                      <span>{candidate.location}</span>
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isPublished ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E6F0EB] text-[#006B3F] font-bold text-xs border border-[#006B3F]/30">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Published & Live</span>
                        </span>
                        {candidate.publishedSlug && (
                          <button
                            onClick={() => onNavigate(`/opportunities/${candidate.publishedSlug}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-300"
                            title="View Public Page"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#006B3F]" />
                            <span>View</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-300 dark:border-amber-800">
                        <Clock className="w-4 h-4" />
                        <span>Pending Admin Verification</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Structured Verification Summary Box */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-[11px]">
                  {/* 1. Ghana Eligible */}
                  <div className="space-y-0.5">
                    <span className="text-slate-400 dark:text-slate-500 block font-medium">Ghana Eligible</span>
                    {candidate.ghanaEligibilityConfirmed ? (
                      <span className="text-[#006B3F] dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Confirmed
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Unknown
                      </span>
                    )}
                  </div>

                  {/* 2. Official Source */}
                  <div className="space-y-0.5">
                    <span className="text-slate-400 dark:text-slate-500 block font-medium">Official Source</span>
                    <span className="text-[#006B3F] dark:text-emerald-400 font-bold flex items-center gap-1 truncate">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      {candidate.sourceTier === 'tier1_official_provider' ? 'Tier 1 Provider' : 'Tier 2 Government'}
                    </span>
                  </div>

                  {/* 3. Official Portal Link */}
                  <div className="space-y-0.5">
                    <span className="text-slate-400 dark:text-slate-500 block font-medium">Official Portal Link</span>
                    <span className="text-[#006B3F] dark:text-emerald-400 font-bold flex items-center gap-1 truncate">
                      <Check className="w-3.5 h-3.5 shrink-0" /> Verified Portal
                    </span>
                  </div>

                  {/* 4. Dynamic Deadline Verified */}
                  <div className="space-y-0.5">
                    <span className="text-slate-400 dark:text-slate-500 block font-medium">Deadline Verified</span>
                    <span className="text-slate-900 dark:text-white font-bold block truncate">
                      {new Date(candidate.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-[#006B3F] dark:text-emerald-400 font-semibold block">
                      {deadlineInfo.label}
                    </span>
                  </div>

                  {/* 5. Image Rights */}
                  <div className="space-y-0.5">
                    <span className="text-slate-400 dark:text-slate-500 block font-medium">Image Rights</span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-[#006B3F]" /> Attributed
                    </span>
                  </div>

                  {/* 6. Last Checked */}
                  <div className="space-y-0.5">
                    <span className="text-slate-400 dark:text-slate-500 block font-medium">Last Checked</span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono font-bold">
                      {candidate.sourceLastChecked || '2026-10-02'}
                    </span>
                  </div>
                </div>

                {/* Dual Evidence Links Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 text-xs">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <a
                      href={candidate.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#006B3F] hover:underline font-bold"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Official Source ({candidate.sourceName})</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={candidate.officialApplicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-[#006B3F] font-bold hover:underline"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Official Application Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setIsEditingCandidate(false);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                    >
                      Inspect Full Details
                    </button>

                    {!isPublished && (
                      <button
                        onClick={() => handlePublish(candidate)}
                        disabled={isCurrentlyPublishing}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#006B3F] hover:bg-[#005632] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {isCurrentlyPublishing ? (
                          <>
                            <RotateCw className="w-4 h-4 animate-spin" />
                            <span>Publishing Live...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Verify & Publish</span>
                          </>
                        )}
                      </button>
                    )}

                    {!isArchived && (
                      <button
                        onClick={() => handleReject(candidate.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Archive / Reject Candidate"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredCandidates.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-[#131926] rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 space-y-2">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                No opportunities match the selected criteria
              </p>
              <p className="text-xs">Launch a research discovery run above or adjust your filter selection.</p>
            </div>
          )}
        </div>
      </div>

      {/* Inspect & Edit Full Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131926] rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-[#006B3F] bg-[#E6F0EB] px-2.5 py-0.5 rounded-full">
                    {selectedCandidate.category}
                  </span>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
                    {selectedCandidate.fundingType}
                  </span>
                  {selectedCandidate.academicYear && (
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      Cycle {selectedCandidate.academicYear}
                    </span>
                  )}
                </div>

                {!isEditingCandidate ? (
                  <h3 className="text-xl font-bold text-[#111111] dark:text-white font-space mt-2">
                    {selectedCandidate.title}
                  </h3>
                ) : (
                  <input
                    type="text"
                    value={editedCandidate?.title || ''}
                    onChange={e => setEditedCandidate(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full text-lg font-bold mt-2 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                )}

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Offered by <strong>{selectedCandidate.providerName}</strong> ({selectedCandidate.location})
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!isEditingCandidate ? (
                  <button
                    onClick={() => {
                      setEditedCandidate({ ...selectedCandidate });
                      setIsEditingCandidate(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Before Publishing</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSaveEditedCandidate}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#006B3F] text-white text-xs font-bold shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border-t border-b border-slate-100 dark:border-slate-800 py-4">
              <div>
                <strong className="text-slate-900 dark:text-white block font-space mb-1">
                  About the Opportunity:
                </strong>
                <p>{selectedCandidate.description}</p>
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block font-space mb-1">
                  Eligibility Criteria & Ghanaian Verification:
                </strong>
                <div className="p-3 rounded-xl bg-[#E6F0EB]/60 dark:bg-emerald-950/30 border border-[#006B3F]/20 text-slate-800 dark:text-slate-200">
                  <p>{selectedCandidate.eligibilityDescription}</p>
                </div>
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block font-space mb-1">
                  What It Covers / Funding Breakdown:
                </strong>
                <p className="text-slate-800 dark:text-slate-200 font-semibold mb-1">
                  {selectedCandidate.fundingDetails}
                </p>
                {selectedCandidate.benefits && selectedCandidate.benefits.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedCandidate.benefits.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block font-space mb-1">
                  Application Requirements & Instructions:
                </strong>
                <p>{selectedCandidate.applicationInstructions}</p>
                {selectedCandidate.requirements && selectedCandidate.requirements.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    {selectedCandidate.requirements.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl space-y-1.5 font-mono text-[11px]">
                <p>
                  <span className="text-slate-400">Official Application Portal:</span>{' '}
                  <a
                    href={selectedCandidate.officialApplicationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#006B3F] dark:text-emerald-400 underline break-all"
                  >
                    {selectedCandidate.officialApplicationUrl}
                  </a>
                </p>
                <p>
                  <span className="text-slate-400">Official Announcement Page:</span>{' '}
                  <a
                    href={selectedCandidate.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#006B3F] dark:text-emerald-400 underline break-all"
                  >
                    {selectedCandidate.sourceUrl}
                  </a>
                </p>
                <p>
                  <span className="text-slate-400">Media Attribution:</span>{' '}
                  {selectedCandidate.imageSourceName || 'Official Program Media (Attributed)'}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3">
              <div>
                {selectedCandidate.status === 'published' && selectedCandidate.publishedSlug && (
                  <button
                    onClick={() => {
                      onNavigate(`/opportunities/${selectedCandidate.publishedSlug}`);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B3F] hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Live Listing on Public Site</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Close
                </button>

                {selectedCandidate.status !== 'published' && (
                  <button
                    onClick={() => {
                      handlePublish(selectedCandidate);
                    }}
                    disabled={publishingId === selectedCandidate.id}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006B3F] hover:bg-[#005632] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {publishingId === selectedCandidate.id ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Publishing to Public Website...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify & Publish Live Now</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
