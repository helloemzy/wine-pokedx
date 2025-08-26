/**
 * Test data fixtures for E2E tests
 * Provides consistent test data for Pokemon-style wine collection scenarios
 */

import type { Wine, CollectionBadge } from '../../src/types/wine'

export const mockWineData = {
  legendary: {
    name: 'Château Margaux',
    year: 2015,
    region: 'Bordeaux, France',
    producer: 'Château Margaux',
    type: 'Red Wine' as const,
    grape: 'Cabernet Sauvignon Blend',
    rating: 5,
    tastingNotes: 'Complex aromas of blackcurrant, cedar, and graphite with silky tannins',
    captured: true,
    rarity: 'Legendary' as const,
    abv: 13.5,
    appearance: {
      intensity: 'Deep' as const,
      color: 'Garnet with purple hues'
    },
    nose: {
      intensity: 'Pronounced' as const,
      primaryAromas: ['blackcurrant', 'cassis', 'violet'],
      secondaryAromas: ['cedar', 'tobacco', 'graphite'],
      tertiaryAromas: []
    },
    palate: {
      sweetness: 'Dry' as const,
      acidity: 'Medium(+)' as const,
      tannin: 'Medium(+)' as const,
      alcohol: 'Medium' as const,
      body: 'Full' as const,
      finish: 'Long' as const
    }
  },

  epic: {
    name: 'Dom Pérignon Vintage',
    year: 2012,
    region: 'Champagne, France',
    producer: 'Dom Pérignon',
    type: 'Sparkling' as const,
    grape: 'Chardonnay Blend',
    rating: 5,
    tastingNotes: 'Elegant bubbles with citrus and brioche notes, long mineral finish',
    captured: true,
    rarity: 'Epic' as const,
    abv: 12.5
  },

  rare: {
    name: 'Screaming Eagle Cabernet',
    year: 2018,
    region: 'Napa Valley, California',
    producer: 'Screaming Eagle',
    type: 'Red Wine' as const,
    grape: 'Cabernet Sauvignon',
    rating: 5,
    tastingNotes: 'Intense dark fruit, chocolate, and spice with velvety tannins',
    captured: true,
    rarity: 'Rare' as const,
    abv: 15.2
  },

  uncommon: {
    name: 'Cloudy Bay Sauvignon Blanc',
    year: 2021,
    region: 'Marlborough, New Zealand',
    producer: 'Cloudy Bay',
    type: 'White Wine' as const,
    grape: 'Sauvignon Blanc',
    rating: 4,
    tastingNotes: 'Crisp citrus and tropical fruit with herbaceous notes',
    captured: true,
    rarity: 'Uncommon' as const,
    abv: 13.0
  },

  common: {
    name: 'Kendall-Jackson Vintners Reserve',
    year: 2020,
    region: 'California, USA',
    producer: 'Kendall-Jackson',
    type: 'White Wine' as const,
    grape: 'Chardonnay',
    rating: 3,
    tastingNotes: 'Butter and oak with tropical fruit flavors',
    captured: true,
    rarity: 'Common' as const,
    abv: 13.5
  }
}

export const mockBadgeData: Omit<CollectionBadge, 'earnedDate'>[] = [
  {
    id: 'first_wine',
    name: 'First Catch',
    description: 'Added your first wine to the collection',
    icon: '🍷',
    category: 'Collection'
  },
  {
    id: 'regional_bordeaux_france',
    name: 'Bordeaux Explorer',
    description: 'Collected 5 wines from Bordeaux, France',
    icon: '🗺️',
    category: 'Regional'
  },
  {
    id: 'grape_cabernet_sauvignon',
    name: 'Cabernet Sauvignon Specialist',
    description: 'Collected 3 wines made from Cabernet Sauvignon',
    icon: '🍇',
    category: 'Grape'
  },
  {
    id: 'vintage_collector',
    name: 'Vintage Collector',
    description: 'Added a wine that\'s 20+ years old',
    icon: '🏺',
    category: 'Vintage'
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Awarded a perfect 5-star rating',
    icon: '⭐',
    category: 'Tasting'
  },
  {
    id: 'collection_10',
    name: '10 Wine Master',
    description: 'Collected 10 wines',
    icon: '🏆',
    category: 'Collection'
  }
]

