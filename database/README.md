# Wine Pokédex Database Schema

This directory contains the PostgreSQL database schema and migration files for the Wine Pokédex application. The schema is designed to support a complete Pokemon-inspired wine collection system with advanced features for social interaction, trading, and wine education.

## Schema Overview

### Core Components

1. **Wine System** - Pokemon-style wine classification with stats, types, and rarity
2. **User Management** - User accounts, authentication, and permissions
3. **Collection System** - Personal wine collections with progress tracking
4. **Social Features** - Trading, guilds, competitions, and battles
5. **Evolution & Breeding** - Wine evolution chains and blending mechanics
6. **WSET Integration** - Professional wine tasting and education data
7. **Event System** - Seasonal events and challenges

### Design Principles

- **Scalability**: Designed for millions of wines and thousands of concurrent users
- **Performance**: Optimized indexes for fast queries and search
- **Integrity**: Strong referential integrity and data validation
- **Flexibility**: Support for future feature expansion
- **Type Safety**: Aligned with TypeScript type definitions

## Migration Files

Migrations are numbered and should be run in order:

1. `001_core_enums_and_types.sql` - Base enums and custom types
2. `002_users_and_auth.sql` - User management and authentication
3. `003_wine_core_system.sql` - Core wine tables and attributes
4. `004_stats_and_abilities.sql` - Pokemon-style stats system
5. `005_evolution_system.sql` - Wine evolution and breeding
6. `006_collections.sql` - User collections and progress
7. `007_social_features.sql` - Trading, guilds, competitions
8. `008_wset_integration.sql` - Professional wine data
9. `009_events_and_seasons.sql` - Event and seasonal content
10. `010_performance_indexes.sql` - Performance optimization indexes
11. `011_triggers_and_functions.sql` - Database functions and triggers
12. `012_constraints_and_validation.sql` - Data validation rules

## Key Features

### Pokemon-Style Stats System
- Individual Values (IVs) 0-31 for each stat
- Effort Values (EVs) 0-252 per stat, 510 total
- Base stats unique to each wine type
- Wine natures that affect stat growth
- Calculated final stats based on level and modifiers

### Type Effectiveness
- 8 wine types with strategic interactions
- Type effectiveness multipliers for battles and competitions
- Dual-type wines from breeding

### Rarity System
- 20+ rarity tiers from "Everyday" to "TimeCapsule"
- Spawn rates and discovery mechanics
- Shiny variants and special forms

### Social Features
- Direct trading between users
- Market and auction systems
- Guild management and events
- Competitive tournaments and rankings

### Performance Optimization
- Partitioned tables for large datasets
- Optimized indexes for common queries
- Materialized views for complex aggregations
- Full-text search capabilities

## Usage

1. Create a PostgreSQL database
2. Run migrations in order using your preferred migration tool
3. Populate with seed data (see `seed/` directory)
4. Configure indexes based on your query patterns

## Database Size Estimates

Based on expected usage:
- **Wines**: ~10M records (8-12 GB)
- **Users**: ~100K active users (200 MB)
- **Collections**: ~50M collection entries (15-20 GB)
- **Trades**: ~1M trades per year (2-3 GB)
- **Total**: ~25-35 GB for production dataset

## Monitoring and Maintenance

Key metrics to monitor:
- Query performance on wine searches
- Index usage and efficiency
- Collection query patterns
- Trading system load
- Seasonal event participation

Regular maintenance:
- Vacuum and analyze statistics
- Monitor slow query log
- Update materialized views
- Archive old event data