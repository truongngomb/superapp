import { DataTableSkeleton } from '@/components/common';

export function MarkdownPageTableSkeleton() {
  return (
    <DataTableSkeleton
      gridTemplateColumns="48px 48px 1.5fr 160px 140px 150px 150px"
      columns={[
        { type: 'checkbox', align: 'center' },
        { type: 'checkbox', align: 'center' },
        { type: 'avatar-text' },
        { type: 'text' },
        { type: 'badge' },
        { type: 'text' },
        { type: 'actions' }
      ]}
    />
  );
}
