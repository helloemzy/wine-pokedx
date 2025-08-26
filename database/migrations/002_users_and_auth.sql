-- ============================================================================
-- Wine Pokédx Database Migration 002: Users and Authentication
-- ============================================================================

-- ============================================================================
-- USERS TABLE - Core user information and authentication
-- ============================================================================

CREATE TABLE users (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    
    -- Authentication
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Password reset
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Basic profile information
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    bio TEXT,
    location VARCHAR(100),
    
    -- User progression
    level user_level DEFAULT 1,
    tier user_tier DEFAULT 'Novice',
    total_experience experience_points DEFAULT 0,
    
    -- Experience breakdown
    experience_tasting experience_points DEFAULT 0,
    experience_collecting experience_points DEFAULT 0,
    experience_trading experience_points DEFAULT 0,
    experience_breeding experience_points DEFAULT 0,
    experience_competition experience_points DEFAULT 0,
    experience_social experience_points DEFAULT 0,
    experience_education experience_points DEFAULT 0,
    
    -- User preferences
    timezone VARCHAR(50) DEFAULT 'UTC',
    language_code VARCHAR(5) DEFAULT 'en',
    theme_preference VARCHAR(20) DEFAULT 'system',
    
    -- Privacy settings
    profile_visibility visibility_level DEFAULT 'Public',
    collection_visibility visibility_level DEFAULT 'Public',
    allow_friend_requests BOOLEAN DEFAULT TRUE,
    allow_trade_requests BOOLEAN DEFAULT TRUE,
    
    -- WSET Integration
    wset_level wset_level,
    wset_certification_date DATE,
    wset_student_id VARCHAR(50),
    
    -- Professional information
    is_professional BOOLEAN DEFAULT FALSE,
    professional_title VARCHAR(100),
    winery_affiliation VARCHAR(200),
    sommelier_certification VARCHAR(100),
    
    -- Account status
    role user_role DEFAULT 'User',
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    ban_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Subscription and premium features
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    subscription_tier VARCHAR(20),
    
    -- Security
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(32),
    backup_codes TEXT[],
    
    -- Activity tracking
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    login_count INTEGER DEFAULT 0,
    
    -- Social stats
    friend_count INTEGER DEFAULT 0,
    guild_memberships INTEGER DEFAULT 0,
    trade_rating DECIMAL(3,2) DEFAULT 0.00,
    completed_trades INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER SESSIONS - Authentication session management
-- ============================================================================

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session data
    token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    
    -- Device information
    device_type VARCHAR(50), -- 'mobile', 'desktop', 'tablet'
    device_name VARCHAR(100),
    user_agent TEXT,
    ip_address INET,
    
    -- Session status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Expiration
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    refresh_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER ACHIEVEMENTS - Badge and achievement system
-- ============================================================================

CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Badge information
    badge_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(500),
    
    -- Badge properties
    category badge_category NOT NULL,
    rarity badge_rarity NOT NULL,
    
    -- Progress tracking
    progress_current INTEGER DEFAULT 0,
    progress_required INTEGER DEFAULT 1,
    
    -- Rewards
    experience_reward JSONB, -- Experience gains by type
    item_rewards TEXT[], -- Array of item IDs
    title_unlocks TEXT[], -- Array of title names
    
    -- Status
    is_earned BOOLEAN DEFAULT FALSE,
    earned_date TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER ACHIEVEMENTS - Broader achievement system
-- ============================================================================

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Achievement information
    achievement_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    
    -- Achievement properties
    type achievement_type NOT NULL,
    category VARCHAR(50) NOT NULL,
    
    -- Progress tracking
    progress_data JSONB NOT NULL, -- Flexible progress data
    target_data JSONB NOT NULL, -- Target conditions
    
    -- Status
    is_completed BOOLEAN DEFAULT FALSE,
    completed_date TIMESTAMP WITH TIME ZONE,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Rewards
    experience_rewards JSONB,
    badge_rewards TEXT[],
    item_rewards TEXT[],
    title_rewards TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER TITLES - Earned and equipped titles
-- ============================================================================

CREATE TABLE user_titles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Title information
    title_id VARCHAR(50) NOT NULL,
    title_name VARCHAR(100) NOT NULL,
    title_description TEXT,
    
    -- Title properties
    rarity badge_rarity DEFAULT 'Bronze',
    category VARCHAR(50),
    
    -- Requirements met
    requirements_met JSONB,
    
    -- Status
    is_unlocked BOOLEAN DEFAULT FALSE,
    is_equipped BOOLEAN DEFAULT FALSE,
    unlocked_date TIMESTAMP WITH TIME ZONE,
    
    -- Source tracking
    source_type VARCHAR(50), -- 'badge', 'achievement', 'competition', 'event'
    source_id VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER PREFERENCES - Detailed user preferences
-- ============================================================================

CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    
    -- Specific notification types
    notify_friend_requests BOOLEAN DEFAULT TRUE,
    notify_trade_offers BOOLEAN DEFAULT TRUE,
    notify_guild_activities BOOLEAN DEFAULT TRUE,
    notify_competition_updates BOOLEAN DEFAULT TRUE,
    notify_wine_discoveries BOOLEAN DEFAULT TRUE,
    notify_level_ups BOOLEAN DEFAULT TRUE,
    notify_badge_earnings BOOLEAN DEFAULT TRUE,
    
    -- Game preferences
    auto_accept_friend_requests BOOLEAN DEFAULT FALSE,
    auto_decline_low_rating_trades BOOLEAN DEFAULT FALSE,
    minimum_trade_rating DECIMAL(3,2) DEFAULT 0.00,
    
    -- Display preferences
    show_detailed_stats BOOLEAN DEFAULT TRUE,
    show_iv_ev_stats BOOLEAN DEFAULT FALSE, -- Hidden by default for casual users
    collection_sort_preference VARCHAR(20) DEFAULT 'date_added',
    collection_view_mode VARCHAR(20) DEFAULT 'grid',
    
    -- Privacy preferences
    share_collection_data BOOLEAN DEFAULT TRUE,
    share_tasting_notes BOOLEAN DEFAULT TRUE,
    allow_data_analytics BOOLEAN DEFAULT TRUE,
    
    -- Regional preferences
    preferred_regions TEXT[],
    preferred_wine_types wine_type[],
    price_range_preference JSONB, -- {min: number, max: number, currency: string}
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER FRIENDSHIPS - Social connections between users
-- ============================================================================

CREATE TABLE user_friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Friendship status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked', 'declined')),
    
    -- Timestamps
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(requester_id, addressee_id),
    CHECK(requester_id != addressee_id)
);

