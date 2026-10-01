import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { ResourcesService } from '../services/resourcesService';
import { FirebaseStorageService } from '../services/firebase/storageService';
import { RESOURCE_CATEGORIES, RESOURCE_TYPES } from '../data/categories';
import { ImageUploadField } from '../components/common/ImageUploadField';
import { ResourceType } from '../types/database';
import {
  BookOpen,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Lock,
  Globe,
  DollarSign,
  FileCheck
} from 'lucide-react';

interface SubmitResourcePageProps {
  onNavigate: (path: string) => void;
}

export const SubmitResourcePage: React.FC<SubmitResourcePageProps> = ({ onNavigate }) => {
  const { currentUser, isFirebaseActive } = useAuth();

  // Form Fields
  const [title, setTitle] = useState('');
  const [providerName, setProviderName] = useState('');
  const [category, setCategory] = useState<string>('Technology');
  const [resourceType, setResourceType] = useState<ResourceType>('course');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'>('All Levels');
  const [format, setFormat] = useState<'Self-paced Online' | 'Live Online' | 'In-person' | 'Hybrid'>('Self-paced Online');
  const [location, setLocation] = useState('Online / Ghana');
  const [enrollmentUrl, setEnrollmentUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [cost, setCost] = useState<number>(0);
  const [currency, setCurrency] = useState('GHS');
  const [hasCertificate, setHasCertificate] = useState(true);
  const [skillsString, setSkillsString] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submittedResourceId, setSubmittedResourceId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // If user is not logged in, show authentication wall CTA
  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <button
          onClick={() => onNavigate('/resources')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Learning Resources</span>
        </button>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-space">
              Sign In to Submit a Resource
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              We require community contributors to be signed in to prevent spam and link your submitted courses or programs to your personal submission dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('/login')}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer"
            >
              Sign In to Your Account
            </button>
            <button
              onClick={() => onNavigate('/signup')}
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-2xl shadow-2xs transition-colors cursor-pointer"
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
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-2xs text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
              Pending Admin Review
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 font-space pt-1">
              Resource Submitted for Verification!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{currentUser.name}</strong>. Your submitted resource, <strong>"{title}"</strong>, has been recorded into our editorial queue.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs text-slate-600 space-y-2 max-w-md mx-auto">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>What happens next?</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-500">
              <li>Our Ghana editorial team verifies the provider, curriculum, and accreditation.</li>
              <li>Once verified, your resource will appear live on the public directory.</li>
              <li>You can view status updates directly on your user dashboard.</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('/profile')}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              View My Submissions
            </button>
            <button
              onClick={() => {
                setTitle('');
                setDescription('');
                setEnrollmentUrl('');
                setSubmittedSuccess(false);
                setSelectedFile(null);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Submit Another Resource
            </button>
            <button
              onClick={() => onNavigate('/resources')}
              className="w-full sm:w-auto px-5 py-2.5 text-slate-500 hover:text-slate-800 text-xs font-semibold"
            >
              Back to Resources
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation
    if (!title.trim()) {
      setFormError('Please enter a resource title.');
      return;
    }
    if (!description.trim() || description.trim().length < 25) {
      setFormError('Please provide a descriptive overview of at least 25 characters.');
      return;
    }
    if (!enrollmentUrl.trim() || !enrollmentUrl.startsWith('http')) {
      setFormError('Please enter a valid website link starting with http:// or https://');
      return;
    }

    try {
      setIsSubmitting(true);

      const tempId = 'res_sub_' + Date.now();
      let uploadedImageUrl: string | undefined = undefined;
      let uploadedImagePath: string | undefined = undefined;

      // Image upload if selected
      if (selectedFile) {
        const uploadResult = await FirebaseStorageService.uploadResourcePhoto(
          tempId,
          selectedFile,
          (progress) => setUploadProgress(progress)
        );
        uploadedImageUrl = uploadResult.imageUrl;
        uploadedImagePath = uploadResult.imagePath;
      }

      const skillsArray = skillsString
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const created = await ResourcesService.submitUserResource(
        {
          title: title.trim(),
          description: description.trim(),
          category,
          resourceType,
          level,
          format,
          location: location.trim(),
          providerName: providerName.trim(),
          enrollmentUrl: enrollmentUrl.trim(),
          isFree,
          cost: isFree ? 0 : Number(cost),
          currency,
          hasCertificate,
          skills: skillsArray,
          contactInfo: contactInfo.trim(),
          imageUrl: uploadedImageUrl,
          imagePath: uploadedImagePath
        },
        {
          uid: currentUser.id,
          email: currentUser.email,
          name: currentUser.name
        }
      );

      setSubmittedResourceId(created.id);
      setSubmittedSuccess(true);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setFormError(err?.message || 'Could not submit resource. Please check fields and try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button and title */}
      <div>
        <button
          onClick={() => onNavigate('/resources')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Resources Directory</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-space">
              Submit a Learning Resource
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Help Ghanaian youths, students, and professionals discover high-impact learning opportunities. Every submission is vetted by our team before publishing.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs font-medium text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Community Contribution</span>
          </div>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        {/* Core Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Resource Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resource / Course Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Full-Stack Web Development Bootcamp Ghana"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Provider / Organization Name
              </label>
              <input
                type="text"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="e.g. MEST Africa, ALX Ghana, Coursera"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
              >
                {RESOURCE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resource Type
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as ResourceType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Skill Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
              >
                <option value="All Levels">All Levels</option>
                <option value="Beginner">Beginner (No prior experience)</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
              >
                <option value="Self-paced Online">Self-paced Online</option>
                <option value="Live Online">Live Online / Cohort</option>
                <option value="In-person">In-person</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Location / Campus
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Online, Accra Campus, Kumasi"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enrollment / Official Website Link <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="url"
                  required
                  value={enrollmentUrl}
                  onChange={(e) => setEnrollmentUrl(e.target.value)}
                  placeholder="https://example.org/apply-or-enroll"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description & Benefits <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail what this resource covers, who is eligible, and why it is valuable for Ghanaian learners..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Credentials */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Cost & Accreditation</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isFreeCheckbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="isFreeCheckbox" className="text-xs font-bold text-slate-800 cursor-pointer">
                100% Free / Funded Resource
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hasCertCheckbox"
                checked={hasCertificate}
                onChange={(e) => setHasCertificate(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="hasCertCheckbox" className="text-xs font-bold text-slate-800 cursor-pointer">
                Includes Certificate of Completion
              </label>
            </div>

            {!isFree && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tuition / Fee Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
                  >
                    <option value="GHS">GHS (Ghana Cedi)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Key Skills Taught <span className="text-[10px] text-slate-400 font-normal">(Comma separated)</span>
              </label>
              <input
                type="text"
                value={skillsString}
                onChange={(e) => setSkillsString(e.target.value)}
                placeholder="e.g. React, Node.js, Digital Marketing, Financial Modeling"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact or Inquiries Info <span className="text-[10px] text-slate-400 font-normal">(Optional email, phone, or office)</span>
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="e.g. admissions@provider.gh or +233 24 000 0000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none font-medium"
              />
            </div>
          </div>
        </div>

        {/* High Performance Compressed Image Upload */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Resource Banner Photo</span>
          </h2>

          <ImageUploadField
            label="Resource Photo or Cover"
            onFileSelect={(file) => setSelectedFile(file)}
            onRemoveCurrent={() => setSelectedFile(null)}
            uploadProgress={uploadProgress}
            helpText="Automatically resized and compressed client-side to save mobile data"
          />
        </div>

        {/* Submit Actions */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500">
            By submitting, you confirm that this resource information is genuine and adheres to community guidelines.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting for Verification...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit for Verification</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
