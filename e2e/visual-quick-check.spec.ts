/**
 * Quick Visual Regression Check
 * Fast visual tests for core UI elements
 */

import { test, expect } from '@playwright/test'

test.describe('Quick Visual Regression Tests', () => {
  test('should display basic page structure', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Take screenshot of the basic page structure
    await expect(page).toHaveScreenshot('basic-page-structure.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.3 // Allow for some variation
    })
  })

  test('should show responsive behavior on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Take mobile screenshot
    await expect(page).toHaveScreenshot('mobile-responsive.png', {
      fullPage: true,
      animations: 'disabled',
      threshold: 0.3
    })
  })

  test('should show desktop layout', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Take desktop screenshot
    await expect(page).toHaveScreenshot('desktop-layout.png', {
      animations: 'disabled',
      threshold: 0.3,
      clip: { x: 0, y: 0, width: 1280, height: 720 } // Clip to reasonable size
    })
  })
})