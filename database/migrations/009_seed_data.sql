-- ============================================================================
-- Wine Pokédx Database Migration 009: Seed Data
-- ============================================================================

-- ============================================================================
-- SAMPLE WINE SPECIES DATA
-- ============================================================================

INSERT INTO wine_species (
    name, slug, primary_type, secondary_type, base_stats, generation, rarity_base,
    grape_varieties, typical_regions, typical_abv_min, typical_abv_max,
    drinking_window_start, drinking_window_end, spawn_rate, description
) VALUES
-- Terroir-focused wines
('Burgundian Pinot Noir', 'burgundian-pinot-noir', 'Terroir', NULL, 
 ROW(140, 180, 160, 200, 120, 220), 1, 'GrandCru',
 ARRAY['Pinot Noir'], ARRAY['Burgundy', 'Côte de Nuits'], 12.5, 14.5,
 8, 25, 2.0,
 'The epitome of terroir expression, showcasing the unique characteristics of Burgundian limestone soils.'),

('Barolo Nebbiolo', 'barolo-nebbiolo', 'Terroir', 'Heritage', 
 ROW(200, 120, 180, 240, 140, 200), 1, 'Reserve',
 ARRAY['Nebbiolo'], ARRAY['Barolo', 'Piedmont'], 13.5, 15.0,
 10, 30, 7.0,
 'King of wines from the fog-blessed hills of Piedmont, expressing centuries of winemaking tradition.'),

-- Varietal-focused wines
('Marlborough Sauvignon Blanc', 'marlborough-sauvignon-blanc', 'Varietal', 'Flow', 
 ROW(90, 160, 140, 80, 100, 160), 1, 'Quality',
 ARRAY['Sauvignon Blanc'], ARRAY['Marlborough', 'New Zealand'], 12.0, 14.0,
 1, 5, 25.0,
 'Pure varietal expression of Sauvignon Blanc with intense tropical fruit and herbaceous character.'),

('Napa Valley Cabernet Sauvignon', 'napa-cabernet-sauvignon', 'Varietal', 'Energy', 
 ROW(180, 120, 160, 180, 120, 140), 1, 'Estate',
 ARRAY['Cabernet Sauvignon'], ARRAY['Napa Valley', 'California'], 13.5, 15.5,
 5, 20, 12.0,
 'Bold and powerful expression of Cabernet Sauvignon from the prestigious Napa Valley.'),

-- Technique-focused wines
('Orange Pet-Nat', 'orange-pet-nat', 'Technique', 'Modern', 
 ROW(120, 140, 200, 100, 160, 140), 2, 'AllocationOnly',
 ARRAY['Pinot Grigio', 'Gewürztraminer'], ARRAY['Friuli', 'Slovenia'], 11.0, 13.0,
 1, 8, 1.5,
 'Natural wine showcasing ancient winemaking techniques with extended skin contact and natural fermentation.'),

('Biodynamic Rhône Blend', 'biodynamic-rhone-blend', 'Technique', 'Heritage', 
 ROW(160, 150, 180, 160, 140, 180), 2, 'MasterSelection',
 ARRAY['Syrah', 'Grenache', 'Mourvèdre'], ARRAY['Rhône Valley', 'France'], 13.0, 15.0,
 3, 15, 4.0,
 'Biodynamically farmed blend expressing the lunar calendar and holistic farming approach.'),

-- Heritage wines
('Vintage Port', 'vintage-port', 'Heritage', 'Mystical', 
 ROW(220, 100, 200, 250, 180, 160), 1, 'InvestmentGrade',
 ARRAY['Touriga Nacional', 'Tinta Roriz', 'Touriga Franca'], ARRAY['Douro', 'Portugal'], 19.0, 22.0,
 15, 50, 0.3,
 'Legendary fortified wine from declared vintage years, capable of aging for decades.'),

('Champagne Grande Cuvée', 'champagne-grande-cuvee', 'Heritage', 'Mystical', 
 ROW(160, 200, 180, 140, 200, 180), 1, 'MuseumPiece',
 ARRAY['Chardonnay', 'Pinot Noir', 'Pinot Meunier'], ARRAY['Champagne', 'France'], 12.0, 12.5,
 5, 20, 0.2,
 'The pinnacle of sparkling wine craftsmanship from the sacred chalk soils of Champagne.'),

