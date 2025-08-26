// Test setup utilities for Wine Pokédex tests

export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    store,
  }
}

export const createMockWine = (overrides = {}) => ({
  id: 1,
  name: 'Test Wine',
  year: 2020,
  region: 'Test Region',
  producer: 'Test Producer',
  type: 'Red Wine' as const,
  grape: 'Test Grape',
  rating: 4,
  tastingNotes: 'Test notes',
  captured: true,
  dateAdded: new Date('2024-01-01'),
  rarity: 'Common' as const,
  experiencePoints: 100,
  ...overrides,
})

// Test to satisfy Jest requirement
describe('Test Setup Utilities', () => {
  test('createMockWine creates a wine with default values', () => {
    const wine = createMockWine()
    expect(wine.name).toBe('Test Wine')
    expect(wine.type).toBe('Red Wine')
    expect(wine.rating).toBe(4)
  })

  test('createMockWine accepts overrides', () => {
    const wine = createMockWine({ name: 'Custom Wine', rating: 5 })
    expect(wine.name).toBe('Custom Wine')
    expect(wine.rating).toBe(5)
    expect(wine.type).toBe('Red Wine') // still has defaults
  })

  test('mockLocalStorage provides localStorage interface', () => {
    const localStorage = mockLocalStorage()
    
    localStorage.setItem('test', 'value')
    expect(localStorage.getItem('test')).toBe('value')
    
    localStorage.removeItem('test')
    expect(localStorage.getItem('test')).toBeNull()
  })
})

export const createMockCollection = (wines = [createMockWine()]) => ({
  totalWines: wines.length,
  totalExperience: wines.reduce((sum, wine) => sum + wine.experiencePoints, 0),
  averageRating: wines.reduce((sum, wine) => sum + wine.rating, 0) / wines.length,
  uniqueRegions: new Set(wines.map(wine => wine.region)).size,
  uniqueGrapes: new Set(wines.map(wine => wine.grape)).size,
  uniqueProducers: new Set(wines.map(wine => wine.producer)).size,
  vintageRange: {
    oldest: Math.min(...wines.map(wine => wine.year)),
    newest: Math.max(...wines.map(wine => wine.year))
  },
  rarityDistribution: wines.reduce((acc, wine) => {
    acc[wine.rarity] = (acc[wine.rarity] || 0) + 1
    return acc
  }, {} as Record<string, number>),
  level: Math.floor(Math.sqrt(wines.reduce((sum, wine) => sum + wine.experiencePoints, 0) / 100)) + 1,
  badges: 0
})