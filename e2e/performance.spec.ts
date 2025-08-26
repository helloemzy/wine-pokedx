/**
 * Performance Testing Suite for Wine Pokédex
 * Tests application performance with large collections and real-time features
 */

import { test, expect } from '@playwright/test'
import { WinePokedexHelpers } from './utils/page-helpers'
import { performanceTestData } from './fixtures/test-data'

test.describe('Performance Tests - Wine Pokédex', () => {
  let helpers: WinePokedexHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new WinePokedexHelpers(page)
  })

  test.describe('Large Collection Performance', () => {
    test('should load 100 wines within performance threshold', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.seedWineData(performanceTestData.largeCollection)
      
      // Measure initial load time
      const startTime = Date.now()
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      const loadTime = Date.now() - startTime
      
      // Should load within reasonable time
      expect(loadTime).toBeLessThan(3000) // 3 seconds
      
      // Verify all wines are loaded
      await helpers.verifyCollectionHasWines(100)
      
      // Check memory usage isn't excessive
      const memoryUsage = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0
      })
      
      if (memoryUsage > 0) {
        expect(memoryUsage).toBeLessThan(50 * 1024 * 1024) // Less than 50MB
      }
    })

    test('should handle 1000 wine stress test', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.seedWineData(performanceTestData.stressTestCollection)
      
      const startTime = Date.now()
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      const loadTime = Date.now() - startTime
      
      // Should still be reasonable for stress test
      expect(loadTime).toBeLessThan(10000) // 10 seconds max
      
      // Verify collection statistics are calculated correctly
      const stats = await helpers.getCollectionStats()
      expect(stats.totalWines).toBe(1000)
      expect(stats.uniqueRegions).toBeGreaterThan(40) // 50 regions, some variance
      expect(stats.uniqueGrapes).toBeGreaterThan(25) // 30 grapes, some variance
    })

    test('should maintain smooth scrolling with large collections', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.seedWineData(performanceTestData.largeCollection)
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      
      // Measure scroll performance
      const scrollStartTime = Date.now()
      
      // Scroll to bottom of page
      await page.evaluate(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      })
      
      // Wait for scroll to complete
      await page.waitForTimeout(1000)
      
      const scrollEndTime = Date.now()
      const scrollTime = scrollEndTime - scrollStartTime
      
      // Smooth scrolling should not block the UI excessively
      expect(scrollTime).toBeLessThan(5000) // 5 seconds
      
      // Verify page is still responsive after scrolling
      await helpers.searchWines('Wine 50')
      await helpers.verifyCollectionHasWines(1)
    })
  })

  test.describe('Search Performance', () => {
    test('should perform search quickly on large dataset', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.seedWineData(performanceTestData.largeCollection)
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      
      // Test search performance
      const searchTerms = ['Wine 1', 'Wine 50', 'Wine 99', 'Region 5', 'Producer 10']
      
      for (const term of searchTerms) {
        const searchStartTime = Date.now()
        await helpers.searchWines(term)
        const searchEndTime = Date.now()
        
        const searchTime = searchEndTime - searchStartTime
        expect(searchTime).toBeLessThan(500) // 500ms max for search
        
        // Clear search for next iteration
        await helpers.searchWines('')
      }
    })

    test('should handle rapid search input changes', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.seedWineData(performanceTestData.largeCollection)
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      
      // Simulate rapid typing
      const searchInput = page.locator('input[placeholder*="Search"]').first()
      
      const rapidSearches = ['W', 'Wi', 'Win', 'Wine', 'Wine 1', 'Wine 10']
      
      for (const search of rapidSearches) {
        await searchInput.fill(search)
        await page.waitForTimeout(50) // Very quick typing
      }
      
      // Should still be responsive and show correct results
      await page.waitForTimeout(1000) // Wait for debouncing
      await helpers.verifyCollectionHasWines(11) // Wine 1, Wine 10, Wine 100
    })
  })

  test.describe('Filter Performance', () => {
    test('should apply filters quickly on large collections', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.seedWineData(performanceTestData.largeCollection)
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      
      // Test different filter combinations
      const filterTests = [
        { filter: 'type', value: 'Red Wine' },
        { filter: 'rarity', value: 'Common' },
        { filter: 'rarity', value: 'Legendary' },
      ]
      
      for (const test of filterTests) {
        const filterStartTime = Date.now()
        
        if (test.filter === 'type') {
          await helpers.filterByType(test.value)
        } else if (test.filter === 'rarity') {
          await helpers.filterByRarity(test.value)
        }
        
        const filterEndTime = Date.now()
        const filterTime = filterEndTime - filterStartTime
        
        expect(filterTime).toBeLessThan(1000) // 1 second max for filtering
        
        // Reset filters for next test
        await page.reload()
        await helpers.waitForWineCardsToLoad()
      }
    })

    test('should handle multiple simultaneous filters efficiently', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.seedWineData(performanceTestData.largeCollection)
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      
      const combinedFilterStartTime = Date.now()
      
      // Apply search + type filter + rarity filter
      await helpers.searchWines('Wine')
      await helpers.filterByType('Red Wine')
      await helpers.filterByRarity('Common')
      
      const combinedFilterEndTime = Date.now()
      const combinedFilterTime = combinedFilterEndTime - combinedFilterStartTime
      
      expect(combinedFilterTime).toBeLessThan(2000) // 2 seconds for combined filters
      
      // Should show filtered results
      const visibleWines = await helpers.getVisibleWineCards()
      expect(visibleWines.length).toBeGreaterThan(0)
    })
  })

  test.describe('View Mode Performance', () => {
    test('should switch view modes quickly with large collections', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.seedWineData(performanceTestData.largeCollection)
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      
      const viewModes: ('cards' | 'grid' | 'list')[] = ['grid', 'list', 'cards']
      
      for (const mode of viewModes) {
        const switchStartTime = Date.now()
        await helpers.changeViewMode(mode)
        const switchEndTime = Date.now()
        
        const switchTime = switchEndTime - switchStartTime
        expect(switchTime).toBeLessThan(1000) // 1 second max for view mode switch
        
        // Verify wines are still visible
        await helpers.verifyCollectionHasWines(100)
      }
    })

    test('should handle trading card flips smoothly', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.seedWineData(performanceTestData.largeCollection.slice(0, 20)) // Smaller subset for flip testing
      await helpers.navigateToApp()
      await helpers.changeViewMode('cards')
      
      // Test flipping multiple cards
      const cardNames = ['Wine 1', 'Wine 5', 'Wine 10']
      
      for (const wineName of cardNames) {
        const flipStartTime = Date.now()
        await helpers.flipTradingCard(wineName)
        const flipEndTime = Date.now()
        
        const flipTime = flipEndTime - flipStartTime
        expect(flipTime).toBeLessThan(800) // 800ms max for card flip animation
        
        // Verify card is flipped
        expect(await helpers.isTradingCardFlipped(wineName)).toBe(true)
      }
    })
  })

  test.describe('Memory Management', () => {
    test('should not have memory leaks with repeated operations', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.seedWineData(performanceTestData.largeCollection)
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      
      // Get baseline memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0
      })
      
      // Perform memory-intensive operations repeatedly
      for (let i = 0; i < 10; i++) {
        await helpers.searchWines(`Wine ${i}`)
        await helpers.changeViewMode('grid')
        await helpers.changeViewMode('cards')
        await helpers.changeViewMode('list')
        await helpers.searchWines('')
      }
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc()
        }
      })
      
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0
      })
      
      if (initialMemory > 0 && finalMemory > 0) {
        // Memory should not grow excessively (allow 50% increase)
        expect(finalMemory).toBeLessThan(initialMemory * 1.5)
      }
    })
  })

  test.describe('Real-time Features Performance', () => {
    test('should update collection statistics quickly', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.navigateToApp()
      
      // Add wines incrementally and measure stats update time
      const batchSizes = [10, 25, 50, 100]
      
      for (const size of batchSizes) {
        const winesBatch = performanceTestData.largeCollection.slice(0, size)
        
        const updateStartTime = Date.now()
        await helpers.seedWineData(winesBatch)
        await page.reload()
        await helpers.waitForWineCardsToLoad()
        const updateEndTime = Date.now()
        
        const updateTime = updateEndTime - updateStartTime
        
        // Stats calculation should be proportional but reasonable
        const maxTime = Math.max(2000, size * 20) // 20ms per wine or 2s minimum
        expect(updateTime).toBeLessThan(maxTime)
        
        // Verify stats are accurate
        const stats = await helpers.getCollectionStats()
        expect(stats.totalWines).toBe(size)
      }
    })

    test('should handle concurrent user interactions smoothly', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.seedWineData(performanceTestData.largeCollection.slice(0, 50))
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      
      // Simulate multiple simultaneous user actions
      const concurrentStartTime = Date.now()
      
      await Promise.all([
        helpers.searchWines('Wine 20'),
        helpers.changeViewMode('grid'),
        helpers.filterByType('Red Wine'),
      ])
      
      const concurrentEndTime = Date.now()
      const concurrentTime = concurrentEndTime - concurrentStartTime
      
      // Should handle concurrent actions within reasonable time
      expect(concurrentTime).toBeLessThan(3000) // 3 seconds
      
      // Verify final state is correct
      await helpers.verifyCollectionHasWines(1) // Only Wine 20 should match
    })
  })

  test.describe('Network and Loading Performance', () => {
    test('should handle slow network conditions gracefully', async ({ page }) => {
      // Simulate slow 3G connection
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100) // 100ms delay for all requests
      })
      
      await helpers.clearLocalStorage()
      await helpers.seedWineData(performanceTestData.largeCollection.slice(0, 20))
      
      const loadStartTime = Date.now()
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      const loadEndTime = Date.now()
      
      const loadTime = loadEndTime - loadStartTime
      
      // Should still be usable even with network delays
      expect(loadTime).toBeLessThan(10000) // 10 seconds max
      
      // App should remain functional
      await helpers.searchWines('Wine 1')
      await helpers.verifyCollectionHasWines(1)
    })

    test('should work offline with cached data', async ({ page }) => {
      // First load with network
      await helpers.clearLocalStorage()
      await helpers.seedWineData(performanceTestData.largeCollection.slice(0, 10))
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      
      // Go offline
      await page.setOfflineMode(true)
      
      // Refresh page to test offline functionality
      await page.reload()
      
      // Should still work with cached data
      await helpers.verifyCollectionHasWines(10)
      await helpers.searchWines('Wine 5')
      await helpers.verifyCollectionHasWines(1)
    })
  })

  test.describe('Performance Monitoring', () => {
    test('should maintain good Core Web Vitals', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.seedWineData(performanceTestData.largeCollection.slice(0, 50))
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      
      // Measure Core Web Vitals
      const vitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const vitalsData: any = {}
            
            entries.forEach((entry) => {
              if (entry.name === 'FCP') vitalsData.fcp = entry.startTime
              if (entry.name === 'LCP') vitalsData.lcp = entry.startTime
              if (entry.name === 'FID') vitalsData.fid = entry.duration
              if (entry.name === 'CLS') vitalsData.cls = entry.value
            })
            
            resolve(vitalsData)
          })
          
          observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] })
          
          // Fallback timeout
          setTimeout(() => resolve({}), 5000)
        })
      })
      
      console.log('Core Web Vitals:', vitals)
      
      // Note: Specific thresholds would depend on performance requirements
      // These are example assertions
      if ((vitals as any).fcp) {
        expect((vitals as any).fcp).toBeLessThan(2000) // First Contentful Paint < 2s
      }
      if ((vitals as any).lcp) {
        expect((vitals as any).lcp).toBeLessThan(4000) // Largest Contentful Paint < 4s
      }
    })
  })
})