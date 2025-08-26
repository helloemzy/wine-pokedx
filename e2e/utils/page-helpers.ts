/**
 * Page helper utilities for E2E tests
 * Provides reusable functions for common Wine Pokédex interactions
 */

import { Page, expect } from '@playwright/test'
import type { Wine } from '../../src/types/wine'

export class WinePokedexHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to the application and wait for initial load
   */
  async navigateToApp() {
    await this.page.goto('/')
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Clear localStorage to start with empty collection
   */
  async clearLocalStorage() {
    await this.page.evaluate(() => {
      localStorage.clear()
    })
  }

  /**
   * Add wine data to localStorage for testing
   */
  async seedWineData(wines: Partial<Wine>[]) {
    await this.page.evaluate((wineData) => {
      const wines = wineData.map((wine, index) => ({
        id: Date.now() + index,
        dateAdded: new Date(),
        experiencePoints: 100,
        captured: true,
        ...wine,
      }))
      localStorage.setItem('wine_pokedex_wines', JSON.stringify(wines))
    }, wines)
  }

  /**
   * Get collection statistics from the UI
   */
  async getCollectionStats() {
    const totalWines = await this.page.locator('[data-testid="total-wines"]').textContent()
    const uniqueRegions = await this.page.locator('[data-testid="unique-regions"]').textContent()
    const uniqueGrapes = await this.page.locator('[data-testid="unique-grapes"]').textContent()
    const averageRating = await this.page.locator('[data-testid="average-rating"]').textContent()

    return {
      totalWines: parseInt(totalWines || '0'),
      uniqueRegions: parseInt(uniqueRegions || '0'),
      uniqueGrapes: parseInt(uniqueGrapes || '0'),
      averageRating: parseFloat(averageRating || '0'),
    }
  }

  /**
   * Search for wines using the search input
   */
  async searchWines(query: string) {
    const searchInput = this.page.locator('input[placeholder*="Search"]').first()
    await searchInput.clear()
    await searchInput.fill(query)
    await searchInput.press('Enter')
    // Wait for debounced search results
    await this.page.waitForTimeout(500)
  }

  /**
   * Filter wines by type
   */
  async filterByType(wineType: string) {
    const typeFilter = this.page.locator('select[aria-label*="type"], [data-testid="type-filter"]')
    await typeFilter.selectOption(wineType)
    await this.page.waitForTimeout(300)
  }

  /**
   * Filter wines by rarity
   */
  async filterByRarity(rarity: string) {
    const rarityFilter = this.page.locator('select[aria-label*="rarity"], [data-testid="rarity-filter"]')
    await rarityFilter.selectOption(rarity)
    await this.page.waitForTimeout(300)
  }

  /**
   * Change view mode (cards, grid, list)
   */
  async changeViewMode(mode: 'cards' | 'grid' | 'list') {
    const viewButton = this.page.locator(`button[title*="${mode}" i]`).first()
    await viewButton.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Open scan modal
   */
  async openScanModal() {
    const scanButton = this.page.locator('button:has-text("Scan Bottle")').first()
    await scanButton.click()
    await this.page.waitForSelector('[data-testid="scan-modal"]', { state: 'visible' })
  }

  /**
   * Close scan modal
   */
  async closeScanModal() {
    const closeButton = this.page.locator('[data-testid="scan-modal"] button:has-text("Close")').first()
    await closeButton.click()
    await this.page.waitForSelector('[data-testid="scan-modal"]', { state: 'hidden' })
  }

  /**
   * Get visible wine cards
   */
  async getVisibleWineCards() {
    return await this.page.locator('[data-testid="wine-card"]').all()
  }

  /**
   * Get wine names from visible cards
   */
  async getVisibleWineNames(): Promise<string[]> {
    const cards = await this.getVisibleWineCards()
    const names: string[] = []
    
    for (const card of cards) {
      const nameElement = card.locator('[data-testid="wine-name"]').first()
      const name = await nameElement.textContent()
      if (name) names.push(name.trim())
    }
    
    return names
  }

  /**
   * Flip a trading card
   */
  async flipTradingCard(wineName: string) {
    const card = this.page.locator(`[data-testid="trading-card"]:has-text("${wineName}")`).first()
    await card.click()
    await this.page.waitForTimeout(500) // Wait for flip animation
  }

  /**
   * Check if trading card is flipped (showing WSET notes)
   */
  async isTradingCardFlipped(wineName: string) {
    const card = this.page.locator(`[data-testid="trading-card"]:has-text("${wineName}")`).first()
    const wsetNotes = card.locator(':has-text("WSET Tasting Notes")')
    return await wsetNotes.isVisible()
  }

  /**
   * Verify empty collection state
   */
  async verifyEmptyCollection() {
    await expect(this.page.locator(':has-text("Your Wine Collection is Empty")')).toBeVisible()
    await expect(this.page.locator(':has-text("Scan Your First Bottle")')).toBeVisible()
  }

  /**
   * Verify collection has wines
   */
  async verifyCollectionHasWines(expectedCount?: number) {
    const wineCards = await this.getVisibleWineCards()
    
    if (expectedCount !== undefined) {
      expect(wineCards.length).toBe(expectedCount)
    } else {
      expect(wineCards.length).toBeGreaterThan(0)
    }
  }

  /**
   * Verify no search results
   */
  async verifyNoSearchResults() {
    await expect(this.page.locator(':has-text("No Wines Found")')).toBeVisible()
    await expect(this.page.locator(':has-text("Try adjusting your search")')).toBeVisible()
  }

  /**
   * Wait for wine cards to load
   */
  async waitForWineCardsToLoad() {
    await this.page.waitForSelector('[data-testid="wine-card"]', { 
      state: 'visible', 
      timeout: 5000 
    })
  }

  /**
   * Verify wine card details
   */
  async verifyWineCardDetails(wineName: string, expectedDetails: Partial<Wine>) {
    const card = this.page.locator(`[data-testid="wine-card"]:has-text("${wineName}")`).first()
    
    if (expectedDetails.year) {
      await expect(card.locator(`:has-text("${expectedDetails.year}")`)).toBeVisible()
    }
    
    if (expectedDetails.region) {
      await expect(card.locator(`:has-text("${expectedDetails.region}")`)).toBeVisible()
    }
    
    if (expectedDetails.producer) {
      await expect(card.locator(`:has-text("${expectedDetails.producer}")`)).toBeVisible()
    }
    
    if (expectedDetails.grape) {
      await expect(card.locator(`:has-text("${expectedDetails.grape}")`)).toBeVisible()
    }
    
    if (expectedDetails.rarity) {
      await expect(card.locator(`:has-text("${expectedDetails.rarity}")`)).toBeVisible()
    }
  }

  /**
   * Verify star rating display
   */
  async verifyStarRating(wineName: string, expectedRating: number) {
    const card = this.page.locator(`[data-testid="wine-card"]:has-text("${wineName}")`).first()
    const stars = card.locator('[data-testid="star-rating"] .star-filled')
    
    await expect(stars).toHaveCount(expectedRating)
  }

  /**
   * Verify rarity styling
   */
  async verifyRarityAppearance(wineName: string, expectedRarity: string) {
    const card = this.page.locator(`[data-testid="wine-card"]:has-text("${wineName}")`).first()
    
    // Different rarities should have different visual styling
    const rarityClasses = {
      'Common': 'border-gray-300',
      'Uncommon': 'border-green-300',
      'Rare': 'border-blue-300',
      'Epic': 'border-purple-300',
      'Legendary': 'border-yellow-300'
    }
    
    const expectedClass = rarityClasses[expectedRarity as keyof typeof rarityClasses]
    if (expectedClass) {
      await expect(card).toHaveClass(new RegExp(expectedClass))
    }
  }

  /**
   * Verify responsive design
   */
  async verifyResponsiveLayout(viewportWidth: number) {
    if (viewportWidth < 768) {
      // Mobile: should show single column or simplified layout
      await expect(this.page.locator('[data-testid="mobile-layout"]')).toBeVisible()
    } else if (viewportWidth < 1024) {
      // Tablet: should show appropriate grid
      await expect(this.page.locator('[data-testid="tablet-layout"]')).toBeVisible()
    } else {
      // Desktop: should show full layout
      await expect(this.page.locator('[data-testid="desktop-layout"]')).toBeVisible()
    }
  }

  /**
   * Simulate mobile touch interactions
   */
  async simulateMobileTouch(element: string, action: 'tap' | 'swipe' | 'longpress') {
    const target = this.page.locator(element)
    
    switch (action) {
      case 'tap':
        await target.tap()
        break
      case 'swipe':
        // Simulate swipe gesture
        const box = await target.boundingBox()
        if (box) {
          await this.page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
        }
        break
      case 'longpress':
        await target.tap({ delay: 1000 })
        break
    }
  }

  /**
   * Check for visual regression by comparing screenshots
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true
    })
  }

  /**
   * Verify page performance metrics
   */
  async checkPerformanceMetrics() {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        timeToFirstByte: navigation.responseStart - navigation.requestStart
      }
    })
    
    // Assert reasonable performance thresholds
    expect(metrics.loadTime).toBeLessThan(3000) // 3 seconds
    expect(metrics.domContentLoaded).toBeLessThan(2000) // 2 seconds
    expect(metrics.timeToFirstByte).toBeLessThan(1000) // 1 second
    
    return metrics
  }

  /**
   * Verify accessibility compliance
   */
  async checkAccessibility() {
    // Check for basic accessibility features
    await expect(this.page.locator('h1')).toBeVisible() // Page should have main heading
    await expect(this.page.locator('main, [role="main"]')).toBeVisible() // Main content area
    
    // Check that interactive elements are keyboard accessible
    const buttons = await this.page.locator('button').all()
    for (const button of buttons.slice(0, 5)) { // Check first 5 buttons
      await button.focus()
      expect(await button.evaluate(el => document.activeElement === el)).toBe(true)
    }
  }

  /**
   * Monitor console errors during test execution
   */
  async monitorConsoleErrors(): Promise<string[]> {
    const errors: string[] = []
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    this.page.on('pageerror', err => {
      errors.push(err.message)
    })
    
    return errors
  }
}