-- ============================================================================
-- Wine Pokédx Database Migration 005: Social Features
-- ============================================================================

-- ============================================================================
-- WINE TRADES - Comprehensive trading system
-- ============================================================================

CREATE TABLE wine_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Trade participants
    initiator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for mystery trades
    
    -- Trade type and status
    trade_type trade_type NOT NULL,
    status trade_status DEFAULT 'Pending',
    
    -- Trade details
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Offered wines
    offered_wines UUID[] NOT NULL, -- Array of wine IDs
    
    -- Requested wines (for direct trades)
    requested_wines UUID[], -- Array of wine IDs or species IDs
    requested_criteria JSONB, -- Flexible criteria: {type: 'Terroir', rarity: 'Rare', min_level: 50}
    
    -- Market/Auction specific fields
    market_price price, -- Fixed price for market trades
    buyout_price price, -- Instant buy price for auctions
    minimum_bid price, -- Starting bid for auctions
    current_highest_bid price,
    current_highest_bidder_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Requirements and restrictions
    level_requirement user_level DEFAULT 1,
    trust_rating_requirement DECIMAL(3,2) DEFAULT 0.00,
    region_restrictions TEXT[],
    guild_member_only BOOLEAN DEFAULT FALSE,
    guild_restriction UUID, -- Specific guild ID if restricted
    
    -- Financial aspects
    trading_fee price DEFAULT 0,
    insurance_enabled BOOLEAN DEFAULT FALSE,
    insurance_cost price DEFAULT 0,
    insurance_coverage price DEFAULT 0,
    
    -- Evolution triggers
    triggers_evolution BOOLEAN DEFAULT FALSE,
    evolution_wine_id UUID, -- Which wine evolves
    evolution_target_species UUID REFERENCES wine_species(id),
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Completion details
    completion_notes TEXT,
    
    -- Ratings and feedback
    initiator_rating INTEGER CHECK (initiator_rating >= 1 AND initiator_rating <= 5),
    participant_rating INTEGER CHECK (participant_rating >= 1 AND participant_rating <= 5),
    initiator_feedback TEXT,
    participant_feedback TEXT,
    
    -- Audit trail
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TRADE BIDS - Bidding system for auction trades
-- ============================================================================

CREATE TABLE trade_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_id UUID NOT NULL REFERENCES wine_trades(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Bid details
    bid_amount price NOT NULL,
    is_automatic BOOLEAN DEFAULT FALSE, -- Auto-bid system
    max_auto_bid price, -- Maximum for auto-bidding
    
    -- Bid status
    is_active BOOLEAN DEFAULT TRUE,
    is_winning BOOLEAN DEFAULT FALSE,
    
    -- Timing
    placed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MARKET DATA - Historical pricing and market analytics
-- ============================================================================

CREATE TABLE wine_market_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    species_id UUID NOT NULL REFERENCES wine_species(id) ON DELETE CASCADE,
    
    -- Time period
    date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Price data
    average_price price,
    median_price price,
    min_price price,
    max_price price,
    
    -- Volume data
    trades_count INTEGER DEFAULT 0,
    total_volume INTEGER DEFAULT 0, -- Number of wines traded
    
    -- Market indicators
    price_trend price_trend,
    demand_score DECIMAL(5,2) DEFAULT 0.00,
    supply_score DECIMAL(5,2) DEFAULT 0.00,
    
    -- Seasonal adjustments
    seasonal_multiplier DECIMAL(6,4) DEFAULT 1.0000,
    
    -- Investment metrics
    investment_rating investment_rating,
    volatility_index DECIMAL(6,4) DEFAULT 0.0000,
    
    -- Rarity impact
    rarity_premium DECIMAL(6,4) DEFAULT 1.0000,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint per species per day
    UNIQUE(species_id, date_recorded)
);

-- ============================================================================
-- USER REPUTATION - Trust and trading reputation system
-- ============================================================================

