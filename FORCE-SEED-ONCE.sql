USE db28857;
GO

-- ADMIN USER SIL
DELETE FROM Users WHERE Email = 'admin@wanderly.com';
GO

-- StatusViews SIL
DELETE FROM StatusViews;
GO

-- Statuses SIL  
DELETE FROM Statuses;
GO

-- Comments SIL
DELETE FROM CommentReactions;
DELETE FROM Comments;
GO

-- Experiences SIL
DELETE FROM ExperienceTags;
DELETE FROM ExperienceImages;
DELETE FROM Experiences;
GO

-- Users SIL
DELETE FROM Users;
GO

PRINT 'Database cleared. Now restart application.';
GO

