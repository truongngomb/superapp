/**
 * PreviewContext
 * 
 * Context for managing preview player state including:
 * - Selected scene
 * - Playback/slideshow state
 * - Navigation between scenes
 */
import { 
  createContext, 
  useState, 
  useCallback, 
  useEffect,
  useMemo,
  type ReactNode 
} from 'react';
import type { VideoScene } from '@/types';

// =============================================================================
// Types
// =============================================================================

interface PreviewContextValue {
  // Selected scene
  selectedSceneId: string | null;
  setSelectedSceneId: (id: string | null) => void;
  
  // Scenes data (injected from parent)
  scenes: VideoScene[];
  setScenes: (scenes: VideoScene[]) => void;
  
  // Current scene helpers
  currentSceneIndex: number;
  currentScene: VideoScene | null;
  
  // Navigation
  goToNextScene: () => void;
  goToPrevScene: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  
  // Slideshow
  isSlideshowActive: boolean;
  toggleSlideshow: () => void;
  startSlideshow: () => void;
  stopSlideshow: () => void;
}

// =============================================================================
// Context
// =============================================================================

const PreviewContext = createContext<PreviewContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

interface PreviewProviderProps {
  children: ReactNode;
  initialScenes?: VideoScene[];
}

export const PreviewProvider = ({ children, initialScenes = [] }: PreviewProviderProps) => {
  // State
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [scenes, setScenes] = useState<VideoScene[]>(initialScenes);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);

  // Derived state
  const currentSceneIndex = useMemo(() => {
    if (!selectedSceneId) return -1;
    return scenes.findIndex(s => s.id === selectedSceneId);
  }, [selectedSceneId, scenes]);

  const currentScene = useMemo(() => {
    if (currentSceneIndex === -1) return null;
    return scenes[currentSceneIndex] ?? null;
  }, [currentSceneIndex, scenes]);

  const hasPrev = currentSceneIndex > 0;
  const hasNext = currentSceneIndex < scenes.length - 1;

  // Navigation handlers
  const goToNextScene = useCallback(() => {
    if (scenes.length === 0) return;
    
    if (currentSceneIndex === -1) {
      // No scene selected, select first
      setSelectedSceneId(scenes[0]?.id ?? null);
    } else if (hasNext) {
      // Go to next
      setSelectedSceneId(scenes[currentSceneIndex + 1]?.id ?? null);
    } else if (isSlideshowActive) {
      // Loop back to first when in slideshow mode
      setSelectedSceneId(scenes[0]?.id ?? null);
    }
  }, [scenes, currentSceneIndex, hasNext, isSlideshowActive]);

  const goToPrevScene = useCallback(() => {
    if (scenes.length === 0 || currentSceneIndex === -1) return;
    
    if (hasPrev) {
      setSelectedSceneId(scenes[currentSceneIndex - 1]?.id ?? null);
    } else if (isSlideshowActive) {
      // Loop to last when in slideshow mode
      setSelectedSceneId(scenes[scenes.length - 1]?.id ?? null);
    }
  }, [scenes, currentSceneIndex, hasPrev, isSlideshowActive]);

  // Slideshow handlers
  const toggleSlideshow = useCallback(() => {
    setIsSlideshowActive(prev => !prev);
  }, []);

  const startSlideshow = useCallback(() => {
    setIsSlideshowActive(true);
    // If no scene selected, select first
    if (!selectedSceneId && scenes.length > 0) {
      setSelectedSceneId(scenes[0]?.id ?? null);
    }
  }, [selectedSceneId, scenes]);

  const stopSlideshow = useCallback(() => {
    setIsSlideshowActive(false);
  }, []);

  // Auto-slideshow effect
  useEffect(() => {
    if (!isSlideshowActive || !currentScene) return;

    // Use scene's estimatedDuration or default 3 seconds
    const duration = (currentScene.estimatedDuration || 3) * 1000;
    
    const timer = setTimeout(() => {
      goToNextScene();
    }, duration);

    return () => { clearTimeout(timer); };
  }, [isSlideshowActive, currentScene, currentSceneIndex, goToNextScene]);

  // Auto-select first scene when scenes are loaded
  useEffect(() => {
    if (scenes.length > 0 && !selectedSceneId) {
      setSelectedSceneId(scenes[0]?.id ?? null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when scenes change
  }, [scenes]);

  // Context value
  const value = useMemo<PreviewContextValue>(() => ({
    // Selected scene
    selectedSceneId,
    setSelectedSceneId,
    
    // Scenes
    scenes,
    setScenes,
    
    // Current scene
    currentSceneIndex,
    currentScene,
    
    // Navigation
    goToNextScene,
    goToPrevScene,
    hasPrev,
    hasNext,
    
    // Slideshow
    isSlideshowActive,
    toggleSlideshow,
    startSlideshow,
    stopSlideshow,
  }), [
    selectedSceneId,
    scenes,
    currentSceneIndex,
    currentScene,
    goToNextScene,
    goToPrevScene,
    hasPrev,
    hasNext,
    isSlideshowActive,
    toggleSlideshow,
    startSlideshow,
    stopSlideshow,
  ]);

  return (
    <PreviewContext.Provider value={value}>
      {children}
    </PreviewContext.Provider>
  );
};

// Export context for hooks file
export { PreviewContext };
export type { PreviewContextValue };
