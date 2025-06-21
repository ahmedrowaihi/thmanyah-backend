# Testing Guide

This document describes the comprehensive testing strategy for the CMS API application.

## Test Types

### 1. Unit Tests (`src/**/*.spec.ts`)

- **Purpose**: Test individual functions, methods, and classes in isolation
- **Scope**: Single unit of code (service, controller, utility function)
- **Dependencies**: Mocked external dependencies
- **Speed**: Fast execution
- **Coverage**: Business logic, error handling, edge cases

**Run with**: `pnpm test:unit`

### 2. Integration Tests (`test/program.integration.spec.ts`)

- **Purpose**: Test component interactions with mocked dependencies
- **Scope**: Multiple components working together
- **Dependencies**: Mocked database, external services
- **Speed**: Medium execution
- **Coverage**: API endpoints, request/response flows, error scenarios

**Run with**: `pnpm test:integration`

### 3. Real Database Integration Tests (`test/program.integration.real.spec.ts`)

- **Purpose**: Test with real database transactions and constraints
- **Scope**: Database operations, transactions, rollbacks
- **Dependencies**: Real database connection
- **Speed**: Slower execution
- **Coverage**: Database constraints, transaction behavior, data persistence

**Run with**: `pnpm test:integration:real`

### 4. API Contract Tests (`test/api-contract.spec.ts`)

- **Purpose**: Validate API response structure and data types
- **Scope**: API contracts, response formats, status codes
- **Dependencies**: Real application with mocked data
- **Speed**: Medium execution
- **Coverage**: Response schemas, data validation, HTTP status codes

**Run with**: `pnpm test:contract`

### 5. Performance Tests (`test/performance.spec.ts`)

- **Purpose**: Validate performance requirements and load handling
- **Scope**: Response times, concurrent requests, memory usage
- **Dependencies**: Real application
- **Speed**: Variable execution time
- **Coverage**: Response time limits, load handling, memory leaks

**Run with**: `pnpm test:performance`

### 6. End-to-End Tests (`test/e2e.spec.ts`)

- **Purpose**: Test complete application flow with real infrastructure
- **Scope**: Full user workflows, data consistency
- **Dependencies**: Real database, real services
- **Speed**: Slow execution
- **Coverage**: Complete workflows, data integrity, real-world scenarios

**Run with**: `pnpm test:e2e:real`

## Running Tests

### Prerequisites

1. **Database**: Ensure your database is running and accessible
2. **Environment**: Set up proper environment variables
3. **Dependencies**: Install all dependencies with `pnpm install`

### Test Commands

```bash
# Run all tests
pnpm test

# Run specific test types
pnpm test:unit              # Unit tests only
pnpm test:integration       # Integration tests with mocks
pnpm test:integration:real  # Integration tests with real DB
pnpm test:contract          # API contract tests
pnpm test:performance       # Performance tests
pnpm test:e2e:real          # End-to-end tests

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch

# Run specific test file
pnpm test test/program.integration.spec.ts
```

### Test Environment Setup

#### For Real Database Tests

1. **Database Connection**: Ensure your test database is running
2. **Migrations**: Run database migrations: `pnpm migration:run`
3. **Test Data**: Some tests may require initial data setup

#### For Performance Tests

1. **Environment**: Use production-like environment
2. **Database**: Ensure sufficient test data
3. **Monitoring**: Monitor system resources during tests

## Test Coverage

### Current Coverage Targets

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

### Coverage Reports

- **Text**: Console output
- **HTML**: Detailed browser report
- **LCOV**: CI/CD integration

## Test Data Management

### Database Cleanup

- Tests automatically clean up data between runs
- Use `beforeEach` hooks for data setup
- Use `afterEach` hooks for cleanup

### Test Data Patterns

```typescript
// Create test data
const testProgram = {
  title: 'Test Program',
  description: 'Test Description',
  publishDate: '2024-01-15',
  type: 'podcast',
  language: 'en',
  tags: ['test'],
};

// Clean up after tests
beforeEach(async () => {
  await dataSource.query('DELETE FROM outbox');
  await dataSource.query('DELETE FROM program');
});
```

## Performance Benchmarks

### Response Time Targets

- **Health Check**: < 100ms
- **List Programs**: < 500ms
- **Get Single Program**: < 300ms
- **Create Program**: < 1000ms
- **Update Program**: < 800ms
- **Delete Program**: < 500ms

### Load Test Targets

- **Concurrent Requests**: 10 simultaneous requests
- **Bulk Operations**: 50 programs in < 5 seconds
- **Memory Usage**: < 10MB increase after 100 operations

## Best Practices

### Writing Tests

1. **Arrange-Act-Assert**: Structure tests clearly
2. **Descriptive Names**: Use clear test names
3. **Single Responsibility**: Test one thing per test
4. **Independent Tests**: Tests should not depend on each other
5. **Clean Setup/Teardown**: Always clean up test data

### Test Data

1. **Realistic Data**: Use realistic test data
2. **Edge Cases**: Test boundary conditions
3. **Error Scenarios**: Test error handling
4. **Data Consistency**: Verify data integrity

### Performance Testing

1. **Baseline Measurements**: Establish performance baselines
2. **Regression Detection**: Monitor for performance regressions
3. **Resource Monitoring**: Monitor CPU, memory, database connections
4. **Realistic Load**: Test with realistic data volumes

## Troubleshooting

### Common Issues

#### Database Connection Errors

```bash
# Check database status
docker-compose ps

# Restart database
docker-compose restart postgres

# Check connection settings
echo $DATABASE_URL
```

#### Test Timeout Errors

```bash
# Increase timeout for slow tests
jest --testTimeout=60000

# Run tests in sequence
jest --runInBand
```

#### Memory Issues

```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" pnpm test
```

### Debugging Tests

```bash
# Run with debug output
pnpm test:debug

# Run specific failing test
pnpm test --testNamePattern="should create program"

# Run with verbose output
jest --verbose
```

## CI/CD Integration

### GitHub Actions

Tests are automatically run on:

- Pull requests
- Push to main branch
- Scheduled runs

### Test Reports

- Coverage reports are generated automatically
- Performance benchmarks are tracked
- Test results are published to GitHub

## Contributing

When adding new features:

1. **Write Tests First**: Follow TDD principles
2. **Update Documentation**: Keep this guide current
3. **Maintain Coverage**: Ensure coverage targets are met
4. **Performance**: Consider performance implications
5. **Integration**: Test with real infrastructure when possible
