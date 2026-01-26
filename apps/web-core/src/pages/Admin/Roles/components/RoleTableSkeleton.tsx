import { DataTableSkeleton } from '@superapp/ui-kit';

export function RoleTableSkeleton() {
  return (
    <DataTableSkeleton
      gridTemplateColumns="48px 48px 1.5fr 2fr 200px 120px 160px"
      columns={[
        { type: 'checkbox', align: 'center' },
        { type: 'avatar-text' },
        { type: 'text' },
        { type: 'badge', hideOnMobile: true },
        { type: 'badge' },
        { type: 'text' },
        { type: 'actions' }
      ]}
    />
  );
}
