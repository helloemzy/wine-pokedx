-- ============================================================================
-- Wine Pokédx Database Migration 001: Core Enums and Types
-- ============================================================================

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================================================
-- WINE TYPE SYSTEM (8 strategic wine types)
-- ============================================================================

CREATE TYPE wine_type AS ENUM (
    'Terroir',   -- Region-focused wines with strong sense of place
    'Varietal',  -- Grape-focused single variety expressions
    'Technique', -- Method-focused (Natural, Biodynamic, etc.)
    'Heritage',  -- Traditional/Historic wines with legacy
    'Modern',    -- New World/Innovative techniques
    'Mystical',  -- Rare/Cult wines with legendary status
    'Energy',    -- High alcohol/Bold/Power wines
    'Flow'       -- Light/Fresh/Elegant wines
);

-- ============================================================================
-- WINE RARITY SYSTEM (20+ tiers with spawn rates)
-- ============================================================================

CREATE TYPE wine_rarity AS ENUM (
    -- Common Tier (70% spawn rate)
    'Everyday',         -- C - Daily drinking wines
    'Regional',         -- R - Local specialties
    'Quality',          -- Q - Well-made wines from known producers
    -- Uncommon Tier (20% spawn rate)
    'Estate',           -- E - Single estate productions
    'Vintage',          -- V - Exceptional vintage years
    'Reserve',          -- RS - Producer's special selection
    -- Rare Tier (7% spawn rate)
    'SingleVineyard',   -- SV - Specific plot expressions
    'GrandCru',         -- GC - Official classification wines
    'MasterSelection',  -- MS - Hand-picked by sommeliers
    -- Epic Tier (2.5% spawn rate)
    'CultClassic',      -- CC - Wines with devoted followings
    'AllocationOnly',   -- AO - Limited distribution wines
    'CriticsChoice',    -- CH - 95+ point rated wines
    -- Legendary Tier (0.4% spawn rate)
    'MuseumPiece',      -- MP - Historic/collectible bottles
    'InvestmentGrade',  -- IG - Wines that appreciate in value
    'Unicorn',          -- UN - Extremely rare finds
    -- Mythical Tier (0.09% spawn rate)
    'GhostVintage',     -- GV - Lost/forgotten vintages
    'LostLabel',        -- LL - Unidentified rare wines
    'FoundersReserve',  -- FR - Winery founder's personal stash
    -- Divine Tier (0.01% spawn rate)
    'OnceInLifetime',   -- OIL - Wines that come once per decade
    'PerfectStorm',     -- PS - Wines made under perfect conditions
    'TimeCapsule'       -- TC - Pre-phylloxera or historical wines
);

-- ============================================================================
-- RARITY TIER GROUPINGS
-- ============================================================================

CREATE TYPE rarity_tier AS ENUM (
    'Common',
    'Uncommon', 
    'Rare',
    'Epic',
    'Legendary',
    'Mythical',
    'Divine'
);

-- ============================================================================
-- WINE NATURE SYSTEM (affects stat growth)
-- ============================================================================

CREATE TYPE wine_nature AS ENUM (
    'Bold',      -- +Power, -Elegance
    'Elegant',   -- +Elegance, -Power
    'Complex',   -- +Complexity, -Longevity
    'Aged',      -- +Longevity, -Complexity
    'Rare',      -- +Rarity, -Terroir
    'Pure',      -- +Terroir, -Rarity
    'Balanced'   -- No stat changes
);

-- ============================================================================
-- WINE ABILITIES SYSTEM
-- ============================================================================

CREATE TYPE wine_ability AS ENUM (
    -- Natural Abilities
    'TerroirExpression',  -- Boosts type effectiveness
    'AgingGrace',         -- Improves stats over time
    'FoodHarmony',        -- Enhanced pairing bonuses
    'CellarChampion',     -- Resists storage damage
    'CompetitionStar',    -- Bonus points in contests
    -- Hidden Abilities (Rare)
    'PerfectBalance',     -- Immune to stat debuffs
    'VintageMagic',       -- Randomly boosts stats each season
    'MastersChoice',       -- Always critical hits in tastings
    'TerroirShift',       -- Can change type based on storage
    'TimeCapsule'         -- Stats frozen at peak condition
);

-- ============================================================================
-- EVOLUTION SYSTEM
-- ============================================================================

CREATE TYPE evolution_trigger AS ENUM (
    'Time',        -- Natural aging
    'Experience',  -- XP threshold
    'Quality',     -- Perfect tasting score
    'Competition', -- Win competitions
    'Item',        -- Special evolution items
    'Trade',       -- Trade evolution
    'Pairing',     -- Perfect food pairing
    'Storage',     -- Proper cellar conditions
    'Season'       -- Seasonal requirements
);

