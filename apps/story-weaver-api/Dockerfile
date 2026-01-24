FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy packages
COPY packages ./packages

# Copy app source
COPY apps/story-weaver-api ./apps/story-weaver-api

# Install dependencies and build
# Note: We install all deps to ensure shared packages build correctly
RUN pnpm install --frozen-lockfile

# Build dependencies first
RUN pnpm --filter @superapp/shared-types build
RUN pnpm --filter @superapp/core-sdk build

# Build app
RUN pnpm --filter @superapp/story-weaver-api build

# Expose port
EXPOSE 3003

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["node", "apps/story-weaver-api/dist/index.js"]
