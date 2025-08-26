/**
 * Test Data Factory for Wine Pokédex
 * Provides factory methods for creating consistent test data with Pokemon-style attributes
 */

import type { Wine, CollectionBadge, TastingSession } from '../../types/wine'

// Random number generators for consistent but varied test data
const random = {
  int: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
  choice: <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)],
  float: (min: number, max: number) => Math.random() * (max - min) + min,
  bool: () => Math.random() > 0.5,
  id: () => Date.now() + Math.floor(Math.random() * 10000)
}

// Wine classification data based on Pokemon-style system
export const WINE_CLASSIFICATION = {
  types: ['Red Wine', 'White Wine', 'Rosé', 'Sparkling', 'Dessert Wine', 'Fortified Wine'] as const,
  
  rarities: {
    common: { name: 'Common', weight: 70, baseXP: 100 },
    uncommon: { name: 'Uncommon', weight: 20, baseXP: 150 },
    rare: { name: 'Rare', weight: 7, baseXP: 200 },
    epic: { name: 'Epic', weight: 2.5, baseXP: 300 },
    legendary: { name: 'Legendary', weight: 0.4, baseXP: 500 },
  },

  regions: [
    'Bordeaux, France', 'Burgundy, France', 'Champagne, France', 'Loire Valley, France',
    'Rhône Valley, France', 'Alsace, France', 'Languedoc, France', 'Provence, France',
    'Tuscany, Italy', 'Piedmont, Italy', 'Veneto, Italy', 'Sicily, Italy',
    'Rioja, Spain', 'Ribera del Duero, Spain', 'Catalonia, Spain', 'Andalusia, Spain',
    'Mosel, Germany', 'Rhine Valley, Germany', 'Baden, Germany', 'Württemberg, Germany',
    'Napa Valley, California', 'Sonoma County, California', 'Central Coast, California',
    'Willamette Valley, Oregon', 'Columbia Valley, Washington', 'Finger Lakes, New York',
    'Barossa Valley, Australia', 'Hunter Valley, Australia', 'Margaret River, Australia',
    'Marlborough, New Zealand', 'Central Otago, New Zealand', 'Hawke\'s Bay, New Zealand',
    'Stellenbosch, South Africa', 'Paarl, South Africa', 'Constantia, South Africa',
    'Mendoza, Argentina', 'Maipo Valley, Chile', 'Colchagua Valley, Chile',
    'Douro Valley, Portugal', 'Vinho Verde, Portugal', 'Tokaj, Hungary'
  ],

  grapes: [
    // Red grapes
    'Cabernet Sauvignon', 'Merlot', 'Pinot Noir', 'Syrah/Shiraz', 'Grenache', 'Sangiovese',
    'Tempranillo', 'Nebbiolo', 'Barbera', 'Malbec', 'Carmenère', 'Zinfandel', 'Petit Verdot',
    'Cabernet Franc', 'Gamay', 'Mourvedre', 'Carignan', 'Petite Sirah',
    // White grapes
    'Chardonnay', 'Sauvignon Blanc', 'Riesling', 'Pinot Grigio/Pinot Gris', 'Gewürztraminer',
    'Albariño', 'Vermentino', 'Chenin Blanc', 'Sémillon', 'Viognier', 'Roussanne', 'Marsanne',
    'Grüner Veltliner', 'Assyrtiko', 'Moscato', 'Trebbiano', 'Garganega'
  ],

  producers: [
    'Château Margaux', 'Château Latour', 'Château Lafite Rothschild', 'Château Mouton Rothschild',
    'Château Haut-Brion', 'Domaine de la Romanée-Conti', 'Domaine Leroy', 'Domaine Henri Jayer',
    'Domaine Armand Rousseau', 'Dom Pérignon', 'Krug', 'Louis Roederer', 'Pol Roger',
    'Screaming Eagle', 'Harlan Estate', 'Sine Qua Non', 'Caymus Vineyards', 'Opus One',
    'Penfolds', 'Henschke', 'Leeuwin Estate', 'Cloudy Bay', 'Felton Road', 'Pegasus Bay',
    'Klein Constantia', 'Kanonkop', 'Catena Zapata', 'Concha y Toro', 'Santa Rita',
    'Quinta do Noval', 'Taylor Fladgate', 'Royal Tokaji', 'Egon Müller', 'Dr. Loosen'
  ]
} as const

