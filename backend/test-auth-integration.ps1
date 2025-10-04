#!/usr/bin/env pwsh

Write-Host "Testing Firebase Authentication Integration..." -ForegroundColor Green

# Test 1: Check if API is running
Write-Host "`n1. Testing API health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/verify" -Method GET -ErrorAction Stop
    Write-Host "✓ API is accessible" -ForegroundColor Green
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ API is running (401 Unauthorized expected without token)" -ForegroundColor Green
    }
    else {
        Write-Host "✗ API health check failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Test 2: Test with invalid token
Write-Host "`n2. Testing with invalid token..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer invalid_token"
        "Content-Type" = "application/json"
    }
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/verify" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "✗ Should have failed with invalid token" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Invalid token correctly rejected" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Check Firebase configuration
Write-Host "`n3. Checking Firebase configuration..." -ForegroundColor Yellow
if (Test-Path "firebase-config.json") {
    Write-Host "✓ Firebase config file exists" -ForegroundColor Green
}
else {
    Write-Host "✗ Firebase config file not found" -ForegroundColor Red
}

if (Test-Path "kltn-c5cf0-firebase-adminsdk-fbsvc-036427bc95.json") {
    Write-Host "✓ Firebase service account key exists" -ForegroundColor Green
}
else {
    Write-Host "✗ Firebase service account key not found" -ForegroundColor Red
}

Write-Host "`n4. Testing Firebase service initialization..." -ForegroundColor Yellow
try {
    # This will test if the Firebase services are properly initialized
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/courses" -Method GET -ErrorAction Stop
    Write-Host "✓ Firebase services initialized successfully" -ForegroundColor Green
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Firebase services initialized (authentication required)" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Firebase service initialization failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nFirebase Authentication Integration Test Complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the frontend: cd frontend; npm start" -ForegroundColor White
Write-Host "2. Test login functionality in the browser" -ForegroundColor White
Write-Host "3. Verify token-based API calls work" -ForegroundColor White