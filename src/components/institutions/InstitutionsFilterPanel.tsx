import React from 'react';
import { Filter, X, RotateCcw, Check, Building2, MapPin, Calendar, ShieldCheck, BookOpen } from 'lucide-react';
import { GHANA_REGIONS, INSTITUTION_TYPES } from '../../data/institutions';

export interface InstitutionFilterState {
  search: string;
  type: string;
  locationScope: 'all' | 'accra' | 'ashanti' | 'other';
  region: string;
  admissionStatus: 'all' | 'open' | 'closing_soon' | 'saved';
  accreditation: 'all' | 'gtec' | 'chartered';
  programmeField: string;
}

interface InstitutionsFilterPanelProps {
  filters: InstitutionFilterState;
  onFilterChange: (newFilters: InstitutionFilterState) => void;
  onReset: () => void;
  onCloseMobile?: () => void;
  savedCount?: number;
  className?: string;
}

export const PROGRAMME_FIELDS = [
  { id: 'all', label: 'All Fields' },
  { id: 'computing', label: '💻 Tech & Computing', keyword: 'computer' },
  { id: 'medicine', label: '🏥 Medicine & Health', keyword: 'medicine' },
  { id: 'engineering', label: '⚙️ Engineering', keyword: 'engineering' },
  { id: 'business', label: '💼 Business & Finance', keyword: 'business' },
  { id: 'law', label: '⚖️ Law (LLB)', keyword: 'law' },
  { id: 'education', label: '📚 Education & Teaching', keyword: 'education' },
  { id: 'nursing', label: '🩺 Nursing & Midwifery', keyword: 'nursing' },
];

export const InstitutionsFilterPanel: React.FC<InstitutionsFilterPanelProps> = ({
  filters,
  onFilterChange,
  onReset,
  onCloseMobile,
  savedCount = 0,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-[#141B29] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs transition-colors ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-[#111111] dark:text-slate-100 uppercase tracking-wider font-space">
            Filters
          </h3>
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
        {/* Filter 1: Institution Type */}
        <div className="py-4">
          <label className="block text-xs font-bold text-[#111111] dark:text-slate-200 uppercase tracking-wider mb-2.5 font-space">
            Institution Type
          </label>
          <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
            {INSTITUTION_TYPES.map((type) => {
              const active = filters.type === type;
              return (
                <button
                  key={type}
                  onClick={() => onFilterChange({ ...filters, type })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#006B3F] text-white font-bold shadow-2xs'
                      : 'text-[#111111] dark:text-slate-300 hover:bg-[#E6F0EB] dark:hover:bg-slate-800 hover:text-[#006B3F] dark:hover:text-emerald-400'
                  }`}
                >
                  <span className="truncate">{type}</span>
                  {active && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter 2: Location Scope */}
        <div className="py-4">
          <label className="block text-xs font-bold text-[#111111] dark:text-slate-200 uppercase tracking-wider mb-2 font-space">
            Location Scope
          </label>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {[
              { id: 'all', label: 'All Locations' },
              { id: 'accra', label: '🇬🇭 Greater Accra' },
              { id: 'ashanti', label: '🇬🇭 Ashanti' },
              { id: 'other', label: '🇬🇭 Other Regions' }
            ].map((loc) => {
              const active = filters.locationScope === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, locationScope: loc.id as any })}
                  className={`px-2 py-1.5 rounded-lg font-medium text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-[#006B3F] text-white font-bold shadow-2xs'
                      : 'bg-[#F7F9F8] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#E6F0EB] dark:hover:bg-slate-700'
                  }`}
                >
                  {loc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter 3: Ghana Region Dropdown */}
        <div className="py-4">
          <label className="block text-xs font-bold text-[#111111] dark:text-slate-200 uppercase tracking-wider mb-2 font-space">
            Ghana Region
          </label>
          <select
            value={filters.region}
            onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
            className="w-full text-xs font-medium text-[#111111] dark:text-slate-200 bg-[#F7F9F8] dark:bg-slate-800/90 border border-[#E5E7EB] dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#006B3F] cursor-pointer"
          >
            {GHANA_REGIONS.map((region) => (
              <option key={region} value={region} className="dark:bg-slate-900 dark:text-slate-100">
                {region === 'All Regions' ? 'All Ghana Regions' : `${region} Region`}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 4: Admissions Status */}
        <div className="py-4">
          <label className="block text-xs font-bold text-[#111111] dark:text-slate-200 uppercase tracking-wider mb-2 font-space">
            Admissions Status
          </label>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {[
              { id: 'all', label: 'All Admissions' },
              { id: 'open', label: '🟢 Open Now' },
              { id: 'closing_soon', label: '⏳ Closing Soon' },
              { id: 'saved', label: `🔖 Saved (${savedCount})` }
            ].map((st) => {
              const active = filters.admissionStatus === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, admissionStatus: st.id as any })}
                  className={`px-2 py-1.5 rounded-lg font-medium text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-[#006B3F] text-white font-bold shadow-2xs'
                      : 'bg-[#F7F9F8] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#E6F0EB] dark:hover:bg-slate-700'
                  }`}
                >
                  {st.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter 5: Accreditation & Charter */}
        <div className="py-4">
          <label className="block text-xs font-bold text-[#111111] dark:text-slate-200 uppercase tracking-wider mb-2 font-space">
            Accreditation & Charter
          </label>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'gtec', label: '🛡️ GTEC Accredited' },
              { id: 'chartered', label: '📜 Chartered' }
            ].map((acc) => {
              const active = filters.accreditation === acc.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => onFilterChange({ ...filters, accreditation: acc.id as any })}
                  className={`px-2 py-1.5 rounded-lg font-medium text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-[#006B3F] text-white font-bold shadow-2xs'
                      : 'bg-[#F7F9F8] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#E6F0EB] dark:hover:bg-slate-700'
                  }`}
                >
                  {acc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter 6: Popular Programmes / Fields */}
        <div className="py-4">
          <label className="block text-xs font-bold text-[#111111] dark:text-slate-200 uppercase tracking-wider mb-2 font-space">
            Field of Study
          </label>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {PROGRAMME_FIELDS.map((field) => {
              const active = filters.programmeField === field.id;
              return (
                <button
                  key={field.id}
                  onClick={() => onFilterChange({ ...filters, programmeField: field.id })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#006B3F] text-white font-bold shadow-2xs'
                      : 'text-[#111111] dark:text-slate-300 hover:bg-[#E6F0EB] dark:hover:bg-slate-800 hover:text-[#006B3F] dark:hover:text-emerald-400'
                  }`}
                >
                  <span>{field.label}</span>
                  {active && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
