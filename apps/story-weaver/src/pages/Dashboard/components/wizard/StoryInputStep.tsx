/**
 * StoryInputStep Component
 * 
 * First step of wizard: Project name and story content input.
 */
import { useTranslation } from 'react-i18next';
import { 
  Input, 
  Textarea
} from '@superapp/ui-kit';
import type { WizardData } from '@/hooks/useProjectWizard';

interface StoryInputStepProps {
  data: WizardData;
  onUpdate: (partial: Partial<WizardData>) => void;
  error?: string | null;
}

export const StoryInputStep = ({ data, onUpdate, error }: StoryInputStepProps) => {
  const { t } = useTranslation(['video_projects', 'uikit']);

  return (
    <div className="space-y-6">
      {/* Project Name */}
      <Input
        label={t('video_projects:wizard.story.name_label')}
        placeholder={t('video_projects:wizard.story.name_placeholder')}
        value={data.name}
        onChange={(e) => { onUpdate({ name: e.target.value }); }}
        helperText={t('video_projects:wizard.story.name_hint')}
        error={error && !data.name.trim() ? error : undefined}
        required
      />

      {/* Description (Optional) */}
      <Input
        label={t('video_projects:wizard.story.desc_label')}
        placeholder={t('video_projects:wizard.story.desc_placeholder')}
        value={data.description}
        onChange={(e) => { onUpdate({ description: e.target.value }); }}
      />

      {/* Story Content */}
      <Textarea
        label={t('video_projects:wizard.story.content_label')}
        placeholder={t('video_projects:wizard.story.content_placeholder')}
        value={data.storyContent}
        onChange={(e) => { onUpdate({ storyContent: e.target.value }); }}
        helperText={t('video_projects:wizard.story.content_hint')}
        error={error && !data.storyContent.trim() ? error : undefined}
        className="min-h-[200px]"
        required
      />

      {/* Error Display (General) */}
      {error && !(!data.name.trim() || !data.storyContent.trim()) && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
          {t('video_projects:wizard.story.tips_title')}
        </h4>
        <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
          <li>{t('video_projects:wizard.story.tip1')}</li>
          <li>{t('video_projects:wizard.story.tip2')}</li>
          <li>{t('video_projects:wizard.story.tip3')}</li>
        </ul>
      </div>
    </div>
  );
};
