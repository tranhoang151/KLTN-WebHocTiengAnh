module.exports = {
    // Use Create React App's Jest configuration as base
    ...require('react-scripts/scripts/utils/createJestConfig')(
        (filePath) => filePath.replace('<rootDir>', __dirname)
    ),

    // Coverage configuration
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/index.tsx',
        '!src/serviceWorker.ts',
        '!src/reportWebVitals.ts',
        '!src/**/*.stories.{js,jsx,ts,tsx}',
        '!src/**/*.test.{js,jsx,ts,tsx}',
        '!src/**/*.spec.{js,jsx,ts,tsx}',
        '!src/setupTests.ts'
    ],

    coverageDirectory: 'coverage',

    coverageReporters: [
        'text',
        'text-summary',
        'html',
        'lcov',
        'json-summary'
    ],

    coverageThreshold: {
        global: {
            branches: 75,
            functions: 80,
            lines: 80,
            statements: 80
        }
    },

    // Test environment
    testEnvironment: 'jsdom',

    // Setup files
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],

    // Module name mapping for CSS and other assets
    moduleNameMapping: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js'
    },

    // Transform configuration
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
        '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js'
    },

    // Test match patterns
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
    ],

    // Ignore patterns
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/build/',
        '<rootDir>/src/__tests__/integration/'
    ],

    // Watch plugins
    watchPlugins: [
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname'
    ],

    // Performance settings
    maxWorkers: '50%',

    // Verbose output for CI
    verbose: process.env.CI === 'true'
};