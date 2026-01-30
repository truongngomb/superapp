/**
 * Keys used in the Settings collection for Story Weaver
 * Prefix 'sw_' to distinguish from other app settings
 */
export enum SWSettingKey {
  // Prompts for Scripts
  PROMPT_SCRIPT_GEN = 'sw_prompt_script_gen',
  
  // Prompts for Characters
  PROMPT_CHARACTER_EXTRACT = 'sw_prompt_character_extract',
  
  // Prompts for Visuals
  PROMPT_VISUAL_GEN_BASE = 'sw_prompt_visual_gen_base',
  
  // Feature Flags
  FEATURE_USE_KOREAN_OPTIMIZATION = 'sw_feature_use_korean_opt',
}

export interface SystemSetting {
  key: string;
  value: unknown;
  description?: string;
  visibility: 'public' | 'admin' | 'secret';
  group?: string; // Optional grouping meta
}
