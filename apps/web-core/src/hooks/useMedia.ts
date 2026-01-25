/**
 * useMedia Hook
 * 
 * Handles media upload logic
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/context';
import { mediaService } from '@superapp/core-logic';



export function useMediaUpload(refId?: string, refType?: string) {
  const { t } = useTranslation(['uikit']);
  const toast = useToast();
  const [uploading, setUploading] = useState(false);

  /**
   * Upload a single file
   * Returns the URL of the uploaded file
   */
  const upload = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const response = await mediaService.upload(file, refId, refType);
      toast.success(t('upload_success', { defaultValue: 'File uploaded successfully' }));
      return response.url;
    } catch (error: unknown) {
      console.error('Upload failed:', error);
      toast.error(t('upload_error', { defaultValue: 'Upload failed' }));
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    upload,
    uploading
  };
}
