-- ============================================================================
-- Wine Pokédx Database Migration 008: Performance Optimization
-- ============================================================================

-- ============================================================================
-- MATERIALIZED VIEWS FOR COMPLEX QUERIES
-- ============================================================================

-- User collection summary with aggregated statistics
CREATE MATERIALIZED VIEW user_collection_summary AS
SELECT 
    u.id as user_id,
    u.username,
    u.level as user_level,
    u.tier as user_tier,
    
    -- Collection counts
    COUNT(w.id) as total_wines,
    COUNT(DISTINCT w.species_id) as unique_species,
    COUNT(CASE WHEN w.is_shiny THEN 1 END) as shiny_count,
    COUNT(CASE WHEN w.is_perfect_iv THEN 1 END) as perfect_iv_count,
    
    -- Type distribution
    COUNT(CASE WHEN ws.primary_type = 'Terroir' THEN 1 END) as terroir_count,
    COUNT(CASE WHEN ws.primary_type = 'Varietal' THEN 1 END) as varietal_count,
    COUNT(CASE WHEN ws.primary_type = 'Technique' THEN 1 END) as technique_count,
    COUNT(CASE WHEN ws.primary_type = 'Heritage' THEN 1 END) as heritage_count,
    COUNT(CASE WHEN ws.primary_type = 'Modern' THEN 1 END) as modern_count,
    COUNT(CASE WHEN ws.primary_type = 'Mystical' THEN 1 END) as mystical_count,
    COUNT(CASE WHEN ws.primary_type = 'Energy' THEN 1 END) as energy_count,
    COUNT(CASE WHEN ws.primary_type = 'Flow' THEN 1 END) as flow_count,
    
    -- Rarity distribution
    COUNT(CASE WHEN get_rarity_tier(ws.rarity_base) = 'Common' THEN 1 END) as common_count,
    COUNT(CASE WHEN get_rarity_tier(ws.rarity_base) = 'Uncommon' THEN 1 END) as uncommon_count,
    COUNT(CASE WHEN get_rarity_tier(ws.rarity_base) = 'Rare' THEN 1 END) as rare_count,
    COUNT(CASE WHEN get_rarity_tier(ws.rarity_base) = 'Epic' THEN 1 END) as epic_count,
    COUNT(CASE WHEN get_rarity_tier(ws.rarity_base) = 'Legendary' THEN 1 END) as legendary_count,
    COUNT(CASE WHEN get_rarity_tier(ws.rarity_base) = 'Mythical' THEN 1 END) as mythical_count,
    COUNT(CASE WHEN get_rarity_tier(ws.rarity_base) = 'Divine' THEN 1 END) as divine_count,
    
    -- Value statistics
    COALESCE(AVG(w.current_value), 0) as average_wine_value,
    COALESCE(SUM(w.current_value), 0) as total_collection_value,
    COALESCE(MAX(w.current_value), 0) as most_valuable_wine_value,
    
    -- Temporal statistics
    MIN(w.captured_at) as first_capture_date,
    MAX(w.captured_at) as last_capture_date,
    
    -- Activity metrics
    COUNT(CASE WHEN w.captured_at > NOW() - INTERVAL '30 days' THEN 1 END) as wines_added_last_30d,
    COUNT(CASE WHEN w.captured_at > NOW() - INTERVAL '7 days' THEN 1 END) as wines_added_last_7d,
    
    -- Completion metrics
    ROUND(
        (COUNT(DISTINCT w.species_id)::DECIMAL / 
         NULLIF((SELECT COUNT(*) FROM wine_species WHERE is_discovered = TRUE), 0)) * 100, 
        2
    ) as collection_completion_percentage

FROM users u
LEFT JOIN wines w ON u.id = w.owner_id
LEFT JOIN wine_species ws ON w.species_id = ws.id
WHERE u.is_active = TRUE
GROUP BY u.id, u.username, u.level, u.tier;