// WSET tasting note options for realistic professional assessments
export const WSET_OPTIONS = {
  appearance: {
    intensity: ['Pale', 'Medium', 'Deep'] as const,
    colors: {
      red: ['Ruby', 'Garnet', 'Tawny', 'Purple', 'Brick'],
      white: ['Lemon-green', 'Lemon', 'Gold', 'Amber', 'Brown'],
      rosé: ['Pink', 'Salmon', 'Orange', 'Onion-skin'],
      sparkling: ['Pale lemon', 'Medium lemon', 'Gold with bubbles']
    }
  },
  
  nose: {
    intensity: ['Light', 'Medium(-)', 'Medium', 'Medium(+)', 'Pronounced'] as const,
    primaryAromas: [
      'blackcurrant', 'blackberry', 'plum', 'cherry', 'strawberry', 'raspberry',
      'lemon', 'lime', 'apple', 'pear', 'peach', 'apricot', 'tropical fruit',
      'violet', 'rose', 'lavender', 'herbs', 'pepper', 'mineral'
    ],
    secondaryAromas: [
      'vanilla', 'oak', 'toast', 'smoke', 'leather', 'tobacco', 'cedar',
      'butter', 'cream', 'yeast', 'bread', 'biscuit', 'honey', 'caramel'
    ],
    tertiaryAromas: [
      'dried fruit', 'prune', 'fig', 'coffee', 'chocolate', 'truffle',
      'mushroom', 'forest floor', 'petrol', 'kerosene', 'wet stone'
    ]
  },

  palate: {
    sweetness: ['Bone Dry', 'Dry', 'Off-Dry', 'Medium-Dry', 'Medium-Sweet', 'Sweet', 'Lusciously Sweet'] as const,
    acidity: ['Low', 'Medium(-)', 'Medium', 'Medium(+)', 'High'] as const,
    tannin: ['Low', 'Medium(-)', 'Medium', 'Medium(+)', 'High'] as const,
    alcohol: ['Low', 'Medium', 'Medium(+)', 'High'] as const,
    body: ['Light', 'Medium(-)', 'Medium', 'Medium(+)', 'Full'] as const,
    finish: ['Short', 'Medium(-)', 'Medium', 'Medium(+)', 'Long'] as const
  }
}

/**
 * Wine Factory - Creates realistic wine data with Pokemon-style attributes
 */
export class WineFactory {
  /**
   * Create a wine with specific overrides
   */
  static create(overrides: Partial<Wine> = {}): Wine {
    const rarity = overrides.rarity || this.getRandomRarity()
    const type = overrides.type || random.choice(WINE_CLASSIFICATION.types)
    const region = overrides.region || random.choice(WINE_CLASSIFICATION.regions)
    const grape = overrides.grape || random.choice(WINE_CLASSIFICATION.grapes)
    const producer = overrides.producer || random.choice(WINE_CLASSIFICATION.producers)
    const year = overrides.year || random.int(1990, new Date().getFullYear())
    const rating = overrides.rating || this.getRandomRating(rarity)
    
    return {
      id: random.id(),
      name: overrides.name || this.generateWineName(producer, region),
      year,
      region,
      producer,
      type,
      grape,
      rating,
      tastingNotes: overrides.tastingNotes || this.generateTastingNotes(type, grape),
      captured: overrides.captured ?? true,
      dateAdded: new Date(),
      rarity: rarity as Wine['rarity'],
      experiencePoints: this.calculateExperiencePoints(rarity, rating, year),
      badges: overrides.badges || [],
      abv: overrides.abv || this.getRandomABV(type),
      appearance: overrides.appearance || this.generateAppearance(type),
      nose: overrides.nose || this.generateNose(),
      palate: overrides.palate || this.generatePalate(type),
      ...overrides
    }
  }

