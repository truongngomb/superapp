import { DataTableSkeleton } from '@/components/common';

export function CategoryTableSkeleton() {
  return (
    <DataTableSkeleton
      gridTemplateColumns="48px 60px 60px 200px 2fr 120px 160px"
      columns={[
        { type: 'checkbox', align: 'center' },
        { type: 'circle' },
        { type: 'circle' },
        { type: 'badge' },
        { type: 'text', hideOnMobile: true },
        { type: 'badge' },
        { type: 'actions' }
      ]}
    />
  );
}
