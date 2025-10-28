USE db28857;
GO

-- Butun foreign key-leri kapat
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
GO

-- Butun table-leri sil
DECLARE @cmd NVARCHAR(MAX) = '';
SELECT @cmd += 'DROP TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + '; '
FROM sys.tables;
EXEC sp_executesql @cmd;
GO

PRINT 'All tables dropped. Application will recreate them.';
GO

