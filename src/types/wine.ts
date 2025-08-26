// ============================================================================
// CORE TYPE SYSTEM - Wine Pokédex Advanced Types
// ============================================================================

/**
 * Brand type for creating nominal types that prevent mixing different ID types
 */
type Brand<T, K> = T & { readonly __brand: K };

/**
 * Branded ID types for type safety
 */
type WineId = Brand<string, 'WineId'>;
type UserId = Brand<string, 'UserId'>;
type GuildId = Brand<string, 'GuildId'>;
type EventId = Brand<string, 'EventId'>;
type TradeId = Brand<string, 'TradeId'>;

// ============================================================================
// WINE TYPE SYSTEM (Pokémon-inspired strategic types)
// ============================================================================

/**
 * The 8 strategic wine types that create gameplay depth
 */
type WineType = 
  | 'Terroir'   // 🏔️ Region-focused wines with strong sense of place
  | 'Varietal'  // 🍇 Grape-focused single variety expressions  
  | 'Technique' // ⚗️ Method-focused (Natural, Biodynamic, etc.)
  | 'Heritage'  // 🏛️ Traditional/Historic wines with legacy
  | 'Modern'    // 🔬 New World/Innovative techniques
  | 'Mystical'  // 🌟 Rare/Cult wines with legendary status
  | 'Energy'    // ⚡ High alcohol/Bold/Power wines
  | 'Flow';     // 🌊 Light/Fresh/Elegant wines

/**
 * Type effectiveness multipliers for strategic interactions
 */
type TypeEffectiveness = {
  readonly [K in WineType]: {
    readonly [T in WineType]: 0 | 0.5 | 1 | 2;
  };
};

/**
 * Complete rarity system with 20+ tiers
 */
type WineRarity = 
  // Common Tier (70% spawn rate)
  | 'Everyday'         // C - Daily drinking wines, grocery store finds
  | 'Regional'         // R - Local specialties, decent quality  
  | 'Quality'          // Q - Well-made wines from known producers
  // Uncommon Tier (20% spawn rate)
  | 'Estate'           // E - Single estate productions
  | 'Vintage'          // V - Exceptional vintage years
  | 'Reserve'          // RS - Producer's special selection
  // Rare Tier (7% spawn rate)
  | 'SingleVineyard'   // SV - Specific plot expressions
  | 'GrandCru'         // GC - Official classification wines
  | 'MasterSelection'  // MS - Hand-picked by sommeliers
  // Epic Tier (2.5% spawn rate)
  | 'CultClassic'      // CC - Wines with devoted followings
  | 'AllocationOnly'   // AO - Limited distribution wines
  | 'CriticsChoice'    // CH - 95+ point rated wines
  // Legendary Tier (0.4% spawn rate)
  | 'MuseumPiece'      // MP - Historic/collectible bottles
  | 'InvestmentGrade'  // IG - Wines that appreciate in value
  | 'Unicorn'          // UN - Extremely rare finds
  // Mythical Tier (0.09% spawn rate)
  | 'GhostVintage'     // GV - Lost/forgotten vintages
  | 'LostLabel'        // LL - Unidentified rare wines
  | 'FoundersReserve'  // FR - Winery founder's personal stash
  // Divine Tier (0.01% spawn rate)
  | 'OnceInLifetime'   // OIL - Wines that come once per decade
  | 'PerfectStorm'     // PS - Wines made under perfect conditions
  | 'TimeCapsule';     // TC - Pre-phylloxera or historical wines

/**
 * Rarity tier groupings for easier classification
 */
type RarityTier = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Mythical' | 'Divine';

/**
 * Map rarity to tier for utility functions
 */
type RarityToTier<T extends WineRarity> = 
  T extends 'Everyday' | 'Regional' | 'Quality' ? 'Common' :
  T extends 'Estate' | 'Vintage' | 'Reserve' ? 'Uncommon' :
  T extends 'SingleVineyard' | 'GrandCru' | 'MasterSelection' ? 'Rare' :
  T extends 'CultClassic' | 'AllocationOnly' | 'CriticsChoice' ? 'Epic' :
  T extends 'MuseumPiece' | 'InvestmentGrade' | 'Unicorn' ? 'Legendary' :
  T extends 'GhostVintage' | 'LostLabel' | 'FoundersReserve' ? 'Mythical' :
  T extends 'OnceInLifetime' | 'PerfectStorm' | 'TimeCapsule' ? 'Divine' :
  never;

// ============================================================================
// STATS SYSTEM (Pokémon-inspired with wine characteristics)
// ============================================================================

/**
 * Individual Values (0-31) - immutable stats that make each wine unique
 */
type IndividualValues = {
  readonly power: number;      // 0-31
  readonly elegance: number;   // 0-31
  readonly complexity: number; // 0-31
  readonly longevity: number;  // 0-31
  readonly rarity: number;     // 0-31
  readonly terroir: number;    // 0-31
};

/**
 * Effort Values (0-252 per stat, 510 total) - trainable through activities
 */
type EffortValues = {
  readonly power: number;      // 0-252
  readonly elegance: number;   // 0-252
  readonly complexity: number; // 0-252
  readonly longevity: number;  // 0-252
  readonly rarity: number;     // 0-252
  readonly terroir: number;    // 0-252
};

/**
 * Base stats for wine types (0-255 scale)
 */
type BaseStats = {
  readonly power: number;      // Alcohol content + body + intensity
  readonly elegance: number;   // Finesse + balance + refinement
  readonly complexity: number; // Aromatic depth + flavor layers + development
  readonly longevity: number;  // Aging potential + structure + preservation
  readonly rarity: number;     // Scarcity factor + exclusivity + availability
  readonly terroir: number;    // Sense of place + authenticity + origin expression
};

/**
 * Wine nature affects stat growth (like Pokémon natures)
 */
type WineNature = 
  | 'Bold'      // +Power, -Elegance
  | 'Elegant'   // +Elegance, -Power
  | 'Complex'   // +Complexity, -Longevity
  | 'Aged'      // +Longevity, -Complexity
  | 'Rare'      // +Rarity, -Terroir
  | 'Pure'      // +Terroir, -Rarity
  | 'Balanced'; // No stat changes

/**
 * Calculate final stats based on base + IVs + EVs + nature + level
 */
