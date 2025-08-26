/**
 * Comprehensive Performance Benchmark Suite
 * Measures application performance across all critical operations
 */

import { performance } from 'perf_hooks'
import { createMockWine, createMockCollection, mockLocalStorage } from '../setup'
import { WineStorageService } from '@/lib/wineStorage'

// Benchmark results interface
interface BenchmarkResult {
  operation: string
  duration: number
  memoryUsed: number
  iterations: number
  averageDuration: number
  passed: boolean
}

// Comprehensive benchmark thresholds
const BENCHMARK_THRESHOLDS = {
  // Core operations (ms)
  WINE_CREATION: 1,
  WINE_PROCESSING: 5,
  STORAGE_SAVE: 10,
  STORAGE_LOAD: 25,
  
  // Collection operations (ms)
  SMALL_COLLECTION: 50,    // 1-50 wines
  MEDIUM_COLLECTION: 150,  // 51-200 wines
  LARGE_COLLECTION: 500,   // 201+ wines
  
  // Search & filter operations (ms)
  SEARCH_OPERATION: 30,
  FILTER_OPERATION: 20,
  SORT_OPERATION: 15,
  
  // Memory thresholds (MB)
  MEMORY_USAGE: 100,
  MEMORY_LEAK: 5,
  
  // Complex operations (ms)
  STATS_CALCULATION: 50,
  BATCH_PROCESSING: 200,
}

