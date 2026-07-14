-- V4: Add magic link fields to users table for email-based passwordless login
-- Run this manually against your database: psql -U <user> -d farmsetu -f V4__magic_link.sql

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS magic_link_token   VARCHAR(64),
    ADD COLUMN IF NOT EXISTS magic_link_expiry  TIMESTAMP WITH TIME ZONE;

-- Index for fast token lookups during verification
CREATE INDEX IF NOT EXISTS idx_users_magic_link_token ON users(magic_link_token)
    WHERE magic_link_token IS NOT NULL;
