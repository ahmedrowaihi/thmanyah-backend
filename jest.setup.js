// Global test setup
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set environment variables for tests to match Docker containers
process.env.NODE_ENV = "test";
process.env.DATABASE_HOST = "localhost";
process.env.DATABASE_PORT = "5432";
process.env.DATABASE_USERNAME = "postgres";
process.env.DATABASE_PASSWORD = "password";
process.env.DATABASE_NAME = "thmanyah";
process.env.ELASTICSEARCH_URL = "http://localhost:9200";
process.env.REDIS_HOST = "localhost";
process.env.REDIS_PORT = "6379";
