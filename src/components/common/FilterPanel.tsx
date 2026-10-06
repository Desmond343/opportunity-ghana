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
          <Filter className="w-4 h-4 text-[#006B3F]" />
          <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider">Filters</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-[#5F6368] hover:text-[#006B3F] transition-colors"
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
          <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2.5">
            Category
          </label>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => onFilterChange({ ...filters, category: 'All' })}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                !filters.category || filters.category === 'All'
                  ? 'bg-[#006B3F] text-white font-bold shadow-2xs'
                  : 'text-[#111111] hover:bg-[#E6F0EB] hover:text-[#006B3F]'
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
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    active
                      ? 'bg-[#006B3F] text-white font-bold shadow-2xs'
                      : 'text-[#111111] hover:bg-[#E6F0EB] hover:text-[#006B3F]'
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
          <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
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
                className={`px-2 py-1.5 rounded-lg font-medium text-left transition-all ${
                  (filters.locationType === loc.id || (!filters.locationType && loc.id === 'all'))
                    ? 'bg-[#006B3F] text-white font-bold'
                    : 'bg-[#F7F9F8] text-slate-700 hover:bg-[#E6F0EB]'
                }`}
              >
                {loc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Region Filter */}
        <div className="py-4">
          <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
            Ghana Region
          </label>
          <select
            value={filters.region || 'All Ghana'}
            onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
            className="w-full text-xs font-medium text-[#111111] bg-[#F7F9F8] border border-[#E5E7EB] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#006B3F]"
          >
            {GHANA_REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Work Arrangement Filter (Remote / Hybrid / On-site) */}
        <div className="py-4">
          <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
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
                className={`px-2 py-1.5 rounded-lg font-medium text-left transition-all ${
                  (filters.workArrangement === arr.id || (!filters.workArrangement && arr.id === 'All'))
                    ? 'bg-[#006B3F] text-white font-bold'
                    : 'bg-[#F7F9F8] text-slate-700 hover:bg-[#E6F0EB]'
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
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
              Employment Type
            </label>
            <select
              value={filters.employmentType || 'All'}
              onChange={(e) => onFilterChange({ ...filters, employmentType: e.target.value === 'All' ? undefined : e.target.value })}
              className="w-full text-xs font-medium text-[#111111] bg-[#F7F9F8] border border-[#E5E7EB] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#006B3F]"
            >
              <option value="All">All Employment Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Graduate Programme">Graduate Trainee Programme</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        )}

        {/* Internship Compensation Filter (For Internships) */}
        {(!filters.category || filters.category === 'All' || filters.category === 'Internships') && (
          <div className="py-4">
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
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
                  className={`px-2 py-1.5 rounded-lg font-medium text-left transition-all ${
                    (filters.internshipType === comp.id || (!filters.internshipType && comp.id === 'All'))
                      ? 'bg-[#006B3F] text-white font-bold'
                      : 'bg-[#F7F9F8] text-slate-700 hover:bg-[#E6F0EB]'
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
          <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
            Experience Level
          </label>
          <select
            value={filters.experienceLevel || 'All'}
            onChange={(e) => onFilterChange({ ...filters, experienceLevel: e.target.value === 'All' ? undefined : e.target.value })}
            className="w-full text-xs font-medium text-[#111111] bg-[#F7F9F8] border border-[#E5E7EB] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#006B3F]"
          >
            <option value="All">All Experience Levels</option>
            <option value="Student">Student / Recent Graduate</option>
            <option value="Entry">Entry Level (0–2 years)</option>
            <option value="Mid">Mid Level (3–5 years)</option>
            <option value="Senior">Senior / Specialist (5+ years)</option>
          </select>
        </div>

        {/* Funding Type Filter */}
        <div className="py-4">
          <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
            Funding Type (Scholarships / Grants)
          </label>
          <select
            value={filters.fundingType || 'All'}
            onChange={(e) => onFilterChange({ ...filters, fundingType: e.target.value === 'All' ? undefined : e.target.value })}
            className="w-full text-xs font-medium text-[#111111] bg-[#F7F9F8] border border-[#E5E7EB] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#006B3F]"
          >
            <option value="All">All Funding Types</option>
            <option value="Fully Funded">Fully Funded (100% Coverage)</option>
            <option value="Partially Funded">Partially Funded</option>
            <option value="Grant">Direct Grants & Seed Capital</option>
            <option value="Tuition Only">Tuition Only</option>
            <option value="Stipend">Stipend / Living Allowance</option>
          </select>
        </div>

        {/* Study Level Filter */}
        <div className="py-4">
          <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
            Study / Target Level
          </label>
          <select
            value={filters.studyLevel || 'All'}
            onChange={(e) => onFilterChange({ ...filters, studyLevel: e.target.value === 'All' ? undefined : e.target.value })}
            className="w-full text-xs font-medium text-[#111111] bg-[#F7F9F8] border border-[#E5E7EB] rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#006B3F]"
          >
            <option value="All">All Study Levels</option>
            <option value="Undergraduate">Undergraduate (BSc, BA, WASSCE)</option>
            <option value="Master's">Master's (MSc, MA, MBA, MPhil)</option>
            <option value="PhD">PhD / Doctoral</option>
            <option value="Fellowship">Fellowship & Leadership</option>
            <option value="Research">Research & Postdoctoral</option>
          </select>
        </div>

        {/* Ghanaian Eligibility Toggle */}
        <div className="py-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#006B3F]">
            <input
              type="checkbox"
              checked={filters.isGhanaEligible || false}
              onChange={(e) => onFilterChange({ ...filters, isGhanaEligible: e.target.checked ? true : undefined })}
              className="rounded text-[#006B3F] focus:ring-[#006B3F] w-4 h-4"
            />
            <span>🇬🇭 Eligible for Ghanaians Only</span>
          </label>
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
