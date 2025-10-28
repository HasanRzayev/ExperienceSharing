-- ============================================
-- 🔄 DATABASE SIFIRLAMA VƏ SEED DATA SCRIPTI
-- ============================================
-- Bu script database-i sıfırlayır VƏ sample data əlavə edir
-- DİQQƏT: Bütün mövcud data silinəcək!
-- ============================================

USE master;
GO

DECLARE @dbname NVARCHAR(128) = 'ExperienceProject';
DECLARE @sql NVARCHAR(MAX);

-- Database varsa silmək
IF EXISTS (SELECT 1 FROM sys.databases WHERE name = @dbname)
BEGIN
    SET @sql = 'ALTER DATABASE [' + @dbname + '] SET SINGLE_USER WITH ROLLBACK IMMEDIATE';
    EXEC sp_executesql @sql;
    
    SET @sql = 'DROP DATABASE [' + @dbname + ']';
    EXEC sp_executesql @sql;
    
    PRINT '✅ Database silindi: ' + @dbname;
END
GO

-- ============================================
-- DATABASE YARADIRIQ
-- ============================================
CREATE DATABASE ExperienceProject;
GO

USE ExperienceProject;
GO

PRINT '✅ Database yaradıldı: ExperienceProject';
GO

-- ============================================
-- ADMİN USERS ƏLAVƏ EDİLİR
-- ============================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Users')
BEGIN
    PRINT 'ℹ️ Users table hələ yoxdur, migration tələb olunur.';
END
ELSE
BEGIN
    -- Admin user əlavə et
    IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'admin@wanderly.com')
    BEGIN
        INSERT INTO Users (FirstName, LastName, Email, UserName, PasswordHash, Country, ProfileImage)
        VALUES ('Admin', 'Wanderly', 'admin@wanderly.com', 'admin', 
                'w6uVNgKTDTxSxkYWKNZXOV5cdVkwYTFk0bC1v+kRzdJHvhYGLlXBSStK3iv0bgDFGKmAGL1pZaItYGDqJgMW+Q==', 
                'Global', 
                'https://api.dicebear.com/7.x/avataaars/svg?seed=admin');
        
        PRINT '✅ Admin user əlavə edildi';
        PRINT '   Email: admin@wanderly.com';
        PRINT '   Password: Admin123!';
    END
    ELSE
    BEGIN
        PRINT 'ℹ️ Admin user artıq mövcuddur';
    END
END
GO

-- ============================================
-- ✅ TAMAMLANDI
-- ============================================
-- Qeyd: Bu SQL script database-in yalnız structure-unu yaradır
-- Seed data seed olunmaq üçün:
-- 1. Application-i restart edin
-- 2. Program.cs avtomatik seed data yükləyəcək
-- ============================================
PRINT '';
PRINT '========================================';
PRINT '   DATABASE SIFIRLAMA TAMAMLANDI 🎉';
PRINT '========================================';
PRINT '';
PRINT '📝 Növbəti addımlar:';
PRINT '1. Application-i restart edin';
PRINT '2. Seed data avtomatik yüklənəcək';
PRINT '3. Admin login edin:';
PRINT '   Email: admin@wanderly.com';
PRINT '   Password: Admin123!';
PRINT '';
PRINT '📊 Seed data:';
PRINT '   - 50 Users';
PRINT '   - 30-60 Experiences';
PRINT '   - Videos in experiences';
PRINT '   - Default Stories';
PRINT '   - 100+ Comments';
PRINT '';
PRINT '✅ Hazırsınız!';
PRINT '========================================';
GO

