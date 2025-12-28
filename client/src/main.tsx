import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initEruda, logger } from '@/utils';
import '@/assets/styles/index.scss';

// Initialize Eruda debugger (only in development)
void initEruda();

// Register service worker update handler
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, show update notification
            logger.info('SW', 'New content available, refresh to update');
            // You can show a toast or notification here
          }
        });
      }
    });
  }).catch((error) => {
    logger.error('SW', 'Registration failed:', error);
  });
}

// Mount React app
const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <App />
);
