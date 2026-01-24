# 📋 Story Weaver Microservice Migration Checklist

> **Mục tiêu**: Chuyển Story Weaver sang microservice architecture với single entry point

**Status Legend**:
- ⬜ Not Started
- 🔄 In Progress
- ✅ Completed
- ❌ Blocked/Issue

---

## 🎯 MIGRATION OVERVIEW

### Current State
```
apps/story-weaver/                    → Frontend (port 3002)
apps/api-server/src/services/         → Backend (lẫn vào core)
Database: video_projects               → Không prefix
```

### Target State
```
apps/story-weaver/                    → Frontend (build → /story-weaver/)
apps/story-weaver-api/                → Backend riêng (port 3003)
packages/core-sdk/                    → Shared utilities
Database: sw_video_projects           → Có prefix sw_
URL: localhost:5173/story-weaver/*    → Single entry point
```

---

## ⬜ PHASE 0: PREPARATION

### 0.1. Backup & Safety
- [ ] Git status clean (no uncommitted changes)
- [ ] Create feature branch: `feature/story-weaver-microservice`
- [ ] Backup database: `pnpm db backup`
- [ ] Document current endpoints and features

### 0.2. Pre-Migration Verification
- [ ] Current dev servers working:
  - [ ] api-server (localhost:3001)
  - [ ] web-core (localhost:5173)
  - [ ] story-weaver (localhost:3002)
- [ ] Database accessible (localhost:8090)
- [ ] Story Weaver features working normally

**Notes:**
```
Branch name: ____________________
Backup location: ________________
Start date: _____________________
```

---

## ⬜ PHASE 1: CREATE CORE-SDK PACKAGE

### 1.1. Package Structure
- [ ] Create directory: `packages/core-sdk/`
- [ ] Create `package.json` with correct exports
- [ ] Create `tsconfig.json`
- [ ] Create `.gitignore` and `.npmignore`

### 1.2. Source Structure
- [ ] Create `src/auth/` directory
- [ ] Create `src/services/` directory
- [ ] Create `src/logging/` directory
- [ ] Create `src/index.ts` (main export)

### 1.3. Auth Module
- [ ] Implement `auth/verify-token.ts`
- [ ] Implement `auth/index.ts` (exports)
- [ ] Test: Token verification works

### 1.4. BaseService Module
- [ ] Implement `services/base.service.ts`
  - [ ] Constructor with PocketBase
  - [ ] getAll() method
  - [ ] getById() method
  - [ ] create() method
  - [ ] update() method
  - [ ] delete() method (soft delete)
  - [ ] restore() method
  - [ ] mapRecord() abstract method
  - [ ] invalidateCache() method
  - [ ] logActivity() method
- [ ] Implement `services/index.ts` (exports)

### 1.5. Activity Logger Module
- [ ] Implement `logging/activity-logger.ts`
- [ ] Implement `logging/index.ts` (exports)

### 1.6. Build & Test
- [ ] Install dependencies: `pnpm install`
- [ ] Build package: `pnpm build`
- [ ] Verify output: `packages/core-sdk/dist/` exists
- [ ] Check type definitions: `*.d.ts` files generated

**Phase 1 Completed:** ⬜ Yes / ⬜ No

**Issues encountered:**
```
[Record any issues here]
```

---

## ⬜ PHASE 2: CREATE STORY WEAVER API

### 2.1. Project Setup
- [ ] Create directory: `apps/story-weaver-api/`
- [ ] Create `package.json`
- [ ] Create `tsconfig.json`
- [ ] Create `.env.example`
- [ ] Copy `.env.example` → `.env` and fill values

### 2.2. Directory Structure
- [ ] Create `src/controllers/`
- [ ] Create `src/services/`
- [ ] Create `src/routes/`
- [ ] Create `src/middleware/`
- [ ] Create `src/config/`
- [ ] Create `src/database/collections/`

### 2.3. Migrate Code from api-server
- [ ] Move `services/video-project.service.ts`
- [ ] Move `services/video-render.service.ts`
- [ ] Move `services/video-scene.service.ts`
- [ ] Move `controllers/video-project.controller.ts`
- [ ] Move `controllers/video-scene.controller.ts`
- [ ] Move `routes/video-projects.ts`

### 2.4. Refactor Services
- [ ] Update imports to use `@superapp/core-sdk`
- [ ] Refactor video-project.service to extend BaseService
- [ ] Refactor video-scene.service to extend BaseService
- [ ] Update collection names: `sw_video_projects`, `sw_video_scenes`
- [ ] Test: Services compile without errors

