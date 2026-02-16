-- Migration: Convert TIMESTAMP columns to TIMESTAMPTZ
-- This ensures all timestamps are stored in UTC and properly handle timezones

-- Notifications table
ALTER TABLE notifications 
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'Asia/Kolkata',
    ALTER COLUMN expires_at TYPE TIMESTAMPTZ USING expires_at AT TIME ZONE 'Asia/Kolkata';

-- Notification recipients table
ALTER TABLE notification_recipients
    ALTER COLUMN read_at TYPE TIMESTAMPTZ USING read_at AT TIME ZONE 'Asia/Kolkata',
    ALTER COLUMN archived_at TYPE TIMESTAMPTZ USING archived_at AT TIME ZONE 'Asia/Kolkata',
    ALTER COLUMN email_sent_at TYPE TIMESTAMPTZ USING email_sent_at AT TIME ZONE 'Asia/Kolkata',
    ALTER COLUMN push_sent_at TYPE TIMESTAMPTZ USING push_sent_at AT TIME ZONE 'Asia/Kolkata',
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'Asia/Kolkata',
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'Asia/Kolkata';

-- User notification preferences table
ALTER TABLE user_notification_preferences
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'Asia/Kolkata',
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'Asia/Kolkata';

-- Push tokens table
ALTER TABLE push_tokens
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'Asia/Kolkata',
    ALTER COLUMN last_used_at TYPE TIMESTAMPTZ USING last_used_at AT TIME ZONE 'Asia/Kolkata';

-- Update default values for future inserts
ALTER TABLE notifications 
    ALTER COLUMN created_at SET DEFAULT NOW();

ALTER TABLE notification_recipients
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE user_notification_preferences
    ALTER COLUMN created_at SET DEFAULT NOW(),
    ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE push_tokens
    ALTER COLUMN created_at SET DEFAULT NOW();

-- Note: The "AT TIME ZONE 'Asia/Kolkata'" tells PostgreSQL that existing 
-- TIMESTAMP values should be interpreted as IST and converted to UTC for storage.
-- Future timestamps will automatically be stored in UTC.
