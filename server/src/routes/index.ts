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
