-- ============================================
-- 🗑️ MONSTER ASP.NET - TEK SATIR SIFIRLAMA
-- ============================================
-- En basit yöntem - tek tek sil
-- ============================================

DELETE FROM CommentReactions; DELETE FROM Comments; DELETE FROM Likes; DELETE FROM ExperienceTags; DELETE FROM ExperienceImages; DELETE FROM Experiences; DELETE FROM Notifications; DELETE FROM Follows; DELETE FROM FollowRequests; DELETE FROM Messages; DELETE FROM BlockedUsers; DELETE FROM StatusViews; DELETE FROM Statuses; DELETE FROM Users WHERE Email != 'admin@wanderly.com'; DELETE FROM Tags;

-- ============================================
-- ✅ BİTTİ - Application restart edin
-- ============================================

