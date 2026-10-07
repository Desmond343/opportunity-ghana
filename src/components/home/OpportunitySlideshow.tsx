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
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/20 dark:border-white/10 shadow-sm animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] sm:min-h-[420px]">
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-5 bg-white/10 rounded-lg w-36" />
              <div className="h-8 bg-white/15 rounded-lg w-4/5" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
              <div className="h-16 bg-white/10 rounded-xl w-full" />
            </div>
            <div className="h-10 bg-emerald-600/40 rounded-xl w-44" />
          </div>
          <div className="lg:col-span-5 bg-white/5 min-h-[200px]" />
        </div>
      </div>
    );
  }

  // Professional Empty State when no opportunities are published
  if (totalSlides === 0) {
    return (
      <div className="relative w-full rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-white text-center space-y-4 bg-slate-900 border border-slate-200/20 dark:border-white/10 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-emerald-900/60 border border-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold transition-colors cursor-pointer"
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
      className="group/hero relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/50 dark:border-white/10 bg-slate-950 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006B3F] select-none"
    >
      {/* Top Ghanaian Gold & Emerald Accent Line */}
      <div className="relative z-30 h-1 w-full bg-gradient-to-r from-[#006B3F] via-[#FCD116] to-[#006B3F]" />

      {/* =====================================================================
          LAYER 1: FULL-BLEED SHARP SCHOLARSHIP / OPPORTUNITY BACKGROUND IMAGE
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
          className="w-full h-full object-cover object-[center_22%] contrast-[1.04] saturate-[1.05] brightness-[0.96] transition-transform duration-500 ease-out"
        />

        {/* Flat clean directional contrast gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(2, 14, 10, 0.92) 0%, rgba(2, 18, 14, 0.82) 40%, rgba(2, 12, 16, 0.45) 70%, rgba(2, 10, 16, 0.20) 100%)'
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(2, 8, 14, 0.30) 0%, transparent 25%, transparent 70%, rgba(2, 8, 14, 0.75) 100%)'
          }}
        />
      </div>

      {/* =====================================================================
          LAYER 2: FOREGROUND FLAT GLASS CONTENT + SHOWCASE
         ===================================================================== */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-[400px] sm:min-h-[430px] lg:min-h-[460px] p-4 sm:p-6 lg:p-7 gap-5 sm:gap-6 items-stretch"
      >
        {/* Left Column: Flat Frosted Glass Content Panel */}
        <div className="lg:col-span-7 bg-slate-950/80 dark:bg-slate-950/85 backdrop-blur-md rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-7 border border-white/10 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-3.5">
            {/* Header Kicker, Category Pill & Verification Status */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold uppercase tracking-wider text-[11px] px-3 py-1 rounded-lg bg-[#FCD116] text-[#0A0F0D] font-space">
                {activeOpp.category}
              </span>

              {activeOpp.opportunityType && (
                <span className="text-[11px] font-semibold text-emerald-100 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/30">
                  {activeOpp.opportunityType}
                </span>
              )}

              <VerificationBadge status={activeOpp.verificationStatus} />
            </div>

            {/* High-Contrast Scholarship / Opportunity Title (Flat typography, zero text extrusion/shadow) */}
            <h2
              onClick={() => onNavigate(`/opportunities/${activeOpp.slug}`)}
              className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-[1.18] font-space cursor-pointer hover:text-[#FCD116] transition-colors line-clamp-2"
            >
              {activeOpp.title}
            </h2>

            {/* Organization & Location Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                {activeOpp.organizationLogo ? (
                  <img
                    src={activeOpp.organizationLogo}
                    alt={activeOpp.organizationName || 'Organization'}
                    className="w-5 h-5 rounded-md object-contain bg-white/10 p-0.5"
                  />
                ) : (
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-[#FCD116] shrink-0">
                    <Building className="w-3 h-3" />
                  </span>
                )}
                <span className="font-semibold text-white">
                  {activeOpp.organizationName || 'Verified Scholarship Partner'}
                </span>
              </div>

              {activeOpp.location && (
                <div className="flex items-center gap-1 text-emerald-200/90 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#FCD116] shrink-0" />
                  <span>{activeOpp.location}</span>
                </div>
              )}
            </div>

            {/* Crisp Readable Description */}
            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed line-clamp-3 max-w-2xl font-normal">
              {activeOpp.description}
            </p>

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
              {activeOpp.educationLevel && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-white text-[11px] font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-[#FCD116] shrink-0" />
                  <span>{activeOpp.educationLevel}</span>
                </div>
              )}

              {activeOpp.fundingType && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/30 text-[#FCD116] text-[11px] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#FCD116] shrink-0" />
                  <span>{activeOpp.fundingType}</span>
                </div>
              )}

              <DeadlineBadge deadline={activeOpp.deadline} />
            </div>
          </div>

          {/* Primary Action & Controls Row */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate(`/opportunities/${activeOpp.slug}`)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
            >
              <span>
                {activeOpp.category === 'Scholarships'
                  ? 'Explore Scholarship'
                  : 'View Opportunity'}
              </span>
              <ArrowRight className="w-4 h-4 text-[#FCD116]" />
            </button>

            {activeOpp.applicationUrl && (
              <a
                href={activeOpp.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#FCD116]" />
              </a>
            )}

            <button
              onClick={(e) => handleToggleSave(e, activeOpp)}
              aria-label={isCurrentSaved ? 'Remove from saved' : 'Save opportunity'}
              title={isCurrentSaved ? 'Remove from saved' : 'Save opportunity'}
              className={`p-2.5 sm:p-3 rounded-xl border transition-colors cursor-pointer ${
                isCurrentSaved
                  ? 'bg-emerald-950 border-[#FCD116]/60 text-[#FCD116]'
                  : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isCurrentSaved ? 'fill-[#FCD116]' : ''}`} />
            </button>

            {/* Slide counter on mobile */}
            <span className="text-[11px] font-mono font-medium text-white/80 ml-auto lg:hidden bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
              {currentIndex + 1} / {totalSlides}
            </span>
          </div>
        </div>

        {/* Right Column: Clear Image Viewport + Flat Glass Coverage Badge */}
        <div
          onClick={() => onNavigate(`/opportunities/${activeOpp.slug}`)}
          className="lg:col-span-5 relative flex flex-col justify-between min-h-[200px] sm:min-h-[240px] lg:min-h-full cursor-pointer"
        >
          {/* Top-Right Flat Glass Stamp */}
          <div className="flex items-center justify-between lg:justify-end gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 text-xs font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-[#FCD116]" />
              <span>Featured {activeOpp.category === 'Scholarships' ? 'Scholarship' : 'Selection'}</span>
            </div>
          </div>

          {/* Bottom-Right Flat Glass Benefit Panel */}
          <div className="mt-auto bg-slate-950/80 dark:bg-slate-950/85 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-4.5 space-y-2 border border-white/10 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#006B3F] flex items-center justify-center text-[#FCD116] shrink-0">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#FCD116] font-space truncate">
                    Verified Benefits &amp; Coverage
                  </p>
                  <p className="text-xs font-semibold text-white truncate">
                    {activeOpp.fundingType || 'Comprehensive Support'}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-semibold text-emerald-200 shrink-0">
                <ShieldCheck className="w-3 h-3 text-[#FCD116]" />
                Ghanaians Eligible
              </span>
            </div>

            <p className="text-xs text-slate-200/90 font-normal line-clamp-2 leading-relaxed">
              {activeOpp.funding ||
                activeOpp.benefits?.[0] ||
                'Full tuition coverage, academic support, and leadership development for qualified Ghanaian applicants.'}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================================
          LAYER 3: FLAT CLEAN BOTTOM CAROUSEL NAVIGATION BAR
         ===================================================================== */}
      {totalSlides > 1 && (
        <div className="relative z-20 bg-slate-950/90 backdrop-blur-md border-t border-white/10 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4">
          {/* Slide Indicator Dots / Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {opportunities.map((opp, idx) => (
              <button
                key={opp.id}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}: ${opp.title}`}
                className={`transition-all duration-200 rounded-full cursor-pointer h-2 ${
                  idx === currentIndex
                    ? 'w-7 bg-[#FCD116]'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Active Slide Quick Label + Prev / Next Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline-block text-xs font-medium text-emerald-200/80 truncate max-w-[240px] mr-1">
              Next: {opportunities[(currentIndex + 1) % totalSlides]?.title}
            </span>

            <button
              onClick={prevSlide}
              aria-label="Previous opportunity slide"
              className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="hidden sm:inline font-mono font-medium text-xs text-white/90 px-1 tabular-nums">
              {String(currentIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
            </span>
            <button
              onClick={nextSlide}
              aria-label="Next opportunity slide"
              className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
