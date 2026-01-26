import { DataTableSkeleton } from '@/components/common';

export function UserTableSkeleton() {
  return (
    <DataTableSkeleton
      gridTemplateColumns="48px 48px 80px 1.5fr 2fr 1.5fr 120px 160px"
      rowHeight="72px"
      columns={[
        { type: 'checkbox', align: 'center' },
        { type: 'text', align: 'center' },
        { type: 'circle', align: 'center' },
        { type: 'text' },
        { type: 'text', hideOnMobile: true },
        { type: 'badge' },
        { type: 'badge' },
        { type: 'actions' }
      ]}
    />
  );
}
