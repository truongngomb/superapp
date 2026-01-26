import { DataTableSkeleton } from '@/components/common';

export function RoleTableSkeleton() {
  return (
    <DataTableSkeleton
      gridTemplateColumns="48px 1.5fr 2fr 200px 120px 160px"
      columns={[
        { type: 'checkbox', align: 'center' },
        { type: 'avatar-text' }, // Name with icon
        { type: 'text' }, // Description
        { type: 'badge', hideOnMobile: true }, // Permissions
        { type: 'badge' }, // Status
        { type: 'actions', align: 'right' }
      ]}
    />
  );
}
