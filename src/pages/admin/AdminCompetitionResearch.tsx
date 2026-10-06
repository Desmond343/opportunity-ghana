import React, { useState, useEffect } from 'react';
import { useAuth } from '../../services/authContext';
import { CompetitionResearchService } from '../../services/competitionResearchService';
import type {
  DiscoveredCompetitionCandidate,
  CompetitionResearchRun,
  CompetitionRecheckSummary
} from '../../types/competitionResearch';
import {
  Trophy,
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
  MapPin,
  Mic,
  Music,
  Tv,
  Gamepad2,
  Terminal,
  Palette
} from 'lucide-react';

export const AdminCompetitionResearch: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  // Research Form Controls
  const [categoryFocus, setCategoryFocus] = useState<string>('all');
  const [regionFocus, setRegionFocus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [currentRun, setCurrentRun] = useState<CompetitionResearchRun | null>(null);
  const [pastRuns, setPastRuns] = useState<CompetitionResearchRun[]>([]);

  // Discovered Candidates State
  const [candidates, setCandidates] = useState<DiscoveredCompetitionCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<DiscoveredCompetitionCandidate | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'published' | 'rejected'>('all');

  // Rechecking State
  const [isRechecking, setIsRechecking] = useState(false);
  const [recheckResult, setRecheckResult] = useState<CompetitionRecheckSummary | null>(null);

  // Notification / Feedback State
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<DiscoveredCompetitionCandidate>>({});

  useEffect(() => {
    loadPastRuns();
    runInitialDiscovery();
  }, []);

  const loadPastRuns = async () => {
    const runs = await CompetitionResearchService.getRuns();
    setPastRuns(runs);
  };

  const runInitialDiscovery = async () => {
    setIsResearching(true);
    try {
      const { run, candidates: results } = await CompetitionResearchService.startResearch({
        categoryFocus: 'all',
        regionFocus: 'all'
      });
      setCurrentRun(run);
      setCandidates(results);
    } catch (e) {
      console.error('Error during initial competition discovery:', e);
    } finally {
      setIsResearching(false);
    }
  };

  const handleStartResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResearching(true);
    setActionFeedback(null);
    try {
      const { run, candidates: results } = await CompetitionResearchService.startResearch({
        categoryFocus: categoryFocus as any,
        regionFocus: regionFocus as any,
        query: searchQuery
      });
      setCurrentRun(run);
      setCandidates(results);
      setActionFeedback(`Research completed! Discovered ${results.length} verified competitions & talent opportunities.`);
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
      const summary = await CompetitionResearchService.recheckDeadlines();
      setRecheckResult(summary);
      setActionFeedback(`Deadline audit complete: ${summary.checkedCount} competitions audited. ${summary.closedCount} marked as closed.`);
    } catch (e) {
      setActionFeedback('Failed to execute competition deadline recheck.');
    } finally {
      setIsRechecking(false);
    }
  };

  const handlePublish = async (candidate: DiscoveredCompetitionCandidate) => {
    setActionFeedback(null);
    const result = await CompetitionResearchService.publishCompetition(candidate);
    if (result.success) {
      setCandidates(prev =>
        prev.map(c => (c.id === candidate.id ? { ...c, status: 'published', verificationStatus: 'verified' } : c))
      );
      if (selectedCandidate?.id === candidate.id) {
        setSelectedCandidate(prev => prev ? { ...prev, status: 'published', verificationStatus: 'verified' } : null);
      }
      setActionFeedback(`Successfully published "${candidate.title}" to public listings! Available immediately on Competitions page.`);
    } else {
      setActionFeedback('Failed to publish competition. Check network connection.');
    }
  };

  const handleReject = async (candidateId: string) => {
    await CompetitionResearchService.rejectCompetition(candidateId);
    setCandidates(prev =>
      prev.map(c => (c.id === candidateId ? { ...c, status: 'rejected' } : c))
    );
    if (selectedCandidate?.id === candidateId) {
      setSelectedCandidate(prev => prev ? { ...prev, status: 'rejected' } : null);
    }
    setActionFeedback('Opportunity rejected and permanently excluded from public listings.');
  };

  const openInspection = (candidate: DiscoveredCompetitionCandidate) => {
    setSelectedCandidate(candidate);
    setEditForm({ ...candidate });
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (!selectedCandidate) return;
    const updated = { ...selectedCandidate, ...editForm } as DiscoveredCompetitionCandidate;
    setSelectedCandidate(updated);
    setCandidates(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    setIsEditing(false);
    setActionFeedback('Candidate details updated locally. Click "Verify & Publish" to push to live database.');
  };

  const filteredCandidates = candidates.filter(c => {
    if (filterTab === 'pending') return c.status === 'pending_review' || c.status === 'draft';
    if (filterTab === 'published') return c.status === 'published' || c.status === 'approved';
    if (filterTab === 'rejected') return c.status === 'rejected' || c.status === 'archived';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold mb-3 border border-rose-200">
            <Trophy className="w-3.5 h-3.5" />
            <span>Nationwide Competition & Talent Discovery Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] font-space tracking-tight">
            Competitions & Talent Show Verification
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Continuously discover, inspect, and verify legitimate academic contests, talent searches, music reality shows, sports tournaments, hackathons, and creative challenges across Ghana.
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
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Recheck Summary Banner */}
      {recheckResult && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#FCD116]" />
            <div>
              <p className="text-sm font-bold">Deadline Audit Results</p>
              <p className="text-xs text-slate-300">
                Audited {recheckResult.checkedCount} competitions. {recheckResult.activeCount} remain open. {recheckResult.closedCount} marked as closed. {recheckResult.flaggedCount} closing within 3 days.
              </p>
            </div>
          </div>
          <button
            onClick={() => setRecheckResult(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Discovery & Research Filter Panel */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs">
        <form onSubmit={handleStartResearch} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#006B3F]" />
              <h2 className="text-sm font-bold text-slate-900 font-space uppercase tracking-wider">
                Run Discovery & Web Verification Search
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Grounded in official portals & broadcast schedules
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category Focus
              </label>
              <select
                value={categoryFocus}
                onChange={(e) => setCategoryFocus(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#006B3F] focus:outline-none"
              >
                <option value="all">All Competitions & Talent</option>
                <option value="talent_shows">Talent Shows & Searches</option>
                <option value="music_singing">Music & Singing</option>
                <option value="dance">Dance Competitions</option>
                <option value="acting_theatre">Acting & Theatre</option>
                <option value="poetry_comedy">Poetry, Spoken Word & Comedy</option>
                <option value="creative_arts_film">Creative Arts, Design & Film</option>
                <option value="fashion_beauty">Fashion, Modeling & Beauty</option>
                <option value="sports">Sports & Tournaments</option>
                <option value="esports_gaming">Esports & Gaming</option>
                <option value="tech_hackathons">Tech Hackathons & Coding</option>
                <option value="business_pitch">Business Plan & Pitch Contests</option>
                <option value="academic_quizzes">Academic Quizzes & Debates</option>
                <option value="science_research">Science & STEM Challenges</option>
                <option value="agriculture_environment">AgriTech & Climate</option>
                <option value="youth_social_impact">Youth & Social Impact</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Regional Focus
              </label>
              <select
                value={regionFocus}
                onChange={(e) => setRegionFocus(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#006B3F] focus:outline-none"
              >
                <option value="all">All Ghana & Nationwide</option>
                <option value="Greater Accra">Greater Accra</option>
                <option value="Ashanti">Ashanti Region</option>
                <option value="Northern">Northern Region</option>
                <option value="Central">Central Region</option>
                <option value="Western">Western Region</option>
                <option value="Online">Online / Virtual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Custom Search Query
              </label>
              <input
                type="text"
                placeholder="e.g. NSMQ, TV3 Talented Kidz, Hackathon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#006B3F] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isResearching}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold transition-all shadow-md hover:shadow-emerald-900/30 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 text-[#FCD116] ${isResearching ? 'animate-spin' : ''}`} />
              <span>{isResearching ? 'Running Discovery Engine...' : 'Search & Discover Competitions'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Candidates Tabs & Table View */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Filter Tabs */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            {(['all', 'pending', 'published', 'rejected'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  filterTab === tab
                    ? 'bg-[#111111] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab === 'all' ? `All (${candidates.length})` : tab}
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Showing {filteredCandidates.length} discovered candidates
          </div>
        </div>

        {/* Candidates List */}
        <div className="divide-y divide-slate-100">
          {filteredCandidates.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No competition candidates match this filter</p>
              <p className="text-xs text-slate-500">Run a discovery search above to populate the verification queue.</p>
            </div>
          ) : (
            filteredCandidates.map(candidate => (
              <div
                key={candidate.id}
                className="p-4 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* Visual Thumbnail & Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200 relative">
                    <img
                      src={candidate.imageUrl}
                      alt={candidate.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-space">
                        {candidate.subcategory}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {candidate.competitionType}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {candidate.region}
                      </span>
                      {candidate.status === 'published' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                          Live on Public Site
                        </span>
                      )}
                      {candidate.status === 'rejected' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white">
                          Rejected / Hidden
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {candidate.title}
                    </h3>

                    <p className="text-xs text-slate-500 flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-slate-700">{candidate.organizerName}</span>
                      <span>•</span>
                      <span className="text-amber-800 font-medium">Prize: {candidate.prize || 'Verified Awards'}</span>
                      <span>•</span>
                      <span className="text-slate-500">Deadline: {new Date(candidate.deadline).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                {/* Verification Actions */}
                <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                  <button
                    onClick={() => openInspection(candidate)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer shadow-xs"
                  >
                    Inspect Details
                  </button>

                  {candidate.status !== 'published' ? (
                    <button
                      onClick={() => handlePublish(candidate)}
                      className="px-4 py-2 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5 text-[#FCD116]" />
                      <span>Verify &amp; Publish</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate(`/opportunities/${candidate.slug}`)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>View Live Listing</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {candidate.status !== 'rejected' && (
                    <button
                      onClick={() => handleReject(candidate.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                      title="Reject and exclude from public listings"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detailed Inspection & Verification Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full my-8 overflow-hidden shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="bg-slate-950 p-6 text-white relative">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/10 text-rose-300 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FCD116]" />
                  <span>Editorial Verification Dossier</span>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-lg sm:text-xl font-bold mt-3 font-space">
                {selectedCandidate.title}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Organized by {selectedCandidate.organizerName} • Category: {selectedCandidate.subcategory}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Media Preview & African Representation Check */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 relative h-48 sm:h-64">
                <img
                  src={selectedCandidate.imageUrl}
                  alt={selectedCandidate.title}
                  className="w-full h-full object-cover object-[center_30%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                  <div className="text-white text-xs">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#006B3F]" />
                      <span>Dedicated African / Ghanaian Photography</span>
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Source: {selectedCandidate.imageSourceName || 'Opportunity Ghana Licensed Media'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
                  <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Ghanaian Eligibility</span>
                  </p>
                  <p className="text-xs text-emerald-800">
                    {selectedCandidate.eligibilityDescription || 'Explicitly verified open to Ghanaian participants'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    <span>Verified Deadline</span>
                  </p>
                  <p className="text-xs text-slate-800 font-semibold">
                    {new Date(selectedCandidate.deadline).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Key Opportunity Metadata */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-space">
                  Opportunity Summary
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  {selectedCandidate.description}
                </p>
              </div>

              {/* Financial & Prizes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Prize &amp; Benefits</p>
                  <p className="text-sm font-bold text-emerald-800">{selectedCandidate.prize}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Entry Fee</p>
                  <p className="text-sm font-bold text-slate-800">{selectedCandidate.entryFee || 'Free'}</p>
                </div>
              </div>

              {/* Verified External URLs */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase">Official Provenance</p>
                <div className="flex flex-col gap-2">
                  <a
                    href={selectedCandidate.officialApplicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-[#006B3F] flex items-center justify-between"
                  >
                    <span>Official Registration Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {selectedCandidate.sourceUrl && (
                    <a
                      href={selectedCandidate.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between"
                    >
                      <span>Organizer Source / Announcement ({selectedCandidate.sourceName})</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
              <button
                onClick={() => handleReject(selectedCandidate.id)}
                className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 cursor-pointer"
              >
                Reject &amp; Hide From Public
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => handlePublish(selectedCandidate)}
                  className="px-6 py-2.5 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#FCD116]" />
                  <span>Verify &amp; Publish Live</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
