import { AlertSubscription, AlertSubscriberMetrics } from '../types/database';
import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { AuditService } from './auditService';
import * as XLSX from 'xlsx';

export interface SubscribeParams {
  email: string;
  categories?: string[];
  regions?: string[];
  frequency?: 'instant' | 'daily' | 'weekly';
  source?: string;
  userId?: string;
  consentGiven?: boolean;
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
   * Subscribe an email address to Opportunity Ghana alerts.
   * Handles duplicate detection, case normalization, consent recording, and reactivation.
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
          email: normalized,
          consentGiven: params.consentGiven ?? true
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
      categories: params.categories && params.categories.length > 0 ? params.categories : ['Scholarships', 'Jobs', 'Internships', 'Grants', 'Training'],
      regions: params.regions && params.regions.length > 0 ? params.regions : ['All Ghana'],
      frequency: params.frequency || 'daily',
      status: 'active',
      active: true,
      source: params.source || 'Email Alerts Page',
      consentGiven: params.consentGiven ?? true,
      consentTimestamp: now,
      lastAlertSentAt: null,
      lastAlertTitle: null,
      alertsCount: 0,
      unsubscribedAt: null,
      createdAt: now,
      updatedAt: now
    };

    if (isFirebaseConfigured && db) {
      try {
        const alertDoc = doc(db, 'alerts', fallbackId);
        await setDoc(alertDoc, fallbackRecord, { merge: true });
      } catch (fbErr: any) {
        console.warn('[AlertSubscriptionsService] Firestore subscription fallback note:', fbErr.message);
      }
    }

    this.cacheLocalSubscriber(fallbackRecord);
    window.dispatchEvent(new CustomEvent('alert-subscribers-changed', { detail: fallbackRecord }));

    return {
      success: true,
      subscriber: fallbackRecord,
      isNew: true,
      message: 'Thank you! You are now subscribed to verified opportunity alerts.'
    };
  },

  /**
   * Unsubscribe an email from alerts
   */
  async unsubscribe(email: string): Promise<{ success: boolean; message: string }> {
    const normalized = normalizeEmail(email);

    try {
      const response = await fetch('/api/alerts/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized })
      });
      if (response.ok) {
        const data = await response.json();
        // Update local cache
        const cached = this.getLocalCachedSubscribers();
        const found = cached.find((s) => s.email.toLowerCase() === normalized);
        if (found) {
          found.status = 'unsubscribed';
          found.active = false;
          found.unsubscribedAt = new Date().toISOString();
          this.cacheLocalSubscriber(found);
        }
        window.dispatchEvent(new CustomEvent('alert-subscribers-changed'));
        return data;
      }
    } catch (err) {
      console.warn('[AlertSubscriptionsService] API unsubscribe fallback note:', err);
    }

    // Client/Firestore fallback
    if (isFirebaseConfigured && db) {
      try {
        const alertsRef = collection(db, 'alerts');
        const q = query(alertsRef, where('email', '==', normalized));
        const snap = await getDocs(q);
        const now = new Date().toISOString();
        snap.forEach(async (d) => {
          await setDoc(d.ref, { status: 'unsubscribed', active: false, unsubscribedAt: now, updatedAt: now }, { merge: true });
        });
      } catch {}
    }

    return {
      success: true,
      message: 'You have been successfully unsubscribed from opportunity alerts.'
    };
  },

  /**
   * Fetch subscribers for the Admin CMS with filtering, pagination, and sorting
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
    tokenGetter?: (forceRefresh?: boolean) => Promise<string | null>
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
      let response = await fetch(`/api/admin/alerts/subscribers?${queryParams.toString()}`, {
        headers
      });

      // If token expired, force refresh token once and retry
      if (response.status === 401 && tokenGetter) {
        try {
          const freshToken = await tokenGetter(true);
          if (freshToken) {
            headers['Authorization'] = `Bearer ${freshToken}`;
            response = await fetch(`/api/admin/alerts/subscribers?${queryParams.toString()}`, {
              headers
            });
          }
        } catch {}
      }

      if (response.ok) {
        const data = await response.json();
        return data;
      } else if (response.status === 401 || response.status === 403) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Access restricted (${response.status}): Administrator credentials required.`);
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('Access restricted') || err.message.includes('Forbidden') || err.message.includes('Administrator credentials'))) {
        throw err;
      }
      console.warn('[AlertSubscriptionsService] API getAdminSubscribers note:', err);
    }

    // Client/Firestore fallback if server route unavailable
    const cached = this.getLocalCachedSubscribers();
    let filtered = [...cached];

    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(
        (sub) => sub.email.toLowerCase().includes(s)
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
        const data = await response.json();
        if (data.success && data.subscriber) {
          this.cacheLocalSubscriber(data.subscriber);
          window.dispatchEvent(new CustomEvent('alert-subscribers-changed', { detail: data.subscriber }));
          return true;
        }
      }
    } catch (err) {
      console.warn('[AlertSubscriptionsService] API update status note:', err);
    }

    // Client fallback
    const cached = this.getLocalCachedSubscribers();
    const sub = cached.find((s) => s.id === id || s.email === id);
    if (sub) {
      sub.status = status;
      sub.active = status === 'active';
      sub.unsubscribedAt = status === 'unsubscribed' ? new Date().toISOString() : null;
      sub.updatedAt = new Date().toISOString();
      this.cacheLocalSubscriber(sub);
      window.dispatchEvent(new CustomEvent('alert-subscribers-changed', { detail: sub }));
      return true;
    }
    return false;
  },

  /**
   * Delete subscriber record permanently
   */
  async deleteSubscriber(id: string, tokenGetter?: () => Promise<string | null>): Promise<boolean> {
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
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (response.ok) {
        this.removeLocalCachedSubscriber(id);
        window.dispatchEvent(new CustomEvent('alert-subscribers-changed'));
        return true;
      }
    } catch (err) {
      console.warn('[AlertSubscriptionsService] API delete note:', err);
    }

    this.removeLocalCachedSubscriber(id);
    window.dispatchEvent(new CustomEvent('alert-subscribers-changed'));
    return true;
  },

  /**
   * Trigger Daily Alert Digest Dispatch to Active Subscribers
   */
  async dispatchDailyDigest(tokenGetter?: () => Promise<string | null>): Promise<any> {
    let token: string | null = null;
    if (tokenGetter) {
      try {
        token = await tokenGetter();
      } catch {}
    }

    const response = await fetch('/api/admin/alerts/dispatch-daily', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to dispatch daily alert digest');
    }

    return response.json();
  },

  /**
   * Export subscribers to an official Microsoft Excel (.xlsx) spreadsheet.
   * Runs in the browser using XLSX library for instant downloads, formats columns,
   * handles dates and preferences, and logs the export event to the audit trail.
   */
  exportToExcel(
    subscribers: AlertSubscription[],
    filenamePrefix = 'opportunity-ghana-email-subscribers',
    auditUser?: { email: string; name?: string },
    scope: 'all' | 'filtered' = 'all',
    tokenGetter?: () => Promise<string | null>
  ): string {
    const todayStr = new Date().toISOString().split('T')[0];
    const filename = `${filenamePrefix}-${todayStr}.xlsx`;

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
      const updatedDate = sub.updatedAt
        ? new Date(sub.updatedAt).toLocaleString('en-GB', {
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
        'Subscriber ID': sub.id || '',
        'Email Address': sub.email,
        'Status': (sub.status === 'active' || sub.active === true) ? 'Active' : 'Unsubscribed',
        'Target Categories': cats,
        'Target Regions': regs,
        'Dispatch Frequency': (sub.frequency || 'Daily').toUpperCase(),
        'Subscription Source': sub.source || 'Website',
        'Date Subscribed': createdDate,
        'Last Updated': updatedDate,
        'Last Alert Sent': lastAlert,
        'Total Alerts Received': sub.alertsCount || 0
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Column widths
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 34 },
      { wch: 14 },
      { wch: 38 },
      { wch: 22 },
      { wch: 18 },
      { wch: 26 },
      { wch: 22 },
      { wch: 22 },
      { wch: 22 },
      { wch: 20 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Email Subscribers');

    // Trigger binary download in browser
    XLSX.writeFile(workbook, filename, { bookType: 'xlsx' });

    // Record in Audit Service
    AuditService.record({
      entityType: 'alert_subscribers',
      entityId: 'export_email_subscribers',
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

  /**
   * Export subscribers to standard Comma-Separated Values (.csv) file.
   * Cross-platform, utf-8 with BOM for complete compatibility with Microsoft Excel & Google Sheets.
   */
  exportToCsv(
    subscribers: AlertSubscription[],
    filenamePrefix = 'opportunity-ghana-email-subscribers',
    auditUser?: { email: string; name?: string },
    scope: 'all' | 'filtered' = 'all',
    tokenGetter?: () => Promise<string | null>
  ): string {
    const todayStr = new Date().toISOString().split('T')[0];
    const filename = `${filenamePrefix}-${todayStr}.csv`;

    const headers = [
      'No.',
      'Subscriber ID',
      'Email Address',
      'Status',
      'Scholarships',
      'Grants & Funding',
      'Jobs',
      'Internships',
      'Courses & Training',
      'Fellowships',
      'Admissions & Institutions',
      'Competitions',
      'Entrepreneurship',
      'Graduate Programmes',
      'Government Programmes',
      'Skills Preferences',
      'Location Preferences',
      'Dispatch Frequency',
      'Subscription Source',
      'Date Subscribed',
      'Last Updated'
    ];

    const escapeCsv = (val: any) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = subscribers.map((sub, index) => {
      const cats = Array.isArray(sub.categories) ? sub.categories : [];
      const has = (re: RegExp) => cats.some((c: string) => re.test(c)) ? 'Yes' : 'No';
      const regs = Array.isArray(sub.regions) && sub.regions.length > 0 ? sub.regions.join('; ') : 'All Ghana';
      const createdDate = sub.createdAt ? new Date(sub.createdAt).toISOString().replace('T', ' ').substring(0, 19) : '';
      const updatedDate = sub.updatedAt ? new Date(sub.updatedAt).toISOString().replace('T', ' ').substring(0, 19) : '';

      return [
        index + 1,
        sub.id || '',
        sub.email,
        (sub.status === 'active' || sub.active === true) ? 'Active' : 'Unsubscribed',
        has(/scholarship/i),
        has(/grant/i),
        has(/job/i),
        has(/intern/i),
        has(/course|training/i),
        has(/fellowship/i),
        has(/admiss/i),
        has(/compet/i),
        has(/entrepreneur/i),
        has(/graduate/i),
        has(/government/i),
        has(/skill/i),
        regs,
        (sub.frequency || 'Daily').toUpperCase(),
        sub.source || 'Website',
        createdDate,
        updatedDate
      ].map(escapeCsv).join(',');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Record in Audit Service
    AuditService.record({
      entityType: 'alert_subscribers',
      entityId: 'export_email_subscribers_csv',
      entityTitle: `CSV Export (${scope}: ${subscribers.length} subscribers)`,
      action: 'exported',
      performedByEmail: auditUser?.email || 'admin@opportunityghana.com',
      performedByName: auditUser?.name || 'Administrator',
      details: `Generated and downloaded ${filename} containing ${subscribers.length} subscriber records.`
    });

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

  // =========================================================================
  // GOOGLE SHEETS INTEGRATION CLIENT METHODS
  // =========================================================================

  async getGoogleSheetsStatus(tokenGetter?: () => Promise<string | null>): Promise<any> {
    let token: string | null = null;
    if (tokenGetter) {
      try { token = await tokenGetter(); } catch {}
    }

    const res = await fetch('/api/admin/google-sheets/status', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return res.json();
  },

  async getGoogleSheetsAuthUrl(tokenGetter?: () => Promise<string | null>): Promise<{ success: boolean; authUrl?: string; error?: string; redirectUri?: string }> {
    let token: string | null = null;
    if (tokenGetter) {
      try { token = await tokenGetter(); } catch {}
    }

    const res = await fetch('/api/admin/google-sheets/auth-url', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return res.json();
  },

  async connectGoogleSheetsToken(accessToken: string, email?: string, tokenGetter?: () => Promise<string | null>): Promise<any> {
    let token: string | null = null;
    if (tokenGetter) {
      try { token = await tokenGetter(); } catch {}
    }

    const res = await fetch('/api/admin/google-sheets/connect-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ accessToken, email })
    });
    return res.json();
  },

  async saveGoogleSheetsCredentials(clientId: string, clientSecret: string, tokenGetter?: () => Promise<string | null>): Promise<any> {
    let token: string | null = null;
    if (tokenGetter) {
      try { token = await tokenGetter(); } catch {}
    }

    const res = await fetch('/api/admin/google-sheets/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ clientId, clientSecret })
    });
    return res.json();
  },

  async createGoogleSpreadsheet(title?: string, tokenGetter?: () => Promise<string | null>): Promise<any> {
    let token: string | null = null;
    if (tokenGetter) {
      try { token = await tokenGetter(); } catch {}
    }

    const res = await fetch('/api/admin/google-sheets/create-spreadsheet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ title: title || 'Opportunity Ghana - Email Subscribers' })
    });
    return res.json();
  },

  async selectGoogleSpreadsheet(spreadsheetId: string, sheetName?: string, tokenGetter?: () => Promise<string | null>): Promise<any> {
    let token: string | null = null;
    if (tokenGetter) {
      try { token = await tokenGetter(); } catch {}
    }

    const res = await fetch('/api/admin/google-sheets/select-spreadsheet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ spreadsheetId, sheetName })
    });
    return res.json();
  },

  async testGoogleSheetsConnection(tokenGetter?: () => Promise<string | null>): Promise<any> {
    let token: string | null = null;
    if (tokenGetter) {
      try { token = await tokenGetter(); } catch {}
    }

    const res = await fetch('/api/admin/google-sheets/test-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return res.json();
  },

  async syncGoogleSheets(tokenGetter?: () => Promise<string | null>): Promise<any> {
    let token: string | null = null;
    if (tokenGetter) {
      try { token = await tokenGetter(); } catch {}
    }

    const res = await fetch('/api/admin/google-sheets/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return res.json();
  },

  async disconnectGoogleSheets(tokenGetter?: () => Promise<string | null>): Promise<any> {
    let token: string | null = null;
    if (tokenGetter) {
      try { token = await tokenGetter(); } catch {}
    }

    const res = await fetch('/api/admin/google-sheets/disconnect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    return res.json();
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
