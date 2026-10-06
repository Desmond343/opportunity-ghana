import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { OpportunitiesService } from '../services/opportunitiesService';
import { FirebaseStorageService } from '../services/firebase/storageService';
import { OPPORTUNITY_CATEGORIES, GHANA_REGIONS, EDUCATION_LEVELS } from '../data/categories';
import { ImageUploadField } from '../components/common/ImageUploadField';
import { Opportunity } from '../types/database';
import { DeadlineBadge } from '../components/common/DeadlineBadge';
import { calculateDeadlineInfo } from '../services/deadlineService';
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Lock,
  Globe,
  Building,
  GraduationCap,
  Calendar,
  Briefcase,
  ExternalLink,
  DollarSign
} from 'lucide-react';

interface SubmitOpportunityPageProps {
  onNavigate: (path: string) => void;
}

export const SubmitOpportunityPage: React.FC<SubmitOpportunityPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  // Basic Information
  const [title, setTitle] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [category, setCategory] = useState<string>('Scholarships');
  const [subcategory, setSubcategory] = useState('');
  const [opportunityType, setOpportunityType] = useState('Full-time');
  const [description, setDescription] = useState('');

  // Location & Eligibility
  const [location, setLocation] = useState('Accra, Ghana');
  const [region, setRegion] = useState('Greater Accra');
  const [country, setCountry] = useState('Ghana');
  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [fieldOfStudy, setFieldOfStudy] = useState('All Fields of Study');
  const [nationality, setNationality] = useState('Ghanaian citizens only');

  // Benefits & Funding
  const [fundingType, setFundingType] = useState('Fully Funded');
  const [tuition, setTuition] = useState('100% Full Tuition Waiver');
  const [stipend, setStipend] = useState('Monthly Living Stipend');
  const [accommodation, setAccommodation] = useState('Campus Residence Included');
  const [benefitsString, setBenefitsString] = useState('Mentorship, Career coaching, Health insurance');

  // Application Details
  const [applicationUrl, setApplicationUrl] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [deadline, setDeadline] = useState('');
  const [applicationInstructions, setApplicationInstructions] = useState('');
  const [requirementsString, setRequirementsString] = useState('Valid Ghanaian Passport or Ghana Card, Academic Transcripts, Recommendation Letter');
  const [contactInfo, setContactInfo] = useState('');

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Authentication Wall
  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <button
          onClick={() => onNavigate('/opportunities')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Opportunities</span>
        </button>

        <div className="bg-white dark:bg-[#141B29] rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 shadow-2xs text-center space-y-6 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-space">
              Sign In to Submit an Opportunity
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              We require community contributors and partner institutions to be signed in to prevent spam, maintain verification integrity, and link your submitted scholarships, jobs, or programs to your dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('/login')}
              className="w-full sm:w-auto px-6 py-3 bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
            >
              Sign In to Your Account
            </button>
            <button
              onClick={() => onNavigate('/signup')}
              className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-2xl shadow-2xs transition-colors cursor-pointer"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Submission Completed Confirmation Screen (Requirement 3)
  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="bg-white dark:bg-[#141B29] rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-2xs text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
              Pending Admin Review
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-space pt-1">
              Your submission has been received and is awaiting review.
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{currentUser.name}</strong>. Your submitted opportunity, <strong>"{title}"</strong>, has been recorded into our editorial queue with status <span className="font-bold text-amber-700 dark:text-amber-400">Pending Review</span>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-left text-xs text-slate-600 dark:text-slate-300 space-y-2 max-w-md mx-auto">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
              <span>What happens next?</span>
            </div>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>Our verification team validates the hosting provider, official application links, and deadlines.</li>
              <li>An administrator will review and either <strong>Approve & Publish</strong> or contact you.</li>
              <li>Once approved, your opportunity will automatically become publicly visible and searchable on Opportunity Ghana.</li>
              <li>You can monitor the live status of this submission directly from your profile.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('/profile')}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              View My Submissions
            </button>
            <button
              onClick={() => {
                setTitle('');
                setDescription('');
                setApplicationUrl('');
                setDeadline('');
                setSubmittedSuccess(false);
                setSelectedFile(null);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Submit Another Opportunity
            </button>
            <button
              onClick={() => onNavigate('/opportunities')}
              className="w-full sm:w-auto px-5 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Back to Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!title.trim()) {
      setFormError('Please provide an opportunity title.');
      return;
    }
    if (!organizationName.trim()) {
      setFormError('Please specify the offering institution or organization name.');
      return;
    }
    if (!category.trim()) {
      setFormError('Please select a category.');
      return;
    }
    if (!description.trim() || description.trim().length < 25) {
      setFormError('Please provide an informative description of at least 25 characters.');
      return;
    }
    if (!applicationUrl.trim() || !applicationUrl.startsWith('http')) {
      setFormError('Please provide a valid application URL beginning with http:// or https://');
      return;
    }
    if (!deadline.trim()) {
      setFormError('Please specify an application deadline date.');
      return;
    }

    try {
      setIsSubmitting(true);

      const tempId = 'opp_sub_' + Date.now();
      let uploadedImageUrl: string | undefined = undefined;
      let uploadedImagePath: string | undefined = undefined;

      // Handle image upload if selected
      if (selectedFile) {
        setUploadProgress(0);
        const uploadResult = await FirebaseStorageService.uploadOpportunityPhoto(
          tempId,
          selectedFile,
          (progress) => setUploadProgress(progress)
        );
        uploadedImageUrl = uploadResult.imageUrl;
        uploadedImagePath = uploadResult.imagePath;
      }

      const benefits = benefitsString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const requirements = requirementsString
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const opportunityData: Partial<Opportunity> = {
        title: title.trim(),
        organizationName: organizationName.trim(),
        category,
        subcategory: subcategory.trim() || undefined,
        opportunityType,
        location: location.trim(),
        region: region.trim(),
        country: country.trim(),
        educationLevel,
        fieldOfStudy: fieldOfStudy.trim(),
        nationality,
        fundingType,
        tuition: tuition.trim(),
        stipend: stipend.trim(),
        accommodation: accommodation.trim(),
        benefits,
        requirements,
        description: description.trim(),
        applicationUrl: applicationUrl.trim(),
        officialApplicationUrl: applicationUrl.trim(),
        sourceUrl: sourceUrl.trim() || applicationUrl.trim(),
        deadline,
        deadlineAt: deadline ? (deadline.includes('T') ? deadline : `${deadline}T23:59:59Z`) : undefined,
        deadlineTimezone: 'GMT',
        applicationInstructions: applicationInstructions.trim(),
        imageUrl: uploadedImageUrl,
        imagePath: uploadedImagePath,
        contactInfo: contactInfo.trim()
      };

      await OpportunitiesService.submitUserOpportunity(opportunityData, {
        uid: currentUser.id,
        email: currentUser.email,
        name: currentUser.name
      });

      setSubmittedSuccess(true);
    } catch (err: any) {
      console.error('Error submitting opportunity:', err);
      setFormError(err?.message || 'Failed to submit opportunity. Please check all fields.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <button
            onClick={() => onNavigate('/opportunities')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Opportunities</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-space">
            Submit an Opportunity for Review
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Know of a genuine scholarship, corporate job, internship cohort, or research fellowship open to Ghanaians? Submit it for administrative verification.
          </p>
        </div>

        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-300 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
          <span>Reviewed before publishing</span>
        </div>
      </div>

      {formError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 rounded-2xl text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#141B29] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-8 transition-colors">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Compass className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-space">
              1. Basic Opportunity Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Opportunity Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mastercard Foundation Scholars Program at KNUST (2026/2027)"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Organization / Provider Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="e.g. Kwame Nkrumah University of Science and Technology"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              >
                {OPPORTUNITY_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.name} className="dark:bg-slate-900">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Opportunity Type</label>
              <input
                type="text"
                value={opportunityType}
                onChange={(e) => setOpportunityType(e.target.value)}
                placeholder="e.g. Full-time, Fully Funded, Undergraduate, Internship"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Subcategory / Industry Tag</label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Engineering, Agriculture, Healthcare, Tech"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Comprehensive Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the opportunity, who should apply, the mission, scope of activities, and what makes it valuable..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Location & Eligibility */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Globe className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-space">
              2. Location & Applicant Eligibility
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">City / Institution Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kumasi, Ghana / Remote"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Ghana Region Focus</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              >
                {GHANA_REGIONS.map((r) => (
                  <option key={r} value={r} className="dark:bg-slate-900">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Ghana, United Kingdom, USA"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Education Level Required</label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              >
                {EDUCATION_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl} className="dark:bg-slate-900">
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Field of Study</label>
              <input
                type="text"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder="e.g. STEM, Business, Arts, All Fields"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Target Nationality</label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="e.g. Ghanaian citizens only, African nationals"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Funding & Benefits */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <DollarSign className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-space">
              3. Funding Structure & Package Benefits
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Funding Coverage Type</label>
              <select
                value={fundingType}
                onChange={(e) => setFundingType(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              >
                <option value="Fully Funded" className="dark:bg-slate-900">Fully Funded (Tuition + Stipend + Living)</option>
                <option value="Partially Funded" className="dark:bg-slate-900">Partially Funded / Tuition Waiver</option>
                <option value="Paid Stipend" className="dark:bg-slate-900">Paid / Monthly Salary</option>
                <option value="Unpaid" className="dark:bg-slate-900">Unpaid / Self-Sponsored</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Tuition Coverage</label>
              <input
                type="text"
                value={tuition}
                onChange={(e) => setTuition(e.target.value)}
                placeholder="e.g. 100% full tuition waiver"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Monthly Stipend / Allowance</label>
              <input
                type="text"
                value={stipend}
                onChange={(e) => setStipend(e.target.value)}
                placeholder="e.g. GHS 1,500/month or £1,200/month"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Accommodation Support</label>
              <input
                type="text"
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value)}
                placeholder="e.g. On-campus hall provided"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Other Benefits (comma separated)</label>
              <input
                type="text"
                value={benefitsString}
                onChange={(e) => setBenefitsString(e.target.value)}
                placeholder="Laptop provided, Mentorship, Health insurance, Relocation airfare"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Application Links & Deadlines */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <ExternalLink className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-space">
              4. Application Links, Deadlines & Verification
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Official Application Portal URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                value={applicationUrl}
                onChange={(e) => setApplicationUrl(e.target.value)}
                placeholder="https://example.edu.gh/apply"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Application Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
              {deadline && (() => {
                const info = calculateDeadlineInfo(`${deadline}T23:59:59Z`);
                return (
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Live preview:</span>
                    <DeadlineBadge deadline={`${deadline}T23:59:59Z`} />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">({info.formattedDate})</span>
                  </div>
                );
              })()}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Official Source / Announcement URL</label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://university.org/news/scholarships"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Your Contact Info (Private to editors)</label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="e.g. Phone number or WhatsApp in case we need clarification"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Key Documents Required (comma separated)</label>
              <input
                type="text"
                value={requirementsString}
                onChange={(e) => setRequirementsString(e.target.value)}
                placeholder="WASSCE Certificate, Recommendation Letters, Statement of Purpose, CV"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Specific Application Instructions</label>
              <textarea
                rows={2}
                value={applicationInstructions}
                onChange={(e) => setApplicationInstructions(e.target.value)}
                placeholder="Provide step-by-step guidance on how Ghanaian applicants must submit (e.g. online portal vs paper form via EMS courier)..."
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-[#006B3F] dark:focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Media / Logo Upload */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="w-4 h-4 text-[#006B3F] dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-space">
              5. Organization Banner or Logo (Optional)
            </h2>
          </div>

          <ImageUploadField
            label="Upload Institution Logo or Banner Image"
            onFileSelect={(file) => setSelectedFile(file)}
            onRemoveCurrent={() => setSelectedFile(null)}
            uploadProgress={uploadProgress}
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
            By submitting, you confirm that this opportunity is authentic and conforms to Ghanaian verification guidelines.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 bg-[#006B3F] hover:bg-[#005530] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting for Review...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#FCD116]" />
                <span>Submit Opportunity for Review</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