-- ============================================================================
-- USER ACTIVITY LOG - Track user activities
-- ============================================================================

CREATE TABLE user_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL, -- 'wine_added', 'trade_completed', 'badge_earned', etc.
    activity_data JSONB, -- Flexible data for different activity types
    
    -- Experience gained
    experience_gained JSONB, -- Experience by type
    
    -- Related entities
    wine_id UUID, -- Reference to wine if applicable
    trade_id UUID, -- Reference to trade if applicable
    
    -- Context
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER STATISTICS - Cached user statistics for performance
-- ============================================================================

CREATE TABLE user_statistics (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Collection stats
    total_wines INTEGER DEFAULT 0,
    unique_wines INTEGER DEFAULT 0,
    shiny_wines INTEGER DEFAULT 0,
    perfect_iv_wines INTEGER DEFAULT 0,
    
    -- Progress stats
    badges_earned INTEGER DEFAULT 0,
    achievements_completed INTEGER DEFAULT 0,
    competitions_won INTEGER DEFAULT 0,
    
    -- Social stats
    trades_completed INTEGER DEFAULT 0,
    friends_count INTEGER DEFAULT 0,
    guild_contributions INTEGER DEFAULT 0,
    
    -- Activity stats
    days_active INTEGER DEFAULT 0,
    wines_tasted INTEGER DEFAULT 0,
    notes_written INTEGER DEFAULT 0,
    
    -- Financial stats
    total_spent DECIMAL(12,2) DEFAULT 0,
    collection_value DECIMAL(12,2) DEFAULT 0,
    investment_return DECIMAL(8,4) DEFAULT 0,
    
    -- Favorite categories
    favorite_wine_type wine_type,
    favorite_region VARCHAR(100),
    favorite_vintage INTEGER,
    
    -- Streaks and records
    current_login_streak INTEGER DEFAULT 0,
    longest_login_streak INTEGER DEFAULT 0,
    current_tasting_streak INTEGER DEFAULT 0,
    longest_tasting_streak INTEGER DEFAULT 0,
    
    -- Rankings
    global_rank INTEGER,
    regional_rank INTEGER,
    guild_rank INTEGER,
    
    -- Timestamps
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_level_tier ON users(level, tier);
CREATE INDEX idx_users_active_premium ON users(is_active, is_premium) WHERE is_active = TRUE;
CREATE INDEX idx_users_location ON users(location) WHERE location IS NOT NULL;
CREATE INDEX idx_users_last_active ON users(last_active_at);

-- Session management
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, expires_at) WHERE is_active = TRUE;

