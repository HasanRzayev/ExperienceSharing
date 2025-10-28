-- Migration: Add read receipt fields to Messages table
-- This migration adds IsDelivered, IsRead, and ReadAt fields to support read receipts

USE [experience_sharing_db] -- Update with your database name
GO

-- Check if columns already exist before adding
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Messages]') AND name = 'IsDelivered')
BEGIN
    ALTER TABLE [Messages]
    ADD IsDelivered BIT NOT NULL DEFAULT 0;
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Messages]') AND name = 'IsRead')
BEGIN
    ALTER TABLE [Messages]
    ADD IsRead BIT NOT NULL DEFAULT 0;
END

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Messages]') AND name = 'ReadAt')
BEGIN
    ALTER TABLE [Messages]
    ADD ReadAt DATETIME2 NULL;
END

GO

-- Update existing messages to mark them as delivered
UPDATE [Messages] 
SET IsDelivered = 1 
WHERE IsDelivered = 0;

GO

PRINT 'Migration completed successfully. Read receipts fields added to Messages table.';
GO

