import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Opportunity } from '../../types/database';
import { DeadlineBadge } from '../common/DeadlineBadge';
import { VerificationBadge } from '../common/VerificationBadge';
import { SavedService } from '../../services/savedService';
import { resolveOpportunityMedia } from '../../utils/cardBackgrounds';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Building,
  MapPin,
  Calendar,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface OpportunitySlideshowProps {
  opportunities: Opportunity[];
  onNavigate: (path: string) => void;
  loading?: boolean;
}

export const OpportunitySlideshow: React.FC<OpportunitySlideshowProps> = ({
  opportunities,
  onNavigate,
  loading = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});
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
      if (e.detail?.id) {
        setSavedMap(prev => ({ ...prev, [e.detail.id]: e.detail.isSaved }));
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

  // Autoplay timer (5.5s) with pause on hover/focus & reduced motion check
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    // Respect user's motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5500);

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
      // Swiped left -> next
      nextSlide();
    } else if (diff < -minSwipeDistance) {
      // Swiped right -> prev
      prevSlide();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleToggleSave = (e: React.MouseEvent, opp: Opportunity) => {
    e.stopPropagation();
    const updated = SavedService.toggleSave({
      id: opp.id,
      slug: opp.slug,
      title: opp.title,
      category: opp.category,
      type: opp.opportunityType,
      organizationName: opp.organizationName,
      deadline: opp.deadline
    });
    setSavedMap(prev => ({ ...prev, [opp.id]: updated }));
  };

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="w-full bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] sm:min-h-[440px]">
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="h-4 bg-slate-800 rounded-md w-32" />
              <div className="h-8 bg-slate-800 rounded-xl w-3/4" />
              <div className="h-4 bg-slate-800/80 rounded w-1/2" />
              <div className="h-16 bg-slate-800/50 rounded-xl w-full" />
            </div>
            <div className="h-10 bg-slate-800 rounded-xl w-48" />
          </div>
          <div className="lg:col-span-5 bg-slate-800/60 min-h-[220px]" />
        </div>
      </div>
    );
  }

  // Professional Empty State when no opportunities are published
  if (totalSlides === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-emerald-900/40 shadow-xl text-center space-y-4">
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

  const activeOpp = opportunities[currentIndex];
  const isCurrentSaved = Boolean(savedMap[activeOpp.id]);

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
      className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl focus:outline-none focus:ring-2 focus:ring-[#006B3F] select-none"
    >
      {/* Decorative Gold Ghanaian Accent Bar at Top */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#006B3F] via-[#FCD116] to-[#006B3F]" />

      {/* Main Slide Presentation */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative grid grid-cols-1 lg:grid-cols-12 min-h-[420px] sm:min-h-[460px] lg:min-h-[480px]"
      >
        {/* Left Column: Rich Opportunity Details */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between z-10 space-y-6">
          <div className="space-y-4">
            {/* Header kicker & Verification row */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="font-extrabold uppercase tracking-wider text-[11px] px-2.5 py-1 rounded-lg bg-[#FCD116] text-[#111111] font-space shadow-xs">
                {activeOpp.category}
              </span>

              {activeOpp.opportunityType && (
                <span className="text-[11px] font-semibold text-emerald-200/90 px-2.5 py-1 rounded-lg bg-emerald-900/60 border border-emerald-700/40">
                  {activeOpp.opportunityType}
                </span>
              )}

              <VerificationBadge status={activeOpp.verificationStatus} />
            </div>

            {/* Title */}
            <h2
              onClick={() => onNavigate(`/opportunities/${activeOpp.slug}`)}
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight font-space cursor-pointer hover:text-emerald-300 transition-colors line-clamp-2"
            >
              {activeOpp.title}
            </h2>

            {/* Organization & Location */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                {activeOpp.organizationLogo ? (
                  <img
                    src={activeOpp.organizationLogo}
                    alt={activeOpp.organizationName || 'Organization'}
                    className="w-5 h-5 rounded-md object-contain bg-white/10 p-0.5"
                  />
                ) : (
                  <Building className="w-4 h-4 text-emerald-400" />
                )}
                <span className="font-semibold text-white">
                  {activeOpp.organizationName || 'Verified Partner'}
                </span>
              </div>

              {activeOpp.location && (
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{activeOpp.location}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed line-clamp-3 max-w-xl">
              {activeOpp.description}
            </p>

            {/* Metadata Badges / Info tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              {activeOpp.educationLevel && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[11px]">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{activeOpp.educationLevel}</span>
                </div>
              )}

              {activeOpp.fundingType && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-emerald-300 text-[11px] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#FCD116]" />
                  <span>{activeOpp.fundingType}</span>
                </div>
              )}

              <DeadlineBadge deadline={activeOpp.deadline} />
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate(`/opportunities/${activeOpp.slug}`)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs sm:text-sm font-bold transition-all shadow-lg hover:shadow-emerald-900/30 cursor-pointer active:scale-98"
            >
              <span>View Opportunity</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={(e) => handleToggleSave(e, activeOpp)}
              aria-label={isCurrentSaved ? 'Remove from saved' : 'Save opportunity'}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isCurrentSaved
                  ? 'bg-emerald-900/70 border-emerald-500/50 text-[#FCD116]'
                  : 'bg-white/5 hover:bg-white/10 border-white/15 text-slate-300 hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isCurrentSaved ? 'fill-[#FCD116]' : ''}`} />
            </button>

            {/* Quick slide counter text on mobile */}
            <span className="text-[11px] font-mono text-slate-400 ml-auto lg:hidden">
              {currentIndex + 1} of {totalSlides}
            </span>
          </div>
        </div>

        {/* Right Column: Prominent Media Display with Fallback */}
        <div className="lg:col-span-5 relative overflow-hidden bg-slate-900 flex items-center justify-center min-h-[220px] sm:min-h-[260px] lg:min-h-full">
          {(() => {
            const media = resolveOpportunityMedia(activeOpp);
            return media.imageUrl ? (
              <div className="relative w-full h-full min-h-[220px] lg:min-h-[460px]">
                <img
                  src={media.imageUrl}
                  alt={activeOpp.title}
                  loading="eager"
                  className="w-full h-full object-cover object-center transition-all duration-500 hover:scale-103"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                {/* Soft gradient overlay for seamless integration without dimming subjects */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-slate-950/70 lg:via-transparent lg:to-transparent pointer-events-none" />
              </div>
            ) : (
              /* Professional Category Gradient Banner */
              <div
                className="relative w-full h-full min-h-[220px] lg:min-h-[460px] flex flex-col items-center justify-center p-8 text-center overflow-hidden"
                style={{ background: media.gradient.cssGradient }}
              >
                {/* Geometric line work */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#FCD116_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#FCD116]/10 blur-2xl pointer-events-none" />
                <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-[#006B3F]/30 blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-3 max-w-xs">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center mx-auto text-[#FCD116] shadow-xl">
                    <Compass className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#FCD116] font-space">
                      {activeOpp.category}
                    </p>
                    <p className="text-base font-bold text-white font-space">
                      {activeOpp.organizationName || 'Accredited Opening'}
                    </p>
                    <p className="text-xs text-emerald-100/70">
                      {activeOpp.opportunityType || 'Opportunity Ghana Verified'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Quick Category Stamp Overlay on Image */}
          <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#FCD116]" />
            <span>Featured Selection</span>
          </div>
        </div>
      </div>

      {/* Slideshow Bottom Navigation Controls & Progress */}
      {totalSlides > 1 && (
        <div className="bg-slate-950/90 border-t border-slate-800/80 px-6 py-3 flex items-center justify-between gap-4">
          {/* Slide Indicator Dots / Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
            {opportunities.map((opp, idx) => (
              <button
                key={opp.id}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}: ${opp.title}`}
                className={`transition-all rounded-full cursor-pointer h-2 ${
                  idx === currentIndex
                    ? 'w-8 bg-[#FCD116]'
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          {/* Prev / Next Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              aria-label="Previous opportunity slide"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="hidden sm:inline font-mono text-xs text-slate-400 px-1">
              {currentIndex + 1} / {totalSlides}
            </span>
            <button
              onClick={nextSlide}
              aria-label="Next opportunity slide"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
