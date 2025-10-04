#!/usr/bin/env pwsh

param(
    [string]$BackupFile = "backup.json",
    [string]$ApiUrl = "http://localhost:5000"
)

Write-Host "BingGo Data Migration Script" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Check if backup file exists
if (-not (Test-Path $BackupFile)) {
    Write-Host "Error: Backup file '$BackupFile' not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Using backup file: $BackupFile" -ForegroundColor Yellow
Write-Host "API URL: $ApiUrl" -ForegroundColor Yellow

# Wait for API to be ready
Write-Host "Checking if API is ready..." -ForegroundColor Yellow
$maxRetries = 30
$retryCount = 0

do {
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/api/migration/summary" -Method GET -TimeoutSec 5
        Write-Host "API is ready!" -ForegroundColor Green
        break
    }
    catch {
        $retryCount++
        if ($retryCount -ge $maxRetries) {
            Write-Host "Error: API is not responding after $maxRetries attempts" -ForegroundColor Red
            exit 1
        }
        Write-Host "API not ready, waiting... (attempt $retryCount/$maxRetries)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
} while ($retryCount -lt $maxRetries)

# Start migration
Write-Host "Starting data migration..." -ForegroundColor Yellow

try {
    $migrationResponse = Invoke-RestMethod -Uri "$ApiUrl/api/migration/migrate?backupFile=$BackupFile" -Method POST -TimeoutSec 300
    
    if ($migrationResponse.success) {
        Write-Host "Migration completed successfully!" -ForegroundColor Green
        Write-Host "Migration Summary:" -ForegroundColor Cyan
        
        foreach ($item in $migrationResponse.summary.PSObject.Properties) {
            Write-Host "  $($item.Name): $($item.Value) documents" -ForegroundColor White
        }
    }
    else {
        Write-Host "Migration failed: $($migrationResponse.message)" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "Error during migration: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Validate data integrity
Write-Host "Validating data integrity..." -ForegroundColor Yellow

try {
    $validationResponse = Invoke-RestMethod -Uri "$ApiUrl/api/migration/validate" -Method POST -TimeoutSec 60
    
    if ($validationResponse.valid) {
        Write-Host "Data integrity validation passed!" -ForegroundColor Green
        Write-Host "Final Summary:" -ForegroundColor Cyan
        
        foreach ($item in $validationResponse.summary.PSObject.Properties) {
            Write-Host "  $($item.Name): $($item.Value) documents" -ForegroundColor White
        }
    }
    else {
        Write-Host "Data integrity validation failed!" -ForegroundColor Red
        Write-Host "Please check the logs for more details." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "Error during validation: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Migration process completed!" -ForegroundColor Green