-- Wine species popularity and market data
CREATE MATERIALIZED VIEW wine_species_analytics AS
SELECT 
    ws.id as species_id,
    ws.name as species_name,
    ws.primary_type,
    ws.secondary_type,
    ws.rarity_base,
    get_rarity_tier(ws.rarity_base) as rarity_tier,
    
    -- Ownership statistics
    COUNT(w.id) as total_owned,
    COUNT(DISTINCT w.owner_id) as unique_owners,
    ROUND(
        (COUNT(DISTINCT w.owner_id)::DECIMAL / 
         NULLIF((SELECT COUNT(*) FROM users WHERE is_active = TRUE), 0)) * 100, 
        2
    ) as ownership_percentage,
    
    -- Shiny statistics
    COUNT(CASE WHEN w.is_shiny THEN 1 END) as shiny_count,
    ROUND(
        (COUNT(CASE WHEN w.is_shiny THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(w.id), 0)) * 100, 
        4
    ) as shiny_rate,
    
    -- Value statistics
    COALESCE(AVG(w.current_value), 0) as average_value,
    COALESCE(MIN(w.current_value), 0) as min_value,
    COALESCE(MAX(w.current_value), 0) as max_value,
    COALESCE(STDDEV(w.current_value), 0) as value_volatility,
    
    -- Trading activity
    COALESCE(trading_stats.total_trades, 0) as total_trades,
    COALESCE(trading_stats.average_trade_price, 0) as average_trade_price,
    
    -- Recent activity
    COUNT(CASE WHEN w.captured_at > NOW() - INTERVAL '30 days' THEN 1 END) as captured_last_30d,
    COUNT(CASE WHEN w.captured_at > NOW() - INTERVAL '7 days' THEN 1 END) as captured_last_7d,
    
    -- Tasting activity
    COALESCE(tasting_stats.total_tastings, 0) as total_tastings,
    COALESCE(tasting_stats.average_rating, 0) as average_tasting_rating

FROM wine_species ws
LEFT JOIN wines w ON ws.id = w.species_id
LEFT JOIN (
    -- Subquery for trading statistics
    SELECT 
        ws_inner.id as species_id,
        COUNT(wt.id) as total_trades,
        AVG(wt.market_price) as average_trade_price
    FROM wine_species ws_inner
    JOIN wines w_inner ON ws_inner.id = w_inner.species_id
    JOIN unnest(ARRAY[]::UUID[]) WITH ORDINALITY AS offered(wine_id, ord) ON w_inner.id = offered.wine_id
    JOIN wine_trades wt ON offered.wine_id = ANY(wt.offered_wines)
    WHERE wt.status = 'Completed'
    GROUP BY ws_inner.id
) trading_stats ON ws.id = trading_stats.species_id
LEFT JOIN (
    -- Subquery for tasting statistics
    SELECT 
        ws_inner.id as species_id,
        COUNT(wtn.id) as total_tastings,
        AVG(wtn.overall_score) as average_rating
    FROM wine_species ws_inner
    JOIN wines w_inner ON ws_inner.id = w_inner.species_id
    JOIN wine_tasting_notes wtn ON w_inner.id = wtn.wine_id
    GROUP BY ws_inner.id
) tasting_stats ON ws.id = tasting_stats.species_id
WHERE ws.is_discovered = TRUE
GROUP BY 
    ws.id, ws.name, ws.primary_type, ws.secondary_type, ws.rarity_base,
    trading_stats.total_trades, trading_stats.average_trade_price,
    tasting_stats.total_tastings, tasting_stats.average_rating;

