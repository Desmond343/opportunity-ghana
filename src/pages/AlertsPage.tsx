import React, { useState } from 'react';
import { Bell, Check, ShieldCheck, Smartphone, Mail, Sparkles } from 'lucide-react';
import { OPPORTUNITY_CATEGORIES, GHANA_REGIONS } from '../data/categories';

export const AlertsPage: React.FC<{ onNavigate: (path: string) => void }> = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState(true);
  const [frequency, setFrequency] = useState<'instant' | 'daily' | 'weekly'>('instant');
  const [selectedCats, setSelectedCats] = useState<string[]>(['Scholarships', 'Jobs', 'Internships']);
  const [selectedRegion, setSelectedRegion] = useState('All Ghana');
  const [saved, setSaved] = useState(false);

  const toggleCategory = (cat: string) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-5 h-5 text-emerald-700" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Automated Notification Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-space">
          Opportunity Alert Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          Receive verified opportunity alerts via Email and WhatsApp as soon as an opening is checked and published by our editors.
        </p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Your alert preferences have been successfully updated. Verified matching opportunities will be dispatched to your channels.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Contact details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. kwame@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              Phone / WhatsApp Number
            </label>
            <input
              type="tel"
              placeholder="+233 24 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Channels */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
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
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                    active
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {active && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Region */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Primary Region of Interest
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {GHANA_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Dispatch Frequency
          </label>
          <div className="flex gap-4">
            {(['instant', 'daily', 'weekly'] as const).map((f) => (
              <label key={f} className="flex items-center gap-2 text-xs font-medium text-slate-700 capitalize cursor-pointer">
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
          className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Save & Activate Opportunity Alerts
        </button>
      </form>
    </div>
  );
};
