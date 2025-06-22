# 🔍 Thmanyah Discovery API

Public search and discovery API for finding and exploring media content (podcasts, documentaries, etc.) in the Thmanyah platform.

## 🎯 Purpose

The Discovery API serves as the public-facing search interface that allows users to:

- Search for programs using full-text search
- Filter and sort search results
- Discover new content through recommendations
- Access program metadata and details
- Browse content with pagination support

## 🏗️ Architecture

This service is part of the Thmanyah microservices architecture:

```
Discovery API → Elasticsearch → Search Results
```

The Discovery API is read-only and serves content that has been indexed by the Sync Worker from the CMS API.

## 🛠️ Tech Stack

- **Framework**: NestJS + TypeScript
- **Search Engine**: Elasticsearch
- **Validation**: Class-validator + Class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

## 📋 Features

### Search Capabilities

- ✅ Full-text search across program content
- ✅ Advanced filtering (category, duration, language, etc.)
- ✅ Sorting options (relevance, date, title, etc.)
- ✅ Pagination and result limiting
- ✅ Search suggestions and autocomplete
- ✅ Faceted search results

### API Endpoints

#### Search

- `GET /search` - Search programs with filters
- `GET /search/suggest` - Get search suggestions
- `GET /search/facets` - Get available search facets

#### Programs

- `GET /programs/:id` - Get program details by ID
- `GET /programs` - List programs with pagination

#### Health

- `GET /health` - Service health check

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Elasticsearch instance
- Environment variables configured

### Development

```bash
# Install dependencies (from root)
pnpm install

# Start in development mode
pnpm --filter discovery-api dev

# Or from the app directory
cd apps/discovery-api
pnpm dev
```

### Environment Variables

Required environment variables (see root `.env.example`):

```env
# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme
ELASTICSEARCH_INDEX_NAME=programs

# API Configuration
DISCOVERY_API_PORT=3002
NODE_ENV=development

# Optional: CORS
CORS_ORIGINS=http://localhost:3000
```

## 📚 API Documentation

Once running, access the Swagger documentation at:

**http://localhost:3002/api**

## 🧪 Testing

```bash
# Unit tests
pnpm --filter discovery-api test

# E2E tests
pnpm --filter discovery-api test:e2e

# Test coverage
pnpm --filter discovery-api test:cov

# Watch mode
pnpm --filter discovery-api test:watch
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
apps/discovery-api/
├── src/
│   ├── app.module.ts           # Main application module
│   ├── main.ts                 # Application entry point
│   ├── common/                 # Shared utilities
│   │   └── filters/            # Exception filters
│   ├── health/                 # Health check endpoints
│   └── search/                 # Search functionality
│       ├── search.controller.ts
│       ├── search.service.ts
│       ├── search.module.ts
│       ├── dto/                # Data transfer objects
│       ├── services/           # Business logic services
│       └── utils/              # Utility functions
├── test/                       # E2E tests
└── package.json
```

## 🔄 Data Flow

1. **Content Indexing**: Sync Worker indexes programs from database to Elasticsearch
2. **Search Requests**: Users query Discovery API with search parameters
3. **Elasticsearch Query**: API translates requests to Elasticsearch queries
4. **Result Processing**: Results are transformed and returned to users
5. **Caching**: Frequently accessed data may be cached for performance

## 🔍 Search Features

### Query Types

- **Full-text search**: Search across title, description, and content
- **Exact match**: Search for specific terms or phrases
- **Fuzzy search**: Handle typos and variations
- **Wildcard search**: Use \* and ? for pattern matching

### Filters

- **Type**: Filter by program type
- **Language**: Filter by program language
- **Tags**: Filter by tags
- **Date range**: Filter by creation/update dates

### Sorting

- **Relevance**: Default sorting by search relevance
- **Date**: Sort by creation or update date
- **Title**: Sort alphabetically by title

## 🔒 Security

- Input validation and sanitization
- Rate limiting to prevent abuse
- CORS configuration for frontend access
- Request/response logging
- Error handling with proper HTTP status codes

## 📊 Monitoring

- Health check endpoint: `GET /health`
- Elasticsearch connection monitoring
- Search performance metrics
- Request/response logging via interceptors
- Error tracking and reporting

## 🚀 Deployment

### Docker

```bash
# Build image
docker build --build-arg TARGET_APP=discovery-api -t thmanyah/discovery-api .

# Run container
docker run -p 3002:3002 --env-file .env thmanyah/discovery-api
```

### Production

```bash
# Build for production
pnpm --filter discovery-api build

# Start production server
pnpm --filter discovery-api start:prod
```

## 🔧 Configuration

### Elasticsearch Index

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

### Performance Tuning

- Configure Elasticsearch for optimal search performance
- Implement caching for frequently accessed data
- Use connection pooling for Elasticsearch
- Monitor and optimize query performance

## 🤝 Contributing

1. Follow the project's coding standards
2. Add tests for new search features
3. Update API documentation
4. Ensure all tests pass before submitting
5. Consider search performance implications

## 📄 License

This project is part of the Thmanyah backend system and is licensed under the MIT License.
