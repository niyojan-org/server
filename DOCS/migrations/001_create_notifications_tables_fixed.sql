-- Notification System Database Schema (FIXED FOR MONGODB USER IDs)
-- Run this migration to create all notification-related tables
-- This version uses VARCHAR(24) for user_id to support MongoDB ObjectId format

-- Table: notifications
-- Core notifications table storing all notification metadata
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    priority VARCHAR(20) DEFAULT 'normal',
    category VARCHAR(50),
    
    action_url TEXT,
    action_label VARCHAR(50),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    actor_id VARCHAR(24),  -- Changed from UUID to support MongoDB ObjectId
    actor_type VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;

-- Table: notification_recipients
-- Manages many-to-many relationship with per-user read status and delivery tracking
CREATE TABLE IF NOT EXISTS notification_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    user_id VARCHAR(24) NOT NULL,  -- Changed from UUID to support MongoDB ObjectId
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMPTZ,
    
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMPTZ,
    email_failed BOOLEAN DEFAULT FALSE,
    
    push_sent BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMPTZ,
    push_failed BOOLEAN DEFAULT FALSE,
    
    in_app_delivered BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_recipients_unique ON notification_recipients(notification_id, user_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_user_unread ON notification_recipients(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_user_archived ON notification_recipients(user_id, is_archived, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_notification ON notification_recipients(notification_id);

-- Table: push_tokens
-- Stores Web Push subscription tokens for push notifications
CREATE TABLE IF NOT EXISTS push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(24) NOT NULL,  -- Changed from UUID to support MongoDB ObjectId
    token TEXT NOT NULL UNIQUE,
    device_type VARCHAR(20) NOT NULL,
    device_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_active ON push_tokens(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token);

-- Table: user_notification_preferences
-- User preferences for notification channels and categories
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(24) NOT NULL UNIQUE,  -- Changed from UUID to support MongoDB ObjectId
    
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    
    preferences JSONB DEFAULT '{
        "organization_verified": {"email": true, "push": true, "in_app": true},
        "organization_updates": {"email": true, "push": true, "in_app": true},
        "task_assigned": {"email": true, "push": true, "in_app": true},
        "task_comment": {"email": true, "push": true, "in_app": true},
        "mention": {"email": true, "push": true, "in_app": true},
        "system": {"email": true, "push": false, "in_app": true},
        "event_reminder": {"email": true, "push": true, "in_app": true},
        "event_registration": {"email": true, "push": false, "in_app": true},
        "event_update": {"email": true, "push": true, "in_app": true}
    }',
    
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    quiet_hours_timezone VARCHAR(50),
    
    notification_sound BOOLEAN DEFAULT TRUE,
    vibration BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user ON user_notification_preferences(user_id);

-- Table: notification_templates (optional)
-- Pre-defined notification templates for common scenarios
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    title_template VARCHAR(255) NOT NULL,
    message_template TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    category VARCHAR(50),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_templates_name ON notification_templates(name);
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_notification_recipients_updated_at ON notification_recipients;
CREATE TRIGGER update_notification_recipients_updated_at
    BEFORE UPDATE ON notification_recipients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_notification_preferences_updated_at ON user_notification_preferences;
CREATE TRIGGER update_user_notification_preferences_updated_at
    BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;
CREATE TRIGGER update_notification_templates_updated_at
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE notifications IS 'Main notification storage table';
COMMENT ON TABLE notification_recipients IS 'Links notifications to users with read status and delivery tracking';
COMMENT ON TABLE push_tokens IS 'Stores Web Push subscription tokens for push notifications';
COMMENT ON TABLE user_notification_preferences IS 'User preferences for notification channels and types';
COMMENT ON TABLE notification_templates IS 'Pre-defined templates for common notification scenarios';

COMMENT ON COLUMN notifications.data IS 'JSON data blob for notification-specific information';
COMMENT ON COLUMN notifications.priority IS 'Priority levels: low, normal, high, urgent';
COMMENT ON COLUMN notification_recipients.user_id IS 'MongoDB ObjectId (24 char hex string)';
COMMENT ON COLUMN push_tokens.user_id IS 'MongoDB ObjectId (24 char hex string)';
COMMENT ON COLUMN user_notification_preferences.user_id IS 'MongoDB ObjectId (24 char hex string)';
