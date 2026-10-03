import React, { useState, useMemo } from 'react';
import { InstitutionsService } from '../services/institutionsService';
import { InstitutionCard } from '../components/institutions/InstitutionCard';
import { GHANA_REGIONS, INSTITUTION_TYPES } from '../data/institutions';
import {
  GraduationCap,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  Calendar,
  X,
  Clock,
  Sparkles,
  ExternalLink,
  BookOpen,
  Info
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
  initialSearch = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [admissionStatusFilter, setAdmissionStatusFilter] = useState<string>('All');
  const [savedIds, setSavedIds] = useState<string[]>(() => InstitutionsService.getSavedIds());

  const institutions = useMemo(() => {
    return InstitutionsService.getAll();
  }, []);

  const handleToggleSave = (id: string) => {
    InstitutionsService.toggleSave(id);
    setSavedIds(InstitutionsService.getSavedIds());
  };

  const filteredInstitutions = useMemo(() => {
    return institutions.filter((inst) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = inst.name.toLowerCase().includes(q);
        const matchShort = inst.shortName.toLowerCase().includes(q);
        const matchCity = inst.location.city.toLowerCase().includes(q);
        const matchRegion = inst.location.region.toLowerCase().includes(q);
        const matchProg = inst.programmesSummary.featuredProgrammes.some((p) =>
          p.name.toLowerCase().includes(q)
        );
        if (!matchName && !matchShort && !matchCity && !matchRegion && !matchProg) {
          return false;
        }
      }

      // 2. Type
      if (selectedType !== 'All Types' && inst.institutionType !== selectedType) {
        return false;
      }

      // 3. Region
      if (
        selectedRegion !== 'All Regions' &&
        inst.location.region !== selectedRegion &&
        !inst.location.region.includes(selectedRegion)
      ) {
        return false;
      }

      // 4. Admission Status
      if (admissionStatusFilter !== 'All') {
        if (admissionStatusFilter === 'OPEN' && inst.overallAdmissionStatus !== 'OPEN') {
          return false;
        }
        if (admissionStatusFilter === 'CLOSING_SOON' && inst.overallAdmissionStatus !== 'CLOSING_SOON') {
          return false;
        }
        if (admissionStatusFilter === 'SAVED') {
          return savedIds.includes(inst.id);
        }
      }

      return true;
    });
  }, [institutions, searchQuery, selectedType, selectedRegion, admissionStatusFilter, savedIds]);

  const openCount = institutions.filter((i) => i.overallAdmissionStatus === 'OPEN').length;
  const closingSoonCount = institutions.filter((i) => i.overallAdmissionStatus === 'CLOSING_SOON').length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 rounded-2xl p-6 sm:p-8 md:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
            <img
              src="/images/institutions/ug_students_workshop.jpg"
              alt=""
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-[center_25%] opacity-20 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-slate-900/80 to-emerald-950/65" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              GTEC Accredited Master Source Directory
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Tertiary Institutions & Admissions in Ghana
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              Research, verify, and apply to accredited public universities, technical universities, chartered private institutions, colleges of education, and nursing training colleges in Ghana.
            </p>

            {/* Quick Stats Pill */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>{institutions.length} Verified Institutions</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{openCount} Admissions Currently Open</span>
              </div>
              {closingSoonCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 text-amber-200">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{closingSoonCount} Closing Soon</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Regulatory Master Source Notice */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-sky-900 leading-relaxed">
            <span className="font-bold">Official Regulatory Standards:</span> All institutions in this directory are verified against the Ghana Tertiary Education Commission (GTEC) register established under the Education Regulatory Bodies Act, 2020 (Act 1023). Admission deadlines and countdowns are dynamically updated. Never pay fees to unverified individuals; purchase e-vouchers only via authorized banks or official USSD short codes.
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search institution name, acronym (e.g. UG, KNUST), city, or programme..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Institution Type Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full py-2.5 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                {INSTITUTION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full py-2.5 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                {GHANA_REGIONS.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            {/* Admission Status Filter */}
            <div className="md:col-span-2">
              <select
                value={admissionStatusFilter}
                onChange={(e) => setAdmissionStatusFilter(e.target.value)}
                className="w-full py-2.5 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-medium"
              >
                <option value="All">All Admissions</option>
                <option value="OPEN">Admissions Open</option>
                <option value="CLOSING_SOON">Closing Soon</option>
                <option value="SAVED">Saved ({savedIds.length})</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500 font-medium mr-1">Quick Select:</span>
              <button
                onClick={() => {
                  setSelectedType('Public Traditional University');
                  setSelectedRegion('All Regions');
                  setAdmissionStatusFilter('All');
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedType === 'Public Traditional University'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Public Universities
              </button>
              <button
                onClick={() => {
                  setSelectedType('Public Technical University');
                  setSelectedRegion('All Regions');
                  setAdmissionStatusFilter('All');
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedType === 'Public Technical University'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Technical Universities
              </button>
              <button
                onClick={() => {
                  setSelectedType('Chartered Private University');
                  setSelectedRegion('All Regions');
                  setAdmissionStatusFilter('All');
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedType === 'Chartered Private University'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Chartered Private
              </button>
              <button
                onClick={() => {
                  setSelectedType('Public College of Education');
                  setSelectedRegion('All Regions');
                  setAdmissionStatusFilter('All');
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedType === 'Public College of Education'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Colleges of Education (PRINCOF)
              </button>
              <button
                onClick={() => {
                  setSelectedType('Public Nursing & Health Training College');
                  setSelectedRegion('All Regions');
                  setAdmissionStatusFilter('All');
                }}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedType === 'Public Nursing & Health Training College'
                    ? 'bg-emerald-600 text-white font-medium'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Nursing & Midwifery (MOH)
              </button>
            </div>

            {(selectedType !== 'All Types' ||
              selectedRegion !== 'All Regions' ||
              admissionStatusFilter !== 'All' ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedType('All Types');
                  setSelectedRegion('All Regions');
                  setAdmissionStatusFilter('All');
                  setSearchQuery('');
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-slate-700">
            Showing {filteredInstitutions.length} of {institutions.length} tertiary institutions
          </p>
        </div>

        {/* Institutions Grid */}
        {filteredInstitutions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInstitutions.map((institution) => (
              <InstitutionCard
                key={institution.id}
                institution={institution}
                onNavigate={onNavigate}
                isSaved={savedIds.includes(institution.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">No institutions match your search</h3>
            <p className="text-xs text-slate-500 mb-4">
              Try adjusting your query, region, or institution type filter to discover more verified options.
            </p>
            <button
              onClick={() => {
                setSelectedType('All Types');
                setSelectedRegion('All Regions');
                setAdmissionStatusFilter('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