  /**
   * Create multiple wines at once
   */
  static createMany(count: number, baseOverrides: Partial<Wine> = {}): Wine[] {
    return Array.from({ length: count }, (_, index) => 
      this.create({ ...baseOverrides, id: random.id() + index })
    )
  }

  /**
   * Create a wine of specific rarity
   */
  static createRarity(rarity: keyof typeof WINE_CLASSIFICATION.rarities, overrides: Partial<Wine> = {}): Wine {
    return this.create({ ...overrides, rarity: WINE_CLASSIFICATION.rarities[rarity].name as Wine['rarity'] })
  }

  /**
   * Create a collection showcasing all rarities
   */
  static createRarityShowcase(): Wine[] {
    return Object.keys(WINE_CLASSIFICATION.rarities).map(rarity => 
      this.createRarity(rarity as keyof typeof WINE_CLASSIFICATION.rarities)
    )
  }

  /**
   * Create wines from a specific region
   */
  static createFromRegion(region: string, count: number = 5): Wine[] {
    return this.createMany(count, { region })
  }

  /**
   * Create wines from a specific grape variety
   */
  static createFromGrape(grape: string, count: number = 3): Wine[] {
    return this.createMany(count, { grape })
  }

  /**
   * Create vintage wines (old wines for age bonuses)
   */
  static createVintageCollection(): Wine[] {
    const currentYear = new Date().getFullYear()
    return [
      this.create({ year: currentYear - 25, rarity: 'Legendary' }), // 25 years old
      this.create({ year: currentYear - 20, rarity: 'Epic' }), // 20 years old
      this.create({ year: currentYear - 15, rarity: 'Rare' }), // 15 years old
      this.create({ year: currentYear - 10, rarity: 'Uncommon' }), // 10 years old
      this.create({ year: currentYear - 5, rarity: 'Common' }), // 5 years old
    ]
  }

  /**
   * Create a performance testing dataset
   */
  static createPerformanceDataset(size: number): Wine[] {
    return Array.from({ length: size }, (_, i) => this.create({
      id: i + 1,
      name: `Performance Test Wine ${i + 1}`,
      region: WINE_CLASSIFICATION.regions[i % WINE_CLASSIFICATION.regions.length],
      grape: WINE_CLASSIFICATION.grapes[i % WINE_CLASSIFICATION.grapes.length],
      producer: WINE_CLASSIFICATION.producers[i % WINE_CLASSIFICATION.producers.length]
    }))
  }

  // Private helper methods

  private static getRandomRarity(): string {
    const roll = random.float(0, 100)
    let cumulative = 0
    
    for (const [, rarity] of Object.entries(WINE_CLASSIFICATION.rarities)) {
      cumulative += rarity.weight
      if (roll <= cumulative) {
        return rarity.name
      }
    }
    
    return 'Common' // Fallback
  }

  private static getRandomRating(rarity: string): number {
    // Higher rarity tends to have higher ratings
    const baseRating = {
      'Common': 2,
      'Uncommon': 3,
      'Rare': 4,
      'Epic': 4,
      'Legendary': 5
    }[rarity] || 3

    // Add some variation
    const variation = random.int(-1, 1)
    return Math.max(1, Math.min(5, baseRating + variation))
  }

  private static calculateExperiencePoints(rarity: string, rating: number, year: number): number {
    const rarityMultiplier = {
      'Common': 1,
      'Uncommon': 1.5,
      'Rare': 2,
      'Epic': 3,
      'Legendary': 5
    }[rarity] || 1

    let points = 100 * rarityMultiplier

    // Age bonus
    const currentYear = new Date().getFullYear()
    const age = currentYear - year
    if (age > 20) points += 50
    else if (age > 10) points += 25
    else if (age > 5) points += 10

    // Rating bonus
    if (rating >= 4) points += 25
    if (rating === 5) points += 50

    return Math.round(points)
  }

