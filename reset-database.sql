-- ============================================
-- 🗑️ DATABASE SIFIRLAMA SCRIPTI
-- ============================================
-- Bu script Monster ASP.NET database-ini sıfırlayır
-- DİQQƏT: Bütün data silinəcək!
-- ============================================

USE master;
GO

-- Database varsa connection-ları kəsmək
DECLARE @dbname NVARCHAR(128) = 'ExperienceProject';
DECLARE @sql NVARCHAR(MAX);

-- Açıq connection-ları kəsmək
IF EXISTS (SELECT 1 FROM sys.databases WHERE name = @dbname)
BEGIN
    SET @sql = 'ALTER DATABASE [' + @dbname + '] SET SINGLE_USER WITH ROLLBACK IMMEDIATE';
    EXEC sp_executesql @sql;
    
    SET @sql = 'DROP DATABASE [' + @dbname + ']';
    EXEC sp_executesql @sql;
    
    PRINT '✅ Database silindi: ' + @dbname;
END
ELSE
BEGIN
    PRINT 'ℹ️ Database tapılmadı: ' + @dbname;
END
GO

-- ============================================
-- ✅ Database Sıfırlama TAMAMLANDI
-- ============================================
-- Application-i restart edin, seed data avtomatik yüklənəcək
-- ============================================

