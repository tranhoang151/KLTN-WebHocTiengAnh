#!/usr/bin/env pwsh

Write-Host "BingGo Development Environment Setup" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "Docker found: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "Error: Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "Please edit .env file with your Firebase configuration before continuing." -ForegroundColor Red
    Write-Host "Press any key to continue after editing .env file..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Check if backend .env file exists
if (-not (Test-Path "backend/.env")) {
    Write-Host "Creating backend .env file from template..." -ForegroundColor Yellow
    Copy-Item "backend/.env.example" "backend/.env"
    Write-Host "Please edit backend/.env file with your Firebase configuration." -ForegroundColor Yellow
}

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
try {
    npm install
    Write-Host "Frontend dependencies installed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error installing frontend dependencies: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Set-Location ..
}

# Restore backend dependencies
Write-Host "Restoring backend dependencies..." -ForegroundColor Yellow
Set-Location backend
try {
    dotnet restore
    Write-Host "Backend dependencies restored successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error restoring backend dependencies: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    Set-Location ..
}

# Build Docker images
Write-Host "Building Docker images..." -ForegroundColor Yellow
try {
    docker-compose build
    Write-Host "Docker images built successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error building Docker images: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Development environment setup completed!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure your .env files are configured with Firebase credentials" -ForegroundColor White
Write-Host "2. Run 'docker-compose up' to start the development environment" -ForegroundColor White
Write-Host "3. Run './scripts/migrate-data.ps1' to migrate your data" -ForegroundColor White
Write-Host "4. Access the application at http://localhost:3000" -ForegroundColor White