type CalculatedStats = BaseStats & {
  readonly total: number;
  readonly battlePower: number;
  readonly collectionValue: number;
  readonly experienceMultiplier: number;
};

// ============================================================================
// CORE WINE INTERFACE (Enhanced from original)
// ============================================================================

export interface Wine {
  // Core Identity
  readonly id: WineId;
  readonly name: string;
  readonly year: number;
  readonly region: string;
  readonly producer: string;
  readonly grape: string | readonly string[]; // Support for blends
  
  // Type System
  readonly primaryType: WineType;
  readonly secondaryType?: WineType; // Dual-type wines from breeding
  readonly rarity: WineRarity;
  readonly generation: number; // Which generation this wine belongs to
  
  // Stats System  
  readonly baseStats: BaseStats;
  readonly individualValues: IndividualValues;
  readonly effortValues: EffortValues;
  readonly nature: WineNature;
  readonly level: number;
  readonly experience: number;
  readonly calculatedStats: CalculatedStats;
  
  // Capture Information
  readonly captured: boolean;
  readonly dateAdded: Date;
  readonly captureLocation?: string;
  readonly captureMethod?: 'Purchase' | 'Trade' | 'Gift' | 'Event' | 'Breeding';
  
  // Special Characteristics
  readonly isShiny: boolean;
  readonly isMega?: boolean;
  readonly ability?: WineAbility;
  readonly hiddenAbility?: WineAbility;
  
  // Original WSET Tasting Data (preserved from original system)
  readonly appearance?: {
    readonly intensity: 'Pale' | 'Medium' | 'Deep';
    readonly color: string;
    readonly otherObservations?: string;
  };
  
  readonly nose?: {
    readonly intensity: 'Light' | 'Medium(-)' | 'Medium' | 'Medium(+)' | 'Pronounced';
    readonly primaryAromas: readonly string[];
    readonly secondaryAromas?: readonly string[];
    readonly tertiaryAromas?: readonly string[];
  };
  
  readonly palate?: {
    readonly sweetness: 'Bone Dry' | 'Dry' | 'Off-Dry' | 'Medium-Dry' | 'Medium-Sweet' | 'Sweet' | 'Lusciously Sweet';
    readonly acidity: 'Low' | 'Medium(-)' | 'Medium' | 'Medium(+)' | 'High';
    readonly tannin?: 'Low' | 'Medium(-)' | 'Medium' | 'Medium(+)' | 'High';
    readonly alcohol: 'Low' | 'Medium' | 'Medium(+)' | 'High';
    readonly body: 'Light' | 'Medium(-)' | 'Medium' | 'Medium(+)' | 'Full';
    readonly finish: 'Short' | 'Medium(-)' | 'Medium' | 'Medium(+)' | 'Long';
  };
  
  // Additional Wine Metadata
  readonly abv?: number;
  readonly temperature?: number;
  readonly decantTime?: number;
  readonly peakDrinkingWindow?: {
    readonly start: number;
    readonly end: number;
  };
  
  // User Data
  readonly personalNotes?: string;
  readonly voiceNoteUrl?: string;
  readonly photoUrl?: string;
  readonly purchaseLocation?: string;
  readonly price?: number;
  readonly rating?: number;
  readonly tastingNotes?: string;
  
  // Evolution Data
  readonly evolutionChain?: WineEvolutionChain;
  readonly evolutionLevel?: number;
  readonly canEvolve: boolean;
  readonly evolutionRequirements?: EvolutionRequirement[];
  
  // Breeding Data (for blended wines)
  readonly parentWines?: readonly [WineId, WineId];
  readonly breedingGeneration?: number;
  readonly inheritedTraits?: readonly WineAbility[];
}

// ============================================================================
// ABILITIES SYSTEM
// ============================================================================

/**
 * Wine abilities that provide special effects and characteristics
 */
type WineAbility = 
  // Natural Abilities
  | 'TerroirExpression'  // Boosts type effectiveness
  | 'AgingGrace'         // Improves stats over time
  | 'FoodHarmony'        // Enhanced pairing bonuses
  | 'CellarChampion'     // Resists storage damage
  | 'CompetitionStar'    // Bonus points in contests
  // Hidden Abilities (Rare)
  | 'PerfectBalance'     // Immune to stat debuffs
  | 'VintageMagic'       // Randomly boosts stats each season
  | 'MastersChoice'      // Always critical hits in tastings
  | 'TerroirShift'       // Can change type based on storage
  | 'TimeCapsule';       // Stats frozen at peak condition

/**
 * Ability effects and descriptions
 */
interface AbilityInfo {
  readonly name: string;
  readonly description: string;
  readonly effect: string;
  readonly isHidden: boolean;
  readonly rarity: 'Common' | 'Uncommon' | 'Rare' | 'Hidden';
}

// ============================================================================
// EVOLUTION SYSTEM
// ============================================================================

/**
 * Evolution trigger types
 */
type EvolutionTrigger = 
  | 'Time'        // Natural aging
  | 'Experience'  // XP threshold
  | 'Quality'     // Perfect tasting score
  | 'Competition' // Win competitions
  | 'Item'        // Special evolution items
  | 'Trade'       // Trade evolution
  | 'Pairing'     // Perfect food pairing
  | 'Storage'     // Proper cellar conditions
  | 'Season';     // Seasonal requirements

/**
 * Evolution requirement with conditions
 */
interface EvolutionRequirement {
  readonly trigger: EvolutionTrigger;
  readonly condition: string | number | boolean;
  readonly description: string;
  readonly optional?: boolean;
}

/**
 * Single evolution path
 */
interface Evolution<From extends WineId = WineId, To extends WineId = WineId> {
  readonly from: From;
  readonly to: To;
  readonly requirements: readonly EvolutionRequirement[];
  readonly statsChange: Partial<BaseStats>;
  readonly typeChange?: {
    readonly primaryType?: WineType;
    readonly secondaryType?: WineType;
  };
  readonly preserveShiny: boolean;
}

/**
 * Complete evolution chain for a wine family
 */
interface WineEvolutionChain {
  readonly id: string;
  readonly name: string;
  readonly generations: readonly WineId[][];
  readonly evolutions: readonly Evolution[];
  readonly branchingPaths?: readonly {
    readonly condition: string;
    readonly paths: readonly Evolution[][];
  }[];
}

