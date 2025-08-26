/**
 * Critical User Journey E2E Tests
 * Tests the most important user flows for Wine Pokédex MVP launch
 */

import { test, expect } from '@playwright/test'
import { WinePokedexHelpers } from './utils/page-helpers'
import { mockWineData, testScenarios, searchTestCases, filterTestCases } from './fixtures/test-data'

test.describe('Critical User Journeys - Wine Pokédex', () => {
  let helpers: WinePokedexHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new WinePokedexHelpers(page)
    await helpers.navigateToApp()
  })

  test.describe('First Time User Experience', () => {
    test('should display welcome experience for empty collection', async () => {
      await helpers.clearLocalStorage()
      await helpers.navigateToApp()
      
      await helpers.verifyEmptyCollection()
      
      // Verify key elements are present
      await expect(page.locator(':has-text("Wine Pokédex")')).toBeVisible()
      await expect(page.locator('button:has-text("Scan Your First Bottle")')).toBeVisible()
    })

    test('should open scan modal when user clicks scan button', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.navigateToApp()
      
      await helpers.openScanModal()
      
      // Verify modal is open and contains expected content
      await expect(page.locator('[data-testid="scan-modal"]')).toBeVisible()
      await expect(page.locator(':has-text("Add New Wine")')).toBeVisible()
    })

    test('should close scan modal when user clicks close', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.navigateToApp()
      
      await helpers.openScanModal()
      await helpers.closeScanModal()
      
      // Verify modal is closed
      await expect(page.locator('[data-testid="scan-modal"]')).toBeHidden()
    })
  })

  test.describe('Wine Collection Viewing', () => {
    test('should display wine collection with sample data', async ({ page }) => {
      await helpers.seedWineData(Object.values(mockWineData))
      await helpers.navigateToApp()
      
      await helpers.verifyCollectionHasWines(5)
      
      // Verify collection statistics are displayed
      const stats = await helpers.getCollectionStats()
      expect(stats.totalWines).toBe(5)
      expect(stats.averageRating).toBeGreaterThan(4)
    })

    test('should display wine details correctly on cards', async () => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      
      await helpers.verifyWineCardDetails('Château Margaux', {
        year: 2015,
        region: 'Bordeaux, France',
        producer: 'Château Margaux',
        grape: 'Cabernet Sauvignon Blend',
        rarity: 'Legendary'
      })
      
      await helpers.verifyStarRating('Château Margaux', 5)
    })

    test('should handle different rarity appearances correctly', async () => {
      await helpers.seedWineData([
        mockWineData.legendary,
        mockWineData.epic,
        mockWineData.rare,
        mockWineData.uncommon,
        mockWineData.common
      ])
      await helpers.navigateToApp()
      
      // Verify each rarity has appropriate visual styling
      await helpers.verifyRarityAppearance('Château Margaux', 'Legendary')
      await helpers.verifyRarityAppearance('Dom Pérignon Vintage', 'Epic')
      await helpers.verifyRarityAppearance('Screaming Eagle Cabernet', 'Rare')
    })
  })

  test.describe('View Mode Switching', () => {
    test.beforeEach(async () => {
      await helpers.seedWineData(Object.values(mockWineData))
      await helpers.navigateToApp()
    })

    test('should switch between different view modes', async ({ page }) => {
      // Test cards view (default)
      await helpers.changeViewMode('cards')
      await expect(page.locator('[data-testid="trading-card"]').first()).toBeVisible()
      
      // Test grid view
      await helpers.changeViewMode('grid')
      await expect(page.locator('[data-testid="wine-card"]').first()).toBeVisible()
      
      // Test list view
      await helpers.changeViewMode('list')
      await expect(page.locator('[data-testid="wine-card"]').first()).toBeVisible()
    })

    test('should maintain wine data across view changes', async () => {
      // Get wine names in cards view
      await helpers.changeViewMode('cards')
      const cardsViewNames = await helpers.getVisibleWineNames()
      
      // Switch to grid view and verify same wines
      await helpers.changeViewMode('grid')
      const gridViewNames = await helpers.getVisibleWineNames()
      
      // Switch to list view and verify same wines
      await helpers.changeViewMode('list')
      const listViewNames = await helpers.getVisibleWineNames()
      
      expect(cardsViewNames).toEqual(gridViewNames)
      expect(gridViewNames).toEqual(listViewNames)
    })

    test('should flip trading cards when clicked', async ({ page }) => {
      await helpers.changeViewMode('cards')
      
      const wineName = 'Château Margaux'
      
      // Verify card is not flipped initially
      expect(await helpers.isTradingCardFlipped(wineName)).toBe(false)
      
      // Flip the card
      await helpers.flipTradingCard(wineName)
      
      // Verify card is now flipped and showing WSET notes
      expect(await helpers.isTradingCardFlipped(wineName)).toBe(true)
      await expect(page.locator(':has-text("WSET Tasting Notes")')).toBeVisible()
    })
  })

  test.describe('Search and Filter Functionality', () => {
    test.beforeEach(async () => {
      await helpers.seedWineData(Object.values(mockWineData))
      await helpers.navigateToApp()
    })

    test.describe('Search Functionality', () => {
      for (const testCase of searchTestCases) {
        test(`should search wines by "${testCase.query}"`, async () => {
          await helpers.searchWines(testCase.query)
          
          if (testCase.expectedCount === 0) {
            await helpers.verifyNoSearchResults()
          } else {
            await helpers.verifyCollectionHasWines(testCase.expectedCount)
            const visibleNames = await helpers.getVisibleWineNames()
            
            for (const expectedName of testCase.expectedResults) {
              expect(visibleNames).toContainEqual(expect.stringContaining(expectedName))
            }
          }
        })
      }

      test('should clear search results when search is cleared', async () => {
        // Search for specific wine
        await helpers.searchWines('Château')
        await helpers.verifyCollectionHasWines(1)
        
        // Clear search
        await helpers.searchWines('')
        
        // Should show all wines again
        await helpers.verifyCollectionHasWines(5)
      })
    })

    test.describe('Filter Functionality', () => {
      test('should filter wines by type', async () => {
        await helpers.filterByType('Red Wine')
        
        const visibleNames = await helpers.getVisibleWineNames()
        const redWines = ['Château Margaux', 'Screaming Eagle Cabernet']
        
        for (const wineName of redWines) {
          expect(visibleNames).toContainEqual(expect.stringContaining(wineName))
        }
      })

      test('should filter wines by rarity', async () => {
        await helpers.filterByRarity('Legendary')
        
        await helpers.verifyCollectionHasWines(1)
        const visibleNames = await helpers.getVisibleWineNames()
        expect(visibleNames).toContainEqual(expect.stringContaining('Château Margaux'))
      })

      test('should combine search and filter', async () => {
        // Search for France wines
        await helpers.searchWines('France')
        
        // Filter by Red Wine
        await helpers.filterByType('Red Wine')
        
        // Should show only French red wines
        const visibleNames = await helpers.getVisibleWineNames()
        expect(visibleNames).toContainEqual(expect.stringContaining('Château Margaux'))
        expect(visibleNames).not.toContainEqual(expect.stringContaining('Dom Pérignon'))
      })
    })
  })

  test.describe('Collection Statistics', () => {
    test('should update statistics when collection changes', async ({ page }) => {
      // Start with empty collection
      await helpers.clearLocalStorage()
      await helpers.navigateToApp()
      
      // Add wines incrementally and verify stats update
      await helpers.seedWineData([mockWineData.legendary])
      await page.reload()
      
      let stats = await helpers.getCollectionStats()
      expect(stats.totalWines).toBe(1)
      
      // Add more wines
      await helpers.seedWineData(Object.values(mockWineData))
      await page.reload()
      
      stats = await helpers.getCollectionStats()
      expect(stats.totalWines).toBe(5)
      expect(stats.uniqueRegions).toBeGreaterThan(1)
      expect(stats.uniqueGrapes).toBeGreaterThan(1)
    })

    test('should display accurate average rating', async () => {
      // Create collection with known ratings
      const testWines = [
        { ...mockWineData.legendary, rating: 5 }, // 5 stars
        { ...mockWineData.common, rating: 3 }, // 3 stars
      ]
      
      await helpers.seedWineData(testWines)
      await helpers.navigateToApp()
      
      const stats = await helpers.getCollectionStats()
      expect(stats.averageRating).toBe(4) // (5 + 3) / 2 = 4
    })
  })

  test.describe('Performance and Loading', () => {
    test('should load initial page quickly', async ({ page }) => {
      const startTime = Date.now()
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      const endTime = Date.now()
      
      const loadTime = endTime - startTime
      expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
    })

    test('should handle large wine collections efficiently', async () => {
      // Create large collection
      const largeCollection = Array.from({ length: 50 }, (_, i) => ({
        ...mockWineData.common,
        id: i + 1,
        name: `Wine ${i + 1}`,
      }))
      
      await helpers.seedWineData(largeCollection)
      
      const startTime = Date.now()
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      const endTime = Date.now()
      
      const loadTime = endTime - startTime
      expect(loadTime).toBeLessThan(5000) // Should handle large collections within 5 seconds
      
      await helpers.verifyCollectionHasWines(50)
    })

    test('should perform search quickly on large collections', async () => {
      const largeCollection = Array.from({ length: 100 }, (_, i) => ({
        ...mockWineData.common,
        id: i + 1,
        name: i === 50 ? 'Special Wine' : `Wine ${i + 1}`,
      }))
      
      await helpers.seedWineData(largeCollection)
      await helpers.navigateToApp()
      
      const startTime = Date.now()
      await helpers.searchWines('Special')
      const endTime = Date.now()
      
      const searchTime = endTime - startTime
      expect(searchTime).toBeLessThan(1000) // Search should complete within 1 second
      
      await helpers.verifyCollectionHasWines(1)
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle corrupted localStorage gracefully', async ({ page }) => {
      // Inject corrupted data into localStorage
      await page.evaluate(() => {
        localStorage.setItem('wine_pokedex_wines', 'invalid json data')
      })
      
      await helpers.navigateToApp()
      
      // Should fallback to empty collection state
      await helpers.verifyEmptyCollection()
    })

    test('should handle missing wine data gracefully', async () => {
      // Add wine with minimal data
      const incompleteWine = {
        name: 'Incomplete Wine',
        year: 2020,
        region: '',
        producer: '',
        type: 'Red Wine' as const,
        grape: '',
        rating: 0,
        tastingNotes: '',
        captured: true,
        rarity: 'Common' as const,
      }
      
      await helpers.seedWineData([incompleteWine])
      await helpers.navigateToApp()
      
      // Should still display the wine
      await helpers.verifyCollectionHasWines(1)
      await expect(page.locator(':has-text("Incomplete Wine")')).toBeVisible()
    })

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline condition
      await page.setOfflineMode(true)
      
      await helpers.navigateToApp()
      
      // App should still function with cached data
      // (This test assumes the app works offline with localStorage)
    })
  })

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      
      // Tab through interactive elements
      await page.keyboard.press('Tab') // Header buttons
      await page.keyboard.press('Tab') // Search
      await page.keyboard.press('Tab') // Filters
      await page.keyboard.press('Tab') // View mode buttons
      await page.keyboard.press('Tab') // Wine cards
      
      // Verify focus is visible
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
      expect(['BUTTON', 'INPUT', 'SELECT', 'A']).toContain(focusedElement)
    })

    test('should have proper ARIA labels', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      
      // Check for essential ARIA labels
      await expect(page.locator('[aria-label]').first()).toBeVisible()
      await expect(page.locator('button[aria-label]')).toHaveCount(3) // Minimum expected
    })

    test('should support screen readers', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      
      // Check for semantic HTML structure
      await expect(page.locator('main')).toBeVisible()
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('[role="button"], button')).toHaveCount(3) // Minimum expected
    })
  })

  test.describe('Visual and UI Consistency', () => {
    test('should display consistent branding and colors', async ({ page }) => {
      await helpers.navigateToApp()
      
      // Check for consistent color scheme (Pokemon-inspired)
      await expect(page.locator('.bg-gradient-to-r')).toBeVisible()
      await expect(page.locator('[class*="from-red-500"]')).toBeVisible()
      await expect(page.locator('[class*="to-purple-600"]')).toBeVisible()
    })

    test('should handle different screen sizes gracefully', async ({ page }) => {
      await helpers.seedWineData(Object.values(mockWineData))
      
      // Test desktop
      await page.setViewportSize({ width: 1920, height: 1080 })
      await helpers.navigateToApp()
      await helpers.verifyCollectionHasWines(5)
      
      // Test tablet
      await page.setViewportSize({ width: 768, height: 1024 })
      await helpers.verifyCollectionHasWines(5)
      
      // Test mobile
      await page.setViewportSize({ width: 375, height: 667 })
      await helpers.verifyCollectionHasWines(5)
    })
  })
})