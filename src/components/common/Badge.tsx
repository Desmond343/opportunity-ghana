import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'blue' | 'indigo' | 'slate' | 'rose' | 'purple' | 'cyan' | 'neutral' | 'ghana-green' | 'ghana-gold' | 'ghana-red' | 'ghana-black';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<string, string> = {
  emerald: 'bg-[#E6F0EB] text-[#006B3F] border-[#006B3F]/25 font-semibold',
  'ghana-green': 'bg-[#E6F0EB] text-[#006B3F] border-[#006B3F]/25 font-semibold',
  amber: 'bg-[#FEF9E7] text-[#8C6D00] border-[#FCD116]/40 font-semibold',
  'ghana-gold': 'bg-[#FEF9E7] text-[#8C6D00] border-[#FCD116]/40 font-semibold',
  rose: 'bg-[#FCE8EA] text-[#CE1126] border-[#CE1126]/25 font-semibold',
  'ghana-red': 'bg-[#FCE8EA] text-[#CE1126] border-[#CE1126]/25 font-semibold',
  'ghana-black': 'bg-[#111111] text-white border-[#111111] font-semibold',
  blue: 'bg-blue-50 text-blue-800 border-blue-200/80',
  indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
  slate: 'bg-[#F7F9F8] text-[#5F6368] border-[#E5E7EB]',
  purple: 'bg-purple-50 text-purple-800 border-purple-200/80',
  cyan: 'bg-cyan-50 text-cyan-800 border-cyan-200/80',
  neutral: 'bg-white text-[#111111] border-[#E5E7EB] shadow-2xs'
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
