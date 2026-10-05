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
  Info
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

  if (loading) return <LoadingState message="Loading resource..." />;
  if (!resource) {
    return (
      <EmptyState
        title="Resource not found"
        description="This learning resource might have expired or been removed."
        actionText="Browse All Resources"
        onAction={() => onNavigate('/resources')}
      />
    );
  }

  const isPendingOrUnpublished = resource.status !== 'published' && (resource.status as string) !== 'approved';
  const isSubmitterOrAdmin = isEditorOrAdmin || (currentUser && (currentUser.id === resource.submittedBy || currentUser.email === resource.submittedByEmail || currentUser.id === resource.createdByUserId || currentUser.email === resource.createdByEmail));

  if (isPendingOrUnpublished && !isSubmitterOrAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          title="Submission Awaiting Review"
          description="This resource submission is currently awaiting editorial verification before it is published on Opportunity Ghana."
          actionText="Browse Active Resources"
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
        <button onClick={() => onNavigate('/')} className="hover:text-emerald-700 cursor-pointer">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button onClick={() => onNavigate('/resources')} className="hover:text-emerald-700 cursor-pointer">
          Resources
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-800 font-semibold truncate max-w-[200px]">{resource.title}</span>
      </nav>

      {/* Featured Resource Photo Banner */}
      {(() => {
        const media = resolveResourceMedia(resource);
        return (
          <div
            className="w-full h-56 sm:h-72 lg:h-80 rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs relative bg-slate-950"
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
                    {resource.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-space">
                    {resource.providerName || 'Certified Partner'}
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

      {/* Media Attribution */}
      {resource.imageSourceName && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium px-2">
          <span>Official credential graphic provided by</span>
          {resource.imageSourceUrl ? (
            <a
              href={resource.imageSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#006B3F] hover:underline font-bold inline-flex items-center gap-0.5"
            >
              <span>{resource.imageSourceName}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : (
            <strong className="text-slate-700">{resource.imageSourceName}</strong>
          )}
        </div>
      )}

      {/* Hero */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="indigo" className="capitalize">
                {resource.resourceType.replace('_', ' ')}
              </Badge>
              <Badge variant="slate">{resource.category}</Badge>
              {resource.isFree ? (
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                  FREE TUITION
                </span>
              ) : (
                <Badge variant="amber">
                  {resource.currency} {resource.cost.toLocaleString()}
                </Badge>
              )}
              <VerificationBadge status={resource.verificationStatus || 'verified'} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-space">
              {resource.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 flex items-center gap-2 font-medium">
              <span>Offered by</span>
              <strong className="text-slate-800">{resource.providerName || 'Certified Academy'}</strong>
              <span>•</span>
              <span className="text-slate-500">{resource.format}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Bookmark resource"
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
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#006B3F] hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer transition-colors"
            >
              <span>{resource.isFree ? 'Start Free Course' : 'Enroll / View Course'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {copied && (
          <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-bold inline-block">
            ✓ Course link copied to clipboard!
          </div>
        )}

        {/* Specs row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-400">Duration</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{resource.duration}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-400">Skill Level</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{resource.level}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-400">Certificate</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">
              {resource.hasCertificate
                ? resource.certificateType || 'Certificate Included'
                : 'No Certificate'}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-400">Cost & Pricing</p>
            <p className="text-xs font-bold text-emerald-700 mt-0.5">
              {resource.isFree ? (
                resource.costType === 'free_to_audit' ? (
                  <span>Free Audit <span className="text-[10px] text-slate-500 font-normal">(Opt. Paid Cert)</span></span>
                ) : (
                  '100% Free Tuition'
                )
              ) : (
                <>
                  {resource.currency} {resource.cost.toLocaleString()}
                  <span className="text-[10px] text-slate-500 font-normal ml-1">
                    {resource.pricingModel === 'monthly' ? '/ month' : resource.pricingModel === 'per-course' ? '/ course' : resource.pricingModel === 'per-exam' ? '/ paper' : '(one-time)'}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 font-space">Curriculum Overview</h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">{resource.description}</p>
          </section>

          {/* Free Course & Certificate Policy Transparency */}
          {resource.isFree && (
            <section className="bg-gradient-to-br from-emerald-50/80 via-white to-slate-50 rounded-3xl border border-emerald-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-base font-bold text-emerald-950 font-space flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span>Free Course Policy & Certificate Details</span>
                </h2>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono">
                  {resource.costType === 'free_to_audit' ? 'FREE AUDIT' : resource.costType === 'free_with_paid_certificate' ? 'FREE TUITION' : '100% FREE'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Course Tuition</p>
                  <p className="text-base font-black text-emerald-700 font-space mt-0.5">
                    $0 USD (Free)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Full access to curriculum, lectures, and sandbox exercises
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Certificate Status</p>
                  <p className="text-xs font-bold text-slate-900 mt-1">
                    {resource.certificateType || (resource.hasCertificate ? 'Certificate Included' : 'No Certificate')}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {resource.certificateCost || (resource.hasCertificate ? 'Free of charge upon completion' : 'Not provided by official source')}
                  </p>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-emerald-100 shadow-2xs">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Ghana Accessibility</p>
                  <p className="text-xs font-bold text-emerald-800 mt-1">
                    ✓ 100% Accessible Online
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Self-paced online format open to Ghanaian learners
                  </p>
                </div>
              </div>

              {resource.costDescription && (
                <div className="text-xs text-emerald-900 leading-relaxed bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80">
                  <strong className="block font-bold mb-0.5 text-emerald-950">Official Cost & Certificate Notes:</strong>
                  {resource.costDescription}
                </div>
              )}
            </section>
          )}

          {/* What You Will Learn / Outcomes */}
          {resource.whatYouWillLearn && resource.whatYouWillLearn.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 font-space flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>What You Will Learn / Learning Outcomes</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {resource.whatYouWillLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Target Audience Section */}
          {((resource.whoIsThisFor && resource.whoIsThisFor.length > 0) || resource.targetAudience) && (
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 font-space">Who Should Enroll?</h2>
              {resource.targetAudience && (
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3">{resource.targetAudience}</p>
              )}
              {resource.whoIsThisFor && resource.whoIsThisFor.length > 0 && (
                <ul className="space-y-2">
                  {resource.whoIsThisFor.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* Ghana Access & Regional Availability */}
          {(resource.ghanaAccessibility || resource.accessGhanaNotes) && (
            <section className="bg-emerald-50/60 rounded-3xl border border-emerald-200/80 p-6 sm:p-8 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h2 className="text-base font-bold text-emerald-950 font-space">
                  Ghana Accessibility & Online Access Verification
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed">
                {resource.ghanaAccessibility || resource.accessGhanaNotes}
              </p>
            </section>
          )}

          {/* Pricing & Fee Transparency Card */}
          {!resource.isFree && (
            <section className="bg-gradient-to-br from-amber-50/70 via-white to-slate-50 rounded-3xl border border-amber-200/80 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-amber-950 font-space flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <span>Verified Price &amp; Payment Transparency</span>
                </h2>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {resource.pricingModel?.replace('-', ' ').toUpperCase() || 'ONE-TIME'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-amber-100 shadow-2xs">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Published Price</p>
                  <p className="text-base font-black text-slate-900 font-mono mt-0.5">
                    {resource.currency} {resource.cost.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-amber-100 shadow-2xs">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Billing Structure</p>
                  <p className="text-xs font-bold text-slate-800 mt-1 capitalize">
                    {resource.pricingModel === 'monthly' ? 'Monthly Subscription' : resource.pricingModel === 'per-course' ? 'Pay-per-course / Tiered' : resource.pricingModel === 'per-exam' ? 'Per Exam Registration' : 'One-Time Voucher / Exam'}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-amber-100 shadow-2xs">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Financial Aid / Aid</p>
                  <p className="text-xs font-bold text-emerald-800 mt-1">
                    {resource.financialAid ? '✓ Relief / Discounts Available' : 'Standard Rate'}
                  </p>
                </div>
              </div>

              {resource.paymentNotes && (
                <div className="text-xs text-slate-700 leading-relaxed bg-white/90 p-4 rounded-2xl border border-amber-100 space-y-1">
                  <strong className="text-slate-900 block font-semibold">Payment &amp; Voucher Specifics:</strong>
                  <p>{resource.paymentNotes}</p>
                </div>
              )}
            </section>
          )}

          {/* Ghana Access & Examination Centers */}
          {resource.accessGhanaNotes && (
            <section className="bg-emerald-50/60 rounded-3xl border border-emerald-200/80 p-6 sm:p-8 space-y-3 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h2 className="text-base font-bold text-emerald-950 font-space">
                  Access &amp; Testing Information for Ghana
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900/90 leading-relaxed">
                {resource.accessGhanaNotes}
              </p>
            </section>
          )}

          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 font-space">Skills You Will Master</h2>
            <div className="flex flex-wrap gap-2">
              {resource.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {resource.prerequisites && (
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-3 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 font-space">Prerequisites</h2>
              <ul className="space-y-2">
                {resource.prerequisites.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-space">
              {resource.isFree ? 'Start Learning' : 'Direct Enrollment'}
            </h3>
            <p className="text-xs text-slate-500">
              {resource.isFree
                ? 'Access the full course directly on the official provider portal at zero tuition fee:'
                : 'Access the official curriculum portal or partner cohort application:'}
            </p>
            
            <a
              href={resource.enrollmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#006B3F] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              <span>{resource.isFree ? 'Start Free Course' : 'Go to Enrollment Portal'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {resource.officialCourseUrl && resource.officialCourseUrl !== resource.enrollmentUrl && (
              <a
                href={resource.officialCourseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-colors"
              >
                <span>Official Course Webpage</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}

            {resource.providerWebsiteUrl && (
              <a
                href={resource.providerWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-slate-500 hover:text-slate-800 text-[11px] font-medium transition-colors"
              >
                <span>Visit {resource.providerName || 'Provider'} Website</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}

            {/* Language & Delivery */}
            {(resource.language || (resource.subtitles && resource.subtitles.length > 0)) && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-space">Instruction Language</span>
                <p className="font-semibold text-slate-800">Primary: {resource.language || 'English'}</p>
                {resource.subtitles && resource.subtitles.length > 0 && (
                  <p className="text-[11px] text-slate-500">Subtitles: {resource.subtitles.join(', ')}</p>
                )}
              </div>
            )}

            {/* Verification Box */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-[11px] text-indigo-950 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1 text-indigo-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                  Provider Verification
                </span>
                <VerificationBadge status={resource.verificationStatus || 'verified'} />
              </div>

              {resource.sourceUrl && (
                <div className="pt-1 border-t border-indigo-200/60">
                  <span className="text-indigo-700 font-medium block">Course Syllabus Source:</span>
                  <a
                    href={resource.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-800 hover:underline truncate block font-mono font-bold"
                  >
                    {resource.sourceUrl}
                  </a>
                </div>
              )}

              {resource.lastVerifiedAt && (
                <div className="text-[10px] text-slate-500 font-mono">
                  Last checked: {new Date(resource.lastVerifiedAt).toLocaleDateString('en-GB')}
                </div>
              )}

              {resource.verificationNotes && (
                <p className="text-indigo-800 text-[10px] leading-relaxed italic">
                  &ldquo;{resource.verificationNotes}&rdquo;
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1 font-bold text-slate-800">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Legitimacy Protection</span>
              </div>
              <p>
                Opportunity Ghana only recommends accredited or industry-recognized learning curricula.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
