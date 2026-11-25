import React, { useEffect, useMemo, useState } from 'react';
import { Opportunity } from '../types/database';
import { OpportunitiesService } from '../services/opportunitiesService';
import { SavedService } from '../services/savedService';
import { useAuth } from '../services/authContext';
import { DeadlineBadge } from '../components/common/DeadlineBadge';
import { LoadingState, EmptyState } from '../components/common/CommonUI';
import {
  useDeadlineInfo,
  useCurrentTime,
  getOpportunityLifecycleStatus,
  getReopeningInfo
} from '../services/deadlineService';
import { EditorialParagraphs } from '../components/common/EditorialArticle';
import { resolveOpportunityHeroMedia } from '../utils/opportunityHeroMedia';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  MapPin,
  CalendarClock,
  Building,
  ExternalLink,
  ChevronRight,
  Share2,
  Bookmark,
  Clock,
  Archive,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  FileText,
  Globe,
  GraduationCap,
  ShieldCheck,
  Coins,
  Laptop,
  Award,
  Mail,
  Phone,
  Sparkles,
  Calendar
} from 'lucide-react';

interface OpportunityDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

type CategoryKind =
  | 'jobs'
  | 'scholarships'
  | 'internships'
  | 'fellowships'
  | 'grants'
  | 'training'
  | 'competitions'
  | 'government'
  | 'entrepreneurship'
  | 'general';

function classifyCategoryKind(opp: Opportunity): CategoryKind {
  const cat = (opp.category || '').toLowerCase();
  const type = (opp.opportunityType || '').toLowerCase();

  if (cat.includes('scholarship') || cat.includes('study abroad') || cat.includes('admission')) {
    return 'scholarships';
  }
  if (cat.includes('intern') || cat.includes('graduate program') || type.includes('graduate trainee')) {
    return 'internships';
  }
  if (cat.includes('job') || cat === 'careers') {
    return 'jobs';
  }
  if (cat.includes('fellowship')) {
    return 'fellowships';
  }
  if (cat.includes('grant')) {
    return 'grants';
  }
  if (cat.includes('train') || cat.includes('course')) {
    return 'training';
  }
  if (cat.includes('competi') || cat.includes('contest') || cat.includes('hackathon')) {
    return 'competitions';
  }
  if (cat.includes('gov') || cat.includes('public')) {
    return 'government';
  }
  if (cat.includes('entrepreneur') || cat.includes('startup')) {
    return 'entrepreneurship';
  }
  return 'general';
}

