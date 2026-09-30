import React, { useState } from 'react';
import { ExtractedAIResponse, QualityControlFlag, VerificationChecklist } from '../../types/aiAssistant';
import { AIAssistantService, DEMO_SOURCE_TEMPLATES } from '../../services/aiAssistantService';
import { OpportunitiesService } from '../../services/opportunitiesService';
import { ResourcesService } from '../../services/resourcesService';
import { DuplicateMatch, Opportunity, Resource, ResourceType } from '../../types/database';
import { useAuth } from '../../services/authContext';
import {
  Sparkles,
  Link as LinkIcon,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Save,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Clock,
  Building,
  GraduationCap,
  Calendar,
  Layers,
  Copy,
  Info
} from 'lucide-react';

export const AdminAIAssistant: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  // Input State
  const [sourceUrl, setSourceUrl] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extracted Result State
  const [result, setResult] = useState<ExtractedAIResponse | null>(null);
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);

  // Editable Form State (allows editing every field)
  const [activeFormType, setActiveFormType] = useState<'opportunity' | 'resource'>('opportunity');
  
  // Opportunity Fields
  const [oppTitle, setOppTitle] = useState('');
  const [oppOrg, setOppOrg] = useState('');
  const [oppType, setOppType] = useState('');
  const [oppCategory, setOppCategory] = useState('');
  const [oppSubcategory, setOppSubcategory] = useState('');
  const [oppDescription, setOppDescription] = useState('');
  const [oppLocation, setOppLocation] = useState('');
  const [oppEducation, setOppEducation] = useState('');
  const [oppFieldOfStudy, setOppFieldOfStudy] = useState('');
  const [oppExperience, setOppExperience] = useState('');
  const [oppNationality, setOppNationality] = useState('');
  const [oppFunding, setOppFunding] = useState('');
  const [oppDeadline, setOppDeadline] = useState('');
  const [oppAppUrl, setOppAppUrl] = useState('');
  const [oppBenefits, setOppBenefits] = useState('');
  const [oppRequirements, setOppRequirements] = useState('');
  const [oppDocs, setOppDocs] = useState('');

  // Resource Fields
  const [resTitle, setResTitle] = useState('');
  const [resProvider, setResProvider] = useState('');
  const [resType, setResType] = useState<ResourceType>('course');
  const [resCategory, setResCategory] = useState('');
  const [resDescription, setResDescription] = useState('');
  const [resLevel, setResLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'>('Beginner');
  const [resFormat, setResFormat] = useState<'Self-paced Online' | 'Live Online' | 'In-person' | 'Hybrid'>('Self-paced Online');
  const [resDuration, setResDuration] = useState('');
  const [resCost, setResCost] = useState(0);
  const [resCurrency, setResCurrency] = useState('GHS');
  const [resIsFree, setResIsFree] = useState(true);
  const [resHasCert, setResHasCert] = useState(true);
  const [resSkills, setResSkills] = useState('');
  const [resPrereqs, setResPrereqs] = useState('');
  const [resEnrollUrl, setResEnrollUrl] = useState('');

  // Human Verification Checklist (Section 10)
  const [checklist, setChecklist] = useState<VerificationChecklist>({
    sourceLegitimate: false,
    organizationIdentifiable: false,
    deadlineVerified: false,
    eligibilityVerified: false,
    applicationUrlVerified: false,
    informationCurrent: false
  });

  const [savingDraft, setSavingDraft] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const author = {
    email: currentUser?.email || 'admin@opportunityghana.com',
    name: currentUser?.name || 'Administrator'
  };

  const handleSelectTemplate = (template: typeof DEMO_SOURCE_TEMPLATES[0]) => {
    setSourceUrl(template.url);
    setPastedText(template.text);
    setErrorMsg(null);
  };

  const handleAnalyze = async () => {
    if (!pastedText.trim() && !sourceUrl.trim()) {
      setErrorMsg('Please paste text or provide a source URL to analyze.');
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);
    setSaveSuccessMsg(null);

    try {
      const extracted = await AIAssistantService.extractSource(sourceUrl.trim(), pastedText.trim());
      setResult(extracted);
      setActiveFormType(extracted.detectedType);

      // Populate Opportunity Form
      if (extracted.opportunityData) {
        const d = extracted.opportunityData;
        setOppTitle(d.title || '');
        setOppOrg(d.organizationName || '');
        setOppType(d.opportunityType || 'Full-time');
        setOppCategory(d.category || 'Jobs');
        setOppSubcategory(d.subcategory || '');
        setOppDescription(d.description || '');
        setOppLocation(d.location || 'Accra, Ghana');
        setOppEducation(d.educationLevel || 'Needs verification');
        setOppFieldOfStudy(d.fieldOfStudy || '');
        setOppExperience(d.experienceLevel || '');
        setOppNationality(d.nationality || 'Ghanaian citizens only');
        setOppFunding(d.fundingType || 'Needs verification');
        setOppDeadline(d.deadline || 'Not found');
        setOppAppUrl(d.applicationUrl || '');
        setOppBenefits(d.benefits?.join(', ') || '');
        setOppRequirements(d.requirements?.join(', ') || '');
        setOppDocs(d.documentsRequired?.join(', ') || '');
      }

      // Populate Resource Form
      if (extracted.resourceData) {
        const r = extracted.resourceData;
        setResTitle(r.title || '');
        setResProvider(r.providerName || '');
        setResType(r.resourceType || 'course');
        setResCategory(r.category || 'Technology');
        setResDescription(r.description || '');
        setResLevel(r.level || 'Beginner');
        setResFormat(r.format || 'Self-paced Online');
        setResDuration(r.duration || '');
        setResCost(r.cost || 0);
        setResCurrency(r.currency || 'GHS');
        setResIsFree(r.isFree ?? true);
        setResHasCert(r.hasCertificate ?? true);
        setResSkills(r.skills?.join(', ') || '');
        setResPrereqs(r.prerequisites?.join(', ') || '');
        setResEnrollUrl(r.enrollmentUrl || '');
      }

      // Run duplicate check
      const duplicates = await AIAssistantService.checkForDuplicates(extracted);
      setDuplicateMatches(duplicates);

      // Reset verification checklist
      setChecklist({
        sourceLegitimate: false,
        organizationIdentifiable: !extracted.qualityFlags.some(f => f.type === 'unclear_organization'),
        deadlineVerified: false,
        eligibilityVerified: false,
        applicationUrlVerified: false,
        informationCurrent: !extracted.qualityFlags.some(f => f.type === 'possible_outdated')
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis failed. Please check inputs.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDiscard = () => {
    setResult(null);
    setDuplicateMatches([]);
    setSaveSuccessMsg(null);
  };

  const isFieldAttention = (val: string) => {
    return !val || val === 'Not found' || val === 'Needs verification';
  };

  const allChecklistConfirmed = Object.values(checklist).every(Boolean);

  const handleSaveAsDraft = async () => {
    if (!result) return;
    setSavingDraft(true);
    setSaveSuccessMsg(null);

    try {
      const isVerified = allChecklistConfirmed;
      const verificationStatus = isVerified ? 'verified' : 'needs_verification';
      const now = new Date().toISOString();

      if (activeFormType === 'opportunity') {
        const benefitsArray = oppBenefits.split(',').map(s => s.trim()).filter(Boolean);
        const reqsArray = oppRequirements.split(',').map(s => s.trim()).filter(Boolean);
        const docsArray = oppDocs.split(',').map(s => s.trim()).filter(Boolean);

        const newOpp: Opportunity = {
          id: 'opp_' + Math.random().toString(36).substring(2, 9),
          title: oppTitle.trim() || 'Untitled Extracted Opportunity',
          slug: (oppTitle || 'extracted-opp').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          description: oppDescription || 'Extracted via AI Assistant.',
          organizationId: 'org_extracted',
          organizationName: oppOrg || 'Organization Pending',
          category: oppCategory || 'Jobs',
          subcategory: oppSubcategory || undefined,
          opportunityType: oppType || 'Full-time',
          location: oppLocation || 'Ghana',
          country: 'Ghana',
          region: 'Greater Accra',
          educationLevel: oppEducation,
          fieldOfStudy: oppFieldOfStudy,
          experienceLevel: oppExperience,
          nationality: oppNationality,
          fundingType: oppFunding,
          benefits: benefitsArray.length > 0 ? benefitsArray : ['Stipend / Learning experience'],
          requirements: reqsArray.length > 0 ? reqsArray : ['Meet eligibility guidelines'],
          documentsRequired: docsArray,
          applicationUrl: oppAppUrl || 'https://',
          applicationMethod: 'online_form',
          deadline: oppDeadline.includes('-') ? oppDeadline : '2026-12-31T23:59:59Z',
          sourceUrl: result.sourceUrl || sourceUrl,
          status: 'draft', // MUST BE DRAFT PER SECTION 5!
          verificationStatus,
          lastVerifiedAt: isVerified ? now : undefined,
          verificationNotes: `AI Content Assistant extraction on ${new Date().toLocaleDateString('en-GB')}. ${isVerified ? 'Human verification checklist completed.' : 'Draft awaiting editorial verification.'}`,
          createdAt: now,
          updatedAt: now,
          views: 0,
          saves: 0,
          isDemo: false
        };

        await OpportunitiesService.saveOpportunity(newOpp, author);
        setSaveSuccessMsg(`Opportunity "${newOpp.title}" saved successfully as Draft! Redirecting to Opportunity Manager...`);
        setTimeout(() => {
          onNavigate('/admin/opportunities');
        }, 1500);
      } else {
        const skillsArray = resSkills.split(',').map(s => s.trim()).filter(Boolean);
        const prereqsArray = resPrereqs.split(',').map(s => s.trim()).filter(Boolean);

        const newRes: Resource = {
          id: 'res_' + Math.random().toString(36).substring(2, 9),
          title: resTitle.trim() || 'Untitled Extracted Course',
          slug: (resTitle || 'extracted-course').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          description: resDescription || 'Extracted via AI Assistant.',
          providerId: 'prov_extracted',
          providerName: resProvider || 'Provider Pending',
          resourceType: resType,
          category: resCategory || 'Technology',
          level: resLevel,
          format: resFormat,
          location: 'Online',
          duration: resDuration || 'Flexible',
          cost: resIsFree ? 0 : resCost,
          currency: resCurrency,
          isFree: resIsFree,
          hasCertificate: resHasCert,
          skills: skillsArray.length > 0 ? skillsArray : ['General Skills'],
          prerequisites: prereqsArray,
          enrollmentUrl: resEnrollUrl || 'https://',
          sourceUrl: result.sourceUrl || sourceUrl,
          status: 'draft', // MUST BE DRAFT PER SECTION 5!
          verificationStatus,
          lastVerifiedAt: isVerified ? now : undefined,
          verificationNotes: `AI Content Assistant extraction on ${new Date().toLocaleDateString('en-GB')}.`,
          createdAt: now,
          updatedAt: now,
          views: 0,
          saves: 0,
          isDemo: false
        };

        await ResourcesService.saveResource(newRes, author);
        setSaveSuccessMsg(`Learning Resource "${newRes.title}" saved successfully as Draft! Redirecting to Resource Manager...`);
        setTimeout(() => {
          onNavigate('/admin/resources');
        }, 1500);
      }
    } finally {
      setSavingDraft(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-space">
              AI Content Assistant
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Turn unstructured Ghanaian opportunity circulars into verified, structured draft records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strict Truth Engine Active</span>
          </span>
        </div>
      </div>

      {/* Trust & Safety Rule Banner (Section 11) */}
      <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-3xl text-xs text-amber-950 flex items-start gap-3 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold text-amber-900">
            Mandatory Credibility & Anti-Hallucination Policy
          </p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            The AI assistant will <strong>NEVER invent or fabricate</strong> missing deadlines, application links, tuition amounts, or eligibility requirements. Missing values are flagged as <em>&ldquo;Not found&rdquo;</em> or <em>&ldquo;Needs verification&rdquo;</em>. AI cannot publish directly; all items must be saved as <strong>Draft</strong> and verified by an administrator.
          </p>
        </div>
      </div>

      {/* INPUT WORKSPACE (Section 1) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-space flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-emerald-700" />
            <span>1. Ingest Source Information</span>
          </h2>
          <span className="text-[11px] text-slate-400">PDF, webpage, letterhead circular or raw text</span>
        </div>

        {/* Preset Sample Templates for instant testing */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick-Load Sample Announcements:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {DEMO_SOURCE_TEMPLATES.map((tmpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectTemplate(tmpl)}
                className="p-3 text-left rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer group"
              >
                <div className="font-bold text-slate-800 group-hover:text-purple-900 truncate">
                  {tmpl.title}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                  {tmpl.url}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {/* Source URL Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Official Announcement / Source URL</span>
              <span className="text-[10px] text-slate-400 font-normal">Optional if pasting text</span>
            </label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://tullowghana.com/careers/stem-scholarship-2026"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-purple-600 outline-hidden font-mono"
            />
          </div>

          {/* Pasted Text Content */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Pasted Announcement Text / PDF Extract *
            </label>
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste full job description, scholarship circular, entry requirements, deadlines, or curriculum syllabus here..."
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-purple-600 outline-hidden leading-relaxed font-mono"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Primary Action Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-700 hover:bg-purple-800 disabled:bg-purple-400 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{analyzing ? 'Extracting with Gemini AI...' : 'Analyze Source'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ANALYSIS RESULTS & DRAFT CREATION WORKSPACE */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* AI QUALITY CONTROL: "NEEDS ATTENTION" (Section 9) */}
          {result.qualityFlags.length > 0 && (
            <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <h3 className="text-sm font-bold text-rose-950 uppercase tracking-wider font-space">
                    Quality Control: Needs Attention ({result.qualityFlags.length} flags)
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                  Editorial Action Required
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {result.qualityFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="p-3 bg-white rounded-2xl border border-rose-200 shadow-2xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-900">{flag.label}</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.2 rounded bg-rose-100 text-rose-700">
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {flag.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DUPLICATE CHECK ALERT (Section 7) */}
          {duplicateMatches.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 text-xs text-amber-950 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Possible Duplicate Detected in Database ({duplicateMatches[0].confidence}% Match)</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Matches existing listing: <strong>&ldquo;{duplicateMatches[0].existingItem.title}&rdquo;</strong> ({duplicateMatches[0].existingItem.organizationName}). Review carefully to prevent duplicate postings.
              </p>
            </div>
          )}

          {/* SOURCE INFORMATION PRESERVATION (Section 6) */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Preserved Source Provenance
              </span>
              <p className="font-mono text-emerald-400 truncate max-w-xl">
                {result.sourceUrl || 'Pasted document without external URL'}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>Analyzed: {new Date(result.analyzedAt).toLocaleString('en-GB')}</span>
                <span>•</span>
                <span>AI Confidence: <strong>{result.confidenceScore}%</strong></span>
              </div>
            </div>

            {result.sourceUrl && (
              <a
                href={result.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <span>Visit Source Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* EXTRACTED INFORMATION EDITOR (Section 5) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-space">
                  Extracted Information (Review & Edit All Fields)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Yellow fields contain unknown values (&ldquo;Not found&rdquo; or &ldquo;Needs verification&rdquo;) and require your input.
                </p>
              </div>

              {/* Type Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveFormType('opportunity')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeFormType === 'opportunity'
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Opportunity Record
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormType('resource')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeFormType === 'resource'
                      ? 'bg-white text-indigo-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Course / Resource Record
                </button>
              </div>
            </div>

            {/* OPPORTUNITY FORM FIELDS */}
            {activeFormType === 'opportunity' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Opportunity Title *</label>
                    <input
                      type="text"
                      value={oppTitle}
                      onChange={(e) => setOppTitle(e.target.value)}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-medium outline-hidden ${
                        isFieldAttention(oppTitle)
                          ? 'bg-amber-50 border-amber-400 text-amber-900'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-emerald-600'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Organization / Host Institution *</label>
                    <input
                      type="text"
                      value={oppOrg}
                      onChange={(e) => setOppOrg(e.target.value)}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-medium outline-hidden ${
                        isFieldAttention(oppOrg)
                          ? 'bg-amber-50 border-amber-400 text-amber-900'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-emerald-600'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Category (AI Suggestion)</label>
                    <input
                      type="text"
                      value={oppCategory}
                      onChange={(e) => setOppCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Opportunity Type</label>
                    <input
                      type="text"
                      value={oppType}
                      onChange={(e) => setOppType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Application Deadline Date *</label>
                    <input
                      type="text"
                      value={oppDeadline}
                      onChange={(e) => setOppDeadline(e.target.value)}
                      placeholder="YYYY-MM-DD or Not found"
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-medium outline-hidden ${
                        isFieldAttention(oppDeadline)
                          ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-emerald-600'
                      }`}
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Official Application Portal URL *</label>
                    <input
                      type="url"
                      value={oppAppUrl}
                      onChange={(e) => setOppAppUrl(e.target.value)}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-mono outline-hidden ${
                        isFieldAttention(oppAppUrl)
                          ? 'bg-amber-50 border-amber-400 text-amber-900'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-emerald-600'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Education Requirement</label>
                    <input
                      type="text"
                      value={oppEducation}
                      onChange={(e) => setOppEducation(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Funding / Pay Level</label>
                    <input
                      type="text"
                      value={oppFunding}
                      onChange={(e) => setOppFunding(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Benefits & Stipend (Comma-separated)</label>
                    <input
                      type="text"
                      value={oppBenefits}
                      onChange={(e) => setOppBenefits(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Required Application Documents</label>
                    <input
                      type="text"
                      value={oppDocs}
                      onChange={(e) => setOppDocs(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Description</label>
                    <textarea
                      rows={4}
                      value={oppDescription}
                      onChange={(e) => setOppDescription(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* RESOURCE FORM FIELDS */}
            {activeFormType === 'resource' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Course / Resource Title *</label>
                    <input
                      type="text"
                      value={resTitle}
                      onChange={(e) => setResTitle(e.target.value)}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-medium outline-hidden ${
                        isFieldAttention(resTitle)
                          ? 'bg-amber-50 border-amber-400 text-amber-900'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-indigo-600'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Course Provider *</label>
                    <input
                      type="text"
                      value={resProvider}
                      onChange={(e) => setResProvider(e.target.value)}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-medium outline-hidden ${
                        isFieldAttention(resProvider)
                          ? 'bg-amber-50 border-amber-400 text-amber-900'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-indigo-600'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Category (AI Suggestion)</label>
                    <input
                      type="text"
                      value={resCategory}
                      onChange={(e) => setResCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Level</label>
                    <select
                      value={resLevel}
                      onChange={(e) => setResLevel(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Format</label>
                    <input
                      type="text"
                      value={resFormat}
                      onChange={(e) => setResFormat(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Enrollment Portal URL *</label>
                    <input
                      type="url"
                      value={resEnrollUrl}
                      onChange={(e) => setResEnrollUrl(e.target.value)}
                      className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-mono outline-hidden ${
                        isFieldAttention(resEnrollUrl)
                          ? 'bg-amber-50 border-amber-400 text-amber-900'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-indigo-600'
                      }`}
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Skills Taught (Comma-separated)</label>
                    <input
                      type="text"
                      value={resSkills}
                      onChange={(e) => setResSkills(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Description</label>
                    <textarea
                      rows={4}
                      value={resDescription}
                      onChange={(e) => setResDescription(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* HUMAN VERIFICATION CHECKLIST (Section 10) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-space">
                  Human Editorial Verification Checklist
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  setChecklist({
                    sourceLegitimate: true,
                    organizationIdentifiable: true,
                    deadlineVerified: true,
                    eligibilityVerified: true,
                    applicationUrlVerified: true,
                    informationCurrent: true
                  })
                }
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Mark All Verified
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Confirm each verification requirement before advancing this record to the editorial review pipeline:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.sourceLegitimate}
                  onChange={(e) => setChecklist({ ...checklist, sourceLegitimate: e.target.checked })}
                  className="w-4 h-4 text-emerald-700 rounded cursor-pointer"
                />
                <span className="font-semibold text-slate-800">1. Source is Legitimate & Institutional</span>
              </label>

              <label className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.organizationIdentifiable}
                  onChange={(e) => setChecklist({ ...checklist, organizationIdentifiable: e.target.checked })}
                  className="w-4 h-4 text-emerald-700 rounded cursor-pointer"
                />
                <span className="font-semibold text-slate-800">2. Organization is Identifiable</span>
              </label>

              <label className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.deadlineVerified}
                  onChange={(e) => setChecklist({ ...checklist, deadlineVerified: e.target.checked })}
                  className="w-4 h-4 text-emerald-700 rounded cursor-pointer"
                />
                <span className="font-semibold text-slate-800">3. Deadline Verified with Source</span>
              </label>

              <label className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.eligibilityVerified}
                  onChange={(e) => setChecklist({ ...checklist, eligibilityVerified: e.target.checked })}
                  className="w-4 h-4 text-emerald-700 rounded cursor-pointer"
                />
                <span className="font-semibold text-slate-800">4. Eligibility & Criteria Verified</span>
              </label>

              <label className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.applicationUrlVerified}
                  onChange={(e) => setChecklist({ ...checklist, applicationUrlVerified: e.target.checked })}
                  className="w-4 h-4 text-emerald-700 rounded cursor-pointer"
                />
                <span className="font-semibold text-slate-800">5. Application URL Tested & Functional</span>
              </label>

              <label className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={checklist.informationCurrent}
                  onChange={(e) => setChecklist({ ...checklist, informationCurrent: e.target.checked })}
                  className="w-4 h-4 text-emerald-700 rounded cursor-pointer"
                />
                <span className="font-semibold text-slate-800">6. Information is Current (Active Cohort)</span>
              </label>
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* DRAFT CREATION ACTIONS (Section 5) */}
          <div className="bg-slate-100 rounded-3xl p-6 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              <span className="font-bold text-slate-800 block">Strict Publishing Safeguard:</span>
              <span className="text-[11px] text-slate-500">
                Direct publishing from AI extraction is disabled. This record will be created as <strong>Draft</strong> for standard review.
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleDiscard}
                className="px-4 py-2.5 border border-slate-300 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Discard</span>
              </button>

              <button
                type="button"
                disabled={savingDraft}
                onClick={handleSaveAsDraft}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingDraft ? 'Saving Draft...' : 'Save as Draft'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
