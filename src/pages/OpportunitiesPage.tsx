import React, { useState, useEffect } from 'react';
import { Opportunity } from '../types/database';
import { OpportunitiesService, OpportunityFilters } from '../services/opportunitiesService';
import { calculateDeadlineInfo } from '../services/deadlineService';
import { OpportunityCard } from '../components/cards/OpportunityCard';
import { SearchBar } from '../components/common/SearchBar';
import { FilterPanel } from '../components/common/FilterPanel';
import { Pagination, EmptyState, OpportunitySkeleton } from '../components/common/CommonUI';
import { Filter, SlidersHorizontal, ArrowUpDown, Sparkles } from 'lucide-react';

interface OpportunitiesPageProps {
  onNavigate: (path: string) => void;
  initialQuery?: string;
  initialCategory?: string;
}

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({
  onNavigate,
  initialQuery = '',
  initialCategory = 'All'
}) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'deadline' | 'newest'>('deadline');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [filters, setFilters] = useState<OpportunityFilters>({
    search: initialQuery,
    category: initialCategory,
    region: 'All Ghana',
    educationLevel: 'All Education Levels'
  });

  useEffect(() => {
    async function fetchOpportunities() {
      setLoading(true);
      try {
        const results = await OpportunitiesService.getAll({
          ...filters,
          onlyActive: true
        });

        // Apply in-memory sort
        if (sortBy === 'deadline') {
          results.sort((a, b) => {
            const infoA = calculateDeadlineInfo(a.deadline);
            const infoB = calculateDeadlineInfo(b.deadline);

            // Active open deadlines come first
            if (infoA.isClosed !== infoB.isClosed) {
              return infoA.isClosed ? 1 : -1;
            }
            // Definite deadlines before rolling basis
            if ((infoA.status === 'rolling') !== (infoB.status === 'rolling')) {
              return infoA.status === 'rolling' ? 1 : -1;
            }
            // Sort ascending by remaining milliseconds
            return infoA.diffMs - infoB.diffMs;
          });
        } else {
          results.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
        }

        setOpportunities(results);
        setCurrentPage(1);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunities();
  }, [filters, sortBy]);

  const handleSearch = (term: string, cat: string) => {
    setFilters((prev) => ({
      ...prev,
      search: term,
      category: cat
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      region: 'All Ghana',
      educationLevel: 'All Education Levels',
      verificationStatus: undefined
    });
  };

  const totalPages = Math.ceil(opportunities.length / itemsPerPage);
  const displayedItems = opportunities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-space">
            Browse Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search verified jobs, scholarships, internships, grants, and training across Ghana.
          </p>
        </div>

        {/* Sort, mobile filter toggle & Submit Opportunity CTA */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => onNavigate('/opportunities/submit')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#006B3F] hover:bg-[#005530] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FCD116]" />
            <span>Submit an Opportunity</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="deadline">Closing Soonest</option>
              <option value="newest">Newly Published</option>
            </select>
          </div>

          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
            Filters
          </button>
        </div>
      </div>

      {/* Search Bar Bar */}
      <SearchBar
        initialSearch={filters.search}
        initialCategory={filters.category}
        onSearch={handleSearch}
        onToggleFilter={() => setMobileFilterOpen(true)}
        showFiltersButton={false}
      />

      {/* Main Layout: Filters + Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-2 shadow-2xl">
              <FilterPanel
                filters={filters}
                onFilterChange={(f) => {
                  setFilters(f);
                }}
                onReset={handleResetFilters}
                onCloseMobile={() => setMobileFilterOpen(false)}
              />
              <div className="p-3">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs"
                >
                  Apply Filters ({opportunities.length} Results)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-5">
          {/* Result count stats */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{displayedItems.length}</strong> of{' '}
              <strong className="text-slate-800">{opportunities.length}</strong> opportunities
            </span>
            {(filters.category !== 'All' || filters.search || filters.region !== 'All Ghana') && (
              <button
                onClick={handleResetFilters}
                className="text-emerald-700 font-semibold hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <OpportunitySkeleton key={i} />
              ))}
            </div>
          ) : displayedItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedItems.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <EmptyState
              title="No matching opportunities"
              description="We couldn't find any opportunities matching your current filters. Try widening your location or search terms."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          )}
        </div>
      </div>
    </div>
  );
};
