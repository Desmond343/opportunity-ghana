import React, { useEffect } from 'react';
import { MONETAG_CONFIG, isAdAllowedOnPath } from '../../config/advertisingConfig';

interface MonetagOnclickTagProps {
  currentPath: string;
}

/**
 * Monetag Onclick Advertising Tag Component
 * Zone ID: 11987099 | Script: https://al5sm.com/tag.min.js
 *
 * Safety & Compatibility Protections:
 * 1. Strictly disabled while Google AdSense status is "Getting ready" (MONETAG_CONFIG.onclickEnabled = false).
 * 2. Strictly excluded from sensitive routes: admin/CMS, login/signup, submissions, profile, alerts.
 * 3. Prevents duplicate injection across SPA route transitions.
 * 4. Cleans up script tag when navigating to restricted routes.
 */
export const MonetagOnclickTag: React.FC<MonetagOnclickTagProps> = ({ currentPath }) => {
  useEffect(() => {
    // Check master switch
    if (!MONETAG_CONFIG.onclickEnabled) {
      return;
    }

    // Check if the current route permits ads
    if (!isAdAllowedOnPath(currentPath)) {
      // Remove any previously inserted Monetag onclick scripts if present
      const existingScript = document.querySelector(`script[data-zone="${MONETAG_CONFIG.onclickZoneId}"]`);
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
      return;
    }

    // Check if already injected
    const existing = document.querySelector(`script[data-zone="${MONETAG_CONFIG.onclickZoneId}"]`);
    if (existing) {
      return;
    }

    // Inject exact script using Monetag's specified logic
    try {
      const script = document.createElement('script');
      script.dataset.zone = MONETAG_CONFIG.onclickZoneId;
      script.src = MONETAG_CONFIG.onclickScriptUrl;
      script.async = true;

      const target = [document.documentElement, document.body].filter(Boolean).pop();
      if (target) {
        target.appendChild(script);
      }
    } catch (err) {
      console.warn('[Opportunity Ghana] Monetag tag initialization prevented:', err);
    }
  }, [currentPath]);

  return null;
};
