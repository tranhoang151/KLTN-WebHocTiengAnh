#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Test runner script for backend unit tests

.DESCRIPTION
    Provides options for running different types of tests for the ASP.NET Core backend

.PARAMETER Coverage
    Generate code coverage report

.PARAMETER Verbose
    Run tests with verbose output

.PARAMETER Filter
    Filter tests by name pattern

.PARAMETER Logger
    Specify test logger (console, trx, html)

.PARAMETER Configuration
    Build configuration (Debug or Release)

.EXAMPLE
    .\test.ps1 -Coverage -Verbose
    
.EXAMPLE
    .\test.ps1 -Filter "AuthController" -Logger "console"
#>

param(
    [switch]$Coverage,
    [switch]$Verbose,
    [string]$Filter = "",
    [string]$Logger = "console",
    [string]$Configuration = "Debug"
)

Write-Host "🧪 Running backend unit tests..." -ForegroundColor Cyan
Write-Host "📁 Test project: Tests/BingGoWebAPI.Tests.csproj" -ForegroundColor Gray

# Build the test arguments
$testArgs = @()

if ($Coverage) {
    $testArgs += "--collect:`"XPlat Code Coverage`""
    Write-Host "📊 Coverage report will be generated" -ForegroundColor Yellow
}

if ($Verbose) {
    $testArgs += "--verbosity", "detailed"
}

if ($Filter) {
    $testArgs += "--filter", $Filter
    Write-Host "🔍 Filtering tests: $Filter" -ForegroundColor Yellow
}

if ($Logger) {
    $testArgs += "--logger", $Logger
}

$testArgs += "--configuration", $Configuration
$testArgs += "--no-build"

# First, build the solution
Write-Host "🔨 Building solution..." -ForegroundColor Yellow
try {
    dotnet build --configuration $Configuration --verbosity quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit $LASTEXITCODE
    }
    Write-Host "✅ Build successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Build error: $_" -ForegroundColor Red
    exit 1
}

# Run the tests
Write-Host "🚀 Running tests..." -ForegroundColor Yellow
try {
    $testCommand = "dotnet test Tests/BingGoWebAPI.Tests.csproj " + ($testArgs -join " ")
    Write-Host "Command: $testCommand" -ForegroundColor Gray
    
    Invoke-Expression $testCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ All tests passed!" -ForegroundColor Green
        
        if ($Coverage) {
            Write-Host "📊 Coverage report generated in TestResults/" -ForegroundColor Cyan
            
            # Try to generate HTML coverage report if reportgenerator is available
            if (Get-Command "reportgenerator" -ErrorAction SilentlyContinue) {
                Write-Host "📈 Generating HTML coverage report..." -ForegroundColor Yellow
                reportgenerator -reports:"TestResults/*/coverage.cobertura.xml" -targetdir:"TestResults/CoverageReport" -reporttypes:Html
                Write-Host "📋 HTML report available at: TestResults/CoverageReport/index.html" -ForegroundColor Cyan
            } else {
                Write-Host "💡 Install reportgenerator for HTML coverage reports: dotnet tool install -g dotnet-reportgenerator-globaltool" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "❌ Some tests failed" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "❌ Test execution error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Test execution completed!" -ForegroundColor Green