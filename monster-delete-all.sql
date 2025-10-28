SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

-- Step 1: Disable all constraints
DECLARE @disable NVARCHAR(MAX) = '';
SELECT @disable += 'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ' NOCHECK CONSTRAINT ALL; '
FROM sys.tables;
EXEC sp_executesql @disable;
GO

-- Step 2: Delete from all tables
DECLARE @delete NVARCHAR(MAX) = '';
SELECT @delete += 'DELETE FROM ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + '; '
FROM sys.tables;
EXEC sp_executesql @delete;
GO

-- Step 3: Enable all constraints
DECLARE @enable NVARCHAR(MAX) = '';
SELECT @enable += 'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ' CHECK CONSTRAINT ALL; '
FROM sys.tables;
EXEC sp_executesql @enable;
GO

-- Step 4: Reset identity columns
DECLARE @reset NVARCHAR(MAX) = '';
SELECT @reset += 'DBCC CHECKIDENT(''' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ''', RESEED, 0); '
FROM sys.tables;
EXEC sp_executesql @reset;
GO

PRINT 'All tables cleared successfully. Restart application.';
GO

