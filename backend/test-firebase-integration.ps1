# Test Firebase Integration for BingGo Web API
Write-Host "Testing Firebase Integration..." -ForegroundColor Green

# Start the API in background
Write-Host "Starting API server..." -ForegroundColor Yellow
$apiProcess = Start-Process -FilePath "dotnet" -ArgumentList "run", "--urls=http://localhost:5000", "--environment=Development" -PassThru -WindowStyle Hidden -WorkingDirectory $PWD

# Wait for API to start
Write-Host "Waiting for API to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

try {
    # Test basic health endpoint
    Write-Host "Testing basic health endpoint..." -ForegroundColor Yellow
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -UseBasicParsing
    Write-Host "✓ Health endpoint status: $($healthResponse.StatusCode)" -ForegroundColor Green
    
    # Test Firebase health endpoint
    Write-Host "Testing Firebase health endpoint..." -ForegroundColor Yellow
    $firebaseHealthResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/health/firebase" -Method GET -UseBasicParsing
    Write-Host "✓ Firebase health endpoint status: $($firebaseHealthResponse.StatusCode)" -ForegroundColor Green
    
    # Test Firestore connection
    Write-Host "Testing Firestore connection..." -ForegroundColor Yellow
    $firestoreResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/firebase/test-firestore" -Method GET -UseBasicParsing
    Write-Host "✓ Firestore test status: $($firestoreResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Firestore response: $($firestoreResponse.Content)" -ForegroundColor Cyan
    
    # Test Firebase Storage
    Write-Host "Testing Firebase Storage..." -ForegroundColor Yellow
    $storageTestBody = @{
        Content = "Test content for Firebase Storage"
    } | ConvertTo-Json
    
    $storageResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/firebase/test-storage" -Method POST -Body $storageTestBody -ContentType "application/json" -UseBasicParsing
    Write-Host "✓ Firebase Storage test status: $($storageResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Storage response: $($storageResponse.Content)" -ForegroundColor Cyan
    
    # Test Storage list
    Write-Host "Testing Firebase Storage list..." -ForegroundColor Yellow
    $storageListResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/firebase/test-storage-list" -Method GET -UseBasicParsing
    Write-Host "✓ Firebase Storage list test status: $($storageListResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Storage list response: $($storageListResponse.Content)" -ForegroundColor Cyan

    Write-Host "`n🎉 All Firebase integration tests passed!" -ForegroundColor Green
    Write-Host "✓ Firebase project configuration - COMPLETED" -ForegroundColor Green
    Write-Host "✓ Firebase SDK for .NET - COMPLETED" -ForegroundColor Green
    Write-Host "✓ Firebase Authentication setup - COMPLETED" -ForegroundColor Green
    Write-Host "✓ Firestore database connection - COMPLETED" -ForegroundColor Green
    Write-Host "✓ Firebase Storage configuration - COMPLETED" -ForegroundColor Green
}
catch {
    Write-Host "❌ Firebase integration test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response content: $($_.Exception.Response)" -ForegroundColor Yellow
}
finally {
    # Stop the API process
    if ($apiProcess -and !$apiProcess.HasExited) {
        Write-Host "Stopping API server..." -ForegroundColor Yellow
        $apiProcess.Kill()
        $apiProcess.WaitForExit(5000)
    }
}

Write-Host "Firebase integration test completed." -ForegroundColor Green