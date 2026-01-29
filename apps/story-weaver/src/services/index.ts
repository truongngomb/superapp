/**
 * Services Module
 * Re-exports shared services from core-logic + local services
 */

export {
    authService,
} from '@superapp/core-logic';

export { videoProjectService } from './project.service';
export { videoSceneService } from './scene.service';
export { characterService } from './character.service';

export type { SettingItem } from '@superapp/shared-types';
