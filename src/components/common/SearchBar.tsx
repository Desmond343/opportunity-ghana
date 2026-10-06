import React, { useState } from 'react';
import { Search, X, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { OPPORTUNITY_CATEGORIES } from '../../data/categories';

interface SearchBarProps {
  initialSearch?: string;
  initialCategory?: string;
  onSearch: (searchTerm: string, category: string) => void;
  onToggleFilter?: () => void;
  showFiltersButton?: boolean;
  placeholder?: string;
  compact?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialSearch = '',
  initialCategory = 'All',
  onSearch,
  onToggleFilter,
  showFiltersButton = true,
  placeholder = 'Search jobs, scholarships, courses, internships in Ghana...',
  compact = false
}) => {
  const [term, setTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(term, selectedCategory);
  };

  const handleClear = () => {
    setTerm('');
    onSearch('', selectedCategory);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white dark:bg-[#141B29] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-slate-800 transition-all focus-within:ring-2 focus-within:ring-[#006B3F]/25 dark:focus-within:ring-emerald-500/25 focus-within:border-[#006B3F] dark:focus-within:border-emerald-600 ${
        compact ? 'p-1.5' : 'p-2 md:p-2.5'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Category selector */}
        <div className="relative border-b sm:border-b-0 sm:border-r border-[#E5E7EB] dark:border-slate-800 pb-2 sm:pb-0 sm:pr-2">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              onSearch(term, e.target.value);
            }}
            className="w-full sm:w-auto text-xs font-semibold text-[#111111] dark:text-slate-100 bg-transparent pl-3 pr-8 py-2 rounded-xl focus:outline-none cursor-pointer hover:bg-[#F7F9F8] dark:hover:bg-slate-800/60 transition-colors"
          >
            <option value="All" className="dark:bg-slate-900 dark:text-slate-100">All Categories</option>
            {OPPORTUNITY_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id} className="dark:bg-slate-900 dark:text-slate-100">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Text Input */}
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 ml-2 mr-2 shrink-0" />
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full text-sm text-[#111111] dark:text-slate-100 placeholder-[#737373] dark:placeholder-slate-400 bg-transparent py-1.5 focus:outline-none"
          />
          {term && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-[#737373] dark:text-slate-400 hover:text-[#111111] dark:hover:text-slate-100 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E5E7EB] dark:border-slate-800">
          {showFiltersButton && onToggleFilter && (
            <button
              type="button"
              onClick={onToggleFilter}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#5F6368] dark:text-slate-300 hover:text-[#111111] dark:hover:text-white hover:bg-[#F7F9F8] dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
              title="Filter opportunities"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#5F6368] dark:text-slate-400" />
              <span className="hidden md:inline">Filters</span>
            </button>
          )}
          <button
            type="submit"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#006B3F] hover:bg-[#005632] rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </form>
  );
};
