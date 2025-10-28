-- ============================================
-- 🗑️ EN KOLAY ÇÖZÜM
-- ============================================
-- Basit, hatasız, çalışır
-- ============================================

SET QUOTED_IDENTIFIER ON;
GO

-- Constraint disable
EXEC sp_MSforeachtable @command1='ALTER TABLE ? NOCHECK CONSTRAINT ALL';
GO

-- Tüm tabloları temizle
EXEC sp_MSforeachtable @command1='SET QUOTED_IDENTIFIER ON'; 
EXEC sp_MSforeachtable @command1='DELETE FROM ?';
GO

-- Constraint enable
EXEC sp_MSforeachtable @command1='ALTER TABLE ? CHECK CONSTRAINT ALL';
GO

PRINT '✅ TAMAMLANDI - Application restart edin';

