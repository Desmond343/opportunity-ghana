const SAVED_OPPORTUNITIES_KEY = 'opp_gh_saved_opportunities';

export interface SavedItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  type: string;
  organizationName?: string;
  deadline?: string;
  savedAt: string;
}

export const SavedService = {
  getSavedIds(): string[] {
    try {
      const data = localStorage.getItem(SAVED_OPPORTUNITIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isSaved(id: string): boolean {
    return this.getSavedIds().includes(id);
  },

  toggleSave(item: { id: string; slug: string; title: string; category?: string; type?: string; organizationName?: string; deadline?: string }): boolean {
    try {
      const ids = this.getSavedIds();
      const exists = ids.includes(item.id);
      let updated: string[];
      if (exists) {
        updated = ids.filter(i => i !== item.id);
      } else {
        updated = [...ids, item.id];
      }
      localStorage.setItem(SAVED_OPPORTUNITIES_KEY, JSON.stringify(updated));

      // Also store summary details
      const metaKey = `opp_gh_saved_meta_${item.id}`;
      if (!exists) {
        localStorage.setItem(metaKey, JSON.stringify({
          ...item,
          savedAt: new Date().toISOString()
        }));
      } else {
        localStorage.removeItem(metaKey);
      }

      // Dispatch event so other components update synchronously
      window.dispatchEvent(new CustomEvent('saved-opportunities-changed', { detail: { id: item.id, isSaved: !exists } }));
      return !exists;
    } catch {
      return false;
    }
  },

  getAllSavedDetails(): SavedItem[] {
    const ids = this.getSavedIds();
    const items: SavedItem[] = [];
    for (const id of ids) {
      try {
        const raw = localStorage.getItem(`opp_gh_saved_meta_${id}`);
        if (raw) {
          items.push(JSON.parse(raw));
        }
      } catch {}
    }
    return items;
  }
};
