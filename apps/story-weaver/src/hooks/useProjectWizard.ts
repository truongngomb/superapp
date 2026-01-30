/**
 * useProjectWizard Hook
 * 
 * Manages wizard state for creating new AI video projects.
 * Follows step-by-step flow: Story → Settings → Confirm
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateVideoProject } from './useProjects.js';
import { 
  type CreateVideoProjectInput, 
  type AspectRatio, 
  type TargetPlatform,
  ASPECT_RATIO,
  TARGET_PLATFORM,
  PLATFORM_PRESETS
} from '@/types';

// =============================================================================
// Types
// =============================================================================

export type WizardStep = 'story' | 'settings' | 'confirm';

export interface WizardData {
  name: string;
  description: string;
  storyContent: string;
  aspectRatio: AspectRatio;
  targetPlatform: TargetPlatform;
  targetDuration: number;
}

export interface UseProjectWizardReturn {
  // State
  currentStep: WizardStep;
  data: WizardData;
  isSubmitting: boolean;
  error: string | null;
  
  // Navigation
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  
  // Data
  updateData: (partial: Partial<WizardData>) => void;
  resetWizard: () => void;
  
  // Submit
  submitProject: () => void;
  
  // Helpers
  getPlatformDefaults: (platform: TargetPlatform) => { aspectRatio: AspectRatio; targetDuration: number };
}

// =============================================================================
// Constants
// =============================================================================

const STEPS: WizardStep[] = ['story', 'settings', 'confirm'];

const DEFAULT_DATA: WizardData = {
  name: '',
  description: '',
  storyContent: '',
  aspectRatio: ASPECT_RATIO.PORTRAIT_9_16,
  targetPlatform: TARGET_PLATFORM.YOUTUBE_SHORTS,
  targetDuration: 60,
};

// =============================================================================
// Hook Implementation
// =============================================================================

export function useProjectWizard(): UseProjectWizardReturn {
  const navigate = useNavigate();
  const { mutate: createProject, isPending: isSubmitting } = useCreateVideoProject();
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('story');
  const [data, setData] = useState<WizardData>(DEFAULT_DATA);
  const [error, setError] = useState<string | null>(null);

  // Navigation
  const currentIndex = STEPS.indexOf(currentStep);
  const canGoNext = currentIndex < STEPS.length - 1;
  const canGoPrev = currentIndex > 0;

  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
    setError(null);
  }, []);

  const nextStep = useCallback(() => {
    // Validation before moving to next step
    if (currentStep === 'story') {
      if (!data.name.trim()) {
        setError('Project name is required');
        return;
      }
      if (!data.storyContent.trim()) {
        setError('Story content is required');
        return;
      }
    }
    
    if (canGoNext) {
      const nextIndex = currentIndex + 1;
      setCurrentStep(STEPS[nextIndex] as WizardStep);
      setError(null);
    }
  }, [currentStep, currentIndex, canGoNext, data]);

  const prevStep = useCallback(() => {
    if (canGoPrev) {
      const prevIndex = currentIndex - 1;
      setCurrentStep(STEPS[prevIndex] as WizardStep);
      setError(null);
    }
  }, [currentIndex, canGoPrev]);

  // Data management
  const updateData = useCallback((partial: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...partial }));
    setError(null);
  }, []);

  const resetWizard = useCallback(() => {
    setCurrentStep('story');
    setData(DEFAULT_DATA);
    setError(null);
  }, []);

  // Platform defaults helper
  const getPlatformDefaults = useCallback((platform: TargetPlatform) => {
    const preset = PLATFORM_PRESETS[platform];
    return {
      aspectRatio: preset.aspectRatio,
      targetDuration: Math.round((preset.minDuration + preset.maxDuration) / 2),
    };
  }, []);

  // Submit
  const submitProject = useCallback(() => {
    const input: CreateVideoProjectInput = {
      name: data.name,
      description: data.description || undefined,
      storyContent: data.storyContent,
      aspectRatio: data.aspectRatio,
      targetPlatform: data.targetPlatform,
      targetDuration: data.targetDuration,
    };

    createProject(input, {
      onSuccess: (project) => {
        resetWizard();
        // Navigate to editor with the new project
        void navigate(`/editor/${project.id}`);
      },
      onError: (err) => {
        setError(err instanceof Error ? err.message : 'Failed to create project');
      },
    });
  }, [data, createProject, navigate, resetWizard]);

  return {
    currentStep,
    data,
    isSubmitting,
    error,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    updateData,
    resetWizard,
    submitProject,
    getPlatformDefaults,
  };
}
