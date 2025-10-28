-- ============================================
-- 🔒 GÜVENLİ DATABASE SIFIRLAMA SCRIPTI
-- ============================================
-- Bu script database-i SADƏ SQL komutları ilə sıfırlayır
-- DROP DATABASE, DROP TABLE kullanılmır - Maksimum Güvenlik
-- ============================================

USE ExperienceProject;
GO

PRINT '🔒 Güvenli database sıfırlama başlıyor...';
PRINT '';

-- ============================================
-- 1. LİMİTLƏNMIŞ TABLO SİLME (ÖRNEK)
-- ============================================
-- Sadece belirli tabloların içeriğini siler
-- Foreign key problemleri olmaması için sırayla

-- Önce bağımlı tabloları temizle
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'CommentReactions')
    DELETE FROM CommentReactions;
PRINT '✅ CommentReactions temizlendi';

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Comments')
    DELETE FROM Comments;
PRINT '✅ Comments temizlendi';

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Likes')
    DELETE FROM Likes;
PRINT '✅ Likes temizlendi';

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ExperienceTags')
    DELETE FROM ExperienceTags;
PRINT '✅ ExperienceTags temizlendi';

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ExperienceImages')
    DELETE FROM ExperienceImages;
PRINT '✅ ExperienceImages temizlendi';

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Experiences')
    DELETE FROM Experiences;
PRINT '✅ Experiences temizlendi';

-- Users tablosunu temizle (admin hariç)
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Users')
BEGIN
    DELETE FROM Users WHERE Email != 'admin@wanderly.com';
    PRINT '✅ Users temizlendi (admin hariç)';
END

-- Diğer ilişkili tablolar
IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Notifications')
    DELETE FROM Notifications;
PRINT '✅ Notifications temizlendi';

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Follows')
    DELETE FROM Follows;
PRINT '✅ Follows temizlendi';

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'FollowRequests')
    DELETE FROM FollowRequests;
PRINT '✅ FollowRequests temizlendi';

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Messages')
    DELETE FROM Messages;
PRINT '✅ Messages temizlendi';

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'BlockedUsers')
    DELETE FROM BlockedUsers;
PRINT '✅ BlockedUsers temizlendi';

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'StatusViews')
    DELETE FROM StatusViews;
PRINT '✅ StatusViews temizlendi';

IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Statuses')
    DELETE FROM Statuses;
PRINT '✅ Statuses temizlendi';

GO

PRINT '';
PRINT '========================================';
PRINT '   GÜVENLİ DATABASE SIFIRLAMA TAMAMLANDI ✅';
PRINT '========================================';
PRINT '';
PRINT '📝 Növbəti addımlar:';
PRINT '1. Application-i restart edin';
PRINT '2. Seed data avtomatik yüklənəcək';
PRINT '';
PRINT '🔐 Admin user saxlanıldı:';
PRINT '   Email: admin@wanderly.com';
PRINT '   Password: Admin123!';
PRINT '';
PRINT '✅ Hazırsınız!';
PRINT '========================================';
GO

