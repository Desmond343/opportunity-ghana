import React, { useState } from 'react';
import { Bell, Check, ShieldCheck, Smartphone, Mail, Sparkles } from 'lucide-react';
import { OPPORTUNITY_CATEGORIES, GHANA_REGIONS } from '../data/categories';
import { AlertSubscriptionsService } from '../services/alertSubscriptionsService';
import { useAuth } from '../services/authContext';

export const AlertsPage: React.FC<{ onNavigate: (path: string) => void }> = () => {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState(true);
  const [frequency, setFrequency] = useState<'instant' | 'daily' | 'weekly'>('instant');
  const [selectedCats, setSelectedCats] = useState<string[]>(['Scholarships', 'Jobs', 'Internships']);
  const [selectedRegion, setSelectedRegion] = useState('All Ghana');
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const toggleCategory = (cat: string) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      const res = await AlertSubscriptionsService.subscribe({
        email: email.trim(),
        phone: phone.trim() || undefined,
        whatsappEnabled: whatsapp,
        categories: selectedCats,
        regions: [selectedRegion],
        frequency,
        source: 'Alerts Preferences Page',
        userId: currentUser?.id
      });
      setFeedbackMessage(res.message || 'Your alert preferences have been successfully updated.');
      setSaved(true);
      setTimeout(() => setSaved(false), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to update alert preferences');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Automated Notification Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-space">
          Opportunity Alert Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Receive verified opportunity alerts via Email and WhatsApp as soon as an opening is checked and published by our editors.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{feedbackMessage || 'Your alert preferences have been successfully updated. Verified matching opportunities will be dispatched to your channels.'}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white dark:bg-[#141B29] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Contact details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. kwame.mensah@ug.edu.gh"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              Phone / WhatsApp Number
            </label>
            <input
              type="tel"
              placeholder="+233 24 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Channels */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={whatsapp}
              onChange={(e) => setWhatsapp(e.target.checked)}
              className="rounded text-emerald-700 focus:ring-emerald-600"
            />
            Send instant WhatsApp digests when urgent opportunities drop
          </label>
        </div>

        {/* Preferred categories */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Target Opportunity Categories
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {OPPORTUNITY_CATEGORIES.map((cat) => {
              const active = selectedCats.includes(cat.id);
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    active
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {active && <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Region */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Primary Region of Interest
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {GHANA_REGIONS.map((r) => (
              <option key={r} value={r} className="dark:bg-slate-900">
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Dispatch Frequency
          </label>
          <div className="flex gap-4">
            {(['instant', 'daily', 'weekly'] as const).map((f) => (
              <label key={f} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 capitalize cursor-pointer">
                <input
                  type="radio"
                  name="freq"
                  checked={frequency === f}
                  onChange={() => setFrequency(f)}
                  className="text-emerald-700 focus:ring-emerald-600"
                />
                {f} Alert
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          {submitting ? 'Saving Preferences...' : 'Save & Activate Opportunity Alerts'}
        </button>
      </form>
    </div>
  );
};
