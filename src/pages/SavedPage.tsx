import React, { useState, useEffect, useMemo } from 'react';
import { SavedService, SavedItem } from '../services/savedService';
import { useAuth } from '../services/authContext';
import {
  Bookmark,
  ArrowRight,
  Trash2,
  Calendar,
  Building,
  Sparkles,
  Search,
  Filter,
  LogIn,
  UserPlus,
  RefreshCw,
  ExternalLink,
  Clock,
  Compass
} from 'lucide-react';
import { InstallAppPrompt } from '../components/pwa/InstallAppPrompt';
import { DeadlineBadge } from '../components/common/DeadlineBadge';

interface SavedPageProps {
  onNavigate: (path: string) => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({ onNavigate }) => {
  const { currentUser, getIdToken, loading: authLoading } = useAuth();
  const [items, setItems] = useState<SavedItem[]>(() => SavedService.getAllSavedDetails());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadSavedData = async (forceSync = false) => {
    if (forceSync) {
      setIsLoading(true);
    }

    if (currentUser?.id) {
      try {
        await SavedService.syncFromDatabase(currentUser.id);
      } catch (err) {
        console.warn('[SavedPage] Database sync note:', err);
      }
    }

    setItems(SavedService.getAllSavedDetails());
    setIsLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    loadSavedData(true).then(() => {
      if (isMounted) setIsLoading(false);
    });

    const handleUpdate = () => {
      if (isMounted) {
        setItems(SavedService.getAllSavedDetails());
      }
    };

    window.addEventListener('saved-opportunities-changed', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('saved-opportunities-changed', handleUpdate);
    };
  }, [currentUser?.id]);

  const handleRemove = async (e: React.MouseEvent, item: SavedItem) => {
    e.stopPropagation();
    if (removingId === item.id) return;
    setRemovingId(item.id);

    // Optimistically update local view
    setItems(prev => prev.filter(i => i.id !== item.id));

    try {
      await SavedService.toggleSave(item, currentUser?.id, getIdToken);
    } catch (err) {
      console.warn('[SavedPage] Error removing saved opportunity:', err);
      // Rollback on error
      setItems(SavedService.getAllSavedDetails());
    } finally {
      setRemovingId(null);
    }
  };

  // Extract unique categories from saved items
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach(i => {
      if (i.category) cats.add(i.category);
    });
    return ['All', ...Array.from(cats)];
  }, [items]);

  // Deduplicate and filter items by category & search query
  const filteredItems = useMemo(() => {
    const seen = new Set<string>();
    const uniqueList: SavedItem[] = [];
    for (const item of items) {
      if (!item || !item.id) continue;
      if (!seen.has(item.id)) {
        seen.add(item.id);
        uniqueList.push(item);
      }
    }

    return uniqueList.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.organizationName && item.organizationName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Guest Mode Notice Banner */}
      {!currentUser && !authLoading && (
        <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
              <Bookmark className="w-5 h-5 fill-amber-700 dark:fill-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200 font-space">
                You are viewing device-stored bookmarks
              </h4>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                Sign in or create a free Opportunity Ghana account to automatically sync your saved scholarships, jobs, and deadlines across all your devices.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            <button
              onClick={() => onNavigate('/login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In to Sync</span>
            </button>
            <button
              onClick={() => onNavigate('/signup')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-amber-100/60 dark:hover:bg-slate-700 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
            <Bookmark className="w-3.5 h-3.5 fill-emerald-700 dark:fill-emerald-400" />
            <span>Authoritative Bookmarks</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-space">
            Saved Opportunities &amp; Bookmarks
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Keep track of deadlines, scholarships, grants, and internships you want to apply for.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => loadSavedData(true)}
            disabled={isLoading}
            title="Refresh saved items from cloud"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors shadow-2xs flex items-center gap-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl shadow-2xs">
            <span>Total Saved:</span>
            <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">{items.length}</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar (only show if items exist) */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#141B29] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your saved opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {availableCategories.length > 2 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 ml-1" />
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading Skeleton State */}
      {isLoading && items.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#141B29] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" />
                <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-5/6" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white dark:bg-[#141B29] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-space">No saved opportunities yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              When browsing scholarships, jobs, or programs, tap the bookmark icon on any card to save it here for fast tracking, deadline reminders, and offline access.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/opportunities')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <span>Explore Opportunities</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        /* No Search Match State */
        <div className="text-center py-12 px-4 bg-white dark:bg-[#141B29] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Compass className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">No matching bookmarks found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No saved opportunities match your search query &ldquo;{searchQuery}&rdquo;.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Saved Items Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigate(`/opportunities/${item.slug}`)}
              className="floating-glass-tablet specular-rim-highlight group rounded-xl sm:rounded-2xl p-3.5 sm:p-4 pb-2.5 sm:pb-3 cursor-pointer flex flex-col justify-between overflow-hidden transition-all duration-200"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <Building className="w-3 h-3 text-[#006B3F] dark:text-emerald-400" />
                    <span className="truncate max-w-[170px]">{item.organizationName || 'Verified Partner'}</span>
                  </div>
                  <button
                    onClick={(e) => handleRemove(e, item)}
                    disabled={removingId === item.id}
                    title="Remove from saved"
                    aria-label="Remove from saved"
                    className="p-1.5 rounded-lg glass-floating-btn text-slate-400 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white group-hover:text-[#006B3F] dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug font-space">
                  {item.title}
                </h3>

                <div className="flex flex-wrap items-center gap-1">
                  {item.category && (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50/90 dark:bg-emerald-950/70 backdrop-blur-xs text-[#006B3F] dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-700/60 text-[10px] sm:text-[11px] font-bold shadow-2xs">
                      {item.category}
                    </span>
                  )}
                  {item.type && (
                    <span className="inline-block px-2 py-0.5 rounded-md bg-white/85 dark:bg-slate-800/80 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 text-[10px] sm:text-[11px] font-medium shadow-2xs">
                      {item.type}
                    </span>
                  )}
                </div>
              </div>

              <div className="glass-subpanel mt-3 -mx-1 px-3 py-1.5 rounded-xl flex items-center justify-between text-xs">
                <DeadlineBadge deadline={item.deadline} compact />
                <span className="text-[11px] font-bold text-[#006B3F] dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View <ArrowRight className="w-3 h-3" />
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
