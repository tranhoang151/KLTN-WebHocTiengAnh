#!/usr/bin/env node

/**
 * Test runner script for frontend unit tests
 * Provides options for running different types of tests
 */

const { spawn } = require('child_process');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    watch: args.includes('--watch') || args.includes('-w'),
    coverage: args.includes('--coverage') || args.includes('-c'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    silent: args.includes('--silent') || args.includes('-s'),
    updateSnapshots: args.includes('--updateSnapshots') || args.includes('-u'),
    testPathPattern: args.find(arg => arg.startsWith('--testPathPattern='))?.split('=')[1],
    testNamePattern: args.find(arg => arg.startsWith('--testNamePattern='))?.split('=')[1],
};

// Build Jest command
const jestArgs = [];

if (options.watch) {
    jestArgs.push('--watch');
}

if (options.coverage) {
    jestArgs.push('--coverage');
}

if (options.verbose) {
    jestArgs.push('--verbose');
}

if (options.silent) {
    jestArgs.push('--silent');
}

if (options.updateSnapshots) {
    jestArgs.push('--updateSnapshots');
}

if (options.testPathPattern) {
    jestArgs.push('--testPathPattern', options.testPathPattern);
}

if (options.testNamePattern) {
    jestArgs.push('--testNamePattern', options.testNamePattern);
}

// Add default options
jestArgs.push('--passWithNoTests');

console.log('🧪 Running frontend unit tests...');
console.log('📁 Test directory: src/**/__tests__/**/*.test.{ts,tsx}');

if (options.coverage) {
    console.log('📊 Coverage report will be generated in coverage/');
}

// Run Jest
const jest = spawn('npx', ['jest', ...jestArgs], {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: process.platform === 'win32'
});

jest.on('close', (code) => {
    if (code === 0) {
        console.log('✅ All tests passed!');
    } else {
        console.log('❌ Some tests failed.');
        process.exit(code);
    }
});

jest.on('error', (error) => {
    console.error('❌ Failed to run tests:', error.message);
    process.exit(1);
});