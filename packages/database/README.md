# 🗄️ Thmanyah Database Package

Database layer for the Thmanyah backend system, providing TypeORM entities, migrations, and database services.

## 🎯 Purpose

The database package provides:

- TypeORM entities for data modeling
- Database migrations for schema management
- Database services for data access
- Connection configuration and management
- CLI tools for database operations

## 📦 Package Contents

### Entities

- `Program` - Media program entity
- `Outbox` - Outbox pattern event entity

### Migrations

- Database schema migrations
- Migration generation tools
- Migration rollback capabilities

### Services

- `OutboxService` - Outbox pattern implementation
- Database connection management
- Transaction handling

### Configuration

- TypeORM configuration
- CLI data source configuration
- Environment-based settings

## 🚀 Usage

### Installation

The package is automatically available in the monorepo workspace:

```bash
# No additional installation needed in monorepo
# Package is available via workspace dependencies
```

### Importing

```typescript
// Import entities
import { Program, Outbox } from "@thmanyah/database";

// Import services
import { OutboxService } from "@thmanyah/database";

// Import database module
import { DatabaseModule } from "@thmanyah/database";
```

### Example Usage

#### Using Entities

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Program } from "@thmanyah/database";

// Program entity is already defined
const program = new Program();
program.title = "My Podcast";
program.description = "A great podcast";
program.category = "Technology";
program.duration = 3600; // 1 hour in seconds
program.language = "en";
program.tags = ["tech", "podcast"];
```

#### Using Database Module

```typescript
import { Module } from "@nestjs/common";
import { DatabaseModule } from "@thmanyah/database";

@Module({
  imports: [DatabaseModule],
  // ... other module configuration
})
export class AppModule {}
```

#### Using Outbox Service

```typescript
import { Injectable } from "@nestjs/common";
import { OutboxService } from "@thmanyah/database";

@Injectable()
export class ProgramService {
  constructor(private readonly outboxService: OutboxService) {}

