
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, FileUploader } from '@superapp/ui-kit';
import { mediaService } from '@/services/media.service';
import type { Media } from '@superapp/shared-types';
import { Trash2, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/context';

interface MediaManagerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (url: string, file: Media) => void;
  refId?: string; // Context reference ID (e.g. MarkdownPage ID)
  refType?: string; // Context type (e.g. 'markdown_pages')
}

export function MediaManagerModal({ open, onClose, onSelect, refId, refType }: MediaManagerModalProps) {
  const { t } = useTranslation(['common']);
  const toast = useToast();
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await mediaService.getList(pageNum, 20, refId, refType);
      if (pageNum === 1) {
        setItems(res.items);
      } else {
        setItems(prev => [...prev, ...res.items]);
      }
      setTotal(res.total);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch media', error);
      toast.error(t('error.fetch_failed', { defaultValue: 'Connection error' }));
    } finally {
      setLoading(false);
    }
  }, [t, toast, refId, refType]);

  useEffect(() => {
    if (open) {
      void fetchMedia(1);
    }
  }, [open, fetchMedia]);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      await mediaService.upload(file, refId, refType);
      toast.success(t('success.upload', { defaultValue: 'Uploaded successfully' }));
      // Refresh list
      void fetchMedia(1);
    } catch (error) {
      console.error('Upload failed', error);
      // useMediaUpload hook handles toast mostly, but here we call service directly
      toast.error(t('error.upload_failed', { defaultValue: 'Upload failed' }));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(t('confirm_delete', { defaultValue: 'Are you sure you want to delete this image?' }))) return;

    try {
      await mediaService.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
      toast.success(t('success.delete', { defaultValue: 'Deleted successfully' }));
    } catch (error) {
      console.error('Delete failed', error);
      toast.error(t('error.delete_failed', { defaultValue: 'Delete failed' }));
    }
  };

  const handleLoadMore = () => {
    void fetchMedia(page + 1);
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Media Library"
      size="xl" // Assuming 'xl' is supported, or use 'lg'
      footer={
        <div className="flex justify-between w-full">
           <div className="text-sm text-muted flex items-center">
             {total} items
           </div>
           <Button variant="outline" onClick={onClose}>
             {t('actions.close', { defaultValue: 'Close' })}
           </Button>
        </div>
      }
    >
      <div className="flex flex-col h-[60vh]">
        {/* Upload Area */}
        <div className="mb-4">
          <FileUploader
             label={t('media.upload_new', { defaultValue: 'Upload New Image' })}
             onChange={(file) => {
               if (file instanceof File) void handleUpload(file);
             }}
             disabled={uploading}
             className="w-full h-24"
          />
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto min-h-0 border rounded-md p-4 bg-gray-50/50 dark:bg-gray-900/50">
          {loading && page === 1 ? (
             <div className="flex justify-center items-center h-full">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
          ) : items.length === 0 ? (
             <div className="flex justify-center items-center h-full text-muted-foreground">
               No images found
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="group relative aspect-square border rounded-lg overflow-hidden bg-background hover:ring-2 ring-primary cursor-pointer"
                  onClick={() => onSelect?.(item.url, item)}
                >
                  <img 
                    src={item.url} 
                    alt={item.alt || item.file} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    loading="lazy"
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {onSelect && (
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" title="Select">
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      size="icon" 
                      variant="danger" 
                      className="h-8 w-8 rounded-full"
                      onClick={(e) => void handleDelete(item.id, e)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate px-2">
                    {item.file}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {items.length < total && (
            <div className="flex justify-center mt-4 pb-2">
               <Button 
                 variant="ghost" 
                 onClick={handleLoadMore} 
                 disabled={loading}
               >
                 {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                 Load More
               </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
