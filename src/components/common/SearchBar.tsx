import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

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
  placeholder = 'Search by opportunity title, organisation, or category...'
}) => {
  const [term, setTerm] = useState(initialSearch);

  useEffect(() => {
    setTerm(initialSearch);
  }, [initialSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(term, initialCategory);
  };

  const handleClear = () => {
    setTerm('');
    onSearch('', initialCategory);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-[#141B29] rounded-xl border border-slate-200 dark:border-slate-800 p-1.5 flex items-center gap-2 focus-within:border-[#006B3F] dark:focus-within:border-emerald-500 transition-colors"
    >
      <div className="relative flex-1 flex items-center pl-2.5">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={placeholder}
          aria-label="Search opportunities"
          className="w-full pl-2 pr-8 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 bg-transparent focus:outline-none"
        />
        {term && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-1 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <button
        type="submit"
        className="px-4 py-2 min-h-[40px] text-xs sm:text-sm font-semibold text-white bg-[#006B3F] hover:bg-[#005632] rounded-lg transition-colors shrink-0 cursor-pointer"
      >
        Search
      </button>
    </form>
  );
};
