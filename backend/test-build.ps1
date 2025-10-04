#!/usr/bin/env pwsh

Write-Host "Testing BingGo Backend Build and Basic Functionality" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green

# Test build
Write-Host "1. Testing build..." -ForegroundColor Yellow
$buildResult = dotnet build --no-restore
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful" -ForegroundColor Green
} else {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}

# Test project structure
Write-Host "2. Checking project structure..." -ForegroundColor Yellow

$requiredFiles = @(
    "Program.cs",
    "BingGoWebAPI.csproj",
    "Controllers/MigrationController.cs",
    "Services/DataMigrationService.cs",
    "Models/User.cs",
    "Models/Course.cs",
    "Models/Class.cs",
    "Models/Badge.cs",
    "Models/Test.cs",
    "Models/Video.cs"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "✗ $file missing" -ForegroundColor Red
    }
}

# Test configuration files
Write-Host "3. Checking configuration..." -ForegroundColor Yellow

if (Test-Path "appsettings.json") {
    Write-Host "✓ appsettings.json exists" -ForegroundColor Green
} else {
    Write-Host "⚠ appsettings.json missing" -ForegroundColor Yellow
}

if (Test-Path "../WebConversion/kltn-c5cf0-firebase-adminsdk-fbsvc-036427bc95.json") {
    Write-Host "✓ Firebase service account key found" -ForegroundColor Green
} else {
    Write-Host "⚠ Firebase service account key not found" -ForegroundColor Yellow
}

# Test backup files
Write-Host "4. Checking backup files..." -ForegroundColor Yellow

if (Test-Path "backup.json") {
    Write-Host "✓ backup.json exists" -ForegroundColor Green
    
    $backup = Get-Content "backup.json" | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($backup) {
        $collections = @("badges", "courses", "classes", "users", "flashcard_sets", "flashcards", "exercises", "questions")
        
        foreach ($collection in $collections) {
            $collectionData = $backup.$collection
            if ($collectionData) {
                Write-Host "  ✓ ${collection}: $($collectionData.Count) items" -ForegroundColor Cyan
            } else {
                Write-Host "  ⚠ ${collection}: not found" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "  ✗ Invalid JSON format" -ForegroundColor Red
    }
} else {
    Write-Host "⚠ backup.json missing" -ForegroundColor Yellow
}

Write-Host "" -ForegroundColor White
Write-Host "Build test completed!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure Firebase credentials if needed" -ForegroundColor White
Write-Host "2. Run 'dotnet run' to start the API server" -ForegroundColor White
Write-Host "3. Test migration with '../scripts/migrate-data.ps1'" -ForegroundColor White