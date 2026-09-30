import React, { useState, useEffect } from 'react';
import { Resource } from '../types/database';
import { ResourcesService, ResourceFilters } from '../services/resourcesService';
import { ResourceCard } from '../components/cards/ResourceCard';
import { SearchBar } from '../components/common/SearchBar';
import { RESOURCE_CATEGORIES } from '../data/categories';
import { EmptyState, LoadingState } from '../components/common/CommonUI';
import { BookOpen, Award, CheckCircle2, SlidersHorizontal, Sparkles } from 'lucide-react';

interface ResourcesPageProps {
  onNavigate: (path: string) => void;
  initialType?: string;
  initialFree?: boolean;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({
  onNavigate,
  initialType = 'All',
  initialFree = false
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [onlyFree, setOnlyFree] = useState<boolean>(initialFree);
  const [onlyCert, setOnlyCert] = useState<boolean>(false);

  useEffect(() => {
    async function loadResources() {
      setLoading(true);
      try {
        const filters: ResourceFilters = {
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          resourceType: selectedType !== 'All' ? selectedType : undefined,
          isFree: onlyFree ? true : undefined,
          hasCertificate: onlyCert ? true : undefined,
          search: searchTerm
        };
        const results = await ResourcesService.getAll(filters);
        setResources(results);
      } catch (err) {
        console.error('Failed to load resources', err);
      } finally {
        setLoading(false);
      }
    }

    loadResources();
  }, [selectedType, selectedCategory, searchTerm, onlyFree, onlyCert]);

  const resourceTypes = [
    { id: 'All', label: 'All Resources' },
    { id: 'course', label: 'Courses' },
    { id: 'bootcamp', label: 'Bootcamps' },
    { id: 'certification', label: 'Certifications' },
    { id: 'workshop', label: 'Workshops' },
    { id: 'training', label: 'Training' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-space">
          Courses, Bootcamps & Learning Resources
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Acquire verified technical and professional skills aligned with top Ghanaian employers. Catalog of vetted free courses, university certificates, and practical cohorts.
        </p>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {resourceTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedType === type.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {type.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setOnlyFree(!onlyFree)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              onlyFree
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            Free Only
          </button>
          <button
            onClick={() => setOnlyCert(!onlyCert)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              onlyCert
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-indigo-800 border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            Certificate Included
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Search skills (e.g. React, Python, Accounting, SQL)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="All">All Categories</option>
            {RESOURCE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingState message="Loading learning resources..." />
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No learning resources match your search"
          description="Try selecting a different category or clearing the 'Free only' filter."
          actionText="Reset Resource Filters"
          onAction={() => {
            setSelectedType('All');
            setSelectedCategory('All');
            setSearchTerm('');
            setOnlyFree(false);
            setOnlyCert(false);
          }}
        />
      )}
    </div>
  );
};
