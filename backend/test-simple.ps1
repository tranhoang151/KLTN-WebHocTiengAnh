Write-Host "Testing BingGo Backend Build" -ForegroundColor Green

Write-Host "Building project..." -ForegroundColor Yellow
dotnet build --no-restore

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful!" -ForegroundColor Green
    
    Write-Host "Checking key files..." -ForegroundColor Yellow
    
    if (Test-Path "Controllers/MigrationController.cs") {
        Write-Host "✓ MigrationController exists" -ForegroundColor Green
    }
    
    if (Test-Path "Services/DataMigrationService.cs") {
        Write-Host "✓ DataMigrationService exists" -ForegroundColor Green
    }
    
    if (Test-Path "backup.json") {
        Write-Host "✓ backup.json exists" -ForegroundColor Green
    }
    
    Write-Host "Backend is ready for testing!" -ForegroundColor Green
} else {
    Write-Host "✗ Build failed!" -ForegroundColor Red
}