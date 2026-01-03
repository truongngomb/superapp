import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <button
        className="inline-flex items-center justify-center w-9 h-9 p-0 rounded-md text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
        onClick={() => { onPageChange(Math.max(1, currentPage - 1)); }}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={20} />
      </button>
      
      <div className="flex items-center gap-1 text-sm font-medium">
        <span>{currentPage}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">{totalPages}</span>
      </div>

      <button
        className="inline-flex items-center justify-center w-9 h-9 p-0 rounded-md text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
        onClick={() => { onPageChange(Math.min(totalPages, currentPage + 1)); }}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