/**
 * Evolution items that enable special evolutions
 */
type EvolutionItem = 
  | 'DecanterStone'    // Enables aeration evolution
  | 'OakInfluence'     // Adds barrel-aging characteristics
  | 'VintageSeal'      // Preserves wine at peak condition
  | 'MastersTouch'     // Unlocks hidden potential
  | 'TerroirCrystal';  // Amplifies origin characteristics

// ============================================================================
// BREEDING SYSTEM
// ============================================================================

/**
 * Breeding compatibility between wine types
 */
type BreedingCompatibility = {
  readonly [K in WineType]: {
    readonly [T in WineType]: 'Perfect' | 'Good' | 'Poor' | 'Impossible';
  };
};

/**
 * Breeding requirements and restrictions
 */
interface BreedingRequirements {
  readonly minimumLevel: number;
  readonly requiredExperience: number;
  readonly compatibilityRating: 'Perfect' | 'Good' | 'Poor' | 'Impossible';
  readonly seasonalRestrictions?: readonly string[];
  readonly facilityRequired?: 'Basic' | 'Advanced' | 'Master' | 'Legendary';
  readonly licenseRequired?: 'Amateur' | 'Professional' | 'Master';
}

/**
 * Breeding result with inheritance patterns
 */
interface BreedingResult {
  readonly offspring: Omit<Wine, 'id' | 'dateAdded'>;
  readonly inheritancePattern: {
    readonly statsFrom: 'Parent1' | 'Parent2' | 'Average' | 'Best';
    readonly typeInheritance: 'Primary' | 'Secondary' | 'Combination';
    readonly abilityInheritance: readonly WineAbility[];
  };
  readonly mutationChance: number;
  readonly shinyOdds: number;
}

/**
 * Generic breeding function type for type safety
 */
type BreedingFunction<P1 extends Wine, P2 extends Wine> = (
  parent1: P1,
  parent2: P2,
  requirements: BreedingRequirements
) => Promise<BreedingResult>;

// ============================================================================
// MEGA EVOLUTION SYSTEM
// ============================================================================

/**
 * Mega evolution triggers and conditions
 */
interface MegaEvolutionData {
  readonly canMegaEvolve: boolean;
  readonly megaForm?: {
    readonly name: string;
    readonly statsBoost: BaseStats;
    readonly typeChange?: WineType;
    readonly newAbility?: WineAbility;
    readonly duration: 'Battle' | 'Event' | 'Tasting' | 'Competition';
  };
  readonly triggers: readonly (
    | 'PerfectStorage'    // Ideal cellar conditions
    | 'MasterTasting'     // Perfect score from sommelier
    | 'CompetitionVictory' // Win major competition
    | 'PairingPerfection' // Perfect food pairing scores
  )[];
}

// ============================================================================
// REGIONAL FORMS SYSTEM
// ============================================================================

/**
 * Regional form variations of the same base wine
 */
interface RegionalForm<T extends string = string> {
  readonly region: T;
  readonly form: string;
  readonly statsModification: Partial<BaseStats>;
  readonly typeOverride?: {
    readonly primaryType: WineType;
    readonly secondaryType?: WineType;
  };
  readonly uniqueAbilities?: readonly WineAbility[];
  readonly visualDifferences: readonly string[];
}

// ============================================================================
// COLLECTION AND PROGRESS TRACKING SYSTEM
// ============================================================================

/**
 * Player progression levels with unlock requirements
 */
type PlayerLevel = 
  | { tier: 'Novice'; level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 }
  | { tier: 'Intermediate'; level: 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 }
  | { tier: 'Advanced'; level: 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 }
  | { tier: 'Expert'; level: 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100 }
  | { tier: 'Master'; level: number }; // 101+ infinite progression

/**
 * Experience types for different activities
 */
interface ExperienceGains {
  readonly tasting: number;        // Blind tasting and evaluation
  readonly collecting: number;     // Adding new wines to collection  
  readonly trading: number;        // Successful trades with other players
  readonly breeding: number;       // Creating new wine blends
  readonly competition: number;    // Tournament and contest participation
  readonly social: number;         // Guild activities and community events
  readonly education: number;      // Completing wine courses and certifications
}

/**
 * Badge system with categories and requirements
 */
interface Badge {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly category: 'Regional' | 'Grape' | 'Vintage' | 'Tasting' | 'Collection' | 'Social' | 'Competition' | 'Special' | 'Evolution' | 'Breeding';
  readonly rarity: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Legendary';
  readonly requirements: readonly {
    readonly type: string;
    readonly condition: string | number;
    readonly description: string;
  }[];
  readonly rewards?: {
    readonly experience?: Partial<ExperienceGains>;
    readonly items?: readonly string[];
    readonly unlocks?: readonly string[];
  };
  readonly earnedDate?: Date;
  readonly progress?: {
    readonly current: number;
    readonly required: number;
  };
}

/**
 * Achievement tracking with progress indicators
 */
interface Achievement<T = unknown> {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: 'Counter' | 'Boolean' | 'Threshold' | 'Collection' | 'Streak';
  readonly category: string;
  readonly progress: {
    readonly current: T;
    readonly target: T;
    readonly percentage: number;
  };
  readonly completed: boolean;
  readonly completedDate?: Date;
  readonly rewards: {
    readonly experience: Partial<ExperienceGains>;
    readonly badges?: readonly string[];
    readonly items?: readonly string[];
    readonly titles?: readonly string[];
  };
}

/**
 * Wine collection with comprehensive tracking
 */
export interface WineCollection {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly ownerId: UserId;
  
  // Core Collection Data
  readonly wines: readonly Wine[];
  readonly totalWines: number;
  readonly uniqueWines: number;
  readonly duplicateCount: number;
  
  // Progress Tracking
  readonly completionStats: {
    readonly byGeneration: Record<number, { caught: number; total: number; percentage: number; }>;
    readonly byType: Record<WineType, { caught: number; total: number; percentage: number; }>;
    readonly byRarity: Record<WineRarity, { caught: number; total: number; percentage: number; }>;
    readonly byRegion: Record<string, { caught: number; total: number; percentage: number; }>;
    readonly overall: { caught: number; total: number; percentage: number; };
  };
  
