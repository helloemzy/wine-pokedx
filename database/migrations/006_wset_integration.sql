-- ============================================================================
-- Wine Pokédx Database Migration 006: WSET Integration and Professional Data
-- ============================================================================

-- ============================================================================
-- WSET COURSES - Wine & Spirit Education Trust course catalog
-- ============================================================================

CREATE TABLE wset_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Course identification
    course_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., 'WSET-L3-WINE'
    course_name VARCHAR(200) NOT NULL,
    level wset_level NOT NULL,
    
    -- Course details
    description TEXT,
    learning_outcomes TEXT[],
    prerequisites wset_level[],
    
    -- Structure and content
    total_hours INTEGER NOT NULL,
    theory_hours INTEGER,
    practical_hours INTEGER,
    guided_tasting_hours INTEGER,
    
    -- Assessment
    has_theory_exam BOOLEAN DEFAULT FALSE,
    has_practical_exam BOOLEAN DEFAULT FALSE,
    has_tasting_exam BOOLEAN DEFAULT FALSE,
    passing_grade INTEGER DEFAULT 70,
    
    -- Certification
    certificate_name VARCHAR(200),
    certificate_validity_years INTEGER, -- NULL for lifetime
    continuing_education_required BOOLEAN DEFAULT FALSE,
    
    -- Availability
    is_active BOOLEAN DEFAULT TRUE,
    available_languages VARCHAR(5)[] DEFAULT ARRAY['en'],
    
    -- Professional recognition
    industry_recognition TEXT[],
    career_pathways TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- WSET COURSE ENROLLMENTS - User enrollments in WSET courses
-- ============================================================================

CREATE TABLE wset_course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES wset_courses(id) ON DELETE CASCADE,
    
    -- Enrollment details
    enrollment_date DATE DEFAULT CURRENT_DATE,
    start_date DATE,
    target_completion_date DATE,
    
    -- Provider information
    training_provider VARCHAR(200),
    instructor_name VARCHAR(200),
    location VARCHAR(200),
    delivery_method VARCHAR(50), -- 'In-Person', 'Online', 'Hybrid'
    
    -- Progress tracking
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    theory_progress DECIMAL(5,2) DEFAULT 0.00,
    practical_progress DECIMAL(5,2) DEFAULT 0.00,
    tasting_progress DECIMAL(5,2) DEFAULT 0.00,
    
    -- Study materials
    materials_accessed JSONB DEFAULT '[]',
    study_hours_logged INTEGER DEFAULT 0,
    
    -- Assessment results
    theory_exam_score INTEGER,
    theory_exam_date DATE,
    practical_exam_score INTEGER,
    practical_exam_date DATE,
    tasting_exam_score INTEGER,
    tasting_exam_date DATE,
    
    -- Final results
    final_grade INTEGER,
    pass_status BOOLEAN,
    certification_date DATE,
    certificate_number VARCHAR(50),
    
    -- Status
    enrollment_status VARCHAR(20) DEFAULT 'active' CHECK (enrollment_status IN ('active', 'completed', 'withdrawn', 'failed', 'deferred')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, course_id)
);

-- ============================================================================
-- PROFESSIONAL TASTING SESSIONS - WSET-style structured tastings
-- ============================================================================

