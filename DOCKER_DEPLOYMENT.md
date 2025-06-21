# Docker Deployment Guide

## Overview

This guide explains how to build and deploy the Thmanyah Backend monorepo using Docker.

## Architecture

The monorepo is built as separate Docker images for each service:

- **cms-api**: Content Management API (Port 3001) - **Automatically runs database migrations on startup**
- **discovery-api**: Search and Discovery API (Port 3002)
- **outbox-publisher**: Message publishing service
- **sync-worker**: Data synchronization worker

## Quick Start

### 1. Build All Images

```bash
pnpm docker:build
```

### 2. Start Full Stack

```bash
pnpm docker:up
```

### 3. View Logs

```bash
pnpm docker:logs
```

### 4. Stop Services

```bash
pnpm docker:down
```

## Individual Service Builds

Build specific services:

```bash
# Build CMS API only
pnpm docker:build:cms-api

# Build Discovery API only
pnpm docker:build:discovery-api

# Build Outbox Publisher only
pnpm docker:build:outbox-publisher

# Build Sync Worker only
pnpm docker:build:sync-worker
```

## Manual Docker Commands

### Build Individual Images

```bash
# CMS API
docker build --target cms-api -t thmanyah/cms-api .

# Discovery API
docker build --target discovery-api -t thmanyah/discovery-api .

# Outbox Publisher
docker build --target outbox-publisher -t thmanyah/outbox-publisher .

# Sync Worker
docker build --target sync-worker -t thmanyah/sync-worker .
```

### Run Individual Containers

```bash
# CMS API
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e DATABASE_HOST=your-db-host \
  -e DATABASE_PORT=5432 \
  -e DATABASE_USERNAME=postgres \
  -e DATABASE_PASSWORD=your-password \
  -e DATABASE_NAME=thmanyah \
  -e REDIS_HOST=your-redis-host \
  -e REDIS_PORT=6379 \
  -e ELASTICSEARCH_URL=http://your-elasticsearch:9200 \
  thmanyah/cms-api

# Discovery API
docker run -p 3002:3002 \
  -e NODE_ENV=production \
  -e DATABASE_HOST=your-db-host \
  -e DATABASE_PORT=5432 \
  -e DATABASE_USERNAME=postgres \
  -e DATABASE_PASSWORD=your-password \
  -e DATABASE_NAME=thmanyah \
  -e REDIS_HOST=your-redis-host \
  -e REDIS_PORT=6379 \
  -e ELASTICSEARCH_URL=http://your-elasticsearch:9200 \
  thmanyah/discovery-api
```

## Production Deployment

### Using Docker Compose

```bash
# Start with production compose file
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale cms-api=3 --scale discovery-api=2
```

### Using Kubernetes

Create separate deployments for each service:

```yaml
# cms-api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cms-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cms-api
  template:
    metadata:
      labels:
        app: cms-api
    spec:
      containers:
        - name: cms-api
          image: thmanyah/cms-api:latest
          ports:
            - containerPort: 3001
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_HOST
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: host
          # ... other environment variables
```

## Environment Variables

### Required for Production

- `NODE_ENV=production`
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`
- `REDIS_HOST`
- `REDIS_PORT`
- `ELASTICSEARCH_URL`

### Optional

- `REDIS_PASSWORD`
- `ELASTICSEARCH_USERNAME`
- `ELASTICSEARCH_PASSWORD`
- `CMS_API_PORT` (default: 3001)
- `DISCOVERY_API_PORT` (default: 3002)

### SSL Configuration

For local testing with Docker Compose:

- `DATABASE_SSL_DISABLED=true` - Disables SSL for local PostgreSQL

For production with SSL-enabled databases:

- Omit `DATABASE_SSL_DISABLED` - SSL will be enabled automatically

## Database Migrations

### Automatic Migrations (Production)

The **CMS API automatically runs database migrations on startup** when:

- `NODE_ENV=production` is set, OR
- `AUTO_MIGRATE=true` is set

This ensures your database schema is always up-to-date in production environments.

### Manual Migrations (Development)

```bash
# Run migrations manually
pnpm db:migrate

# Generate new migration
pnpm db:migrate:generate

# Revert last migration
pnpm db:migrate:revert
```

## Multi-Stage Build Benefits

1. **Shared Build Cache**: All services share the same base build stage
2. **Optimized Images**: Each service only contains its necessary files
3. **Faster Builds**: Dependencies are installed once and shared
4. **Smaller Images**: No development dependencies in production images
5. **Hybrid Deployment**: Uses `pnpm deploy` for package structure + manual copy for built output

## Build Optimization

### Layer Caching

The Dockerfile is optimized for layer caching:

1. Install dependencies first (changes less frequently)
2. Copy source code (changes more frequently)
3. Build applications
4. Deploy packages with `pnpm deploy`
5. Copy built output to service images
6. Create minimal production images

### Build Context

The `.dockerignore` file excludes unnecessary files to speed up builds.

## Runtime Configuration

### Node.js Flags

All services use the `--experimental-global-webcrypto` flag to support the `@nestjs/schedule` module:

```bash
CMD ["node", "--experimental-global-webcrypto", "dist/main"]
```

## Monitoring

### Health Checks

Each service includes health check endpoints:

- CMS API: `http://localhost:3001/v1/health`
- Discovery API: `http://localhost:3002/v1/health`

### Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f cms-api
```

## Troubleshooting

### Build Issues

```bash
# Clean build (no cache)
docker build --no-cache --target cms-api -t thmanyah/cms-api .

# Build with verbose output
docker build --progress=plain --target cms-api -t thmanyah/cms-api .
```

### Runtime Issues

```bash
# Check container logs
docker logs <container-id>

# Execute into container
docker exec -it <container-id> /bin/sh

# Check environment variables
docker exec <container-id> env

# Check database tables (if using local PostgreSQL)
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d thmanyah -c "\dt"
```

### Common Issues

1. **Crypto errors**: Ensure `--experimental-global-webcrypto` flag is used
2. **Database connection**: Check SSL configuration and credentials
3. **Missing tables**: Verify migrations ran successfully
4. **Outbox errors**: Ensure `outbox` table exists (created by migrations)

## Security Considerations

1. **Never commit `.env` files** to version control
2. **Use secrets management** in production (Docker secrets, Kubernetes secrets)
3. **Use non-root users** in production containers
4. **Scan images** for vulnerabilities regularly
5. **Keep base images updated**
6. **Enable SSL** for database connections in production
7. **Use strong passwords** for all services

## Performance Tuning

### Resource Limits

```yaml
# In docker-compose.prod.yml
services:
  cms-api:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"
        reservations:
          memory: 256M
          cpus: "0.25"
```

### Scaling

```bash
# Scale horizontally
docker-compose -f docker-compose.prod.yml up -d --scale cms-api=3

# Use load balancer
docker-compose -f docker-compose.prod.yml up -d nginx
```

## Image Sizes

Current optimized image sizes:

- **CMS API**: ~339MB
- **Discovery API**: ~346MB
- **Outbox Publisher**: ~329MB
- **Sync Worker**: ~345MB

These sizes are achieved through:

- Multi-stage builds
- `pnpm deploy` for minimal dependencies
- `.dockerignore` to exclude unnecessary files
- Alpine Linux base images