-- Badges and achievements
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_category ON user_badges(category);
CREATE INDEX idx_user_badges_earned ON user_badges(is_earned, earned_date) WHERE is_earned = TRUE;
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_completed ON user_achievements(is_completed, completed_date) WHERE is_completed = TRUE;

-- Titles
CREATE INDEX idx_user_titles_user_id ON user_titles(user_id);
CREATE INDEX idx_user_titles_equipped ON user_titles(user_id, is_equipped) WHERE is_equipped = TRUE;

-- Friendships
CREATE INDEX idx_user_friendships_requester ON user_friendships(requester_id);
CREATE INDEX idx_user_friendships_addressee ON user_friendships(addressee_id);
CREATE INDEX idx_user_friendships_status ON user_friendships(status);

-- Activity log
CREATE INDEX idx_user_activity_log_user_id_created ON user_activity_log(user_id, created_at);
CREATE INDEX idx_user_activity_log_activity_type ON user_activity_log(activity_type);
CREATE INDEX idx_user_activity_log_created_at ON user_activity_log(created_at);

-- Statistics
CREATE INDEX idx_user_statistics_global_rank ON user_statistics(global_rank) WHERE global_rank IS NOT NULL;
CREATE INDEX idx_user_statistics_collection_value ON user_statistics(collection_value);

-- ============================================================================
-- TRIGGERS FOR DATA CONSISTENCY
-- ============================================================================

-- Update user updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_update_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_updated_at();

-- Update user level and tier based on experience
CREATE OR REPLACE FUNCTION update_user_level_tier()
RETURNS TRIGGER AS $$
DECLARE
    new_level INTEGER;
    new_tier user_tier;
BEGIN
    -- Calculate level based on total experience (100 XP per level up to 100, then scaling)
    IF NEW.total_experience < 10000 THEN
        new_level = GREATEST(1, (NEW.total_experience / 100)::INTEGER);
    ELSE
        new_level = 100 + ((NEW.total_experience - 10000) / 1000)::INTEGER;
    END IF;
    
    -- Determine tier based on level
    IF new_level <= 20 THEN
        new_tier = 'Novice';
    ELSIF new_level <= 50 THEN
        new_tier = 'Intermediate';
    ELSIF new_level <= 80 THEN
        new_tier = 'Advanced';
    ELSIF new_level <= 100 THEN
        new_tier = 'Expert';
    ELSE
        new_tier = 'Master';
    END IF;
    
    NEW.level = new_level;
    NEW.tier = new_tier;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_update_level_tier
    BEFORE UPDATE OF total_experience ON users
    FOR EACH ROW
    WHEN (OLD.total_experience IS DISTINCT FROM NEW.total_experience)
    EXECUTE FUNCTION update_user_level_tier();

