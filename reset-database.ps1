# 🔄 Database Reset və Seed Script
# Bu script local database-i sıfırlayır və yeni data seed edir

Write-Host "🚀 Starting Database Reset Process..." -ForegroundColor Cyan
Write-Host ""

# 1. Database-i sil
Write-Host "❌ Dropping existing database..." -ForegroundColor Yellow
try {
    dotnet ef database drop --force
    Write-Host "✅ Database dropped successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Database drop failed or database doesn't exist" -ForegroundColor Yellow
}

Write-Host ""

# 2. Köhnə migration-ları sil (optional)
$deleteMigrations = Read-Host "❓ Do you want to delete old migrations? (y/n)"
if ($deleteMigrations -eq "y" -or $deleteMigrations -eq "Y") {
    Write-Host "🗑️ Deleting old migrations..." -ForegroundColor Yellow
    Remove-Item -Path "Migrations\*.cs" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Old migrations deleted!" -ForegroundColor Green
    Write-Host ""
    
    # Yeni migration yarat
    Write-Host "📝 Creating new migration..." -ForegroundColor Yellow
    dotnet ef migrations add InitialCreate
    Write-Host "✅ New migration created!" -ForegroundColor Green
} else {
    Write-Host "⏭️ Skipping migration deletion..." -ForegroundColor Yellow
}

Write-Host ""

# 3. Database-i yenidən yarat və migrate et
Write-Host "🔨 Creating and migrating database..." -ForegroundColor Yellow
dotnet ef database update
Write-Host "✅ Database created and migrated successfully!" -ForegroundColor Green

Write-Host ""

# 4. Tətbiqi işə sal (seed data avtomatik yüklənəcək)
Write-Host "🌱 Starting application (seed data will load automatically)..." -ForegroundColor Cyan
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   Database Reset Complete! 🎉" -ForegroundColor Green
Write-Host "   Application starting..." -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Expected Data:" -ForegroundColor Cyan
Write-Host "   - 50 Users (including admin)" -ForegroundColor White
Write-Host "   - 30-60 Experiences from 30 real destinations" -ForegroundColor White
Write-Host "   - 40 Travel Tags" -ForegroundColor White
Write-Host "   - 100+ Comments with replies" -ForegroundColor White
Write-Host "   - Realistic Likes, Follows, Notifications" -ForegroundColor White
Write-Host "   - Message conversations" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Admin Login:" -ForegroundColor Yellow
Write-Host "   Email: admin@wanderly.com" -ForegroundColor White
Write-Host "   Password: Admin123!" -ForegroundColor White
Write-Host ""

# Run application
dotnet run

