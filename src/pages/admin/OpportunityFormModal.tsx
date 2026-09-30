import React, { useState, useEffect } from 'react';
import { Opportunity, OpportunityStatus, VerificationStatus, DuplicateMatch } from '../../types/database';
import { OPPORTUNITY_CATEGORIES, GHANA_REGIONS, EDUCATION_LEVELS } from '../../data/categories';
import { detectDuplicates } from '../../services/duplicateDetection';
import { DuplicateWarningModal } from './DuplicateWarningModal';
import { ImageUploadField } from '../../components/common/ImageUploadField';
import { FirebaseStorageService } from '../../services/firebase/storageService';
import {
  X,
  Check,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Send,
  Save,
  Globe,
  DollarSign,
  GraduationCap,
  Calendar,
  Briefcase,
  HelpCircle,
  Clock
} from 'lucide-react';

interface OpportunityFormModalProps {
  isOpen: boolean;
  opportunityToEdit?: Opportunity | null;
  existingOpportunities: Opportunity[];
  onClose: () => void;
  onSave: (opportunity: Opportunity, targetStatus: OpportunityStatus) => Promise<void>;
}

export const OpportunityFormModal: React.FC<OpportunityFormModalProps> = ({
  isOpen,
  opportunityToEdit,
  existingOpportunities,
  onClose,
  onSave
}) => {
  const isEditing = Boolean(opportunityToEdit);

  // Form tab state
  const [activeTab, setActiveTab] = useState<'basic' | 'eligibility' | 'benefits' | 'application' | 'verification'>('basic');

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [category, setCategory] = useState<string>('Jobs');
  const [subcategory, setSubcategory] = useState('');
  const [opportunityType, setOpportunityType] = useState('Full-time');
  const [description, setDescription] = useState('');

  // Eligibility
  const [educationLevel, setEducationLevel] = useState('Undergraduate (Bachelor)');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Entry Level');
  const [ageRequirement, setAgeRequirement] = useState('');
  const [nationality, setNationality] = useState('Ghanaian citizens only');
  const [location, setLocation] = useState('Accra, Ghana');
  const [region, setRegion] = useState('Greater Accra');

  // Benefits
  const [fundingType, setFundingType] = useState('Fully Funded');
  const [tuition, setTuition] = useState('100% Tuition Waiver');
  const [accommodation, setAccommodation] = useState('On-campus residence provided');
  const [stipend, setStipend] = useState('Monthly living allowance');
  const [travel, setTravel] = useState('Return economy flight included');
  const [otherBenefits, setOtherBenefits] = useState('Health insurance, visa support');
  const [benefitsString, setBenefitsString] = useState('Monthly allowance, Mentorship, Certificate');

  // Application
  const [applicationUrl, setApplicationUrl] = useState('https://');
  const [applicationMethod, setApplicationMethod] = useState<'online_form' | 'email' | 'external_portal' | 'in_person'>('online_form');
  const [documentsRequiredString, setDocumentsRequiredString] = useState('Curriculum Vitae (CV), Transcripts, Recommendation Letter');
  const [deadline, setDeadline] = useState('');

  // Verification
  const [sourceUrl, setSourceUrl] = useState('https://');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('verified');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [status, setStatus] = useState<OpportunityStatus>('draft');

  // Duplicate Check
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateMatch[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingSaveStatus, setPendingSaveStatus] = useState<OpportunityStatus | null>(null);
  const [saving, setSaving] = useState(false);

  // Photo State
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);
  const [currentImagePath, setCurrentImagePath] = useState<string | undefined>(undefined);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Initialize or populate form
  useEffect(() => {
    if (opportunityToEdit) {
      setTitle(opportunityToEdit.title || '');
      setSlug(opportunityToEdit.slug || '');
      setOrganizationName(opportunityToEdit.organizationName || '');
      setCategory(opportunityToEdit.category || 'Jobs');
      setSubcategory(opportunityToEdit.subcategory || '');
      setOpportunityType(opportunityToEdit.opportunityType || 'Full-time');
      setDescription(opportunityToEdit.description || '');

      setCurrentImageUrl(opportunityToEdit.imageUrl);
      setCurrentImagePath(opportunityToEdit.imagePath);
      setSelectedImageFile(null);
      setIsImageRemoved(false);
      setUploadProgress(null);
      setUploadError(null);

      setEducationLevel(opportunityToEdit.educationLevel || 'Undergraduate (Bachelor)');
      setFieldOfStudy(opportunityToEdit.fieldOfStudy || '');
      setExperienceLevel(opportunityToEdit.experienceLevel || 'Entry Level');
      setAgeRequirement(opportunityToEdit.ageRequirement || '');
      setNationality(opportunityToEdit.nationality || 'Ghanaian citizens only');
      setLocation(opportunityToEdit.location || 'Accra, Ghana');
      setRegion(opportunityToEdit.region || 'Greater Accra');

      setFundingType(opportunityToEdit.fundingType || 'Fully Funded');
      setTuition(opportunityToEdit.tuition || '');
      setAccommodation(opportunityToEdit.accommodation || '');
      setStipend(opportunityToEdit.stipend || '');
      setTravel(opportunityToEdit.travel || '');
      setOtherBenefits(opportunityToEdit.otherBenefits || '');
      setBenefitsString(opportunityToEdit.benefits?.join(', ') || '');

      setApplicationUrl(opportunityToEdit.applicationUrl || 'https://');
      setApplicationMethod(opportunityToEdit.applicationMethod || 'online_form');
      setDocumentsRequiredString(opportunityToEdit.documentsRequired?.join(', ') || '');
      setDeadline(opportunityToEdit.deadline ? opportunityToEdit.deadline.split('T')[0] : '');

      setSourceUrl(opportunityToEdit.sourceUrl || 'https://');
      setVerificationStatus(opportunityToEdit.verificationStatus || 'verified');
      setVerificationNotes(opportunityToEdit.verificationNotes || '');
      setStatus(opportunityToEdit.status || 'draft');
    } else {
      // Default new form state
      setTitle('');
      setSlug('');
      setOrganizationName('');
      setCategory('Jobs');
      setSubcategory('');
      setOpportunityType('Full-time');
      setDescription('');

      setCurrentImageUrl(undefined);
      setCurrentImagePath(undefined);
      setSelectedImageFile(null);
      setIsImageRemoved(false);
      setUploadProgress(null);
      setUploadError(null);

      setEducationLevel('Undergraduate (Bachelor)');
      setFieldOfStudy('');
      setExperienceLevel('Entry Level');
      setAgeRequirement('');
      setNationality('Ghanaian citizens only');
      setLocation('Accra, Ghana');
      setRegion('Greater Accra');
      setFundingType('Fully Funded');
      setTuition('');
      setAccommodation('');
      setStipend('');
      setTravel('');
      setOtherBenefits('');
      setBenefitsString('');
      setApplicationUrl('https://');
      setApplicationMethod('online_form');
      setDocumentsRequiredString('Curriculum Vitae (CV)');
      // Default deadline: 30 days from now
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setDeadline(d.toISOString().split('T')[0]);
      setSourceUrl('https://');
      setVerificationStatus('needs_verification');
      setVerificationNotes('');
      setStatus('draft');
    }
  }, [opportunityToEdit, isOpen]);

  // Real-time duplicate check
  useEffect(() => {
    if (!title || title.length < 5) {
      setDuplicateMatches([]);
      return;
    }

    const candidate: Partial<Opportunity> = {
      title,
      organizationName,
      applicationUrl,
      deadline
    };

    const matches = detectDuplicates(candidate, existingOpportunities, opportunityToEdit?.id);
    setDuplicateMatches(matches);
  }, [title, organizationName, applicationUrl, deadline, existingOpportunities, opportunityToEdit]);

  if (!isOpen) return null;

  const buildFinalObject = (targetStatus: OpportunityStatus): Opportunity => {
    const rawBenefits = benefitsString
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const rawDocs = documentsRequiredString
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const generatedSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const formattedDeadline = deadline ? (deadline.includes('T') ? deadline : `${deadline}T23:59:59Z`) : '';

    return {
      id: opportunityToEdit?.id || 'opp_' + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      slug: generatedSlug,
      description: description.trim() || 'No description provided.',
      organizationId: opportunityToEdit?.organizationId || 'org_manual',
      organizationName: organizationName.trim() || 'Institution to be confirmed',
      category,
      subcategory: subcategory.trim() || undefined,
      opportunityType,
      location: location.trim() || 'Ghana',
      country: 'Ghana',
      region,
      educationLevel,
      fieldOfStudy: fieldOfStudy.trim() || undefined,
      experienceLevel,
      ageRequirement: ageRequirement.trim() || undefined,
      nationality,
      fundingType,
      tuition: tuition.trim() || undefined,
      accommodation: accommodation.trim() || undefined,
      stipend: stipend.trim() || undefined,
      travel: travel.trim() || undefined,
      otherBenefits: otherBenefits.trim() || undefined,
      benefits: rawBenefits.length > 0 ? rawBenefits : ['Official Certificate / Recognition'],
      requirements: ['Valid identity documentation', 'Meet stated minimum eligibility threshold'],
      documentsRequired: rawDocs,
      applicationUrl: applicationUrl.trim(),
      applicationMethod,
      deadline: formattedDeadline,
      sourceUrl: sourceUrl.trim() || undefined,
      imageUrl: isImageRemoved ? undefined : currentImageUrl,
      imagePath: isImageRemoved ? undefined : currentImagePath,
      status: targetStatus,
      verificationStatus,
      lastVerifiedAt: new Date().toISOString(),
      verificationNotes: verificationNotes.trim() || undefined,
      createdAt: opportunityToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: opportunityToEdit?.views || 0,
      saves: opportunityToEdit?.saves || 0
    };
  };

  const handleTriggerSave = async (targetStatus: OpportunityStatus) => {
    if (!title.trim()) {
      alert('Please enter a title for the opportunity.');
      setActiveTab('basic');
      return;
    }

    // If publishing and duplicate detected, show warning modal first
    if (targetStatus === 'published' && duplicateMatches.length > 0) {
      setPendingSaveStatus(targetStatus);
      setShowDuplicateModal(true);
      return;
    }

    await executeSave(targetStatus);
  };

  const executeSave = async (targetStatus: OpportunityStatus) => {
    setSaving(true);
    setUploadError(null);
    let newUploadedPath: string | null = null;
    try {
      const finalOpp = buildFinalObject(targetStatus);

      // Handle image upload if a new file was chosen
      if (selectedImageFile) {
        setUploadProgress(10);
        const uploadRes = await FirebaseStorageService.uploadOpportunityPhoto(
          finalOpp.id,
          selectedImageFile,
          (pct) => setUploadProgress(pct)
        );
        newUploadedPath = uploadRes.imagePath;
        finalOpp.imageUrl = uploadRes.imageUrl;
        finalOpp.imagePath = uploadRes.imagePath;
      } else if (isImageRemoved) {
        finalOpp.imageUrl = undefined;
        finalOpp.imagePath = undefined;
      }

      await onSave(finalOpp, targetStatus);

      // If replacement succeeded, clean up previous image
      if (selectedImageFile && currentImagePath && currentImagePath !== newUploadedPath) {
        await FirebaseStorageService.deleteFile(currentImagePath);
      } else if (isImageRemoved && currentImagePath) {
        await FirebaseStorageService.deleteFile(currentImagePath);
      }

      onClose();
    } catch (err: any) {
      console.error('[Opportunity Save Error]', err);
      // Clean up orphaned upload if saving failed
      if (newUploadedPath) {
        await FirebaseStorageService.deleteFile(newUploadedPath);
      }
      setUploadError(err.message || 'The item could not be saved. Your existing photo has not been deleted.');
    } finally {
      setSaving(false);
      setUploadProgress(null);
      setShowDuplicateModal(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-space">
                  {isEditing ? 'Edit Opportunity Listing' : 'Create Opportunity'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete all sections to ensure students & jobseekers have complete information.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Upload or Save Error Banner */}
          {uploadError && (
            <div className="bg-rose-50 border-b border-rose-200 px-5 py-2.5 flex items-center justify-between text-xs text-rose-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                className="text-xs font-bold text-rose-700 hover:text-rose-900 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Duplicate Detected Real-time Banner */}
          {duplicateMatches.length > 0 && (
            <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Possible duplicate detected:</strong> Shares attributes with &ldquo;
                  {duplicateMatches[0].existingItem.title}&rdquo; ({duplicateMatches[0].confidence}% match).
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDuplicateModal(true)}
                className="font-bold underline text-amber-800 hover:text-amber-950 cursor-pointer"
              >
                Inspect
              </button>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-white px-5 gap-2 overflow-x-auto text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'basic'
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. Basic Info</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('eligibility')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'eligibility'
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>2. Eligibility</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('benefits')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'benefits'
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>3. Benefits</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('application')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'application'
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>4. Application</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('verification')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'verification'
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>5. Verification</span>
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* TAB 1: BASIC INFORMATION */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      Opportunity Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. 2026/2027 Tullow Oil Tertiary STEM Scholarship"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Organization / Host Institution *
                    </label>
                    <input
                      type="text"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="e.g. Tullow Ghana Ltd / KNUST"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    >
                      {OPPORTUNITY_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Opportunity Type
                    </label>
                    <input
                      type="text"
                      value={opportunityType}
                      onChange={(e) => setOpportunityType(e.target.value)}
                      placeholder="e.g. Full-time, Partial Scholarship, Internship, Fellowship"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Subcategory
                    </label>
                    <input
                      type="text"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      placeholder="e.g. STEM, Renewable Energy, Finance, Health"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      Comprehensive Description & Scope
                    </label>
                    <textarea
                      rows={5}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide full description of the opportunity, rotational plan, eligibility details, and application instructions..."
                      className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden leading-relaxed"
                    />
                  </div>

                  {/* Resource/Opportunity Photo Upload Section */}
                  <div className="space-y-1 md:col-span-2 pt-2 border-t border-slate-200">
                    <ImageUploadField
                      label="Opportunity Photo"
                      currentImageUrl={currentImageUrl}
                      onFileSelect={(file) => {
                        setSelectedImageFile(file);
                        setIsImageRemoved(false);
                      }}
                      onRemoveCurrent={() => {
                        setSelectedImageFile(null);
                        setIsImageRemoved(true);
                      }}
                      uploadProgress={uploadProgress}
                      isRemoved={isImageRemoved}
                      disabled={saving}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ELIGIBILITY */}
            {activeTab === 'eligibility' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Education Level
                    </label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    >
                      {EDUCATION_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                      <option value="Any">Any Level / Open</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Field of Study
                    </label>
                    <input
                      type="text"
                      value={fieldOfStudy}
                      onChange={(e) => setFieldOfStudy(e.target.value)}
                      placeholder="e.g. Computer Science, Petroleum Engineering, Agriculture"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Experience Requirement
                    </label>
                    <input
                      type="text"
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      placeholder="e.g. Entry Level, 0-2 Years, Final Year Student"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Age Requirement
                    </label>
                    <input
                      type="text"
                      value={ageRequirement}
                      onChange={(e) => setAgeRequirement(e.target.value)}
                      placeholder="e.g. Under 30 years as of Dec 2026, 18-35"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Nationality / Residency
                    </label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="e.g. Ghanaian citizens only, West African ECOWAS"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Primary Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Accra, Ghana / Hybrid"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      Region in Ghana
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    >
                      {GHANA_REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                      <option value="Nationwide">Nationwide (All Regions)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BENEFITS */}
            {activeTab === 'benefits' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Funding Classification
                    </label>
                    <input
                      type="text"
                      value={fundingType}
                      onChange={(e) => setFundingType(e.target.value)}
                      placeholder="e.g. Fully Funded, Partial, Competitive Salary, Unpaid"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Tuition Coverage
                    </label>
                    <input
                      type="text"
                      value={tuition}
                      onChange={(e) => setTuition(e.target.value)}
                      placeholder="e.g. 100% Tuition & Academic user facility fees"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Accommodation
                    </label>
                    <input
                      type="text"
                      value={accommodation}
                      onChange={(e) => setAccommodation(e.target.value)}
                      placeholder="e.g. Hostel accommodation paid directly to university"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Stipend / Allowance
                    </label>
                    <input
                      type="text"
                      value={stipend}
                      onChange={(e) => setStipend(e.target.value)}
                      placeholder="e.g. GH₵ 3,500 monthly net stipend"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Travel & Relocation
                    </label>
                    <input
                      type="text"
                      value={travel}
                      onChange={(e) => setTravel(e.target.value)}
                      placeholder="e.g. Local transport allowance, Visa & flights"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Other Benefits
                    </label>
                    <input
                      type="text"
                      value={otherBenefits}
                      onChange={(e) => setOtherBenefits(e.target.value)}
                      placeholder="e.g. Health insurance, Laptop grant, Book stipend"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      Key Highlights / Benefits Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={benefitsString}
                      onChange={(e) => setBenefitsString(e.target.value)}
                      placeholder="e.g. Full Tuition, Health Insurance, Monthly Stipend, Mentorship"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: APPLICATION */}
            {activeTab === 'application' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      Application URL / Link *
                    </label>
                    <input
                      type="url"
                      required
                      value={applicationUrl}
                      onChange={(e) => setApplicationUrl(e.target.value)}
                      placeholder="https://tullowscholarships.org/apply"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Application Method
                    </label>
                    <select
                      value={applicationMethod}
                      onChange={(e) => setApplicationMethod(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    >
                      <option value="online_form">Direct Online Portal / Form</option>
                      <option value="external_portal">External Partner Portal</option>
                      <option value="email">Email Application (CV & Docs)</option>
                      <option value="in_person">In-Person Submission</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Application Deadline Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      Required Documents (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={documentsRequiredString}
                      onChange={(e) => setDocumentsRequiredString(e.target.value)}
                      placeholder="e.g. CV / Resume, WASSCE Certificate, University Transcript, Recommendation Letter"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: VERIFICATION */}
            {activeTab === 'verification' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      Official Source / Announcement URL
                    </label>
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://knust.edu.gh/announcements/mastercard-foundation-2026"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Verification Status
                    </label>
                    <select
                      value={verificationStatus}
                      onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden font-medium"
                    >
                      <option value="verified">Verified (Checked against official source)</option>
                      <option value="needs_verification">Needs Verification (Pending review)</option>
                      <option value="warning">Warning (Exercise caution / Discrepancy)</option>
                      <option value="closed">Closed (Expired)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Last Verified Timestamp
                    </label>
                    <input
                      type="text"
                      disabled
                      value={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      Verification Notes & Audit Remarks
                    </label>
                    <textarea
                      rows={3}
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder="e.g. Cross-referenced with the university registrar's circular. Application portal tested and operational."
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Footer with Workflow Actions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Workflow State: <strong className="uppercase text-slate-800">{status}</strong></span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {/* 1. Save as Draft */}
              <button
                type="button"
                disabled={saving}
                onClick={() => handleTriggerSave('draft')}
                className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-slate-600" />
                <span>Save Draft</span>
              </button>

              {/* 2. Submit for Review */}
              <button
                type="button"
                disabled={saving}
                onClick={() => handleTriggerSave('pending_review')}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit for Review</span>
              </button>

              {/* 3. Publish Directly */}
              <button
                type="button"
                disabled={saving}
                onClick={() => handleTriggerSave('published')}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Publish</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Duplicate Confirmation Modal */}
      {showDuplicateModal && duplicateMatches.length > 0 && (
        <DuplicateWarningModal
          isOpen={showDuplicateModal}
          candidateTitle={title}
          matches={duplicateMatches}
          onConfirmPublish={() => executeSave(pendingSaveStatus || 'published')}
          onCancel={() => setShowDuplicateModal(false)}
        />
      )}
    </>
  );
};
