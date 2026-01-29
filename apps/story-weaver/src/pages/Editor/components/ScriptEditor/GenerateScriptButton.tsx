/**
 * GenerateScriptButton Component
 * 
 * Button to trigger AI script generation from story content.
 * Shows loading state and handles errors gracefully.
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@superapp/ui-kit';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useScriptGeneration } from '@/hooks';
import { useToast } from '@superapp/ui-kit';

interface GenerateScriptButtonProps {
  projectId: string;
  hasExistingScenes: boolean;
  disabled?: boolean;
  className?: string;
}

export const GenerateScriptButton = ({
  projectId,
  hasExistingScenes,
  disabled = false,
  className,
}: GenerateScriptButtonProps) => {
  const { t } = useTranslation(['video_projects', 'uikit']);
  const toast = useToast();
  const { generateScript, isGenerating } = useScriptGeneration();

  const handleGenerate = () => {
    generateScript(
      { projectId },
      {
        onSuccess: (scenes) => {
          toast.success(
            `${t('video_projects:script.generate_success')}: ${t('video_projects:script.scenes_generated', { count: scenes.length })}`
          );
        },
        onError: (error) => {
          const errorMessage = error instanceof Error ? error.message : t('uikit:error.unknown');
          toast.error(`${t('video_projects:script.generate_error')}: ${errorMessage}`);
        },
      }
    );
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={disabled || isGenerating}
      loading={isGenerating}
      className={className}
      variant={hasExistingScenes ? 'outline' : 'primary'}
    >
      {hasExistingScenes ? (
        <>
          <RefreshCw size={16} className="mr-2" />
          {t('video_projects:script.regenerate')}
        </>
      ) : (
        <>
          <Sparkles size={16} className="mr-2" />
          {t('video_projects:script.generate')}
        </>
      )}
    </Button>
  );
};
