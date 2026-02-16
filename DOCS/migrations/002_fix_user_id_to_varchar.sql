-- Migration to fix user_id columns from UUID to VARCHAR(24) for MongoDB ObjectId support
-- Run this if you already created the tables with UUID type

-- Step 1: Drop existing foreign key constraints and indexes if they exist
DO $$ 
BEGIN
    -- Drop indexes that depend on the user_id columns
    DROP INDEX IF EXISTS idx_notification_recipients_user_unread;
    DROP INDEX IF EXISTS idx_notification_recipients_user_archived;
    DROP INDEX IF EXISTS idx_push_tokens_user_active;
    DROP INDEX IF EXISTS idx_user_notification_preferences_user;
    DROP INDEX IF EXISTS idx_notification_recipients_unique;
END $$;

-- Step 2: Alter columns from UUID to VARCHAR(24)
ALTER TABLE notification_recipients 
    ALTER COLUMN user_id TYPE VARCHAR(24) USING user_id::TEXT;

ALTER TABLE push_tokens 
    ALTER COLUMN user_id TYPE VARCHAR(24) USING user_id::TEXT;

ALTER TABLE user_notification_preferences 
    ALTER COLUMN user_id TYPE VARCHAR(24) USING user_id::TEXT;

ALTER TABLE notifications
    ALTER COLUMN actor_id TYPE VARCHAR(24) USING actor_id::TEXT;

-- Step 3: Recreate indexes
CREATE UNIQUE INDEX idx_notification_recipients_unique ON notification_recipients(notification_id, user_id);
CREATE INDEX idx_notification_recipients_user_unread ON notification_recipients(user_id, is_read, created_at DESC);
CREATE INDEX idx_notification_recipients_user_archived ON notification_recipients(user_id, is_archived, created_at DESC);
CREATE INDEX idx_push_tokens_user_active ON push_tokens(user_id, is_active);
CREATE INDEX idx_user_notification_preferences_user ON user_notification_preferences(user_id);

-- Step 4: Add comments for documentation
COMMENT ON COLUMN notification_recipients.user_id IS 'MongoDB ObjectId (24 character hex string)';
COMMENT ON COLUMN push_tokens.user_id IS 'MongoDB ObjectId (24 character hex string)';
COMMENT ON COLUMN user_notification_preferences.user_id IS 'MongoDB ObjectId (24 character hex string)';
COMMENT ON COLUMN notifications.actor_id IS 'MongoDB ObjectId (24 character hex string)';

-- Verify the changes
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'user_id columns changed from UUID to VARCHAR(24)';
    RAISE NOTICE 'All indexes recreated';
END $$;
