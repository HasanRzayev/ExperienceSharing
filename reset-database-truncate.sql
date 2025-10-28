-- ============================================
-- 🔄 DATABASE SIFIRLAMA SCRIPTI (TRUNCATE)
-- ============================================
-- Bu script tüm tabloları TRUNCATE edir
-- DROP DATABASE komutu kullanılmır - GÜVENLİ
-- ============================================

USE ExperienceProject;
GO

PRINT '🔄 Database sıfırlanıyor...';
PRINT '';

-- Foreign key constraint'leri geçici olarak devre dışı bırak
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
GO

-- Tüm tabloları TRUNCATE et
DECLARE @sql NVARCHAR(MAX) = '';
SELECT @sql += 'TRUNCATE TABLE [' + TABLE_SCHEMA + '].[' + TABLE_NAME + ']; ' 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE';

EXEC sp_executesql @sql;
GO

-- Foreign key constraint'leri tekrar aktif et
EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT ALL';
GO

PRINT '';
PRINT '========================================';
PRINT '   DATABASE TRUNCATE TAMAMLANDI ✅';
PRINT '========================================';
PRINT '';
PRINT '📝 Növbəti addımlar:';
PRINT '1. Application-i restart edin';
PRINT '2. Seed data avtomatik yüklənəcək';
PRINT '';
PRINT '✅ Hazırsınız!';
PRINT '========================================';
GO

