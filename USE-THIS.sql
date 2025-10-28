SET QUOTED_IDENTIFIER ON;
GO

-- Disable constraints
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
GO

-- Delete all data from all tables
EXEC sp_MSforeachtable 'DELETE FROM ?';
GO

-- Enable constraints
EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT ALL';
GO

PRINT 'Done. Restart application.';
GO

