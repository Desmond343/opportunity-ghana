import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { OpportunitiesService } from '../services/opportunitiesService';
import { OPPORTUNITY_CATEGORIES, GHANA_REGIONS, EDUCATION_LEVELS } from '../data/categories';
import { ImageUploadField } from '../components/common/ImageUploadField';
import { Opportunity } from '../types/database';
import {
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
  DollarSign,
  Send,
  Loader2,
  FileText
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
  const [submittedOppTitle, setSubmittedOppTitle] = useState('');
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

  // Submission Completed Success Screen
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
              Opportunity Submitted for Verification!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{currentUser.name}</strong>. Your submission, <strong>"{submittedOppTitle}"</strong>, has been securely recorded with status <em>pending</em> in our editorial queue.
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
              <li>Pending submissions are protected and not visible on public pages until approved.</li>
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
                setSubmittedOppTitle('');
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Submit Another Opportunity
            </button>
            <button
              onClick={() => onNavigate('/opportunities')}
              className="w-full sm:w-auto px-5 py-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Back to Opportunities
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent repeated clicks
    setFormError(null);

    // Validation
    if (!title.trim() || title.trim().length < 5) {
      setFormError('Please provide an opportunity title of at least 5 characters.');
      return;
    }
    if (!organizationName.trim()) {
      setFormError('Please specify the offering institution or organization name.');
      return;
    }
    if (!category.trim()) {
      setFormError('Please select an opportunity category.');
      return;
    }
    if (!description.trim() || description.trim().length < 25) {
      setFormError('Please provide an informative description of at least 25 characters.');
      return;
    }
    if (!applicationUrl.trim() || !/^https?:\/\//i.test(applicationUrl.trim())) {
      setFormError('Please provide a valid application URL beginning with http:// or https://');
      return;
    }
    if (!deadline.trim()) {
      setFormError('Please specify an application deadline date.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (selectedFile) setUploadProgress(10);

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
        contactInfo: contactInfo.trim()
      };

      const result = await OpportunitiesService.submitUserOpportunity(
        opportunityData,
        {
          uid: currentUser.id,
          email: currentUser.email,
          name: currentUser.name
        },
        selectedFile,
        (progress) => setUploadProgress(progress)
      );

      setSubmittedOppTitle(result.title);
      setSubmittedSuccess(true);
    } catch (err: any) {
      console.error('Error submitting opportunity:', err);
      setFormError(err?.message || 'Failed to submit opportunity. Please check all fields and try again.');
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
          <span>Moderated Listing</span>
        </div>
      </div>

      {formError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start gap-3 text-rose-800 dark:text-rose-200 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Submission Error</p>
            <p className="mt-0.5">{formError}</p>
          </div>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white dark:bg-[#141B29] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6 transition-colors">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-space">
                1. Basic Opportunity Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official title, offering provider, category, and overview.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Opportunity Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mastercard Foundation Scholars Program at KNUST 2026/2027"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Offering Organization / Institution <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g. Kwame Nkrumah University of Science and Technology"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                disabled={isSubmitting}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              >
                {OPPORTUNITY_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Subcategory / Track
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. STEM Undergraduate, FinTech Cohort, Healthcare"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Opportunity Type / Work Mode
              </label>
              <select
                disabled={isSubmitting}
                value={opportunityType}
                onChange={(e) => setOpportunityType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Fellowship">Fellowship</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="In-person">In-person</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                disabled={isSubmitting}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the objective, target beneficiaries, eligibility highlights, key program benefits, and application details..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all resize-y disabled:opacity-60"
              />
              <span className="text-[11px] text-slate-400">
                Minimum 25 characters. Include clear information to assist applicants.
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Location & Eligibility */}
        <div className="bg-white dark:bg-[#141B29] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6 transition-colors">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-400 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-space">
                2. Location & Eligibility Criteria
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Target regions in Ghana, academic level, and study focus.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                City / Location
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kumasi, Ghana or Remote"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Target Region
              </label>
              <select
                disabled={isSubmitting}
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              >
                <option value="All Ghana">All Ghana (National)</option>
                {GHANA_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Country
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Target Education Level
              </label>
              <select
                disabled={isSubmitting}
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              >
                {EDUCATION_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Field of Study
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder="e.g. Computer Science, Engineering, Agriculture"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Nationality Eligibility
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="e.g. Ghanaian citizens only or African nationals"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              />
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Eligibility Requirements (comma-separated)
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={requirementsString}
                onChange={(e) => setRequirementsString(e.target.value)}
                placeholder="e.g. WASSCE Certificate, Minimum grade 18, Ghana Card, Letter of Recommendation"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Funding & Benefits */}
        <div className="bg-white dark:bg-[#141B29] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6 transition-colors">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-space">
                3. Funding, Benefits & Package
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grant amount, tuition coverage, stipend, and scholar package.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Funding Type
              </label>
              <select
                disabled={isSubmitting}
                value={fundingType}
                onChange={(e) => setFundingType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              >
                <option value="Fully Funded">Fully Funded</option>
                <option value="Partially Funded">Partially Funded</option>
                <option value="Paid">Paid (Competitive Salary / Stipend)</option>
                <option value="Tuition Waiver">Tuition Waiver</option>
                <option value="Unpaid">Unpaid Volunteer</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Tuition / Grant Details
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={tuition}
                onChange={(e) => setTuition(e.target.value)}
                placeholder="e.g. 100% Tuition Waiver or $10,000 Seed Grant"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Living Stipend / Allowance
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={stipend}
                onChange={(e) => setStipend(e.target.value)}
                placeholder="e.g. GHS 2,500 Monthly Allowance"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Accommodation / Housing
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={accommodation}
                onChange={(e) => setAccommodation(e.target.value)}
                placeholder="e.g. On-Campus Hall of Residence Provided"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Key Benefits (comma-separated tags)
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={benefitsString}
                onChange={(e) => setBenefitsString(e.target.value)}
                placeholder="e.g. Laptop Allowance, Health Insurance, Mentorship, Flight Ticket"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Application Links & Deadlines */}
        <div className="bg-white dark:bg-[#141B29] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6 transition-colors">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-space">
                4. Application Links, Deadlines & Verification
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct application URL, closing dates, and instructions for applicants.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Official Application Portal URL <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="url"
                  required
                  disabled={isSubmitting}
                  value={applicationUrl}
                  onChange={(e) => setApplicationUrl(e.target.value)}
                  placeholder="https://admissions.knust.edu.gh/apply or https://careers.company.com/job"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
                />
              </div>
              <span className="text-[11px] text-slate-400">
                Must be the genuine official link. Our editorial team verifies this before publication.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Application Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                disabled={isSubmitting}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Source / Announcement URL
              </label>
              <input
                type="url"
                disabled={isSubmitting}
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://knust.edu.gh/announcements/scholarships"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                How to Apply / Special Instructions
              </label>
              <textarea
                rows={3}
                disabled={isSubmitting}
                value={applicationInstructions}
                onChange={(e) => setApplicationInstructions(e.target.value)}
                placeholder="e.g. Fill the online form, attach WASSCE transcript, and submit before 5:00 PM GMT. Shortlisted applicants will receive an interview invitation."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all resize-y disabled:opacity-60"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Official Inquiry / Contact Email or Phone
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="e.g. scholarships@knust.edu.gh or +233 322 060 021"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:border-[#006B3F] transition-all disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Featured Image / Poster Upload */}
        <div className="bg-white dark:bg-[#141B29] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-6 transition-colors">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006B3F] dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-space">
                5. Featured Image / Poster (Firebase Storage)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload the official opportunity flyer or institutional logo (JPG, PNG, WebP up to 5 MB).
              </p>
            </div>
          </div>

          <ImageUploadField
            label="Upload Opportunity Poster or Organization Banner"
            onFileSelect={(file) => setSelectedFile(file)}
            uploadProgress={uploadProgress}
            disabled={isSubmitting}
            helpText="Images are saved persistently into Firebase Storage under opportunities/{id}."
          />
        </div>

        {/* Submitter Info Card */}
        <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              Submitting as: {currentUser.name} ({currentUser.email})
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Your account identity is securely attached to this submission. Status will start as <strong>pending review</strong>.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] uppercase tracking-wider self-start sm:self-auto">
            Verified Submitter
          </span>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onNavigate('/opportunities')}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting to Firebase...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Opportunity for Review</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
