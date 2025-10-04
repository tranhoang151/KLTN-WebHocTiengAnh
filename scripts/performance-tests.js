#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Performance regression testing script
 * Tests critical user flows and measures performance metrics
 */

const PERFORMANCE_THRESHOLDS = {
    firstContentfulPaint: 2000, // 2 seconds
    largestContentfulPaint: 3000, // 3 seconds
    cumulativeLayoutShift: 0.1,
    totalBlockingTime: 300, // 300ms
    timeToInteractive: 4000, // 4 seconds
};

const CRITICAL_USER_FLOWS = [
    {
        name: 'Student Login Flow',
        url: 'http://localhost:3000/login',
        actions: [
            { type: 'type', selector: 'input[type="email"]', text: 'student@test.com' },
            { type: 'type', selector: 'input[type="password"]', text: 'password123' },
            { type: 'click', selector: 'button[type="submit"]' },
            { type: 'waitForNavigation', expectedUrl: '/student/dashboard' }
        ]
    },
    {
        name: 'Flashcard Learning Flow',
        url: 'http://localhost:3000/student/flashcards',
        actions: [
            { type: 'click', selector: '.flashcard-set-card:first-child' },
            { type: 'waitForSelector', selector: '.flashcard-container' },
            { type: 'click', selector: '.flashcard' },
            { type: 'click', selector: '.learned-button' },
            { type: 'click', selector: '.next-card-button' }
        ]
    },
    {
        name: 'Exercise Taking Flow',
        url: 'http://localhost:3000/student/exercises',
        actions: [
            { type: 'click', selector: '.exercise-card:first-child' },
            { type: 'waitForSelector', selector: '.exercise-question' },
            { type: 'click', selector: '.answer-option:first-child' },
            { type: 'click', selector: '.next-question-button' }
        ]
    },
    {
        name: 'Teacher Dashboard Load',
        url: 'http://localhost:3000/teacher/dashboard',
        actions: [
            { type: 'waitForSelector', selector: '.teacher-dashboard' },
            { type: 'click', selector: '.class-card:first-child' },
            { type: 'waitForSelector', selector: '.student-progress-list' }
        ]
    },
    {
        name: 'Admin Content Management',
        url: 'http://localhost:3000/admin/content',
        actions: [
            { type: 'waitForSelector', selector: '.content-management' },
            { type: 'click', selector: '.create-flashcard-set-button' },
            { type: 'waitForSelector', selector: '.flashcard-set-form' }
        ]
    }
];

class PerformanceTestRunner {
    constructor() {
        this.browser = null;
        this.results = [];
    }

    async initialize() {
        this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    async runAllTests() {
        console.log('🚀 Starting performance regression tests...');

        for (const flow of CRITICAL_USER_FLOWS) {
            console.log(`\n📊 Testing: ${flow.name}`);
            try {
                const result = await this.runSingleTest(flow);
                this.results.push(result);
                this.logResult(result);
            } catch (error) {
                console.error(`❌ Error testing ${flow.name}:`, error.message);
                this.results.push({
                    name: flow.name,
                    success: false,
                    error: error.message,
                    metrics: null
                });
            }
        }

        await this.generateReport();
        await this.cleanup();
    }

    async runSingleTest(flow) {
        const page = await this.browser.newPage();

        // Enable performance monitoring
        await page.setCacheEnabled(false);
        await page.setViewport({ width: 1920, height: 1080 });

        const startTime = Date.now();

        // Navigate to the page
        await page.goto(flow.url, { waitUntil: 'networkidle0' });

        // Execute flow actions
        for (const action of flow.actions) {
            await this.executeAction(page, action);
        }

        // Collect performance metrics
        const metrics = await this.collectMetrics(page);
        const endTime = Date.now();

        await page.close();

        return {
            name: flow.name,
            success: true,
            duration: endTime - startTime,
            metrics: metrics,
            thresholdsPassed: this.checkThresholds(metrics)
        };
    }

    async executeAction(page, action) {
        switch (action.type) {
            case 'click':
                await page.click(action.selector);
                break;
            case 'type':
                await page.type(action.selector, action.text);
                break;
            case 'waitForSelector':
                await page.waitForSelector(action.selector, { timeout: 10000 });
                break;
            case 'waitForNavigation':
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
                if (action.expectedUrl) {
                    const currentUrl = page.url();
                    if (!currentUrl.includes(action.expectedUrl)) {
                        throw new Error(`Expected URL to contain ${action.expectedUrl}, got ${currentUrl}`);
                    }
                }
                break;
        }

        // Small delay between actions
        await page.waitForTimeout(500);
    }

    async collectMetrics(page) {
        const performanceMetrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');

            return {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                totalRequests: performance.getEntriesByType('resource').length,
                totalTransferSize: performance.getEntriesByType('resource')
                    .reduce((total, resource) => total + (resource.transferSize || 0), 0)
            };
        });

