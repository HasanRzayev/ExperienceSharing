-- Database Update Script for Settings Tables
-- Run this script to add the new settings tables to your database

-- First, update the Users table to add missing columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'Bio')
ALTER TABLE Users ADD Bio nvarchar(500) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'Website')
ALTER TABLE Users ADD Website nvarchar(255) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'PhoneNumber')
ALTER TABLE Users ADD PhoneNumber nvarchar(20) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'BirthDate')
ALTER TABLE Users ADD BirthDate datetime2 NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'Gender')
ALTER TABLE Users ADD Gender nvarchar(20) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'Language')
ALTER TABLE Users ADD Language nvarchar(10) NOT NULL DEFAULT 'en';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'IsPrivate')
ALTER TABLE Users ADD IsPrivate bit NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'EmailNotifications')
ALTER TABLE Users ADD EmailNotifications bit NOT NULL DEFAULT 1;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'PushNotifications')
ALTER TABLE Users ADD PushNotifications bit NOT NULL DEFAULT 1;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'ShowActivityStatus')
ALTER TABLE Users ADD ShowActivityStatus bit NOT NULL DEFAULT 1;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'AllowComments')
ALTER TABLE Users ADD AllowComments bit NOT NULL DEFAULT 1;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'AllowTags')
ALTER TABLE Users ADD AllowTags bit NOT NULL DEFAULT 1;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'AllowMentions')
ALTER TABLE Users ADD AllowMentions bit NOT NULL DEFAULT 1;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'TwoFactorEnabled')
ALTER TABLE Users ADD TwoFactorEnabled bit NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'LastLoginAt')
ALTER TABLE Users ADD LastLoginAt datetime2 NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'AllowMessages')
ALTER TABLE Users ADD AllowMessages bit NOT NULL DEFAULT 1;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'AllowStoryReplies')
ALTER TABLE Users ADD AllowStoryReplies bit NOT NULL DEFAULT 1;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'AllowSharing')
ALTER TABLE Users ADD AllowSharing bit NOT NULL DEFAULT 1;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'ShowLikeCounts')
ALTER TABLE Users ADD ShowLikeCounts bit NOT NULL DEFAULT 1;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'ShowShareCounts')
ALTER TABLE Users ADD ShowShareCounts bit NOT NULL DEFAULT 1;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'ContentFilter')
ALTER TABLE Users ADD ContentFilter nvarchar(50) NOT NULL DEFAULT 'all';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'AutoArchive')
ALTER TABLE Users ADD AutoArchive bit NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'Theme')
ALTER TABLE Users ADD Theme nvarchar(20) NOT NULL DEFAULT 'light';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'AutoDownload')
ALTER TABLE Users ADD AutoDownload bit NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'WebsitePermissions')
ALTER TABLE Users ADD WebsitePermissions bit NOT NULL DEFAULT 1;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'AccessibilityMode')
ALTER TABLE Users ADD AccessibilityMode bit NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'AccountType')
ALTER TABLE Users ADD AccountType nvarchar(20) NOT NULL DEFAULT 'personal';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'AnalyticsEnabled')
ALTER TABLE Users ADD AnalyticsEnabled bit NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'InsightsEnabled')
ALTER TABLE Users ADD InsightsEnabled bit NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'Users') AND name = 'ProfessionalTools')
ALTER TABLE Users ADD ProfessionalTools bit NOT NULL DEFAULT 0;

PRINT 'Users table updated with new columns!';

