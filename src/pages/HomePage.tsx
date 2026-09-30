import React, { useEffect, useState } from 'react';
import { Opportunity, Resource } from '../types/database';
import { OpportunitiesService } from '../services/opportunitiesService';
import { ResourcesService } from '../services/resourcesService';
import { SearchBar } from '../components/common/SearchBar';
import { OpportunityCard } from '../components/cards/OpportunityCard';
import { ResourceCard } from '../components/cards/ResourceCard';
import { OPPORTUNITY_CATEGORIES } from '../data/categories';
import { LoadingState } from '../components/common/CommonUI';
import {
  GraduationCap,
  Briefcase,
  Compass,
  Coins,
  BookOpen,
  ArrowRight,
  Bell,
  Clock,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  Award,
  Zap
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [closingSoon, setClosingSoon] = useState<Opportunity[]>([]);
  const [newlyAdded, setNewlyAdded] = useState<Opportunity[]>([]);
  const [freeCourses, setFreeCourses] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick alert newsletter email
  const [alertEmail, setAlertEmail] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [closing, recent, courses] = await Promise.all([
          OpportunitiesService.getClosingSoon(4),
          OpportunitiesService.getNewlyAdded(6),
          ResourcesService.getFreeCourses(3)
        ]);
        setClosingSoon(closing);
        setNewlyAdded(recent);
        setFreeCourses(courses);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleHeroSearch = (term: string, category: string) => {
    const params = new URLSearchParams();
    if (term) params.set('search', term);
    if (category && category !== 'All') params.set('category', category);
    onNavigate(`/opportunities?${params.toString()}`);
  };

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertEmail) {
      setAlertSuccess(true);
      setAlertEmail('');
      setTimeout(() => setAlertSuccess(false), 5000);
    }
  };

  const heroCategories = [
    { label: 'Scholarships', icon: GraduationCap, category: 'Scholarships' },
    { label: 'Jobs', icon: Briefcase, category: 'Jobs' },
    { label: 'Internships', icon: Compass, category: 'Internships' },
    { label: 'Admissions', icon: BookOpen, category: 'Admissions' },
    { label: 'Grants', icon: Coins, category: 'Grants' },
    { label: 'Courses', icon: Sparkles, path: '/resources' },
    { label: 'Certifications', icon: Award, path: '/resources?type=certification' }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle patterned background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/40 text-xs font-semibold text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Verified Opportunities for Ghana
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight font-space">
            Find your next opportunity.
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Discover jobs, scholarships, internships, courses, certifications and other opportunities available to you.
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-3xl mx-auto">
            <SearchBar
              onSearch={handleHeroSearch}
              placeholder="Search jobs, scholarships, courses, internships..."
            />
          </div>

          {/* Quick Category Chips */}
          <div className="pt-3">
            <p className="text-xs text-emerald-300/80 font-medium mb-3">Popular Categories:</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {heroCategories.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (item.path) {
                        onNavigate(item.path);
                      } else {
                        onNavigate(`/opportunities?category=${item.category}`);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white transition-all backdrop-blur-xs cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* SECTION 1: CLOSING SOON */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-space">
                  Closing Soon
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Urgent application deadlines approaching. Don't miss these windows.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/opportunities')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View all urgent deadlines</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <LoadingState message="Fetching urgent opportunities..." />
          ) : closingSoon.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {closingSoon.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onNavigate={onNavigate}
                  featured={true}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No Imminent Deadlines in the Next 7 Days</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All currently active scholarships, jobs, and programmes have extended application periods.
              </p>
              <button
                onClick={() => onNavigate('/opportunities')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
              >
                Browse All Open Opportunities
              </button>
            </div>
          )}
        </section>

        {/* SECTION 2: NEWLY ADDED */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-space">
                  Newly Added
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Freshly verified openings published across Ghana.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/opportunities')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Explore all opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <LoadingState />
          ) : newlyAdded.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newlyAdded.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center space-y-3">
              <Compass className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Fresh Opportunities Being Curated</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Our editorial team verifies notices directly from Ghanaian universities, ministries, and accredited employers before publishing.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <button
                  onClick={() => onNavigate('/alerts')}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  Set Opportunity Alerts
                </button>
                <button
                  onClick={() => onNavigate('/careers')}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold shadow-2xs hover:bg-slate-50 cursor-pointer"
                >
                  Explore Career Tracks
                </button>
              </div>
            </div>
          )}
        </section>

        {/* SECTION 3: BROWSE OPPORTUNITIES BY CATEGORY */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 font-space">
              Browse Opportunities
            </h2>
            <p className="text-xs text-slate-500">
              Targeted categories structured for students, graduates, and professionals in Ghana.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {OPPORTUNITY_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onNavigate(`/opportunities?category=${cat.id}`)}
                className="group p-4 bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-500/50 hover:shadow-sm transition-all text-left flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
                  <span>Explore category</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* SECTION 4: RESOURCES & BOOTCAMPS */}
        <section className="space-y-6 bg-slate-100/70 p-6 sm:p-8 rounded-3xl border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-space">
                  Resources & Learning Paths
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Courses, bootcamps, workshops, and verified credentials to build high-demand skills.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/resources')}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>View all resources</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {freeCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {freeCourses.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-indigo-600 mx-auto" />
              <p className="text-sm font-bold text-slate-800">Upskilling & Certification Programs</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Explore accredited online cohorts, bootcamps, and professional certificates curated for youth and professionals in Ghana.
              </p>
              <button
                onClick={() => onNavigate('/resources')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Browse All Learning Tracks
              </button>
            </div>
          )}
        </section>

        {/* SECTION 5: FREE COURSES HIGHLIGHT */}
        <section className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-3xl text-white p-8 sm:p-10 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-700/80 text-xs font-bold text-emerald-200">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                100% Free Learning
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-space">
                Free Courses with Certificates
              </h2>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Upskill without tuition barriers. We catalog free, accredited courses and practical cohorts from leading universities and industry partners in software, data, finance, and marketing.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('/resources?free=true')}
                  className="px-5 py-2.5 rounded-xl bg-white text-emerald-900 text-xs font-bold hover:bg-emerald-50 transition-colors shadow-xs"
                >
                  Browse Free Courses
                </button>
                <button
                  onClick={() => onNavigate('/careers')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700/60 hover:bg-emerald-700/80 text-white text-xs font-bold border border-emerald-500/40 transition-colors"
                >
                  Explore Career Pathways
                </button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Featured Free Tracks
              </h3>
              <ul className="space-y-2.5 text-xs text-emerald-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full Stack React & Node.js Developer Curriculum</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Practical Financial Management for Micro-Enterprises</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Data Analytics & SQL Fundamentals Certificate</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Prompt Engineering & Digital Productivity Cohort</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 6: CAREER FOUNDATION & SKILLS */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-space">
                  Career Pathways & Skills
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Understand in-demand Ghanaian job roles and their corresponding learning paths.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/careers')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Explore all career tracks</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                High Demand
              </span>
              <h3 className="text-base font-bold text-slate-900">Software Engineering</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Build backend web services, mobile apps, and fintech tools for Ghana’s surging digital economy.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">Relevant: 8 Courses</span>
                <button
                  onClick={() => onNavigate('/careers')}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  View Skill Map →
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Growing Field
              </span>
              <h3 className="text-base font-bold text-slate-900">Data Analytics & Business Intelligence</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Analyze commercial data, create dashboards, and support evidence-based decisions for companies and banks.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">Relevant: 5 Courses</span>
                <button
                  onClick={() => onNavigate('/careers')}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  View Skill Map →
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Entrepreneurship
              </span>
              <h3 className="text-base font-bold text-slate-900">Agribusiness & Value Addition</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scale modern food processing, precision farming, and export agriculture ventures across all 16 regions.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">Relevant: 4 Grants</span>
                <button
                  onClick={() => onNavigate('/careers')}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  View Skill Map →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: ALERTS & NOTIFICATIONS */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
              <Bell className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-space">
              Never Miss a Deadline
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Get targeted alerts directly when scholarships, graduate recruitments, or government grants matching your profile and education level are verified.
            </p>

            {alertSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold animate-in fade-in">
                ✓ Thank you! You will receive verified opportunity alerts.
              </div>
            ) : (
              <form onSubmit={handleAlertSubmit} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  Set Free Alerts
                </button>
              </form>
            )}

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Spam-free & zero spam policy
              </span>
              <span>•</span>
              <button
                onClick={() => onNavigate('/alerts')}
                className="text-emerald-700 font-semibold underline"
              >
                Configure WhatsApp & category filters
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
