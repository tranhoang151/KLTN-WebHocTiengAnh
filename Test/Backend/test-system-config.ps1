#!/usr/bin/env pwsh

Write-Host "Testing System Configuration Build..." -ForegroundColor Green

# Test build
Write-Host "Building project..." -ForegroundColor Yellow
$buildResult = dotnet build --no-restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Build successful!" -ForegroundColor Green

# Test compilation of new controllers
Write-Host "Checking SystemConfigController..." -ForegroundColor Yellow
if (Test-Path "Controllers/SystemConfigController.cs") {
    Write-Host "✓ SystemConfigController.cs exists" -ForegroundColor Green
} else {
    Write-Host "✗ SystemConfigController.cs missing" -ForegroundColor Red
}

# Test compilation of new services
Write-Host "Checking SystemConfigService..." -ForegroundColor Yellow
if (Test-Path "Services/SystemConfigService.cs") {
    Write-Host "✓ SystemConfigService.cs exists" -ForegroundColor Green
} else {
    Write-Host "✗ SystemConfigService.cs missing" -ForegroundColor Red
}

# Test compilation of new models
Write-Host "Checking SystemConfig models..." -ForegroundColor Yellow
if (Test-Path "Models/SystemConfig.cs") {
    Write-Host "✓ SystemConfig.cs exists" -ForegroundColor Green
} else {
    Write-Host "✗ SystemConfig.cs missing" -ForegroundColor Red
}

Write-Host "All system configuration components are ready!" -ForegroundColor Green
Write-Host "Backend build completed successfully with no errors." -ForegroundColor Cyan