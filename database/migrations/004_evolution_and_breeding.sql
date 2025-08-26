-- ============================================================================
-- Wine Pokédx Database Migration 004: Evolution and Breeding System
-- ============================================================================

-- ============================================================================
-- EVOLUTION CHAINS - Define evolution relationships between wine species
-- ============================================================================

CREATE TABLE evolution_chains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Chain identification
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Chain properties
    chain_length INTEGER NOT NULL DEFAULT 1 CHECK (chain_length >= 1),
    has_branching BOOLEAN DEFAULT FALSE,
    
    -- Discovery and availability
    is_discovered BOOLEAN DEFAULT TRUE,
    discovery_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- EVOLUTIONS - Individual evolution steps within chains
-- ============================================================================

CREATE TABLE evolutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evolution_chain_id UUID NOT NULL REFERENCES evolution_chains(id) ON DELETE CASCADE,
    
    -- Evolution relationship
    from_species_id UUID NOT NULL REFERENCES wine_species(id) ON DELETE CASCADE,
    to_species_id UUID NOT NULL REFERENCES wine_species(id) ON DELETE CASCADE,
    
    -- Evolution requirements
    trigger_type evolution_trigger NOT NULL,
    level_requirement wine_level,
    experience_requirement experience_points,
    
    -- Item requirements
    required_item evolution_item,
    item_consumed BOOLEAN DEFAULT TRUE, -- Whether item is consumed on evolution
    
    -- Stat requirements
    minimum_stats JSONB, -- {power: 100, elegance: 50, ...}
    
    -- Context requirements
    time_of_day VARCHAR(20), -- 'morning', 'day', 'evening', 'night'
    season_requirement season,
    location_requirement VARCHAR(200),
    weather_requirement VARCHAR(50),
    
    -- Training requirements
    minimum_friendship INTEGER DEFAULT 0 CHECK (minimum_friendship >= 0 AND minimum_friendship <= 255),
    move_requirement VARCHAR(100), -- Specific ability or skill required
    
    -- Social requirements
    trade_required BOOLEAN DEFAULT FALSE,
    trading_partner_species UUID REFERENCES wine_species(id),
    guild_membership_required BOOLEAN DEFAULT FALSE,
    
    -- Competition requirements
    competition_wins_required INTEGER DEFAULT 0,
    specific_competition_type competition_type,
    
    -- Special conditions
    special_conditions JSONB, -- Flexible conditions storage
    
    -- Evolution effects
    stat_changes base_stats, -- Stat modifications during evolution
    type_change_primary wine_type,
    type_change_secondary wine_type,
    preserve_shiny BOOLEAN DEFAULT TRUE,
    preserve_nature BOOLEAN DEFAULT TRUE,
    
    -- New abilities gained
    new_abilities wine_ability[] DEFAULT '{}',
    lost_abilities wine_ability[] DEFAULT '{}',
    
    -- Success rate
    evolution_success_rate DECIMAL(5,2) DEFAULT 100.00 CHECK (evolution_success_rate >= 0 AND evolution_success_rate <= 100),
    
    -- Position in chain
    evolution_stage INTEGER NOT NULL DEFAULT 1,
    branch_identifier VARCHAR(50), -- For branching evolutions
    
    -- Constraints
    UNIQUE(from_species_id, to_species_id),
    CHECK(from_species_id != to_species_id)
);

-- ============================================================================
-- BREEDING COMPATIBILITY - Define which wine species can breed together
-- ============================================================================

