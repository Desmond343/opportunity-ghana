import React, { useState, useEffect } from 'react';
import { Bell, Check, ShieldCheck, Mail, Sparkles, UserMinus, CheckCircle2, AlertCircle, MapPin, Sliders, Globe } from 'lucide-react';
import { OPPORTUNITY_CATEGORIES, GHANA_REGIONS } from '../data/categories';
import { AlertSubscriptionsService } from '../services/alertSubscriptionsService';
import { useAuth } from '../services/authContext';

export const AlertsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'instant' | 'daily' | 'weekly'>('daily');
  const [selectedCats, setSelectedCats] = useState<string[]>([
    'Scholarships',
    'Jobs',
    'Internships',
    'Grants',
    'Training'
  ]);
  const [selectedRegion, setSelectedRegion] = useState('All Ghana');
  const [consentGiven, setConsentGiven] = useState(true);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [unsubscribing, setUnsubscribing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [unsubscribedStatus, setUnsubscribedStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Prefill email if user is logged in
  useEffect(() => {
    if (currentUser?.email && !email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  useEffect(() => {
    // Check URL parameters for email prefill or instant unsubscribe action
    try {
      const params = new URLSearchParams(window.location.search);
      const urlEmail = params.get('email');
      const action = params.get('action');

      if (urlEmail) {
        setEmail(urlEmail);
        if (action === 'unsubscribe') {
          handleAutoUnsubscribe(urlEmail);
        }
      }
    } catch {}
  }, []);

  const handleAutoUnsubscribe = async (targetEmail: string) => {
    if (!targetEmail.trim()) {
      setErrorMessage('Please enter the email address you wish to unsubscribe.');
      return;
    }
    setUnsubscribing(true);
    setErrorMessage('');
    try {
      const res = await AlertSubscriptionsService.unsubscribe(targetEmail.trim());
      setUnsubscribedStatus(true);
      setFeedbackMessage(res.message || 'You have been successfully unsubscribed from email alerts.');
      setSaved(false);
    } catch (err: any) {
      console.warn('Auto-unsubscribe failed:', err);
      setErrorMessage(err.message || 'Could not process unsubscribe request.');
    } finally {
      setUnsubscribing(false);
    }
  };

  const toggleCategory = (catId: string) => {
    setSelectedCats((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const selectAllCategories = () => {
    setSelectedCats(OPPORTUNITY_CATEGORIES.map((c) => c.id));
  };

  const clearAllCategories = () => {
    setSelectedCats([]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    if (!consentGiven) {
      setErrorMessage('Please confirm your consent to receive Opportunity Ghana email alerts.');
      return;
    }

    if (selectedCats.length === 0) {
      setErrorMessage('Please select at least one opportunity category to receive relevant updates.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await AlertSubscriptionsService.subscribe({
        email: cleanEmail,
        categories: selectedCats,
        regions: [selectedRegion],
        frequency,
        source: 'Email Alerts Page',
        userId: currentUser?.id,
        consentGiven: true
      });
      setFeedbackMessage(res.message || 'Your email alert preferences have been successfully updated.');
      setSaved(true);
      setUnsubscribedStatus(false);
      setTimeout(() => setSaved(false), 6000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update alert preferences. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Verified Email Dispatch Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-space">
          Email Opportunity Alert Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          Stay ahead with verified opportunity alerts delivered straight to your email. Choose your target opportunity categories and location preferences to receive curated updates as soon as deadlines are verified by our editors.
        </p>
      </div>

      {/* Unsubscribed banner */}
      {unsubscribedStatus && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-semibold flex items-start gap-3 animate-in fade-in">
          <UserMinus className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Subscription Updated</p>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
              {feedbackMessage || 'You have been unsubscribed from email alerts. You can update your preferences below anytime to resubscribe.'}
            </p>
          </div>
        </div>
      )}

      {/* Success banner */}
      {saved && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-start gap-3 animate-in fade-in">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Preferences Saved Successfully</p>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
              {feedbackMessage || 'Your email alert preferences are active. Verified matching opportunities will be dispatched to your inbox.'}
            </p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-900 dark:text-rose-200 text-xs sm:text-sm font-semibold flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Unable to process</p>
            <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Subscription & Preference Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-[#141B29] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Email Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Email Address <span className="text-rose-600">*</span></span>
          </label>
          <input
            type="email"
            required
            placeholder="e.g. kwame.mensah@ug.edu.gh"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage('');
            }}
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            We only send verified educational and career opportunity alerts. No spam or third-party sharing.
          </p>
        </div>

        {/* Opportunity Categories Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Target Opportunity Categories ({selectedCats.length} selected)</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllCategories}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Select All
              </button>
              <span className="text-slate-300 dark:text-slate-600 text-[11px]">•</span>
              <button
                type="button"
                onClick={clearAllCategories}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
            {OPPORTUNITY_CATEGORIES.map((cat) => {
              const active = selectedCats.includes(cat.id);
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    active
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {active ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location & Region Preference */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Primary Location Preference</span>
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="All Ghana">All Ghana (Nationwide & Regional)</option>
            <option value="Remote / Online">Remote / Online Only</option>
            <optgroup label="Ghana Regions">
              {GHANA_REGIONS.filter((r) => r !== 'All Ghana' && r !== 'Remote / Online').map((r) => (
                <option key={r} value={r}>
                  {r} Region
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Dispatch Frequency */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Dispatch Frequency
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'daily', label: 'Daily Digest', desc: 'Curated daily recap' },
              { id: 'weekly', label: 'Weekly Summary', desc: 'Weekend roundup' },
              { id: 'instant', label: 'Instant Drops', desc: 'As openings verify' }
            ].map((f) => {
              const isSelected = frequency === f.id;
              return (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => setFrequency(f.id as any)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-100 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <p className="text-xs font-bold">{f.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{f.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-600 cursor-pointer"
            />
            <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              I agree to receive verified email notifications matching my selected opportunity preferences from Opportunity Ghana. I can update my preferences or unsubscribe at any time with one click.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{submitting ? 'Saving Preferences...' : 'Save & Activate Email Alerts'}</span>
          </button>

          {email && (
            <button
              type="button"
              disabled={unsubscribing || submitting}
              onClick={() => handleAutoUnsubscribe(email)}
              className="px-5 py-3.5 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UserMinus className="w-4 h-4 text-slate-400 hover:text-rose-600" />
              <span>{unsubscribing ? 'Processing...' : 'Unsubscribe'}</span>
            </button>
          )}
        </div>
      </form>

      {/* Unsubscribe Information Card */}
      <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Need to pause or cancel email notifications?
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Every email sent by Opportunity Ghana includes an instant one-click unsubscribe link at the footer. You can also unsubscribe on this page anytime.
          </p>
        </div>
        <button
          onClick={() => {
            if (email) {
              handleAutoUnsubscribe(email);
            } else {
              setErrorMessage('Enter your email address in the form above to unsubscribe.');
            }
          }}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 underline shrink-0 cursor-pointer"
        >
          Unsubscribe email now
        </button>
      </div>
    </div>
  );
};
