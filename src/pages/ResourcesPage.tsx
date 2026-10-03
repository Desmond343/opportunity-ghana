import React, { useState, useEffect } from 'react';
import { Resource } from '../types/database';
import { ResourcesService, ResourceFilters } from '../services/resourcesService';
import { ResourceCard } from '../components/cards/ResourceCard';
import { RESOURCE_CATEGORIES } from '../data/categories';
import { EmptyState, LoadingState } from '../components/common/CommonUI';
import {
  Award,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Globe,
  Search
} from 'lucide-react';

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
  const [allCount, setAllCount] = useState<{ total: number; free: number; paid: number; freeCert: number }>({
    total: 0,
    free: 0,
    paid: 0,
    freeCert: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedFreeStatus, setSelectedFreeStatus] = useState<string>('All');
  const [selectedCertStatus, setSelectedCertStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [costFilter, setCostFilter] = useState<'all' | 'paid' | 'free'>(
    initialPaid ? 'paid' : initialFree ? 'free' : 'all'
  );
  const [selectedPricingModel, setSelectedPricingModel] = useState<string>('All');

  useEffect(() => {
    setCostFilter(initialPaid ? 'paid' : initialFree ? 'free' : 'all');
  }, [initialFree, initialPaid]);

  useEffect(() => {
    if (initialOpenSubmit) {
      onNavigate('/resources/submit');
    }
  }, [initialOpenSubmit, onNavigate]);

  // Load summary counts once
  useEffect(() => {
    ResourcesService.getAll().then((all) => {
      const freeItems = all.filter((r) => r.isFree);
      const paidItems = all.filter((r) => !r.isFree);
      const freeCertItems = freeItems.filter(
        (r) => r.certificateStatus === 'free_certificate' || (r.hasCertificate && r.certificateStatus !== 'paid_certificate')
      );
      setAllCount({
        total: all.length,
        free: freeItems.length,
        paid: paidItems.length,
        freeCert: freeCertItems.length
      });
    });
  }, []);

  useEffect(() => {
    async function loadResources() {
      setLoading(true);
      try {
        const filters: ResourceFilters = {
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          resourceType: selectedType !== 'All' ? selectedType : undefined,
          isFree: costFilter === 'free' ? true : costFilter === 'paid' ? false : undefined,
          freeStatus: selectedFreeStatus !== 'All' ? selectedFreeStatus : undefined,
          certificateStatus: selectedCertStatus !== 'All' ? selectedCertStatus : undefined,
          level: selectedLevel !== 'All' ? selectedLevel : undefined,
          pricingModel: selectedPricingModel !== 'All' ? selectedPricingModel : undefined,
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
  }, [
    selectedType,
    selectedCategory,
    selectedLevel,
    selectedFreeStatus,
    selectedCertStatus,
    searchTerm,
    costFilter,
    selectedPricingModel
  ]);

  const resourceTypes = [
    { id: 'All', label: 'All Formats' },
    { id: 'course', label: 'Online Courses' },
    { id: 'certification', label: 'Certifications' },
    { id: 'training', label: 'Skills Training' },
    { id: 'bootcamp', label: 'Bootcamps' }
  ];

  const pricingModels = [
    { id: 'All', label: 'All Pricing Models' },
    { id: 'one-time', label: 'One-Time Payment / Exam' },
    { id: 'monthly', label: 'Monthly Subscription' },
    { id: 'per-course', label: 'Tiered / Per-Course' },
    { id: 'per-exam', label: 'Per-Exam Paper' }
  ];

  const resetAllFilters = () => {
    setSelectedType('All');
    setSelectedCategory('All');
    setSelectedLevel('All');
    setSelectedFreeStatus('All');
    setSelectedCertStatus('All');
    setSearchTerm('');
    setCostFilter('all');
    setSelectedPricingModel('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#006B3F] mb-1">
            <span>Verified Free &amp; Professional Courses</span>
            <span aria-hidden="true">·</span>
            <span>Ghana Accessible</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-space">
            {costFilter === 'free'
              ? 'Verified Free Online Courses & Certificates'
              : costFilter === 'paid'
              ? 'Verified Professional Certifications & Paid Courses'
              : 'Free Online Courses, Certifications & Career Training'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Discover genuinely free online courses and accredited professional certifications from Harvard, MIT, freeCodeCamp, Cisco, Google, IBM, HubSpot, UN FAO, and Jobberman Ghana—each verified for certificate policy, duration, and direct access for learners in Ghana.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/resources/submit')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#006B3F] hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors shrink-0 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-[#FCD116]" />
          <span>Submit a Course</span>
        </button>
      </div>

      {/* Main Cost Filter Tabs: All vs Free Courses vs Paid Courses */}
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
          All Courses &amp; Programs ({allCount.total || resources.length})
        </button>

        <button
          onClick={() => {
            setCostFilter('free');
            setSelectedPricingModel('All');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            costFilter === 'free'
              ? 'bg-[#006B3F] text-white shadow-xs'
              : 'text-slate-700 hover:text-[#006B3F] hover:bg-white/60'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Verified Free Courses</span>
          <span
            className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono tabular-nums ${
              costFilter === 'free' ? 'bg-emerald-900 text-[#FCD116]' : 'bg-emerald-100 text-emerald-900'
            }`}
          >
            {allCount.free || '34'}
          </span>
        </button>

        <button
          onClick={() => {
            setCostFilter('paid');
            setSelectedFreeStatus('All');
            setSelectedCertStatus('All');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            costFilter === 'paid'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Paid Certifications</span>
          <span
            className={`text-[11px] px-1.5 py-0.5 rounded-md font-mono tabular-nums ${
              costFilter === 'paid' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {allCount.paid || '12'}
          </span>
        </button>
      </div>

      {/* Free Courses Transparency & Verification Banner */}
      {costFilter === 'free' && (
        <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#FCD116]">
                <ShieldCheck className="w-4 h-4" />
                <span>Opportunity Ghana Free Course Verification Standard</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold font-space text-white">
                How We Verify &amp; Classify Every Free Course
              </h2>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                We never list temporary free trials as free courses. Every course below is verified directly against the official provider and classified transparently so you know whether the certificate is free, paid, or not provided.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                onClick={() =>
                  setSelectedCertStatus(selectedCertStatus === 'free_certificate' ? 'All' : 'free_certificate')
                }
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                  selectedCertStatus === 'free_certificate'
                    ? 'bg-[#FCD116] text-slate-950 border-[#FCD116]'
                    : 'bg-white/10 text-white border-white/15 hover:bg-white/15'
                }`}
              >
                Free Course + Free Certificate ({allCount.freeCert || '19'})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-white/10 text-xs">
            <div className="space-y-1">
              <p className="font-bold text-emerald-400">1. Course: Free · Certificate: Free</p>
              <p className="text-slate-300 leading-relaxed">
                100% free tuition and a free official certificate or digital credential upon completion (e.g., freeCodeCamp, Harvard CS50 OpenCourseWare, Cisco, Google Skillshop, HubSpot, UN FAO, Jobberman Ghana).
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-amber-300">2. Course: Free to Audit · Certificate: Paid</p>
              <p className="text-slate-300 leading-relaxed">
                Full access to university lectures and readings at zero cost by selecting &ldquo;Audit&rdquo;, with an optional paid verified certificate (e.g., Yale, UVA, UNC on Coursera).
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-200">3. Course: Free · Certificate: Not provided</p>
              <p className="text-slate-300 leading-relaxed">
                Completely free open-access curriculum focused purely on practical mastery without a certificate (e.g., MIT OpenCourseWare, Khan Academy, Figma Learn, Google Technical Writing).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Paid Courses Transparency Callout */}
      {costFilter === 'paid' && (
        <div className="bg-slate-900 rounded-2xl p-5 text-white border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-bold font-space text-white">
                Opportunity Ghana Paid Course Standards
              </h3>
              <p className="text-xs text-slate-300">
                Every paid certification is verified for authentic provider identity, upfront fee structure, and Ghana examination/payment compatibility.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#FCD116] font-mono">
              Transparent Official Pricing
            </span>
          </div>
        </div>
      )}

      {/* Search Input and Primary Dropdown Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search courses, providers, or skills (e.g. Python, CS50, Digital Marketing, Agribusiness, Power BI)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#006B3F]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-[#006B3F]"
            >
              <option value="All">All Categories ({RESOURCE_CATEGORIES.length})</option>
              {RESOURCE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedCertStatus}
              onChange={(e) => setSelectedCertStatus(e.target.value)}
              aria-label="Filter by certificate status"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-[#006B3F]"
            >
              <option value="All">All Certificate Types</option>
              <option value="free_certificate">Certificate: Free</option>
              <option value="paid_certificate">Certificate: Paid</option>
              <option value="no_certificate">Certificate: Not provided</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              aria-label="Filter by course level"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-[#006B3F]"
            >
              <option value="All">All Skill Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="All Levels">All Levels</option>
            </select>
          </div>
        </div>

        {/* Secondary Interactive Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            {resourceTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedType === type.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          {costFilter !== 'paid' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium mr-1">Access Type:</span>
              {[
                { id: 'All', label: 'All Free Models' },
                { id: 'completely_free', label: 'Completely Free' },
                { id: 'free_to_audit', label: 'Free to Audit' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedFreeStatus(mode.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedFreeStatus === mode.id
                      ? 'bg-[#006B3F] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          )}

          {costFilter === 'paid' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Billing Model:</span>
              <select
                value={selectedPricingModel}
                onChange={(e) => setSelectedPricingModel(e.target.value)}
                className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
              >
                {pricingModels.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Results Count Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-slate-900 font-mono tabular-nums">{resources.length}</strong>{' '}
            {costFilter === 'paid'
              ? 'verified paid courses & certifications'
              : costFilter === 'free'
              ? 'verified free online courses'
              : 'verified learning resources'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
            <Globe className="w-3.5 h-3.5 text-[#006B3F]" />
            <span>Verified for learners in Ghana</span>
          </span>
        </div>

        {(selectedType !== 'All' ||
          selectedCategory !== 'All' ||
          selectedLevel !== 'All' ||
          selectedFreeStatus !== 'All' ||
          selectedCertStatus !== 'All' ||
          searchTerm ||
          costFilter !== 'all' ||
          selectedPricingModel !== 'All') && (
          <button
            onClick={resetAllFilters}
            className="text-[#006B3F] hover:underline font-semibold cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingState message="Loading verified courses..." />
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
          title="No courses match your current filters"
          description="Try adjusting your keyword, category, or certificate filter to view all verified courses."
          actionText="Reset All Filters"
          onAction={resetAllFilters}
        />
      )}
    </div>
  );
};
