Write-Host "Testing Backend Build..." -ForegroundColor Green

dotnet build --no-restore

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host "System Configuration components added successfully!" -ForegroundColor Cyan
} else {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}