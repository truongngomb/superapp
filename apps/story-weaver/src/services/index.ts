/**
 * Services Module
 * Re-exports shared services from core-logic + local services
 */

export {
    authService,
    settingsService
} from '@superapp/core-logic';

export { videoProjectService } from './project.service';
export { videoSceneService } from './scene.service';

export type { SettingItem } from '@superapp/shared-types';
