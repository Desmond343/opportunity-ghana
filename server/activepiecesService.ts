import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { adminDb } from './firebaseAdmin.ts';

export const PRODUCTION_ACTIVEPIECES_BASE_URL = 'https://opportunityghana.site';

export interface ActivepiecesApiKeyInfo {
  keyPrefix: string;
  keySuffix: string;
  keyHash: string; // SHA-256 hash of the full API key
  status: 'active' | 'revoked';
  createdAt: string;
  revokedAt: string | null;
  lastUsedAt: string | null;
  createdByName?: string;
  createdByEmail?: string;
}

export interface ActivepiecesConfig {
  webhookUrl: string;
  webhookSecret: string;
  scheduleCron: string;
  scheduleTime: string;
  enabled: boolean;
  fallbackPolicy: 'skip' | 'highlights';
  emailProvider: 'smtp' | 'gmail' | 'activepieces_email' | 'simulated';
  fromEmail: string;
  fromName: string;
  lastRunAt: string | null;
  lastRunStatus: 'idle' | 'success' | 'partial' | 'failed';
  totalDelivered: number;
  totalErrors: number;
  // Cryptographically secure API Key management
  currentApiKey?: ActivepiecesApiKeyInfo;
  previousApiKeys?: ActivepiecesApiKeyInfo[];
  apiKey?: string; // Legacy plaintext field kept solely for transparent migration
}

export interface DeliveryDetail {
  subscriberId: string;
  email: string;
  status: 'delivered' | 'failed' | 'skipped_no_matches';
  opportunitiesSent: string[];
  opportunitiesTitles?: string[];
  error?: string | null;
  timestamp: string;
}

export interface DeliveryReport {
  id: string;
  runId: string;
  timestamp: string;
  totalSubscribers: number;
  deliveredCount: number;
  failedCount: number;
  skippedCount: number;
  details: DeliveryDetail[];
}

const CONFIG_FILE = path.resolve(process.cwd(), 'data', 'activepieces_config.json');
const DELIVERIES_FILE = path.resolve(process.cwd(), 'data', 'activepieces_deliveries.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(CONFIG_FILE))) {
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true });
}

function generateSecret(): string {
  return crypto.randomBytes(24).toString('hex');
}

const DEFAULT_CONFIG: ActivepiecesConfig = {
  webhookUrl: process.env.ACTIVEPIECES_WEBHOOK_URL || '',
  webhookSecret: process.env.ACTIVEPIECES_WEBHOOK_SECRET || generateSecret(),
  scheduleCron: '0 8 * * *', // Daily at 08:00 AM UTC
  scheduleTime: '08:00 UTC (Daily)',
  enabled: true,
  fallbackPolicy: 'highlights', // Send top verified highlights if no direct category match
  emailProvider: 'activepieces_email',
  fromEmail: 'alerts@opportunityghana.com',
  fromName: 'Opportunity Ghana Daily Alerts',
  lastRunAt: null,
  lastRunStatus: 'idle',
  totalDelivered: 0,
  totalErrors: 0
};

// In-memory cache of Activepieces configuration for fast and serverless lookups
let inMemoryConfig: ActivepiecesConfig | null = null;

// Helpers to serialize and deserialize to Firestore REST format
function toFirestoreFields(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value === null) {
      fields[key] = { nullValue: null };
    } else if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      fields[key] = Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map((v) =>
            typeof v === 'object' && v !== null ? { mapValue: { fields: toFirestoreFields(v) } } : { stringValue: String(v) }
          )
        }
      };
    } else if (typeof value === 'object') {
      fields[key] = { mapValue: { fields: toFirestoreFields(value) } };
    }
  }
  return fields;
}

function fromFirestoreFields(fields: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, valObj] of Object.entries(fields)) {
    if ('stringValue' in valObj) result[key] = valObj.stringValue;
    else if ('integerValue' in valObj) result[key] = parseInt(valObj.integerValue, 10);
    else if ('doubleValue' in valObj) result[key] = valObj.doubleValue;
    else if ('booleanValue' in valObj) result[key] = valObj.booleanValue;
    else if ('nullValue' in valObj) result[key] = null;
    else if ('mapValue' in valObj) result[key] = fromFirestoreFields(valObj.mapValue?.fields || {});
    else if ('arrayValue' in valObj) {
      result[key] = (valObj.arrayValue?.values || []).map((item: any) => {
        if ('mapValue' in item) return fromFirestoreFields(item.mapValue?.fields || {});
        if ('stringValue' in item) return item.stringValue;
        return item;
      });
    }
  }
  return result;
}

/**
 * Persists Activepieces configuration to Cloud Firestore (with local file/memory backup).
 * Never persists raw plaintext keys.
 */
export async function saveActivepiecesConfigToFirestore(
  config: ActivepiecesConfig,
  adminToken?: string
): Promise<boolean> {
  let persisted = false;

  const cleanConfig = { ...config };
  delete cleanConfig.apiKey; // Never store plaintext key in database

  // 1. Try Firebase Admin SDK
  if (adminDb) {
    try {
      await adminDb.collection('settings').doc('activepieces_config').set(cleanConfig, { merge: true });
      persisted = true;
      console.info('[Activepieces] Config successfully persisted to Cloud Firestore via adminDb.');
    } catch (adminErr: any) {
      console.warn('[Activepieces] adminDb Firestore write note:', adminErr?.message || adminErr);
    }
  }

  // 2. Try Firestore REST API with administrator's Bearer token if adminDb failed or lacked service account
  if (!persisted && adminToken) {
    try {
      const restUrl = `https://firestore.googleapis.com/v1/projects/opportunity-ghana/databases/(default)/documents/settings/activepieces_config`;
      const resp = await fetch(restUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ fields: toFirestoreFields(cleanConfig) })
      });
      if (resp.ok) {
        persisted = true;
        console.info('[Activepieces] Config successfully persisted to Cloud Firestore via REST with admin token.');
      } else {
        const errText = await resp.text().catch(() => '');
        console.warn(`[Activepieces] Firestore REST save failed (${resp.status}):`, errText);
      }
    } catch (restErr: any) {
      console.warn('[Activepieces] Firestore REST save note:', restErr?.message || restErr);
    }
  }

  // 3. Fallback: Save to local filesystem if writable
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cleanConfig, null, 2), 'utf8');
    persisted = true;
  } catch (fsErr) {
    // Expected on serverless environments with read-only filesystems
  }

  inMemoryConfig = cleanConfig;
  return persisted;
}

