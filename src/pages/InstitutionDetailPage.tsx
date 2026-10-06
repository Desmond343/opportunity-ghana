import React, { useState } from 'react';
import { InstitutionsService } from '../services/institutionsService';
import { Institution, AdmissionCycle } from '../types/institution';
import { getInstitutionMedia } from '../utils/institutionMedia';
import {
  Building2,
  MapPin,
  ShieldCheck,
  Globe,
  ExternalLink,
  Clock,
  Calendar,
  CreditCard,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Phone,
  Mail,
  HelpCircle,
  Award,
  Bookmark,
  BookOpen,
  Share2
} from 'lucide-react';

interface InstitutionDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const InstitutionDetailPage: React.FC<InstitutionDetailPageProps> = ({ slug, onNavigate }) => {
  const institution = InstitutionsService.getBySlug(slug);
  const [activeTab, setActiveTab] = useState<'admissions' | 'programmes' | 'requirements' | 'application'>('admissions');
  const [isSaved, setIsSaved] = useState(() => (institution ? InstitutionsService.isSaved(institution.id) : false));
  const [copiedLink, setCopiedLink] = useState(false);
  const media = institution ? getInstitutionMedia(institution) : null;

  if (!institution) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center max-w-md">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Institution Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            The requested tertiary institution could not be located in the verified directory.
          </p>
          <button
            onClick={() => onNavigate('/institutions')}
            className="px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const handleToggleSave = () => {
    const next = InstitutionsService.toggleSave(institution.id);
    setIsSaved(next);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => onNavigate('/institutions')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Institutions
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              {copiedLink ? 'Copied Link!' : 'Share'}
            </button>

