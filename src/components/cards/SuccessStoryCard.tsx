import React from 'react';
import { SuccessStory } from '../../types/database';
import {
  Award,
  GraduationCap,
  Building2,
  MapPin,
  ArrowRight,
  Quote,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface SuccessStoryCardProps {
  story: SuccessStory;
  onNavigate: (path: string) => void;
}

export const SuccessStoryCard: React.FC<SuccessStoryCardProps> = ({ story, onNavigate }) => {
  const initials = story.personName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      onClick={() => onNavigate(`/success-stories/${story.slug || story.id}`)}
      className="floating-glass-tablet specular-rim-highlight group relative rounded-2xl sm:rounded-[22px] overflow-hidden cursor-pointer flex flex-col justify-between"
    >
      {/* Top Visual / Alumnus Header */}
      <div>
        {story.imageUrl ? (
          <div className="relative h-48 w-full overflow-hidden bg-slate-900">
            <img
              src={story.imageUrl}
              alt={`${story.personName} - ${story.title}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/85 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Verified Alumnus Story
              </span>
              {story.opportunityCategory && (
                <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-[#FCD116] border border-white/15 text-[10px] font-bold backdrop-blur-md">
                  {story.opportunityCategory}
                </span>
              )}
            </div>

            <div className="absolute bottom-3 left-4 right-4 text-white">
              <p className="text-sm font-extrabold font-space tracking-tight text-white">
                {story.personName}
              </p>
              {story.personRoleOrTitle && (
                <p className="text-[11px] text-emerald-200 font-medium truncate">
                  {story.personRoleOrTitle}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-5 pb-0 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#006B3F] to-emerald-900 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0 font-space border border-emerald-400/30">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-space">
                    {story.personName}
                  </h4>
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-[#006B3F] dark:text-emerald-400 shrink-0"
                    title="Verified Alumnus"
                  />
                </div>
                {story.personRoleOrTitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {story.personRoleOrTitle}
                  </p>
                )}
              </div>
            </div>

            {story.opportunityCategory && (
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-[#006B3F] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-700/60 text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                {story.opportunityCategory}
              </span>
            )}
          </div>
        )}

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Opportunity & Institution Metadata */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50/90 dark:bg-emerald-950/75 text-[#006B3F] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-700/60 font-bold">
              <Award className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[210px]">{story.opportunityBenefitedFrom}</span>
            </span>

            {story.institutionOrCareerInfo && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 font-medium">
                <Building2 className="w-3 h-3 text-slate-500 dark:text-slate-400 shrink-0" />
                <span className="truncate max-w-[180px]">{story.institutionOrCareerInfo}</span>
              </span>
            )}
          </div>

          {/* Story Title */}
          <h3 className="text-base sm:text-lg font-bold text-[#111111] dark:text-white group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2 font-space">
            {story.title}
          </h3>

          {/* Excerpt / Quote */}
          <div className="relative pl-3 border-l-2 border-[#006B3F]/40 dark:border-emerald-500/50">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 italic">
              &ldquo;{story.summary || story.storyContent}&rdquo;
            </p>
          </div>

          {/* Location & Year */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {story.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                <span>{story.location}</span>
              </span>
            )}
            {story.year && (
              <span className="inline-flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                <span>{story.year}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Internal Frosted Shelf Footer */}
      <div className="glass-subpanel mx-3 mb-3 px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-2">
        {story.opportunitySlug ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(`/opportunities/${story.opportunitySlug}`);
            }}
            className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-[#006B3F] dark:hover:text-emerald-400 underline underline-offset-2 truncate max-w-[160px] cursor-pointer"
          >
            View Opportunity
          </button>
        ) : (
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Verified Journey
          </span>
        )}

        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#006B3F] dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
          <span>Read Story</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </article>
  );
};
