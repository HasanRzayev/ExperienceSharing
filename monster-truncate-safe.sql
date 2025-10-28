-- ============================================
-- 🗑️ TRUNCATE YÖNTEMİ (EN GÜVENLİ)
-- ============================================
-- DELETE yerine TRUNCATE kullanır
-- ============================================

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Constraint'leri disable et
DECLARE @sql NVARCHAR(MAX) = '';
SELECT @sql += 'ALTER TABLE ' + QUOTENAME(TABLE_SCHEMA) + '.' + QUOTENAME(TABLE_NAME) + ' NOCHECK CONSTRAINT ALL; '
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';
EXEC sp_executesql @sql;
GO

-- TRUNCATE ile temizle
DECLARE @truncate NVARCHAR(MAX) = '';
SELECT @truncate += 'TRUNCATE TABLE ' + QUOTENAME(TABLE_SCHEMA) + '.' + QUOTENAME(TABLE_NAME) + '; '
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';
EXEC sp_executesql @truncate;
GO

-- Constraint'leri enable et
DECLARE @enable NVARCHAR(MAX) = '';
SELECT @enable += 'ALTER TABLE ' + QUOTENAME(TABLE_SCHEMA) + '.' + QUOTENAME(TABLE_NAME) + ' CHECK CONSTRAINT ALL; '
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';
EXEC sp_executesql @enable;
GO

PRINT '✅ TAMAMLANDI - Application restart edin';

