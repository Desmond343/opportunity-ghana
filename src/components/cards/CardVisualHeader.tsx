import React, { useState } from 'react';
import { ResolvedCardMedia } from '../../utils/cardBackgrounds';
import {
  Cpu,
  Code,
  Sparkles,
  Shield,
  Briefcase,
  Coins,
  Rocket,
  GraduationCap,
  HeartPulse,
  Sprout,
  Wrench,
  Megaphone,
  Palette,
  TrendingUp,
  Compass,
  Award,
  Landmark,
  Globe,
  Trophy,
  BookOpen,
  Layers
} from 'lucide-react';

interface CardVisualHeaderProps {
  media: ResolvedCardMedia;
  alt: string;
  title?: string;
  subtitle?: string;
  badgeTopLeft?: React.ReactNode;
  actionsTopRight?: React.ReactNode;
  heightClass?: string;
  hoverScale?: boolean;
}

/**
 * Maps icon name strings from gradient config to Lucide icons
 */
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Cpu,
  Code,
  Sparkles,
  Shield,
  Briefcase,
  Coins,
  Rocket,
  GraduationCap,
  HeartPulse,
  Sprout,
  Wrench,
  Megaphone,
  Palette,
  TrendingUp,
  Compass,
  Award,
  Landmark,
  Globe,
  Trophy,
  BookOpen,
  Layers
};

/**
 * Geometric SVG patterns for gradient banners
 */
const PatternOverlay: React.FC<{ pattern: string; accentColor: string }> = ({ pattern, accentColor }) => {
  switch (pattern) {
    case 'circuit':
      return (
        <svg
          className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="circuit-pat" width="60" height="60" patternUnits="userSpaceOnUse">
              <path
                d="M 10 10 L 30 10 L 30 30 M 50 20 L 50 50 L 20 50 M 0 35 L 15 35"
                fill="none"
                stroke={accentColor}
                strokeWidth="1.2"
              />
              <circle cx="10" cy="10" r="2.5" fill={accentColor} />
              <circle cx="30" cy="30" r="2.5" fill={accentColor} />
              <circle cx="50" cy="20" r="2.5" fill={accentColor} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit-pat)" />
        </svg>
      );
    case 'grid':
      return (
        <div
          className="absolute inset-0 opacity-12 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, ${accentColor} 1px, transparent 1px), linear-gradient(to bottom, ${accentColor} 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      );
    case 'rings':
      return (
        <svg
          className="absolute -right-8 -bottom-8 w-48 h-48 opacity-15 pointer-events-none"
          viewBox="0 0 100 100"
        >
          <circle cx="50" cy="50" r="45" fill="none" stroke={accentColor} strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="32" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <circle cx="50" cy="50" r="18" fill="none" stroke={accentColor} strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );
    case 'cross':
      return (
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, ${accentColor} 1.5px, transparent 1.5px)`,
            backgroundSize: '18px 18px'
          }}
        />
      );
    case 'waves':
      return (
        <svg
          className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 0 30 Q 75 10 150 30 T 300 30 T 450 30 T 600 30"
            fill="none"
            stroke={accentColor}
            strokeWidth="1.5"
          />
          <path
            d="M 0 50 Q 75 70 150 50 T 300 50 T 450 50 T 600 50"
            fill="none"
            stroke={accentColor}
            strokeWidth="1"
          />
        </svg>
      );
    case 'kente':
    default:
      return (
        <div
          className="absolute inset-0 opacity-12 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${accentColor} 1.2px, transparent 1.2px)`,
            backgroundSize: '14px 14px'
          }}
        />
      );
  }
};

export const CardVisualHeader: React.FC<CardVisualHeaderProps> = ({
  media,
  alt,
  title,
  subtitle,
  badgeTopLeft,
  actionsTopRight,
  heightClass = 'h-24 sm:h-28 md:h-32',
  hoverScale = true
}) => {
  const [usedFallback, setUsedFallback] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fallbackLocalUrl =
    media.gradient.id === 'scholarships' || media.gradient.id === 'education' || media.gradient.id === 'study abroad'
      ? '/images/ghana_student_workspace.jpg'
      : media.gradient.id === 'jobs' || media.gradient.id === 'business' || media.gradient.id === 'finance'
      ? '/images/ghana_hero_professionals.jpg'
      : '/images/institutions/ug_students_seminar.jpg';

  const activeImageUrl = usedFallback ? fallbackLocalUrl : media.imageUrl;
  const shouldRenderImage = Boolean(activeImageUrl) && !imageError;
  const gradient = media.gradient;
  const IconComponent = ICON_MAP[gradient.iconName] || Sparkles;

  return (
    <div
      className={`relative w-full ${heightClass} overflow-hidden select-none bg-slate-950 specular-rim-highlight`}
      style={{
        background: !shouldRenderImage ? gradient.cssGradient : undefined
      }}
    >
      {shouldRenderImage ? (
        <>
          {/* Main Visual Image - Vibrant & Unobscured */}
          <img
            src={activeImageUrl!}
            alt={media.imageAlt || alt}
            onError={() => {
              if (!usedFallback && activeImageUrl !== fallbackLocalUrl) {
                setUsedFallback(true);
              } else {
                setImageError(true);
              }
            }}
            className={`w-full h-full object-cover object-[center_25%] transition-transform duration-700 ease-out contrast-[1.05] saturate-[1.06] ${
              hoverScale ? 'group-hover:scale-105' : ''
            }`}
            loading="lazy"
          />

          {/* Subtle bottom gradient to ground the visual header and blend into card body without dimming subjects */}
          <div className="absolute inset-x-0 bottom-0 h-10 sm:h-12 bg-gradient-to-t from-black/45 via-black/15 to-transparent pointer-events-none" />

          {/* Subtle top vignette for crisp floating badge legibility */}
          <div className="absolute inset-x-0 top-0 h-8 sm:h-10 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
        </>
      ) : (
        /* Professional Category Gradient Banner */
        <div className="relative w-full h-full flex flex-col justify-end p-2.5 sm:p-3 overflow-hidden">
          {/* Subtle Geometric SVG Pattern Overlay */}
          <PatternOverlay pattern={gradient.pattern} accentColor={gradient.accentColor} />

          {/* Large decorative watermark icon in background */}
          <div
            className="absolute -right-2 -bottom-2 opacity-15 pointer-events-none text-white transition-transform duration-500 group-hover:scale-110"
            style={{ color: gradient.accentColor }}
          >
            <IconComponent className="w-20 h-20 sm:w-24 sm:h-24" />
          </div>

          {/* Center/Bottom Content within Banner */}
          <div className="relative z-10 space-y-0.5 max-w-[85%]">
            <div className="flex items-center gap-1">
              <span
                className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest font-space block"
                style={{ color: gradient.accentColor }}
              >
                {gradient.name}
              </span>
            </div>

            {subtitle && (
              <p className="text-[11px] sm:text-xs font-bold text-white/95 truncate font-space">
                {subtitle}
              </p>
            )}

            {title && (
              <p className="text-[10px] sm:text-[11px] font-medium text-slate-300/90 line-clamp-1">
                {title}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Floating Top Left Badge / Tags */}
      {badgeTopLeft && (
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-20 flex items-center gap-1 sm:gap-1.5 pointer-events-auto">
          {badgeTopLeft}
        </div>
      )}

      {/* Floating Top Right Action Controls */}
      {actionsTopRight && (
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 pointer-events-auto">
          {actionsTopRight}
        </div>
      )}
    </div>
  );
};
