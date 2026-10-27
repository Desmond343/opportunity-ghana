import React, { useRef, useState, useEffect } from 'react';
import {
  GraduationCap,
  Briefcase,
  Compass,
  BookOpen,
  Award,
  Coins,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface OpportunityCategorySectionProps {
  onNavigate: (path: string) => void;
}

interface CategoryTrack {
  id: string;
  heading: string;
  categoryLabel: string;
  description: string;
  icon: React.ElementType;
  pillBg: string;
  pillText: string;
  image: string;
  fallbackImage: string;
  href: string;
}

export const OpportunityCategorySection: React.FC<OpportunityCategorySectionProps> = ({ onNavigate }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const categoryTracks: CategoryTrack[] = [
    {
      id: 'scholarships',
      heading: 'Scholarships & Grants',
      categoryLabel: 'Academic Funding',
      description: 'Tuition support, living stipends, study abroad and funding opportunities.',
      icon: GraduationCap,
      pillBg: 'bg-[#E8F5EE]',
      pillText: 'text-[#005A36]',
      image: '/src/assets/images/ghana_scholarships_students_1793142405390.jpg',
      fallbackImage: '/images/categories/scholarships.jpg',
      href: '/scholarships'
    },
    {
      id: 'jobs',
      heading: 'Graduate & Career Jobs',
      categoryLabel: 'Employment',
      description: 'Graduate recruitment, corporate careers, technology startups and public service.',
      icon: Briefcase,
      pillBg: 'bg-[#EBF3FF]',
      pillText: 'text-[#1E40AF]',
      image: '/src/assets/images/ghana_corporate_professionals_1793142343322.jpg',
      fallbackImage: '/images/categories/jobs.jpg',
      href: '/jobs'
    },
    {
      id: 'internships',
      heading: 'Internships & Training',
      categoryLabel: 'Practical Experience',
      description: 'Build practical skills through internships, attachments and training programmes.',
      icon: Compass,
      pillBg: 'bg-[#E8F5EE]',
      pillText: 'text-[#046A38]',
      image: '/src/assets/images/ghana_internship_training_1793142343043.jpg',
      fallbackImage: '/images/categories/internships.jpg',
      href: '/internships'
    },
    {
      id: 'admissions',
      heading: 'Admissions & Study Opportunities',
      categoryLabel: 'Admissions',
      description: 'Verified university cut-off points, direct admissions windows and voucher guides.',
      icon: BookOpen,
      pillBg: 'bg-[#E0F2FE]',
      pillText: 'text-[#0369A1]',
      image: '/images/institutions/ghana_campus_students.jpg',
      fallbackImage: '/images/categories/scholarships.jpg',
      href: '/institutions?status=OPEN'
    },
    {
      id: 'fellowships',
      heading: 'Fellowships & Leadership Programmes',
      categoryLabel: 'Fellowships & Leadership',
      description: 'Prestigious African leadership academies, policy residencies and research grants.',
      icon: Award,
      pillBg: 'bg-[#FEF3C7]',
      pillText: 'text-[#92400E]',
      image: '/images/categories/fellowships.jpg',
      fallbackImage: '/images/categories/scholarships.jpg',
      href: '/opportunities?category=Fellowships'
    },
    {
      id: 'grants',
      heading: 'Entrepreneurship & Business Grants',
      categoryLabel: 'Entrepreneurship',
      description: 'Seed funding, SME acceleration, pitch competitions and capital for founders.',
      icon: Coins,
      pillBg: 'bg-[#FFEDD5]',
      pillText: 'text-[#9A3412]',
      image: '/images/categories/grants.jpg',
      fallbackImage: '/images/categories/jobs.jpg',
      href: '/opportunities?category=Grants'
    },
    {
      id: 'courses',
      heading: 'Free Courses & Certifications',
      categoryLabel: 'Courses & Certifications',
      description: 'Tech, data analytics, cloud credentials and business training from global institutions.',
      icon: Sparkles,
      pillBg: 'bg-[#EDE9FE]',
      pillText: 'text-[#6B21A8]',
      image: '/images/categories/courses.jpg',
      fallbackImage: '/images/categories/internships.jpg',
      href: '/courses'
    },
    {
      id: 'government',
      heading: 'Government & National Service',
      categoryLabel: 'Public Service',
      description: 'Official Ghanaian public initiatives, National Service postings, GEA and youth funds.',
      icon: ShieldCheck,
      pillBg: 'bg-[#D1FAE5]',
      pillText: 'text-[#065F46]',
      image: '/images/institutions/ghana_graduates_celebrate.jpg',
      fallbackImage: '/images/categories/jobs.jpg',
      href: '/opportunities?category=Government+Programmes'
    }
  ];

  const updateScrollState = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Approximate active card index
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 24 : 480;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(0, index), categoryTracks.length - 1));
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.75, 360);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  const scrollToIndex = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 24 : 480;
    el.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Section Header with Title, Description and Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006B3F] dark:bg-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#006B3F] dark:text-emerald-400 font-space">
              Live Category Tracks
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#111111] dark:text-white font-space tracking-tight">
            Explore Opportunities by Category
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
            Browse verified opportunity pathways curated for Ghanaian youth, students, and professionals.
          </p>
        </div>

        {/* Carousel Prev/Next Buttons */}
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          <div className="hidden md:flex items-center gap-1.5 mr-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>{activeIndex + 1}</span>
            <span>/</span>
            <span>{categoryTracks.length}</span>
          </div>
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll left to previous category"
            className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-sm ${
              canScrollLeft
                ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141B29] text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95'
                : 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll right to next category"
            className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-sm ${
              canScrollRight
                ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141B29] text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95'
                : 'border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontally arranged row of large, image-based opportunity category cards */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
        style={{ scrollBehavior: 'smooth' }}
      >
        {categoryTracks.map((track) => {
          const Icon = track.icon;
          return (
            <div
              key={track.id}
              role="button"
              tabIndex={0}
              onClick={() => onNavigate(track.href)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate(track.href);
                }
              }}
              aria-label={`${track.heading} - ${track.description}`}
              className="group relative shrink-0 snap-start w-[85vw] sm:w-[460px] md:w-[490px] lg:w-[520px] h-[370px] sm:h-[400px] lg:h-[420px] rounded-[24px] overflow-hidden cursor-pointer shadow-xl border border-white/20 dark:border-white/10 select-none focus:outline-none focus-visible:ring-3 focus-visible:ring-[#FCD116] focus-visible:ring-offset-2 transition-transform duration-300 hover:-translate-y-1"
            >
              {/* 1. Large landscape photograph filling the card */}
              <img
                src={track.image}
                alt={track.heading}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== track.fallbackImage) {
                    target.src = track.fallbackImage;
                  }
                }}
                className="absolute inset-0 w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* 2. Dark forest-green gradient overlay across the lower portion of the photograph */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(0, 35, 25, 0.05) 0%, rgba(0, 35, 25, 0.18) 32%, rgba(0, 42, 30, 0.72) 60%, rgba(0, 36, 26, 0.94) 84%, #00261A 100%)'
                }}
              />

              {/* 3. Top Row: Small white icon container in upper-left corner & pill-shaped category label in upper-right */}
              <div className="absolute top-5 sm:top-6 left-5 sm:left-6 right-5 sm:right-6 flex items-center justify-between z-10 pointer-events-none">
                {/* White square icon container with rounded corners */}
                <div className="w-13 h-13 sm:w-14 sm:h-14 bg-white/95 backdrop-blur-sm rounded-[18px] flex items-center justify-center shadow-lg border border-white/90">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-[#005030]" strokeWidth={2.2} />
                </div>

                {/* Pill-shaped category label near upper-right corner */}
                <span
                  className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm tracking-normal shadow-sm border border-white/50 backdrop-blur-md ${track.pillBg} ${track.pillText}`}
                >
                  {track.categoryLabel}
                </span>
              </div>

              {/* 4. Lower Card Content: Large bold white heading, short white description, and yellow call-to-action styling */}
              <div className="absolute bottom-5 sm:bottom-6 left-5 sm:left-6 right-5 sm:right-6 z-10 flex flex-col justify-end space-y-2 pointer-events-none">
                {/* Large, bold white heading */}
                <h3 className="text-2xl sm:text-[28px] lg:text-[32px] font-bold text-white tracking-tight leading-tight drop-shadow-xs">
                  {track.heading}
                </h3>

                {/* Short white descriptive sentence */}
                <p className="text-xs sm:text-sm lg:text-[15px] text-white/90 font-normal leading-relaxed line-clamp-2 max-w-lg">
                  {track.description}
                </p>

                {/* Bottom CTA Row: Yellow "Explore opportunities" on bottom-left, yellow right-arrow on bottom-right */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[#FCD116] font-bold text-sm sm:text-base group-hover:underline flex items-center gap-1.5 tracking-tight">
                    Explore opportunities
                  </span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#FCD116] transform group-hover:translate-x-1.5 transition-transform duration-200" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination dots for quick touch navigation */}
      <div className="flex items-center justify-center gap-2 pt-2">
        {categoryTracks.map((track, i) => (
          <button
            key={track.id}
            onClick={() => scrollToIndex(i)}
            aria-label={`Jump to category ${track.heading}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              activeIndex === i
                ? 'w-7 h-2 bg-[#006B3F] dark:bg-emerald-400'
                : 'w-2 h-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