  // Experience and Level
  readonly totalExperience: number;
  readonly experienceBreakdown: ExperienceGains;
  readonly level: number;
  readonly currentTier: 'Novice' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';
  
  // Achievements and Badges
  readonly badges: readonly Badge[];
  readonly achievements: readonly Achievement[];
  readonly titles: readonly string[];
  readonly currentTitle?: string;
  
  // Collection Statistics
  readonly stats: {
    readonly shinyCount: number;
    readonly perfectIVCount: number;
    readonly megaEvolvedCount: number;
    readonly breedingGeneration: number;
    readonly tradeCount: number;
    readonly competitionWins: number;
    readonly daysSinceStart: number;
    readonly favoriteType?: WineType;
    readonly favoriteRegion?: string;
    readonly rarest: Wine;
    readonly oldest: Wine;
    readonly newest: Wine;
  };
  
  // Social Features
  readonly friends: readonly UserId[];
  readonly guildMemberships: readonly GuildId[];
  readonly publicVisibility: 'Private' | 'Friends' | 'Guild' | 'Public';
  readonly showcaseWines: readonly WineId[]; // Featured wines for public display
  
  // Storage and Organization
  readonly cellarCapacity: number;
  readonly organizationTags: readonly string[];
  readonly customCategories: readonly {
    readonly name: string;
    readonly wineIds: readonly WineId[];
    readonly color: string;
  }[];
  
  readonly createdDate: Date;
  readonly lastUpdated: Date;
}

/**
 * Collection challenges and goals
 */
interface CollectionChallenge<T = unknown> {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: 'LivingDex' | 'ShinyHunting' | 'Competitive' | 'Vintage' | 'PerfectStats' | 'Achievement' | 'Seasonal';
  readonly difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master' | 'Legendary';
  readonly requirements: readonly {
    readonly description: string;
    readonly target: T;
    readonly current: T;
    readonly completed: boolean;
  }[];
  readonly timeLimit?: Date;
  readonly rewards: {
    readonly experience: number;
    readonly badges?: readonly string[];
    readonly items?: readonly string[];
    readonly titles?: readonly string[];
    readonly specialWines?: readonly WineId[];
  };
  readonly participants: number;
  readonly leaderboard?: readonly {
    readonly userId: UserId;
    readonly progress: number;
    readonly rank: number;
  }[];
}

/**
 * Pokedex-style wine catalog with discovery tracking
 */
interface WineDex {
  readonly totalEntries: number;
  readonly discoveredEntries: number;
  readonly caughtEntries: number;
  readonly completionPercentage: number;
  
  readonly entries: Record<WineId, {
    readonly discovered: boolean;
    readonly caught: boolean;
    readonly firstSeenDate?: Date;
    readonly firstCaughtDate?: Date;
    readonly encounterCount: number;
    readonly forms: readonly {
      readonly region: string;
      readonly discovered: boolean;
      readonly caught: boolean;
    }[];
  }>;
  
  readonly generationProgress: Record<number, {
    readonly name: string;
    readonly total: number;
    readonly discovered: number;
    readonly caught: number;
  }>;
}

// ============================================================================
// SOCIAL FEATURES SYSTEM
// ============================================================================

/**
 * Trading system with comprehensive market mechanics
 */
interface Trade<T extends 'Direct' | 'Market' | 'Auction' | 'Mystery' = 'Direct'> {
  readonly id: TradeId;
  readonly type: T;
  readonly status: 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancelled' | 'Expired';
  
  // Participants
  readonly initiatorId: UserId;
  readonly participantId?: T extends 'Mystery' ? undefined : UserId;
  
  // Trade Details
  readonly offeredWines: readonly WineId[];
  readonly requestedWines?: T extends 'Direct' ? readonly WineId[] : undefined;
  readonly marketPrice?: T extends 'Market' | 'Auction' ? number : undefined;
  readonly buyoutPrice?: T extends 'Auction' ? number : undefined;
  readonly bidHistory?: T extends 'Auction' ? readonly {
    readonly bidderId: UserId;
    readonly amount: number;
    readonly timestamp: Date;
  }[] : undefined;
  
  // Requirements and Restrictions
  readonly levelRequirement?: number;
  readonly trustRatingRequirement?: number;
  readonly regionRestrictions?: readonly string[];
  readonly tradingFees: number;
  readonly insurance?: {
    readonly enabled: boolean;
    readonly cost: number;
    readonly coverage: number;
  };
  
  // Timing
  readonly createdDate: Date;
  readonly expirationDate?: Date;
  readonly completedDate?: Date;
  
  // Evolution Triggers
  readonly triggersEvolution: boolean;
  readonly evolutionData?: {
    readonly wineId: WineId;
    readonly evolutionTo: WineId;
  };
}

/**
 * Market data and pricing information
 */
interface MarketData {
  readonly wineId: WineId;
  readonly currentPrice: number;
  readonly priceHistory: readonly {
    readonly price: number;
    readonly date: Date;
    readonly volume: number;
  }[];
  readonly supplyDemand: {
    readonly supply: number;
    readonly demand: number;
    readonly trend: 'Rising' | 'Falling' | 'Stable';
  };
  readonly seasonalMultiplier: number;
  readonly rarityPremium: number;
  readonly investmentRating: 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'Outstanding';
  readonly lastUpdated: Date;
}

/**
 * User trust and reputation system
 */
interface UserReputation {
  readonly userId: UserId;
  readonly trustRating: number; // 0-100
  readonly completedTrades: number;
  readonly successfulTrades: number;
  readonly failedTrades: number;
  readonly averageRating: number;
  readonly reviews: readonly {
    readonly reviewerId: UserId;
    readonly rating: 1 | 2 | 3 | 4 | 5;
    readonly comment?: string;
    readonly tradeId: TradeId;
    readonly date: Date;
  }[];
  readonly badges: readonly ('TrustedTrader' | 'FairDealer' | 'MarketMaker' | 'Collector' | 'Breeder')[];
  readonly restrictions?: readonly string[];
}

/**
 * Guild system for social organization
 */
