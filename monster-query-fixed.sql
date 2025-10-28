-- ============================================
-- 🗑️ MONSTER ASP.NET - DATABASE SIFIRLAMA (FIXED)
-- ============================================
-- Foreign key constraint'leri ignore edir
-- ============================================

-- Tüm foreign key constraint'leri disable et
EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT ALL";

-- Tüm verileri sil
DELETE FROM TripExperiences;
DELETE FROM TripCollaborators;
DELETE FROM Trips;
DELETE FROM SavedExperiences;
DELETE FROM Collections;
DELETE FROM ExperienceRatings;
DELETE FROM RatingHelpfuls;
DELETE FROM ExperienceCollaborators;
DELETE FROM GroupMessages;
DELETE FROM MessageReactions;
DELETE FROM GroupMessages;
DELETE FROM GroupMembers;
DELETE FROM GroupChats;
DELETE FROM EventAttendees;
DELETE FROM Events;
DELETE FROM DeviceLinks;
DELETE FROM DeviceSessions;
DELETE FROM CommentReactions;
DELETE FROM Comments;
DELETE FROM Likes;
DELETE FROM ExperienceTags;
DELETE FROM ExperienceImages;
DELETE FROM Experiences;
DELETE FROM Notifications;
DELETE FROM Follows;
DELETE FROM FollowRequests;
DELETE FROM Messages;
DELETE FROM BlockedUsers;
DELETE FROM StatusViews;
DELETE FROM Statuses;
DELETE FROM Users WHERE Email != 'admin@wanderly.com';
DELETE FROM Tags;

-- Foreign key constraint'leri yeniden aktif et
EXEC sp_MSforeachtable "ALTER TABLE ? CHECK CONSTRAINT ALL";

-- ============================================
-- ✅ TAMAMLANDI
-- ============================================
-- Şimdi Application-i restart edin
-- ============================================

