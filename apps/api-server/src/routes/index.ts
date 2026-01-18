/**
 * Routes Module - Central Route Exports
 * 
 * @example
 * ```typescript
 * import { authRouter, categoriesRouter, rolesRouter } from './routes/index.js';
 * 
 * app.use('/api/auth', authRouter);
 * app.use('/api/categories', categoriesRouter);
 * app.use('/api/roles', rolesRouter);
 * ```
 */

export { authRouter } from './auth.js';
export { categoriesRouter } from './categories.js';
export { rolesRouter } from './roles.js';
export { usersRouter } from './users.js';
export { activityLogsRouter } from './activity_logs.js';
export { default as systemRouter } from './system.js';
export { realtimeRouter } from './realtime.js';
export { settingsRouter } from './settings.js';
export { markdownRouter } from './markdown.js';

