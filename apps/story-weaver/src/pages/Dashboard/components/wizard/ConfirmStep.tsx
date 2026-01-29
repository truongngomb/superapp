/**
 * ConfirmStep Component
 * 
 * Final step: Review and confirm project creation.
 */
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Badge
} from '@superapp/ui-kit';
import type { WizardData } from '@/hooks/useProjectWizard';
import { FileText, Settings, Clock, Monitor, Smartphone, Square } from 'lucide-react';

interface ConfirmStepProps {
  data: WizardData;
}

const AspectIcon = ({ ratio }: { ratio: string }) => {
  switch (ratio) {
    case '9:16': return <Smartphone className="w-4 h-4" />;
    case '16:9': return <Monitor className="w-4 h-4" />;
    default: return <Square className="w-4 h-4" />;
  }
};

export const ConfirmStep = ({ data }: ConfirmStepProps) => {
  const { t } = useTranslation(['video_projects']);

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-center mb-6">
        {t('video_projects:wizard.confirm.review_message')}
      </p>

      {/* Project Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" />
            {t('video_projects:wizard.confirm.project_info')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('video_projects:wizard.story.name_label')}:</span>
            <span className="font-medium">{data.name}</span>
          </div>
          {data.description && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('video_projects:wizard.story.desc_label')}:</span>
              <span className="font-medium truncate max-w-[200px]">{data.description}</span>
            </div>
          )}
          <div className="pt-2 border-t">
            <span className="text-muted-foreground">{t('video_projects:wizard.story.content_label')}:</span>
            <p className="mt-1 text-sm bg-muted/50 p-2 rounded-md line-clamp-3">
              {data.storyContent}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Settings Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="w-4 h-4" />
            {t('video_projects:wizard.confirm.settings_info')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('video_projects:wizard.settings.platform_label')}:</span>
            <Badge variant="secondary">
              {data.targetPlatform === 'tiktok' && '📱 TikTok'}
              {data.targetPlatform === 'youtube_shorts' && '▶️ YouTube Shorts'}
              {data.targetPlatform === 'instagram_reels' && '📸 Instagram Reels'}
              {data.targetPlatform === 'generic' && '🎬 Generic'}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('video_projects:wizard.settings.aspect_label')}:</span>
            <span className="flex items-center gap-1 font-medium">
              <AspectIcon ratio={data.aspectRatio} />
              {data.aspectRatio}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{t('video_projects:wizard.settings.duration_label')}:</span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-4 h-4" />
              {data.targetDuration}s
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Info */}
      <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-100 dark:border-green-900/50">
        <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
          {t('video_projects:wizard.confirm.next_steps_title')}
        </h4>
        <ol className="text-sm text-green-600 dark:text-green-400 space-y-1 list-decimal list-inside">
          <li>{t('video_projects:wizard.confirm.next_step1')}</li>
          <li>{t('video_projects:wizard.confirm.next_step2')}</li>
          <li>{t('video_projects:wizard.confirm.next_step3')}</li>
        </ol>
      </div>
    </div>
  );
};
