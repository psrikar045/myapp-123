#!/usr/bin/env pwsh

Write-Host "🚀 Starting Comprehensive Negative Testing Suite..." -ForegroundColor Green
Write-Host ""

Write-Host "📦 Step 1: Backing up existing test files..." -ForegroundColor Yellow
$testFiles = Get-ChildItem -Path "src" -Filter "*.spec.ts" -Recurse | Where-Object { $_.Name -ne "comprehensive-negative-tests.spec.ts" }
$disabledCount = 0

foreach ($file in $testFiles) {
    $disabledPath = $file.FullName + ".disabled"
    if (-not (Test-Path $disabledPath)) {
        Rename-Item -Path $file.FullName -NewName ($file.Name + ".disabled")
        Write-Host "   ✓ Disabled: $($file.Name)" -ForegroundColor Gray
        $disabledCount++
    }
}

Write-Host "   📊 Disabled $disabledCount test files" -ForegroundColor Cyan
Write-Host ""

Write-Host "🧪 Step 2: Running comprehensive negative tests..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray
Write-Host ""

try {
    & npm test -- --watch=false --browsers=ChromeHeadless
    $testResult = $LASTEXITCODE
} catch {
    Write-Host "❌ Error running tests: $_" -ForegroundColor Red
    $testResult = 1
}

Write-Host ""
Write-Host "🔄 Step 3: Restoring test files..." -ForegroundColor Yellow
$restoredCount = 0

$disabledFiles = Get-ChildItem -Path "src" -Filter "*.spec.ts.disabled" -Recurse
foreach ($file in $disabledFiles) {
    $originalName = $file.Name -replace "\.disabled$", ""
    $originalPath = Join-Path $file.Directory $originalName
    Rename-Item -Path $file.FullName -NewName $originalName
    Write-Host "   ✓ Restored: $originalName" -ForegroundColor Gray
    $restoredCount++
}

Write-Host "   📊 Restored $restoredCount test files" -ForegroundColor Cyan
Write-Host ""

if ($testResult -eq 0) {
    Write-Host "✅ Comprehensive Negative Testing Complete - All Tests Passed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Comprehensive Negative Testing Complete - Some Tests Failed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   • Security vulnerability tests: XSS, SQL injection, buffer overflow" -ForegroundColor White
Write-Host "   • Network failure scenarios: timeouts, server errors, CORS" -ForegroundColor White
Write-Host "   • UI corruption prevention: rapid submissions, form destruction" -ForegroundColor White
Write-Host "   • Accessibility edge cases: screen readers, keyboard navigation" -ForegroundColor White
Write-Host "   • Responsive design: multiple viewports, touch events" -ForegroundColor White
Write-Host "   • Memory leak prevention: subscription cleanup, timer management" -ForegroundColor White
Write-Host "   • Form validation: invalid inputs, edge cases" -ForegroundColor White
Write-Host ""

exit $testResult