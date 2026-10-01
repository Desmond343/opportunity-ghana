import React, { useEffect, useState, useRef } from 'react';
import { Opportunity, Resource } from '../types/database';
import { OpportunitiesService } from '../services/opportunitiesService';
import { ResourcesService } from '../services/resourcesService';
import { OpportunitySlideshow } from '../components/home/OpportunitySlideshow';
import { OpportunityCard } from '../components/cards/OpportunityCard';
import { ResourceCard } from '../components/cards/ResourceCard';
import { OpportunitySkeleton } from '../components/common/CommonUI';
import { GHANA_REGIONS } from '../data/categories';
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
  ShieldCheck,
  Award,
  Zap,
  Search,
  MapPin,
  X,
  Target,
  Users,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [slideshowOpps, setSlideshowOpps] = useState<Opportunity[]>([]);
  const [featuredOpps, setFeaturedOpps] = useState<Opportunity[]>([]);
  const [closingSoon, setClosingSoon] = useState<Opportunity[]>([]);
  const [newlyAdded, setNewlyAdded] = useState<Opportunity[]>([]);
  const [freeCourses, setFreeCourses] = useState<Resource[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Search input state in Hero
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState('All Regions');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Newsletter email state
  const [alertEmail, setAlertEmail] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);

  // Horizontal scroll container ref for "What's available right now?"
  const availableScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [slides, featured, closing, recent, courses, all] = await Promise.all([
          OpportunitiesService.getSlideshowOpportunities(6),
          OpportunitiesService.getFeatured(6),
          OpportunitiesService.getClosingSoon(4),
          OpportunitiesService.getNewlyAdded(6),
          ResourcesService.getFreeCourses(3),
          OpportunitiesService.getAll({ onlyActive: true })
        ]);
        setSlideshowOpps(slides);
        setFeaturedOpps(featured);
        setClosingSoon(closing);
        setNewlyAdded(recent);
        setFreeCourses(courses);
        setTotalCount(all.length);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
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

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertEmail) {
      setAlertSuccess(true);
      setAlertEmail('');
      setTimeout(() => setAlertSuccess(false), 5000);
    }
  };

  const scrollAvailable = (direction: 'left' | 'right') => {
    if (availableScrollRef.current) {
      const scrollAmount = 320;
      availableScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Section 8: "What's Available Right Now?" (Jobberman-style "Who's hiring right now?" concept)
  const availableTracks = [
    {
      category: 'Scholarships',
      label: 'Scholarships & Grants',
      subtitle: 'Tuition waivers, living stipends, study abroad',
      tag: 'Academic Funding',
      tagColor: 'bg-[#E8F5EF] text-[#006B3F] border border-[#006B3F]/25',
      icon: GraduationCap,
      href: '/opportunities?category=Scholarships',
      backgroundImage: '/images/categories/scholarships.jpg',
      overlayClass: 'from-white/94 via-white/86 to-white/76 group-hover:from-white/90 group-hover:via-white/80 group-hover:to-white/70',
      accentGlow: 'from-[#006B3F]/12'
    },
    {
      category: 'Jobs',
      label: 'Graduate & Career Jobs',
      subtitle: 'Corporate recruitments, tech startups & public service',
      tag: 'Employment',
      tagColor: 'bg-blue-50 text-blue-800 border border-blue-200/60',
      icon: Briefcase,
      href: '/opportunities?category=Jobs',
      backgroundImage: '/images/categories/jobs.jpg',
      overlayClass: 'from-white/94 via-white/86 to-white/76 group-hover:from-white/90 group-hover:via-white/80 group-hover:to-white/70',
      accentGlow: 'from-blue-600/12'
    },
    {
      category: 'Internships',
      label: 'Internships & Attachments',
      subtitle: 'Student vacation attachments & NSS postings',
      tag: 'Entry Level',
      tagColor: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60',
      icon: Compass,
      href: '/opportunities?category=Internships',
      backgroundImage: '/images/categories/internships.jpg',
      overlayClass: 'from-white/94 via-white/86 to-white/76 group-hover:from-white/90 group-hover:via-white/80 group-hover:to-white/70',
      accentGlow: 'from-emerald-600/12'
    },
    {
      category: 'Fellowships',
      label: 'Fellowships & Leadership',
      subtitle: 'African leadership institutes & policy academies',
      tag: 'Leadership',
      tagColor: 'bg-amber-50 text-amber-900 border border-amber-200/60',
      icon: Award,
      href: '/opportunities?category=Fellowships',
      backgroundImage: '/images/categories/fellowships.jpg',
      overlayClass: 'from-white/94 via-white/86 to-white/76 group-hover:from-white/90 group-hover:via-white/80 group-hover:to-white/70',
      accentGlow: 'from-amber-600/12'
    },
    {
      category: 'Grants',
      label: 'Startup & Innovation Grants',
      subtitle: 'Seed funding, SME acceleration & incubation',
      tag: 'Capital',
      tagColor: 'bg-purple-50 text-purple-900 border border-purple-200/60',
      icon: Coins,
      href: '/opportunities?category=Grants',
      backgroundImage: '/images/categories/grants.jpg',
      overlayClass: 'from-white/94 via-white/86 to-white/76 group-hover:from-white/90 group-hover:via-white/80 group-hover:to-white/70',
      accentGlow: 'from-purple-600/12'
    },
    {
      category: 'Training',
      label: 'Free Certified Courses',
      subtitle: 'Tech, data analytics, business certifications',
      tag: 'Upskilling',
      tagColor: 'bg-[#FFF8D6] text-amber-900 border border-amber-300/60',
      icon: Sparkles,
      href: '/resources?free=true',
      backgroundImage: '/images/categories/courses.jpg',
      overlayClass: 'from-white/94 via-white/86 to-white/76 group-hover:from-white/90 group-hover:via-white/80 group-hover:to-white/70',
      accentGlow: 'from-[#FCD116]/18'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-20 pb-20 bg-white">
      {/* ==================================================
          1. HOMEPAGE HERO WITH PHOTOGRAPHY & SEARCH BAR (ONE LARGE PREMIUM BANNER)
         ================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F2F7F4] via-[#F8FAF9] to-white pt-10 sm:pt-14 lg:pt-16 pb-12 sm:pb-16 lg:pb-20 border-b border-slate-200/80">
        {/* Subtle decorative Ghanaian ambient glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#006B3F] to-[#FCD116]" />
        <div className="absolute top-12 left-1/4 w-96 h-96 bg-[#006B3F]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 right-10 w-96 h-96 bg-[#FCD116]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* HERO LEFT: Brand Messaging & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Ghanaian Platform Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[#006B3F]/25 shadow-xs text-xs font-bold text-[#006B3F] backdrop-blur-md">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#006B3F] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#006B3F]" />
                </span>
                <span className="tracking-wide">The Modern Ghanaian Opportunity Portal</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FCD116]" />
              </div>

              {/* Large Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#111111] tracking-tight leading-[1.08] font-space">
                Discover Opportunities.
                <span className="text-[#006B3F] block mt-1.5 sm:mt-2">Build Your Future.</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-normal">
                Find <span className="font-semibold text-slate-900">scholarships</span>, <span className="font-semibold text-slate-900">jobs</span>, <span className="font-semibold text-slate-900">internships</span>, <span className="font-semibold text-slate-900">fellowships</span>, <span className="font-semibold text-slate-900">grants</span>, training programs and more — all in one verified place.
              </p>

              {/* Hero Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  onClick={() => onNavigate('/opportunities')}
                  className="group px-7 py-4 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs sm:text-sm font-bold transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer active:scale-98 flex items-center gap-2.5"
                >
                  <span>Explore Opportunities</span>
                  <ArrowRight className="w-4 h-4 text-[#FCD116] group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => onNavigate('/resources')}
                  className="px-6 py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 text-xs sm:text-sm font-bold transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                >
                  Browse Resources
                </button>
              </div>

              {/* Micro Trust Indicators */}
              <div className="pt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-600 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#E8F5EF] flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#006B3F]" />
                  </div>
                  <span className="font-bold text-slate-800">100% Verified Sources</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FCD116] ring-4 ring-[#FFF8D6]" />
                  <span className="font-bold text-slate-800">All 16 Regions of Ghana</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006B3F] ring-4 ring-[#E8F5EF]" />
                  <span className="font-bold text-slate-800">Zero Application Fees Policy</span>
                </div>
              </div>
            </div>

            {/* HERO RIGHT: Large Ghanaian Lifestyle Photograph */}
            <div className="lg:col-span-5 relative">
              {/* Subtle ambient decorative glow behind image */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#006B3F]/20 via-[#FCD116]/15 to-transparent rounded-3xl blur-xl opacity-75 pointer-events-none" />

              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 bg-slate-100 aspect-4/3 sm:aspect-16/11 lg:aspect-4/3 min-h-[320px] sm:min-h-[380px] lg:min-h-[420px]">
                <img
                  src="/images/ghana_hero_professionals.jpg"
                  alt="Young Ghanaian professionals and university students collaborating"
                  className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700"
                  loading="eager"
                />

                {/* Subtle protective gradient over image bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Floating Information Card on Image */}
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#E8F5EF] border border-[#006B3F]/20 text-[#006B3F] flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#006B3F] animate-pulse" />
                        <p className="text-xs font-bold text-slate-900 font-space truncate">
                          Verified Opportunities Active
                        </p>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">
                        {totalCount > 0 ? `${totalCount} Nationwide Listings` : 'Nationwide Listings'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('/opportunities')}
                    className="p-2.5 rounded-xl bg-[#006B3F] text-white hover:bg-[#005530] transition-colors cursor-pointer shrink-0 shadow-xs"
                    title="Explore Opportunities"
                  >
                    <ArrowRight className="w-4 h-4 text-[#FCD116]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              HERO SEARCH BAR (Jobberman-Style Horizontal Bar)
             ================================================== */}
          <div className="mt-10 sm:mt-14 max-w-5xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white rounded-2xl p-2.5 sm:p-3 shadow-xl border border-slate-200/90 flex flex-col md:flex-row items-center gap-2"
            >
              {/* Keyword Search Field */}
              <div className="relative flex-1 w-full flex items-center pl-3">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Job title, scholarship name, field of study..."
                  className="w-full pl-2.5 pr-8 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Location Selector */}
              <div className="w-full md:w-56 border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-700 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="All Regions">All Locations / Ghana</option>
                  <option value="Remote">Remote / Online</option>
                  {GHANA_REGIONS.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selector */}
              <div className="w-full md:w-52 border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-3 flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-700 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Scholarships">Scholarships</option>
                  <option value="Jobs">Jobs</option>
                  <option value="Internships">Internships</option>
                  <option value="Fellowships">Fellowships</option>
                  <option value="Grants">Grants</option>
                  <option value="Training">Training & Courses</option>
                </select>
              </div>

              {/* Primary Search Submit Button */}
              <button
                type="submit"
                className="w-full md:w-auto px-7 py-3.5 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs sm:text-sm font-bold transition-all shadow-md shrink-0 cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. FEATURED OPPORTUNITIES SLIDESHOW SECTION
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006B3F]" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#111111] font-space tracking-tight">
              Featured Opportunities Carousel
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/opportunities')}
            className="text-xs font-bold text-[#006B3F] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View all listings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <OpportunitySlideshow
          opportunities={slideshowOpps}
          onNavigate={onNavigate}
          loading={loading}
        />
      </section>

      {/* ==================================================
          3. "WHAT'S AVAILABLE RIGHT NOW?" SECTION (Jobberman-inspired horizontal cards)
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#006B3F] font-space">
              Live Category Tracks
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] font-space tracking-tight mt-0.5">
              What&apos;s Available Right Now?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Browse major opportunity pathways curated for Ghanaian youth, students, and professionals.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end">
            <button
              onClick={() => scrollAvailable('left')}
              aria-label="Scroll left"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollAvailable('right')}
              aria-label="Scroll right"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Row */}
        <div
          ref={availableScrollRef}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none"
        >
          {availableTracks.map((track) => {
            const Icon = track.icon;
            return (
              <div
                key={track.category}
                onClick={() => onNavigate(track.href)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate(track.href);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Explore ${track.label}`}
                className="group relative overflow-hidden w-72 sm:w-80 shrink-0 snap-start rounded-2xl p-5 border border-slate-200/90 hover:border-[#006B3F] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B3F] focus-visible:ring-offset-2"
              >
                {/* Visual Image Background with Zoom on Hover & High-Legibility Overlays */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
                  <img
                    src={track.backgroundImage}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover object-center transform group-hover:scale-108 transition-transform duration-500 ease-out"
                  />
                  {/* Subtle backdrop-blur for glassmorphism readability */}
                  <div className="absolute inset-0 backdrop-blur-[1.5px]" />
                  {/* Adaptive multi-stop gradient for clear text contrast */}
                  <div className={`absolute inset-0 bg-gradient-to-b ${track.overlayClass} transition-all duration-300`} />
                  {/* Subtle theme ambient radial glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${track.accentGlow} to-transparent pointer-events-none`} />
                </div>

                {/* Foreground Card Content */}
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/95 border border-slate-200/90 text-[#006B3F] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs backdrop-blur-md">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-2xs backdrop-blur-md ${track.tagColor}`}>
                      {track.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#006B3F] transition-colors font-space tracking-tight">
                      {track.label}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-1 line-clamp-2 leading-relaxed">
                      {track.subtitle}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 pt-4 mt-4 border-t border-slate-300/60 flex items-center justify-between text-xs font-bold text-[#006B3F]">
                  <span>Explore opportunities</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================
          4. "OPPORTUNITIES FOR YOUR NEXT STEP" (Targeted visual tracks)
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#006B3F] font-space">
            Tailored Journeys
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] font-space tracking-tight">
            Opportunities for Your Next Step
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Whether you are completing SHS, graduating university, or seeking funding for a Ghanaian enterprise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Track 1: Students & Undergraduates */}
          <div
            onClick={() => onNavigate('/opportunities?category=Scholarships')}
            className="group relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-end min-h-[300px]"
          >
            <img
              src="/images/ghana_student_workspace.jpg"
              alt="Young Ghanaian student studying in modern university commons"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="relative p-6 space-y-2 text-white">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FCD116] text-[#111111]">
                Students & Graduates
              </span>
              <h3 className="text-lg font-bold font-space text-white group-hover:text-[#FCD116] transition-colors">
                Scholarships & University Fellowships
              </h3>
              <p className="text-xs text-slate-200/90 leading-relaxed">
                Full tuition waivers, Mastercard Foundation awards, and international graduate programs for Ghanaian students.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-[#FCD116]">
                <span>Discover Scholarships</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Track 2: Early Career Professionals */}
          <div
            onClick={() => onNavigate('/opportunities?category=Jobs')}
            className="group relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-end min-h-[300px]"
          >
            <img
              src="/images/ghana_hero_professionals.jpg"
              alt="Young Ghanaian professionals in modern workplace"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="relative p-6 space-y-2 text-white">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500 text-white">
                Early Career & NSS
              </span>
              <h3 className="text-lg font-bold font-space text-white group-hover:text-emerald-300 transition-colors">
                Jobs, Internships & Graduate Schemes
              </h3>
              <p className="text-xs text-slate-200/90 leading-relaxed">
                Verified entry-level vacancies, management trainee programs, and paid corporate attachments across Ghana.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <span>View Open Vacancies</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Track 3: Practical Skills & Upskilling */}
          <div
            onClick={() => onNavigate('/resources?free=true')}
            className="group relative rounded-3xl overflow-hidden border border-slate-200 bg-gradient-to-br from-[#005530] via-[#006B3F] to-slate-950 p-6 flex flex-col justify-between min-h-[300px] text-white shadow-sm hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FCD116] text-[#111111]">
                100% Free Learning
              </span>
              <h3 className="text-xl font-bold font-space text-white group-hover:text-[#FCD116] transition-colors">
                Free Accredited Courses with Certificates
              </h3>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Upskill in software engineering, data analytics, digital marketing, and financial management with verified partners.
              </p>
            </div>

            <div className="pt-4 border-t border-white/15 space-y-3">
              <div className="space-y-1.5 text-xs text-emerald-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FCD116]" />
                  <span>Verified credentials from accredited providers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FCD116]" />
                  <span>Self-paced and cohort-based options</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FCD116]">
                <span>Browse Free Courses</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. FEATURED OPPORTUNITIES GRID (3 columns desktop, 2 tablet, 1 mobile)
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006B3F]" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight font-space">
                Featured Opportunities
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Handpicked, verified notices actively open for application.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/opportunities')}
            className="text-xs sm:text-sm font-bold text-[#006B3F] hover:text-[#005530] flex items-center gap-1.5 self-start sm:self-auto cursor-pointer group"
          >
            <span>View all opportunities</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <OpportunitySkeleton key={n} />
            ))}
          </div>
        ) : featuredOpps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 text-center space-y-3">
            <Compass className="w-10 h-10 text-[#006B3F] mx-auto" />
            <h3 className="text-base font-bold text-slate-900 font-space">
              No Opportunities Available Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#CE1126] animate-ping" />
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight font-space">
                  Closing Soon
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Urgent application windows closing in the near future.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/opportunities')}
              className="text-xs sm:text-sm font-bold text-[#006B3F] hover:underline flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>View all urgent deadlines</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
          7. SUCCESS STORIES (Verified Stories Only / Professional Empty State)
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#006B3F]" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] font-space tracking-tight">
              Success Stories
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real people. Real opportunities. Real journeys.
          </p>
        </div>

        {/* Note: Section 10 strictly requires: "If there are no verified stories, DO NOT create fake people. Instead show a beautiful empty state" */}
        <div className="bg-[#F7F8FA] border border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center space-y-4 max-w-3xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-[#006B3F] flex items-center justify-center mx-auto shadow-2xs">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-space">
              Success Stories are Coming Soon
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-lg mx-auto">
              We exclusively publish authenticated, verified alumnus journeys. Benefited from an opportunity discovered through Opportunity Ghana?
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/alerts')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              Share Your Journey
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================
          8. RESOURCES & LEARNING PATHS
         ================================================== */}
      {freeCourses.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#006B3F]" />
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] font-space tracking-tight">
                  Featured Learning Resources
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Courses, bootcamps, and verified credentials to build high-demand skills in Ghana.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/resources')}
              className="text-xs sm:text-sm font-bold text-[#006B3F] hover:underline flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>View all resources</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          9. CALL TO ACTION (Your next opportunity could be here)
         ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-xs sm:text-sm font-bold text-[#FCD116]">
                ✓ Thank you! You will receive verified opportunity alerts directly.
              </div>
            ) : (
              <form onSubmit={handleAlertSubmit} className="pt-2 flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="Enter your email for free alerts"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#FCD116] hover:bg-[#D9B400] text-[#111111] text-xs sm:text-sm font-bold transition-all shadow-md shrink-0 cursor-pointer"
                >
                  Set Free Alerts
                </button>
              </form>
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
                Configure WhatsApp Alerts
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
