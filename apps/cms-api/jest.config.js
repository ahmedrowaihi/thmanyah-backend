module.exports = {
  displayName: 'cms-api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  maxWorkers: 1, // Run tests sequentially to avoid race conditions
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/cms-api',
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/test/**/*.spec.ts',
    '<rootDir>/test/**/*.integration.real.spec.ts',
    '<rootDir>/test/**/*.e2e.spec.ts',
    '<rootDir>/test/**/*.performance.spec.ts',
    '<rootDir>/test/**/*.api-contract.spec.ts',
  ],
  setupFilesAfterEnv: ['../../jest.setup.js'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@thmanyah/(.*)$': '<rootDir>/../../packages/$1/src',
  },
  testTimeout: 30000, // 30 seconds for integration tests
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.entity.ts',
    '!src/migrations/**',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
