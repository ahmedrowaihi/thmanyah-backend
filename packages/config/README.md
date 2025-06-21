# Configuration Package

This package provides centralized configuration management for the Thmanyah backend applications with environment-specific validation and sensible defaults.

## Environment Variables

The application uses environment variables for configuration with different requirements based on the environment.

### Environment-Specific Requirements

#### Development Environment (`NODE_ENV=development`)

**Required:**

- `NODE_ENV` - Must be set to "development"

**Recommended (with defaults):**

- `DATABASE_HOST` - Database host (default: "localhost")
- `DATABASE_PORT` - Database port (default: "5432")
- `DATABASE_USERNAME` - Database username (default: "postgres")
- `DATABASE_PASSWORD` - Database password (default: "password")
- `DATABASE_NAME` - Database name (default: "thmanyah")

**Optional (with defaults):**

- `REDIS_HOST` - Redis host (default: "localhost")
- `REDIS_PORT` - Redis port (default: "6379")
- `REDIS_PASSWORD` - Redis password (optional)
- `ELASTICSEARCH_URL` - Elasticsearch URL (default: "http://localhost:9200")
- `ELASTICSEARCH_USERNAME` - Elasticsearch username (default: "elastic")
- `ELASTICSEARCH_PASSWORD` - Elasticsearch password (default: "changeme")
- `ELASTICSEARCH_INDEX_NAME` - Elasticsearch index name (default: "programs")
- `CMS_API_PORT` - CMS API port (default: "3001")
- `DISCOVERY_API_PORT` - Discovery API port (default: "3002")

#### Test Environment (`NODE_ENV=test`)

**Required:**

- `NODE_ENV` - Must be set to "test"

**Recommended (with defaults):**

- `DATABASE_HOST` - Database host (default: "localhost")
- `DATABASE_PORT` - Database port (default: "5432")
- `DATABASE_USERNAME` - Database username (default: "postgres")
- `DATABASE_PASSWORD` - Database password (default: "password")
- `DATABASE_NAME` - Database name (default: "thmanyah")

**Optional (with defaults):**

- All other variables have the same defaults as development

#### Production Environment (`NODE_ENV=production`)

**Required (no defaults):**

- `NODE_ENV` - Must be set to "production"
- `DATABASE_HOST` - Database host
- `DATABASE_PORT` - Database port
- `DATABASE_USERNAME` - Database username
- `DATABASE_PASSWORD` - Database password
- `DATABASE_NAME` - Database name
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port
- `ELASTICSEARCH_URL` - Elasticsearch URL

**Recommended:**

- `REDIS_PASSWORD` - Redis password
- `ELASTICSEARCH_USERNAME` - Elasticsearch username
- `ELASTICSEARCH_PASSWORD` - Elasticsearch password

**Optional:**

- `ELASTICSEARCH_INDEX_NAME` - Elasticsearch index name (default: "programs")
- `CMS_API_PORT` - CMS API port (default: "3001")
- `DISCOVERY_API_PORT` - Discovery API port (default: "3002")

## Usage

```typescript
import { config } from "@thmanyah/config";

// Access configuration values
console.log(config.DATABASE_HOST);
console.log(config.NODE_ENV);
```

## Validation

The configuration system automatically validates environment variables on startup:

1. **Required variables** - Application will exit if missing in production
2. **Recommended variables** - Warning will be shown if missing
3. **Production warnings** - Warnings for insecure defaults in production
4. **Configuration summary** - Logs current configuration on startup

## Example .env Files

### Development (.env.development)

```env
NODE_ENV=development
# Optional: Override defaults
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=thmanyah
```

### Test (.env.test)

```env
NODE_ENV=test
# Use defaults for testing
```

### Production (.env.production)

```env
NODE_ENV=production
DATABASE_HOST=your-production-db-host
DATABASE_PORT=5432
DATABASE_USERNAME=your-db-user
DATABASE_PASSWORD=your-secure-password
DATABASE_NAME=thmanyah_prod
REDIS_HOST=your-redis-host
REDIS_PORT=6379
ELASTICSEARCH_URL=https://your-elasticsearch-host:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your-secure-password
```

## Security Considerations

- **Never commit .env files** to version control
- **Use strong passwords** in production
- **Avoid localhost URLs** in production
- **Set appropriate CORS origins** in production
- **Configure rate limiting** for production APIs

## Error Handling

The configuration system provides clear error messages:

- ❌ **Missing required variables** - Application exits with detailed error
- ⚠️ **Missing recommended variables** - Warning shown, defaults used
- ⚠️ **Production warnings** - Security warnings for production config
- 🔧 **Configuration summary** - Shows current configuration on startup
