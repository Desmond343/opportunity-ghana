import React, { useEffect, useState } from 'react';
import { Opportunity } from '../types/database';
import { OpportunitiesService } from '../services/opportunitiesService';
import { SavedService } from '../services/savedService';
import { useAuth } from '../services/authContext';
import { DeadlineBadge } from '../components/common/DeadlineBadge';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { Badge } from '../components/common/Badge';
import { LoadingState, EmptyState } from '../components/common/CommonUI';
import { calculateDeadlineInfo, useDeadlineInfo } from '../services/deadlineService';
import { resolveOpportunityMedia } from '../utils/cardBackgrounds';
import {
  MapPin,
  Calendar,
  Building,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  FileText,
  AlertTriangle,
  Share2,
  Bookmark,
  Sparkles,
  Award,
  GraduationCap,
  Globe,
  Briefcase,
  Clock,
  Archive,
  ArrowRight,
  HelpCircle,
  Info
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
  const deadlineInfo = useDeadlineInfo(opportunity?.deadline);

  useEffect(() => {
    async function loadOpportunity() {
      setLoading(true);
      try {
        const item = await OpportunitiesService.getBySlug(slug);
        setOpportunity(item);
        if (item) {
          setIsSaved(SavedService.isSaved(item.id));
          OpportunitiesService.recordView(item.id);

          // If closed, query active alternatives in same category
          const isClosed = item.status === 'closed' || calculateDeadlineInfo(item.deadline).isClosed;
          const allOpps = await OpportunitiesService.getAll({ category: item.category, onlyActive: true });
          const filtered = allOpps.filter(o => o.id !== item.id).slice(0, 3);
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

  // Sync saved state when other cards or components update
  useEffect(() => {
    if (opportunity?.id) {
      setIsSaved(SavedService.isSaved(opportunity.id));
    }
    const handleUpdate = (e: any) => {
      if (!opportunity) return;
      if (!e.detail || e.detail.id === opportunity.id || e.detail.userId !== undefined) {
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
        description="The opportunity record you requested may have been archived, closed, or moved."
        actionText="Browse Opportunities"
        onAction={() => onNavigate('/opportunities')}
      />
    );
  }

  const isPendingOrUnpublished = opportunity.status !== 'published' && opportunity.status !== 'closed';
  const isSubmitterOrAdmin = isEditorOrAdmin || (currentUser && (currentUser.id === opportunity.submittedBy || currentUser.email === opportunity.submittedByEmail));

  // If item is pending/rejected and viewer is not authorized admin/submitter, show awaiting review state
  if (isPendingOrUnpublished && !isSubmitterOrAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          title="Submission Awaiting Review"
          description="This opportunity submission is currently awaiting editorial verification before it is published on Opportunity Ghana."
          actionText="Browse Active Opportunities"
          onAction={() => onNavigate('/opportunities')}
        />
      </div>
    );
  }

  const isClosed = opportunity.status === 'closed' || deadlineInfo.isClosed;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Pending Banner if viewing in preview mode */}
      {isPendingOrUnpublished && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Status: {opportunity.status === 'rejected' ? 'Rejected' : 'Pending Review'}.</strong> This submission is not yet live to the public.
            </span>
          </div>
          {isEditorOrAdmin && (
            <button
              onClick={() => onNavigate('/admin/submissions')}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold self-start sm:self-auto cursor-pointer"
            >
              Open in Review Console
            </button>
          )}
        </div>
      )}
      {/* Structured Data (Schema.org JSON-LD) */}
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

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap pb-1">
        <button onClick={() => onNavigate('/')} className="hover:text-emerald-700 cursor-pointer">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button onClick={() => onNavigate('/opportunities')} className="hover:text-emerald-700 cursor-pointer">
          Opportunities
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button
          onClick={() => onNavigate(`/opportunities?category=${opportunity.category}`)}
          className="hover:text-emerald-700 cursor-pointer"
        >
          {opportunity.category}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold truncate max-w-[200px]">
          {opportunity.title}
        </span>
      </nav>

      {/* CLOSED BANNER - Section 7 requirement */}
      {isClosed && (
        <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0">
              <Archive className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-space">
                This opportunity has closed.
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Applications are no longer being accepted for this cohort. We retain this page for eligibility requirements and past stipend reference.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate(`/opportunities?category=${opportunity.category}`)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer transition-colors"
          >
            Explore Active Alternatives
          </button>
        </div>
      )}

      {/* Featured Opportunity Visual Banner */}
      {(() => {
        const media = resolveOpportunityMedia(opportunity);
        return (
          <div className="space-y-1.5">
            <div
              className="w-full h-56 sm:h-72 lg:h-80 rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs relative bg-slate-950"
              style={{ background: media.gradient.cssGradient }}
            >
              {media.imageUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={media.imageUrl}
                    alt={media.imageAlt || opportunity.title}
                    className="w-full h-full object-cover object-[center_25%]"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent pointer-events-none" />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col justify-end p-8 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-12 bg-[radial-gradient(#FCD116_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                  <div className="relative z-10 space-y-2">
                    <span
                      className="text-xs font-extrabold uppercase tracking-widest font-space"
                      style={{ color: media.gradient.accentColor }}
                    >
                      {opportunity.category}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white font-space">
                      {opportunity.organizationName || 'Opportunity Ghana'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium line-clamp-1">
                      {opportunity.title}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {(opportunity.imageSourceName || media.imageAttribution) && (
              <p className="text-[11px] text-slate-400 text-right px-2">
                Image source:{' '}
                {opportunity.imageSourceUrl ? (
                  <a
                    href={opportunity.imageSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-emerald-700 underline font-medium"
                  >
                    {opportunity.imageSourceName}
                  </a>
                ) : (
                  <span className="text-slate-500">
                    {opportunity.imageSourceName || media.imageAttribution}
                  </span>
                )}
              </p>
            )}
          </div>
        );
      })()}

      {/* Hero Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            {opportunity.organizationLogo ? (
              <img
                src={opportunity.organizationLogo}
                alt={opportunity.organizationName || 'Organization'}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-2xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Building className="w-8 h-8 text-emerald-700" />
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="emerald">{opportunity.category}</Badge>
                <Badge variant="blue">{opportunity.opportunityType}</Badge>
                <VerificationBadge status={opportunity.verificationStatus} />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug font-space">
                {opportunity.title}
              </h1>
              <p className="text-sm font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-400" />
                <span>{opportunity.organizationName}</span>
                <span className="text-slate-300">•</span>
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{opportunity.location}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions (Share, Bookmark, Apply) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleToggleSave}
              disabled={isSaving}
              className={`px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                isSaved
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Remove from bookmarks' : 'Bookmark opportunity'}
              aria-label={isSaved ? 'Remove from bookmarks' : 'Bookmark opportunity'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-700 text-emerald-700' : ''}`} />
              <span className="text-xs font-semibold">
                {isSaved ? 'Saved' : 'Save'}
              </span>
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Copy share link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {!isClosed ? (
              <a
                href={opportunity.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <button
                disabled
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed"
              >
                <span>Application Closed</span>
              </button>
            )}
          </div>
        </div>

        {copied && (
          <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-bold inline-block">
            ✓ Link copied to clipboard!
          </div>
        )}

        {/* Highlight Grid Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Deadline</p>
            <div className="mt-1">
              <DeadlineBadge
                deadline={opportunity.deadline}
                isDeadlineSpecified={opportunity.isDeadlineSpecified}
              />
            </div>
          </div>

          {opportunity.category === 'Jobs' ? (
            <>
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Arrangement</p>
                <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                  {opportunity.workArrangement ? `${opportunity.workArrangement === 'Remote' ? '🌐' : opportunity.workArrangement === 'Hybrid' ? '🔄' : '🏢'} ${opportunity.workArrangement}` : '🏢 On-site'}
                </p>
              </div>
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Employment Type</p>
                <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                  {opportunity.employmentType || 'Full-time'}
                </p>
              </div>
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Salary / Compensation</p>
                <p className="text-xs font-bold text-slate-900 mt-1 truncate" title={opportunity.salary || 'Salary not disclosed by employer'}>
                  {opportunity.salary || 'Salary not disclosed'}
                </p>
              </div>
            </>
          ) : opportunity.category === 'Internships' ? (
            <>
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Compensation</p>
                <p className="text-xs font-bold text-slate-900 mt-1 truncate" title={opportunity.stipend || opportunity.internshipType || 'Stipend provided'}>
                  {opportunity.internshipType === 'Paid'
                    ? (opportunity.stipend ? `💰 ${opportunity.stipend}` : '💰 Paid Internship')
                    : opportunity.internshipType === 'Unpaid'
                    ? '📄 Unpaid'
                    : 'Compensation not specified'}
                </p>
              </div>
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Duration</p>
                <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                  {opportunity.duration || 'Standard Placement'}
                </p>
              </div>
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Arrangement</p>
                <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                  {opportunity.workArrangement ? `${opportunity.workArrangement === 'Remote' ? '🌐' : opportunity.workArrangement === 'Hybrid' ? '🔄' : '🏢'} ${opportunity.workArrangement}` : '🏢 On-site'}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Funding / Pay</p>
                <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                  {opportunity.fundingType || 'Fully Funded / Stipend'}
                </p>
              </div>
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Education Level</p>
                <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                  {opportunity.educationLevel || 'All Qualifications'}
                </p>
              </div>
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nationality</p>
                <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                  {opportunity.nationality || 'Ghanaian Citizens'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Full Description & Requirements */}
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Overview */}
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 font-space">
              {opportunity.category === 'Jobs' ? 'Position Overview' : opportunity.category === 'Internships' ? 'Internship Overview' : 'About This Opportunity'}
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3">
              <p>{opportunity.description}</p>
            </div>
          </section>

          {/* Key Responsibilities */}
          {opportunity.responsibilities && opportunity.responsibilities.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#006B3F]" />
                <h2 className="text-lg font-bold text-slate-900 font-space">
                  Key Responsibilities & Duties
                </h2>
              </div>
              <ul className="space-y-2.5">
                {opportunity.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-[#006B3F] shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Skills Required */}
          {opportunity.skills && opportunity.skills.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900 font-space">
                  Required Skills & Competencies
                </h2>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {opportunity.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 shadow-2xs hover:bg-[#E8F5EF] hover:text-[#006B3F] transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Benefits */}
          {opportunity.benefits && opportunity.benefits.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900 font-space">
                  {opportunity.category === 'Jobs' ? 'Compensation & Benefits' : opportunity.category === 'Internships' ? 'Internship Benefits & Learning Outcomes' : 'Benefits & Entitlements'}
                </h2>
              </div>
              <ul className="space-y-2.5">
                {opportunity.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Eligibility & Requirements */}
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#006B3F]" />
                <h2 className="text-lg font-bold text-[#111111] font-space">
                  Who Can Apply (Eligibility)
                </h2>
              </div>
              <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-[#E6F0EB] text-[#006B3F] border border-[#006B3F]/20">
                ✓ Ghana Eligible
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F9F8] border border-[#E5E7EB] space-y-1.5 text-xs text-slate-700">
              <p className="font-bold text-[#111111]">
                Target Nationality & Citizenship:
              </p>
              <p className="text-slate-600">
                {opportunity.nationality || 'Ghanaian citizens and permanent residents in Ghana.'}
              </p>
              {opportunity.academicYear && (
                <p className="pt-1 text-[11px] text-slate-500 font-mono">
                  Official Academic Cycle: <strong>{opportunity.academicYear}</strong>
                </p>
              )}
            </div>

            {opportunity.requirements && opportunity.requirements.length > 0 && (
              <ul className="space-y-2.5 pt-2">
                {opportunity.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006B3F] shrink-0 mt-2" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* How to Apply */}
          {opportunity.applicationInstructions && (
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#006B3F]" />
                <h2 className="text-lg font-bold text-[#111111] font-space">
                  How to Apply (Official Guidelines)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-[#F7F9F8] p-4 rounded-2xl border border-slate-200/70">
                {opportunity.applicationInstructions}
              </p>
            </section>
          )}

          {/* Documents Required */}
          {opportunity.documentsRequired && opportunity.documentsRequired.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-bold text-slate-900 font-space">
                  Required Application Documents
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {opportunity.documentsRequired.map((doc, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* RECOMMENDED ACTIVE ALTERNATIVES (Section 7 requirement) */}
          {isClosed && alternatives.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-space flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Recommended Active Alternatives</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Open {opportunity.category} opportunities currently accepting applications.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate(`/opportunities?category=${opportunity.category}`)}
                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-3 pt-2">
                {alternatives.map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => onNavigate(`/opportunities/${alt.slug || alt.id}`)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {alt.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{alt.organizationName}</span>
                        <span>•</span>
                        <span>{alt.location}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <DeadlineBadge deadline={alt.deadline} compact />
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Action Box */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-space">
              Application Details
            </h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 font-medium block">Application Deadline:</span>
                <span className="font-semibold text-slate-900 font-mono block">
                  {opportunity.isDeadlineSpecified === false ? 'Not specified by employer' : deadlineInfo.formattedDeadline}
                </span>
                <div className="mt-1">
                  <DeadlineBadge
                    deadline={opportunity.deadline}
                    isDeadlineSpecified={opportunity.isDeadlineSpecified}
                  />
                </div>
              </div>
              {opportunity.workArrangement && (
                <div>
                  <span className="text-slate-400 font-medium block">Work Arrangement:</span>
                  <span className="font-semibold text-slate-800">
                    {opportunity.workArrangement === 'Remote' ? '🌐 Fully Remote' : opportunity.workArrangement === 'Hybrid' ? '🔄 Hybrid (Office & Remote)' : '🏢 On-site'}
                  </span>
                </div>
              )}
              {opportunity.employerWebsite && (
                <div>
                  <span className="text-slate-400 font-medium block">Employer Website:</span>
                  <a
                    href={opportunity.employerWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#006B3F] hover:underline flex items-center gap-1 mt-0.5 truncate"
                  >
                    <span className="truncate">{opportunity.employerWebsite.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}
              <div>
                <span className="text-slate-400 font-medium block">Method:</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {opportunity.applicationMethod.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Region:</span>
                <span className="font-semibold text-slate-800">{opportunity.region}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Last Verified:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {opportunity.lastVerifiedAt
                    ? new Date(opportunity.lastVerifiedAt).toLocaleDateString('en-GB')
                    : 'Recently'}
                </span>
              </div>
            </div>

            {!isClosed ? (
              <div className="space-y-2">
                <a
                  href={opportunity.officialApplicationUrl || opportunity.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-[#006B3F] hover:bg-[#005632] rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <span>Apply on Official Portal</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-[10px] text-center text-slate-500">
                  Applications are completed directly through the official provider portal.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-slate-100 rounded-xl text-center text-xs font-bold text-slate-500">
                Application Period Ended
              </div>
            )}

            {/* Official Source Reference - Sections 10 & 28 */}
            <div className="p-3.5 rounded-2xl bg-[#E6F0EB] border border-[#006B3F]/25 text-[11px] text-[#006B3F] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-[#006B3F]">
                  <ShieldCheck className="w-4 h-4 text-[#006B3F]" />
                  Official Source Reference
                </span>
                <VerificationBadge status={opportunity.verificationStatus} />
              </div>

              <div>
                <span className="text-slate-600 block text-[10px] font-medium">Provider / Host Authority:</span>
                <span className="font-bold text-[#111111]">{opportunity.sourceName || opportunity.organizationName || 'Official Institutional Source'}</span>
              </div>

              {opportunity.sourceUrl && (
                <div className="pt-1.5 border-t border-[#006B3F]/20">
                  <span className="text-slate-600 block text-[10px] font-medium">Official Notice:</span>
                  <a
                    href={opportunity.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#006B3F] hover:underline truncate block font-mono font-bold text-[10px]"
                  >
                    {opportunity.sourceUrl}
                  </a>
                </div>
              )}

              {opportunity.lastVerifiedAt && (
                <div className="text-[10px] text-slate-500 font-medium">
                  Last verified: <strong className="text-slate-800">{new Date(opportunity.lastVerifiedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                </div>
              )}

              {opportunity.imageSourceName && (
                <div className="text-[10px] text-slate-400 pt-1 border-t border-[#006B3F]/15">
                  Media Source: <span className="text-slate-600">{opportunity.imageSourceName}</span> {opportunity.imageLicense && `(${opportunity.imageLicense})`}
                </div>
              )}

              {opportunity.verificationNotes && (
                <p className="text-[#006B3F] text-[10px] leading-relaxed italic pt-1 border-t border-[#006B3F]/15">
                  &ldquo;{opportunity.verificationNotes}&rdquo;
                </p>
              )}
            </div>

            {/* Zero fee scam warning */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Legitimacy Protection</span>
              </div>
              <p>
                Opportunity Ghana verified this listing against official public notices. Never pay any fee to apply.
              </p>
            </div>
          </div>

          {/* Report an issue */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-500">Notice incorrect info or a broken link?</p>
            <button
              onClick={() => onNavigate('/admin/reports')}
              className="text-xs font-semibold text-slate-700 hover:text-rose-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Report Issue to Editors
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
