/**
 * SettingsStep Component
 * 
 * Second step of wizard: Platform, aspect ratio, and duration settings.
 */
import { useTranslation } from 'react-i18next';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Card,
  CardContent
} from '@superapp/ui-kit';
import { 
  type WizardData, 
  type UseProjectWizardReturn 
} from '@/hooks/useProjectWizard';
import { 
  TARGET_PLATFORM, 
  ASPECT_RATIO, 
  PLATFORM_PRESETS,
  type TargetPlatform,
  type AspectRatio
} from '@/types';
import { Monitor, Smartphone, Square } from 'lucide-react';

interface SettingsStepProps {
  data: WizardData;
  onUpdate: (partial: Partial<WizardData>) => void;
  getPlatformDefaults: UseProjectWizardReturn['getPlatformDefaults'];
}

const PLATFORM_OPTIONS = [
  { value: TARGET_PLATFORM.TIKTOK, label: 'TikTok', icon: '📱' },
  { value: TARGET_PLATFORM.YOUTUBE_SHORTS, label: 'YouTube Shorts', icon: '▶️' },
  { value: TARGET_PLATFORM.INSTAGRAM_REELS, label: 'Instagram Reels', icon: '📸' },
  { value: TARGET_PLATFORM.GENERIC, label: 'Generic Video', icon: '🎬' },
];

const ASPECT_OPTIONS = [
  { value: ASPECT_RATIO.PORTRAIT_9_16, label: '9:16 (Portrait)', icon: Smartphone },
  { value: ASPECT_RATIO.LANDSCAPE_16_9, label: '16:9 (Landscape)', icon: Monitor },
  { value: ASPECT_RATIO.SQUARE_1_1, label: '1:1 (Square)', icon: Square },
];

export const SettingsStep = ({ data, onUpdate, getPlatformDefaults }: SettingsStepProps) => {
  const { t } = useTranslation(['video_projects']);
  
  const currentPlatformPreset = PLATFORM_PRESETS[data.targetPlatform];

  const handlePlatformChange = (platform: TargetPlatform) => {
    const defaults = getPlatformDefaults(platform);
    onUpdate({
      targetPlatform: platform,
      aspectRatio: defaults.aspectRatio,
      targetDuration: defaults.targetDuration,
    });
  };

  return (
    <div className="space-y-6">
      {/* Platform Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t('video_projects:wizard.settings.platform_label')}
        </label>
        <Select 
          value={data.targetPlatform} 
          onValueChange={(v) => { handlePlatformChange(v as TargetPlatform); }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLATFORM_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          {t('video_projects:wizard.settings.platform_hint')}
        </p>
      </div>

      {/* Aspect Ratio */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t('video_projects:wizard.settings.aspect_label')}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {ASPECT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = data.aspectRatio === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onUpdate({ aspectRatio: opt.value as AspectRatio }); }}
                className={`
                  p-4 rounded-lg border-2 transition-all text-center
                  ${isSelected 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-muted hover:border-primary/50'}
                `}
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration Slider */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t('video_projects:wizard.settings.duration_label')}: {data.targetDuration}s
        </label>
        <Slider
          value={[data.targetDuration]}
          onValueChange={(values) => { onUpdate({ targetDuration: values[0] ?? data.targetDuration }); }}
          min={currentPlatformPreset.minDuration}
          max={currentPlatformPreset.maxDuration}
          step={5}
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground">
          {t('video_projects:wizard.settings.duration_hint', {
            min: currentPlatformPreset.minDuration,
            max: currentPlatformPreset.maxDuration,
          })}
        </p>
      </div>

      {/* Platform Notes */}
      {currentPlatformPreset.notes && (
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              💡 <strong>{t('video_projects:wizard.settings.platform_tip')}:</strong>{' '}
              {currentPlatformPreset.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
