/**
 * SettingsStep Component
 * 
 * Second step of wizard: Platform, aspect ratio, and duration settings.
 */
import * as React from 'react';
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
import { useArtStyles } from '@/hooks/useArtStyles';
import { 
  TARGET_PLATFORM, 
  ASPECT_RATIO, 
  PLATFORM_PRESETS,
  type TargetPlatform,
  type AspectRatio
} from '@/types';
import { Monitor, Smartphone, Square, Palette } from 'lucide-react';

interface SettingsStepProps {
  data: WizardData;
  onUpdate: (partial: Partial<WizardData>) => void;
  getPlatformDefaults: UseProjectWizardReturn['getPlatformDefaults'];
}

// Note: Icons are components or emojis
interface PlatformOption {
  value: TargetPlatform;
  labelKey: string;
  icon: string;
}

interface AspectOption {
  value: AspectRatio;
  labelKey: string;
  icon: typeof Smartphone;
}

export const SettingsStep = ({ data, onUpdate, getPlatformDefaults }: SettingsStepProps) => {
  const { t } = useTranslation(['video_projects']);
  const { styles, isLoading: isLoadingStyles, fetchStyles } = useArtStyles();

  const platformOptions = React.useMemo<PlatformOption[]>(() => [
    { value: TARGET_PLATFORM.TIKTOK, labelKey: 'video_projects:wizard.settings.platforms.tiktok', icon: '📱' },
    { value: TARGET_PLATFORM.YOUTUBE_SHORTS, labelKey: 'video_projects:wizard.settings.platforms.youtube_shorts', icon: '▶️' },
    { value: TARGET_PLATFORM.INSTAGRAM_REELS, labelKey: 'video_projects:wizard.settings.platforms.instagram_reels', icon: '📸' },
    { value: TARGET_PLATFORM.GENERIC, labelKey: 'video_projects:wizard.settings.platforms.generic', icon: '🎬' },
  ], []);

  const aspectOptions = React.useMemo<AspectOption[]>(() => [
    { value: ASPECT_RATIO.PORTRAIT_9_16, labelKey: 'video_projects:wizard.settings.aspects.portrait', icon: Smartphone },
    { value: ASPECT_RATIO.LANDSCAPE_16_9, labelKey: 'video_projects:wizard.settings.aspects.landscape', icon: Monitor },
    { value: ASPECT_RATIO.SQUARE_1_1, labelKey: 'video_projects:wizard.settings.aspects.square', icon: Square },
  ], []);
  
  // Fetch styles on mount
  React.useEffect(() => {
    void fetchStyles();
  }, [fetchStyles]);
  
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
            {platformOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  <span>{opt.icon}</span>
                  <span>{t(opt.labelKey)}</span>
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
          {aspectOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = data.aspectRatio === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onUpdate({ aspectRatio: opt.value }); }}
                className={`
                  p-4 rounded-lg border-2 transition-all text-center
                  ${isSelected 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-muted hover:border-primary/50'}
                `}
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">{t(opt.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Art Style Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Palette className="w-4 h-4" />
          {t('video_projects:wizard.settings.style_label')}
        </label>
        
        {isLoadingStyles ? (
            <div className="h-32 flex items-center justify-center border rounded-lg bg-muted/20">
                <span className="text-sm text-muted-foreground">{t('video_projects:wizard.settings.loading_styles')}</span>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                    type="button"
                    onClick={() => {onUpdate({ artStyleId: undefined })}}
                    className={`
                        relative group p-3 rounded-lg border-2 transition-all text-left flex flex-col gap-2 h-full
                        ${!data.artStyleId
                            ? 'border-primary bg-primary/5' 
                            : 'border-muted hover:border-primary/50'}
                    `}
                >
                     <div className="w-full aspect-video rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                        {t('video_projects:wizard.settings.no_style')}
                    </div>
                    <span className="text-sm font-medium">{t('video_projects:wizard.settings.no_style_desc')}</span>
                </button>

                {styles.map((style) => {
                    const isSelected = data.artStyleId === style.id;
                    return (
                        <button
                            key={style.id}
                            type="button"
                            onClick={() => {onUpdate({ artStyleId: style.id })}}
                            className={`
                                relative group p-3 rounded-lg border-2 transition-all text-left flex flex-col gap-2 h-full
                                ${isSelected 
                                    ? 'border-primary bg-primary/5' 
                                    : 'border-muted hover:border-primary/50'}
                            `}
                        >
                            <div className="w-full aspect-video rounded-md bg-muted overflow-hidden relative">
                                {style.previewImage ? (
                                    <img 
                                        src={style.previewImage} 
                                        alt={style.name} 
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                        <Palette className="w-6 h-6 text-primary/40" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium truncate">{style.name}</p>
                                {style.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{style.description}</p>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        )}
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
