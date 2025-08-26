# Wine Pokédex Database Architecture

## Overview

This document describes the comprehensive PostgreSQL database architecture for the Wine Pokédex application, a Pokemon-inspired wine collection and education platform. The database is designed to support millions of wines, thousands of concurrent users, and complex social interactions while maintaining high performance and data integrity.

## Architecture Principles

### Pokemon-Inspired Design
- **Wine Species**: Master wine definitions similar to Pokemon species
- **Individual Values (IVs)**: 0-31 stats that make each wine unique
- **Effort Values (EVs)**: 0-252 trainable stats gained through activities
- **Types**: 8 strategic wine types with effectiveness interactions
- **Evolution**: Wine aging and improvement through various triggers
- **Breeding**: Creating new wine blends from parent wines
- **Rarity Tiers**: 20+ rarity levels from "Everyday" to "Divine"

### Scalability Design
- **Partitioned Tables**: Large tables partitioned by date for performance
- **Materialized Views**: Pre-computed aggregations for analytics
- **Optimized Indexes**: Covering indexes and partial indexes for common queries
- **Concurrent Operations**: Support for high-concurrency trading and battles

## Schema Components

### 1. Core Wine System

#### Wine Species (`wine_species`)
Master definitions of wine types, similar to Pokemon species.

**Key Fields:**
- `name`, `slug`: Wine identification
- `primary_type`, `secondary_type`: Wine type classification
- `base_stats`: Core stats for this wine type
- `rarity_base`: Base rarity level
- `grape_varieties`, `typical_regions`: Wine characteristics
- `evolution_trigger`, `breeding_group`: Game mechanics

#### Individual Wines (`wines`)
Specific wine instances owned by users, like caught Pokemon.

**Key Fields:**
- `individual_values`: IV stats (0-31) making each wine unique
- `effort_values`: EV stats (0-252) gained through activities
- `nature`: Affects stat growth patterns
- `level`, `experience`: Progression mechanics
- `is_shiny`, `is_perfect_iv`: Special variants
- `capture_method`, `captured_at`: Discovery tracking

### 2. User System

#### Users (`users`)
Core user accounts with progression and authentication.

**Key Features:**
- **Level System**: 1-999 with tier progression (Novice → Master)
- **Experience Types**: Separate XP for different activities
- **WSET Integration**: Professional wine education tracking
- **Social Settings**: Privacy controls and preferences
- **Premium Features**: Subscription tiers and benefits

#### Authentication & Sessions
- Secure session management with refresh tokens
- Device tracking and multi-device support
- Two-factor authentication support
- Password reset and email verification

### 3. Social Features

#### Trading System (`wine_trades`)
Comprehensive trading with multiple formats:
- **Direct Trading**: Player-to-player wine exchanges
- **Market Trading**: Fixed-price listings
- **Auction Trading**: Bidding system with auto-bid
- **Mystery Trading**: Random trade matching

**Advanced Features:**
- Trust ratings and reputation system
- Trade insurance and escrow
- Evolution triggers through trading
- Regional and level restrictions

#### Guild System (`guilds`)
Social organizations for wine enthusiasts:
- **Guild Types**: Regional, Educational, Competition, Trading
- **Shared Resources**: Guild cellars and treasure systems
- **Events**: Organized tastings and competitions
- **Rankings**: Guild vs guild competitions

#### Competition System
Structured competitions with multiple formats:
- **Battle Types**: Blind tasting, pairing, knowledge
- **Tournament Formats**: Single elimination, round robin, Swiss
- **Ranking System**: ELO-style ratings
- **Rewards**: Experience, badges, exclusive wines

### 4. Evolution & Breeding

#### Evolution System
Complex evolution chains with multiple triggers:
- **Time-based**: Natural aging evolution
- **Experience**: XP threshold evolutions
- **Item-based**: Special evolution stones
- **Context**: Season, location, competition victories
- **Social**: Trading and guild achievements

#### Breeding System
Create new wine blends through breeding:
- **Compatibility Matrix**: Which wines can breed together
- **Facilities**: Different breeding locations with bonuses
- **Inheritance**: Stats and abilities passed to offspring
- **Mutations**: Rare variants and shiny odds

### 5. WSET Integration

#### Professional Education
Integration with Wine & Spirit Education Trust:
- **Course Tracking**: Progress through WSET levels
- **Systematic Tasting**: Official WSET tasting grids
- **Certification Management**: Track professional credentials
- **Educational Content**: Wine region and grape variety databases

#### Professional Data
- **Wine Regions**: Comprehensive regional information
- **Grape Varieties**: Detailed varietal profiles
- **Tasting Templates**: WSET-standard evaluation forms

### 6. Event System

#### Seasonal Content
Dynamic seasonal modifiers affecting gameplay:
- **Spawn Rate Changes**: Seasonal wine availability
- **Experience Bonuses**: Activity-specific multipliers
- **Featured Content**: Highlighted wines and regions
- **Weather Effects**: Environmental gameplay impacts

#### Global Events
Time-limited events with community goals:
- **Event Types**: Seasonal, educational, community challenges
- **Challenge System**: Individual and group objectives
- **Leaderboards**: Competitive rankings
- **Exclusive Rewards**: Event-only wines and items

## Performance Optimization

### Indexing Strategy

#### Primary Indexes
- **B-tree Indexes**: Standard lookups and range queries
- **Partial Indexes**: Active/available data only
- **Composite Indexes**: Multi-column query patterns
- **Covering Indexes**: Include frequently accessed columns

#### Advanced Indexes
- **GIN Indexes**: Array columns (wine tags, grape varieties)
- **Full-text Indexes**: Wine and producer search
- **Expression Indexes**: Calculated values (IV totals, drinking windows)

