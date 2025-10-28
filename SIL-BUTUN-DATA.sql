SET QUOTED_IDENTIFIER ON;
GO

-- Butun constraint'leri kapat
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
GO

-- Butun tablolardan veri sil
EXEC sp_MSforeachtable 'DELETE FROM ?';
GO

-- Constraint'leri tekrar ac
EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT ALL';
GO

PRINT 'Tamamlandi. Application restart edin.';
GO