CREATE TABLE breeding_compatibility (
    species_1_id UUID NOT NULL REFERENCES wine_species(id) ON DELETE CASCADE,
    species_2_id UUID NOT NULL REFERENCES wine_species(id) ON DELETE CASCADE,
    
    -- Compatibility rating
    compatibility breeding_compatibility NOT NULL,
    
    -- Breeding requirements
    minimum_level wine_level DEFAULT 30,
    facility_requirement facility_level DEFAULT 'Basic',
    license_requirement license_level DEFAULT 'Amateur',
    
    -- Success rates
    breeding_success_rate DECIMAL(5,2) DEFAULT 50.00,
    shiny_odds_multiplier DECIMAL(6,4) DEFAULT 1.0000,
    
    -- Special conditions
    seasonal_restrictions season[],
    special_requirements JSONB,
    
    -- Results
    possible_offspring UUID[] NOT NULL, -- Array of possible species IDs
    rare_offspring UUID[], -- Rare variants with lower probability
    
    -- Experience and cost
    experience_cost experience_points DEFAULT 1000,
    item_cost JSONB, -- Required items and quantities
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (species_1_id, species_2_id),
    CHECK (species_1_id <= species_2_id) -- Ensure consistent ordering
);

-- ============================================================================
-- BREEDING ATTEMPTS - Track breeding attempts and outcomes
-- ============================================================================

CREATE TABLE breeding_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parent wines
    parent_1_id UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
    parent_2_id UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
    
    -- Breeding details
    breeder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    compatibility_rating breeding_compatibility NOT NULL,
    facility_used facility_level NOT NULL,
    
    -- Attempt timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    incubation_time INTERVAL, -- Time needed to complete
    
    -- Requirements and costs
    requirements_met JSONB NOT NULL, -- Record of requirements satisfied
    items_consumed JSONB, -- Items used in breeding
    experience_spent experience_points NOT NULL,
    
    -- Results
    attempt_successful BOOLEAN,
    offspring_wine_id UUID REFERENCES wines(id) ON DELETE SET NULL,
    failure_reason TEXT,
    
    -- Special outcomes
    was_shiny_result BOOLEAN DEFAULT FALSE,
    was_mutation BOOLEAN DEFAULT FALSE,
    mutation_details JSONB,
    
    -- Experience and rewards
    experience_gained experience_points DEFAULT 0,
    bonus_experience experience_points DEFAULT 0,
    items_received JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'cancelled'))
);

-- ============================================================================
-- EVOLUTION ATTEMPTS - Track evolution attempts and outcomes
-- ============================================================================

CREATE TABLE evolution_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Wine being evolved
    wine_id UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
    evolution_id UUID NOT NULL REFERENCES evolutions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Attempt details
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Requirements verification
    requirements_check JSONB NOT NULL, -- Record of all requirements and their status
    items_consumed evolution_item[],
    
    -- Context at time of attempt
    wine_level wine_level NOT NULL,
    wine_experience experience_points NOT NULL,
    wine_stats JSONB NOT NULL, -- Snapshot of calculated stats
    friendship_level INTEGER,
    
    -- Environmental context
    attempt_location VARCHAR(200),
    attempt_season season,
    attempt_time_of_day VARCHAR(20),
    weather_conditions VARCHAR(50),
    
    -- Results
    attempt_successful BOOLEAN,
    evolved_wine_id UUID REFERENCES wines(id) ON DELETE SET NULL,
    failure_reason TEXT,
    
    -- Special outcomes
    critical_success BOOLEAN DEFAULT FALSE, -- Perfect evolution with bonuses
    retained_special_traits BOOLEAN DEFAULT FALSE,
    stat_bonus_applied base_stats,
    
    -- Experience and rewards
    experience_gained experience_points DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'failed'))
);

-- ============================================================================
-- BREEDING FACILITIES - Where breeding takes place
-- ============================================================================

