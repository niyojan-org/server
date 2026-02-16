-- Notification System Database Schema
-- Run this migration to create all notification-related tables

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
    
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    
    actor_id UUID,
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
    user_id UUID NOT NULL,
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    is_archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP,
    
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP,
    email_failed BOOLEAN DEFAULT FALSE,
    
    push_sent BOOLEAN DEFAULT FALSE,
    push_sent_at TIMESTAMP,
    push_failed BOOLEAN DEFAULT FALSE,
    
    in_app_delivered BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_recipients_unique ON notification_recipients(notification_id, user_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_user_unread ON notification_recipients(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_user_archived ON notification_recipients(user_id, is_archived, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_notification ON notification_recipients(notification_id);

-- Table: push_tokens
-- Stores FCM device tokens for push notifications
CREATE TABLE IF NOT EXISTS push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token TEXT NOT NULL UNIQUE,
    device_type VARCHAR(20) NOT NULL,
    device_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_active ON push_tokens(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token);

-- Table: user_notification_preferences
-- User preferences for notification channels and categories
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    
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
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user ON user_notification_preferences(user_id);

-- Table: notification_templates (Optional)
-- Template definitions for consistent notification formatting
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL UNIQUE,
    
    title_template TEXT NOT NULL,
    message_template TEXT NOT NULL,
    
    default_priority VARCHAR(20) DEFAULT 'normal',
    default_category VARCHAR(50),
    
    email_enabled BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_notification_recipients_updated_at BEFORE UPDATE ON notification_recipients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notification_preferences_updated_at BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
