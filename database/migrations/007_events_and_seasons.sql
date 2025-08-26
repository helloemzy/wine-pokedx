-- ============================================================================
-- Wine Pokédx Database Migration 007: Events and Seasonal Content
-- ============================================================================

-- ============================================================================
-- GAME EVENTS - Global events that affect gameplay
-- ============================================================================

CREATE TABLE game_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event identification
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    
    -- Event classification
    event_type event_type NOT NULL,
    theme VARCHAR(100),
    
    -- Scheduling
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    duration_hours INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (end_date - start_date)) / 3600
    ) STORED,
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern VARCHAR(20), -- 'Daily', 'Weekly', 'Monthly', 'Seasonal', 'Yearly'
    recurrence_interval INTEGER DEFAULT 1,
    next_occurrence TIMESTAMP WITH TIME ZONE,
    
    -- Participation requirements
    minimum_level user_level DEFAULT 1,
    maximum_level user_level,
    required_badges TEXT[] DEFAULT '{}',
    guild_membership_required BOOLEAN DEFAULT FALSE,
    region_restrictions TEXT[] DEFAULT '{}',
    
    -- Capacity and scaling
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    participation_scaling BOOLEAN DEFAULT TRUE, -- Auto-scale rewards based on participation
    
    -- Event mechanics and bonuses
    experience_multipliers JSONB DEFAULT '{}', -- {tasting: 2.0, collecting: 1.5, ...}
    rare_find_multiplier DECIMAL(6,4) DEFAULT 1.0000,
    shiny_odds_multiplier DECIMAL(6,4) DEFAULT 1.0000,
    
    -- Special spawns and availability
    exclusive_wine_spawns BOOLEAN DEFAULT FALSE,
    boosted_wine_types wine_type[] DEFAULT '{}',
    boosted_regions TEXT[] DEFAULT '{}',
    
    -- Evolution and breeding bonuses
    evolution_success_bonus DECIMAL(5,2) DEFAULT 0.00,
    breeding_success_bonus DECIMAL(5,2) DEFAULT 0.00,
    reduced_evolution_requirements BOOLEAN DEFAULT FALSE,
    
    -- Global goals and community challenges
    has_global_goal BOOLEAN DEFAULT FALSE,
    global_goal_description TEXT,
    global_goal_target BIGINT,
    global_goal_current BIGINT DEFAULT 0,
    global_goal_rewards JSONB,
    
    -- Visibility and promotion
    is_featured BOOLEAN DEFAULT FALSE,
    featured_image_url VARCHAR(500),
    banner_image_url VARCHAR(500),
    announcement_message TEXT,
    
    -- Status and lifecycle
    status event_status DEFAULT 'Upcoming',
    is_active BOOLEAN GENERATED ALWAYS AS (
        status = 'Active' AND 
        NOW() BETWEEN start_date AND end_date
    ) STORED,
    
    -- Results and statistics
    total_participation INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    average_score DECIMAL(8,4),
    community_satisfaction DECIMAL(3,2),
    
    -- Creation and management
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approval_date TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- EVENT CHALLENGES - Individual challenges within events
-- ============================================================================

CREATE TABLE event_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES game_events(id) ON DELETE CASCADE,
    
    -- Challenge details
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    challenge_type VARCHAR(50) NOT NULL, -- 'Collection', 'Tasting', 'Trading', 'Social', 'Knowledge', 'Creative'
    difficulty challenge_difficulty NOT NULL,
    
    -- Requirements and objectives
    objectives JSONB NOT NULL, -- Flexible structure: [{description: "Collect 5 Terroir wines", target: 5, metric: "wine_count"}]
    prerequisites TEXT[] DEFAULT '{}', -- Other challenge IDs that must be completed first
    
    -- Timing
    available_from TIMESTAMP WITH TIME ZONE,
    available_until TIMESTAMP WITH TIME ZONE,
    time_limit_hours INTEGER,
    
    -- Rewards
    completion_rewards JSONB NOT NULL,
    bonus_rewards JSONB, -- Extra rewards for exceptional performance
    first_completion_bonus JSONB, -- Bonus for being first to complete globally
    
    -- Progress tracking
    total_completions INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    average_completion_time INTERVAL,
    
    -- Leaderboard
    has_leaderboard BOOLEAN DEFAULT FALSE,
    leaderboard_metric VARCHAR(50), -- 'time', 'score', 'efficiency'
    leaderboard_order VARCHAR(4) DEFAULT 'ASC' CHECK (leaderboard_order IN ('ASC', 'DESC')),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- EVENT PARTICIPATION - Track user participation in events