CREATE TABLE user_reputation (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Trust metrics
    trust_rating DECIMAL(4,2) DEFAULT 0.00 CHECK (trust_rating >= 0 AND trust_rating <= 100),
    
    -- Trading statistics
    total_trades INTEGER DEFAULT 0,
    successful_trades INTEGER DEFAULT 0,
    failed_trades INTEGER DEFAULT 0,
    cancelled_trades INTEGER DEFAULT 0,
    
    -- Rating statistics
    total_ratings_received INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    five_star_ratings INTEGER DEFAULT 0,
    four_star_ratings INTEGER DEFAULT 0,
    three_star_ratings INTEGER DEFAULT 0,
    two_star_ratings INTEGER DEFAULT 0,
    one_star_ratings INTEGER DEFAULT 0,
    
    -- Reputation badges
    reputation_badges TEXT[] DEFAULT '{}', -- 'TrustedTrader', 'FairDealer', etc.
    
    -- Response metrics
    average_response_time INTERVAL,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Warning and restriction system
    warnings_count INTEGER DEFAULT 0,
    is_restricted BOOLEAN DEFAULT FALSE,
    restriction_reason TEXT,
    restriction_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Notable achievements
    highest_value_trade price DEFAULT 0,
    total_trade_volume price DEFAULT 0,
    trading_since DATE,
    
    -- Timestamps
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TRADE REVIEWS - Detailed feedback system
-- ============================================================================

CREATE TABLE trade_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_id UUID NOT NULL REFERENCES wine_trades(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Review details
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    
    -- Review categories
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    packaging_rating INTEGER CHECK (packaging_rating >= 1 AND packaging_rating <= 5),
    wine_accuracy_rating INTEGER CHECK (wine_accuracy_rating >= 1 AND wine_accuracy_rating <= 5),
    
    -- Review status
    is_visible BOOLEAN DEFAULT TRUE,
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    
    -- Response from reviewed user
    response TEXT,
    response_date TIMESTAMP WITH TIME ZONE,
    
    -- Helpfulness voting
    helpful_votes INTEGER DEFAULT 0,
    unhelpful_votes INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(trade_id, reviewer_id),
    CHECK(reviewer_id != reviewed_user_id)
);

-- ============================================================================
-- GUILDS - Social organizations for wine enthusiasts
-- ============================================================================

CREATE TABLE guilds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic guild information
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    motto VARCHAR(200),
    
    -- Guild type and focus
    guild_type guild_type NOT NULL,
    focus_types wine_type[], -- Wine types the guild specializes in
    focus_regions TEXT[], -- Geographic focus areas
    
    -- Visual identity
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    primary_color VARCHAR(7), -- Hex color code
    secondary_color VARCHAR(7),
    
    -- Guild settings
    visibility guild_visibility DEFAULT 'Public',
    max_members INTEGER DEFAULT 100,
    
    -- Membership requirements
    minimum_level user_level DEFAULT 1,
    minimum_collection_size INTEGER DEFAULT 0,
    required_badges TEXT[],
    application_required BOOLEAN DEFAULT FALSE,
    approval_required BOOLEAN DEFAULT TRUE,
    
    -- Guild features
    has_shared_cellar BOOLEAN DEFAULT FALSE,
    shared_cellar_capacity INTEGER DEFAULT 0,
    allows_lending BOOLEAN DEFAULT FALSE,
    
    -- Financial system
    has_treasury BOOLEAN DEFAULT FALSE,
    monthly_dues price DEFAULT 0,
    current_funds price DEFAULT 0,
    
    -- Activity and engagement
    weekly_events_count INTEGER DEFAULT 0,
    monthly_competitions BOOLEAN DEFAULT FALSE,
    educational_programs BOOLEAN DEFAULT FALSE,
    
    -- Guild statistics
    member_count INTEGER DEFAULT 0,
    active_member_count INTEGER DEFAULT 0,
    total_experience experience_points DEFAULT 0,
    
    -- Competition stats
    tournaments_won INTEGER DEFAULT 0,
    current_season_wins INTEGER DEFAULT 0,
    current_season_losses INTEGER DEFAULT 0,
    guild_ranking INTEGER,
    
    -- Leadership
    founder_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    current_leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_recruiting BOOLEAN DEFAULT TRUE,
    
    -- Special designations
    is_official BOOLEAN DEFAULT FALSE, -- Official wine region guilds
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date DATE,
    
    -- Timestamps
    founded_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- GUILD MEMBERSHIPS - User memberships in guilds
-- ============================================================================

CREATE TABLE guild_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Membership details
    role guild_role DEFAULT 'Member',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    
    -- Contributions
    total_experience_contributed experience_points DEFAULT 0,
    wines_shared INTEGER DEFAULT 0,
    events_organized INTEGER DEFAULT 0,
    competitions_won INTEGER DEFAULT 0,
    
    -- Activity tracking
    last_contribution_date DATE,
    activity_score DECIMAL(5,2) DEFAULT 0.00,
    
    -- Permissions
    can_invite_members BOOLEAN DEFAULT FALSE,
    can_organize_events BOOLEAN DEFAULT FALSE,
    can_access_treasury BOOLEAN DEFAULT FALSE,
    can_manage_cellar BOOLEAN DEFAULT FALSE,
    
    -- Recognition
    member_title VARCHAR(100),
    special_recognitions TEXT[] DEFAULT '{}',
    
    -- Financial
    dues_paid_through DATE,
    total_dues_paid price DEFAULT 0,
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    promoted_at TIMESTAMP WITH TIME ZONE,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(guild_id, user_id)
);

