/**
 * Performance Load Tests
 * Tests application performance under various load conditions
 */

import { performance } from 'perf_hooks'
import { createMockWine, createMockCollection } from '../setup'
import { WineStorageService } from '@/lib/wineStorage'
import { mockLocalStorage } from '../setup'

// Performance test thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  WINE_CREATION: 10,
  SEARCH_OPERATION: 50,
  FILTER_OPERATION: 30,
  SORT_OPERATION: 20,
  COLLECTION_LOAD: 100,
  LARGE_COLLECTION_LOAD: 500,
  STORAGE_OPERATIONS: 25,
}

describe('Performance Load Tests', () => {
  let localStorage: ReturnType<typeof mockLocalStorage>

  beforeEach(() => {
    localStorage = mockLocalStorage()
    global.localStorage = localStorage as any
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Wine Creation Performance', () => {
    test('should create single wine quickly', () => {
      const startTime = performance.now()
      
      const wine = createMockWine()
      
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.WINE_CREATION)
      expect(wine).toBeDefined()
      expect(wine.name).toBe('Test Wine')
    })

    test('should create 100 wines within threshold', () => {
      const startTime = performance.now()
      
      const wines = Array.from({ length: 100 }, (_, i) => 
        createMockWine({ id: i + 1, name: `Wine ${i + 1}` })
      )
      
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.WINE_CREATION * 10) // 10x threshold for 100 wines
      expect(wines).toHaveLength(100)
    })

    test('should create 1000 wines efficiently', () => {
      const startTime = performance.now()
      
      const wines = Array.from({ length: 1000 }, (_, i) => 
        createMockWine({ id: i + 1, name: `Wine ${i + 1}` })
      )
      
      const endTime = performance.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(1000) // 1 second for 1000 wines
      expect(wines).toHaveLength(1000)
    })
  })

  describe('Storage Performance', () => {
    test('should save wine quickly', () => {
      const wine = createMockWine()
      
      const startTime = performance.now()
      const result = WineStorageService.addWine(wine)
      const endTime = performance.now()
      
      const duration = endTime - startTime
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.STORAGE_OPERATIONS)
      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
    })

    test('should load wines quickly', () => {
      // Setup test data
      const wines = Array.from({ length: 50 }, (_, i) => 
        createMockWine({ id: i + 1, name: `Wine ${i + 1}` })
      )
      
      WineStorageService.saveWines(wines)

      const startTime = performance.now()
      const loadedWines = WineStorageService.getWines()
      const endTime = performance.now()
      
      const duration = endTime - startTime
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.COLLECTION_LOAD)
      expect(loadedWines).toHaveLength(50)
    })

    test('should handle large collection efficiently', () => {
      // Setup large test collection
      const wines = Array.from({ length: 500 }, (_, i) => 
        createMockWine({ id: i + 1, name: `Wine ${i + 1}` })
      )
      
      // Batch save operation
      const saveStartTime = performance.now()
      WineStorageService.saveWines(wines)
      const saveEndTime = performance.now()
      const saveDuration = saveEndTime - saveStartTime

      // Load operation
      const loadStartTime = performance.now()
      const loadedWines = WineStorageService.getWines()
      const loadEndTime = performance.now()
      const loadDuration = loadEndTime - loadStartTime

      expect(saveDuration).toBeLessThan(1000) // 1 second for batch save
      expect(loadDuration).toBeLessThan(PERFORMANCE_THRESHOLDS.LARGE_COLLECTION_LOAD)
      expect(loadedWines).toHaveLength(500)
    })
  })

  describe('Search Performance', () => {
    beforeEach(() => {
      // Setup search test data
      const testWines = [
        createMockWine({ name: 'Château Margaux 2015', region: 'Bordeaux', producer: 'Château Margaux' }),
        createMockWine({ name: 'Dom Pérignon Vintage 2012', region: 'Champagne', producer: 'Dom Pérignon' }),
        createMockWine({ name: 'Screaming Eagle Cabernet 2018', region: 'Napa Valley', producer: 'Screaming Eagle' }),
        createMockWine({ name: 'Barolo Brunate 2017', region: 'Piedmont', producer: 'Giuseppe Rinaldi' }),
      ]

      WineStorageService.saveWines(testWines)
    })

    test('should search by name quickly', () => {
      const startTime = performance.now()
      const allWines = WineStorageService.getWines()
      const results = allWines.filter(wine => wine.name.toLowerCase().includes('château'))
      const endTime = performance.now()
      
      const duration = endTime - startTime
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SEARCH_OPERATION)
      expect(results.length).toBeGreaterThan(0)
    })

    test('should search by region quickly', () => {
      const startTime = performance.now()
      const allWines = WineStorageService.getWines()
      const results = allWines.filter(wine => wine.region.toLowerCase().includes('bordeaux'))
      const endTime = performance.now()
      
      const duration = endTime - startTime
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SEARCH_OPERATION)
      expect(results.length).toBeGreaterThan(0)
    })

    test('should handle empty search results quickly', () => {
      const startTime = performance.now()
      const allWines = WineStorageService.getWines()
      const results = allWines.filter(wine => wine.name.toLowerCase().includes('nonexistentwine'))
      const endTime = performance.now()
      
      const duration = endTime - startTime
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SEARCH_OPERATION)
      expect(results).toHaveLength(0)
    })
  })

  describe('Filter and Sort Performance', () => {
    beforeEach(() => {
      // Setup mixed collection for filtering
      const testWines = [
        ...Array.from({ length: 20 }, (_, i) => createMockWine({ 
          id: i + 1, 
          name: `Red Wine ${i + 1}`, 
          type: 'Red Wine',
          rating: (i % 5) + 1,
          year: 2020 + (i % 5)
        })),
        ...Array.from({ length: 15 }, (_, i) => createMockWine({ 
          id: i + 21, 
          name: `White Wine ${i + 1}`, 
          type: 'White Wine',
          rating: (i % 5) + 1,
          year: 2018 + (i % 7)
        })),
        ...Array.from({ length: 10 }, (_, i) => createMockWine({ 
          id: i + 36, 
          name: `Sparkling Wine ${i + 1}`, 
          type: 'Sparkling Wine',
          rating: (i % 5) + 1,
          year: 2015 + (i % 10)
        })),
      ]

      WineStorageService.saveWines(testWines)
    })

    test('should filter by type quickly', () => {
      const wines = WineStorageService.getWines()
      
      const startTime = performance.now()
      const redWines = wines.filter(wine => wine.type === 'Red Wine')
      const endTime = performance.now()
      
      const duration = endTime - startTime
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.FILTER_OPERATION)
      expect(redWines).toHaveLength(20)
    })

    test('should filter by rating quickly', () => {
      const wines = WineStorageService.getWines()
      
      const startTime = performance.now()
      const highRated = wines.filter(wine => wine.rating >= 4)
      const endTime = performance.now()
      
      const duration = endTime - startTime
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.FILTER_OPERATION)
      expect(highRated.length).toBeGreaterThan(0)
    })

    test('should sort by name quickly', () => {
      const wines = WineStorageService.getWines()
      
      const startTime = performance.now()
      const sortedWines = [...wines].sort((a, b) => a.name.localeCompare(b.name))
      const endTime = performance.now()
      
      const duration = endTime - startTime
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SORT_OPERATION)
      expect(sortedWines[0].name.localeCompare(sortedWines[1].name)).toBeLessThanOrEqual(0)
    })

    test('should sort by rating quickly', () => {
      const wines = WineStorageService.getWines()
      
      const startTime = performance.now()
      const sortedWines = [...wines].sort((a, b) => b.rating - a.rating)
      const endTime = performance.now()
      
      const duration = endTime - startTime
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SORT_OPERATION)
      expect(sortedWines[0].rating).toBeGreaterThanOrEqual(sortedWines[1].rating)
    })
  })

  describe('Memory Usage Tests', () => {
    test('should not cause memory leaks with repeated operations', () => {
      const initialMemory = process.memoryUsage().heapUsed

      // Perform many operations
      for (let i = 0; i < 100; i++) {
        const wine = createMockWine({ id: i, name: `Memory Test Wine ${i}` })
        WineStorageService.addWine(wine)
        const wines = WineStorageService.getWines()
        const results = wines.filter(w => w.name.includes('Memory'))
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024)

      // Should not increase memory by more than 50MB
      expect(memoryIncreaseMB).toBeLessThan(50)
    })
  })

  describe('Collection Statistics Performance', () => {
    test('should calculate collection stats quickly', () => {
      const wines = Array.from({ length: 100 }, (_, i) => 
        createMockWine({ 
          id: i + 1, 
          name: `Wine ${i + 1}`,
          rating: (i % 5) + 1,
          experiencePoints: (i + 1) * 10,
          region: `Region ${(i % 10) + 1}`,
          grape: `Grape ${(i % 8) + 1}`,
          producer: `Producer ${(i % 15) + 1}`
        })
      )

      WineStorageService.saveWines(wines)

      const startTime = performance.now()
      const collection = createMockCollection(wines)
      const endTime = performance.now()
      
      const duration = endTime - startTime
      expect(duration).toBeLessThan(50) // 50ms threshold for stats calculation
      expect(collection.totalWines).toBe(100)
      expect(collection.uniqueRegions).toBe(10)
      expect(collection.uniqueGrapes).toBe(8)
      expect(collection.uniqueProducers).toBe(15)
    })
  })

  describe('Concurrent Operations Performance', () => {
    test('should handle sequential operations efficiently', () => {
      const wines = Array.from({ length: 20 }, (_, i) => 
        createMockWine({ id: i + 1, name: `Sequential Wine ${i + 1}` })
      )

      const startTime = performance.now()
      
      // Execute saves sequentially (localStorage is synchronous)
      wines.forEach(wine => WineStorageService.addWine(wine))
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(500) // 500ms for 20 saves
      
      const allWines = WineStorageService.getWines()
      expect(allWines.length).toBeGreaterThanOrEqual(20)
    })

    test('should handle repeated reads efficiently', () => {
      // Setup test data
      const wine = createMockWine()
      WineStorageService.addWine(wine)

      const startTime = performance.now()
      
      // Execute reads repeatedly
      const results = Array.from({ length: 10 }, () => WineStorageService.getWines())
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(200) // 200ms for 10 reads
      results.forEach(wines => expect(wines.length).toBeGreaterThan(0))
    })
  })
})