-- ============================================================================
-- Wine Pokédx Database Setup Script
-- ============================================================================
-- 
-- This script sets up the complete Wine Pokédx database schema.
-- Run this script on a fresh PostgreSQL database (version 13+).
--
-- Prerequisites:
-- - PostgreSQL 13 or higher
-- - Extensions: uuid-ossp, pg_trgm (for full-text search)
-- - Sufficient disk space (estimated 50GB+ for production)
-- - Memory: 8GB+ RAM recommended for optimal performance
--
-- Usage:
--   psql -d your_database_name -f setup.sql
--
-- ============================================================================

\set ON_ERROR_STOP on

-- Display setup information
\echo '============================================================================'
\echo 'Wine Pokédx Database Setup'
\echo 'Setting up complete database schema with Pokemon-inspired wine collection'
\echo '============================================================================'

-- Check PostgreSQL version
DO $$
BEGIN
    IF current_setting('server_version_num')::int < 130000 THEN
        RAISE EXCEPTION 'PostgreSQL version 13 or higher is required. Current version: %', 
                        current_setting('server_version');
    END IF;
    RAISE NOTICE 'PostgreSQL version check passed: %', current_setting('server_version');
END $$;

-- Set session parameters for optimal setup
SET maintenance_work_mem = '1GB';
SET max_parallel_workers = 8;
SET max_parallel_maintenance_workers = 4;

-- ============================================================================
-- MIGRATION EXECUTION
-- ============================================================================

\echo 'Starting database migrations...'

-- Migration 001: Core Enums and Types
\echo 'Running migration 001: Core enums and types...'
\i migrations/001_core_enums_and_types.sql

-- Migration 002: Users and Authentication
\echo 'Running migration 002: Users and authentication...'
\i migrations/002_users_and_auth.sql

-- Migration 003: Core Wine System
\echo 'Running migration 003: Core wine system...'
\i migrations/003_wine_core_system.sql

-- Migration 004: Evolution and Breeding
\echo 'Running migration 004: Evolution and breeding system...'
\i migrations/004_evolution_and_breeding.sql

-- Migration 005: Social Features
\echo 'Running migration 005: Social features...'
\i migrations/005_social_features.sql

-- Migration 006: WSET Integration
\echo 'Running migration 006: WSET integration...'
\i migrations/006_wset_integration.sql

-- Migration 007: Events and Seasons
\echo 'Running migration 007: Events and seasons...'
\i migrations/007_events_and_seasons.sql

-- Migration 008: Performance Optimization
\echo 'Running migration 008: Performance optimization...'
\i migrations/008_performance_optimization.sql

-- Migration 009: Seed Data
\echo 'Running migration 009: Seed data...'
\i migrations/009_seed_data.sql

-- ============================================================================
-- POST-SETUP VERIFICATION
-- ============================================================================

\echo 'Verifying database setup...'

-- Verify all tables exist
DO $$
DECLARE
    expected_tables TEXT[] := ARRAY[
        'users', 'wines', 'wine_species', 'guilds', 'wine_trades',
        'wset_courses', 'game_events', 'wine_tasting_notes',
        'evolution_chains', 'breeding_attempts', 'competitions',
        'professional_wine_regions', 'grape_variety_profiles'
    ];
    table_name TEXT;
    missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE 'All core tables created successfully';
    END IF;
END $$;

-- Verify materialized views
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'user_collection_summary') THEN
        RAISE EXCEPTION 'Materialized views not created properly';
    END IF;
    RAISE NOTICE 'Materialized views created successfully';
END $$;

-- Check seed data
DO $$
DECLARE
    species_count INTEGER;
    user_count INTEGER;
    guild_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO species_count FROM wine_species;
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO guild_count FROM guilds;
    
    IF species_count = 0 OR user_count = 0 OR guild_count = 0 THEN
        RAISE WARNING 'Seed data may not have loaded properly';
    ELSE
        RAISE NOTICE 'Seed data loaded: % species, % users, % guilds', 
                     species_count, user_count, guild_count;
    END IF;
END $$;

-- ============================================================================
-- PERFORMANCE SETTINGS RECOMMENDATIONS
-- ============================================================================

\echo 'Performance configuration recommendations:'

