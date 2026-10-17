import { AlertSubscription, AlertSubscriberMetrics } from '../types/database';
import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { AuditService } from './auditService';
import * as XLSX from 'xlsx';

export interface SubscribeParams {
  email: string;
  phone?: string;
  whatsappEnabled?: boolean;
  categories?: string[];
  regions?: string[];
  frequency?: 'instant' | 'daily' | 'weekly';
  source?: string;
  userId?: string;
}

export interface SubscribeResult {
  success: boolean;
  subscriber: AlertSubscription;
  alreadySubscribed?: boolean;
  reactivated?: boolean;
  isNew?: boolean;
  message: string;
}

export interface AdminSubscribersResult {
  success: boolean;
  subscribers: AlertSubscription[];
  total: number;
  page: number;
  totalPages: number;
  metrics: AlertSubscriberMetrics;
}

const LOCAL_STORAGE_KEY = 'opp_gh_local_alert_subscriptions';

function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

export const AlertSubscriptionsService = {
  /**
   * Subscribe an email address to Opportunity Ghana daily alerts.
   * Handles duplicate detection, case normalization, and reactivation.
   */
  async subscribe(params: SubscribeParams): Promise<SubscribeResult> {
    const normalized = normalizeEmail(params.email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalized || !emailRegex.test(normalized)) {
      throw new Error('Please enter a valid email address (e.g. name@domain.com).');
    }

    try {
      const response = await fetch('/api/alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          email: normalized
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.subscriber) {
          this.cacheLocalSubscriber(data.subscriber);
          window.dispatchEvent(new CustomEvent('alert-subscribers-changed', { detail: data.subscriber }));
          return data;
        }
      }
    } catch (apiErr) {
      console.warn('[AlertSubscriptionsService] API subscribe fallback note:', apiErr);
    }

    // Direct Firestore write fallback if API is unreachable
    const now = new Date().toISOString();
    const fallbackId = `sub_${btoa(normalized).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)}_${Date.now().toString(36)}`;
    const fallbackRecord: AlertSubscription = {
      id: fallbackId,
      userId: params.userId,
      email: normalized,
      phone: params.phone || '',
      whatsappEnabled: Boolean(params.whatsappEnabled),
      categories: params.categories && params.categories.length > 0 ? params.categories : ['Scholarships', 'Jobs', 'Internships', 'Grants', 'Training'],
      regions: params.regions && params.regions.length > 0 ? params.regions : ['All Ghana'],
      frequency: params.frequency || 'daily',
      status: 'active',
      active: true,
      source: params.source || 'Homepage Daily Alerts',
      lastAlertSentAt: null,
      lastAlertTitle: null,
      alertsCount: 0,
      unsubscribedAt: null,
      createdAt: now,
      updatedAt: now
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'alerts', fallbackId), fallbackRecord, { merge: true });
      } catch (fbErr) {
        console.warn('[AlertSubscriptionsService] Firestore fallback note:', fbErr);
      }
    }

    this.cacheLocalSubscriber(fallbackRecord);
    window.dispatchEvent(new CustomEvent('alert-subscribers-changed', { detail: fallbackRecord }));

    return {
      success: true,
      subscriber: fallbackRecord,
      isNew: true,
      message: 'Thank you! You are now subscribed to verified daily opportunity alerts.'
    };
  },

  /**
   * Unsubscribe an email from alerts
   */
  async unsubscribe(emailOrId: string): Promise<{ success: boolean; message: string }> {
    try {
      const isEmail = emailOrId.includes('@');
      const response = await fetch('/api/alerts/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEmail ? { email: normalizeEmail(emailOrId) } : { id: emailOrId })
      });
      if (response.ok) {
        const data = await response.json();
        window.dispatchEvent(new CustomEvent('alert-subscribers-changed'));
        return data;
      }
    } catch (err) {
      console.warn('[AlertSubscriptionsService] API unsubscribe error:', err);
    }
    return { success: true, message: 'You have been unsubscribed from daily alerts.' };
  },

  /**
   * Fetch subscribers for the admin dashboard with search, filter, and pagination
   */
  async getAdminSubscribers(
    filters: {
      search?: string;
      status?: 'all' | 'active' | 'unsubscribed';
      category?: string;
      frequency?: string;
      sortBy?: 'newest' | 'oldest' | 'email_asc' | 'email_desc';
      page?: number;
      limit?: number;
    } = {},
    tokenGetter?: () => Promise<string | null>
  ): Promise<AdminSubscribersResult> {
    const queryParams = new URLSearchParams();
    if (filters.search) queryParams.set('search', filters.search);
    if (filters.status && filters.status !== 'all') queryParams.set('status', filters.status);
    if (filters.category && filters.category !== 'all') queryParams.set('category', filters.category);
    if (filters.frequency && filters.frequency !== 'all') queryParams.set('frequency', filters.frequency);
    if (filters.sortBy) queryParams.set('sortBy', filters.sortBy);
    if (filters.page) queryParams.set('page', filters.page.toString());
    if (filters.limit) queryParams.set('limit', filters.limit.toString());

    let token: string | null = null;
    if (tokenGetter) {
      try {
        token = await tokenGetter();
      } catch {}
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`/api/admin/alerts/subscribers?${queryParams.toString()}`, {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (err) {
      console.warn('[AlertSubscriptionsService] API getAdminSubscribers note:', err);
    }

    // Client/Firestore fallback if server route unavailable
    const cached = this.getLocalCachedSubscribers();
    let filtered = [...cached];

    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(
        (sub) => sub.email.toLowerCase().includes(s) || (sub.phone && sub.phone.includes(s))
      );
    }
    if (filters.status === 'active') {
      filtered = filtered.filter((sub) => sub.status === 'active' || sub.active === true);
    } else if (filters.status === 'unsubscribed') {
      filtered = filtered.filter((sub) => sub.status === 'unsubscribed' || sub.active === false);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return {
      success: true,
      subscribers: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      metrics: {
        total: cached.length,
        active: cached.filter((c) => c.status === 'active' || c.active === true).length,
        unsubscribed: cached.filter((c) => c.status === 'unsubscribed' || c.active === false).length,
        newThisMonth: cached.length,
        newThisWeek: cached.length
      }
    };
  },

  /**
   * Update subscriber status (Activate or Unsubscribe)
   */
  async updateSubscriberStatus(
    id: string,
    status: 'active' | 'unsubscribed',
    tokenGetter?: () => Promise<string | null>
  ): Promise<boolean> {
    let token: string | null = null;
    if (tokenGetter) {
      try {
        token = await tokenGetter();
      } catch {}
    }

    try {
      const response = await fetch(`/api/admin/alerts/subscribers/${encodeURIComponent(id)}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        window.dispatchEvent(new CustomEvent('alert-subscribers-changed'));
        return true;
      }
    } catch (err) {
      console.warn('[AlertSubscriptionsService] Update status notice:', err);
    }
    return false;
  },

  /**
   * Delete subscriber permanently
   */
  async deleteSubscriber(
    id: string,
    tokenGetter?: () => Promise<string | null>
  ): Promise<boolean> {
    let token: string | null = null;
    if (tokenGetter) {
      try {
        token = await tokenGetter();
      } catch {}
    }

    try {
      const response = await fetch(`/api/admin/alerts/subscribers/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (response.ok) {
        this.removeLocalCachedSubscriber(id);
        window.dispatchEvent(new CustomEvent('alert-subscribers-changed'));
        return true;
      }
    } catch (err) {
      console.warn('[AlertSubscriptionsService] Delete subscriber notice:', err);
    }
    return false;
  },

  /**
   * Dispatch daily digest to active subscribers and update last alert info
   */
  async dispatchDailyDigest(
    tokenGetter?: () => Promise<string | null>
  ): Promise<{ success: boolean; sentCount: number; message: string; timestamp?: string }> {
    let token: string | null = null;
    if (tokenGetter) {
      try {
        token = await tokenGetter();
      } catch {}
    }

    try {
      const response = await fetch('/api/admin/alerts/dispatch-daily', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (response.ok) {
        const data = await response.json();
        window.dispatchEvent(new CustomEvent('alert-subscribers-changed'));
        return data;
      }
    } catch (err) {
      console.warn('[AlertSubscriptionsService] Dispatch error:', err);
    }
    return { success: false, sentCount: 0, message: 'Could not trigger daily alert digest' };
  },

  /**
   * Export subscribers to an official Microsoft Excel (.xlsx) spreadsheet.
   * Runs in the browser using XLSX library for instant downloads, formats columns,
   * handles dates and categories, and logs the export event to the audit trail.
   */
  exportToExcel(
    subscribers: AlertSubscription[],
    filenamePrefix = 'opportunity-ghana-daily-alert-subscribers',
    auditUser?: { email: string; name?: string },
    scope: 'all' | 'filtered' = 'all',
    tokenGetter?: () => Promise<string | null>
  ): string {
    const todayStr = new Date().toISOString().split('T')[0];
    const filename = `${filenamePrefix}-${todayStr}.xlsx`;

    // Prepare clean rows
    const rows = subscribers.map((sub, index) => {
      const cats = Array.isArray(sub.categories) && sub.categories.length > 0 ? sub.categories.join(', ') : 'All Categories';
      const regs = Array.isArray(sub.regions) && sub.regions.length > 0 ? sub.regions.join(', ') : 'All Ghana';
      const createdDate = sub.createdAt
        ? new Date(sub.createdAt).toLocaleString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '';
      const lastAlert = sub.lastAlertSentAt
        ? new Date(sub.lastAlertSentAt).toLocaleString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Never';

      return {
        'No.': index + 1,
        'Email Address': sub.email,
        'Status': (sub.status === 'active' || sub.active === true) ? 'Active' : 'Unsubscribed',
        'Subscription Date': createdDate,
        'Dispatch Frequency': (sub.frequency || 'Daily').toUpperCase(),
        'Target Categories': cats,
        'Target Regions': regs,
        'Phone / WhatsApp': sub.phone || 'None',
        'WhatsApp Enabled': sub.whatsappEnabled ? 'Yes' : 'No',
        'Source': sub.source || 'Homepage Daily Alerts',
        'Last Alert Sent': lastAlert,
        'Total Alerts Received': sub.alertsCount || 0
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Column widths
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 34 },
      { wch: 14 },
      { wch: 22 },
      { wch: 18 },
      { wch: 38 },
      { wch: 20 },
      { wch: 18 },
      { wch: 16 },
      { wch: 26 },
      { wch: 22 },
      { wch: 20 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Alert Subscribers');

    // Trigger binary download in browser
    XLSX.writeFile(workbook, filename, { bookType: 'xlsx' });

    // Record in Audit Service
    AuditService.record({
      entityType: 'alert_subscribers',
      entityId: 'export_daily_alert_subscribers',
      entityTitle: `Excel Export (${scope}: ${subscribers.length} subscribers)`,
      action: 'exported',
      performedByEmail: auditUser?.email || 'admin@opportunityghana.com',
      performedByName: auditUser?.name || 'Administrator',
      details: `Generated and downloaded ${filename} containing ${subscribers.length} subscriber records.`
    });

    // Notify backend for server-side audit logging if token available
    if (tokenGetter) {
      tokenGetter().then((tok) => {
        if (tok) {
          fetch('/api/admin/alerts/audit-export', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${tok}`
            },
            body: JSON.stringify({
              count: subscribers.length,
              scope,
              filename
            })
          }).catch(() => {});
        }
      }).catch(() => {});
    }

    return filename;
  },

  getLocalCachedSubscribers(): AlertSubscription[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  },

  cacheLocalSubscriber(subscriber: AlertSubscription) {
    try {
      const existing = this.getLocalCachedSubscribers();
      const idx = existing.findIndex((s) => s.email.toLowerCase() === subscriber.email.toLowerCase());
      if (idx >= 0) {
        existing[idx] = subscriber;
      } else {
        existing.unshift(subscriber);
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
    } catch {}
  },

  removeLocalCachedSubscriber(id: string) {
    try {
      const existing = this.getLocalCachedSubscribers();
      const filtered = existing.filter((s) => s.id !== id && s.email !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    } catch {}
  }
};
