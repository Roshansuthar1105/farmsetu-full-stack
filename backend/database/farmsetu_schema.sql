-- =============================================================================
-- FarmSetu — PostgreSQL tables, indexes, triggers, seed data
-- =============================================================================
-- Prerequisites:
--   1. psql -U postgres -f 01_create_database.sql
--   2. psql -U postgres -d farmsetu -f farmsetu_schema.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- optional, for future UUID keys

-- -----------------------------------------------------------------------------
-- 2. Drop existing objects (development reset)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS product_bids CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS calendar_tasks CASCADE;
DROP TABLE IF EXISTS crop_calendar CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS farm_expenses CASCADE;
DROP TABLE IF EXISTS disease_detections CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS user_watchlist CASCADE;
DROP TABLE IF EXISTS daily_prices CASCADE;
DROP TABLE IF EXISTS commodities CASCADE;
DROP TABLE IF EXISTS market_prices CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS farmer_profiles CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS insurance_schemes CASCADE;
DROP TABLE IF EXISTS govt_schemes CASCADE;
DROP TABLE IF EXISTS mandis CASCADE;
DROP TABLE IF EXISTS crops CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Element-collection / join tables
DROP TABLE IF EXISTS user_current_crops CASCADE;
DROP TABLE IF EXISTS farmer_profile_crops CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS post_media CASCADE;
DROP TABLE IF EXISTS post_tags CASCADE;
DROP TABLE IF EXISTS crop_soil_types CASCADE;
DROP TABLE IF EXISTS mandi_crops_traded CASCADE;
DROP TABLE IF EXISTS mandi_facilities CASCADE;
DROP TABLE IF EXISTS scheme_documents CASCADE;
DROP TABLE IF EXISTS news_tags CASCADE;

-- -----------------------------------------------------------------------------
-- 3. Core tables
-- -----------------------------------------------------------------------------