-- Display current settings
SELECT 
    name,
    setting,
    unit,
    short_desc
FROM pg_settings 
WHERE name IN (
    'shared_buffers',
    'effective_cache_size', 
    'maintenance_work_mem',
    'work_mem',
    'max_connections',
    'random_page_cost'
)
ORDER BY name;

-- Provide recommendations
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'PERFORMANCE RECOMMENDATIONS:';
    RAISE NOTICE '========================';
    RAISE NOTICE '1. shared_buffers: 25%% of total RAM';
    RAISE NOTICE '2. effective_cache_size: 75%% of total RAM';
    RAISE NOTICE '3. work_mem: 64MB for wine search queries';
    RAISE NOTICE '4. maintenance_work_mem: 1GB for index operations';
    RAISE NOTICE '5. max_connections: 100-200 for typical web app';
    RAISE NOTICE '6. random_page_cost: 1.1 for SSD storage';
    RAISE NOTICE '';
    RAISE NOTICE 'Add these to postgresql.conf and restart PostgreSQL';
END $$;

-- ============================================================================
-- MAINTENANCE PROCEDURES
-- ============================================================================

\echo 'Setting up maintenance procedures...'

-- Create maintenance schema
CREATE SCHEMA IF NOT EXISTS maintenance;

-- Function to perform regular maintenance
CREATE OR REPLACE FUNCTION maintenance.daily_maintenance()
RETURNS TABLE(task TEXT, result TEXT, duration INTERVAL) AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
BEGIN
    -- Refresh materialized views
    start_time := clock_timestamp();
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_collection_summary;
    end_time := clock_timestamp();
    RETURN QUERY SELECT 'Refresh user_collection_summary'::TEXT, 'Success'::TEXT, (end_time - start_time);
    
    start_time := clock_timestamp();
    REFRESH MATERIALIZED VIEW CONCURRENTLY wine_species_analytics;
    end_time := clock_timestamp();
    RETURN QUERY SELECT 'Refresh wine_species_analytics'::TEXT, 'Success'::TEXT, (end_time - start_time);
    
    -- Update event statuses
    start_time := clock_timestamp();
    PERFORM update_event_statuses();
    end_time := clock_timestamp();
    RETURN QUERY SELECT 'Update event statuses'::TEXT, 'Success'::TEXT, (end_time - start_time);
    
    -- Analyze tables with high activity
    start_time := clock_timestamp();
    ANALYZE wines, wine_trades, user_activity_log;
    end_time := clock_timestamp();
    RETURN QUERY SELECT 'Analyze high-activity tables'::TEXT, 'Success'::TEXT, (end_time - start_time);
    
END;
$$ LANGUAGE plpgsql;

-- Create backup function
CREATE OR REPLACE FUNCTION maintenance.create_backup(backup_name TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    final_backup_name TEXT;
    backup_command TEXT;
BEGIN
    final_backup_name := COALESCE(backup_name, 'wine_pokedex_' || to_char(NOW(), 'YYYY_MM_DD_HH24_MI_SS'));
    
    -- This would need to be run from shell, not SQL
    RAISE NOTICE 'To create backup, run this command from shell:';
    RAISE NOTICE 'pg_dump -Fc -f %.backup %', final_backup_name, current_database();
    
    RETURN final_backup_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USAGE EXAMPLES AND DOCUMENTATION
-- ============================================================================

\echo 'Creating usage examples...'

-- Sample queries documentation
CREATE OR REPLACE FUNCTION maintenance.show_sample_queries()
RETURNS VOID AS $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'SAMPLE QUERIES:';
    RAISE NOTICE '===============';
    RAISE NOTICE '';
    RAISE NOTICE '-- Find all Terroir wines in a user collection:';
    RAISE NOTICE 'SELECT w.name, ws.name as species, w.year, w.current_value';
    RAISE NOTICE 'FROM wines w';
    RAISE NOTICE 'JOIN wine_species ws ON w.species_id = ws.id';
    RAISE NOTICE 'WHERE w.owner_id = $1 AND ws.primary_type = ''Terroir'';';
    RAISE NOTICE '';
    RAISE NOTICE '-- Get user collection summary:';
    RAISE NOTICE 'SELECT * FROM user_collection_summary WHERE user_id = $1;';
    RAISE NOTICE '';
    RAISE NOTICE '-- Search wines by text:';
    RAISE NOTICE 'SELECT * FROM search_wines($1, NULL, NULL, NULL, NULL, NULL, NULL, 20, 0);';
    RAISE NOTICE '';
    RAISE NOTICE '-- Get wine market trends:';
    RAISE NOTICE 'SELECT * FROM get_wine_market_trends($species_id, 30);';
    RAISE NOTICE '';
    RAISE NOTICE '-- Find active events:';
    RAISE NOTICE 'SELECT name, description, start_date, end_date';
    RAISE NOTICE 'FROM game_events WHERE status = ''Active'';';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SECURITY SETUP
-- ============================================================================

\echo 'Setting up security...'

-- Create application roles
DO $$
BEGIN
    -- Application read-write role
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'wine_pokedex_app') THEN
        CREATE ROLE wine_pokedex_app WITH LOGIN;
        RAISE NOTICE 'Created role: wine_pokedex_app';
    END IF;
    
    -- Read-only role for analytics
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'wine_pokedex_readonly') THEN
        CREATE ROLE wine_pokedex_readonly WITH LOGIN;
        RAISE NOTICE 'Created role: wine_pokedex_readonly';
    END IF;
    
    -- Background jobs role
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'wine_pokedex_jobs') THEN
        CREATE ROLE wine_pokedex_jobs WITH LOGIN;
        RAISE NOTICE 'Created role: wine_pokedex_jobs';
    END IF;
