import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GraduationCap,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface TailoredJourneysCarouselProps {
  onNavigate: (path: string) => void;
}

const SLIDE_LABELS = [
  'Scholarships & University Fellowships',
  'Jobs, Internships & Graduate Schemes',
  'Paid Certifications & Professional Training'
];

const SLIDE_COUNT = SLIDE_LABELS.length;
const AUTO_SLIDE_INTERVAL_MS = 5500;
const INTERACTION_RESUME_DELAY_MS = 4500;

export const TailoredJourneysCarousel: React.FC<TailoredJourneysCarouselProps> = ({
  onNavigate
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : true
  );
  const [isTabVisible, setIsTabVisible] = useState<boolean>(() =>
    typeof document !== 'undefined' ? !document.hidden : true
  );
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [isFocusPaused, setIsFocusPaused] = useState(false);
  const [isTouchActive, setIsTouchActive] = useState(false);
  const [isCooldownPaused, setIsCooldownPaused] = useState(false);

  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    axis: 'pending' | 'horizontal' | 'vertical';
  } | null>(null);
  const didSwipeRef = useRef(false);
  const swipeResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track mobile viewport (< 768px)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobileViewport(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Pause auto-slide when browser tab is inactive
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (swipeResetTimerRef.current) clearTimeout(swipeResetTimerRef.current);
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, []);

  const triggerInteractionCooldown = useCallback(() => {
    setIsCooldownPaused(true);
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
    }
    cooldownTimerRef.current = setTimeout(() => {
      setIsCooldownPaused(false);
    }, INTERACTION_RESUME_DELAY_MS);
  }, []);

  const handleManualSlide = useCallback(
    (nextIndex: number) => {
      setActiveSlide(((nextIndex % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
      triggerInteractionCooldown();
    },
    [triggerInteractionCooldown]
  );

  // Automatic sliding every 5.5s on mobile only when active & not interacting
  useEffect(() => {
    if (
      !isMobileViewport ||
      !isTabVisible ||
      isHoverPaused ||
      isFocusPaused ||
      isTouchActive ||
      isCooldownPaused
    ) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDE_COUNT);
    }, AUTO_SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [
    isMobileViewport,
    isTabVisible,
    isHoverPaused,
    isFocusPaused,
    isTouchActive,
    isCooldownPaused
  ]);

  const markDidSwipe = () => {
    didSwipeRef.current = true;
    if (swipeResetTimerRef.current) clearTimeout(swipeResetTimerRef.current);
    swipeResetTimerRef.current = setTimeout(() => {
      didSwipeRef.current = false;
    }, 150);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobileViewport || e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      axis: 'pending'
    };
    didSwipeRef.current = false;
    setIsTouchActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobileViewport || !touchStartRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (touchStartRef.current.axis === 'pending') {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        touchStartRef.current.axis = 'vertical';
        return;
      }
      touchStartRef.current.axis = 'horizontal';
      setIsDragging(true);
      markDidSwipe();
    }

    if (touchStartRef.current.axis === 'horizontal') {
      markDidSwipe();
      // Subtle edge resistance on first/last slide while dragging past boundary
      const isPullingPastStart = activeSlide === 0 && dx > 0;
      const isPullingPastEnd = activeSlide === SLIDE_COUNT - 1 && dx < 0;
      const dampedDx = isPullingPastStart || isPullingPastEnd ? dx * 0.35 : dx;
      setDragOffsetPx(dampedDx);
    }
  };

  const finishTouch = (clientX?: number) => {
    const start = touchStartRef.current;
    if (start && start.axis === 'horizontal') {
      const endX = typeof clientX === 'number' ? clientX : start.x + dragOffsetPx;
      const dx = endX - start.x;
      const elapsed = Date.now() - start.time;
      const threshold = elapsed < 260 ? 25 : 45;

      if (dx < -threshold) {
        setActiveSlide((prev) => (prev + 1) % SLIDE_COUNT);
      } else if (dx > threshold) {
        setActiveSlide((prev) => (prev - 1 + SLIDE_COUNT) % SLIDE_COUNT);
      }
      markDidSwipe();
      triggerInteractionCooldown();
    }

    touchStartRef.current = null;
    setIsDragging(false);
    setDragOffsetPx(0);
    setIsTouchActive(false);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const changed = e.changedTouches[0];
    finishTouch(changed?.clientX);
  };

  const handleTouchCancel = () => {
    finishTouch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isMobileViewport) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleManualSlide(activeSlide - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleManualSlide(activeSlide + 1);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 md:pt-0 space-y-4 sm:space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#006B3F] dark:text-emerald-400 font-space">
          Tailored Journeys
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white font-space tracking-tight">
          Opportunities for Your Next Step
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Whether you are completing SHS, graduating university, or seeking funding for a Ghanaian enterprise.
        </p>
      </div>

      <div
        role="region"
        aria-roledescription={isMobileViewport ? 'carousel' : undefined}
        aria-label="Opportunities for Your Next Step"
        onMouseEnter={() => setIsHoverPaused(true)}
        onMouseLeave={() => setIsHoverPaused(false)}
        onFocus={() => setIsFocusPaused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setIsFocusPaused(false);
          }
        }}
        onKeyDown={handleKeyDown}
        className="relative"
      >
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          className="overflow-hidden rounded-2xl md:rounded-none md:overflow-visible touch-pan-y md:touch-auto"
        >
          <div
            style={{
              ['--slide-offset' as string]: `${-activeSlide * 100}%`,
              ['--drag-offset' as string]: `${dragOffsetPx}px`
            }}
            className={`flex md:grid md:grid-cols-3 md:gap-7 max-md:[transform:translate3d(calc(var(--slide-offset)+var(--drag-offset)),0,0)] ${
              isDragging
                ? 'max-md:transition-none'
                : 'max-md:transition-transform max-md:duration-500 max-md:ease-out'
            }`}
          >
            {/* Track 1: Students & Undergraduates (Featured Scholarship Pathway) */}
            <div
              onClick={() => {
                if (didSwipeRef.current) return;
                onNavigate('/opportunities?category=Scholarships');
              }}
              className="max-md:w-full max-md:shrink-0 group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer flex flex-col justify-between min-h-[320px] sm:min-h-[340px] border border-white/10 bg-slate-950 shadow-sm"
            >
              {/* Layer 1: Scholarship Background Image */}
              <img
                src="/images/ghana_student_workspace.jpg"
                alt="Young Ghanaian student studying in modern university commons"
                className="absolute inset-0 w-full h-full object-cover object-[center_20%] contrast-[1.04] saturate-[1.05]"
              />
              {/* Layer 2: Directional Contrast Gradient */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(2, 12, 20, 0.08) 0%, rgba(2, 16, 12, 0.25) 38%, rgba(2, 18, 13, 0.80) 72%, rgba(2, 14, 10, 0.95) 100%)'
                }}
              />

              {/* Top Badge */}
              <div className="relative z-10 p-4 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#FCD116] text-[#0A0F0D] font-space">
                  Students &amp; Graduates
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-white">
                  <GraduationCap className="w-3 h-3 text-[#FCD116]" />
                  Full Funding
                </span>
              </div>

              {/* Layer 3: Flat Glass Content Panel */}
              <div className="relative z-10 m-3.5 mt-auto p-4 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 space-y-2 text-white shadow-sm">
                <h3 className="text-base sm:text-lg font-bold font-space text-white group-hover:text-[#FCD116] transition-colors leading-snug">
                  Scholarships &amp; University Fellowships
                </h3>
                <p className="text-xs text-slate-200/90 leading-relaxed font-normal">
                  Full tuition waivers, Mastercard Foundation awards, and international graduate programs for Ghanaian students.
                </p>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-[#FCD116] group-hover:text-white transition-colors">
                  <span>Discover Scholarships</span>
                  <ArrowRight className="w-4 h-4 text-[#FCD116] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Track 2: Early Career Professionals */}
            <div
              onClick={() => {
                if (didSwipeRef.current) return;
                onNavigate('/opportunities?category=Jobs');
              }}
              className="max-md:w-full max-md:shrink-0 group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer flex flex-col justify-between min-h-[320px] sm:min-h-[340px] border border-white/10 bg-slate-950 shadow-sm"
            >
              {/* Layer 1: Career Background Image */}
              <img
                src="/images/ghana_hero_professionals.jpg"
                alt="Young Ghanaian professionals in modern workplace"
                className="absolute inset-0 w-full h-full object-cover object-[center_20%] contrast-[1.04] saturate-[1.05]"
              />
              {/* Layer 2: Directional Contrast Gradient */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(2, 12, 20, 0.08) 0%, rgba(2, 16, 24, 0.25) 38%, rgba(2, 14, 24, 0.80) 72%, rgba(2, 10, 20, 0.95) 100%)'
                }}
              />

              {/* Top Badge */}
              <div className="relative z-10 p-4 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-space">
                  Early Career &amp; NSS
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-white">
                  <Briefcase className="w-3 h-3 text-emerald-300" />
                  Verified Roles
                </span>
              </div>

              {/* Layer 3: Flat Glass Content Panel */}
              <div className="relative z-10 m-3.5 mt-auto p-4 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 space-y-2 text-white shadow-sm">
                <h3 className="text-base sm:text-lg font-bold font-space text-white group-hover:text-emerald-300 transition-colors leading-snug">
                  Jobs, Internships &amp; Graduate Schemes
                </h3>
                <p className="text-xs text-slate-200/90 leading-relaxed font-normal">
                  Verified entry-level vacancies, management trainee programs, and paid corporate attachments across Ghana.
                </p>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-300 group-hover:text-white transition-colors">
                  <span>View Open Vacancies</span>
                  <ArrowRight className="w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Track 3: Practical Skills, Paid Certifications & Upskilling */}
            <div
              onClick={() => {
                if (didSwipeRef.current) return;
                onNavigate('/resources?paid=true');
              }}
              className="max-md:w-full max-md:shrink-0 group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#00482B] via-[#006B3F] to-slate-950 p-4.5 sm:p-6 flex flex-col justify-between min-h-[320px] sm:min-h-[340px] text-white cursor-pointer border border-white/10 shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FCD116] text-[#111111] font-mono">
                    Verified Pricing
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-200">
                    Global Credentials
                  </span>
                </div>
                <h3 className="text-xl font-bold font-space text-white group-hover:text-[#FCD116] transition-colors">
                  Paid Certifications &amp; Professional Training
                </h3>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Vetted courses from AWS, Google, Microsoft, Harvard, PMI and ACCA. Full transparency on tuition, exam fees, and accessibility for learners in Ghana.
                </p>
              </div>

              <div className="pt-4 border-t border-white/15 space-y-3">
                <div className="space-y-1.5 text-xs text-emerald-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FCD116] shrink-0" />
                    <span>Accredited global certificates &amp; digital badges</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#FCD116] shrink-0" />
                    <span>Exam centers in Accra &amp; online proctoring verified</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#FCD116]">
                    <span>Explore Paid Courses</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (didSwipeRef.current) return;
                      onNavigate('/resources?free=true');
                    }}
                    className="text-[11px] text-white hover:text-[#FCD116] underline font-medium cursor-pointer"
                  >
                    View Free Only
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Slideshow Navigation (< 768px only) */}
        <div className="flex md:hidden items-center justify-center gap-4 pt-3">
          <button
            type="button"
            onClick={() => handleManualSlide(activeSlide - 1)}
            aria-label="Previous featured card"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors cursor-pointer touch-manipulation"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            className="flex items-center gap-1"
            role="tablist"
            aria-label="Featured pathway slides"
          >
            {SLIDE_LABELS.map((label, idx) => {
              const isActive = activeSlide === idx;
              return (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Slide ${idx + 1}: ${label}`}
                  onClick={() => handleManualSlide(idx)}
                  className="p-1.5 flex items-center justify-center cursor-pointer touch-manipulation"
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-6 bg-[#006B3F] dark:bg-emerald-400'
                        : 'w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleManualSlide(activeSlide + 1)}
            aria-label="Next featured card"
            className="w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors cursor-pointer touch-manipulation"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