  private static getRandomABV(type: string): number {
    const ranges = {
      'Red Wine': [12.5, 15.5],
      'White Wine': [11.5, 14.0],
      'Rosé': [11.5, 13.5],
      'Sparkling': [11.0, 13.0],
      'Dessert Wine': [8.0, 15.0],
      'Fortified Wine': [15.0, 20.0]
    }

    const [min, max] = ranges[type as keyof typeof ranges] || [12, 14]
    return Math.round(random.float(min, max) * 10) / 10 // Round to 1 decimal
  }

  private static generateWineName(producer: string, region: string): string {
    const styles = [
      `${producer}`,
      `${producer} Reserve`,
      `${producer} Single Vineyard`,
      `${producer} Estate`,
      `${region.split(',')[0]} Selection`,
    ]

    return random.choice(styles)
  }

  private static generateTastingNotes(type: string, _grape: string): string {
    const descriptors = {
      'Red Wine': [
        'Rich dark fruit flavors with hints of oak and spice',
        'Full-bodied with velvety tannins and a long finish',
        'Complex aromas of blackcurrant, cedar, and vanilla',
        'Elegant structure with balanced acidity and minerality'
      ],
      'White Wine': [
        'Crisp and refreshing with citrus and stone fruit notes',
        'Bright acidity with hints of tropical fruit and minerals',
        'Clean and vibrant with floral aromatics',
        'Well-balanced with a clean, persistent finish'
      ],
      'Sparkling': [
        'Elegant bubbles with crisp citrus and brioche notes',
        'Fresh and lively with fine mousse and mineral finish',
        'Complex with toast and yeast character',
        'Celebration-worthy with persistent effervescence'
      ],
      'Rosé': [
        'Fresh strawberry and rose petal aromatics',
        'Dry and crisp with summer fruit flavors',
        'Light and refreshing with floral notes',
        'Perfect balance of fruit and acidity'
      ]
    }

    const typeDescriptors = descriptors[type as keyof typeof descriptors] || descriptors['Red Wine']
    return random.choice(typeDescriptors)
  }

  private static generateAppearance(type: string): Wine['appearance'] {
    const colors = WSET_OPTIONS.appearance.colors
    const wineTypeColors = colors[type.toLowerCase().replace(' wine', '') as keyof typeof colors] || colors.red

    return {
      intensity: random.choice(WSET_OPTIONS.appearance.intensity),
      color: random.choice(wineTypeColors)
    }
  }

  private static generateNose(): Wine['nose'] {
    return {
      intensity: random.choice(WSET_OPTIONS.nose.intensity),
      primaryAromas: this.selectRandomAromas(WSET_OPTIONS.nose.primaryAromas, 2, 4),
      secondaryAromas: this.selectRandomAromas(WSET_OPTIONS.nose.secondaryAromas, 1, 3),
      tertiaryAromas: random.bool() ? this.selectRandomAromas(WSET_OPTIONS.nose.tertiaryAromas, 0, 2) : []
    }
  }

  private static generatePalate(type: string): Wine['palate'] {
    const isRed = type === 'Red Wine'
    
    return {
      sweetness: random.choice(WSET_OPTIONS.palate.sweetness),
      acidity: random.choice(WSET_OPTIONS.palate.acidity),
      ...(isRed && { tannin: random.choice(WSET_OPTIONS.palate.tannin) }),
      alcohol: random.choice(WSET_OPTIONS.palate.alcohol),
      body: random.choice(WSET_OPTIONS.palate.body),
      finish: random.choice(WSET_OPTIONS.palate.finish)
    }
  }

  private static selectRandomAromas(aromas: string[], min: number, max: number): string[] {
    const count = random.int(min, max)
    const shuffled = [...aromas].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }
}

