/**
 * Comprehensive test suite for WineStorageService
 * Tests core game mechanics including stats, evolution, rarity, and collection management
 */

import { WineStorageService } from '../wineStorage'
import { mockLocalStorage, createMockWine } from '../../__tests__/setup'
import type { Wine } from '../../types/wine'

// Mock window object for localStorage
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage() })

describe('WineStorageService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('Core Storage Operations', () => {
    test('should save and retrieve wines', () => {
      const mockWine = createMockWine()
      WineStorageService.saveWines([mockWine])
      
      const retrievedWines = WineStorageService.getWines()
      expect(retrievedWines).toHaveLength(1)
      expect(retrievedWines[0]).toEqual(mockWine)
    })

    test('should handle empty storage gracefully', () => {
      const wines = WineStorageService.getWines()
      expect(wines).toEqual([])
    })

    test('should handle corrupted localStorage data', () => {
      ;(localStorage.getItem as jest.Mock).mockReturnValue('invalid json')
      
      const wines = WineStorageService.getWines()
      expect(wines).toEqual([])
    })
  })

  describe('Wine CRUD Operations', () => {
    test('should add wine with auto-generated ID and experience points', () => {
      const wineData = {
        name: 'Château Margaux',
        year: 2015,
        region: 'Bordeaux, France',
        producer: 'Château Margaux',
        type: 'Red Wine' as const,
        grape: 'Cabernet Sauvignon Blend',
        rating: 5,
        tastingNotes: 'Complex and elegant',
        captured: true,
        rarity: 'Legendary' as const,
      }

      const addedWine = WineStorageService.addWine(wineData)

      expect(addedWine.id).toBeDefined()
      expect(addedWine.dateAdded).toBeInstanceOf(Date)
      expect(addedWine.experiencePoints).toBeGreaterThan(0)
      expect(addedWine.name).toBe(wineData.name)
    })

    test('should update existing wine', () => {
      const wine = WineStorageService.addWine(createMockWine())
      
      const updatedWine = WineStorageService.updateWine(wine.id, {
        rating: 5,
        tastingNotes: 'Updated notes'
      })

      expect(updatedWine).not.toBeNull()
      expect(updatedWine!.rating).toBe(5)
      expect(updatedWine!.tastingNotes).toBe('Updated notes')
    })

    test('should return null when updating non-existent wine', () => {
      const result = WineStorageService.updateWine(999, { rating: 5 })
      expect(result).toBeNull()
    })

    test('should delete wine successfully', () => {
      const wine = WineStorageService.addWine(createMockWine())
      
      const deleted = WineStorageService.deleteWine(wine.id)
      expect(deleted).toBe(true)
      
      const wines = WineStorageService.getWines()
      expect(wines).toHaveLength(0)
    })

    test('should return false when deleting non-existent wine', () => {
      const deleted = WineStorageService.deleteWine(999)
      expect(deleted).toBe(false)
    })

    test('should get wine by ID', () => {
      const wine = WineStorageService.addWine(createMockWine())
      
      const retrieved = WineStorageService.getWineById(wine.id)
      expect(retrieved).toEqual(wine)
    })

    test('should return null for non-existent wine ID', () => {
      const retrieved = WineStorageService.getWineById(999)
      expect(retrieved).toBeNull()
    })
  })

  describe('Pokemon-Style Game Mechanics', () => {
    describe('Experience Points Calculation', () => {
      test('should calculate base experience points correctly', () => {
        const commonWine = WineStorageService.addWine(
          createMockWine({ rarity: 'Common', rating: 3, year: 2020 })
        )
        expect(commonWine.experiencePoints).toBe(100) // Base points
      })

      test('should apply rarity multipliers correctly', () => {
        const legendaryWine = WineStorageService.addWine(
          createMockWine({ rarity: 'Legendary', rating: 3, year: 2020 })
        )
        expect(legendaryWine.experiencePoints).toBe(500) // Base (100) * 5
      })

      test('should apply age bonuses correctly', () => {
        const currentYear = new Date().getFullYear()
        
        // Test 25-year-old wine (should get 50 bonus)
        const vintageWine = WineStorageService.addWine(
          createMockWine({ 
            rarity: 'Common', 
            rating: 3, 
            year: currentYear - 25 
          })
        )
        expect(vintageWine.experiencePoints).toBe(150) // 100 + 50

        // Test 15-year-old wine (should get 25 bonus)
        const agedWine = WineStorageService.addWine(
          createMockWine({ 
            rarity: 'Common', 
            rating: 3, 
            year: currentYear - 15 
          })
        )
        expect(agedWine.experiencePoints).toBe(125) // 100 + 25
      })

      test('should apply rating bonuses correctly', () => {
        const perfectWine = WineStorageService.addWine(
          createMockWine({ rarity: 'Common', rating: 5, year: 2020 })
        )
        expect(perfectWine.experiencePoints).toBe(175) // 100 + 25 + 50

        const goodWine = WineStorageService.addWine(
          createMockWine({ rarity: 'Common', rating: 4, year: 2020 })
        )
        expect(goodWine.experiencePoints).toBe(125) // 100 + 25
      })

      test('should combine all bonuses correctly', () => {
        const currentYear = new Date().getFullYear()
        const masterWine = WineStorageService.addWine(
          createMockWine({ 
            rarity: 'Legendary', 
            rating: 5, 
            year: currentYear - 25 
          })
        )
        // Base (100) * Legendary (5) + Age (50) + Rating (75) = 625
        expect(masterWine.experiencePoints).toBe(625)
      })
    })

    describe('Level Calculation', () => {
      test('should calculate level from experience points correctly', () => {
        const stats = WineStorageService.getCollectionStats()
        
        // Level formula: Math.floor(Math.sqrt(experiencePoints / 100)) + 1
        // For 0 XP: Math.floor(Math.sqrt(0 / 100)) + 1 = 1
        expect(stats.level).toBe(1)
      })

      test('should increase level with more experience', () => {
        // Add wines with known experience points
        WineStorageService.addWine(createMockWine({ experiencePoints: 400 }))
        WineStorageService.addWine(createMockWine({ experiencePoints: 500 }))
        // Total: 900 XP, Level = Math.floor(Math.sqrt(900 / 100)) + 1 = 4
        
        const stats = WineStorageService.getCollectionStats()
        expect(stats.level).toBe(4)
      })
    })
  })

  describe('Badge System', () => {
    test('should award "First Catch" badge for first wine', () => {
      WineStorageService.addWine(createMockWine())
      
      const badges = WineStorageService.getBadges()
      expect(badges).toHaveLength(1)
      expect(badges[0].id).toBe('first_wine')
      expect(badges[0].name).toBe('First Catch')
    })

    test('should award regional badge after 5 wines from same region', () => {
      for (let i = 0; i < 5; i++) {
        WineStorageService.addWine(
          createMockWine({ id: i + 1, region: 'Bordeaux, France' })
        )
      }
      
      const badges = WineStorageService.getBadges()
      const regionalBadge = badges.find(b => b.name === 'Bordeaux, France Explorer')
      expect(regionalBadge).toBeDefined()
    })

    test('should award grape specialist badge after 3 wines from same grape', () => {
      for (let i = 0; i < 3; i++) {
        WineStorageService.addWine(
          createMockWine({ id: i + 1, grape: 'Pinot Noir' })
        )
      }
      
      const badges = WineStorageService.getBadges()
      const grapeBadge = badges.find(b => b.name === 'Pinot Noir Specialist')
      expect(grapeBadge).toBeDefined()
    })

    test('should award vintage collector badge for 20+ year old wine', () => {
      const currentYear = new Date().getFullYear()
      WineStorageService.addWine(
        createMockWine({ year: currentYear - 25 })
      )
      
      const badges = WineStorageService.getBadges()
      const vintageBadge = badges.find(b => b.id === 'vintage_collector')
      expect(vintageBadge).toBeDefined()
    })

    test('should award perfectionist badge for 5-star rating', () => {
      WineStorageService.addWine(createMockWine({ rating: 5 }))
      
      const badges = WineStorageService.getBadges()
      const perfectBadge = badges.find(b => b.id === 'perfectionist')
      expect(perfectBadge).toBeDefined()
    })

    test('should award collection milestone badges', () => {
      // Add 10 wines to trigger milestone
      for (let i = 0; i < 10; i++) {
        WineStorageService.addWine(createMockWine({ id: i + 1 }))
      }
      
      const badges = WineStorageService.getBadges()
      const milestoneBadge = badges.find(b => b.id === 'collection_10')
      expect(milestoneBadge).toBeDefined()
      expect(milestoneBadge!.name).toBe('10 Wine Master')
    })
  })

  describe('Search and Filter Functionality', () => {
    beforeEach(() => {
      WineStorageService.addWine(createMockWine({
        id: 1,
        name: 'Château Margaux',
        region: 'Bordeaux, France',
        producer: 'Château Margaux',
        grape: 'Cabernet Sauvignon',
        year: 2015,
        rating: 5,
        rarity: 'Legendary'
      }))
      
      WineStorageService.addWine(createMockWine({
        id: 2,
        name: 'Domaine de la Côte Pinot Noir',
        region: 'California, USA',
        producer: 'Domaine de la Côte',
        grape: 'Pinot Noir',
        year: 2019,
        rating: 4,
        rarity: 'Rare'
      }))
    })

    test('should search wines by name', () => {
      const results = WineStorageService.searchWines('Margaux')
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Château Margaux')
    })

    test('should search wines by region', () => {
      const results = WineStorageService.searchWines('bordeaux')
      expect(results).toHaveLength(1)
      expect(results[0].region).toBe('Bordeaux, France')
    })

    test('should search wines by producer', () => {
      const results = WineStorageService.searchWines('côte')
      expect(results).toHaveLength(1)
      expect(results[0].producer).toBe('Domaine de la Côte')
    })

    test('should search wines by grape variety', () => {
      const results = WineStorageService.searchWines('pinot')
      expect(results).toHaveLength(1)
      expect(results[0].grape).toBe('Pinot Noir')
    })

    test('should search wines by year', () => {
      const results = WineStorageService.searchWines('2015')
      expect(results).toHaveLength(1)
      expect(results[0].year).toBe(2015)
    })

    test('should filter wines by type', () => {
      const results = WineStorageService.filterWines({ type: 'Red Wine' })
      expect(results).toHaveLength(2)
    })

    test('should filter wines by region', () => {
      const results = WineStorageService.filterWines({ region: 'Bordeaux, France' })
      expect(results).toHaveLength(1)
      expect(results[0].region).toBe('Bordeaux, France')
    })

    test('should filter wines by grape variety', () => {
      const results = WineStorageService.filterWines({ grape: 'Pinot Noir' })
      expect(results).toHaveLength(1)
      expect(results[0].grape).toBe('Pinot Noir')
    })

    test('should filter wines by year range', () => {
      const results = WineStorageService.filterWines({ yearRange: [2018, 2020] })
      expect(results).toHaveLength(1)
      expect(results[0].year).toBe(2019)
    })

    test('should filter wines by minimum rating', () => {
      const results = WineStorageService.filterWines({ ratingMin: 5 })
      expect(results).toHaveLength(1)
      expect(results[0].rating).toBe(5)
    })

    test('should filter wines by rarity', () => {
      const results = WineStorageService.filterWines({ rarity: 'Legendary' })
      expect(results).toHaveLength(1)
      expect(results[0].rarity).toBe('Legendary')
    })

    test('should combine multiple filters', () => {
      const results = WineStorageService.filterWines({
        rarity: 'Rare',
        ratingMin: 4,
        yearRange: [2018, 2020]
      })
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Domaine de la Côte Pinot Noir')
    })
  })

  describe('Collection Statistics', () => {
    beforeEach(() => {
      // Add diverse wine collection for testing
      WineStorageService.addWine(createMockWine({
        id: 1,
        region: 'Bordeaux, France',
        producer: 'Producer A',
        grape: 'Cabernet Sauvignon',
        year: 2015,
        rating: 5,
        rarity: 'Legendary',
        experiencePoints: 500
      }))
      
      WineStorageService.addWine(createMockWine({
        id: 2,
        region: 'California, USA',
        producer: 'Producer B',
        grape: 'Pinot Noir',
        year: 2019,
        rating: 4,
        rarity: 'Rare',
        experiencePoints: 200
      }))
      
      WineStorageService.addWine(createMockWine({
        id: 3,
        region: 'Bordeaux, France',
        producer: 'Producer A',
        grape: 'Merlot',
        year: 2020,
        rating: 3,
        rarity: 'Common',
        experiencePoints: 100
      }))
    })

    test('should calculate total wines correctly', () => {
      const stats = WineStorageService.getCollectionStats()
      expect(stats.totalWines).toBe(4) // Including first wine badge wine
    })

    test('should calculate total experience correctly', () => {
      const stats = WineStorageService.getCollectionStats()
      expect(stats.totalExperience).toBe(900) // 500 + 200 + 100 + 100 (first wine)
    })

    test('should calculate average rating correctly', () => {
      const stats = WineStorageService.getCollectionStats()
      expect(stats.averageRating).toBe(4) // (5 + 4 + 3 + 4) / 4
    })

    test('should count unique regions correctly', () => {
      const stats = WineStorageService.getCollectionStats()
      expect(stats.uniqueRegions).toBe(3) // Bordeaux, California, Test Region
    })

    test('should count unique grapes correctly', () => {
      const stats = WineStorageService.getCollectionStats()
      expect(stats.uniqueGrapes).toBe(4) // Cabernet, Pinot, Merlot, Test Grape
    })

    test('should count unique producers correctly', () => {
      const stats = WineStorageService.getCollectionStats()
      expect(stats.uniqueProducers).toBe(3) // Producer A, B, Test Producer
    })

    test('should calculate vintage range correctly', () => {
      const stats = WineStorageService.getCollectionStats()
      expect(stats.vintageRange.oldest).toBe(2015)
      expect(stats.vintageRange.newest).toBe(2020)
    })

    test('should calculate rarity distribution correctly', () => {
      const stats = WineStorageService.getCollectionStats()
      expect(stats.rarityDistribution.Common).toBe(2)
      expect(stats.rarityDistribution.Rare).toBe(1)
      expect(stats.rarityDistribution.Legendary).toBe(1)
    })

    test('should calculate level correctly', () => {
      const stats = WineStorageService.getCollectionStats()
      // 900 XP: Math.floor(Math.sqrt(900 / 100)) + 1 = 4
      expect(stats.level).toBe(4)
    })
  })

  describe('Data Import/Export', () => {
    test('should export collection to JSON', () => {
      WineStorageService.addWine(createMockWine())
      
      const exportedData = WineStorageService.exportCollection()
      const parsed = JSON.parse(exportedData)
      
      expect(parsed.version).toBe('1.0')
      expect(parsed.wines).toHaveLength(1)
      expect(parsed.exportDate).toBeDefined()
      expect(parsed.stats).toBeDefined()
    })

    test('should import collection from JSON', () => {
      const mockCollection = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        wines: [createMockWine({ id: 999, name: 'Imported Wine' })],
        badges: [],
      }
      
      const result = WineStorageService.importCollection(
        JSON.stringify(mockCollection)
      )
      
      expect(result.success).toBe(true)
      expect(result.message).toContain('Successfully imported 1 wines')
      
      const wines = WineStorageService.getWines()
      expect(wines).toHaveLength(1)
      expect(wines[0].name).toBe('Imported Wine')
    })

    test('should handle invalid import data', () => {
      const result = WineStorageService.importCollection('invalid json')
      
      expect(result.success).toBe(false)
      expect(result.message).toContain('Invalid JSON format')
    })

    test('should handle missing wines array in import', () => {
      const invalidCollection = { version: '1.0' }
      
      const result = WineStorageService.importCollection(
        JSON.stringify(invalidCollection)
      )
      
      expect(result.success).toBe(false)
      expect(result.message).toBe('Invalid collection format')
    })
  })

  describe('Error Handling', () => {
    test('should handle localStorage errors gracefully', () => {
      const mockError = new Error('Storage quota exceeded')
      ;(localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw mockError
      })
      
      // Should not throw an error
      expect(() => {
        WineStorageService.saveWines([createMockWine()])
      }).not.toThrow()
    })

    test('should clear all data successfully', () => {
      WineStorageService.addWine(createMockWine())
      WineStorageService.clearAllData()
      
      const wines = WineStorageService.getWines()
      const badges = WineStorageService.getBadges()
      
      expect(wines).toHaveLength(0)
      expect(badges).toHaveLength(0)
    })
  })
})