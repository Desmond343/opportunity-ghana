import React, { useState, useEffect } from 'react';
import { Opportunity } from '../types/database';
import { OpportunitiesService, OpportunityFilters } from '../services/opportunitiesService';
import { calculateDeadlineInfo } from '../services/deadlineService';
import { OpportunityCard } from '../components/cards/OpportunityCard';
import { OpportunitySlideshow } from '../components/home/OpportunitySlideshow';
import { SearchBar } from '../components/common/SearchBar';
import { FilterPanel } from '../components/common/FilterPanel';
import { Pagination, EmptyState, OpportunitySkeleton } from '../components/common/CommonUI';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

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
    setFilters((prev) => ({
      ...prev,
      category: initialCategory,
      search: initialQuery
    }));
  }, [initialCategory, initialQuery]);

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
  const featuredScholarshipSlides = opportunities
    .filter((o) => o.category === 'Scholarships' && (o.featuredInSlideshow || o.featured))
    .slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="editorial-heading-1 text-[#111111] dark:text-slate-100 font-serif">
            {filters.category === 'Jobs'
              ? 'Verified Jobs in Ghana & Remote Roles'
              : filters.category === 'Internships'
              ? 'Internships & Graduate Placements'
              : filters.category === 'Scholarships'
              ? 'Verified Scholarships for Ghanaian Students'
              : filters.category === 'Admissions'
              ? 'Tertiary Admissions & University Portals in Ghana'
              : filters.category === 'Entrepreneurship'
              ? 'Entrepreneurship, Startup Pitch & Innovation Challenges'
              : filters.category === 'Graduate Programmes'
              ? 'Graduate Trainee Programmes & Entry-Level Schemes'
              : filters.category === 'Government Programmes'
              ? 'Government Initiatives, Public Sector Funds & National Schemes'
              : filters.category === 'Competitions'
              ? 'Academic, STEM, Entrepreneurship & Cultural Competitions'
              : filters.category === 'Grants'
              ? 'Grants, Seed Funds & Research Awards'
              : filters.category === 'Fellowships'
              ? 'Prestigious Fellowships & Leadership Residencies'
              : filters.category === 'Study Abroad'
              ? 'Study Abroad Opportunities & International Mobility'
              : filters.category === 'Training'
              ? 'Practical Workforce Training, Upskilling & Bootcamps'
              : 'Browse Opportunities'}
          </h1>
          <p className="editorial-supporting text-slate-600 dark:text-slate-300 mt-1.5 font-serif max-w-3xl">
            {filters.category === 'Jobs'
              ? 'Current, verified employment opportunities with verified employer career portals and Ghanaian eligibility.'
              : filters.category === 'Internships'
              ? 'Explore vetted attachments, paid internships, NSS placements, and graduate development schemes.'
              : filters.category === 'Scholarships'
              ? 'Search verified academic funding, fellowships, and study abroad grants for Ghanaians.'
              : filters.category === 'Admissions'
              ? 'Official entry windows, e-voucher requirements, and admission deadlines for accredited Ghanaian universities, technical universities, and colleges.'
              : filters.category === 'Entrepreneurship'
              ? 'Explore funding opportunities, venture capital pitches, incubators, accelerators, and startup competitions across Ghana.'
              : filters.category === 'Graduate Programmes'
              ? 'Discover corporate management trainee fast-tracks, rotational programmes, and postgraduate development pathways.'
              : filters.category === 'Government Programmes'
              ? 'Verified opportunities from Ghana public ministries, statutory agencies, GEA, NEIP, and public educational bodies.'
              : filters.category === 'Competitions'
              ? 'Participate in national hackathons, debate tournaments, business plan challenges, and talent contests.'
              : filters.category === 'Grants'
              ? 'Non-repayable funding for Ghanaian entrepreneurs, innovators, researchers, and community organizations.'
              : filters.category === 'Fellowships'
              ? 'Global and regional professional development, civic leadership, and research fellowships.'
              : filters.category === 'Study Abroad'
              ? 'Discover international degree scholarships, Erasmus+, Chevening, Commonwealth, and overseas study opportunities for Ghanaians.'
              : filters.category === 'Training'
              ? 'Explore capacity building cohorts, vocational workshops, and tech training programmes.'
              : 'Search verified jobs, scholarships, internships, grants, and training across Ghana.'}
          </p>
        </div>

        {/* Sort & mobile filter toggle */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="deadline" className="dark:bg-slate-900 dark:text-slate-100">Closing Soonest</option>
              <option value="newest" className="dark:bg-slate-900 dark:text-slate-100">Newly Published</option>
            </select>
          </div>

          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            Filters
          </button>
        </div>
      </div>

      {/* Featured Scholarships Hero Showcase (when viewing Scholarships without active search filter) */}
      {filters.category === 'Scholarships' && !filters.search && featuredScholarshipSlides.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006B3F] dark:bg-emerald-400" />
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#006B3F] dark:text-emerald-400 font-space">
              Featured Scholarship Spotlight
            </h2>
          </div>
          <OpportunitySlideshow
            opportunities={featuredScholarshipSlides}
            onNavigate={onNavigate}
            loading={loading}
          />
        </div>
      )}

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
          <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-800 rounded-3xl p-2 shadow-2xl">
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
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs cursor-pointer"
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
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing <strong className="text-slate-800 dark:text-slate-200">{displayedItems.length}</strong> of{' '}
              <strong className="text-slate-800 dark:text-slate-200">{opportunities.length}</strong> opportunities
            </span>
            {(filters.category !== 'All' || filters.search || filters.region !== 'All Ghana') && (
              <button
                onClick={handleResetFilters}
                className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <OpportunitySkeleton key={i} />
              ))}
            </div>
          ) : displayedItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
