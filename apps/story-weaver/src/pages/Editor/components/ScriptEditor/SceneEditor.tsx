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
import { Type, Users, Eye, Mic, X, Save, Clock, Camera, Image as ImageIcon, FileText, Film, Wand2 } from 'lucide-react';
import { 
  Button, 
  Input, 
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
  Avatar,
  Checkbox
} from '@superapp/ui-kit';
import type { VideoScene, Character } from '@/types';
import { CAMERA_MOVEMENT, type CameraMovement, type ExtendedScene } from '@/types/scene-script';
import { ImageGeneratorPanel } from './ImageGeneratorPanel';
import { MotionPanel } from './MotionPanel';

interface SceneEditorProps {
  scene: VideoScene;
  index: number;
  availableCharacters?: Character[];
  onSave: (sceneId: string, data: Partial<VideoScene>) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
  allowedTabs?: ('script' | 'visuals' | 'motion')[];
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
  availableCharacters = [],
  onSave,
  onClose,
  isSubmitting = false,
  allowedTabs = ['script', 'visuals', 'motion'],
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
  const [characterIds, setCharacterIds] = useState<string[]>(scene.characterIds ?? []);
  
  // Initialize active tab based on allowed tabs
  const [activeTab, setActiveTab] = useState<'script' | 'visuals' | 'motion'>(allowedTabs[0] || 'script');

  // Track if form is dirty (useMemo to avoid re-render during render)
  const isDirty = useMemo(() => {
    return (
      visualDescription !== (extendedScene.visualDescription ?? extendedScene.visualPrompt ?? '') ||
      voiceover !== (extendedScene.voiceover ?? extendedScene.scriptText ?? '') ||
      textOverlay !== (extendedScene.textOverlay ?? '') ||
      estimatedDuration !== (extendedScene.estimatedDuration ?? extendedScene.duration ?? 5) ||
      cameraMovement !== (extendedScene.cameraMovement ?? CAMERA_MOVEMENT.STATIC) ||
      selectedKeyframe !== (extendedScene.selectedKeyframe ?? extendedScene.imageUrl) ||
      JSON.stringify(characterIds) !== JSON.stringify(scene.characterIds ?? [])
    );
  }, [visualDescription, voiceover, textOverlay, estimatedDuration, cameraMovement, selectedKeyframe, characterIds, scene.characterIds, extendedScene]);

  const handleSave = async () => {
    await onSave(scene.id, {
      visualDescription,
      voiceover,
      textOverlay,
      estimatedDuration,
      cameraMovement,
      characterIds,
      selectedKeyframe,
      // Also update legacy fields for compatibility
      visualPrompt: visualDescription,
      scriptText: voiceover,
      duration: estimatedDuration,
      imageUrl: selectedKeyframe,
    } as unknown as Partial<VideoScene>);
  };

  const toggleCharacter = (charId: string) => {
    setCharacterIds(prev => 
      prev.includes(charId) 
        ? prev.filter(id => id !== charId) 
        : [...prev, charId]
    );
  };

  const handleAutoMatchCharacters = () => {
    if (!availableCharacters.length) return;

    const fullText = `${visualDescription} ${voiceover}`.toLowerCase();
    
    // List of common titles/generic words to ignore when matching parts of names
    const titlesToIgnore = [
      'vua', 'chúa', 'công', 'chúa', 'hoàng', 'tử', 'thần', 
      'chàng', 'nàng', 'mỵ', 'nương', 'ông', 'bà', 'anh', 'chị', 'em'
    ];

    const matchedIds = availableCharacters
      .filter(char => {
        const name = char.name.toLowerCase();
        
        // 1. Try exact full name match first (with word boundaries)
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const fullRegex = new RegExp(`\\b${escapedName}\\b`, 'i');
        if (fullRegex.test(fullText)) return true;

        // 2. Try matching significant parts (longest and not a title)
        const nameParts = name.split(/\s+/).filter(part => 
          part.length > 2 && !titlesToIgnore.includes(part)
        );

        // If after filtering we have significant parts, check if any exists as a whole word
        return nameParts.some(part => {
          const partRegex = new RegExp(`\\b${part}\\b`, 'i');
          return partRegex.test(fullText);
        });
      })
      .map(char => char.id);

    // Merge with existing but avoid duplicates
    const finalIds = Array.from(new Set([...characterIds, ...matchedIds]));
    setCharacterIds(finalIds);
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

      {/* Tabs - Only show if more than 1 allowed tab */}
      {allowedTabs.length > 1 && (
        <div className="p-1 px-4 border-b border-border bg-muted/30">
          <div className="flex bg-muted/50 p-1 rounded-lg gap-1">
            {allowedTabs.includes('script') && (
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
            )}
            {allowedTabs.includes('visuals') && (
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
            )}
            {allowedTabs.includes('motion') && (
              <button
                onClick={() => { setActiveTab('motion'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'motion' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Film size={14} />
                {t('video_projects:editor.motion_tab')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'script' && allowedTabs.includes('script') && (
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

            {/* Characters Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users size={16} className="text-muted-foreground" />
                  {t('video_projects:script.characters_in_scene')}
                </label>
                
                {availableCharacters.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-xs text-primary gap-1.5 hover:bg-primary/5"
                    onClick={handleAutoMatchCharacters}
                  >
                    <Wand2 size={12} />
                    {t('video_projects:script.auto_match')}
                  </Button>
                )}
              </div>
              
              {availableCharacters.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {availableCharacters.map(char => {
                    const isSelected = characterIds.includes(char.id);
                    return (
                      <div 
                        key={char.id}
                        onClick={() => { toggleCharacter(char.id); }}
                        className={`
                          flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all
                          ${isSelected 
                            ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                            : 'border-border hover:bg-muted/50'
                          }
                        `}
                      >
                        <Checkbox 
                          checked={isSelected} 
                          onChange={() => { toggleCharacter(char.id); }}
                        />
                        <Avatar 
                          src={char.masterPortraitUrl} 
                          name={char.name}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{char.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{char.description}</p>
                        </div>
                        {char.status === 'approved' && (
                          <Badge variant="success" size="sm" className="h-4 text-[10px]">
                            {t('video_projects:uikit.approved')}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded-lg border border-dashed">
                  {t('video_projects:script.no_characters_available')}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'visuals' && allowedTabs.includes('visuals') && (
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

        {activeTab === 'motion' && allowedTabs.includes('motion') && (
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