-- ============================================================================

CREATE TABLE event_participation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES game_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Participation details
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Progress tracking
    challenges_completed INTEGER DEFAULT 0,
    total_challenges INTEGER,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Performance metrics
    total_score DECIMAL(10,4) DEFAULT 0,
    best_challenge_score DECIMAL(8,4) DEFAULT 0,
    participation_streak INTEGER DEFAULT 0,
    
    -- Rankings
    current_rank INTEGER,
    best_rank INTEGER,
    final_rank INTEGER,
    
    -- Rewards earned
    experience_earned JSONB DEFAULT '{}',
    items_earned TEXT[] DEFAULT '{}',
    badges_earned TEXT[] DEFAULT '{}',
    exclusive_wines_earned UUID[] DEFAULT '{}',
    
    -- Engagement metrics
    daily_activity_count INTEGER DEFAULT 0,
    social_interactions INTEGER DEFAULT 0, -- Trades, guild activities during event
    
    -- Special achievements
    achieved_perfect_score BOOLEAN DEFAULT FALSE,
    completed_all_challenges BOOLEAN DEFAULT FALSE,
    contributed_to_global_goal BIGINT DEFAULT 0,
    
    -- Feedback
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    feedback TEXT,
    favorite_challenge_id UUID REFERENCES event_challenges(id),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(event_id, user_id)
);

-- ============================================================================
-- CHALLENGE PROGRESS - Track individual challenge completion
-- ============================================================================

CREATE TABLE challenge_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID NOT NULL REFERENCES event_challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Progress details
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Objective tracking
    objectives_progress JSONB NOT NULL, -- Current progress for each objective
    current_progress DECIMAL(5,2) DEFAULT 0.00,
    
    -- Performance metrics
    score DECIMAL(8,4) DEFAULT 0.00,
    completion_time INTERVAL,
    efficiency_rating DECIMAL(5,2),
    
    -- Attempts and retries
    attempt_count INTEGER DEFAULT 1,
    best_score DECIMAL(8,4) DEFAULT 0.00,
    
    -- Rewards claimed
    rewards_claimed BOOLEAN DEFAULT FALSE,
    bonus_rewards_claimed BOOLEAN DEFAULT FALSE,
    claim_date TIMESTAMP WITH TIME ZONE,
    
    -- Rankings (for leaderboard challenges)
    rank INTEGER,
    percentile DECIMAL(5,2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'abandoned')),
    
    UNIQUE(challenge_id, user_id)
);

-- ============================================================================
-- SEASONAL MODIFIERS - Seasonal effects on gameplay
-- ============================================================================

CREATE TABLE seasonal_modifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Season identification
    season season NOT NULL,
    year INTEGER NOT NULL,
    
    -- Period definition
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Spawn rate modifiers
    rarity_bonuses JSONB DEFAULT '{}', -- {Everyday: 1.1, Rare: 1.2, ...}
    type_bonuses JSONB DEFAULT '{}', -- {Terroir: 1.15, Flow: 0.9, ...}
    region_bonuses JSONB DEFAULT '{}', -- {Burgundy: 1.2, Champagne: 1.3, ...}
    shiny_multiplier DECIMAL(6,4) DEFAULT 1.0000,
    
    -- Activity bonuses
    experience_bonuses JSONB DEFAULT '{}', -- {tasting: 1.1, collecting: 1.05, ...}
    trading_bonuses JSONB DEFAULT '{}', -- {reduced_fees: 0.8, bonus_reputation: 1.2}
    
    -- Competition and social bonuses
    competition_bonuses JSONB DEFAULT '{}',
    guild_activity_bonuses JSONB DEFAULT '{}',
    
    -- Special mechanics
    special_mechanics JSONB DEFAULT '{}', -- Season-specific gameplay changes
    
    -- Featured content
    featured_wine_species UUID[] DEFAULT '{}',
    featured_regions TEXT[] DEFAULT '{}',
    featured_wine_types wine_type[] DEFAULT '{}',
    
    -- Weather and environmental effects
    weather_pattern VARCHAR(100),
    environmental_effects JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(season, year)
);