interface Guild {
  readonly id: GuildId;
  readonly name: string;
  readonly description: string;
  readonly type: 'Regional' | 'TypeSpecialist' | 'Competition' | 'Education' | 'Trading' | 'Casual' | 'Professional';
  readonly visibility: 'Public' | 'Private' | 'InviteOnly';
  
  // Membership
  readonly members: readonly {
    readonly userId: UserId;
    readonly role: 'Leader' | 'Officer' | 'Elder' | 'Member' | 'Recruit';
    readonly joinDate: Date;
    readonly contributions: {
      readonly totalExperience: number;
      readonly winesShared: number;
      readonly eventsOrganized: number;
      readonly competitionsWon: number;
    };
  }[];
  readonly maxMembers: number;
  readonly memberRequirements?: {
    readonly minimumLevel?: number;
    readonly minimumCollection?: number;
    readonly requiredBadges?: readonly string[];
    readonly applicationRequired?: boolean;
  };
  
  // Guild Features
  readonly sharedCellar: {
    readonly wines: readonly WineId[];
    readonly capacity: number;
    readonly accessLevel: Record<string, 'View' | 'Borrow' | 'Contribute' | 'Manage'>;
  };
  readonly treasury: {
    readonly funds: number;
    readonly monthlyDues?: number;
    readonly expenses: readonly {
      readonly description: string;
      readonly amount: number;
      readonly date: Date;
    }[];
  };
  readonly events: readonly GuildEvent[];
  readonly achievements: readonly {
    readonly name: string;
    readonly description: string;
    readonly dateEarned: Date;
    readonly contributors: readonly UserId[];
  }[];
  
  // Competition Data
  readonly competitionStats: {
    readonly tournamentsWon: number;
    readonly currentRanking: number;
    readonly seasonRecord: { wins: number; losses: number; };
  };
  
  readonly foundedDate: Date;
  readonly lastActive: Date;
}

/**
 * Guild events and activities
 */
interface GuildEvent {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: 'GroupTasting' | 'Competition' | 'Educational' | 'Trading' | 'Challenge' | 'Charity';
  readonly startDate: Date;
  readonly endDate?: Date;
  readonly location?: 'Virtual' | 'Physical' | string;
  readonly organizer: UserId;
  readonly participants: readonly {
    readonly userId: UserId;
    readonly status: 'Registered' | 'Attended' | 'NoShow';
    readonly contribution?: string;
  }[];
  readonly maxParticipants?: number;
  readonly requirements?: {
    readonly minimumLevel?: number;
    readonly requiredWines?: readonly WineId[];
    readonly membershipRole?: string[];
  };
  readonly rewards?: {
    readonly experience: Partial<ExperienceGains>;
    readonly items?: readonly string[];
    readonly badges?: readonly string[];
  };
  readonly results?: {
    readonly winner?: UserId;
    readonly rankings?: readonly { userId: UserId; rank: number; score: number; }[];
    readonly completionRate: number;
  };
}

/**
 * Competition and battle system
 */
interface Competition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: 'BlindTasting' | 'PerfectPairing' | 'TerroirChallenge' | 'VintageQuiz' | 'SpeedTasting' | 'TeamBattle';
  readonly format: 'SingleElimination' | 'RoundRobin' | 'Swiss' | 'League' | 'Championship';
  readonly scope: 'Local' | 'Regional' | 'National' | 'Global' | 'Guild';
  
  // Entry Requirements
  readonly eligibility: {
    readonly minimumLevel: number;
    readonly maximumLevel?: number;
    readonly requiredWines?: readonly WineType[];
    readonly entryFee?: number;
    readonly guildMembership?: GuildId;
  };
  
  // Competition Structure
  readonly rounds: readonly {
    readonly roundNumber: number;
    readonly name: string;
    readonly format: string;
    readonly matches: readonly Battle[];
    readonly startDate: Date;
    readonly endDate: Date;
  }[];
  readonly currentRound: number;
  readonly totalParticipants: number;
  readonly remainingParticipants: number;
  
  // Rewards and Prizes
  readonly prizes: {
    readonly first: { experience: number; items: readonly string[]; titles: readonly string[]; };
    readonly second: { experience: number; items: readonly string[]; titles: readonly string[]; };
    readonly third: { experience: number; items: readonly string[]; titles: readonly string[]; };
    readonly participation: { experience: number; items?: readonly string[]; };
  };
  
  readonly seasonalBonus?: {
    readonly multiplier: number;
    readonly specialRewards?: readonly string[];
  };
  
  readonly startDate: Date;
  readonly endDate: Date;
  readonly registrationDeadline: Date;
  readonly status: 'Registration' | 'InProgress' | 'Completed' | 'Cancelled';
}

/**
 * Individual battle/match within competitions
 */
interface Battle {
  readonly id: string;
  readonly competitionId: string;
  readonly participants: readonly {
    readonly userId: UserId;
    readonly wines: readonly WineId[];
    readonly score?: number;
    readonly performance?: {
      readonly accuracy: number;
      readonly speed: number;
      readonly creativity: number;
    };
  }[];
  readonly type: 'BlindTasting' | 'PerfectPairing' | 'Knowledge' | 'Creative';
  readonly challenge: string;
  readonly duration: number; // in minutes
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly result?: {
    readonly winner: UserId;
    readonly scores: Record<UserId, number>;
    readonly details: string;
  };
  readonly status: 'Scheduled' | 'InProgress' | 'Completed' | 'Forfeit';
  
  // Battle Mechanics
  readonly battleData?: {
    readonly typeEffectiveness: boolean; // Use wine type advantages
    readonly weatherEffects?: string; // Environmental factors
    readonly criticalHits: boolean;
    readonly abilities: boolean; // Wine abilities active
  };
}

// ============================================================================
// EVENT AND SEASONAL CONTENT SYSTEM
// ============================================================================

/**
 * Seasonal periods that affect gameplay mechanics
 */
type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';

/**
 * Event types with different mechanics and rewards
 */
type EventType = 
  | 'Seasonal'        // Recurring seasonal events
  | 'Limited'         // One-time limited events
  | 'Community'       // Global community challenges
  | 'Competition'     // Special tournaments
  | 'Discovery'       // New wine region unveiling
  | 'Anniversary'     // Game anniversary celebrations
  | 'Collaboration'   // Real-world winery partnerships
  | 'Educational';    // Learning-focused events

