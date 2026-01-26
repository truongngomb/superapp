import { DataTableSkeleton } from '@/components/common';

export function UserTableSkeleton() {
  return (
    <DataTableSkeleton
      gridTemplateColumns="48px 80px 1.5fr 2fr 1.5fr 120px 160px"
      rowHeight="72px"
      columns={[
        { type: 'checkbox', align: 'center' },
        { type: 'circle', align: 'center' }, // Avatar
        { type: 'text' }, // Name
        { type: 'text', hideOnMobile: true }, // Email
        { type: 'badge' }, // Roles (simple badge)
        { type: 'badge' }, // Status
        { type: 'actions', align: 'right' }
      ]}
    />
  );
}