CREATE TABLE users (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    email               VARCHAR(255) UNIQUE,
    phone               VARCHAR(20) UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    role                VARCHAR(20) NOT NULL DEFAULT 'FARMER'
                        CHECK (role IN ('FARMER', 'EXPERT', 'ADMIN', 'SELLER')),
    profile_photo       VARCHAR(500),
    bio                 TEXT,
    preferred_language  VARCHAR(10) NOT NULL DEFAULT 'en',
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    state               VARCHAR(100),
    district            VARCHAR(100),
    village             VARCHAR(150),
    is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    two_factor_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
    reputation_score    INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_current_crops (
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_name   VARCHAR(150) NOT NULL,
    PRIMARY KEY (user_id, crop_name)
);

CREATE TABLE farmer_profiles (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    farm_area           DOUBLE PRECISION,
    soil_type           VARCHAR(100),
    soil_ph             DOUBLE PRECISION,
    water_source        VARCHAR(100),
    farming_experience  INTEGER,
    farming_type        VARCHAR(20) CHECK (farming_type IN ('ORGANIC', 'CONVENTIONAL')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE farmer_profile_crops (
    profile_id  BIGINT NOT NULL REFERENCES farmer_profiles(id) ON DELETE CASCADE,
    crop_name   VARCHAR(150) NOT NULL,
    PRIMARY KEY (profile_id, crop_name)
);

CREATE TABLE crops (
    id                      BIGSERIAL PRIMARY KEY,
    name                    VARCHAR(255) NOT NULL,
    local_names             JSONB NOT NULL DEFAULT '{}',
    season                  VARCHAR(10) CHECK (season IN ('KHARIF', 'RABI', 'ZAID')),
    water_requirement       VARCHAR(100),
    growing_days            INTEGER,
    average_yield_per_acre  NUMERIC(10, 2),
    average_market_price    NUMERIC(10, 2),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE crop_soil_types (
    crop_id     BIGINT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    soil_type   VARCHAR(100) NOT NULL,
    PRIMARY KEY (crop_id, soil_type)
);

CREATE TABLE products (
    id                  BIGSERIAL PRIMARY KEY,
    seller_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title               VARCHAR(500) NOT NULL,
    description         TEXT,
    category            VARCHAR(30) NOT NULL
                        CHECK (category IN (
                            'SEEDS', 'FERTILIZERS', 'TOOLS',
                            'EQUIPMENT', 'PESTICIDES', 'ORGANIC_PRODUCTS'
                        )),
    price               NUMERIC(12, 2) NOT NULL,
    quantity            INTEGER,
    unit                VARCHAR(50),
    condition           VARCHAR(10) NOT NULL DEFAULT 'NEW'
                        CHECK (condition IN ('NEW', 'USED')),
    location            VARCHAR(255),
    is_auction          BOOLEAN NOT NULL DEFAULT FALSE,
    auction_end_time    TIMESTAMPTZ,
    current_bid         NUMERIC(12, 2),
    starting_bid        NUMERIC(12, 2),
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE', 'SOLD', 'CANCELLED')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_images (
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url   VARCHAR(1000) NOT NULL,
    PRIMARY KEY (product_id, image_url)
);

CREATE TABLE product_bids (
    id              BIGSERIAL PRIMARY KEY,
    product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    bidder_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount          NUMERIC(12, 2) NOT NULL,
    is_auto_bid     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
    id                  BIGSERIAL PRIMARY KEY,
    buyer_id            BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    product_id          BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity            INTEGER NOT NULL DEFAULT 1,
    total_amount        NUMERIC(12, 2) NOT NULL,
    payment_status      VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    payment_id          VARCHAR(255),
    delivery_status     VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (delivery_status IN (
                            'PENDING', 'CONFIRMED', 'SHIPPED',
                            'DELIVERED', 'CANCELLED', 'RETURNED'
                        )),
    delivery_address    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chats (
    id              BIGSERIAL PRIMARY KEY,
    sender_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text    TEXT,
    message_type    VARCHAR(10) NOT NULL DEFAULT 'TEXT'
                    CHECK (message_type IN ('TEXT', 'IMAGE', 'VOICE', 'FILE')),
    media_url       VARCHAR(1000),
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    is_pinned       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE posts (
    id              BIGSERIAL PRIMARY KEY,
    author_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT,
    post_type       VARCHAR(10) NOT NULL DEFAULT 'TEXT'
                    CHECK (post_type IN ('TEXT', 'IMAGE', 'VIDEO', 'POLL')),
    category        VARCHAR(100),
    location        VARCHAR(255),
    likes_count     INTEGER NOT NULL DEFAULT 0,
    comments_count  INTEGER NOT NULL DEFAULT 0,
    shares_count    INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE post_media (
    post_id     BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    media_url   VARCHAR(1000) NOT NULL,
    PRIMARY KEY (post_id, media_url)
);

CREATE TABLE post_tags (
    post_id     BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag         VARCHAR(100) NOT NULL,
    PRIMARY KEY (post_id, tag)
);

CREATE TABLE comments (
    id                  BIGSERIAL PRIMARY KEY,
    post_id             BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content             TEXT NOT NULL,
    likes_count         INTEGER NOT NULL DEFAULT 0,
    parent_comment_id   BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE stories (
    id              BIGSERIAL PRIMARY KEY,
    author_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_url       VARCHAR(1000) NOT NULL,
    media_type      VARCHAR(20),
    caption         VARCHAR(500),
    views_count     BIGINT NOT NULL DEFAULT 0,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE market_prices (
    id                  BIGSERIAL PRIMARY KEY,
    crop_id             BIGINT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    mandi_name          VARCHAR(255),
    state               VARCHAR(100),
    district            VARCHAR(100),
    price_per_quintal   NUMERIC(10, 2),
    min_price           NUMERIC(10, 2),
    max_price           NUMERIC(10, 2),
    modal_price         NUMERIC(10, 2),
    trade_volume        BIGINT,
    recorded_date       DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mandis (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    state               VARCHAR(100),
    district            VARCHAR(100),
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    address             TEXT,
    operating_hours     VARCHAR(255),
    contact_phone       VARCHAR(20),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE mandi_crops_traded (
    mandi_id    BIGINT NOT NULL REFERENCES mandis(id) ON DELETE CASCADE,
    crop_name   VARCHAR(150) NOT NULL,
    PRIMARY KEY (mandi_id, crop_name)
);

CREATE TABLE mandi_facilities (
    mandi_id    BIGINT NOT NULL REFERENCES mandis(id) ON DELETE CASCADE,
    facility    VARCHAR(150) NOT NULL,
    PRIMARY KEY (mandi_id, facility)
);

CREATE TABLE commodities (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    category            VARCHAR(100) NOT NULL,
    local_name          VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE daily_prices (
    id                  BIGSERIAL PRIMARY KEY,
    mandi_id            BIGINT NOT NULL REFERENCES mandis(id) ON DELETE CASCADE,
    commodity_id        BIGINT NOT NULL REFERENCES commodities(id) ON DELETE CASCADE,
    min_price           NUMERIC(10, 2) NOT NULL,
    max_price           NUMERIC(10, 2) NOT NULL,
    modal_price         NUMERIC(10, 2) NOT NULL,
    arrival_volume      NUMERIC(12, 2) NOT NULL,
    price_date          DATE NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_watchlist (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    commodity_id        BIGINT REFERENCES commodities(id) ON DELETE CASCADE,
    mandi_id            BIGINT REFERENCES mandis(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_watchlist UNIQUE (user_id, commodity_id, mandi_id)
);

CREATE TABLE govt_schemes (
    id                      BIGSERIAL PRIMARY KEY,
    name                    VARCHAR(500) NOT NULL,
    description             TEXT,
    eligibility_criteria    TEXT,
    benefits                TEXT,
    application_process     TEXT,
    deadline                DATE,
    scheme_type             VARCHAR(10) CHECK (scheme_type IN ('CENTRAL', 'STATE')),
    state                   VARCHAR(100),
    official_link           VARCHAR(1000),
    helpline                VARCHAR(50),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE scheme_documents (
    scheme_id       BIGINT NOT NULL REFERENCES govt_schemes(id) ON DELETE CASCADE,
    document_name   VARCHAR(500) NOT NULL,
    PRIMARY KEY (scheme_id, document_name)
);

CREATE TABLE insurance_schemes (
    id                          BIGSERIAL PRIMARY KEY,
    name                        VARCHAR(500) NOT NULL,
    description                 TEXT,
    coverage_details            TEXT,
    premium_calculation_formula VARCHAR(500),
    eligibility                 TEXT,
    claim_process               TEXT,
    partner_company             VARCHAR(255),
    official_link               VARCHAR(1000),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE crop_calendar (
    id                      BIGSERIAL PRIMARY KEY,
    farmer_id               BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_id                 BIGINT REFERENCES crops(id) ON DELETE SET NULL,
    season                  VARCHAR(10) CHECK (season IN ('KHARIF', 'RABI', 'ZAID')),
    year                    INTEGER,
    planting_date           DATE,
    expected_harvest_date   DATE,
    plot_area               DOUBLE PRECISION,
    status                  VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                            CHECK (status IN ('ACTIVE', 'COMPLETED', 'FAILED')),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE calendar_tasks (
    id                  BIGSERIAL PRIMARY KEY,
    calendar_id         BIGINT NOT NULL REFERENCES crop_calendar(id) ON DELETE CASCADE,
    task_name           VARCHAR(255) NOT NULL,
    task_type           VARCHAR(30) CHECK (task_type IN (
                            'SOWING', 'IRRIGATION', 'FERTILIZING',
                            'PESTICIDE_APPLICATION', 'HARVESTING', 'SELLING'
                        )),
    scheduled_date      DATE,
    completed_date      DATE,
    is_completed        BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_enabled    BOOLEAN NOT NULL DEFAULT TRUE,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE disease_detections (
    id                      BIGSERIAL PRIMARY KEY,
    farmer_id               BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_name               VARCHAR(150),
    image_url               VARCHAR(1000),
    detected_disease        VARCHAR(255),
    severity                VARCHAR(10) CHECK (severity IN ('MILD', 'MODERATE', 'SEVERE')),
    confidence_score        DOUBLE PRECISION,
    treatment_suggestions   JSONB NOT NULL DEFAULT '{}',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notifications (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               VARCHAR(500) NOT NULL,
    message             TEXT,
    notification_type   VARCHAR(30) CHECK (notification_type IN (
                            'WEATHER', 'PRICE_ALERT', 'SCHEME_DEADLINE',
                            'HARVEST_REMINDER', 'PEST_ALERT', 'COMMUNITY',
                            'MARKETPLACE', 'INSURANCE', 'TASK_REMINDER', 'GENERAL'
                        )),
    is_read             BOOLEAN NOT NULL DEFAULT FALSE,
    action_url          VARCHAR(1000),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (
    id                  BIGSERIAL PRIMARY KEY,
    reviewer_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewed_user_id    BIGINT REFERENCES users(id) ON DELETE SET NULL,
    product_id          BIGINT REFERENCES products(id) ON DELETE CASCADE,
    rating              INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE news (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(500) NOT NULL,
    content         TEXT NOT NULL,
    category        VARCHAR(100),
    author          VARCHAR(255),
    source          VARCHAR(255),
    image_url       VARCHAR(1000),
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    state           VARCHAR(100),
    views_count     BIGINT NOT NULL DEFAULT 0,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE news_tags (
    news_id     BIGINT NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    tag         VARCHAR(100) NOT NULL,
    PRIMARY KEY (news_id, tag)
);

CREATE TABLE resources (
    id                  BIGSERIAL PRIMARY KEY,
    title               VARCHAR(500) NOT NULL,
    description         TEXT,
    content_type        VARCHAR(20) CHECK (content_type IN ('VIDEO', 'PDF', 'ARTICLE', 'WEBINAR')),
    content_url         VARCHAR(1000),
    crop_type           VARCHAR(100),
    topic               VARCHAR(100),
    difficulty_level    VARCHAR(20) CHECK (difficulty_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    language            VARCHAR(10),
    thumbnail_url       VARCHAR(1000),
    views_count         BIGINT NOT NULL DEFAULT 0,
    completion_count    BIGINT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE badges (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(150) NOT NULL,
    description         TEXT,
    icon_url            VARCHAR(1000),
    badge_type          VARCHAR(50),
    points_required     INTEGER,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_badges (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id    BIGINT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, badge_id)
);

CREATE TABLE farm_expenses (
    id              BIGSERIAL PRIMARY KEY,
    farmer_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expense_type    VARCHAR(100),
    amount          NUMERIC(12, 2) NOT NULL,
    description     TEXT,
    date            DATE,
    season          VARCHAR(20),
    year            INTEGER,
    receipt_url     VARCHAR(1000),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE admin_logs (
    id              BIGSERIAL PRIMARY KEY,
    entity_name     VARCHAR(255),
    entity_id       BIGINT,
    action          VARCHAR(255),
    performed_by    VARCHAR(255),
    details         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. Indexes
-- -----------------------------------------------------------------------------
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category_status ON products(category, status);
CREATE INDEX idx_products_auction ON products(is_auction) WHERE is_auction = TRUE;

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);

CREATE INDEX idx_chats_sender_receiver ON chats(sender_id, receiver_id);
CREATE INDEX idx_chats_created ON chats(created_at DESC);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category);

CREATE INDEX idx_comments_post ON comments(post_id);

CREATE INDEX idx_market_prices_crop_date ON market_prices(crop_id, recorded_date DESC);
CREATE INDEX idx_market_prices_mandi ON market_prices(mandi_name, state);

CREATE INDEX idx_mandis_location ON mandis(latitude, longitude);

CREATE INDEX idx_crop_calendar_farmer ON crop_calendar(farmer_id);
CREATE INDEX idx_calendar_tasks_calendar ON calendar_tasks(calendar_id);
CREATE INDEX idx_calendar_tasks_scheduled ON calendar_tasks(scheduled_date);

CREATE INDEX idx_disease_farmer ON disease_detections(farmer_id);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

CREATE INDEX idx_reviews_product ON reviews(product_id);

CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_state ON news(state);

CREATE INDEX idx_farm_expenses_farmer ON farm_expenses(farmer_id);

CREATE INDEX idx_stories_expires ON stories(expires_at);

CREATE INDEX idx_admin_logs_entity ON admin_logs(entity_name, entity_id);


-- -----------------------------------------------------------------------------
-- 5. updated_at trigger (optional)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'users', 'farmer_profiles', 'crops', 'products', 'product_bids', 'orders',
        'chats', 'posts', 'comments', 'stories', 'market_prices', 'mandis',
        'govt_schemes', 'insurance_schemes', 'crop_calendar', 'calendar_tasks',
        'disease_detections', 'notifications', 'reviews', 'news', 'resources',
        'badges', 'user_badges', 'farm_expenses', 'admin_logs', 'commodities',
        'daily_prices', 'user_watchlist'
    ])
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_%s_updated_at ON %I;
            CREATE TRIGGER trg_%s_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
        ', t, t, t, t);
    END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- 6. Sample seed data (optional — remove in production)
-- -----------------------------------------------------------------------------
INSERT INTO crops (name, local_names, season, water_requirement, growing_days,
                   average_yield_per_acre, average_market_price)
VALUES
    ('Wheat', '{"hi":"गेहूं","en":"Wheat"}', 'RABI', 'Medium', 120, 18.00, 2200.00),
    ('Rice', '{"hi":"धान","en":"Rice"}', 'KHARIF', 'High', 150, 22.00, 2800.00),
    ('Cotton', '{"hi":"कपास","en":"Cotton"}', 'KHARIF', 'Medium', 180, 12.00, 6500.00);

INSERT INTO badges (name, description, badge_type, points_required)
VALUES
    ('Eco Farmer', 'Practices organic farming', 'ACHIEVEMENT', 100),
    ('Community Leader', 'Top forum contributor', 'ACHIEVEMENT', 500),
    ('Master Farmer', 'Completed all learning modules', 'CERTIFICATION', 1000);

INSERT INTO govt_schemes (name, description, scheme_type, state, helpline)
VALUES
    ('PM-KISAN', 'Income support for farmer families', 'CENTRAL', NULL, '155261'),
    ('PMFBY', 'Crop insurance scheme', 'CENTRAL', NULL, '1800-180-1551');

INSERT INTO insurance_schemes (name, description, partner_company)
VALUES
    ('Pradhan Mantri Fasal Bima Yojana', 'Comprehensive crop insurance', 'Agriculture Insurance Company of India');

-- Optional admin (password: password) — change hash via /api/auth/register or your own BCrypt
-- INSERT INTO users (name, email, phone, password_hash, role, is_verified)
-- VALUES (
--     'FarmSetu Admin',
--     'admin@farmsetu.in',
--     '9999999999',
--     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
--     'ADMIN',
--     TRUE
-- );