CREATE TABLE professional_tasting_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Session details
    session_name VARCHAR(200) NOT NULL,
    session_type VARCHAR(50) NOT NULL, -- 'WSET_Practice', 'Professional_Assessment', 'Blind_Training'
    
    -- Organizer and participants
    organizer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    course_id UUID REFERENCES wset_courses(id) ON DELETE SET NULL,
    
    -- Scheduling
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 120,
    
    -- Location and setup
    location VARCHAR(200),
    is_virtual BOOLEAN DEFAULT FALSE,
    virtual_platform VARCHAR(100),
    
    -- Tasting setup
    wine_count INTEGER NOT NULL CHECK (wine_count > 0),
    is_blind_tasting BOOLEAN DEFAULT FALSE,
    temperature_control BOOLEAN DEFAULT TRUE,
    standardized_glassware BOOLEAN DEFAULT TRUE,
    
    -- Assessment details
    is_assessed BOOLEAN DEFAULT FALSE,
    assessment_criteria JSONB,
    scoring_method VARCHAR(50),
    pass_threshold INTEGER,
    
    -- Materials and notes
    tasting_notes_template JSONB,
    reference_materials TEXT[],
    session_notes TEXT,
    
    -- Results and feedback
    average_score DECIMAL(5,2),
    participant_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2),
    
    -- Status
    session_status VARCHAR(20) DEFAULT 'planned' CHECK (session_status IN ('planned', 'active', 'completed', 'cancelled')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PROFESSIONAL TASTING PARTICIPANTS - Track session participation
-- ============================================================================

CREATE TABLE professional_tasting_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES professional_tasting_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Participation details
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attendance_status VARCHAR(20) DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'absent', 'cancelled')),
    
    -- Performance tracking
    wines_tasted INTEGER DEFAULT 0,
    wines_completed INTEGER DEFAULT 0,
    
    -- Scoring
    total_score DECIMAL(5,2),
    average_score DECIMAL(5,2),
    passed BOOLEAN,
    
    -- Detailed scores by wine
    wine_scores JSONB, -- {wine_id: score, ...}
    
    -- Time tracking
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    total_time_minutes INTEGER,
    
    -- Feedback
    self_assessment JSONB,
    instructor_feedback TEXT,
    areas_for_improvement TEXT[],
    
    -- Certification tracking
    contributes_to_certification BOOLEAN DEFAULT FALSE,
    certification_credit_hours DECIMAL(4,2),
    
    UNIQUE(session_id, user_id)
);

-- ============================================================================
-- SYSTEMATIC TASTING TEMPLATES - WSET systematic approach templates
-- ============================================================================

CREATE TABLE systematic_tasting_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Template details
    name VARCHAR(200) NOT NULL,
    wset_level wset_level NOT NULL,
    wine_category VARCHAR(50) NOT NULL, -- 'Still_Wine', 'Sparkling_Wine', 'Fortified_Wine', 'Spirits'
    
    -- Template structure
    template_structure JSONB NOT NULL, -- Complete WSET tasting grid structure
    
    -- Evaluation criteria
    scoring_criteria JSONB,
    quality_indicators JSONB,
    common_faults JSONB,
    
    -- Educational content
    guidance_notes TEXT,
    example_vocabulary TEXT[],
    
    -- Usage and versioning
    version VARCHAR(10) DEFAULT '1.0',
    is_official BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PROFESSIONAL CERTIFICATIONS - Track professional wine certifications
-- ============================================================================

CREATE TABLE professional_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Certification details
    certification_name VARCHAR(200) NOT NULL,
    issuing_organization VARCHAR(200) NOT NULL,
    certification_level VARCHAR(50),
    
    -- Certification data
    certificate_number VARCHAR(100),
    issue_date DATE NOT NULL,
    expiry_date DATE,
    is_lifetime BOOLEAN DEFAULT FALSE,
    
    -- Achievement details
    final_score INTEGER,
    grade VARCHAR(20),
    honors VARCHAR(50), -- 'Pass', 'Merit', 'Distinction'
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verification_method VARCHAR(50),
    verification_date DATE,
    
    -- Renewal tracking
    requires_renewal BOOLEAN DEFAULT FALSE,
    renewal_period_years INTEGER,
    continuing_education_hours INTEGER,
    
    -- Recognition
    industry_recognition_level VARCHAR(50),
    career_equivalents TEXT[],
    
    -- Documentation
    certificate_image_url VARCHAR(500),
    digital_badge_url VARCHAR(500),
    verification_url VARCHAR(500),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended', 'revoked')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- WINE EDUCATION CONTENT - Educational materials and resources
-- ============================================================================

