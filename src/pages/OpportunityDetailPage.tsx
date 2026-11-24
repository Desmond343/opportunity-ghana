import React, { useEffect, useState } from 'react';
import { Opportunity } from '../types/database';
import { OpportunitiesService } from '../services/opportunitiesService';
import { SavedService } from '../services/savedService';
import { useAuth } from '../services/authContext';
import { DeadlineBadge } from '../components/common/DeadlineBadge';
import { LoadingState, EmptyState } from '../components/common/CommonUI';
import {
  calculateDeadlineInfo,
  useDeadlineInfo,
  useCurrentTime,
  getOpportunityLifecycleStatus,
  getReopeningInfo
} from '../services/deadlineService';
import { EditorialParagraphs } from '../components/common/EditorialArticle';
import {
  MapPin,
  CalendarClock,
  Building,
  ExternalLink,
  ChevronRight,
  Share2,
  Bookmark,
  Clock,
  Archive,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

interface OpportunityDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const OpportunityDetailPage: React.FC<OpportunityDetailPageProps> = ({ slug, onNavigate }) => {
  const { currentUser, getIdToken, isEditorOrAdmin } = useAuth();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [alternatives, setAlternatives] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const now = useCurrentTime();
  const deadlineInfo = useDeadlineInfo(opportunity?.deadline);

  useEffect(() => {
    async function loadOpportunity() {
      setLoading(true);
      try {
        const item = await OpportunitiesService.getBySlug(slug);
        if (item?.institutionSlug) {
          onNavigate(`/institutions/${item.institutionSlug}`);
          return;
        }
        setOpportunity(item);
        if (item) {
          setIsSaved(SavedService.isSaved(item.id));
          OpportunitiesService.recordView(item.id);

          const allOpps = await OpportunitiesService.getAll({ category: item.category, onlyActive: true });
          const filtered = allOpps.filter((o) => o.id !== item.id).slice(0, 3);
          setAlternatives(filtered);
        }
      } catch (e) {
        console.error('Error fetching opportunity detail:', e);
      } finally {
        setLoading(false);
      }
    }
    loadOpportunity();
  }, [slug]);

  useEffect(() => {
    if (opportunity?.id) {
      setIsSaved(SavedService.isSaved(opportunity.id));
    }
    const handleUpdate = (e: CustomEvent<{ id?: string; userId?: string }> | Event) => {
      if (!opportunity) return;
      const detail = (e as CustomEvent)?.detail;
      if (!detail || detail.id === opportunity.id || detail.userId !== undefined) {
        setIsSaved(SavedService.isSaved(opportunity.id));
      }
    };
    window.addEventListener('saved-opportunities-changed', handleUpdate);
    return () => window.removeEventListener('saved-opportunities-changed', handleUpdate);
  }, [opportunity?.id]);

  const handleToggleSave = async () => {
    if (!opportunity || isSaving) return;
    setIsSaving(true);
    try {
      const updated = await SavedService.toggleSave(
        {
          id: opportunity.id,
          slug: opportunity.slug,
          title: opportunity.title,
          category: opportunity.category,
          type: opportunity.opportunityType,
          organizationName: opportunity.organizationName,
          deadline: opportunity.deadline
        },
        currentUser?.id,
        getIdToken
      );
      setIsSaved(updated);
    } catch (err: any) {
      console.warn('Save error on detail page:', err?.message || err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading opportunity details..." />;
  }

  if (!opportunity) {
    return (
      <EmptyState
        title="Opportunity not found"
        description="The opportunity record you requested may have been archived or moved."
        actionText="Browse Opportunities"
        onAction={() => onNavigate('/opportunities')}
      />
    );
  }

  const isPendingOrUnpublished = opportunity.status !== 'published' && opportunity.status !== 'closed';
  const isSubmitterOrAdmin =
    isEditorOrAdmin ||
    (currentUser &&
      (currentUser.id === opportunity.submittedBy || currentUser.email === opportunity.submittedByEmail));

  if (isPendingOrUnpublished && !isSubmitterOrAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <EmptyState
          title="Submission Awaiting Review"
          description="This listing is currently awaiting verification before publication."
          actionText="Browse Open Opportunities"
          onAction={() => onNavigate('/opportunities')}
        />
      </div>
    );
  }

  const lifecycle = getOpportunityLifecycleStatus(opportunity, now);
  const reopening = getReopeningInfo(opportunity);
  const isClosed = lifecycle.isClosed;
  const isUpcoming = lifecycle.isUpcoming;
  const applyHref = opportunity.officialApplicationUrl || opportunity.applicationUrl;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': opportunity.category === 'Jobs' ? 'JobPosting' : 'EducationalOccupationalProgram',
            title: opportunity.title,
            description: opportunity.description,
            datePosted: opportunity.publishedAt || opportunity.createdAt,
            validThrough: opportunity.deadline,
            hiringOrganization: {
              '@type': 'Organization',
              name: opportunity.organizationName || 'Ghana Partner'
            },
            jobLocation: {
              '@type': 'Place',
              address: {
                '@type': 'PostalAddress',
                addressLocality: opportunity.location,
                addressCountry: 'GH'
              }
            }
          })
        }}
      />

      {/* Pending Banner */}
      {isPendingOrUnpublished && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              <strong>Status: {opportunity.status === 'rejected' ? 'Rejected' : 'Pending Review'}.</strong> Not yet public.
            </span>
          </div>
          {isEditorOrAdmin && (
            <button
              onClick={() => onNavigate('/admin/submissions')}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-semibold cursor-pointer"
            >
              Review Console
            </button>
          )}
        </div>
      )}

      {/* Compact Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap">
        <button onClick={() => onNavigate('/')} className="hover:text-[#006B3F] dark:hover:text-emerald-400 cursor-pointer">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <button onClick={() => onNavigate('/opportunities')} className="hover:text-[#006B3F] dark:hover:text-emerald-400 cursor-pointer">
          Opportunities
        </button>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <button
          onClick={() => onNavigate(`/opportunities?category=${encodeURIComponent(opportunity.category)}`)}
          className="hover:text-[#006B3F] dark:hover:text-emerald-400 cursor-pointer"
        >
          {opportunity.category}
        </button>
      </nav>

      {/* CLOSED BANNER */}
      {isClosed && (
        <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Archive className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                Closed{reopening.previousDeadlineFormatted ? ` · Previous deadline: ${reopening.previousDeadlineFormatted}` : ''}
              </p>
              <p className="text-xs text-slate-300">
                {reopening.headline}. {reopening.message}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate(`/opportunities?category=${encodeURIComponent(opportunity.category)}&status=open`)}
            className="px-3.5 py-2 bg-[#006B3F] hover:bg-[#005530] text-white font-semibold text-xs rounded-lg shrink-0 cursor-pointer min-h-[40px]"
          >
            Open {opportunity.category}
          </button>
        </div>
      )}

      {/* UPCOMING BANNER */}
      {!isClosed && isUpcoming && (
        <div className="p-4 rounded-xl bg-sky-950 text-white border border-sky-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <CalendarClock className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">
                Upcoming{lifecycle.opensFormatted ? ` · Opens ${lifecycle.opensFormatted}` : ''}
              </p>
              <p className="text-xs text-sky-100">
                Applications have not opened yet
                {deadlineInfo.targetDate ? ` and close on ${deadlineInfo.formattedDeadline}` : ''}.
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleSave}
            disabled={isSaving}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg shrink-0 cursor-pointer min-h-[40px]"
          >
            {isSaved ? 'Saved' : 'Save Reminder'}
          </button>
        </div>
      )}

      {/* HEADER SUMMARY CARD */}
      <section className="bg-white dark:bg-[#141B29] rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-[#006B3F] dark:text-emerald-400">
            <span>{opportunity.category}</span>
            {opportunity.opportunityType && opportunity.opportunityType !== opportunity.category && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-slate-600 dark:text-slate-300">{opportunity.opportunityType}</span>
              </>
            )}
          </div>
          <DeadlineBadge
            deadline={opportunity.deadline}
            isDeadlineSpecified={opportunity.isDeadlineSpecified}
            status={opportunity.status}
            openingDate={opportunity.openingDate}
            previousDeadline={opportunity.previousDeadline}
            nextOpeningDate={opportunity.nextOpeningDate}
            nextOpeningType={opportunity.nextOpeningType}
            nextOpeningNote={opportunity.nextOpeningNote}
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
            {opportunity.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Building className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{opportunity.organizationName}</span>
            </span>
            {opportunity.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{opportunity.location}</span>
              </span>
            )}
          </div>
        </div>

        {/* Primary CTA Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {!isClosed ? (
            <a
              href={applyHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] text-xs sm:text-sm font-semibold text-white rounded-lg transition-colors cursor-pointer ${
                isUpcoming
                  ? 'bg-sky-700 hover:bg-sky-800'
                  : 'bg-[#006B3F] hover:bg-[#005530]'
              }`}
            >
              <span>
                {isUpcoming && lifecycle.opensFormatted
                  ? `Official Portal (Opens ${lifecycle.opensFormatted})`
                  : 'Apply on Official Portal'}
              </span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <button
              disabled
              className="flex-1 sm:flex-initial inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] text-xs sm:text-sm font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-not-allowed"
            >
              Application Closed
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleSave}
            disabled={isSaving}
            className={`min-h-[44px] px-3.5 py-2 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
              isSaved
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-[#006B3F] dark:text-emerald-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </section>

      {/* CLEAN SINGLE-FLOW CONTENT SECTIONS */}
      <div className="space-y-4">
        {/* 1. OVERVIEW */}
        <section className="bg-white dark:bg-[#141B29] rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-2.5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Overview
          </h2>
          <EditorialParagraphs text={opportunity.description} />
        </section>

        {/* 2. ELIGIBILITY */}
        <section className="bg-white dark:bg-[#141B29] rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Eligibility
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Nationality
              </dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                {opportunity.nationality || 'Ghanaian Citizens & Residents'}
              </dd>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Level
              </dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                {opportunity.studyLevel || opportunity.educationLevel || opportunity.experienceLevel || 'Open to qualified applicants'}
              </dd>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Location / Format
              </dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                {opportunity.workArrangement || opportunity.location || opportunity.region || 'Ghana'}
              </dd>
            </div>
          </dl>
        </section>

        {/* 3. BENEFITS */}
        {(opportunity.benefits?.length || opportunity.fundingType || opportunity.salary || opportunity.stipend) && (
          <section className="bg-white dark:bg-[#141B29] rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-2.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Benefits
            </h2>
            {(opportunity.fundingType || opportunity.salary || opportunity.stipend) && (
              <p className="text-xs sm:text-sm font-medium text-[#006B3F] dark:text-emerald-400">
                {opportunity.salary || opportunity.stipend || opportunity.fundingType}
              </p>
            )}
            {opportunity.benefits && opportunity.benefits.length > 0 && (
              <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-200 list-disc pl-5">
                {opportunity.benefits.map((benefit, i) => (
                  <li key={i}>{benefit}</li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* 4. REQUIREMENTS */}
        {(opportunity.requirements?.length ||
          opportunity.documentsRequired?.length ||
          opportunity.responsibilities?.length ||
          opportunity.applicationInstructions) && (
          <section className="bg-white dark:bg-[#141B29] rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Requirements
            </h2>

            {opportunity.requirements && opportunity.requirements.length > 0 && (
              <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-200 list-disc pl-5">
                {opportunity.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            )}

            {opportunity.responsibilities && opportunity.responsibilities.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Key Responsibilities
                </h3>
                <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-200 list-disc pl-5">
                  {opportunity.responsibilities.map((resp, i) => (
                    <li key={i}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {opportunity.documentsRequired && opportunity.documentsRequired.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Required Documents
                </h3>
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-200 list-disc pl-5">
                  {opportunity.documentsRequired.map((doc, i) => (
                    <li key={i}>{doc}</li>
                  ))}
                </ul>
              </div>
            )}

            {opportunity.applicationInstructions && (
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  How to Apply
                </h3>
                <EditorialParagraphs text={opportunity.applicationInstructions} />
              </div>
            )}
          </section>
        )}

        {/* 5. DEADLINE & OFFICIAL APPLICATION LINK */}
        <section className="bg-white dark:bg-[#141B29] rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Deadline
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            {lifecycle.opensFormatted && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 block">
                  Opening Date
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                  {lifecycle.opensFormatted}
                </span>
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 block">
                {isClosed ? 'Previous Deadline' : 'Application Deadline'}
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                {isClosed
                  ? reopening.previousDeadlineFormatted || deadlineInfo.formattedDeadline
                  : opportunity.isDeadlineSpecified === false
                  ? 'Rolling basis / Not specified'
                  : deadlineInfo.formattedDeadline}
              </span>
            </div>
          </div>

          {isClosed && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
              <p className="font-semibold text-slate-900 dark:text-white">
                Next Expected Cycle: {reopening.headline}
              </p>
              <p>{reopening.message}</p>
            </div>
          )}

          <div className="pt-1 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex flex-wrap items-center gap-3">
              {opportunity.sourceUrl && (
                <a
                  href={opportunity.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#006B3F] dark:text-emerald-400 hover:underline font-medium inline-flex items-center gap-1"
                >
                  <span>Official Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <span>Never pay any application fee.</span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/admin/reports')}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </button>
          </div>
        </section>

        {/* ACTIVE ALTERNATIVES WHEN CLOSED */}
        {isClosed && alternatives.length > 0 && (
          <section className="bg-white dark:bg-[#141B29] rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Open {opportunity.category} Alternatives
              </h2>
              <button
                onClick={() => onNavigate(`/opportunities?category=${encodeURIComponent(opportunity.category)}&status=open`)}
                className="text-xs font-semibold text-[#006B3F] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {alternatives.map((alt) => (
                <button
                  key={alt.id}
                  type="button"
                  onClick={() => onNavigate(`/opportunities/${alt.slug || alt.id}`)}
                  className="w-full py-2.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {alt.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {alt.organizationName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <DeadlineBadge deadline={alt.deadline} status={alt.status} statusOnly />
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
