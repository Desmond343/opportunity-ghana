import React, { useEffect, useState } from 'react';
import { Resource } from '../types/database';
import { ResourcesService } from '../services/resourcesService';
import { useAuth } from '../services/authContext';
import { Badge } from '../components/common/Badge';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { LoadingState, EmptyState } from '../components/common/CommonUI';
import { resolveResourceMedia } from '../utils/cardBackgrounds';
import {
  ChevronRight,
  BookOpen,
  Award,
  Clock,
  ExternalLink,
  CheckCircle,
  Building,
  GraduationCap,
  Sparkles,
  Share2,
  Bookmark,
  ShieldCheck,
  Info,
  Globe,
  DollarSign,
  Languages,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ResourceDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const ResourceDetailPage: React.FC<ResourceDetailPageProps> = ({ slug, onNavigate }) => {
  const { currentUser, isEditorOrAdmin } = useAuth();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadResource() {
      setLoading(true);
      try {
        const item = await ResourcesService.getBySlug(slug);
        setResource(item);
      } catch (err) {
        console.error('Error loading course details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResource();
  }, [slug]);

  if (loading) return <LoadingState message="Loading course details..." />;

  if (!resource) {
    return (
      <EmptyState
        title="Course Not Found"
        description="The requested learning resource could not be found. It may have been updated, relocated, or expired."
        actionText="Browse All Courses & Credentials"
        onAction={() => onNavigate('/resources')}
      />
    );
  }

  const isPendingOrUnpublished =
    resource.status !== 'published' &&
    (resource.status as string) !== 'approved' &&
    resource.submissionStatus !== 'approved';

  const isSubmitterOrAdmin =
    isEditorOrAdmin ||
    (currentUser &&
      (currentUser.id === resource.submittedBy ||
        currentUser.email === resource.submittedByEmail ||
        currentUser.id === resource.createdByUserId ||
        currentUser.email === resource.createdByEmail));

  if (isPendingOrUnpublished && !isSubmitterOrAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          title="Submission Awaiting Editorial Review"
          description="This course or credential submission is currently being verified by Opportunity Ghana editors before it appears publicly."
          actionText="Browse Verified Courses"
          onAction={() => onNavigate('/resources')}
        />
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Safe cost formatting
  const formattedCost = () => {
    if (resource.isFree) {
      if (resource.costType === 'free_to_audit') {
        return 'Free to Audit';
      }
      if (resource.costType === 'free_with_paid_certificate') {
        return 'Free Courseware';
      }
      return '100% Free';
    }
    if (typeof resource.cost === 'number' && !isNaN(resource.cost)) {
      return `${resource.currency || 'USD'} ${resource.cost.toLocaleString()}`;
    }
    return 'Paid Listing';
  };

  const getCostBadge = () => {
    if (resource.isFree) {
      if (resource.costType === 'free_to_audit') {
        return (
          <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/75 text-sky-800 dark:text-sky-200 border border-sky-300 dark:border-sky-700/60">
            Free to Audit
          </span>
        );
      }
      if (resource.costType === 'free_with_paid_certificate') {
        return (
          <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/75 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700/60">
            Free Course + Paid Certificate
          </span>
        );
      }
      return (
        <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/75 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/60">
          100% Free Tuition
        </span>
      );
    }

    return (
      <Badge variant="amber" className="font-mono font-bold">
        {formattedCost()}
      </Badge>
    );
  };

  const learningOutcomes = Array.isArray(resource.whatYouWillLearn) && resource.whatYouWillLearn.length > 0
    ? resource.whatYouWillLearn
    : [];

  const targetAudiences = Array.isArray(resource.whoIsThisFor) && resource.whoIsThisFor.length > 0
    ? resource.whoIsThisFor
    : resource.targetAudience
    ? [resource.targetAudience]
    : [];

  const skillsList = Array.isArray(resource.skills) ? resource.skills.filter(Boolean) : [];
  const prerequisitesList = Array.isArray(resource.prerequisites) ? resource.prerequisites.filter(Boolean) : [];
  const subtitlesList = Array.isArray(resource.subtitles)
    ? resource.subtitles.filter(Boolean)
    : (typeof resource.subtitles === 'string' && resource.subtitles.trim()
        ? resource.subtitles.split(',').map(s => s.trim()).filter(Boolean)
        : []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap">
        <button onClick={() => onNavigate('/')} className="hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
        <button onClick={() => onNavigate('/resources')} className="hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer">
          Courses &amp; Credentials
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
        <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[280px]">
          {resource.title || 'Course Details'}
        </span>
      </nav>

      {/* Featured Header Media Banner */}
      {(() => {
        const media = resolveResourceMedia(resource);
        return (
          <div
            className="w-full h-56 sm:h-72 lg:h-80 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs relative bg-slate-950"
            style={{ background: media.gradient.cssGradient }}
          >
            {media.imageUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={media.imageUrl}
                  alt={resource.title || 'Course Banner'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-[center_25%]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col justify-end p-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-12 bg-[radial-gradient(#FCD116_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                <div className="relative z-10 space-y-2">
                  <span
                    className="text-xs font-extrabold uppercase tracking-widest font-space"
                    style={{ color: media.gradient.accentColor }}
                  >
                    {resource.category || 'Professional Development'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-space">
                    {resource.providerName || 'Certified Education Partner'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium line-clamp-1">
                    {resource.title}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Media Attribution (if verified graphic source exists) */}
      {resource.imageSourceName && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium px-2">
          <span>Official credential graphic provided by</span>
          {resource.imageSourceUrl ? (
            <a
              href={resource.imageSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#006B3F] dark:text-emerald-400 hover:underline font-bold inline-flex items-center gap-0.5"
            >
              <span>{resource.imageSourceName}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : (
            <strong className="text-slate-700 dark:text-slate-300">{resource.imageSourceName}</strong>
          )}
        </div>
      )}

      {/* Main Course Header Card */}
      <div className="bg-white dark:bg-[#141B29] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="indigo" className="capitalize font-semibold">
                {resource.resourceType ? resource.resourceType.replace(/_/g, ' ') : 'Course'}
              </Badge>
              {resource.category && <Badge variant="slate">{resource.category}</Badge>}
              {getCostBadge()}
              <VerificationBadge status={resource.verificationStatus || 'verified'} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-space leading-tight">
              {resource.title}
            </h1>

            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-2 font-medium">
              <span>Offered by</span>
              {resource.providerWebsiteUrl ? (
                <a
                  href={resource.providerWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 dark:text-slate-100 font-bold hover:text-emerald-700 dark:hover:text-emerald-400 inline-flex items-center gap-1 underline underline-offset-2"
                >
                  <span>{resource.providerName || 'Certified Academy'}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                </a>
              ) : (
                <strong className="text-slate-800 dark:text-slate-200">{resource.providerName || 'Certified Academy'}</strong>
              )}

              {resource.format && (
                <>
                  <span>•</span>
                  <span className="text-slate-500 dark:text-slate-400">{resource.format}</span>
                </>
              )}

              {resource.language && (
                <>
                  <span>•</span>
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    <span>{resource.language}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              title="Bookmark course"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-700 dark:fill-emerald-400' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Copy share link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {resource.officialCourseUrl && resource.officialCourseUrl !== resource.enrollmentUrl && (
              <a
                href={resource.officialCourseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs shadow-2xs cursor-pointer transition-colors"
              >
                <span>Official Course Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            )}

            {resource.enrollmentUrl && (
              <a
                href={resource.enrollmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer transition-colors"
              >
                <span>{resource.isFree ? 'Enroll / Access Free Course' : 'Enroll / Register Now'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {copied && (
          <div className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl font-bold inline-block">
            ✓ Course share link copied to clipboard!
          </div>
        )}

        {/* Course Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Duration */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-transparent dark:border-slate-700/60">
            <p className="text-[10px] uppercase font-bold text-slate-400">Duration</p>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">{resource.duration || 'Self-paced'}</p>
          </div>

          {/* Level */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-transparent dark:border-slate-700/60">
            <p className="text-[10px] uppercase font-bold text-slate-400">Skill Level</p>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">{resource.level || 'All Levels'}</p>
          </div>

          {/* Certificate */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-transparent dark:border-slate-700/60">
            <p className="text-[10px] uppercase font-bold text-slate-400">Certificate</p>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {resource.certificateType || (resource.hasCertificate ? 'Official Credential' : 'No Certificate')}
            </p>
          </div>

          {/* Cost & Pricing Model */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-transparent dark:border-slate-700/60">
            <p className="text-[10px] uppercase font-bold text-slate-400">Cost &amp; Access</p>
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
              {formattedCost()}
              {resource.pricingModel && !resource.isFree && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal ml-1">
                  {resource.pricingModel === 'monthly'
                    ? '/ month'
                    : resource.pricingModel === 'per-course'
                    ? '/ course'
                    : resource.pricingModel === 'per-exam'
                    ? '/ paper'
                    : ''}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Curriculum Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Curriculum Overview */}
          <section className="bg-white dark:bg-[#141B29] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-space flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <span>Course Curriculum Overview</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {resource.description || 'Verified course curriculum from official educational partner.'}
            </p>
          </section>

          {/* Learning Outcomes / What You Will Learn */}
          {learningOutcomes.length > 0 && (
            <section className="bg-white dark:bg-[#141B29] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-space">
                  What You Will Learn &amp; Master
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {learningOutcomes.map((outcome, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-800/40 flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Who Should Enroll / Target Audience */}
          {targetAudiences.length > 0 && (
            <section className="bg-white dark:bg-[#141B29] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-space flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <span>Who Should Enroll in This Course?</span>
              </h2>
              <ul className="space-y-2 pt-1">
                {targetAudiences.map((audience, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-2 shrink-0" />
                    <span>{audience}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Pricing & Fee Transparency Card (if paid or special cost structure) */}
          {(!resource.isFree || resource.costDescription || resource.paymentNotes) && (
            <section className="bg-gradient-to-br from-amber-50/70 via-white to-slate-50 dark:from-amber-950/20 dark:via-[#141B29] dark:to-slate-900 rounded-3xl border border-amber-200/80 dark:border-amber-800/50 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-base font-bold text-amber-950 dark:text-amber-200 font-space flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                  <span>Verified Price &amp; Payment Transparency</span>
                </h2>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                  {resource.costType ? resource.costType.replace(/_/g, ' ').toUpperCase() : 'VERIFIED RATE'}
                </span>
              </div>

              {resource.costDescription && (
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {resource.costDescription}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-amber-100 dark:border-slate-700 shadow-2xs">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Published Price</p>
                  <p className="text-base font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                    {formattedCost()}
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-amber-100 dark:border-slate-700 shadow-2xs">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Billing Model</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 capitalize">
                    {resource.pricingModel === 'monthly'
                      ? 'Monthly Subscription'
                      : resource.pricingModel === 'per-course'
                      ? 'Pay-per-Course'
                      : resource.pricingModel === 'per-exam'
                      ? 'Per-Exam Registration'
                      : resource.isFree
                      ? 'Free Access'
                      : 'One-Time Payment'}
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-amber-100 dark:border-slate-700 shadow-2xs">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Financial Aid / Aid</p>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mt-1">
                    {resource.financialAid ? '✓ Relief / Discounts Available' : 'Standard Rate'}
                  </p>
                </div>
              </div>

              {resource.paymentNotes && (
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/90 dark:bg-slate-800/60 p-4 rounded-2xl border border-amber-100 dark:border-slate-700 space-y-1">
                  <strong className="text-slate-900 dark:text-slate-100 block font-semibold">Payment &amp; Voucher Specifics:</strong>
                  <p>{resource.paymentNotes}</p>
                </div>
              )}

              {resource.financialAidUrl && (
                <div className="pt-1">
                  <a
                    href={resource.financialAidUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline"
                  >
                    <span>Apply for Provider Financial Aid / Scholarship</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </section>
          )}

          {/* Ghana Accessibility & Testing Centers */}
          {resource.accessGhanaNotes || resource.ghanaAccessibility ? (
            <section className="bg-emerald-50/60 dark:bg-emerald-950/20 rounded-3xl border border-emerald-200/80 dark:border-emerald-800/50 p-6 sm:p-8 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <h2 className="text-base font-bold text-emerald-950 dark:text-emerald-200 font-space">
                  Ghana Accessibility &amp; Examination Notes
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-emerald-950/90 dark:text-emerald-100 leading-relaxed">
                {resource.accessGhanaNotes || resource.ghanaAccessibility}
              </p>
            </section>
          ) : null}

          {/* Skills You Will Master */}
          {skillsList.length > 0 && (
            <section className="bg-white dark:bg-[#141B29] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-space flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <span>Skills You Will Master</span>
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {skillsList.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Prerequisites */}
          {prerequisitesList.length > 0 && (
            <section className="bg-white dark:bg-[#141B29] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-space flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <span>Eligibility &amp; Prerequisites</span>
              </h2>
              <ul className="space-y-2 pt-1">
                {prerequisitesList.map((p, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Languages & Subtitles */}
          {(resource.language || subtitlesList.length > 0) && (
            <section className="bg-white dark:bg-[#141B29] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-space flex items-center gap-2">
                <Languages className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <span>Language &amp; Subtitle Options</span>
              </h2>
              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                {resource.language && (
                  <p>
                    <strong className="text-slate-900 dark:text-slate-100">Instructional Language:</strong> {resource.language}
                  </p>
                )}
                {subtitlesList.length > 0 && (
                  <p>
                    <strong className="text-slate-900 dark:text-slate-100">Available Subtitles:</strong> {subtitlesList.join(', ')}
                  </p>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar: Direct Enrollment & Provider Details */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#141B29] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 space-y-4 shadow-xs sticky top-24">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-space">
              Direct Enrollment Portal
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Access the official course registration portal or partner learning management system:
            </p>

            {resource.enrollmentUrl && (
              <a
                href={resource.enrollmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                <span>{resource.isFree ? 'Enroll in Free Course' : 'Go to Enrollment Portal'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {resource.officialCourseUrl && resource.officialCourseUrl !== resource.enrollmentUrl && (
              <a
                href={resource.officialCourseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl shadow-2xs cursor-pointer transition-colors"
              >
                <span>Visit Official Course Page</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            )}

            {/* Verification Box */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 text-[11px] text-indigo-950 dark:text-indigo-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1 text-indigo-900 dark:text-indigo-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-700 dark:text-indigo-400" />
                  Provider Verification
                </span>
                <VerificationBadge status={resource.verificationStatus || 'verified'} />
              </div>

              {(resource.officialCourseUrl || resource.sourceUrl) && (
                <div className="pt-1 border-t border-indigo-200/60 dark:border-indigo-800/40">
                  <span className="text-indigo-700 dark:text-indigo-400 font-medium block">Course Syllabus Source:</span>
                  <a
                    href={resource.officialCourseUrl || resource.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-800 dark:text-indigo-300 hover:underline truncate block font-mono font-bold"
                  >
                    {resource.officialCourseUrl || resource.sourceUrl}
                  </a>
                </div>
              )}

              {resource.lastVerifiedAt && (
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Verified: {new Date(resource.lastVerifiedAt).toLocaleDateString('en-GB')}
                </div>
              )}

              {resource.verificationNotes && (
                <p className="text-indigo-900 dark:text-indigo-200 text-[10px] leading-relaxed italic bg-white/60 dark:bg-slate-800/60 p-2 rounded-lg">
                  &ldquo;{resource.verificationNotes}&rdquo;
                </p>
              )}

              {resource.accreditationNotes && (
                <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
                  {resource.accreditationNotes}
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Legitimacy Protection</span>
              </div>
              <p>
                Opportunity Ghana audits each learning resource against official university, cloud vendor, and international accreditation standards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