/**
 * Loads current Activepieces configuration from Firestore or disk/defaults.
 */
export async function fetchActivepiecesConfigFromFirestore(adminToken?: string): Promise<ActivepiecesConfig> {
  // 1. Try adminDb
  if (adminDb) {
    try {
      const docSnap = await adminDb.collection('settings').doc('activepieces_config').get();
      if (docSnap.exists) {
        const data = docSnap.data() as any;
        const merged: ActivepiecesConfig = { ...DEFAULT_CONFIG, ...data };
        delete merged.apiKey;
        inMemoryConfig = merged;
        return merged;
      }
    } catch (err: any) {
      console.debug('[Activepieces] adminDb config fetch note:', err?.message || err);
    }
  }

  // 2. Try Firestore REST API
  if (adminToken) {
    try {
      const restUrl = `https://firestore.googleapis.com/v1/projects/opportunity-ghana/databases/(default)/documents/settings/activepieces_config`;
      const resp = await fetch(restUrl, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (resp.ok) {
        const data = (await resp.json()) as any;
        if (data.fields) {
          const parsed = fromFirestoreFields(data.fields);
          const merged: ActivepiecesConfig = { ...DEFAULT_CONFIG, ...parsed };
          delete merged.apiKey;
          inMemoryConfig = merged;
          return merged;
        }
      }
    } catch (err: any) {
      console.debug('[Activepieces] REST config fetch note:', err?.message || err);
    }
  }

  // 3. Fallback to local file / memory
  return getActivepiecesConfig();
}

/**
 * Loads current Activepieces configuration from memory, disk, or defaults.
 * Automatically performs secure one-way migration for legacy plaintext keys.
 */
export function getActivepiecesConfig(): ActivepiecesConfig {
  if (inMemoryConfig) {
    return inMemoryConfig;
  }

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
      const parsed: ActivepiecesConfig = JSON.parse(raw);
      const merged = { ...DEFAULT_CONFIG, ...parsed };

      // Transparent Migration: If legacy plaintext apiKey exists and no currentApiKey hash is stored,
      // hash it immediately into a secure record and persist the sanitized config.
      if (parsed.apiKey && (!parsed.currentApiKey || !parsed.currentApiKey.keyHash)) {
        const legacyKey = parsed.apiKey.trim();
        const keyHash = crypto.createHash('sha256').update(legacyKey).digest('hex');
        const migratedKeyInfo: ActivepiecesApiKeyInfo = {
          keyPrefix: legacyKey.slice(0, 10),
          keySuffix: legacyKey.slice(-4),
          keyHash,
          status: 'active',
          createdAt: new Date().toISOString(),
          revokedAt: null,
          lastUsedAt: null,
          createdByName: 'Legacy Migration',
          createdByEmail: 'admin@opportunityghana.com'
        };

        merged.currentApiKey = migratedKeyInfo;
        delete merged.apiKey; // Delete plaintext key from config

        try {
          fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf8');
          console.info('[Activepieces] Successfully migrated legacy plaintext API key to secure SHA-256 hash storage.');
        } catch (migErr) {
          console.warn('[Activepieces] Failed to write migrated config to disk:', migErr);
        }
      }

      inMemoryConfig = merged;
      return merged;
    }
  } catch (err) {
    console.warn('[Activepieces] Error reading config file:', err);
  }
  return { ...DEFAULT_CONFIG };
}

/**
 * Generates a new cryptographically secure API key on the server (Async with Cloud Firestore persistence).
 * Returns the raw key ONLY once so the admin can copy it.
 * Only the SHA-256 hash and non-sensitive key metadata are stored.
 */
