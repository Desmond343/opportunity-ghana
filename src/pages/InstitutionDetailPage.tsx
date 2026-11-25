import React, { useEffect, useMemo, useState } from 'react';
import { InstitutionsService } from '../services/institutionsService';
import { SavedService } from '../services/savedService';
import { useAuth } from '../services/authContext';
import {
  useCurrentTime,
  calculateDeadlineInfo,
  parseDeadlineDate,
  formatDeadlineDate
} from '../services/deadlineService';
import { Institution, AdmissionCycle, AdmissionStatus } from '../types/institution';
import { getInstitutionMedia } from '../utils/institutionMedia';
import { INSTITUTION_PROFILE_SUPPLEMENTS } from '../data/institutions/institutionProfiles';
import { EditorialParagraphs } from '../components/common/EditorialArticle';
import {
  ArrowLeft,
  ArrowDown,
  ArrowRight,
  Award,
  Bookmark,
  BookOpen,
  Building2,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  X
} from 'lucide-react';

interface InstitutionDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

interface MergedProgrammeItem {
  name: string;
  faculty: string;
  qualification: string;
  level: string;
  durationYears?: number;
  cutOffPoint?: number | string;
  academicYear?: string;
  stream?: string;
  entryNote?: string;
}

function inferQualificationFromName(name: string): string {
  const parenMatch = /\(([A-Za-z.]+)\)/.exec(name);
  if (parenMatch && parenMatch[1]) return parenMatch[1];
  const prefixMatch = /^(BSc|BA|BCom|BTech|BEd|BBA|LLB|MBChB|PharmD|OD|MPhil|MSc|MA|MBA|MPA|MTech|PhD|Diploma|HND)\.?/i.exec(
    name.trim()
  );
  if (prefixMatch && prefixMatch[1]) return prefixMatch[1];
  if (name.toLowerCase().includes('diploma')) return 'Diploma';
  if (name.toLowerCase().includes('hnd')) return 'HND';
  return 'Degree / Accredited Award';
}

function formatReadableIsoDate(raw?: string): string | null {
  if (!raw) return null;
  const parsed = parseDeadlineDate(raw) || new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return formatDeadlineDate(parsed, false);
}

