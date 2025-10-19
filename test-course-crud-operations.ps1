# Test Course CRUD Operations - Real API Testing
# This script tests the actual CRUD operations through the API

Write-Host "TESTING COURSE CRUD OPERATIONS" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# Configuration
$baseUrl = "https://localhost:7001/api"
$testCourseName = "Test Course CRUD"
$testCourseDescription = "This is a test course for CRUD operations"

Write-Host "`nConfiguration:" -ForegroundColor Yellow
Write-Host "  Base URL: $baseUrl" -ForegroundColor White
Write-Host "  Test Course Name: $testCourseName" -ForegroundColor White
Write-Host "  Test Course Description: $testCourseDescription" -ForegroundColor White

# Test 1: Create Course
Write-Host "`nTest 1: CREATE Course" -ForegroundColor Yellow
Write-Host "Testing POST /api/course" -ForegroundColor Green

$createPayload = @{
    name = $testCourseName
    description = $testCourseDescription
    image_url = ""
} | ConvertTo-Json

Write-Host "Payload: $createPayload" -ForegroundColor White

try {
    $createResponse = Invoke-RestMethod -Uri "$baseUrl/course" -Method POST -Body $createPayload -ContentType "application/json" -SkipCertificateCheck
    Write-Host "✅ CREATE SUCCESS" -ForegroundColor Green
    Write-Host "  Course ID: $($createResponse.id)" -ForegroundColor White
    Write-Host "  Course Name: $($createResponse.name)" -ForegroundColor White
    Write-Host "  Course Description: $($createResponse.description)" -ForegroundColor White
    $createdCourseId = $createResponse.id
} catch {
    Write-Host "❌ CREATE FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor White
    $createdCourseId = $null
}

# Test 2: Read Course
if ($createdCourseId) {
    Write-Host "`nTest 2: READ Course" -ForegroundColor Yellow
    Write-Host "Testing GET /api/course/$createdCourseId" -ForegroundColor Green
    
    try {
        $readResponse = Invoke-RestMethod -Uri "$baseUrl/course/$createdCourseId" -Method GET -SkipCertificateCheck
        Write-Host "✅ READ SUCCESS" -ForegroundColor Green
        Write-Host "  Course ID: $($readResponse.id)" -ForegroundColor White
        Write-Host "  Course Name: $($readResponse.name)" -ForegroundColor White
        Write-Host "  Course Description: $($readResponse.description)" -ForegroundColor White
        Write-Host "  Created At: $($readResponse.created_at)" -ForegroundColor White
    } catch {
        Write-Host "❌ READ FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor White
    }
}

# Test 3: Update Course
if ($createdCourseId) {
    Write-Host "`nTest 3: UPDATE Course" -ForegroundColor Yellow
    Write-Host "Testing PUT /api/course/$createdCourseId" -ForegroundColor Green
    
    $updatePayload = @{
        name = "$testCourseName - UPDATED"
        description = "$testCourseDescription - UPDATED"
        image_url = ""
    } | ConvertTo-Json
    
    Write-Host "Payload: $updatePayload" -ForegroundColor White
    
    try {
        $updateResponse = Invoke-RestMethod -Uri "$baseUrl/course/$createdCourseId" -Method PUT -Body $updatePayload -ContentType "application/json" -SkipCertificateCheck
        Write-Host "✅ UPDATE SUCCESS" -ForegroundColor Green
        Write-Host "  Course ID: $($updateResponse.id)" -ForegroundColor White
        Write-Host "  Course Name: $($updateResponse.name)" -ForegroundColor White
        Write-Host "  Course Description: $($updateResponse.description)" -ForegroundColor White
    } catch {
        Write-Host "❌ UPDATE FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor White
    }
}

# Test 4: List All Courses
Write-Host "`nTest 4: LIST All Courses" -ForegroundColor Yellow
Write-Host "Testing GET /api/course" -ForegroundColor Green

try {
    $listResponse = Invoke-RestMethod -Uri "$baseUrl/course" -Method GET -SkipCertificateCheck
    Write-Host "✅ LIST SUCCESS" -ForegroundColor Green
    Write-Host "  Total Courses: $($listResponse.Count)" -ForegroundColor White
    
    if ($listResponse.Count -gt 0) {
        Write-Host "  First Course:" -ForegroundColor White
        Write-Host "    ID: $($listResponse[0].id)" -ForegroundColor White
        Write-Host "    Name: $($listResponse[0].name)" -ForegroundColor White
        Write-Host "    Description: $($listResponse[0].description)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ LIST FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor White
}

# Test 5: Search Courses
Write-Host "`nTest 5: SEARCH Courses" -ForegroundColor Yellow
Write-Host "Testing GET /api/course?search=Test" -ForegroundColor Green

try {
    $searchResponse = Invoke-RestMethod -Uri "$baseUrl/course?search=Test" -Method GET -SkipCertificateCheck
    Write-Host "✅ SEARCH SUCCESS" -ForegroundColor Green
    Write-Host "  Search Results: $($searchResponse.Count)" -ForegroundColor White
    
    if ($searchResponse.Count -gt 0) {
        Write-Host "  Found Courses:" -ForegroundColor White
        foreach ($course in $searchResponse) {
            Write-Host "    - $($course.name)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ SEARCH FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor White
}

# Test 6: Delete Course
if ($createdCourseId) {
    Write-Host "`nTest 6: DELETE Course" -ForegroundColor Yellow
    Write-Host "Testing DELETE /api/course/$createdCourseId" -ForegroundColor Green
    
    try {
        $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/course/$createdCourseId" -Method DELETE -SkipCertificateCheck
        Write-Host "✅ DELETE SUCCESS" -ForegroundColor Green
        Write-Host "  Response: $($deleteResponse.message)" -ForegroundColor White
    } catch {
        Write-Host "❌ DELETE FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor White
    }
}

# Test 7: Verify Deletion
if ($createdCourseId) {
    Write-Host "`nTest 7: VERIFY Deletion" -ForegroundColor Yellow
    Write-Host "Testing GET /api/course/$createdCourseId (should return 404)" -ForegroundColor Green
    
    try {
        $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/course/$createdCourseId" -Method GET -SkipCertificateCheck
        Write-Host "❌ VERIFICATION FAILED - Course still exists!" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            Write-Host "✅ VERIFICATION SUCCESS - Course deleted" -ForegroundColor Green
        } else {
            Write-Host "❌ VERIFICATION FAILED - Unexpected error" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor White
        }
    }
}

# Summary
Write-Host "`nSUMMARY" -ForegroundColor Cyan
Write-Host "========" -ForegroundColor Cyan
Write-Host "Course CRUD Operations Test Completed!" -ForegroundColor Green
Write-Host "`nNote: This test requires:" -ForegroundColor Yellow
Write-Host "  - Backend API running on https://localhost:7001" -ForegroundColor White
Write-Host "  - Valid authentication token" -ForegroundColor White
Write-Host "  - Network connectivity" -ForegroundColor White
Write-Host "`nTo run this test:" -ForegroundColor Yellow
Write-Host "  1. Start the backend API" -ForegroundColor White
Write-Host "  2. Ensure authentication is working" -ForegroundColor White
Write-Host "  3. Run this script" -ForegroundColor White
