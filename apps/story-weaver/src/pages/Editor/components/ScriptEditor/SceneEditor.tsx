/**
 * SceneEditor Component
 * 
 * Form for editing individual scene details:
 * - Visual Description
 * - Voiceover/Narration
 * - Text Overlay
 * - Duration
 * - Camera Movement
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Type, Users, Eye, Mic, X, Save, Clock, Camera } from 'lucide-react';
import { 
  Button, 
  Input, 
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@superapp/ui-kit';
import type { VideoScene } from '@/types';
import { CAMERA_MOVEMENT, type CameraMovement, type ExtendedScene } from '@/types/scene-script';


interface SceneEditorProps {
  scene: VideoScene;
  index: number;
  onSave: (sceneId: string, data: Partial<VideoScene>) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
}

const CAMERA_OPTIONS = Object.entries(CAMERA_MOVEMENT).map(([_, key]) => {
  const value = key as CameraMovement;
  return {
    value,
    label: value.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' '),
  };
});

export const SceneEditor = ({
  scene,
  index,
  onSave,
  onClose,
  isSubmitting = false,
}: SceneEditorProps) => {
  const { t } = useTranslation(['video_projects', 'uikit']);
  const extendedScene = scene as unknown as ExtendedScene;
  
  // Form state
  const [visualDescription, setVisualDescription] = useState(
    extendedScene.visualDescription ?? extendedScene.visual_prompt ?? ''
  );
  const [voiceover, setVoiceover] = useState(
    extendedScene.voiceover ?? extendedScene.script_text ?? ''
  );
  const [textOverlay, setTextOverlay] = useState(extendedScene.textOverlay ?? '');
  const [estimatedDuration, setEstimatedDuration] = useState(
    extendedScene.estimatedDuration ?? extendedScene.duration ?? 5
  );
  const [cameraMovement, setCameraMovement] = useState<CameraMovement>(
    extendedScene.cameraMovement ?? CAMERA_MOVEMENT.STATIC
  );

  // Track if form is dirty (useMemo to avoid re-render during render)
  const isDirty = useMemo(() => {
    return (
      visualDescription !== (extendedScene.visualDescription ?? extendedScene.visual_prompt ?? '') ||
      voiceover !== (extendedScene.voiceover ?? extendedScene.script_text ?? '') ||
      textOverlay !== (extendedScene.textOverlay ?? '') ||
      estimatedDuration !== (extendedScene.estimatedDuration ?? extendedScene.duration ?? 5) ||
      cameraMovement !== (extendedScene.cameraMovement ?? CAMERA_MOVEMENT.STATIC)
    );
  }, [visualDescription, voiceover, textOverlay, estimatedDuration, cameraMovement, extendedScene]);

  const handleSave = async () => {
    await onSave(scene.id, {
      visualDescription,
      voiceover,
      textOverlay,
      estimatedDuration,
      cameraMovement,
      // Also update legacy fields for compatibility
      visual_prompt: visualDescription,
      script_text: voiceover,
      duration: estimatedDuration,
    } as unknown as Partial<VideoScene>);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-lg">
          {t('video_projects:editor.scene_label', { index: index + 1 })}
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Visual Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Eye size={16} className="text-muted-foreground" />
            {t('video_projects:script.visual_description')}
          </label>
          <Textarea
            value={visualDescription}
            onChange={(e) => { setVisualDescription(e.target.value); }}
            placeholder={t('video_projects:script.visual_description_placeholder')}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {t('video_projects:script.visual_description_hint')}
          </p>
        </div>

        {/* Voiceover */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Mic size={16} className="text-muted-foreground" />
            {t('video_projects:script.voiceover')}
          </label>
          <Textarea
            value={voiceover}
            onChange={(e) => { setVoiceover(e.target.value); }}
            placeholder={t('video_projects:script.voiceover_placeholder')}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Text Overlay */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Type size={16} className="text-muted-foreground" />
            {t('video_projects:script.text_overlay')}
          </label>
          <Input
            value={textOverlay}
            onChange={(e) => { setTextOverlay(e.target.value); }}
            placeholder={t('video_projects:script.text_overlay_placeholder')}
          />
          <p className="text-xs text-muted-foreground">
            {t('video_projects:script.text_overlay_hint')}
          </p>
        </div>

        {/* Duration & Camera */}
        <div className="grid grid-cols-2 gap-4">
          {/* Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock size={16} className="text-muted-foreground" />
              {t('video_projects:script.duration')}
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                max={30}
                value={estimatedDuration}
                onChange={(e) => { setEstimatedDuration(Number(e.target.value)); }}
                className="w-20"
              />
              <span className="text-muted-foreground text-sm">
                {t('video_projects:script.seconds')}
              </span>
            </div>
          </div>

          {/* Camera Movement */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Camera size={16} className="text-muted-foreground" />
              {t('video_projects:script.camera_movement')}
            </label>
            <Select
              value={cameraMovement}
              onValueChange={(val) => { setCameraMovement(val as CameraMovement); }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAMERA_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Characters (Info only for now) */}
        {extendedScene.characterIds && extendedScene.characterIds.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users size={16} className="text-muted-foreground" />
              {t('video_projects:script.characters_in_scene')}
            </label>
            <div className="text-sm text-muted-foreground">
              {String(extendedScene.characterIds.length)} {t('video_projects:script.characters_count')}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          {t('uikit:cancel')}
        </Button>
        <Button 
          onClick={() => { void handleSave(); }} 
          disabled={!isDirty || isSubmitting}
          loading={isSubmitting}
        >
          <Save size={16} className="mr-2" />
          {t('uikit:save')}
        </Button>
      </div>
    </motion.div>
  );
};
