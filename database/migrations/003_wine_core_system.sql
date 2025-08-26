-- ============================================================================
-- Wine Pokédx Database Migration 003: Core Wine System
-- ============================================================================

-- ============================================================================
-- WINE SPECIES - Master wine definitions (like Pokemon species)
-- ============================================================================

CREATE TABLE wine_species (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic identification
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL, -- URL-friendly version
    
    -- Wine classification
    primary_type wine_type NOT NULL,
    secondary_type wine_type,
    
    -- Base stats that define this wine species
    base_stats base_stats NOT NULL,
    
    -- Species characteristics
    generation INTEGER NOT NULL DEFAULT 1,
    rarity_base wine_rarity NOT NULL,
    
    -- Physical characteristics
    grape_varieties TEXT[] NOT NULL, -- Array of grape varieties
    typical_regions TEXT[] NOT NULL, -- Regions where this wine is found
    
    -- Production characteristics
    typical_abv_min abv DEFAULT 0,
    typical_abv_max abv DEFAULT 20,
    typical_vintage_range INT4RANGE, -- Range of vintages available
    
    -- Aging characteristics
    drinking_window_start INTEGER, -- Years from vintage
    drinking_window_end INTEGER,   -- Years from vintage
    
    -- Capture characteristics
    spawn_rate spawn_rate,
    spawn_seasons season[] DEFAULT ARRAY['Spring', 'Summer', 'Fall', 'Winter'],
    
    -- Abilities
    possible_abilities wine_ability[] NOT NULL DEFAULT '{}',
    hidden_abilities wine_ability[] DEFAULT '{}',
    
    -- Evolution data
    can_evolve BOOLEAN DEFAULT FALSE,
    evolution_trigger evolution_trigger,
    evolution_level wine_level,
    
    -- Breeding data
    breeding_group VARCHAR(50),
    breeding_compatibility JSONB, -- Compatibility matrix with other species
    
    -- Mega evolution
    can_mega_evolve BOOLEAN DEFAULT FALSE,
    mega_stone evolution_item,
    
    -- Regional forms
    has_regional_forms BOOLEAN DEFAULT FALSE,
    
    -- Flavor text and descriptions
    description TEXT,
    flavor_text TEXT,
    tasting_notes TEXT,
    
    -- Professional data
    typical_price_range JSONB, -- {min: number, max: number, currency: string}
    investment_rating investment_rating,
    
    -- WSET integration
    wset_level_requirement wset_level,
    educational_notes TEXT,
    
    -- Discovery and availability
    is_discovered BOOLEAN DEFAULT TRUE,
    discovery_date DATE,
    is_legendary BOOLEAN DEFAULT FALSE,
    is_mythical BOOLEAN DEFAULT FALSE,
    
    -- Meta information
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_official BOOLEAN DEFAULT FALSE, -- Official vs user-generated content
    approval_status VARCHAR(20) DEFAULT 'approved',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- WINES - Individual wine instances (like caught Pokemon)
-- ============================================================================

CREATE TABLE wines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    species_id UUID NOT NULL REFERENCES wine_species(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic wine information
    name VARCHAR(200), -- Can override species name
    year wine_year NOT NULL,
    producer VARCHAR(200) NOT NULL,
    region VARCHAR(200) NOT NULL,
    
    -- Individual characteristics (Pokemon-style)
    individual_values individual_values NOT NULL,
    effort_values effort_values NOT NULL DEFAULT ROW(0,0,0,0,0,0),
    nature wine_nature NOT NULL,
    level wine_level DEFAULT 1,
    experience experience_points DEFAULT 0,
    
    -- Special characteristics
    is_shiny BOOLEAN DEFAULT FALSE,
    is_perfect_iv BOOLEAN GENERATED ALWAYS AS (
        ((individual_values).power = 31 AND
         (individual_values).elegance = 31 AND
         (individual_values).complexity = 31 AND
         (individual_values).longevity = 31 AND
         (individual_values).rarity = 31 AND
         (individual_values).terroir = 31)
    ) STORED,
    
    -- Abilities
    ability wine_ability,
    hidden_ability wine_ability,
    is_hidden_ability_active BOOLEAN DEFAULT FALSE,
    
    -- Capture information
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    capture_location VARCHAR(200),
    capture_method VARCHAR(50) DEFAULT 'Purchase',
    capture_season season,
    
    -- Wine-specific data
    abv abv,
    bottle_size INTEGER DEFAULT 750, -- in ml
    closure_type VARCHAR(50) DEFAULT 'Cork',
    
    -- Storage and condition
    storage_location VARCHAR(200),
    storage_temperature DECIMAL(4,1), -- Celsius
    storage_humidity DECIMAL(5,2),   -- Percentage
    condition_rating rating DEFAULT 100.00,
    
    -- Purchase information
    purchase_date DATE,
    purchase_location VARCHAR(200),
    purchase_price price,
    current_value price,
    
    -- Drinking information
    drink_from_date DATE GENERATED ALWAYS AS (
        CASE 
            WHEN year IS NOT NULL AND 
                 (SELECT drinking_window_start FROM wine_species WHERE id = species_id) IS NOT NULL
            THEN (year || '-01-01')::DATE + 
                 (SELECT drinking_window_start FROM wine_species WHERE id = species_id) * INTERVAL '1 year'
            ELSE NULL
        END
    ) STORED,
    drink_until_date DATE GENERATED ALWAYS AS (
        CASE 
            WHEN year IS NOT NULL AND 
                 (SELECT drinking_window_end FROM wine_species WHERE id = species_id) IS NOT NULL
            THEN (year || '-01-01')::DATE + 
                 (SELECT drinking_window_end FROM wine_species WHERE id = species_id) * INTERVAL '1 year'
            ELSE NULL
        END
    ) STORED,
    
    -- Evolution data
    can_evolve BOOLEAN DEFAULT FALSE,
    evolution_happiness INTEGER DEFAULT 0 CHECK (evolution_happiness >= 0 AND evolution_happiness <= 255),
    evolution_requirements JSONB,
    
    -- Breeding data
    is_breeding_eligible BOOLEAN DEFAULT FALSE,
    breeding_generation INTEGER DEFAULT 1,
    parent_wine_1_id UUID REFERENCES wines(id) ON DELETE SET NULL,
    parent_wine_2_id UUID REFERENCES wines(id) ON DELETE SET NULL,
    
    -- Special forms
    is_mega_evolved BOOLEAN DEFAULT FALSE,
    mega_evolution_stone evolution_item,
    regional_form VARCHAR(50),
    
    -- User data and notes
    personal_notes TEXT,
    voice_note_url VARCHAR(500),
    photo_urls TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Rating and reviews
    user_rating rating,
    professional_rating rating,
    rating_source VARCHAR(100),
    
    -- Status flags
    is_favorite BOOLEAN DEFAULT FALSE,
    is_showcase BOOLEAN DEFAULT FALSE, -- For public display
    is_tradeable BOOLEAN DEFAULT TRUE,
    is_consumed BOOLEAN DEFAULT FALSE,
    consumed_date DATE,
    consumed_rating rating,
    consumed_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- WINE TASTING NOTES - WSET-style professional tasting data
-- ============================================================================

CREATE TABLE wine_tasting_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wine_id UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Tasting session information
    tasting_date DATE NOT NULL DEFAULT CURRENT_DATE,
    tasting_location VARCHAR(200),
    tasting_context VARCHAR(100), -- 'Blind', 'Guided', 'Social', etc.
    temperature DECIMAL(4,1), -- Celsius
    decant_time INTEGER, -- Minutes
    
    -- WSET Systematic Approach - Appearance
    appearance_intensity tasting_intensity,
    appearance_color VARCHAR(100),
    appearance_other_observations TEXT,
    
    -- WSET Systematic Approach - Nose
    nose_condition wine_condition DEFAULT 'Clean',
    nose_intensity nose_intensity,
    nose_development_level development_level,
    primary_aromas TEXT[] DEFAULT '{}',
    secondary_aromas TEXT[] DEFAULT '{}',
    tertiary_aromas TEXT[] DEFAULT '{}',
    
    -- WSET Systematic Approach - Palate
    sweetness sweetness_level,
    acidity acidity_level,
    tannin tannin_level, -- For red wines
    alcohol alcohol_level,
    body body_level,
    flavor_intensity nose_intensity, -- Reusing the enum
    flavor_characteristics TEXT[] DEFAULT '{}',
    finish finish_length,
    
    -- WSET Conclusions
    quality quality_level,
    readiness readiness_level,
    suitable_for TEXT, -- Food pairing suggestions
    
    -- Additional notes
    personal_notes TEXT,
    food_pairing_notes TEXT,
    service_suggestions TEXT,
    
    -- Numerical scores
    overall_score rating, -- 0-100 scale
    value_score rating,   -- Price-to-quality ratio
    
    -- Tasting environment
    glassware_type VARCHAR(50),
    lighting_conditions VARCHAR(50),
    other_tasters TEXT[], -- Names of other tasters present
    
    -- Professional context
    is_professional_tasting BOOLEAN DEFAULT FALSE,
    sommelier_level wset_level,
    certification_context VARCHAR(100),
    
    -- Visibility
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- WINE PHOTOS - Image management for wines
-- ============================================================================

CREATE TABLE wine_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wine_id UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Image data
    photo_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    
    -- Image metadata
    filename VARCHAR(255),
    file_size INTEGER, -- bytes
    mime_type VARCHAR(50),
    width INTEGER,
    height INTEGER,
    
    -- Photo context
    photo_type VARCHAR(50) DEFAULT 'bottle', -- 'bottle', 'label', 'cork', 'glass', 'pairing'
    caption TEXT,
    
    -- AI analysis results
    ai_tags TEXT[] DEFAULT '{}',
    ai_confidence DECIMAL(5,4),
    color_analysis JSONB,
    
    -- Visibility
    is_primary BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    taken_at TIMESTAMP WITH TIME ZONE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- WINE VOICE NOTES - Audio recordings for wines
-- ============================================================================

CREATE TABLE wine_voice_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wine_id UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Audio data
    audio_url VARCHAR(500) NOT NULL,
    
    -- Audio metadata
    filename VARCHAR(255),
    duration INTEGER, -- seconds
    file_size INTEGER, -- bytes
    format VARCHAR(20), -- 'mp3', 'wav', etc.
    
    -- Transcription
    transcript TEXT,
    transcript_confidence DECIMAL(5,4),
    language_code VARCHAR(5) DEFAULT 'en',
    
    -- Context
    note_type VARCHAR(50) DEFAULT 'tasting', -- 'tasting', 'memory', 'pairing'
    
    -- Processing status
    is_transcribed BOOLEAN DEFAULT FALSE,
    is_processed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- WINE TYPE EFFECTIVENESS - Pokemon-style type chart
-- ============================================================================

CREATE TABLE wine_type_effectiveness (
    attacking_type wine_type NOT NULL,
    defending_type wine_type NOT NULL,
    effectiveness_multiplier DECIMAL(3,1) NOT NULL DEFAULT 1.0 CHECK (effectiveness_multiplier IN (0.0, 0.5, 1.0, 2.0)),
    
    PRIMARY KEY (attacking_type, defending_type)
);

-- ============================================================================
-- WINE REGIONAL FORMS - Regional variations
-- ============================================================================

CREATE TABLE wine_regional_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_species_id UUID NOT NULL REFERENCES wine_species(id) ON DELETE CASCADE,
    
    -- Regional form details
    region_name VARCHAR(100) NOT NULL,
    form_name VARCHAR(100) NOT NULL,
    
    -- Stat modifications
    stat_modifications base_stats,
    type_override_primary wine_type,
    type_override_secondary wine_type,
    
    -- Unique characteristics
    unique_abilities wine_ability[] DEFAULT '{}',
    visual_differences TEXT[] DEFAULT '{}',
    
    -- Flavor and characteristics
    regional_description TEXT,
    typical_characteristics TEXT[] DEFAULT '{}',
    
    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Wine species indexes
CREATE INDEX idx_wine_species_primary_type ON wine_species(primary_type);
CREATE INDEX idx_wine_species_secondary_type ON wine_species(secondary_type) WHERE secondary_type IS NOT NULL;
CREATE INDEX idx_wine_species_rarity ON wine_species(rarity_base);
CREATE INDEX idx_wine_species_generation ON wine_species(generation);
CREATE INDEX idx_wine_species_can_evolve ON wine_species(can_evolve) WHERE can_evolve = TRUE;
CREATE INDEX idx_wine_species_regions ON wine_species USING GIN(typical_regions);
CREATE INDEX idx_wine_species_grapes ON wine_species USING GIN(grape_varieties);
CREATE INDEX idx_wine_species_slug ON wine_species(slug);
CREATE INDEX idx_wine_species_name_trgm ON wine_species USING gin(name gin_trgm_ops);

-- Wines indexes  
CREATE INDEX idx_wines_owner_id ON wines(owner_id);
CREATE INDEX idx_wines_species_id ON wines(species_id);
CREATE INDEX idx_wines_year ON wines(year);
CREATE INDEX idx_wines_region ON wines(region);
CREATE INDEX idx_wines_producer ON wines(producer);
CREATE INDEX idx_wines_is_shiny ON wines(is_shiny) WHERE is_shiny = TRUE;
CREATE INDEX idx_wines_is_perfect_iv ON wines(is_perfect_iv) WHERE is_perfect_iv = TRUE;
CREATE INDEX idx_wines_is_favorite ON wines(owner_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_wines_is_showcase ON wines(is_showcase) WHERE is_showcase = TRUE;
CREATE INDEX idx_wines_can_evolve ON wines(can_evolve) WHERE can_evolve = TRUE;
CREATE INDEX idx_wines_level ON wines(level);
CREATE INDEX idx_wines_captured_at ON wines(captured_at);
CREATE INDEX idx_wines_tags ON wines USING GIN(tags);
CREATE INDEX idx_wines_producer_trgm ON wines USING gin(producer gin_trgm_ops);

-- Tasting notes indexes
CREATE INDEX idx_wine_tasting_notes_wine_id ON wine_tasting_notes(wine_id);
CREATE INDEX idx_wine_tasting_notes_user_id ON wine_tasting_notes(user_id);
CREATE INDEX idx_wine_tasting_notes_date ON wine_tasting_notes(tasting_date);
CREATE INDEX idx_wine_tasting_notes_quality ON wine_tasting_notes(quality);
CREATE INDEX idx_wine_tasting_notes_score ON wine_tasting_notes(overall_score);
CREATE INDEX idx_wine_tasting_notes_public ON wine_tasting_notes(is_public) WHERE is_public = TRUE;

-- Photos indexes
CREATE INDEX idx_wine_photos_wine_id ON wine_photos(wine_id);
CREATE INDEX idx_wine_photos_primary ON wine_photos(wine_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_wine_photos_type ON wine_photos(photo_type);

-- Voice notes indexes
CREATE INDEX idx_wine_voice_notes_wine_id ON wine_voice_notes(wine_id);
CREATE INDEX idx_wine_voice_notes_processed ON wine_voice_notes(is_processed);

-- Regional forms
CREATE INDEX idx_wine_regional_forms_species ON wine_regional_forms(base_species_id);
CREATE INDEX idx_wine_regional_forms_region ON wine_regional_forms(region_name);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update wine updated_at timestamp
CREATE OR REPLACE FUNCTION update_wine_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wines_update_updated_at
    BEFORE UPDATE ON wines
    FOR EACH ROW
    EXECUTE FUNCTION update_wine_updated_at();

CREATE TRIGGER wine_species_update_updated_at
    BEFORE UPDATE ON wine_species
    FOR EACH ROW
    EXECUTE FUNCTION update_wine_updated_at();

-- Validate EV totals don't exceed 510
CREATE OR REPLACE FUNCTION validate_wine_evs()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT validate_ev_total(NEW.effort_values) THEN
        RAISE EXCEPTION 'Total effort values cannot exceed 510. Current total: %', 
            ((NEW.effort_values).power + (NEW.effort_values).elegance + 
             (NEW.effort_values).complexity + (NEW.effort_values).longevity + 
             (NEW.effort_values).rarity + (NEW.effort_values).terroir);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wines_validate_evs
    BEFORE INSERT OR UPDATE OF effort_values ON wines
    FOR EACH ROW
    EXECUTE FUNCTION validate_wine_evs();

-- Update wine level based on experience
CREATE OR REPLACE FUNCTION update_wine_level()
RETURNS TRIGGER AS $$
DECLARE
    new_level INTEGER;
BEGIN
    -- Calculate level based on experience (100 XP per level)
    new_level = GREATEST(1, (NEW.experience / 100)::INTEGER + 1);
    new_level = LEAST(new_level, 100); -- Cap at level 100
    
    NEW.level = new_level;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wines_update_level
    BEFORE UPDATE OF experience ON wines
    FOR EACH ROW
    WHEN (OLD.experience IS DISTINCT FROM NEW.experience)
    EXECUTE FUNCTION update_wine_level();

-- ============================================================================
-- POPULATE TYPE EFFECTIVENESS CHART
-- ============================================================================

-- Default all interactions to 1.0 (normal effectiveness)
INSERT INTO wine_type_effectiveness (attacking_type, defending_type, effectiveness_multiplier)
SELECT t1.type_value, t2.type_value, 1.0
FROM (
    SELECT unnest(enum_range(null::wine_type)) AS type_value
) t1
CROSS JOIN (
    SELECT unnest(enum_range(null::wine_type)) AS type_value  
) t2;

-- Set up strategic type interactions
-- Terroir advantages
UPDATE wine_type_effectiveness SET effectiveness_multiplier = 2.0 
WHERE attacking_type = 'Terroir' AND defending_type IN ('Modern', 'Energy');

UPDATE wine_type_effectiveness SET effectiveness_multiplier = 0.5
WHERE attacking_type = 'Terroir' AND defending_type IN ('Heritage', 'Mystical');

-- Varietal advantages
UPDATE wine_type_effectiveness SET effectiveness_multiplier = 2.0
WHERE attacking_type = 'Varietal' AND defending_type IN ('Technique', 'Flow');

UPDATE wine_type_effectiveness SET effectiveness_multiplier = 0.5
WHERE attacking_type = 'Varietal' AND defending_type IN ('Modern', 'Mystical');

-- Technique advantages
UPDATE wine_type_effectiveness SET effectiveness_multiplier = 2.0
WHERE attacking_type = 'Technique' AND defending_type IN ('Heritage', 'Energy');

UPDATE wine_type_effectiveness SET effectiveness_multiplier = 0.5
WHERE attacking_type = 'Technique' AND defending_type IN ('Varietal', 'Flow');

-- Heritage advantages
UPDATE wine_type_effectiveness SET effectiveness_multiplier = 2.0
WHERE attacking_type = 'Heritage' AND defending_type IN ('Modern', 'Flow');

UPDATE wine_type_effectiveness SET effectiveness_multiplier = 0.5
WHERE attacking_type = 'Heritage' AND defending_type IN ('Technique', 'Mystical');

-- Modern advantages  
UPDATE wine_type_effectiveness SET effectiveness_multiplier = 2.0
WHERE attacking_type = 'Modern' AND defending_type IN ('Heritage', 'Varietal');

UPDATE wine_type_effectiveness SET effectiveness_multiplier = 0.5
WHERE attacking_type = 'Modern' AND defending_type IN ('Terroir', 'Energy');

-- Mystical advantages
UPDATE wine_type_effectiveness SET effectiveness_multiplier = 2.0
WHERE attacking_type = 'Mystical' AND defending_type IN ('Terroir', 'Varietal');

UPDATE wine_type_effectiveness SET effectiveness_multiplier = 0.5
WHERE attacking_type = 'Mystical' AND defending_type = 'Mystical';

-- Energy advantages
UPDATE wine_type_effectiveness SET effectiveness_multiplier = 2.0
WHERE attacking_type = 'Energy' AND defending_type IN ('Flow', 'Modern');

UPDATE wine_type_effectiveness SET effectiveness_multiplier = 0.5
WHERE attacking_type = 'Energy' AND defending_type IN ('Terroir', 'Technique');

-- Flow advantages
UPDATE wine_type_effectiveness SET effectiveness_multiplier = 2.0
WHERE attacking_type = 'Flow' AND defending_type IN ('Energy', 'Heritage');

UPDATE wine_type_effectiveness SET effectiveness_multiplier = 0.5
WHERE attacking_type = 'Flow' AND defending_type IN ('Varietal', 'Technique');

-- ============================================================================
-- CONSTRAINTS AND VALIDATION
-- ============================================================================

-- Ensure wine species have valid base stats
ALTER TABLE wine_species ADD CONSTRAINT wine_species_base_stats_valid
    CHECK (
        ((base_stats).power BETWEEN 1 AND 255) AND
        ((base_stats).elegance BETWEEN 1 AND 255) AND
        ((base_stats).complexity BETWEEN 1 AND 255) AND
        ((base_stats).longevity BETWEEN 1 AND 255) AND
        ((base_stats).rarity BETWEEN 1 AND 255) AND
        ((base_stats).terroir BETWEEN 1 AND 255)
    );

-- Ensure wines have valid IVs
ALTER TABLE wines ADD CONSTRAINT wines_iv_valid
    CHECK (
        ((individual_values).power BETWEEN 0 AND 31) AND
        ((individual_values).elegance BETWEEN 0 AND 31) AND
        ((individual_values).complexity BETWEEN 0 AND 31) AND
        ((individual_values).longevity BETWEEN 0 AND 31) AND
        ((individual_values).rarity BETWEEN 0 AND 31) AND
        ((individual_values).terroir BETWEEN 0 AND 31)
    );

-- Ensure wines have valid EVs
ALTER TABLE wines ADD CONSTRAINT wines_ev_valid
    CHECK (
        ((effort_values).power BETWEEN 0 AND 252) AND
        ((effort_values).elegance BETWEEN 0 AND 252) AND
        ((effort_values).complexity BETWEEN 0 AND 252) AND
        ((effort_values).longevity BETWEEN 0 AND 252) AND
        ((effort_values).rarity BETWEEN 0 AND 252) AND
        ((effort_values).terroir BETWEEN 0 AND 252)
    );

-- Cannot be own parent
ALTER TABLE wines ADD CONSTRAINT wines_not_own_parent
    CHECK (id != parent_wine_1_id AND id != parent_wine_2_id);

-- Drinking window validation
ALTER TABLE wine_species ADD CONSTRAINT wine_species_drinking_window_valid
    CHECK (drinking_window_start IS NULL OR drinking_window_end IS NULL OR 
           drinking_window_start <= drinking_window_end);

-- ============================================================================
-- COMMENTS ON TABLES
-- ============================================================================

COMMENT ON TABLE wine_species IS 'Master definitions of wine types, like Pokemon species';
COMMENT ON TABLE wines IS 'Individual wine instances with unique stats and characteristics';
COMMENT ON TABLE wine_tasting_notes IS 'Professional WSET-style tasting notes for wines';
COMMENT ON TABLE wine_photos IS 'Photo management for wine bottles, labels, and related images';
COMMENT ON TABLE wine_voice_notes IS 'Audio recordings and transcriptions for wines';
COMMENT ON TABLE wine_type_effectiveness IS 'Pokemon-style type effectiveness chart for strategic interactions';
COMMENT ON TABLE wine_regional_forms IS 'Regional variations of base wine species';

COMMENT ON COLUMN wines.is_perfect_iv IS 'Computed column: true when all IVs equal 31';
COMMENT ON COLUMN wines.drink_from_date IS 'Computed: vintage year + drinking window start';
COMMENT ON COLUMN wines.drink_until_date IS 'Computed: vintage year + drinking window end';