-- ============================================================================
-- GUILD EVENTS - Events organized by guilds
-- ============================================================================

CREATE TABLE guild_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guild_id UUID NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
    
    -- Event details
    name VARCHAR(200) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL, -- 'GroupTasting', 'Competition', 'Educational', etc.
    
    -- Scheduling
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Location
    location_type VARCHAR(20) DEFAULT 'Virtual' CHECK (location_type IN ('Virtual', 'Physical', 'Hybrid')),
    location_details TEXT,
    
    -- Organization
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    co_organizers UUID[] DEFAULT '{}',
    
    -- Participation
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    requires_rsvp BOOLEAN DEFAULT TRUE,
    rsvp_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Requirements
    minimum_level user_level DEFAULT 1,
    required_wines UUID[], -- Specific wines needed
    required_wine_types wine_type[], -- Wine types needed
    entry_fee price DEFAULT 0,
    
    -- Resources and materials
    required_materials TEXT[] DEFAULT '{}',
    provided_materials TEXT[] DEFAULT '{}',
    
    -- Rewards and recognition
    experience_rewards JSONB,
    badge_rewards TEXT[],
    item_rewards TEXT[],
    
    -- Status and results
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
    attendance_count INTEGER DEFAULT 0,
    success_rating DECIMAL(3,2),
    
    -- Competition results (if applicable)
    winner_id UUID REFERENCES users(id),
    results JSONB, -- Flexible results storage
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- GUILD EVENT PARTICIPANTS - Track event participation
-- ============================================================================

CREATE TABLE guild_event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES guild_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Participation details
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'attended', 'no_show', 'cancelled')),
    
    -- RSVP information
    rsvp_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    
    -- Attendance
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_out_at TIMESTAMP WITH TIME ZONE,
    
    -- Performance (for competitions)
    score DECIMAL(8,4),
    rank INTEGER,
    performance_notes TEXT,
    
    -- Contributions
    wines_brought UUID[] DEFAULT '{}',
    materials_contributed TEXT[] DEFAULT '{}',
    
    -- Feedback
    event_rating INTEGER CHECK (event_rating >= 1 AND event_rating <= 5),
    feedback TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_id, user_id)
);

-- ============================================================================
-- COMPETITIONS - Formal competition system
-- ============================================================================

