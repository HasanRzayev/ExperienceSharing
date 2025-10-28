-- ============================================
-- 🗑️ MONSTER ASP.NET - TEK SORGU (FIXED)
-- ============================================
-- ============================================

EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL'; DELETE FROM TripExperiences; DELETE FROM TripCollaborators; DELETE FROM Trips; DELETE FROM SavedExperiences; DELETE FROM Collections; DELETE FROM ExperienceRatings; DELETE FROM RatingHelpfuls; DELETE FROM ExperienceCollaborators; DELETE FROM GroupMessages; DELETE FROM GroupMembers; DELETE FROM GroupChats; DELETE FROM EventAttendees; DELETE FROM Events; DELETE FROM DeviceLinks; DELETE FROM DeviceSessions; DELETE FROM CommentReactions; DELETE FROM Comments; DELETE FROM Likes; DELETE FROM ExperienceTags; DELETE FROM ExperienceImages; DELETE FROM Experiences; DELETE FROM Notifications; DELETE FROM Follows; DELETE FROM FollowRequests; DELETE FROM Messages; DELETE FROM BlockedUsers; DELETE FROM StatusViews; DELETE FROM Statuses; DELETE FROM Users WHERE Email != 'admin@wanderly.com'; DELETE FROM Tags; EXEC sp_MSforeachtable 'ALTER TABLE ? CHECK CONSTRAINT ALL';

