import { DataTableSkeleton } from '@/components/common';

export function ActivityLogTableSkeleton() {
  return (
    <DataTableSkeleton
      gridTemplateColumns="250px 140px 140px 1.5fr 200px"
      columns={[
        { type: 'avatar-text' }, // User
        { type: 'badge' },       // Action
        { type: 'text' },        // Resource
        { type: 'text' },        // Details
        { type: 'text', align: 'right' } // Time
      ]}
    />
  );
}
