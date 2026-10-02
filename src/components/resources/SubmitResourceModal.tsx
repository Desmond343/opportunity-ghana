import React, { useState } from 'react';
import { useAuth } from '../../services/authContext';
import { ResourcesService } from '../../services/resourcesService';
import { FirebaseStorageService } from '../../services/firebase/storageService';
import { optimizeImageForUpload } from '../../services/imageOptimization';
import { RESOURCE_CATEGORIES } from '../../data/categories';
import { ResourceCategory, ResourceType } from '../../types/database';
import {
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Link,
  Building,
  MapPin,
  Clock,
  BookOpen,
  Award,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

interface SubmitResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onNavigate?: (path: string) => void;
}

export const SubmitResourceModal: React.FC<SubmitResourceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onNavigate
}) => {
  const { currentUser } = useAuth();

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Technology');
  const [resourceType, setResourceType] = useState<ResourceType>('course');
  const [enrollmentUrl, setEnrollmentUrl] = useState('');
  const [providerName, setProviderName] = useState('');
  const [format, setFormat] = useState<'Self-paced Online' | 'Live Online' | 'In-person' | 'Hybrid'>('Self-paced Online');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'>('All Levels');
  const [isFree, setIsFree] = useState(true);
  const [cost, setCost] = useState('0');
  const [currency, setCurrency] = useState('GHS');
  const [hasCertificate, setHasCertificate] = useState(true);
  const [duration, setDuration] = useState('Self-paced');
  const [location, setLocation] = useState('');
  const [skillsString, setSkillsString] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [optimizationNote, setOptimizationNote] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrorMessage('Please select a JPG, PNG, or WebP image under 5 MB.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Selected image exceeds 5 MB. Please select a smaller photo.');
      return;
    }

    setErrorMessage(null);

    // Fast client-side optimization and immediate preview
    try {
      const optimized = await optimizeImageForUpload(file);
      setImageFile(optimized.file);
      setImagePreview(optimized.previewUrl);
      if (optimized.reductionPercentage > 0) {
        setOptimizationNote(`Optimized (${optimized.reductionPercentage}% smaller for instant upload)`);
      } else {
        setOptimizationNote('Ready for upload');
      }
    } catch {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setOptimizationNote(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setOptimizationNote(null);
    setUploadProgress(null);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Technology');
    setResourceType('course');
    setEnrollmentUrl('');
    setProviderName('');
    setFormat('Self-paced Online');
    setLevel('All Levels');
    setIsFree(true);
    setCost('0');
    setCurrency('GHS');
    setHasCertificate(true);
    setDuration('Self-paced');
    setLocation('');
    setSkillsString('');
    setContactEmail('');
    setContactPhone('');
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(null);
    setOptimizationNote(null);
    setErrorMessage(null);
    setIsSubmittedSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setErrorMessage('You must be signed in to submit a resource.');
      return;
    }

    if (!title.trim() || title.trim().length < 4) {
      setErrorMessage('Please enter a descriptive resource title (at least 4 characters).');
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      setErrorMessage('Please provide a helpful description of what this resource covers (at least 15 characters).');
      return;
    }

    let formattedUrl = enrollmentUrl.trim();
    if (!formattedUrl) {
      setErrorMessage('Please provide an official URL or registration link for this resource.');
      return;
    }
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Upload image if selected
      let uploadedImageUrl: string | undefined = undefined;
      let uploadedImagePath: string | undefined = undefined;

      if (imageFile) {
        setUploadProgress(15);
        const tempResId = 'res_sub_' + Math.random().toString(36).substring(2, 9);
        try {
          const uploadRes = await FirebaseStorageService.uploadResourcePhoto(
            tempResId,
            imageFile,
            (pct) => setUploadProgress(pct)
          );
          uploadedImageUrl = uploadRes.imageUrl;
          uploadedImagePath = uploadRes.imagePath;
        } catch (imgErr: any) {
          console.error('[SubmitResourceModal Image Upload Error]', imgErr);
          setErrorMessage('Image upload failed. Please try again.');
          return;
        }
      }

      // 2. Parse skills tags
      const skills = skillsString
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // 3. Submit resource record for verification
      try {
        await ResourcesService.submitResource(
          {
            title: title.trim(),
            slug: '',
            description: description.trim(),
            providerId: currentUser.id || 'community',
            providerName: providerName.trim() || currentUser.name || 'Community Contribution',
            category,
            resourceType,
            level,
            format,
            location: location.trim() || undefined,
            duration: duration.trim() || 'Self-paced',
            cost: isFree ? 0 : Math.max(0, parseFloat(cost) || 0),
            currency: isFree ? 'GHS' : currency,
            isFree,
            hasCertificate,
            skills: skills.length > 0 ? skills : [category],
            enrollmentUrl: formattedUrl,
            imageUrl: uploadedImageUrl,
            imagePath: uploadedImagePath,
            contactEmail: contactEmail.trim() || currentUser.email || undefined,
            contactPhone: contactPhone.trim() || undefined
          },
          {
            uid: currentUser.id,
            email: currentUser.email,
            name: currentUser.name
          }
        );
      } catch (subErr: any) {
        console.error('[SubmitResourceModal Service Error]', subErr);
        setErrorMessage('The resource could not be published. Please try again.');
        return;
      }

      setIsSubmittedSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Resource submission error:', err);
      setErrorMessage(err?.message || 'The resource could not be published. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#006B3F] to-[#005530] text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#FCD116] shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold font-space">
                Submit a Resource
              </h2>
              <p className="text-xs text-emerald-100/90">
                Share a course, bootcamp, training, or certified credential with Ghanaians
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSubmittedSuccess ? (
          /* Success Screen */
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#006B3F] border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-space">
                Resource Submitted Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Your resource is now in the verification queue. Our editorial administrators will review the link and publish it publicly once verified.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-[#006B3F] font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Verification Policy</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                We verify all educational cohorts, accreditation, and registration links to protect Ghanaian learners against spam and fraudulent fees.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  if (onNavigate) onNavigate('/profile');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                View My Submissions
              </button>
              <button
                onClick={resetForm}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Submit Another Resource
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Resource Title *</span>
                <span className="text-[11px] text-slate-400 font-normal">e.g. Full-Stack Web Development Bootcamp</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Course or program title"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#006B3F] focus:ring-2 focus:ring-[#006B3F]/15 outline-none font-medium"
              />
            </div>

            {/* 2. Category & Resource Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#006B3F] outline-none font-medium cursor-pointer"
                >
                  <option value="Technology">Technology & Software</option>
                  <option value="Data">Data Science & Analytics</option>
                  <option value="Business">Business & Management</option>
                  <option value="Finance">Finance & Accounting</option>
                  <option value="Entrepreneurship">Entrepreneurship & Startups</option>
                  <option value="Agriculture">Agriculture & Agribusiness</option>
                  <option value="Marketing">Digital Marketing & Growth</option>
                  <option value="Design">UI/UX & Product Design</option>
                  <option value="Healthcare">Healthcare & Life Sciences</option>
                  <option value="Engineering">Engineering & TVET</option>
                  <option value="Education">Education & Teaching</option>
                  <option value="Professional Development">Professional Development</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Resource Type *
                </label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value as ResourceType)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#006B3F] outline-none font-medium cursor-pointer"
                >
                  <option value="course">Online Course</option>
                  <option value="bootcamp">Intensive Bootcamp</option>
                  <option value="certification">Professional Certification</option>
                  <option value="training">Hands-on Training</option>
                  <option value="workshop">Workshop / Webinar</option>
                  <option value="event">Conference / Event</option>
                  <option value="learning_resource">Free Learning Guide / Toolkit</option>
                </select>
              </div>
            </div>

            {/* 3. Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Description *</span>
                <span className="text-[11px] text-slate-400 font-normal">What will learners gain?</span>
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what the resource is, who it is suitable for, and what practical skills are taught..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#006B3F] focus:ring-2 focus:ring-[#006B3F]/15 outline-none leading-relaxed"
              />
            </div>

            {/* 4. Link & Provider */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-[#006B3F]" />
                  <span>Official Enrollment URL *</span>
                </label>
                <input
                  type="url"
                  required
                  value={enrollmentUrl}
                  onChange={(e) => setEnrollmentUrl(e.target.value)}
                  placeholder="https://provider.com/course"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#006B3F] outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>Organization / Provider Name</span>
                </label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  placeholder="e.g. ALX Ghana, MEST, Coursera, GIZ"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#006B3F] outline-none font-medium"
                />
              </div>
            </div>

            {/* 5. Format & Level */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white outline-none"
                >
                  <option value="Self-paced Online">Self-paced Online</option>
                  <option value="Live Online">Live Online</option>
                  <option value="In-person">In-person (Ghana)</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Experience Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white outline-none"
                >
                  <option value="All Levels">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 6 Weeks, 40 Hours"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* 6. Pricing & Certificate Options */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="w-4 h-4 text-[#006B3F] rounded focus:ring-[#006B3F]"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    100% Free / No Tuition
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasCertificate}
                    onChange={(e) => setHasCertificate(e.target.checked)}
                    className="w-4 h-4 text-[#006B3F] rounded focus:ring-[#006B3F]"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Certificate of Completion Included
                  </span>
                </label>
              </div>

              {!isFree && (
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Estimated Cost:</span>
                  <input
                    type="number"
                    min="0"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  >
                    <option value="GHS">GHS (GH₵)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              )}
            </div>

            {/* 7. Skills / Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Key Skills / Topics (Comma-separated)</span>
                <span className="text-[11px] text-slate-400 font-normal">e.g. Python, SQL, Financial Modeling</span>
              </label>
              <input
                type="text"
                value={skillsString}
                onChange={(e) => setSkillsString(e.target.value)}
                placeholder="Python, React, Digital Marketing, Agribusiness..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#006B3F] outline-none"
              />
            </div>

            {/* 8. Image Upload with Optimization Preview */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Resource Banner Image (Optional)</span>
                <span className="text-[11px] text-slate-400">JPG, PNG, WebP &bull; Max 5 MB</span>
              </label>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {imageFile?.name || 'Uploaded image'}
                    </p>
                    {optimizationNote && (
                      <p className="text-[11px] text-[#006B3F] font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {optimizationNote}
                      </p>
                    )}
                    {uploadProgress !== null && (
                      <div className="mt-1 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#006B3F] h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 hover:border-[#006B3F] rounded-2xl bg-slate-50/50 hover:bg-emerald-50/20 cursor-pointer transition-colors text-center group">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#006B3F] mb-1.5 transition-colors" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-[#006B3F]">
                    Click to choose photo or banner
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Images are automatically compressed for fast loading
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* 9. Contact Info (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Contact Email (Optional)</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@opportunityghana.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Contact Phone / WhatsApp (Optional)</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#006B3F] hover:bg-[#005530] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting for Review...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Resource</span>
                    <ArrowRight className="w-4 h-4 text-[#FCD116]" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
