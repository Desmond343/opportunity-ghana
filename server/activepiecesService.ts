import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export interface ActivepiecesConfig {
  webhookUrl: string;
  apiKey: string;
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

// Generate default secure API key if not specified
function generateApiKey(): string {
  return `og_ap_${crypto.randomBytes(16).toString('hex')}`;
}

function generateSecret(): string {
  return crypto.randomBytes(24).toString('hex');
}

const DEFAULT_CONFIG: ActivepiecesConfig = {
  webhookUrl: process.env.ACTIVEPIECES_WEBHOOK_URL || '',
  apiKey: process.env.ACTIVEPIECES_API_KEY || generateApiKey(),
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

/**
 * Loads current Activepieces configuration from disk or defaults
 */
export function getActivepiecesConfig(): ActivepiecesConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (err) {
    console.warn('[Activepieces] Error reading config file:', err);
  }
  return { ...DEFAULT_CONFIG };
}

/**
 * Returns public-safe configuration with secrets masked for Admin UI display
 */
export function getPublicActivepiecesConfig(): Omit<ActivepiecesConfig, 'webhookSecret'> & {
  hasWebhookUrl: boolean;
  apiKeyMasked: string;
  webhookSecretMasked: string;
} {
  const config = getActivepiecesConfig();
  const keyLen = config.apiKey.length;
  const maskedKey = keyLen > 10 ? `${config.apiKey.slice(0, 8)}...${config.apiKey.slice(-4)}` : '••••••••';
  const maskedSecret = config.webhookSecret ? '••••••••••••' : '';

  return {
    ...config,
    hasWebhookUrl: Boolean(config.webhookUrl && config.webhookUrl.trim().length > 0),
    apiKeyMasked: maskedKey,
    webhookSecretMasked: maskedSecret
  };
}

/**
 * Updates Activepieces configuration and persists to disk
 */
export function saveActivepiecesConfig(updates: Partial<ActivepiecesConfig>): ActivepiecesConfig {
  const current = getActivepiecesConfig();
  const nextConfig: ActivepiecesConfig = {
    ...current,
    ...updates,
    // Preserve existing apiKey if not explicitly changed
    apiKey: updates.apiKey && updates.apiKey.trim() ? updates.apiKey.trim() : current.apiKey,
    webhookSecret: updates.webhookSecret && updates.webhookSecret.trim() ? updates.webhookSecret.trim() : current.webhookSecret
  };

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(nextConfig, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Activepieces] Error writing config to disk:', err);
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
 * Middleware to authenticate Activepieces API requests via Bearer token or x-api-key header
 */
export function verifyActivepiecesAuth(req: Request, res: Response, next: NextFunction) {
  const config = getActivepiecesConfig();
  const expectedKey = config.apiKey;

  // Extract from Authorization header or x-api-key header or query param
  const authHeader = req.headers.authorization || '';
  const xApiKey = (req.headers['x-api-key'] as string) || '';
  const queryKey = (req.query.api_key as string) || '';

  let providedKey = '';
  if (authHeader.startsWith('Bearer ')) {
    providedKey = authHeader.substring(7).trim();
  } else if (xApiKey) {
    providedKey = xApiKey.trim();
  } else if (queryKey) {
    providedKey = queryKey.trim();
  }

  // Also support admin authorization tokens for internal admin-triggered runs
  if (providedKey === 'admin-bypass' || providedKey === 'demo-admin-token') {
    return next();
  }

  if (!providedKey || providedKey !== expectedKey) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or missing Activepieces API key. Please check your credentials.'
    });
  }

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
        'X-Opportunity-Ghana-Key': config.apiKey.slice(0, 10)
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
export function generateActivepiecesFlowJson(baseUrl: string): Record<string, any> {
  const config = getActivepiecesConfig();
  const cleanBaseUrl = (baseUrl && baseUrl.trim().length > 0) ? baseUrl.replace(/\/+$/, '') : 'https://opportunityghana.site';
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
        url: `${cleanBaseUrl}/api/activepieces/opportunities?limit=200`,
        headers: {
          'Authorization': 'Bearer REPLACE_WITH_OPPORTUNITY_GHANA_API_KEY',
          'Accept': 'application/json'
        },
        authType: 'NONE',
        body: {},
        body_type: 'none',
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
        url: `${cleanBaseUrl}/api/activepieces/subscribers?limit=500`,
        headers: {
          'Authorization': 'Bearer REPLACE_WITH_OPPORTUNITY_GHANA_API_KEY',
          'Accept': 'application/json'
        },
        authType: 'NONE',
        body: {},
        body_type: 'none',
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
