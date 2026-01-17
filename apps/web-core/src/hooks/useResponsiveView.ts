import { useIsMobile } from './useMediaQuery';

/**
 * Extended view mode type to support mobile view
 */
export type ResponsiveViewMode = 'table' | 'list' | 'mobile';

/**
 * Hook to automatically select view mode based on screen size
 * 
 * On mobile devices (< 768px), always returns 'mobile' view
 * On larger screens, returns the user's preferred view mode
 * 
 * @param preferredDesktopView - The view mode to use on desktop (default: 'table')
 * @returns Current view mode based on screen size
 * 
 * @example
 * const { effectiveView, isMobile } = useResponsiveView(userViewPreference);
 * // on mobile: effectiveView = 'mobile', isMobile = true
 * // on desktop: effectiveView = userViewPreference, isMobile = false
 */
export function useResponsiveView(preferredDesktopView: 'table' | 'list' = 'table') {
  const isMobile = useIsMobile();
  
  return {
    /** The effective view mode to render */
    effectiveView: isMobile ? 'mobile' as const : preferredDesktopView,
    /** Whether the current screen is mobile size */
    isMobile,
    /** Whether user is on tablet */
    isTablet: false, // Can be extended later
    /** Whether user is on desktop */
    isDesktop: !isMobile,
  };
}