### 2.5. Middleware
- [ ] Implement `middleware/auth.ts` using core-sdk
- [ ] Implement `middleware/index.ts` (exports)
- [ ] Add Express Request type augmentation

### 2.6. Routes
- [ ] Update `routes/video-projects.ts` with new middleware
- [ ] Create `routes/index.ts` (aggregate routes)
- [ ] Test: Routes defined correctly

### 2.7. Main Server
- [ ] Create `src/index.ts` (Express app)
- [ ] Add CORS configuration
- [ ] Add JSON middleware
- [ ] Mount routes: `/api/story-weaver/*`
- [ ] Add health check endpoint: `/health`

### 2.8. Build & Test
- [ ] Install dependencies: `pnpm install`
- [ ] Build: `pnpm build`
- [ ] Run dev server: `pnpm dev`
- [ ] Test health endpoint: `http://localhost:3003/health`

**Phase 2 Completed:** ⬜ Yes / ⬜ No

**API Endpoints Verified:**
- [ ] GET `/health` → 200 OK
- [ ] GET `/api/story-weaver/projects` → (with auth)
- [ ] POST `/api/story-weaver/projects` → (with auth)

**Issues encountered:**
```
[Record any issues here]
```

---

## ⬜ PHASE 3: CONFIGURE FRONTEND

### 3.1. Update Vite Config
- [ ] Update `apps/story-weaver/vite.config.ts`:
  - [ ] Set `base: '/story-weaver/'` for production
  - [ ] Set `outDir` to `../../apps/web-core/public/apps/story-weaver`
  - [ ] Update proxy: `/api/story-weaver` → `http://localhost:3003`

### 3.2. API Configuration
- [ ] Create/update `src/config/api.ts`
- [ ] Set API_BASE_URL:
  - [ ] Dev: `http://localhost:3003/api/story-weaver`
  - [ ] Prod: `/api/story-weaver`

### 3.3. Update API Calls
- [ ] Review all `fetch()` calls in services
- [ ] Update to use `API_BASE_URL`
- [ ] Verify authentication headers

### 3.4. Update Package Scripts
- [ ] Add `build:copy` script to package.json

### 3.5. Test Build
- [ ] Run: `pnpm build`
- [ ] Verify output: `apps/web-core/public/apps/story-weaver/index.html` exists
- [ ] Check asset paths in build (should have `/story-weaver/` prefix)

### 3.6. Test Development
- [ ] Run: `pnpm dev` (port 3002)
- [ ] App loads correctly
- [ ] API calls work (proxied to 3003)

**Phase 3 Completed:** ⬜ Yes / ⬜ No

**Build Output Verified:**
- [ ] `index.html` exists in web-core/public/apps/story-weaver/
- [ ] Assets have correct paths
- [ ] Source maps generated

**Issues encountered:**
```
[Record any issues here]
```

---

## ⬜ PHASE 4: DATABASE MIGRATION

### 4.1. Prepare Collections Schema
- [ ] Create `database/collections/sw_video_projects.collection.ts`
- [ ] Create `database/collections/sw_video_scenes.collection.ts`
- [ ] Define schema with all fields
- [ ] Set permissions/rules

### 4.2. Create Migration Script
- [ ] Create `database/migrations/001_rename_collections.ts`
- [ ] Implement:
  - [ ] Create new collections (sw_*)
  - [ ] Copy data from old → new
  - [ ] Verify data integrity
  - [ ] (Optional) Delete old collections

### 4.3. Run Migration
- [ ] Set environment variables in `.env`
- [ ] Run migration script
- [ ] Verify in PocketBase Admin UI

### 4.4. Verify Data
- [ ] Count records: old vs new collections match
- [ ] Spot check random records
- [ ] Test API with new collections

### 4.5. Update Collection References
- [ ] Update services to use `sw_*` collections
- [ ] Update any hardcoded collection names

**Phase 4 Completed:** ⬜ Yes / ⬜ No

**Migration Stats:**
```
video_projects:    ____ records → sw_video_projects:    ____ records
video_scenes:      ____ records → sw_video_scenes:      ____ records
```

**PocketBase Collections:**
- [ ] `sw_video_projects` exists
- [ ] `sw_video_scenes` exists
- [ ] Old collections backed up/deleted