CREATE TABLE breeding_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Facility information
    name VARCHAR(200) NOT NULL,
    location VARCHAR(200) NOT NULL,
    facility_level facility_level NOT NULL,
    
    -- Owner and access
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT FALSE,
    access_cost price DEFAULT 0,
    
    -- Facility capabilities
    max_concurrent_breedings INTEGER DEFAULT 1,
    success_rate_bonus DECIMAL(5,2) DEFAULT 0.00,
    shiny_odds_bonus DECIMAL(6,4) DEFAULT 0.0000,
    
    -- Special features
    supported_breeding_types breeding_compatibility[] DEFAULT ARRAY['Perfect', 'Good', 'Poor']::breeding_compatibility[],
    climate_control BOOLEAN DEFAULT FALSE,
    professional_supervision BOOLEAN DEFAULT FALSE,
    
    -- Equipment and amenities
    equipment_list TEXT[] DEFAULT '{}',
    amenities JSONB,
    
    -- Operational details
    operating_hours JSONB, -- {open: "08:00", close: "18:00", days: [1,2,3,4,5]}
    booking_required BOOLEAN DEFAULT TRUE,
    advance_booking_days INTEGER DEFAULT 7,
    
    -- Quality and reputation
    facility_rating DECIMAL(3,2) DEFAULT 0.00,
    total_successful_breedings INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    temporary_closure_reason TEXT,
    
    -- Timestamps
    established_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MEGA EVOLUTION DATA - Temporary powerful forms
-- ============================================================================