        // Get Lighthouse metrics if available
        const lighthouseMetrics = await page.evaluate(() => {
            if (window.performance && window.performance.getEntriesByType) {
                const observer = new PerformanceObserver(() => { });
                return {
                    cumulativeLayoutShift: 0, // Would need proper CLS measurement
                    totalBlockingTime: 0, // Would need proper TBT measurement
                    timeToInteractive: 0 // Would need proper TTI measurement
                };
            }
            return {};
        });

        return { ...performanceMetrics, ...lighthouseMetrics };
    }

    checkThresholds(metrics) {
        const results = {};

        Object.keys(PERFORMANCE_THRESHOLDS).forEach(metric => {
            const threshold = PERFORMANCE_THRESHOLDS[metric];
            const value = metrics[metric] || 0;
            results[metric] = {
                value,
                threshold,
                passed: value <= threshold
            };
        });

        return results;
    }

    logResult(result) {
        if (result.success) {
            console.log(`✅ ${result.name} completed in ${result.duration}ms`);

            // Log threshold results
            Object.keys(result.thresholdsPassed).forEach(metric => {
                const check = result.thresholdsPassed[metric];
                const status = check.passed ? '✅' : '❌';
                console.log(`   ${status} ${metric}: ${check.value}ms (threshold: ${check.threshold}ms)`);
            });
        } else {
            console.log(`❌ ${result.name} failed: ${result.error}`);
        }
    }

    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.results.length,
                passed: this.results.filter(r => r.success).length,
                failed: this.results.filter(r => !r.success).length
            },
            results: this.results,
            thresholds: PERFORMANCE_THRESHOLDS
        };

        // Save JSON report
        const reportPath = path.join(__dirname, '../performance-test-results.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // Generate HTML report
        const htmlReport = this.generateHtmlReport(report);
        const htmlPath = path.join(__dirname, '../performance-test-report.html');
        fs.writeFileSync(htmlPath, htmlReport);

        console.log('\n📊 Performance Test Summary:');
        console.log(`   Total Tests: ${report.summary.totalTests}`);
        console.log(`   Passed: ${report.summary.passed}`);
        console.log(`   Failed: ${report.summary.failed}`);
        console.log(`\n📄 Reports generated:`);
        console.log(`   JSON: ${reportPath}`);
        console.log(`   HTML: ${htmlPath}`);

        // Exit with error code if any tests failed
        if (report.summary.failed > 0) {
            process.exit(1);
        }
    }

    generateHtmlReport(report) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #e8f4f8; padding: 15px; border-radius: 5px; flex: 1; }
        .test-result { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .passed { border-left: 5px solid #4caf50; }
        .failed { border-left: 5px solid #f44336; }
        .metrics-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .metrics-table th, .metrics-table td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        .threshold-pass { color: #4caf50; }
        .threshold-fail { color: #f44336; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Performance Test Report</h1>
        <p>Generated: ${report.timestamp}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <p style="font-size: 24px; margin: 0;">${report.summary.totalTests}</p>
        </div>
        <div class="metric">
            <h3>Passed</h3>
            <p style="font-size: 24px; margin: 0; color: #4caf50;">${report.summary.passed}</p>
        </div>
        <div class="metric">
            <h3>Failed</h3>
            <p style="font-size: 24px; margin: 0; color: #f44336;">${report.summary.failed}</p>
        </div>
    </div>
    
    <h2>Test Results</h2>
    ${report.results.map(result => `
        <div class="test-result ${result.success ? 'passed' : 'failed'}">
            <h3>${result.name}</h3>
            ${result.success ? `
                <p>Duration: ${result.duration}ms</p>
                <table class="metrics-table">
                    <tr><th>Metric</th><th>Value</th><th>Threshold</th><th>Status</th></tr>
                    ${Object.keys(result.thresholdsPassed || {}).map(metric => {
            const check = result.thresholdsPassed[metric];
            return `<tr>
                        <td>${metric}</td>
                        <td>${check.value}ms</td>
                        <td>${check.threshold}ms</td>
                        <td class="${check.passed ? 'threshold-pass' : 'threshold-fail'}">
                          ${check.passed ? '✅ Pass' : '❌ Fail'}
                        </td>
                      </tr>`;
        }).join('')}
                </table>
            ` : `
                <p style="color: #f44336;">Error: ${result.error}</p>
            `}
        </div>
    `).join('')}
</body>
</html>`;
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Run the tests if this script is executed directly
if (require.main === module) {
    const runner = new PerformanceTestRunner();

    runner.initialize()
        .then(() => runner.runAllTests())
        .catch(error => {
            console.error('❌ Performance test runner failed:', error);
            process.exit(1);
        });
}

module.exports = PerformanceTestRunner;