**Issues encountered:**
```
[Record any issues here]
```

---

## ⬜ PHASE 5: INTEGRATE WITH WEB-CORE

### 5.1. Update Root Package Scripts
- [ ] Update `package.json` (root):
  - [ ] `dev:api-core`
  - [ ] `dev:api-sw`
  - [ ] `dev:web`
  - [ ] `dev:sw`
  - [ ] `dev` (run all concurrently)

### 5.2. Update Web-Core Vite Proxy
- [ ] Update `apps/web-core/vite.config.ts`:
  - [ ] Add proxy for `/story-weaver` → `http://localhost:3002`
  - [ ] Verify `/api` proxy still works

### 5.3. Create Mount Point
- [ ] Create `apps/web-core/public/apps/` directory
- [ ] Add `.gitkeep` or README explaining purpose

### 5.4. Test Integration
- [ ] Run `pnpm dev` from root
- [ ] Verify all 4 servers start:
  - [ ] api-server (3001)
  - [ ] story-weaver-api (3003)
  - [ ] web-core (5173)
  - [ ] story-weaver (3002)

### 5.5. Test URLs
- [ ] `http://localhost:5173/` → Web Core
- [ ] `http://localhost:5173/story-weaver` → Story Weaver (proxied)
- [ ] `http://localhost:3002/` → Story Weaver (direct)
- [ ] `http://localhost:3003/health` → SW API health

**Phase 5 Completed:** ⬜ Yes / ⬜ No

**Dev Mode Verified:**
```
✓ All 4 servers running
✓ Proxy working correctly
✓ Hot reload working for all apps
```

**Issues encountered:**
```
[Record any issues here]
```

---

## ⬜ PHASE 6: NGINX & DOCKER

### 6.1. Update Nginx Config
- [ ] Update `deploy/nginx.conf`:
  - [ ] Core frontend: `/` → serve web-core
  - [ ] Story Weaver frontend: `/story-weaver` → serve from `/apps/story-weaver/`
  - [ ] Core API: `/api` → proxy to api-server:3001
  - [ ] SW API: `/api/story-weaver` → proxy to story-weaver-api:3003

### 6.2. Create Story Weaver API Dockerfile
- [ ] Create `apps/story-weaver-api/Dockerfile`
- [ ] Multi-stage build
- [ ] Build core-sdk first
- [ ] Build story-weaver-api
- [ ] Production image

### 6.3. Update Docker Compose
- [ ] Add `story-weaver-api` service to `docker-compose.yml`
- [ ] Configure environment variables
- [ ] Add dependencies (pocketbase)
- [ ] Verify nginx depends on all services

### 6.4. Test Docker Build
- [ ] Build core-sdk image (if separate)
- [ ] Build story-weaver-api image
- [ ] Build web-core image
- [ ] Test: All images build successfully

### 6.5. Test Docker Run
- [ ] Run: `docker-compose up`
- [ ] Test: `http://localhost/` → Web Core
- [ ] Test: `http://localhost/story-weaver` → Story Weaver
- [ ] Test: `http://localhost/api/story-weaver/projects` → API

**Phase 6 Completed:** ⬜ Yes / ⬜ No

**Docker Images:**
- [ ] `story-weaver-api` built
- [ ] Image size reasonable: _____ MB
- [ ] All services start correctly

**Production URLs Verified:**
- [ ] `/` → Core
- [ ] `/story-weaver/` → Story Weaver app
- [ ] `/api/story-weaver/*` → Story Weaver API

**Issues encountered:**
```
[Record any issues here]
```

---

## ⬜ PHASE 7: CLEANUP

### 7.1. Remove Old Code from api-server
- [ ] Delete `src/services/video-project.service.ts`
- [ ] Delete `src/services/video-render.service.ts`
- [ ] Delete `src/services/video-scene.service.ts`
- [ ] Delete `src/controllers/video-project.controller.ts`
- [ ] Delete `src/controllers/video-scene.controller.ts`
- [ ] Delete `src/routes/video-projects.ts`

### 7.2. Update api-server Imports
- [ ] Remove video-related imports from `routes/index.ts`
- [ ] Remove video-related imports from `controllers/index.ts`
- [ ] Remove video-related imports from `services/index.ts`

### 7.3. Update api-server Config
- [ ] Remove `VIDEO_PROJECTS` from `config/database.ts`
- [ ] Remove `VIDEO_SCENES` from `config/database.ts`
- [ ] Remove video-related cache keys
- [ ] Update database collections list