function extractHeroLead(description?: string): string {
  if (!description) return '';
  const cleaned = description.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 210) return cleaned;
  // Take up to first two sentences if concise, otherwise trim gracefully
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [];
  const firstSentence = sentences[0]?.trim();
  const secondSentence = sentences[1]?.trim();
  if (firstSentence) {
    let lead = firstSentence;
    if (lead.length < 110 && secondSentence && lead.length + secondSentence.length <= 230) {
      lead = `${lead} ${secondSentence}`;
    }
    if (lead.length <= 235) return lead;
  }
  const truncated = cleaned.slice(0, 205);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${lastSpace > 120 ? truncated.slice(0, lastSpace) : truncated}...`;
}

function resolveWorkArrangementLabel(opp: Opportunity): string | null {
  if (opp.workArrangement) return opp.workArrangement;
  const lt = (opp.locationType || '').toLowerCase();
  if (lt === 'online' || lt === 'remote') return 'Remote / Online';
  if (lt === 'hybrid') return 'Hybrid';
  if (lt === 'physical' || lt === 'ghana') return 'On-site';
  if (lt === 'abroad') return 'In-person (Abroad)';
  return null;
}

function resolveCompensationSummary(opp: Opportunity): string | null {
  if (opp.salary) {
    const currencyPrefix =
      opp.salaryCurrency && !opp.salary.toUpperCase().includes(opp.salaryCurrency.toUpperCase())
        ? `${opp.salaryCurrency} `
        : '';
    const freqSuffix =
      opp.salaryFrequency && !opp.salary.toLowerCase().includes(opp.salaryFrequency.toLowerCase())
        ? ` / ${opp.salaryFrequency}`
        : '';
    return `${currencyPrefix}${opp.salary}${freqSuffix}`.trim();
  }
  if (opp.fundingAmount) return opp.fundingAmount;
  if (opp.stipend) return opp.stipend;
  if (opp.funding) return opp.funding;
  if (opp.fundingType) return opp.fundingType;
  if (opp.internshipType && opp.internshipType !== 'Not Specified') {
    return `${opp.internshipType} Internship`;
  }
  return null;
}

function formatDomainHost(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return url;
  }
}

function formatReadableDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function getDynamicSectionCopy(kind: CategoryKind, opp: Opportunity) {
  switch (kind) {
    case 'jobs':
      return {
        eyebrow: '03 / Role Scope & Rewards',
        heading: 'Responsibilities, Skills & Benefits',
        leftHeading: 'Key Responsibilities',
        rightHeading: 'Career Development & Employee Benefits',
        compensationHeading: 'Compensation & Work Support',
        emptyLeftFallback: `Join ${opp.organizationName || 'the team'} in ${opp.location || 'Ghana'} as ${opp.title}, contributing directly to core departmental deliverables and operational excellence.`
      };
    case 'scholarships':
      return {
        eyebrow: '03 / Award Coverage & Criteria',
        heading: 'Scholarship Benefits & Eligible Programmes',
        leftHeading: 'Financial Coverage & Allowances',
        rightHeading: 'Eligible Programmes & Selection Criteria',
        compensationHeading: 'Tuition, Stipend & Travel Support',
        emptyLeftFallback: opp.funding || opp.fundingType || 'Refer to the official scholarship portal for full award disbursement details.'
      };
    case 'internships':
      return {
        eyebrow: '03 / Training & Progression',
        heading: 'Learning Opportunities, Duties & Benefits',
        leftHeading: 'Learning Opportunities & Expected Duties',
        rightHeading: 'Programme Duration, Compensation & Benefits',
        compensationHeading: 'Duration & Career Progression',
        emptyLeftFallback: `Gain practical industry exposure at ${opp.organizationName || 'the host organisation'} while working alongside experienced professionals.`
      };
    case 'fellowships':
      return {
        eyebrow: '03 / Fellowship Experience',
        heading: 'Fellowship Benefits, Outcomes & Support',
        leftHeading: 'Fellowship Benefits & Cohort Support',
        rightHeading: 'Programme Expectations & Impact',
        compensationHeading: 'Funding & Duration',
        emptyLeftFallback: 'Structured mentorship, leadership development, and peer network access throughout the fellowship cycle.'
      };
    case 'grants':
    case 'entrepreneurship':
      return {
        eyebrow: '03 / Funding & Venture Support',
        heading: 'Funding Benefits & Programme Scope',
        leftHeading: 'Grant Awards & Venture Support',
        rightHeading: 'Participation Focus & Deliverables',
        compensationHeading: 'Funding Package',
        emptyLeftFallback: opp.funding || opp.fundingAmount || opp.fundingType || 'Direct financial or technical support for eligible projects and ventures.'
      };
    case 'training':
      return {
        eyebrow: '03 / Curriculum & Outcomes',
        heading: 'Training Benefits & Learning Outcomes',
        leftHeading: 'What You Will Gain',
        rightHeading: 'Modules, Expectations & Format',
        compensationHeading: 'Programme Schedule & Support',
        emptyLeftFallback: 'Hands-on training designed to build practical, career-ready capabilities.'
      };
    case 'competitions':
      return {
        eyebrow: '03 / Prizes & Participation',
        heading: 'Prizes, Benefits & Competition Scope',
        leftHeading: 'Awards, Prizes & Recognition',
        rightHeading: 'Competition Format & Expectations',
        compensationHeading: 'Prize Pool & Tracks',
        emptyLeftFallback: opp.funding || opp.fundingType || 'Recognition, prizes, and advancement opportunities for top-performing participants.'
      };
    default:
      return {
        eyebrow: '03 / Scope & Value',
        heading: 'Programme Benefits & Expectations',
        leftHeading: 'Key Benefits & Support',
        rightHeading: 'Responsibilities & Outcomes',
        compensationHeading: 'Key Programme Terms',
        emptyLeftFallback: opp.funding || opp.fundingType || 'Official programme support and professional advancement opportunities.'
      };
  }
}

export const OpportunityDetailPage: React.FC<OpportunityDetailPageProps> = ({ slug, onNavigate }) => {
  const { currentUser, getIdToken, isEditorOrAdmin } = useAuth();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [relatedOpportunities, setRelatedOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [heroImgStage, setHeroImgStage] = useState<'primary' | 'fallback' | 'none'>('primary');
  const now = useCurrentTime();
  const deadlineInfo = useDeadlineInfo(opportunity?.deadline);

  useEffect(() => {
    setHeroImgStage('primary');
    window.scrollTo({ top: 0, behavior: 'auto' });

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

          // Load 3-4 related active opportunities: prefer same category, backfill from active pool
          const sameCategory = await OpportunitiesService.getAll({
            category: item.category,
            onlyActive: true
          });
          const sameCatFiltered = sameCategory.filter(
            (o) => o.id !== item.id && !o.institutionSlug
          );

          let combined = sameCatFiltered.slice(0, 4);
          if (combined.length < 4) {
            const allActive = await OpportunitiesService.getAll({ onlyActive: true });
            const existingIds = new Set([item.id, ...combined.map((o) => o.id)]);
            const backfill = allActive.filter(
              (o) => !existingIds.has(o.id) && !o.institutionSlug
            );
            combined = [...combined, ...backfill].slice(0, 4);
          }
          setRelatedOpportunities(combined);
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

  const heroMedia = useMemo(
    () => (opportunity ? resolveOpportunityHeroMedia(opportunity) : null),
    [opportunity]
  );

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

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      onNavigate('/opportunities');
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share && opportunity) {
      try {
        await navigator.share({
          title: opportunity.title,
          text: `${opportunity.title} — ${opportunity.organizationName || 'Opportunity Ghana'}`,
          url: shareUrl
        });
        return;
      } catch {
        // Fallback to clipboard copy
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Ignore clipboard failure silently
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const isPendingOrUnpublished =
    opportunity.status !== 'published' && opportunity.status !== 'closed';
  const isSubmitterOrAdmin =
    isEditorOrAdmin ||
    (currentUser &&
      (currentUser.id === opportunity.submittedBy ||
        currentUser.email === opportunity.submittedByEmail));

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
  const applyHref =
    opportunity.officialApplicationUrl ||
    opportunity.applicationUrl ||
    opportunity.employerWebsite ||
    opportunity.sourceUrl;
  const officialWebsiteHref =
    opportunity.employerWebsite || opportunity.sourceUrl || applyHref;

  const categoryKind = classifyCategoryKind(opportunity);
  const sectionCopy = getDynamicSectionCopy(categoryKind, opportunity);
  const heroLead = extractHeroLead(opportunity.description);
  const workArrangement = resolveWorkArrangementLabel(opportunity);
  const compensationSummary = resolveCompensationSummary(opportunity);
  const lastVerifiedFormatted = formatReadableDate(
    opportunity.lastVerifiedAt || opportunity.updatedAt
  );

  const deadlineText = isClosed
    ? reopening.previousDeadlineFormatted || deadlineInfo.formattedDeadline
    : opportunity.isDeadlineSpecified === false
    ? 'Rolling basis'
    : deadlineInfo.formattedDeadline;

  const activeHeroSrc =
    heroImgStage === 'primary'
      ? heroMedia?.primaryUrl
      : heroImgStage === 'fallback'
      ? heroMedia?.fallbackUrl
      : null;

  const infoItems: {
    label: string;
    value: string;
    icon: React.FC<{ className?: string }>;
    accent?: boolean;
  }[] = [
    {
      label: 'Category',
      value: opportunity.subcategory
        ? `${opportunity.category} · ${opportunity.subcategory}`
        : opportunity.category,
      icon: Briefcase
    },
    {
      label: 'Organisation',
      value: opportunity.organizationName || 'Verified Partner',
      icon: Building
    },
    {
      label: 'Location',
      value: opportunity.location || opportunity.region || opportunity.country || 'Ghana',
      icon: MapPin
    },
    {
      label: 'Opportunity Type',
      value:
        opportunity.employmentType ||
        opportunity.opportunityType ||
        opportunity.category,
      icon: Award
    },
    ...(workArrangement
      ? [
          {
            label: 'Work Arrangement',
            value: workArrangement,
            icon: Laptop
          }
        ]
      : []),
    {
      label:
        categoryKind === 'scholarships'
          ? 'Funding / Award'
          : categoryKind === 'grants' || categoryKind === 'competitions'
          ? 'Funding / Prize'
          : 'Salary / Stipend',
      value: compensationSummary || 'Not specified',
      icon: Coins,
      accent: Boolean(compensationSummary)
    },
    {
      label: isClosed ? 'Previous Deadline' : 'Application Deadline',
      value: deadlineText,
      icon: CalendarClock,
      accent: !isClosed && deadlineInfo.isClosingSoon
    }
  ];

  // Dynamic structured coverage items for Scholarships / Grants / Fellowships
  const coverageRows = [
    { label: 'Tuition & Academic Fees', value: opportunity.tuition },
    { label: 'Living Stipend / Salary', value: opportunity.stipend || (categoryKind !== 'jobs' ? opportunity.salary : undefined) },
    { label: 'Accommodation Support', value: opportunity.accommodation },
    { label: 'Travel & Airfare Allowance', value: opportunity.travel },
    { label: 'Funding Type & Amount', value: opportunity.fundingAmount || opportunity.funding || opportunity.fundingType },
    { label: 'Additional Allowances', value: opportunity.otherBenefits }
  ].filter((row) => Boolean(row.value));

  const applicationSteps = [
    {
      step: '01',
      title: 'Review Eligibility & Requirements',
      detail: `Confirm you meet the ${
        opportunity.educationLevel || opportunity.studyLevel || 'academic'
      } and ${opportunity.nationality || 'eligibility'} criteria before starting.`
    },
    {
      step: '02',
      title: 'Prepare Supporting Documents',
      detail:
        opportunity.documentsRequired && opportunity.documentsRequired.length > 0
          ? `Have your ${opportunity.documentsRequired.slice(0, 3).join(', ')}${
              opportunity.documentsRequired.length > 3 ? ', and supporting files' : ''
            } ready in PDF or portal format.`
          : 'Prepare an updated CV, academic transcripts, and any statement of purpose or references requested.'
    },
    {
      step: '03',
      title:
        opportunity.applicationMethod === 'email'
          ? 'Submit Application via Official Email'
          : opportunity.applicationMethod === 'in_person'
          ? 'Submit at Designated Office'
          : 'Apply via Official Application Portal',
      detail:
        opportunity.applicationInstructions ||
        `Submit your complete application through ${
          formatDomainHost(applyHref) || 'the official portal'
        } prior to ${deadlineText}.`
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type':
              opportunity.category === 'Jobs'
                ? 'JobPosting'
                : 'EducationalOccupationalProgram',
            title: opportunity.title,
            description: opportunity.description,
            datePosted: opportunity.publishedAt || opportunity.createdAt,
            validThrough: opportunity.deadline,
            hiringOrganization: {
              '@type': 'Organization',
              name: opportunity.organizationName || 'Opportunity Ghana Partner'
            },
            jobLocation: {
              '@type': 'Place',
              address: {
                '@type': 'PostalAddress',
                addressLocality: opportunity.location,
                addressCountry: opportunity.country || 'GH'
              }
            }
          })
        }}
      />

      {/* A. PROFESSIONAL CORPORATE CAREERS HERO SECTION */}
      <section
        className="relative w-full overflow-hidden bg-[#051811]"
        style={!activeHeroSrc ? { background: heroMedia?.gradient.cssGradient } : undefined}
      >
        {/* Background Image */}
        {activeHeroSrc && (
          <img
            src={activeHeroSrc}
            alt={heroMedia?.alt || opportunity.title}
            onError={() => {
              if (heroImgStage === 'primary' && heroMedia?.fallbackUrl && activeHeroSrc !== heroMedia.fallbackUrl) {
                setHeroImgStage('fallback');
              } else {
                setHeroImgStage('none');
              }
            }}
            className="absolute inset-0 w-full h-full object-cover object-[center_26%] select-none"
          />
        )}

        {/* High-contrast directional editorial scrim for clear text legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(95deg, rgba(4, 20, 14, 0.94) 0%, rgba(4, 24, 17, 0.86) 48%, rgba(6, 28, 20, 0.56) 100%)'
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(4, 18, 13, 0.55) 0%, rgba(4, 18, 13, 0.08) 45%, rgba(4, 18, 13, 0.85) 100%)'
          }}
        />

        {/* Hero Inner Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-10 sm:pb-14 lg:pb-16">
          {/* Top Utility Navigation & Breadcrumbs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 sm:pb-10 border-b border-white/15">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white/90 hover:text-white transition-colors cursor-pointer shrink-0 py-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <span className="h-4 w-px bg-white/25 shrink-0" aria-hidden="true" />

              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 text-xs text-slate-300 overflow-x-auto whitespace-nowrap"
              >
                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <button
                  type="button"
                  onClick={() => onNavigate('/opportunities')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Opportunities
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(
                      `/opportunities?category=${encodeURIComponent(opportunity.category)}`
                    )
                  }
                  className="text-emerald-300 hover:text-emerald-200 font-medium transition-colors cursor-pointer"
                >
                  {opportunity.category}
                </button>
              </nav>
            </div>

            {/* Save & Share Quick Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleToggleSave}
                disabled={isSaving}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-[#006B3F] border-emerald-400/60 text-[#FCD116]'
                    : 'bg-white/10 hover:bg-white/20 border-white/25 text-white backdrop-blur-sm'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="min-h-[38px] px-3.5 py-1.5 rounded-lg border border-white/25 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-1.5 backdrop-blur-sm transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'Link Copied' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Main Hero Typography & CTA */}
          <div className="pt-8 sm:pt-10 lg:pt-12 max-w-4xl space-y-5">
            {/* Organisation Identity Lockup */}
            <div className="flex flex-wrap items-center gap-3">
              {opportunity.organizationLogo && (
                <div className="w-11 h-11 rounded-lg bg-white p-1.5 shadow-sm flex items-center justify-center shrink-0">
                  <img
                    src={opportunity.organizationLogo}
                    alt={opportunity.organizationName || 'Organisation'}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-[#FCD116]">
                  {opportunity.organizationName || 'Verified Partner'}
                </p>
                <p className="text-xs text-slate-300 flex flex-wrap items-center gap-2">
                  <span>{opportunity.category}</span>
                  {opportunity.location && (
                    <>
                      <span className="text-white/35">·</span>
                      <span>{opportunity.location}</span>
                    </>
                  )}
                  {workArrangement && (
                    <>
                      <span className="text-white/35">·</span>
                      <span>{workArrangement}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Opportunity Headline */}
            <h1
              className="text-2xl sm:text-4xl lg:text-[2.75rem] font-bold text-white leading-[1.15] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              {opportunity.title}
            </h1>

            {/* Concise Engaging Summary */}
            {heroLead && (
              <p className="text-sm sm:text-base lg:text-[17px] text-slate-200 leading-relaxed max-w-3xl">
                {heroLead}
              </p>
            )}

            {/* Primary & Secondary Hero Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {!isClosed && applyHref ? (
                <a
                  href={applyHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[46px] text-sm font-bold rounded-lg shadow-sm transition-all cursor-pointer ${
                    isUpcoming
                      ? 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                      : 'bg-[#006B3F] hover:bg-emerald-600 text-white border border-emerald-400/30'
                  }`}
                >
                  <span>
                    {isUpcoming
                      ? 'Visit Official Website'
                      : opportunity.applicationUrl || opportunity.officialApplicationUrl
                      ? 'Apply Now'
                      : 'Visit Official Website'}
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(
                      `/opportunities?category=${encodeURIComponent(opportunity.category)}&status=open`
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[46px] text-sm font-bold rounded-lg bg-[#FCD116] hover:bg-yellow-300 text-slate-950 transition-colors cursor-pointer"
                >
                  <span>Browse Open {opportunity.category}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => scrollToSection('about-opportunity')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[46px] text-sm font-semibold rounded-lg border border-white/35 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors cursor-pointer"
              >
                <span>Learn More</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              {!isClosed && officialWebsiteHref && officialWebsiteHref !== applyHref && (
                <a
                  href={officialWebsiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-emerald-200 hover:text-white underline underline-offset-4 transition-colors"
                >
                  <span>Official Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <div className="sm:ml-auto">
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
            </div>
          </div>
        </div>
      </section>

      {/* STATUS & MODERATION STRIPS (When Pending / Closed / Upcoming) */}
      {(isPendingOrUnpublished || isClosed || (!isClosed && isUpcoming)) && (
        <div className="bg-slate-50 dark:bg-[#0E1522] border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-2.5">
            {isPendingOrUnpublished && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>
                      Status: {opportunity.status === 'rejected' ? 'Rejected' : 'Pending Review'}.
                    </strong>{' '}
                    This listing is not yet publicly visible.
                  </span>
                </div>
                {isEditorOrAdmin && (
                  <button
                    type="button"
                    onClick={() => onNavigate('/admin/submissions')}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-semibold cursor-pointer"
                  >
                    Review Console
                  </button>
                )}
              </div>
            )}

            {isClosed && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
                <div className="flex items-start gap-3">
                  <Archive className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Applications Closed
                      {reopening.previousDeadlineFormatted
                        ? ` · Previous deadline: ${reopening.previousDeadlineFormatted}`
                        : ''}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {reopening.headline}. {reopening.message}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(
                      `/opportunities?category=${encodeURIComponent(opportunity.category)}&status=open`
                    )
                  }
                  className="px-4 py-2 bg-[#006B3F] hover:bg-[#005530] text-white font-semibold text-xs rounded-lg shrink-0 cursor-pointer self-start sm:self-center"
                >
                  View Open {opportunity.category}
                </button>
              </div>
            )}

            {!isClosed && isUpcoming && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
                <div className="flex items-start gap-3">
                  <CalendarClock className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Upcoming Cycle
                      {lifecycle.opensFormatted ? ` · Opens ${lifecycle.opensFormatted}` : ''}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Applications have not opened yet
                      {deadlineInfo.targetDate ? ` and close on ${deadlineInfo.formattedDeadline}` : ''}.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-sky-700 hover:bg-sky-600 text-white font-semibold text-xs rounded-lg shrink-0 cursor-pointer self-start sm:self-center"
                >
                  {isSaved ? 'Saved for Reminder' : 'Save Reminder'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* B. OPPORTUNITY INFORMATION BAND */}
      <section
        aria-label="Opportunity key facts"
        className="bg-slate-50 dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <dl className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5">
            {infoItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="border-t border-slate-200 dark:border-slate-800 pt-3 min-w-0"
                >
                  <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Icon className="w-3.5 h-3.5 text-[#006B3F] dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </dt>
                  <dd
                    className={`mt-1 text-sm font-semibold leading-snug tabular-nums ${
                      item.accent
                        ? 'text-[#006B3F] dark:text-emerald-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {item.value}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {/* C. ABOUT THE OPPORTUNITY */}
      <section
        id="about-opportunity"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-b border-slate-200 dark:border-slate-800 scroll-mt-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Narrative Description */}
          <div className="lg:col-span-8 space-y-5">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006B3F] dark:text-emerald-400">
                01 / Overview
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                About the Opportunity
              </h2>
            </div>

            <div className="prose-like text-[15px] sm:text-base leading-relaxed text-slate-700 dark:text-slate-300">
              <EditorialParagraphs text={opportunity.description} />
            </div>

            {opportunity.fundingDetails && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Programme & Funding Context
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {opportunity.fundingDetails}
                </p>
              </div>
            )}
          </div>

          {/* Organisation & Verification Summary Sidebar */}
          <aside className="lg:col-span-4 bg-slate-50 dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-start gap-3.5">
              {opportunity.organizationLogo ? (
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1.5 shrink-0 flex items-center justify-center">
                  <img
                    src={opportunity.organizationLogo}
                    alt={opportunity.organizationName || 'Organisation'}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-xl bg-[#006B3F]/10 dark:bg-emerald-500/15 text-[#006B3F] dark:text-emerald-400 shrink-0 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Offering Organisation
                </p>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mt-0.5">
                  {opportunity.organizationName || 'Verified Partner'}
                </h3>
                {(opportunity.location || opportunity.country) && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {opportunity.location || opportunity.country}
                  </p>
                )}
              </div>
            </div>

            <dl className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm border-t border-b border-slate-200 dark:border-slate-800">
              {opportunity.academicYear && (
                <div className="py-2.5 flex items-center justify-between gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">Academic Year</dt>
                  <dd className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                    {opportunity.academicYear}
                  </dd>
                </div>
              )}
              {opportunity.duration && (
                <div className="py-2.5 flex items-center justify-between gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">Duration</dt>
                  <dd className="font-semibold text-slate-900 dark:text-slate-100">
                    {opportunity.duration}
                  </dd>
                </div>
              )}
              {opportunity.fieldOfStudy && (
                <div className="py-2.5 space-y-1">
                  <dt className="text-slate-500 dark:text-slate-400">Focus / Field</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100 leading-snug">
                    {opportunity.fieldOfStudy}
                  </dd>
                </div>
              )}
              {opportunity.sourceName && (
                <div className="py-2.5 flex items-center justify-between gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">Official Source</dt>
                  <dd className="font-medium text-slate-900 dark:text-slate-100 text-right truncate">
                    {opportunity.sourceName}
                  </dd>
                </div>
              )}
              {lastVerifiedFormatted && (
                <div className="py-2.5 flex items-center justify-between gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">Last Verified</dt>
                  <dd className="font-semibold text-[#006B3F] dark:text-emerald-400 tabular-nums inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{lastVerifiedFormatted}</span>
                  </dd>
                </div>
              )}
            </dl>

            <div className="space-y-2.5">
              {!isClosed && applyHref && (
                <a
                  href={applyHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] rounded-lg bg-[#006B3F] hover:bg-[#005530] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  <span>Apply on Official Portal</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {officialWebsiteHref && (
                <a
                  href={officialWebsiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>Visit Official Website</span>
                </a>
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* D. REQUIREMENTS AND ELIGIBILITY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-8">
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006B3F] dark:text-emerald-400">
              02 / Candidate Profile
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Requirements & Eligibility
            </h2>
          </div>

          {/* Core Eligibility Criteria Grid */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border-t-2 border-[#006B3F] dark:border-emerald-500 pt-3.5 space-y-1">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Educational Qualification
              </dt>
              <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {opportunity.educationLevel ||
                  opportunity.studyLevel ||
                  'Open to qualified applicants'}
              </dd>
            </div>

            <div className="border-t-2 border-slate-300 dark:border-slate-700 pt-3.5 space-y-1">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Experience Level
              </dt>
              <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {opportunity.experienceLevel ||
                  (categoryKind === 'internships'
                    ? 'Students & Recent Graduates'
                    : 'Not specified')}
              </dd>
            </div>

            <div className="border-t-2 border-slate-300 dark:border-slate-700 pt-3.5 space-y-1">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Nationality / Residency
              </dt>
              <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {opportunity.nationality ||
                  (opportunity.eligibleCountries?.length
                    ? opportunity.eligibleCountries.join(', ')
                    : opportunity.isGhanaEligible !== false
                    ? 'Ghanaian Citizens & Eligible Residents'
                    : 'See official eligibility rules')}
              </dd>
            </div>

            <div className="border-t-2 border-slate-300 dark:border-slate-700 pt-3.5 space-y-1">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {opportunity.ageRequirement ? 'Age Requirement' : 'Eligible Disciplines'}
              </dt>
              <dd className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {opportunity.ageRequirement ||
                  opportunity.fieldOfStudy ||
                  'All relevant disciplines'}
              </dd>
            </div>
          </dl>

          {/* Requirements Checklist & Skills Split */}
          {(opportunity.requirements?.length > 0 || (opportunity.skills && opportunity.skills.length > 0)) && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
              {opportunity.requirements && opportunity.requirements.length > 0 && (
                <div className={opportunity.skills?.length ? 'lg:col-span-7 space-y-3.5' : 'lg:col-span-12 space-y-3.5'}>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Eligibility & Selection Conditions
                  </h3>
                  <ul className="space-y-2.5">
                    {opportunity.requirements.map((req, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 shrink-0 mt-1" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {opportunity.skills && opportunity.skills.length > 0 && (
                <div className={opportunity.requirements?.length ? 'lg:col-span-5 space-y-3.5' : 'lg:col-span-12 space-y-3.5'}>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Skills & Competencies
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                    {opportunity.skills.map((skill, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800/80 text-sm font-medium text-slate-800 dark:text-slate-200"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006B3F] dark:bg-emerald-400 shrink-0" />
                        <span>{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* E. DYNAMIC RESPONSIBILITIES / BENEFITS SECTION */}
      <section className="bg-slate-50/80 dark:bg-[#0E1420] border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006B3F] dark:text-emerald-400">
              {sectionCopy.eyebrow}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {sectionCopy.heading}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* LEFT COLUMN: Responsibilities (Jobs/Internships) OR Financial Benefits (Scholarships/Grants/Fellowships) */}
            <div className="lg:col-span-6 space-y-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {categoryKind === 'jobs' || categoryKind === 'internships' ? (
                  <Briefcase className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
                ) : (
                  <GraduationCap className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
                )}
                <span>{sectionCopy.leftHeading}</span>
              </h3>

              {categoryKind === 'jobs' || categoryKind === 'internships' ? (
                opportunity.responsibilities && opportunity.responsibilities.length > 0 ? (
                  <ul className="space-y-3">
                    {opportunity.responsibilities.map((resp, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed"
                      >
                        <span className="text-xs font-bold text-[#006B3F] dark:text-emerald-400 tabular-nums mt-0.5 shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sectionCopy.emptyLeftFallback}
                  </p>
                )
              ) : (
                <div className="space-y-5">
                  {coverageRows.length > 0 && (
                    <dl className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800">
                      {coverageRows.map((row) => (
                        <div key={row.label} className="py-3 grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 text-sm">
                          <dt className="sm:col-span-5 font-semibold text-slate-600 dark:text-slate-400">
                            {row.label}
                          </dt>
                          <dd className="sm:col-span-7 font-medium text-slate-900 dark:text-slate-100">
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {opportunity.benefits && opportunity.benefits.length > 0 ? (
                    <ul className="space-y-2.5">
                      {opportunity.benefits.map((benefit, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 shrink-0 mt-1" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    coverageRows.length === 0 && (
                      <p className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        {sectionCopy.emptyLeftFallback}
                      </p>
                    )
                  )}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Benefits & Progression (Jobs/Internships) OR Eligible Programmes & Activities (Scholarships/Grants/Fellowships) */}
            <div className="lg:col-span-6 space-y-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
                <span>{sectionCopy.rightHeading}</span>
              </h3>

              {categoryKind === 'jobs' || categoryKind === 'internships' ? (
                <div className="space-y-5">
                  {/* Duration / Schedule / Compensation metadata */}
                  {(opportunity.duration ||
                    opportunity.startDate ||
                    opportunity.endDate ||
                    compensationSummary ||
                    opportunity.visaSupport ||
                    opportunity.relocationSupport) && (
                    <dl className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800 text-sm">
                      {compensationSummary && (
                        <div className="py-2.5 flex items-center justify-between gap-4">
                          <dt className="text-slate-500 dark:text-slate-400">Compensation</dt>
                          <dd className="font-semibold text-[#006B3F] dark:text-emerald-400 text-right">
                            {compensationSummary}
                          </dd>
                        </div>
                      )}
                      {opportunity.duration && (
                        <div className="py-2.5 flex items-center justify-between gap-4">
                          <dt className="text-slate-500 dark:text-slate-400">Programme Duration</dt>
                          <dd className="font-semibold text-slate-900 dark:text-slate-100 text-right">
                            {opportunity.duration}
                          </dd>
                        </div>
                      )}
                      {(opportunity.startDate || opportunity.endDate) && (
                        <div className="py-2.5 flex items-center justify-between gap-4">
                          <dt className="text-slate-500 dark:text-slate-400">Timeline</dt>
                          <dd className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-right">
                            {[formatReadableDate(opportunity.startDate), formatReadableDate(opportunity.endDate)]
                              .filter(Boolean)
                              .join(' – ')}
                          </dd>
                        </div>
                      )}
                      {opportunity.visaSupport && (
                        <div className="py-2.5 flex items-center justify-between gap-4">
                          <dt className="text-slate-500 dark:text-slate-400">Visa Support</dt>
                          <dd className="font-medium text-slate-900 dark:text-slate-100 text-right">
                            {opportunity.visaSupport}
                          </dd>
                        </div>
                      )}
                      {opportunity.relocationSupport && (
                        <div className="py-2.5 flex items-center justify-between gap-4">
                          <dt className="text-slate-500 dark:text-slate-400">Relocation Support</dt>
                          <dd className="font-medium text-slate-900 dark:text-slate-100 text-right">
                            {opportunity.relocationSupport}
                          </dd>
                        </div>
                      )}
                    </dl>
                  )}

                  {opportunity.benefits && opportunity.benefits.length > 0 ? (
                    <ul className="space-y-2.5">
                      {opportunity.benefits.map((benefit, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 shrink-0 mt-1" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Professional development, mentorship, and competitive terms aligned with{' '}
                      {opportunity.organizationName || 'employer'} standards.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <dl className="divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800 text-sm">
                    {opportunity.studyLevel && (
                      <div className="py-3 grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4">
                        <dt className="sm:col-span-5 font-semibold text-slate-600 dark:text-slate-400">
                          Study / Award Level
                        </dt>
                        <dd className="sm:col-span-7 font-medium text-slate-900 dark:text-slate-100">
                          {opportunity.studyLevel}
                        </dd>
                      </div>
                    )}
                    {opportunity.fieldOfStudy && (
                      <div className="py-3 grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4">
                        <dt className="sm:col-span-5 font-semibold text-slate-600 dark:text-slate-400">
                          Eligible Programmes
                        </dt>
                        <dd className="sm:col-span-7 font-medium text-slate-900 dark:text-slate-100">
                          {opportunity.fieldOfStudy}
                        </dd>
                      </div>
                    )}
                    {opportunity.duration && (
                      <div className="py-3 grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4">
                        <dt className="sm:col-span-5 font-semibold text-slate-600 dark:text-slate-400">
                          Duration
                        </dt>
                        <dd className="sm:col-span-7 font-medium text-slate-900 dark:text-slate-100">
                          {opportunity.duration}
                        </dd>
                      </div>
                    )}
                    {opportunity.destinationCountry && (
                      <div className="py-3 grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4">
                        <dt className="sm:col-span-5 font-semibold text-slate-600 dark:text-slate-400">
                          Host Country
                        </dt>
                        <dd className="sm:col-span-7 font-medium text-slate-900 dark:text-slate-100">
                          {opportunity.destinationCountry}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {opportunity.responsibilities && opportunity.responsibilities.length > 0 && (
                    <ul className="space-y-2.5">
                      {opportunity.responsibilities.map((resp, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 shrink-0 mt-1" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {(!opportunity.responsibilities || opportunity.responsibilities.length === 0) &&
                    opportunity.verificationNotes && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {opportunity.verificationNotes}
                      </p>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* F. HOW TO APPLY */}
      <section
        id="how-to-apply"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-b border-slate-200 dark:border-slate-800 scroll-mt-16"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left: Step-by-Step Instructions & Required Documents */}
          <div className="lg:col-span-7 space-y-7">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006B3F] dark:text-emerald-400">
                04 / Application Guide
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                How to Apply
              </h2>
            </div>

            <ol className="space-y-5">
              {applicationSteps.map((item) => (
                <li
                  key={item.step}
                  className="flex items-start gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5 last:border-b-0 last:pb-0"
                >
                  <span className="w-9 h-9 rounded-lg bg-[#006B3F]/10 dark:bg-emerald-500/15 text-[#006B3F] dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
                    {item.step}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {opportunity.documentsRequired && opportunity.documentsRequired.length > 0 && (
              <div className="pt-2 space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
                  <span>Required Application Documents</span>
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {opportunity.documentsRequired.map((doc, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Official Application Action Card */}
          <div className="lg:col-span-5 bg-[#062217] dark:bg-[#072017] text-white rounded-2xl p-6 sm:p-8 space-y-6 border border-emerald-900/60">
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#FCD116]">
                Official Submission Portal
              </p>
              <h3 className="text-xl font-bold text-white leading-snug">
                {isClosed
                  ? 'Application Window Closed'
                  : isUpcoming
                  ? 'Prepare Your Application'
                  : 'Ready to Apply?'}
              </h3>
            </div>

            <dl className="divide-y divide-white/15 text-xs sm:text-sm border-t border-b border-white/15">
              {lifecycle.opensFormatted && (
                <div className="py-3 flex items-center justify-between gap-2">
                  <dt className="text-emerald-100/75">Opening Date</dt>
                  <dd className="font-semibold text-white tabular-nums">
                    {lifecycle.opensFormatted}
                  </dd>
                </div>
              )}

              <div className="py-3 flex items-center justify-between gap-2">
                <dt className="text-emerald-100/75">
                  {isClosed ? 'Previous Deadline' : 'Application Deadline'}
                </dt>
                <dd className="font-semibold text-white tabular-nums">{deadlineText}</dd>
              </div>

              {applyHref && (
                <div className="py-3 flex items-center justify-between gap-2">
                  <dt className="text-emerald-100/75">Official Domain</dt>
                  <dd className="font-medium text-emerald-200 truncate">
                    {formatDomainHost(applyHref)}
                  </dd>
                </div>
              )}

              {opportunity.contactEmail && (
                <div className="py-3 flex items-center justify-between gap-2">
                  <dt className="text-emerald-100/75 inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Contact Email</span>
                  </dt>
                  <dd className="font-medium text-white truncate">{opportunity.contactEmail}</dd>
                </div>
              )}

              {opportunity.contactPhone && (
                <div className="py-3 flex items-center justify-between gap-2">
                  <dt className="text-emerald-100/75 inline-flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contact Phone</span>
                  </dt>
                  <dd className="font-medium text-white tabular-nums">
                    {opportunity.contactPhone}
                  </dd>
                </div>
              )}
            </dl>

            {opportunity.contactInfo && (
              <p className="text-xs text-emerald-100/85 leading-relaxed">
                {opportunity.contactInfo}
              </p>
            )}

            {isClosed && (
              <div className="p-3.5 rounded-xl bg-white/10 text-xs text-emerald-50 space-y-1">
                <p className="font-bold text-[#FCD116]">
                  Next Expected Cycle: {reopening.headline}
                </p>
                <p className="text-emerald-100/85">{reopening.message}</p>
              </div>
            )}

            <div className="space-y-3">
              {!isClosed && applyHref ? (
                <a
                  href={applyHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[48px] rounded-xl bg-[#FCD116] hover:bg-yellow-300 text-slate-950 font-bold text-sm transition-colors cursor-pointer"
                >
                  <span>
                    {isUpcoming ? 'Visit Official Website' : 'Apply Now on Official Portal'}
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(
                      `/opportunities?category=${encodeURIComponent(opportunity.category)}&status=open`
                    )
                  }
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[48px] rounded-xl bg-[#FCD116] hover:bg-yellow-300 text-slate-950 font-bold text-sm transition-colors cursor-pointer"
                >
                  <span>Explore Open {opportunity.category}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <div className="flex items-center justify-between gap-3 pt-1 text-xs text-emerald-100/80">
                {opportunity.sourceUrl ? (
                  <a
                    href={opportunity.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-white underline underline-offset-4"
                  >
                    <span>Official Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span />
                )}

                <button
                  type="button"
                  onClick={() => onNavigate('/admin/reports')}
                  className="inline-flex items-center gap-1 hover:text-[#FCD116] cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Report an issue</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-emerald-100/70 border-t border-white/10 pt-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Never pay any application or processing fee to third parties.</span>
            </p>
          </div>
        </div>
      </section>

      {/* G. RELATED OPPORTUNITIES */}
      {relatedOpportunities.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006B3F] dark:text-emerald-400">
                05 / Continue Exploring
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Related Opportunities
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                onNavigate(
                  `/opportunities?category=${encodeURIComponent(opportunity.category)}&status=open`
                )
              }
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#006B3F] dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <span>Browse all {opportunity.category}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedOpportunities.map((rel) => {
              const relMedia = resolveOpportunityHeroMedia(rel);
              const relDeadline = getOpportunityLifecycleStatus(rel, now);
              const relDeadlineDisplay =
                rel.isDeadlineSpecified === false
                  ? 'Rolling'
                  : relDeadline.deadlineInfo.formattedDate;

              return (
                <article
                  key={rel.id}
                  onClick={() => onNavigate(`/opportunities/${rel.slug || rel.id}`)}
                  className="group flex flex-col justify-between bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-[#006B3F] dark:hover:border-emerald-500 transition-colors cursor-pointer"
                >
                  <div>
                    <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                      <img
                        src={relMedia.primaryUrl}
                        alt={rel.title}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src !== relMedia.fallbackUrl) {
                            target.src = relMedia.fallbackUrl;
                          }
                        }}
                        className="w-full h-full object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25 pointer-events-none" />
                      <span className="absolute bottom-2.5 left-3 text-[10px] font-bold uppercase tracking-wider text-[#FCD116]">
                        {rel.category}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <p className="text-xs font-semibold text-[#006B3F] dark:text-emerald-400 truncate">
                        {rel.organizationName || 'Verified Partner'}
                      </p>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 transition-colors">
                        {rel.title}
                      </h3>
                      <div className="pt-1 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                        {rel.location && (
                          <p className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{rel.location}</span>
                          </p>
                        )}
                        <p className="flex items-center gap-1.5 tabular-nums">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>Deadline: {relDeadlineDisplay}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(`/opportunities/${rel.slug || rel.id}`);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-[#006B3F] text-slate-900 dark:text-slate-100 group-hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