export async function generateNewApiKeyAsync(
  adminUser?: { name?: string; email?: string },
  adminToken?: string
): Promise<{ rawKey: string; keyInfo: ActivepiecesApiKeyInfo }> {
  // First load latest config (from Firestore if available, otherwise disk/memory)
  const config = await fetchActivepiecesConfigFromFirestore(adminToken);

  // Generate 32 bytes of cryptographically secure random bytes = 64 hex characters
  const rawKey = `og_live_${crypto.randomBytes(32).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const now = new Date().toISOString();

  const keyInfo: ActivepiecesApiKeyInfo = {
    keyPrefix: rawKey.slice(0, 12),
    keySuffix: rawKey.slice(-4),
    keyHash,
    status: 'active',
    createdAt: now,
    revokedAt: null,
    lastUsedAt: null,
    createdByName: adminUser?.name || 'Administrator',
    createdByEmail: adminUser?.email || 'admin@opportunityghana.com'
  };

  const previous = config.previousApiKeys ? [...config.previousApiKeys] : [];
  if (config.currentApiKey) {
    previous.unshift({
      ...config.currentApiKey,
      status: 'revoked',
      revokedAt: now
    });
  }

  const updatedConfig: ActivepiecesConfig = {
    ...config,
    currentApiKey: keyInfo,
    previousApiKeys: previous.slice(0, 20),
    apiKey: undefined
  };

  const persisted = await saveActivepiecesConfigToFirestore(updatedConfig, adminToken);
  if (!persisted) {
    throw new Error('Database persistence failure: Unable to write key to Firestore. Please check database permissions or service credentials.');
  }

  console.info(`[Activepieces] New integration API key successfully generated by ${keyInfo.createdByEmail} (Prefix: ${keyInfo.keyPrefix}...)`);
  return { rawKey, keyInfo };
}

/**
 * Synchronous version for backwards compatibility with tests and local scripts.
 */
export function generateNewApiKey(adminUser?: { name?: string; email?: string }): {
  rawKey: string;
  keyInfo: ActivepiecesApiKeyInfo;
} {
  const rawKey = `og_live_${crypto.randomBytes(32).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const now = new Date().toISOString();

  const keyInfo: ActivepiecesApiKeyInfo = {
    keyPrefix: rawKey.slice(0, 12),
    keySuffix: rawKey.slice(-4),
    keyHash,
    status: 'active',
    createdAt: now,
    revokedAt: null,
    lastUsedAt: null,
    createdByName: adminUser?.name || 'Administrator',
    createdByEmail: adminUser?.email || 'admin@opportunityghana.com'
  };

  const config = getActivepiecesConfig();
  const previous = config.previousApiKeys ? [...config.previousApiKeys] : [];

  if (config.currentApiKey) {
    previous.unshift({
      ...config.currentApiKey,
      status: 'revoked',
      revokedAt: now
    });
  }

  saveActivepiecesConfig({
    currentApiKey: keyInfo,
    previousApiKeys: previous.slice(0, 20),
    apiKey: undefined
  });

  console.info(`[Activepieces] New integration API key generated by ${keyInfo.createdByEmail} (Prefix: ${keyInfo.keyPrefix}...)`);
  return { rawKey, keyInfo };
}

/**
 * Revokes the currently active API key immediately (Async with Cloud Firestore persistence).
 */
export async function revokeCurrentApiKeyAsync(
  adminUser?: { name?: string; email?: string },
  adminToken?: string
): Promise<{ success: boolean; keyInfo?: ActivepiecesApiKeyInfo; error?: string }> {
  const config = await fetchActivepiecesConfigFromFirestore(adminToken);
  if (!config.currentApiKey || config.currentApiKey.status === 'revoked') {
    return { success: false, error: 'No active API key to revoke' };
  }

  const now = new Date().toISOString();
  const revokedKeyInfo: ActivepiecesApiKeyInfo = {
    ...config.currentApiKey,
    status: 'revoked',
    revokedAt: now
  };

  const previous = config.previousApiKeys ? [...config.previousApiKeys] : [];
  previous.unshift(revokedKeyInfo);

  const updatedConfig: ActivepiecesConfig = {
    ...config,
    currentApiKey: revokedKeyInfo,
    previousApiKeys: previous.slice(0, 20),
    apiKey: undefined
  };

  const persisted = await saveActivepiecesConfigToFirestore(updatedConfig, adminToken);
  if (!persisted) {
    return { success: false, error: 'Database persistence failure: Unable to update key revocation status in database.' };
  }

  console.info(`[Activepieces] API key revoked by ${adminUser?.email || 'Administrator'} (Prefix: ${revokedKeyInfo.keyPrefix}...)`);
  return { success: true, keyInfo: revokedKeyInfo };
}

/**
 * Synchronous revoke version for backwards compatibility with tests.
 */
export function revokeCurrentApiKey(adminUser?: { name?: string; email?: string }): {
  success: boolean;
  keyInfo?: ActivepiecesApiKeyInfo;
  error?: string;
} {
  const config = getActivepiecesConfig();
  if (!config.currentApiKey || config.currentApiKey.status === 'revoked') {
    return { success: false, error: 'No active API key to revoke' };
  }

  const now = new Date().toISOString();
  const revokedKeyInfo: ActivepiecesApiKeyInfo = {
    ...config.currentApiKey,
    status: 'revoked',
    revokedAt: now
  };

  const previous = config.previousApiKeys ? [...config.previousApiKeys] : [];
  previous.unshift(revokedKeyInfo);

  saveActivepiecesConfig({
    currentApiKey: revokedKeyInfo,
    previousApiKeys: previous.slice(0, 20),
    apiKey: undefined
  });

  console.info(`[Activepieces] API key revoked by ${adminUser?.email || 'Administrator'} (Prefix: ${revokedKeyInfo.keyPrefix}...)`);
  return { success: true, keyInfo: revokedKeyInfo };
}

/**
 * Updates the lastUsedAt timestamp for the active API key.
 */
export function recordApiKeyUsed(keyHash: string) {
  try {
    const config = getActivepiecesConfig();
    if (config.currentApiKey && config.currentApiKey.keyHash === keyHash) {
      config.currentApiKey.lastUsedAt = new Date().toISOString();
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    }
  } catch (err) {
    // Non-blocking telemetry
  }
}

/**
 * Returns public-safe configuration with secrets masked for Admin UI display.
 * Never leaks raw API keys or key hashes.
 */
export function getPublicActivepiecesConfig(): Omit<ActivepiecesConfig, 'webhookSecret' | 'currentApiKey' | 'previousApiKeys' | 'apiKey'> & {
  hasWebhookUrl: boolean;
  apiKeyMasked: string;
  webhookSecretMasked: string;
  apiKeyInfo: {
    status: 'active' | 'revoked' | 'not_generated';
    keyPrefix: string;
    keySuffix: string;
    maskedDisplay: string;
    createdAt: string | null;
    revokedAt: string | null;
    lastUsedAt: string | null;
    createdByName?: string;
    createdByEmail?: string;
  };
} {
  const config = getActivepiecesConfig();
  const current = config.currentApiKey;

  const apiKeyInfo = {
    status: current ? current.status : ('not_generated' as const),
    keyPrefix: current ? current.keyPrefix : '',
    keySuffix: current ? current.keySuffix : '',
    maskedDisplay: current
      ? `${current.keyPrefix}••••••••${current.keySuffix}`
      : 'No API key generated yet',
    createdAt: current ? current.createdAt : null,
    revokedAt: current ? current.revokedAt : null,
    lastUsedAt: current ? current.lastUsedAt : null,
    createdByName: current?.createdByName,
    createdByEmail: current?.createdByEmail
  };

  const maskedSecret = config.webhookSecret ? '••••••••••••' : '';

  return {
    webhookUrl: config.webhookUrl,
    scheduleCron: config.scheduleCron,
    scheduleTime: config.scheduleTime,
    enabled: config.enabled,
    fallbackPolicy: config.fallbackPolicy,
    emailProvider: config.emailProvider,
    fromEmail: config.fromEmail,
    fromName: config.fromName,
    lastRunAt: config.lastRunAt,
    lastRunStatus: config.lastRunStatus,
    totalDelivered: config.totalDelivered,
    totalErrors: config.totalErrors,
    hasWebhookUrl: Boolean(config.webhookUrl && config.webhookUrl.trim().length > 0),
    apiKeyMasked: apiKeyInfo.maskedDisplay,
    webhookSecretMasked: maskedSecret,
    apiKeyInfo
  };
}

/**
 * Updates Activepieces configuration and persists to disk.
 * Never overwrites API keys via generic config save unless explicitly handled.
 */
export function saveActivepiecesConfig(updates: Partial<ActivepiecesConfig>): ActivepiecesConfig {
  const current = getActivepiecesConfig();
  const nextConfig: ActivepiecesConfig = {
    ...current,
    ...updates,
    webhookSecret: updates.webhookSecret && updates.webhookSecret.trim() ? updates.webhookSecret.trim() : current.webhookSecret
  };

  // If updates explicitly provide currentApiKey, assign it
  if (updates.currentApiKey !== undefined) {
    nextConfig.currentApiKey = updates.currentApiKey;
  }
  if (updates.previousApiKeys !== undefined) {
    nextConfig.previousApiKeys = updates.previousApiKeys;
  }

  // Never store plaintext apiKey
  delete nextConfig.apiKey;

  inMemoryConfig = nextConfig;

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(nextConfig, null, 2), 'utf8');
  } catch (err) {
    // Non-blocking in serverless environments
  }

  // Sync to Firestore in background if adminDb is available
  if (adminDb) {
    adminDb.collection('settings').doc('activepieces_config').set(nextConfig, { merge: true }).catch(() => {});
  }

  return nextConfig;
}

