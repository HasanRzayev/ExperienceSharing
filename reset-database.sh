#!/bin/bash

# 🔄 Database Reset və Seed Script (Linux/Mac)
# Bu script local database-i sıfırlayır və yeni data seed edir

echo "🚀 Starting Database Reset Process..."
echo ""

# 1. Database-i sil
echo "❌ Dropping existing database..."
dotnet ef database drop --force
if [ $? -eq 0 ]; then
    echo "✅ Database dropped successfully!"
else
    echo "⚠️ Database drop failed or database doesn't exist"
fi

echo ""

# 2. Köhnə migration-ları sil (optional)
read -p "❓ Do you want to delete old migrations? (y/n): " deleteMigrations
if [ "$deleteMigrations" = "y" ] || [ "$deleteMigrations" = "Y" ]; then
    echo "🗑️ Deleting old migrations..."
    rm -f Migrations/*.cs
    echo "✅ Old migrations deleted!"
    echo ""
    
    # Yeni migration yarat
    echo "📝 Creating new migration..."
    dotnet ef migrations add InitialCreate
    echo "✅ New migration created!"
else
    echo "⏭️ Skipping migration deletion..."
fi

echo ""

# 3. Database-i yenidən yarat və migrate et
echo "🔨 Creating and migrating database..."
dotnet ef database update
echo "✅ Database created and migrated successfully!"

echo ""

# 4. Tətbiqi işə sal (seed data avtomatik yüklənəcək)
echo "🌱 Starting application (seed data will load automatically)..."
echo ""
echo "============================================"
echo "   Database Reset Complete! 🎉"
echo "   Application starting..."
echo "============================================"
echo ""
echo "📊 Expected Data:"
echo "   - 50 Users (including admin)"
echo "   - 30-60 Experiences from 30 real destinations"
echo "   - 40 Travel Tags"
echo "   - 100+ Comments with replies"
echo "   - Realistic Likes, Follows, Notifications"
echo "   - Message conversations"
echo ""
echo "🔐 Admin Login:"
echo "   Email: admin@wanderly.com"
echo "   Password: Admin123!"
echo ""

# Make script executable
chmod +x "$0"

# Run application
dotnet run