CREATE TYPE evolution_item AS ENUM (
    'DecanterStone',    -- Enables aeration evolution
    'OakInfluence',     -- Adds barrel-aging characteristics
    'VintageSeal',      -- Preserves wine at peak condition
    'MastersTouch',     -- Unlocks hidden potential
    'TerroirCrystal'    -- Amplifies origin characteristics
);

-- ============================================================================
-- BREEDING SYSTEM
-- ============================================================================

CREATE TYPE breeding_compatibility AS ENUM (
    'Perfect',
    'Good', 
    'Poor',
    'Impossible'
);

CREATE TYPE facility_level AS ENUM (
    'Basic',
    'Advanced',
    'Master',
    'Legendary'
);

CREATE TYPE license_level AS ENUM (
    'Amateur',
    'Professional',
    'Master'
);

-- ============================================================================
-- USER SYSTEM
-- ============================================================================

CREATE TYPE user_tier AS ENUM (
    'Novice',      -- Levels 1-20
    'Intermediate', -- Levels 21-50
    'Advanced',    -- Levels 51-80
    'Expert',      -- Levels 81-100
    'Master'       -- Levels 101+
);

CREATE TYPE user_role AS ENUM (
    'User',
    'Moderator',
    'Admin',
    'SuperAdmin'
);

-- ============================================================================
-- SOCIAL FEATURES
-- ============================================================================

CREATE TYPE trade_type AS ENUM (
    'Direct',   -- Direct player-to-player
    'Market',   -- Listed on marketplace
    'Auction',  -- Bidding system
    'Mystery'   -- Random trade pool
);

CREATE TYPE trade_status AS ENUM (
    'Pending',
    'Accepted',
    'Rejected',
    'Completed',
    'Cancelled',
    'Expired'
);

CREATE TYPE guild_type AS ENUM (
    'Regional',      -- Region-focused
    'TypeSpecialist', -- Wine type focused
    'Competition',   -- Tournament focused
    'Education',     -- Learning focused
    'Trading',       -- Commerce focused
    'Casual',        -- Social focused
    'Professional'   -- Industry professionals
);

CREATE TYPE guild_role AS ENUM (
    'Leader',
    'Officer',
    'Elder',
    'Member',
    'Recruit'
);

CREATE TYPE guild_visibility AS ENUM (
    'Public',
    'Private',
    'InviteOnly'
);

-- ============================================================================
-- COMPETITION SYSTEM
-- ============================================================================

CREATE TYPE competition_type AS ENUM (
    'BlindTasting',
    'PerfectPairing',
    'TerroirChallenge',
    'VintageQuiz',
    'SpeedTasting',
    'TeamBattle'
);

CREATE TYPE competition_format AS ENUM (
    'SingleElimination',
    'RoundRobin',
    'Swiss',
    'League',
    'Championship'
);

CREATE TYPE competition_scope AS ENUM (
    'Local',
    'Regional', 
    'National',
    'Global',
    'Guild'
);

CREATE TYPE competition_status AS ENUM (
    'Registration',
    'InProgress',
    'Completed',
    'Cancelled'
);

CREATE TYPE battle_status AS ENUM (
    'Scheduled',
    'InProgress',
    'Completed',
    'Forfeit'
);

-- ============================================================================
-- EVENT SYSTEM
-- ============================================================================

CREATE TYPE season AS ENUM (
    'Spring',
    'Summer',
    'Fall',
    'Winter'
);

CREATE TYPE event_type AS ENUM (
    'Seasonal',        -- Recurring seasonal events
    'Limited',         -- One-time limited events
    'Community',       -- Global community challenges
    'Competition',     -- Special tournaments
    'Discovery',       -- New wine region unveiling
    'Anniversary',     -- Game anniversary celebrations
    'Collaboration',   -- Real-world winery partnerships
    'Educational'      -- Learning-focused events
);

CREATE TYPE event_status AS ENUM (
    'Upcoming',
    'Active',
    'Completed',
    'Cancelled'
);

-- ============================================================================
-- WSET INTEGRATION
-- ============================================================================

CREATE TYPE wset_level AS ENUM (
    'Level1',  -- Award in Wines
    'Level2',  -- Intermediate Award in Wines and Spirits
    'Level3',  -- Advanced Certificate in Wines
    'Level4',  -- Diploma in Wines
    'MW'       -- Master of Wine
);

CREATE TYPE tasting_intensity AS ENUM (
    'Pale',
    'Medium',
    'Deep'
);

CREATE TYPE nose_intensity AS ENUM (
    'Light',
    'Medium(-)',
    'Medium',
    'Medium(+)',
    'Pronounced'
);

