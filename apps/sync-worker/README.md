# 🔄 Thmanyah Sync Worker

Background service that synchronizes data between the database and Elasticsearch to maintain search index consistency.

## 🎯 Purpose

The Sync Worker service is responsible for:

- Consuming events from the message queue (Redis/BullMQ)
- Synchronizing program data with Elasticsearch
- Maintaining search index consistency
- Handling data transformation and mapping
- Providing reliable indexing with retry mechanisms

## 🏗️ Architecture

This service is part of the Thmanyah microservices architecture:

```
Queue (Redis/BullMQ) → Sync Worker → Elasticsearch
```

The Sync Worker ensures that changes made in the CMS API are reflected in the search index used by the Discovery API.

## 🛠️ Tech Stack

- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL + TypeORM
- **Queue**: Redis + BullMQ
- **Search**: Elasticsearch
- **Testing**: Jest

## 📋 Features

### Data Synchronization

- ✅ Consumes events from Redis queue (queue name is fixed in code)
- ✅ Synchronizes program data with Elasticsearch
- ✅ Handles create, update, and delete operations
- ✅ Implements retry mechanisms for failed operations
- ✅ Maintains data consistency across services

### Index Management

- ✅ Creates and updates Elasticsearch documents
- ✅ Handles bulk operations for performance
- ✅ Manages index mappings and settings
- ✅ Provides index health monitoring
- ✅ Supports index reindexing operations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis instance
- Elasticsearch instance
- Environment variables configured (see below)

### Development

```bash
# Install dependencies (from root)
pnpm install

# Start in development mode
pnpm --filter sync-worker dev

# Or from the app directory
cd apps/sync-worker
pnpm dev
```

### Environment Variables

Required environment variables (see root `.env.example`):

```env
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

# Node environment
NODE_ENV=development
```

## 🧪 Testing

```bash
# Unit tests
pnpm --filter sync-worker test

# E2E tests
pnpm --filter sync-worker test:e2e

# Test coverage
pnpm --filter sync-worker test:cov

# Watch mode
pnpm --filter sync-worker test:watch
```

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev                    # Start in development mode
pnpm start                  # Start in production mode
pnpm start:dev              # Start with watch mode
pnpm start:debug            # Start in debug mode
pnpm start:prod             # Start in production mode

# Testing
pnpm test                   # Run unit tests
pnpm test:watch             # Run tests in watch mode
pnpm test:cov               # Run tests with coverage
pnpm test:debug             # Run tests in debug mode
pnpm test:e2e               # Run e2e tests

# Building
pnpm build                  # Build the application
pnpm build:watch            # Build in watch mode

# Linting
pnpm lint                   # Run ESLint
pnpm lint:fix               # Fix ESLint issues
```

### Project Structure

```
apps/sync-worker/
├── src/
│   ├── app.module.ts           # Main application module
│   ├── main.ts                 # Application entry point
│   ├── common/                 # Shared utilities
│   └── sync-worker/            # Sync worker logic
│       ├── sync-worker.service.ts
│       └── sync-worker.service.spec.ts
├── test/                       # E2E tests
└── package.json
```

## 🔄 Data Flow

1. **Event Consumption**: Sync Worker consumes events from Redis queue (queue name is fixed in code)
2. **Data Retrieval**: Fetches program data from database based on event
3. **Data Transformation**: Transforms database entities to Elasticsearch documents
4. **Index Update**: Updates Elasticsearch index with transformed data
5. **Status Update**: Marks job as completed or failed
6. **Retry Logic**: Failed jobs are retried with exponential backoff

## 📊 Elasticsearch Index Schema

The service manages an Elasticsearch index with the following mapping:

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "standard",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "description": { "type": "text", "analyzer": "standard" },
      "type": { "type": "keyword" },
      "language": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "createdAt": { "type": "date" },
      "updatedAt": { "type": "date" }
    }
  },
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}
```

## ⚙️ Configuration

### Redis Configuration

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Elasticsearch Configuration

```env
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
ELASTICSEARCH_INDEX_NAME=programs
```

## 🔒 Reliability Features

### Job Processing

- Concurrent job processing (concurrency is fixed in code)
- Job ordering and deduplication
- Dead letter queue for failed jobs
- Graceful shutdown handling

### Error Handling

- Exponential backoff for retries
- Detailed error logging
- Job failure tracking
- Recovery mechanisms

### Monitoring

- Job processing metrics (via logs)
- Queue depth monitoring (via Redis/BullMQ tools)
- Elasticsearch health checks (via logs)
- Performance monitoring (via logs)

## 📊 Monitoring

- Health check endpoint: (not implemented, background service)
- Job processing metrics (via logs)
- Queue depth monitoring (via Redis/BullMQ tools)
- Elasticsearch connection status (via logs)
- Error tracking and reporting (via logs)

## 🚀 Deployment

### Docker

```bash
# Build image
docker build --build-arg TARGET_APP=sync-worker -t thmanyah/sync-worker .

# Run container
docker run --env-file .env thmanyah/sync-worker
```

### Production

```bash
# Build for production
pnpm --filter sync-worker build

# Start production server
pnpm --filter sync-worker start:prod
```

## 🔧 Troubleshooting

### Common Issues

1. **Jobs not being processed**

   - Check Redis connectivity
   - Verify queue configuration (see code)
   - Check worker concurrency settings (see code)
   - Review job data format

2. **Elasticsearch errors**

   - Check Elasticsearch connectivity
   - Verify index exists and has correct mapping
   - Check authentication credentials
   - Review index settings

3. **Performance issues**
   - Monitor Elasticsearch and database performance
   - Review logs for slow operations

### Logs

The service provides detailed logging for:

- Job processing status
- Elasticsearch operations
- Error details
- Performance metrics

## 🤝 Contributing

1. Follow the project's coding standards
2. Add tests for new features
3. Update configuration documentation
4. Ensure all tests pass before submitting
5. Consider data consistency and performance implications

## 📄 License

This project is part of the Thmanyah backend system and is licensed under the MIT License.
