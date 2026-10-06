import React from 'react';
import { SearchX, Sparkles, RefreshCw } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Loading verified opportunities...'
}) => {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center">
      <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-600 animate-pulse">{message}</p>
    </div>
  );
};

export const OpportunitySkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs animate-pulse flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-100 rounded w-1/4" />
        </div>
      </div>
      <div className="h-5 bg-slate-200 rounded w-3/4" />
      <div className="h-12 bg-slate-100 rounded w-full" />
      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <div className="h-5 bg-slate-200 rounded-full w-20" />
        <div className="h-5 bg-slate-200 rounded-full w-24" />
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
    <div className="bg-white rounded-2xl border border-slate-200/90 p-10 text-center max-w-md mx-auto my-8 shadow-xs">
      <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
        {icon || <SearchX className="w-7 h-7 text-slate-400" />}
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
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
        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
            className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${
              isActive
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {page}
          </button>
        );
      })}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};