CREATE TABLE wine_education_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Content identification
    title VARCHAR(300) NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'Article', 'Video', 'Interactive', 'Quiz', 'Game'
    category VARCHAR(100) NOT NULL, -- 'Viticulture', 'Winemaking', 'Tasting', 'Regions', etc.
    
    -- Educational level
    target_wset_level wset_level,
    difficulty_level VARCHAR(20) DEFAULT 'Intermediate',
    prerequisites TEXT[],
    
    -- Content data
    content_body TEXT,
    media_urls TEXT[] DEFAULT '{}',
    interactive_elements JSONB,
    
    -- Learning objectives
    learning_objectives TEXT[] NOT NULL,
    key_concepts TEXT[],
    vocabulary_terms JSONB, -- {term: definition, ...}
    
    -- Assessment
    has_quiz BOOLEAN DEFAULT FALSE,
    quiz_questions JSONB,
    passing_score INTEGER DEFAULT 70,
    
    -- Metadata
    estimated_duration_minutes INTEGER,
    last_updated DATE DEFAULT CURRENT_DATE,
    
    -- Quality and approval
    is_published BOOLEAN DEFAULT FALSE,
    quality_score DECIMAL(3,2),
    review_status VARCHAR(20) DEFAULT 'draft',
    
    -- Authorship and attribution
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    contributor_ids UUID[] DEFAULT '{}',
    source_attribution TEXT,
    
    -- Usage tracking
    view_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    
    -- SEO and discoverability
    tags TEXT[] DEFAULT '{}',
    meta_description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER EDUCATION PROGRESS - Track user progress through educational content
-- ============================================================================

CREATE TABLE user_education_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES wine_education_content(id) ON DELETE CASCADE,
    
    -- Progress tracking
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Detailed progress
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    time_spent_minutes INTEGER DEFAULT 0,
    sections_completed INTEGER DEFAULT 0,
    total_sections INTEGER,
    
    -- Assessment results
    quiz_attempts INTEGER DEFAULT 0,
    best_quiz_score INTEGER,
    current_quiz_score INTEGER,
    passed_quiz BOOLEAN DEFAULT FALSE,
    
    -- Engagement metrics
    bookmark_sections INTEGER[] DEFAULT '{}',
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    
    -- Certification contribution
    contributes_to_wset BOOLEAN DEFAULT FALSE,
    credit_hours_earned DECIMAL(4,2) DEFAULT 0.00,
    
    -- Status
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    
    UNIQUE(user_id, content_id)
);

-- ============================================================================
-- PROFESSIONAL WINE REGIONS - Detailed regional information
-- ============================================================================

CREATE TABLE professional_wine_regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Regional identification
    region_name VARCHAR(200) NOT NULL,
    country VARCHAR(100) NOT NULL,
    parent_region_id UUID REFERENCES professional_wine_regions(id) ON DELETE SET NULL,
    
    -- Classification system
    classification_level VARCHAR(50), -- 'AOC', 'DOC', 'AVA', 'GI', etc.
    official_designation VARCHAR(200),
    established_year INTEGER,
    
    -- Geographic data
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    area_hectares INTEGER,
    vineyard_area_hectares INTEGER,
    
    -- Climate and terroir
    climate_type VARCHAR(100),
    average_temperature_growing DECIMAL(4,2),
    annual_rainfall INTEGER, -- mm
    soil_types TEXT[],
    topography TEXT[],
    
    -- Viticulture
    permitted_grape_varieties TEXT[],
    primary_grape_varieties TEXT[],
    typical_yield_hl_per_ha INTEGER,
    harvest_period VARCHAR(100),
    
    -- Wine styles
    typical_wine_styles TEXT[],
    quality_levels TEXT[],
    aging_requirements JSONB,
    
    -- Production statistics
    annual_production_hectolitres INTEGER,
    number_of_producers INTEGER,
    export_percentage DECIMAL(5,2),
    
    -- Educational importance
    wset_level_coverage wset_level[],
    key_learning_points TEXT[],
    
    -- Marketing and recognition
    notable_producers TEXT[],
    flagship_wines TEXT[],
    price_tier VARCHAR(50),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- GRAPE VARIETY PROFILES - Professional grape variety database
