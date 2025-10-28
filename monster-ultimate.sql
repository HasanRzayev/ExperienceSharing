-- ============================================
-- 🗑️ MONSTER ASP.NET - ULTIMATE SIFIRLAMA
-- ============================================
-- Foreign key hatalarını önler
-- ============================================

BEGIN TRANSACTION;

-- Constraint'leri disable et
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';

-- Hiçbirini özelleştirmeden temizle (sp_MSforeachtable tüm tabloları temizler)
EXEC sp_MSforeachtable 'DELETE FROM ?';

-- Constraints'i yeniden aktif et
EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT ALL';

-- Commit
COMMIT TRANSACTION;

-- ============================================
-- ✅ TAMAMLANDI
-- ============================================
-- Şimdi Application-i restart edin
-- ============================================

PRINT '✅ Database temizlendi. Application restart edin.';