/**
 * Comprehensive event system
 */
interface GameEvent {
  readonly id: EventId;
  readonly name: string;
  readonly description: string;
  readonly type: EventType;
  readonly theme?: string;
  
  // Timing
  readonly startDate: Date;
  readonly endDate: Date;
  readonly duration: number; // in hours
  readonly timeZone: string;
  readonly recurring?: {
    readonly pattern: 'Daily' | 'Weekly' | 'Monthly' | 'Seasonal' | 'Yearly';
    readonly interval: number;
  };
  
  // Participation
  readonly eligibility: {
    readonly minimumLevel?: number;
    readonly maximumLevel?: number;
    readonly requiredBadges?: readonly string[];
    readonly guildMembership?: boolean;
    readonly regionRestriction?: readonly string[];
  };
  readonly maxParticipants?: number;
  readonly currentParticipants: number;
  
  // Event Mechanics
  readonly mechanics: {
    readonly bonusMultipliers?: {
      readonly experience?: number;
      readonly rareFindChance?: number;
      readonly shinyOdds?: number;
    };
    readonly specialSpawns?: readonly {
      readonly wineId: WineId;
      readonly spawnRate: number;
      readonly exclusiveToEvent: boolean;
    }[];
    readonly evolutionBonus?: {
      readonly reducedRequirements: boolean;
      readonly guaranteedSuccess: boolean;
    };
    readonly breedingBonus?: {
      readonly improvedOdds: boolean;
      readonly freeAttempts: number;
    };
  };
  
  // Challenges and Goals
  readonly challenges: readonly EventChallenge[];
  readonly globalGoal?: {
    readonly description: string;
    readonly target: number;
    readonly current: number;
    readonly rewards: EventRewards;
  };
  
  // Rewards
  readonly rewards: {
    readonly participation: EventRewards;
    readonly completion: EventRewards;
    readonly leaderboard: readonly {
      readonly rank: number;
      readonly rewards: EventRewards;
    }[];
  };
  
  // Special Features
  readonly exclusiveWines?: readonly WineId[];
  readonly temporaryAbilities?: readonly {
    readonly name: string;
    readonly effect: string;
    readonly duration: 'Event' | 'Permanent';
  }[];
  readonly specialRules?: readonly string[];
  
  readonly status: 'Upcoming' | 'Active' | 'Completed' | 'Cancelled';
  readonly leaderboard?: readonly {
    readonly userId: UserId;
    readonly score: number;
    readonly rank: number;
    readonly completedChallenges: number;
  }[];
}

/**
 * Individual event challenges with specific requirements
 */
interface EventChallenge {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: 'Collection' | 'Tasting' | 'Trading' | 'Social' | 'Knowledge' | 'Creative';
  readonly difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Legendary';
  
  readonly requirements: readonly {
    readonly description: string;
    readonly target: number | string | boolean;
    readonly current?: number | string | boolean;
    readonly completed: boolean;
  }[];
  
  readonly timeLimit?: Date;
  readonly rewards: EventRewards;
  readonly prerequisites?: readonly string[]; // Other challenge IDs
}

/**
 * Event reward structure
 */
interface EventRewards {
  readonly experience: Partial<ExperienceGains>;
  readonly items?: readonly {
    readonly type: 'EvolutionItem' | 'Decoration' | 'Equipment' | 'Currency';
    readonly name: string;
    readonly quantity: number;
  }[];
  readonly exclusiveWines?: readonly WineId[];
  readonly badges?: readonly string[];
  readonly titles?: readonly string[];
  readonly customizations?: readonly {
    readonly type: 'Avatar' | 'Cellar' | 'Card' | 'Theme';
    readonly name: string;
  }[];
  readonly specialAccess?: readonly {
    readonly type: 'Region' | 'Feature' | 'Event';
    readonly name: string;
    readonly duration?: Date;
  }[];
}

/**
 * Seasonal modifiers that affect game mechanics
 */
interface SeasonalModifiers {
  readonly season: Season;
  readonly year: number;
  readonly startDate: Date;
  readonly endDate: Date;
  
  // Spawn Rate Modifiers
  readonly spawnModifiers: {
    readonly rarityBonus: Partial<Record<WineRarity, number>>;
    readonly typeBonus: Partial<Record<WineType, number>>;
    readonly regionBonus: Record<string, number>;
    readonly shinyMultiplier: number;
  };
  
  // Activity Modifiers
  readonly experienceModifiers: Partial<ExperienceGains>;
  readonly tradingBonuses: {
    readonly reducedFees: number;
    readonly bonusReputation: number;
  };
  readonly competitionBonuses: {
    readonly bonusRewards: number;
    readonly improvedRankings: boolean;
  };
  
  // Special Mechanics
  readonly specialMechanics?: readonly {
    readonly name: string;
    readonly description: string;
    readonly effect: string;
  }[];
  
  // Featured Content
  readonly featuredWines: readonly WineId[];
  readonly featuredRegions: readonly string[];
  readonly featuredTypes: readonly WineType[];
}

/**
 * Event history and statistics
 */
interface EventHistory {
  readonly userId: UserId;
  readonly eventsParticipated: readonly {
    readonly eventId: EventId;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly challengesCompleted: number;
    readonly totalChallenges: number;
    readonly finalRank?: number;
    readonly rewards: EventRewards;
  }[];
  readonly totalEventsParticipated: number;
  readonly totalChallengesCompleted: number;
  readonly averageRank: number;
  readonly specialAchievements: readonly string[];
}

// ============================================================================
// GENERIC UTILITY TYPES AND TYPE SAFETY
// ============================================================================

/**
 * Utility type for creating optional fields from required ones
 */
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type for making specific fields required
 */
