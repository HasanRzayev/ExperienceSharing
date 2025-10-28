DECLARE @cmd NVARCHAR(MAX) = '';

-- Disable constraints
SET @cmd = '';
SELECT @cmd += 'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ' NOCHECK CONSTRAINT ALL; '
FROM sys.tables;
EXEC sp_executesql @cmd;

-- Delete data
SET @cmd = '';
SELECT @cmd += 'DELETE FROM ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + '; '
FROM sys.tables;
EXEC sp_executesql @cmd;

-- Enable constraints
SET @cmd = '';
SELECT @cmd += 'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ' CHECK CONSTRAINT ALL; '
FROM sys.tables;
EXEC sp_executesql @cmd;

PRINT 'Complete';
GO