CREATE TYPE sweetness_level AS ENUM (
    'Bone Dry',
    'Dry',
    'Off-Dry',
    'Medium-Dry',
    'Medium-Sweet',
    'Sweet',
    'Lusciously Sweet'
);

CREATE TYPE acidity_level AS ENUM (
    'Low',
    'Medium(-)',
    'Medium',
    'Medium(+)',
    'High'
);

CREATE TYPE tannin_level AS ENUM (
    'Low',
    'Medium(-)',
    'Medium', 
    'Medium(+)',
    'High'
);

CREATE TYPE alcohol_level AS ENUM (
    'Low',
    'Medium',
    'Medium(+)',
    'High'
);

CREATE TYPE body_level AS ENUM (
    'Light',
    'Medium(-)',
    'Medium',
    'Medium(+)',
    'Full'
);

CREATE TYPE finish_length AS ENUM (
    'Short',
    'Medium(-)',
    'Medium',
    'Medium(+)',
    'Long'
);

CREATE TYPE wine_condition AS ENUM (
    'Clean',
    'Unclean'
);

CREATE TYPE development_level AS ENUM (
    'Youthful',
    'Developing',
    'Fully Developed',
    'Tired'
);

CREATE TYPE quality_level AS ENUM (
    'Faulty',
    'Poor',
    'Acceptable',
    'Good',
    'Very Good',
    'Outstanding'
);

CREATE TYPE readiness_level AS ENUM (
    'Too Young',
    'Ready to Drink',
    'Past its Best'
);

-- ============================================================================
-- COLLECTION SYSTEM
-- ============================================================================

CREATE TYPE badge_category AS ENUM (
    'Regional',
    'Grape',
    'Vintage',
    'Tasting',
    'Collection',
    'Social',
    'Competition',
    'Special',
    'Evolution',
    'Breeding'
);

CREATE TYPE badge_rarity AS ENUM (
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
    'Legendary'
);

CREATE TYPE achievement_type AS ENUM (
    'Counter',
    'Boolean',
    'Threshold',
    'Collection',
    'Streak'
);

CREATE TYPE challenge_type AS ENUM (
    'LivingDex',
    'ShinyHunting',
    'Competitive',
    'Vintage',
    'PerfectStats',
    'Achievement',
    'Seasonal'
);

CREATE TYPE challenge_difficulty AS ENUM (
    'Beginner',
    'Intermediate',
    'Advanced',
    'Expert',
    'Master',
    'Legendary'
);

CREATE TYPE visibility_level AS ENUM (
    'Private',
    'Friends',
    'Guild',
    'Public'
);

-- ============================================================================
-- MARKET SYSTEM
-- ============================================================================

CREATE TYPE price_trend AS ENUM (
    'Rising',
    'Falling',
    'Stable'
);

CREATE TYPE investment_rating AS ENUM (
    'Poor',
    'Fair',
    'Good',
    'Excellent',
    'Outstanding'
);

-- ============================================================================
-- CUSTOM COMPOSITE TYPES
-- ============================================================================

-- Stats structure for Individual Values (IVs)
CREATE TYPE individual_values AS (
    power INTEGER,      -- 0-31
    elegance INTEGER,   -- 0-31
    complexity INTEGER, -- 0-31
    longevity INTEGER,  -- 0-31
    rarity INTEGER,     -- 0-31
    terroir INTEGER     -- 0-31
);

-- Stats structure for Effort Values (EVs)
CREATE TYPE effort_values AS (
    power INTEGER,      -- 0-252
    elegance INTEGER,   -- 0-252
    complexity INTEGER, -- 0-252
    longevity INTEGER,  -- 0-252
    rarity INTEGER,     -- 0-252
    terroir INTEGER     -- 0-252
);

-- Base stats structure
CREATE TYPE base_stats AS (
    power INTEGER,      -- 0-255
    elegance INTEGER,   -- 0-255
    complexity INTEGER, -- 0-255
    longevity INTEGER,  -- 0-255
    rarity INTEGER,     -- 0-255
    terroir INTEGER     -- 0-255
);

-- Type effectiveness entry
CREATE TYPE type_effectiveness AS (
    attacking_type wine_type,
    defending_type wine_type,
    multiplier DECIMAL(3,1) -- 0.0, 0.5, 1.0, or 2.0
);

-- ============================================================================
-- DOMAINS FOR DATA VALIDATION
-- ============================================================================

-- Individual Value constraints (0-31)
CREATE DOMAIN iv_stat AS INTEGER
    CHECK (VALUE >= 0 AND VALUE <= 31);

-- Effort Value constraints (0-252)
CREATE DOMAIN ev_stat AS INTEGER
    CHECK (VALUE >= 0 AND VALUE <= 252);

