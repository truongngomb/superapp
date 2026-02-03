# Deployment Guide

**Reference:** See `deploy/DEPLOYMENT.md` for the authoritative guide.

## Architecture
The project uses a **single-container architecture** orchestrated by **Supervisor**:

- **Nginx (Port 80):** Serves the React SPA (`apps/web-core` + `apps/story-weaver` micro-frontend) and proxies `/api/*` requests.
- **Node.js API Server (Port 3001):** Runs `apps/api-server` (and likely `story-weaver-api` logic) using `tsx`.
- **PocketBase:** External dependency (must be provided via env var).

## Docker Deployment

### Build Image
```bash
docker build -f deploy/Dockerfile -t superapp:latest .
```

### Run Container
```bash
docker run -d \
  -p 80:80 \
  -e POCKETBASE_URL=https://your-pocketbase.com \
  -e NODE_ENV=production \
  superapp:latest
```

## Environment Variables
| Variable | Description | Required |
| :--- | :--- | :--- |
| `POCKETBASE_URL` | URL to PocketBase | Yes |
| `CLIENT_URL` | Frontend URL (CORS) | Yes |
| `ALLOWED_ORIGINS` | CORS Origins | Yes |
| `PORT` | API Port (internal) | Default: 3001 |
| `HOST` | API Host | Default: 0.0.0.0 |

## CI/CD
- **Push Script:** `deploy/push_docker.ps1` automates building and pushing to Docker Hub.
- **EasyPanel:** Recommended deployment platform (supports Docker Image or GitHub source).
