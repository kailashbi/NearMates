-- NearMates Supabase PostgreSQL & PostGIS Schema
-- Complete DDL for clean deployment

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    display_name VARCHAR(50) NOT NULL CHECK (length(btrim(display_name)) BETWEEN 2 AND 50),
    bio VARCHAR(500),
    avatar_url TEXT,
    age INT CHECK (age IS NULL OR (age >= 13 AND age <= 120)),
    location_name VARCHAR(150),
    location_point GEOGRAPHY(Point, 4326),
    availability_status VARCHAR(30) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
    search_radius_km INT DEFAULT 15 CHECK (search_radius_km BETWEEN 1 AND 100),
    is_discoverable BOOLEAN NOT NULL DEFAULT TRUE,
    rating NUMERIC(3, 1) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles USING GIST(location_point);
CREATE INDEX IF NOT EXISTS idx_profiles_discoverable ON profiles(is_discoverable);

-- 3. Interests Taxonomy
CREATE TABLE IF NOT EXISTS interests (
    interest_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_interests_category ON interests(category);

-- 4. User Interests Many-to-Many
CREATE TABLE IF NOT EXISTS user_interests (
    profile_id UUID NOT NULL REFERENCES profiles(profile_id) ON DELETE CASCADE,
    interest_id VARCHAR(50) NOT NULL REFERENCES interests(interest_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (profile_id, interest_id)
);
CREATE INDEX IF NOT EXISTS idx_user_interests_profile ON user_interests(profile_id);

-- 5. Activities Table
CREATE TABLE IF NOT EXISTS activities (
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_profile_id UUID NOT NULL REFERENCES profiles(profile_id) ON DELETE RESTRICT,
    title VARCHAR(100) NOT NULL CHECK (length(btrim(title)) BETWEEN 3 AND 100),
    description VARCHAR(2000) NOT NULL CHECK (length(btrim(description)) >= 1),
    category_id VARCHAR(50) NOT NULL REFERENCES interests(interest_id) ON DELETE RESTRICT,
    location_name VARCHAR(150) NOT NULL,
    location_description VARCHAR(500),
    location_point GEOGRAPHY(Point, 4326),
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ,
    min_participants SMALLINT NOT NULL DEFAULT 1 CHECK (min_participants >= 1),
    max_participants SMALLINT NOT NULL CHECK (max_participants BETWEEN 1 AND 100),
    estimated_cost NUMERIC(10, 2) DEFAULT 0 CHECK (estimated_cost >= 0),
    visibility VARCHAR(16) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'invite_only')),
    join_policy VARCHAR(16) NOT NULL DEFAULT 'approval' CHECK (join_policy IN ('approval', 'auto_join')),
    status VARCHAR(16) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT activities_valid_time CHECK (ends_at IS NULL OR ends_at > starts_at),
    CONSTRAINT activities_valid_capacity CHECK (min_participants <= max_participants)
);
CREATE INDEX IF NOT EXISTS idx_activities_location ON activities USING GIST(location_point);
CREATE INDEX IF NOT EXISTS idx_activities_status_time ON activities(status, starts_at);
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category_id);
CREATE INDEX IF NOT EXISTS idx_activities_host ON activities(host_profile_id);

-- 6. Activity Memberships
CREATE TABLE IF NOT EXISTS activity_memberships (
    membership_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(activity_id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(profile_id) ON DELETE CASCADE,
    role VARCHAR(16) NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'co-host')),
    status VARCHAR(16) NOT NULL CHECK (status IN ('requested', 'approved', 'rejected', 'withdrawn', 'left', 'removed')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT activity_memberships_unique UNIQUE (activity_id, profile_id)
);
CREATE INDEX IF NOT EXISTS idx_memberships_act_status ON activity_memberships(activity_id, status);
CREATE INDEX IF NOT EXISTS idx_memberships_profile ON activity_memberships(profile_id, status);

-- 7. Activity Messages
CREATE TABLE IF NOT EXISTS activity_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(activity_id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(profile_id) ON DELETE CASCADE,
    content VARCHAR(2000) NOT NULL CHECK (length(btrim(content)) >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activity_messages ON activity_messages(activity_id, created_at DESC);

-- 8. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES profiles(profile_id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL CHECK (
        type IN (
            'match',
            'join_request',
            'request_approved',
            'request_rejected',
            'activity_cancelled',
            'activity_reminder',
            'chat_message',
            'system'
        )
    ),
    title VARCHAR(200) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    activity_id UUID REFERENCES activities(activity_id) ON DELETE SET NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id) WHERE read_at IS NULL;

-- 9. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(activity_id) ON DELETE CASCADE,
    reviewer_profile_id UUID NOT NULL REFERENCES profiles(profile_id) ON DELETE CASCADE,
    reviewee_profile_id UUID NOT NULL REFERENCES profiles(profile_id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_activity_review UNIQUE (activity_id, reviewer_profile_id, reviewee_profile_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_profile_id);

-- 10. Reports & Moderation
CREATE TABLE IF NOT EXISTS reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_profile_id UUID NOT NULL REFERENCES profiles(profile_id) ON DELETE CASCADE,
    reported_profile_id UUID REFERENCES profiles(profile_id) ON DELETE SET NULL,
    activity_id UUID REFERENCES activities(activity_id) ON DELETE SET NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

