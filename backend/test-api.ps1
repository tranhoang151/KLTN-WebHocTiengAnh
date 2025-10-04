# Test script for BingGo Web API
Write-Host "Testing BingGo Web API..." -ForegroundColor Green

# Start the API in background
Write-Host "Starting API server..." -ForegroundColor Yellow
$apiProcess = Start-Process -FilePath "dotnet" -ArgumentList "run", "--urls=http://localhost:5000", "--no-launch-profile" -PassThru -WindowStyle Hidden

# Wait for API to start
Write-Host "Waiting for API to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

try {
    # Test health endpoint
    Write-Host "Testing health endpoint..." -ForegroundColor Yellow
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -UseBasicParsing
    Write-Host "Health endpoint status: $($healthResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Health response: $($healthResponse.Content)" -ForegroundColor Cyan

    # Test Firebase health endpoint
    Write-Host "Testing Firebase health endpoint..." -ForegroundColor Yellow
    $firebaseHealthResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/health/firebase" -Method GET -UseBasicParsing
    Write-Host "Firebase health endpoint status: $($firebaseHealthResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Firebase health response: $($firebaseHealthResponse.Content)" -ForegroundColor Cyan

    Write-Host "API tests completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "API test failed: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    # Stop the API process
    if ($apiProcess -and !$apiProcess.HasExited) {
        Write-Host "Stopping API server..." -ForegroundColor Yellow
        $apiProcess.Kill()
        $apiProcess.WaitForExit(5000)
    }
}

Write-Host "Test completed." -ForegroundColor Green