-- ============================================================================
-- EVENT REWARDS - Catalog of possible event rewards
-- ============================================================================

CREATE TABLE event_reward_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Reward identification
    name VARCHAR(200) NOT NULL,
    reward_type VARCHAR(50) NOT NULL, -- 'Experience', 'Item', 'Badge', 'Title', 'Wine', 'Currency'
    category VARCHAR(100),
    
    -- Reward details
    description TEXT,
    
    -- Value and rarity
    value_tier badge_rarity DEFAULT 'Bronze',
    rarity_score INTEGER DEFAULT 1 CHECK (rarity_score >= 1 AND rarity_score <= 10),
    
    -- Reward data
    reward_data JSONB NOT NULL, -- Flexible structure for different reward types
    
    -- Visual representation
    icon_url VARCHAR(500),
    image_url VARCHAR(500),
    animation_url VARCHAR(500),
    
    -- Usage restrictions
    is_exclusive BOOLEAN DEFAULT FALSE,
    is_tradeable BOOLEAN DEFAULT TRUE,
    expiry_period INTERVAL,
    
    -- Availability
    is_active BOOLEAN DEFAULT TRUE,
    season_restricted season,
    event_type_restricted event_type,
    
    -- Statistics
    times_awarded INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER SEASONAL STATS - Track user performance by season
-- ============================================================================

CREATE TABLE user_seasonal_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    season season NOT NULL,
    year INTEGER NOT NULL,
    
    -- Activity stats
    wines_discovered INTEGER DEFAULT 0,
    wines_captured INTEGER DEFAULT 0,
    shiny_wines_found INTEGER DEFAULT 0,
    
    -- Evolution and breeding
    successful_evolutions INTEGER DEFAULT 0,
    successful_breedings INTEGER DEFAULT 0,
    
    -- Social activity
    trades_completed INTEGER DEFAULT 0,
    guild_events_participated INTEGER DEFAULT 0,
    competitions_entered INTEGER DEFAULT 0,
    competitions_won INTEGER DEFAULT 0,
    
    -- Experience gained
    total_experience_gained experience_points DEFAULT 0,
    experience_by_type JSONB DEFAULT '{}',
    
    -- Achievements
    seasonal_badges_earned TEXT[] DEFAULT '{}',
    seasonal_titles_earned TEXT[] DEFAULT '{}',
    special_achievements TEXT[] DEFAULT '{}',
    
    -- Rankings and performance
    seasonal_rank INTEGER,
    regional_rank INTEGER,
    guild_rank INTEGER,
    
    -- Participation metrics
    active_days INTEGER DEFAULT 0,
    event_participation_count INTEGER DEFAULT 0,
    challenge_completion_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Collection progress
    collection_growth INTEGER DEFAULT 0,
    rarity_tier_achievements JSONB DEFAULT '{}',
    type_mastery_progress JSONB DEFAULT '{}',
    
    -- Special season metrics
    season_specific_metrics JSONB DEFAULT '{}',
    
    -- Timestamps
    season_start_date TIMESTAMP WITH TIME ZONE,
    season_end_date TIMESTAMP WITH TIME ZONE,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, season, year)
);

-- ============================================================================
-- EVENT LEADERBOARDS - Rankings for competitive events
-- ============================================================================

