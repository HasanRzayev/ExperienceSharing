-- ============================================
-- 🗑️ DATABASE SIFIRLAMA SCRIPTI (Veri Sadece)
-- ============================================
-- Bu script tüm verileri silir AMA database-i silmir
-- DROP DATABASE komutu kullanılmır - GÜVENLİ
-- ============================================

USE ExperienceProject;
GO

-- Foreign key constraint'leri geçici olarak devre dışı bırak
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
GO

PRINT '🗑️ Veri siliniyor...';
PRINT '';

-- Tüm tablolardaki verileri sil
EXEC sp_MSforeachtable 'DELETE FROM ?';
GO

-- Foreign key constraint'leri tekrar aktif et
EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT ALL';
GO

-- Identity kolonlarını reset et (isteğe bağlı)
-- DBCC CHECKIDENT komutları kimlik sütunlarını sıfırlar
EXEC sp_MSforeachtable 'DBCC CHECKIDENT (''?'', RESEED, 0)';
GO

PRINT '';
PRINT '========================================';
PRINT '   DATABASE VERİ SİLME TAMAMLANDI ✅';
PRINT '========================================';
PRINT '';
PRINT '📝 Növbəti addımlar:';
PRINT '1. Application-i restart edin';
PRINT '2. Seed data avtomatik yüklənəcək';
PRINT '3. Admin login edin:';
PRINT '   Email: admin@wanderly.com';
PRINT '   Password: Admin123!';
PRINT '';
PRINT '✅ Hazırsınız!';
PRINT '========================================';
GO

