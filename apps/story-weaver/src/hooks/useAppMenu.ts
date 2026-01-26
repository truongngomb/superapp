/**
 * useAppMenu Hook
 * 
 * App-specific wrapper for the shared useAppMenu hook.
 */
import { useAppMenu as useSharedAppMenu } from '@superapp/ui-kit';
import { NAVIGATION_ITEMS } from '@/config/navigation';

export function useAppMenu() {
  return useSharedAppMenu(NAVIGATION_ITEMS);
}
