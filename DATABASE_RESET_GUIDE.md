# 🔄 Database Sıfırlama və Yeni Data Seed Etmə Təlimatı

## 📋 Mündəricat
1. [Local Development](#local-development)
2. [Production (Monster ASP.NET / Azure)](#production-deployment)
3. [Alternative Methods](#alternative-methods)

---

## 🏠 Local Development

### Metod 1: Migration-ları Sıfırlayın (Tövsiyə Olunur)

```bash
# 1. Bütün mövcud migration-ları silin
Remove-Item -Path "Migrations\*.cs" -Force

# 2. Database-i silin
Drop-Database

# 3. Yeni migration yaradın
dotnet ef migrations add InitialCreate

# 4. Database-i yenidən yaradın və seed edin
dotnet ef database update

# 5. Tətbiqi işə salın (seed data avtomatik yüklənəcək)
dotnet run
```

### Metod 2: SQL Server Management Studio (SSMS)

```sql
-- 1. Database-ə bağlanın
USE master;
GO

-- 2. Database-i silin
DROP DATABASE IF EXISTS Experiences;
GO

-- 3. Tətbiqi işə salın - avtomatik yenidən yaradacaq
```

### Metod 3: PowerShell Script (Ən Sürətli)

```powershell
# Database-i tam sıfırlayan script
$connectionString = "Server=DESKTOP-HNLV3V9;Database=Experiences;Trusted_Connection=True;"

# EF Core tools ilə database sil
dotnet ef database drop --force

# Yeni migration yarat
dotnet ef migrations add FreshStart

# Database-i yarat və seed et
dotnet ef database update

# Tətbiqi başlat
dotnet run
```

---

## 🌐 Production Deployment (Monster ASP.NET / Azure / Hosting)

### Üsul 1: Migration Script İstifadə Etmək (Tövsiyə)

#### Addım 1: Migration Script Hazırlayın

```bash
# SQL Script yaradın
dotnet ef migrations script --idempotent --output reset-database.sql
```

Bu komanda sizə `reset-database.sql` faylı yaradacaq.

#### Addım 2: Hosting Panelində SQL Script İcra Edin

**Monster ASP.NET üçün:**
1. Monster ASP.NET control panel-ə daxil olun
2. **SQL Server Management** bölməsinə gedin
3. **Query Editor** və ya **phpMyAdmin** kimi alətə daxil olun
4. Mövcud database-i silin:

```sql
-- Bütün cədvəlləri silin
USE [YourDatabaseName];
GO

-- Foreign key constraint-ləri deaktiv edin
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL'
GO

-- Bütün cədvəlləri silin
EXEC sp_MSforeachtable 'DROP TABLE ?'
GO
```

5. `reset-database.sql` faylını icra edin
6. Tətbiqi yenidən başlatdıqda, seed data avtomatik yüklənəcək

---

### Üsul 2: Birbaşa C# Code ilə Database Reset

**Program.cs**-ə əlavə kod (Development environment üçün):

```csharp
// Program.cs - Database seeding section-dan əvvəl

if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var context = services.GetRequiredService<ApplicationDbContext>();
        
        // ⚠️ DİQQƏT: Bu bütün datanı silir!
        await context.Database.EnsureDeletedAsync();
        await context.Database.EnsureCreatedAsync();
        
        // Seed data
        await SeedData.InitializeAsync(services);
    }
}
```

**⚠️ XƏBƏRDARLIQ:** Bu yalnız development environment-də istifadə edin!

---

### Üsul 3: Custom Endpoint Yaradın (Production üçün)

**Controllers** qovluğunda yeni controller yaradın:

```csharp
// Controllers/DatabaseController.cs
[ApiController]
[Route("api/[controller]")]
public class DatabaseController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public DatabaseController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("reset")]
    public async Task<IActionResult> ResetDatabase([FromHeader] string secretKey)
    {
        // Təhlükəsizlik üçün gizli açar yoxlayın
        if (secretKey != _configuration["DatabaseResetSecret"])
        {
            return Unauthorized();
        }

        try
        {
            // Database-i sil və yenidən yarat
            await _context.Database.EnsureDeletedAsync();
            await _context.Database.MigrateAsync();
            
            // Seed data
            await SeedData.InitializeAsync(HttpContext.RequestServices);

            return Ok(new { message = "Database successfully reset and seeded!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
```

**appsettings.json**-a əlavə edin:

```json
{
  "DatabaseResetSecret": "YourSecretKey12345!@#"
}
```

**İstifadə:**

```bash
# Postman və ya curl ilə
curl -X POST https://experiencesharingbackend.runasp.net/api/database/reset \
  -H "secretKey: YourSecretKey12345!@#"
```

---

## 🔧 Üsul 4: Migration-la Seed Data (Best Practice)

### Yeni Migration Yaradın

```bash
dotnet ef migrations add SeedInitialData
```

**Migrations/XXXXXX_SeedInitialData.cs** faylını redaktə edin:

```csharp
public partial class SeedInitialData : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Mövcud cədvəlləri təmizləyin
        migrationBuilder.Sql("DELETE FROM Comments");
        migrationBuilder.Sql("DELETE FROM Likes");
        migrationBuilder.Sql("DELETE FROM Follows");
        migrationBuilder.Sql("DELETE FROM ExperienceTags");
        migrationBuilder.Sql("DELETE FROM ExperienceImages");
        migrationBuilder.Sql("DELETE FROM Experiences");
        migrationBuilder.Sql("DELETE FROM Users");
        migrationBuilder.Sql("DELETE FROM Tags");
        
        // Seed data - Manual SQL insert
        // (və ya SeedData class-ınızı çağırın)
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Rollback logic
    }
}
```

Sonra production-da:

```bash
dotnet ef database update
```

---

## 📝 Monster ASP.NET Spesifik Təlimatlar

### 1. FTP vasitəsilə

```bash
# 1. Tətbiqi build edin
dotnet publish -c Release

# 2. FTP ilə yükləyin
# - bin/Release/net8.0/publish/* fayllarını yükləyin

# 3. Control Panel-dən tətbiqi restart edin
```

### 2. Database Bağlantısını Yoxlayın

**appsettings.json** (Production):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=sql.your-monster-host.com;Database=YourDB;User Id=username;Password=password;TrustServerCertificate=True;"
  }
}
```

### 3. Hosting Panelindən Database Sıfırlayın

1. **Monster Control Panel** → **SQL Server Management**
2. **Database Tools** → **Query Editor**
3. Aşağıdakı SQL-i icra edin:

```sql
-- Bütün datanı sil
EXEC sp_MSforeachtable 'DELETE FROM ?'
GO

-- Identity-ləri sıfırla
EXEC sp_MSforeachtable 'DBCC CHECKIDENT(''?'', RESEED, 0)'
GO
```

4. Tətbiqi restart edin - seed data avtomatik yüklənəcək

---

## ✅ Doğrulama

Database-in düzgün seed edildiyini yoxlamaq üçün:

```sql
-- İstifadəçi sayı
SELECT COUNT(*) FROM Users;
-- Gözlənilən: 50

-- Experience sayı  
SELECT COUNT(*) FROM Experiences;
-- Gözlənilən: 30-60

-- Comment sayı
SELECT COUNT(*) FROM Comments;
-- Gözlənilən: 100+

-- Tag sayı
SELECT COUNT(*) FROM Tags;
-- Gözlənilən: 40
```

---

## 🚨 Xəbərdarlıqlar

1. **⚠️ Production-da database sıfırlamaq bütün real datanı silir!**
2. **🔒 Həmişə backup alın:**
   ```bash
   # Backup SQL script
   SqlPackage.exe /Action:Export /SourceConnectionString:"YourConnectionString" /TargetFile:"backup.bacpac"
   ```
3. **🔐 Database reset endpoint-ini public etməyin**
4. **📊 Böyük production database-lər üçün progressive migration istifadə edin**

---

## 📞 Köməyə Ehtiyacınız Varsa

1. Monster ASP.NET Support-a müraciət edin
2. Database backup restore xidmətindən istifadə edin
3. Migration script-ləri manual olaraq icra edin

---

## 🎯 Ən Asan Yol (Tövsiyə)

**Local Development:**
```bash
dotnet ef database drop --force
dotnet ef database update
dotnet run
```

**Production (Monster ASP.NET):**
1. Control Panel → SQL Management
2. Drop all tables (SQL script yuxarıda)
3. Restart application
4. Seed data avtomatik yüklənəcək

✅ **Tamamlandı!**