describe('Performance Benchmark Suite', () => {
  let localStorage: ReturnType<typeof mockLocalStorage>
  let benchmarkResults: BenchmarkResult[] = []

  beforeEach(() => {
    localStorage = mockLocalStorage()
    global.localStorage = localStorage as any
    benchmarkResults = []
  })

  afterEach(() => {
    localStorage.clear()
  })

  // Helper function to run benchmark
  const runBenchmark = (
    operationName: string,
    operation: () => any,
    iterations: number = 1,
    threshold: number
  ): BenchmarkResult => {
    const initialMemory = process.memoryUsage().heapUsed
    const startTime = performance.now()
    
    let result
    for (let i = 0; i < iterations; i++) {
      result = operation()
    }
    
    const endTime = performance.now()
    const finalMemory = process.memoryUsage().heapUsed
    
    const duration = endTime - startTime
    const memoryUsed = (finalMemory - initialMemory) / (1024 * 1024) // MB
    const averageDuration = duration / iterations
    const passed = averageDuration <= threshold

    const benchmarkResult: BenchmarkResult = {
      operation: operationName,
      duration,
      memoryUsed,
      iterations,
      averageDuration,
      passed
    }

    benchmarkResults.push(benchmarkResult)
    return benchmarkResult
  }

  describe('Core Performance Benchmarks', () => {
    test('wine creation benchmark', () => {
      const result = runBenchmark(
        'Wine Creation',
        () => createMockWine({ name: 'Benchmark Wine' }),
        1000,
        BENCHMARK_THRESHOLDS.WINE_CREATION
      )

      expect(result.passed).toBe(true)
      expect(result.averageDuration).toBeLessThan(BENCHMARK_THRESHOLDS.WINE_CREATION)
    })

    test('wine processing benchmark', () => {
      const wine = createMockWine()
      
      const result = runBenchmark(
        'Wine Processing',
        () => ({
          id: wine.id,
          displayName: wine.name,
          displayRegion: wine.region,
          displayRating: `${wine.rating} stars`,
          processed: true
        }),
        1000,
        BENCHMARK_THRESHOLDS.WINE_PROCESSING
      )

      expect(result.passed).toBe(true)
      expect(result.averageDuration).toBeLessThan(BENCHMARK_THRESHOLDS.WINE_PROCESSING)
    })

    test('storage save benchmark', () => {
      const wine = createMockWine()
      
      const result = runBenchmark(
        'Storage Save',
        () => WineStorageService.addWine(wine),
        100,
        BENCHMARK_THRESHOLDS.STORAGE_SAVE
      )

      expect(result.passed).toBe(true)
      expect(result.averageDuration).toBeLessThan(BENCHMARK_THRESHOLDS.STORAGE_SAVE)
    })

    test('storage load benchmark', () => {
      // Setup test data
      const wines = Array.from({ length: 10 }, (_, i) => 
        createMockWine({ id: i + 1, name: `Load Test Wine ${i + 1}` })
      )
      WineStorageService.saveWines(wines)
      
      const result = runBenchmark(
        'Storage Load',
        () => WineStorageService.getWines(),
        100,
        BENCHMARK_THRESHOLDS.STORAGE_LOAD
      )

      expect(result.passed).toBe(true)
      expect(result.averageDuration).toBeLessThan(BENCHMARK_THRESHOLDS.STORAGE_LOAD)
    })
  })

  describe('Collection Size Benchmarks', () => {
    test('small collection benchmark (50 wines)', () => {
      const wines = Array.from({ length: 50 }, (_, i) => 
        createMockWine({ id: i + 1, name: `Small Collection Wine ${i + 1}` })
      )
      
      const result = runBenchmark(
        'Small Collection Processing',
        () => {
          WineStorageService.saveWines(wines)
          const loaded = WineStorageService.getWines()
          const processed = loaded.map(wine => ({
            id: wine.id,
            displayName: wine.name,
            displayRating: `${wine.rating} stars`
          }))
          return processed
        },
        10,
        BENCHMARK_THRESHOLDS.SMALL_COLLECTION
      )

      expect(result.passed).toBe(true)
      expect(result.averageDuration).toBeLessThan(BENCHMARK_THRESHOLDS.SMALL_COLLECTION)
    })

    test('medium collection benchmark (150 wines)', () => {
      const wines = Array.from({ length: 150 }, (_, i) => 
        createMockWine({ 
          id: i + 1, 
          name: `Medium Collection Wine ${i + 1}`,
          region: `Region ${(i % 15) + 1}`,
          producer: `Producer ${(i % 20) + 1}`
        })
      )
      
      const result = runBenchmark(
        'Medium Collection Processing',
        () => {
          WineStorageService.saveWines(wines)
          const loaded = WineStorageService.getWines()
          const processed = loaded.map(wine => ({
            id: wine.id,
            displayName: wine.name,
            displayRating: `${wine.rating} stars`
          }))
          return processed
        },
        5,
        BENCHMARK_THRESHOLDS.MEDIUM_COLLECTION
      )

      expect(result.passed).toBe(true)
      expect(result.averageDuration).toBeLessThan(BENCHMARK_THRESHOLDS.MEDIUM_COLLECTION)
    })

    test('large collection benchmark (300 wines)', () => {
      const wines = Array.from({ length: 300 }, (_, i) => 
        createMockWine({ 
          id: i + 1, 
          name: `Large Collection Wine ${i + 1}`,
          region: `Region ${(i % 25) + 1}`,
          producer: `Producer ${(i % 40) + 1}`,
          grape: `Grape ${(i % 12) + 1}`
        })
      )
      
      const result = runBenchmark(
        'Large Collection Processing',
        () => {
          WineStorageService.saveWines(wines)
          const loaded = WineStorageService.getWines()
          const processed = loaded.map(wine => ({
            id: wine.id,
            displayName: wine.name,
            displayRating: `${wine.rating} stars`
          }))
          return processed
        },
        3,
        BENCHMARK_THRESHOLDS.LARGE_COLLECTION
      )

      expect(result.passed).toBe(true)
      expect(result.averageDuration).toBeLessThan(BENCHMARK_THRESHOLDS.LARGE_COLLECTION)
    })
  })

  describe('Search and Filter Benchmarks', () => {
    beforeEach(() => {
      // Setup diverse test dataset
      const testWines = [
        ...Array.from({ length: 50 }, (_, i) => createMockWine({
          id: i + 1,
          name: `Bordeaux Wine ${i + 1}`,
          region: 'Bordeaux, France',
          type: 'Red Wine',
          producer: `Château ${i + 1}`
        })),
        ...Array.from({ length: 50 }, (_, i) => createMockWine({
          id: i + 51,
          name: `Burgundy Wine ${i + 1}`,
          region: 'Burgundy, France',
          type: 'Red Wine',
          producer: `Domaine ${i + 1}`
        })),
        ...Array.from({ length: 50 }, (_, i) => createMockWine({
          id: i + 101,
          name: `Champagne Wine ${i + 1}`,
          region: 'Champagne, France',
          type: 'Sparkling Wine',
          producer: `Maison ${i + 1}`
        }))
      ]
      
      WineStorageService.saveWines(testWines)
    })

    test('search operation benchmark', () => {
      const result = runBenchmark(
        'Search Operation',
        () => {
          const wines = WineStorageService.getWines()
          return wines.filter(wine => 
            wine.name.toLowerCase().includes('bordeaux') ||
            wine.region.toLowerCase().includes('bordeaux')
          )
        },
        50,
        BENCHMARK_THRESHOLDS.SEARCH_OPERATION
      )

      expect(result.passed).toBe(true)
      expect(result.averageDuration).toBeLessThan(BENCHMARK_THRESHOLDS.SEARCH_OPERATION)
    })

    test('filter operation benchmark', () => {
      const result = runBenchmark(
        'Filter Operation',
        () => {
          const wines = WineStorageService.getWines()
          return wines.filter(wine => wine.type === 'Red Wine')
        },
        100,
        BENCHMARK_THRESHOLDS.FILTER_OPERATION
      )

      expect(result.passed).toBe(true)
      expect(result.averageDuration).toBeLessThan(BENCHMARK_THRESHOLDS.FILTER_OPERATION)
    })

    test('sort operation benchmark', () => {
      const result = runBenchmark(
        'Sort Operation',
        () => {
          const wines = WineStorageService.getWines()
          return [...wines].sort((a, b) => a.name.localeCompare(b.name))
        },
        50,
        BENCHMARK_THRESHOLDS.SORT_OPERATION
      )

      expect(result.passed).toBe(true)
      expect(result.averageDuration).toBeLessThan(BENCHMARK_THRESHOLDS.SORT_OPERATION)
    })
  })

  describe('Complex Operations Benchmarks', () => {
    test('statistics calculation benchmark', () => {
      const wines = Array.from({ length: 100 }, (_, i) => 
        createMockWine({ 
          id: i + 1,
          rating: (i % 5) + 1,
          experiencePoints: (i + 1) * 10,
          region: `Region ${(i % 10) + 1}`,
          grape: `Grape ${(i % 8) + 1}`,
          producer: `Producer ${(i % 15) + 1}`
        })
      )

      const result = runBenchmark(
        'Statistics Calculation',
        () => createMockCollection(wines),
        20,
        BENCHMARK_THRESHOLDS.STATS_CALCULATION
      )

      expect(result.passed).toBe(true)
      expect(result.averageDuration).toBeLessThan(BENCHMARK_THRESHOLDS.STATS_CALCULATION)
    })

    test('batch processing benchmark', () => {
      const result = runBenchmark(
        'Batch Processing',
        () => {
          // Create batch of wines
          const wines = Array.from({ length: 100 }, (_, i) => 
            createMockWine({ id: i + 1, name: `Batch Wine ${i + 1}` })
          )
          
          // Process each wine
          const processed = wines.map(wine => ({
            ...wine,
            processed: true,
            displayName: wine.name,
            displayRating: `${wine.rating} stars`
          }))
          
          // Save to storage
          WineStorageService.saveWines(processed)
          
          // Load and verify
          const loaded = WineStorageService.getWines()
          return loaded.filter(wine => wine.name.includes('Batch'))
        },
        5,
        BENCHMARK_THRESHOLDS.BATCH_PROCESSING
      )

      expect(result.passed).toBe(true)
      expect(result.averageDuration).toBeLessThan(BENCHMARK_THRESHOLDS.BATCH_PROCESSING)
    })
  })

  describe('Memory Performance Benchmarks', () => {
    test('memory usage benchmark', () => {
      const initialMemory = process.memoryUsage().heapUsed / (1024 * 1024)
      
      // Perform memory-intensive operations
      const wines = Array.from({ length: 1000 }, (_, i) => 
        createMockWine({ 
          id: i + 1,
          name: `Memory Test Wine ${i + 1}`,
          tastingNotes: 'Detailed tasting notes. '.repeat(10)
        })
      )
      
      WineStorageService.saveWines(wines)
      const loaded = WineStorageService.getWines()
      const processed = loaded.map(wine => ({ ...wine, processed: true }))
      
      const finalMemory = process.memoryUsage().heapUsed / (1024 * 1024)
      const memoryUsed = finalMemory - initialMemory
      
      expect(memoryUsed).toBeLessThan(BENCHMARK_THRESHOLDS.MEMORY_USAGE)
      expect(processed).toHaveLength(1000)
    })

    test('memory leak detection benchmark', () => {
      const initialMemory = process.memoryUsage().heapUsed / (1024 * 1024)
      
      // Perform operations that could cause memory leaks
      for (let cycle = 0; cycle < 10; cycle++) {
        const wines = Array.from({ length: 100 }, (_, i) => 
          createMockWine({ id: cycle * 100 + i + 1 })
        )
        
        WineStorageService.saveWines(wines)
        const loaded = WineStorageService.getWines()
        const filtered = loaded.filter(wine => wine.rating >= 3)
        const sorted = [...filtered].sort((a, b) => b.rating - a.rating)
        
        // Clear storage for next cycle
        localStorage.clear()
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }
      
      const finalMemory = process.memoryUsage().heapUsed / (1024 * 1024)
      const memoryLeak = finalMemory - initialMemory
      
      expect(memoryLeak).toBeLessThan(BENCHMARK_THRESHOLDS.MEMORY_LEAK)
    })
  })

  // Generate performance report after all tests
  afterAll(() => {
    console.log('\n🚀 Performance Benchmark Results:')
    console.log('================================')
    
    const passedTests = benchmarkResults.filter(r => r.passed)
    const failedTests = benchmarkResults.filter(r => !r.passed)
    
    console.log(`✅ Passed: ${passedTests.length}/${benchmarkResults.length}`)
    console.log(`❌ Failed: ${failedTests.length}/${benchmarkResults.length}`)
    
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Benchmarks:')
      failedTests.forEach(result => {
        console.log(`  - ${result.operation}: ${result.averageDuration.toFixed(2)}ms (threshold: ${result.averageDuration}ms)`)
      })
    }
    
    console.log('\n📊 Top Performers:')
    const topPerformers = passedTests
      .sort((a, b) => a.averageDuration - b.averageDuration)
      .slice(0, 5)
    
    topPerformers.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.operation}: ${result.averageDuration.toFixed(2)}ms`)
    })
    
    const totalMemoryUsed = benchmarkResults.reduce((sum, r) => sum + r.memoryUsed, 0)
    console.log(`\n💾 Total Memory Used: ${totalMemoryUsed.toFixed(2)}MB`)
  })
})