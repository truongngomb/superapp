# ==============================================================================
# SUPERAPP - DOCKER BUILD (STABLE & OPTIMIZED)
# ==============================================================================
# Multi-stage build for pnpm monorepo
# Uses tsx for runtime stability while optimizing size
# ==============================================================================

# =============================================================================
# Stage 1: Base - Install pnpm
# =============================================================================
FROM node:20-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# =============================================================================
# Stage 2: Dependencies - Install all dependencies
# =============================================================================
FROM base AS deps

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api-server/package.json ./apps/api-server/
COPY apps/web-core/package.json ./apps/web-core/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/core-logic/package.json ./packages/core-logic/
COPY packages/ui-kit/package.json ./packages/ui-kit/

# Install all dependencies (frozen lockfile)
RUN pnpm install --frozen-lockfile

# =============================================================================
# Stage 3: Builder - Build frontend
# =============================================================================
FROM deps AS builder

COPY . .

# Build frontend (Vite)
ARG VITE_API_BASE_URL=/api
ARG VITE_ENABLE_DEBUG=false
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ENABLE_DEBUG=$VITE_ENABLE_DEBUG

RUN pnpm --filter @superapp/web-core build

# =============================================================================
# Stage 4: Production - Final image
# =============================================================================
FROM node:20-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache nginx supervisor curl \
    && mkdir -p /run/nginx /app /usr/share/nginx/html \
    && rm -rf /var/cache/apk/*

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy Nginx config
COPY deploy/nginx.conf /etc/nginx/http.d/default.conf

# Copy Frontend build
COPY --from=builder /app/apps/web-core/dist /usr/share/nginx/html

# Copy Backend (Source & Deps)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/core-logic/package.json ./packages/core-logic/
COPY apps/api-server/package.json ./apps/api-server/

# Copy SOURCE code (Explicitly specific folders to avoid accidental dist copy)
COPY packages/shared-types/src ./packages/shared-types/src
COPY packages/shared-types/tsconfig.json ./packages/shared-types/
COPY packages/core-logic/src ./packages/core-logic/src
COPY packages/core-logic/tsconfig.json ./packages/core-logic/
COPY apps/api-server/src ./apps/api-server/src
COPY apps/api-server/tsconfig.json ./apps/api-server/

# Config supervisor
COPY deploy/supervisord.conf /etc/supervisord.conf

# Install dependencies (Production only)
# Note: We install deps AGAIN in production stage to ensure clean node_modules
# without any build artifacts or symlinks to local folders that might corrupt
RUN pnpm install --frozen-lockfile --prod --ignore-scripts \
    && rm -rf /root/.local/share/pnpm/store \
    && rm -rf /app/node_modules/.cache

# ENV
ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:80/ && curl -f http://localhost:3001/api/health || exit 1

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
