/**
 * Common Components Module Exports
 */

// Form Components
export { Button } from './Button';
export { Checkbox } from './Checkbox';
export { ColorPicker } from './ColorPicker';
export { Input } from './Input';
export { Textarea } from './Textarea';
export { Toggle } from './Toggle';

// Layout Components
export { Card, CardHeader, CardContent, CardFooter } from './Card';

// Feedback Components
export { LoadingSpinner } from './LoadingSpinner';
export { Toast } from './Toast';
export { ConfirmModal } from './ConfirmModal';
export { Modal } from './Modal';
export { Badge } from './Badge';
export { DataRow } from './DataRow';
export { SortBar } from './SortableHeader';
export { SortPopup } from './SortPopup';
export { Pagination } from './Pagination';
export { ViewSwitcher } from './ViewSwitcher';
export { Skeleton } from './Skeleton';
export type { ViewMode } from './ViewSwitcher';

// Permission Components
export { PermissionGuard } from './PermissionGuard';

// Route Guards
export { ProtectedRoute } from './ProtectedRoute';
export { AuthGuard } from './AuthGuard';
export { GuestGuard } from './GuestGuard';

// Fallback Components
export { PageLoader } from './PageLoader';
export { NotFoundPage } from './NotFoundPage';

// Permission Hooks (re-exported from hooks folder)
export { usePermission, usePermissions } from '@/hooks/usePermission';
