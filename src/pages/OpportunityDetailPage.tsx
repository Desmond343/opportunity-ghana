import React, { useEffect, useState } from 'react';
import { Opportunity } from '../types/database';
import { OpportunitiesService } from '../services/opportunitiesService';
import { DeadlineBadge } from '../components/common/DeadlineBadge';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { Badge } from '../components/common/Badge';
import { LoadingState, EmptyState } from '../components/common/CommonUI';
import { calculateDeadlineInfo } from '../services/deadlineService';
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
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [alternatives, setAlternatives] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadOpportunity() {
      setLoading(true);
      try {
        const item = await OpportunitiesService.getBySlug(slug);
        setOpportunity(item);
        if (item) {
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

  const isClosed = opportunity.status === 'closed' || calculateDeadlineInfo(opportunity.deadline).isClosed;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Bookmark opportunity"
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
              <DeadlineBadge deadline={opportunity.deadline} />
            </div>
          </div>
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
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Full Description & Requirements */}
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Overview */}
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 font-space">
              About This Opportunity
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed space-y-3">
              <p>{opportunity.description}</p>
            </div>
          </section>

          {/* Benefits */}
          {opportunity.benefits && opportunity.benefits.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900 font-space">
                  Benefits & Entitlements
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
          {opportunity.requirements && opportunity.requirements.length > 0 && (
            <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900 font-space">
                  Eligibility & Requirements
                </h2>
              </div>
              <ul className="space-y-2.5">
                {opportunity.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
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
              <a
                href={opportunity.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <span>Apply on Official Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <div className="p-3 bg-slate-100 rounded-xl text-center text-xs font-bold text-slate-500">
                Application Period Ended
              </div>
            )}

            {/* Verification System Box - Section 8 requirement */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-[11px] text-emerald-950 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1 text-emerald-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Source Verification
                </span>
                <VerificationBadge status={opportunity.verificationStatus} />
              </div>

              {opportunity.sourceUrl && (
                <div className="pt-1 border-t border-emerald-200/60">
                  <span className="text-emerald-700 font-medium block">Original Notice:</span>
                  <a
                    href={opportunity.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-800 hover:underline truncate block font-mono font-bold"
                  >
                    {opportunity.sourceUrl}
                  </a>
                </div>
              )}

              {opportunity.verificationNotes && (
                <p className="text-emerald-800 text-[10px] leading-relaxed italic">
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
