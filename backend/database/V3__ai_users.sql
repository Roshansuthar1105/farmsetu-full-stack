-- Create table to store AI chat messages between farmers and AI bots
CREATE TABLE IF NOT EXISTS ai_chats (
    id              BIGSERIAL PRIMARY KEY,
    farmer_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bot_id          INTEGER NOT NULL,
    message_text    TEXT,
    is_from_bot     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_chats_farmer_bot ON ai_chats(farmer_id, bot_id);
