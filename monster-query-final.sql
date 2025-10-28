-- ============================================
-- 🗑️ MONSTER ASP.NET - FINAL ÇÖZÜM
-- ============================================
-- QUOTED_IDENTIFIER sorunu düzeltildi
-- ============================================

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Tüm foreign key constraint'leri disable et
ALTER DATABASE CURRENT SET RECOVERY SIMPLE;
GO

DECLARE @sql NVARCHAR(MAX) = '';

-- Disable constraints
SET @sql = '';
SELECT @sql += 'ALTER TABLE ' + QUOTENAME(TABLE_SCHEMA) + '.' + QUOTENAME(TABLE_NAME) + ' NOCHECK CONSTRAINT ALL; '
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';
EXEC sp_executesql @sql;
GO

-- Tüm tabloları temizle
DECLARE @sql2 NVARCHAR(MAX) = '';
SELECT @sql2 += 'DELETE FROM ' + QUOTENAME(TABLE_SCHEMA) + '.' + QUOTENAME(TABLE_NAME) + '; '
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';
EXEC sp_executesql @sql2;
GO

-- Enable constraints
DECLARE @sql3 NVARCHAR(MAX) = '';
SELECT @sql3 += 'ALTER TABLE ' + QUOTENAME(TABLE_SCHEMA) + '.' + QUOTENAME(TABLE_NAME) + ' CHECK CONSTRAINT ALL; '
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';
EXEC sp_executesql @sql3;
GO

ALTER DATABASE CURRENT SET RECOVERY FULL;
GO

-- ============================================
-- ✅ TAMAMLANDI
-- ============================================
-- Şimdi Application-i restart edin
-- ============================================

PRINT '✅ Database temizlendi. Application restart edin.';

