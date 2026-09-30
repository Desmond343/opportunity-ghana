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
      className={`bg-white rounded-2xl shadow-sm border border-slate-200/90 transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-600 ${
        compact ? 'p-1.5' : 'p-2 md:p-2.5'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Category selector */}
        <div className="relative border-b sm:border-b-0 sm:border-r border-slate-200/80 pb-2 sm:pb-0 sm:pr-2">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              onSearch(term, e.target.value);
            }}
            className="w-full sm:w-auto text-xs font-semibold text-slate-700 bg-transparent pl-3 pr-8 py-2 rounded-xl focus:outline-none cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <option value="All">All Categories</option>
            {OPPORTUNITY_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Text Input */}
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-slate-400 ml-2 mr-2 shrink-0" />
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={placeholder}
            className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent py-1.5 focus:outline-none"
          />
          {term && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {showFiltersButton && onToggleFilter && (
            <button
              type="button"
              onClick={onToggleFilter}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              title="Filter opportunities"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Filters</span>
            </button>
          )}
          <button
            type="submit"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </form>
  );
};