// Tests to satisfy Jest requirement
describe('Wine Factory', () => {
  test('creates a wine with default properties', () => {
    const wine = WineFactory.create()
    
    expect(wine).toHaveProperty('id')
    expect(wine).toHaveProperty('name')
    expect(wine).toHaveProperty('year')
    expect(wine).toHaveProperty('region')
    expect(wine).toHaveProperty('type')
    expect(wine.rating).toBeGreaterThanOrEqual(1)
    expect(wine.rating).toBeLessThanOrEqual(5)
    expect(wine.experiencePoints).toBeGreaterThan(0)
  })

  test('accepts overrides correctly', () => {
    const overrides = {
      name: 'Test Wine',
      rating: 5,
      year: 2020,
      type: 'Red Wine' as const
    }
    
    const wine = WineFactory.create(overrides)
    
    expect(wine.name).toBe('Test Wine')
    expect(wine.rating).toBe(5)
    expect(wine.year).toBe(2020)
    expect(wine.type).toBe('Red Wine')
  })

  test('creates multiple wines', () => {
    const wines = WineFactory.createMany(5)
    
    expect(wines).toHaveLength(5)
    wines.forEach(wine => {
      expect(wine).toHaveProperty('id')
      expect(wine).toHaveProperty('name')
    })
  })

  test('creates wines of specific rarity', () => {
    const legendary = WineFactory.createRarity('legendary')
    expect(legendary.rarity).toBe('Legendary')
    
    const common = WineFactory.createRarity('common')
    expect(common.rarity).toBe('Common')
  })

  test('creates rarity showcase with all rarities', () => {
    const showcase = WineFactory.createRarityShowcase()
    
    expect(showcase).toHaveLength(5)
    const rarities = showcase.map(wine => wine.rarity)
    expect(rarities).toContain('Common')
    expect(rarities).toContain('Legendary')
  })
})

describe('Badge Factory', () => {
  test('creates a badge with default properties', () => {
    const badge = BadgeFactory.create()
    
    expect(badge).toHaveProperty('id')
    expect(badge).toHaveProperty('name')
    expect(badge).toHaveProperty('description')
    expect(badge).toHaveProperty('icon')
    expect(badge).toHaveProperty('category')
  })

  test('creates collection milestone badges', () => {
    const milestones = BadgeFactory.createCollectionMilestones()
    
    expect(milestones.length).toBeGreaterThan(0)
    expect(milestones[0].category).toBe('Collection')
  })
})

describe('Test Data Seeder', () => {
  test('creates starter collection', () => {
    const data = TestDataSeeder.createStarterCollection()
    
    expect(data.wines).toHaveLength(5)
    expect(data.badges.length).toBeGreaterThan(0)
    expect(data.sessions).toHaveLength(1)
  })

  test('creates diverse collection', () => {
    const data = TestDataSeeder.createDiverseCollection()
    
    expect(data.wines.length).toBeGreaterThan(10)
    expect(data.badges.length).toBeGreaterThan(5)
    expect(data.sessions.length).toBeGreaterThan(0)
  })
})

/**
 * Badge Factory - Creates collection badges
 */
export class BadgeFactory {
  static create(overrides: Partial<CollectionBadge> = {}): CollectionBadge {
    return {
      id: overrides.id || `badge_${random.id()}`,
      name: overrides.name || 'Test Badge',
      description: overrides.description || 'Test badge description',
      icon: overrides.icon || '🏆',
      earnedDate: new Date(),
      category: overrides.category || 'Collection',
      ...overrides
    }
  }

  static createCollectionMilestones(): CollectionBadge[] {
    const milestones = [1, 5, 10, 25, 50, 100, 200, 500]
    return milestones.map(count => this.create({
      id: `collection_${count}`,
      name: `${count} Wine${count > 1 ? 's' : ''} Master`,
      description: `Collected ${count} wine${count > 1 ? 's' : ''}`,
      icon: count === 1 ? '🍷' : count < 50 ? '🏆' : '👑',
      category: 'Collection'
    }))
  }

  static createRegionalBadges(regions: string[] = WINE_CLASSIFICATION.regions.slice(0, 10)): CollectionBadge[] {
    return regions.map(region => this.create({
      id: `regional_${region.replace(/\s+/g, '_').toLowerCase()}`,
      name: `${region} Explorer`,
      description: `Collected 5 wines from ${region}`,
      icon: '🗺️',
      category: 'Regional'
    }))
  }

  static createGrapeBadges(grapes: string[] = WINE_CLASSIFICATION.grapes.slice(0, 10)): CollectionBadge[] {
    return grapes.map(grape => this.create({
      id: `grape_${grape.replace(/\s+/g, '_').toLowerCase()}`,
      name: `${grape} Specialist`,
      description: `Collected 3 wines made from ${grape}`,
      icon: '🍇',
      category: 'Grape'
    }))
  }
}

