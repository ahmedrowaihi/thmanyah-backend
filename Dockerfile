# Multi-stage build for Thmanyah Backend Monorepo
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy all source code
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build all packages and apps
RUN pnpm build

# Deploy each service with only its dependencies
RUN pnpm --filter=cms-api --prod deploy /deploy/cms-api
RUN pnpm --filter=discovery-api --prod deploy /deploy/discovery-api
RUN pnpm --filter=outbox-publisher --prod deploy /deploy/outbox-publisher
RUN pnpm --filter=sync-worker --prod deploy /deploy/sync-worker

# Copy the built dist directories to each deployed service
RUN cp -r apps/cms-api/dist /deploy/cms-api/
RUN cp -r apps/discovery-api/dist /deploy/discovery-api/
RUN cp -r apps/outbox-publisher/dist /deploy/outbox-publisher/
RUN cp -r apps/sync-worker/dist /deploy/sync-worker/

# =============================================================================
# CMS API Image
# =============================================================================
FROM node:18-alpine AS cms-api

WORKDIR /app
ENV NODE_ENV=production

# Copy deployed service with minimal dependencies
COPY --from=base /deploy/cms-api .

EXPOSE 3001
CMD ["node", "--experimental-global-webcrypto", "dist/main"]

# =============================================================================
# Discovery API Image
# =============================================================================
FROM node:18-alpine AS discovery-api

WORKDIR /app
ENV NODE_ENV=production

# Copy deployed service with minimal dependencies
COPY --from=base /deploy/discovery-api .

EXPOSE 3002
CMD ["node", "--experimental-global-webcrypto", "dist/main"]

# =============================================================================
# Outbox Publisher Image
# =============================================================================
FROM node:18-alpine AS outbox-publisher

WORKDIR /app
ENV NODE_ENV=production

# Copy deployed service with minimal dependencies
COPY --from=base /deploy/outbox-publisher .

CMD ["node", "--experimental-global-webcrypto", "dist/main"]

# =============================================================================
# Sync Worker Image
# =============================================================================
FROM node:18-alpine AS sync-worker

WORKDIR /app
ENV NODE_ENV=production

# Copy deployed service with minimal dependencies
COPY --from=base /deploy/sync-worker .

CMD ["node", "--experimental-global-webcrypto", "dist/main"] 