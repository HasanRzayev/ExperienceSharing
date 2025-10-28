-- Yanliz status yaratmaq ucun test
USE db28857;
GO

-- Test status yarat
INSERT INTO Statuses (UserId, Text, ImageUrl, CreatedAt, ExpiresAt)
SELECT TOP 5 
    Id as UserId,
    'Test status - Exploring the world 🌍' as Text,
    'https://via.placeholder.com/400' as ImageUrl,
    GETUTCDATE() as CreatedAt,
    DATEADD(HOUR, 24, GETUTCDATE()) as ExpiresAt
FROM Users
WHERE Email != 'admin@wanderly.com'
ORDER BY NEWID();
GO

PRINT 'Test status created. Check /api/status';
GO

