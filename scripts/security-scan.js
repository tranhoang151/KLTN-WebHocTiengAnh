#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Security vulnerability scanning script
 * Scans both frontend and backend dependencies for known vulnerabilities
 */

class SecurityScanner {
    constructor() {
        this.results = {
            timestamp: new Date().toISOString(),
            frontend: null,
            backend: null,
            summary: {
                totalVulnerabilities: 0,
                criticalVulnerabilities: 0,
                highVulnerabilities: 0,
                moderateVulnerabilities: 0,
                lowVulnerabilities: 0
            }
        };
    }

    async runAllScans() {
        console.log('🔒 Starting security vulnerability scanning...');

        try {
            // Scan frontend dependencies
            console.log('\n📦 Scanning frontend dependencies...');
            this.results.frontend = await this.scanFrontend();

            // Scan backend dependencies
            console.log('\n🔧 Scanning backend dependencies...');
            this.results.backend = await this.scanBackend();

            // Generate combined report
            await this.generateReport();

            // Check if scan should fail the build
            this.checkFailureConditions();

        } catch (error) {
            console.error('❌ Security scanning failed:', error.message);
            process.exit(1);
        }
    }

    async scanFrontend() {
        const frontendPath = path.join(__dirname, '../frontend');
        const results = {
            npmAudit: null,
            yarnAudit: null,
            retireJs: null
        };

        try {
            // Run npm audit
            console.log('   Running npm audit...');
            const npmAuditOutput = execSync('npm audit --json', {
                cwd: frontendPath,
                encoding: 'utf8'
            });
            results.npmAudit = JSON.parse(npmAuditOutput);
        } catch (error) {
            // npm audit returns non-zero exit code when vulnerabilities are found
            if (error.stdout) {
                try {
                    results.npmAudit = JSON.parse(error.stdout);
                } catch (parseError) {
                    console.warn('   ⚠️  Could not parse npm audit output');
                }
            }
        }

        try {
            // Run retire.js scan
            console.log('   Running retire.js scan...');
            const retireOutput = execSync('npx retire --outputformat json', {
                cwd: frontendPath,
                encoding: 'utf8'
            });
            results.retireJs = JSON.parse(retireOutput);
        } catch (error) {
            if (error.stdout) {
                try {
                    results.retireJs = JSON.parse(error.stdout);
                } catch (parseError) {
                    console.warn('   ⚠️  Could not parse retire.js output');
                }
            }
        }

        // Check for known vulnerable packages
        const packageJson = JSON.parse(fs.readFileSync(
            path.join(frontendPath, 'package.json'),
            'utf8'
        ));

        results.packageAnalysis = this.analyzePackages(packageJson);

        return results;
    }

    async scanBackend() {
        const backendPath = path.join(__dirname, '../backend');
        const results = {
            dotnetAudit: null,
            packageAnalysis: null
        };

        try {
            // Run dotnet list package --vulnerable
            console.log('   Running dotnet vulnerability scan...');
            const dotnetOutput = execSync('dotnet list package --vulnerable --format json', {
                cwd: backendPath,
                encoding: 'utf8'
            });
            results.dotnetAudit = JSON.parse(dotnetOutput);
        } catch (error) {
            console.warn('   ⚠️  Could not run dotnet vulnerability scan:', error.message);
        }

        try {
            // Analyze project file for known vulnerable packages
            const projectFiles = fs.readdirSync(backendPath)
                .filter(file => file.endsWith('.csproj'));

            if (projectFiles.length > 0) {
                const projectContent = fs.readFileSync(
                    path.join(backendPath, projectFiles[0]),
                    'utf8'
                );
                results.packageAnalysis = this.analyzeDotNetPackages(projectContent);
            }
        } catch (error) {
            console.warn('   ⚠️  Could not analyze .csproj file:', error.message);
        }

        return results;
    }

    analyzePackages(packageJson) {
        const knownVulnerablePackages = [
            { name: 'lodash', versions: ['<4.17.21'], severity: 'high' },
            { name: 'axios', versions: ['<0.21.2'], severity: 'moderate' },
            { name: 'react-scripts', versions: ['<5.0.0'], severity: 'moderate' },
            { name: 'node-forge', versions: ['<1.3.0'], severity: 'high' },
            { name: 'minimist', versions: ['<1.2.6'], severity: 'moderate' }
        ];

        const vulnerabilities = [];
        const allDependencies = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };

