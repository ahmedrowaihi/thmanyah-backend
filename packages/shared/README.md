# 📦 Thmanyah Shared Package

Common interfaces, types, DTOs, and utilities shared across all Thmanyah backend services.

## 🎯 Purpose

The shared package provides:

- Common data transfer objects (DTOs) for API requests/responses
- Shared interfaces for service contracts
- Type definitions for the entire system
- Utility types and constants
- Model definitions for data structures

## 📦 Package Contents

### DTOs (Data Transfer Objects)

#### Program DTOs

- `CreateProgramDto` - For creating new programs
- `UpdateProgramDto` - For updating existing programs
- `ProgramResponseDto` - Standard program response format
- `BulkCreateProgramDto` - For bulk program creation
- `BulkDeleteProgramDto` - For bulk program deletion
- `BulkResponseDto` - Standard bulk operation response

#### Search DTOs

- `SearchProgramDto` - Search parameters and filters
- `SearchResponseDto` - Standardized search response format

#### Common DTOs

- `PaginationDto` - Pagination parameters
- `ApiResponseDto` - Standard API response wrapper

### Interfaces

#### Service Interfaces

- `ProgramService` - Program management service contract
- `SearchService` - Search functionality service contract
- `ElasticsearchService` - Elasticsearch operations contract
- `OutboxService` - Outbox pattern service contract
- `QueueService` - Queue operations contract

#### Common Interfaces

- `ApiResponse` - Standard API response interface
- `SearchResult` - Search result interface
- `PaginationMeta` - Pagination metadata interface

### Models

#### Data Models

- `Program` - Program entity model
- `Outbox` - Outbox event model

### Types

#### Job Types

- `JobTypes` - Queue job type definitions
- `JobData` - Job data type definitions

#### Token Types

- `Tokens` - Dependency injection token definitions

## 🚀 Usage

### Installation

The package is automatically available in the monorepo workspace:

```bash
# No additional installation needed in monorepo
# Package is available via workspace dependencies
```

### Importing

```typescript
// Import DTOs
import { CreateProgramDto, ProgramResponseDto } from "@thmanyah/shared";

// Import interfaces
import { ProgramService, SearchService } from "@thmanyah/shared";

// Import types
import { JobTypes, Tokens } from "@thmanyah/shared";

// Import models
import { Program, Outbox } from "@thmanyah/shared";
```

### Example Usage

#### Using DTOs in Controllers

```typescript
import { Controller, Post, Body } from "@nestjs/common";
import { CreateProgramDto, ProgramResponseDto } from "@thmanyah/shared";

@Controller("programs")
export class ProgramController {
  @Post()
  async createProgram(
    @Body() createProgramDto: CreateProgramDto
  ): Promise<ProgramResponseDto> {
    // Implementation
  }
}
```

#### Using Service Interfaces

```typescript
import { Injectable } from "@nestjs/common";
import { ProgramService, Program, CreateProgramDto } from "@thmanyah/shared";

@Injectable()
export class ProgramServiceImpl implements ProgramService {
  async createProgram(dto: CreateProgramDto): Promise<Program> {
    // Implementation
  }
}
```

#### Using Job Types

```typescript
import { JobTypes } from "@thmanyah/shared";

// Define job data types
type SyncProgramJob = {
  type: JobTypes.SYNC_PROGRAM;
  data: {
    programId: string;
    action: "create" | "update" | "delete";
  };
};
```

## 📋 API Reference

### DTOs

#### CreateProgramDto

```typescript
interface CreateProgramDto {
  title: string;
  description?: string;
  category: string;
  duration: number;
  language: string;
  tags?: string[];
}
```

#### UpdateProgramDto

```typescript
interface UpdateProgramDto {
  title?: string;
  description?: string;
  category?: string;
  duration?: number;
  language?: string;
  tags?: string[];
}
```

#### ProgramResponseDto

