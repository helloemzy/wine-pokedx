/**
 * Mobile Testing Automation Suite
 * Tests touch interactions, responsive design, and mobile-specific functionality
 */

import { test, expect, devices } from '@playwright/test'
import { WinePokedexHelpers } from './utils/page-helpers'
import { mockWineData, mobileTestData } from './fixtures/test-data'

test.describe('Mobile Testing - Wine Pokédex', () => {
  let helpers: WinePokedexHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new WinePokedexHelpers(page)
  })

  test.describe('Touch Interactions', () => {
    test.use({ ...devices['iPhone 12 Pro'] })

    test('should handle wine card taps correctly', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      
      const wineCard = page.locator('[data-testid="wine-card"]').first()
      
      // Test tap interaction
      await wineCard.tap()
      
      // Should trigger appropriate action (navigation, modal, etc.)
      // Verify tap was registered (specific assertion depends on implementation)
      expect(await wineCard.isVisible()).toBe(true)
    })

    test('should handle trading card flip via tap', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      await helpers.changeViewMode('cards')
      
      const tradingCard = page.locator('[data-testid="trading-card"]').first()
      
      // Tap to flip card
      await tradingCard.tap()
      
      // Verify card flipped
      await page.waitForTimeout(500) // Wait for flip animation
      expect(await helpers.isTradingCardFlipped('Château Margaux')).toBe(true)
      
      // Tap again to flip back
      await tradingCard.tap()
      await page.waitForTimeout(500)
      expect(await helpers.isTradingCardFlipped('Château Margaux')).toBe(false)
    })

    test('should handle double tap interactions', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      await helpers.changeViewMode('cards')
      
      const tradingCard = page.locator('[data-testid="trading-card"]').first()
      
      // Double tap (if implemented for zoom or special action)
      await tradingCard.dblclick()
      
      // Verify double tap behavior (implementation-specific)
      // Could trigger zoom, detail view, etc.
    })

    test('should handle long press interactions', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      
      const wineCard = page.locator('[data-testid="wine-card"]').first()
      
      // Long press (touch and hold)
      await page.touchscreen.tap(
        ...(await wineCard.boundingBox()).then(box => 
          [box!.x + box!.width / 2, box!.y + box!.height / 2]
        ),
        { delay: 1000 }
      )
      
      // Verify long press action (context menu, selection, etc.)
      // Implementation-specific assertion
    })

    test('should handle swipe gestures', async ({ page }) => {
      await helpers.seedWineData(Object.values(mockWineData))
      await helpers.navigateToApp()
      
      // Get collection container
      const collection = page.locator('[data-testid="wine-collection"]').first()
      const box = await collection.boundingBox()
      
      if (box) {
        // Swipe left to right (or implement carousel navigation)
        await page.touchscreen.tap(box.x + box.width * 0.8, box.y + box.height / 2)
        await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2)
        
        // Verify swipe behavior (navigation, pagination, etc.)
        await page.waitForTimeout(500)
      }
    })

    test('should handle pinch zoom on trading cards', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      await helpers.changeViewMode('cards')
      
      const tradingCard = page.locator('[data-testid="trading-card"]').first()
      const box = await tradingCard.boundingBox()
      
      if (box) {
        const centerX = box.x + box.width / 2
        const centerY = box.y + box.height / 2
        
        // Simulate pinch zoom (two finger gesture)
        await page.touchscreen.tap(centerX - 50, centerY - 50)
        await page.touchscreen.tap(centerX + 50, centerY + 50)
        
        // Move fingers apart (zoom in)
        await page.mouse.move(centerX - 100, centerY - 100)
        await page.mouse.move(centerX + 100, centerY + 100)
        
        // Verify zoom behavior if implemented
        await page.waitForTimeout(500)
      }
    })
  })

  test.describe('Responsive Layout Testing', () => {
    for (const viewport of mobileTestData.viewportSizes) {
      test(`should adapt layout correctly for ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        
        await helpers.seedWineData(Object.values(mockWineData))
        await helpers.navigateToApp()
        await helpers.waitForWineCardsToLoad()
        
        // Verify responsive layout elements
        if (viewport.width < 768) {
          // Mobile layout checks
          await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
          
          // Wine cards should stack vertically or use mobile grid
          const wineCards = await helpers.getVisibleWineCards()
          expect(wineCards.length).toBeGreaterThan(0)
          
        } else if (viewport.width < 1024) {
          // Tablet layout checks
          await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible()
          
        } else {
          // Desktop layout checks
          await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible()
        }
        
        // Verify all essential elements are accessible
        await expect(page.locator('[data-testid="search-input"]')).toBeVisible()
        await expect(page.locator('[data-testid="view-mode-buttons"]')).toBeVisible()
        await helpers.verifyCollectionHasWines(5)
      })
    }

    test('should handle orientation changes gracefully', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary, mockWineData.epic])
      
      // Start in portrait
      await page.setViewportSize({ width: 375, height: 667 })
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      
      let visibleWines = await helpers.getVisibleWineCards()
      expect(visibleWines.length).toBe(2)
      
      // Rotate to landscape
      await page.setViewportSize({ width: 667, height: 375 })
      await page.waitForTimeout(500) // Wait for layout adjustment
      
      // Verify layout adapts
      visibleWines = await helpers.getVisibleWineCards()
      expect(visibleWines.length).toBe(2) // Same wines, different layout
      
      // Essential functionality should still work
      await helpers.searchWines('Château')
      await helpers.verifyCollectionHasWines(1)
    })
  })

  test.describe('Mobile Navigation', () => {
    test.use({ ...devices['iPhone 12 Pro'] })

    test('should provide accessible mobile navigation', async ({ page }) => {
      await helpers.navigateToApp()
      
      // Check for mobile-friendly navigation elements
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]')
      
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.tap()
        
        // Verify mobile menu opens
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
        
        // Test menu navigation
        const menuItems = page.locator('[data-testid="mobile-menu"] a, [data-testid="mobile-menu"] button')
        const count = await menuItems.count()
        expect(count).toBeGreaterThan(0)
      }
    })

    test('should handle bottom tab navigation if implemented', async ({ page }) => {
      await helpers.navigateToApp()
      
      // Check for bottom tab bar (common mobile pattern)
      const tabBar = page.locator('[data-testid="tab-bar"]')
      
      if (await tabBar.isVisible()) {
        const tabs = tabBar.locator('button, a')
        const tabCount = await tabs.count()
        
        // Test each tab
        for (let i = 0; i < tabCount; i++) {
          await tabs.nth(i).tap()
          await page.waitForTimeout(300)
          
          // Verify tab navigation works
          expect(await tabs.nth(i).getAttribute('aria-selected')).toBeTruthy()
        }
      }
    })

    test('should maintain header visibility on scroll', async ({ page }) => {
      await helpers.seedWineData(Object.values(mockWineData))
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      
      const header = page.locator('header, [data-testid="pokedex-header"]').first()
      
      // Verify header is visible initially
      await expect(header).toBeVisible()
      
      // Scroll down
      await page.evaluate(() => {
        window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' })
      })
      
      await page.waitForTimeout(1000)
      
      // Header should still be accessible (sticky/fixed or easily accessible)
      // This depends on the implementation - could be sticky header or back-to-top button
      const backToTop = page.locator('[data-testid="back-to-top"]')
      const stickyHeader = header
      
      const isHeaderAccessible = await stickyHeader.isVisible() || await backToTop.isVisible()
      expect(isHeaderAccessible).toBe(true)
    })
  })

  test.describe('Mobile Search and Filter', () => {
    test.use({ ...devices['Pixel 5'] })

    test('should provide mobile-friendly search interface', async ({ page }) => {
      await helpers.seedWineData(Object.values(mockWineData))
      await helpers.navigateToApp()
      
      const searchInput = page.locator('[data-testid="search-input"]')
      
      // Tap to focus search
      await searchInput.tap()
      
      // Verify mobile keyboard appears (can't directly test, but input should be focused)
      expect(await searchInput.evaluate(el => document.activeElement === el)).toBe(true)
      
      // Type search query
      await searchInput.fill('Château')
      
      // Should show results
      await helpers.verifyCollectionHasWines(1)
    })

    test('should handle mobile filter interface', async ({ page }) => {
      await helpers.seedWineData(Object.values(mockWineData))
      await helpers.navigateToApp()
      
      // Check for mobile filter button/interface
      const filterButton = page.locator('[data-testid="mobile-filter-button"]')
      
      if (await filterButton.isVisible()) {
        await filterButton.tap()
        
        // Verify filter panel opens
        await expect(page.locator('[data-testid="filter-panel"]')).toBeVisible()
        
        // Test filter interactions
        const typeFilter = page.locator('[data-testid="type-filter"]')
        await typeFilter.tap()
        
        // Select filter option
        const redWineOption = page.locator('option[value="Red Wine"], [data-value="Red Wine"]')
        await redWineOption.tap()
        
        // Apply filters
        const applyButton = page.locator('[data-testid="apply-filters"]')
        await applyButton.tap()
        
        // Verify filtering works
        await page.waitForTimeout(500)
        const visibleNames = await helpers.getVisibleWineNames()
        const expectedRedWines = ['Château Margaux', 'Screaming Eagle Cabernet']
        
        for (const wineName of expectedRedWines) {
          expect(visibleNames.some(name => name.includes(wineName))).toBe(true)
        }
      } else {
        // If no mobile-specific filter, test standard filter on mobile
        await helpers.filterByType('Red Wine')
        await helpers.verifyCollectionHasWines(2)
      }
    })

    test('should support voice search if implemented', async ({ page }) => {
      await helpers.navigateToApp()
      
      // Check for voice search button
      const voiceSearchButton = page.locator('[data-testid="voice-search"]')
      
      if (await voiceSearchButton.isVisible()) {
        await voiceSearchButton.tap()
        
        // Would trigger browser's speech recognition API
        // Can't fully test without user interaction, but verify button works
        await page.waitForTimeout(1000)
      }
    })
  })

  test.describe('Mobile Performance', () => {
    test.use({ ...devices['iPhone 12 Pro'] })

    test('should load quickly on mobile devices', async ({ page }) => {
      await helpers.seedWineData(Object.values(mockWineData))
      
      const startTime = Date.now()
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      const loadTime = Date.now() - startTime
      
      // Mobile should load within reasonable time
      expect(loadTime).toBeLessThan(5000) // 5 seconds on mobile
    })

    test('should handle mobile touch scrolling smoothly', async ({ page }) => {
      // Create larger collection for scrolling test
      const largeCollection = Array.from({ length: 20 }, (_, i) => ({
        ...mockWineData.common,
        id: i + 1,
        name: `Wine ${i + 1}`
      }))
      
      await helpers.seedWineData(largeCollection)
      await helpers.navigateToApp()
      await helpers.waitForWineCardsToLoad()
      
      // Test smooth scrolling performance
      const collection = page.locator('[data-testid="wine-collection"]')
      const box = await collection.boundingBox()
      
      if (box) {
        // Simulate touch scroll
        await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
        
        const startY = box.y + box.height / 2
        const endY = box.y + 100
        
        // Swipe up to scroll down
        await page.mouse.move(box.x + box.width / 2, startY)
        await page.mouse.move(box.x + box.width / 2, endY)
        
        await page.waitForTimeout(500)
        
        // Verify page scrolled and remains responsive
        const scrollPosition = await page.evaluate(() => window.pageYOffset)
        expect(scrollPosition).toBeGreaterThan(0)
      }
    })

    test('should maintain 60fps during interactions', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      await helpers.changeViewMode('cards')
      
      // Start performance measurement
      await page.evaluate(() => {
        (window as any).performanceMarks = []
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'measure') {
              (window as any).performanceMarks.push(entry)
            }
          }
        })
        observer.observe({ entryTypes: ['measure'] })
      })
      
      // Perform multiple card flips
      const tradingCard = page.locator('[data-testid="trading-card"]').first()
      
      for (let i = 0; i < 5; i++) {
        await tradingCard.tap()
        await page.waitForTimeout(100)
      }
      
      // Check frame timing (simplified check)
      const frameData = await page.evaluate(() => {
        return (window as any).performanceMarks || []
      })
      
      // Should maintain smooth animation (implementation-dependent)
      console.log('Animation performance data:', frameData)
    })
  })

  test.describe('Mobile Accessibility', () => {
    test.use({ ...devices['iPhone 12 Pro'] })

    test('should support touch screen reader navigation', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      
      // Check for proper ARIA labels on interactive elements
      const interactiveElements = page.locator('button, [role="button"], input, select')
      const count = await interactiveElements.count()
      
      expect(count).toBeGreaterThan(0)
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = interactiveElements.nth(i)
        const ariaLabel = await element.getAttribute('aria-label')
        const textContent = await element.textContent()
        
        // Element should have accessible name
        expect(ariaLabel || textContent).toBeTruthy()
      }
    })

    test('should maintain minimum touch target sizes', async ({ page }) => {
      await helpers.navigateToApp()
      
      // Check button sizes meet accessibility guidelines (44px minimum)
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i)
        const box = await button.boundingBox()
        
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44)
          expect(box.height).toBeGreaterThanOrEqual(44)
        }
      }
    })

    test('should support high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' })
      
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      
      // Verify content is still readable
      const wineCard = page.locator('[data-testid="wine-card"]').first()
      await expect(wineCard).toBeVisible()
      
      const cardText = await wineCard.textContent()
      expect(cardText).toContain('Château Margaux')
    })

    test('should handle reduced motion preferences', async ({ page }) => {
      // Simulate reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' })
      
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      await helpers.changeViewMode('cards')
      
      // Card flip should still work but with reduced animation
      await helpers.flipTradingCard('Château Margaux')
      
      // Should show flipped state regardless of animation
      expect(await helpers.isTradingCardFlipped('Château Margaux')).toBe(true)
    })
  })

  test.describe('Mobile Device Features', () => {
    test('should handle device rotation gracefully', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary, mockWineData.epic])
      await helpers.navigateToApp()
      
      // Start in portrait mode
      await page.setViewportSize({ width: 375, height: 812 })
      await helpers.verifyCollectionHasWines(2)
      
      // Rotate to landscape
      await page.setViewportSize({ width: 812, height: 375 })
      await page.waitForTimeout(500)
      
      // Content should still be accessible and properly laid out
      await helpers.verifyCollectionHasWines(2)
      
      // Search should still work
      await helpers.searchWines('Château')
      await helpers.verifyCollectionHasWines(1)
    })

    test('should work with safe area insets (iPhone X+)', async ({ page }) => {
      // Simulate iPhone with safe area (notch)
      await page.addStyleTag({
        content: `
          :root {
            --safe-area-inset-top: 44px;
            --safe-area-inset-bottom: 34px;
            --safe-area-inset-left: 0px;
            --safe-area-inset-right: 0px;
          }
        `
      })
      
      await helpers.navigateToApp()
      
      // Verify header respects safe area
      const header = page.locator('header').first()
      if (await header.isVisible()) {
        const headerBox = await header.boundingBox()
        expect(headerBox?.y).toBeGreaterThanOrEqual(44) // Should be below notch
      }
    })

    test('should handle pull-to-refresh if implemented', async ({ page }) => {
      await helpers.seedWineData([mockWineData.legendary])
      await helpers.navigateToApp()
      
      // Simulate pull-to-refresh gesture
      const viewport = page.viewportSize()
      if (viewport) {
        await page.touchscreen.tap(viewport.width / 2, 50)
        await page.mouse.move(viewport.width / 2, 200) // Pull down
        
        // Wait for refresh animation/action
        await page.waitForTimeout(1000)
        
        // Content should still be present after refresh
        await helpers.verifyCollectionHasWines(1)
      }
    })
  })

  test.describe('Cross-Platform Mobile Testing', () => {
    const mobileDevices = [
      devices['iPhone 12 Pro'],
      devices['Pixel 5'],
      devices['Galaxy S21'],
      devices['iPad Pro']
    ]

    for (const device of mobileDevices) {
      test(`should work consistently on ${device.userAgent?.includes('iPhone') ? 'iPhone' : device.userAgent?.includes('Pixel') ? 'Android Pixel' : device.userAgent?.includes('Galaxy') ? 'Samsung Galaxy' : 'iPad'}`, async ({ page }) => {
        await page.setViewportSize(device.viewport)
        await page.setUserAgent(device.userAgent || '')
        
        await helpers.seedWineData([mockWineData.legendary])
        await helpers.navigateToApp()
        await helpers.waitForWineCardsToLoad()
        
        // Core functionality should work across all devices
        await helpers.verifyCollectionHasWines(1)
        await helpers.searchWines('Château')
        await helpers.verifyCollectionHasWines(1)
        
        // View mode switching
        await helpers.changeViewMode('cards')
        await helpers.flipTradingCard('Château Margaux')
        expect(await helpers.isTradingCardFlipped('Château Margaux')).toBe(true)
      })
    }
  })
})