-- Modern wines
('Concrete Egg Chardonnay', 'concrete-egg-chardonnay', 'Modern', 'Technique', 
 ROW(140, 160, 180, 120, 120, 140), 2, 'CultClassic',
 ARRAY['Chardonnay'], ARRAY['Sonoma Coast', 'California'], 12.5, 14.0,
 2, 10, 2.0,
 'Innovative winemaking using concrete egg fermenters for unique texture and minerality.'),

('Amphora Qvevri Wine', 'amphora-qvevri-wine', 'Modern', 'Heritage', 
 ROW(150, 140, 200, 140, 160, 200), 2, 'CriticsChoice',
 ARRAY['Rkatsiteli', 'Saperavi'], ARRAY['Georgia', 'Kakheti'], 12.0, 14.5,
 3, 12, 1.8,
 'Ancient Georgian winemaking technique revived with modern precision in clay vessels.'),

-- Mystical wines
('Screaming Eagle Cabernet', 'screaming-eagle-cabernet', 'Mystical', 'Energy', 
 ROW(240, 160, 220, 200, 250, 180), 1, 'OnceInLifetime',
 ARRAY['Cabernet Sauvignon'], ARRAY['Napa Valley', 'California'], 14.0, 15.5,
 10, 25, 0.005,
 'Cult Napa Cabernet of legendary status, representing the pinnacle of New World winemaking.'),

('Petrus Pomerol', 'petrus-pomerol', 'Mystical', 'Heritage', 
 ROW(220, 180, 240, 220, 255, 200), 1, 'TimeCapsule',
 ARRAY['Merlot'], ARRAY['Pomerol', 'Bordeaux'], 13.0, 14.5,
 10, 30, 0.001,
 'The Holy Grail of Merlot, from a tiny vineyard that produces liquid poetry.'),

-- Energy wines
('Amarone della Valpolicella', 'amarone-valpolicella', 'Energy', 'Technique', 
 ROW(200, 120, 180, 200, 140, 160), 1, 'GrandCru',
 ARRAY['Corvina', 'Rondinella', 'Molinara'], ARRAY['Veneto', 'Italy'], 14.0, 16.5,
 8, 25, 3.5,
 'Powerful dried grape wine with intense concentration and formidable structure.'),

('Côtes du Rhône Syrah', 'cotes-du-rhone-syrah', 'Energy', 'Terroir', 
 ROW(180, 100, 160, 160, 120, 180), 1, 'Regional',
 ARRAY['Syrah'], ARRAY['Northern Rhône', 'France'], 12.5, 15.0,
 5, 18, 15.0,
 'Bold and spicy Syrah expressing the granite terroir of the Northern Rhône.'),

-- Flow wines
('Riesling Spätlese', 'riesling-spatlese', 'Flow', 'Terroir', 
 ROW(80, 200, 180, 160, 140, 200), 1, 'Vintage',
 ARRAY['Riesling'], ARRAY['Mosel', 'Germany'], 8.0, 12.0,
 3, 25, 8.0,
 'Elegant late-harvest Riesling with perfect balance of sweetness and acidity.'),

('Loire Valley Muscadet', 'loire-muscadet', 'Flow', 'Terroir', 
 ROW(70, 180, 120, 100, 80, 180), 1, 'Everyday',
 ARRAY['Melon de Bourgogne'], ARRAY['Loire Valley', 'France'], 11.5, 12.5,
 1, 3, 40.0,
 'Light and crisp white wine perfect for seafood, expressing Atlantic coastal terroir.');

-- ============================================================================
-- SAMPLE USERS DATA (for testing)
-- ============================================================================

