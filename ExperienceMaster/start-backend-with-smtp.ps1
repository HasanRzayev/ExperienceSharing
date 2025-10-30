# Backend-i SMTP konfiqurasiyası ilə işə sal

Write-Host "🔧 SMTP Konfiqurasiyası təyin olunur..." -ForegroundColor Cyan

# SMTP Environment Variables
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_USERNAME="wanderly.project@gmail.com"
$env:SMTP_PASSWORD="BURAYA-APP-PASSWORD-YAZIN"  # 16 simvollu App Password
$env:SMTP_FROM_EMAIL="wanderly.project@gmail.com"
$env:FRONTEND_URL="http://localhost:3000"

Write-Host "✅ SMTP konfiqurasiyası təyin olundu!" -ForegroundColor Green
Write-Host ""
Write-Host "📧 Email: wanderly.project@gmail.com" -ForegroundColor Yellow
Write-Host "⚠️  App Password təyin edin: $env:SMTP_PASSWORD" -ForegroundColor Red
Write-Host ""
Write-Host "🚀 Backend işə salınır..." -ForegroundColor Cyan

# Backend qovluğuna keç
Set-Location "C:\Users\Hasan\OneDrive\Desktop\Experiencesharing\depo_diplom\Experience-master\ExperienceProject"

# Backend-i işə sal
dotnet run --launch-profile http

