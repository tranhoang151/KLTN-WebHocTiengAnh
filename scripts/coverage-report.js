#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Test coverage analysis and reporting script
 * Combines frontend and backend coverage reports
 */

class CoverageReporter {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            frontend: null,
            backend: null,
            combined: null,
            thresholds: {
                statements: 80,
                branches: 75,
                functions: 80,
                lines: 80
            }
        };
    }

    async generateCoverageReport() {
        console.log('📊 Generating comprehensive coverage report...');

        try {
            // Collect frontend coverage
            console.log('\n🎨 Collecting frontend coverage...');
            this.results.frontend = await this.collectFrontendCoverage();

            // Collect backend coverage
            console.log('\n🔧 Collecting backend coverage...');
            this.results.backend = await this.collectBackendCoverage();

            // Calculate combined metrics
            this.results.combined = this.calculateCombinedCoverage();

            // Generate reports
            await this.generateReports();

            // Check coverage thresholds
            this.checkCoverageThresholds();

        } catch (error) {
            console.error('❌ Coverage report generation failed:', error.message);
            process.exit(1);
        }
    }

    async collectFrontendCoverage() {
        const frontendPath = path.join(__dirname, '../frontend');
        const coveragePath = path.join(frontendPath, 'coverage');

        let coverage = null;

        try {
            // Check if coverage directory exists
            if (fs.existsSync(coveragePath)) {
                // Read coverage summary
                const summaryPath = path.join(coveragePath, 'coverage-summary.json');
                if (fs.existsSync(summaryPath)) {
                    coverage = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
                }

                // If no summary, try to generate it
                if (!coverage) {
                    console.log('   Generating frontend coverage...');
                    execSync('npm run test:coverage', {
                        cwd: frontendPath,
                        stdio: 'inherit'
                    });

                    if (fs.existsSync(summaryPath)) {
                        coverage = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
                    }
                }
            } else {
                console.log('   Running frontend tests with coverage...');
                execSync('npm run test:coverage', {
                    cwd: frontendPath,
                    stdio: 'inherit'
                });

                const summaryPath = path.join(coveragePath, 'coverage-summary.json');
                if (fs.existsSync(summaryPath)) {
                    coverage = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
                }
            }
        } catch (error) {
            console.warn('   ⚠️  Could not collect frontend coverage:', error.message);
        }

        return this.normalizeCoverageData(coverage, 'frontend');
    }

    async collectBackendCoverage() {
        const backendPath = path.join(__dirname, '../backend');
        let coverage = null;

        try {
            console.log('   Running backend tests with coverage...');

            // Run tests with coverage collection
            execSync(`dotnet test --collect:"XPlat Code Coverage" --results-directory ./TestResults`, {
                cwd: backendPath,
                stdio: 'inherit'
            });

            // Find the coverage file
            const testResultsPath = path.join(backendPath, 'TestResults');
            if (fs.existsSync(testResultsPath)) {
                const directories = fs.readdirSync(testResultsPath);
                for (const dir of directories) {
                    const coverageFile = path.join(testResultsPath, dir, 'coverage.cobertura.xml');
                    if (fs.existsSync(coverageFile)) {
                        coverage = this.parseCoberturaXml(coverageFile);
                        break;
                    }
                }
            }
        } catch (error) {
            console.warn('   ⚠️  Could not collect backend coverage:', error.message);
        }

        return this.normalizeCoverageData(coverage, 'backend');
    }

    parseCoberturaXml(filePath) {
        try {
            const xml = fs.readFileSync(filePath, 'utf8');

            // Simple XML parsing for coverage metrics
            const lineRateMatch = xml.match(/line-rate="([^"]+)"/);
            const branchRateMatch = xml.match(/branch-rate="([^"]+)"/);

            const lineRate = lineRateMatch ? parseFloat(lineRateMatch[1]) : 0;
            const branchRate = branchRateMatch ? parseFloat(branchRateMatch[1]) : 0;

            // Count total lines and branches from XML
            const linesMatches = xml.match(/<line[^>]*>/g) || [];
            const branchesMatches = xml.match(/<condition[^>]*>/g) || [];

            const totalLines = linesMatches.length;
            const totalBranches = branchesMatches.length;
            const coveredLines = Math.round(totalLines * lineRate);
            const coveredBranches = Math.round(totalBranches * branchRate);

            return {
                lines: {
                    total: totalLines,
                    covered: coveredLines,
                    pct: lineRate * 100
                },
                branches: {
                    total: totalBranches,
                    covered: coveredBranches,
                    pct: branchRate * 100
                },
                statements: {
                    total: totalLines,
                    covered: coveredLines,
                    pct: lineRate * 100
                },
                functions: {
                    total: 0,
                    covered: 0,
                    pct: 0
                }
            };
        } catch (error) {
            console.warn('   ⚠️  Could not parse Cobertura XML:', error.message);
            return null;
        }
    }

    normalizeCoverageData(coverage, source) {
        if (!coverage) {
            return {
                source,
                statements: { total: 0, covered: 0, pct: 0 },
                branches: { total: 0, covered: 0, pct: 0 },
                functions: { total: 0, covered: 0, pct: 0 },
                lines: { total: 0, covered: 0, pct: 0 }
            };
        }

        // Handle Jest coverage format
        if (coverage.total) {
            return {
                source,
                statements: coverage.total.statements,
                branches: coverage.total.branches,
                functions: coverage.total.functions,
                lines: coverage.total.lines
            };
        }

        // Handle already normalized format
        return {
            source,
            statements: coverage.statements || { total: 0, covered: 0, pct: 0 },
            branches: coverage.branches || { total: 0, covered: 0, pct: 0 },
            functions: coverage.functions || { total: 0, covered: 0, pct: 0 },
            lines: coverage.lines || { total: 0, covered: 0, pct: 0 }
        };
    }

    calculateCombinedCoverage() {
        const frontend = this.results.frontend;
        const backend = this.results.backend;

        const combined = {
            statements: {
                total: frontend.statements.total + backend.statements.total,
                covered: frontend.statements.covered + backend.statements.covered,
                pct: 0
            },
            branches: {
                total: frontend.branches.total + backend.branches.total,
                covered: frontend.branches.covered + backend.branches.covered,
                pct: 0
            },
            functions: {
                total: frontend.functions.total + backend.functions.total,
                covered: frontend.functions.covered + backend.functions.covered,
                pct: 0
            },
            lines: {
                total: frontend.lines.total + backend.lines.total,
                covered: frontend.lines.covered + backend.lines.covered,
                pct: 0
            }
        };

        // Calculate percentages
        Object.keys(combined).forEach(metric => {
            if (combined[metric].total > 0) {
                combined[metric].pct = (combined[metric].covered / combined[metric].total) * 100;
            }
        });

        return combined;
    }

    async generateReports() {
        // Save JSON report
        const reportPath = path.join(__dirname, '../coverage-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

        // Generate HTML report
        const htmlReport = this.generateHtmlReport();
        const htmlPath = path.join(__dirname, '../coverage-report.html');
        fs.writeFileSync(htmlPath, htmlReport);

        // Generate badge data
        const badgeData = this.generateBadgeData();
        const badgePath = path.join(__dirname, '../coverage-badge.json');
        fs.writeFileSync(badgePath, JSON.stringify(badgeData, null, 2));

        console.log('\n📊 Coverage Report Summary:');
        console.log(`   Combined Statements: ${this.results.combined.statements.pct.toFixed(1)}%`);
        console.log(`   Combined Branches: ${this.results.combined.branches.pct.toFixed(1)}%`);
        console.log(`   Combined Functions: ${this.results.combined.functions.pct.toFixed(1)}%`);
        console.log(`   Combined Lines: ${this.results.combined.lines.pct.toFixed(1)}%`);
        console.log(`\n📄 Reports generated:`);
        console.log(`   JSON: ${reportPath}`);
        console.log(`   HTML: ${htmlPath}`);
        console.log(`   Badge: ${badgePath}`);
    }

    generateHtmlReport() {
        const { frontend, backend, combined } = this.results;

        return `
<!DOCTYPE html>
<html>
<head>
    <title>Test Coverage Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; }
        .coverage-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .coverage-table th, .coverage-table td { 
          padding: 12px; text-align: left; border-bottom: 1px solid #ddd; 
        }
        .coverage-table th { background: #f8f9fa; }
        .coverage-bar { 
          width: 100px; height: 20px; background: #e9ecef; 
          border-radius: 10px; overflow: hidden; 
        }
        .coverage-fill { height: 100%; transition: width 0.3s ease; }
        .excellent { background: #28a745; }
        .good { background: #ffc107; }
        .poor { background: #dc3545; }
        .metric-card { 
          display: inline-block; margin: 10px; padding: 20px; 
          border-radius: 8px; text-align: center; min-width: 120px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Test Coverage Report</h1>
        <p>Generated: ${this.results.timestamp}</p>
    </div>
    
    <div class="section">
        <h2>Combined Coverage Summary</h2>
        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
            ${this.renderMetricCard('Statements', combined.statements)}
            ${this.renderMetricCard('Branches', combined.branches)}
            ${this.renderMetricCard('Functions', combined.functions)}
            ${this.renderMetricCard('Lines', combined.lines)}
        </div>
    </div>
    
    <div class="section">
        <h2>Detailed Coverage</h2>
        <table class="coverage-table">
            <thead>
                <tr>
                    <th>Component</th>
                    <th>Statements</th>
                    <th>Branches</th>
                    <th>Functions</th>
                    <th>Lines</th>
                </tr>
            </thead>
            <tbody>
                ${this.renderCoverageRow('Frontend', frontend)}
                ${this.renderCoverageRow('Backend', backend)}
                ${this.renderCoverageRow('Combined', combined, true)}
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h2>Coverage Thresholds</h2>
        <table class="coverage-table">
            <thead>
                <tr><th>Metric</th><th>Threshold</th><th>Current</th><th>Status</th></tr>
            </thead>
            <tbody>
                ${Object.keys(this.results.thresholds).map(metric => {
            const threshold = this.results.thresholds[metric];
            const current = combined[metric].pct;
            const status = current >= threshold ? '✅ Pass' : '❌ Fail';
            return `<tr>
                    <td>${metric}</td>
                    <td>${threshold}%</td>
                    <td>${current.toFixed(1)}%</td>
                    <td>${status}</td>
                  </tr>`;
        }).join('')}
            </tbody>
        </table>
    </div>
</body>
</html>`;
    }

    renderMetricCard(name, metric) {
        const pct = metric.pct;
        const className = pct >= 80 ? 'excellent' : pct >= 60 ? 'good' : 'poor';

        return `
      <div class="metric-card ${className}">
        <h3 style="margin: 0; color: white;">${name}</h3>
        <p style="margin: 5px 0; font-size: 24px; color: white;">${pct.toFixed(1)}%</p>
        <p style="margin: 0; font-size: 12px; color: white;">${metric.covered}/${metric.total}</p>
      </div>
    `;
    }

    renderCoverageRow(name, coverage, isCombined = false) {
        const style = isCombined ? 'font-weight: bold; background: #f8f9fa;' : '';

        return `
      <tr style="${style}">
        <td>${name}</td>
        <td>${this.renderCoverageCell(coverage.statements)}</td>
        <td>${this.renderCoverageCell(coverage.branches)}</td>
        <td>${this.renderCoverageCell(coverage.functions)}</td>
        <td>${this.renderCoverageCell(coverage.lines)}</td>
      </tr>
    `;
    }

    renderCoverageCell(metric) {
        const pct = metric.pct;
        const className = pct >= 80 ? 'excellent' : pct >= 60 ? 'good' : 'poor';

        return `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span>${pct.toFixed(1)}%</span>
        <div class="coverage-bar">
          <div class="coverage-fill ${className}" style="width: ${pct}%"></div>
        </div>
        <small>(${metric.covered}/${metric.total})</small>
      </div>
    `;
    }

    generateBadgeData() {
        const overallCoverage = this.results.combined.statements.pct;
        let color = 'red';

        if (overallCoverage >= 80) color = 'brightgreen';
        else if (overallCoverage >= 60) color = 'yellow';
        else if (overallCoverage >= 40) color = 'orange';

        return {
            schemaVersion: 1,
            label: 'coverage',
            message: `${overallCoverage.toFixed(1)}%`,
            color: color
        };
    }

    checkCoverageThresholds() {
        const { combined, thresholds } = this.results;
        let failed = false;

        console.log('\n🎯 Coverage Threshold Check:');

        Object.keys(thresholds).forEach(metric => {
            const threshold = thresholds[metric];
            const current = combined[metric].pct;
            const passed = current >= threshold;

            if (!passed) failed = true;

            const status = passed ? '✅' : '❌';
            console.log(`   ${status} ${metric}: ${current.toFixed(1)}% (threshold: ${threshold}%)`);
        });

        if (failed) {
            console.error('\n❌ Coverage thresholds not met');
            process.exit(1);
        } else {
            console.log('\n✅ All coverage thresholds met');
        }
    }
}

// Run the coverage reporter if this script is executed directly
if (require.main === module) {
    const reporter = new CoverageReporter();
    reporter.generateCoverageReport().catch(error => {
        console.error('❌ Coverage report generation failed:', error);
        process.exit(1);
    });
}

module.exports = CoverageReporter;