INSERT INTO users (
    email, username, password_hash, display_name, level, tier, total_experience,
    is_premium, profile_visibility, collection_visibility
) VALUES
('admin@winepokedex.com', 'admin', '$2b$12$LQv3c1yqBwEHxkKsLsOBzOQOQQK.V3I5Q0Z0Q0Z0Q0Z0Q0Z0Q0Z0Q', 'System Admin', 50, 'Advanced', 125000, TRUE, 'Public', 'Public'),
('sommelier@example.com', 'master_sommelier', '$2b$12$LQv3c1yqBwEHxkKsLsOBzOQOQQK.V3I5Q0Z0Q0Z0Q0Z0Q0Z0Q0Z0Q', 'Master Sommelier', 85, 'Expert', 350000, TRUE, 'Public', 'Public'),
('collector@example.com', 'wine_collector', '$2b$12$LQv3c1yqBwEHxkKsLsOBzOQOQQK.V3I5Q0Z0Q0Z0Q0Z0Q0Z0Q0Z0Q', 'Vintage Collector', 42, 'Advanced', 105000, TRUE, 'Public', 'Guild'),
('newbie@example.com', 'wine_newbie', '$2b$12$LQv3c1yqBwEHxkKsLsOBzOQOQQK.V3I5Q0Z0Q0Z0Q0Z0Q0Z0Q0Z0Q', 'Wine Explorer', 8, 'Novice', 2400, FALSE, 'Friends', 'Private'),
('trader@example.com', 'wine_trader', '$2b$12$LQv3c1yqBwEHxkKsLsOBzOQOQQK.V3I5Q0Z0Q0Z0Q0Z0Q0Z0Q0Z0Q', 'Trading Master', 35, 'Intermediate', 87500, FALSE, 'Public', 'Public');

-- ============================================================================
-- SAMPLE PROFESSIONAL WINE REGIONS
-- ============================================================================

INSERT INTO professional_wine_regions (
    region_name, country, classification_level, established_year, area_hectares,
    climate_type, soil_types, permitted_grape_varieties, typical_wine_styles,
    wset_level_coverage, key_learning_points
) VALUES
('Burgundy', 'France', 'AOC', 1936, 28530,
 'Continental', ARRAY['Limestone', 'Clay', 'Marl'],
 ARRAY['Pinot Noir', 'Chardonnay', 'Aligoté', 'Gamay'],
 ARRAY['Red Burgundy', 'White Burgundy', 'Crémant de Bourgogne'],
 ARRAY['Level2', 'Level3', 'Level4'],
 ARRAY['Terroir expression', 'Climate hierarchy', 'Producer importance']),

('Champagne', 'France', 'AOC', 1927, 34000,
 'Continental', ARRAY['Chalk', 'Limestone', 'Sand'],
 ARRAY['Chardonnay', 'Pinot Noir', 'Pinot Meunier'],
 ARRAY['Non-vintage Champagne', 'Vintage Champagne', 'Prestige Cuvée'],
 ARRAY['Level1', 'Level2', 'Level3'],
 ARRAY['Traditional method', 'Blending importance', 'Aging requirements']),

('Napa Valley', 'United States', 'AVA', 1981, 19000,
 'Mediterranean', ARRAY['Volcanic', 'Alluvial', 'Sedimentary'],
 ARRAY['Cabernet Sauvignon', 'Chardonnay', 'Merlot', 'Sauvignon Blanc'],
 ARRAY['Napa Cabernet', 'Bordeaux Blends', 'Premium Chardonnay'],
 ARRAY['Level2', 'Level3'],
 ARRAY['New World style', 'Sub-AVA diversity', 'Premium pricing']),

('Barolo', 'Italy', 'DOCG', 1980, 2100,
 'Continental', ARRAY['Calcareous Clay', 'Sandstone'],
 ARRAY['Nebbiolo'],
 ARRAY['Barolo DOCG'],
 ARRAY['Level3', 'Level4'],
 ARRAY['Single variety focus', 'Aging requirements', 'Commune differences']),

('Mosel', 'Germany', 'QbA', 1971, 8800,
 'Cool Continental', ARRAY['Slate', 'Quartzite', 'Sandstone'],
 ARRAY['Riesling', 'Müller-Thurgau', 'Elbling'],
 ARRAY['Kabinett', 'Spätlese', 'Auslese', 'Eiswein'],
 ARRAY['Level2', 'Level3'],
 ARRAY['Prädikatswein system', 'Vineyard steepness', 'Slate soil influence']);

