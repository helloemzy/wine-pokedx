/**
 * Memory Usage Benchmarks
 * Tests memory efficiency and identifies potential leaks
 */

import { performance } from 'perf_hooks'
import { createMockWine, mockLocalStorage } from '../setup'

// Memory test thresholds (in MB)
const MEMORY_THRESHOLDS = {
  SINGLE_WINE_CREATION: 1,
  BATCH_WINE_CREATION: 10,
  LARGE_COLLECTION: 50,
  SEARCH_OPERATIONS: 5,
  REPEATED_OPERATIONS: 20,
}

// Helper function to get memory usage in MB
const getMemoryUsageMB = () => {
  const usage = process.memoryUsage()
  return {
    heapUsed: usage.heapUsed / (1024 * 1024),
    heapTotal: usage.heapTotal / (1024 * 1024),
    rss: usage.rss / (1024 * 1024),
  }
}

// Helper function to force garbage collection
const forceGarbageCollection = () => {
  if (global.gc) {
    global.gc()
  } else {
    // Simulate GC pressure
    const dummy = new Array(1000000).fill('x')
    dummy.splice(0, dummy.length)
  }
}

describe('Memory Usage Benchmarks', () => {
  let localStorage: ReturnType<typeof mockLocalStorage>

  beforeEach(() => {
    localStorage = mockLocalStorage()
    global.localStorage = localStorage as any
    forceGarbageCollection()
  })

  afterEach(() => {
    localStorage.clear()
    forceGarbageCollection()
  })

  describe('Wine Object Memory Usage', () => {
    test('should use minimal memory for single wine creation', () => {
      const initialMemory = getMemoryUsageMB()
      
      const wine = createMockWine()
      
      const finalMemory = getMemoryUsageMB()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      
      expect(memoryIncrease).toBeLessThan(MEMORY_THRESHOLDS.SINGLE_WINE_CREATION)
      expect(wine).toBeDefined()
      expect(typeof wine).toBe('object')
    })

    test('should scale memory usage linearly with wine count', () => {
      const initialMemory = getMemoryUsageMB()
      
      const smallBatch = Array.from({ length: 100 }, (_, i) => 
        createMockWine({ id: i + 1, name: `Wine ${i + 1}` })
      )
      
      const mediumMemory = getMemoryUsageMB()
      
      const largeBatch = Array.from({ length: 1000 }, (_, i) => 
        createMockWine({ id: i + 101, name: `Wine ${i + 101}` })
      )
      
      const finalMemory = getMemoryUsageMB()
      
      const smallBatchIncrease = mediumMemory.heapUsed - initialMemory.heapUsed
      const largeBatchIncrease = finalMemory.heapUsed - mediumMemory.heapUsed
      
      // Large batch should use roughly 10x more memory than small batch
      const scalingFactor = largeBatchIncrease / smallBatchIncrease
      expect(scalingFactor).toBeGreaterThan(8)
      expect(scalingFactor).toBeLessThan(12)
      
      expect(smallBatchIncrease).toBeLessThan(MEMORY_THRESHOLDS.BATCH_WINE_CREATION)
      expect(largeBatchIncrease).toBeLessThan(MEMORY_THRESHOLDS.LARGE_COLLECTION)
    })

    test('should release memory when wine objects are dereferenced', () => {
      const initialMemory = getMemoryUsageMB()
      
      // Create large collection in scope
      let wines = Array.from({ length: 1000 }, (_, i) => 
        createMockWine({ id: i + 1, name: `Wine ${i + 1}` })
      )
      
      const peakMemory = getMemoryUsageMB()
      
      // Clear references
      wines = []
      forceGarbageCollection()
      
      const finalMemory = getMemoryUsageMB()
      
      const peakIncrease = peakMemory.heapUsed - initialMemory.heapUsed
      const finalIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      
      expect(peakIncrease).toBeGreaterThan(0.1) // Should have used some memory
      expect(finalIncrease).toBeLessThanOrEqual(peakIncrease) // Should not have increased further
    })
  })

  describe('localStorage Memory Usage', () => {
    test('should use minimal memory for localStorage operations', () => {
      const initialMemory = getMemoryUsageMB()
      
      const wines = Array.from({ length: 50 }, (_, i) => 
        createMockWine({ id: i + 1, name: `Stored Wine ${i + 1}` })
      )
      
      // Store wines in localStorage
      wines.forEach(wine => {
        localStorage.setItem(`wine_${wine.id}`, JSON.stringify(wine))
      })
      
      const finalMemory = getMemoryUsageMB()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      
      expect(memoryIncrease).toBeLessThan(MEMORY_THRESHOLDS.BATCH_WINE_CREATION)
      expect(localStorage.store).toBeDefined()
    })

    test('should handle large localStorage datasets efficiently', () => {
      const initialMemory = getMemoryUsageMB()
      
      // Create large dataset
      const largeCollection = Array.from({ length: 500 }, (_, i) => 
        createMockWine({ 
          id: i + 1, 
          name: `Large Collection Wine ${i + 1}`,
          tastingNotes: `This is a detailed tasting note for wine ${i + 1}. `.repeat(10)
        })
      )
      
      // Store entire collection
      localStorage.setItem('wine_collection', JSON.stringify(largeCollection))
      
      // Retrieve and parse
      const storedData = localStorage.getItem('wine_collection')
      const parsedWines = JSON.parse(storedData!)
      
      const finalMemory = getMemoryUsageMB()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      
      expect(memoryIncrease).toBeLessThan(MEMORY_THRESHOLDS.LARGE_COLLECTION)
      expect(parsedWines).toHaveLength(500)
    })
  })

  describe('Search Operation Memory Usage', () => {
    test('should not leak memory during search operations', () => {
      const wines = Array.from({ length: 200 }, (_, i) => 
        createMockWine({ 
          id: i + 1, 
          name: `Searchable Wine ${i + 1}`,
          region: i % 2 === 0 ? 'Bordeaux' : 'Burgundy',
          producer: `Producer ${i % 10}`,
          grape: i % 3 === 0 ? 'Cabernet Sauvignon' : 'Pinot Noir'
        })
      )
      
      const initialMemory = getMemoryUsageMB()
      
      // Perform many search operations
      for (let i = 0; i < 100; i++) {
        const searchTerm = i % 4 === 0 ? 'Bordeaux' : 
                          i % 4 === 1 ? 'Burgundy' : 
                          i % 4 === 2 ? 'Producer' : 'Wine'
        
        const results = wines.filter(wine => 
          wine.name.includes(searchTerm) ||
          wine.region.includes(searchTerm) ||
          wine.producer.includes(searchTerm)
        )
        
        // Process results to simulate real usage
        results.forEach(result => {
          const processed = { 
            ...result, 
            processed: true,
            searchScore: Math.random() 
          }
          // Reference is immediately released
        })
      }
      
      forceGarbageCollection()
      
      const finalMemory = getMemoryUsageMB()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      
      expect(memoryIncrease).toBeLessThan(MEMORY_THRESHOLDS.SEARCH_OPERATIONS)
    })

    test('should handle complex filtering without memory leaks', () => {
      const wines = Array.from({ length: 300 }, (_, i) => 
        createMockWine({ 
          id: i + 1, 
          name: `Filter Wine ${i + 1}`,
          type: ['Red Wine', 'White Wine', 'Sparkling Wine'][i % 3] as any,
          rating: (i % 5) + 1,
          year: 2010 + (i % 15),
          rarity: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'][i % 5] as any
        })
      )
      
      const initialMemory = getMemoryUsageMB()
      
      // Perform complex filtering operations
      for (let i = 0; i < 50; i++) {
        const filtered = wines
          .filter(wine => wine.rating >= 3)
          .filter(wine => wine.year >= 2015)
          .filter(wine => wine.type === 'Red Wine' || wine.type === 'White Wine')
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 20)
          .map(wine => ({
            ...wine,
            filtered: true,
            iteration: i
          }))
        
        // Simulate processing
        filtered.forEach(wine => {
          const summary = `${wine.name} - ${wine.rating} stars`
          // Reference released immediately
        })
      }
      
      forceGarbageCollection()
      
      const finalMemory = getMemoryUsageMB()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      
      expect(memoryIncrease).toBeLessThan(MEMORY_THRESHOLDS.SEARCH_OPERATIONS)
    })
  })

  describe('Memory Leak Detection', () => {
    test('should not leak memory with repeated create/destroy cycles', () => {
      const initialMemory = getMemoryUsageMB()
      
      // Perform many create/destroy cycles
      for (let cycle = 0; cycle < 50; cycle++) {
        let tempWines = Array.from({ length: 100 }, (_, i) => 
          createMockWine({ 
            id: cycle * 100 + i + 1, 
            name: `Cycle ${cycle} Wine ${i + 1}` 
          })
        )
        
        // Process wines
        tempWines.forEach(wine => {
          const processed = {
            ...wine,
            processed: true,
            cycle,
            timestamp: Date.now()
          }
        })
        
        // Clear references
        tempWines = []
        
        // Force GC every 10 cycles
        if (cycle % 10 === 0) {
          forceGarbageCollection()
        }
      }
      
      forceGarbageCollection()
      
      const finalMemory = getMemoryUsageMB()
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      
      expect(memoryIncrease).toBeLessThan(MEMORY_THRESHOLDS.REPEATED_OPERATIONS)
    })

    test('should maintain stable memory usage with continuous operations', () => {
      const memoryReadings: number[] = []
      
      for (let i = 0; i < 20; i++) {
        // Create and process wines
        const wines = Array.from({ length: 50 }, (_, j) => 
          createMockWine({ id: i * 50 + j + 1 })
        )
        
        wines.forEach(wine => {
          localStorage.setItem(`temp_wine_${wine.id}`, JSON.stringify(wine))
          const retrieved = JSON.parse(localStorage.getItem(`temp_wine_${wine.id}`)!)
          localStorage.removeItem(`temp_wine_${wine.id}`)
        })
        
        if (i % 5 === 0) {
          forceGarbageCollection()
        }
        
        memoryReadings.push(getMemoryUsageMB().heapUsed)
      }
      
      // Check for memory stability (no consistent growth trend)
      const firstHalf = memoryReadings.slice(0, 10)
      const secondHalf = memoryReadings.slice(10, 20)
      
      const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
      const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
      
      const memoryGrowth = secondHalfAvg - firstHalfAvg
      
      expect(memoryGrowth).toBeLessThan(10) // Less than 10MB growth over time
    })
  })

  describe('Performance vs Memory Trade-offs', () => {
    test('should balance speed and memory usage efficiently', () => {
      const wines = Array.from({ length: 1000 }, (_, i) => 
        createMockWine({ 
          id: i + 1, 
          name: `Performance Wine ${i + 1}`,
          tastingNotes: `Detailed notes for wine ${i + 1}. `.repeat(5)
        })
      )
      
      const initialMemory = getMemoryUsageMB()
      const startTime = performance.now()
      
      // Simulate real-world usage patterns
      const operations = [
        () => wines.filter(w => w.rating >= 4),
        () => wines.sort((a, b) => a.name.localeCompare(b.name)),
        () => wines.reduce((acc, w) => acc + w.experiencePoints, 0),
        () => wines.map(w => ({ ...w, processed: true })),
        () => wines.find(w => w.name.includes('500')),
      ]
      
      // Execute operations multiple times
      for (let i = 0; i < 20; i++) {
        const operation = operations[i % operations.length]
        const result = operation()
      }
      
      const endTime = performance.now()
      const finalMemory = getMemoryUsageMB()
      
      const executionTime = endTime - startTime
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed
      
      // Should be fast and memory-efficient
      expect(executionTime).toBeLessThan(1000) // Less than 1 second
      expect(memoryIncrease).toBeLessThan(20) // Less than 20MB increase
      
      // Performance/memory ratio should be reasonable
      const efficiency = executionTime / memoryIncrease // ms per MB
      expect(efficiency).toBeLessThan(100) // Less than 100ms per MB used
    })
  })
})