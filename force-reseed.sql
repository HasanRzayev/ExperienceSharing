USE db28857;
GO

-- Force reseed: butun users-i sil (seed data ucun)
DELETE FROM Users;
GO

PRINT 'Users silindi. Application restart edin, seed data yuklenecek.';
GO

