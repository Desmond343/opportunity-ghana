import React, { useState, useEffect } from 'react';
import { SkillsService } from '../services/skillsService';
import { Skill, Opportunity, Resource } from '../types/database';
import { SavedService } from '../services/savedService';
import { useAuth } from '../services/authContext';
import { Badge } from '../components/common/Badge';
import { OpportunityCard } from '../components/cards/OpportunityCard';
import { ResourceCard } from '../components/cards/ResourceCard';
import {
  ChevronLeft,
  Briefcase,
  Bookmark,
  Share2,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  Wrench,
  Compass,
  ExternalLink,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Building,
  Target,
  Sparkles,
  GraduationCap
} from 'lucide-react';

interface SkillDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const SkillDetailPage: React.FC<SkillDetailPageProps> = ({ slug, onNavigate }) => {
  const { currentUser, getIdToken } = useAuth();
  const [skill, setSkill] = useState<Skill | null>(() => SkillsService.getBySlug(slug));
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [relatedOpportunities, setRelatedOpportunities] = useState<Opportunity[]>([]);
  const [relatedCourses, setRelatedCourses] = useState<Resource[]>([]);

  useEffect(() => {
    const loaded = SkillsService.getBySlug(slug);
    setSkill(loaded);
    if (loaded) {
      setIsSaved(SavedService.isSaved(loaded.id));
      Promise.all([
        SkillsService.getRelatedOpportunities(loaded, 4),
        SkillsService.getRelatedCourses(loaded, 4)
      ]).then(([opps, courses]) => {
        setRelatedOpportunities(opps);
        setRelatedCourses(courses);
      }).catch(err => {
        console.warn('Error loading related items for skill:', err);
      });
    }
  }, [slug]);