CREATE TABLE competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic information
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Competition structure
    competition_type competition_type NOT NULL,
    format competition_format NOT NULL,
    scope competition_scope NOT NULL,
    
    -- Scheduling
    registration_opens TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_closes TIMESTAMP WITH TIME ZONE NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Organization
    organizer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    organizing_guild_id UUID REFERENCES guilds(id) ON DELETE SET NULL,
    
    -- Entry requirements
    minimum_level user_level DEFAULT 1,
    maximum_level user_level,
    required_wine_types wine_type[],
    entry_fee price DEFAULT 0,
    guild_membership_required BOOLEAN DEFAULT FALSE,
    specific_guild_id UUID REFERENCES guilds(id),
    
    -- Prize pool
    total_prize_pool price DEFAULT 0,
    first_place_prize price,
    second_place_prize price,
    third_place_prize price,
    participation_reward experience_points DEFAULT 0,
    
    -- Competition settings
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    allows_substitutions BOOLEAN DEFAULT FALSE,
    
    -- Rules and format
    rules_text TEXT,
    judging_criteria JSONB,
    scoring_system VARCHAR(50),
    
    -- Status
    status competition_status DEFAULT 'Registration',
    current_round INTEGER DEFAULT 0,
    total_rounds INTEGER DEFAULT 1,
    
    -- Results
    winner_id UUID REFERENCES users(id),
    runner_up_id UUID REFERENCES users(id),
    third_place_id UUID REFERENCES users(id),
    final_results JSONB,
    
    -- Statistics
    total_battles INTEGER DEFAULT 0,
    average_score DECIMAL(8,4),
    
    -- Special features
    is_seasonal BOOLEAN DEFAULT FALSE,
    season season,
    seasonal_bonuses JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- COMPETITION PARTICIPANTS - Track competition participation
-- ============================================================================

CREATE TABLE competition_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Registration details
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    entry_wines UUID[] NOT NULL, -- Wines entered in competition
    
    -- Performance tracking
    current_round INTEGER DEFAULT 1,
    is_eliminated BOOLEAN DEFAULT FALSE,
    elimination_round INTEGER,
    
    -- Scoring
    total_score DECIMAL(10,4) DEFAULT 0,
    average_score DECIMAL(8,4) DEFAULT 0,
    best_performance DECIMAL(8,4) DEFAULT 0,
    
    -- Rankings
    current_rank INTEGER,
    best_rank INTEGER,
    final_rank INTEGER,
    
    -- Battle history
    battles_fought INTEGER DEFAULT 0,
    battles_won INTEGER DEFAULT 0,
    battles_lost INTEGER DEFAULT 0,
    
    -- Rewards earned
    experience_earned experience_points DEFAULT 0,
    prize_money price DEFAULT 0,
    badges_earned TEXT[] DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'eliminated', 'disqualified', 'withdrew')),
    
    UNIQUE(competition_id, user_id)
);

-- ============================================================================
-- BATTLES - Individual competition matches
-- ============================================================================

