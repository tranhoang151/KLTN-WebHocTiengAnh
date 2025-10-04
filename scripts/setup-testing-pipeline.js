#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Setup script for automated testing pipeline
 * Validates configuration and installs required dependencies
 */

class PipelineSetup {
    constructor() {
        this.checks = [];
        this.errors = [];
        this.warnings = [];
    }

    async setupPipeline() {
        console.log('🔧 Setting up automated testing pipeline...\n');

        try {
            await this.validateEnvironment();
            await this.installDependencies();
            await this.validateConfiguration();
            await this.runInitialTests();

            this.generateSetupReport();

            if (this.errors.length === 0) {
                console.log('\n✅ Automated testing pipeline setup completed successfully!');
                console.log('🚀 You can now run tests using:');
                console.log('   npm run test:ci (all tests)');
                console.log('   node scripts/run-all-tests.js (comprehensive pipeline)');
            } else {
                console.error('\n❌ Setup completed with errors. Please fix the issues above.');
                process.exit(1);
            }

        } catch (error) {
            console.error('❌ Pipeline setup failed:', error.message);
            process.exit(1);
        }
    }

    async validateEnvironment() {
        console.log('🔍 Validating environment...');

        // Check Node.js version
        try {
            const nodeVersion = process.version;
            const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

            if (majorVersion >= 16) {
                this.addCheck('✅ Node.js version', `${nodeVersion} (supported)`);
            } else {
                this.addError('❌ Node.js version', `${nodeVersion} (requires >= 16.0.0)`);
            }
        } catch (error) {
            this.addError('❌ Node.js check failed', error.message);
        }

        // Check npm version
        try {
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            this.addCheck('✅ npm version', npmVersion);
        } catch (error) {
            this.addError('❌ npm not found', 'npm is required for frontend testing');
        }

        // Check .NET version
        try {
            const dotnetVersion = execSync('dotnet --version', { encoding: 'utf8' }).trim();
            const majorVersion = parseInt(dotnetVersion.split('.')[0]);

            if (majorVersion >= 6) {
                this.addCheck('✅ .NET version', `${dotnetVersion} (supported)`);
            } else {
                this.addError('❌ .NET version', `${dotnetVersion} (requires >= 6.0.0)`);
            }
        } catch (error) {
            this.addError('❌ .NET not found', '.NET is required for backend testing');
        }

        // Check Git
        try {
            const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
            this.addCheck('✅ Git', gitVersion);
        } catch (error) {
            this.addWarning('⚠️  Git not found', 'Git is recommended for version control');
        }

        console.log('   Environment validation completed\n');
    }

    async installDependencies() {
        console.log('📦 Installing dependencies...');

        // Install frontend dependencies
        try {
            console.log('   Installing frontend dependencies...');
            execSync('npm install', {
                cwd: path.join(__dirname, '../frontend'),
                stdio: 'pipe'
            });
            this.addCheck('✅ Frontend dependencies', 'Installed successfully');
        } catch (error) {
            this.addError('❌ Frontend dependencies', 'Failed to install npm packages');
        }

        // Install backend dependencies
        try {
            console.log('   Restoring backend dependencies...');
            execSync('dotnet restore', {
                cwd: path.join(__dirname, '../backend'),
                stdio: 'pipe'
            });
            this.addCheck('✅ Backend dependencies', 'Restored successfully');
        } catch (error) {
            this.addError('❌ Backend dependencies', 'Failed to restore NuGet packages');
        }

        // Install global tools
        try {
            console.log('   Installing global testing tools...');

            // Install Lighthouse CI
            try {
                execSync('npm list -g @lhci/cli', { stdio: 'pipe' });
                this.addCheck('✅ Lighthouse CI', 'Already installed');
            } catch (error) {
                execSync('npm install -g @lhci/cli@0.12.x', { stdio: 'pipe' });
                this.addCheck('✅ Lighthouse CI', 'Installed successfully');
            }

        } catch (error) {
            this.addWarning('⚠️  Global tools', 'Some tools may not be available globally');
        }

        console.log('   Dependency installation completed\n');
    }

