CREATE TABLE event_audit (
    id BIGSERIAL PRIMARY KEY,
    event_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    actor_user_id TEXT,
    actor_role TEXT,
    action TEXT NOT NULL,
    severity TEXT DEFAULT 'info',
    target_id TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);