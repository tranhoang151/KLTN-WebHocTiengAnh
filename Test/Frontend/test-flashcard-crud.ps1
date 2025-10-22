# Test Flashcard CRUD Operations
# This script tests the flashcard endpoints to ensure they work correctly

Write-Host "Testing Flashcard CRUD Operations..." -ForegroundColor Green

# Configuration
$baseUrl = "http://localhost:5000/api"
$token = "your-admin-token-here"  # Replace with actual admin token

# Test data
$testSetId = "WjQLN8xuWrwbRu9BHeO0"  # Replace with actual flashcard set ID
$testCardId = "e3a635ab-14f7-4908-a7b4-78d61a9da966"  # Replace with actual card ID

Write-Host "`n1. Testing GET flashcards by set..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/flashcard/set/$testSetId" -Method GET -Headers @{"Authorization" = "Bearer $token" }
    Write-Host "✅ GET flashcards successful. Found $($response.Count) cards" -ForegroundColor Green
    $response | ForEach-Object { Write-Host "  - Card: $($_.frontText) -> $($_.backText)" }
}
catch {
    Write-Host "❌ GET flashcards failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing CREATE flashcard..." -ForegroundColor Yellow
try {
    $newCard = @{
        frontText       = "Test Front"
        backText        = "Test Back"
        exampleSentence = "This is a test sentence"
        order           = 999
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/flashcard/set/$testSetId" -Method POST -Body $newCard -ContentType "application/json" -Headers @{"Authorization" = "Bearer $token" }
    Write-Host "✅ CREATE flashcard successful. Card ID: $($response.id)" -ForegroundColor Green
    $newCardId = $response.id
}
catch {
    Write-Host "❌ CREATE flashcard failed: $($_.Exception.Message)" -ForegroundColor Red
    $newCardId = $null
}

Write-Host "`n3. Testing UPDATE flashcard..." -ForegroundColor Yellow
if ($newCardId) {
    try {
        $updateCard = @{
            frontText       = "Updated Front"
            backText        = "Updated Back"
            exampleSentence = "This is an updated sentence"
            order           = 999
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$baseUrl/flashcard/card/$newCardId" -Method PUT -Body $updateCard -ContentType "application/json" -Headers @{"Authorization" = "Bearer $token" }
        Write-Host "✅ UPDATE flashcard successful" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ UPDATE flashcard failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
else {
    Write-Host "⚠️ Skipping UPDATE test - no card ID available" -ForegroundColor Yellow
}

Write-Host "`n4. Testing DELETE flashcard..." -ForegroundColor Yellow
if ($newCardId) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/flashcard/card/$newCardId" -Method DELETE -Headers @{"Authorization" = "Bearer $token" }
        Write-Host "✅ DELETE flashcard successful" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ DELETE flashcard failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
else {
    Write-Host "⚠️ Skipping DELETE test - no card ID available" -ForegroundColor Yellow
}

Write-Host "`n5. Testing with existing card ID..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/flashcard/card/$testCardId" -Method DELETE -Headers @{"Authorization" = "Bearer $token" }
    Write-Host "✅ DELETE existing flashcard successful" -ForegroundColor Green
}
catch {
    Write-Host "❌ DELETE existing flashcard failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   This might be expected if the card doesn't exist or is in use" -ForegroundColor Yellow
}

Write-Host "`nTest completed!" -ForegroundColor Green
