# Integration Test Runner Script for BingGo Web Application
# This script runs both backend and frontend integration tests

param(
    [string]$Component = "all",  # Options: "backend", "frontend", "all"
    [switch]$Coverage = $false,
    [switch]$Verbose = $false,
    [switch]$Watch = $false,
    [string]$Filter = ""
)

Write-Host "🧪 BingGo Integration Test Runner" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"
$startTime = Get-Date

# Function to check if a command exists
function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Function to run backend integration tests
function Run-BackendIntegrationTests {
    Write-Host "🔧 Running Backend Integration Tests..." -ForegroundColor Yellow
    
    Push-Location "backend"
    
    try {
        # Build the project first
        Write-Host "📦 Building backend project..." -ForegroundColor Blue
        dotnet build --configuration Release
        
        if ($LASTEXITCODE -ne 0) {
            throw "Backend build failed"
        }
        
        # Prepare test command
        $testCommand = "dotnet test Tests/BingGoWebAPI.Tests.csproj"
        
        # Add filter for integration tests
        $testCommand += " --filter Category=Integration"
        
        # Add user filter if provided
        if ($Filter) {
            $testCommand += " --filter `"Category=Integration&FullyQualifiedName~$Filter`""
        }
        
        # Add coverage if requested
        if ($Coverage) {
            $testCommand += " --collect:`"XPlat Code Coverage`" --results-directory TestResults"
        }
        
        # Add verbose output if requested
        if ($Verbose) {
            $testCommand += " --verbosity detailed"
        }
        
        # Add watch mode if requested
        if ($Watch) {
            $testCommand += " --watch"
        }
        
        Write-Host "Executing: $testCommand" -ForegroundColor Gray
        Invoke-Expression $testCommand
        
        if ($LASTEXITCODE -ne 0) {
            throw "Backend integration tests failed"
        }
        
        Write-Host "✅ Backend integration tests completed successfully" -ForegroundColor Green
        
        # Generate coverage report if requested
        if ($Coverage) {
            Write-Host "📊 Generating backend coverage report..." -ForegroundColor Blue
            
            if (Test-Command "reportgenerator") {
                reportgenerator -reports:"TestResults/**/coverage.cobertura.xml" -targetdir:"TestResults/CoverageReport" -reporttypes:Html
                Write-Host "📈 Backend coverage report generated at: TestResults/CoverageReport/index.html" -ForegroundColor Green
            } else {
                Write-Host "⚠️  ReportGenerator not found. Install with: dotnet tool install -g dotnet-reportgenerator-globaltool" -ForegroundColor Yellow
            }
        }
        
    } catch {
        Write-Host "❌ Backend integration tests failed: $_" -ForegroundColor Red
        throw
    } finally {
        Pop-Location
    }
}

# Function to run frontend integration tests
function Run-FrontendIntegrationTests {
    Write-Host "⚛️  Running Frontend Integration Tests..." -ForegroundColor Yellow
    
    Push-Location "frontend"
    
    try {
        # Check if dependencies are installed
        if (!(Test-Path "node_modules")) {
            Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
            npm install
            
            if ($LASTEXITCODE -ne 0) {
                throw "Frontend dependency installation failed"
            }
        }
        
        # Prepare test command
        $testCommand = "npm run test:integration"
        
        # Add coverage if requested
        if ($Coverage) {
            $testCommand += " -- --coverage"
        }
        
        # Add watch mode if requested
        if ($Watch) {
            $testCommand += " -- --watch"
        }
        
        # Add filter if provided
        if ($Filter) {
            $testCommand += " -- --testNamePattern=`"$Filter`""
        }
        
        # Add verbose output if requested
        if ($Verbose) {
            $testCommand += " -- --verbose"
        }
        
        Write-Host "Executing: $testCommand" -ForegroundColor Gray
        Invoke-Expression $testCommand
        
        if ($LASTEXITCODE -ne 0) {
            throw "Frontend integration tests failed"
        }
        
        Write-Host "✅ Frontend integration tests completed successfully" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Frontend integration tests failed: $_" -ForegroundColor Red
        throw
    } finally {
        Pop-Location
    }
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Blue
    
    $missing = @()
    
    # Check .NET
    if (!(Test-Command "dotnet")) {
        $missing += ".NET SDK"
    }
    
    # Check Node.js
    if (!(Test-Command "node")) {
        $missing += "Node.js"
    }
    
    # Check npm
    if (!(Test-Command "npm")) {
        $missing += "npm"
    }
    
    # Check Firebase CLI (optional but recommended)
    if (!(Test-Command "firebase")) {
        Write-Host "⚠️  Firebase CLI not found. Some integration tests may be skipped." -ForegroundColor Yellow
        Write-Host "   Install with: npm install -g firebase-tools" -ForegroundColor Gray
    }
    
    if ($missing.Count -gt 0) {
        Write-Host "❌ Missing prerequisites: $($missing -join ', ')" -ForegroundColor Red
        throw "Please install missing prerequisites before running tests"
    }
    
    Write-Host "✅ All prerequisites found" -ForegroundColor Green
}

# Function to setup test environment
function Initialize-TestEnvironment {
    Write-Host "🛠️  Setting up test environment..." -ForegroundColor Blue
    
    # Set environment variables
    $env:NODE_ENV = "test"
    $env:ASPNETCORE_ENVIRONMENT = "Testing"
    
    # Create test results directories
    if (!(Test-Path "TestResults")) {
        New-Item -ItemType Directory -Path "TestResults" | Out-Null
    }
    
    Write-Host "✅ Test environment ready" -ForegroundColor Green
}

# Main execution
try {
    Test-Prerequisites
    Initialize-TestEnvironment
    
    switch ($Component.ToLower()) {
        "backend" {
            Run-BackendIntegrationTests
        }
        "frontend" {
            Run-FrontendIntegrationTests
        }
        "all" {
            Run-BackendIntegrationTests
            Run-FrontendIntegrationTests
        }
        default {
            throw "Invalid component: $Component. Use 'backend', 'frontend', or 'all'"
        }
    }
    
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host ""
    Write-Host "🎉 All integration tests completed successfully!" -ForegroundColor Green
    Write-Host "⏱️  Total time: $($duration.ToString('mm\:ss'))" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "💥 Integration tests failed: $_" -ForegroundColor Red
    exit 1
}

# Usage examples:
# .\scripts\run-integration-tests.ps1                          # Run all tests
# .\scripts\run-integration-tests.ps1 -Component backend       # Run only backend tests
# .\scripts\run-integration-tests.ps1 -Component frontend      # Run only frontend tests
# .\scripts\run-integration-tests.ps1 -Coverage                # Run with coverage
# .\scripts\run-integration-tests.ps1 -Filter "Auth"          # Run tests matching "Auth"
# .\scripts\run-integration-tests.ps1 -Watch                   # Run in watch mode
# .\scripts\run-integration-tests.ps1 -Verbose                 # Run with verbose output