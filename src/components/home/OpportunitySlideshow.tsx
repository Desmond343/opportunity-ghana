import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Opportunity } from '../../types/database';
import { DeadlineBadge } from '../common/DeadlineBadge';
import { VerificationBadge } from '../common/VerificationBadge';
import { SavedService } from '../../services/savedService';
import { useAuth } from '../../services/authContext';
import { resolveOpportunityMedia } from '../../utils/cardBackgrounds';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Building,
  MapPin,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Compass,
  ShieldCheck,
  Award,
  ExternalLink
} from 'lucide-react';

interface OpportunitySlideshowProps {
  opportunities: Opportunity[];
  onNavigate: (path: string) => void;
  loading?: boolean;
}

/**
 * Curated local high-resolution African/Ghanaian university & scholarship fallback photographs
 * Ensures the hero background is 100% sharp, human-centered, and visible even if an external URL fails.
 */
const HERO_FALLBACK_IMAGES = [
  '/images/institutions/ug_students_seminar.jpg',
  '/images/ghana_student_workspace.jpg',
  '/images/institutions/ashesi_lecture_students.jpg',
  '/images/institutions/ghana_graduates_celebrate.jpg',
  '/images/ghana_hero_professionals.jpg',
  '/images/institutions/ucc_tertiary_conference.jpg'
];

