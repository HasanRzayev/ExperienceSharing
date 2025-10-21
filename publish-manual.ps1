# Manual Publish Script for runasp.net Deployment
# Run this if Visual Studio publish fails

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Manual Publish Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean
Write-Host "[1/4] Cleaning previous builds..." -ForegroundColor Yellow
dotnet clean --configuration Release
if ($LASTEXITCODE -ne 0) {
    Write-Host "Clean failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Clean successful" -ForegroundColor Green
Write-Host ""

# Step 2: Build
Write-Host "[2/4] Building in Release mode..." -ForegroundColor Yellow
dotnet build --configuration Release
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Check for errors above." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build successful" -ForegroundColor Green
Write-Host ""

# Step 3: Publish
Write-Host "[3/4] Creating publish folder..." -ForegroundColor Yellow
$publishPath = ".\publish-manual"
if (Test-Path $publishPath) {
    Write-Host "Removing old publish folder..." -ForegroundColor Gray
    Remove-Item -Path $publishPath -Recurse -Force
}

dotnet publish --configuration Release --output $publishPath
if ($LASTEXITCODE -ne 0) {
    Write-Host "Publish failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Publish successful" -ForegroundColor Green
Write-Host ""

# Step 4: Summary
Write-Host "[4/4] Summary" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✓ Publish folder created at: $publishPath" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Open FileZilla" -ForegroundColor White
Write-Host "2. Connect to: ftp.site38534.siteasp.net" -ForegroundColor White
Write-Host "3. Upload all files from '$publishPath' to 'wwwroot'" -ForegroundColor White
Write-Host "4. Restart server on runasp.net panel" -ForegroundColor White
Write-Host "5. Test: https://experiencesharingbackend.runasp.net/api/healthcheck" -ForegroundColor White
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Done! Ready for FTP upload." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

# Open publish folder
Write-Host ""
$openFolder = Read-Host "Open publish folder now? (Y/N)"
if ($openFolder -eq "Y" -or $openFolder -eq "y") {
    Invoke-Item $publishPath
}