export const testScenarios = {
  emptyCollection: {
    wines: [],
    expectedMessage: 'Your Wine Collection is Empty'
  },
  
  smallCollection: {
    wines: [mockWineData.common, mockWineData.uncommon],
    expectedStats: {
      totalWines: 2,
      averageRating: 3.5,
      uniqueRegions: 2,
      uniqueGrapes: 2
    }
  },
  
  diverseCollection: {
    wines: Object.values(mockWineData),
    expectedStats: {
      totalWines: 5,
      averageRating: 4.4,
      uniqueRegions: 4,
      uniqueGrapes: 4
    }
  },
  
  rarityShowcase: {
    wines: [mockWineData.legendary, mockWineData.epic, mockWineData.rare],
    expectedHighValueCollection: true
  }
}

export const searchTestCases = [
  {
    query: 'Château',
    expectedResults: ['Château Margaux'],
    expectedCount: 1
  },
  {
    query: 'France',
    expectedResults: ['Château Margaux', 'Dom Pérignon Vintage'],
    expectedCount: 2
  },
  {
    query: 'Cabernet',
    expectedResults: ['Château Margaux', 'Screaming Eagle Cabernet'],
    expectedCount: 2
  },
  {
    query: '2015',
    expectedResults: ['Château Margaux'],
    expectedCount: 1
  },
  {
    query: 'nonexistent',
    expectedResults: [],
    expectedCount: 0
  }
]

export const filterTestCases = [
  {
    filter: { type: 'Red Wine' },
    expectedResults: ['Château Margaux', 'Screaming Eagle Cabernet'],
    expectedCount: 2
  },
  {
    filter: { type: 'White Wine' },
    expectedResults: ['Cloudy Bay Sauvignon Blanc', 'Kendall-Jackson Vintners Reserve'],
    expectedCount: 2
  },
  {
    filter: { type: 'Sparkling' },
    expectedResults: ['Dom Pérignon Vintage'],
    expectedCount: 1
  },
  {
    filter: { rarity: 'Legendary' },
    expectedResults: ['Château Margaux'],
    expectedCount: 1
  },
  {
    filter: { rarity: 'Common' },
    expectedResults: ['Kendall-Jackson Vintners Reserve'],
    expectedCount: 1
  },
  {
    filter: { yearRange: [2018, 2021] },
    expectedResults: ['Screaming Eagle Cabernet', 'Cloudy Bay Sauvignon Blanc', 'Kendall-Jackson Vintners Reserve'],
    expectedCount: 3
  },
  {
    filter: { ratingMin: 5 },
    expectedResults: ['Château Margaux', 'Dom Pérignon Vintage', 'Screaming Eagle Cabernet'],
    expectedCount: 3
  }
]

export const viewModeTestCases = [
  {
    mode: 'cards',
    expectedLayout: 'trading-cards',
    interactionTest: 'flip-cards'
  },
  {
    mode: 'grid',
    expectedLayout: 'grid-layout',
    interactionTest: 'hover-effects'
  },
  {
    mode: 'list',
    expectedLayout: 'list-layout',
    interactionTest: 'compact-view'
  }
]

// Performance test data
export const performanceTestData = {
  largeCollection: Array.from({ length: 100 }, (_, i) => ({
    ...mockWineData.common,
    id: i + 1,
    name: `Wine ${i + 1}`,
    year: 2000 + (i % 22), // Vary years from 2000-2021
    region: `Region ${i % 10}`, // 10 different regions
    producer: `Producer ${i % 15}`, // 15 different producers
    grape: `Grape ${i % 20}`, // 20 different grapes
    rating: 1 + (i % 5), // Ratings 1-5
    rarity: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][i % 5] as any
  })),
  
  stressTestCollection: Array.from({ length: 1000 }, (_, i) => ({
    ...mockWineData.common,
    id: i + 1,
    name: `Stress Test Wine ${i + 1}`,
    year: 1980 + (i % 42), // Wide year range
    region: `Region ${i % 50}`,
    producer: `Producer ${i % 100}`,
    grape: `Grape ${i % 30}`
  }))
}

export const mobileTestData = {
  viewportSizes: [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12 Pro', width: 390, height: 844 },
    { name: 'Pixel 5', width: 393, height: 851 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 }
  ],
  
  touchInteractions: [
    'tap-wine-card',
    'swipe-between-views',
    'pinch-zoom-trading-card',
    'long-press-context-menu'
  ]
}