CREATE TABLE battles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    
    -- Battle participants
    participant_1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Battle configuration
    battle_type competition_type NOT NULL,
    round_number INTEGER NOT NULL,
    match_number INTEGER,
    
    -- Wine lineups
    p1_wines UUID[] NOT NULL,
    p2_wines UUID[] NOT NULL,
    
    -- Battle mechanics
    battle_format VARCHAR(50), -- 'Best of 3', 'Single Round', etc.
    uses_type_effectiveness BOOLEAN DEFAULT TRUE,
    weather_effects VARCHAR(50),
    special_rules JSONB,
    
    -- Timing
    scheduled_start TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    
    -- Results
    winner_id UUID REFERENCES users(id),
    p1_score DECIMAL(8,4) DEFAULT 0,
    p2_score DECIMAL(8,4) DEFAULT 0,
    
    -- Performance metrics
    p1_performance JSONB, -- {accuracy: 85, speed: 92, creativity: 78}
    p2_performance JSONB,
    
    -- Battle log
    battle_log JSONB, -- Detailed battle progression
    judge_notes TEXT,
    
    -- Status
    status battle_status DEFAULT 'Scheduled',
    
    -- Constraints
    CHECK(participant_1_id != participant_2_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Wine trades
CREATE INDEX idx_wine_trades_initiator ON wine_trades(initiator_id);
CREATE INDEX idx_wine_trades_participant ON wine_trades(participant_id);
CREATE INDEX idx_wine_trades_type ON wine_trades(trade_type);
CREATE INDEX idx_wine_trades_status ON wine_trades(status);
CREATE INDEX idx_wine_trades_created ON wine_trades(created_at);
CREATE INDEX idx_wine_trades_expires ON wine_trades(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_wine_trades_market_price ON wine_trades(market_price) WHERE market_price IS NOT NULL;
CREATE INDEX idx_wine_trades_offered_wines ON wine_trades USING GIN(offered_wines);

-- Trade bids
CREATE INDEX idx_trade_bids_trade ON trade_bids(trade_id);
CREATE INDEX idx_trade_bids_bidder ON trade_bids(bidder_id);
CREATE INDEX idx_trade_bids_active ON trade_bids(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_trade_bids_winning ON trade_bids(is_winning) WHERE is_winning = TRUE;
CREATE INDEX idx_trade_bids_placed ON trade_bids(placed_at);

-- Market data
CREATE INDEX idx_wine_market_data_species ON wine_market_data(species_id);
CREATE INDEX idx_wine_market_data_date ON wine_market_data(date_recorded);
CREATE INDEX idx_wine_market_data_price ON wine_market_data(average_price);
CREATE INDEX idx_wine_market_data_trend ON wine_market_data(price_trend);

-- Guild system
CREATE INDEX idx_guilds_name ON guilds(name);
CREATE INDEX idx_guilds_type ON guilds(guild_type);
CREATE INDEX idx_guilds_visibility ON guilds(visibility);
CREATE INDEX idx_guilds_recruiting ON guilds(is_recruiting) WHERE is_recruiting = TRUE;
CREATE INDEX idx_guilds_focus_types ON guilds USING GIN(focus_types);
CREATE INDEX idx_guild_memberships_guild ON guild_memberships(guild_id);
CREATE INDEX idx_guild_memberships_user ON guild_memberships(user_id);
CREATE INDEX idx_guild_memberships_role ON guild_memberships(role);
CREATE INDEX idx_guild_memberships_active ON guild_memberships(status) WHERE status = 'active';

-- Events and competitions
CREATE INDEX idx_guild_events_guild ON guild_events(guild_id);
CREATE INDEX idx_guild_events_organizer ON guild_events(organizer_id);
CREATE INDEX idx_guild_events_start ON guild_events(start_date);
CREATE INDEX idx_guild_events_type ON guild_events(event_type);
CREATE INDEX idx_competitions_type ON competitions(competition_type);
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competitions_start ON competitions(start_date);
CREATE INDEX idx_competition_participants_competition ON competition_participants(competition_id);
CREATE INDEX idx_competition_participants_user ON competition_participants(user_id);
CREATE INDEX idx_battles_competition ON battles(competition_id);
CREATE INDEX idx_battles_participants ON battles(participant_1_id, participant_2_id);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Update guild member count
CREATE OR REPLACE FUNCTION update_guild_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE guilds SET member_count = member_count + 1 WHERE id = NEW.guild_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'active' AND NEW.status = 'active' THEN
        UPDATE guilds SET member_count = member_count + 1 WHERE id = NEW.guild_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status != 'active' THEN
        UPDATE guilds SET member_count = member_count - 1 WHERE id = NEW.guild_id;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
        UPDATE guilds SET member_count = member_count - 1 WHERE id = OLD.guild_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_guild_member_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON guild_memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_guild_member_count();

-- Update user reputation based on trade completion
CREATE OR REPLACE FUNCTION update_trade_reputation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Completed' AND OLD.status != 'Completed' THEN
        -- Update reputation for both parties
        UPDATE user_reputation SET 
            total_trades = total_trades + 1,
            successful_trades = successful_trades + 1
        WHERE user_id IN (NEW.initiator_id, NEW.participant_id);
        
        -- Update ratings if provided
        IF NEW.initiator_rating IS NOT NULL THEN
            UPDATE user_reputation SET 
                total_ratings_received = total_ratings_received + 1,
                average_rating = (
                    (average_rating * (total_ratings_received - 1) + NEW.initiator_rating) / 
                    total_ratings_received
                )
            WHERE user_id = NEW.participant_id;
        END IF;
        
        IF NEW.participant_rating IS NOT NULL THEN
            UPDATE user_reputation SET 
                total_ratings_received = total_ratings_received + 1,
                average_rating = (
                    (average_rating * (total_ratings_received - 1) + NEW.participant_rating) / 
                    total_ratings_received
                )
            WHERE user_id = NEW.initiator_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trade_reputation_trigger
    AFTER UPDATE ON wine_trades
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_trade_reputation();

-- Auto-update highest bid in trades
CREATE OR REPLACE FUNCTION update_trade_highest_bid()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.is_active = TRUE) THEN
        UPDATE wine_trades 
        SET 
            current_highest_bid = NEW.bid_amount,
            current_highest_bidder_id = NEW.bidder_id
        WHERE id = NEW.trade_id AND NEW.bid_amount > COALESCE(current_highest_bid, 0);
        
        -- Mark other bids as not winning
        UPDATE trade_bids 
        SET is_winning = FALSE 
        WHERE trade_id = NEW.trade_id AND id != NEW.id;
        
        -- Mark this bid as winning if it's the highest
        IF NEW.bid_amount >= (SELECT COALESCE(current_highest_bid, 0) FROM wine_trades WHERE id = NEW.trade_id) THEN
            NEW.is_winning = TRUE;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trade_highest_bid_trigger
    BEFORE INSERT OR UPDATE ON trade_bids
    FOR EACH ROW
    EXECUTE FUNCTION update_trade_highest_bid();

-- ============================================================================
-- CONSTRAINTS AND VALIDATION
-- ============================================================================

-- Trade constraints
ALTER TABLE wine_trades ADD CONSTRAINT wine_trades_valid_expiration
    CHECK (expires_at IS NULL OR expires_at > created_at);

ALTER TABLE wine_trades ADD CONSTRAINT wine_trades_market_price_logic
    CHECK ((trade_type = 'Market' AND market_price IS NOT NULL) OR trade_type != 'Market');

ALTER TABLE wine_trades ADD CONSTRAINT wine_trades_auction_price_logic
    CHECK ((trade_type = 'Auction' AND minimum_bid IS NOT NULL) OR trade_type != 'Auction');

-- Guild constraints
ALTER TABLE guilds ADD CONSTRAINT guilds_positive_max_members
    CHECK (max_members > 0);

ALTER TABLE guilds ADD CONSTRAINT guilds_color_format
    CHECK (primary_color IS NULL OR primary_color ~ '^#[0-9A-Fa-f]{6}$');

-- Competition constraints
ALTER TABLE competitions ADD CONSTRAINT competitions_valid_dates
    CHECK (registration_opens < registration_closes AND registration_closes <= start_date AND start_date < end_date);

ALTER TABLE competitions ADD CONSTRAINT competitions_positive_participants
    CHECK (max_participants IS NULL OR max_participants > 0);

-- ============================================================================
-- COMMENTS ON TABLES
-- ============================================================================

COMMENT ON TABLE wine_trades IS 'Comprehensive trading system supporting direct, market, auction, and mystery trades';
COMMENT ON TABLE trade_bids IS 'Bidding system for auction-style trades with auto-bidding support';
COMMENT ON TABLE wine_market_data IS 'Historical market data and pricing analytics for wine species';
COMMENT ON TABLE user_reputation IS 'Trust and reputation system for traders with detailed metrics';
COMMENT ON TABLE trade_reviews IS 'Detailed feedback system for completed trades';
COMMENT ON TABLE guilds IS 'Social organizations for wine enthusiasts with various focuses and features';
COMMENT ON TABLE guild_memberships IS 'User memberships in guilds with roles and contribution tracking';
COMMENT ON TABLE guild_events IS 'Events organized by guilds including tastings, competitions, and education';
COMMENT ON TABLE competitions IS 'Formal competition system with multiple formats and scopes';
COMMENT ON TABLE competition_participants IS 'Participant tracking for competitions with performance metrics';
COMMENT ON TABLE battles IS 'Individual matches within competitions with detailed battle mechanics';

COMMENT ON COLUMN wine_trades.offered_wines IS 'Array of wine UUIDs being offered in the trade';
COMMENT ON COLUMN wine_trades.requested_criteria IS 'JSONB for flexible trade requirements';
COMMENT ON COLUMN guild_memberships.total_experience_contributed IS 'Cumulative experience points contributed to guild';
COMMENT ON COLUMN battles.battle_log IS 'JSONB storing detailed battle progression and moves';