-- Base stat constraints (0-255)
CREATE DOMAIN base_stat AS INTEGER
    CHECK (VALUE >= 0 AND VALUE <= 255);

-- Level constraints (1-100, with Master tier allowing 101+)
CREATE DOMAIN wine_level AS INTEGER
    CHECK (VALUE >= 1 AND VALUE <= 999);

-- User level constraints (1-999)
CREATE DOMAIN user_level AS INTEGER
    CHECK (VALUE >= 1 AND VALUE <= 999);

-- Percentage constraints (0-100)
CREATE DOMAIN percentage AS DECIMAL(5,2)
    CHECK (VALUE >= 0 AND VALUE <= 100);

-- Wine year constraints (reasonable range)
CREATE DOMAIN wine_year AS INTEGER
    CHECK (VALUE >= 1800 AND VALUE <= EXTRACT(YEAR FROM CURRENT_DATE) + 10);

-- Alcohol by volume constraints (0-20%)
CREATE DOMAIN abv AS DECIMAL(4,2)
    CHECK (VALUE >= 0 AND VALUE <= 20);

-- Price constraints (non-negative)
CREATE DOMAIN price AS DECIMAL(12,2)
    CHECK (VALUE >= 0);

-- Rating constraints (0-100)
CREATE DOMAIN rating AS DECIMAL(4,2)
    CHECK (VALUE >= 0 AND VALUE <= 100);

-- Spawn rate constraints (0-100%)
CREATE DOMAIN spawn_rate AS DECIMAL(5,2)
    CHECK (VALUE >= 0 AND VALUE <= 100);

-- Experience points (non-negative)
CREATE DOMAIN experience_points AS BIGINT
    CHECK (VALUE >= 0);

-- ============================================================================
-- UTILITY FUNCTIONS FOR ENUMS
-- ============================================================================

-- Function to get rarity tier from rarity
CREATE OR REPLACE FUNCTION get_rarity_tier(rarity wine_rarity)
RETURNS rarity_tier AS $$
BEGIN
    CASE rarity
        WHEN 'Everyday', 'Regional', 'Quality' THEN
            RETURN 'Common';
        WHEN 'Estate', 'Vintage', 'Reserve' THEN
            RETURN 'Uncommon';
        WHEN 'SingleVineyard', 'GrandCru', 'MasterSelection' THEN
            RETURN 'Rare';
        WHEN 'CultClassic', 'AllocationOnly', 'CriticsChoice' THEN
            RETURN 'Epic';
        WHEN 'MuseumPiece', 'InvestmentGrade', 'Unicorn' THEN
            RETURN 'Legendary';
        WHEN 'GhostVintage', 'LostLabel', 'FoundersReserve' THEN
            RETURN 'Mythical';
        WHEN 'OnceInLifetime', 'PerfectStorm', 'TimeCapsule' THEN
            RETURN 'Divine';
        ELSE
            RETURN 'Common';
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get spawn rate by rarity
CREATE OR REPLACE FUNCTION get_spawn_rate(rarity wine_rarity)
RETURNS spawn_rate AS $$
BEGIN
    CASE get_rarity_tier(rarity)
        WHEN 'Common' THEN RETURN 70.0;
        WHEN 'Uncommon' THEN RETURN 20.0;
        WHEN 'Rare' THEN RETURN 7.0;
        WHEN 'Epic' THEN RETURN 2.5;
        WHEN 'Legendary' THEN RETURN 0.4;
        WHEN 'Mythical' THEN RETURN 0.09;
        WHEN 'Divine' THEN RETURN 0.01;
        ELSE RETURN 0.0;
    END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate total EVs don't exceed 510
CREATE OR REPLACE FUNCTION validate_ev_total(evs effort_values)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN ((evs).power + (evs).elegance + (evs).complexity + 
            (evs).longevity + (evs).rarity + (evs).terroir) <= 510;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- COMMENTS ON TYPES
-- ============================================================================

COMMENT ON TYPE wine_type IS 'The 8 strategic wine types that create gameplay depth';
COMMENT ON TYPE wine_rarity IS '20+ rarity tiers from common to divine with specific spawn rates';
COMMENT ON TYPE wine_nature IS 'Wine natures that affect stat growth similar to Pokemon';
COMMENT ON TYPE wine_ability IS 'Special abilities that wines can have for unique effects';
COMMENT ON TYPE individual_values IS 'IV stats (0-31) that make each wine unique';
COMMENT ON TYPE effort_values IS 'EV stats (0-252 each, 510 total) gained through activities';
COMMENT ON TYPE base_stats IS 'Base stats (0-255) that vary by wine type';