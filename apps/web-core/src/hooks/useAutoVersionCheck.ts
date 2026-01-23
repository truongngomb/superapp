import { useEffect, useCallback, useRef } from 'react';
import { settingsService } from '@/services/settings.service';
import { logger } from '@superapp/core-logic';

const CHECK_INTERVAL = 60 * 1000; // Check every 1 minute
const RELOAD_COOLDOWN = 10 * 1000; // Prevent loop reloading within 10s

/**
 * Hook to automatically check for application updates
 * Strategy: Database-Driven Versioning
 * 
 * Logic:
 * 1. Client Version (__APP_VERSION__) comes from build time (hardcoded).
 * 2. Server Version (system_version) comes from Settings DB.
 * 3. If Server > Client  => Reload.
 * 4. If Server == Client => Do nothing.
 * 5. If Client > Server  => Do nothing (New Code deployed, DB not yet updated).
 */
export function useAutoVersionCheck() {
  const lastCheck = useRef<number>(0);

  const compareVersions = (server: string, client: string): number => {
    // 0. Safety Checks
    if (!server || !client) return 0;
    
    // 1. Exact string match check (Fast path)
    if (server === client) return 0;

    // 2. Normalize
    const normalize = (v: string) => v.toLowerCase().replace(/^v/, '').trim();
    const s = normalize(server);
    const c = normalize(client);
    
    // Check again after normalization
    if (s === c) return 0;
    
    // 3. Split and Compare
    const sParts = s.split('.').map(p => parseInt(p, 10));
    const cParts = c.split('.').map(p => parseInt(p, 10));
    
    for (let i = 0; i < Math.max(sParts.length, cParts.length); i++) {
      const spPart = sParts[i];
      const cpPart = cParts[i];

      // Treat undefined or NaN as 0
      const sp = (spPart === undefined || isNaN(spPart)) ? 0 : spPart;
      const cp = (cpPart === undefined || isNaN(cpPart)) ? 0 : cpPart;
      
      if (sp > cp) return 1;
      if (sp < cp) return -1;
    }
    return 0;
  };

  const checkForUpdate = useCallback(async () => {
    // Throttle checks
    const now = Date.now();
    if (now - lastCheck.current < CHECK_INTERVAL && lastCheck.current !== 0) {
      return;
    }

    try {
      const settings = await settingsService.getPublic();
      const serverVersionSetting = settings.find(s => s.key === 'system_version');
      
      // Ensure string and handle missing
      const rawServerVersion = serverVersionSetting?.value;
      if (!rawServerVersion) return; // No version on server -> Do nothing

      // Prevent object stringification issues
      if (typeof rawServerVersion === 'object') {
        logger.warn('useAutoVersionCheck', 'System version is an object, expected string/number');
        return;
      }

      const serverVersion = typeof rawServerVersion === 'string' || typeof rawServerVersion === 'number' 
        ? String(rawServerVersion) 
        : '';
        
      if (!serverVersion) return;
      // __APP_VERSION__ is already a string
      const clientVersion = __APP_VERSION__;

      logger.debug('useAutoVersionCheck', `Comparing variants: Server[${serverVersion}] vs Client[${clientVersion}]`);

      const comparison = compareVersions(serverVersion, clientVersion);

      // CASE 1: Server > Client => OLD CODE => RELOAD
      if (comparison > 0) {
        logger.info('useAutoVersionCheck', `New version found: ${serverVersion} (Current: ${clientVersion}). Updating...`);
        
        // Loop protection
        const lastReload = parseInt(localStorage.getItem('last_reload_timestamp') || '0', 10);
        if (Date.now() - lastReload < RELOAD_COOLDOWN) {
          logger.warn('useAutoVersionCheck', 'Reload loop detected. Skipping reload.');
          return;
        }

        // 1. Unregister Service Worker
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            void registration.unregister();
          }
        }

        // 2. Clear Cache Storage
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(key => caches.delete(key)));
        }

        // 3. Mark timestamp
        localStorage.setItem('last_reload_timestamp', Date.now().toString());

        // 4. Reload
        window.location.reload();
      } else {
        lastCheck.current = Date.now();
      }

      // CASE: Post-Update Cleanup
      // If we just reloaded and are now on the new version, clean up any debris
      const storedVersion = localStorage.getItem('app_version');
      if (clientVersion !== storedVersion) {
        logger.info('useAutoVersionCheck', `App updated from ${storedVersion || 'unknown'} to ${clientVersion}. Performing post-update cleanup.`);
        
        // Final cleanup pass
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
        }
        
        localStorage.setItem('app_version', clientVersion);
      }

    } catch (error) {
      logger.error('useAutoVersionCheck', 'Failed to check version:', error);
    }
  }, []);

  useEffect(() => {
    // Check on mount
    void checkForUpdate();

    // Check on visibility change (user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdate();
      }
    };

    // Check on focus
    const handleFocus = () => {
      void checkForUpdate();
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkForUpdate]);
}
