#!/usr/bin/env pwsh

# Comprehensive validation script for frontend
Write-Host "🎯 BingGo Web Frontend - Comprehensive Validation" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray

$startTime = Get-Date
$errors = @()
$warnings = @()

# 1. Dependencies Check
Write-Host "`n📦 Step 1: Checking Dependencies..." -ForegroundColor Yellow
try {
    if (Test-Path "package.json") {
        Write-Host "✅ package.json found" -ForegroundColor Green
        
        if (Test-Path "node_modules") {
            Write-Host "✅ node_modules directory exists" -ForegroundColor Green
        } else {
            $warnings += "node_modules not found - run npm install"
            Write-Host "⚠️  node_modules not found" -ForegroundColor Yellow
        }
        
        # Check package-lock.json
        if (Test-Path "package-lock.json") {
            Write-Host "✅ package-lock.json found" -ForegroundColor Green
        } else {
            $warnings += "package-lock.json not found"
            Write-Host "⚠️  package-lock.json not found" -ForegroundColor Yellow
        }
    } else {
        $errors += "package.json not found"
        Write-Host "❌ package.json not found" -ForegroundColor Red
    }
} catch {
    $errors += "Dependency check failed: $($_.Exception.Message)"
    Write-Host "❌ Dependency check failed" -ForegroundColor Red
}

# 2. TypeScript Configuration
Write-Host "`n⚙️  Step 2: Validating TypeScript Configuration..." -ForegroundColor Yellow
try {
    if (Test-Path "tsconfig.json") {
        $tsconfig = Get-Content "tsconfig.json" | ConvertFrom-Json
        Write-Host "✅ tsconfig.json is valid" -ForegroundColor Green
    } else {
        $warnings += "tsconfig.json not found"
        Write-Host "⚠️  tsconfig.json not found" -ForegroundColor Yellow
    }
} catch {
    $errors += "Invalid tsconfig.json: $($_.Exception.Message)"
    Write-Host "❌ Invalid tsconfig.json" -ForegroundColor Red
}

# 3. Source Code Structure
Write-Host "`n📁 Step 3: Validating Source Code Structure..." -ForegroundColor Yellow

$requiredDirs = @(
    "src",
    "src/components",
    "src/services", 
    "src/utils",
    "src/types",
    "src/hooks",
    "src/contexts"
)

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "  ✅ $dir" -ForegroundColor Green
    } else {
        $warnings += "Directory missing: $dir"
        Write-Host "  ⚠️  $dir missing" -ForegroundColor Yellow
    }
}

# 4. Critical Files Check
Write-Host "`n📄 Step 4: Checking Critical Files..." -ForegroundColor Yellow

$criticalFiles = @(
    "src/index.tsx",
    "src/App.tsx",
    "src/App.css",
    "src/index.css"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        $errors += "Critical file missing: $file"
        Write-Host "  ❌ $file missing" -ForegroundColor Red
    }
}

# 5. UI Components Check
Write-Host "`n🎨 Step 5: Validating UI Components..." -ForegroundColor Yellow

$uiComponents = @(
    "src/components/ui/Button.tsx",
    "src/components/ui/Card.tsx",
    "src/components/ui/Switch.tsx",
    "src/components/ui/Alert.tsx",
    "src/components/ui/Tabs.tsx",
    "src/components/ui/LoadingSpinner.tsx",
    "src/components/ui/ErrorMessage.tsx"
)

$missingComponents = 0
foreach ($component in $uiComponents) {
    if (Test-Path $component) {
        Write-Host "  ✅ $(Split-Path $component -Leaf)" -ForegroundColor Green
    } else {
        $missingComponents++
        Write-Host "  ❌ $(Split-Path $component -Leaf) missing" -ForegroundColor Red
    }
}

if ($missingComponents -eq 0) {
    Write-Host "✅ All UI components present" -ForegroundColor Green
} else {
    $errors += "$missingComponents UI components missing"
}

# 6. Build Test
Write-Host "`n🔨 Step 6: Testing Build Process..." -ForegroundColor Yellow
try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful" -ForegroundColor Green
        
        # Check build output
        if (Test-Path "build") {
            Write-Host "✅ Build directory created" -ForegroundColor Green
            
            # Check build files
            $buildFiles = @(
                "build/index.html",
                "build/static/js",
                "build/static/css"
            )
            
            foreach ($buildFile in $buildFiles) {
                if (Test-Path $buildFile) {
                    Write-Host "  ✅ $(Split-Path $buildFile -Leaf)" -ForegroundColor Green
                } else {
                    $warnings += "Build file missing: $buildFile"
                    Write-Host "  ⚠️  $(Split-Path $buildFile -Leaf) missing" -ForegroundColor Yellow
                }
            }
        } else {
            $errors += "Build directory not created"
            Write-Host "❌ Build directory not created" -ForegroundColor Red
        }
    } else {
        $errors += "Build failed"
        Write-Host "❌ Build failed" -ForegroundColor Red
        Write-Host $buildOutput -ForegroundColor Red
    }
} catch {
    $errors += "Build test failed: $($_.Exception.Message)"
    Write-Host "❌ Build test failed" -ForegroundColor Red
}

# 7. Linting Check
Write-Host "`n🔍 Step 7: Running Linting Check..." -ForegroundColor Yellow
try {
    $lintOutput = npm run lint 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Linting passed" -ForegroundColor Green
    } else {
        $warnings += "Linting issues found"
        Write-Host "⚠️  Linting issues found" -ForegroundColor Yellow
    }
} catch {
    $warnings += "Linting check failed: $($_.Exception.Message)"
    Write-Host "⚠️  Linting check failed" -ForegroundColor Yellow
}