-- ============================================================================

CREATE TABLE grape_variety_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Variety identification
    variety_name VARCHAR(200) NOT NULL,
    common_synonyms TEXT[] DEFAULT '{}',
    scientific_name VARCHAR(200),
    
    -- Classification
    color VARCHAR(20) NOT NULL CHECK (color IN ('Red', 'White', 'Rose', 'Teinturier')),
    species VARCHAR(100) DEFAULT 'Vitis vinifera',
    
    -- Viticultural characteristics
    budbreak_timing VARCHAR(20), -- 'Early', 'Mid', 'Late'
    ripening_period VARCHAR(20),
    vigor_level VARCHAR(20),
    yield_potential VARCHAR(20),
    disease_resistance VARCHAR(20),
    
    -- Climate preferences
    preferred_climate VARCHAR(100),
    heat_summation_range VARCHAR(100), -- Growing degree days
    frost_tolerance VARCHAR(20),
    
    -- Soil preferences
    preferred_soil_types TEXT[],
    drainage_requirements VARCHAR(50),
    
    -- Wine characteristics
    typical_alcohol_range VARCHAR(20),
    acidity_level VARCHAR(20),
    tannin_level VARCHAR(20), -- For red varieties
    body_weight VARCHAR(20),
    aging_potential VARCHAR(20),
    
    -- Flavor profiles
    primary_flavors TEXT[],
    secondary_flavors TEXT[],
    tertiary_flavors TEXT[],
    
    -- Typical aromas
    young_wine_aromas TEXT[],
    aged_wine_aromas TEXT[],
    
    -- Regional expressions
    notable_regions UUID[] DEFAULT '{}', -- References to professional_wine_regions
    regional_variations JSONB,
    
    -- Winemaking notes
    harvest_considerations TEXT[],
    fermentation_notes TEXT[],
    aging_recommendations TEXT[],
    
    -- Food pairing
    classic_pairings TEXT[],
    pairing_principles TEXT[],
    
    -- Educational content
    key_learning_points TEXT[],
    common_exam_topics TEXT[],
    tasting_exam_frequency INTEGER DEFAULT 0, -- How often it appears in tastings
    
    -- Production statistics
    global_plantings_hectares INTEGER,
    top_producing_countries TEXT[],
    
    -- Quality indicators
    quality_potential VARCHAR(50),
    commercial_importance INTEGER DEFAULT 0 CHECK (commercial_importance >= 0 AND commercial_importance <= 10),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- WSET courses and enrollments