-- Update friendship count in users table
CREATE OR REPLACE FUNCTION update_friendship_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
        UPDATE users SET friend_count = friend_count + 1 WHERE id IN (NEW.requester_id, NEW.addressee_id);
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
        UPDATE users SET friend_count = friend_count + 1 WHERE id IN (NEW.requester_id, NEW.addressee_id);
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
        UPDATE users SET friend_count = friend_count - 1 WHERE id IN (NEW.requester_id, NEW.addressee_id);
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
        UPDATE users SET friend_count = friend_count - 1 WHERE id IN (OLD.requester_id, OLD.addressee_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_friendship_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_friendships
    FOR EACH ROW
    EXECUTE FUNCTION update_friendship_count();

-- ============================================================================
-- CONSTRAINTS AND VALIDATION
-- ============================================================================

-- Email validation
ALTER TABLE users ADD CONSTRAINT users_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Username validation (alphanumeric and underscores, 3-50 characters)
ALTER TABLE users ADD CONSTRAINT users_username_format
    CHECK (username ~* '^[A-Za-z0-9_]{3,50}$');

-- Experience values must be non-negative
ALTER TABLE users ADD CONSTRAINT users_experience_non_negative
    CHECK (
        total_experience >= 0 AND
        experience_tasting >= 0 AND
        experience_collecting >= 0 AND
        experience_trading >= 0 AND
        experience_breeding >= 0 AND
        experience_competition >= 0 AND
        experience_social >= 0 AND
        experience_education >= 0
    );

-- Total experience should equal sum of individual experience types
ALTER TABLE users ADD CONSTRAINT users_experience_total_consistency
    CHECK (
        total_experience = (
            experience_tasting + experience_collecting + experience_trading +
            experience_breeding + experience_competition + experience_social + experience_education
        )
    );

-- Trade rating between 0 and 5
ALTER TABLE users ADD CONSTRAINT users_trade_rating_range
    CHECK (trade_rating >= 0 AND trade_rating <= 5);

-- Premium expiration must be in future if premium is active
ALTER TABLE users ADD CONSTRAINT users_premium_expiration_logic
    CHECK (NOT is_premium OR premium_expires_at > NOW());

-- Ban expiration logic
ALTER TABLE users ADD CONSTRAINT users_ban_logic
    CHECK (NOT is_banned OR ban_reason IS NOT NULL);

-- ============================================================================
-- COMMENTS ON TABLES
-- ============================================================================

COMMENT ON TABLE users IS 'Core user accounts with authentication and progression data';
COMMENT ON TABLE user_sessions IS 'Authentication session management and device tracking';
COMMENT ON TABLE user_badges IS 'Badge system for user achievements and milestones';
COMMENT ON TABLE user_achievements IS 'Comprehensive achievement system with flexible progress tracking';
COMMENT ON TABLE user_titles IS 'Earned and equipped user titles for personalization';
COMMENT ON TABLE user_preferences IS 'Detailed user preferences for notifications and display';
COMMENT ON TABLE user_friendships IS 'Social connections between users';
COMMENT ON TABLE user_activity_log IS 'Comprehensive activity tracking for analytics and progression';
COMMENT ON TABLE user_statistics IS 'Cached user statistics for improved performance';

COMMENT ON COLUMN users.total_experience IS 'Sum of all experience types, used for level calculation';
COMMENT ON COLUMN users.tier IS 'User tier automatically calculated from level';
COMMENT ON COLUMN user_sessions.refresh_token IS 'For extending session without re-authentication';
COMMENT ON COLUMN user_activity_log.activity_data IS 'JSONB for flexible activity-specific data storage';