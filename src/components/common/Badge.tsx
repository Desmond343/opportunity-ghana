import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'blue' | 'indigo' | 'slate' | 'rose' | 'purple' | 'cyan' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
  blue: 'bg-blue-50 text-blue-800 border-blue-200/80',
  indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  rose: 'bg-rose-50 text-rose-800 border-rose-200/80',
  purple: 'bg-purple-50 text-purple-800 border-purple-200/80',
  cyan: 'bg-cyan-50 text-cyan-800 border-cyan-200/80',
  neutral: 'bg-white text-slate-700 border-slate-200 shadow-2xs'
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
