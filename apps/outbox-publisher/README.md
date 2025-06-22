# 📤 Thmanyah Outbox Publisher

Background service that implements the Outbox Pattern to ensure reliable event publishing for the Thmanyah platform.

## 🎯 Purpose

The Outbox Publisher service is responsible for:

- Polling the database outbox table for pending events
- Publishing events to the message queue (Redis/BullMQ)
- Ensuring reliable event delivery with retry mechanisms
- Maintaining eventual consistency across microservices
- Handling event ordering and deduplication

## 🏗️ Architecture

This service is part of the Thmanyah microservices architecture:

```
CMS API → Database (Outbox Table) → Outbox Publisher → Redis Queue → Sync Worker
```

The Outbox Publisher implements the [Outbox Pattern](https://microservices.io/patterns/data/transactional-outbox.html) to ensure reliable event publishing.

## 🛠️ Tech Stack

- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL + TypeORM
- **Queue**: Redis + BullMQ
- **Scheduling**: Node-cron
- **Testing**: Jest

## 📋 Features

### Event Publishing

- ✅ Polls outbox table every 5 seconds (interval is fixed in code and not configurable)
- ✅ Publishes events to Redis queue
- ✅ Handles event ordering and deduplication
- ✅ Implements retry mechanisms for failed publishes
- ✅ Marks events as processed after successful publishing

### Reliability Features

- ✅ Transactional event publishing
- ✅ Dead letter queue for failed events
- ✅ Event replay capabilities
- ✅ Monitoring and alerting
- ✅ Graceful shutdown handling

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database with outbox table
- Redis instance
- Environment variables configured (see below)

### Development

```bash
# Install dependencies (from root)
pnpm install

# Start in development mode
pnpm --filter outbox-publisher dev

# Or from the app directory
cd apps/outbox-publisher
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

# Node environment
NODE_ENV=development
```

## 🧪 Testing

```bash
# Unit tests
pnpm --filter outbox-publisher test

# E2E tests
pnpm --filter outbox-publisher test:e2e

# Test coverage
pnpm --filter outbox-publisher test:cov

# Watch mode
pnpm --filter outbox-publisher test:watch
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
apps/outbox-publisher/
├── src/
│   ├── app.module.ts           # Main application module
│   ├── main.ts                 # Application entry point
│   ├── common/                 # Shared utilities
│   └── outbox-publisher/       # Outbox publishing logic
│       ├── outbox-publisher.service.ts
│       └── outbox-publisher.service.spec.ts
├── test/                       # E2E tests
└── package.json
```

## 🔄 Data Flow

1. **Event Creation**: CMS API creates events in the outbox table
2. **Polling**: Outbox Publisher polls the outbox table every 5 seconds
3. **Event Processing**: Unprocessed events are retrieved in batches
4. **Queue Publishing**: Events are published to Redis queue
5. **Status Update**: Successfully published events are marked as processed
6. **Retry Logic**: Failed events are retried with exponential backoff

## 📊 Outbox Table Schema

The service expects an outbox table with the following structure:

```sql
CREATE TABLE outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eventType VARCHAR NOT NULL,
  payload JSONB NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);
```

## ⚙️ Configuration

### Redis Configuration

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## 🔒 Reliability Features

### Event Ordering

- Events are processed in chronological order
- Aggregate-level ordering is maintained
- Concurrent processing is handled safely

### Retry Mechanism

- Exponential backoff for failed events
- Configurable retry limits (see code)
- Dead letter queue for permanently failed events

### Monitoring

- Event processing metrics
- Queue depth monitoring
- Error rate tracking
- Performance monitoring

## 📊 Monitoring

- Health check endpoint: (not implemented, background service)
- Event processing metrics (via logs)
- Queue depth monitoring (via Redis/BullMQ tools)
- Error tracking and reporting (via logs)
- Performance metrics (via logs)

## 🚀 Deployment

### Docker

```bash
# Build image
docker build --build-arg TARGET_APP=outbox-publisher -t thmanyah/outbox-publisher .

# Run container
docker run --env-file .env thmanyah/outbox-publisher
```

### Production

```bash
# Build for production
pnpm --filter outbox-publisher build

# Start production server
pnpm --filter outbox-publisher start:prod
```

## 🔧 Troubleshooting

### Common Issues

1. **Events not being processed**

   - Check database connectivity
   - Verify outbox table exists and has correct schema
   - Check Redis connectivity
   - Review logs for errors

2. **High error rates**

   - Check event data format
   - Verify queue configuration
   - Review retry settings in code
   - Check for network issues

3. **Performance issues**
   - Monitor database and Redis performance
   - Review logs for slow operations

### Logs

The service provides detailed logging for:

- Event processing status
- Error details
- Performance metrics
- Configuration validation

## 🤝 Contributing

1. Follow the project's coding standards
2. Add tests for new features
3. Update configuration documentation
4. Ensure all tests pass before submitting
5. Consider reliability and performance implications

## 📄 License

This project is part of the Thmanyah backend system and is licensed under the MIT License.
