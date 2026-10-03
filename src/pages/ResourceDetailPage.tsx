import React, { useEffect, useState } from 'react';
import { Resource } from '../types/database';
import { ResourcesService } from '../services/resourcesService';
import { useAuth } from '../services/authContext';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { LoadingState, EmptyState } from '../components/common/CommonUI';
import { resolveResourceMedia } from '../utils/cardBackgrounds';
import {
  ChevronRight,
  ExternalLink,
  CheckCircle,
  Share2,
  Bookmark,
  ShieldCheck,
  Info,
  Globe,
  Laptop,
  Calendar,
  FileCheck,
  Languages
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
        title="Course or Resource Not Found"
        description="This learning resource might have expired or been removed."
        actionText="Browse Verified Courses"
        onAction={() => onNavigate('/resources')}
      />
    );
  }

  const isPendingOrUnpublished =
    resource.status !== 'published' && (resource.status as string) !== 'approved';
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
          title="Submission Awaiting Review"
          description="This resource submission is currently awaiting editorial verification before it is published on Opportunity Ghana."
          actionText="Browse Active Courses"
          onAction={() => onNavigate('/resources')}
        />
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const courseStatusLabel = resource.isFree
    ? resource.freeStatus === 'free_to_audit'
      ? 'Free to Audit'
      : 'Free'
    : `Paid (${resource.currency} ${resource.cost.toLocaleString()})`;

  const certStatusLabel =
    resource.certificateStatus === 'free_certificate'
      ? 'Free'
      : resource.certificateStatus === 'paid_certificate'
      ? 'Paid'
      : resource.certificateStatus === 'no_certificate'
      ? 'Not provided'
      : resource.hasCertificate
      ? 'Included'
      : 'Not provided';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
        <button onClick={() => onNavigate('/')} className="hover:text-[#006B3F] cursor-pointer">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button
          onClick={() => onNavigate(resource.isFree ? '/free-courses' : '/resources')}
          className="hover:text-[#006B3F] cursor-pointer"
        >
          {resource.isFree ? 'Free Courses' : 'Courses & Certifications'}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold truncate max-w-[260px]">{resource.title}</span>
      </nav>

      {/* Featured Resource Banner */}
      {(() => {
        const media = resolveResourceMedia(resource);
        return (
          <div
            className="w-full h-52 sm:h-64 rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs relative bg-slate-950"
            style={{ background: media.gradient.cssGradient }}
          >
            {media.imageUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={media.imageUrl}
                  alt={resource.title}
                  className="w-full h-full object-cover object-[center_25%]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col justify-end p-6 sm:p-8 relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wide text-[#FCD116]">
                    <span>{resource.category}</span>
                    {resource.subcategory && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-200">{resource.subcategory}</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-space">
                    {resource.providerName || 'Official Course Provider'}
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

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-2">
            {/* Unboxed Metadata Kicker */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="text-[#006B3F] font-bold capitalize">
                {resource.resourceType.replace('_', ' ')}
              </span>
              <span aria-hidden="true">·</span>
              <span>{resource.category}</span>
              {resource.subcategory && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{resource.subcategory}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <VerificationBadge status={resource.verificationStatus || 'verified'} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-space">
              {resource.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 flex flex-wrap items-center gap-2 font-medium">
              <span>Offered by</span>
              {resource.providerWebsite ? (
                <a
                  href={resource.providerWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 font-bold hover:text-[#006B3F] hover:underline inline-flex items-center gap-1"
                >
                  <span>{resource.providerName || 'Official Provider'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <strong className="text-slate-900">{resource.providerName || 'Official Provider'}</strong>
              )}
              <span aria-hidden="true">·</span>
              <span>{resource.format}</span>
              {resource.language && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{resource.language}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Bookmark course"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-700' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Copy share link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <a
              href={resource.enrollmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#006B3F] hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer transition-colors"
            >
              <span>Enroll on Official Site</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {copied && (
          <div className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg font-semibold inline-block">
            Course link copied to clipboard
          </div>
        )}

        {/* Primary Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500">Course Status</p>
            <p className="text-sm font-bold text-[#006B3F] mt-0.5">
              Course: {courseStatusLabel}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Certificate Policy</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              Certificate: {certStatusLabel}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Duration &amp; Workload</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {resource.duration}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Course Level</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {resource.level}
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Free & Certificate Transparency Breakdown */}
          {resource.isFree ? (
            <section className="bg-white rounded-2xl border border-emerald-200/90 p-6 sm:p-8 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#006B3F]" />
                  <h2 className="text-base font-bold text-slate-900 font-space">
                    Verified Free Access &amp; Certificate Transparency
                  </h2>
                </div>
                <span className="text-xs font-bold text-[#006B3F]">
                  Course: {courseStatusLabel} · Certificate: {certStatusLabel}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-slate-500">Course Content Access</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {resource.freeStatus === 'free_to_audit'
                      ? 'Free to Audit (100% Free Lectures & Readings)'
                      : 'Completely Free ($0 Tuition)'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Certificate Status</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {resource.certificateStatus === 'free_certificate'
                      ? 'Free Official Certificate / Digital Badge'
                      : resource.certificateStatus === 'paid_certificate'
                      ? 'Paid Optional Certificate'
                      : 'Not provided by provider'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Certificate Cost</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {resource.certificateCost ||
                      (resource.certificateStatus === 'free_certificate'
                        ? 'Free ($0)'
                        : resource.certificateStatus === 'no_certificate'
                        ? 'Not provided'
                        : 'Not specified by provider')}
                  </p>
                </div>
              </div>

              {(resource.paymentNotes || resource.enrollmentNotes) && (
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-700 leading-relaxed">
                  {resource.paymentNotes && (
                    <p>
                      <strong className="text-slate-900">Cost Breakdown: </strong>
                      {resource.paymentNotes}
                    </p>
                  )}
                  {resource.enrollmentNotes && (
                    <p>
                      <strong className="text-slate-900">How to Enroll for Free: </strong>
                      {resource.enrollmentNotes}
                    </p>
                  )}
                </div>
              )}
            </section>
          ) : (
            <section className="bg-white rounded-2xl border border-amber-200/90 p-6 sm:p-8 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900 font-space flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <span>Verified Price &amp; Payment Transparency</span>
                </h2>
                <span className="text-xs font-bold text-amber-900 font-mono">
                  {resource.currency} {resource.cost.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-slate-500">Published Price</p>
                  <p className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                    {resource.currency} {resource.cost.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Billing Structure</p>
                  <p className="font-bold text-slate-900 mt-0.5 capitalize">
                    {resource.pricingModel === 'monthly'
                      ? 'Monthly Subscription'
                      : resource.pricingModel === 'per-course'
                      ? 'Pay-per-course / Tiered'
                      : resource.pricingModel === 'per-exam'
                      ? 'Per Exam Registration'
                      : 'One-Time Voucher / Exam'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Financial Aid</p>
                  <p className="font-bold text-emerald-800 mt-0.5">
                    {resource.financialAid ? 'Available for eligible learners' : 'Standard Rate'}
                  </p>
                </div>
              </div>

              {resource.paymentNotes && (
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Payment Specifics: </strong>
                  {resource.paymentNotes}
                </div>
              )}
            </section>
          )}

          {/* Course Description */}
          <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-3 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 font-space">Course Description</h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{resource.description}</p>
          </section>

          {/* Learning Outcomes */}
          {resource.learningOutcomes && resource.learningOutcomes.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-3 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900 font-space">What You Will Learn</h2>
              <ul className="space-y-2.5">
                {resource.learningOutcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-[#006B3F] shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Skills Gained */}
          <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-3 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 font-space">Skills Gained</h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {resource.skills.join(' · ')}
            </p>
          </section>

          {/* Prerequisites, Software & Assessment */}
          <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 font-space">
              Prerequisites, Requirements &amp; Assessment
            </h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <p className="font-bold text-slate-900 mb-1">Prerequisites</p>
                {resource.prerequisites && resource.prerequisites.length > 0 ? (
                  <ul className="space-y-1.5 text-slate-700">
                    {resource.prerequisites.map((p, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-[#006B3F] shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-600">Not specified by provider</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <Laptop className="w-4 h-4 text-slate-500" />
                    <span>Required Software / Equipment</span>
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {resource.requiredSoftware || 'Not specified by provider'}
                  </p>
                </div>

                <div>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <FileCheck className="w-4 h-4 text-slate-500" />
                    <span>Assessment Method</span>
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {resource.assessmentMethod || 'Not specified by provider'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Target Audience */}
          {resource.targetAudience && (
            <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-2 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900 font-space">Target Audience</h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{resource.targetAudience}</p>
            </section>
          )}

          {/* Ghana Accessibility & Geographic Restrictions */}
          <section className="bg-emerald-50/50 rounded-2xl border border-emerald-200/80 p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#006B3F]" />
              <h2 className="text-base font-bold text-slate-900 font-space">
                Ghana Accessibility &amp; Eligibility
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              {resource.accessGhanaNotes || 'Available online to learners worldwide including Ghana.'}
            </p>
            <div className="pt-2 border-t border-emerald-200/60 text-xs text-slate-600">
              <strong className="text-slate-800">Geographic Restrictions: </strong>
              {resource.geographicRestrictions || 'None — Available online to learners worldwide'}
            </div>
          </section>
        </div>

        {/* Right Sidebar: Course Specs, Dates & Official Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-5 shadow-2xs">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 font-space">
                Official Course Access
              </h3>
              <p className="text-xs text-slate-500">
                Access this course directly on the official provider platform:
              </p>
            </div>

            <div className="space-y-2.5">
              <a
                href={resource.enrollmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#006B3F] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                <span>Go to Official Enrollment Page</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {resource.courseUrl && resource.courseUrl !== resource.enrollmentUrl && (
                <a
                  href={resource.courseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  <span>View Official Syllabus Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {resource.providerWebsite && (
                <a
                  href={resource.providerWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-slate-600 hover:text-slate-900 font-medium text-xs cursor-pointer"
                >
                  <span>Visit {resource.providerName} Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Complete Schedule & Format Metadata */}
            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Schedule &amp; Workload</span>
              </h4>
              <dl className="space-y-2 text-slate-600">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Estimated Workload:</dt>
                  <dd className="font-semibold text-slate-900 text-right">
                    {resource.estimatedWorkload || resource.duration}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Start Date:</dt>
                  <dd className="font-semibold text-slate-900 text-right">
                    {resource.startDate || 'Self-paced (Start anytime)'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">End Date:</dt>
                  <dd className="font-semibold text-slate-900 text-right">
                    {resource.endDate || 'Self-paced'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Enrollment Deadline:</dt>
                  <dd className="font-semibold text-slate-900 text-right">
                    {resource.enrollmentDeadline || 'Open enrollment'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Language & Subtitles */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-slate-500" />
                <span>Language &amp; Subtitles</span>
              </h4>
              <p className="text-slate-600">
                <strong className="text-slate-800">Language:</strong> {resource.language || 'English'}
              </p>
              <p className="text-slate-600">
                <strong className="text-slate-800">Subtitles:</strong>{' '}
                {resource.subtitles || 'Not specified by provider'}
              </p>
            </div>

            {/* Verification Box */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-600">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#006B3F]" />
                  <span>Editorial Verification</span>
                </span>
                <VerificationBadge status={resource.verificationStatus || 'verified'} />
              </div>

              {resource.sourceUrl && (
                <div>
                  <span className="text-slate-500 block">Verified Official URL:</span>
                  <a
                    href={resource.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#006B3F] hover:underline truncate block font-mono"
                  >
                    {resource.sourceUrl}
                  </a>
                </div>
              )}

              {resource.lastVerifiedAt && (
                <div className="text-slate-500 font-mono">
                  Last checked: {new Date(resource.lastVerifiedAt).toLocaleDateString('en-GB')}
                </div>
              )}

              {resource.verificationNotes && (
                <p className="text-slate-600 leading-relaxed">{resource.verificationNotes}</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1 font-semibold text-slate-700">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Learner Protection</span>
              </div>
              <p>
                Opportunity Ghana verifies every course directly against the official provider. We never charge intermediary enrollment fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
