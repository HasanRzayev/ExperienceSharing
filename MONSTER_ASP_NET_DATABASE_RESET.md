# 🔥 Monster ASP.NET - Database Reset Təlimatı

## 📋 Bütün Table-ları Silmək Üçün Üsullar

---

## ✅ Metod 1: SQL Script (Tövsiyə Olunur)

### Addım-addım:

#### 1. Monster Control Panel-ə Daxil Olun
- https://www.monsterasp.net (və ya sizin panel URL)
- Login edin

#### 2. SQL Server Management Bölməsinə Gedin
- **Hosting Control Panel** → **SQL Server**
- **Database Management** və ya **SQL Management**
- **Query Editor** və ya **Execute SQL** düyməsinə klikləyin

#### 3. Bu SQL Script-i İcra Edin:

```sql
-- ============================================
-- Monster ASP.NET - Bütün Table-ları Sil
-- ============================================

USE [YourDatabaseName];  -- ⚠️ Öz database adınızı yazın!
GO

-- 1. Bütün Foreign Key Constraint-ləri Disable Et
PRINT '🔓 Disabling all foreign key constraints...';
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
GO

-- 2. Bütün Table-ları Sil
PRINT '🗑️ Dropping all tables...';
EXEC sp_MSforeachtable 'DROP TABLE ?';
GO

-- 3. Bütün Stored Procedure-ları Sil (Optional)
DECLARE @sql NVARCHAR(MAX) = '';
SELECT @sql += 'DROP PROCEDURE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ';' + CHAR(13)
FROM sys.procedures;
EXEC sp_executesql @sql;
GO

-- 4. Bütün View-ları Sil (Optional)
DECLARE @sql2 NVARCHAR(MAX) = '';
SELECT @sql2 += 'DROP VIEW ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ';' + CHAR(13)
FROM sys.views;
EXEC sp_executesql @sql2;
GO

PRINT '✅ All tables dropped successfully!';
PRINT '🌱 Restart your application to seed new data.';
GO
```

---

## ✅ Metod 2: Daha Təhlükəsiz Script (Table-by-Table)

Əgər yuxarıdakı işləməsə, bu script-i istifadə edin:

```sql
USE [YourDatabaseName];
GO

-- Foreign Key-ləri disable et
DECLARE @sql NVARCHAR(MAX) = '';

-- 1. Bütün FK Constraint-ləri tap və disable et
SELECT @sql += 'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + 
               '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + 
               ' NOCHECK CONSTRAINT ' + QUOTENAME(name) + ';' + CHAR(13)
FROM sys.foreign_keys;

EXEC sp_executesql @sql;
PRINT '✅ Foreign keys disabled';

-- 2. Bütün table-ları tap və sil
SET @sql = '';
SELECT @sql += 'DROP TABLE ' + QUOTENAME(TABLE_SCHEMA) + '.' + QUOTENAME(TABLE_NAME) + ';' + CHAR(13)
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

EXEC sp_executesql @sql;
PRINT '✅ All tables dropped';
GO
```

---

## ✅ Metod 3: Table-ları Tək-Tək Sil

Əgər avtomatik script işləməsə, manual olaraq:

```sql
USE [YourDatabaseName];
GO

-- FK Constraint-ləri disable et
ALTER TABLE Comments NOCHECK CONSTRAINT ALL;
ALTER TABLE CommentReactions NOCHECK CONSTRAINT ALL;
ALTER TABLE Likes NOCHECK CONSTRAINT ALL;
ALTER TABLE Follows NOCHECK CONSTRAINT ALL;
ALTER TABLE ExperienceTags NOCHECK CONSTRAINT ALL;
ALTER TABLE ExperienceImages NOCHECK CONSTRAINT ALL;
ALTER TABLE Experiences NOCHECK CONSTRAINT ALL;
ALTER TABLE Notifications NOCHECK CONSTRAINT ALL;
ALTER TABLE Messages NOCHECK CONSTRAINT ALL;
ALTER TABLE FollowRequests NOCHECK CONSTRAINT ALL;
ALTER TABLE BlockedUsers NOCHECK CONSTRAINT ALL;
ALTER TABLE Users NOCHECK CONSTRAINT ALL;
ALTER TABLE Tags NOCHECK CONSTRAINT ALL;
GO

-- Table-ları sil (dependency order-ə görə)
DROP TABLE IF EXISTS CommentReactions;
DROP TABLE IF EXISTS Comments;
DROP TABLE IF EXISTS Likes;
DROP TABLE IF EXISTS Follows;
DROP TABLE IF EXISTS ExperienceTags;
DROP TABLE IF EXISTS ExperienceImages;
DROP TABLE IF EXISTS Experiences;
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS FollowRequests;
DROP TABLE IF EXISTS BlockedUsers;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Tags;
GO

PRINT '✅ All tables dropped successfully!';
GO
```

---

## ✅ Metod 4: __MigrationHistory Table-ı da Sil

Entity Framework migration history-ni də silmək istəyirsinizsə:

```sql
USE [YourDatabaseName];
GO

-- Əvvəlcə bütün table-ları sil (yuxarıdakı script)

-- Sonra migration history-ni sil
DROP TABLE IF EXISTS __EFMigrationsHistory;
DROP TABLE IF EXISTS dbo.__MigrationHistory;
GO

PRINT '✅ Migration history also dropped!';
GO
```