-- ============================================================================
-- SAMPLE GRAPE VARIETY PROFILES
-- ============================================================================

INSERT INTO grape_variety_profiles (
    variety_name, common_synonyms, color, budbreak_timing, ripening_period,
    preferred_climate, typical_alcohol_range, acidity_level, tannin_level,
    body_weight, primary_flavors, notable_regions, commercial_importance
) VALUES
('Pinot Noir', ARRAY['Spätburgunder', 'Pinot Nero'], 'Red', 'Early', 'Early',
 'Cool to moderate', '12-14%', 'Medium(+)', 'Low', 'Light',
 ARRAY['Red cherry', 'Strawberry', 'Rose', 'Earth'],
 (SELECT ARRAY_AGG(id) FROM professional_wine_regions WHERE region_name IN ('Burgundy', 'Oregon', 'Central Otago')), 9),

('Chardonnay', ARRAY['Morillon'], 'White', 'Early', 'Early',
 'Cool to warm', '12-15%', 'Medium(-)', NULL, 'Medium(-)',
 ARRAY['Apple', 'Citrus', 'Stone fruit', 'Butter'],
 (SELECT ARRAY_AGG(id) FROM professional_wine_regions WHERE region_name IN ('Burgundy', 'Champagne', 'Australia')), 10),

('Cabernet Sauvignon', ARRAY['Bouchet'], 'Red', 'Late', 'Late',
 'Warm to hot', '13-15%', 'Medium(-)', 'High', 'Full',
 ARRAY['Blackcurrant', 'Cedar', 'Tobacco', 'Green pepper'],
 (SELECT ARRAY_AGG(id) FROM professional_wine_regions WHERE region_name IN ('Bordeaux', 'Napa Valley', 'Coonawarra')), 10),

('Riesling', ARRAY['Rheinriesling', 'White Riesling'], 'White', 'Late', 'Late',
 'Cool to moderate', '8-13%', 'High', NULL, 'Light',
 ARRAY['Lime', 'Apple', 'Peach', 'Petrol'],
 (SELECT ARRAY_AGG(id) FROM professional_wine_regions WHERE region_name IN ('Mosel', 'Rheingau', 'Clare Valley')), 8),

('Nebbiolo', ARRAY['Spanna', 'Chiavennasca'], 'Red', 'Early', 'Very Late',
 'Continental', '13-15%', 'High', 'High', 'Full',
 ARRAY['Rose', 'Tar', 'Cherry', 'Truffle'],
 (SELECT ARRAY_AGG(id) FROM professional_wine_regions WHERE region_name IN ('Barolo', 'Barbaresco')), 6);

-- ============================================================================
-- SAMPLE GUILDS
-- ============================================================================

INSERT INTO guilds (
    name, description, guild_type, focus_types, focus_regions,
    visibility, max_members, minimum_level,
    founder_id, current_leader_id
) VALUES
('Burgundy Masters', 'Elite guild focused on Burgundian terroir and Pinot Noir mastery', 'TypeSpecialist',
 ARRAY['Terroir'], ARRAY['Burgundy', 'Oregon', 'Central Otago'],
 'Public', 50, 25,
 (SELECT id FROM users WHERE username = 'master_sommelier'),
 (SELECT id FROM users WHERE username = 'master_sommelier')),

('New World Pioneers', 'Exploring innovative techniques and modern winemaking', 'TypeSpecialist',
 ARRAY['Modern', 'Technique'], ARRAY['California', 'Australia', 'New Zealand'],
 'Public', 100, 10,
 (SELECT id FROM users WHERE username = 'wine_trader'),
 (SELECT id FROM users WHERE username = 'wine_trader')),

('The Collectors Society', 'For serious wine collectors and investment enthusiasts', 'Trading',
 ARRAY['Mystical', 'Heritage'], ARRAY['Bordeaux', 'Tuscany', 'Napa Valley'],
 'InviteOnly', 25, 40,
 (SELECT id FROM users WHERE username = 'wine_collector'),
 (SELECT id FROM users WHERE username = 'wine_collector')),

