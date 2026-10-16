import React, { useState, useEffect } from 'react';
import { SuccessStory } from '../types/database';
import { SuccessStoriesService, usePublishedStories } from '../services/successStoriesService';
import { useAuth } from '../services/authContext';
import {
  Award,
  ArrowLeft,
  Quote,
  Building,
  GraduationCap,
  ExternalLink,
  Sparkles,
  Share2,
  Calendar,
  CheckCircle2,
  Briefcase,
  Search,
  BookOpen
} from 'lucide-react';

interface SuccessStoriesPageProps {
  onNavigate: (path: string) => void;
  initialStorySlug?: string;
}

export const SuccessStoriesPage: React.FC<SuccessStoriesPageProps> = ({
  onNavigate,
  initialStorySlug
}) => {
  const { isEditorOrAdmin } = useAuth();
  const { stories, count, isLoading } = usePublishedStories();
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // If 0 published stories and not an admin previewing, redirect to home
  useEffect(() => {
    if (!isLoading && count === 0 && !isEditorOrAdmin) {
      onNavigate('/');
    }
  }, [count, isLoading, isEditorOrAdmin, onNavigate]);

  // Open specific story from initialStorySlug or URL query
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const slug = initialStorySlug || searchParams.get('story');
    if (slug && stories.length > 0) {
      const found = stories.find(s => s.slug === slug || s.id === slug);
      if (found) {
        setSelectedStory(found);
      }
    }
  }, [initialStorySlug, stories]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If 0 stories, render null while redirecting
  if (count === 0 && !isEditorOrAdmin) {
    return null;
  }

  const filteredStories = stories.filter((story) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      story.title.toLowerCase().includes(q) ||
      story.storytellerName.toLowerCase().includes(q) ||
      story.benefitedOpportunityTitle.toLowerCase().includes(q) ||
      (story.institutionOrCareer && story.institutionOrCareer.toLowerCase().includes(q)) ||
      story.content.toLowerCase().includes(q)
    );
  });

  const handleShare = (story: SuccessStory) => {
    const url = `${window.location.origin}/success-stories?story=${story.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 animate-in fade-in">
      {/* Top Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-[#006B3F] dark:text-emerald-300">
          <Award className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
          <span>Authenticated Alumnus Journeys</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111111] dark:text-white font-space tracking-tight">
          Real People. Real Opportunities. Real Journeys.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Discover how Ghanaian students, graduates, and professionals turned verified scholarships, internships, and courses into life-changing milestones.
        </p>

        {/* Search input */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search stories by person, opportunity, or institution..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#141B29] text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Admin Notice if 0 published */}
      {isEditorOrAdmin && count === 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <p className="font-bold text-amber-900 dark:text-amber-200">
              Admin Notice: Success Stories section is currently hidden from the public.
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              There are currently 0 published stories. Regular users are redirected away. Publish at least 1 story in the Admin Console to reveal this section publicly.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/admin/success-stories')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Open Success Stories CMS
          </button>
        </div>
      )}

      {/* Stories Grid */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-[#141B29] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            No published stories matched your search term "{searchQuery}".
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-[#006B3F] dark:text-emerald-400 hover:underline cursor-pointer"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStories.map((story) => (
            <article
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="group bg-white dark:bg-[#141B29] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 hover:border-emerald-500/50 dark:hover:border-emerald-600/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
            >
              <div className="space-y-5">
                {/* Header with Avatar & Name */}
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 dark:border-emerald-800 text-[#006B3F] dark:text-emerald-400 flex items-center justify-center font-bold text-base overflow-hidden shrink-0 shadow-2xs">
                    {story.storytellerAvatar ? (
                      <img
                        src={story.storytellerAvatar}
                        alt={story.storytellerName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initial on broken image
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      story.storytellerName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 transition-colors truncate font-space">
                      {story.storytellerName}
                    </h3>
                    {story.storytellerRole && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {story.storytellerRole}
                      </p>
                    )}
                    {story.institutionOrCareer && (
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium truncate flex items-center gap-1 mt-0.5">
                        <GraduationCap className="w-3 h-3 shrink-0" />
                        {story.institutionOrCareer}
                      </p>
                    )}
                  </div>
                </div>

                {/* Benefited Opportunity Badge */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-100 dark:border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#006B3F] dark:text-emerald-400" />
                    Benefited From
                  </span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {story.benefitedOpportunityTitle}
                  </p>
                </div>

                {/* Story Title & Quote */}
                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-space line-clamp-2 leading-snug">
                    {story.title}
                  </h4>
                  {story.quote && (
                    <blockquote className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-3 leading-relaxed relative pl-3 border-l-2 border-[#006B3F] dark:border-emerald-400">
                      "{story.quote}"
                    </blockquote>
                  )}
                  {!story.quote && story.content && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {story.content}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-5">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006B3F] dark:text-emerald-400 group-hover:underline">
                  Read Full Journey
                  <ExternalLink className="w-3 h-3" />
                </span>
                {story.publishedAt && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(story.publishedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Story Detail Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 dark:border-emerald-800 text-[#006B3F] dark:text-emerald-400 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 shadow-sm">
                  {selectedStory.storytellerAvatar ? (
                    <img
                      src={selectedStory.storytellerAvatar}
                      alt={selectedStory.storytellerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedStory.storytellerName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-space">
                    {selectedStory.storytellerName}
                  </h2>
                  {selectedStory.storytellerRole && (
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {selectedStory.storytellerRole}
                    </p>
                  )}
                  {selectedStory.institutionOrCareer && (
                    <p className="text-xs text-[#006B3F] dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {selectedStory.institutionOrCareer}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedStory(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Opportunity Reference Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#006B3F] dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#006B3F] dark:text-emerald-400" />
                  Verified Beneficiary Opportunity
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {selectedStory.benefitedOpportunityTitle}
                </p>
              </div>
              {selectedStory.benefitedOpportunityId && (
                <button
                  onClick={() => {
                    setSelectedStory(null);
                    onNavigate(`/opportunities/${selectedStory.benefitedOpportunityId}`);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-[#006B3F] dark:text-emerald-300 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
                >
                  View Listing
                </button>
              )}
            </div>

            {/* Highlight Quote */}
            {selectedStory.quote && (
              <div className="bg-slate-50 dark:bg-[#0B0F17] rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 relative">
                <Quote className="w-6 h-6 text-[#006B3F] dark:text-emerald-400 opacity-30 mb-1" />
                <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 italic leading-relaxed font-space">
                  "{selectedStory.quote}"
                </p>
              </div>
            )}

            {/* Main Narrative Body */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-space">
                {selectedStory.title}
              </h3>
              <p>{selectedStory.content}</p>
            </div>

            {/* Key Takeaways & Practical Advice */}
            {selectedStory.keyTakeaways && selectedStory.keyTakeaways.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2.5">
                <h4 className="text-xs font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-space">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Key Takeaways For Ghanaian Applicants
                </h4>
                <ul className="space-y-1.5">
                  {selectedStory.keyTakeaways.map((tip, idx) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 mt-1.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleShare(selectedStory)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copied ? 'Link Copied!' : 'Share Story'}
              </button>
              <button
                onClick={() => setSelectedStory(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
