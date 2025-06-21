module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.base.json" }],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageReporters: ["text", "lcov", "html"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/*.entity.ts",
    "!src/migrations/**",
    "!src/**/*.spec.ts",
    "!src/**/*.test.ts",
  ],
  testMatch: ["<rootDir>/src/**/*.spec.ts", "<rootDir>/src/**/*.test.ts"],
};
