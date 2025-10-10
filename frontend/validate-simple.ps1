# Simple frontend validation script
Write-Host "Frontend Validation Starting..." -ForegroundColor Cyan

$errors = 0

# Check if build works
Write-Host "Testing build process..." -ForegroundColor Yellow
try {
    npm run build | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "❌ Build error: $($_.Exception.Message)" -ForegroundColor Red
    $errors++
}

# Check critical files
Write-Host "Checking critical files..." -ForegroundColor Yellow
$criticalFiles = @(
    "src/index.tsx",
    "src/App.tsx",
    "package.json",
    "tsconfig.json"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
        $errors++
    }
}

# Summary
if ($errors -eq 0) {
    Write-Host ""
    Write-Host "🎉 Frontend validation passed!" -ForegroundColor Green
    Write-Host "✅ Ready for production deployment" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Frontend validation failed with $errors errors" -ForegroundColor Red
}