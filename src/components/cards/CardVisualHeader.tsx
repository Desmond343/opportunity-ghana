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
  heightClass = 'h-40 sm:h-44',
  hoverScale = true
}) => {
  const [imageError, setImageError] = useState(false);

  const shouldRenderImage = Boolean(media.imageUrl) && !imageError;
  const gradient = media.gradient;
  const IconComponent = ICON_MAP[gradient.iconName] || Sparkles;

  return (
    <div
      className={`relative w-full ${heightClass} overflow-hidden select-none bg-slate-950`}
      style={{
        background: !shouldRenderImage ? gradient.cssGradient : undefined
      }}
    >
      {shouldRenderImage ? (
        <>
          {/* Main Visual Image */}
          <img
            src={media.imageUrl!}
            alt={alt}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              hoverScale ? 'group-hover:scale-105' : ''
            }`}
            loading="lazy"
          />

          {/* Subtle Bottom-To-Top Dark Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent pointer-events-none" />

          {/* Subtle top vignette for badges contrast */}
          <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-slate-950/60 to-transparent pointer-events-none" />
        </>
      ) : (
        /* Professional Category Gradient Banner */
        <div className="relative w-full h-full flex flex-col justify-end p-4 sm:p-5 overflow-hidden">
          {/* Subtle Geometric SVG Pattern Overlay */}
          <PatternOverlay pattern={gradient.pattern} accentColor={gradient.accentColor} />

          {/* Large decorative watermark icon in background */}
          <div
            className="absolute -right-4 -bottom-4 opacity-15 pointer-events-none text-white transition-transform duration-500 group-hover:scale-110"
            style={{ color: gradient.accentColor }}
          >
            <IconComponent className="w-32 h-32" />
          </div>

          {/* Center/Bottom Content within Banner */}
          <div className="relative z-10 space-y-1 max-w-[85%]">
            <div className="flex items-center gap-1.5">
              <span
                className="text-[10px] font-extrabold uppercase tracking-widest font-space block"
                style={{ color: gradient.accentColor }}
              >
                {gradient.name}
              </span>
            </div>

            {subtitle && (
              <p className="text-xs font-bold text-white/95 truncate font-space">
                {subtitle}
              </p>
            )}

            {title && (
              <p className="text-[11px] font-medium text-slate-300/90 line-clamp-1">
                {title}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Floating Top Left Badge / Tags */}
      {badgeTopLeft && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pointer-events-auto">
          {badgeTopLeft}
        </div>
      )}

      {/* Floating Top Right Action Controls */}
      {actionsTopRight && (
        <div className="absolute top-3 right-3 z-20 pointer-events-auto">
          {actionsTopRight}
        </div>
      )}
    </div>
  );
};