### 7.4. Clean Up Database Collections (api-server)
- [ ] Remove old collection definitions
- [ ] Update `allCollections` array
- [ ] Update `CollectionNames` export

### 7.5. Verify api-server Clean
- [ ] Build api-server: `pnpm build`
- [ ] No errors
- [ ] No video-related references in build output
- [ ] Server starts correctly

**Phase 7 Completed:** ⬜ Yes / ⬜ No

**Cleanup Verified:**
- [ ] No video-related code in api-server
- [ ] api-server builds without errors
- [ ] api-server runs without issues
- [ ] No broken imports

**Issues encountered:**
```
[Record any issues here]
```

---

## ⬜ PHASE 8: TESTING & VERIFICATION

### 8.1. Development Mode Testing

#### All Services Running
- [ ] api-server: `http://localhost:3001`
- [ ] story-weaver-api: `http://localhost:3003`
- [ ] web-core: `http://localhost:5173`
- [ ] story-weaver: `http://localhost:3002`

#### API Testing
- [ ] Core API health: `/api/auth/health`
- [ ] SW API health: `http://localhost:3003/health`
- [ ] Login via Core API → Get token
- [ ] Test SW API with token:
  - [ ] GET `/api/story-weaver/projects`
  - [ ] POST `/api/story-weaver/projects`
  - [ ] PUT `/api/story-weaver/projects/:id`
  - [ ] DELETE `/api/story-weaver/projects/:id`

#### Frontend Testing
- [ ] Web Core loads: `http://localhost:5173/`
- [ ] Story Weaver loads (direct): `http://localhost:3002/`
- [ ] Story Weaver loads (proxy): `http://localhost:5173/story-weaver`
- [ ] Story Weaver can authenticate
- [ ] Story Weaver can CRUD projects
- [ ] Hot reload works for all apps

### 8.2. Production Build Testing

#### Build Process
- [ ] Build packages: `pnpm build:packages`
- [ ] Build story-weaver: `pnpm build:apps`
- [ ] Build web-core: `pnpm build:web`
- [ ] All builds complete without errors

#### Build Output Verification
- [ ] `apps/web-core/dist/` exists
- [ ] `apps/web-core/dist/apps/story-weaver/` exists (nested)
- [ ] `apps/api-server/dist/` exists
- [ ] `apps/story-weaver-api/dist/` exists

#### Docker Production Testing
- [ ] Build Docker images
- [ ] Run: `docker-compose up`
- [ ] Test all URLs:
  - [ ] `http://localhost/` → Core
  - [ ] `http://localhost/admin/` → Admin pages
  - [ ] `http://localhost/story-weaver/` → Story Weaver
  - [ ] `http://localhost/api/auth/health` → Core API
  - [ ] `http://localhost/api/story-weaver/projects` → SW API

### 8.3. Database Verification

#### PocketBase Admin Check
- [ ] Open: `http://localhost:8090/_/`
- [ ] Collections exist:
  - [ ] `users` (core)
  - [ ] `roles` (core)
  - [ ] `sw_video_projects` (SW with prefix)
  - [ ] `sw_video_scenes` (SW with prefix)
- [ ] Old collections removed:
  - [ ] `video_projects` deleted (or archived)
  - [ ] `video_scenes` deleted (or archived)

#### Data Integrity
- [ ] Record counts match migration stats
- [ ] Sample data looks correct
- [ ] Relations intact (user_id, etc)

### 8.4. Feature Testing

#### Story Weaver Features
- [ ] Create new video project
- [ ] Edit project
- [ ] Delete project (soft delete)
- [ ] Restore project
- [ ] AI script generation works
- [ ] Video rendering queues correctly

#### Activity Logs
- [ ] Story Weaver actions logged in `activity_logs`
- [ ] Logs include correct user_id
- [ ] Logs include correct action
- [ ] Logs include correct resource

### 8.5. Performance Testing
- [ ] Page load times acceptable
- [ ] API response times < 500ms
- [ ] No memory leaks (long-running test)
- [ ] Hot reload time acceptable

**Phase 8 Completed:** ⬜ Yes / ⬜ No

**Test Results Summary:**
```
Dev Mode:        ✓ Pass / ✗ Fail
Production:      ✓ Pass / ✗ Fail
Database:        ✓ Pass / ✗ Fail
Features:        ✓ Pass / ✗ Fail
Performance:     ✓ Pass / ✗ Fail
```

