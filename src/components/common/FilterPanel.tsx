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
    <div className={`bg-white dark:bg-[#141B29] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs transition-colors ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-[#111111] dark:text-slate-100 uppercase tracking-wider">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-[#5F6368] dark:text-slate-400 hover:text-[#006B3F] dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {/* Category Filter */}
        <div className="py-4">
          <label className="block text-xs font-bold text-[#111111] dark:text-slate-200 uppercase tracking-wider mb-2.5">
            Category
          </label>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => onFilterChange({ ...filters, category: 'All' })}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                !filters.category || filters.category === 'All'
                  ? 'bg-[#006B3F] text-white font-bold shadow-2xs'
                  : 'text-[#111111] dark:text-slate-300 hover:bg-[#E6F0EB] dark:hover:bg-slate-800 hover:text-[#006B3F] dark:hover:text-emerald-400'
              }`}
            >
              <span>All Categories</span>
              {(!filters.category || filters.category === 'All') && (
                <Check className="w-3.5 h-3.5 text-white" />
              )}
            </button>
            {OPPORTUNITY_CATEGORIES.map((cat) => {
              const active = filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onFilterChange({ ...filters, category: cat.id })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#006B3F] text-white font-bold shadow-2xs'
                      : 'text-[#111111] dark:text-slate-300 hover:bg-[#E6F0EB] dark:hover:bg-slate-800 hover:text-[#006B3F] dark:hover:text-emerald-400'
                  }`}
                >
                  <span>{cat.name}</span>
                  {active && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location Scope (Ghana vs Abroad vs Online) */}
        <div className="py-4">
          <label className="block text-xs font-bold text-[#111111] dark:text-slate-200 uppercase tracking-wider mb-2">
            Location Scope
          </label>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {[
              { id: 'all', label: 'All Locations' },
              { id: 'ghana', label: '🇬🇭 In Ghana' },
              { id: 'abroad', label: '🌍 Abroad' },
              { id: 'online', label: '💻 Online / Remote' }
            ].map(loc => (
              <button
                key={loc.id}
                type="button"
                onClick={() => onFilterChange({ ...filters, locationType: loc.id === 'all' ? undefined : loc.id })}
                className={`px-2 py-1.5 rounded-lg font-medium text-left transition-all cursor-pointer ${
                  (filters.locationType === loc.id || (!filters.locationType && loc.id === 'all'))
                    ? 'bg-[#006B3F] text-white font-bold'
                    : 'bg-[#F7F9F8] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#E6F0EB] dark:hover:bg-slate-700'
                }`}
              >
                {loc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Region Filter */}
        <div className="py-4">
          <label className="block text-xs font-bold text-[#111111] dark:text-slate-200 uppercase tracking-wider mb-2">
            Ghana Region
          </label>
          <select
            value={filters.region || 'All Ghana'}
            onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
            className="w-full text-xs font-medium text-[#111111] dark:text-slate-200 bg-[#F7F9F8] dark:bg-slate-800/90 border border-[#E5E7EB] dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#006B3F] cursor-pointer"
          >
            {GHANA_REGIONS.map((region) => (
              <option key={region} value={region} className="dark:bg-slate-900 dark:text-slate-100">
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Work Arrangement Filter (Remote / Hybrid / On-site) */}
        <div className="py-4">
          <label className="block text-xs font-bold text-[#111111] dark:text-slate-200 uppercase tracking-wider mb-2">
            Work Arrangement
          </label>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {[
              { id: 'All', label: 'All Types' },
              { id: 'On-site', label: '🏢 On-site' },
              { id: 'Hybrid', label: '🔄 Hybrid' },
              { id: 'Remote', label: '🌐 Remote' }
            ].map((arr) => (
              <button
                key={arr.id}
                type="button"
                onClick={() => onFilterChange({ ...filters, workArrangement: arr.id === 'All' ? undefined : arr.id })}
                className={`px-2 py-1.5 rounded-lg font-medium text-left transition-all cursor-pointer ${
                  (filters.workArrangement === arr.id || (!filters.workArrangement && arr.id === 'All'))
                    ? 'bg-[#006B3F] text-white font-bold'
                    : 'bg-[#F7F9F8] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#E6F0EB] dark:hover:bg-slate-700'
                }`}
              >
                {arr.label}
              </button>
            ))}
          </div>
        </div>

        {/* Employment Type Filter (For Jobs) */}
        {(!filters.category || filters.category === 'All' || filters.category === 'Jobs') && (
          <div className="py-4">
            <label className="block text-xs font-bold text-[#111111] dark:text-slate-200 uppercase tracking-wider mb-2">
              Employment Type
            </label>
            <select
              value={filters.employmentType || 'All'}
              onChange={(e) => onFilterChange({ ...filters, employmentType: e.target.value === 'All' ? undefined : e.target.value })}
              className="w-full text-xs font-medium text-[#111111] dark:text-slate-200 bg-[#F7F9F8] dark:bg-slate-800/90 border border-[#E5E7EB] dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#006B3F] cursor-pointer"
            >
              <option value="All" className="dark:bg-slate-900 dark:text-slate-100">All Employment Types</option>
              <option value="Full-time" className="dark:bg-slate-900 dark:text-slate-100">Full-time</option>
              <option value="Part-time" className="dark:bg-slate-900 dark:text-slate-100">Part-time</option>
              <option value="Contract" className="dark:bg-slate-900 dark:text-slate-100">Contract</option>
              <option value="Graduate Programme" className="dark:bg-slate-900 dark:text-slate-100">Graduate Trainee Programme</option>
              <option value="Internship" className="dark:bg-slate-900 dark:text-slate-100">Internship</option>
            </select>
          </div>
        )}

        {/* Internship Compensation Filter (For Internships) */}
        {(!filters.category || filters.category === 'All' || filters.category === 'Internships') && (
          <div className="py-4">
            <label className="block text-xs font-bold text-[#111111] dark:text-slate-200 uppercase tracking-wider mb-2">
              Internship Compensation
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { id: 'All', label: 'All Internships' },
                { id: 'Paid', label: '💰 Paid Only' },
                { id: 'Unpaid', label: '📄 Unpaid' }
              ].map((comp) => (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, internshipType: comp.id === 'All' ? undefined : comp.id })}
                  className={`px-2 py-1.5 rounded-lg font-medium text-left transition-all cursor-pointer ${
                    (filters.internshipType === comp.id || (!filters.internshipType && comp.id === 'All'))
                      ? 'bg-[#006B3F] text-white font-bold'
                      : 'bg-[#F7F9F8] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#E6F0EB] dark:hover:bg-slate-700'
                  }`}
                >
                  {comp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Experience Level Filter */}
        <div className="py-4">
          <label className="block text-xs font-bold text-[#111111] dark:text-slate-200 uppercase tracking-wider mb-2">
            Experience Level
          </label>
          <select
            value={filters.experienceLevel || 'All'}
            onChange={(e) => onFilterChange({ ...filters, experienceLevel: e.target.value === 'All' ? undefined : e.target.value })}
            className="w-full text-xs font-medium text-[#111111] dark:text-slate-200 bg-[#F7F9F8] dark:bg-slate-800/90 border border-[#E5E7EB] dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#006B3F] cursor-pointer"
          >
            <option value="All" className="dark:bg-slate-900 dark:text-slate-100">All Experience Levels</option>
            <option value="Student" className="dark:bg-slate-900 dark:text-slate-100">Student / Recent Graduate</option>
            <option value="Entry" className="dark:bg-slate-900 dark:text-slate-100">Entry Level (0–2 years)</option>
            <option value="Mid" className="dark:bg-slate-900 dark:text-slate-100">Mid Level (3–5 years)</option>
            <option value="Senior" className="dark:bg-slate-900 dark:text-slate-100">Senior / Specialist (5+ years)</option>
          </select>
        </div>

        {/* Funding Type Filter */}
        <div className="py-4">
          <label className="block text-xs font-bold text-[#111111] dark:text-slate-200 uppercase tracking-wider mb-2">
            Funding Type (Scholarships / Grants)
          </label>
          <select
            value={filters.fundingType || 'All'}
            onChange={(e) => onFilterChange({ ...filters, fundingType: e.target.value === 'All' ? undefined : e.target.value })}
            className="w-full text-xs font-medium text-[#111111] dark:text-slate-200 bg-[#F7F9F8] dark:bg-slate-800/90 border border-[#E5E7EB] dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#006B3F] cursor-pointer"
          >
            <option value="All" className="dark:bg-slate-900 dark:text-slate-100">All Funding Types</option>
            <option value="Fully Funded" className="dark:bg-slate-900 dark:text-slate-100">Fully Funded (100% Coverage)</option>
            <option value="Partially Funded" className="dark:bg-slate-900 dark:text-slate-100">Partially Funded</option>
            <option value="Grant" className="dark:bg-slate-900 dark:text-slate-100">Direct Grants & Seed Capital</option>
            <option value="Tuition Only" className="dark:bg-slate-900 dark:text-slate-100">Tuition Only</option>
            <option value="Stipend" className="dark:bg-slate-900 dark:text-slate-100">Stipend / Living Allowance</option>
          </select>
        </div>

        {/* Study Level Filter */}
        <div className="py-4">
          <label className="block text-xs font-bold text-[#111111] dark:text-slate-200 uppercase tracking-wider mb-2">
            Study / Target Level
          </label>
          <select
            value={filters.studyLevel || 'All'}
            onChange={(e) => onFilterChange({ ...filters, studyLevel: e.target.value === 'All' ? undefined : e.target.value })}
            className="w-full text-xs font-medium text-[#111111] dark:text-slate-200 bg-[#F7F9F8] dark:bg-slate-800/90 border border-[#E5E7EB] dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#006B3F] cursor-pointer"
          >
            <option value="All" className="dark:bg-slate-900 dark:text-slate-100">All Study Levels</option>
            <option value="Undergraduate" className="dark:bg-slate-900 dark:text-slate-100">Undergraduate (BSc, BA, WASSCE)</option>
            <option value="Master's" className="dark:bg-slate-900 dark:text-slate-100">Master's (MSc, MA, MBA, MPhil)</option>
            <option value="PhD" className="dark:bg-slate-900 dark:text-slate-100">PhD / Doctoral</option>
            <option value="Fellowship" className="dark:bg-slate-900 dark:text-slate-100">Fellowship & Leadership</option>
            <option value="Research" className="dark:bg-slate-900 dark:text-slate-100">Research & Postdoctoral</option>
          </select>
        </div>

        {/* Ghanaian Eligibility Toggle */}
        <div className="py-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#006B3F] dark:text-emerald-400">
            <input
              type="checkbox"
              checked={filters.isGhanaEligible || false}
              onChange={(e) => onFilterChange({ ...filters, isGhanaEligible: e.target.checked ? true : undefined })}
              className="rounded text-[#006B3F] focus:ring-[#006B3F] w-4 h-4 cursor-pointer"
            />
            <span>🇬🇭 Eligible for Ghanaians Only</span>
          </label>
        </div>

        {/* Verification Status */}
        <div className="py-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Source Verification
          </label>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                name="verification"
                checked={!filters.verificationStatus}
                onChange={() => onFilterChange({ ...filters, verificationStatus: undefined })}
                className="text-emerald-700 focus:ring-emerald-600 cursor-pointer"
              />
              All Records (Demo & Verified)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                name="verification"
                checked={filters.verificationStatus === 'verified'}
                onChange={() => onFilterChange({ ...filters, verificationStatus: 'verified' })}
                className="text-emerald-700 focus:ring-emerald-600 cursor-pointer"
              />
              Verified Only
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
