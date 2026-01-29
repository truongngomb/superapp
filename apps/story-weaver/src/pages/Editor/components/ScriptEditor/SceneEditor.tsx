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
import { Type, Users, Eye, Mic, X, Save, Clock, Camera, Image as ImageIcon, FileText, Film } from 'lucide-react';
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
import { ImageGeneratorPanel } from './ImageGeneratorPanel';
import { MotionPanel } from './MotionPanel';



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
    extendedScene.visualDescription ?? extendedScene.visualPrompt ?? ''
  );
  const [voiceover, setVoiceover] = useState(
    extendedScene.voiceover ?? extendedScene.scriptText ?? ''
  );
  const [textOverlay, setTextOverlay] = useState(extendedScene.textOverlay ?? '');
  const [estimatedDuration, setEstimatedDuration] = useState(
    extendedScene.estimatedDuration ?? extendedScene.duration ?? 5
  );
  const [cameraMovement, setCameraMovement] = useState<CameraMovement>(
    extendedScene.cameraMovement ?? CAMERA_MOVEMENT.STATIC
  );
  const [selectedKeyframe, setSelectedKeyframe] = useState(extendedScene.selectedKeyframe ?? extendedScene.imageUrl);
  const [activeTab, setActiveTab] = useState<'script' | 'visuals' | 'motion'>('script');


  // Track if form is dirty (useMemo to avoid re-render during render)
  const isDirty = useMemo(() => {
    return (
      visualDescription !== (extendedScene.visualDescription ?? extendedScene.visualPrompt ?? '') ||
      voiceover !== (extendedScene.voiceover ?? extendedScene.scriptText ?? '') ||
      textOverlay !== (extendedScene.textOverlay ?? '') ||
      estimatedDuration !== (extendedScene.estimatedDuration ?? extendedScene.duration ?? 5) ||
      cameraMovement !== (extendedScene.cameraMovement ?? CAMERA_MOVEMENT.STATIC) ||
      selectedKeyframe !== (extendedScene.selectedKeyframe ?? extendedScene.imageUrl)
    );
  }, [visualDescription, voiceover, textOverlay, estimatedDuration, cameraMovement, selectedKeyframe, extendedScene]);

  const handleSave = async () => {
    await onSave(scene.id, {
      visualDescription,
      voiceover,
      textOverlay,
      estimatedDuration,
      cameraMovement,

      selectedKeyframe,
      // Also update legacy fields for compatibility
      visualPrompt: visualDescription,
      scriptText: voiceover,
      duration: estimatedDuration,
      imageUrl: selectedKeyframe,
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

      {/* Tabs */}
      <div className="p-1 px-4 border-b border-border bg-muted/30">
        <div className="flex bg-muted/50 p-1 rounded-lg gap-1">
          <button
            onClick={() => { setActiveTab('script'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
              activeTab === 'script' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <FileText size={14} />
            {t('video_projects:editor.script_tab')}
          </button>
          <button
            onClick={() => { setActiveTab('visuals'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
              activeTab === 'visuals' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <ImageIcon size={14} />
            {t('video_projects:editor.visuals_tab')}
          </button>
          <button
            onClick={() => { setActiveTab('motion'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
              activeTab === 'motion' 
                ? 'bg-background shadow-sm text-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Film size={14} />
            {t('video_projects:editor.motion_tab', { defaultValue: 'Motion' })}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'script' && (
          <div className="space-y-6">
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
        )}

        {activeTab === 'visuals' && (
          <ImageGeneratorPanel
            scene={{
              ...extendedScene,
              visualDescription, // Use current form state
              selectedKeyframe   // Use current selection state
            }}
            onUpdate={(updates) => {
              if (updates.selectedKeyframe) setSelectedKeyframe(updates.selectedKeyframe);
              if (updates.visualDescription) setVisualDescription(updates.visualDescription);
            }}
          />
        )}

        {activeTab === 'motion' && (
          <MotionPanel
            scene={{
              ...extendedScene,
              visualDescription,
              selectedKeyframe
            }}
          />
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