/**
 * Tasting Session Factory - Creates wine tasting events
 */
export class TastingSessionFactory {
  static create(wines: Wine[], overrides: Partial<TastingSession> = {}): TastingSession {
    return {
      id: overrides.id || `session_${random.id()}`,
      date: new Date(),
      wines,
      theme: overrides.theme || random.choice([
        'Bordeaux Comparison',
        'Old World vs New World',
        'Vintage Vertical',
        'Grape Variety Focus',
        'Regional Exploration'
      ]),
      notes: overrides.notes || 'Comprehensive tasting session with detailed wine evaluation',
      participants: overrides.participants || ['Wine Enthusiast'],
      location: overrides.location || 'Wine Cellar',
      ...overrides
    }
  }
}

/**
 * Test Data Seeder - Comprehensive test data management
 */
export class TestDataSeeder {
  /**
   * Create a small starter collection for basic tests
   */
  static createStarterCollection(): {
    wines: Wine[]
    badges: CollectionBadge[]
    sessions: TastingSession[]
  } {
    const wines = [
      WineFactory.createRarity('legendary'),
      WineFactory.createRarity('epic'),
      WineFactory.createRarity('rare'),
      WineFactory.createRarity('uncommon'),
      WineFactory.createRarity('common'),
    ]

    return {
      wines,
      badges: BadgeFactory.createCollectionMilestones().slice(0, 3),
      sessions: [TastingSessionFactory.create(wines.slice(0, 3))]
    }
  }

  /**
   * Create a diverse collection for comprehensive tests
   */
  static createDiverseCollection(): {
    wines: Wine[]
    badges: CollectionBadge[]
    sessions: TastingSession[]
  } {
    const wines = [
      ...WineFactory.createRarityShowcase(),
      ...WineFactory.createFromRegion('Bordeaux, France', 5),
      ...WineFactory.createFromGrape('Pinot Noir', 3),
      ...WineFactory.createVintageCollection(),
    ]

    const badges = [
      ...BadgeFactory.createCollectionMilestones().slice(0, 5),
      ...BadgeFactory.createRegionalBadges(['Bordeaux, France', 'Burgundy, France']),
      ...BadgeFactory.createGrapeBadges(['Pinot Noir', 'Cabernet Sauvignon'])
    ]

    return {
      wines,
      badges,
      sessions: [
        TastingSessionFactory.create(wines.slice(0, 5), { theme: 'Rarity Showcase' }),
        TastingSessionFactory.create(wines.filter(w => w.region.includes('Bordeaux')), { theme: 'Bordeaux Focus' })
      ]
    }
  }

  /**
   * Create performance testing dataset
   */
  static createPerformanceCollection(size: number = 1000): Wine[] {
    return WineFactory.createPerformanceDataset(size)
  }

  /**
   * Create edge case scenarios for robust testing
   */
  static createEdgeCaseCollection(): Wine[] {
    return [
      // Extreme values
      WineFactory.create({ name: '', rating: 0, year: 1800 }), // Minimal data
      WineFactory.create({ 
        name: 'Extremely Long Wine Name That Should Test Text Overflow and Truncation Behavior In The User Interface Components',
        rating: 5,
        year: new Date().getFullYear() + 10 // Future year
      }),
      WineFactory.create({ 
        tastingNotes: 'Very '.repeat(100) + 'long tasting notes that should test text handling',
        abv: 0.5 // Very low alcohol
      }),
      WineFactory.create({ abv: 25.0 }), // Very high alcohol
      
      // Special characters
      WineFactory.create({ 
        name: 'Château Pétrus & Co. №1 (50%)',
        producer: 'Müller-Thurgau Weingut',
        region: 'Würzburg, Deutschland'
      }),
      
      // Boundary conditions
      WineFactory.create({ year: 1900, rating: 1 }), // Old + low rating
      WineFactory.create({ year: new Date().getFullYear(), rating: 5 }), // New + high rating
    ]
  }
}