CREATE TABLE event_leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES game_events(id) ON DELETE CASCADE,
    
    -- Leaderboard configuration
    name VARCHAR(200) NOT NULL,
    leaderboard_type VARCHAR(50) NOT NULL, -- 'Overall', 'Challenge', 'Guild', 'Regional'
    
    -- Ranking criteria
    ranking_metric VARCHAR(50) NOT NULL, -- 'score', 'completion_time', 'efficiency'
    ranking_order VARCHAR(4) DEFAULT 'DESC' CHECK (ranking_order IN ('ASC', 'DESC')),
    
    -- Scope and filters
    scope_type VARCHAR(50) DEFAULT 'Global', -- 'Global', 'Regional', 'Guild'
    scope_identifier VARCHAR(200), -- Region name or guild ID
    
    -- Leaderboard data
    entries JSONB NOT NULL, -- Array of {user_id, score, rank, additional_data}
    total_entries INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Rewards for top performers
    top_performer_rewards JSONB,
    
    -- Display settings
    is_public BOOLEAN DEFAULT TRUE,
    show_full_rankings BOOLEAN DEFAULT FALSE,
    max_displayed_entries INTEGER DEFAULT 100,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Game events
CREATE INDEX idx_game_events_type ON game_events(event_type);
CREATE INDEX idx_game_events_status ON game_events(status);
CREATE INDEX idx_game_events_active ON game_events(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_game_events_dates ON game_events(start_date, end_date);
CREATE INDEX idx_game_events_recurring ON game_events(is_recurring, next_occurrence) WHERE is_recurring = TRUE;
CREATE INDEX idx_game_events_slug ON game_events(slug);

-- Event challenges
CREATE INDEX idx_event_challenges_event ON event_challenges(event_id);
CREATE INDEX idx_event_challenges_type ON event_challenges(challenge_type);
CREATE INDEX idx_event_challenges_difficulty ON event_challenges(difficulty);
CREATE INDEX idx_event_challenges_active ON event_challenges(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_event_challenges_available ON event_challenges(available_from, available_until);

-- Event participation
CREATE INDEX idx_event_participation_event ON event_participation(event_id);
CREATE INDEX idx_event_participation_user ON event_participation(user_id);
CREATE INDEX idx_event_participation_rank ON event_participation(current_rank) WHERE current_rank IS NOT NULL;
CREATE INDEX idx_event_participation_active ON event_participation(is_active) WHERE is_active = TRUE;

-- Challenge progress
CREATE INDEX idx_challenge_progress_challenge ON challenge_progress(challenge_id);
CREATE INDEX idx_challenge_progress_user ON challenge_progress(user_id);
CREATE INDEX idx_challenge_progress_status ON challenge_progress(status);
CREATE INDEX idx_challenge_progress_completed ON challenge_progress(completed_at) WHERE completed_at IS NOT NULL;

-- Seasonal data
CREATE INDEX idx_seasonal_modifiers_season_year ON seasonal_modifiers(season, year);
CREATE INDEX idx_seasonal_modifiers_active ON seasonal_modifiers(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_seasonal_modifiers_dates ON seasonal_modifiers(start_date, end_date);
CREATE INDEX idx_user_seasonal_stats_user ON user_seasonal_stats(user_id);
CREATE INDEX idx_user_seasonal_stats_season ON user_seasonal_stats(season, year);

-- Event rewards and leaderboards
CREATE INDEX idx_event_reward_catalog_type ON event_reward_catalog(reward_type);
CREATE INDEX idx_event_reward_catalog_category ON event_reward_catalog(category);
CREATE INDEX idx_event_reward_catalog_active ON event_reward_catalog(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_event_leaderboards_event ON event_leaderboards(event_id);
CREATE INDEX idx_event_leaderboards_type ON event_leaderboards(leaderboard_type);
CREATE INDEX idx_event_leaderboards_public ON event_leaderboards(is_public) WHERE is_public = TRUE;

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Update event participation count
CREATE OR REPLACE FUNCTION update_event_participation_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE game_events 
        SET current_participants = current_participants + 1 
        WHERE id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE game_events 
        SET current_participants = current_participants - 1 
        WHERE id = OLD.event_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_participation_count_trigger
    AFTER INSERT OR DELETE ON event_participation
    FOR EACH ROW
    EXECUTE FUNCTION update_event_participation_count();

-- Update challenge completion statistics
CREATE OR REPLACE FUNCTION update_challenge_completion_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Update challenge statistics
        UPDATE event_challenges 
        SET 
            total_completions = total_completions + 1,
            completion_rate = (
                SELECT (COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*))
                FROM challenge_progress 
                WHERE challenge_id = NEW.challenge_id
            ),
            average_completion_time = (
                SELECT AVG(completion_time)
                FROM challenge_progress 
                WHERE challenge_id = NEW.challenge_id AND status = 'completed' AND completion_time IS NOT NULL
            )
        WHERE id = NEW.challenge_id;
        
        -- Update user event participation
        UPDATE event_participation 
        SET 
            challenges_completed = challenges_completed + 1,
            completion_percentage = (
                SELECT (COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*))
                FROM challenge_progress cp
                JOIN event_challenges ec ON cp.challenge_id = ec.id
                WHERE cp.user_id = NEW.user_id AND ec.event_id = (
                    SELECT event_id FROM event_challenges WHERE id = NEW.challenge_id
                )
            ),
            last_activity_at = NOW()
        WHERE user_id = NEW.user_id 
        AND event_id = (SELECT event_id FROM event_challenges WHERE id = NEW.challenge_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_challenge_completion_stats_trigger
    AFTER UPDATE ON challenge_progress
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_challenge_completion_stats();

-- Automatically activate/deactivate seasonal modifiers
CREATE OR REPLACE FUNCTION manage_seasonal_modifiers()
RETURNS TRIGGER AS $$
BEGIN
    -- Activate seasonal modifier if current time is within its period
    IF NEW.start_date <= NOW() AND NEW.end_date >= NOW() AND NOT NEW.is_active THEN
        NEW.is_active = TRUE;
        
        -- Deactivate other modifiers for the same season/year
        UPDATE seasonal_modifiers 
        SET is_active = FALSE 
        WHERE season = NEW.season 
        AND year = NEW.year 
        AND id != NEW.id;
        
    ELSIF (NEW.start_date > NOW() OR NEW.end_date < NOW()) AND NEW.is_active THEN
        NEW.is_active = FALSE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER manage_seasonal_modifiers_trigger
    BEFORE INSERT OR UPDATE ON seasonal_modifiers
    FOR EACH ROW
    EXECUTE FUNCTION manage_seasonal_modifiers();

-- ============================================================================
-- PERIODIC FUNCTIONS (to be called by scheduler)
-- ============================================================================

-- Function to update event statuses based on current time
CREATE OR REPLACE FUNCTION update_event_statuses()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
BEGIN
    -- Activate upcoming events that should now be active
    UPDATE game_events 
    SET status = 'Active'
    WHERE status = 'Upcoming' 
    AND start_date <= NOW()
    AND end_date > NOW();
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Complete active events that have ended
    UPDATE game_events 
    SET status = 'Completed'
    WHERE status = 'Active' 
    AND end_date <= NOW();
    
    GET DIAGNOSTICS updated_count = updated_count + ROW_COUNT;
    
    -- Update next occurrence for recurring events
    UPDATE game_events 
    SET next_occurrence = CASE 
        WHEN recurrence_pattern = 'Daily' THEN end_date + (recurrence_interval * INTERVAL '1 day')
        WHEN recurrence_pattern = 'Weekly' THEN end_date + (recurrence_interval * INTERVAL '1 week')
        WHEN recurrence_pattern = 'Monthly' THEN end_date + (recurrence_interval * INTERVAL '1 month')
        WHEN recurrence_pattern = 'Yearly' THEN end_date + (recurrence_interval * INTERVAL '1 year')
        ELSE NULL
    END
    WHERE is_recurring = TRUE 
    AND status = 'Completed'
    AND next_occurrence IS NULL;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate seasonal statistics
CREATE OR REPLACE FUNCTION calculate_seasonal_stats(target_season season, target_year INTEGER)
RETURNS INTEGER AS $$
DECLARE
    processed_count INTEGER := 0;
    season_start TIMESTAMP WITH TIME ZONE;
    season_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate season boundaries
    CASE target_season
        WHEN 'Spring' THEN
            season_start := (target_year || '-03-20')::DATE;
            season_end := (target_year || '-06-19')::DATE;
        WHEN 'Summer' THEN
            season_start := (target_year || '-06-20')::DATE;
            season_end := (target_year || '-09-19')::DATE;
        WHEN 'Fall' THEN
            season_start := (target_year || '-09-20')::DATE;
            season_end := (target_year || '-12-19')::DATE;
        WHEN 'Winter' THEN
            season_start := (target_year || '-12-20')::DATE;
            season_end := ((target_year + 1) || '-03-19')::DATE;
    END CASE;
    
    -- Insert or update seasonal stats for all active users
    INSERT INTO user_seasonal_stats (
        user_id, season, year, season_start_date, season_end_date,
        wines_discovered, wines_captured, total_experience_gained
    )
    SELECT 
        u.id,
        target_season,
        target_year,
        season_start,
        season_end,
        -- Calculate stats based on activity within season
        COALESCE((
            SELECT COUNT(DISTINCT species_id)
            FROM wines w
            WHERE w.owner_id = u.id 
            AND w.captured_at BETWEEN season_start AND season_end
        ), 0),
        COALESCE((
            SELECT COUNT(*)
            FROM wines w
            WHERE w.owner_id = u.id 
            AND w.captured_at BETWEEN season_start AND season_end
        ), 0),
        COALESCE((
            SELECT SUM((activity_data->>'experience_gained')::INTEGER)
            FROM user_activity_log ual
            WHERE ual.user_id = u.id
            AND ual.created_at BETWEEN season_start AND season_end
            AND activity_data->>'experience_gained' IS NOT NULL
        ), 0)
    FROM users u
    WHERE u.is_active = TRUE
    ON CONFLICT (user_id, season, year) 
    DO UPDATE SET
        wines_discovered = EXCLUDED.wines_discovered,
        wines_captured = EXCLUDED.wines_captured,
        total_experience_gained = EXCLUDED.total_experience_gained,
        calculated_at = NOW();
    
    GET DIAGNOSTICS processed_count = ROW_COUNT;
    RETURN processed_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CONSTRAINTS AND VALIDATION
-- ============================================================================

-- Event date validation
ALTER TABLE game_events ADD CONSTRAINT game_events_valid_dates
    CHECK (start_date < end_date);

ALTER TABLE game_events ADD CONSTRAINT game_events_recurring_logic
    CHECK (NOT is_recurring OR recurrence_pattern IS NOT NULL);

-- Challenge availability validation
ALTER TABLE event_challenges ADD CONSTRAINT event_challenges_availability_logic
    CHECK (available_from IS NULL OR available_until IS NULL OR available_from < available_until);

-- Seasonal modifier date validation
ALTER TABLE seasonal_modifiers ADD CONSTRAINT seasonal_modifiers_valid_dates
    CHECK (start_date < end_date);

-- Participation constraints
ALTER TABLE event_participation ADD CONSTRAINT event_participation_valid_completion
    CHECK (completion_percentage >= 0 AND completion_percentage <= 100);

-- Challenge progress constraints
ALTER TABLE challenge_progress ADD CONSTRAINT challenge_progress_valid_progress
    CHECK (current_progress >= 0 AND current_progress <= 100);

-- ============================================================================
-- COMMENTS ON TABLES
-- ============================================================================

COMMENT ON TABLE game_events IS 'Global events that provide special gameplay mechanics and rewards';
COMMENT ON TABLE event_challenges IS 'Individual challenges within events with specific objectives';
COMMENT ON TABLE event_participation IS 'Track user participation in events with progress and rankings';
COMMENT ON TABLE challenge_progress IS 'Individual progress tracking for specific event challenges';
COMMENT ON TABLE seasonal_modifiers IS 'Seasonal gameplay modifiers that affect spawns and bonuses';
COMMENT ON TABLE event_reward_catalog IS 'Catalog of all possible event rewards with metadata';
COMMENT ON TABLE user_seasonal_stats IS 'Aggregated user statistics by season for analysis';
COMMENT ON TABLE event_leaderboards IS 'Competitive rankings for events with configurable metrics';

COMMENT ON COLUMN game_events.duration_hours IS 'Computed column: event duration in hours';
COMMENT ON COLUMN game_events.is_active IS 'Computed column: true if event is currently active';
COMMENT ON COLUMN event_challenges.objectives IS 'JSONB array of challenge objectives with targets and metrics';
COMMENT ON COLUMN seasonal_modifiers.rarity_bonuses IS 'JSONB object mapping rarity types to multiplier values';