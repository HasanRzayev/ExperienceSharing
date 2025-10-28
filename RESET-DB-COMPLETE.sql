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
DELETE FROM ExperienceRatings;
DELETE FROM RatingHelpfuls;
DELETE FROM ExperienceCollaborators;
DELETE FROM SavedExperiences;
DELETE FROM Collections;
DELETE FROM Notifications;
DELETE FROM Follows;
DELETE FROM FollowRequests;
DELETE FROM FollowRequestResponses;
DELETE FROM Messages;
DELETE FROM MessageReactions;
DELETE FROM BlockedUsers;
DELETE FROM Users;
DELETE FROM Tags;

PRINT 'Database temizlendi!';
GO

