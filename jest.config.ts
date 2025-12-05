import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  resolver: 'ts-jest-resolver',
  
  // Module path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@bundler/(.*)$': '<rootDir>/src/bundler/$1',
    '^@tests/(.*)$': '<rootDir>/__tests__/$1'
  },
  
  // TypeScript configuration
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: '<rootDir>/tsconfig.test.json'
    }]
  },
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.spec.ts',
    '**/src/**/*.test.ts',
    '**/src/**/*.spec.ts'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/types/**/*',
    '!src/**/*.interface.ts',
    '!src/**/*.type.ts'
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: [
    'text',
    'lcov',
    'clover',
    'html',
    'json'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/core/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // File patterns to ignore
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/__fixtures__/'
  ],
  
  // Setup and teardown
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setupTests.ts'
  ],
  
  // Environment configuration
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true
    }
  },
  
  // Test environment configuration
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Maximum number of concurrent tests
  maxConcurrency: 5,
  
  // Timeout configuration
  testTimeout: 10000,
  
  // Display test execution time
  slowTestThreshold: 5000
};

export default config;