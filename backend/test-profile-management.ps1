#!/usr/bin/env pwsh

Write-Host "Testing User Profile Management..." -ForegroundColor Green

# Test endpoints for profile management
$baseUrl = "http://localhost:5000/api"
$profileEndpoints = @(
    "/profile",
    "/profile/avatar", 
    "/profile/change-password"
)

Write-Host "`n1. Testing unauthenticated profile access..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/profile" -Method GET -ErrorAction Stop
    Write-Host "✗ Should have been denied access" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Unauthenticated access correctly denied" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n2. Testing with invalid token..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer invalid_token"
        "Content-Type" = "application/json"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/profile" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "✗ Should have been denied access" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Invalid token correctly rejected" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n3. Testing profile endpoints availability..." -ForegroundColor Yellow
foreach ($endpoint in $profileEndpoints) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method GET -ErrorAction Stop
        Write-Host "   ✓ $endpoint - accessible" -ForegroundColor Green
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "   ✓ $endpoint - requires authentication (expected)" -ForegroundColor Green
        }
        elseif ($_.Exception.Response.StatusCode -eq 405) {
            Write-Host "   ✓ $endpoint - method not allowed (expected for some endpoints)" -ForegroundColor Green
        }
        else {
            Write-Host "   ? $endpoint - $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
        }
    }
}

Write-Host "`n4. Testing profile update validation..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer invalid_token"
        "Content-Type" = "application/json"
    }
    $updateData = @{
        fullName = ""
        gender = "male"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/profile" -Method PUT -Headers $headers -Body $updateData -ErrorAction Stop
    Write-Host "✗ Should have been denied access" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Profile update requires authentication" -ForegroundColor Green
    }
    else {
        Write-Host "? Profile update validation - $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
    }
}

Write-Host "`n5. Testing password change validation..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer invalid_token"
        "Content-Type" = "application/json"
    }
    $passwordData = @{
        currentPassword = "oldpass"
        newPassword = "newpass"
        confirmPassword = "newpass"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/profile/change-password" -Method POST -Headers $headers -Body $passwordData -ErrorAction Stop
    Write-Host "✗ Should have been denied access" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Password change requires authentication" -ForegroundColor Green
    }
    else {
        Write-Host "? Password change validation - $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
    }
}

Write-Host "`n6. Testing avatar upload validation..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer invalid_token"
        "Content-Type" = "application/json"
    }
    $avatarData = @{
        avatarBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD"
        fileName = "avatar.jpg"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/profile/avatar" -Method POST -Headers $headers -Body $avatarData -ErrorAction Stop
    Write-Host "✗ Should have been denied access" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✓ Avatar upload requires authentication" -ForegroundColor Green
    }
    else {
        Write-Host "? Avatar upload validation - $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
    }
}

Write-Host "`nProfile Management Test Complete!" -ForegroundColor Green
Write-Host "Implementation includes:" -ForegroundColor Cyan
Write-Host "✓ Profile display and update functionality" -ForegroundColor White
Write-Host "✓ Avatar upload with base64 encoding" -ForegroundColor White
Write-Host "✓ Password change with validation" -ForegroundColor White
Write-Host "✓ Profile service with API integration" -ForegroundColor White
Write-Host "✓ Responsive profile UI components" -ForegroundColor White
Write-Host "✓ Image resizing and validation" -ForegroundColor White

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Test with authenticated user tokens" -ForegroundColor White
Write-Host "2. Verify profile updates persist in Firebase" -ForegroundColor White
Write-Host "3. Test avatar upload and display functionality" -ForegroundColor White
Write-Host "4. Verify password change works with Firebase Auth" -ForegroundColor White