CREATE INDEX idx_wset_courses_level ON wset_courses(level);
CREATE INDEX idx_wset_courses_active ON wset_courses(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_wset_course_enrollments_user ON wset_course_enrollments(user_id);
CREATE INDEX idx_wset_course_enrollments_course ON wset_course_enrollments(course_id);
CREATE INDEX idx_wset_course_enrollments_status ON wset_course_enrollments(enrollment_status);

-- Professional tastings
CREATE INDEX idx_professional_tasting_sessions_organizer ON professional_tasting_sessions(organizer_id);
CREATE INDEX idx_professional_tasting_sessions_date ON professional_tasting_sessions(scheduled_date);
CREATE INDEX idx_professional_tasting_sessions_course ON professional_tasting_sessions(course_id);
CREATE INDEX idx_professional_tasting_participants_session ON professional_tasting_participants(session_id);
CREATE INDEX idx_professional_tasting_participants_user ON professional_tasting_participants(user_id);

-- Templates and content
CREATE INDEX idx_systematic_tasting_templates_level ON systematic_tasting_templates(wset_level);
CREATE INDEX idx_systematic_tasting_templates_category ON systematic_tasting_templates(wine_category);
CREATE INDEX idx_wine_education_content_category ON wine_education_content(category);
CREATE INDEX idx_wine_education_content_level ON wine_education_content(target_wset_level);
CREATE INDEX idx_wine_education_content_published ON wine_education_content(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_wine_education_content_tags ON wine_education_content USING GIN(tags);

-- Professional certifications
CREATE INDEX idx_professional_certifications_user ON professional_certifications(user_id);
CREATE INDEX idx_professional_certifications_organization ON professional_certifications(issuing_organization);
CREATE INDEX idx_professional_certifications_status ON professional_certifications(status);
CREATE INDEX idx_professional_certifications_expiry ON professional_certifications(expiry_date) WHERE expiry_date IS NOT NULL;

-- Regional and variety data
CREATE INDEX idx_professional_wine_regions_country ON professional_wine_regions(country);
CREATE INDEX idx_professional_wine_regions_parent ON professional_wine_regions(parent_region_id);
CREATE INDEX idx_professional_wine_regions_grapes ON professional_wine_regions USING GIN(permitted_grape_varieties);
CREATE INDEX idx_grape_variety_profiles_color ON grape_variety_profiles(color);
CREATE INDEX idx_grape_variety_profiles_regions ON grape_variety_profiles USING GIN(notable_regions);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Update WSET progress and awards
CREATE OR REPLACE FUNCTION update_wset_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.pass_status = TRUE AND (OLD.pass_status IS NULL OR OLD.pass_status = FALSE) THEN
        -- Update user's WSET level
        UPDATE users 
        SET wset_level = (SELECT level FROM wset_courses WHERE id = NEW.course_id),
            wset_certification_date = NEW.certification_date
        WHERE id = NEW.user_id;
        
        -- Award experience for course completion
        UPDATE users 
        SET experience_education = experience_education + 5000,
            total_experience = total_experience + 5000
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wset_progress_trigger
    AFTER UPDATE ON wset_course_enrollments
    FOR EACH ROW
    WHEN (OLD.pass_status IS DISTINCT FROM NEW.pass_status)
    EXECUTE FUNCTION update_wset_progress();

-- Update content engagement metrics
CREATE OR REPLACE FUNCTION update_content_engagement()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE wine_education_content 
        SET view_count = view_count + 1 
        WHERE id = NEW.content_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.completed_at IS NOT NULL AND OLD.completed_at IS NULL THEN
        UPDATE wine_education_content 
        SET completion_count = completion_count + 1 
        WHERE id = NEW.content_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_engagement_trigger
    AFTER INSERT OR UPDATE ON user_education_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_content_engagement();

-- ============================================================================
-- SEED DATA FOR WSET COURSES
-- ============================================================================

INSERT INTO wset_courses (course_code, course_name, level, total_hours, theory_hours, practical_hours, guided_tasting_hours, has_theory_exam, has_practical_exam, has_tasting_exam, certificate_name) VALUES
('WSET-L1-WINE', 'WSET Level 1 Award in Wines', 'Level1', 6, 4, 0, 2, TRUE, FALSE, FALSE, 'WSET Level 1 Award in Wines'),
('WSET-L2-WINE', 'WSET Level 2 Award in Wines', 'Level2', 17, 12, 0, 5, TRUE, FALSE, TRUE, 'WSET Level 2 Award in Wines'),
('WSET-L3-WINE', 'WSET Level 3 Award in Wines', 'Level3', 30, 20, 0, 10, TRUE, FALSE, TRUE, 'WSET Level 3 Award in Wines'),
('WSET-L4-DIP', 'WSET Level 4 Diploma in Wines', 'Level4', 130, 80, 0, 50, TRUE, TRUE, TRUE, 'WSET Level 4 Diploma in Wines');

-- ============================================================================
-- SEED DATA FOR SYSTEMATIC TASTING TEMPLATES
-- ============================================================================

INSERT INTO systematic_tasting_templates (name, wset_level, wine_category, template_structure, is_official) VALUES
('WSET Level 3 Still Wine Grid', 'Level3', 'Still_Wine', '{
  "appearance": {
    "intensity": ["Pale", "Medium", "Deep"],
    "color": "text_field",
    "other_observations": "text_field"
  },
  "nose": {
    "condition": ["Clean", "Unclean"],
    "intensity": ["Light", "Medium(-)", "Medium", "Medium(+)", "Pronounced"],
    "development": ["Youthful", "Developing", "Fully Developed", "Tired"],
    "primary_aromas": "multi_select",
    "secondary_aromas": "multi_select", 
    "tertiary_aromas": "multi_select"
  },
  "palate": {
    "sweetness": ["Bone Dry", "Dry", "Off-Dry", "Medium-Dry", "Medium-Sweet", "Sweet", "Lusciously Sweet"],
    "acidity": ["Low", "Medium(-)", "Medium", "Medium(+)", "High"],
    "tannin": ["Low", "Medium(-)", "Medium", "Medium(+)", "High"],
    "alcohol": ["Low", "Medium", "Medium(+)", "High"],
    "body": ["Light", "Medium(-)", "Medium", "Medium(+)", "Full"],
    "flavor_intensity": ["Light", "Medium(-)", "Medium", "Medium(+)", "Pronounced"],
    "flavor_characteristics": "multi_select",
    "finish": ["Short", "Medium(-)", "Medium", "Medium(+)", "Long"]
  },
  "conclusions": {
    "quality": ["Faulty", "Poor", "Acceptable", "Good", "Very Good", "Outstanding"],
    "readiness": ["Too Young", "Ready to Drink", "Past its Best"],
    "suitable_for": "text_field"
  }
}', TRUE);

-- ============================================================================
-- CONSTRAINTS AND VALIDATION
-- ============================================================================

-- WSET enrollment constraints
ALTER TABLE wset_course_enrollments ADD CONSTRAINT wset_enrollments_valid_dates
    CHECK (start_date IS NULL OR start_date >= enrollment_date);

ALTER TABLE wset_course_enrollments ADD CONSTRAINT wset_enrollments_valid_scores
    CHECK (
        (theory_exam_score IS NULL OR (theory_exam_score >= 0 AND theory_exam_score <= 100)) AND
        (practical_exam_score IS NULL OR (practical_exam_score >= 0 AND practical_exam_score <= 100)) AND
        (tasting_exam_score IS NULL OR (tasting_exam_score >= 0 AND tasting_exam_score <= 100))
    );

-- Professional certification constraints
ALTER TABLE professional_certifications ADD CONSTRAINT certifications_valid_dates
    CHECK (expiry_date IS NULL OR expiry_date > issue_date);

-- Region area constraints
ALTER TABLE professional_wine_regions ADD CONSTRAINT regions_valid_area
    CHECK (vineyard_area_hectares IS NULL OR area_hectares IS NULL OR vineyard_area_hectares <= area_hectares);

-- ============================================================================
-- COMMENTS ON TABLES
-- ============================================================================

COMMENT ON TABLE wset_courses IS 'Official WSET course catalog with detailed structure and requirements';
COMMENT ON TABLE wset_course_enrollments IS 'User enrollments in WSET courses with progress and assessment tracking';
COMMENT ON TABLE professional_tasting_sessions IS 'Structured professional tasting sessions for education and assessment';
COMMENT ON TABLE systematic_tasting_templates IS 'WSET systematic approach templates for consistent wine evaluation';
COMMENT ON TABLE professional_certifications IS 'Professional wine certifications from various organizations';
COMMENT ON TABLE wine_education_content IS 'Educational materials and resources for wine learning';
COMMENT ON TABLE professional_wine_regions IS 'Comprehensive database of professional wine regions';
COMMENT ON TABLE grape_variety_profiles IS 'Detailed profiles of grape varieties for educational purposes';

COMMENT ON COLUMN systematic_tasting_templates.template_structure IS 'JSONB structure defining the complete WSET tasting grid';
COMMENT ON COLUMN professional_wine_regions.classification_level IS 'Official classification system (AOC, DOC, AVA, etc.)';
COMMENT ON COLUMN grape_variety_profiles.commercial_importance IS 'Scale 0-10 indicating commercial significance globally';