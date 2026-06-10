-- Seed database with the 10 AI bot accounts to allow chat messages to reference them via FK constraints.
-- Also ensures primitive boolean columns are set to valid values (non-null) to prevent JPA mapping errors.
INSERT INTO users (id, name, email, phone, password_hash, role, is_verified, is_active, two_factor_enabled, reputation_score, created_at, updated_at)
VALUES 
    (-1, 'Crop Disease & Pest Bot', 'disease.bot@farmsetu.in', '0000000001', 'SYSTEM_BOT', 'EXPERT', TRUE, TRUE, FALSE, 0, NOW(), NOW()),
    (-2, 'Soil & Nutrient Bot', 'soil.bot@farmsetu.in', '0000000002', 'SYSTEM_BOT', 'EXPERT', TRUE, TRUE, FALSE, 0, NOW(), NOW()),
    (-3, 'Market Analyst Bot', 'market.bot@farmsetu.in', '0000000003', 'SYSTEM_BOT', 'EXPERT', TRUE, TRUE, FALSE, 0, NOW(), NOW()),
    (-4, 'Irrigation Bot', 'irrigation.bot@farmsetu.in', '0000000004', 'SYSTEM_BOT', 'EXPERT', TRUE, TRUE, FALSE, 0, NOW(), NOW()),
    (-5, 'Weather Advisor Bot', 'weather.bot@farmsetu.in', '0000000005', 'SYSTEM_BOT', 'EXPERT', TRUE, TRUE, FALSE, 0, NOW(), NOW()),
    (-6, 'Gov Schemes Bot', 'schemes.bot@farmsetu.in', '0000000006', 'SYSTEM_BOT', 'EXPERT', TRUE, TRUE, FALSE, 0, NOW(), NOW()),
    (-7, 'Seed Selection Bot', 'seed.bot@farmsetu.in', '0000000007', 'SYSTEM_BOT', 'EXPERT', TRUE, TRUE, FALSE, 0, NOW(), NOW()),
    (-8, 'Organic Farming Bot', 'organic.bot@farmsetu.in', '0000000008', 'SYSTEM_BOT', 'EXPERT', TRUE, TRUE, FALSE, 0, NOW(), NOW()),
    (-9, 'Livestock & Dairy Bot', 'livestock.bot@farmsetu.in', '0000000009', 'SYSTEM_BOT', 'EXPERT', TRUE, TRUE, FALSE, 0, NOW(), NOW()),
    (-10, 'Farm Machinery Bot', 'machinery.bot@farmsetu.in', '0000000010', 'SYSTEM_BOT', 'EXPERT', TRUE, TRUE, FALSE, 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE 
SET two_factor_enabled = EXCLUDED.two_factor_enabled,
    is_verified = EXCLUDED.is_verified,
    is_active = EXCLUDED.is_active;
