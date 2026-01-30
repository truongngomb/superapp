import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { featureService } from '@/services';
import type { ArtStyleConfig } from '@/services/feature.service';
import { useToast } from '@superapp/ui-kit';

export const useArtStyles = () => {
    const { t } = useTranslation(['video_projects']);
    const [styles, setStyles] = useState<ArtStyleConfig[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const fetchStyles = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await featureService.getArtStyles();
            setStyles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch art styles:', error);
            toast.error(t('video_projects:errors.failed_load_styles'));
        } finally {
            setIsLoading(false);
        }
    }, [t, toast]);

    return {
        styles,
        isLoading,
        fetchStyles,
    };
};
