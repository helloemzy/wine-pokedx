/**
 * Integration tests for Wine Collection Management
 * Tests the full wine collection and progression systems working together
 */

import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WineStorageService } from '../../lib/wineStorage'
import { mockLocalStorage, createMockWine } from '../setup'
import Home from '../../app/page'

// Mock Next.js components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock framer-motion for cleaner tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => children,
}))

// Mock localStorage
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage() })

describe('Wine Collection Management Integration', () => {
  beforeEach(() => {
    // Clear localStorage and mocks before each test
    localStorage.clear()
    jest.clearAllMocks()
    WineStorageService.clearAllData()
  })

  describe('Empty Collection State', () => {
    test('displays empty collection message when no wines exist', () => {
      render(<Home />)
      
      expect(screen.getByText('Your Wine Collection is Empty')).toBeInTheDocument()
      expect(screen.getByText('Start your wine journey by scanning your first bottle!')).toBeInTheDocument()
      expect(screen.getByText('Scan Your First Bottle')).toBeInTheDocument()
    })

    test('shows scan button for first wine addition', async () => {
      const user = userEvent.setup()
      render(<Home />)
      
      const scanButton = screen.getByText('Scan Your First Bottle')
      await user.click(scanButton)
      
      // Should open scan modal (testing modal opening)
      // Note: Full modal testing would require mocking the ScanModal component
    })
  })

  describe('Collection with Sample Data', () => {
    beforeEach(() => {
      // Initialize with sample data
      act(() => {
        WineStorageService.addWine({
          name: 'Château Margaux',
          year: 2015,
          region: 'Bordeaux, France',
          producer: 'Château Margaux',
          type: 'Red Wine',
          grape: 'Cabernet Sauvignon Blend',
          rating: 5,
          tastingNotes: 'Complex aromas of blackcurrant, cedar, and graphite',
          captured: true,
          rarity: 'Legendary',
          abv: 13.5,
        })
        
        WineStorageService.addWine({
          name: 'Domaine de la Côte Pinot Noir',
          year: 2019,
          region: 'Sta. Rita Hills, California',
          producer: 'Domaine de la Côte',
          type: 'Red Wine',
          grape: 'Pinot Noir',
          rating: 4,
          tastingNotes: 'Bright cherry and strawberry with earthy undertones',
          captured: true,
          rarity: 'Rare',
          abv: 14.2,
        })
      })
    })

    test('displays collection statistics correctly', () => {
      render(<Home />)
      
      // Should show collection stats
      expect(screen.getByText('2')).toBeInTheDocument() // Total wines
      expect(screen.getByText('2')).toBeInTheDocument() // Unique regions
      expect(screen.getByText('2')).toBeInTheDocument() // Unique grapes
      expect(screen.getByText(/4\./)).toBeInTheDocument() // Average rating (4.5)
    })

    test('displays wine cards in different view modes', async () => {
      const user = userEvent.setup()
      render(<Home />)
      
      // Should display wines by default
      expect(screen.getByText('Château Margaux')).toBeInTheDocument()
      expect(screen.getByText('Domaine de la Côte Pinot Noir')).toBeInTheDocument()
      
      // Test view mode switching
      const listViewButton = screen.getByRole('button', { name: /list view/i })
      await user.click(listViewButton)
      
      // Wines should still be visible in list view
      expect(screen.getByText('Château Margaux')).toBeInTheDocument()
      
      const gridViewButton = screen.getByRole('button', { name: /grid view/i })
      await user.click(gridViewButton)
      
      // Wines should still be visible in grid view
      expect(screen.getByText('Château Margaux')).toBeInTheDocument()
    })

    test('trading card view with flip functionality', async () => {
      const user = userEvent.setup()
      render(<Home />)
      
      // Switch to trading cards view
      const cardsViewButton = screen.getByRole('button', { name: /trading cards/i })
      await user.click(cardsViewButton)
      
      // Should display trading cards
      expect(screen.getByText('Château Margaux')).toBeInTheDocument()
      
      // Test card flipping
      const card = screen.getByText('Château Margaux').closest('button')
      if (card) {
        await user.click(card)
        // Card should flip (implementation would show WSET notes)
      }
    })
  })

  describe('Search and Filter Integration', () => {
    beforeEach(() => {
      act(() => {
        // Add diverse wine collection for testing
        WineStorageService.addWine({
          name: 'Château Margaux',
          year: 2015,
          region: 'Bordeaux, France',
          producer: 'Château Margaux',
          type: 'Red Wine',
          grape: 'Cabernet Sauvignon',
          rating: 5,
          tastingNotes: 'Complex and elegant',
          captured: true,
          rarity: 'Legendary',
        })
        
        WineStorageService.addWine({
          name: 'Dom Pérignon',
          year: 2012,
          region: 'Champagne, France',
          producer: 'Dom Pérignon',
          type: 'Sparkling',
          grape: 'Chardonnay Blend',
          rating: 5,
          tastingNotes: 'Crisp bubbles and citrus notes',
          captured: true,
          rarity: 'Epic',
        })
        
        WineStorageService.addWine({
          name: 'Kendall-Jackson Vintners Reserve',
          year: 2020,
          region: 'California, USA',
          producer: 'Kendall-Jackson',
          type: 'White Wine',
          grape: 'Chardonnay',
          rating: 3,
          tastingNotes: 'Butter and oak with tropical fruit',
          captured: true,
          rarity: 'Common',
        })
      })
    })

    test('search functionality filters wines correctly', async () => {
      const user = userEvent.setup()
      render(<Home />)
      
      // Should show all wines initially
      expect(screen.getByText('Château Margaux')).toBeInTheDocument()
      expect(screen.getByText('Dom Pérignon')).toBeInTheDocument()
      expect(screen.getByText('Kendall-Jackson Vintners Reserve')).toBeInTheDocument()
      
      // Search for specific wine
      const searchInput = screen.getByRole('textbox', { name: /search/i })
      await user.type(searchInput, 'Margaux')
      
      // Should only show matching wine
      await waitFor(() => {
        expect(screen.getByText('Château Margaux')).toBeInTheDocument()
        expect(screen.queryByText('Dom Pérignon')).not.toBeInTheDocument()
        expect(screen.queryByText('Kendall-Jackson Vintners Reserve')).not.toBeInTheDocument()
      })
      
      // Clear search
      await user.clear(searchInput)
      
      // Should show all wines again
      await waitFor(() => {
        expect(screen.getByText('Château Margaux')).toBeInTheDocument()
        expect(screen.getByText('Dom Pérignon')).toBeInTheDocument()
        expect(screen.getByText('Kendall-Jackson Vintners Reserve')).toBeInTheDocument()
      })
    })

    test('filter by wine type works correctly', async () => {
      const user = userEvent.setup()
      render(<Home />)
      
      // Apply filter (assuming filter UI exists)
      const typeFilter = screen.getByRole('combobox', { name: /type/i })
      await user.selectOptions(typeFilter, 'Sparkling')
      
      // Should only show sparkling wines
      await waitFor(() => {
        expect(screen.getByText('Dom Pérignon')).toBeInTheDocument()
        expect(screen.queryByText('Château Margaux')).not.toBeInTheDocument()
        expect(screen.queryByText('Kendall-Jackson Vintners Reserve')).not.toBeInTheDocument()
      })
    })

    test('filter by rarity works correctly', async () => {
      const user = userEvent.setup()
      render(<Home />)
      
      // Apply rarity filter
      const rarityFilter = screen.getByRole('combobox', { name: /rarity/i })
      await user.selectOptions(rarityFilter, 'Legendary')
      
      // Should only show legendary wines
      await waitFor(() => {
        expect(screen.getByText('Château Margaux')).toBeInTheDocument()
        expect(screen.queryByText('Dom Pérignon')).not.toBeInTheDocument()
        expect(screen.queryByText('Kendall-Jackson Vintners Reserve')).not.toBeInTheDocument()
      })
    })

    test('combined search and filter works correctly', async () => {
      const user = userEvent.setup()
      render(<Home />)
      
      // Apply search and filter
      const searchInput = screen.getByRole('textbox', { name: /search/i })
      await user.type(searchInput, 'France')
      
      const typeFilter = screen.getByRole('combobox', { name: /type/i })
      await user.selectOptions(typeFilter, 'Red Wine')
      
      // Should only show French red wines
      await waitFor(() => {
        expect(screen.getByText('Château Margaux')).toBeInTheDocument()
        expect(screen.queryByText('Dom Pérignon')).not.toBeInTheDocument()
        expect(screen.queryByText('Kendall-Jackson Vintners Reserve')).not.toBeInTheDocument()
      })
    })

    test('no results state displays correctly', async () => {
      const user = userEvent.setup()
      render(<Home />)
      
      // Search for non-existent wine
      const searchInput = screen.getByRole('textbox', { name: /search/i })
      await user.type(searchInput, 'Nonexistent Wine')
      
      // Should show no results message
      await waitFor(() => {
        expect(screen.getByText('No Wines Found')).toBeInTheDocument()
        expect(screen.getByText('Try adjusting your search or filter criteria')).toBeInTheDocument()
      })
    })
  })

  describe('Badge System Integration', () => {
    test('awards first catch badge on first wine addition', () => {
      render(<Home />)
      
      act(() => {
        WineStorageService.addWine(createMockWine())
      })
      
      const badges = WineStorageService.getBadges()
      expect(badges).toHaveLength(1)
      expect(badges[0].id).toBe('first_wine')
    })

    test('awards regional badges after multiple wines from same region', () => {
      render(<Home />)
      
      act(() => {
        // Add 5 wines from Bordeaux to trigger regional badge
        for (let i = 0; i < 5; i++) {
          WineStorageService.addWine(
            createMockWine({ 
              id: i + 1, 
              region: 'Bordeaux, France',
              name: `Wine ${i + 1}`
            })
          )
        }
      })
      
      const badges = WineStorageService.getBadges()
      const regionalBadge = badges.find(b => b.name === 'Bordeaux, France Explorer')
      expect(regionalBadge).toBeDefined()
    })

    test('awards collection milestone badges', () => {
      render(<Home />)
      
      act(() => {
        // Add 10 wines to trigger milestone
        for (let i = 0; i < 10; i++) {
          WineStorageService.addWine(
            createMockWine({ id: i + 1, name: `Wine ${i + 1}` })
          )
        }
      })
      
      const badges = WineStorageService.getBadges()
      const milestoneBadge = badges.find(b => b.id === 'collection_10')
      expect(milestoneBadge).toBeDefined()
    })
  })

  describe('Experience and Level Progression', () => {
    test('calculates experience points correctly across different rarities', () => {
      render(<Home />)
      
      act(() => {
        WineStorageService.addWine({
          ...createMockWine(),
          rarity: 'Legendary',
          rating: 5,
          year: new Date().getFullYear() - 25, // Old wine for age bonus
        })
      })
      
      const stats = WineStorageService.getCollectionStats()
      expect(stats.totalExperience).toBeGreaterThan(500) // Base + legendary + rating + age bonuses
    })

    test('level increases with experience accumulation', () => {
      render(<Home />)
      
      act(() => {
        // Add multiple high-XP wines
        WineStorageService.addWine({
          ...createMockWine(),
          id: 1,
          rarity: 'Legendary',
          rating: 5,
        })
        
        WineStorageService.addWine({
          ...createMockWine(),
          id: 2,
          rarity: 'Epic',
          rating: 4,
        })
      })
      
      const stats = WineStorageService.getCollectionStats()
      expect(stats.level).toBeGreaterThan(1)
    })
  })

  describe('Data Persistence', () => {
    test('collection persists after page refresh simulation', () => {
      render(<Home />)
      
      act(() => {
        WineStorageService.addWine({
          name: 'Persistent Wine',
          year: 2020,
          region: 'Test Region',
          producer: 'Test Producer',
          type: 'Red Wine',
          grape: 'Test Grape',
          rating: 4,
          tastingNotes: 'Test notes',
          captured: true,
          rarity: 'Rare',
        })
      })
      
      // Simulate component unmount/remount (page refresh)
      const { rerender } = render(<Home />)
      rerender(<Home />)
      
      // Wine should still be visible
      expect(screen.getByText('Persistent Wine')).toBeInTheDocument()
    })

    test('collection statistics update correctly after wine operations', () => {
      render(<Home />)
      
      // Initial state
      let stats = WineStorageService.getCollectionStats()
      const initialTotal = stats.totalWines
      
      act(() => {
        WineStorageService.addWine(createMockWine({ name: 'New Wine' }))
      })
      
      // Should have one more wine
      stats = WineStorageService.getCollectionStats()
      expect(stats.totalWines).toBe(initialTotal + 1)
      
      act(() => {
        const wines = WineStorageService.getWines()
        WineStorageService.deleteWine(wines[wines.length - 1].id)
      })
      
      // Should return to initial count
      stats = WineStorageService.getCollectionStats()
      expect(stats.totalWines).toBe(initialTotal)
    })
  })

  describe('Performance with Large Collections', () => {
    test('handles large wine collections efficiently', async () => {
      render(<Home />)
      
      const startTime = performance.now()
      
      act(() => {
        // Add 100 wines to test performance
        for (let i = 0; i < 100; i++) {
          WineStorageService.addWine(
            createMockWine({ 
              id: i + 1, 
              name: `Wine ${i + 1}`,
              region: `Region ${i % 10}`, // 10 different regions
              grape: `Grape ${i % 20}`, // 20 different grapes
            })
          )
        }
      })
      
      const endTime = performance.now()
      const executionTime = endTime - startTime
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(executionTime).toBeLessThan(1000) // 1 second
      
      const stats = WineStorageService.getCollectionStats()
      expect(stats.totalWines).toBe(100)
      expect(stats.uniqueRegions).toBe(10)
      expect(stats.uniqueGrapes).toBe(20)
    })

    test('search performance with large dataset', async () => {
      const user = userEvent.setup()
      render(<Home />)
      
      act(() => {
        // Add wines with searchable content
        for (let i = 0; i < 50; i++) {
          WineStorageService.addWine(
            createMockWine({ 
              id: i + 1, 
              name: i === 25 ? 'Special Wine' : `Wine ${i + 1}`,
            })
          )
        }
      })
      
      const searchInput = screen.getByRole('textbox', { name: /search/i })
      
      const searchStart = performance.now()
      await user.type(searchInput, 'Special')
      const searchEnd = performance.now()
      
      // Search should be fast
      expect(searchEnd - searchStart).toBeLessThan(100) // 100ms
      
      await waitFor(() => {
        expect(screen.getByText('Special Wine')).toBeInTheDocument()
        expect(screen.queryByText('Wine 1')).not.toBeInTheDocument()
      })
    })
  })
})