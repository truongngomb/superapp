/**
 * SearchFilterBar Component
 * Reusable search, sort, and refresh bar for resource list pages.
 */
import { motion } from 'framer-motion';
import { Search, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Input, SortPopup } from '@superapp/ui-kit';
import type { SortColumn } from '@superapp/shared-types';
import { cn } from '@/utils';
import { fade } from '@/config';

interface SearchFilterBarProps {
  /** Current search query */
  searchQuery: string;
  /** Callback when search query changes */
  onSearchChange: (value: string) => void;
  /** Available sort columns */
  sortColumns: SortColumn[];
  /** Current sort configuration */
  sortConfig: { field: string; order: 'asc' | 'desc' };
  /** Callback when sort changes */
  onSort: (field: string) => void;
  /** Whether refresh is in progress */
  isRefreshing: boolean;
  /** Whether the list is loading */
  isLoading: boolean;
  /** Callback when refresh is clicked */
  onRefresh: () => void;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  sortColumns,
  sortConfig,
  onSort,
  isRefreshing,
  isLoading,
  onRefresh,
}: SearchFilterBarProps) {
  const { t } = useTranslation('common');

  return (
    <motion.div
      variants={fade}
      initial="initial"
      animate="animate"
      className="flex gap-3 mb-4"
    >
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <Input
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { onSearchChange(e.target.value); }}
          placeholder={t('search')}
          className="pl-10"
        />
      </div>
      <SortPopup columns={sortColumns} currentSort={sortConfig} onSort={onSort} />
      <Button variant="outline" onClick={onRefresh}>
        <RefreshCw className={cn('w-5 h-5', (isLoading || isRefreshing) && 'animate-spin')} />
      </Button>
    </motion.div>
  );
}
