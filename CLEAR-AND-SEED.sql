USE db28857;
GO

-- Butun datani sil
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
GO

PRINT 'Database cleared! Now restart application to seed data.';
GO