-- Create InteractionSettings table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='InteractionSettings' AND xtype='U')
CREATE TABLE InteractionSettings (
    Id int IDENTITY(1,1) PRIMARY KEY,
    UserId int NOT NULL,
    AllowMessages bit NOT NULL DEFAULT 1,
    AllowStoryReplies bit NOT NULL DEFAULT 1,
    AllowTags bit NOT NULL DEFAULT 1,
    AllowMentions bit NOT NULL DEFAULT 1,
    AllowComments bit NOT NULL DEFAULT 1,
    AllowSharing bit NOT NULL DEFAULT 1,
    RestrictedAccounts nvarchar(MAX) NULL,
    HiddenWords nvarchar(MAX) NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Create ContentSettings table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ContentSettings' AND xtype='U')
CREATE TABLE ContentSettings (
    Id int IDENTITY(1,1) PRIMARY KEY,
    UserId int NOT NULL,
    MutedAccounts nvarchar(MAX) NULL,
    ShowLikeCounts bit NOT NULL DEFAULT 1,
    ShowShareCounts bit NOT NULL DEFAULT 1,
    ContentFilter nvarchar(50) NOT NULL DEFAULT 'all',
    AutoArchive bit NOT NULL DEFAULT 0,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Create AppSettings table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AppSettings' AND xtype='U')
CREATE TABLE AppSettings (
    Id int IDENTITY(1,1) PRIMARY KEY,
    UserId int NOT NULL,
    Language nvarchar(10) NOT NULL DEFAULT 'en',
    Theme nvarchar(20) NOT NULL DEFAULT 'light',
    AutoDownload bit NOT NULL DEFAULT 0,
    WebsitePermissions bit NOT NULL DEFAULT 1,
    AccessibilityMode bit NOT NULL DEFAULT 0,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Create AccountTools table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AccountTools' AND xtype='U')
CREATE TABLE AccountTools (
    Id int IDENTITY(1,1) PRIMARY KEY,
    UserId int NOT NULL,
    AccountType nvarchar(20) NOT NULL DEFAULT 'personal',
    AnalyticsEnabled bit NOT NULL DEFAULT 0,
    InsightsEnabled bit NOT NULL DEFAULT 0,
    ProfessionalTools bit NOT NULL DEFAULT 0,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Create CloseFriends table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CloseFriends' AND xtype='U')
CREATE TABLE CloseFriends (
    Id int IDENTITY(1,1) PRIMARY KEY,
    UserId int NOT NULL,
    FriendUserId int NOT NULL,
    CreatedAt datetime2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (FriendUserId) REFERENCES Users(Id) ON DELETE NO ACTION,
    UNIQUE(UserId, FriendUserId)
);

-- Create BlockedUsers table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BlockedUsers' AND xtype='U')
CREATE TABLE BlockedUsers (
    Id int IDENTITY(1,1) PRIMARY KEY,
    UserId int NOT NULL,
    BlockedUserId int NOT NULL,
    CreatedAt datetime2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (BlockedUserId) REFERENCES Users(Id) ON DELETE NO ACTION,
    UNIQUE(UserId, BlockedUserId)
);

-- Create MutedUsers table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MutedUsers' AND xtype='U')
CREATE TABLE MutedUsers (
    Id int IDENTITY(1,1) PRIMARY KEY,
    UserId int NOT NULL,
    MutedUserId int NOT NULL,
    CreatedAt datetime2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (MutedUserId) REFERENCES Users(Id) ON DELETE NO ACTION,
    UNIQUE(UserId, MutedUserId)
);

-- Create HiddenWords table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HiddenWords' AND xtype='U')
CREATE TABLE HiddenWords (
    Id int IDENTITY(1,1) PRIMARY KEY,
    UserId int NOT NULL,
    Word nvarchar(100) NOT NULL,
    CreatedAt datetime2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

-- Add indexes for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_InteractionSettings_UserId')
CREATE INDEX IX_InteractionSettings_UserId ON InteractionSettings(UserId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ContentSettings_UserId')
CREATE INDEX IX_ContentSettings_UserId ON ContentSettings(UserId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AppSettings_UserId')
CREATE INDEX IX_AppSettings_UserId ON AppSettings(UserId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_AccountTools_UserId')
CREATE INDEX IX_AccountTools_UserId ON AccountTools(UserId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CloseFriends_UserId')
CREATE INDEX IX_CloseFriends_UserId ON CloseFriends(UserId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_BlockedUsers_UserId')
CREATE INDEX IX_BlockedUsers_UserId ON BlockedUsers(UserId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_MutedUsers_UserId')
CREATE INDEX IX_MutedUsers_UserId ON MutedUsers(UserId);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_HiddenWords_UserId')
CREATE INDEX IX_HiddenWords_UserId ON HiddenWords(UserId);

PRINT 'Settings tables created successfully!';
