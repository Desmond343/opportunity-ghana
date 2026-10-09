/* =========================================================================
 * MONETAG ADVERTISING SERVICE WORKER (Zone ID: 11987012 | Domain: 3nbf4.com)
 *
 * Supplied configuration for Monetag push notification verification at /sw.js.
 *
 * ADSENSE REVIEW & PWA COMPATIBILITY GUARD:
 * - Google AdSense site approval status is currently "Getting ready" with Auto Ads.
 * - Active push subscription prompts, external redirects, or intrusive ad
 *   behaviors during Google's automated review can trigger policy violations.
 * - To preserve AdSense review eligibility and maintain full PWA offline
 *   caching stability, active execution is safely guarded via MONETAG_ENABLED.
 * - To activate Monetag after AdSense approval, switch MONETAG_ENABLED to true.
 * ========================================================================= */
self.options = {
    "domain": "3nbf4.com",
    "zoneId": 11987012
};

self.lary = "";

const MONETAG_ENABLED = false;

if (MONETAG_ENABLED) {
  try {
    importScripts('https://3nbf4.com/act/files/service-worker.min.js?r=sw');
  } catch (err) {
    // Graceful offline fallback: prevent service worker crash when offline
    console.warn('[Opportunity Ghana] Monetag service worker script skipped or offline:', err);
  }
}

/* =========================================================================
 * OPPORTUNITY GHANA PWA SERVICE WORKER
 * Offline shell caching, asset stale-while-revalidate, and lifecycle handlers
 * ========================================================================= */
const CACHE_NAME = 'opportunity-ghana-v2';
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/favicon.ico'
];

// URLs/hosts that must NEVER be cached or intercepted by the service worker
const EXCLUDED_HOSTS = [
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firestore.googleapis.com',
  'firebaseinstallations.googleapis.com',
  'googleapis.com',
  'google.com',
  '3nbf4.com',
  'monetag.com'
];

// Install: Precaches core shell assets & offline fallback resiliently
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => Promise.allSettled(STATIC_ASSETS.map((asset) => cache.add(asset))))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches (including any stale precache buckets) and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return Promise.resolve();
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Allow immediate skipWaiting message from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: Network-first for navigation & scripts/styles, stale-while-revalidate for static images/fonts
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Never intercept non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // 2. Never cache or intercept Firebase Auth, Firestore, live APIs, or Vite dev modules
  if (
    EXCLUDED_HOSTS.some((host) => url.hostname.includes(host)) ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/@') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.includes('__vite') ||
    url.pathname.includes('dev-sw.js') ||
    url.protocol.startsWith('chrome-extension')
  ) {
    return;
  }

  // 3. Navigation requests (Page Loads): Network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const rootShell = await caches.match('/');
          if (rootShell) {
            return rootShell;
          }
          const offlinePage = await caches.match('/offline.html');
          if (offlinePage) {
            return offlinePage;
          }
          return new Response('You are offline. Please reconnect to Opportunity Ghana.', {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 4. Static visual assets (Images, Icons, Fonts): Stale-while-revalidate
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            if (cachedResponse) return cachedResponse;
            if (request.destination === 'image') {
              return caches.match('/icon-192.png');
            }
          });

        return cachedResponse || fetchPromise;
      })
    );
  }
});
