import React, { useEffect, useState } from 'react';
import { Resource } from '../types/database';
import { ResourcesService } from '../services/resourcesService';
import { Badge } from '../components/common/Badge';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { LoadingState, EmptyState } from '../components/common/CommonUI';
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
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
            >
              <span>Enroll / View Course</span>
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
              {resource.hasCertificate ? 'Yes, Upon Completion' : 'Audit Only'}
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-400">Cost</p>
            <p className="text-xs font-bold text-emerald-700 mt-0.5">
              {resource.isFree ? '100% Free' : `${resource.currency} ${resource.cost.toLocaleString()}`}
            </p>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-3 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 font-space">Curriculum Overview</h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{resource.description}</p>
          </section>

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
              Direct Enrollment
            </h3>
            <p className="text-xs text-slate-500">
              Access the official curriculum portal or partner cohort application:
            </p>
            <a
              href={resource.enrollmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              <span>Go to Enrollment Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>

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
