import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker for offline caching and standalone execution
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.info('[Opportunity Ghana PWA] New version ready.');
    },
    onOfflineReady() {
      console.info('[Opportunity Ghana PWA] Cached for offline access.');
    },
    onRegistered(registration) {
      console.info('[Opportunity Ghana PWA] Service worker registered:', registration?.scope);
    },
    onRegisterError(error) {
      console.warn('[Opportunity Ghana PWA] Service worker registration failed:', error);
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
