SET QUOTED_IDENTIFIER ON;
GO

EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
GO

EXEC sp_MSforeachtable 'DELETE FROM ?';
GO

EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT ALL';
GO

PRINT 'Database cleared successfully. Please restart the application.';
GO

