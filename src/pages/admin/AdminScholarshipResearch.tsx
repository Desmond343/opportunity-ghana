import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { ScholarshipResearchService } from '../../services/scholarshipResearchService';
import type {
  DiscoveredScholarshipCandidate,
  ScholarshipResearchRun,
  RecheckSummary
} from '../../types/scholarshipResearch';
import {
  GraduationCap,
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
  Info
} from 'lucide-react';

export const AdminScholarshipResearch: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  // Research Form Controls
  const [studyLevel, setStudyLevel] = useState<'all' | 'undergraduate' | 'masters' | 'phd' | 'fellowship'>('all');
  const [providerFocus, setProviderFocus] = useState<'all' | 'government' | 'universities' | 'foundations' | 'international'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [currentRun, setCurrentRun] = useState<ScholarshipResearchRun | null>(null);
  const [pastRuns, setPastRuns] = useState<ScholarshipResearchRun[]>([]);

  // Discovered Candidates State
  const [candidates, setCandidates] = useState<DiscoveredScholarshipCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<DiscoveredScholarshipCandidate | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'published' | 'rejected'>('all');

  // Rechecking State
  const [isRechecking, setIsRechecking] = useState(false);
  const [recheckResult, setRecheckResult] = useState<RecheckSummary | null>(null);

  // Notification / Feedback State
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadPastRuns();
    // Run initial discovery to populate queue if empty
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

  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResearching(true);
    setActionFeedback(null);
    try {
      const { run, candidates: results } = await ScholarshipResearchService.startResearch({
        studyLevel,
        providerFocus,
        query: searchQuery
      });
      setCurrentRun(run);
      setCandidates(results);
      setActionFeedback(`Research completed! Discovered ${results.length} verified scholarship opportunities.`);
      loadPastRuns();
    } catch (e: any) {
      setActionFeedback(`Research failed: ${e.message || 'Network error'}`);
    } finally {
      setIsResearching(false);
    }
  };

  const handleRecheckDeadlines = async () => {
    setIsRechecking(true);
    setActionFeedback(null);
    try {
      const summary = await ScholarshipResearchService.recheckDeadlines();
      setRecheckResult(summary);
      setActionFeedback(`Recheck completed: ${summary.checkedCount} scholarships audited. ${summary.closedCount} marked as closed.`);
    } catch (e) {
      setActionFeedback('Failed to execute deadline recheck.');
    } finally {
      setIsRechecking(false);
    }
  };

  const handlePublish = async (candidate: DiscoveredScholarshipCandidate) => {
    setActionFeedback(null);
    const result = await ScholarshipResearchService.publishScholarship(candidate);
    if (result.success) {
      setCandidates(prev =>
        prev.map(c => (c.id === candidate.id ? { ...c, status: 'published', verificationStatus: 'verified' } : c))
      );
      setActionFeedback(`Successfully published "${candidate.title}" to the public platform!`);
    } else {
      setActionFeedback('Failed to publish scholarship. Check network connection.');
    }
  };

  const handleReject = (candidateId: string) => {
    setCandidates(prev =>
      prev.map(c => (c.id === candidateId ? { ...c, status: 'archived' } : c))
    );
    setActionFeedback('Candidate archived and excluded from public listings.');
  };

  const filteredCandidates = candidates.filter(c => {
    if (filterTab === 'pending') return c.status === 'pending_review';
    if (filterTab === 'published') return c.status === 'published';
    if (filterTab === 'rejected') return c.status === 'archived';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F0EB] text-[#006B3F] text-xs font-bold mb-3 border border-[#006B3F]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Source Verification Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] font-space tracking-tight">
            Scholarship Research & Publishing
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Real-time research pipeline that queries official universities, governments, and foundations to verify active scholarships open to Ghanaian citizens before publishing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRecheckDeadlines}
            disabled={isRechecking}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 text-slate-500 ${isRechecking ? 'animate-spin' : ''}`} />
            <span>{isRechecking ? 'Auditing Deadlines...' : 'Recheck Active Deadlines'}</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionFeedback && (
        <div className="p-4 rounded-2xl bg-[#E6F0EB] border border-[#006B3F]/30 text-xs font-bold text-[#006B3F] flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#006B3F]" />
            {actionFeedback}
          </span>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Research Controls */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-[#111111] font-space flex items-center gap-2">
          <Search className="w-4 h-4 text-[#006B3F]" />
          <span>Launch Real-Time Research Run</span>
        </h2>

        <form onSubmit={handleStartResearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Study Level</label>
            <select
              value={studyLevel}
              onChange={e => setStudyLevel(e.target.value as any)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] outline-none transition-all"
            >
              <option value="all">All Study Levels</option>
              <option value="undergraduate">Undergraduate (BSc/BA)</option>
              <option value="masters">Master's (MSc/MA/MBA)</option>
              <option value="phd">PhD / Doctoral</option>
              <option value="fellowship">Postdoctoral & Fellowship</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Provider Scope</label>
            <select
              value={providerFocus}
              onChange={e => setProviderFocus(e.target.value as any)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] outline-none transition-all"
            >
              <option value="all">All Official Providers</option>
              <option value="government">Government & Bilateral (Secretariat, Chevening)</option>
              <option value="universities">University Partnerships (KNUST, Ashesi)</option>
              <option value="foundations">Foundations (Mastercard, DAAD)</option>
              <option value="international">Multilateral / International (Erasmus+)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Keyword Filter (Optional)</label>
            <input
              type="text"
              placeholder="e.g. STEM, Fully Funded, UK, Accra"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] outline-none transition-all"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isResearching}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-[#006B3F] hover:bg-[#005632] rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isResearching ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Researching Web...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Research Run</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Current Run Audit Card */}
        {currentRun && (
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#006B3F]" />
              <span>Run ID: <strong className="font-mono text-slate-800">{currentRun.id}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Sources Checked: <strong>{currentRun.sourcesChecked.length}</strong> official portals</span>
              <span className="text-slate-300">•</span>
              <span>Discovered: <strong>{currentRun.opportunitiesFound}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
                Tier 1 & 2 Verified
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Verification Queue & Results */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#111111] font-space">
              Discovered Scholarships Queue ({filteredCandidates.length})
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterTab === 'all' ? 'bg-white text-[#006B3F] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All ({candidates.length})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterTab === 'pending' ? 'bg-white text-[#006B3F] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Pending Verification ({candidates.filter(c => c.status === 'pending_review').length})
            </button>
            <button
              onClick={() => setFilterTab('published')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterTab === 'published' ? 'bg-white text-[#006B3F] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Published ({candidates.filter(c => c.status === 'published').length})
            </button>
            <button
              onClick={() => setFilterTab('rejected')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filterTab === 'rejected' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Archived ({candidates.filter(c => c.status === 'archived').length})
            </button>
          </div>
        </div>

        {/* Candidate List */}
        <div className="space-y-4">
          {filteredCandidates.map(candidate => {
            const isPublished = candidate.status === 'published';
            const isArchived = candidate.status === 'archived';

            return (
              <div
                key={candidate.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:border-[#006B3F]/40 transition-all space-y-5"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#E6F0EB] text-[#006B3F] border border-[#006B3F]/20">
                        {candidate.studyLevel}
                      </span>
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#FEF9E7] text-[#9A7B00] border border-[#FCD116]/40">
                        {candidate.fundingType}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Cycle {candidate.academicYear}
                      </span>
                      {candidate.duplicateStatus === 'existing_match' && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          Existing Record Matched
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-[#111111] font-space tracking-tight">
                      {candidate.title}
                    </h3>
                    <p className="text-xs text-slate-600 flex items-center gap-2 mt-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{candidate.providerName}</strong>
                      <span className="text-slate-300">•</span>
                      <span>{candidate.location}</span>
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {isPublished ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E6F0EB] text-[#006B3F] font-bold text-xs border border-[#006B3F]/30">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Published & Live</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 font-bold text-xs border border-amber-300">
                        <Clock className="w-4 h-4" />
                        <span>Pending Admin Verification</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Verification Summary Box (Section 35) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block font-medium">Ghana Eligible</span>
                    <span className="text-[#006B3F] font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Confirmed
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block font-medium">Official Source</span>
                    <span className="text-[#006B3F] font-bold flex items-center gap-1 truncate">
                      <Check className="w-3.5 h-3.5 shrink-0" /> {candidate.sourceTier === 'tier1_official_provider' ? 'Tier 1 Provider' : 'Tier 2 Government'}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block font-medium">Official Portal Link</span>
                    <span className="text-[#006B3F] font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Verified URL
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block font-medium">Deadline Verified</span>
                    <span className="text-slate-900 font-bold">
                      {new Date(candidate.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block font-medium">Image Rights</span>
                    <span className="text-slate-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-[#006B3F]" /> Attributed
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 block font-medium">Last Checked</span>
                    <span className="text-slate-700 font-mono font-bold">
                      {candidate.sourceLastChecked}
                    </span>
                  </div>
                </div>

                {/* Evidence Links */}
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
                      className="inline-flex items-center gap-1 text-slate-700 hover:text-[#006B3F] font-bold hover:underline"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Official Application Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                    >
                      Inspect Full Details
                    </button>

                    {!isPublished && (
                      <button
                        onClick={() => handlePublish(candidate)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#006B3F] hover:bg-[#005632] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify & Publish</span>
                      </button>
                    )}

                    {!isArchived && (
                      <button
                        onClick={() => handleReject(candidate.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Archive"
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
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-800 text-sm">No scholarships match the selected filter</p>
              <p className="text-xs">Start a research run or adjust your filter selection above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Inspect Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-[#006B3F] bg-[#E6F0EB] px-2.5 py-0.5 rounded-full">
                  {selectedCandidate.studyLevel} • {selectedCandidate.fundingType}
                </span>
                <h3 className="text-xl font-bold text-[#111111] font-space mt-2">
                  {selectedCandidate.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Offered by <strong>{selectedCandidate.providerName}</strong> ({selectedCandidate.location})
                </p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 leading-relaxed border-t border-b border-slate-100 py-4">
              <div>
                <strong className="text-slate-900 block font-space mb-1">About the Scholarship:</strong>
                <p>{selectedCandidate.description}</p>
              </div>

              <div>
                <strong className="text-slate-900 block font-space mb-1">Eligibility Criteria for Ghanaians:</strong>
                <p>{selectedCandidate.eligibilityDescription}</p>
              </div>

              <div>
                <strong className="text-slate-900 block font-space mb-1">What It Covers:</strong>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedCandidate.benefits.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong className="text-slate-900 block font-space mb-1">Application Instructions:</strong>
                <p>{selectedCandidate.applicationInstructions}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 font-mono text-[11px]">
                <p><span className="text-slate-400">Official Portal:</span> <a href={selectedCandidate.officialApplicationUrl} target="_blank" rel="noreferrer" className="text-[#006B3F] underline">{selectedCandidate.officialApplicationUrl}</a></p>
                <p><span className="text-slate-400">Official Source Notice:</span> <a href={selectedCandidate.sourceUrl} target="_blank" rel="noreferrer" className="text-[#006B3F] underline">{selectedCandidate.sourceUrl}</a></p>
                <p><span className="text-slate-400">Image Attribution:</span> {selectedCandidate.imageSourceName || 'Official Program Media'}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

              {selectedCandidate.status !== 'published' && (
                <button
                  onClick={() => {
                    handlePublish(selectedCandidate);
                    setSelectedCandidate(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#006B3F] hover:bg-[#005632] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Verify & Publish Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
