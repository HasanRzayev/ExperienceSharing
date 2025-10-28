-- Only delete from tables that exist
-- This avoids errors if some tables don't exist

DELETE FROM CommentReactions WHERE 1=1;
DELETE FROM Comments WHERE 1=1;
DELETE FROM MessageReactions WHERE 1=1;
DELETE FROM Likes WHERE 1=1;
DELETE FROM ExperienceTags WHERE 1=1;
DELETE FROM ExperienceImages WHERE 1=1;
DELETE FROM Experiences WHERE 1=1;
DELETE FROM ExperienceRatings WHERE 1=1;
DELETE FROM RatingHelpfuls WHERE 1=1;
DELETE FROM ExperienceCollaborators WHERE 1=1;
DELETE FROM SavedExperiences WHERE 1=1;
DELETE FROM Collections WHERE 1=1;
DELETE FROM Notifications WHERE 1=1;
DELETE FROM Follows WHERE 1=1;
DELETE FROM FollowRequests WHERE 1=1;
DELETE FROM Messages WHERE 1=1;
DELETE FROM BlockedUsers WHERE 1=1;
DELETE FROM StatusViews WHERE 1=1;
DELETE FROM Statuses WHERE 1=1;
DELETE FROM DeviceLinks WHERE 1=1;
DELETE FROM DeviceSessions WHERE 1=1;
DELETE FROM TripExperiences WHERE 1=1;
DELETE FROM TripCollaborators WHERE 1=1;
DELETE FROM Trips WHERE 1=1;
DELETE FROM GroupMessages WHERE 1=1;
DELETE FROM GroupMembers WHERE 1=1;
DELETE FROM GroupChats WHERE 1=1;
DELETE FROM EventAttendees WHERE 1=1;
DELETE FROM Events WHERE 1=1;
DELETE FROM Users WHERE Email != 'admin@wanderly.com';
DELETE FROM Tags WHERE 1=1;

GO