# 8. Bundle Size Analysis
Write-Host "`n📊 Step 8: Analyzing Bundle Size..." -ForegroundColor Yellow
try {
    if (Test-Path "build/static/js") {
        $jsFiles = Get-ChildItem "build/static/js/*.js" | Sort-Object Length -Descending
        if ($jsFiles.Count -gt 0) {
            $mainBundle = $jsFiles[0]
            $bundleSize = [math]::Round($mainBundle.Length / 1MB, 2)
            
            if ($bundleSize -lt 1) {
                Write-Host "✅ Bundle size: $bundleSize MB (Good)" -ForegroundColor Green
            } elseif ($bundleSize -lt 2) {
                Write-Host "⚠️  Bundle size: $bundleSize MB (Acceptable)" -ForegroundColor Yellow
            } else {
                $warnings += "Large bundle size: $bundleSize MB"
                Write-Host "⚠️  Bundle size: $bundleSize MB (Large)" -ForegroundColor Yellow
            }
        }
    }
} catch {
    $warnings += "Bundle size analysis failed"
    Write-Host "⚠️  Bundle size analysis failed" -ForegroundColor Yellow
}

# 9. Security Check
Write-Host "`n🔒 Step 9: Security Validation..." -ForegroundColor Yellow

$securityFiles = @(
    "src/utils/securityHeaders.ts",
    "src/utils/inputValidation.ts",
    "src/services/privacyService.ts",
    "src/components/privacy",
    "src/components/security"
)

$securityScore = 0
foreach ($securityFile in $securityFiles) {
    if (Test-Path $securityFile) {
        $securityScore++
        Write-Host "  ✅ $(Split-Path $securityFile -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $(Split-Path $securityFile -Leaf) missing" -ForegroundColor Yellow
    }
}

$securityPercentage = [math]::Round(($securityScore / $securityFiles.Count) * 100)
Write-Host "Security implementation: $securityPercentage%" -ForegroundColor $(if ($securityPercentage -ge 80) { "Green" } elseif ($securityPercentage -ge 60) { "Yellow" } else { "Red" })

# 10. Accessibility Check
Write-Host "`n♿ Step 10: Accessibility Validation..." -ForegroundColor Yellow

$accessibilityFiles = @(
    "src/styles/accessibility.css",
    "src/contexts/AccessibilityContext.tsx",
    "src/components/accessibility"
)

$accessibilityScore = 0
foreach ($accessibilityFile in $accessibilityFiles) {
    if (Test-Path $accessibilityFile) {
        $accessibilityScore++
        Write-Host "  ✅ $(Split-Path $accessibilityFile -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $(Split-Path $accessibilityFile -Leaf) missing" -ForegroundColor Yellow
    }
}

$accessibilityPercentage = [math]::Round(($accessibilityScore / $accessibilityFiles.Count) * 100)
Write-Host "Accessibility implementation: $accessibilityPercentage%" -ForegroundColor $(if ($accessibilityPercentage -ge 80) { "Green" } elseif ($accessibilityPercentage -ge 60) { "Yellow" } else { "Red" })

# Summary
$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ("`n" + "=" * 60) -ForegroundColor Gray
Write-Host "🎯 Frontend Validation Summary" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray

Write-Host "`n⏱️  Duration: $($duration.TotalSeconds.ToString('F2')) seconds" -ForegroundColor White

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "`n🎉 ALL VALIDATIONS PASSED!" -ForegroundColor Green
    Write-Host "✅ Frontend is ready for production" -ForegroundColor Green
} elseif ($errors.Count -eq 0) {
    Write-Host "`n✅ VALIDATIONS PASSED WITH WARNINGS" -ForegroundColor Yellow
    Write-Host "⚠️  $($warnings.Count) warning(s) found:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   - $warning" -ForegroundColor Yellow
    }
    Write-Host "`n✅ Frontend is ready for production (with minor issues)" -ForegroundColor Green
} else {
    Write-Host "`n❌ VALIDATIONS FAILED" -ForegroundColor Red
    Write-Host "🚨 $($errors.Count) error(s) found:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "   - $error" -ForegroundColor Red
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "`n⚠️  $($warnings.Count) warning(s) found:" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "   - $warning" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n💡 Next Steps:" -ForegroundColor Cyan
if ($errors.Count -eq 0) {
    Write-Host "1. Deploy to production: npm run build && deploy build/" -ForegroundColor White
    Write-Host "2. Start development server: npm start" -ForegroundColor White
    Write-Host "3. Run tests: npm test" -ForegroundColor White
} else {
    Write-Host "1. Fix the errors listed above" -ForegroundColor White
    Write-Host "2. Run this validation script again" -ForegroundColor White
    Write-Host "3. Proceed when all validations pass" -ForegroundColor White
}

Write-Host "`n📊 Validation Metrics:" -ForegroundColor Cyan
Write-Host "- Security Score: $securityPercentage%" -ForegroundColor White
Write-Host "- Accessibility Score: $accessibilityPercentage%" -ForegroundColor White
Write-Host "- Build Status: $(if ($errors.Count -eq 0) { "✅ SUCCESS" } else { "❌ FAILED" })" -ForegroundColor White

Write-Host ("`n" + "=" * 60) -ForegroundColor Gray

# Exit with appropriate code
if ($errors.Count -gt 0) {
    exit 1
} else {
    exit 0
}