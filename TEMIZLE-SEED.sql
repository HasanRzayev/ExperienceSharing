USE db28857;
GO

-- Butun datani sil ama table-lari qal
DELETE FROM StatusViews;
DELETE FROM Statuses;
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
DELETE FROM Users;
DELETE FROM Tags;

PRINT 'Database temizlendi. Application restart edin.';
GO

