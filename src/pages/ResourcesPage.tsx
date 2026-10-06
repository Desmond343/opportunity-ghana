import React, { useState, useEffect } from 'react';
import { Resource } from '../types/database';
import { ResourcesService, ResourceFilters } from '../services/resourcesService';
import { ResourceCard } from '../components/cards/ResourceCard';
import { RESOURCE_CATEGORIES } from '../data/categories';
import { EmptyState, LoadingState } from '../components/common/CommonUI';
import { BookOpen, Award, CheckCircle2, SlidersHorizontal, Sparkles, ShieldCheck, DollarSign, ExternalLink, HelpCircle } from 'lucide-react';

interface ResourcesPageProps {
  onNavigate: (path: string) => void;
  initialType?: string;
  initialFree?: boolean;
  initialPaid?: boolean;
  initialOpenSubmit?: boolean;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({
  onNavigate,
  initialType = 'All',
  initialFree = false,
  initialPaid = false,
  initialOpenSubmit = false
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [costFilter, setCostFilter] = useState<'all' | 'paid' | 'free'>(
    initialPaid ? 'paid' : initialFree ? 'free' : 'all'
  );
  const [selectedPricingModel, setSelectedPricingModel] = useState<string>('All');
  const [onlyCert, setOnlyCert] = useState<boolean>(false);

  useEffect(() => {
    if (initialOpenSubmit) {
      onNavigate('/resources/submit');
    }
  }, [initialOpenSubmit, onNavigate]);

  useEffect(() => {
    async function loadResources() {
      setLoading(true);
      try {
        const filters: ResourceFilters = {
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          resourceType: selectedType !== 'All' ? selectedType : undefined,
          isFree: costFilter === 'free' ? true : costFilter === 'paid' ? false : undefined,
          pricingModel: selectedPricingModel !== 'All' ? selectedPricingModel : undefined,
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
  }, [selectedType, selectedCategory, searchTerm, costFilter, selectedPricingModel, onlyCert]);

  const resourceTypes = [
    { id: 'All', label: 'All Formats' },
    { id: 'certification', label: 'Certifications' },
    { id: 'course', label: 'Courses' },
    { id: 'bootcamp', label: 'Bootcamps' }
  ];

  const pricingModels = [
    { id: 'All', label: 'All Pricing Models' },
    { id: 'one-time', label: 'One-Time Payment / Exam' },
    { id: 'monthly', label: 'Monthly Subscription' },
    { id: 'per-course', label: 'Tiered / Per-Course' },
    { id: 'per-exam', label: 'Per-Exam Paper' }
  ];

  const paidCount = resources.filter(r => !r.isFree).length;
  const freeCount = resources.filter(r => r.isFree).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#006B3F]" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#006B3F] font-space">
              Verified Training & Credentials
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-space">
            Courses, Certifications & Professional Training
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Discover verified paid and free online courses, cloud certifications, and executive masterclasses. All paid courses feature transparent costs, official syllabi, and verified accessibility for learners in Ghana.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/resources/submit')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors shrink-0 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>Submit a Course</span>
        </button>
      </div>

      {/* Main Cost Filter Tabs: All vs Paid Courses vs Free */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex flex-wrap items-center gap-1.5 border border-slate-200/80">
        <button
          onClick={() => {
            setCostFilter('all');
            setSelectedPricingModel('All');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            costFilter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Programs ({resources.length})
        </button>

        <button
          onClick={() => setCostFilter('paid')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            costFilter === 'paid'
              ? 'bg-[#006B3F] text-white shadow-xs'
              : 'text-slate-700 hover:text-[#006B3F] hover:bg-white/60'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
          <span>Verified Paid Courses & Certifications</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
            costFilter === 'paid' ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {paidCount > 0 ? paidCount : '12+'}
          </span>
        </button>

        <button
          onClick={() => {
            setCostFilter('free');
            setSelectedPricingModel('All');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            costFilter === 'free'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-700 hover:text-emerald-700 hover:bg-white/60'
          }`}
        >
          <span>100% Free Tuition</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
            costFilter === 'free' ? 'bg-emerald-900 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            Free
          </span>
        </button>
      </div>

      {/* Trust & Transparency Guarantee Callout (Visible for Paid Courses) */}
      {costFilter === 'paid' && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 rounded-2xl p-5 text-white border border-emerald-800/40 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-space text-white">
                  Opportunity Ghana Paid Course Standards
                </h3>
                <p className="text-xs text-slate-300">
                  Every paid course is verified for authentic provider identity, transparent fee structures, certificate value, and Ghana payment compatibility.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#FCD116] bg-white/10 px-3 py-1 rounded-lg border border-white/10 shrink-0 self-start sm:self-auto font-mono">
              Zero Hidden Fees Guaranteed
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Official Global Providers (AWS, Google, PMI, Harvard)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Upfront Prices (USD / GBP / GHS)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Financial Aid & Discount Notes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Accessible to Learners in Ghana</span>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Transparency Guarantee Callout (Visible for Free Courses) */}
      {costFilter === 'free' && (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 rounded-2xl p-5 text-white border border-emerald-800/40 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-space text-white">
                  Opportunity Ghana Verified Free Courses Standard
                </h3>
                <p className="text-xs text-slate-300">
                  Every free course is verified against the official provider to guarantee 100% free curriculum access, transparent certificate options, and full accessibility for learners in Ghana.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#FCD116] bg-white/10 px-3 py-1 rounded-lg border border-white/10 shrink-0 self-start sm:self-auto font-mono">
              100% Free Tuition Verified
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>World-Class Providers (Harvard, MIT, Cisco, Google, OpenWHO)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Direct Official Enrollment Links</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Transparent Cert Badges (Free vs Audit)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>No Credit Card Required to Learn</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {resourceTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedType === type.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {type.label}
          </button>
        ))}

        {costFilter === 'paid' && (
          <div className="flex items-center gap-2 ml-0 sm:ml-4">
            <span className="text-xs text-slate-400 font-medium">Model:</span>
            <select
              value={selectedPricingModel}
              onChange={(e) => setSelectedPricingModel(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {pricingModels.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setOnlyCert(!onlyCert)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              onlyCert
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-indigo-800 border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            <Award className="w-3.5 h-3.5 inline mr-1" />
            Certificate Included
          </button>
        </div>
      </div>

      {/* Search Input and Category Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Search verified courses, certifications or skills (e.g. AWS, Python, Scrum, Cybersecurity, ACCA)..."
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

      {/* Results Count Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2">
        <span>
          Showing <strong className="text-slate-800">{resources.length}</strong>{' '}
          {costFilter === 'paid' ? 'verified paid training programs' : costFilter === 'free' ? 'free courses' : 'learning resources'}
        </span>
        {(selectedType !== 'All' || selectedCategory !== 'All' || searchTerm || costFilter !== 'all' || selectedPricingModel !== 'All' || onlyCert) && (
          <button
            onClick={() => {
              setSelectedType('All');
              setSelectedCategory('All');
              setSearchTerm('');
              setCostFilter('all');
              setSelectedPricingModel('All');
              setOnlyCert(false);
            }}
            className="text-emerald-700 hover:underline font-semibold cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingState message="Loading verified courses..." />
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
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
          title="No courses match your search"
          description="Try adjusting your keyword or clearing the filters to view all verified programs."
          actionText="Reset All Filters"
          onAction={() => {
            setSelectedType('All');
            setSelectedCategory('All');
            setSearchTerm('');
            setCostFilter('all');
            setSelectedPricingModel('All');
            setOnlyCert(false);
          }}
        />
      )}
    </div>
  );
};