('Wine Education Alliance', 'Learning and education focused community', 'Education',
 NULL, NULL,
 'Public', 200, 1,
 (SELECT id FROM users WHERE username = 'admin'),
 (SELECT id FROM users WHERE username = 'admin'));

-- ============================================================================
-- SAMPLE GUILD MEMBERSHIPS
-- ============================================================================

INSERT INTO guild_memberships (guild_id, user_id, role, total_experience_contributed)
SELECT 
    g.id,
    u.id,
    CASE 
        WHEN g.founder_id = u.id THEN 'Leader'
        WHEN u.username = 'wine_collector' AND g.name != 'The Collectors Society' THEN 'Officer'
        ELSE 'Member'
    END,
    CASE 
        WHEN g.founder_id = u.id THEN 50000
        WHEN u.level > 30 THEN u.total_experience * 0.1
        ELSE u.total_experience * 0.05
    END
FROM guilds g
CROSS JOIN users u
WHERE 
    (g.name = 'Wine Education Alliance') OR
    (g.name = 'New World Pioneers' AND u.level >= 10) OR
    (g.name = 'Burgundy Masters' AND u.level >= 25) OR
    (g.name = 'The Collectors Society' AND u.level >= 40);

-- ============================================================================
-- SAMPLE EVOLUTION CHAINS
-- ============================================================================

INSERT INTO evolution_chains (name, description, chain_length, has_branching) VALUES
('Burgundian Excellence', 'Evolution chain showcasing the progression of Burgundian wine mastery', 3, FALSE),
('Champagne Mastery', 'The path from basic sparkling wine to prestige cuvée', 2, FALSE),
('Bordeaux Legacy', 'Classic Bordeaux evolution representing decades of aging potential', 3, TRUE);

-- Get the chain IDs for evolution entries
DO $$
DECLARE
    burgundy_chain_id UUID;
    champagne_chain_id UUID;
    bordeaux_chain_id UUID;
    burgundy_species_id UUID;
    champagne_species_id UUID;
BEGIN
    -- Get chain IDs
    SELECT id INTO burgundy_chain_id FROM evolution_chains WHERE name = 'Burgundian Excellence';
    SELECT id INTO champagne_chain_id FROM evolution_chains WHERE name = 'Champagne Mastery';
    SELECT id INTO bordeaux_chain_id FROM evolution_chains WHERE name = 'Bordeaux Legacy';
    
    -- Get species IDs
    SELECT id INTO burgundy_species_id FROM wine_species WHERE slug = 'burgundian-pinot-noir';
    SELECT id INTO champagne_species_id FROM wine_species WHERE slug = 'champagne-grande-cuvee';
    
    -- Note: In a real implementation, you would create base evolution forms
    -- For now, we'll create placeholder evolution examples
END $$;

-- ============================================================================
-- SAMPLE SEASONAL MODIFIERS
-- ============================================================================

INSERT INTO seasonal_modifiers (
    season, year, start_date, end_date,
    rarity_bonuses, type_bonuses, region_bonuses, shiny_multiplier,
    experience_bonuses, featured_wine_types, featured_regions
) VALUES
-- Spring 2024
('Spring', 2024, '2024-03-20'::TIMESTAMP WITH TIME ZONE, '2024-06-19'::TIMESTAMP WITH TIME ZONE,
 '{"Vintage": 1.2, "Estate": 1.1}',
 '{"Flow": 1.15, "Varietal": 1.1}',
 '{"Loire Valley": 1.2, "Marlborough": 1.15}',
 1.1000,
 '{"tasting": 1.1, "collecting": 1.05}',
 ARRAY['Flow', 'Varietal'],
 ARRAY['Loire Valley', 'Marlborough', 'Mosel']),

-- Summer 2024
('Summer', 2024, '2024-06-20'::TIMESTAMP WITH TIME ZONE, '2024-09-19'::TIMESTAMP WITH TIME ZONE,
 '{"Regional": 1.15, "Quality": 1.1}',
 '{"Flow": 1.2, "Modern": 1.1}',
 '{"Provence": 1.25, "Sicily": 1.2}',
 1.0500,
 '{"social": 1.2, "trading": 1.15}',
 ARRAY['Flow', 'Energy'],
 ARRAY['Provence', 'Sicily', 'Mendoza']);

