# 🚀 Thmanyah Backend System

A modular, scalable backend system for managing and discovering media content (podcasts, documentaries, etc.) built with NestJS, TypeScript, and modern microservices architecture.

## 🏗️ Architecture

The system consists of 4 main services:

- **CMS API** (`apps/cms-api`) - Internal API for editors to create/edit content
- **Discovery API** (`apps/discovery-api`) - Public API for searching and viewing content
- **Outbox Publisher** (`apps/outbox-publisher`) - Polls database and pushes events to queue
- **Sync Worker** (`apps/sync-worker`) - Consumes queue jobs and syncs to Elasticsearch

## 🛠️ Tech Stack

- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL + TypeORM
- **Queue**: Redis + BullMQ
- **Search**: Elasticsearch
- **Monorepo**: Turborepo
- **Package Manager**: pnpm (workspaces)

## 📦 Shared Packages

- `@thmanyah/database` - TypeORM entities and database module
- `@thmanyah/queue` - BullMQ queue setup and job types
- `@thmanyah/elasticsearch` - ES client and index helpers
- `@thmanyah/config` - Environment configuration with Zod validation
- `@thmanyah/common` - Shared NestJS components, interceptors, filters, and configuration
- `@thmanyah/shared` - Common interfaces and types for APIs and data models

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- Docker & Docker Compose

### 1. Clone and Install

```bash
git clone <repository-url>
cd thmanyah-backend
pnpm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Environment
NODE_ENV=development

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=thmanyah

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
ELASTICSEARCH_INDEX_NAME=programs

# API Ports
CMS_API_PORT=3001
DISCOVERY_API_PORT=3002
OUTBOX_PUBLISHER_PORT=3003
SYNC_WORKER_PORT=3004

# Security (Optional)
CORS_ORIGINS=http://localhost:3000
API_RATE_LIMIT=100
API_RATE_LIMIT_TTL=60000
```

### 3. Start Infrastructure

```bash
# Start PostgreSQL, Redis, and Elasticsearch
docker-compose up -d

# Optional: Start Kibana for Elasticsearch management
docker-compose --profile monitoring up -d
```

### 4. Build and Run

```bash
# Build all packages
pnpm build

# Start all services in development mode
pnpm dev

# Or start individual services
pnpm --filter cms-api dev
pnpm --filter discovery-api dev
pnpm --filter outbox-publisher dev
pnpm --filter sync-worker dev
```

## 📚 API Documentation

Once running, you can access the Swagger documentation:

- **CMS API**: http://localhost:3001/api
- **Discovery API**: http://localhost:3002/api

## 🔧 Development

### Available Scripts

```bash
# Build all packages
pnpm build

# Build only packages (not apps)
pnpm build:packages

# Type checking
pnpm check-types

# Linting
pnpm lint

# Development mode (all services)
pnpm dev

# Clean all builds and dependencies
pnpm clean

# Monorepo validation
pnpm monorepo:check
pnpm monorepo:fix

# Production start
pnpm start:prod

# Format code
pnpm format
```

### Project Structure

```
thmanyah-backend/
├── apps/
│   ├── cms-api/             # Internal CMS app
│   ├── discovery-api/       # Public search app
│   ├── outbox-publisher/    # Polls DB, pushes jobs
│   └── sync-worker/         # Consumes queue, syncs ES
├── packages/
│   ├── database/            # Shared TypeORM entities
│   ├── queue/               # BullMQ queue setup
│   ├── elasticsearch/       # ES client & helpers
│   ├── config/              # Shared config utils
│   ├── common/              # NestJS interceptors, filters & config
│   └── shared/              # Common interfaces & types
├── docker-compose.yml       # Infrastructure
└── turbo.json               # Turborepo config
```

## 🔄 Data Flow

1. **Content Creation**: Editors use CMS API to create/update programs
2. **Outbox Events**: Changes are logged in the outbox table
3. **Queue Processing**: Outbox Publisher polls and pushes events to Redis queue
4. **Search Indexing**: Sync Worker consumes jobs and updates Elasticsearch
5. **Content Discovery**: Users search via Discovery API (Elasticsearch)

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific app
pnpm --filter cms-api test

# E2E tests
pnpm --filter cms-api test:e2e
```

## 🚀 Production Deployment

### Environment Variables

Set appropriate environment variables for production:

```bash
NODE_ENV=production
DATABASE_HOST=your-db-host
DATABASE_PASSWORD=your-secure-password
REDIS_HOST=your-redis-host
ELASTICSEARCH_URL=your-es-url
ELASTICSEARCH_PASSWORD=your-secure-password
CORS_ORIGINS=https://your-frontend-domain.com
```

### Deployment Options

#### Option 1: Docker Deployment

```bash
# Build and run with production environment
docker-compose up -d

# Or build production images
docker build -t thmanyah-backend .
```

#### Option 2: Direct Deployment

```bash
# Build all packages and apps
pnpm build

# Start production services
pnpm start:prod
```

#### Option 3: Individual Service Deployment

```bash
# Build and start each service individually
pnpm --filter cms-api build && pnpm --filter cms-api start:prod
pnpm --filter discovery-api build && pnpm --filter discovery-api start:prod
pnpm --filter outbox-publisher build && pnpm --filter outbox-publisher start:prod
pnpm --filter sync-worker build && pnpm --filter sync-worker start:prod
```

## 📊 Monitoring

- **Elasticsearch**: http://localhost:9200 (direct access)
- **Kibana**: Available via `docker-compose --profile monitoring up -d` (commented out by default)
- **Redis**: Available via Docker extension or `redis-cli -h localhost -p 6379`
- **Health Checks**: Each service exposes `/health` endpoint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