        Object.keys(allDependencies).forEach(packageName => {
            const version = allDependencies[packageName];
            const knownVuln = knownVulnerablePackages.find(vuln => vuln.name === packageName);

            if (knownVuln) {
                vulnerabilities.push({
                    package: packageName,
                    version: version,
                    severity: knownVuln.severity,
                    vulnerableVersions: knownVuln.versions
                });
            }
        });

        return vulnerabilities;
    }

    analyzeDotNetPackages(projectContent) {
        const knownVulnerablePackages = [
            { name: 'Newtonsoft.Json', versions: ['<13.0.1'], severity: 'high' },
            { name: 'System.Text.Json', versions: ['<6.0.0'], severity: 'moderate' },
            { name: 'Microsoft.AspNetCore.App', versions: ['<6.0.0'], severity: 'moderate' }
        ];

        const vulnerabilities = [];
        const packageRegex = /<PackageReference Include="([^"]+)" Version="([^"]+)"/g;
        let match;

        while ((match = packageRegex.exec(projectContent)) !== null) {
            const packageName = match[1];
            const version = match[2];

            const knownVuln = knownVulnerablePackages.find(vuln => vuln.name === packageName);
            if (knownVuln) {
                vulnerabilities.push({
                    package: packageName,
                    version: version,
                    severity: knownVuln.severity,
                    vulnerableVersions: knownVuln.versions
                });
            }
        }

        return vulnerabilities;
    }

    calculateSummary() {
        let total = 0;
        let critical = 0;
        let high = 0;
        let moderate = 0;
        let low = 0;

        // Count frontend vulnerabilities
        if (this.results.frontend?.npmAudit?.vulnerabilities) {
            Object.values(this.results.frontend.npmAudit.vulnerabilities).forEach(vuln => {
                total++;
                switch (vuln.severity) {
                    case 'critical': critical++; break;
                    case 'high': high++; break;
                    case 'moderate': moderate++; break;
                    case 'low': low++; break;
                }
            });
        }

        // Count backend vulnerabilities
        if (this.results.backend?.dotnetAudit?.vulnerabilities) {
            this.results.backend.dotnetAudit.vulnerabilities.forEach(vuln => {
                total++;
                switch (vuln.severity) {
                    case 'critical': critical++; break;
                    case 'high': high++; break;
                    case 'moderate': moderate++; break;
                    case 'low': low++; break;
                }
            });
        }

        this.results.summary = {
            totalVulnerabilities: total,
            criticalVulnerabilities: critical,
            highVulnerabilities: high,
            moderateVulnerabilities: moderate,
            lowVulnerabilities: low
        };
    }

    async generateReport() {
        this.calculateSummary();

        // Save JSON report
        const reportPath = path.join(__dirname, '../security-scan-results.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

        // Generate HTML report
        const htmlReport = this.generateHtmlReport();
        const htmlPath = path.join(__dirname, '../security-scan-report.html');
        fs.writeFileSync(htmlPath, htmlReport);

        // Generate SARIF report for GitHub Security tab
        const sarifReport = this.generateSarifReport();
        const sarifPath = path.join(__dirname, '../security-scan.sarif');
        fs.writeFileSync(sarifPath, JSON.stringify(sarifReport, null, 2));

        console.log('\n🔒 Security Scan Summary:');
        console.log(`   Total Vulnerabilities: ${this.results.summary.totalVulnerabilities}`);
        console.log(`   Critical: ${this.results.summary.criticalVulnerabilities}`);
        console.log(`   High: ${this.results.summary.highVulnerabilities}`);
        console.log(`   Moderate: ${this.results.summary.moderateVulnerabilities}`);
        console.log(`   Low: ${this.results.summary.lowVulnerabilities}`);
        console.log(`\n📄 Reports generated:`);
        console.log(`   JSON: ${reportPath}`);
        console.log(`   HTML: ${htmlPath}`);
        console.log(`   SARIF: ${sarifPath}`);
    }

    generateHtmlReport() {
        const { summary } = this.results;

        return `
<!DOCTYPE html>
<html>
<head>
    <title>Security Scan Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { padding: 15px; border-radius: 5px; flex: 1; text-align: center; }
        .critical { background: #ffebee; color: #c62828; }
        .high { background: #fff3e0; color: #ef6c00; }
        .moderate { background: #fff8e1; color: #f57f17; }
        .low { background: #e8f5e8; color: #2e7d32; }
        .vulnerability { margin: 10px 0; padding: 15px; border-left: 4px solid; border-radius: 5px; }
        .vuln-critical { border-color: #c62828; background: #ffebee; }
        .vuln-high { border-color: #ef6c00; background: #fff3e0; }
        .vuln-moderate { border-color: #f57f17; background: #fff8e1; }
        .vuln-low { border-color: #2e7d32; background: #e8f5e8; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Security Vulnerability Report</h1>
        <p>Generated: ${this.results.timestamp}</p>
    </div>
    
    <div class="summary">
        <div class="metric critical">
            <h3>Critical</h3>
            <p style="font-size: 24px; margin: 0;">${summary.criticalVulnerabilities}</p>
        </div>
        <div class="metric high">
            <h3>High</h3>
            <p style="font-size: 24px; margin: 0;">${summary.highVulnerabilities}</p>
        </div>
        <div class="metric moderate">
            <h3>Moderate</h3>
            <p style="font-size: 24px; margin: 0;">${summary.moderateVulnerabilities}</p>
        </div>
        <div class="metric low">
            <h3>Low</h3>
            <p style="font-size: 24px; margin: 0;">${summary.lowVulnerabilities}</p>
        </div>
    </div>
    
    <h2>Frontend Vulnerabilities</h2>
    ${this.renderVulnerabilities(this.results.frontend)}
    
    <h2>Backend Vulnerabilities</h2>
    ${this.renderVulnerabilities(this.results.backend)}
</body>
</html>`;
    }

    renderVulnerabilities(scanResults) {
        if (!scanResults) return '<p>No scan results available</p>';

        let html = '';

        // Render npm audit results
        if (scanResults.npmAudit?.vulnerabilities) {
            Object.values(scanResults.npmAudit.vulnerabilities).forEach(vuln => {
                html += `
          <div class="vulnerability vuln-${vuln.severity}">
            <h4>${vuln.name}</h4>
            <p><strong>Severity:</strong> ${vuln.severity}</p>
            <p><strong>Description:</strong> ${vuln.title}</p>
            <p><strong>Vulnerable versions:</strong> ${vuln.range}</p>
          </div>
        `;
            });
        }

        return html || '<p>No vulnerabilities found</p>';
    }

    generateSarifReport() {
        const runs = [{
            tool: {
                driver: {
                    name: "BingGo Security Scanner",
                    version: "1.0.0"
                }
            },
            results: []
        }];

        // Add frontend vulnerabilities
        if (this.results.frontend?.npmAudit?.vulnerabilities) {
            Object.values(this.results.frontend.npmAudit.vulnerabilities).forEach(vuln => {
                runs[0].results.push({
                    ruleId: `npm-${vuln.name}`,
                    message: {
                        text: `${vuln.title} in ${vuln.name}`
                    },
                    level: this.mapSeverityToLevel(vuln.severity),
                    locations: [{
                        physicalLocation: {
                            artifactLocation: {
                                uri: "frontend/package.json"
                            }
                        }
                    }]
                });
            });
        }

        return {
            version: "2.1.0",
            $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
            runs: runs
        };
    }

    mapSeverityToLevel(severity) {
        switch (severity) {
            case 'critical': return 'error';
            case 'high': return 'error';
            case 'moderate': return 'warning';
            case 'low': return 'note';
            default: return 'note';
        }
    }

    checkFailureConditions() {
        const { summary } = this.results;

        // Fail build if there are critical vulnerabilities
        if (summary.criticalVulnerabilities > 0) {
            console.error(`❌ Build failed: ${summary.criticalVulnerabilities} critical vulnerabilities found`);
            process.exit(1);
        }

        // Warn about high vulnerabilities but don't fail
        if (summary.highVulnerabilities > 0) {
            console.warn(`⚠️  Warning: ${summary.highVulnerabilities} high severity vulnerabilities found`);
        }

        console.log('✅ Security scan completed successfully');
    }
}

// Run the scanner if this script is executed directly
if (require.main === module) {
    const scanner = new SecurityScanner();
    scanner.runAllScans().catch(error => {
        console.error('❌ Security scanner failed:', error);
        process.exit(1);
    });
}

module.exports = SecurityScanner;