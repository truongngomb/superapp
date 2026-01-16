# SuperApp - Deployment Guide

This guide explains how to deploy the SuperApp application using Docker and EasyPanel.

## Architecture

The Docker container bundles:
- **Nginx** (port 80) - Serves React SPA + proxies `/api/*` requests
- **Node.js API Server** (port 3001) - Express backend with PocketBase integration (runs via tsx)

```
┌─────────────────────────────────────────────────────┐
│                 Docker Container                     │
│  ┌───────────────────────────────────────────────┐  │
│  │              Nginx (port 80)                  │  │
│  │  ┌─────────────────┐  ┌────────────────────┐  │  │
│  │  │ Static Files    │  │  /api/* proxy      │  │  │
│  │  │ (React SPA)     │  │  → localhost:3001  │  │  │
│  │  └─────────────────┘  └────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
│                          │                           │
│                          ▼                           │
│  ┌───────────────────────────────────────────────┐  │
│  │         Express API Server (port 3001)        │  │
│  │  - Auth (Google OAuth)                        │  │
│  │  - RBAC (Roles, Permissions)                  │  │
│  │  - CRUD (Users, Categories, etc.)             │  │
│  │  - Realtime (SSE)                             │  │
│  │  - Runs with tsx (TypeScript runtime)         │  │
│  └───────────────────────────────────────────────┘  │
│                          │                           │
│                          ▼                           │
│              PocketBase (External)                   │
└─────────────────────────────────────────────────────┘
```

## Prerequisites

- Docker installed on your system
- Access to EasyPanel dashboard (for cloud deployment)
- PocketBase instance running and accessible
- Environment variables configured

## Environment Variables

### Required Variables

```ini
# PocketBase Connection (REQUIRED)
POCKETBASE_URL=https://your-pocketbase-instance.com

# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Client URL (for CORS)
CLIENT_URL=https://your-app-domain.com
ALLOWED_ORIGINS=https://your-app-domain.com

# Optional: Admin credentials (for seeding/migrations)
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=your-secure-password
```

### Frontend Build Variables (Build-time)

Note: These are used by Vite during the build process and baked into the static files. You cannot change them at runtime via `docker run`. They have sensible defaults.

- `VITE_API_BASE_URL`: Defaults to `/api` (Correct for this Docker setup via Nginx proxy).
- `VITE_ENABLE_DEBUG`: Defaults to `false`. Set to `true` to enable debug logs in production.

Example build with args:
```bash
docker build --build-arg VITE_ENABLE_DEBUG=true -t my-app .
```

## Building the Docker Image

### Local Build

```bash
# Navigate to project root
cd my-project

# Build the Docker image
docker build -f deploy/Dockerfile -t superapp:latest .

# Run locally for testing
docker run -d \
  -p 8080:80 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e HOST=0.0.0.0 \
  -e POCKETBASE_URL=http://host.docker.internal:8090 \
  -e CLIENT_URL=http://localhost:8080 \
  -e ALLOWED_ORIGINS=http://localhost:8080 \
  --name superapp-test \
  superapp:latest

# Access the application
# Frontend: http://localhost:8080
# API Health: http://localhost:8080/api/health

# View logs
docker logs -f superapp-test

# Stop and remove
docker stop superapp-test && docker rm superapp-test
```

### Build with PowerShell Script

```powershell
# Navigate to deploy folder
cd deploy

# Run the build script
.\push_docker.ps1
```

This script will:
1. Check and start Docker if not running
2. Build the image from project root
3. Push to Docker Hub

### Build with Version Tag

```bash
# Build with version tag
docker build -f deploy/Dockerfile -t truongngomb/superapp:v1.0.0 .

# Tag and push
docker push truongngomb/superapp:v1.0.0
docker push truongngomb/superapp:latest
```

## Deploying to EasyPanel

### Method 1: Docker Image (Recommended)

1. **Build and push your image:**

   ```bash
   docker build -f deploy/Dockerfile -t truongngomb/superapp:latest .
   docker push truongngomb/superapp:latest
   ```