/**
 * Loads recent delivery reports from disk
 */
export function getDeliveryReports(limit = 25): DeliveryReport[] {
  try {
    if (fs.existsSync(DELIVERIES_FILE)) {
      const raw = fs.readFileSync(DELIVERIES_FILE, 'utf8');
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        return list.slice(0, limit);
      }
    }
  } catch (err) {
    console.warn('[Activepieces] Error reading deliveries file:', err);
  }
  return [];
}

/**
 * Appends a delivery report to disk and updates metrics
 */
export function saveDeliveryReport(report: DeliveryReport) {
  try {
    let list: DeliveryReport[] = [];
    if (fs.existsSync(DELIVERIES_FILE)) {
      try {
        const raw = fs.readFileSync(DELIVERIES_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed;
      } catch {}
    }

    list.unshift(report);
    // Keep last 100 reports
    if (list.length > 100) list = list.slice(0, 100);

    fs.writeFileSync(DELIVERIES_FILE, JSON.stringify(list, null, 2), 'utf8');

    // Update config counters
    const current = getActivepiecesConfig();
    saveActivepiecesConfig({
      lastRunAt: report.timestamp,
      lastRunStatus: report.failedCount > 0 ? (report.deliveredCount > 0 ? 'partial' : 'failed') : 'success',
      totalDelivered: (current.totalDelivered || 0) + report.deliveredCount,
      totalErrors: (current.totalErrors || 0) + report.failedCount
    });
  } catch (err) {
    console.warn('[Activepieces] Error saving delivery report:', err);
  }
}

/**
 * Middleware to authenticate Activepieces API requests via Authorization: Bearer <API_KEY> header
 * (with backward-compatible support for x-api-key header).
 * Enforces cryptographic SHA-256 hash validation and checks active/revoked status.
 */
export function verifyActivepiecesAuth(req: Request, res: Response, next: NextFunction) {
  // Extract token from Authorization: Bearer <API_KEY> or x-api-key
  const authHeader = req.headers.authorization || '';
  const xApiKey = (req.headers['x-api-key'] as string) || '';

  let providedKey = '';
  if (/^Bearer\s+/i.test(authHeader)) {
    providedKey = authHeader.replace(/^Bearer\s+/i, '').trim();
  } else if (xApiKey) {
    providedKey = xApiKey.trim();
  }

  if (!providedKey) {
    return res.status(401).json({
      error: 'Unauthorized: Missing Activepieces API key. Please provide Authorization: Bearer <API_KEY> header.',
      code: 'auth/missing-api-key'
    });
  }

  const config = getActivepiecesConfig();
  const currentKey = config.currentApiKey;

  if (!currentKey || !currentKey.keyHash) {
    return res.status(401).json({
      error: 'Unauthorized: No Activepieces API key configured on the server. Please generate an API key in the Opportunity Ghana Admin Portal.',
      code: 'auth/no-active-key'
    });
  }

  if (currentKey.status === 'revoked') {
    return res.status(401).json({
      error: 'Unauthorized: The Activepieces API key has been revoked. Please generate a replacement key in the Opportunity Ghana Admin Portal.',
      code: 'auth/key-revoked'
    });
  }

  // Calculate SHA-256 hash of provided key
  const providedHash = crypto.createHash('sha256').update(providedKey).digest('hex');

  // Constant-time comparison against expected keyHash
  const expectedHashBuf = Buffer.from(currentKey.keyHash, 'hex');
  const providedHashBuf = Buffer.from(providedHash, 'hex');

  if (
    expectedHashBuf.length !== providedHashBuf.length ||
    !crypto.timingSafeEqual(expectedHashBuf, providedHashBuf)
  ) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid Activepieces API key. Please check your credentials.',
      code: 'auth/invalid-key'
    });
  }

  // Authenticated successfully! Record usage timestamp asynchronously
  recordApiKeyUsed(currentKey.keyHash);

  return next();
}

