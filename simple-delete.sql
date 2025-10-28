DELETE FROM CommentReactions;
DELETE FROM Comments;
DELETE FROM MessageReactions;
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
DELETE FROM BlockedUsers;
DELETE FROM StatusViews;
DELETE FROM Statuses;
DELETE FROM DeviceLinks;
DELETE FROM DeviceSessions;
DELETE FROM TripExperiences;
DELETE FROM TripCollaborators;
DELETE FROM Trips;
DELETE FROM GroupMessages;
DELETE FROM GroupMembers;
DELETE FROM GroupChats;
DELETE FROM EventAttendees;
DELETE FROM Events;
DELETE FROM Users WHERE Email != 'admin@wanderly.com';
DELETE FROM Tags;

PRINT 'Done';
GO

