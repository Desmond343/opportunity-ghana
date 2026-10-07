import { SuccessStory, SuccessStoryStatus, SuccessStoryMetrics } from '../types/database';
import { db, isFirebaseConfigured } from './firebase';
import { collection, getDocs, query, where, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useState, useEffect, useCallback } from 'react';

const LOCAL_STORAGE_KEY = 'opp_gh_success_stories_cache';
const PUBLISHED_COUNT_CACHE_KEY = 'opp_gh_published_stories_count';

// Memory cache for zero-latency lookups
let cachedPublishedCount: number | null = (() => {
  try {
    const cached = sessionStorage.getItem(PUBLISHED_COUNT_CACHE_KEY);
    return cached !== null ? parseInt(cached, 10) : null;
  } catch {
    return null;
  }
})();

function getAuthHeader(token?: string): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Check if token exists in session or local storage
    try {
      const storedToken = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
      if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;
    } catch {
      // ignore
    }
  }
  return headers;
}

export const SuccessStoriesService = {
  /**
   * Get the count of published success stories.
   * Optimized and lightweight: only checks whether published records exist.
   */
  async getPublishedStoriesCount(): Promise<number> {
    try {
      const response = await fetch('/api/success-stories/count');
      if (response.ok) {
        const data = await response.json();
        const count = typeof data.count === 'number' ? data.count : 0;
        cachedPublishedCount = count;
        try {
          sessionStorage.setItem(PUBLISHED_COUNT_CACHE_KEY, count.toString());
        } catch {
          // ignore
        }
        return count;
      }
    } catch (apiErr) {
      console.warn('API count fetch notice:', apiErr);
    }

    // Firestore fallback
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'success_stories'), where('status', '==', 'published'));
        const snap = await getDocs(q);
        const count = snap.size;
        cachedPublishedCount = count;
        try {
          sessionStorage.setItem(PUBLISHED_COUNT_CACHE_KEY, count.toString());
        } catch {
          // ignore
        }
        return count;
      } catch (err) {
        console.warn('Firestore count query error:', err);
      }
    }

    return cachedPublishedCount ?? 0;
  },

  /**
   * Synchronously returns cached count if known, or 0
   */
  getCachedCount(): number {
    return cachedPublishedCount ?? 0;
  },

  /**
   * Fetch published success stories for public display.
   * STRICTLY returns published stories only.
   */
  async getPublishedStories(limitCount?: number): Promise<SuccessStory[]> {
    try {
      const url = limitCount ? `/api/success-stories?limit=${limitCount}` : '/api/success-stories';
      const response = await fetch(url);
      if (response.ok) {
        const items = await response.json();
        if (Array.isArray(items)) {
          // Double verify client-side security: only published
          const published = items.filter((s: SuccessStory) => s.status === 'published');
          cachedPublishedCount = published.length;
          try {
            sessionStorage.setItem(PUBLISHED_COUNT_CACHE_KEY, published.length.toString());
          } catch {
            // ignore
          }
          return published;
        }
      }
    } catch (apiErr) {
      console.warn('API fetch published stories notice:', apiErr);
    }

    // Firestore fallback for public
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'success_stories'), where('status', '==', 'published'));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as SuccessStory));
        list.sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        const result = limitCount ? list.slice(0, limitCount) : list;
        cachedPublishedCount = list.length;
        return result;
      } catch (err) {
        console.warn('Firestore query published stories error:', err);
      }
    }

    return [];
  },

  /**
   * Fetch single story by slug or id.
   * If non-admin, ONLY returns published story.
   */
  async getStoryBySlug(slug: string, isAdmin = false): Promise<SuccessStory | null> {
    const published = await this.getPublishedStories();
    const found = published.find(s => s.slug === slug || s.id === slug);
    if (found) return found;

    if (isAdmin && isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'success_stories', slug);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return { id: snap.id, ...snap.data() } as SuccessStory;
        }
      } catch (err) {
        console.warn('Firestore getStoryBySlug error:', err);
      }
    }

    return null;
  },

  /**
   * Admin: Get all stories across all statuses (draft, pending, published, rejected, archived)
   */
  async getAdminStories(token?: string): Promise<{ stories: SuccessStory[]; metrics: SuccessStoryMetrics }> {
    try {
      const response = await fetch('/api/admin/success-stories', {
        headers: getAuthHeader(token)
      });
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.stories)) {
          const stories = data.stories as SuccessStory[];
          const metrics: SuccessStoryMetrics = data.metrics || {
            total: stories.length,
            published: stories.filter(s => s.status === 'published').length,
            draft: stories.filter(s => s.status === 'draft').length,
            pending: stories.filter(s => s.status === 'pending').length,
            rejected: stories.filter(s => s.status === 'rejected').length,
            archived: stories.filter(s => s.status === 'archived').length
          };
          // Update cached published count
          cachedPublishedCount = metrics.published;
          try {
            sessionStorage.setItem(PUBLISHED_COUNT_CACHE_KEY, metrics.published.toString());
          } catch {
            // ignore
          }
          return { stories, metrics };
        }
      }
    } catch (apiErr) {
      console.warn('API getAdminStories notice:', apiErr);
    }

    // Firestore fallback for admin
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'success_stories'));
        const stories = snap.docs.map(d => ({ id: d.id, ...d.data() } as SuccessStory));
        stories.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        const metrics: SuccessStoryMetrics = {
          total: stories.length,
          published: stories.filter(s => s.status === 'published').length,
          draft: stories.filter(s => s.status === 'draft').length,
          pending: stories.filter(s => s.status === 'pending').length,
          rejected: stories.filter(s => s.status === 'rejected').length,
          archived: stories.filter(s => s.status === 'archived').length
        };
        cachedPublishedCount = metrics.published;
        return { stories, metrics };
      } catch (err) {
        console.warn('Firestore admin get stories error:', err);
      }
    }

    return {
      stories: [],
      metrics: { total: 0, published: 0, draft: 0, pending: 0, rejected: 0, archived: 0 }
    };
  },

  /**
   * Admin: Create or Save a new story
   */
  async createStory(story: Partial<SuccessStory>, token?: string): Promise<SuccessStory> {
    const id = story.id || `story_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const slug = story.slug || (story.title || 'story').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newStory: SuccessStory = {
      id,
      slug,
      title: story.title || 'Untitled Journey',
      storytellerName: story.storytellerName || 'Anonymous',
      storytellerRole: story.storytellerRole || '',
      storytellerAvatar: story.storytellerAvatar || '',
      benefitedOpportunityTitle: story.benefitedOpportunityTitle || '',
      benefitedOpportunityId: story.benefitedOpportunityId || '',
      institutionOrCareer: story.institutionOrCareer || '',
      quote: story.quote || '',
      content: story.content || '',
      keyTakeaways: story.keyTakeaways || [],
      status: story.status || 'draft',
      isFeatured: story.isFeatured || false,
      publishedAt: story.status === 'published' ? (story.publishedAt || now) : undefined,
      createdAt: story.createdAt || now,
      updatedAt: now
    };

    try {
      const response = await fetch('/api/admin/success-stories', {
        method: 'POST',
        headers: getAuthHeader(token),
        body: JSON.stringify(newStory)
      });
      if (response.ok) {
        const data = await response.json();
        this.notifyChange();
        return data.story || newStory;
      }
    } catch (apiErr) {
      console.warn('API createStory notice:', apiErr);
    }

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'success_stories', id), newStory, { merge: true });
      } catch (err) {
        console.warn('Firestore setDoc story error:', err);
      }
    }

    this.notifyChange();
    return newStory;
  },

  /**
   * Admin: Update an existing story
   */
  async updateStory(id: string, updates: Partial<SuccessStory>, token?: string): Promise<SuccessStory> {
    const now = new Date().toISOString();
    const payload = {
      ...updates,
      updatedAt: now
    };

    try {
      const response = await fetch(`/api/admin/success-stories/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(token),
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const data = await response.json();
        this.notifyChange();
        return data.story;
      }
    } catch (apiErr) {
      console.warn('API updateStory notice:', apiErr);
    }

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'success_stories', id), payload, { merge: true });
      } catch (err) {
        console.warn('Firestore updateDoc story error:', err);
      }
    }

    this.notifyChange();
    return { id, ...updates } as SuccessStory;
  },

  /**
   * Admin: Publish a story. Automatically makes it public and shows the section.
   */
  async publishStory(id: string, token?: string): Promise<SuccessStory> {
    const now = new Date().toISOString();
    return this.updateStory(
      id,
      {
        status: 'published',
        publishedAt: now,
        reviewedAt: now
      },
      token
    );
  },

  /**
   * Admin: Unpublish a story. Reverts status to draft.
   */
  async unpublishStory(id: string, token?: string): Promise<SuccessStory> {
    return this.updateStory(
      id,
      {
        status: 'draft',
        publishedAt: undefined
      },
      token
    );
  },

  /**
   * Admin: Archive a story
   */
  async archiveStory(id: string, token?: string): Promise<SuccessStory> {
    return this.updateStory(
      id,
      {
        status: 'archived'
      },
      token
    );
  },

  /**
   * Admin: Reject a story with reason
   */
  async rejectStory(id: string, reason?: string, token?: string): Promise<SuccessStory> {
    return this.updateStory(
      id,
      {
        status: 'rejected',
        rejectionReason: reason
      },
      token
    );
  },

  /**
   * Admin: Delete a story
   */
  async deleteStory(id: string, token?: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/admin/success-stories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(token)
      });
      if (response.ok) {
        this.notifyChange();
        return true;
      }
    } catch (apiErr) {
      console.warn('API deleteStory notice:', apiErr);
    }

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'success_stories', id));
      } catch (err) {
        console.warn('Firestore delete story error:', err);
      }
    }

    this.notifyChange();
    return true;
  },

  /**
   * Broadcast state changes to the whole app to re-render navigation, homepage, etc.
   */
  notifyChange() {
    // Invalidate cached count
    cachedPublishedCount = null;
    try {
      sessionStorage.removeItem(PUBLISHED_COUNT_CACHE_KEY);
    } catch {
      // ignore
    }
    // Re-check count asynchronously and trigger custom event
    this.getPublishedStoriesCount().then((count) => {
      window.dispatchEvent(
        new CustomEvent('success-stories-changed', {
          detail: { publishedCount: count }
        })
      );
    });
  }
};