END $$;

-- Grant appropriate permissions
GRANT CONNECT ON DATABASE current_database() TO wine_pokedex_app, wine_pokedex_readonly, wine_pokedex_jobs;
GRANT USAGE ON SCHEMA public TO wine_pokedex_app, wine_pokedex_readonly, wine_pokedex_jobs;

-- Application role permissions (full access)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO wine_pokedex_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO wine_pokedex_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO wine_pokedex_app;

-- Read-only role permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO wine_pokedex_readonly;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO wine_pokedex_readonly;

-- Jobs role permissions (limited write access)
GRANT SELECT, INSERT, UPDATE ON user_activity_log, wine_market_data, seasonal_modifiers TO wine_pokedex_jobs;
GRANT EXECUTE ON FUNCTION update_event_statuses(), refresh_all_analytics() TO wine_pokedex_jobs;

-- Set default permissions for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO wine_pokedex_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO wine_pokedex_readonly;

-- ============================================================================
-- FINAL SETUP COMPLETION
-- ============================================================================

-- Reset session parameters
RESET maintenance_work_mem;
RESET max_parallel_workers;
RESET max_parallel_maintenance_workers;

-- Display final statistics
DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    function_count INTEGER;
    view_count INTEGER;
    total_size TEXT;
BEGIN
    SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_schema = 'public';
    SELECT COUNT(*) INTO index_count FROM pg_indexes WHERE schemaname = 'public';
    SELECT COUNT(*) INTO function_count FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public';
    SELECT COUNT(*) INTO view_count FROM pg_views WHERE schemaname = 'public';
    SELECT pg_size_pretty(pg_database_size(current_database())) INTO total_size;
    
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'WINE POKÉDX DATABASE SETUP COMPLETED SUCCESSFULLY';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Indexes created: %', index_count;
    RAISE NOTICE 'Functions created: %', function_count;
    RAISE NOTICE 'Views created: %', view_count;
    RAISE NOTICE 'Database size: %', total_size;
    RAISE NOTICE '';
    RAISE NOTICE 'Application roles created:';
    RAISE NOTICE '  - wine_pokedex_app (full access)';
    RAISE NOTICE '  - wine_pokedex_readonly (read-only)'; 
    RAISE NOTICE '  - wine_pokedex_jobs (maintenance)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Set passwords for application roles';
    RAISE NOTICE '2. Configure connection pooling';
    RAISE NOTICE '3. Set up monitoring and alerting';
    RAISE NOTICE '4. Schedule maintenance.daily_maintenance() to run nightly';
    RAISE NOTICE '5. Configure automatic backups';
    RAISE NOTICE '';
    RAISE NOTICE 'For sample queries, run: SELECT maintenance.show_sample_queries();';
    RAISE NOTICE '============================================================================';
END $$;