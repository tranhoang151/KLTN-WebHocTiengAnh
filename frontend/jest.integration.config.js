const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',

    // Test file patterns for integration tests
    testMatch: [
        '<rootDir>/src/__tests__/integration/**/*.test.{ts,tsx}'
    ],

    // Setup files
    setupFilesAfterEnv: [
        '<rootDir>/src/setupTests.ts'
    ],

    // Module name mapping for TypeScript paths
    moduleNameMapper: {
        ...pathsToModuleNameMapper(compilerOptions.paths || {}, {
            prefix: '<rootDir>/'
        }),
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
    },

    // Transform configuration
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest'
    },

    // Module file extensions
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

    // Coverage configuration
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/index.tsx',
        '!src/reportWebVitals.ts',
        '!src/__tests__/**/*',
        '!src/**/*.stories.{ts,tsx}'
    ],

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },

    // Test timeout for integration tests (longer than unit tests)
    testTimeout: 30000,

    // Global setup and teardown
    globalSetup: '<rootDir>/src/__tests__/integration/globalSetup.ts',
    globalTeardown: '<rootDir>/src/__tests__/integration/globalTeardown.ts',

    // Environment variables for testing
    testEnvironmentOptions: {
        url: 'http://localhost:3000'
    },

    // Verbose output for integration tests
    verbose: true,

    // Clear mocks between tests
    clearMocks: true,

    // Restore mocks after each test
    restoreMocks: true
};