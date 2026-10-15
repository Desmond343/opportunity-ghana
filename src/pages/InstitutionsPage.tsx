import React, { useState, useMemo, useEffect } from 'react';
import { InstitutionsService } from '../services/institutionsService';
import { SavedService } from '../services/savedService';
import { InstitutionCard } from '../components/institutions/InstitutionCard';
import {
  InstitutionsFilterPanel,
  InstitutionFilterState,
  PROGRAMME_FIELDS
} from '../components/institutions/InstitutionsFilterPanel';
import { Pagination, EmptyState } from '../components/common/CommonUI';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  GraduationCap,
  Sparkles,
  Building2,
  ShieldCheck,
  Check
} from 'lucide-react';

interface InstitutionsPageProps {
  onNavigate: (path: string) => void;
  initialType?: string;
  initialRegion?: string;
  initialSearch?: string;
}

export const InstitutionsPage: React.FC<InstitutionsPageProps> = ({
  onNavigate,
  initialType = 'All Types',
  initialRegion = 'All Regions',
  initialSearch = ''
}) => {
  const [filters, setFilters] = useState<InstitutionFilterState>({
    search: initialSearch,
    type: initialType,
    locationScope: 'all',
    region: initialRegion,
    admissionStatus: 'all',
    accreditation: 'all',
    programmeField: 'all'
  });

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'closing_soonest' | 'name_asc' | 'open_first'>('closing_soonest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    return Array.from(new Set([...SavedService.getSavedIds(), ...InstitutionsService.getSavedIds()]));
  });

  const rawInstitutions = useMemo(() => {
    return InstitutionsService.getAll();
  }, []);

  useEffect(() => {
    const refreshSaved = () => {
      setSavedIds(Array.from(new Set([...SavedService.getSavedIds(), ...InstitutionsService.getSavedIds()])));
    };
    refreshSaved();
    window.addEventListener('saved-opportunities-changed', refreshSaved);
    return () => window.removeEventListener('saved-opportunities-changed', refreshSaved);
  }, []);

  // Filter institutions based on state
  const filteredInstitutions = useMemo(() => {
    let result = rawInstitutions.filter((inst) => {
      // 1. Text Search
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchName = inst.name.toLowerCase().includes(q);
        const matchShort = inst.shortName.toLowerCase().includes(q);
        const matchCity = inst.location.city.toLowerCase().includes(q);
        const matchRegion = inst.location.region.toLowerCase().includes(q);
        const matchCampus = (inst.location.campus || '').toLowerCase().includes(q);
        const matchType = (inst.institutionType || '').toLowerCase().includes(q);
        const matchProg = inst.programmesSummary?.featuredProgrammes?.some((p) =>
          p.name.toLowerCase().includes(q)
        );
        if (!matchName && !matchShort && !matchCity && !matchRegion && !matchCampus && !matchType && !matchProg) {
          return false;
        }
      }

      // 2. Institution Type
      if (filters.type !== 'All Types' && inst.institutionType !== filters.type) {
        return false;
      }

      // 3. Location Scope
      if (filters.locationScope !== 'all') {
        const reg = (inst.location.region || '').toLowerCase();
        if (filters.locationScope === 'accra' && !reg.includes('greater accra')) {
          return false;
        }
        if (filters.locationScope === 'ashanti' && !reg.includes('ashanti')) {
          return false;
        }
        if (filters.locationScope === 'other' && (reg.includes('greater accra') || reg.includes('ashanti'))) {
          return false;
        }
      }

      // 4. Ghana Region Dropdown
      if (
        filters.region !== 'All Regions' &&
        inst.location.region !== filters.region &&
        !inst.location.region.includes(filters.region)
      ) {
        return false;
      }

      // 5. Admissions Status
      if (filters.admissionStatus !== 'all') {
        if (filters.admissionStatus === 'open' && inst.overallAdmissionStatus !== 'OPEN') {
          return false;
        }
        if (filters.admissionStatus === 'closing_soon' && inst.overallAdmissionStatus !== 'CLOSING_SOON') {
          return false;
        }
        if (filters.admissionStatus === 'saved' && !savedIds.includes(inst.id)) {
          return false;
        }
      }

      // 6. Accreditation & Charter
      if (filters.accreditation === 'chartered' && !inst.isChartered) {
        return false;
      }
      if (filters.accreditation === 'gtec' && inst.accreditationStatus !== 'FULLY_ACCREDITED') {
        return false;
      }

      // 7. Field of Study / Programme
      if (filters.programmeField !== 'all') {
        const fieldItem = PROGRAMME_FIELDS.find((f) => f.id === filters.programmeField);
        if (fieldItem && fieldItem.keyword) {
          const kw = fieldItem.keyword.toLowerCase();
          const hasField = inst.programmesSummary?.featuredProgrammes?.some(
            (p) => p.name.toLowerCase().includes(kw) || p.faculty.toLowerCase().includes(kw)
          );
          if (!hasField) return false;
        }
      }

      return true;
    });

    // In-memory Sorting
    result.sort((a, b) => {
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'open_first') {
        const score = (st: string) => (st === 'OPEN' ? 2 : st === 'CLOSING_SOON' ? 1 : 0);
        return score(b.overallAdmissionStatus) - score(a.overallAdmissionStatus);
      }
      // default: 'closing_soonest'
      const nearestA = InstitutionsService.getNearestActiveDeadline(a);
      const nearestB = InstitutionsService.getNearestActiveDeadline(b);

      if (nearestA && !nearestB) return -1;
      if (!nearestA && nearestB) return 1;
      if (nearestA && nearestB) {
        return nearestA.deadlineInfo.diffMs - nearestB.deadlineInfo.diffMs;
      }
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [rawInstitutions, filters, sortBy, savedIds]);

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: 'All Types',
      locationScope: 'all',
      region: 'All Regions',
      admissionStatus: 'all',
      accreditation: 'all',
      programmeField: 'all'
    });
    setCurrentPage(1);
  };

  const handleToggleSave = () => {
    setSavedIds(Array.from(new Set([...SavedService.getSavedIds(), ...InstitutionsService.getSavedIds()])));
  };

  const isFilterActive =
    Boolean(filters.search.trim()) ||
    filters.type !== 'All Types' ||
    filters.locationScope !== 'all' ||
    filters.region !== 'All Regions' ||
    filters.admissionStatus !== 'all' ||
    filters.accreditation !== 'all' ||
    filters.programmeField !== 'all';

  const totalPages = Math.ceil(filteredInstitutions.length / itemsPerPage) || 1;
  const displayedItems = filteredInstitutions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* ========================================================================= */}
      {/* Top Banner / Heading (Matching OpportunitiesPage / Internships Layout)   */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-[#006B3F] dark:text-emerald-300 border border-[#006B3F]/20 dark:border-emerald-600/30">
              GTEC Accredited Master Source Directory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-space">
            Accredited Tertiary Institutions & Admissions in Ghana
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Research, verify, and apply to accredited public traditional universities, technical universities, chartered private institutions, and colleges across Ghana.
          </p>
        </div>

        {/* Sort selector & Mobile filter toggle */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="closing_soonest" className="dark:bg-slate-900 dark:text-slate-100">
                Closing Soonest
              </option>
              <option value="name_asc" className="dark:bg-slate-900 dark:text-slate-100">
                Name (A–Z)
              </option>
              <option value="open_first" className="dark:bg-slate-900 dark:text-slate-100">
                Admissions Open First
              </option>
            </select>
          </div>

          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#006B3F] dark:text-emerald-400" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Search Bar (Matching SearchBar on /internships)                            */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#141B29] rounded-2xl shadow-sm border border-[#E5E7EB] dark:border-slate-800 p-2 md:p-2.5 transition-all focus-within:ring-2 focus-within:ring-[#006B3F]/25 dark:focus-within:ring-emerald-500/25 focus-within:border-[#006B3F] dark:focus-within:border-emerald-600">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Quick Scope selector */}
          <div className="relative border-b sm:border-b-0 sm:border-r border-[#E5E7EB] dark:border-slate-800 pb-2 sm:pb-0 sm:pr-2">
            <select
              value={filters.type}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, type: e.target.value }));
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto text-xs font-semibold text-[#111111] dark:text-slate-100 bg-transparent pl-3 pr-8 py-2 rounded-xl focus:outline-none cursor-pointer hover:bg-[#F7F9F8] dark:hover:bg-slate-800/60 transition-colors"
            >
              <option value="All Types" className="dark:bg-slate-900 dark:text-slate-100">
                All Institution Types
              </option>
              <option value="Public Traditional University" className="dark:bg-slate-900 dark:text-slate-100">
                Public Traditional Universities
              </option>
              <option value="Public Technical University" className="dark:bg-slate-900 dark:text-slate-100">
                Technical Universities
              </option>
              <option value="Chartered Private University" className="dark:bg-slate-900 dark:text-slate-100">
                Chartered Private Universities
              </option>
              <option value="Public College of Education" className="dark:bg-slate-900 dark:text-slate-100">
                Colleges of Education (PRINCOF)
              </option>
              <option value="Public Nursing & Health Training College" className="dark:bg-slate-900 dark:text-slate-100">
                Nursing & Health Colleges (MOH)
              </option>
            </select>
          </div>

          {/* Text Input */}
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 ml-2 mr-2 shrink-0" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Search institution name, acronym (e.g. UG, KNUST, UCC), city, or programme..."
              className="w-full text-sm text-[#111111] dark:text-slate-100 placeholder-[#737373] dark:placeholder-slate-400 bg-transparent py-1.5 focus:outline-none"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, search: '' }));
                  setCurrentPage(1);
                }}
                className="p-1 text-[#737373] dark:text-slate-400 hover:text-[#111111] dark:hover:text-slate-100 rounded-md cursor-pointer mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E5E7EB] dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#5F6368] dark:text-slate-300 hover:text-[#111111] dark:hover:text-white hover:bg-[#F7F9F8] dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#5F6368] dark:text-slate-400" />
              <span>Filters</span>
            </button>
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Main Layout: Filters Sidebar + Results Grid (4 Columns Grid)              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <InstitutionsFilterPanel
            filters={filters}
            onFilterChange={(newF) => {
              setFilters(newF);
              setCurrentPage(1);
            }}
            onReset={handleResetFilters}
            savedCount={savedIds.length}
          />
        </div>

        {/* Mobile Filter Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl p-2 shadow-2xl">
              <InstitutionsFilterPanel
                filters={filters}
                onFilterChange={(newF) => {
                  setFilters(newF);
                  setCurrentPage(1);
                }}
                onReset={handleResetFilters}
                onCloseMobile={() => setMobileFilterOpen(false)}
                savedCount={savedIds.length}
              />
              <div className="p-3">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-2.5 bg-[#006B3F] hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Apply Filters ({filteredInstitutions.length} Results)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Listing Area */}
        <div className="lg:col-span-3 space-y-5">
          {/* Result count stats bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing <strong className="text-slate-800 dark:text-slate-200">{displayedItems.length}</strong> of{' '}
              <strong className="text-slate-800 dark:text-slate-200">{filteredInstitutions.length}</strong> tertiary institutions
            </span>
            {isFilterActive && (
              <button
                onClick={handleResetFilters}
                className="text-[#006B3F] dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Institution Cards Grid */}
          {displayedItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {displayedItems.map((institution) => (
                  <InstitutionCard
                    key={institution.id}
                    institution={institution}
                    onNavigate={onNavigate}
                    isSaved={savedIds.includes(institution.id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>

              {/* Pagination matching OpportunitiesPage */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <EmptyState
              title="No matching tertiary institutions"
              description="We couldn't find any institutions matching your selected filters. Try widening your region, choosing all institution types, or clearing your search term."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
};