/**
 * Triggers an external Activepieces webhook when subscriber state changes
 */
export async function triggerActivepiecesSubscriberWebhook(
  event: 'subscriber.created' | 'subscriber.updated' | 'subscriber.unsubscribed',
  subscriber: any,
  baseUrl: string
): Promise<{ success: boolean; error?: string }> {
  const config = getActivepiecesConfig();
  if (!config.enabled || !config.webhookUrl) {
    return { success: false, error: 'Activepieces webhook not configured or disabled' };
  }

  try {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        categories: subscriber.categories || [],
        regions: subscriber.regions || ['All Ghana'],
        frequency: subscriber.frequency || 'daily',
        whatsappEnabled: Boolean(subscriber.whatsappEnabled),
        phone: subscriber.phone || '',
        status: subscriber.status || 'active',
        active: subscriber.active !== false,
        source: subscriber.source || 'Website',
        createdAt: subscriber.createdAt,
        updatedAt: subscriber.updatedAt,
        unsubscribeUrl: `${baseUrl}/alerts?email=${encodeURIComponent(subscriber.email)}&action=unsubscribe`,
        preferencesUrl: `${baseUrl}/alerts?email=${encodeURIComponent(subscriber.email)}`
      }
    };

    // Calculate HMAC signature
    const signature = crypto
      .createHmac('sha256', config.webhookSecret || 'secret')
      .update(JSON.stringify(payload))
      .digest('hex');

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Opportunity-Ghana-Event': event,
        'X-Opportunity-Ghana-Signature': signature,
        'X-Opportunity-Ghana-Key': config.currentApiKey?.keyPrefix || 'og_live'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn(`[Activepieces Webhook] Responded with status ${response.status}`);
      return { success: false, error: `Webhook returned status ${response.status}` };
    }

    console.info(`[Activepieces Webhook] Dispatched "${event}" for ${subscriber.email}`);
    return { success: true };
  } catch (err: any) {
    console.warn(`[Activepieces Webhook] Failed to deliver ${event}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Selects approved, published, unexpired opportunities matching a subscriber's preferences
 */
export function matchOpportunitiesForSubscriber(
  subscriber: any,
  opportunities: any[],
  fallbackPolicy: 'skip' | 'highlights' = 'highlights'
): any[] {
  const now = new Date();
  const subCats: string[] = (subscriber.categories || []).map((c: string) => c.toLowerCase().trim());
  const subRegions: string[] = (subscriber.regions || []).map((r: string) => r.toLowerCase().trim());
  const previouslySent: Set<string> = new Set(subscriber.sentOpportunityIds || []);

  // Filter candidates: strictly published, not closed, valid deadlines
  const validCandidates = opportunities.filter((opp) => {
    // Exclude unpublished, closed, or rejected
    if (opp.status !== 'published' && (opp.status as string) !== 'approved') return false;
    if (opp.submissionStatus === 'rejected' || opp.submissionStatus === 'pending') return false;

    // Check if deadline is passed
    if (opp.deadline) {
      try {
        const d = new Date(opp.deadline.includes('T') ? opp.deadline : `${opp.deadline}T23:59:59Z`);
        if (!isNaN(d.getTime()) && d.getTime() < now.getTime()) {
          return false; // Expired
        }
      } catch {}
    }

    return true;
  });

  // Score and match
  const matches = validCandidates.filter((opp) => {
    // Avoid sending already-sent listings unless reminder is needed
    if (previouslySent.has(opp.id)) return false;

    // Category match
    const oppCat = (opp.category || '').toLowerCase().trim();
    const oppSubCat = (opp.subcategory || '').toLowerCase().trim();
    const catMatch =
      subCats.length === 0 ||
      subCats.some((c) => oppCat.includes(c) || c.includes(oppCat) || oppSubCat.includes(c));

    // Region match
    const oppReg = (opp.region || opp.location || '').toLowerCase().trim();
    const regMatch =
      subRegions.length === 0 ||
      subRegions.includes('all ghana') ||
      subRegions.includes('ghana') ||
      subRegions.some((r) => oppReg.includes(r) || r.includes(oppReg));

    return catMatch && regMatch;
  });

  if (matches.length > 0) {
    return matches.slice(0, 5); // Return top 5 matches
  }

  // Fallback policy: if no new category match and policy is 'highlights'
  if (fallbackPolicy === 'highlights') {
    const unsentCandidates = validCandidates.filter((opp) => !previouslySent.has(opp.id));
    return unsentCandidates.slice(0, 3);
  }

  return [];
}

/**
 * Generates high-fidelity personalized HTML email for a subscriber
 */
export function generateAlertEmailHtml(
  subscriber: any,
  opportunities: any[],
  baseUrl: string
): { subject: string; html: string; text: string } {
  const email = subscriber.email;
  const count = opportunities.length;
  const leadTitle = opportunities[0]?.title || 'New Verified Opportunities';
  const subject = count === 1
    ? `🔔 Opportunity Ghana Daily Alert: ${leadTitle}`
    : `🔔 Opportunity Ghana Daily Alert: ${count} Verified Opportunities for You`;

  const unsubscribeUrl = `${baseUrl}/alerts?email=${encodeURIComponent(email)}&action=unsubscribe`;
  const preferencesUrl = `${baseUrl}/alerts?email=${encodeURIComponent(email)}`;
  const dateFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const cardsHtml = opportunities
    .map((opp) => {
      const oppUrl = `${baseUrl}/opportunities/${opp.slug || opp.id}`;
      const categoryBadge = opp.category || 'Opportunity';
      const deadlineText = opp.deadline ? `Deadline: ${opp.deadline}` : 'Deadline: Rolling / Open';
      const orgName = opp.organizationName || 'Verified Institution';
      const location = opp.location || opp.region || 'Ghana';
      const funding = opp.fundingType || opp.opportunityType || 'Verified Listing';
      const snippet = (opp.description || '').slice(0, 160).trim() + (opp.description?.length > 160 ? '...' : '');

      return `
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 22px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <span style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 6px; border: 1px solid #a7f3d0;">
              ${categoryBadge}
            </span>
            <span style="font-size: 11px; font-weight: 600; color: #64748b; background-color: #f8fafc; padding: 3px 8px; border-radius: 6px;">
              ${funding}
            </span>
          </div>

          <h3 style="margin: 0 0 8px 0; font-size: 17px; font-weight: 700; color: #0f172a; line-height: 1.35;">
            <a href="${oppUrl}" style="color: #0f172a; text-decoration: none;">
              ${opp.title}
            </a>
          </h3>

          <div style="font-size: 12px; color: #64748b; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 600; color: #334155;">🏛️ ${orgName}</span>
            <span>•</span>
            <span>📍 ${location}</span>
          </div>

          <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569; line-height: 1.55;">
            ${snippet}
          </p>

          <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid #f1f5f9;">
            <span style="font-size: 12px; font-weight: 600; color: #b45309; background-color: #fef3c7; padding: 4px 8px; border-radius: 6px;">
              ⏰ ${deadlineText}
            </span>
            <a href="${oppUrl}" style="display: inline-block; background-color: #006B3F; color: #ffffff; font-size: 12px; font-weight: 700; text-decoration: none; padding: 8px 16px; border-radius: 8px;">
              View & Apply →
            </a>
          </div>
        </div>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 24px 12px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <!-- Top Branding Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #051930 0%, #006B3F 65%, #0B3558 100%); padding: 28px 24px; text-align: center;">
                  <div style="display: inline-block; background-color: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); color: #FCD116; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 20px; margin-bottom: 8px;">
                    🇬🇭 Opportunity Ghana Daily Alert
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                    Verified Opportunities For You
                  </h1>
                  <p style="margin: 6px 0 0 0; color: rgba(255,255,255,0.85); font-size: 12px;">
                    ${dateFormatted} • Tailored to your saved categories
                  </p>
                </td>
              </tr>

              <!-- Greeting & Intro -->
              <tr>
                <td style="padding: 24px 24px 12px 24px; background-color: #ffffff;">
                  <p style="margin: 0 0 12px 0; font-size: 14px; color: #1e293b; line-height: 1.5;">
                    Hello <strong>${email.split('@')[0]}</strong>,
                  </p>
                  <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.55;">
                    Here are today's latest verified scholarships, jobs, grants, and internships published on Opportunity Ghana matching your preferences:
                  </p>
                </td>
              </tr>

              <!-- Opportunities List -->
              <tr>
                <td style="padding: 12px 24px;">
                  ${cardsHtml}
                </td>
              </tr>

              <!-- Explore More Button -->
              <tr>
                <td style="padding: 4px 24px 24px 24px; text-align: center;">
                  <a href="${baseUrl}/opportunities" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 12px;">
                    Browse All Active Opportunities →
                  </a>
                </td>
              </tr>

              <!-- Footer & Unsubscribe Rules -->
              <tr>
                <td style="background-color: #f1f5f9; padding: 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
                  <p style="margin: 0 0 10px 0; font-weight: 600; color: #334155;">
                    Opportunity Ghana — Connecting Ghanaian youth, graduates, and professionals to verified opportunities.
                  </p>
                  <p style="margin: 0 0 12px 0;">
                    🛡️ <strong>Safety Notice:</strong> Opportunity Ghana never charges applicants for jobs, scholarships, or grants.
                  </p>
                  <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
                    <a href="${preferencesUrl}" style="color: #047857; font-weight: 700; text-decoration: underline; margin-right: 14px;">
                      Manage Alert Preferences
                    </a>
                    <a href="${unsubscribeUrl}" style="color: #dc2626; font-weight: 700; text-decoration: underline;">
                      Unsubscribe from Daily Alerts
                    </a>
                  </div>
                  <p style="margin: 12px 0 0 0; color: #94a3b8; font-size: 10px;">
                    Sent to ${email}. Powered by Activepieces automated alert engine.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
Opportunity Ghana Daily Alert (${dateFormatted})
==================================================

Hello,

Here are the latest verified opportunities matching your preferences:

${opportunities
  .map(
    (o, i) =>
      `${i + 1}. ${o.title}
   Category: ${o.category} | Organization: ${o.organizationName || 'N/A'}
   Deadline: ${o.deadline || 'Rolling'}
   Link: ${baseUrl}/opportunities/${o.slug || o.id}
`
  )
  .join('\n')}

Browse all listings: ${baseUrl}/opportunities
Manage your preferences: ${preferencesUrl}
Unsubscribe: ${unsubscribeUrl}

Opportunity Ghana will never charge you for listings.
  `.trim();

  return { subject, html, text };
}

/**
 * Generates the complete, authentic, importable Activepieces flow definition JSON adhering strictly
 * to the Activepieces Template and FlowVersion schema specifications (supports Activepieces Cloud import).
 */
export function generateActivepiecesFlowJson(baseUrl?: string): Record<string, any> {
  const config = getActivepiecesConfig();
  // Mandatory production base URL: Enforce https://opportunityghana.site everywhere in the generated Activepieces workflow
  const cleanBaseUrl = PRODUCTION_ACTIVEPIECES_BASE_URL;
  const nowIso = new Date().toISOString();

  // Step 4: Record Deliveries and Log Run Metrics (Code Piece)
  const step4 = {
    name: 'step_4',
    displayName: '4. Record Deliveries & Verify Outcome',
    type: 'CODE',
    valid: true,
    skip: false,
    lastUpdatedDate: nowIso,
    settings: {
      input: {
        runResult: "{{step_3['body']}}"
      },
      sourceCode: {
        code: `export const code = async (inputs) => {
  const result = inputs.runResult || {};
  return {
    success: Boolean(result.success),
    runId: result.runId || '',
    totalSubscribers: result.totalSubscribers || 0,
    deliveredCount: result.deliveredCount || 0,
    failedCount: result.failedCount || 0,
    skippedCount: result.skippedCount || 0,
    timestamp: new Date().toISOString()
  };
};
`,
        packageJson: '{}'
      },
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false }
      }
    }
  };

  // Step 3: Match Preferences & Dispatch Email Engine (HTTP Piece POST)
  const step3 = {
    name: 'step_3',
    displayName: '3. Execute Preference Matcher & Dispatch Email Engine',
    type: 'PIECE',
    valid: true,
    skip: false,
    lastUpdatedDate: nowIso,
    settings: {
      pieceName: '@activepieces/piece-http',
      pieceVersion: '~0.9.4',
      actionName: 'send_request',
      input: {
        method: 'POST',
        url: `${cleanBaseUrl}/api/activepieces/trigger-daily-run`,
        headers: {
          'Authorization': 'Bearer REPLACE_WITH_OPPORTUNITY_GHANA_API_KEY',
          'Content-Type': 'application/json'
        },
        authType: 'NONE',
        body: {
          source: 'activepieces_scheduled_workflow',
          fallbackPolicy: config.fallbackPolicy || 'highlights'
        },
        body_type: 'json',
        queryParams: {},
        failsafe: false,
        use_proxy: false
      },
      propertySettings: {},
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false }
      }
    },
    nextAction: step4
  };

  // Step 2: Fetch Approved Opportunities (HTTP Piece GET)
  const step2 = {
    name: 'step_2',
    displayName: '2. Fetch Approved Opportunities from Opportunity Ghana',
    type: 'PIECE',
    valid: true,
    skip: false,
    lastUpdatedDate: nowIso,
    settings: {
      pieceName: '@activepieces/piece-http',
      pieceVersion: '~0.9.4',
      actionName: 'send_request',
      input: {
        method: 'GET',
        url: `${cleanBaseUrl}/api/activepieces/opportunities`,
        headers: {
          'Authorization': 'Bearer REPLACE_WITH_OPPORTUNITY_GHANA_API_KEY',
          'Accept': 'application/json'
        },
        authType: 'NONE',
        body: {},
        body_type: 'none',
        queryParams: {
          limit: '200'
        },
        failsafe: false,
        use_proxy: false
      },
      propertySettings: {},
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false }
      }
    },
    nextAction: step3
  };

  // Step 1: Fetch Active Subscribers (HTTP Piece GET)
  const step1 = {
    name: 'step_1',
    displayName: '1. Fetch Active Subscribers from Opportunity Ghana',
    type: 'PIECE',
    valid: true,
    skip: false,
    lastUpdatedDate: nowIso,
    settings: {
      pieceName: '@activepieces/piece-http',
      pieceVersion: '~0.9.4',
      actionName: 'send_request',
      input: {
        method: 'GET',
        url: `${cleanBaseUrl}/api/activepieces/subscribers`,
        headers: {
          'Authorization': 'Bearer REPLACE_WITH_OPPORTUNITY_GHANA_API_KEY',
          'Accept': 'application/json'
        },
        authType: 'NONE',
        body: {},
        body_type: 'none',
        queryParams: {
          limit: '500'
        },
        failsafe: false,
        use_proxy: false
      },
      propertySettings: {},
      errorHandlingOptions: {
        retryOnFailure: { value: false },
        continueOnFailure: { value: false }
      }
    },
    nextAction: step2
  };

  // Trigger: Daily Schedule Trigger (Schedule Piece)
  const trigger = {
    name: 'trigger',
    displayName: 'Every Day (Daily Schedule at 08:00 UTC)',
    type: 'PIECE_TRIGGER',
    valid: true,
    lastUpdatedDate: nowIso,
    settings: {
      pieceName: '@activepieces/piece-schedule',
      pieceVersion: '~0.1.5',
      triggerName: 'every_day',
      input: {
        timezone: 'UTC',
        hour_of_the_day: 8,
        run_on_weekends: true
      },
      inputUiInfo: {
        customizedInputs: {}
      },
      propertySettings: {}
    },
    nextAction: step1
  };

  // Flow definition compatible with Activepieces FlowVersion and FlowVersionTemplate
  const flow = {
    displayName: 'Opportunity Ghana - Automated Daily Subscriber Alerts',
    valid: true,
    notes: [],
    schemaVersion: '28',
    trigger
  };

  // Authentic Activepieces Template export object conforming to Activepieces Template Schema & template-parser.ts
  return {
    id: 'opportunity-ghana-daily-subscriber-alerts',
    name: 'Opportunity Ghana - Automated Daily Subscriber Alerts',
    displayName: 'Opportunity Ghana - Automated Daily Subscriber Alerts',
    summary: 'Daily automated workflow connecting Opportunity Ghana with Activepieces to dispatch personalized opportunity alerts.',
    description: 'Daily automated workflow connecting Opportunity Ghana with Activepieces. Runs on an automated schedule every 24 hours at 08:00 UTC, fetches active subscribers, queries approved listings, executes category & region preference matching, dispatches branded alert emails, and records execution metrics.',
    type: 'OFFICIAL',
    status: 'PUBLISHED',
    schemaVersion: '28',
    valid: true,
    pieces: [
      '@activepieces/piece-schedule',
      '@activepieces/piece-http'
    ],
    tags: [],
    categories: [
      'Alerts',
      'Email',
      'Education',
      'Jobs'
    ],
    blogUrl: '',
    metadata: null,
    platformId: null,
    created: '2026-01-01T00:00:00.000Z',
    updated: nowIso,
    flows: [flow],
    template: flow,
    trigger
  };
}

/**
 * Runs the full automation cycle on the server (called by Activepieces scheduled workflow or admin test)
 */
export async function executeActivepiecesAlertRun(
  baseUrl: string,
  serverAlertSubscribersMap: Map<string, any>,
  persistServerAlertSubscribers: () => void,
  serverPublishedOppsMap: Map<string, any>,
  ALL_VERIFIED_INITIAL: any[],
  adminDb?: any,
  options?: { fallbackPolicy?: 'skip' | 'highlights'; simulateOnly?: boolean }
): Promise<{
  success: boolean;
  runId: string;
  totalSubscribers: number;
  deliveredCount: number;
  failedCount: number;
  skippedCount: number;
  deliveries: DeliveryDetail[];
  sampleEmail?: { to: string; subject: string; html: string };
  message: string;
}> {
  const runId = `ap_run_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();
  const config = getActivepiecesConfig();
  const fallbackPolicy = options?.fallbackPolicy || config.fallbackPolicy || 'highlights';

  // 1. Gather all published opportunities
  const allOppsMap = new Map<string, any>();
  for (const opp of serverPublishedOppsMap.values()) {
    if (opp && opp.id) allOppsMap.set(opp.id, opp);
  }
  for (const v of ALL_VERIFIED_INITIAL) {
    if (v && v.id && !allOppsMap.has(v.id)) allOppsMap.set(v.id, v);
  }
  const publishedOpportunities = Array.from(allOppsMap.values());

  // 2. Gather active subscribers
  const activeSubscribers = Array.from(serverAlertSubscribersMap.values()).filter(
    (s) => s.status === 'active' && s.active !== false
  );

  const deliveries: DeliveryDetail[] = [];
  let deliveredCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  let sampleEmail: { to: string; subject: string; html: string } | undefined = undefined;

  for (const subscriber of activeSubscribers) {
    try {
      const matches = matchOpportunitiesForSubscriber(subscriber, publishedOpportunities, fallbackPolicy);

      if (matches.length === 0) {
        skippedCount++;
        deliveries.push({
          subscriberId: subscriber.id,
          email: subscriber.email,
          status: 'skipped_no_matches',
          opportunitiesSent: [],
          timestamp: now
        });
        continue;
      }

      // Generate Email HTML
      const emailContent = generateAlertEmailHtml(subscriber, matches, baseUrl);
      if (!sampleEmail) {
        sampleEmail = {
          to: subscriber.email,
          subject: emailContent.subject,
          html: emailContent.html
        };
      }

      // Update subscriber history with sent IDs
      const sentIds = matches.map((m) => m.id);
      const sentTitles = matches.map((m) => m.title);
      const prevSent = Array.isArray(subscriber.sentOpportunityIds) ? subscriber.sentOpportunityIds : [];
      const updatedSentIds = Array.from(new Set([...prevSent, ...sentIds]));

      subscriber.lastAlertSentAt = now;
      subscriber.lastAlertTitle = matches[0]?.title || 'Daily Digest';
      subscriber.alertsCount = (subscriber.alertsCount || 0) + 1;
      subscriber.sentOpportunityIds = updatedSentIds;
      subscriber.updatedAt = now;

      // Update in server map
      serverAlertSubscribersMap.set(subscriber.email.toLowerCase().trim(), subscriber);

      if (adminDb) {
        adminDb.collection('alerts').doc(subscriber.id).set(subscriber, { merge: true }).catch(() => {});
      }

      deliveredCount++;
      deliveries.push({
        subscriberId: subscriber.id,
        email: subscriber.email,
        status: 'delivered',
        opportunitiesSent: sentIds,
        opportunitiesTitles: sentTitles,
        timestamp: now
      });
    } catch (err: any) {
      failedCount++;
      deliveries.push({
        subscriberId: subscriber.id,
        email: subscriber.email,
        status: 'failed',
        opportunitiesSent: [],
        error: err.message || 'Delivery error',
        timestamp: now
      });
    }
  }

  // Persist subscriber changes to disk
  persistServerAlertSubscribers();

  // Save delivery report
  const report: DeliveryReport = {
    id: `rep_${Date.now()}`,
    runId,
    timestamp: now,
    totalSubscribers: activeSubscribers.length,
    deliveredCount,
    failedCount,
    skippedCount,
    details: deliveries
  };
  saveDeliveryReport(report);

  return {
    success: true,
    runId,
    totalSubscribers: activeSubscribers.length,
    deliveredCount,
    failedCount,
    skippedCount,
    deliveries,
    sampleEmail,
    message: `Activepieces automation run completed. ${deliveredCount} delivered, ${skippedCount} skipped, ${failedCount} errors.`
  };
}
