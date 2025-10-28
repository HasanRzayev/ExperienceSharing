USE db28857;
GO

DECLARE @sql NVARCHAR(MAX);

-- Foreign key sil
SET @sql = '';
SELECT @sql += 'ALTER TABLE ' + QUOTENAME(s.name) + '.' + QUOTENAME(t.name) + ' DROP CONSTRAINT ' + QUOTENAME(c.name) + '; '
FROM sys.foreign_keys AS c
INNER JOIN sys.tables AS t ON c.parent_object_id = t.object_id
INNER JOIN sys.schemas AS s ON t.schema_id = s.schema_id;

IF LEN(@sql) > 0
    EXEC sp_executesql @sql;
GO

-- Tablolari sil
DECLARE @sql2 NVARCHAR(MAX);
SET @sql2 = '';
SELECT @sql2 += 'DROP TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + '.' + QUOTENAME(name) + '; '
FROM sys.tables;

EXEC sp_executesql @sql2;
GO

PRINT 'Done';
GO