**Issues encountered:**
```
[Record any issues here]
```

---

## ⬜ PHASE 9: DOCUMENTATION

### 9.1. Core-SDK Documentation
- [ ] Create `packages/core-sdk/README.md`
- [ ] Document exports and usage
- [ ] Add examples for:
  - [ ] verifyToken
  - [ ] BaseService
  - [ ] ActivityLogger

### 9.2. Story Weaver API Documentation
- [ ] Create `apps/story-weaver-api/README.md`
- [ ] Document architecture
- [ ] Document environment variables
- [ ] Document API endpoints
- [ ] Add development instructions

### 9.3. Update Main README
- [ ] Update `README.md` (root)
- [ ] Add Story Weaver to features list
- [ ] Update project structure diagram
- [ ] Update development commands

### 9.4. Architecture Documentation
- [ ] Create/update `.agent/docs/architecture.md`
- [ ] Add microservice section
- [ ] Add Story Weaver architecture
- [ ] Add deployment diagram

### 9.5. Migration Guide
- [ ] Create `.agent/docs/adding-new-microservice.md`
- [ ] Template for future apps
- [ ] Best practices
- [ ] Common pitfalls

**Phase 9 Completed:** ⬜ Yes / ⬜ No

**Documentation Created:**
- [ ] core-sdk README
- [ ] story-weaver-api README
- [ ] Root README updated
- [ ] Architecture docs updated
- [ ] Future app template created

**Issues encountered:**
```
[Record any issues here]
```

---

## ✅ FINAL CHECKLIST

### Pre-Deployment
- [ ] All phases completed
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Team reviewed changes
- [ ] Stakeholders approved

### Git & Version Control
- [ ] All changes committed
- [ ] Branch up to date with main
- [ ] Merge conflicts resolved
- [ ] Pull request created (if applicable)

### Deployment Preparation
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] Rollback plan documented
- [ ] Monitoring configured

### Go-Live
- [ ] Production deployment successful
- [ ] Health checks passing
- [ ] Smoke tests passing
- [ ] Performance acceptable
- [ ] No critical errors in logs

### Post-Deployment
- [ ] Monitor for 24 hours
- [ ] User feedback collected
- [ ] Known issues documented
- [ ] Success metrics measured

---

## 📊 MIGRATION SUMMARY

**Start Date:** ___________________

**Completion Date:** ___________________

**Total Duration:** ___________________

**Phases Completed:** ___ / 9

**Overall Status:** ⬜ Success / ⬜ Partial / ⬜ Failed

### Key Metrics

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| API Servers | 1 | 2 | +1 |
| Deployments | 1 | 1 | 0 (same entry point) |
| Database Collections | 2 (no prefix) | 2 (sw_ prefix) | Organized |
| Build Time | ___s | ___s | ___s |
| Dev Startup Time | ___s | ___s | ___s |

### Lessons Learned
```
1. What went well:


2. What could be improved:


3. Unexpected challenges:


4. Recommendations for future migrations:

```

---

## 🆘 TROUBLESHOOTING NOTES

### Common Issues & Solutions

**Issue 1: core-sdk build fails**
```
Solution: rm -rf node_modules dist && pnpm install && pnpm build
```

**Issue 2: Story Weaver API can't connect to PocketBase**
```
Solution: Check POCKETBASE_URL in .env
Dev: http://127.0.0.1:8090
Docker: http://pocketbase:8090
```

**Issue 3: Frontend 404 on /story-weaver in production**
```
Solution: Verify build output exists:
ls apps/web-core/public/apps/story-weaver/index.html
```

**Issue 4: API calls return 401**
```
Solution: Verify auth token is being sent
Check token format: Bearer <token>
Verify core-sdk verifyToken is working
```

**Custom Issues:**
```
[Add your own issues and solutions here]
```

---

## 📞 CONTACTS & RESOURCES

**Team:**
- Lead Developer: ___________________
- Backend Developer: ___________________
- DevOps: ___________________

**Resources:**
- Implementation Guide: `.agent/docs/story-weaver-microservice-implementation.md`
- Architecture Docs: `.agent/docs/architecture.md`
- PocketBase Admin: http://localhost:8090/_/

**Support:**
- Project Repository: ___________________
- Issue Tracker: ___________________
- Slack Channel: ___________________

---

**End of Checklist** ✨
