/**
 * useScriptValidation Hook
 * 
 * Validates script/scenes against platform constraints.
 * Runs client-side validation with real-time feedback.
 */

import { useMemo } from 'react';
import type { VideoScene } from '@/types';
import type { VideoProject } from '@/types/video-project';
import { 
  PLATFORM_PRESETS, 
  validateTextOverlay,
  type TargetPlatform,
} from '@/types/platform';
import { 
  VALIDATION_SEVERITY, 
  type ScriptValidationIssue, 
  type ScriptValidationResult,
  type ExtendedScene
} from '@/types/scene-script';

interface UseScriptValidationParams {
  scenes: VideoScene[];
  project: VideoProject | null | undefined;
  characterIds?: string[];
}

/**
 * Validate individual scene
 */
function validateScene(
  sceneInput: VideoScene,
  index: number,
  platform: TargetPlatform,
  characterIds: string[]
): ScriptValidationIssue[] {
  const issues: ScriptValidationIssue[] = [];
  const constraints = PLATFORM_PRESETS[platform];
  const scene = sceneInput as unknown as ExtendedScene;

  // 1. Duration validation
  const duration = scene.estimatedDuration ?? scene.duration ?? 0;
  if (duration <= 0) {
    issues.push({
      sceneId: scene.id,
      sceneOrder: index + 1,
      field: 'estimatedDuration',
      message: 'Scene has no duration set',
      severity: VALIDATION_SEVERITY.WARNING,
      suggestion: 'Set an estimated duration between 3-8 seconds',
    });
  } else if (duration > 10) {
    issues.push({
      sceneId: scene.id,
      sceneOrder: index + 1,
      field: 'estimatedDuration',
      message: `Scene duration (${String(duration)}s) is quite long for short-form video`,
      severity: VALIDATION_SEVERITY.WARNING,
      suggestion: 'Consider splitting into multiple scenes (aim for 3-8 seconds each)',
    });
  }

  // 2. Visual description validation
  const visualDesc = scene.visualDescription ?? scene.visualPrompt ?? '';
  if (!visualDesc || visualDesc.trim().length < 10) {
    issues.push({
      sceneId: scene.id,
      sceneOrder: index + 1,
      field: 'visualDescription',
      message: 'Missing or too short visual description',
      severity: VALIDATION_SEVERITY.ERROR,
      suggestion: 'Add a detailed visual description for AI image generation',
    });
  }

  // 3. Voiceover validation
  const voiceover = scene.voiceover ?? scene.scriptText ?? '';
  if (!voiceover || voiceover.trim().length === 0) {
    issues.push({
      sceneId: scene.id,
      sceneOrder: index + 1,
      field: 'voiceover',
      message: 'No voiceover/narration text',
      severity: VALIDATION_SEVERITY.WARNING,
      suggestion: 'Add voiceover text for TTS generation',
    });
  }

  // 4. Text overlay validation (platform-specific)
  const textOverlay = scene.textOverlay;
  if (textOverlay) {
    const textResult = validateTextOverlay(textOverlay, platform);
    if (!textResult.valid) {
      issues.push({
        sceneId: scene.id,
        sceneOrder: index + 1,
        field: 'textOverlay',
        message: textResult.message ?? 'Text overlay exceeds character limit',
        severity: VALIDATION_SEVERITY.WARNING,
        suggestion: `Keep text under ${String(constraints.maxTextCharsPerLine)} characters per line for ${platform}`,
      });
    }
  }

  // 5. Check character references (if characters exist)
  const sceneCharIds = scene.characterIds ?? [];
  for (const charId of sceneCharIds) {
    // If we have characterIds list, validate against it
    if (characterIds.length > 0 && !characterIds.includes(charId)) {
      issues.push({
        sceneId: scene.id,
        sceneOrder: index + 1,
        field: 'characterIds',
        message: `Referenced character ID "${charId}" not found in project`,
        severity: VALIDATION_SEVERITY.ERROR,
        suggestion: 'Remove invalid character reference or add the character first',
      });
    }
  }

  return issues;
}

/**
 * Hook to validate script against platform constraints
 * 
 * @example
 * const { validation, hasErrors, hasWarnings } = useScriptValidation({
 *   scenes,
 *   project,
 * });
 */
export const useScriptValidation = ({ scenes, project, characterIds = [] }: UseScriptValidationParams) => {
  const validation = useMemo<ScriptValidationResult>(() => {
    if (!project || scenes.length === 0) {
      return {
        isValid: true,
        issues: [],
        totalDuration: 0,
        targetDuration: project?.targetDuration ?? 60,
      };
    }

    const platform = (project.targetPlatform ?? 'generic') as TargetPlatform;
    const constraints = PLATFORM_PRESETS[platform];
    const targetDuration = project.targetDuration ?? constraints.maxDuration;

    // Validate each scene
    const allIssues: ScriptValidationIssue[] = [];
    let totalDuration = 0;

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i] as unknown as ExtendedScene;
      
      const sceneDuration = scene.estimatedDuration ?? scene.duration ?? 0;
      totalDuration += sceneDuration;

      const sceneIssues = validateScene(scene, i, platform, characterIds);
      allIssues.push(...sceneIssues);
    }

    // Global duration validation
    if (totalDuration > constraints.maxDuration) {
      allIssues.push({
        field: 'totalDuration',
        message: `Total duration (${String(totalDuration)}s) exceeds ${platform} limit of ${String(constraints.maxDuration)}s`,
        severity: VALIDATION_SEVERITY.ERROR,
        suggestion: `Reduce scene durations or remove scenes to fit within ${String(constraints.maxDuration)} seconds`,
      });
    } else if (totalDuration < constraints.minDuration) {
      allIssues.push({
        field: 'totalDuration',
        message: `Total duration (${String(totalDuration)}s) is below ${platform} minimum of ${String(constraints.minDuration)}s`,
        severity: VALIDATION_SEVERITY.WARNING,
        suggestion: `Add more content to reach at least ${String(constraints.minDuration)} seconds`,
      });
    }

    // Check if significantly over/under target
    const durationDiff = Math.abs(totalDuration - targetDuration);
    if (durationDiff > targetDuration * 0.3 && totalDuration > 0) {
      allIssues.push({
        field: 'totalDuration',
        message: `Total duration (${String(totalDuration)}s) differs significantly from target (${String(targetDuration)}s)`,
        severity: VALIDATION_SEVERITY.INFO,
        suggestion: 'Adjust scene durations to match your target duration',
      });
    }

    // Determine if valid (no errors)
    const hasErrors = allIssues.some(i => i.severity === VALIDATION_SEVERITY.ERROR);

    return {
      isValid: !hasErrors,
      issues: allIssues,
      totalDuration,
      targetDuration,
    };
  }, [scenes, project, characterIds]);

  // Derived states for convenience
  const hasErrors = validation.issues.some(i => i.severity === VALIDATION_SEVERITY.ERROR);
  const hasWarnings = validation.issues.some(i => i.severity === VALIDATION_SEVERITY.WARNING);
  const hasInfos = validation.issues.some(i => i.severity === VALIDATION_SEVERITY.INFO);

  const errorCount = validation.issues.filter(i => i.severity === VALIDATION_SEVERITY.ERROR).length;
  const warningCount = validation.issues.filter(i => i.severity === VALIDATION_SEVERITY.WARNING).length;

  return {
    validation,
    hasErrors,
    hasWarnings,
    hasInfos,
    errorCount,
    warningCount,
    totalDuration: validation.totalDuration,
    targetDuration: validation.targetDuration,
    isValid: validation.isValid,
  };
};