export const OpportunitySlideshow: React.FC<OpportunitySlideshowProps> = ({
  opportunities,
  onNavigate,
  loading = false
}) => {
  const { currentUser, getIdToken } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync saved states
  useEffect(() => {
    const map: Record<string, boolean> = {};
    opportunities.forEach(o => {
      map[o.id] = SavedService.isSaved(o.id);
    });
    setSavedMap(map);

    const handleUpdate = (e: any) => {
      if (!e.detail || e.detail.id || e.detail.userId !== undefined) {
        const updatedMap: Record<string, boolean> = {};
        opportunities.forEach(o => {
          updatedMap[o.id] = SavedService.isSaved(o.id);
        });
        setSavedMap(updatedMap);
      }
    };
    window.addEventListener('saved-opportunities-changed', handleUpdate);
    return () => window.removeEventListener('saved-opportunities-changed', handleUpdate);
  }, [opportunities]);

  const totalSlides = opportunities.length;

  const nextSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex(prev => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Autoplay timer (6s) with pause on hover/focus & reduced motion check
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => clearInterval(timer);
  }, [totalSlides, isPaused, nextSlide]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  // Touch / Swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45;

    if (diff > minSwipeDistance) {
      nextSlide();
    } else if (diff < -minSwipeDistance) {
      prevSlide();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleToggleSave = async (e: React.MouseEvent, opp: Opportunity) => {
    e.stopPropagation();
    try {
      const updated = await SavedService.toggleSave(
        {
          id: opp.id,
          slug: opp.slug,
          title: opp.title,
          category: opp.category,
          type: opp.opportunityType,
          organizationName: opp.organizationName,
          deadline: opp.deadline
        },
        currentUser?.id,
        getIdToken
      );
      setSavedMap(prev => ({ ...prev, [opp.id]: updated }));
    } catch (err: any) {
      console.warn('Slideshow save error:', err?.message || err);
    }
  };

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="floating-glass-hero-3d w-full rounded-3xl overflow-hidden animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px] sm:min-h-[460px]">
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-5 bg-white/10 rounded-lg w-36" />
              <div className="h-9 bg-white/15 rounded-xl w-4/5" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
              <div className="h-20 bg-white/10 rounded-2xl w-full" />
            </div>
            <div className="h-11 bg-emerald-700/40 rounded-xl w-48" />
          </div>
          <div className="lg:col-span-5 bg-white/5 min-h-[240px]" />
        </div>
      </div>
    );
  }

  // Professional Empty State when no opportunities are published
  if (totalSlides === 0) {
    return (
      <div className="floating-glass-hero-3d w-full rounded-3xl p-8 sm:p-12 text-white text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 flex items-center justify-center mx-auto shadow-inner">
          <Compass className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-lg mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold font-space text-white">
            Curating Verified Opportunities
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            Fresh scholarships, jobs, internships, and grants are actively reviewed against official Ghanaian and international sources.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('/opportunities')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <span>Browse All Listings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const activeOpp = opportunities[currentIndex] || opportunities[0];
  const isCurrentSaved = Boolean(savedMap[activeOpp.id]);
  const media = resolveOpportunityMedia(activeOpp);
  const fallbackImage = HERO_FALLBACK_IMAGES[currentIndex % HERO_FALLBACK_IMAGES.length];
  const heroImageUrl =
    !failedImages[activeOpp.id] && media.imageUrl
      ? media.imageUrl
      : fallbackImage;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Opportunities Slideshow"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="floating-glass-hero-3d specular-rim-highlight group/hero relative w-full rounded-3xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B3F] select-none"
    >
      {/* Top Ghanaian Gold & Emerald Specular Accent Bar */}
      <div className="relative z-30 h-1.5 w-full bg-gradient-to-r from-[#006B3F] via-[#FCD116] to-[#006B3F]" />

      {/* =====================================================================
          LAYER 1: FULL-BLEED SHARP SCHOLARSHIP / OPPORTUNITY BACKGROUND IMAGE
          Zero blur on the background image itself; high clarity & recognition
         ===================================================================== */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          key={activeOpp.id}
          src={heroImageUrl}
          alt={media.imageAlt || activeOpp.title}
          loading="eager"
          onError={() => {
            setFailedImages(prev => ({ ...prev, [activeOpp.id]: true }));
          }}
          className="w-full h-full object-cover object-[center_22%] transform group-hover/hero:scale-[1.03] transition-transform duration-700 ease-out contrast-[1.06] saturate-[1.08] brightness-[0.98]"
        />

        {/* ===================================================================
            LAYER 2: CONTROLLED DIRECTIONAL DARK / EMERALD CONTRAST GRADIENT
            Deep contrast on the left behind the glass content panel, opening
            up to crystal-clear, unobstructed imagery on the right and edges.
           =================================================================== */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(102deg, rgba(2, 16, 11, 0.90) 0%, rgba(3, 24, 16, 0.78) 38%, rgba(2, 14, 18, 0.42) 64%, rgba(2, 10, 18, 0.14) 100%)'
          }}
        />
        {/* Subtle top & bottom framing vignette for badge and control bar contrast */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(2, 8, 16, 0.38) 0%, rgba(2, 8, 16, 0) 24%, rgba(2, 8, 16, 0) 72%, rgba(2, 10, 16, 0.82) 100%)'
          }}
        />
      </div>

      {/* =====================================================================
          LAYER 3 & 4: FOREGROUND GLASS CONTENT LAYER + VISUAL SHOWCASE
         ===================================================================== */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[430px] sm:min-h-[460px] lg:min-h-[490px] p-4 sm:p-6 lg:p-8 gap-6 items-stretch"
      >
        {/* Left Column: Floating 3D Frosted Glass Content Tablet */}
        <div className="lg:col-span-7 glass-hero-content-panel specular-rim-highlight rounded-2xl sm:rounded-[22px] p-5 sm:p-7 lg:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Header Kicker, Category Pill & Verification Status */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="font-extrabold uppercase tracking-wider text-[11px] px-3.5 py-1 rounded-xl bg-[#FCD116] text-[#0A0F0D] font-space shadow-[0_4px_12px_rgba(252,209,22,0.3)]">
                {activeOpp.category}
              </span>

              {activeOpp.opportunityType && (
                <span className="text-[11px] font-bold text-emerald-100 px-3 py-1 rounded-xl bg-emerald-950/85 border border-emerald-400/40 shadow-sm">
                  {activeOpp.opportunityType}
                </span>
              )}

              <VerificationBadge status={activeOpp.verificationStatus} />
            </div>

            {/* High-Contrast Scholarship / Opportunity Title */}
            <h2
              onClick={() => onNavigate(`/opportunities/${activeOpp.slug}`)}
              className="text-2xl sm:text-3xl lg:text-[34px] font-black text-white tracking-tight leading-[1.13] font-space cursor-pointer hover:text-[#FCD116] transition-colors line-clamp-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]"
            >
              {activeOpp.title}
            </h2>

            {/* Organization & Location Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              <div className="flex items-center gap-2">
                {activeOpp.organizationLogo ? (
                  <img
                    src={activeOpp.organizationLogo}
                    alt={activeOpp.organizationName || 'Organization'}
                    className="w-5 h-5 rounded-md object-contain bg-white/15 p-0.5"
                  />
                ) : (
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/35 flex items-center justify-center text-[#FCD116] shrink-0">
                    <Building className="w-3.5 h-3.5" />
                  </span>
                )}
                <span className="font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                  {activeOpp.organizationName || 'Verified Scholarship Partner'}
                </span>
              </div>

              {activeOpp.location && (
                <div className="flex items-center gap-1.5 text-emerald-100 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#FCD116] shrink-0" />
                  <span>{activeOpp.location}</span>
                </div>
              )}
            </div>

            {/* Crisp Readable Description */}
            <p className="text-xs sm:text-sm text-slate-100/95 leading-relaxed line-clamp-3 max-w-2xl font-normal drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              {activeOpp.description}
            </p>

            {/* High-Contrast Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {activeOpp.educationLevel && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/85 border border-white/20 text-white text-[11px] font-semibold shadow-sm">
                  <GraduationCap className="w-3.5 h-3.5 text-[#FCD116] shrink-0" />
                  <span>{activeOpp.educationLevel}</span>
                </div>
              )}

              {activeOpp.fundingType && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-400/45 text-[#FCD116] text-[11px] font-bold shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#FCD116] shrink-0" />
                  <span>{activeOpp.fundingType}</span>
                </div>
              )}

              <DeadlineBadge deadline={activeOpp.deadline} />
            </div>
          </div>

          {/* Primary Action & Interactive Controls Row */}
          <div className="pt-3 border-t border-white/15 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate(`/opportunities/${activeOpp.slug}`)}
              className="group/btn inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#006B3F] to-[#008751] hover:from-[#007A48] hover:to-[#009B5D] text-white text-xs sm:text-sm font-extrabold transition-all duration-200 border border-emerald-400/40 shadow-[0_8px_24px_-4px_rgba(0,107,63,0.65),inset_0_1px_1px_rgba(255,255,255,0.35)] hover:-translate-y-0.5 cursor-pointer active:scale-98"
            >
              <span>
                {activeOpp.category === 'Scholarships'
                  ? 'Explore Scholarship'
                  : 'View Opportunity'}
              </span>
              <ArrowRight className="w-4 h-4 text-[#FCD116] group-hover/btn:translate-x-1 transition-transform" />
            </button>

            {activeOpp.applicationUrl && (
              <a
                href={activeOpp.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl bg-white/12 hover:bg-white/20 border border-white/25 hover:border-white/40 text-white text-xs font-bold transition-all backdrop-blur-md shadow-md cursor-pointer"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#FCD116]" />
              </a>
            )}

            <button
              onClick={(e) => handleToggleSave(e, activeOpp)}
              aria-label={isCurrentSaved ? 'Remove from saved' : 'Save opportunity'}
              title={isCurrentSaved ? 'Remove from saved' : 'Save opportunity'}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer backdrop-blur-md shadow-md ${
                isCurrentSaved
                  ? 'bg-emerald-900/90 border-[#FCD116]/70 text-[#FCD116]'
                  : 'bg-slate-900/75 hover:bg-slate-900/95 border-white/25 hover:border-white/45 text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isCurrentSaved ? 'fill-[#FCD116]' : ''}`} />
            </button>

            {/* Quick slide counter text on mobile */}
            <span className="text-[11px] font-mono font-bold text-white/90 ml-auto lg:hidden bg-slate-950/70 px-2.5 py-1 rounded-lg border border-white/15">
              {currentIndex + 1} / {totalSlides}
            </span>
          </div>
        </div>

        {/* Right Column: Clear Unobstructed Image Viewport + Floating Glass Highlights */}
        <div
          onClick={() => onNavigate(`/opportunities/${activeOpp.slug}`)}
          className="lg:col-span-5 relative flex flex-col justify-between min-h-[220px] sm:min-h-[260px] lg:min-h-full cursor-pointer group/media"
        >
          {/* Top-Right Floating Glass Featured Stamp */}
          <div className="flex items-center justify-between lg:justify-end gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-hero-badge-card text-[11px] font-extrabold text-white tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#FCD116] animate-pulse" />
              <span>Featured {activeOpp.category === 'Scholarships' ? 'Scholarship' : 'Selection'}</span>
            </div>
          </div>

          {/* Bottom-Right Floating Glass Coverage / Eligibility Highlight Card */}
          <div className="mt-auto glass-hero-badge-card rounded-2xl p-4 sm:p-5 space-y-2.5 transform group-hover/media:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#006B3F] border border-emerald-400/40 flex items-center justify-center text-[#FCD116] shadow-sm shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#FCD116] font-space">
                    Verified Benefits &amp; Coverage
                  </p>
                  <p className="text-xs font-bold text-white truncate max-w-[240px]">
                    {activeOpp.fundingType || 'Comprehensive Support'}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/35 text-[10px] font-bold text-emerald-200 shrink-0">
                <ShieldCheck className="w-3 h-3 text-[#FCD116]" />
                Ghanaians Eligible
              </span>
            </div>

            <p className="text-xs text-slate-100/95 font-medium line-clamp-2 leading-snug">
              {activeOpp.funding ||
                activeOpp.benefits?.[0] ||
                'Full tuition coverage, academic support, and leadership development for qualified Ghanaian applicants.'}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================================
          LAYER 5: FROSTED GLASS BOTTOM CAROUSEL NAVIGATION BAR
         ===================================================================== */}
      {totalSlides > 1 && (
        <div className="relative z-20 bg-slate-950/80 backdrop-blur-xl border-t border-white/15 px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Slide Indicator Dots / Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {opportunities.map((opp, idx) => (
              <button
                key={opp.id}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}: ${opp.title}`}
                className={`transition-all duration-300 rounded-full cursor-pointer h-2.5 ${
                  idx === currentIndex
                    ? 'w-9 bg-[#FCD116] shadow-[0_0_12px_rgba(252,209,22,0.6)]'
                    : 'w-2.5 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Active Slide Quick Label + Prev / Next Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="hidden md:inline-block text-xs font-semibold text-emerald-200/90 truncate max-w-[260px] mr-1">
              Next: {opportunities[(currentIndex + 1) % totalSlides]?.title}
            </span>

            <button
              onClick={prevSlide}
              aria-label="Previous opportunity slide"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="hidden sm:inline font-mono font-bold text-xs text-white px-1.5 tabular-nums">
              {String(currentIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
            </span>
            <button
              onClick={nextSlide}
              aria-label="Next opportunity slide"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