            <button
              onClick={handleToggleSave}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-emerald-700' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8 overflow-hidden">
          {media && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <img
                src={media.url}
                alt={media.alt}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/institutions/ghana_campus_students.jpg';
                }}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: media.position,
                  filter: 'contrast(1.05) saturate(1.06) brightness(0.98)',
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.95) 100%)',
                }}
              />
            </div>
          )}
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                  {institution.institutionType}
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                  GTEC Verified & Accredited
                </span>

                {institution.isChartered && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    Presidential Charter
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
                  {institution.name} ({institution.shortName})
                </h1>
                <p className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    {institution.location.campus} • {institution.location.city},{' '}
                    {institution.location.region} Region
                  </span>
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                {institution.accreditationDetails}
              </p>
            </div>

            {/* Quick CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <a
                href={institution.applicationPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors text-center"
              >
                Apply on Official Portal
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={institution.officialWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors text-center"
              >
                <Globe className="w-3.5 h-3.5 text-slate-600" />
                Official Website
              </a>
            </div>
          </div>
        </div>

        {/* Warning Notice if published */}
        {institution.highlightNotice && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              <span className="font-bold">Applicant Notice: </span>
              {institution.highlightNotice}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-2 sm:gap-4 overflow-x-auto text-sm font-semibold">
          <button
            onClick={() => setActiveTab('admissions')}
            className={`pb-3 px-2 sm:px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'admissions'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Admissions & Deadlines ({institution.admissionCycles.length})
          </button>
          <button
            onClick={() => setActiveTab('programmes')}
            className={`pb-3 px-2 sm:px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'programmes'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Programmes & Cut-Offs
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`pb-3 px-2 sm:px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'requirements'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Entry Requirements
          </button>
          <button
            onClick={() => setActiveTab('application')}
            className={`pb-3 px-2 sm:px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'application'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            How to Apply & Fees
          </button>
        </div>

        {/* Tab 1: Admissions & Deadlines */}
        {activeTab === 'admissions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {institution.admissionCycles.map((cycle) => {
                const deadlineInfo = InstitutionsService.getCycleDeadlineInfo(cycle);
                return (
                  <div
                    key={cycle.id}
                    className="floating-glass-tablet specular-rim-highlight rounded-2xl p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50/90 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
                          {cycle.category}
                        </span>
                        {cycle.status === 'OPEN' && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100/90 text-emerald-800 border border-emerald-200">
                            Open
                          </span>
                        )}
                        {cycle.status === 'CLOSING_SOON' && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-100/90 text-amber-800 border border-amber-200">
                            Closing Soon
                          </span>
                        )}
                        {cycle.status === 'CLOSED' && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                            Closed
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-2 font-space">{cycle.title}</h3>
                      <p className="text-xs text-slate-600 mb-4">{cycle.description}</p>

                      {/* Deadline Box */}
                      <div className="glass-subpanel rounded-xl p-3.5 mb-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">Academic Year:</span>
                          <span className="font-semibold text-slate-800">{cycle.academicYear}</span>
                        </div>

                        {cycle.applicationOpenDate && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Applications Opened:</span>
                            <span className="font-medium text-slate-700">{cycle.applicationOpenDate}</span>
                          </div>
                        )}

                        {cycle.applicationCloseDate && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                              {cycle.isExtended ? 'Extended Deadline:' : 'Application Deadline:'}
                            </span>
                            <span className="font-bold text-slate-900">
                              {cycle.extendedDeadline || cycle.applicationCloseDate}
                            </span>
                          </div>
                        )}

                        {cycle.originalDeadline && cycle.isExtended && (
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Original Deadline:</span>
                            <span className="line-through">{cycle.originalDeadline}</span>
                          </div>
                        )}

                        {deadlineInfo && (
                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                            <span className="text-slate-600 font-medium">Time Remaining:</span>
                            <span
                              className={`font-bold ${
                                deadlineInfo.isClosingSoon
                                  ? 'text-amber-700'
                                  : deadlineInfo.isClosed
                                  ? 'text-slate-500'
                                  : 'text-emerald-700'
                              }`}
                            >
                              {deadlineInfo.label}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Voucher Fee */}
                      {cycle.feeInfo && (
                        <div className="text-xs text-slate-600 mb-4 space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              Application Fee:{' '}
                              {cycle.feeInfo.amountGHS
                                ? `GH¢${cycle.feeInfo.amountGHS}`
                                : 'Not currently published'}
                              {cycle.feeInfo.amountUSD ? ` / US$${cycle.feeInfo.amountUSD}` : ''}
                            </span>
                          </div>
                          <p className="text-slate-500">{cycle.feeInfo.voucherVendor}</p>
                        </div>
                      )}
                    </div>

                    <a
                      href={cycle.applicationPortalUrl || institution.applicationPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    >
                      Apply for {cycle.category}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Programmes & Cut-Off Points */}
        {activeTab === 'programmes' && (
          <div className="space-y-8">
            {/* Cut-Off Points Table */}
            {institution.publishedCutOffs.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Officially Published Cut-Off Points
                    </h3>
                    <p className="text-xs text-slate-500">
                      Authoritative minimum aggregate cut-offs based on recent admissions
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                    Academic Year {institution.publishedCutOffs[0]?.academicYear}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-[11px] tracking-wider">
                        <th className="py-2.5 px-3">Programme</th>
                        <th className="py-2.5 px-3">Faculty / College</th>
                        <th className="py-2.5 px-3">Degree</th>
                        <th className="py-2.5 px-3 font-bold text-emerald-800">Cut-Off Aggregate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {institution.publishedCutOffs.map((cut, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 font-semibold text-slate-900">{cut.programme}</td>
                          <td className="py-3 px-3 text-slate-600">{cut.faculty}</td>
                          <td className="py-3 px-3 text-slate-500">{cut.degreeType}</td>
                          <td className="py-3 px-3 font-bold text-emerald-700">
                            Aggregate {cut.cutOffPoint}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Featured Programmes */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Featured Programmes</h3>
                {institution.programmesCatalogueUrl && (
                  <a
                    href={institution.programmesCatalogueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    View Official Full Programme List <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {institution.programmesSummary.featuredProgrammes.map((prog, idx) => (
                  <div key={idx} className="glass-subpanel p-3.5 rounded-xl hover:-translate-y-0.5 transition-transform">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase block mb-1">
                      {prog.level} • {prog.durationYears} Years
                    </span>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1">{prog.name}</h4>
                    <span className="text-[11px] text-slate-500 block">{prog.faculty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Faculties */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-3">Colleges & Faculties</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                {institution.programmesSummary.faculties.map((fac, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{fac}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: Entry Requirements */}
        {activeTab === 'requirements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  WASSCE & SSSCE General Entry Requirements
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Credits in 3 core subjects plus 3 elective subjects
                </p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {institution.entryRequirements.generalWassce.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-2">Mature Applicants (25+ Years)</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {institution.entryRequirements.matureApplicants.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-2">Diploma & HND Top-Up Holders</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {institution.entryRequirements.diplomaHndHolders.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-2">International Candidates</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {institution.entryRequirements.internationalApplicants.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: How to Apply & Fees */}
        {activeTab === 'application' && (
          <div className="space-y-6">
            {/* Step by Step */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4">
                Step-by-Step Application Instructions
              </h3>
              <ol className="space-y-4">
                {institution.applicationSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Required Documents */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-3">Required Documents</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-700">
                {institution.requiredDocuments.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Verification */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-3">Official Institution Contacts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider mb-1">
                    Admissions Phone
                  </span>
                  <div className="space-y-1">
                    {institution.contact.admissionsPhone.map((ph, idx) => (
                      <p key={idx} className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {ph}
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px] uppercase tracking-wider mb-1">
                    Admissions Email
                  </span>
                  <div className="space-y-1">
                    {institution.contact.admissionsEmail.map((em, idx) => (
                      <p key={idx} className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {em}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
                <span>Verified by: {institution.verifiedBy}</span>
                <span>Last Updated: {institution.lastUpdated}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
