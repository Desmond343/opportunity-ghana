import React from 'react';
import { SearchX, Sparkles, RefreshCw } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Loading verified opportunities...'
}) => {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center">
      <div className="w-10 h-10 border-3 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 animate-pulse">{message}</p>
    </div>
  );
};

export const OpportunitySkeleton: React.FC = () => {
  return (
    <div className="floating-glass-tablet specular-rim-highlight rounded-2xl p-5 animate-pulse flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-200/80 dark:bg-slate-700/70 rounded-xl" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-slate-200/80 dark:bg-slate-700/70 rounded w-1/3" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
        </div>
      </div>
      <div className="h-5 bg-slate-200/80 dark:bg-slate-700/70 rounded w-3/4" />
      <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
      <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="h-5 bg-slate-200/80 dark:bg-slate-700/70 rounded-full w-20" />
        <div className="h-5 bg-slate-200/80 dark:bg-slate-700/70 rounded-full w-24" />
      </div>
    </div>
  );
};

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No opportunities found',
  description = 'Try adjusting your search criteria, removing filters, or checking back soon.',
  actionText,
  onAction,
  icon
}) => {
  return (
    <div className="bg-white dark:bg-[#141B29] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-10 text-center max-w-md mx-auto my-8 shadow-xs">
      <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
        {icon || <SearchX className="w-7 h-7 text-slate-400 dark:text-slate-400" />}
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-transparent dark:border-emerald-700/50 rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 pt-6 pb-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#141B29] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Previous
      </button>
      {Array.from({ length: totalPages }).map((_, i) => {
        const page = i + 1;
        const isActive = page === currentPage;
        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              isActive
                ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-2xs'
                : 'bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {page}
          </button>
        );
      })}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#141B29] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Next
      </button>
    </div>
  );
};
