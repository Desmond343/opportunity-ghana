import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'blue' | 'indigo' | 'slate' | 'rose' | 'purple' | 'cyan' | 'neutral' | 'ghana-green' | 'ghana-gold' | 'ghana-red' | 'ghana-black';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<string, string> = {
  emerald: 'bg-[#E6F0EB] dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-300 border-[#006B3F]/25 dark:border-emerald-500/30 font-semibold',
  'ghana-green': 'bg-[#E6F0EB] dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-300 border-[#006B3F]/25 dark:border-emerald-500/30 font-semibold',
  amber: 'bg-[#FEF9E7] dark:bg-amber-950/60 text-[#8C6D00] dark:text-amber-300 border-[#FCD116]/40 dark:border-amber-500/30 font-semibold',
  'ghana-gold': 'bg-[#FEF9E7] dark:bg-amber-950/60 text-[#8C6D00] dark:text-amber-300 border-[#FCD116]/40 dark:border-amber-500/30 font-semibold',
  rose: 'bg-[#FCE8EA] dark:bg-rose-950/60 text-[#CE1126] dark:text-rose-300 border-[#CE1126]/25 dark:border-rose-500/30 font-semibold',
  'ghana-red': 'bg-[#FCE8EA] dark:bg-rose-950/60 text-[#CE1126] dark:text-rose-300 border-[#CE1126]/25 dark:border-rose-500/30 font-semibold',
  'ghana-black': 'bg-[#111111] dark:bg-slate-900 text-white border-[#111111] dark:border-slate-700 font-semibold',
  blue: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60',
  indigo: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60',
  slate: 'bg-[#F7F9F8] dark:bg-slate-800 text-[#5F6368] dark:text-slate-300 border-[#E5E7EB] dark:border-slate-700',
  purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60',
  cyan: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800/60',
  neutral: 'bg-white dark:bg-slate-800 text-[#111111] dark:text-slate-100 border-[#E5E7EB] dark:border-slate-700 shadow-2xs'
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className = ''
}) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-medium';
  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${variantStyles[variant] || variantStyles.slate} ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
};
