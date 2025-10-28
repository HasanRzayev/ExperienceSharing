-- ============================================
-- 🌱 MANUAL SEED DATA SCRIPTI
-- ============================================
-- Bu script database-ə manual olaraq sample data əlavə edir
-- Migration-lar olmadan istifadə edilmir!
-- ============================================

USE ExperienceProject;
GO

-- ============================================
-- MÖVCUD DATA-YI SİLMƏK (ISTƏYƏ BAĞLI)
-- ============================================
/*
-- Aşağıdakı kodları comment-dən çıxarın və işə salın
-- DİQQƏT: Bütün data silinəcək!

DELETE FROM CommentReactions;
DELETE FROM Comments;
DELETE FROM Likes;
DELETE FROM ExperienceTags;
DELETE FROM ExperienceImages;
DELETE FROM Experiences;
DELETE FROM FollowRequests;
DELETE FROM Follows;
DELETE FROM Notifications;
DELETE FROM Messages;
DELETE FROM Users WHERE Email != 'admin@wanderly.com';

PRINT '✅ Köhnə data silindi';
GO
*/

-- ============================================
-- SAMPLE USERS ƏLAVƏ ET
-- ============================================
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Users')
BEGIN
    PRINT '📝 Sample users əlavə edilir...';
    
    -- Sample users əlavə et
    INSERT INTO Users (FirstName, LastName, Email, UserName, PasswordHash, Country, ProfileImage)
    VALUES
        ('Ahmed', 'Salamov', 'ahmed@example.com', 'ahmed123', 
         'w6uVNgKTDTxSxkYWKNZXOV5cdVkwYTFk0bC1v+kRzdJHvhYGLlXBSStK3iv0bgDFGKmAGL1pZaItYGDqJgMW+Q==', 
         'Azerbaijan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed'),
        ('Leyla', 'Musayeva', 'leyla@example.com', 'leyla123', 
         'w6uVNgKTDTxSxkYWKNZXOV5cdVkwYTFk0bC1v+kRzdJHvhYGLlXBSStK3iv0bgDFGKmAGL1pZaItYGDqJgMW+Q==', 
         'Azerbaijan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=leyla'),
        ('Mehmet', 'Yılmaz', 'mehmet@example.com', 'mehmet123', 
         'w6uVNgKTDTxSxkYWKNZXOV5cdVkwYTFk0bC1v+kRzdJHvhYGLlXBSStK3iv0bgDFGKmAGL1pZaItYGDqJgMW+Q==', 
         'Turkey', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet');
    
    PRINT '✅ Sample users əlavə edildi';
END
ELSE
BEGIN
    PRINT '❌ Users table tapılmadı. Migration-lar tələb olunur.';
END
GO

-- ============================================
-- SAMPLE TAGS ƏLAVƏ ET
-- ============================================
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Tags')
BEGIN
    PRINT '📝 Sample tags əlavə edilir...';
    
    IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = 'Adventure')
        INSERT INTO Tags (TagName) VALUES ('Adventure');
    IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = 'Culture')
        INSERT INTO Tags (TagName) VALUES ('Culture');
    IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = 'Food')
        INSERT INTO Tags (TagName) VALUES ('Food');
    IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = 'Nature')
        INSERT INTO Tags (TagName) VALUES ('Nature');
    IF NOT EXISTS (SELECT 1 FROM Tags WHERE TagName = 'Beach')
        INSERT INTO Tags (TagName) VALUES ('Beach');
    
    PRINT '✅ Sample tags əlavə edildi';
END
GO

-- ============================================
-- ✅ TAMAMLANDI
-- ============================================
PRINT '';
PRINT '========================================';
PRINT '   MANUAL SEED DATA TAMAMLANDI 🎉';
PRINT '========================================';
PRINT '';
PRINT 'Qeyd: Bu script yalnız example data əlavə edir.';
PRINT 'Tam seed data üçün application-i restart edin,';
PRINT 'seed data avtomatik yüklənəcək (Program.cs).';
PRINT '';
PRINT 'Login:';
PRINT '   Email: admin@wanderly.com';
PRINT '   Password: Admin123!';
PRINT '';
PRINT '========================================';
GO

