import React from 'react';
import { Filter, X, RotateCcw, Check } from 'lucide-react';
import { OPPORTUNITY_CATEGORIES, GHANA_REGIONS, EDUCATION_LEVELS } from '../../data/categories';
import { OpportunityFilters } from '../../services/opportunitiesService';

interface FilterPanelProps {
  filters: OpportunityFilters;
  onFilterChange: (newFilters: OpportunityFilters) => void;
  onReset: () => void;
  onCloseMobile?: () => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onReset,
  onCloseMobile,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {/* Category Filter */}
        <div className="py-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            Category
          </label>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => onFilterChange({ ...filters, category: 'All' })}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                !filters.category || filters.category === 'All'
                  ? 'bg-emerald-50 text-emerald-800 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>All Categories</span>
              {(!filters.category || filters.category === 'All') && (
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              )}
            </button>
            {OPPORTUNITY_CATEGORIES.map((cat) => {
              const active = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onFilterChange({ ...filters, category: cat.id })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    active
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat.name}</span>
                  {active && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Region Filter */}
        <div className="py-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Location / Region
          </label>
          <select
            value={filters.region || 'All Ghana'}
            onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
            className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {GHANA_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Education Level */}
        <div className="py-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Education Level
          </label>
          <select
            value={filters.educationLevel || 'All Education Levels'}
            onChange={(e) => onFilterChange({ ...filters, educationLevel: e.target.value })}
            className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {EDUCATION_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Verification Status */}
        <div className="py-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Source Verification
          </label>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="radio"
                name="verification"
                checked={!filters.verificationStatus}
                onChange={() => onFilterChange({ ...filters, verificationStatus: undefined })}
                className="text-emerald-700 focus:ring-emerald-600"
              />
              All Records (Demo & Verified)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="radio"
                name="verification"
                checked={filters.verificationStatus === 'verified'}
                onChange={() => onFilterChange({ ...filters, verificationStatus: 'verified' })}
                className="text-emerald-700 focus:ring-emerald-600"
              />
              Verified Only
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