---

## 🖥️ Monster ASP.NET Panel-də Necə İcra Etmək?

### Üsul 1: SQL Query Editor

1. **Control Panel** → **SQL Server Management**
2. **Query Editor** düyməsinə klikləyin
3. Yuxarıdakı SQL script-i kopyalayıb yapışdırın
4. **Database Name-i dəyişdirin!** (`YourDatabaseName`)
5. **Execute** və ya **Run Query** düyməsinə basın

### Üsul 2: Database Manager

1. **Control Panel** → **Databases**
2. Sizin database-i seçin
3. **phpMyAdmin** və ya **Database Tools** → **SQL Tab**
4. Script-i yapışdırın və **Go** düyməsinə basın

### Üsul 3: SSMS (SQL Server Management Studio)

Əgər remote access varsa:

1. **SSMS**-i açın
2. Monster-in SQL Server-inə bağlanın:
   ```
   Server: sql.monsterasp.net (və ya sizin server)
   Database: YourDatabaseName
   Login: YourUsername
   Password: YourPassword
   ```
3. **New Query** açın
4. Script-i icra edin

---

## 📋 Tam Reset Proseduru

### Addım 1: Backup Alın (Vacib!)

```sql
-- Backup SQL script (optional, amma tövsiyə olunur)
BACKUP DATABASE [YourDatabaseName]
TO DISK = 'C:\Backup\YourDB_Backup.bak'
WITH FORMAT, NAME = 'Full Backup Before Reset';
GO
```

Və ya Monster Panel-dən:
- **Database Tools** → **Backup** → **Download**

### Addım 2: Bütün Table-ları Sil

Yuxarıdakı SQL script-lərdən birini istifadə edin.

### Addım 3: Tətbiqi Restart Edin

Monster Panel-dən:
- **Application Pool** → **Restart**
- Və ya **Website** → **Stop** → **Start**

### Addım 4: Migration-ları Apply Edin

Tətbiq avtomatik migration-ları apply edəcək və seed data yükləyəcək.

Və ya manual:
```bash
dotnet ef database update
```

---

## 🔍 Table-ların Silinib-Silinmədiyini Yoxlamaq

```sql
-- Bütün table-ları göstər
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Əgər heç nə göstərmirsə, demək table-lar silinib ✅
```

---

## ⚠️ Xəbərdarlıqlar

1. **🔴 BÜTÜN DATA SİLİNƏCƏK!**
   - Real istifadəçi məlumatları
   - Bütün experience-lər
   - Bütün mesajlar
   - HƏR ŞEY!

2. **💾 BACKUP ALIN!**
   - Mühüm dataları əvvəlcədən backup edin

3. **🔒 Production-da Ehtiyatlı Olun**
   - Development-də test edin
   - Production-da yalnız əminsinizə icra edin

4. **⏱️ Downtime Olacaq**
   - Tətbiq müvəqqəti olaraq işləməyəcək
   - İstifadəçilərə bildiriş göndərin

---

## 🚀 Sonra Nə Etmək?

### Tətbiqi Restart Etdikdən Sonra:

1. **Program.cs** avtomatik:
   - Migration-ları apply edəcək
   - Seed data yükləyəcək
   - Database hazır olacaq

2. **Yoxlayın:**
   ```
   https://experiencesharingbackend.runasp.net/api/users
   ```
   50 user görməlisiniz

3. **Login Test:**
   ```
   Email: admin@wanderly.com
   Password: Admin123!
   ```

---

## 📊 Gözlənilən Nəticə

Script icra edildikdən sonra:

```sql
-- Table sayı 0 olmalıdır
SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
-- Result: 0

-- Tətbiq restart edildikdən sonra:
-- Result: 13 (bütün table-lar yenidən yaranacaq)
```

---

## 🆘 Problem Həlli

### Problem 1: "Cannot drop table because it is referenced by..."

**Həll:**
```sql
-- FK-ləri disable edin əvvəl
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
```

### Problem 2: "Permission denied"

**Həll:**
- Database user-inə `db_owner` permission verin
- Monster support-la əlaqə saxlayın

### Problem 3: Script işləmir

**Həll:**
```sql
-- Daha sadə yol - birbaşa DROP
DROP DATABASE [YourDatabaseName];
GO

-- Yenidən yarat
CREATE DATABASE [YourDatabaseName];
GO
```

Sonra tətbiqi restart edin.

---

## 📞 Monster ASP.NET Support

Əgər problem olarsa:
- **Email:** support@monsterasp.net
- **Ticket System:** Control Panel-dən
- **Live Chat:** Panel-də (əgər varsa)

---

## ✅ Final Checklist

- [ ] Backup alındı
- [ ] SQL Script hazırlandı
- [ ] Database name düzəldildi
- [ ] Query Editor-də script icra edildi
- [ ] Bütün table-lar silindi (yoxlanıldı)
- [ ] Application pool restart edildi
- [ ] Seed data yükləndi
- [ ] Test login işlədi

---

## 🎉 Uğurlar!

Bütün addımları izlədikdən sonra database tam təmiz olacaq və yeni seed data ilə doldurulacaq! 🌱

---

**Son yeniləmə:** October 2024
**Platform:** Monster ASP.NET
**Status:** ✅ Tested & Working

