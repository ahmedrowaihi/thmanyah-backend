# 🎛️ Thmanyah CMS API

Internal Content Management System API for creating, updating, and managing media content (podcasts, documentaries, etc.) in the Thmanyah platform.

## 🎯 Purpose

The CMS API serves as the internal administrative interface for content editors and administrators to:

- Create and manage program content
- Update program metadata and details
- Handle bulk operations for content management
- Provide administrative endpoints for content curation

## 🏗️ Architecture

This service is part of the Thmanyah microservices architecture:

```
CMS API → Database (PostgreSQL) → Outbox Table → Outbox Publisher → Queue → Sync Worker → Elasticsearch
```

## 🛠️ Tech Stack

- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL + TypeORM
- **Validation**: Class-validator + Class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

## 📋 Features

### Program Management

- ✅ Create new programs with metadata (title, description, publishDate, type, language, tags)
- ✅ Update existing program details
- ✅ Delete programs (soft delete)
- ✅ Bulk create/update/delete operations
- ✅ Program validation and sanitization

### API Endpoints

#### Programs

- `POST /programs` - Create a new program
- `GET /programs/:id` - Get program by ID
- `PUT /programs/:id` - Update program
- `DELETE /programs/:id` - Delete program
- `POST /programs/bulk` - Bulk operations

#### Health

- `GET /health` - Service health check

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis (for queue operations)
- Environment variables configured

### Development

```bash
# Install dependencies (from root)
pnpm install

# Start in development mode
pnpm --filter cms-api dev

# Or from the app directory
cd apps/cms-api
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

# Redis (for queue)
REDIS_HOST=localhost
REDIS_PORT=6379

# API Configuration
CMS_API_PORT=3001
NODE_ENV=development
```

## 📚 API Documentation

Once running, access the Swagger documentation at:

**http://localhost:3001/api**

## 🧪 Testing

```bash
# Unit tests
pnpm --filter cms-api test

# E2E tests
pnpm --filter cms-api test:e2e

# Test coverage
pnpm --filter cms-api test:cov

# Watch mode
pnpm --filter cms-api test:watch
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
apps/cms-api/
├── src/
│   ├── app.module.ts           # Main application module
│   ├── main.ts                 # Application entry point
│   ├── common/                 # Shared utilities
│   │   ├── filters/            # Exception filters
│   │   └── interceptors/       # Request/response interceptors
│   ├── health/                 # Health check endpoints
│   └── program/                # Program management
│       ├── program.controller.ts
│       ├── program.service.ts
│       ├── program.module.ts
│       └── mappers/            # Data transformation
├── test/                       # E2E tests
└── package.json
```

## 🔄 Data Flow

1. **Content Creation**: Editors use CMS API to create/update programs (fields: title, description, publishDate, type, language, tags)
2. **Database Storage**: Changes are saved to PostgreSQL
3. **Outbox Pattern**: Changes trigger outbox events for eventual consistency
4. **Queue Processing**: Outbox Publisher picks up events and queues them
5. **Search Indexing**: Sync Worker processes queue and updates Elasticsearch

## 🔒 Security

- Input validation and sanitization
- Rate limiting
- CORS configuration
- Request/response logging
- Error handling with proper HTTP status codes

## 📊 Monitoring

- Health check endpoint: `GET /health`
- Request/response logging via interceptors
- Error tracking and reporting
- Performance metrics

## 🚀 Deployment

### Docker

```bash
# Build image
docker build --build-arg TARGET_APP=cms-api -t thmanyah/cms-api .

# Run container
docker run -p 3001:3001 --env-file .env thmanyah/cms-api
```

### Production

```bash
# Build for production
pnpm --filter cms-api build

# Start production server
pnpm --filter cms-api start:prod
```

## 🤝 Contributing

1. Follow the project's coding standards
2. Add tests for new features
3. Update API documentation
4. Ensure all tests pass before submitting

## 📄 License

This project is part of the Thmanyah backend system and is licensed under the MIT License.
