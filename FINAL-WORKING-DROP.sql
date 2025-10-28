USE db28857;
GO

-- Foreign key constraint-leri disable et
DECLARE @cmd NVARCHAR(MAX) = '';

SELECT @cmd += 'ALTER TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + ' NOCHECK CONSTRAINT ALL; '
FROM sys.tables;
EXEC sp_executesql @cmd;
GO

-- Foreign key-leri sil
SET @cmd = '';
SELECT @cmd += 'ALTER TABLE ' + QUOTENAME(s.name) + '.' + QUOTENAME(t.name) + ' DROP CONSTRAINT ' + QUOTENAME(c.name) + '; '
FROM sys.foreign_keys AS c
INNER JOIN sys.tables AS t ON c.parent_object_id = t.object_id
INNER JOIN sys.schemas AS s ON t.schema_id = s.schema_id;
EXEC sp_executesql @cmd;
GO

-- Tablolari sil
SET @cmd = '';
SELECT @cmd += 'DROP TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + '; '
FROM sys.tables;
EXEC sp_executesql @cmd;
GO

PRINT 'SUCCESS';
GO