```typescript
interface ProgramResponseDto {
  id: string;
  title: string;
  description?: string;
  category: string;
  duration: number;
  language: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### SearchProgramDto

```typescript
interface SearchProgramDto {
  query?: string;
  category?: string;
  language?: string;
  minDuration?: number;
  maxDuration?: number;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: "relevance" | "title" | "createdAt" | "duration";
  sortOrder?: "asc" | "desc";
}
```

### Interfaces

#### ProgramService

```typescript
interface ProgramService {
  createProgram(dto: CreateProgramDto): Promise<Program>;
  updateProgram(id: string, dto: UpdateProgramDto): Promise<Program>;
  deleteProgram(id: string): Promise<void>;
  getProgram(id: string): Promise<Program>;
  bulkCreatePrograms(dto: BulkCreateProgramDto): Promise<BulkResponseDto>;
  bulkDeletePrograms(dto: BulkDeleteProgramDto): Promise<BulkResponseDto>;
}
```

#### SearchService

```typescript
interface SearchService {
  searchPrograms(dto: SearchProgramDto): Promise<SearchResponseDto>;
  getSearchSuggestions(query: string): Promise<string[]>;
  getSearchFacets(): Promise<Record<string, string[]>>;
}
```

### Types

#### JobTypes

```typescript
enum JobTypes {
  SYNC_PROGRAM = "sync-program",
  INDEX_PROGRAM = "index-program",
  DELETE_PROGRAM = "delete-program",
}
```

#### Tokens

```typescript
enum Tokens {
  PROGRAM_SERVICE = "PROGRAM_SERVICE",
  SEARCH_SERVICE = "SEARCH_SERVICE",
  ELASTICSEARCH_SERVICE = "ELASTICSEARCH_SERVICE",
  OUTBOX_SERVICE = "OUTBOX_SERVICE",
  QUEUE_SERVICE = "QUEUE_SERVICE",
}
```

## 🔧 Development

### Building

```bash
# Build the shared package
pnpm --filter @thmanyah/shared build

# Watch mode
pnpm --filter @thmanyah/shared build:watch
```

### Testing

```bash
# Run tests
pnpm --filter @thmanyah/shared test

# Test coverage
pnpm --filter @thmanyah/shared test:cov
```

### Linting

```bash
# Run ESLint
pnpm --filter @thmanyah/shared lint

# Fix ESLint issues
pnpm --filter @thmanyah/shared lint:fix
```

## 📁 File Structure

```
packages/shared/
├── src/
│   ├── dto/                    # Data Transfer Objects
│   │   ├── bulk/              # Bulk operation DTOs
│   │   ├── common/            # Common DTOs (pagination, etc.)
│   │   ├── program/           # Program-related DTOs
│   │   └── search/            # Search-related DTOs
│   ├── interfaces/            # Service and common interfaces
│   │   ├── common/            # Common interfaces
│   │   └── services/          # Service contracts
│   ├── models/                # Data models
│   ├── types/                 # Type definitions
│   └── index.ts               # Main export file
├── package.json
└── tsconfig.json
```

## 🔄 Versioning

This package follows semantic versioning:

- **Major version**: Breaking changes to interfaces or DTOs
- **Minor version**: New features (new DTOs, interfaces, types)
- **Patch version**: Bug fixes and documentation updates

## 🤝 Contributing

When contributing to the shared package:

1. **Backward Compatibility**: Avoid breaking changes to existing interfaces
2. **Type Safety**: Ensure all types are properly defined
3. **Documentation**: Update this README when adding new exports
4. **Testing**: Add tests for new DTOs and interfaces
5. **Validation**: Use class-validator decorators for DTOs

### Adding New DTOs

```typescript
// Example: Adding a new DTO
import { IsString, IsOptional, IsNumber } from "class-validator";

export class NewFeatureDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  value?: number;
}
```

### Adding New Interfaces

```typescript
// Example: Adding a new service interface
export interface NewService {
  doSomething(input: string): Promise<string>;
}
```

## 📄 License

This package is part of the Thmanyah backend system and is licensed under the MIT License.
