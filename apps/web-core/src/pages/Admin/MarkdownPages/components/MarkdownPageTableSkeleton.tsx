import { DataTableSkeleton } from '@/components/common';

export function MarkdownPageTableSkeleton() {
  return (
    <DataTableSkeleton
      gridTemplateColumns="48px 48px 300px 160px 140px 150px 150px"
      columns={[
        { type: 'checkbox', align: 'center' }, // Multiple select
        { type: 'checkbox', align: 'center' }, // Show in menu
        { type: 'avatar-text' }, // Title with icon
        { type: 'text' }, // Position/Order
        { type: 'badge' }, // Status
        { type: 'text' }, // Updated
        { type: 'actions', align: 'right' }
      ]}
    />
  );
}
