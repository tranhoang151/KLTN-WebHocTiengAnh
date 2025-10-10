Write-Host "Checking HTTPS setup..." -ForegroundColor Green

# Check certificates
if (Test-Path ".\certs\localhost.pem") {
    Write-Host "Certificate file: OK" -ForegroundColor Green
} else {
    Write-Host "Certificate file: MISSING" -ForegroundColor Red
}

if (Test-Path ".\certs\localhost-key.pem") {
    Write-Host "Key file: OK" -ForegroundColor Green  
} else {
    Write-Host "Key file: MISSING" -ForegroundColor Red
}

# Check package.json
$packageJson = Get-Content ".\package.json" | ConvertFrom-Json
$startScript = $packageJson.scripts.start

if ($startScript -match "HTTPS=true") {
    Write-Host "HTTPS enabled: OK" -ForegroundColor Green
} else {
    Write-Host "HTTPS enabled: NO" -ForegroundColor Red
}

Write-Host "Setup complete! Run 'npm start' to use HTTPS" -ForegroundColor Cyan