#!/usr/bin/env pwsh

Write-Host "Testing Data Migration Service" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

# Build the project
Write-Host "Building the project..." -ForegroundColor Yellow
try {
    dotnet build
    Write-Host "✓ Build successful" -ForegroundColor Green
}
catch {
    Write-Host "✗ Build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check if backup file exists
if (-not (Test-Path "backup.json")) {
    Write-Host "⚠ backup.json not found, creating a minimal test file..." -ForegroundColor Yellow
    
    $testData = @{
        badges = @(
            @{
                id = "test-badge-1"
                name = "Test Badge"
                description = "A test badge"
                imageUrl = "https://example.com/badge.png"
                earned = $false
            }
        )
        courses = @(
            @{
                id = "test-course-1"
                name = "Test Course"
                description = "A test course"
                image_url = "https://example.com/course.png"
                created_at = @{
                    _seconds = [int][double]::Parse((Get-Date -UFormat %s))
                    _nanoseconds = 0
                }
            }
        )
        classes = @()
        users = @()
        flashcard_sets = @()
        flashcards = @()
        exercises = @()
        questions = @()
        tests = @()
        videos = @()
    }
    
    $testData | ConvertTo-Json -Depth 10 | Out-File -FilePath "backup.json" -Encoding UTF8
    Write-Host "✓ Test backup.json created" -ForegroundColor Green
}

# Start the application in background
Write-Host "Starting the application..." -ForegroundColor Yellow
$process = Start-Process -FilePath "dotnet" -ArgumentList "run" -PassThru -NoNewWindow

# Wait for the application to start
Start-Sleep -Seconds 10

try {
    # Test the migration endpoint
    Write-Host "Testing migration endpoint..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/migration/migrate?backupFile=backup.json" -Method POST -TimeoutSec 30
    
    if ($response.success) {
        Write-Host "✓ Migration test successful!" -ForegroundColor Green
        Write-Host "Migration summary:" -ForegroundColor Cyan
        $response.summary | Format-Table -AutoSize
    }
    else {
        Write-Host "✗ Migration test failed: $($response.message)" -ForegroundColor Red
    }
    
    # Test validation endpoint
    Write-Host "Testing validation endpoint..." -ForegroundColor Yellow
    
    $validationResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/migration/validate" -Method POST -TimeoutSec 30
    
    if ($validationResponse.valid) {
        Write-Host "✓ Validation test successful!" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Validation test failed" -ForegroundColor Red
    }
}
catch {
    Write-Host "✗ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    # Stop the application
    Write-Host "Stopping the application..." -ForegroundColor Yellow
    if ($process -and !$process.HasExited) {
        $process.Kill()
        $process.WaitForExit(5000)
    }
    
    # Clean up test file
    if (Test-Path "backup.json" -and (Get-Content "backup.json" | ConvertFrom-Json).badges[0].id -eq "test-badge-1") {
        Remove-Item "backup.json"
        Write-Host "✓ Test backup.json cleaned up" -ForegroundColor Green
    }
}

Write-Host "Migration service test completed!" -ForegroundColor Green