type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Deep readonly utility type for immutable data structures
 */
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T[P] extends readonly (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

/**
 * Extract keys from type where value matches condition
 */
type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Create a type with only the properties of T that are assignable to U
 */
type PickByType<T, U> = Pick<T, KeysOfType<T, U>>;

/**
 * Omit properties from T that are assignable to U
 */
type OmitByType<T, U> = Omit<T, KeysOfType<T, U>>;

/**
 * Non-empty array type
 */
type NonEmptyArray<T> = [T, ...T[]];

/**
 * Wine collection operations with type safety
 */
interface WineOperations {
  // Type-safe wine creation
  createWine: <T extends Omit<Wine, 'id' | 'dateAdded' | 'calculatedStats'>>(
    wineData: T & {
      baseStats: BaseStats;
      individualValues: IndividualValues;
      effortValues: EffortValues;
      nature: WineNature;
      level: number;
    }
  ) => Wine;
  
  // Type-safe evolution with constraints
  evolveWine: <From extends Wine, To extends Wine>(
    wine: From,
    evolution: Evolution<From['id'], To['id']>,
    requirements: EvolutionRequirement[]
  ) => To | null;
  
  // Type-safe breeding with parent constraints
  breedWines: <P1 extends Wine, P2 extends Wine>(
    parent1: P1,
    parent2: P2,
    compatibility: BreedingCompatibility[P1['primaryType']][P2['primaryType']]
  ) => BreedingResult | null;
  
  // Type-safe stat calculation
  calculateStats: (
    baseStats: BaseStats,
    ivs: IndividualValues,
    evs: EffortValues,
    nature: WineNature,
    level: number
  ) => CalculatedStats;
}

/**
 * Collection query and filter types
 */
interface CollectionQueries {
  // Filter wines by type with type safety
  filterByType: <T extends WineType>(
    wines: readonly Wine[],
    type: T
  ) => Wine[];
  
  // Filter by rarity with type safety  
  filterByRarity: <R extends WineRarity>(
    wines: readonly Wine[],
    rarity: R
  ) => Wine[];
  
  // Filter by multiple criteria
  filterBy: <T extends Partial<Pick<Wine, 'primaryType' | 'rarity' | 'generation' | 'isShiny'>>>(
    wines: readonly Wine[],
    criteria: T
  ) => Wine[];
  
  // Sort wines with type-safe keys
  sortBy: <K extends keyof Wine>(
    wines: readonly Wine[],
    key: K,
    order?: 'asc' | 'desc'
  ) => Wine[];
  
  // Group wines by property
  groupBy: <K extends keyof Wine>(
    wines: readonly Wine[],
    key: K
  ) => Record<string, Wine[]>;
}

/**
 * Type-safe API response wrapper
 */
type ApiResponse<T> = 
  | { success: true; data: T; error?: undefined }
  | { success: false; data?: undefined; error: string };

/**
 * Type-safe async operations
 */
interface AsyncWineOperations {
  fetchWine: (id: WineId) => Promise<ApiResponse<Wine>>;
  fetchCollection: (userId: UserId) => Promise<ApiResponse<WineCollection>>;
  updateWine: (id: WineId, updates: Partial<Wine>) => Promise<ApiResponse<Wine>>;
  deleteWine: (id: WineId) => Promise<ApiResponse<boolean>>;
}

/**
 * Event system with generic event data
 */
type GameEventHandler<T = unknown> = (eventData: T) => void | Promise<void>;

interface TypedEventEmitter {
  // Wine events
  wineEvolved: GameEventHandler<{ wine: Wine; evolution: Evolution; }>;
  wineBreed: GameEventHandler<{ parents: [Wine, Wine]; offspring: Wine; }>;
  wineCaptured: GameEventHandler<{ wine: Wine; method: string; }>;
  
  // Collection events
  badgeEarned: GameEventHandler<{ badge: Badge; userId: UserId; }>;
  levelUp: GameEventHandler<{ level: number; tier: string; userId: UserId; }>;
  achievementUnlocked: GameEventHandler<{ achievement: Achievement; userId: UserId; }>;
  
  // Social events
  tradeCompleted: GameEventHandler<{ trade: Trade; }>;
  guildJoined: GameEventHandler<{ guild: Guild; userId: UserId; }>;
  competitionWon: GameEventHandler<{ competition: Competition; winner: UserId; }>;
  
  // Event system events
  seasonChanged: GameEventHandler<{ season: Season; modifiers: SeasonalModifiers; }>;
  eventStarted: GameEventHandler<{ event: GameEvent; }>;
  eventEnded: GameEventHandler<{ event: GameEvent; results: Record<string, unknown>; }>;
}

// ============================================================================
// VALIDATION SCHEMAS AND RUNTIME TYPE CHECKING
// ============================================================================

/**
 * Runtime validation for wine stats
 */
interface ValidationSchema<T> {
  validate: (data: unknown) => data is T;
  errors: readonly string[];
}

/**
 * Stats validation constraints
 */
const STATS_CONSTRAINTS = {
  IV_MIN: 0,
  IV_MAX: 31,
  EV_MIN: 0,
  EV_MAX: 252,
  EV_TOTAL_MAX: 510,
  BASE_STAT_MIN: 0,
  BASE_STAT_MAX: 255,
  LEVEL_MIN: 1,
  LEVEL_MAX: 100,
} as const;

/**
 * Wine validation helpers
 */
interface WineValidators {
  isValidWineId: (id: unknown) => id is WineId;
  isValidUserId: (id: unknown) => id is UserId;
  isValidGuildId: (id: unknown) => id is GuildId;
  
  validateIVs: (ivs: unknown) => ivs is IndividualValues;
  validateEVs: (evs: unknown) => evs is EffortValues;
  validateBaseStats: (stats: unknown) => stats is BaseStats;
  
  validateWineType: (type: unknown) => type is WineType;
  validateWineRarity: (rarity: unknown) => rarity is WineRarity;
  validateWineNature: (nature: unknown) => nature is WineNature;
  
  validateEvolutionRequirement: (req: unknown) => req is EvolutionRequirement;
  validateBreedingRequirements: (req: unknown) => req is BreedingRequirements;
}

/**
 * Collection validation
 */
interface CollectionValidators {
  validateCollection: (collection: unknown) => collection is WineCollection;
  validateBadge: (badge: unknown) => badge is Badge;
  validateAchievement: (achievement: unknown) => achievement is Achievement;
  validateExperienceGains: (exp: unknown) => exp is ExperienceGains;
}

/**
 * Social feature validation  
 */
interface SocialValidators {
  validateTrade: (trade: unknown) => trade is Trade;
  validateGuild: (guild: unknown) => guild is Guild;
  validateCompetition: (competition: unknown) => competition is Competition;
  validateBattle: (battle: unknown) => battle is Battle;
  validateUserReputation: (rep: unknown) => rep is UserReputation;
}

/**
 * Event validation
 */
interface EventValidators {
  validateGameEvent: (event: unknown) => event is GameEvent;
  validateEventChallenge: (challenge: unknown) => challenge is EventChallenge;
  validateEventRewards: (rewards: unknown) => rewards is EventRewards;
  validateSeasonalModifiers: (modifiers: unknown) => modifiers is SeasonalModifiers;
}

/**
 * Master validation interface combining all validators
 */
interface MasterValidators extends 
  WineValidators,
  CollectionValidators,
  SocialValidators,
  EventValidators {
  
  // Composite validation
  validateFullWine: (wine: unknown) => wine is Wine;
  validateFullCollection: (collection: unknown) => collection is WineCollection;
  validateGameState: (state: unknown) => state is {
    player: WineCollection;
    events: readonly GameEvent[];
    season: SeasonalModifiers;
  };
}

/**
 * Type guards for runtime type checking
 */
const TypeGuards = {
  isWineType: (value: unknown): value is WineType => {
    const validTypes: readonly WineType[] = [
      'Terroir', 'Varietal', 'Technique', 'Heritage', 
      'Modern', 'Mystical', 'Energy', 'Flow'
    ];
    return typeof value === 'string' && validTypes.includes(value as WineType);
  },
  
  isWineRarity: (value: unknown): value is WineRarity => {
    const validRarities: readonly WineRarity[] = [
      'Everyday', 'Regional', 'Quality',
      'Estate', 'Vintage', 'Reserve',
      'SingleVineyard', 'GrandCru', 'MasterSelection',
      'CultClassic', 'AllocationOnly', 'CriticsChoice',
      'MuseumPiece', 'InvestmentGrade', 'Unicorn',
      'GhostVintage', 'LostLabel', 'FoundersReserve',
      'OnceInLifetime', 'PerfectStorm', 'TimeCapsule'
    ];
    return typeof value === 'string' && validRarities.includes(value as WineRarity);
  },
  
  isValidLevel: (value: unknown): value is number => {
    return typeof value === 'number' && 
           value >= STATS_CONSTRAINTS.LEVEL_MIN && 
           value <= STATS_CONSTRAINTS.LEVEL_MAX;
  },
  
  isValidIV: (value: unknown): value is number => {
    return typeof value === 'number' && 
           value >= STATS_CONSTRAINTS.IV_MIN && 
           value <= STATS_CONSTRAINTS.IV_MAX;
  },
  
  isValidEV: (value: unknown): value is number => {
    return typeof value === 'number' && 
           value >= STATS_CONSTRAINTS.EV_MIN && 
           value <= STATS_CONSTRAINTS.EV_MAX;
  },
} as const;

// ============================================================================
// LEGACY INTERFACES (Preserved for backward compatibility)  
// ============================================================================

/**
 * Legacy collection badge interface (now superseded by Badge)
 * @deprecated Use Badge interface instead
 */
export interface CollectionBadge {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly earnedDate: Date;
  readonly category: 'Regional' | 'Grape' | 'Vintage' | 'Tasting' | 'Collection' | 'Special';
}

/**
 * Legacy tasting session interface  
 * @deprecated Enhanced functionality now available through GuildEvent and Competition systems
 */
export interface TastingSession {
  readonly id: string;
  readonly date: Date;
  readonly wines: Wine[];
  readonly theme?: string;
  readonly notes?: string;
  readonly participants?: readonly string[];
  readonly location?: string;
}

/**
 * WSET Level 3 systematic tasting note structure
 * Preserved for educational and professional tasting use
 */
export interface WSETTastingNote {
  readonly appearance: {
    readonly intensity: string;
    readonly color: string;
    readonly otherObservations?: string;
  };
  readonly nose: {
    readonly condition: 'Clean' | 'Unclean';
    readonly intensity: string;
    readonly developmentLevel: 'Youthful' | 'Developing' | 'Fully Developed' | 'Tired';
    readonly primaryAromas: readonly string[];
    readonly secondaryAromas: readonly string[];
    readonly tertiaryAromas: readonly string[];
  };
  readonly palate: {
    readonly sweetness: string;
    readonly acidity: string;
    readonly tannin?: string;
    readonly alcohol: string;
    readonly body: string;
    readonly flavorIntensity: string;
    readonly flavorCharacteristics: readonly string[];
    readonly finish: string;
  };
  readonly conclusions: {
    readonly quality: 'Faulty' | 'Poor' | 'Acceptable' | 'Good' | 'Very Good' | 'Outstanding';
    readonly levelOfReadiness: 'Too Young' | 'Ready to Drink' | 'Past its Best';
    readonly suitableFor?: string;
  };
}

// ============================================================================
// EXPORTS - Main Type System
// ============================================================================

// Core Types
export type {
  WineId, UserId, GuildId, EventId, TradeId,
  WineType, WineRarity, RarityTier, WineNature, WineAbility,
  IndividualValues, EffortValues, BaseStats, CalculatedStats
};

// Wine System
export type {
  WineEvolutionChain, Evolution, EvolutionRequirement, EvolutionItem,
  BreedingRequirements, BreedingResult, BreedingCompatibility, BreedingFunction,
  MegaEvolutionData, RegionalForm, AbilityInfo
};

// Collection System  
export type {
  PlayerLevel, ExperienceGains, Badge, Achievement,
  CollectionChallenge, WineDex
};

// Social System
export type {
  Trade, MarketData, UserReputation, Guild, GuildEvent,
  Competition, Battle
};

// Event System
export type {
  GameEvent, EventChallenge, EventRewards, SeasonalModifiers, EventHistory,
  Season, EventType
};

// Utility Types
export type {
  PartialBy, RequiredBy, DeepReadonly, KeysOfType, PickByType, OmitByType,
  NonEmptyArray, ApiResponse
};

// Operations & Validation
export type {
  WineOperations, CollectionQueries, AsyncWineOperations,
  TypedEventEmitter, GameEventHandler,
  ValidationSchema, WineValidators, CollectionValidators,
  SocialValidators, EventValidators, MasterValidators
};

// Constants
export { STATS_CONSTRAINTS, TypeGuards };