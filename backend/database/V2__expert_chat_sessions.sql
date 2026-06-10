CREATE TABLE expert_chat_sessions (
    id                  BIGSERIAL PRIMARY KEY,
    farmer_id           BIGINT NOT NULL REFERENCES users(id),
    expert_id           BIGINT REFERENCES users(id),
    status              VARCHAR(30) NOT NULL DEFAULT 'AI_ACTIVE',
    topic               VARCHAR(500),
    ai_summary          TEXT,
    ai_message_count    INTEGER NOT NULL DEFAULT 0,
    escalation_reason   VARCHAR(500),
    resolved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ecs_status ON expert_chat_sessions(status);
CREATE INDEX idx_ecs_farmer ON expert_chat_sessions(farmer_id);
CREATE INDEX idx_ecs_expert ON expert_chat_sessions(expert_id);
