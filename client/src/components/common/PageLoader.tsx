/**
 * PageLoader Component
 * Loading state for lazy-loaded pages
 */
import { LoadingSpinner } from './LoadingSpinner';

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}
