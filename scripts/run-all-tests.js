#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Master script to run all automated tests and generate comprehensive reports
 */

class TestRunner {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            tests: {
                frontend: { status: 'pending', duration: 0, details: null },
                backend: { status: 'pending', duration: 0, details: null },
                integration: { status: 'pending', duration: 0, details: null },
                performance: { status: 'pending', duration: 0, details: null },
                security: { status: 'pending', duration: 0, details: null }
            },
            summary: {
                total: 5,
                passed: 0,
                failed: 0,
                skipped: 0
            }
        };
    }

    async runAllTests() {
        console.log('🚀 Starting comprehensive automated testing pipeline...');
        console.log(`📅 Started at: ${this.results.timestamp}\n`);

        try {
            // Run tests in sequence to avoid resource conflicts
            await this.runFrontendTests();
            await this.runBackendTests();
            await this.runIntegrationTests();
            await this.runPerformanceTests();
            await this.runSecurityScan();

            // Generate final report
            await this.generateFinalReport();

            // Check overall success
            this.checkOverallSuccess();

        } catch (error) {
            console.error('❌ Test pipeline failed:', error.message);
            process.exit(1);
        }
    }

    async runFrontendTests() {
        console.log('🎨 Running frontend tests...');
        const startTime = Date.now();

        try {
            // Run linting first
            console.log('   📋 Running ESLint...');
            execSync('npm run lint', {
                cwd: path.join(__dirname, '../frontend'),
                stdio: 'inherit'
            });

            // Run unit tests with coverage
            console.log('   🧪 Running unit tests with coverage...');
            execSync('npm run test:coverage', {
                cwd: path.join(__dirname, '../frontend'),
                stdio: 'inherit'
            });

            this.results.tests.frontend = {
                status: 'passed',
                duration: Date.now() - startTime,
                details: 'All frontend tests passed'
            };
            this.results.summary.passed++;

            console.log('✅ Frontend tests completed successfully\n');

        } catch (error) {
            this.results.tests.frontend = {
                status: 'failed',
                duration: Date.now() - startTime,
                details: error.message
            };
            this.results.summary.failed++;

            console.error('❌ Frontend tests failed\n');
            throw error;
        }
    }

    async runBackendTests() {
        console.log('🔧 Running backend tests...');
        const startTime = Date.now();

        try {
            // Build the project first
            console.log('   🏗️  Building backend project...');
            execSync('dotnet build --configuration Release', {
                cwd: path.join(__dirname, '../backend'),
                stdio: 'inherit'
            });

            // Run tests with coverage
            console.log('   🧪 Running backend tests with coverage...');
            execSync('dotnet test --configuration Release --collect:"XPlat Code Coverage" --results-directory ./TestResults', {
                cwd: path.join(__dirname, '../backend'),
                stdio: 'inherit'
            });

            this.results.tests.backend = {
                status: 'passed',
                duration: Date.now() - startTime,
                details: 'All backend tests passed'
            };
            this.results.summary.passed++;

            console.log('✅ Backend tests completed successfully\n');

        } catch (error) {
            this.results.tests.backend = {
                status: 'failed',
                duration: Date.now() - startTime,
                details: error.message
            };
            this.results.summary.failed++;

            console.error('❌ Backend tests failed\n');
            throw error;
        }
    }

    async runIntegrationTests() {
        console.log('🔗 Running integration tests...');
        const startTime = Date.now();

        try {
            // Run frontend integration tests
            console.log('   🎨 Running frontend integration tests...');
            execSync('npm run test:integration:ci', {
                cwd: path.join(__dirname, '../frontend'),
                stdio: 'inherit'
            });

            // Run backend integration tests
            console.log('   🔧 Running backend integration tests...');
            execSync('dotnet test Tests/ --filter Category=Integration --configuration Release', {
                cwd: path.join(__dirname, '../backend'),
                stdio: 'inherit'
            });

            this.results.tests.integration = {
                status: 'passed',
                duration: Date.now() - startTime,
                details: 'All integration tests passed'
            };
            this.results.summary.passed++;

            console.log('✅ Integration tests completed successfully\n');

        } catch (error) {
            this.results.tests.integration = {
                status: 'failed',
                duration: Date.now() - startTime,
                details: error.message
            };
            this.results.summary.failed++;

            console.error('❌ Integration tests failed\n');
            throw error;
        }
    }

    async runPerformanceTests() {
        console.log('⚡ Running performance tests...');
        const startTime = Date.now();

        try {
            // Check if performance test script exists
            const performanceScript = path.join(__dirname, 'performance-tests.js');
            if (!fs.existsSync(performanceScript)) {
                console.log('   ⚠️  Performance test script not found, skipping...');
                this.results.tests.performance = {
                    status: 'skipped',
                    duration: Date.now() - startTime,
                    details: 'Performance test script not found'
                };
                this.results.summary.skipped++;
                return;
            }

            // Install puppeteer if not already installed
            try {
                require('puppeteer');
            } catch (error) {
                console.log('   📦 Installing puppeteer...');
                execSync('npm install puppeteer', {
                    cwd: path.join(__dirname, '../frontend'),
                    stdio: 'inherit'
                });
            }

            // Run performance tests
            console.log('   🏃 Running performance regression tests...');
            execSync('node performance-tests.js', {
                cwd: __dirname,
                stdio: 'inherit'
            });

            this.results.tests.performance = {
                status: 'passed',
                duration: Date.now() - startTime,
                details: 'Performance tests completed'
            };
            this.results.summary.passed++;

            console.log('✅ Performance tests completed successfully\n');

        } catch (error) {
            this.results.tests.performance = {
                status: 'failed',
                duration: Date.now() - startTime,
                details: error.message
            };
            this.results.summary.failed++;

            console.error('❌ Performance tests failed\n');
            // Don't throw error for performance tests - they're informational
        }
    }

    async runSecurityScan() {
        console.log('🔒 Running security vulnerability scan...');
        const startTime = Date.now();

        try {
            // Run security scan
            console.log('   🔍 Scanning for vulnerabilities...');
            execSync('node security-scan.js', {
                cwd: __dirname,
                stdio: 'inherit'
            });

            this.results.tests.security = {
                status: 'passed',
                duration: Date.now() - startTime,
                details: 'Security scan completed'
            };
            this.results.summary.passed++;

            console.log('✅ Security scan completed successfully\n');

        } catch (error) {
            this.results.tests.security = {
                status: 'failed',
                duration: Date.now() - startTime,
                details: error.message
            };
            this.results.summary.failed++;

            console.error('❌ Security scan failed\n');
            // Don't throw error for security scan - handle gracefully
        }
    }

    async generateFinalReport() {
        console.log('📊 Generating comprehensive test report...');

        // Generate coverage report
        try {
            execSync('node coverage-report.js', {
                cwd: __dirname,
                stdio: 'inherit'
            });
        } catch (error) {
            console.warn('⚠️  Could not generate coverage report:', error.message);
        }

        // Save test results
        const reportPath = path.join(__dirname, '../test-pipeline-results.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

        // Generate HTML report
        const htmlReport = this.generateHtmlReport();
        const htmlPath = path.join(__dirname, '../test-pipeline-report.html');
        fs.writeFileSync(htmlPath, htmlReport);

        console.log(`📄 Test pipeline reports generated:`);
        console.log(`   JSON: ${reportPath}`);
        console.log(`   HTML: ${htmlPath}\n`);
    }

    generateHtmlReport() {
        const { tests, summary } = this.results;
        const totalDuration = Object.values(tests).reduce((sum, test) => sum + test.duration, 0);

        return `
<!DOCTYPE html>
<html>
<head>
    <title>Automated Testing Pipeline Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { padding: 15px; border-radius: 5px; flex: 1; text-align: center; }
        .passed { background: #d4edda; color: #155724; }
        .failed { background: #f8d7da; color: #721c24; }
        .skipped { background: #fff3cd; color: #856404; }
        .test-result { margin: 15px 0; padding: 15px; border-radius: 5px; border-left: 5px solid; }
        .test-passed { border-color: #28a745; background: #d4edda; }
        .test-failed { border-color: #dc3545; background: #f8d7da; }
        .test-skipped { border-color: #ffc107; background: #fff3cd; }
        .duration { font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Automated Testing Pipeline Report</h1>
        <p><strong>Generated:</strong> ${this.results.timestamp}</p>
        <p><strong>Total Duration:</strong> ${Math.round(totalDuration / 1000)}s</p>
    </div>
    
    <div class="summary">
        <div class="metric passed">
            <h3>Passed</h3>
            <p style="font-size: 24px; margin: 0;">${summary.passed}</p>
        </div>
        <div class="metric failed">
            <h3>Failed</h3>
            <p style="font-size: 24px; margin: 0;">${summary.failed}</p>
        </div>
        <div class="metric skipped">
            <h3>Skipped</h3>
            <p style="font-size: 24px; margin: 0;">${summary.skipped}</p>
        </div>
    </div>
    
    <h2>Test Results</h2>
    ${Object.keys(tests).map(testName => {
            const test = tests[testName];
            const statusClass = `test-${test.status}`;
            const statusIcon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⚠️';

            return `
        <div class="${statusClass} test-result">
          <h3>${statusIcon} ${testName.charAt(0).toUpperCase() + testName.slice(1)} Tests</h3>
          <p><strong>Status:</strong> ${test.status}</p>
          <p class="duration"><strong>Duration:</strong> ${Math.round(test.duration / 1000)}s</p>
          <p><strong>Details:</strong> ${test.details}</p>
        </div>
      `;
        }).join('')}
    
    <div style="margin-top: 30px; padding: 15px; background: #e9ecef; border-radius: 5px;">
        <h3>📋 Pipeline Summary</h3>
        <p>This automated testing pipeline validates code quality, functionality, performance, and security.</p>
        <ul>
            <li><strong>Frontend Tests:</strong> Unit tests, linting, and code coverage</li>
            <li><strong>Backend Tests:</strong> Unit tests, integration tests, and code coverage</li>
            <li><strong>Integration Tests:</strong> End-to-end workflow validation</li>
            <li><strong>Performance Tests:</strong> Critical user flow performance validation</li>
            <li><strong>Security Scan:</strong> Dependency vulnerability assessment</li>
        </ul>
    </div>
</body>
</html>`;
    }

    checkOverallSuccess() {
        const { summary } = this.results;

        console.log('📊 Test Pipeline Summary:');
        console.log(`   Total Tests: ${summary.total}`);
        console.log(`   Passed: ${summary.passed}`);
        console.log(`   Failed: ${summary.failed}`);
        console.log(`   Skipped: ${summary.skipped}`);

        if (summary.failed > 0) {
            console.error('\n❌ Test pipeline failed - some tests did not pass');
            process.exit(1);
        } else {
            console.log('\n✅ All tests passed successfully!');
            console.log('🚀 Application is ready for deployment');
        }
    }
}

// Run the test pipeline if this script is executed directly
if (require.main === module) {
    const runner = new TestRunner();
    runner.runAllTests().catch(error => {
        console.error('❌ Test pipeline execution failed:', error);
        process.exit(1);
    });
}

module.exports = TestRunner;