/**
 * React Hook: Track published count with zero UI flicker.
 */
export function usePublishedStoriesCount() {
  const [count, setCount] = useState<number>(() => SuccessStoriesService.getCachedCount());
  const [isLoading, setIsLoading] = useState<boolean>(cachedPublishedCount === null);

  useEffect(() => {
    let isMounted = true;

    SuccessStoriesService.getPublishedStoriesCount().then((newCount) => {
      if (isMounted) {
        setCount(newCount);
        setIsLoading(false);
      }
    });

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.publishedCount === 'number') {
        setCount(customEvent.detail.publishedCount);
      } else {
        SuccessStoriesService.getPublishedStoriesCount().then((updatedCount) => {
          if (isMounted) setCount(updatedCount);
        });
      }
    };

    window.addEventListener('success-stories-changed', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('success-stories-changed', handleUpdate);
    };
  }, []);

  return { count, isVisible: count > 0, isLoading };
}

/**
 * React Hook: Fetch published stories for homepage or public directory
 */
export function usePublishedStories(limitCount?: number) {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [count, setCount] = useState<number>(() => SuccessStoriesService.getCachedCount());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStories = useCallback(async () => {
    setIsLoading(true);
    try {
      const [list, totalPublished] = await Promise.all([
        SuccessStoriesService.getPublishedStories(limitCount),
        SuccessStoriesService.getPublishedStoriesCount()
      ]);
      setStories(list);
      setCount(totalPublished);
    } catch (err) {
      console.warn('Failed to load published stories:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limitCount]);

  useEffect(() => {
    fetchStories();

    const handleUpdate = () => {
      fetchStories();
    };

    window.addEventListener('success-stories-changed', handleUpdate);
    return () => {
      window.removeEventListener('success-stories-changed', handleUpdate);
    };
  }, [fetchStories]);

  return { stories, count, isVisible: count > 0, isLoading, refresh: fetchStories };
}
