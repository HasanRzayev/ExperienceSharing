SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
GO

DECLARE @disable NVARCHAR(MAX) = '';
SELECT @disable += 'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ' NOCHECK CONSTRAINT ALL; '
FROM sys.tables;
EXEC sp_executesql @disable;
GO

DECLARE @delete NVARCHAR(MAX) = '';
SELECT @delete += 'DELETE FROM ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + '; '
FROM sys.tables;
EXEC sp_executesql @delete;
GO

DECLARE @enable NVARCHAR(MAX) = '';
SELECT @enable += 'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ' CHECK CONSTRAINT ALL; '
FROM sys.tables;
EXEC sp_executesql @enable;
GO

PRINT 'SUCCESS';
GO