-- ============================================================================
-- SAMPLE GAME EVENTS
-- ============================================================================

INSERT INTO game_events (
    name, slug, description, event_type, start_date, end_date,
    experience_multipliers, rare_find_multiplier, exclusive_wine_spawns,
    boosted_wine_types, has_global_goal, global_goal_description, global_goal_target,
    status
) VALUES
('Harvest Festival 2024', 'harvest-festival-2024',
 'Celebrate the harvest season with special wine discoveries and community challenges!',
 'Seasonal',
 '2024-09-15 00:00:00+00', '2024-10-15 23:59:59+00',
 '{"collecting": 2.0, "tasting": 1.5, "social": 1.5}',
 1.5000, TRUE,
 ARRAY['Heritage', 'Terroir'],
 TRUE, 'Discover 100,000 wines collectively during harvest season', 100000,
 'Active'),

('Master Sommelier Challenge', 'master-sommelier-challenge',
 'Test your wine knowledge and tasting skills in this elite competition.',
 'Educational',
 '2024-11-01 00:00:00+00', '2024-11-30 23:59:59+00',
 '{"education": 3.0, "competition": 2.0}',
 1.0000, FALSE,
 ARRAY['Mystical'],
 FALSE, NULL, NULL,
 'Upcoming');

-- ============================================================================
-- SAMPLE EVENT CHALLENGES
-- ============================================================================

INSERT INTO event_challenges (
    event_id, name, description, challenge_type, difficulty,
    objectives, completion_rewards
)
SELECT 
    ge.id,
    'Harvest Collection',
    'Discover 10 different Heritage or Terroir type wines during the festival',
    'Collection',
    'Intermediate',
    '[{"description": "Collect Heritage wines", "target": 5, "metric": "wine_count_heritage"}, {"description": "Collect Terroir wines", "target": 5, "metric": "wine_count_terroir"}]',
    '{"experience": {"collecting": 5000, "tasting": 2000}, "badges": ["harvest_collector"], "items": ["VintageSeal"]}'
FROM game_events ge
WHERE ge.slug = 'harvest-festival-2024';

-- ============================================================================
-- SAMPLE USER REPUTATION DATA
-- ============================================================================

INSERT INTO user_reputation (user_id, trust_rating, total_trades, successful_trades, average_rating)
SELECT 
    id,
    CASE 
        WHEN username = 'wine_trader' THEN 85.50
        WHEN username = 'wine_collector' THEN 92.75
        WHEN username = 'master_sommelier' THEN 98.25
        ELSE 75.00
    END,
    CASE 
        WHEN username = 'wine_trader' THEN 45
        WHEN username = 'wine_collector' THEN 23
        WHEN username = 'master_sommelier' THEN 12
        ELSE 3
    END,
    CASE 
        WHEN username = 'wine_trader' THEN 43
        WHEN username = 'wine_collector' THEN 23
        WHEN username = 'master_sommelier' THEN 12
        ELSE 3
    END,
    CASE 
        WHEN username = 'wine_trader' THEN 4.2
        WHEN username = 'wine_collector' THEN 4.8
        WHEN username = 'master_sommelier' THEN 4.9
        ELSE 4.0
    END
FROM users
WHERE username IN ('wine_trader', 'wine_collector', 'master_sommelier', 'admin', 'wine_newbie');

-- ============================================================================
-- SAMPLE WINE MARKET DATA
-- ============================================================================

