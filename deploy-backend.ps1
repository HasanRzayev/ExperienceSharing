# Backend Deploy Script
# This script deploys the backend to runasp.net

Write-Host "Starting backend deployment..." -ForegroundColor Green

# Configuration
$zipFile = "backend-deploy.zip"
$ftpServer = "ftp.runasp.net"
$ftpUsername = "your-ftp-username"
$ftpPassword = "your-ftp-password"
$remotePath = "/"

# Check if zip file exists
if (-not (Test-Path $zipFile)) {
    Write-Host "Error: $zipFile not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Zip file found: $zipFile" -ForegroundColor Green
Write-Host "Size: $((Get-Item $zipFile).Length / 1MB) MB" -ForegroundColor Yellow

# Instructions for manual deployment
Write-Host "`n=== MANUAL DEPLOYMENT INSTRUCTIONS ===" -ForegroundColor Cyan
Write-Host "1. Go to runasp.net control panel" -ForegroundColor White
Write-Host "2. Navigate to File Manager" -ForegroundColor White
Write-Host "3. Upload the $zipFile to the root directory" -ForegroundColor White
Write-Host "4. Extract the zip file in the root directory" -ForegroundColor White
Write-Host "5. Move all files from the extracted folder to the root directory" -ForegroundColor White
Write-Host "6. Delete the empty extracted folder" -ForegroundColor White
Write-Host "7. Restart the application pool" -ForegroundColor White
Write-Host "`n=== ALTERNATIVE: FTP DEPLOYMENT ===" -ForegroundColor Cyan
Write-Host "You can also use FTP to upload the files directly" -ForegroundColor White
Write-Host "FTP Server: $ftpServer" -ForegroundColor White
Write-Host "Username: $ftpUsername" -ForegroundColor White
Write-Host "Password: $ftpPassword" -ForegroundColor White
Write-Host "Remote Path: $remotePath" -ForegroundColor White

Write-Host "`nDeployment package ready!" -ForegroundColor Green
Write-Host "File location: $(Get-Location)\$zipFile" -ForegroundColor Yellow
