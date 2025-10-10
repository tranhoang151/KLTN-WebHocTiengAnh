const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test categories to run separately
const testCategories = [
    {
        name: 'Utils Tests',
        pattern: 'utils/__tests__',
        description: 'Testing utility functions'
    },
    {
        name: 'Hooks Tests',
        pattern: 'hooks/__tests__',
        description: 'Testing custom React hooks'
    },
    {
        name: 'Services Tests',
        pattern: 'services/__tests__',
        description: 'Testing service layer functions'
    },
    {
        name: 'UI Component Tests',
        pattern: 'components/ui/__tests__',
        description: 'Testing UI components'
    },
    {
        name: 'Learning Component Tests',
        pattern: 'components/learning/__tests__',
        description: 'Testing learning components'
    },
    {
        name: 'Achievement Component Tests',
        pattern: 'components/achievement/__tests__',
        description: 'Testing achievement components'
    },
    {
        name: 'Progress Component Tests',
        pattern: 'components/progress/__tests__',
        description: 'Testing progress components'
    }
];

const results = [];

console.log('🧪 Starting Frontend Test Fix Analysis...\n');

testCategories.forEach(category => {
    console.log(`\n📋 Running ${category.name}...`);

    try {
        const output = execSync(
            `npm test -- --testPathPattern="${category.pattern}" --watchAll=false --verbose`,
            {
                encoding: 'utf8',
                stdio: 'pipe',
                timeout: 60000 // 60 second timeout
            }
        );

        results.push({
            category: category.name,
            status: 'PASSED',
            output: output
        });

        console.log(`✅ ${category.name} - PASSED`);

    } catch (error) {
        results.push({
            category: category.name,
            status: 'FAILED',
            output: error.stdout || error.message,
            error: error.stderr || error.message
        });

        console.log(`❌ ${category.name} - FAILED`);
    }
});

// Generate summary report
const summary = {
    timestamp: new Date().toISOString(),
    totalCategories: testCategories.length,
    passed: results.filter(r => r.status === 'PASSED').length,
    failed: results.filter(r => r.status === 'FAILED').length,
    results: results
};

// Write detailed report
const reportPath = path.join(__dirname, '..', 'FRONTEND_TEST_FIX_REPORT.md');
let report = `# Frontend Test Fix Report

Generated: ${summary.timestamp}

## Summary
- Total Test Categories: ${summary.totalCategories}
- Passed: ${summary.passed}
- Failed: ${summary.failed}
- Success Rate: ${Math.round((summary.passed / summary.totalCategories) * 100)}%

## Results by Category

`;

results.forEach(result => {
    report += `### ${result.category}
Status: ${result.status === 'PASSED' ? '✅ PASSED' : '❌ FAILED'}

`;

    if (result.status === 'FAILED') {
        report += `#### Error Details
\`\`\`
${result.error || 'No error details available'}
\`\`\`

#### Output
\`\`\`
${result.output.substring(0, 2000)}${result.output.length > 2000 ? '...[truncated]' : ''}
\`\`\`

`;
    } else {
        report += `#### Success Output
\`\`\`
${result.output.substring(0, 1000)}${result.output.length > 1000 ? '...[truncated]' : ''}
\`\`\`

`;
    }
});

report += `## Recommendations

Based on the test results, here are the main issues to fix:

1. **Mock Configuration Issues**: Many tests fail due to incorrect service mocking
2. **Component Structure Changes**: Tests expect different DOM structure than actual components
3. **Missing Dependencies**: Some test utilities or setup files may be missing
4. **API Mismatches**: Tests use outdated API calls that don't match current implementation

## Next Steps

1. Fix service mocking in test files
2. Update test expectations to match current component structure  
3. Review and update test setup configuration
4. Align test API calls with current service implementations
`;

fs.writeFileSync(reportPath, report);

console.log(`\n📊 Test Fix Report Summary:`);
console.log(`✅ Passed: ${summary.passed}/${summary.totalCategories}`);
console.log(`❌ Failed: ${summary.failed}/${summary.totalCategories}`);
console.log(`📄 Detailed report: ${reportPath}`);

process.exit(summary.failed > 0 ? 1 : 0);