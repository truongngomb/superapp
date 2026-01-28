import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { FileUploader } from '../FileUploader';
import { Media, MediaUploadResponse, PaginatedResponse } from '@superapp/shared-types';
import { Trash2, Check, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData, QueryClient } from '@tanstack/react-query';
import { mediaService } from '@superapp/core-logic';

interface MediaManagerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (url: string, file: Media) => void;
  refId?: string; // Context reference ID (e.g. MarkdownPage ID)
  refType?: string; // Context type (e.g. 'markdown_pages')
}

export function MediaManagerModal({ open, onClose, onSelect, refId, refType }: MediaManagerModalProps) {
  const { t } = useTranslation(['uikit']);
  const toast = useToast();
  const queryClient: QueryClient = useQueryClient();

  // Infinite Query for Media List
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useInfiniteQuery<PaginatedResponse<Media>, Error, InfiniteData<PaginatedResponse<Media>>, (string | { refId?: string; refType?: string })[], number>({
    queryKey: ['media', { refId, refType }],
    queryFn: ({ pageParam }) => mediaService.getList(pageParam, 20, refId, refType),
    getNextPageParam: (lastPage) => lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: open, // Only fetch when modal is open
    staleTime: 1000 * 60, // 1 minute
  });

  const items: Media[] = data?.pages.flatMap((page: PaginatedResponse<Media>) => page.items) || [];
  const total: number = data?.pages[0]?.total || 0;

  // Upload Mutation
  const uploadMutation = useMutation<MediaUploadResponse, Error, File>({
    mutationFn: (file: File) => mediaService.upload(file, refId, refType),
    onSuccess: () => {
      toast.success(t('success.upload', { defaultValue: 'Uploaded successfully' }));
      void queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (error) => {
      console.error('Upload failed', error);
      toast.error(t('error.upload_failed', { defaultValue: 'Upload failed' }));
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation<unknown, Error, string>({
    mutationFn: (id: string) => mediaService.delete(id),
    onSuccess: () => {
      toast.success(t('success.delete', { defaultValue: 'Deleted successfully' }));
      void queryClient.invalidateQueries({ queryKey: ['media'] });
    },
    onError: (error) => {
      console.error('Delete failed', error);
      toast.error(t('error.delete_failed', { defaultValue: 'Delete failed' }));
    },
  });

  const handleUpload = async (file: File) => {
    await uploadMutation.mutateAsync(file);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(t('confirm_delete', { defaultValue: 'Are you sure you want to delete this image?' }))) return;
    await deleteMutation.mutateAsync(id);
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Media Library"
      size="xl"
      footer={
        <div className="flex justify-between w-full">
           <div className="text-sm text-muted-foreground flex items-center">
             {total} {t('common.items', { defaultValue: 'items' })}
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
             disabled={uploadMutation.isPending}
             className="w-full h-24"
          />
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto min-h-0 border rounded-md p-4 bg-gray-50/50 dark:bg-gray-900/50">
          {isLoading ? (
             <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
             </div>
          ) : items.length === 0 ? (
             <div className="flex justify-center items-center h-full text-muted-foreground">
               {t('media.no_images', { defaultValue: 'No images found' })}
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map((item: Media) => (
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
                      disabled={deleteMutation.isPending}
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
          
          {hasNextPage && (
            <div className="flex justify-center mt-4 pb-2">
               <Button 
                 variant="ghost" 
                 onClick={() => void fetchNextPage()} 
                 disabled={isFetchingNextPage}
               >
                 {isFetchingNextPage ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                 {t('common.load_more', { defaultValue: 'Load More' })}
               </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