-- Guild activity and performance metrics
CREATE MATERIALIZED VIEW guild_analytics AS
SELECT 
    g.id as guild_id,
    g.name as guild_name,
    g.guild_type,
    g.member_count,
    g.is_recruiting,
    
    -- Activity metrics
    COUNT(DISTINCT gm.user_id) as active_members,
    ROUND(
        (COUNT(DISTINCT gm.user_id)::DECIMAL / NULLIF(g.member_count, 0)) * 100, 
        2
    ) as activity_rate,
    
    -- Experience and contributions
    COALESCE(SUM(gm.total_experience_contributed), 0) as total_guild_experience,
    COALESCE(AVG(gm.total_experience_contributed), 0) as avg_member_contribution,
    
    -- Event statistics
    COUNT(DISTINCT ge.id) as total_events_organized,
    COUNT(CASE WHEN ge.start_date > NOW() - INTERVAL '30 days' THEN 1 END) as events_last_30d,
    COALESCE(AVG(ge.attendance_count), 0) as average_event_attendance,
    
    -- Competition performance
    g.tournaments_won,
    g.current_season_wins,
    g.current_season_losses,
    CASE 
        WHEN (g.current_season_wins + g.current_season_losses) > 0 
        THEN ROUND((g.current_season_wins::DECIMAL / (g.current_season_wins + g.current_season_losses)) * 100, 2)
        ELSE 0 
    END as current_season_win_rate,
    
    -- Social metrics
    COUNT(DISTINCT ut.id) FILTER (WHERE ut.created_at > NOW() - INTERVAL '30 days') as trades_by_members_30d,
    
    -- Growth metrics
    COUNT(CASE WHEN gm.joined_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_members_30d,
    COUNT(CASE WHEN gm.joined_at > NOW() - INTERVAL '7 days' THEN 1 END) as new_members_7d

FROM guilds g
LEFT JOIN guild_memberships gm ON g.id = gm.guild_id AND gm.status = 'active'
LEFT JOIN guild_events ge ON g.id = ge.guild_id
LEFT JOIN wine_trades ut ON (ut.initiator_id = gm.user_id OR ut.participant_id = gm.user_id) 
    AND ut.status = 'Completed'
WHERE g.is_active = TRUE
GROUP BY 
    g.id, g.name, g.guild_type, g.member_count, g.is_recruiting,
    g.tournaments_won, g.current_season_wins, g.current_season_losses;

-- Regional wine distribution and trends
CREATE MATERIALIZED VIEW regional_wine_analytics AS
SELECT 
    pwr.region_name,
    pwr.country,
    pwr.classification_level,
    
    -- Wine count statistics
    COUNT(w.id) as total_wines_in_collections,
    COUNT(DISTINCT w.species_id) as unique_species_collected,
    COUNT(DISTINCT w.owner_id) as collectors_count,
    
    -- Rarity distribution
    COUNT(CASE WHEN get_rarity_tier(ws.rarity_base) = 'Common' THEN 1 END) as common_wines,
    COUNT(CASE WHEN get_rarity_tier(ws.rarity_base) = 'Uncommon' THEN 1 END) as uncommon_wines,
    COUNT(CASE WHEN get_rarity_tier(ws.rarity_base) = 'Rare' THEN 1 END) as rare_wines,
    COUNT(CASE WHEN get_rarity_tier(ws.rarity_base) >= 'Epic' THEN 1 END) as epic_plus_wines,
    
    -- Value metrics
    COALESCE(AVG(w.current_value), 0) as average_wine_value,
    COALESCE(SUM(w.current_value), 0) as total_regional_value,
    
    -- Market activity
    COALESCE(market_stats.total_trades, 0) as total_trades,
    COALESCE(market_stats.average_trade_price, 0) as average_trade_price,
    
    -- Tasting activity
    COALESCE(tasting_stats.total_tastings, 0) as total_tastings,
    COALESCE(tasting_stats.average_rating, 0) as average_rating,
    
    -- Popularity metrics
    ROUND(
        (COUNT(w.id)::DECIMAL / 
         NULLIF((SELECT COUNT(*) FROM wines), 0)) * 100, 
        4
    ) as market_share_percentage

FROM professional_wine_regions pwr
LEFT JOIN wines w ON w.region = pwr.region_name
LEFT JOIN wine_species ws ON w.species_id = ws.id
LEFT JOIN (
    SELECT 
        w_trade.region,
        COUNT(wt.id) as total_trades,
        AVG(wt.market_price) as average_trade_price
    FROM wines w_trade
    JOIN unnest(ARRAY[]::UUID[]) WITH ORDINALITY AS offered(wine_id, ord) ON w_trade.id = offered.wine_id
    JOIN wine_trades wt ON offered.wine_id = ANY(wt.offered_wines)
    WHERE wt.status = 'Completed'
    GROUP BY w_trade.region
) market_stats ON pwr.region_name = market_stats.region
LEFT JOIN (
    SELECT 
        w_tasting.region,
        COUNT(wtn.id) as total_tastings,
        AVG(wtn.overall_score) as average_rating
    FROM wines w_tasting
    JOIN wine_tasting_notes wtn ON w_tasting.id = wtn.wine_id
    GROUP BY w_tasting.region
) tasting_stats ON pwr.region_name = tasting_stats.region
WHERE pwr.is_active = TRUE
GROUP BY 
    pwr.region_name, pwr.country, pwr.classification_level,
    market_stats.total_trades, market_stats.average_trade_price,
    tasting_stats.total_tastings, tasting_stats.average_rating;

-- ============================================================================
-- PARTITIONING FOR LARGE TABLES
-- ============================================================================

-- Partition user_activity_log by month for better performance
DO $$
BEGIN
    -- Create monthly partitions for the last 24 months and next 12 months
    FOR i IN -24..12 LOOP
        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS user_activity_log_%s PARTITION OF user_activity_log
             FOR VALUES FROM (%L) TO (%L)',
            to_char(CURRENT_DATE + (i || ' months')::INTERVAL, 'YYYY_MM'),
            date_trunc('month', CURRENT_DATE + (i || ' months')::INTERVAL),
            date_trunc('month', CURRENT_DATE + ((i + 1) || ' months')::INTERVAL)
        );
    END LOOP;
