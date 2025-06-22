# Multi-stage build for Thmanyah Backend Monorepo
FROM node:18-alpine AS base

# Accept build argument for target app
ARG TARGET_APP=cms-api

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/*/package.json ./packages/
COPY apps/${TARGET_APP}/package.json ./apps/${TARGET_APP}/

# Install dependencies (this layer will be cached unless package files change)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy only the target app and shared packages
COPY packages/ ./packages/
COPY apps/${TARGET_APP}/ ./apps/${TARGET_APP}/
COPY tsconfig*.json ./
COPY jest*.js ./

# Install dependencies again to ensure workspace linking
RUN pnpm install --frozen-lockfile --ignore-scripts

# Build packages first, then the target app
RUN pnpm --filter="./packages/*" build && pnpm --filter=${TARGET_APP} build

# Deploy only the target service with its dependencies
RUN pnpm --filter=${TARGET_APP} --ignore-scripts --prod deploy /deploy/${TARGET_APP}

# Copy the built dist directory to the deployed service
RUN cp -r apps/${TARGET_APP}/dist /deploy/${TARGET_APP}/

# =============================================================================
# Target App Image (dynamically named based on TARGET_APP)
# =============================================================================
FROM node:18-alpine AS target-app

# Accept build argument for target app
ARG TARGET_APP=cms-api

WORKDIR /app
ENV NODE_ENV=production

# Copy deployed service with minimal dependencies
COPY --from=base /deploy/${TARGET_APP} .

CMD ["node", "--experimental-global-webcrypto", "dist/main"]

# =============================================================================
# App-specific stages with proper port exposure
# =============================================================================
FROM target-app AS cms-api
EXPOSE 3001

FROM target-app AS discovery-api
EXPOSE 3002

FROM target-app AS outbox-publisher

FROM target-app AS sync-worker 