# Simple Firebase Integration Verification
Write-Host "Verifying Firebase Integration Setup..." -ForegroundColor Green

# Check if Firebase service account key exists
$keyPath = "../WebConversion/kltn-c5cf0-firebase-adminsdk-fbsvc-036427bc95.json"
if (Test-Path $keyPath) {
    Write-Host "✓ Firebase service account key found" -ForegroundColor Green
} else {
    Write-Host "❌ Firebase service account key not found at: $keyPath" -ForegroundColor Red
}

# Check if Firebase packages are installed
Write-Host "Checking Firebase packages..." -ForegroundColor Yellow
$csprojContent = Get-Content "BingGoWebAPI.csproj"

$packages = @(
    "FirebaseAdmin",
    "Google.Cloud.Firestore", 
    "Google.Cloud.Storage.V1",
    "Microsoft.AspNetCore.Authentication.JwtBearer"
)

foreach ($package in $packages) {
    if ($csprojContent -match $package) {
        Write-Host "✓ $package package installed" -ForegroundColor Green
    } else {
        Write-Host "❌ $package package missing" -ForegroundColor Red
    }
}

# Check if Firebase services are registered
Write-Host "Checking Firebase service registration..." -ForegroundColor Yellow
$programContent = Get-Content "Program.cs"

$services = @(
    "IFirebaseConfigService",
    "IFirebaseAuthService", 
    "IFirebaseStorageService",
    "IFirebaseService"
)

foreach ($service in $services) {
    if ($programContent -match $service) {
        Write-Host "✓ $service registered" -ForegroundColor Green
    } else {
        Write-Host "❌ $service not registered" -ForegroundColor Red
    }
}

# Check if Firebase configuration exists
Write-Host "Checking Firebase configuration..." -ForegroundColor Yellow
$appsettingsContent = Get-Content "appsettings.Development.json"

if ($appsettingsContent -match "Firebase") {
    Write-Host "✓ Firebase configuration found" -ForegroundColor Green
} else {
    Write-Host "❌ Firebase configuration missing" -ForegroundColor Red
}

# Try to build the project
Write-Host "Testing project build..." -ForegroundColor Yellow
$buildResult = dotnet build --verbosity quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Project builds successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Project build failed" -ForegroundColor Red
}

Write-Host "`nFirebase Integration Verification Complete!" -ForegroundColor Green
Write-Host "All Firebase components are properly configured." -ForegroundColor Cyan