  async createProgram(programData: CreateProgramDto): Promise<Program> {
    // Create program in transaction
    return await this.dataSource.transaction(async (manager) => {
      const program = manager.create(Program, programData);
      const savedProgram = await manager.save(program);

      // Create outbox event
      await this.outboxService.createEvent(
        {
          aggregateId: savedProgram.id,
          aggregateType: "Program",
          eventType: "ProgramCreated",
          eventData: savedProgram,
        },
        manager
      );

      return savedProgram;
    });
  }
}
```

## 📋 API Reference

### Entities

#### Program Entity

```typescript
@Entity("programs")
export class Program {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "timestamp" })
  publishDate: Date;

  @Column()
  type: string;

  @Column()
  language: string;

  @Column({ type: "text", array: true })
  tags: string[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
```

#### Outbox Entity

```typescript
@Entity("outbox")
export class Outbox {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  eventType: string;

  @Column({ type: "jsonb" })
  payload: any;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @Column({ default: false })
  processed: boolean;
}
```

### Services

#### OutboxService

```typescript
interface OutboxService {
  createEvent(
    event: CreateOutboxEventDto,
    manager?: EntityManager
  ): Promise<Outbox>;
  getUnprocessedEvents(limit?: number): Promise<Outbox[]>;
  markAsProcessed(id: string, manager?: EntityManager): Promise<void>;
  incrementRetryCount(id: string, errorMessage?: string): Promise<void>;
  getFailedEvents(): Promise<Outbox[]>;
}
```

## 🔧 Database Operations

### Migrations

```bash
# Generate a new migration
pnpm --filter @thmanyah/database migration:generate -- -n MigrationName

# Run migrations
pnpm --filter @thmanyah/database migration:run

# Revert last migration
pnpm --filter @thmanyah/database migration:revert

# Show migration status
pnpm --filter @thmanyah/database migration:show
```

### Schema Operations

```bash
# Sync schema (development only)
pnpm --filter @thmanyah/database schema:sync

# Drop schema
pnpm --filter @thmanyah/database schema:drop

# Log schema
pnpm --filter @thmanyah/database schema:log
```

### CLI Operations

```bash
# Run TypeORM CLI commands
pnpm --filter @thmanyah/database typeorm --help

# Query database
pnpm --filter @thmanyah/database query "SELECT * FROM programs"

# Seed database
pnpm --filter @thmanyah/database seed
```

## 📊 Database Schema

### Programs Table

```sql
CREATE TABLE programs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  publish_date TIMESTAMP NOT NULL,
  type VARCHAR(255) NOT NULL,
  language VARCHAR(255) NOT NULL,
  tags TEXT[] NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Outbox Table

```sql
CREATE TABLE outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(255) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processed BOOLEAN NOT NULL DEFAULT FALSE
);
```

## ⚙️ Configuration

### Environment Variables

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=thmanyah

# TypeORM Configuration
TYPEORM_LOGGING=true
TYPEORM_SYNCHRONIZE=false
TYPEORM_MIGRATIONS_RUN=true
```

### TypeORM Configuration

```typescript
// typeorm.config.ts
export default {
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [Program, Outbox],
  migrations: ["src/migrations/*.ts"],
  synchronize: false,
  logging: process.env.TYPEORM_LOGGING === "true",
  migrationsRun: process.env.TYPEORM_MIGRATIONS_RUN === "true",
};
```

## 🔧 Development

### Building

```bash
# Build the database package
pnpm --filter @thmanyah/database build

# Watch mode
pnpm --filter @thmanyah/database build:watch
```

### Testing

```bash
# Run tests
pnpm --filter @thmanyah/database test

# Test coverage
pnpm --filter @thmanyah/database test:cov

# E2E tests
pnpm --filter @thmanyah/database test:e2e
```

### Linting

```bash
# Run ESLint
pnpm --filter @thmanyah/database lint

# Fix ESLint issues
pnpm --filter @thmanyah/database lint:fix
```

## 📁 File Structure

```
packages/database/
├── src/
│   ├── entities/              # TypeORM entities
│   │   ├── index.ts
│   │   ├── program.entity.ts
│   │   └── outbox.entity.ts
│   ├── migrations/            # Database migrations
│   │   └── 1750537322316-InitialMigration.ts
│   ├── services/              # Database services
│   │   ├── index.ts
│   │   └── outbox.service.ts
│   ├── cli-data-source.ts     # CLI data source
│   ├── database.module.ts     # NestJS module
│   ├── typeorm.config.ts      # TypeORM configuration
│   └── index.ts               # Main export file
├── test/                      # Tests
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 🔒 Security Considerations

- Use parameterized queries to prevent SQL injection
- Implement proper access controls
- Use database transactions for data consistency
- Validate all input data
- Use environment variables for sensitive configuration
- Implement proper error handling

## 🚀 Performance Optimization

- Use appropriate indexes for query patterns
- Implement connection pooling
- Use database transactions efficiently
- Monitor query performance
- Implement caching where appropriate
- Use bulk operations for large datasets

## 🔧 Troubleshooting

### Common Issues

1. **Connection Issues**

   - Check database credentials
   - Verify database is running
   - Check network connectivity
   - Review connection pool settings

2. **Migration Issues**

   - Ensure migrations are in correct order
   - Check for conflicting schema changes
   - Verify migration files are properly formatted
   - Review database permissions

3. **Performance Issues**
   - Check query execution plans
   - Review index usage
   - Monitor connection pool usage
   - Analyze slow queries

### Debugging

```bash
# Enable TypeORM logging
TYPEORM_LOGGING=true

# Check database connection
pnpm --filter @thmanyah/database query "SELECT 1"

# View migration status
pnpm --filter @thmanyah/database migration:show
```

## 🤝 Contributing

When contributing to the database package:

1. **Schema Changes**: Always create migrations for schema changes
2. **Data Integrity**: Use transactions for multi-step operations
3. **Performance**: Consider query performance and indexing
4. **Testing**: Add tests for new entities and services
5. **Documentation**: Update this README for new features

### Adding New Entities

```typescript
// Example: Adding a new entity
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("new_entities")
export class NewEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Creating Migrations

```bash
# Generate migration for schema changes
pnpm --filter @thmanyah/database migration:generate -- -n AddNewEntity

# Review generated migration
# Edit migration file if needed

# Run migration
pnpm --filter @thmanyah/database migration:run
```

## 📄 License

This package is part of the Thmanyah backend system and is licensed under the MIT License.
