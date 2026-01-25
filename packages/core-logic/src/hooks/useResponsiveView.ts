import { useIsMobile } from './useMediaQuery';

/**
 * Extended view mode type to support mobile view
 */
export type ResponsiveViewMode = 'table' | 'list' | 'mobile';

/**
 * Hook to automatically select view mode based on screen size
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