CREATE TABLE mega_evolution_data (
    species_id UUID PRIMARY KEY REFERENCES wine_species(id) ON DELETE CASCADE,
    
    -- Mega form details
    mega_name VARCHAR(200) NOT NULL,
    mega_stone evolution_item NOT NULL,
    
    -- Stat changes during mega evolution
    stat_boosts base_stats NOT NULL,
    type_override_primary wine_type,
    type_override_secondary wine_type,
    
    -- New abilities
    mega_ability wine_ability,
    additional_abilities wine_ability[] DEFAULT '{}',
    
    -- Duration and triggers
    duration_type VARCHAR(20) DEFAULT 'battle' CHECK (duration_type IN ('battle', 'event', 'tasting', 'competition', 'temporary', 'permanent')),
    duration_minutes INTEGER,
    
    -- Trigger conditions
    trigger_conditions JSONB NOT NULL, -- Specific conditions for mega evolution
    
    -- Visual changes
    appearance_changes TEXT[] DEFAULT '{}',
    special_effects TEXT[] DEFAULT '{}',
    
    -- Restrictions
    cooldown_hours INTEGER DEFAULT 24,
    usage_limit_per_day INTEGER DEFAULT 1,
    requires_bonding_level INTEGER DEFAULT 200 CHECK (requires_bonding_level >= 0 AND requires_bonding_level <= 255),
    
    -- Discovery
    is_discovered BOOLEAN DEFAULT FALSE,
    discovery_requirements JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- EVOLUTION ITEMS - Items that trigger special evolutions
-- ============================================================================

CREATE TABLE evolution_items_catalog (
    item_id evolution_item PRIMARY KEY,
    
    -- Item details
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    
    -- Item properties
    rarity badge_rarity DEFAULT 'Bronze',
    is_consumable BOOLEAN DEFAULT TRUE,
    
    -- Acquisition
    acquisition_methods TEXT[] NOT NULL, -- How to obtain this item
    base_acquisition_chance DECIMAL(6,4) DEFAULT 0.0100,
    
    -- Market data
    typical_market_value price,
    is_tradeable BOOLEAN DEFAULT TRUE,
    
    -- Effects
    evolution_effects JSONB, -- What evolutions this enables
    stat_bonuses base_stats,
    
    -- Visual
    icon_url VARCHAR(500),
    sprite_url VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER EVOLUTION ITEMS - Items owned by users
-- ============================================================================

CREATE TABLE user_evolution_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id evolution_item NOT NULL REFERENCES evolution_items_catalog(item_id) ON DELETE CASCADE,
    
    -- Quantity and condition
    quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
    
    -- Acquisition details
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acquisition_method VARCHAR(50), -- 'found', 'purchased', 'traded', 'event', 'competition'
    acquisition_context JSONB,
    
    -- Item condition
    condition_rating rating DEFAULT 100.00,
    uses_remaining INTEGER, -- For non-consumable items with limited uses
    
    -- Source tracking
    source_wine_id UUID REFERENCES wines(id) ON DELETE SET NULL,
    source_trade_id UUID, -- Reference to trade if applicable
    source_event_id UUID, -- Reference to event if applicable
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Evolution chains
CREATE INDEX idx_evolution_chains_name ON evolution_chains(name);
CREATE INDEX idx_evolution_chains_length ON evolution_chains(chain_length);

-- Evolutions
CREATE INDEX idx_evolutions_chain ON evolutions(evolution_chain_id);
CREATE INDEX idx_evolutions_from_species ON evolutions(from_species_id);
CREATE INDEX idx_evolutions_to_species ON evolutions(to_species_id);
CREATE INDEX idx_evolutions_trigger ON evolutions(trigger_type);
CREATE INDEX idx_evolutions_level_req ON evolutions(level_requirement) WHERE level_requirement IS NOT NULL;
CREATE INDEX idx_evolutions_item_req ON evolutions(required_item) WHERE required_item IS NOT NULL;
CREATE INDEX idx_evolutions_stage ON evolutions(evolution_stage);

-- Breeding compatibility
CREATE INDEX idx_breeding_compatibility_species1 ON breeding_compatibility(species_1_id);
CREATE INDEX idx_breeding_compatibility_species2 ON breeding_compatibility(species_2_id);
CREATE INDEX idx_breeding_compatibility_rating ON breeding_compatibility(compatibility);

-- Breeding attempts
CREATE INDEX idx_breeding_attempts_breeder ON breeding_attempts(breeder_id);
CREATE INDEX idx_breeding_attempts_parent1 ON breeding_attempts(parent_1_id);
CREATE INDEX idx_breeding_attempts_parent2 ON breeding_attempts(parent_2_id);
CREATE INDEX idx_breeding_attempts_status ON breeding_attempts(status);
CREATE INDEX idx_breeding_attempts_started ON breeding_attempts(started_at);
CREATE INDEX idx_breeding_attempts_successful ON breeding_attempts(attempt_successful) WHERE attempt_successful = TRUE;

-- Evolution attempts
CREATE INDEX idx_evolution_attempts_wine ON evolution_attempts(wine_id);
CREATE INDEX idx_evolution_attempts_user ON evolution_attempts(user_id);
CREATE INDEX idx_evolution_attempts_evolution ON evolution_attempts(evolution_id);
CREATE INDEX idx_evolution_attempts_successful ON evolution_attempts(attempt_successful) WHERE attempt_successful = TRUE;
CREATE INDEX idx_evolution_attempts_attempted_at ON evolution_attempts(attempted_at);

-- Breeding facilities
CREATE INDEX idx_breeding_facilities_owner ON breeding_facilities(owner_id);
CREATE INDEX idx_breeding_facilities_level ON breeding_facilities(facility_level);
CREATE INDEX idx_breeding_facilities_location ON breeding_facilities(location);
CREATE INDEX idx_breeding_facilities_public ON breeding_facilities(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_breeding_facilities_active ON breeding_facilities(is_active) WHERE is_active = TRUE;

-- Mega evolution
CREATE INDEX idx_mega_evolution_stone ON mega_evolution_data(mega_stone);
CREATE INDEX idx_mega_evolution_discovered ON mega_evolution_data(is_discovered);

-- User items
CREATE INDEX idx_user_evolution_items_user ON user_evolution_items(user_id);
CREATE INDEX idx_user_evolution_items_item ON user_evolution_items(item_id);
CREATE INDEX idx_user_evolution_items_quantity ON user_evolution_items(quantity) WHERE quantity > 0;

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Update breeding facility rating based on successful attempts
CREATE OR REPLACE FUNCTION update_facility_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.attempt_successful = TRUE THEN
        UPDATE breeding_facilities 
        SET 
            total_successful_breedings = total_successful_breedings + 1,
            facility_rating = (
                SELECT AVG(CASE WHEN ba.attempt_successful THEN 5.0 ELSE 1.0 END)
                FROM breeding_attempts ba
                JOIN wines w1 ON ba.parent_1_id = w1.id
                WHERE w1.owner_id IN (
                    SELECT DISTINCT owner_id FROM wines 
                    WHERE storage_location = (SELECT location FROM breeding_facilities WHERE id = NEW.facility_id)
                )
            )
        WHERE location = NEW.breeding_location;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant evolution experience to users
CREATE OR REPLACE FUNCTION grant_evolution_experience()
RETURNS TRIGGER AS $$
DECLARE
    experience_to_grant experience_points;
    wine_owner UUID;
BEGIN
    IF NEW.attempt_successful = TRUE THEN
        -- Calculate experience based on evolution complexity
        SELECT 
            CASE 
                WHEN level_requirement > 50 THEN 2000
                WHEN level_requirement > 30 THEN 1500
                WHEN required_item IS NOT NULL THEN 1200
                ELSE 1000
            END,
            w.owner_id
        INTO experience_to_grant, wine_owner
        FROM evolutions e
        JOIN wines w ON NEW.wine_id = w.id
        WHERE e.id = NEW.evolution_id;
        
        -- Grant experience to user
        UPDATE users 
        SET 
            experience_breeding = experience_breeding + experience_to_grant,
            total_experience = total_experience + experience_to_grant
        WHERE id = wine_owner;
        
        -- Update the attempt record
        NEW.experience_gained = experience_to_grant;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER evolution_attempts_grant_experience
    BEFORE INSERT ON evolution_attempts
    FOR EACH ROW
    EXECUTE FUNCTION grant_evolution_experience();

-- Validate evolution requirements
CREATE OR REPLACE FUNCTION validate_evolution_requirements()
RETURNS TRIGGER AS $$
DECLARE
    wine_record wines%ROWTYPE;
    evolution_record evolutions%ROWTYPE;
    requirements_met BOOLEAN := TRUE;
    requirement_details JSONB := '{}'::JSONB;
BEGIN
    -- Get wine and evolution details
    SELECT * INTO wine_record FROM wines WHERE id = NEW.wine_id;
    SELECT * INTO evolution_record FROM evolutions WHERE id = NEW.evolution_id;
    
    -- Check level requirement
    IF evolution_record.level_requirement IS NOT NULL THEN
        requirement_details = requirement_details || jsonb_build_object(
            'level_required', evolution_record.level_requirement,
            'level_current', wine_record.level,
            'level_met', wine_record.level >= evolution_record.level_requirement
        );
        IF wine_record.level < evolution_record.level_requirement THEN
            requirements_met := FALSE;
        END IF;
    END IF;
    
    -- Check experience requirement
    IF evolution_record.experience_requirement IS NOT NULL THEN
        requirement_details = requirement_details || jsonb_build_object(
            'experience_required', evolution_record.experience_requirement,
            'experience_current', wine_record.experience,
            'experience_met', wine_record.experience >= evolution_record.experience_requirement
        );
        IF wine_record.experience < evolution_record.experience_requirement THEN
            requirements_met := FALSE;
        END IF;
    END IF;
    
    -- Check item requirement (simplified - assumes user has item)
    IF evolution_record.required_item IS NOT NULL THEN
        requirement_details = requirement_details || jsonb_build_object(
            'item_required', evolution_record.required_item,
            'item_available', TRUE -- Simplified check
        );
    END IF;
    
    -- Store requirements check
    NEW.requirements_check = requirement_details;
    NEW.attempt_successful = requirements_met;
    
    IF NOT requirements_met THEN
        NEW.failure_reason = 'Evolution requirements not met';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER evolution_attempts_validate_requirements
    BEFORE INSERT ON evolution_attempts
    FOR EACH ROW
    EXECUTE FUNCTION validate_evolution_requirements();

-- ============================================================================
-- CONSTRAINTS AND VALIDATION
-- ============================================================================

-- Evolution chain constraints
ALTER TABLE evolution_chains ADD CONSTRAINT evolution_chains_length_positive
    CHECK (chain_length > 0);

-- Evolution constraints  
ALTER TABLE evolutions ADD CONSTRAINT evolutions_valid_requirements
    CHECK (
        (trigger_type = 'Time' AND level_requirement IS NULL AND experience_requirement IS NULL) OR
        (trigger_type = 'Experience' AND experience_requirement IS NOT NULL) OR
        (trigger_type = 'Quality' AND level_requirement IS NOT NULL) OR
        (trigger_type = 'Item' AND required_item IS NOT NULL) OR
        trigger_type IN ('Competition', 'Trade', 'Pairing', 'Storage', 'Season')
    );

-- Breeding attempt constraints
ALTER TABLE breeding_attempts ADD CONSTRAINT breeding_attempts_different_parents
    CHECK (parent_1_id != parent_2_id);

-- Facility constraints
ALTER TABLE breeding_facilities ADD CONSTRAINT breeding_facilities_positive_capacity
    CHECK (max_concurrent_breedings > 0);

ALTER TABLE breeding_facilities ADD CONSTRAINT breeding_facilities_valid_bonuses
    CHECK (success_rate_bonus >= 0 AND shiny_odds_bonus >= 0);

-- User items constraints
ALTER TABLE user_evolution_items ADD CONSTRAINT user_evolution_items_non_negative_quantity
    CHECK (quantity >= 0);

-- ============================================================================
-- SEED DATA FOR EVOLUTION ITEMS
-- ============================================================================

INSERT INTO evolution_items_catalog (item_id, name, description, rarity, acquisition_methods) VALUES
('DecanterStone', 'Decanter Stone', 'A crystalline stone that enhances aeration, enabling certain wines to reach their evolved form through improved oxygenation.', 'Silver', ARRAY['competition_reward', 'rare_find', 'trade']),
('OakInfluence', 'Oak Influence', 'Ancient oak essence that can imbue wines with barrel-aging characteristics, triggering evolutions that require wood contact.', 'Gold', ARRAY['guild_achievement', 'master_tasting', 'trade']),
('VintageSeal', 'Vintage Seal', 'A mystical seal that preserves wines at their peak condition, allowing them to evolve while maintaining perfect integrity.', 'Platinum', ARRAY['legendary_event', 'perfect_collection', 'ultra_rare_find']),
('MastersTouch', 'Master''s Touch', 'The concentrated essence of master sommelier expertise, unlocking hidden potential in exceptional wines.', 'Diamond', ARRAY['master_certification', 'grand_competition', 'legendary_achievement']),
('TerroirCrystal', 'Terroir Crystal', 'A rare crystal that amplifies the expression of a wine''s origin, enabling terroir-based evolutions.', 'Legendary', ARRAY['regional_mastery', 'mythical_discovery', 'once_in_lifetime_event']);

-- ============================================================================
-- COMMENTS ON TABLES
-- ============================================================================

COMMENT ON TABLE evolution_chains IS 'Define complete evolution families and their relationships';
COMMENT ON TABLE evolutions IS 'Individual evolution steps with detailed requirements and outcomes';
COMMENT ON TABLE breeding_compatibility IS 'Matrix of which wine species can breed together and requirements';
COMMENT ON TABLE breeding_attempts IS 'Track all breeding attempts with outcomes and rewards';
COMMENT ON TABLE evolution_attempts IS 'Track all evolution attempts with requirement validation';
COMMENT ON TABLE breeding_facilities IS 'Physical or virtual locations where breeding takes place';
COMMENT ON TABLE mega_evolution_data IS 'Temporary powerful forms available to certain wine species';
COMMENT ON TABLE evolution_items_catalog IS 'Master catalog of items that can trigger evolutions';
COMMENT ON TABLE user_evolution_items IS 'Evolution items owned by individual users';

COMMENT ON COLUMN evolutions.stat_changes IS 'Base stat modifications applied during evolution';
COMMENT ON COLUMN breeding_attempts.requirements_met IS 'JSONB record of all breeding requirements and their satisfaction status';
COMMENT ON COLUMN evolution_attempts.requirements_check IS 'JSONB record of evolution requirements validation';
COMMENT ON COLUMN mega_evolution_data.stat_boosts IS 'Temporary stat increases during mega evolution';