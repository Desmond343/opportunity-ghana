import React, { useEffect, useState } from 'react';
import heroTrainingImage from '../assets/images/ghana_internship_training_1793142343043.jpg';
import { Opportunity, Resource, SuccessStory, Skill } from '../types/database';
import { OpportunitiesService } from '../services/opportunitiesService';
import { ResourcesService } from '../services/resourcesService';
import { SkillsService } from '../services/skillsService';
import { SuccessStoriesService } from '../services/successStoriesService';
import { AlertSubscriptionsService } from '../services/alertSubscriptionsService';
import { OpportunityCategorySection } from '../components/home/OpportunityCategorySection';
import { TailoredJourneysCarousel } from '../components/home/TailoredJourneysCarousel';
import { OpportunityCard } from '../components/cards/OpportunityCard';
import { ResourceCard } from '../components/cards/ResourceCard';
import { SkillCard } from '../components/cards/SkillCard';
import { OpportunitySkeleton } from '../components/common/CommonUI';
import { GHANA_REGIONS } from '../data/categories';
import {
  GraduationCap,
  Compass,
  BookOpen,
  ArrowRight,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Award,
  Search,
  MapPin,
  X
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [featuredOpps, setFeaturedOpps] = useState<Opportunity[]>([]);
  const [closingSoon, setClosingSoon] = useState<Opportunity[]>([]);
  const [newlyAdded, setNewlyAdded] = useState<Opportunity[]>([]);
  const [freeCourses, setFreeCourses] = useState<Resource[]>([]);
  const [featuredSkills, setFeaturedSkills] = useState<Skill[]>([]);
  const [publishedStories, setPublishedStories] = useState<SuccessStory[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Search input state in Hero
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState('All Regions');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Newsletter email state
  const [alertEmail, setAlertEmail] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertSuccessMessage, setAlertSuccessMessage] = useState('');
  const [alertErrorMessage, setAlertErrorMessage] = useState('');
  const [alertLoading, setAlertLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [featured, closing, recent, courses, count, stories] = await Promise.all([
          OpportunitiesService.getFeatured(6),
          OpportunitiesService.getClosingSoon(4),
          OpportunitiesService.getNewlyAdded(6),
          ResourcesService.getFreeCourses(3),
          OpportunitiesService.getPublishedOpportunityCount(),
          SuccessStoriesService.getPublishedStories(3)
        ]);
        setFeaturedOpps(featured);
        setClosingSoon(closing);
        setNewlyAdded(recent);
        setFreeCourses(courses);
        setFeaturedSkills(SkillsService.getAll({ demandLevel: 'Very High' }).slice(0, 3));
        setTotalCount(count);
        setPublishedStories(stories);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    const handleStoriesUpdate = () => {
      SuccessStoriesService.getPublishedStories(3)
        .then(setPublishedStories)
        .catch(() => {});
    };

    window.addEventListener('opportunities-changed', handleUpdate);
    window.addEventListener('success-stories-changed', handleStoriesUpdate);
    return () => {
      window.removeEventListener('opportunities-changed', handleUpdate);
      window.removeEventListener('success-stories-changed', handleStoriesUpdate);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (searchLocation && searchLocation !== 'All Regions' && searchLocation !== 'All Ghana') {
      params.set('region', searchLocation);
    }
    if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }
    onNavigate(`/opportunities?${params.toString()}`);
  };

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = alertEmail.trim();
    if (!cleanEmail) return;

    setAlertLoading(true);
    setAlertErrorMessage('');
    try {
      const res = await AlertSubscriptionsService.subscribe({
        email: cleanEmail,
        source: 'Homepage Daily Alerts',
        frequency: 'daily'
      });
      setAlertSuccess(true);
      setAlertSuccessMessage(res.message || '✓ Thank you! You will receive verified opportunity alerts directly.');
      setAlertEmail('');
      setTimeout(() => setAlertSuccess(false), 6000);
    } catch (err: any) {
      setAlertErrorMessage(err.message || 'Failed to register alert email. Please try again.');
    } finally {
      setAlertLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 sm:gap-20 [&>*]:w-full pb-4 md:pb-20 stage-ambient-surface">
      {/* ==================================================
          1. HOMEPAGE HERO WITH PHOTOGRAPHY & SEARCH BAR (ONE LARGE PREMIUM BANNER)
         ================================================== */}
      {/* ==================================================
          1. MODERN ANIMATED HERO SECTION (Inspired by GlobalWave Tech Reference)
         ================================================== */}
      <section className="hidden md:block relative overflow-hidden bg-gradient-to-b from-[#F6FBF8] via-[#F8FAF9] to-white dark:from-[#0B0F17] dark:via-[#0E1420] dark:to-[#121826] pt-12 sm:pt-16 lg:pt-20 pb-14 sm:pb-18 lg:pb-22 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        {/* Subtle decorative Ghanaian ambient gradient glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#006B3F] to-[#FCD116]" />
        <div className="absolute -top-24 left-1/4 w-[550px] h-[550px] bg-gradient-to-br from-[#006B3F]/10 via-emerald-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-gradient-to-bl from-teal-400/10 via-[#FCD116]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* HERO LEFT COLUMN: Prominent Headline & Actions */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-left">
              {/* Ghanaian Platform Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-emerald-200/80 dark:border-emerald-800/70 shadow-xs text-xs font-semibold text-[#006B3F] dark:text-emerald-300 backdrop-blur-md">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 dark:bg-emerald-400" />
                </span>
                <span className="font-sans">Empowering Ghanaian Talent</span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-sans">
                  {totalCount > 0 ? `${totalCount}+ Verified Listings` : '100+ Verified Listings'}
                </span>
              </div>

              {/* Large, Bold, Prominent Headline with Animated Colour-Changing Words */}
              <h1 className="hero-headline text-4xl sm:text-5xl md:text-6xl lg:text-[58px] xl:text-[66px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08] text-balance">
                <span className="block animated-gradient-text-1">Discover opportunities.</span>
                <span className="block animated-gradient-text-2 mt-1 sm:mt-2">Build your skills.</span>
                <span className="block animated-gradient-text-3 mt-1 sm:mt-2">Shape your future.</span>
              </h1>

              {/* Concise Hero Description */}
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed font-normal font-sans pt-1">
                Your gateway to scholarships, jobs, internships, free courses, admissions, grants, and opportunities to build a successful future.
              </p>

              {/* Hero Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5 sm:gap-4 font-sans">
                {/* Primary Button: Explore Opportunities */}
                <button
                  onClick={() => onNavigate('/opportunities')}
                  className="group px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-[#006B3F] hover:bg-[#005530] text-white text-sm sm:text-base font-bold transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer active:scale-98 flex items-center gap-2.5"
                >
                  <span>Explore Opportunities</span>
                  <ArrowRight className="w-4 h-4 text-[#FCD116] group-hover:translate-x-1.5 transition-transform" />
                </button>

                {/* Secondary Button: Discover Skills */}
                <button
                  onClick={() => onNavigate('/skills')}
                  className="px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white/90 dark:bg-slate-900/90 hover:bg-emerald-50/70 dark:hover:bg-slate-800/90 border-2 border-[#006B3F] dark:border-emerald-500 text-[#006B3F] dark:text-emerald-400 text-sm sm:text-base font-bold transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
                  <span>Discover Skills</span>
                </button>
              </div>

              {/* Micro Trust Indicators */}
              <div className="pt-6 sm:pt-8 flex flex-wrap items-center gap-5 sm:gap-7 text-xs sm:text-sm text-slate-600 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800/80 font-sans">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#006B3F] dark:text-emerald-400" />
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">100% Verified Sources</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FCD116] ring-4 ring-amber-100 dark:ring-amber-950/60 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">All 16 Regions of Ghana</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/80 flex items-center justify-center shrink-0">
                    <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Zero Application Fees Policy</span>
                </div>
              </div>
            </div>

            {/* HERO RIGHT COLUMN: Visual Composition with Floating Information Panels */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0">
              {/* Soft ambient gradient aura */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#006B3F]/20 via-teal-500/15 to-transparent rounded-3xl blur-2xl opacity-75 pointer-events-none" />

              {/* Main Visual Frame */}
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 group">
                <div className="aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={heroTrainingImage || "/images/ghana_internship_training_1793142343043.jpg"}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.triedPublic) {
                        target.dataset.triedPublic = 'true';
                        target.src = '/images/ghana_internship_training_1793142343043.jpg';
                      } else if (!target.dataset.triedAlias) {
                        target.dataset.triedAlias = 'true';
                        target.src = '/images/ghana_internship_training.jpg';
                      } else if (!target.dataset.triedFallback) {
                        target.dataset.triedFallback = 'true';
                        target.src = '/images/ghana_hero_professionals.jpg';
                      }
                    }}
                    alt="Young Ghanaian university students and professionals collaborating with laptops and learning digital skills"
                    className="w-full h-full object-cover object-center transform group-hover:scale-103 transition-transform duration-700 ease-out"
                    loading="eager"
                    decoding="async"
                  />
                  {/* Subtle editorial scrim overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/15 to-transparent pointer-events-none" />
                </div>

                {/* Floating Information Panel 1: Top Right - Verified Opportunities */}
                <div className="absolute -top-3 sm:-top-4 -right-2 sm:-right-4 bg-white/95 dark:bg-[#141B29]/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xl max-w-[210px] sm:max-w-[230px] animate-float-gentle transition-all hover:scale-102">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/60 dark:border-emerald-800/60 text-[#006B3F] dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans">Directory</p>
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-sans truncate">Verified Opportunities</p>
                      <p className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold font-sans">{totalCount > 0 ? `${totalCount}+ Active Listings` : '100+ Active Listings'}</p>
                    </div>
                  </div>
                </div>

                {/* Floating Information Panel 2: Bottom Left - Scholarships & Grants */}
                <div className="absolute -bottom-3 sm:-bottom-4 -left-2 sm:-left-4 bg-white/95 dark:bg-[#141B29]/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xl max-w-[210px] sm:max-w-[240px] animate-float-slow transition-all hover:scale-102">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200/60 dark:border-amber-800/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans">Funding</p>
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-sans truncate">Scholarships & Grants</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 font-medium font-sans">Full tuition & stipends</p>
                    </div>
                  </div>
                </div>

                {/* Floating Information Panel 3: Top Left - Career Development Pill Badge */}
                <div className="hidden sm:flex absolute top-5 -left-3 bg-white/95 dark:bg-[#141B29]/95 backdrop-blur-md rounded-xl py-1.5 px-3 border border-slate-200/80 dark:border-slate-700/80 shadow-lg items-center gap-2 animate-float-slow">
                  <div className="flex items-end gap-1 h-3.5">
                    <span className="w-1 h-2 rounded-xs bg-[#CE1126]" />
                    <span className="w-1 h-2.5 rounded-xs bg-[#FCD116]" />
                    <span className="w-1 h-3.5 rounded-xs bg-[#006B3F]" />
                    <span className="w-1 h-2.5 rounded-xs bg-blue-500" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 font-sans">Career Development</span>
                </div>

                {/* Floating Information Panel 4: Bottom Right - Free Learning Resources */}
                <div className="hidden sm:flex absolute bottom-4 right-3 bg-white/95 dark:bg-[#141B29]/95 backdrop-blur-md rounded-xl py-2 px-3.5 border border-slate-200/80 dark:border-slate-700/80 shadow-lg items-center gap-2.5 animate-float-gentle">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 dark:text-white font-sans">Free Learning Resources</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Certified tech & business</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              HERO SEARCH BAR (Modern Minimalist Card)
             ================================================== */}
          <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
            <div className="text-center mb-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">
                Search opportunities, scholarships, internships, and certified courses across Ghana
              </span>
            </div>
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white/95 dark:bg-[#141B29]/95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 shadow-xl border border-slate-200/90 dark:border-slate-800 flex flex-col md:flex-row items-center gap-2 transition-all font-sans"
            >
              {/* Keyword Search Field */}
              <div className="relative flex-1 w-full flex items-center pl-3">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Job title, scholarship name, field of study, skills..."
                  className="w-full pl-2.5 pr-8 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 bg-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none font-sans"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Location Selector */}
              <div className="w-full md:w-56 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2 md:pt-0 md:pl-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <select
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 py-2 focus:outline-none cursor-pointer font-sans"
                >
                  <option value="All Regions" className="dark:bg-slate-900 dark:text-slate-100">All Locations / Ghana</option>
                  <option value="Remote" className="dark:bg-slate-900 dark:text-slate-100">Remote / Online</option>
                  {GHANA_REGIONS.map((reg) => (
                    <option key={reg} value={reg} className="dark:bg-slate-900 dark:text-slate-100">
                      {reg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selector */}
              <div className="w-full md:w-52 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-2 md:pt-0 md:pl-3 flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 py-2 focus:outline-none cursor-pointer font-sans"
                >
                  <option value="All" className="dark:bg-slate-900 dark:text-slate-100">All Categories</option>
                  <option value="Scholarships" className="dark:bg-slate-900 dark:text-slate-100">Scholarships</option>
                  <option value="Jobs" className="dark:bg-slate-900 dark:text-slate-100">Jobs</option>
                  <option value="Internships" className="dark:bg-slate-900 dark:text-slate-100">Internships</option>
                  <option value="Fellowships" className="dark:bg-slate-900 dark:text-slate-100">Fellowships</option>
                  <option value="Grants" className="dark:bg-slate-900 dark:text-slate-100">Grants</option>
                  <option value="Training" className="dark:bg-slate-900 dark:text-slate-100">Training & Courses</option>
                </select>
              </div>

              {/* Primary Search Submit Button */}
              <button
                type="submit"
                className="w-full md:w-auto px-7 py-3.5 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs sm:text-sm font-bold transition-all shadow-md shrink-0 cursor-pointer flex items-center justify-center gap-2 active:scale-98 font-sans"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. OPPORTUNITY CATEGORY SECTION
         ================================================== */}
      <div className="hidden md:block">
        <OpportunityCategorySection onNavigate={onNavigate} />
      </div>

      {/* ==================================================
          4. "OPPORTUNITIES FOR YOUR NEXT STEP" (Mobile Slideshow + Desktop 3-Column Grid)
         ================================================== */}
      <TailoredJourneysCarousel onNavigate={onNavigate} />

      {/* ==================================================
          5. FEATURED OPPORTUNITIES GRID (3 columns desktop, 2 tablet, 1 mobile)
         ================================================== */}
      <section className="max-w-7xl mx-auto px-2.5 sm:px-3 md:px-6 lg:px-8 space-y-3 sm:space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006B3F] dark:bg-emerald-400" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight font-space">
                Featured Opportunities
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Handpicked, verified notices actively open for application.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/opportunities')}
            className="text-xs sm:text-sm font-bold text-[#006B3F] dark:text-emerald-400 hover:text-[#005530] dark:hover:text-emerald-300 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer group"
          >
            <span>View all opportunities</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 min-[431px]:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 md:gap-5">
            {[1, 2, 3].map((n) => (
              <OpportunitySkeleton key={n} />
            ))}
          </div>
        ) : featuredOpps.length > 0 ? (
          <div className="grid grid-cols-2 min-[431px]:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 md:gap-5">
            {featuredOpps.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onNavigate={onNavigate}
                featured={true}
              />
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-3">
            <Compass className="w-10 h-10 text-[#006B3F] dark:text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-space">
              No Opportunities Available Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Check back soon for new opportunities or set free alerts to be notified immediately.
            </p>
            <button
              onClick={() => onNavigate('/alerts')}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006B3F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Set Opportunity Alerts
            </button>
          </div>
        )}
      </section>

      {/* ==================================================
          6. CLOSING SOON (URGENT DEADLINES)
         ================================================== */}
      {closingSoon.length > 0 && (
        <section className="max-w-7xl mx-auto px-2.5 sm:px-3 md:px-6 lg:px-8 space-y-3 sm:space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#CE1126] dark:bg-rose-500 animate-ping" />
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white tracking-tight font-space">
                  Closing Soon
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Urgent application windows closing in the near future.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/opportunities')}
              className="text-xs sm:text-sm font-bold text-[#006B3F] dark:text-emerald-400 hover:underline flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>View all urgent deadlines</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 min-[431px]:grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 md:gap-5">
            {closingSoon.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>
      )}

      {/* ==================================================
          7. SUCCESS STORIES (Admin-Controlled: Visible ONLY if published stories exist)
         ================================================== */}
      {publishedStories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white font-space tracking-tight">
                  Success Stories
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Real people. Real opportunities. Real journeys.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/success-stories')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B3F] dark:text-emerald-400 hover:underline cursor-pointer self-start sm:self-auto"
            >
              <span>Explore All Stories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedStories.map((story) => (
              <div
                key={story.id}
                onClick={() => onNavigate(`/success-stories?story=${story.slug}`)}
                className="group bg-white dark:bg-[#141B29] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 hover:border-emerald-500/50 dark:hover:border-emerald-600/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-100 dark:border-emerald-800 text-[#006B3F] dark:text-emerald-400 flex items-center justify-center font-bold text-base overflow-hidden shrink-0 shadow-2xs">
                      {story.storytellerAvatar ? (
                        <img
                          src={story.storytellerAvatar}
                          alt={story.storytellerName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        story.storytellerName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 transition-colors truncate font-space">
                        {story.storytellerName}
                      </h3>
                      {story.storytellerRole && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {story.storytellerRole}
                        </p>
                      )}
                      {story.institutionOrCareer && (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium truncate flex items-center gap-1 mt-0.5">
                          <GraduationCap className="w-3 h-3 shrink-0" />
                          {story.institutionOrCareer}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0B0F17] border border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#006B3F] dark:text-emerald-400" />
                      Benefited From
                    </span>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 mt-0.5">
                      {story.benefitedOpportunityTitle}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-space line-clamp-2 leading-snug">
                      {story.title}
                    </h4>
                    {story.quote && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-3 leading-relaxed border-l-2 border-[#006B3F] dark:border-emerald-400 pl-2.5">
                        "{story.quote}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006B3F] dark:text-emerald-400 group-hover:underline">
                    Read Journey
                    <ArrowRight className="w-3 h-3" />
                  </span>
                  {story.publishedAt && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {new Date(story.publishedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================================================
          8. RESOURCES & LEARNING PATHS
         ================================================== */}
      {freeCourses.length > 0 && (
        <section className="max-w-7xl mx-auto px-2.5 sm:px-3 md:px-6 lg:px-8 space-y-3 sm:space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white font-space tracking-tight">
                  Featured Learning Resources
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Courses, bootcamps, and verified credentials to build high-demand skills in Ghana.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/resources')}
              className="text-xs sm:text-sm font-bold text-[#006B3F] dark:text-emerald-400 hover:underline flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>View all resources</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 min-[431px]:grid-cols-3 md:grid-cols-3 gap-2 sm:gap-2.5 md:gap-6">
            {freeCourses.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>
      )}

      {/* ==================================================
          8B. HIGH-DEMAND SKILLS & CAREER PATHWAYS
         ================================================== */}
      {featuredSkills.length > 0 && (
        <section className="max-w-7xl mx-auto px-2.5 sm:px-3 md:px-6 lg:px-8 space-y-3 sm:space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white font-space tracking-tight">
                  High-Demand Skills &amp; Career Tracks
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Verified competencies, project blueprints, and career pathways in Ghana.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/skills')}
              className="text-xs sm:text-sm font-bold text-[#006B3F] dark:text-emerald-400 hover:underline flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>Explore all {SkillsService.getAll().length} skills</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 min-[431px]:grid-cols-3 md:grid-cols-3 gap-2 sm:gap-2.5 md:gap-6">
            {featuredSkills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </section>
      )}

      {/* ==================================================
          9. CALL TO ACTION (Your next opportunity could be here) — Desktop & Tablet (>= 768px) only
         ================================================== */}
      <section className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#003822] via-[#006B3F] to-slate-950 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FCD116_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FCD116] font-space">
              Take the Next Step
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-space tracking-tight text-white">
              Your next opportunity could be here.
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl mx-auto">
              Stay ahead of verified deadlines for Ghanaian scholarships, internships, graduate recruitment, and grants.
            </p>

            {alertSuccess ? (
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-xs sm:text-sm font-bold text-[#FCD116] border border-[#FCD116]/30">
                {alertSuccessMessage || '✓ Thank you! You will receive verified opportunity alerts directly.'}
              </div>
            ) : (
              <div className="space-y-2 max-w-md mx-auto">
                <form onSubmit={handleAlertSubmit} className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    required
                    disabled={alertLoading}
                    placeholder="Enter your email for free alerts"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={alertLoading}
                    className="px-6 py-3 rounded-xl bg-[#FCD116] hover:bg-[#D9B400] disabled:opacity-60 text-[#111111] text-xs sm:text-sm font-bold transition-all shadow-md shrink-0 cursor-pointer"
                  >
                    {alertLoading ? 'Saving...' : 'Set Free Alerts'}
                  </button>
                </form>
                {alertErrorMessage && (
                  <p className="text-xs text-rose-300 font-semibold bg-rose-950/40 p-2 rounded-lg border border-rose-800/40">
                    {alertErrorMessage}
                  </p>
                )}
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-emerald-200/80">
              <button
                onClick={() => onNavigate('/opportunities')}
                className="underline hover:text-white font-semibold cursor-pointer"
              >
                Browse All Open Listings
              </button>
              <span>•</span>
              <button
                onClick={() => onNavigate('/alerts')}
                className="underline hover:text-white font-semibold cursor-pointer"
              >
                Customize Email Alert Preferences
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
