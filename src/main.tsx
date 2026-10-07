import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker for offline caching, installability, and standalone execution
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.info('[Opportunity Ghana PWA] Service worker active:', registration.scope);
        registration.update().catch(() => {});
      })
      .catch(() => {
        // Fallback to VitePWA virtual register if direct /sw.js fails
        try {
          registerSW({
            immediate: true,
            onRegistered(reg) {
              console.info('[Opportunity Ghana PWA] Virtual SW registered:', reg?.scope);
            },
            onRegisterError(err) {
              console.warn('[Opportunity Ghana PWA] SW registration error:', err);
            }
          });
        } catch (e) {
          console.warn('[Opportunity Ghana PWA] Fallback SW registration skipped:', e);
        }
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
