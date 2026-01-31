import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, ChevronLeft, ChevronRight, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../utils';

export interface MediaItem {
  id: string;
  url: string;
  type?: 'image' | 'video';
  title?: string;
  isSelected?: boolean;
}

interface MediaLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  items: MediaItem[];
  initialIndex?: number;
  onSelect?: (item: MediaItem) => void;
  renderFooter?: (item: MediaItem) => React.ReactNode;
}

export function MediaLightbox({
  isOpen,
  onClose,
  items,
  initialIndex = 0,
  onSelect,
  renderFooter,
}: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  React.useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);



  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  // Key press handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, [isOpen, items.length, onClose]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm animate-in fade-in duration-200" />
        <DialogPrimitive.Content className="fixed inset-0 z-[60] flex flex-col items-center justify-center outline-none animate-in zoom-in-95 duration-200">
          
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
             <div className="text-white/80 text-sm font-medium px-2">
                {currentIndex + 1} / {items.length}
             </div>
             
             <div className="flex gap-2">
               {onSelect && (
                  <Button 
                     variant={currentItem.isSelected ? "primary" : "secondary"}
                     onClick={() => { onSelect(currentItem); }}
                     className="gap-2 bg-white text-black hover:bg-white/90"
                     size="sm"
                   >
                     {currentItem.isSelected && <Check size={16} />}
                     {currentItem.isSelected ? 'Selected' : 'Select'}
                   </Button>
               )}
               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={onClose} 
                 className="rounded-full text-white hover:bg-white/20"
               >
                 <X className="h-6 w-6" />
                 <span className="sr-only">Close</span>
               </Button>
             </div>
          </div>

          {/* Main Content Area */}
          <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] flex-1 flex items-center justify-center w-full p-0 md:p-4 relative">
            
            {/* Prev Button */}
            {items.length > 1 && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handlePrev(); 
                }}
                className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 rounded-full text-white hover:bg-white/20 h-12 w-12 z-40 bg-black/20 hover:bg-black/40 border-none"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}

            {/* Image Container */}
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <img 
                src={currentItem.url} 
                alt={currentItem.title || `Media ${String(currentIndex + 1)}`} 
                className="max-h-full max-w-full object-contain drop-shadow-2xl select-none"
                draggable={false}
              />
              
              {/* Optional Footer/Title overlay */}
              {/* Optional Footer/Title overlay */}
              {(currentItem.title || renderFooter) && (
                 <CollapsibleTitle 
                   title={currentItem.title} 
                   footer={renderFooter ? renderFooter(currentItem) : null}
                 />
              )}
            </div>

            {/* Next Button */}
            {items.length > 1 && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleNext(); 
                }}
                className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 rounded-full text-white hover:bg-white/20 h-12 w-12 z-40 bg-black/20 hover:bg-black/40 border-none"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}
          </div>
          
          {/* Thumbnails Strip */}
          {items.length > 1 && (
            <div className="h-16 md:h-20 w-full flex justify-center gap-2 pb-2 md:pb-4 overflow-x-auto bg-black/80 shrink-0 border-t border-white/10">
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => { setCurrentIndex(idx); }}
                  className={cn(
                    "relative h-full aspect-square rounded-md overflow-hidden transition-all border-2 flex-shrink-0",
                    currentIndex === idx 
                      ? "border-primary scale-105 opacity-100 ring-2 ring-primary/30" 
                      : "border-transparent opacity-50 hover:opacity-100 grayscale hover:grayscale-0"
                  )}
                >
                  <img 
                    src={item.url} 
                    alt={`Thumbnail ${String(idx + 1)}`}
                    className="w-full h-full object-cover" 
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}

        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function CollapsibleTitle({ title, footer }: { title?: string, footer: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div 
      className={cn(
        "absolute bottom-8 bg-black/60 backdrop-blur-md rounded-2xl text-white text-center transition-all duration-300 ease-in-out border border-white/10 overflow-hidden",
        isExpanded ? "max-w-[90%] px-6 py-4" : "max-w-[300px] px-4 py-2 cursor-pointer hover:bg-black/70"
      )}
      onClick={() => { if (!isExpanded) setIsExpanded(true); }}
    >
      <div className="flex flex-col gap-2 relative">
        {/* Toggle Button for Expanded State */}
        {isExpanded && (
           <Button
             variant="ghost"
             size="icon"
             className="absolute -top-2 -right-2 h-6 w-6 text-white/70 hover:text-white"
             onClick={(e) => {
               e.stopPropagation();
               setIsExpanded(false);
             }}
           >
             <ChevronDown className="h-4 w-4" />
           </Button>
        )}

        {title && (
          <div className="flex items-center justify-center gap-2">
            <h3 className={cn(
              "font-medium leading-tight text-center",
              isExpanded ? "text-lg" : "text-sm truncate"
            )}>
              {title}
            </h3>
            {!isExpanded && <ChevronUp className="h-4 w-4 shrink-0 text-white/70" />}
          </div>
        )}
        
        {isExpanded && footer && (
          <div className="mt-2 pt-2 border-t border-white/10 text-sm opacity-90">
             {footer}
          </div>
        )}
      </div>
    </div>
  );
}