END
$$;

-- Create partitioning function for future months
CREATE OR REPLACE FUNCTION create_monthly_activity_partition(target_date DATE)
RETURNS BOOLEAN AS $$
DECLARE
    table_name TEXT;
    start_date DATE;
    end_date DATE;
BEGIN
    start_date := date_trunc('month', target_date);
    end_date := start_date + INTERVAL '1 month';
    table_name := 'user_activity_log_' || to_char(start_date, 'YYYY_MM');
    
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF user_activity_log
         FOR VALUES FROM (%L) TO (%L)',
        table_name, start_date, end_date
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN duplicate_table THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ADVANCED INDEXES FOR COMPLEX QUERIES
-- ============================================================================

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wines_owner_species_captured 
ON wines(owner_id, species_id, captured_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wines_species_shiny_value 
ON wines(species_id, is_shiny, current_value) 
WHERE current_value IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wines_region_year_rarity 
ON wines(region, year, (
    SELECT get_rarity_tier(ws.rarity_base) 
    FROM wine_species ws 
    WHERE ws.id = wines.species_id
));

-- Partial indexes for active data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_users_level_experience 
ON users(level, total_experience) 
WHERE is_active = TRUE AND is_banned = FALSE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_active_trades_type_created 
ON wine_trades(trade_type, created_at) 
WHERE status IN ('Pending', 'Accepted');

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_public_collections_stats 
ON users(collection_visibility, level, total_experience) 
WHERE collection_visibility IN ('Public', 'Guild') AND is_active = TRUE;

-- GIN indexes for array and JSONB columns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wine_species_grape_varieties_gin 
ON wine_species USING GIN(grape_varieties);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wine_species_regions_gin 
ON wine_species USING GIN(typical_regions);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wines_tags_gin 
ON wines USING GIN(tags);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_challenges_objectives_gin 
ON event_challenges USING GIN(objectives);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenge_progress_objectives_gin 
ON challenge_progress USING GIN(objectives_progress);

-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wine_species_search 
ON wine_species USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wines_search 
ON wines USING GIN(to_tsvector('english', 
    COALESCE(name, '') || ' ' || 
    producer || ' ' || 
    region || ' ' ||
    COALESCE(personal_notes, '')
));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guilds_search 
ON guilds USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Expression indexes for calculated values
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wines_drinking_window 
ON wines((
    CASE 
        WHEN year IS NOT NULL THEN 
            (year || '-01-01')::DATE + INTERVAL '5 years'  -- Approximate drinking window
        ELSE NULL 
    END
)) WHERE year IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wines_iv_total 
ON wines((
    (individual_values).power + 
    (individual_values).elegance + 
    (individual_values).complexity + 
    (individual_values).longevity + 
    (individual_values).rarity + 
    (individual_values).terroir
));

-- ============================================================================
-- COVERING INDEXES FOR READ-HEAVY QUERIES
-- ============================================================================

-- Cover common user collection queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_wines_covering 
ON wines(owner_id, is_favorite, is_shiny) 
INCLUDE (species_id, name, year, current_value, captured_at);

-- Cover wine species lookup queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wine_species_covering 
ON wine_species(primary_type, rarity_base) 
INCLUDE (name, secondary_type, description, generation);

-- Cover trade listing queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trade_listings_covering 
ON wine_trades(status, trade_type, created_at) 
INCLUDE (title, market_price, initiator_id)
WHERE status = 'Pending';

-- ============================================================================
-- QUERY OPTIMIZATION FUNCTIONS
-- ============================================================================

-- Function to get user's wine count by rarity efficiently
CREATE OR REPLACE FUNCTION get_user_rarity_counts(target_user_id UUID)
RETURNS TABLE(
    rarity_tier text,
    wine_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        get_rarity_tier(ws.rarity_base)::text,
        COUNT(w.id)
    FROM wines w
    JOIN wine_species ws ON w.species_id = ws.id
    WHERE w.owner_id = target_user_id
    GROUP BY get_rarity_tier(ws.rarity_base);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get wine market trends efficiently
CREATE OR REPLACE FUNCTION get_wine_market_trends(
    target_species_id UUID, 
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
    date_recorded date,
    average_price numeric,
    trade_volume integer,
    price_change_percent numeric
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_data AS (
        SELECT 
            wmd.date_recorded,
            wmd.average_price,
            wmd.trades_count,
            LAG(wmd.average_price) OVER (ORDER BY wmd.date_recorded) as prev_price
        FROM wine_market_data wmd
        WHERE wmd.species_id = target_species_id
        AND wmd.date_recorded >= CURRENT_DATE - days_back
        ORDER BY wmd.date_recorded
    )
    SELECT 
        dd.date_recorded,
        dd.average_price,
        dd.trades_count,
        CASE 
            WHEN dd.prev_price > 0 THEN 
                ROUND(((dd.average_price - dd.prev_price) / dd.prev_price * 100), 2)
            ELSE 0 
        END
    FROM daily_data dd;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function for efficient wine search with filters
CREATE OR REPLACE FUNCTION search_wines(
    search_text TEXT DEFAULT NULL,
    wine_types wine_type[] DEFAULT NULL,
    rarity_tiers rarity_tier[] DEFAULT NULL,
    min_year INTEGER DEFAULT NULL,
    max_year INTEGER DEFAULT NULL,
    regions TEXT[] DEFAULT NULL,
    owner_id UUID DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    wine_id uuid,
    wine_name varchar,
    species_name varchar,
    primary_type wine_type,
    rarity_base wine_rarity,
    year integer,
    region varchar,
    current_value numeric,
    is_shiny boolean
) AS $$
DECLARE
    sql_query TEXT;
    where_clauses TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Build dynamic query based on filters
    sql_query := '
        SELECT w.id, w.name, ws.name, ws.primary_type, ws.rarity_base, 
               w.year, w.region, w.current_value, w.is_shiny
        FROM wines w
        JOIN wine_species ws ON w.species_id = ws.id
    ';
    
    -- Add search conditions
    IF search_text IS NOT NULL THEN
        where_clauses := array_append(where_clauses, 
            'to_tsvector(''english'', COALESCE(w.name, '''') || '' '' || w.producer || '' '' || w.region) @@ plainto_tsquery(''english'', ''' || search_text || ''')');
    END IF;
    
    IF wine_types IS NOT NULL THEN
        where_clauses := array_append(where_clauses, 'ws.primary_type = ANY($1)');
    END IF;
    
    IF rarity_tiers IS NOT NULL THEN
        where_clauses := array_append(where_clauses, 'get_rarity_tier(ws.rarity_base) = ANY($2)');
    END IF;
    
    IF min_year IS NOT NULL THEN
        where_clauses := array_append(where_clauses, 'w.year >= ' || min_year);
    END IF;
    
    IF max_year IS NOT NULL THEN
        where_clauses := array_append(where_clauses, 'w.year <= ' || max_year);
    END IF;
    
    IF regions IS NOT NULL THEN
        where_clauses := array_append(where_clauses, 'w.region = ANY($3)');
    END IF;
    
    IF owner_id IS NOT NULL THEN
        where_clauses := array_append(where_clauses, 'w.owner_id = ''' || owner_id || '''');
    END IF;
    
    -- Add WHERE clause if any conditions exist
    IF array_length(where_clauses, 1) > 0 THEN
        sql_query := sql_query || ' WHERE ' || array_to_string(where_clauses, ' AND ');
    END IF;
    
    -- Add ordering and limits
    sql_query := sql_query || ' ORDER BY w.captured_at DESC LIMIT ' || limit_count || ' OFFSET ' || offset_count;
    
    -- Execute dynamic query
    RETURN QUERY EXECUTE sql_query USING wine_types, rarity_tiers, regions;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- REFRESH FUNCTIONS FOR MATERIALIZED VIEWS
-- ============================================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_analytics()
RETURNS TABLE(view_name text, refresh_time interval) AS $$
DECLARE
    view_record RECORD;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
BEGIN
    FOR view_record IN 
        SELECT schemaname, matviewname 
        FROM pg_matviews 
        WHERE schemaname = 'public'
    LOOP
        start_time := clock_timestamp();
        
        EXECUTE 'REFRESH MATERIALIZED VIEW ' || quote_ident(view_record.matviewname);
        
        end_time := clock_timestamp();
        
        RETURN QUERY SELECT view_record.matviewname::text, (end_time - start_time);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh materialized views concurrently (for production)
CREATE OR REPLACE FUNCTION refresh_analytics_concurrent(view_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    CASE view_name
        WHEN 'user_collection_summary' THEN
            REFRESH MATERIALIZED VIEW CONCURRENTLY user_collection_summary;
        WHEN 'wine_species_analytics' THEN
            REFRESH MATERIALIZED VIEW CONCURRENTLY wine_species_analytics;
        WHEN 'guild_analytics' THEN
            REFRESH MATERIALIZED VIEW CONCURRENTLY guild_analytics;
        WHEN 'regional_wine_analytics' THEN
            REFRESH MATERIALIZED VIEW CONCURRENTLY regional_wine_analytics;
        ELSE
            RAISE EXCEPTION 'Unknown materialized view: %', view_name;
    END CASE;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Failed to refresh %: %', view_name, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UNIQUE INDEXES ON MATERIALIZED VIEWS FOR CONCURRENT REFRESH
-- ============================================================================

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS user_collection_summary_user_id_idx 
ON user_collection_summary(user_id);

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS wine_species_analytics_species_id_idx 
ON wine_species_analytics(species_id);

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS guild_analytics_guild_id_idx 
ON guild_analytics(guild_id);

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS regional_wine_analytics_region_idx 
ON regional_wine_analytics(region_name, country);

-- ============================================================================
-- PERFORMANCE MONITORING VIEWS
-- ============================================================================

-- View to monitor slow queries
CREATE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time / 1000.0 AS total_time_seconds,
    mean_time / 1000.0 AS mean_time_seconds,
    (100.0 * total_time / sum(total_time) OVER()) AS percentage_of_total,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE total_time > 5000  -- Queries taking more than 5 seconds total
ORDER BY total_time DESC;

-- View to monitor table sizes and growth
CREATE VIEW table_sizes AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- View to monitor index usage
CREATE VIEW index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexname::regclass)) AS size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- ============================================================================
-- MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function to analyze all tables
CREATE OR REPLACE FUNCTION analyze_all_tables()
RETURNS INTEGER AS $$
DECLARE
    table_record RECORD;
    analyzed_count INTEGER := 0;
BEGIN
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ANALYZE ' || quote_ident(table_record.schemaname) || '.' || quote_ident(table_record.tablename);
        analyzed_count := analyzed_count + 1;
    END LOOP;
    
    RETURN analyzed_count;
END;
$$ LANGUAGE plpgsql;

-- Function to vacuum analyze all tables
CREATE OR REPLACE FUNCTION maintenance_vacuum_analyze()
RETURNS TABLE(table_name text, action_taken text) AS $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT LIKE '%_pkey'
    LOOP
        EXECUTE 'VACUUM ANALYZE ' || quote_ident(table_record.schemaname) || '.' || quote_ident(table_record.tablename);
        RETURN QUERY SELECT table_record.tablename::text, 'VACUUM ANALYZE completed'::text;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS ON PERFORMANCE OBJECTS
-- ============================================================================

COMMENT ON MATERIALIZED VIEW user_collection_summary IS 'Aggregated user collection statistics for dashboard performance';
COMMENT ON MATERIALIZED VIEW wine_species_analytics IS 'Wine species popularity and market analytics';
COMMENT ON MATERIALIZED VIEW guild_analytics IS 'Guild activity and performance metrics';
COMMENT ON MATERIALIZED VIEW regional_wine_analytics IS 'Regional wine distribution and market trends';

COMMENT ON FUNCTION refresh_all_analytics() IS 'Refresh all materialized views and return timing information';
COMMENT ON FUNCTION search_wines(text, wine_type[], rarity_tier[], integer, integer, text[], uuid, integer, integer) IS 'Optimized wine search with flexible filtering';
COMMENT ON FUNCTION get_user_rarity_counts(uuid) IS 'Efficiently get wine counts by rarity tier for a user';

COMMENT ON VIEW slow_queries IS 'Monitor slow-running queries for performance optimization';
COMMENT ON VIEW table_sizes IS 'Monitor table sizes and growth patterns';
COMMENT ON VIEW index_usage IS 'Monitor index usage patterns and efficiency';