2. **In EasyPanel Dashboard:**
   - Create a new service
   - Select "Docker Image" as the source
   - Enter image: `truongngomb/superapp:latest`
   - Configure port mapping: Container `80` → Public `443` (HTTPS)
   - Add environment variables (see Required Variables above)
   - Deploy

### Method 2: GitHub Repository

1. **Push code to GitHub** (including `deploy/Dockerfile`)

2. **In EasyPanel Dashboard:**
   - Create a new service
   - Select "GitHub" as the source
   - Connect your repository
   - Configure build:
     - Dockerfile path: `deploy/Dockerfile`
     - Build context: `.` (root)
   - Set port mapping: Container `80`
   - Add environment variables
   - Deploy

### Method 3: Docker Compose

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  superapp:
    build:
      context: .
      dockerfile: deploy/Dockerfile
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - HOST=0.0.0.0
      - POCKETBASE_URL=${POCKETBASE_URL}
      - CLIENT_URL=${CLIENT_URL}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    ports:
      - "8090:8090"
    volumes:
      - pocketbase_data:/pb_data
    restart: unless-stopped

volumes:
  pocketbase_data:
```

## Health Check

The application provides health check endpoints:

```bash
# API Health (includes cache stats, uptime)
curl http://your-domain/api/health

# Example response:
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-01-15T12:00:00.000Z",
    "uptime": 3600,
    "environment": "production",
    "cache": {
      "keys": 25,
      "hits": 500,
      "misses": 50
    }
  }
}
```

**EasyPanel Health Check Settings:**
- Path: `/api/health`
- Port: `80`
- Interval: `30s`
- Timeout: `10s`

## Troubleshooting

### Container won't start

```bash
# Check container logs
docker logs superapp

# Check if processes are running
docker exec superapp ps aux

# Verify nginx config
docker exec superapp nginx -t
```

### API not responding

```bash
# Check if port 3001 is listening
docker exec superapp sh -c "netstat -tlnp | grep 3001"

# Test API directly inside container
docker exec superapp curl -s http://localhost:3001/api/health

# Check supervisor status
docker logs superapp | grep -E "(success|error|WARN)"
```

### Environment validation error

If you see `Environment validation failed`:
- Ensure `POCKETBASE_URL` is set
- Check all required environment variables are provided
- Verify PocketBase is accessible from the container

### Frontend not loading

```bash
# Verify static files exist
docker exec superapp ls -la /usr/share/nginx/html

# Check nginx logs
docker logs superapp 2>&1 | grep nginx
```

### PocketBase connection issues

1. Verify `POCKETBASE_URL` is accessible from container
2. For local PocketBase, use `host.docker.internal:8090` (Docker Desktop)
3. Check PocketBase is running and accessible

## Performance Optimization

The Docker image includes:

**Frontend:**
- ✅ Multi-stage build (minimal image size)
- ✅ Gzip compression for all text files
- ✅ Static asset caching (1 year, immutable)
- ✅ Security headers (XSS, clickjacking protection)

**Backend:**
- ✅ Runs with tsx (TypeScript runtime, no compile step)
- ✅ Response caching (NodeCache)
- ✅ Compression middleware
- ✅ Supervisor for process management

**Expected Metrics:**
- Image size: ~450 MB
- Cold start: ~15-20 seconds
- API response: <50ms (cached), <200ms (uncached)

## Updating the Application

1. Pull latest code changes
2. Rebuild Docker image:
   ```bash
   docker build -f deploy/Dockerfile -t truongngomb/superapp:latest .
   ```
3. Push to registry:
   ```bash
   docker push truongngomb/superapp:latest
   ```
4. In EasyPanel, trigger redeploy or it will auto-update

## Security Considerations

- ✅ Helmet middleware for HTTP security headers
- ✅ CORS configured for specific origins
- ✅ Rate limiting on sensitive endpoints
- ⚠️ Ensure `POCKETBASE_URL` uses HTTPS in production
- ⚠️ Use HTTPS for your app domain (configure in EasyPanel)

## Support

For issues related to:
- **Docker build**: Check `deploy/Dockerfile` and build logs
- **Nginx**: Check `deploy/nginx.conf` and nginx error logs
- **API Server**: Check `apps/api-server/` logs
- **EasyPanel**: Consult EasyPanel documentation
