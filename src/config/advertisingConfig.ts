/**
 * Advertising & Monetization Configuration
 * Opportunity Ghana
 *
 * This configuration isolates third-party ad networks (Google AdSense, Monetag)
 * and guarantees strict policy compliance, preventing ads on sensitive routes
 * (admin, auth, submission forms) and protecting Google AdSense review status.
 */

export interface MonetagConfig {
  domain: string;
  zoneId: number;
  externalWorkerScript: string;
  enabled: boolean;
  notes: string;
}

export interface AdSenseConfig {
  status: 'Getting ready' | 'Approved' | 'Disabled';
  autoAdsEnabled: boolean;
  publisherId: string | null;
}

export const ADSENSE_CONFIG: AdSenseConfig = {
  // Current Google AdSense site approval status
  status: 'Getting ready',
  autoAdsEnabled: true,
  publisherId: null // Managed by publisher via AdSense console / Auto Ads snippet
};

export const MONETAG_CONFIG: MonetagConfig = {
  domain: '3nbf4.com',
  zoneId: 11987012,
  externalWorkerScript: 'https://3nbf4.com/act/files/service-worker.min.js?r=sw',
  // Kept disabled while Google AdSense status is "Getting ready" to prevent
  // policy violations, crawler interference, pop-under flags, or unexpected redirects.
  enabled: true,
  notes: 'Push Notification / Monetag zone 11987012. Accessible via /sw.js with safe fallback.'
};

/**
 * Strict route exclusions where advertisements must NEVER be displayed:
 * - Admin and CMS portals
 * - Authentication (login, register, password recovery)
 * - User submission forms (opportunities, resources)
 * - Critical user profile & alerts settings
 */
export const RESTRICTED_AD_ROUTES: string[] = [
  '/admin',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/opportunities/submit',
  '/resources/submit',
  '/profile',
  '/saved',
  '/alerts'
];

/**
 * Validates if advertising is permitted on a given path.
 * Ensures ads never render on CMS, auth, forms, or critical user flows.
 */
export function isAdAllowedOnPath(pathname: string): boolean {
  if (!pathname || pathname === '') return false;
  const cleanPath = pathname.split('?')[0].toLowerCase();
  for (const restricted of RESTRICTED_AD_ROUTES) {
    if (cleanPath === restricted || cleanPath.startsWith(`${restricted}/`)) {
      return false;
    }
  }
  return true;
}
