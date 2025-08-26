/**
 * Visual Regression Testing Suite
 * Tests UI consistency and Pokemon-style visual elements across different states
 */

import { test, expect } from '@playwright/test'
import { WinePokedexHelpers } from './utils/page-helpers'
import { mockWineData, mobileTestData } from './fixtures/test-data'

test.describe('Visual Regression Tests - Wine Pokédex', () => {
  let helpers: WinePokedexHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new WinePokedexHelpers(page)
  })

  test.describe('Main Page Layouts', () => {
    test('should maintain consistent empty collection layout', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.navigateToApp()
      
      // Take screenshot of empty state
      await expect(page).toHaveScreenshot('empty-collection.png', {
        fullPage: true,
        threshold: 0.2
      })
    })

    test('should maintain consistent collection with sample data', async ({ page }) => {
      await helpers.seedWineData(Object.values(mockWineData))
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      
      // Take screenshot of collection with data
      await expect(page).toHaveScreenshot('collection-with-data.png', {
        fullPage: true,
        threshold: 0.2
      })
    })

    test('should maintain header and navigation consistency', async ({ page }) => {
      await helpers.navigateToApp()
      
      // Screenshot just the header area
      const header = page.locator('header, [data-testid="pokedex-header"]').first()
      await expect(header).toHaveScreenshot('header-layout.png', {
        threshold: 0.1
      })
    })

    test('should maintain collection statistics styling', async ({ page }) => {
      await helpers.seedWineData(Object.values(mockWineData))
      await helpers.navigateToApp()
      
      // Screenshot the stats section
      const statsSection = page.locator('[data-testid="collection-stats"]').first()
      await expect(statsSection).toHaveScreenshot('collection-stats.png', {
        threshold: 0.1
      })
    })
  })

  test.describe('Wine Card Visual Consistency', () => {
    test('should maintain consistent wine card appearance in grid view', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary, mockWineData.epic, mockWineData.rare])
      await helpers.navigateToApp()
      await helpers.changeViewMode('grid')
      
      // Screenshot wine cards
      const wineGrid = page.locator('[data-testid="wine-grid"]').first()
      await expect(wineGrid).toHaveScreenshot('wine-cards-grid.png', {
        threshold: 0.2
      })
    })

    test('should maintain consistent wine card appearance in list view', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary, mockWineData.epic, mockWineData.rare])
      await helpers.navigateToApp()
      await helpers.changeViewMode('list')
      
      // Screenshot list view
      const wineList = page.locator('[data-testid="wine-list"]').first()
      await expect(wineList).toHaveScreenshot('wine-cards-list.png', {
        threshold: 0.2
      })
    })

    test('should maintain rarity-based visual differences', async ({ page }) => {
      await helpers.seedWineData([
        mockWineData.common,
        mockWineData.uncommon,
        mockWineData.rare,
        mockWineData.epic,
        mockWineData.legendary
      ])
      await helpers.navigateToApp()
      await helpers.changeViewMode('grid')
      
      // Screenshot showing all rarities
      await expect(page).toHaveScreenshot('all-rarities-display.png', {
        fullPage: true,
        threshold: 0.2
      })
    })

    test('should show consistent star ratings', async ({ page }) => {
      // Create wines with different ratings
      const ratingTests = [
        { ...mockWineData.common, name: 'One Star Wine', rating: 1 },
        { ...mockWineData.common, name: 'Three Star Wine', rating: 3 },
        { ...mockWineData.legendary, name: 'Five Star Wine', rating: 5 }
      ]
      
      await helpers.seedWineData(ratingTests)
      await helpers.navigateToApp()
      
      // Screenshot star rating variations
      const ratingSection = page.locator('[data-testid="wine-grid"]').first()
      await expect(ratingSection).toHaveScreenshot('star-ratings.png', {
        threshold: 0.2
      })
    })
  })

  test.describe('Trading Card Visual Elements', () => {
    test('should maintain consistent trading card front design', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      await helpers.changeViewMode('cards')
      
      // Screenshot trading card front
      const tradingCard = page.locator('[data-testid="trading-card"]').first()
      await expect(tradingCard).toHaveScreenshot('trading-card-front.png', {
        threshold: 0.2
      })
    })

    test('should maintain consistent trading card back design', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      await helpers.changeViewMode('cards')
      
      // Flip the card to show back
      await helpers.flipTradingCard('Château Margaux')
      
      // Screenshot trading card back with WSET notes
      const tradingCard = page.locator('[data-testid="trading-card"]').first()
      await expect(tradingCard).toHaveScreenshot('trading-card-back.png', {
        threshold: 0.2
      })
    })

    test('should show holographic effects for legendary cards', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      await helpers.changeViewMode('cards')
      
      // Hover over legendary card to trigger holographic effect
      const legendaryCard = page.locator('[data-testid="trading-card"]').first()
      await legendaryCard.hover()
      
      // Screenshot with holographic effect
      await expect(legendaryCard).toHaveScreenshot('legendary-holographic.png', {
        threshold: 0.3 // Higher threshold for animated effects
      })
    })

    test('should maintain card size variations', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      await helpers.changeViewMode('cards')
      
      // Test different card sizes (if implemented)
      const cardSizes = ['small', 'medium', 'large']
      
      for (const size of cardSizes) {
        // This would require size controls in the UI
        await expect(page).toHaveScreenshot(`trading-card-${size}.png`, {
          threshold: 0.2
        })
      }
    })
  })

  test.describe('Search and Filter UI', () => {
    test('should maintain search interface consistency', async ({ page }) => {
      await helpers.seedWineData(Object.values(mockWineData))
      await helpers.navigateToApp()
      
      // Screenshot search and filter area
      const searchSection = page.locator('[data-testid="search-filter"]').first()
      await expect(searchSection).toHaveScreenshot('search-filter-interface.png', {
        threshold: 0.1
      })
    })

    test('should show consistent search results', async ({ page }) => {
      await helpers.seedWineData(Object.values(mockWineData))
      await helpers.navigateToApp()
      
      await helpers.searchWines('Château')
      
      // Screenshot search results
      await expect(page).toHaveScreenshot('search-results.png', {
        fullPage: true,
        threshold: 0.2
      })
    })

    test('should show consistent no results state', async ({ page }) => {
      await helpers.seedWineData(Object.values(mockWineData))
      await helpers.navigateToApp()
      
      await helpers.searchWines('nonexistent wine')
      
      // Screenshot no results state
      await expect(page).toHaveScreenshot('no-search-results.png', {
        fullPage: true,
        threshold: 0.2
      })
    })

    test('should maintain filter dropdown styling', async ({ page }) => {
      await helpers.seedWineData(Object.values(mockWineData))
      await helpers.navigateToApp()
      
      // Open type filter dropdown
      const typeFilter = page.locator('[data-testid="type-filter"]').first()
      await typeFilter.click()
      
      // Screenshot dropdown
      await expect(page).toHaveScreenshot('filter-dropdown.png', {
        threshold: 0.2
      })
    })
  })

  test.describe('Responsive Design Consistency', () => {
    for (const viewport of mobileTestData.viewportSizes) {
      test(`should maintain layout consistency on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        
        await helpers.seedWineData([mockWineData.legendary, mockWineData.epic])
        await helpers.navigateToApp()
        await helpers.waitForWineCardsToLoad()
        
        // Screenshot responsive layout
        await expect(page).toHaveScreenshot(`layout-${viewport.name.toLowerCase().replace(/\s+/g, '-')}.png`, {
          fullPage: true,
          threshold: 0.3
        })
      })
    }

    test('should maintain mobile navigation consistency', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
      
      await helpers.navigateToApp()
      
      // Screenshot mobile navigation
      const navigation = page.locator('[data-testid="mobile-nav"], nav').first()
      await expect(navigation).toHaveScreenshot('mobile-navigation.png', {
        threshold: 0.2
      })
    })

    test('should handle landscape orientation properly', async ({ page }) => {
      await page.setViewportSize({ width: 667, height: 375 }) // iPhone SE landscape
      
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      
      // Screenshot landscape layout
      await expect(page).toHaveScreenshot('landscape-layout.png', {
        fullPage: true,
        threshold: 0.3
      })
    })
  })

  test.describe('Modal and Overlay Consistency', () => {
    test('should maintain scan modal appearance', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.navigateToApp()
      
      await helpers.openScanModal()
      
      // Screenshot scan modal
      const scanModal = page.locator('[data-testid="scan-modal"]')
      await expect(scanModal).toHaveScreenshot('scan-modal.png', {
        threshold: 0.2
      })
    })

    test('should maintain overlay backdrop styling', async ({ page }) => {
      await helpers.clearLocalStorage()
      await helpers.navigateToApp()
      
      await helpers.openScanModal()
      
      // Screenshot full page with modal overlay
      await expect(page).toHaveScreenshot('modal-overlay.png', {
        fullPage: true,
        threshold: 0.2
      })
    })
  })

  test.describe('Animation and Transition States', () => {
    test('should maintain consistent hover states', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      
      const wineCard = page.locator('[data-testid="wine-card"]').first()
      await wineCard.hover()
      
      // Screenshot hover state
      await expect(wineCard).toHaveScreenshot('card-hover-state.png', {
        threshold: 0.3
      })
    })

    test('should maintain focus states for accessibility', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      
      // Focus on wine card
      const wineCard = page.locator('[data-testid="wine-card"]').first()
      await wineCard.focus()
      
      // Screenshot focus state
      await expect(wineCard).toHaveScreenshot('card-focus-state.png', {
        threshold: 0.2
      })
    })

    test('should maintain loading states', async ({ page }) => {
      // Simulate slow loading
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 1000)
      })
      
      await helpers.navigateToApp()
      
      // Screenshot during loading
      await expect(page).toHaveScreenshot('loading-state.png', {
        threshold: 0.3
      })
    })
  })

  test.describe('Color Theme Consistency', () => {
    test('should maintain Pokemon-inspired color palette', async ({ page }) => {
      await helpers.seedWineData([
        mockWineData.legendary,
        mockWineData.epic,
        mockWineData.rare,
        mockWineData.uncommon,
        mockWineData.common
      ])
      await helpers.navigateToApp()
      
      // Screenshot showing full color palette
      await expect(page).toHaveScreenshot('color-palette.png', {
        fullPage: true,
        threshold: 0.2
      })
    })

    test('should maintain gradient consistency', async ({ page }) => {
      await helpers.navigateToApp()
      
      // Screenshot gradient backgrounds
      const gradients = page.locator('[class*="gradient"]')
      await expect(gradients.first()).toHaveScreenshot('gradient-backgrounds.png', {
        threshold: 0.2
      })
    })
  })

  test.describe('Typography and Text Rendering', () => {
    test('should maintain consistent font rendering', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      
      // Screenshot text content
      const textElements = page.locator('h1, h2, h3, p').first()
      await expect(textElements).toHaveScreenshot('typography-sample.png', {
        threshold: 0.1
      })
    })

    test('should handle long wine names gracefully', async ({ page }) => {
      const longNameWine = {
        ...mockWineData.legendary,
        name: 'Very Very Very Long Wine Name That Should Be Handled Gracefully In The UI Design'
      }
      
      await helpers.seedWineData([longNameWine])
      await helpers.navigateToApp()
      
      // Screenshot text truncation
      await expect(page).toHaveScreenshot('long-text-handling.png', {
        fullPage: true,
        threshold: 0.2
      })
    })
  })

  test.describe('Dark Mode Support (Future)', () => {
    test.skip('should maintain consistency in dark mode', async ({ page }) => {
      // This test is skipped until dark mode is implemented
      await page.emulateMedia({ colorScheme: 'dark' })
      
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      
      await expect(page).toHaveScreenshot('dark-mode.png', {
        fullPage: true,
        threshold: 0.3
      })
    })
  })

  test.describe('Cross-Browser Consistency', () => {
    test('should render consistently across different browsers', async ({ page, browserName }) => {
      await helpers.seedWineData([mockWineData.legendary, mockWineData.epic])
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      
      // Screenshot for browser comparison
      await expect(page).toHaveScreenshot(`cross-browser-${browserName}.png`, {
        fullPage: true,
        threshold: 0.3
      })
    })
  })

  test.describe('Print Styles (Future Enhancement)', () => {
    test.skip('should maintain print-friendly layout', async ({ page }) => {
      await helpers.seedWineData(Object.values(mockWineData))
      await helpers.navigateToApp()
      
      // Emulate print media
      await page.emulateMedia({ media: 'print' })
      
      await expect(page).toHaveScreenshot('print-layout.png', {
        fullPage: true,
        threshold: 0.3
      })
    })
  })
})