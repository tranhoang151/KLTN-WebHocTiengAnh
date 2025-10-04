#!/usr/bin/env pwsh

Write-Host "BingGo Development Environment Validation" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

$errors = @()

# Check Docker
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker: $dockerVersion" -ForegroundColor Green
}
catch {
    $errors += "Docker is not installed or not accessible"
    Write-Host "✗ Docker: Not found" -ForegroundColor Red
}

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
}
catch {
    $errors += "Node.js is not installed or not accessible"
    Write-Host "✗ Node.js: Not found" -ForegroundColor Red
}

# Check .NET
Write-Host "Checking .NET SDK..." -ForegroundColor Yellow
try {
    $dotnetVersion = dotnet --version
    Write-Host "✓ .NET SDK: $dotnetVersion" -ForegroundColor Green
}
catch {
    $errors += ".NET SDK is not installed or not accessible"
    Write-Host "✗ .NET SDK: Not found" -ForegroundColor Red
}

# Check environment files
Write-Host "Checking environment files..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "✓ Root .env file exists" -ForegroundColor Green
} else {
    $errors += "Root .env file is missing"
    Write-Host "✗ Root .env file missing" -ForegroundColor Red
}

if (Test-Path "backend/.env") {
    Write-Host "✓ Backend .env file exists" -ForegroundColor Green
} else {
    $errors += "Backend .env file is missing"
    Write-Host "✗ Backend .env file missing" -ForegroundColor Red
}

# Check backup files
Write-Host "Checking backup files..." -ForegroundColor Yellow

if (Test-Path "backend/backup.json") {
    Write-Host "✓ Backend backup.json exists" -ForegroundColor Green
} else {
    Write-Host "⚠ Backend backup.json missing (optional)" -ForegroundColor Yellow
}

if (Test-Path "WebConversion/backup.json") {
    Write-Host "✓ WebConversion backup.json exists" -ForegroundColor Green
} else {
    Write-Host "⚠ WebConversion backup.json missing (optional)" -ForegroundColor Yellow
}

# Check project files
Write-Host "Checking project files..." -ForegroundColor Yellow

if (Test-Path "frontend/package.json") {
    Write-Host "✓ Frontend package.json exists" -ForegroundColor Green
} else {
    $errors += "Frontend package.json is missing"
    Write-Host "✗ Frontend package.json missing" -ForegroundColor Red
}

if (Test-Path "backend/BingGoWebAPI.csproj") {
    Write-Host "✓ Backend project file exists" -ForegroundColor Green
} else {
    $errors += "Backend project file is missing"
    Write-Host "✗ Backend BingGoWebAPI.csproj missing" -ForegroundColor Red
}

if (Test-Path "docker-compose.yml") {
    Write-Host "✓ Docker Compose file exists" -ForegroundColor Green
} else {
    $errors += "Docker Compose file is missing"
    Write-Host "✗ docker-compose.yml missing" -ForegroundColor Red
}

# Check VS Code configuration
Write-Host "Checking VS Code configuration..." -ForegroundColor Yellow

if (Test-Path ".vscode/launch.json") {
    Write-Host "✓ VS Code launch configuration exists" -ForegroundColor Green
} else {
    Write-Host "⚠ VS Code launch.json missing (optional)" -ForegroundColor Yellow
}

if (Test-Path ".vscode/tasks.json") {
    Write-Host "✓ VS Code tasks configuration exists" -ForegroundColor Green
} else {
    Write-Host "⚠ VS Code tasks.json missing (optional)" -ForegroundColor Yellow
}

# Summary
Write-Host "" -ForegroundColor White
if ($errors.Count -eq 0) {
    Write-Host "✓ All checks passed! Your development environment is ready." -ForegroundColor Green
    Write-Host "" -ForegroundColor White
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Configure your .env files with Firebase credentials" -ForegroundColor White
    Write-Host "2. Run 'docker-compose up' to start the development environment" -ForegroundColor White
    Write-Host "3. Run './scripts/migrate-data.ps1' to migrate your data" -ForegroundColor White
} else {
    Write-Host "✗ Setup validation failed with $($errors.Count) error(s):" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
    Write-Host "" -ForegroundColor White
    Write-Host "Please fix the above issues and run this script again." -ForegroundColor Yellow
}