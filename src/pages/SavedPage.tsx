import React, { useState, useEffect } from 'react';
import { SavedService, SavedItem } from '../services/savedService';
import { Bookmark, ArrowRight, Trash2, Calendar, Building, Sparkles } from 'lucide-react';
import { InstallAppPrompt } from '../components/pwa/InstallAppPrompt';
import { DeadlineBadge } from '../components/common/DeadlineBadge';

interface SavedPageProps {
  onNavigate: (path: string) => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<SavedItem[]>([]);

  const loadSaved = () => {
    setItems(SavedService.getAllSavedDetails());
  };

  useEffect(() => {
    loadSaved();
    const handleUpdate = () => loadSaved();
    window.addEventListener('saved-opportunities-changed', handleUpdate);
    return () => window.removeEventListener('saved-opportunities-changed', handleUpdate);
  }, []);

  const handleRemove = (e: React.MouseEvent, item: SavedItem) => {
    e.stopPropagation();
    SavedService.toggleSave(item);
    loadSaved();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 google-anno-skip" data-no-ads="true">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
            <Bookmark className="w-3.5 h-3.5 fill-emerald-700" />
            Your Saved Opportunities
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-space">
            Saved Opportunities &amp; Bookmarks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Keep track of deadlines, scholarships, grants, and internships you want to apply for.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
          <span>Total Saved:</span>
          <span className="font-extrabold text-emerald-700 text-sm">{items.length}</span>
        </div>
      </div>

      {/* List or Empty State */}
      {items.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200 shadow-2xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No saved opportunities yet</h3>
            <p className="text-xs text-slate-500">
              When browsing scholarships, jobs, or courses, tap the bookmark icon to save them here for quick access offline and on mobile.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/opportunities')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate(`/opportunities/${item.slug}`)}
              className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{item.organizationName || 'Verified Partner'}</span>
                  </div>
                  <button
                    onClick={(e) => handleRemove(e, item)}
                    title="Remove from saved"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                  {item.title}
                </h3>

                {item.category && (
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                    {item.category}
                  </span>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <DeadlineBadge deadline={item.deadline} compact />
                <span className="font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PWA Card prompt in saved items */}
      <InstallAppPrompt variant="card" />
    </div>
  );
};