    async validateConfiguration() {
        console.log('⚙️  Validating configuration files...');

        const configFiles = [
            {
                path: '.github/workflows/ci.yml',
                name: 'GitHub Actions workflow',
                required: true
            },
            {
                path: 'frontend/jest.config.js',
                name: 'Jest configuration',
                required: true
            },
            {
                path: 'frontend/jest.integration.config.js',
                name: 'Integration test configuration',
                required: true
            },
            {
                path: 'frontend/.lighthouserc.json',
                name: 'Lighthouse CI configuration',
                required: false
            },
            {
                path: 'sonar-project.properties',
                name: 'SonarCloud configuration',
                required: false
            },
            {
                path: 'scripts/performance-tests.js',
                name: 'Performance test script',
                required: true
            },
            {
                path: 'scripts/security-scan.js',
                name: 'Security scan script',
                required: true
            },
            {
                path: 'scripts/coverage-report.js',
                name: 'Coverage report script',
                required: true
            }
        ];

        configFiles.forEach(config => {
            const fullPath = path.join(__dirname, '..', config.path);

            if (fs.existsSync(fullPath)) {
                this.addCheck('✅ Configuration', `${config.name} found`);
            } else if (config.required) {
                this.addError('❌ Configuration', `${config.name} missing`);
            } else {
                this.addWarning('⚠️  Configuration', `${config.name} not found (optional)`);
            }
        });

        // Validate package.json scripts
        try {
            const packageJson = JSON.parse(fs.readFileSync(
                path.join(__dirname, '../frontend/package.json'),
                'utf8'
            ));

            const requiredScripts = [
                'test:coverage',
                'test:integration:ci',
                'lint',
                'performance:test',
                'security:scan'
            ];

            requiredScripts.forEach(script => {
                if (packageJson.scripts && packageJson.scripts[script]) {
                    this.addCheck('✅ Script', `${script} configured`);
                } else {
                    this.addError('❌ Script', `${script} missing from package.json`);
                }
            });

        } catch (error) {
            this.addError('❌ Package.json', 'Could not validate frontend package.json');
        }

        console.log('   Configuration validation completed\n');
    }

    async runInitialTests() {
        console.log('🧪 Running initial test validation...');

        // Test frontend build
        try {
            console.log('   Testing frontend build...');
            execSync('npm run build', {
                cwd: path.join(__dirname, '../frontend'),
                stdio: 'pipe'
            });
            this.addCheck('✅ Frontend build', 'Build successful');
        } catch (error) {
            this.addError('❌ Frontend build', 'Build failed');
        }

        // Test backend build
        try {
            console.log('   Testing backend build...');
            execSync('dotnet build --configuration Release', {
                cwd: path.join(__dirname, '../backend'),
                stdio: 'pipe'
            });
            this.addCheck('✅ Backend build', 'Build successful');
        } catch (error) {
            this.addError('❌ Backend build', 'Build failed');
        }

        // Test frontend unit tests
        try {
            console.log('   Testing frontend unit tests...');
            execSync('npm test -- --watchAll=false --passWithNoTests', {
                cwd: path.join(__dirname, '../frontend'),
                stdio: 'pipe'
            });
            this.addCheck('✅ Frontend tests', 'Tests executable');
        } catch (error) {
            this.addWarning('⚠️  Frontend tests', 'Some tests may be failing');
        }

        // Test backend unit tests
        try {
            console.log('   Testing backend unit tests...');
            execSync('dotnet test --configuration Release', {
                cwd: path.join(__dirname, '../backend'),
                stdio: 'pipe'
            });
            this.addCheck('✅ Backend tests', 'Tests executable');
        } catch (error) {
            this.addWarning('⚠️  Backend tests', 'Some tests may be failing');
        }

        console.log('   Initial test validation completed\n');
    }

    addCheck(status, message) {
        this.checks.push({ status, message });
        console.log(`   ${status} ${message}`);
    }

    addError(status, message) {
        this.errors.push({ status, message });
        console.error(`   ${status} ${message}`);
    }

    addWarning(status, message) {
        this.warnings.push({ status, message });
        console.warn(`   ${status} ${message}`);
    }

    generateSetupReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalChecks: this.checks.length,
                errors: this.errors.length,
                warnings: this.warnings.length,
                success: this.errors.length === 0
            },
            checks: this.checks,
            errors: this.errors,
            warnings: this.warnings,
            nextSteps: this.generateNextSteps()
        };

        // Save report
        const reportPath = path.join(__dirname, '../pipeline-setup-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // Generate HTML report
        const htmlReport = this.generateHtmlSetupReport(report);
        const htmlPath = path.join(__dirname, '../pipeline-setup-report.html');
        fs.writeFileSync(htmlPath, htmlReport);

        console.log('\n📊 Setup Summary:');
        console.log(`   Total Checks: ${report.summary.totalChecks}`);
        console.log(`   Errors: ${report.summary.errors}`);
        console.log(`   Warnings: ${report.summary.warnings}`);
        console.log(`\n📄 Setup report saved to: ${reportPath}`);
    }

    generateNextSteps() {
        const steps = [];

        if (this.errors.length === 0) {
            steps.push('✅ Setup completed successfully');
            steps.push('🔧 Configure GitHub repository secrets for CI/CD');
            steps.push('🔒 Set up SonarCloud project (optional)');
            steps.push('📊 Configure Codecov for coverage reporting (optional)');
            steps.push('🚀 Push to GitHub to trigger first pipeline run');
        } else {
            steps.push('❌ Fix the errors listed above');
            steps.push('🔄 Re-run setup script after fixing issues');
        }

        return steps;
    }

    generateHtmlSetupReport(report) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Pipeline Setup Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { padding: 15px; border-radius: 5px; flex: 1; text-align: center; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .warning { background: #fff3cd; color: #856404; }
        .section { margin: 20px 0; }
        .check-item { padding: 8px; margin: 5px 0; border-radius: 3px; }
        .check-success { background: #d4edda; }
        .check-error { background: #f8d7da; }
        .check-warning { background: #fff3cd; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔧 Automated Testing Pipeline Setup Report</h1>
        <p>Generated: ${report.timestamp}</p>
    </div>
    
    <div class="summary">
        <div class="metric ${report.summary.success ? 'success' : 'error'}">
            <h3>Status</h3>
            <p style="font-size: 24px; margin: 0;">${report.summary.success ? '✅ Success' : '❌ Failed'}</p>
        </div>
        <div class="metric">
            <h3>Total Checks</h3>
            <p style="font-size: 24px; margin: 0;">${report.summary.totalChecks}</p>
        </div>
        <div class="metric error">
            <h3>Errors</h3>
            <p style="font-size: 24px; margin: 0;">${report.summary.errors}</p>
        </div>
        <div class="metric warning">
            <h3>Warnings</h3>
            <p style="font-size: 24px; margin: 0;">${report.summary.warnings}</p>
        </div>
    </div>
    
    <div class="section">
        <h2>✅ Successful Checks</h2>
        ${report.checks.map(check => `
            <div class="check-item check-success">${check.status} ${check.message}</div>
        `).join('')}
    </div>
    
    ${report.errors.length > 0 ? `
        <div class="section">
            <h2>❌ Errors</h2>
            ${report.errors.map(error => `
                <div class="check-item check-error">${error.status} ${error.message}</div>
            `).join('')}
        </div>
    ` : ''}
    
    ${report.warnings.length > 0 ? `
        <div class="section">
            <h2>⚠️ Warnings</h2>
            ${report.warnings.map(warning => `
                <div class="check-item check-warning">${warning.status} ${warning.message}</div>
            `).join('')}
        </div>
    ` : ''}
    
    <div class="section">
        <h2>📋 Next Steps</h2>
        <ul>
            ${report.nextSteps.map(step => `<li>${step}</li>`).join('')}
        </ul>
    </div>
</body>
</html>`;
    }
}

// Run the setup if this script is executed directly
if (require.main === module) {
    const setup = new PipelineSetup();
    setup.setupPipeline().catch(error => {
        console.error('❌ Pipeline setup failed:', error);
        process.exit(1);
    });
}

module.exports = PipelineSetup;