INSERT INTO wine_market_data (
    species_id, date_recorded, average_price, median_price, trades_count, 
    price_trend, investment_rating
)
SELECT 
    ws.id,
    CURRENT_DATE - (generate_series(1, 30) || ' days')::INTERVAL,
    CASE ws.rarity_base
        WHEN 'Everyday' THEN 15 + random() * 10
        WHEN 'Quality' THEN 25 + random() * 15
        WHEN 'Estate' THEN 45 + random() * 25
        WHEN 'GrandCru' THEN 85 + random() * 50
        WHEN 'InvestmentGrade' THEN 250 + random() * 200
        WHEN 'OnceInLifetime' THEN 1500 + random() * 1000
        ELSE 35 + random() * 25
    END,
    CASE ws.rarity_base
        WHEN 'Everyday' THEN 12 + random() * 8
        WHEN 'Quality' THEN 22 + random() * 12
        WHEN 'Estate' THEN 40 + random() * 20
        WHEN 'GrandCru' THEN 75 + random() * 40
        WHEN 'InvestmentGrade' THEN 220 + random() * 180
        WHEN 'OnceInLifetime' THEN 1200 + random() * 800
        ELSE 30 + random() * 20
    END,
    CASE 
        WHEN random() < 0.7 THEN floor(random() * 5) + 1
        ELSE 0
    END,
    CASE 
        WHEN random() < 0.4 THEN 'Rising'
        WHEN random() < 0.8 THEN 'Stable'
        ELSE 'Falling'
    END,
    CASE ws.rarity_base
        WHEN 'OnceInLifetime', 'TimeCapsule' THEN 'Outstanding'
        WHEN 'InvestmentGrade', 'MuseumPiece' THEN 'Excellent'
        WHEN 'GrandCru', 'CriticsChoice' THEN 'Good'
        WHEN 'Estate', 'Reserve' THEN 'Fair'
        ELSE 'Poor'
    END
FROM wine_species ws
CROSS JOIN generate_series(1, 30);

-- ============================================================================
-- UPDATE STATISTICS AND REFRESH VIEWS
-- ============================================================================

-- Update user statistics based on seed data
INSERT INTO user_statistics (
    user_id, total_wines, unique_wines, badges_earned,
    global_rank, favorite_wine_type
)
SELECT 
    u.id,
    0, -- Will be updated when wines are added
    0,
    CASE 
        WHEN u.level > 50 THEN 8
        WHEN u.level > 30 THEN 5
        WHEN u.level > 10 THEN 3
        ELSE 1
    END,
    row_number() OVER (ORDER BY u.total_experience DESC),
    CASE 
        WHEN u.username = 'master_sommelier' THEN 'Heritage'
        WHEN u.username = 'wine_collector' THEN 'Mystical'
        WHEN u.username = 'wine_trader' THEN 'Modern'
        ELSE 'Varietal'
    END
FROM users u;

-- Initialize materialized view data (will be empty initially)
REFRESH MATERIALIZED VIEW user_collection_summary;
REFRESH MATERIALIZED VIEW wine_species_analytics;  
REFRESH MATERIALIZED VIEW guild_analytics;
REFRESH MATERIALIZED VIEW regional_wine_analytics;

-- ============================================================================
-- FINAL STATISTICS AND VERIFICATION
-- ============================================================================

-- Display seed data statistics
DO $$
DECLARE
    species_count INTEGER;
    user_count INTEGER;
    guild_count INTEGER;
    region_count INTEGER;
    event_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO species_count FROM wine_species;
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO guild_count FROM guilds;
    SELECT COUNT(*) INTO region_count FROM professional_wine_regions;
    SELECT COUNT(*) INTO event_count FROM game_events;
    
    RAISE NOTICE 'Seed data created successfully:';
    RAISE NOTICE '- Wine Species: %', species_count;
    RAISE NOTICE '- Users: %', user_count;
    RAISE NOTICE '- Guilds: %', guild_count;
    RAISE NOTICE '- Wine Regions: %', region_count;
    RAISE NOTICE '- Active Events: %', event_count;
END $$;

-- ============================================================================
-- COMMENTS ON SEED DATA
-- ============================================================================

COMMENT ON TABLE wine_species IS 'Seeded with 15 diverse wine species representing all 8 wine types and various rarity levels';
COMMENT ON TABLE users IS 'Seeded with 5 test users representing different user personas and experience levels';
COMMENT ON TABLE guilds IS 'Seeded with 4 different guild types showcasing various focus areas and membership structures';
COMMENT ON TABLE professional_wine_regions IS 'Seeded with 5 major wine regions covering different countries and classification systems';
COMMENT ON TABLE game_events IS 'Seeded with seasonal and educational events to demonstrate the event system';