  useEffect(() => {
    if (!skill) return;
    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.id === skill.id || e.detail.userId !== undefined) {
        setIsSaved(SavedService.isSaved(skill.id));
      }
    };
    window.addEventListener('saved-opportunities-changed', handleUpdate);
    return () => window.removeEventListener('saved-opportunities-changed', handleUpdate);
  }, [skill]);

  if (!skill) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-space">
          Skill Pathway Not Found
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          We could not find the requested skill or career competency profile.
        </p>
        <button
          onClick={() => onNavigate('/skills')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#006B3F] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Skills Registry</span>
        </button>
      </div>
    );
  }

  const toggleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const updated = await SavedService.toggleSave(
        {
          id: skill.id,
          slug: skill.slug,
          title: skill.name,
          category: skill.category,
          type: 'Skill',
          itemType: 'skill',
          targetPath: `/skills/${skill.slug}`
        },
        currentUser?.id,
        getIdToken
      );
      setIsSaved(updated);
    } catch (err: any) {
      console.warn('Error saving skill:', err?.message || err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <button
          onClick={() => onNavigate('/')}
          className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          Home
        </button>
        <span>/</span>
        <button
          onClick={() => onNavigate('/skills')}
          className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          Skills &amp; Careers
        </button>
        <span>/</span>
        <span className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-xs">
          {skill.name}
        </span>
      </nav>

      {/* Hero Header Card */}
      <section className="floating-glass-tablet specular-rim-highlight rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            {/* Badges Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="emerald">{skill.category}</Badge>
              <span className="text-xs font-bold text-[#006B3F] dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/70 border border-[#006B3F]/20 dark:border-emerald-700/60 px-3 py-1 rounded-xl backdrop-blur-xs flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{skill.demandLevel || 'High'} Demand in Ghana</span>
              </span>
              {skill.level && (
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-xl">
                  Level: {skill.level}
                </span>
              )}
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/40 px-2.5 py-1 rounded-xl flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Standard</span>
              </span>
            </div>

            {/* Skill Title */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-space tracking-tight leading-tight">
              {skill.name}
            </h1>

            {/* Overview / Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {skill.description}
            </p>
          </div>

          {/* Action CTAs: Save, Share */}
          <div className="flex sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={toggleSave}
              className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isSaved
                  ? 'bg-[#006B3F] text-white hover:bg-emerald-800 ring-2 ring-emerald-500/50'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:border-[#006B3F]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#FCD116] text-[#FCD116]' : ''}`} />
              <span>{isSaved ? 'Saved to Profile' : 'Save Competency'}</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedShare ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Visual Header Image (if available) */}
        {skill.imageUrl && (
          <div className="relative rounded-2xl overflow-hidden h-56 sm:h-72 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <img
              src={skill.imageUrl}
              alt={skill.imageAlt || skill.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-5">
              <span className="text-xs text-white/90 font-medium drop-shadow-md">
                {skill.imageAlt || `${skill.name} vocational & professional competency in Ghana`}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN (2 Cols): Detailed Breakdown */}
        <div className="lg:col-span-2 space-y-8">
          {/* Detailed Overview */}
          {skill.detailedDescription && (
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 space-y-3.5 shadow-2xs">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-space flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
                <span>Competency Overview</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {skill.detailedDescription}
              </p>
            </section>
          )}

          {/* What This Skill Is Used For */}
          {skill.whatItIsUsedFor && skill.whatItIsUsedFor.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-space flex items-center gap-2">
                <Target className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
                <span>What This Skill Is Used For</span>
              </h2>
              <ul className="space-y-2.5">
                {skill.whatItIsUsedFor.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Ghana Market Relevance */}
          {skill.whyUsefulInGhana && (
            <section className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-emerald-950/40 dark:to-teal-950/20 rounded-2xl p-6 sm:p-7 border border-emerald-200/80 dark:border-emerald-800/60 space-y-3 shadow-2xs">
              <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-200 font-space flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
                <span>Ghana &amp; African Job Market Relevance</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {skill.whyUsefulInGhana}
              </p>
            </section>
          )}

          {/* Tools & Software */}
          {skill.toolsAndSoftware && skill.toolsAndSoftware.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 space-y-3.5 shadow-2xs">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-space flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
                <span>Essential Tools, Software &amp; Frameworks</span>
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {skill.toolsAndSoftware.map((tool, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 px-3 py-1.5 rounded-xl shadow-2xs"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Practical Hands-on Projects */}
          {skill.practicalProjects && skill.practicalProjects.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-space flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
                <span>Portfolio-Building Practical Project Ideas</span>
              </h2>
              <div className="space-y-3">
                {skill.practicalProjects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#006B3F] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      {proj}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recognized Industry Certifications */}
          {skill.certifications && skill.certifications.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 space-y-3.5 shadow-2xs">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-space flex items-center gap-2">
                <Award className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
                <span>Recognized Industry Certifications</span>
              </h2>
              <div className="space-y-2">
                {skill.certifications.map((cert, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700"
                  >
                    <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {cert}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recommended Learning Resources */}
          {skill.learningResources && skill.learningResources.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 space-y-3.5 shadow-2xs">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-space flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
                <span>Free &amp; Verified Learning Curricula</span>
              </h2>
              <div className="space-y-2.5">
                {skill.learningResources.map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 hover:border-[#006B3F] transition-all group"
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 transition-colors">
                        {res.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Provided by {res.provider} {res.isFree && '• 100% Free'}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#006B3F] shrink-0" />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN (1 Col): Career Roles, Industries & Quick Links */}
        <div className="space-y-6">
          {/* Top Target Careers */}
          {skill.topCareers && skill.topCareers.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-3.5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-space uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
                <span>Target Career Roles</span>
              </h3>
              <div className="space-y-2">
                {skill.topCareers.map((career, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between"
                  >
                    <span>{career}</span>
                    <button
                      onClick={() => onNavigate(`/opportunities?search=${encodeURIComponent(career)}`)}
                      title={`Search jobs for ${career}`}
                      className="text-[#006B3F] dark:text-emerald-400 hover:underline text-[11px] cursor-pointer"
                    >
                      Find Jobs
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Industries Where Used */}
          {skill.industries && skill.industries.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-space uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
                <span>Primary Industries</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skill.industries.map((ind, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200/70 dark:border-slate-700"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites */}
          {skill.prerequisites && skill.prerequisites.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-space uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
                <span>Recommended Prerequisites</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {skill.prerequisites.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Complementary Related Skills */}
          {skill.relatedSkills && skill.relatedSkills.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-space uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
                <span>Related Competencies</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skill.relatedSkills.map((sub, idx) => (
                  <button
                    key={idx}
                    onClick={() => onNavigate(`/skills?search=${encodeURIComponent(sub)}`)}
                    className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Verification Source Box */}
          {skill.source && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Authority</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{skill.source}</p>
              {skill.sourceUrl && (
                <a
                  href={skill.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#006B3F] dark:text-emerald-400 hover:underline pt-1"
                >
                  <span>Official Reference</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CONNECTED OPPORTUNITIES ON OPPORTUNITY GHANA */}
      {relatedOpportunities.length > 0 && (
        <section className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
                <span className="text-xs font-bold text-[#006B3F] dark:text-emerald-400 uppercase tracking-wider">
                  Active Listings in Ghana
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-space">
                Jobs &amp; Internships Requiring {skill.name}
              </h2>
            </div>
            <button
              onClick={() => onNavigate(`/opportunities?search=${encodeURIComponent(skill.name)}`)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B3F] dark:text-emerald-400 hover:text-emerald-800 cursor-pointer"
            >
              <span>View All Opportunities</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedOpportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* CONNECTED COURSES ON OPPORTUNITY GHANA */}
      {relatedCourses.length > 0 && (
        <section className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
                <span className="text-xs font-bold text-[#006B3F] dark:text-emerald-400 uppercase tracking-wider">
                  Skill Building Curricula
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-space">
                Verified Courses &amp; Certifications for {skill.name}
              </h2>
            </div>
            <button
              onClick={() => onNavigate(`/resources?search=${encodeURIComponent(skill.name)}`)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B3F] dark:text-emerald-400 hover:text-emerald-800 cursor-pointer"
            >
              <span>View All Courses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedCourses.map((course) => (
              <ResourceCard key={course.id} resource={course} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
