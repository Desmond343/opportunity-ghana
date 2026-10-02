import React, { useState, useEffect } from 'react';
import { Resource, OpportunityStatus, SubmissionStatus, VerificationStatus, ResourceType, ResourceCategory } from '../../types/database';
import { RESOURCE_CATEGORIES, RESOURCE_TYPES } from '../../data/categories';
import { ImageUploadField } from '../../components/common/ImageUploadField';
import { FirebaseStorageService } from '../../services/firebase/storageService';
import {
  X,
  Check,
  Save,
  Send,
  BookOpen,
  Award,
  Globe,
  DollarSign,
  ShieldCheck,
  Clock,
  Layers,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface ResourceFormModalProps {
  isOpen: boolean;
  resourceToEdit?: Resource | null;
  onClose: () => void;
  onSave: (resource: Resource, targetStatus: OpportunityStatus | SubmissionStatus) => Promise<void>;
}

export const ResourceFormModal: React.FC<ResourceFormModalProps> = ({
  isOpen,
  resourceToEdit,
  onClose,
  onSave
}) => {
  const isEditing = Boolean(resourceToEdit);

  // Tabs
  const [activeTab, setActiveTab] = useState<'details' | 'curriculum' | 'pricing' | 'verification'>('details');

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [providerName, setProviderName] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('course');
  const [category, setCategory] = useState<string>('Technology');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'>('Beginner');
  const [format, setFormat] = useState<'Self-paced Online' | 'Live Online' | 'In-person' | 'Hybrid'>('Self-paced Online');
  const [location, setLocation] = useState('Online');
  const [duration, setDuration] = useState('6 Months (10 hrs/week)');

  // Pricing & Certification
  const [cost, setCost] = useState<number>(0);
  const [currency, setCurrency] = useState('GHS');
  const [isFree, setIsFree] = useState(true);
  const [hasCertificate, setHasCertificate] = useState(true);
  const [financialAid, setFinancialAid] = useState(true);

  // Skills & URLs
  const [skillsString, setSkillsString] = useState('Python, Data Analysis, SQL, Spreadsheets');
  const [prerequisitesString, setPrerequisitesString] = useState('Basic computer literacy');
  const [enrollmentUrl, setEnrollmentUrl] = useState('https://');
  const [sourceUrl, setSourceUrl] = useState('https://');

  // Verification & Status
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('verified');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [status, setStatus] = useState<OpportunityStatus | SubmissionStatus>('published');
  const [saving, setSaving] = useState(false);

  // Photo State
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);
  const [currentImagePath, setCurrentImagePath] = useState<string | undefined>(undefined);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (resourceToEdit) {
      setTitle(resourceToEdit.title || '');
      setSlug(resourceToEdit.slug || '');
      setProviderName(resourceToEdit.providerName || '');
      setResourceType(resourceToEdit.resourceType || 'course');
      setCategory(resourceToEdit.category || 'Technology');
      setSubcategory(resourceToEdit.subcategory || '');
      setDescription(resourceToEdit.description || '');
      setLevel(resourceToEdit.level || 'Beginner');
      setFormat(resourceToEdit.format || 'Self-paced Online');
      setLocation(resourceToEdit.location || 'Online');
      setDuration(resourceToEdit.duration || '');

      setCurrentImageUrl(resourceToEdit.imageUrl);
      setCurrentImagePath(resourceToEdit.imagePath);
      setSelectedImageFile(null);
      setIsImageRemoved(false);
      setUploadProgress(null);
      setUploadError(null);

      setCost(resourceToEdit.cost || 0);
      setCurrency(resourceToEdit.currency || 'GHS');
      setIsFree(resourceToEdit.isFree ?? true);
      setHasCertificate(resourceToEdit.hasCertificate ?? true);
      setFinancialAid(resourceToEdit.financialAid ?? false);

      setSkillsString(resourceToEdit.skills?.join(', ') || '');
      setPrerequisitesString(resourceToEdit.prerequisites?.join(', ') || '');
      setEnrollmentUrl(resourceToEdit.enrollmentUrl || 'https://');
      setSourceUrl(resourceToEdit.sourceUrl || 'https://');

      setVerificationStatus(resourceToEdit.verificationStatus || 'verified');
      setVerificationNotes(resourceToEdit.verificationNotes || '');
      setStatus(resourceToEdit.status || 'published');
    } else {
      setTitle('');
      setSlug('');
      setProviderName('');
      setResourceType('course');
      setCategory('Technology');
      setSubcategory('');
      setDescription('');
      setLevel('Beginner');
      setFormat('Self-paced Online');
      setLocation('Online');
      setDuration('4 Weeks');

      setCurrentImageUrl(undefined);
      setCurrentImagePath(undefined);
      setSelectedImageFile(null);
      setIsImageRemoved(false);
      setUploadProgress(null);
      setUploadError(null);

      setCost(0);
      setCurrency('GHS');
      setIsFree(true);
      setHasCertificate(true);
      setFinancialAid(true);
      setSkillsString('');
      setPrerequisitesString('');
      setEnrollmentUrl('https://');
      setSourceUrl('https://');
      setVerificationStatus('verified');
      setVerificationNotes('');
      setStatus('draft');
    }
  }, [resourceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (targetStatus: OpportunityStatus | SubmissionStatus) => {
    if (!title.trim()) {
      alert('Please provide a course or resource title.');
      setActiveTab('details');
      return;
    }

    setSaving(true);
    setUploadError(null);
    let newUploadedPath: string | null = null;
    try {
      const skills = skillsString
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const prerequisites = prerequisitesString
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const generatedSlug =
        slug.trim() ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

      const finalResource: Resource = {
        id: resourceToEdit?.id || 'res_' + Math.random().toString(36).substring(2, 9),
        title: title.trim(),
        slug: generatedSlug,
        description: description.trim() || 'Comprehensive skills training resource.',
        providerId: resourceToEdit?.providerId || 'prov_manual',
        providerName: providerName.trim() || 'Institution to be confirmed',
        resourceType,
        category,
        subcategory: subcategory.trim() || undefined,
        level,
        format,
        location: location.trim() || 'Online',
        duration: duration.trim() || 'Flexible',
        cost: isFree ? 0 : Number(cost),
        currency,
        isFree,
        hasCertificate,
        financialAid,
        skills: skills.length > 0 ? skills : ['General Development'],
        prerequisites: prerequisites.length > 0 ? prerequisites : undefined,
        enrollmentUrl: enrollmentUrl.trim(),
        sourceUrl: sourceUrl.trim() || undefined,
        imageUrl: isImageRemoved ? undefined : currentImageUrl,
        imagePath: isImageRemoved ? undefined : currentImagePath,
        status: targetStatus,
        verificationStatus,
        lastVerifiedAt: new Date().toISOString(),
        verificationNotes: verificationNotes.trim() || undefined,
        createdAt: resourceToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: resourceToEdit?.views || 0,
        saves: resourceToEdit?.saves || 0
      };

      // Upload new image if selected
      if (selectedImageFile) {
        setUploadProgress(0);
        try {
          const uploadRes = await FirebaseStorageService.uploadResourcePhoto(
            finalResource.id,
            selectedImageFile,
            (pct) => setUploadProgress(pct)
          );
          newUploadedPath = uploadRes.imagePath;
          finalResource.imageUrl = uploadRes.imageUrl;
          finalResource.imagePath = uploadRes.imagePath;
        } catch (imgErr: any) {
          console.error('[Resource Form Image Upload Error]', imgErr);
          setUploadError('Image upload failed. Please try again.');
          return;
        }
      } else if (isImageRemoved) {
        finalResource.imageUrl = undefined;
        finalResource.imagePath = undefined;
      }

      try {
        await onSave(finalResource, targetStatus);
      } catch (saveErr: any) {
        console.error('[Resource Form Save Error]', saveErr);
        if (newUploadedPath) {
          await FirebaseStorageService.deleteFile(newUploadedPath);
        }
        setUploadError(saveErr?.message || 'The resource could not be published. Please try again.');
        return;
      }

      // Clean up previous image if replaced or removed
      if (selectedImageFile && currentImagePath && currentImagePath !== newUploadedPath) {
        await FirebaseStorageService.deleteFile(currentImagePath);
      } else if (isImageRemoved && currentImagePath) {
        await FirebaseStorageService.deleteFile(currentImagePath);
      }

      onClose();
    } catch (err: any) {
      console.error('[Resource Save Error]', err);
      if (newUploadedPath) {
        await FirebaseStorageService.deleteFile(newUploadedPath);
      }
      setUploadError(err.message || 'The resource could not be published. Please try again.');
    } finally {
      setSaving(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-indigo-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-space">
                {isEditing ? 'Edit Learning Resource' : 'Create Learning Resource'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register verified courses, professional certificates, bootcamps, and workshops.
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-5 gap-2 overflow-x-auto text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-900 bg-indigo-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Course Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'curriculum'
                ? 'border-indigo-600 text-indigo-900 bg-indigo-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Skills & Format</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'pricing'
                ? 'border-indigo-600 text-indigo-900 bg-indigo-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>3. Cost & Access</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('verification')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'verification'
                ? 'border-indigo-600 text-indigo-900 bg-indigo-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. Verification & Audit</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Course / Resource Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Google Cloud Career Launchpad: Data Analytics Track"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Provider / Organization *</label>
                  <input
                    type="text"
                    required
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    placeholder="e.g. ALX Africa, Coursera, Meltwater MEST"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Resource Type</label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                  >
                    <option value="course">Online Course</option>
                    <option value="certification">Professional Certification</option>
                    <option value="bootcamp">Intensive Bootcamp</option>
                    <option value="training">Skills Training Cohort</option>
                    <option value="workshop">Interactive Workshop</option>
                    <option value="learning_resource">Toolkit / Resource Guide</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                  >
                    {RESOURCE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Subcategory</label>
                  <input
                    type="text"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g. Generative AI, Cloud Infrastructure, Agile"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Description & Syllabus Summary</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the curriculum modules, learning outcomes, hands-on capstone project, and career benefits..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden leading-relaxed"
                />
              </div>

              {/* Resource Photo Upload Section */}
              <div className="pt-2 border-t border-slate-200">
                <ImageUploadField
                  label="Resource Photo"
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
          )}

          {/* TAB 2: SKILLS & FORMAT */}
          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Proficiency Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                  >
                    <option value="Beginner">Beginner (No prior background needed)</option>
                    <option value="Intermediate">Intermediate (Foundational skills required)</option>
                    <option value="Advanced">Advanced (Specialist / Senior)</option>
                    <option value="All Levels">All Levels (Comprehensive track)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Delivery Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                  >
                    <option value="Self-paced Online">Self-paced Online (Flexible schedule)</option>
                    <option value="Live Online">Live Online (Scheduled webinars & labs)</option>
                    <option value="Hybrid">Hybrid (Online + In-person workshops)</option>
                    <option value="In-person">In-person (Physical classroom / Campus)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Location / Campus</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Online, Accra Campus, Kumasi Innovation Hub"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Estimated Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 12 Weeks (8 hrs/week) or 6 Months"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Skills Taught (Comma-separated)</label>
                  <input
                    type="text"
                    value={skillsString}
                    onChange={(e) => setSkillsString(e.target.value)}
                    placeholder="e.g. SQL, Data Visualization, Tableau, Cloud Storage, Git"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Prerequisites (Comma-separated)</label>
                  <input
                    type="text"
                    value={prerequisitesString}
                    onChange={(e) => setPrerequisitesString(e.target.value)}
                    placeholder="e.g. High school diploma, Laptop with 8GB RAM, Basic English proficiency"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRICING & ENROLLMENT */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Free of Charge?</span>
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500">
                    If checked, course is marked with a Free badge across catalog filters.
                  </p>
                </div>

                <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Includes Certificate?</span>
                    <input
                      type="checkbox"
                      checked={hasCertificate}
                      onChange={(e) => setHasCertificate(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Offers recognized completion diploma, digital badge or credential.
                  </p>
                </div>

                {!isFree && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Cost / Fee Amount</label>
                      <input
                        type="number"
                        min="0"
                        value={cost}
                        onChange={(e) => setCost(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Currency</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                      >
                        <option value="GHS">GHS (Ghanaian Cedi)</option>
                        <option value="USD">USD (US Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                        <option value="GBP">GBP (British Pound)</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 md:col-span-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Financial Aid / Scholarship Available?</span>
                    <input
                      type="checkbox"
                      checked={financialAid}
                      onChange={(e) => setFinancialAid(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                    />
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Provides assistance path (e.g. Coursera Financial Aid for Ghanaian learners).
                  </p>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Enrollment / Application URL *</label>
                  <input
                    type="url"
                    required
                    value={enrollmentUrl}
                    onChange={(e) => setEnrollmentUrl(e.target.value)}
                    placeholder="https://coursera.org/professional-certificates/google-data-analytics"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VERIFICATION */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Official Announcement / Source URL</label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://alxafrica.com/programmes"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Verification Status</label>
                  <select
                    value={verificationStatus}
                    onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden font-medium"
                  >
                    <option value="verified">Verified (Checked against institutional provider)</option>
                    <option value="needs_verification">Needs Verification (Pending review)</option>
                    <option value="warning">Warning (Paywall discrepancy or unconfirmed)</option>
                    <option value="closed">Closed (Enrollment cohort ended)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Last Verified Date</label>
                  <input
                    type="text"
                    disabled
                    value={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 font-mono"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Verification Notes</label>
                  <textarea
                    rows={3}
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="e.g. Verified zero-cost access via Coursera Ghana youth initiative. Link tested and active."
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>State: <strong className="uppercase text-slate-800">{status}</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('draft')}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-slate-600" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('pending_review')}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Review</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave('published')}
              className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Publish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