function getLiveCountdownParts(
  deadlineRaw: string | undefined,
  now: Date
): {
  hasDeadline: boolean;
  isClosed: boolean;
  isClosingSoon: boolean;
  days: number;
  hours: number;
  minutes: number;
  summaryText: string;
} {
  if (!deadlineRaw) {
    return {
      hasDeadline: false,
      isClosed: false,
      isClosingSoon: false,
      days: 0,
      hours: 0,
      minutes: 0,
      summaryText: 'Deadline not confirmed'
    };
  }

  const info = calculateDeadlineInfo(deadlineRaw, { now });
  if (!info.targetDate) {
    return {
      hasDeadline: false,
      isClosed: false,
      isClosingSoon: false,
      days: 0,
      hours: 0,
      minutes: 0,
      summaryText: info.status === 'rolling' ? 'Rolling admissions' : 'Deadline not confirmed'
    };
  }

  if (info.isClosed || info.diffMs <= 0) {
    return {
      hasDeadline: true,
      isClosed: true,
      isClosingSoon: false,
      days: 0,
      hours: 0,
      minutes: 0,
      summaryText: 'Deadline passed'
    };
  }

  const totalMinutes = Math.floor(info.diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return {
    hasDeadline: true,
    isClosed: false,
    isClosingSoon: info.isClosingSoon,
    days,
    hours,
    minutes,
    summaryText: info.label
  };
}

function getStatusVisuals(status: AdmissionStatus) {
  switch (status) {
    case 'OPEN':
      return {
        label: 'Admissions Open',
        dotClass: 'bg-emerald-500',
        badgeClass:
          'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700/70',
        heroClass: 'bg-emerald-600/90 text-white border-emerald-400/50'
      };
    case 'CLOSING_SOON':
      return {
        label: 'Closing Soon',
        dotClass: 'bg-orange-500',
        badgeClass:
          'bg-orange-50 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700/70',
        heroClass: 'bg-orange-600/95 text-white border-orange-400/50'
      };
    case 'CLOSED':
      return {
        label: 'Closed',
        dotClass: 'bg-rose-600',
        badgeClass:
          'bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/70',
        heroClass: 'bg-rose-700/95 text-white border-rose-400/50'
      };
    case 'UPCOMING':
    case 'NOT_YET_ANNOUNCED':
    case 'SUSPENDED':
    case 'UNKNOWN':
    default:
      return {
        label: 'Not Yet Announced',
        dotClass: 'bg-slate-400',
        badgeClass:
          'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        heroClass: 'bg-slate-700/90 text-slate-100 border-slate-500/50'
      };
  }
}

function formatAccreditationLabel(inst: Institution): string {
  switch (inst.accreditationStatus) {
    case 'FULLY_ACCREDITED':
      return inst.isChartered
        ? `Fully Accredited · Presidential Charter${inst.presidentialCharterYear ? ` (${inst.presidentialCharterYear})` : ''}`
        : 'Fully Accredited by GTEC';
    case 'RE_ACCREDITATION_IN_PROGRESS':
      return 'Re-accreditation in Progress (GTEC)';
    case 'INTERIM_ACCREDITATION':
      return 'Interim Accreditation (GTEC)';
    default:
      return 'GTEC Directory Verified';
  }
}

export const InstitutionDetailPage: React.FC<InstitutionDetailPageProps> = ({ slug, onNavigate }) => {
  const { currentUser, getIdToken } = useAuth();
  const now = useCurrentTime();

  // Compute live real-time institution admission statuses whenever `now` advances
  const institution = useMemo(() => {
    const raw = InstitutionsService.getBySlug(slug);
    return raw ? InstitutionsService.computeRealTimeStatus(raw) : null;
  }, [slug, now]);

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [heroFallback, setHeroFallback] = useState(false);

  // Programme directory filters
  const [programmeSearch, setProgrammeSearch] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  useEffect(() => {
    setHeroFallback(false);
    setProgrammeSearch('');
    setSelectedFaculty('All');
    setSelectedLevel('All');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  useEffect(() => {
    if (institution?.id) {
      setIsSaved(SavedService.isSaved(institution.id));
    }
    const handleUpdate = (e: CustomEvent<{ id?: string; userId?: string }> | Event) => {
      if (!institution) return;
      const detail = (e as CustomEvent)?.detail;
      if (!detail || detail.id === institution.id || detail.userId !== undefined) {
        setIsSaved(SavedService.isSaved(institution.id));
      }
    };
    window.addEventListener('saved-opportunities-changed', handleUpdate);
    return () => window.removeEventListener('saved-opportunities-changed', handleUpdate);
  }, [institution?.id]);

  // Related institutions in same type or region
  const relatedInstitutions = useMemo(() => {
    if (!institution) return [];
    const all = InstitutionsService.getAll().filter((i) => i.id !== institution.id);
    const sameType = all.filter((i) => i.institutionType === institution.institutionType);
    const sameRegion = all.filter(
      (i) => i.institutionType !== institution.institutionType && i.location.region === institution.location.region
    );
    const others = all.filter(
      (i) => i.institutionType !== institution.institutionType && i.location.region !== institution.location.region
    );
    return [...sameType, ...sameRegion, ...others].slice(0, 4);
  }, [institution]);

  // Merge featuredProgrammes and publishedCutOffs cleanly without fabricating unverified programmes
  const mergedProgrammes: MergedProgrammeItem[] = useMemo(() => {
    if (!institution) return [];
    const map = new Map<string, MergedProgrammeItem>();
    const normalizeKey = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/and/g, '');

    institution.programmesSummary.featuredProgrammes.forEach((p) => {
      const key = normalizeKey(p.name);
      map.set(key, {
        name: p.name,
        faculty: p.faculty,
        qualification: inferQualificationFromName(p.name),
        level: p.level,
        durationYears: p.durationYears,
        entryNote: institution.entryRequirements.generalWassce[0]
      });
    });

    institution.publishedCutOffs.forEach((c) => {
      const key = normalizeKey(c.programme);
      const existing =
        map.get(key) ||
        Array.from(map.entries()).find(
          ([k]) => k.includes(key) || key.includes(k)
        )?.[1];

      if (existing) {
        existing.cutOffPoint = c.cutOffPoint;
        existing.academicYear = c.academicYear;
        existing.stream = c.stream;
        existing.qualification = c.degreeType || existing.qualification;
        if (c.specialRequirements) existing.entryNote = c.specialRequirements;
      } else {
        map.set(key, {
          name: c.programme,
          faculty: c.faculty,
          qualification: c.degreeType || inferQualificationFromName(c.programme),
          level: c.degreeType.startsWith('M') && !c.degreeType.startsWith('MB') ? 'Postgraduate' : 'Undergraduate',
          cutOffPoint: c.cutOffPoint,
          academicYear: c.academicYear,
          stream: c.stream,
          entryNote: c.specialRequirements || institution.entryRequirements.generalWassce[0]
        });
      }
    });

    return Array.from(map.values());
  }, [institution]);

  const facultyFilterOptions = useMemo(() => {
    const set = new Set<string>();
    mergedProgrammes.forEach((p) => set.add(p.faculty));
    return ['All', ...Array.from(set)];
  }, [mergedProgrammes]);

  const levelFilterOptions = useMemo(() => {
    const set = new Set<string>();
    mergedProgrammes.forEach((p) => set.add(p.level));
    return ['All', ...Array.from(set)];
  }, [mergedProgrammes]);

  const filteredProgrammes = useMemo(() => {
    const q = programmeSearch.trim().toLowerCase();
    return mergedProgrammes.filter((p) => {
      if (selectedFaculty !== 'All' && p.faculty !== selectedFaculty) return false;
      if (selectedLevel !== 'All' && p.level !== selectedLevel) return false;
      if (q) {
        const hay = `${p.name} ${p.faculty} ${p.qualification} ${p.level}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [mergedProgrammes, programmeSearch, selectedFaculty, selectedLevel]);

  if (!institution) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0B0F17] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#141B29] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center max-w-md space-y-4">
          <Building2 className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Institution Not Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The requested tertiary institution could not be located in the GTEC verified directory.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/institutions')}
            className="px-5 py-2.5 text-sm font-bold bg-[#006B3F] text-white rounded-lg hover:bg-[#005530] cursor-pointer"
          >
            Back to Institutions Directory
          </button>
        </div>
      </div>
    );
  }

  const profile = INSTITUTION_PROFILE_SUPPLEMENTS[institution.id];
  const media = getInstitutionMedia(institution);
  const overallStatus = institution.overallAdmissionStatus;
  const overallStatusVisual = getStatusVisuals(overallStatus);
  const isAcceptingApplications = overallStatus === 'OPEN' || overallStatus === 'CLOSING_SOON';
  const nearestActive = InstitutionsService.getNearestActiveDeadline(institution);
  const primaryCycle = institution.admissionCycles[0];

  const ownership =
    profile?.ownership ||
    (institution.institutionType.toLowerCase().includes('private') ? 'Private' : 'Public');

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      onNavigate('/institutions');
    }
  };

  const handleToggleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const deadlineDate =
        nearestActive?.cycle?.extendedDeadline ||
        nearestActive?.cycle?.applicationCloseDate ||
        primaryCycle?.extendedDeadline ||
        primaryCycle?.applicationCloseDate ||
        '';
      const next = await SavedService.toggleSave(
        {
          id: institution.id,
          slug: institution.slug,
          title: institution.name,
          category: 'Tertiary Institution',
          type: institution.institutionType,
          itemType: 'institution',
          targetPath: `/institutions/${institution.slug}`,
          organizationName: `${institution.shortName} · ${institution.location.region} Region`,
          deadline: deadlineDate
        },
        currentUser?.id,
        getIdToken
      );
      setIsSaved(next);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${institution.name} (${institution.shortName}) — Admissions & Programmes`,
          text: `Explore admissions, programmes, and entry requirements for ${institution.name} on Opportunity Ghana.`,
          url: shareUrl
        });
        return;
      } catch {
        // Fallback to clipboard copy
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Ignore clipboard fallback
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const primaryFeeCycle = institution.admissionCycles.find((c) => c.feeInfo?.isPublished) || primaryCycle;
  const ghanaLocalTimeStr = now.toLocaleTimeString('en-GB', {
    timeZone: 'Africa/Accra',
    hour: '2-digit',
    minute: '2-digit'
  });

  const infoGridItems: { label: string; value: string; href?: string }[] = [
    { label: 'Institution Name', value: institution.name },
    { label: 'Acronym', value: institution.shortName },
    { label: 'Category', value: institution.institutionType },
    { label: 'Ownership', value: `${ownership} Institution` },
    { label: 'Location & Region', value: `${institution.location.city}, ${institution.location.region} Region` },
    { label: 'Main Campus', value: institution.location.campus },
    {
      label: 'Accreditation / Charter',
      value: formatAccreditationLabel(institution)
    },
    ...(profile?.establishedYear
      ? [{ label: 'Established', value: profile.establishedYear }]
      : []),
    { label: 'Academic Year', value: institution.primaryAcademicYear },
    {
      label: 'Official Website',
      value: institution.officialWebsiteUrl.replace(/^https?:\/\/(www\.)?/i, ''),
      href: institution.officialWebsiteUrl
    },
    {
      label: 'Admissions Contact',
      value:
        institution.contact.admissionsEmail[0] ||
        institution.contact.admissionsPhone[0] ||
        'See official portal'
    },
    {
      label: 'Official Admissions Portal',
      value: institution.applicationPortalUrl.replace(/^https?:\/\//i, ''),
      href: isAcceptingApplications ? institution.applicationPortalUrl : institution.admissionsPageUrl
    }
  ];

  // Collect all unique voucher vendors / USSD codes across cycles
  const uniqueVendors = Array.from(
    new Set(
      institution.admissionCycles
        .map((c) => c.feeInfo?.voucherVendor)
        .filter((v): v is string => Boolean(v))
    )
  );
  const uniqueUssdCodes = Array.from(
    new Set(
      institution.admissionCycles
        .map((c) => c.feeInfo?.ussdCode)
        .filter((v): v is string => Boolean(v))
    )
  );

  // Check if postgraduate admission cycle or requirements exist
  const hasPostgraduateTrack =
    Boolean(profile?.postgraduateRequirements?.length) ||
    Boolean(institution.programmesSummary.postgraduateCount) ||
    institution.admissionCycles.some((c) => c.category === 'Postgraduate');

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100">
      {/* 2. PROFESSIONAL INSTITUTION HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-[#051811]">
        <img
          src={heroFallback ? '/images/institutions/campus_legon_courtyard.jpg' : media.url}
          alt={media.alt}
          referrerPolicy="no-referrer"
          onError={() => {
            if (!heroFallback) setHeroFallback(true);
          }}
          className="absolute inset-0 w-full h-full object-cover select-none"
          style={{ objectPosition: media.position }}
        />

        {/* Editorial Contrast Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(96deg, rgba(4, 20, 14, 0.94) 0%, rgba(5, 24, 17, 0.85) 50%, rgba(7, 30, 21, 0.56) 100%)'
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(4, 18, 13, 0.52) 0%, rgba(4, 18, 13, 0.12) 45%, rgba(4, 18, 13, 0.88) 100%)'
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-10 sm:pb-14 lg:pb-16">
          {/* Top Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 sm:pb-9 border-b border-white/15">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white/90 hover:text-white transition-colors cursor-pointer shrink-0 py-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <span className="h-4 w-px bg-white/25 shrink-0" aria-hidden="true" />

              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1.5 text-xs text-slate-300 overflow-x-auto whitespace-nowrap"
              >
                <button
                  type="button"
                  onClick={() => onNavigate('/')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <button
                  type="button"
                  onClick={() => onNavigate('/institutions')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Tertiary Directory
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <span className="text-emerald-300 font-semibold">{institution.shortName}</span>
              </nav>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleToggleSave}
                disabled={isSaving}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-[#006B3F] border-emerald-400/60 text-[#FCD116]'
                    : 'bg-white/10 hover:bg-white/20 border-white/25 text-white backdrop-blur-sm'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="min-h-[38px] px-3.5 py-1.5 rounded-lg border border-white/25 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-1.5 backdrop-blur-sm transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Hero Main Identity & Actions */}
          <div className="pt-8 sm:pt-10 lg:pt-12 max-w-4xl space-y-5">
            {/* Institution Crest / Logo + Accreditation & Category Line */}
            <div className="flex flex-wrap items-center gap-3.5">
              {institution.logoUrl ? (
                <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-sm flex items-center justify-center shrink-0">
                  <img
                    src={institution.logoUrl}
                    alt={`${institution.name} logo`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/25 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <span className="text-xs font-extrabold tracking-wider text-[#FCD116]">
                    {institution.shortName.slice(0, 6)}
                  </span>
                </div>
              )}

              <div className="space-y-0.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#FCD116]">
                  <span>{institution.institutionType}</span>
                  <span className="text-white/35">·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>GTEC Accredited</span>
                  </span>
                  {institution.isChartered && (
                    <>
                      <span className="text-white/35">·</span>
                      <span className="text-white/90">Chartered</span>
                    </>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span>
                      {institution.location.city}, {institution.location.region} Region
                    </span>
                  </span>
                  <span className="text-white/35">·</span>
                  <span className="tabular-nums font-medium text-white">
                    Academic Year {institution.primaryAcademicYear}
                  </span>
                </p>
              </div>
            </div>

            {/* Institution Name Headline */}
            <h1
              className="text-2xl sm:text-4xl lg:text-[2.75rem] font-bold text-white leading-[1.14] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              {institution.name}{' '}
              <span className="text-emerald-300 font-semibold">({institution.shortName})</span>
            </h1>

            {/* Concise Institutional Introduction */}
            <p className="text-sm sm:text-base lg:text-[17px] text-slate-200 leading-relaxed max-w-3xl">
              {profile?.tagline ? `${profile.tagline} ` : ''}
              {institution.accreditationDetails}
            </p>

            {/* Primary & Secondary Action Controls */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {isAcceptingApplications ? (
                <a
                  href={institution.applicationPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[46px] text-sm font-bold rounded-lg bg-[#006B3F] hover:bg-emerald-600 text-white border border-emerald-400/30 shadow-sm transition-colors cursor-pointer"
                >
                  <span>Apply for Admission</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <span className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[46px] text-sm font-bold rounded-lg bg-slate-800/90 text-slate-200 border border-white/20 cursor-not-allowed">
                  <Clock className="w-4 h-4 text-rose-400" />
                  <span>
                    {overallStatus === 'CLOSED'
                      ? 'Admissions Currently Closed'
                      : 'Admissions Not Yet Announced'}
                  </span>
                </span>
              )}

              <button
                type="button"
                onClick={() => scrollToSection('programmes-directory')}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[46px] text-sm font-semibold rounded-lg border border-white/35 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors cursor-pointer"
              >
                <span>Explore Programmes</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <a
                href={institution.officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-emerald-200 hover:text-white underline underline-offset-4 transition-colors"
              >
                <span>Official Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Live Overall Admission Status Indicator */}
              <div
                className={`sm:ml-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-bold ${overallStatusVisual.heroClass}`}
              >
                <span className="w-2 h-2 rounded-full bg-white shrink-0" />
                <span>{overallStatusVisual.label}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APPLICANT & ANTI-FRAUD NOTICE STRIP */}
      {institution.highlightNotice && (
        <div className="bg-amber-50 dark:bg-amber-950/35 border-b border-amber-200 dark:border-amber-900/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed">
              <span className="font-bold">Official Admissions Notice: </span>
              {institution.highlightNotice}
            </p>
          </div>
        </div>
      )}

      {/* QUICK IN-PAGE SECTION JUMP BAR */}
      <nav
        aria-label="Page sections"
        className="sticky top-0 z-20 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 overflow-x-auto text-xs sm:text-sm font-semibold">
          {[
            { id: 'institution-overview', label: 'Overview' },
            { id: 'about-institution', label: `About ${institution.shortName}` },
            { id: 'admissions-info', label: `Admissions (${institution.admissionCycles.length})` },
            { id: 'programmes-directory', label: 'Programmes' },
            { id: 'entry-requirements', label: 'Requirements' },
            { id: 'how-to-apply', label: 'How to Apply' },
            { id: 'fees-financial', label: 'Fees & Financial Aid' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => scrollToSection(tab.id)}
              className="py-3.5 text-slate-600 dark:text-slate-300 hover:text-[#006B3F] dark:hover:text-emerald-400 border-b-2 border-transparent hover:border-[#006B3F] dark:hover:border-emerald-400 whitespace-nowrap transition-colors cursor-pointer"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* 3. INSTITUTION INFORMATION SECTION */}
      <section
        id="institution-overview"
        className="bg-slate-50 dark:bg-[#111827] border-b border-slate-200 dark:border-slate-800 scroll-mt-14"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Institution Key Facts
            </h2>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Verified against GTEC Master Register (Act 1023)
            </span>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            {infoGridItems.map((item) => (
              <div
                key={item.label}
                className="border-t border-slate-200 dark:border-slate-800 pt-3 min-w-0"
              >
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug break-words">
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#006B3F] dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span className="truncate">{item.value}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 4. ABOUT THE INSTITUTION */}
      <section
        id="about-institution"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800 scroll-mt-14"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left 8 Columns: History, Mission, Vision, Philosophy */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006B3F] dark:text-emerald-400">
                01 / Institutional Profile
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                About {institution.name}
              </h2>
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                History & Mandate
              </h3>
              <EditorialParagraphs
                text={
                  profile?.history
                    ? `${profile.history} ${institution.accreditationDetails}`
                    : institution.accreditationDetails
                }
              />
              {institution.affiliatedTo && (
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-white">Academic Affiliation:</strong>{' '}
                  {institution.affiliatedTo}
                </p>
              )}
            </div>

            {profile && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#006B3F] dark:text-emerald-400">
                    Official Mission
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {profile.mission}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#006B3F] dark:text-emerald-400">
                    Institutional Vision
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {profile.vision}
                  </p>
                </div>
              </div>
            )}

            {profile && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Academic Focus
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {profile.academicFocus}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Educational Philosophy
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {profile.educationalPhilosophy}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right 4 Columns: Specialisations, Strengths & Official Contacts */}
          <aside className="lg:col-span-4 space-y-6 bg-slate-50 dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            {profile?.specialisations && profile.specialisations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Areas of Specialisation
                </h3>
                <ul className="space-y-2 text-sm text-slate-800 dark:text-slate-200">
                  {profile.specialisations.map((spec, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <GraduationCap className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {profile?.strengths && profile.strengths.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Institutional Strengths
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {profile.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Official Address & Admissions Desk
              </h3>
              <p className="text-slate-700 dark:text-slate-300">{institution.location.address}</p>
              {institution.location.gpsDigitalAddress && (
                <p className="text-slate-500 dark:text-slate-400 tabular-nums">
                  GhanaPost GPS: <strong className="text-slate-800 dark:text-slate-200">{institution.location.gpsDigitalAddress}</strong>
                </p>
              )}
              <div className="space-y-1 pt-1">
                {institution.contact.admissionsPhone.map((phone, i) => (
                  <p key={i} className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                    <Phone className="w-3.5 h-3.5 text-[#006B3F] dark:text-emerald-400 shrink-0" />
                    <span>{phone}</span>
                  </p>
                ))}
                {institution.contact.admissionsEmail.map((email, i) => (
                  <p key={i} className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                    <Mail className="w-3.5 h-3.5 text-[#006B3F] dark:text-emerald-400 shrink-0" />
                    <span>{email}</span>
                  </p>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* 5. ADMISSIONS INFORMATION SECTION */}
      <section
        id="admissions-info"
        className="bg-slate-50/80 dark:bg-[#0E1420] border-b border-slate-200 dark:border-slate-800 scroll-mt-14"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006B3F] dark:text-emerald-400">
                02 / Admissions & Live Deadlines
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {institution.primaryAcademicYear} Admissions Information
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Ghana Local Time (GMT): <strong>{ghanaLocalTimeStr}</strong>
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold ${overallStatusVisual.badgeClass}`}
              >
                <span className={`w-2 h-2 rounded-full ${overallStatusVisual.dotClass}`} />
                <span>{overallStatusVisual.label}</span>
              </span>
            </div>
          </div>

          {/* Admissions Cycles Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {institution.admissionCycles.map((cycle: AdmissionCycle) => {
              const statusVisual = getStatusVisuals(cycle.status);
              const effectiveDeadline = cycle.extendedDeadline || cycle.applicationCloseDate;
              const countdown = getLiveCountdownParts(effectiveDeadline, now);
              const isCycleClosed = cycle.status === 'CLOSED' || countdown.isClosed;
              const isCycleOpen =
                !isCycleClosed &&
                (cycle.status === 'OPEN' || cycle.status === 'CLOSING_SOON');
              const openFormatted = formatReadableIsoDate(cycle.applicationOpenDate);
              const closeFormatted = effectiveDeadline
                ? formatReadableIsoDate(effectiveDeadline)
                : 'Deadline not confirmed';

              return (
                <article
                  key={cycle.id}
                  className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-6"
                >
                  <div className="space-y-4">
                    {/* Cycle Category & Visual Status Indicator */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#006B3F] dark:text-emerald-400">
                        {cycle.category} · {cycle.academicYear}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold ${statusVisual.badgeClass}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${statusVisual.dotClass}`} />
                        <span>{statusVisual.label}</span>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {cycle.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {cycle.description}
                      </p>
                    </div>

                    {/* Live Ghana Time Dynamic Countdown */}
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Live Deadline Countdown
                        </span>
                        <span
                          className={`font-bold tabular-nums ${
                            isCycleClosed
                              ? 'text-rose-600 dark:text-rose-400'
                              : countdown.isClosingSoon
                              ? 'text-orange-600 dark:text-orange-400'
                              : countdown.hasDeadline
                              ? 'text-[#006B3F] dark:text-emerald-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {countdown.summaryText}
                        </span>
                      </div>

                      {countdown.hasDeadline && !isCycleClosed ? (
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-700/80 rounded-lg py-2">
                            <span className="block text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                              {countdown.days}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                              Days
                            </span>
                          </div>
                          <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-700/80 rounded-lg py-2">
                            <span className="block text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                              {countdown.hours}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                              Hours
                            </span>
                          </div>
                          <div className="bg-white dark:bg-[#141B29] border border-slate-200 dark:border-slate-700/80 rounded-lg py-2">
                            <span className="block text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                              {countdown.minutes}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                              Minutes
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {isCycleClosed
                            ? 'This admission window has closed according to the official deadline.'
                            : 'Official closing date has not yet been confirmed by the institution.'}
                        </p>
                      )}
                    </div>

                    {/* Cycle Structured Details */}
                    <dl className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm border-t border-b border-slate-200 dark:border-slate-800">
                      {openFormatted && (
                        <div className="py-2.5 flex items-center justify-between gap-3">
                          <dt className="text-slate-500 dark:text-slate-400">Opening Date</dt>
                          <dd className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                            {openFormatted}
                          </dd>
                        </div>
                      )}
                      <div className="py-2.5 flex items-center justify-between gap-3">
                        <dt className="text-slate-500 dark:text-slate-400">
                          {cycle.isExtended ? 'Extended Closing Date' : 'Closing Date'}
                        </dt>
                        <dd className="font-bold text-slate-900 dark:text-white tabular-nums">
                          {closeFormatted}
                        </dd>
                      </div>
                      {cycle.originalDeadline && cycle.isExtended && (
                        <div className="py-2.5 flex items-center justify-between gap-3 text-slate-400">
                          <dt>Original Deadline</dt>
                          <dd className="line-through tabular-nums">
                            {formatReadableIsoDate(cycle.originalDeadline)}
                          </dd>
                        </div>
                      )}
                      <div className="py-2.5 flex items-center justify-between gap-3">
                        <dt className="text-slate-500 dark:text-slate-400">Application Mode</dt>
                        <dd className="font-medium text-slate-900 dark:text-slate-100 text-right">
                          {cycle.feeInfo?.ussdCode
                            ? 'Online Portal + e-Voucher / USSD'
                            : 'Official Online Admissions Portal'}
                        </dd>
                      </div>
                      {cycle.feeInfo && (
                        <div className="py-2.5 flex items-center justify-between gap-3">
                          <dt className="text-slate-500 dark:text-slate-400">Application Fee</dt>
                          <dd className="font-bold text-[#006B3F] dark:text-emerald-400 tabular-nums text-right">
                            {cycle.feeInfo.isPublished && cycle.feeInfo.amountGHS
                              ? `GH¢${cycle.feeInfo.amountGHS}${
                                  cycle.feeInfo.amountUSD ? ` / US$${cycle.feeInfo.amountUSD}` : ''
                                }`
                              : 'Not currently published'}
                          </dd>
                        </div>
                      )}
                      {(cycle.entranceExamDate || cycle.interviewDate) && (
                        <div className="py-2.5 flex items-center justify-between gap-3">
                          <dt className="text-slate-500 dark:text-slate-400">Assessment / Interview</dt>
                          <dd className="font-medium text-slate-900 dark:text-slate-100 text-right tabular-nums">
                            {[
                              cycle.entranceExamDate ? `Exam: ${cycle.entranceExamDate}` : null,
                              cycle.interviewDate ? `Interview: ${cycle.interviewDate}` : null
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Cycle CTA — NEVER active apply button when closed */}
                  {isCycleOpen ? (
                    <a
                      href={cycle.applicationPortalUrl || institution.applicationPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl text-sm font-bold bg-[#006B3F] hover:bg-[#005530] text-white transition-colors"
                    >
                      <span>Apply for {cycle.category}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold cursor-not-allowed">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        <span>
                          {isCycleClosed
                            ? 'Applications Closed for This Cycle'
                            : 'Not Yet Open for Applications'}
                        </span>
                      </span>
                      <a
                        href={institution.admissionsPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#006B3F] dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Admissions Info</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. AVAILABLE PROGRAMMES AND COURSES */}
      <section
        id="programmes-directory"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800 scroll-mt-14 space-y-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006B3F] dark:text-emerald-400">
              03 / Academic Offerings
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Available Programmes & Faculties
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Explore verified programmes, academic colleges, degree qualifications, and published cut-off points offered by {institution.shortName}.
            </p>
          </div>

          {institution.programmesCatalogueUrl && (
            <a
              href={institution.programmesCatalogueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hover:border-[#006B3F] dark:hover:border-emerald-400 transition-colors"
            >
              <span>Official Full Prospectus</span>
              <ExternalLink className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
            </a>
          )}
        </div>

        {/* Academic Counts Strip */}
        {(institution.programmesSummary.undergraduateCount ||
          institution.programmesSummary.postgraduateCount ||
          institution.programmesSummary.diplomaCount) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-b border-slate-200 dark:border-slate-800 py-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Faculties / Schools
              </span>
              <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                {institution.programmesSummary.faculties.length}
              </span>
            </div>
            {institution.programmesSummary.undergraduateCount && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Undergraduate Catalog
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {institution.programmesSummary.undergraduateCount}+ Programmes
                </span>
              </div>
            )}
            {institution.programmesSummary.postgraduateCount && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Postgraduate Catalog
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {institution.programmesSummary.postgraduateCount}+ Programmes
                </span>
              </div>
            )}
            {institution.programmesSummary.diplomaCount && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Diploma / HND Tracks
                </span>
                <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {institution.programmesSummary.diplomaCount}+ Programmes
                </span>
              </div>
            )}
          </div>
        )}

        {/* Colleges, Faculties & Academic Units */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Colleges, Faculties & Academic Areas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {institution.programmesSummary.faculties.map((fac, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200"
              >
                <Landmark className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{fac}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Programme Search & Filter Bar */}
        <div className="bg-slate-50 dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={programmeSearch}
                onChange={(e) => setProgrammeSearch(e.target.value)}
                placeholder={`Search ${institution.shortName} programmes, degrees (e.g. BSc, LLB, Nursing)...`}
                className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006B3F]"
              />
              {programmeSearch && (
                <button
                  type="button"
                  onClick={() => setProgrammeSearch('')}
                  aria-label="Clear programme search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                aria-label="Filter by faculty"
                className="w-full py-2.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]"
              >
                {facultyFilterOptions.map((fac) => (
                  <option key={fac} value={fac}>
                    {fac === 'All' ? 'All Faculties / Schools' : fac}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                aria-label="Filter by award level"
                className="w-full py-2.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]"
              >
                {levelFilterOptions.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl === 'All' ? 'All Award Levels' : lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing <strong>{filteredProgrammes.length}</strong> verified programme records on this profile.
          </p>
        </div>

        {/* Programme Directory Grid */}
        {filteredProgrammes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProgrammes.map((prog, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold uppercase tracking-wider text-[#006B3F] dark:text-emerald-400">
                      {prog.qualification} · {prog.level}
                    </span>
                    {prog.durationYears && (
                      <span className="font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                        {prog.durationYears} Years
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {prog.name}
                  </h4>

                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Faculty / School: <span className="text-slate-800 dark:text-slate-200">{prog.faculty}</span>
                  </p>

                  {prog.entryNote && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-2.5">
                      {prog.entryNote}
                    </p>
                  )}
                </div>

                {prog.cutOffPoint !== undefined && (
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Published Cut-Off ({prog.academicYear || 'Recent'})
                    </span>
                    <span className="font-bold text-[#006B3F] dark:text-emerald-400 tabular-nums">
                      Aggregate {prog.cutOffPoint}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 dark:bg-[#131B2A] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              No programmes matched "{programmeSearch}"
            </p>
            <button
              type="button"
              onClick={() => {
                setProgrammeSearch('');
                setSelectedFaculty('All');
                setSelectedLevel('All');
              }}
              className="text-xs font-bold text-[#006B3F] dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Reset programme filters
            </button>
          </div>
        )}

        {/* Officially Published Cut-Off Points Table */}
        {institution.publishedCutOffs.length > 0 && (
          <div className="pt-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Officially Published Cut-Off Aggregates
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Authoritative minimum WASSCE aggregates from recent institutional admission schedules
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                Reference Year: {institution.publishedCutOffs[0]?.academicYear}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-4">Programme</th>
                    <th className="py-3 px-4">Faculty / College</th>
                    <th className="py-3 px-4">Award</th>
                    <th className="py-3 px-4">Stream</th>
                    <th className="py-3 px-4 text-right text-[#006B3F] dark:text-emerald-400 font-bold">
                      Cut-Off
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#131B2A]">
                  {institution.publishedCutOffs.map((cut, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {cut.programme}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{cut.faculty}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{cut.degreeType}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {cut.stream || 'Regular'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#006B3F] dark:text-emerald-400 tabular-nums">
                        Aggregate {cut.cutOffPoint}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* 7. ENTRY REQUIREMENTS AND ELIGIBILITY */}
      <section
        id="entry-requirements"
        className="bg-slate-50/80 dark:bg-[#0E1420] border-b border-slate-200 dark:border-slate-800 scroll-mt-14"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006B3F] dark:text-emerald-400">
              04 / Admission Eligibility
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Entry Requirements by Applicant Category
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WASSCE / SSSCE / Direct Entry */}
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                WASSCE, SSSCE & Direct Entry Applicants
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                {institution.entryRequirements.generalWassce.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 shrink-0 mt-1" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mature Applicants */}
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Mature Applicants (25+ Years)
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                {institution.entryRequirements.matureApplicants.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 shrink-0 mt-1" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Diploma & HND Holders */}
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Diploma & HND Holders (Top-Up / Level 200–300)
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                {institution.entryRequirements.diplomaHndHolders.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 shrink-0 mt-1" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* International Applicants */}
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                International Applicants
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                {institution.entryRequirements.internationalApplicants.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 shrink-0 mt-1" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Postgraduate Applicants (where applicable) */}
            {hasPostgraduateTrack && (
              <div className="md:col-span-2 bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Postgraduate Applicants (Master’s, MPhil & PhD)
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-300">
                  {(
                    institution.entryRequirements.postgraduateApplicants ||
                    profile?.postgraduateRequirements || [
                      'Recognised Bachelor’s degree with at least Second Class Lower Division from an accredited university',
                      'Official academic transcripts, degree certificates, and two academic/professional referee letters'
                    ]
                  ).map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 shrink-0 mt-1" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Special Notes & Additional Assessments */}
          {institution.entryRequirements.specialNotes.length > 0 && (
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-2.5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Programme-Specific Notes & Assessments
              </h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {institution.entryRequirements.specialNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Award className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* 8. APPLICATION PROCESS — STEP BY STEP */}
      <section
        id="how-to-apply"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b border-slate-200 dark:border-slate-800 scroll-mt-14"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left 7 Cols: Numbered Official Application Steps & Required Documents */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006B3F] dark:text-emerald-400">
                05 / Application Guide
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                How to Apply to {institution.shortName}
              </h2>
            </div>

            <ol className="space-y-4">
              {institution.applicationSteps.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80 last:border-b-0 last:pb-0"
                >
                  <span className="w-9 h-9 rounded-lg bg-[#006B3F]/10 dark:bg-emerald-500/15 text-[#006B3F] dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                    {step}
                  </p>
                </li>
              ))}
            </ol>

            <div className="space-y-3 pt-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
                <span>Required Documents</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {institution.requiredDocuments.map((doc, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-lg px-3.5 py-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#006B3F] dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right 5 Cols: Official Admissions Portal Panel */}
          <aside className="lg:col-span-5 bg-[#062217] dark:bg-[#072017] text-white rounded-2xl p-6 sm:p-8 space-y-6 border border-emerald-900/60">
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#FCD116]">
                Official Institutional Portal
              </p>
              <h3 className="text-xl font-bold text-white leading-snug">
                {isAcceptingApplications
                  ? `Submit Your ${institution.shortName} Application`
                  : 'Admissions Cycle Information'}
              </h3>
            </div>

            <dl className="divide-y divide-white/15 text-xs sm:text-sm border-t border-b border-white/15">
              <div className="py-3 flex items-center justify-between gap-2">
                <dt className="text-emerald-100/75">Current Status</dt>
                <dd className="font-bold text-white">{overallStatusVisual.label}</dd>
              </div>
              <div className="py-3 flex items-center justify-between gap-2">
                <dt className="text-emerald-100/75">Academic Year</dt>
                <dd className="font-semibold text-white tabular-nums">
                  {institution.primaryAcademicYear}
                </dd>
              </div>
              {nearestActive && (
                <div className="py-3 flex items-center justify-between gap-2">
                  <dt className="text-emerald-100/75">Next Active Deadline</dt>
                  <dd className="font-semibold text-[#FCD116] tabular-nums">
                    {nearestActive.deadlineInfo.formattedDate}
                  </dd>
                </div>
              )}
              {uniqueUssdCodes.length > 0 && (
                <div className="py-3 flex items-center justify-between gap-2">
                  <dt className="text-emerald-100/75">Official USSD Code</dt>
                  <dd className="font-bold text-white tabular-nums">
                    {uniqueUssdCodes.join(' / ')}
                  </dd>
                </div>
              )}
            </dl>

            {isAcceptingApplications ? (
              <a
                href={institution.applicationPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[48px] rounded-xl bg-[#FCD116] hover:bg-yellow-300 text-slate-950 font-bold text-sm transition-colors cursor-pointer"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <div className="space-y-3">
                <div className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[48px] rounded-xl bg-white/10 text-slate-200 font-bold text-sm border border-white/15 cursor-not-allowed">
                  <Clock className="w-4 h-4 text-rose-400" />
                  <span>
                    {overallStatus === 'CLOSED'
                      ? 'Admissions Currently Closed'
                      : 'Admissions Not Yet Announced'}
                  </span>
                </div>
                <a
                  href={institution.admissionsPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/25 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
                >
                  <span>Check Official Admissions Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <p className="text-[11px] text-emerald-100/75 border-t border-white/10 pt-3 flex items-start gap-2 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
              <span>
                Opportunity Ghana links strictly to verified official portals. Never pay fees to unofficial agents or private individuals.
              </span>
            </p>
          </aside>
        </div>
      </section>

      {/* 9. FEES AND FINANCIAL INFORMATION */}
      <section
        id="fees-financial"
        className="bg-slate-50/80 dark:bg-[#0E1420] border-b border-slate-200 dark:border-slate-800 scroll-mt-14"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006B3F] dark:text-emerald-400">
              06 / Fees & Financial Support
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Fees & Financial Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Application / e-Voucher Fees */}
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Application & e-Voucher Fees
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                {institution.admissionCycles.map((cycle) => (
                  <div
                    key={cycle.id}
                    className="border-t border-slate-100 dark:border-slate-800 pt-2.5 first:border-t-0 first:pt-0"
                  >
                    <p className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                      {cycle.category}
                    </p>
                    <p className="text-base font-bold text-[#006B3F] dark:text-emerald-400 tabular-nums mt-0.5">
                      {cycle.feeInfo?.isPublished && cycle.feeInfo.amountGHS
                        ? `GH¢${cycle.feeInfo.amountGHS}${
                            cycle.feeInfo.amountUSD ? ` / US$${cycle.feeInfo.amountUSD}` : ''
                          }`
                        : 'Fee not currently published'}
                    </p>
                    {cycle.feeInfo?.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {cycle.feeInfo.notes}
                      </p>
                    )}
                  </div>
                ))}

                {uniqueVendors.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-800 dark:text-slate-100 block mb-0.5">
                      Authorised Payment Channels:
                    </strong>
                    <span>{uniqueVendors[0]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Undergraduate & Postgraduate Tuition Guidance */}
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tuition & Academic Fee Structure
                </h3>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <div>
                  <strong className="text-slate-900 dark:text-white block">
                    Undergraduate Schedules
                  </strong>
                  <p className="mt-0.5">
                    {profile?.feesGuidance.undergraduate ||
                      primaryFeeCycle?.feeInfo?.notes ||
                      'Official undergraduate tuition schedules are published annually per programme on the institution portal.'}
                  </p>
                </div>

                {profile?.feesGuidance.postgraduate && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block">
                      Postgraduate Schedules
                    </strong>
                    <p className="mt-0.5">{profile.feesGuidance.postgraduate}</p>
                  </div>
                )}

                {profile?.feesGuidance.international && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block">
                      International Applicants
                    </strong>
                    <p className="mt-0.5">{profile.feesGuidance.international}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Aid, Scholarships & Loans */}
            <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-[#006B3F] dark:text-emerald-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Financial Aid & Scholarships
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {profile?.feesGuidance.financialAid ||
                  'Qualifying Ghanaian tertiary students may apply for Students Loan Trust Fund (SLTF), GETFund, Ghana Scholarships Authority bursaries, and institutional merit support.'}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/opportunities?category=Scholarships')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B3F] dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <span>Explore Available Scholarships in Ghana</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-2">
            <span>Verified by: {institution.verifiedBy}</span>
            <span>Last Updated: {institution.lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* OTHER ACCREDITED INSTITUTIONS IN GHANA */}
      {relatedInstitutions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006B3F] dark:text-emerald-400">
                GTEC Accredited Directory
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Compare Other Accredited Institutions
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/institutions')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#006B3F] dark:text-emerald-400 hover:underline cursor-pointer"
            >
              <span>View All 21 Institutions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedInstitutions.map((rel) => {
              const relMedia = getInstitutionMedia(rel);
              const relStatus = getStatusVisuals(rel.overallAdmissionStatus);
              return (
                <article
                  key={rel.id}
                  onClick={() => onNavigate(`/institutions/${rel.slug}`)}
                  className="group bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:border-[#006B3F] dark:hover:border-emerald-500 transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                      <img
                        src={relMedia.url}
                        alt={relMedia.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        style={{ objectPosition: relMedia.position }}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />
                      <span className="absolute bottom-2.5 left-3 text-[10px] font-bold uppercase tracking-wider text-[#FCD116]">
                        {rel.shortName} · {rel.location.region}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                        {rel.institutionType}
                      </p>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 transition-colors">
                        {rel.name}
                      </h3>
                      <div className="pt-1 flex items-center gap-2 text-xs">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-bold ${relStatus.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${relStatus.dotClass}`} />
                          <span>{relStatus.label}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(`/institutions/${rel.slug}`);
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-[#006B3F] text-slate-900 dark:text-slate-100 group-hover:text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <span>View Institution</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
