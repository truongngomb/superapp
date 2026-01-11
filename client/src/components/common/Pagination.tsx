import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const { t } = useTranslation('common');
  
  if (totalPages <= 1) return null;

  const buttonBaseClass = "inline-flex items-center justify-center w-9 h-9 p-0 rounded-md text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none";

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {/* First Page */}
      <button
        className={buttonBaseClass}
        onClick={() => { onPageChange(1); }}
        disabled={currentPage === 1}
        title={t('pagination.first_page')}
      >
        <ChevronsLeft size={20} />
      </button>

      {/* Previous Page */}
      <button
        className={buttonBaseClass}
        onClick={() => { onPageChange(Math.max(1, currentPage - 1)); }}
        disabled={currentPage === 1}
        title={t('pagination.previous_page')}
      >
        <ChevronLeft size={20} />
      </button>
      
      <div className="flex items-center gap-1 text-sm font-medium px-2">
        <span>{currentPage}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">{totalPages}</span>
      </div>

      {/* Next Page */}
      <button
        className={buttonBaseClass}
        onClick={() => { onPageChange(Math.min(totalPages, currentPage + 1)); }}
        disabled={currentPage === totalPages}
        title={t('pagination.next_page')}
      >
        <ChevronRight size={20} />
      </button>

      {/* Last Page */}
      <button
        className={buttonBaseClass}
        onClick={() => { onPageChange(totalPages); }}
        disabled={currentPage === totalPages}
        title={t('pagination.last_page')}
      >
        <ChevronsRight size={20} />
      </button>
    </div>
  );
}