### Materialized Views

#### User Collection Summary
Pre-computed user statistics:
```sql
- Total wines, unique species, shiny count
- Type and rarity distribution
- Collection value and completion percentage
- Activity metrics and recent additions
```

#### Wine Species Analytics
Market and popularity data:
```sql
- Ownership statistics and rarity
- Trading volume and price trends
- Shiny rates and perfect IV counts
- Regional and seasonal popularity
```

#### Guild Analytics
Guild performance metrics:
```sql
- Activity rates and member engagement
- Competition performance and rankings
- Event organization and attendance
- Financial health and growth metrics
```

### Query Optimization

#### Efficient Search Functions
- `search_wines()`: Flexible wine filtering with full-text search
- `get_user_rarity_counts()`: Fast rarity distribution queries  
- `get_wine_market_trends()`: Market analysis with price changes

#### Partitioning Strategy
- **Monthly Partitions**: `user_activity_log` partitioned by month
- **Automatic Management**: Functions to create future partitions
- **Maintenance**: Automated partition pruning for old data

## Data Validation & Integrity

### Custom Domains
Type-safe constraints for common values:
- `iv_stat`: Individual values (0-31)
- `ev_stat`: Effort values (0-252) 
- `wine_level`: Pokemon-style levels (1-100+)
- `percentage`: 0-100% values with decimal precision
- `price`: Non-negative monetary values

### Business Logic Constraints
- **EV Total Limit**: Maximum 510 EVs across all stats
- **Evolution Requirements**: Validate evolution conditions
- **Trading Restrictions**: Level and trust requirements
- **Collection Limits**: Premium vs free user restrictions

### Referential Integrity
- **Cascade Deletes**: Proper cleanup of dependent data
- **Foreign Key Constraints**: Maintain data relationships
- **Check Constraints**: Business rule validation
- **Unique Constraints**: Prevent duplicate data

## Security Architecture

### Role-Based Access Control

#### Application Roles
- **wine_pokedex_app**: Full read/write application access
- **wine_pokedex_readonly**: Analytics and reporting access
- **wine_pokedex_jobs**: Background maintenance tasks

#### Permission Granularity
- Table-level permissions for sensitive data
- Function-level access for business logic
- Row-level security for user data isolation

### Data Protection
- **Password Hashing**: bcrypt for user credentials
- **Session Security**: Secure tokens with expiration
- **Audit Logging**: Comprehensive activity tracking
- **Data Encryption**: Sensitive fields encrypted at rest

## Monitoring & Maintenance

### Performance Monitoring

#### Built-in Views
- `slow_queries`: Identify performance bottlenecks
- `table_sizes`: Monitor database growth
- `index_usage`: Track index effectiveness

#### Maintenance Functions
- `daily_maintenance()`: Automated routine maintenance
- `refresh_all_analytics()`: Update materialized views
- `analyze_all_tables()`: Update query planner statistics

### Backup Strategy
- **Full Backups**: Daily complete database dumps
- **Incremental Backups**: WAL-based point-in-time recovery
- **Cross-region Replication**: Disaster recovery readiness

## Deployment Considerations

### Hardware Requirements
- **CPU**: 8+ cores for concurrent query processing
- **Memory**: 16GB+ RAM for optimal caching
- **Storage**: SSD storage with 50GB+ free space
- **Network**: High-bandwidth for user traffic

### Configuration Recommendations
```postgresql
shared_buffers = 4GB                    # 25% of RAM
effective_cache_size = 12GB             # 75% of RAM  
work_mem = 64MB                         # Complex query operations
maintenance_work_mem = 1GB              # Index maintenance
max_connections = 200                   # Web application pool
random_page_cost = 1.1                  # SSD optimized
```

### Scaling Strategy
- **Read Replicas**: Distribute analytics queries
- **Connection Pooling**: PgBouncer for connection management
- **Horizontal Partitioning**: Shard by user or region if needed
- **Caching Layer**: Redis for session and frequently accessed data

## Development Guidelines

### Schema Evolution
- **Migration Files**: Numbered sequential migrations
- **Backward Compatibility**: Support gradual application updates
- **Testing**: Comprehensive migration testing in staging
- **Rollback Plans**: Safe rollback procedures for each migration

### Code Organization
- **Domain Separation**: Clear separation of wine, user, social domains
- **Function Libraries**: Reusable business logic functions
- **View Abstractions**: Materialized views for complex reporting
- **Documentation**: Comprehensive comments and examples

## Integration Points

### Application Layer
- **TypeScript Types**: Database schema matches TypeScript definitions
- **API Endpoints**: RESTful API with proper HTTP semantics
- **Real-time Features**: WebSocket support for trading and battles
- **Background Jobs**: Async processing for heavy operations

### External Services
- **Wine Data APIs**: Integration with wine industry databases
- **Payment Processing**: For premium features and transactions
- **Image Storage**: Cloud storage for wine photos
- **Email Services**: Notifications and verification

## Future Considerations

### Planned Enhancements
- **Machine Learning**: Wine recommendation algorithms
- **Mobile Optimization**: PWA and native app support
- **AR/VR Integration**: Virtual wine tasting experiences
- **Blockchain**: Provenance and authenticity verification

### Scalability Roadmap
- **Microservices**: Domain-based service decomposition
- **Event Sourcing**: Audit trail and replay capabilities
- **CQRS**: Separate read/write optimization
- **GraphQL**: Flexible API layer for complex queries

This architecture provides a solid foundation for a scalable, feature-rich wine collection platform that can grow from thousands to millions of users while maintaining performance and data integrity.