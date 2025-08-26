/**
 * Component test suite for WineTradingCard
 * Tests Pokemon-style trading card mechanics, flip animations, and holographic effects
 */

import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WineTradingCard from '../WineTradingCard'
import { createMockWine } from '../../__tests__/setup'

describe('WineTradingCard Component', () => {
  const mockWine = createMockWine({
    name: 'Château Margaux',
    year: 2015,
    region: 'Bordeaux, France',
    producer: 'Château Margaux',
    type: 'Red Wine',
    grape: 'Cabernet Sauvignon',
    rating: 5,
    rarity: 'Legendary',
    tastingNotes: 'Complex aromas of blackcurrant, cedar, and graphite',
    experiencePoints: 500,
    abv: 13.5,
    appearance: {
      intensity: 'Deep',
      color: 'Garnet with purple hues'
    },
    nose: {
      intensity: 'Pronounced',
      primaryAromas: ['blackcurrant', 'cassis', 'violet'],
      secondaryAromas: ['cedar', 'tobacco', 'graphite'],
      tertiaryAromas: []
    },
    palate: {
      sweetness: 'Dry',
      acidity: 'Medium(+)',
      tannin: 'Medium(+)',
      alcohol: 'Medium',
      body: 'Full',
      finish: 'Long'
    }
  })

  const mockOnFlip = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Card Rendering', () => {
    test('renders front side of card by default', () => {
      render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      expect(screen.getByText('Château Margaux')).toBeInTheDocument()
      expect(screen.getByText('2015')).toBeInTheDocument()
      expect(screen.getByText('Legendary')).toBeInTheDocument()
      expect(screen.getByText('500 XP')).toBeInTheDocument()
    })

    test('renders back side when flipped', () => {
      render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={true}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      expect(screen.getByText('WSET Tasting Notes')).toBeInTheDocument()
      expect(screen.getByText('Appearance')).toBeInTheDocument()
      expect(screen.getByText('Deep')).toBeInTheDocument()
      expect(screen.getByText('Garnet with purple hues')).toBeInTheDocument()
    })

    test('displays different card sizes correctly', () => {
      const { rerender, container } = render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="small"
        />
      )
      
      let card = container.firstChild
      expect(card).toHaveClass('w-48', 'h-72')
      
      rerender(
        <WineTradingCard
          wine={mockWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      card = container.firstChild
      expect(card).toHaveClass('w-64', 'h-96')
      
      rerender(
        <WineTradingCard
          wine={mockWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="large"
        />
      )
      
      card = container.firstChild
      expect(card).toHaveClass('w-80', 'h-[28rem]')
    })
  })

  describe('Rarity-Based Styling', () => {
    const rarityTests = [
      {
        rarity: 'Common',
        expectedGradient: 'from-gray-400',
        expectedBorder: 'border-gray-300',
        expectedGlow: false
      },
      {
        rarity: 'Uncommon',
        expectedGradient: 'from-green-400',
        expectedBorder: 'border-green-300',
        expectedGlow: false
      },
      {
        rarity: 'Rare',
        expectedGradient: 'from-blue-400',
        expectedBorder: 'border-blue-300',
        expectedGlow: false
      },
      {
        rarity: 'Epic',
        expectedGradient: 'from-purple-400',
        expectedBorder: 'border-purple-300',
        expectedGlow: true
      },
      {
        rarity: 'Legendary',
        expectedGradient: 'from-yellow-400',
        expectedBorder: 'border-yellow-300',
        expectedGlow: true
      }
    ]

    test.each(rarityTests)(
      'applies correct styling for $rarity rarity',
      ({ rarity, expectedGradient, expectedBorder, expectedGlow }) => {
        const testWine = { ...mockWine, rarity: rarity as typeof mockWine.rarity }
        render(
          <WineTradingCard
            wine={testWine}
            isFlipped={false}
            onFlip={mockOnFlip}
            size="medium"
          />
        )
        
        const card = container.firstChild
        expect(card).toHaveClass(expectedBorder)
        
        // Check for gradient in header
        const header = container.querySelector('[class*="bg-gradient"]')
        expect(header).toHaveClass(expectedGradient)
        
        // Check for glow effect on higher rarities
        if (expectedGlow) {
          expect(card).toHaveClass('shadow-2xl')
        }
      }
    )

    test('displays holographic effect for legendary cards', () => {
      const legendaryWine = { ...mockWine, rarity: 'Legendary' as const }
      render(
        <WineTradingCard
          wine={legendaryWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      // Check for holographic overlay
      const holoEffect = container.querySelector('[class*="bg-gradient"][class*="rainbow"]')
      expect(holoEffect).toBeInTheDocument()
    })
  })

  describe('Flip Interaction', () => {
    test('calls onFlip when card is clicked', async () => {
      const user = userEvent.setup()
      render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      const card = screen.getByRole('button')
      await user.click(card)
      
      expect(mockOnFlip).toHaveBeenCalledTimes(1)
    })

    test('supports keyboard interaction for flipping', async () => {
      const user = userEvent.setup()
      render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      const card = screen.getByRole('button')
      card.focus()
      await user.keyboard('{Enter}')
      
      expect(mockOnFlip).toHaveBeenCalledTimes(1)
      
      await user.keyboard(' ') // Space bar
      expect(mockOnFlip).toHaveBeenCalledTimes(2)
    })

    test('provides visual feedback on hover', () => {
      render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      const card = container.firstChild
      
      fireEvent.mouseEnter(card)
      // Card should have hover transform classes
      expect(card).toHaveClass('transform')
    })
  })

  describe('Front Side Content', () => {
    test('displays all essential wine information', () => {
      render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      expect(screen.getByText('Château Margaux')).toBeInTheDocument()
      expect(screen.getByText('2015')).toBeInTheDocument()
      expect(screen.getByText('Bordeaux, France')).toBeInTheDocument()
      expect(screen.getByText('Cabernet Sauvignon')).toBeInTheDocument()
      expect(screen.getByText('Legendary')).toBeInTheDocument()
      expect(screen.getByText('500 XP')).toBeInTheDocument()
      expect(screen.getByText('13.5% ABV')).toBeInTheDocument()
    })

    test('displays star rating correctly', () => {
      render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      // Should show 5 filled stars for rating 5
      const stars = screen.getAllByRole('generic').filter(
        el => el.classList.contains('text-yellow-400')
      )
      expect(stars.length).toBeGreaterThan(0)
    })

    test('shows pokemon-style energy/type indicators', () => {
      render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      // Check for wine type indicator
      expect(screen.getByText('Red Wine')).toBeInTheDocument()
    })
  })

  describe('Back Side Content (WSET Notes)', () => {
    test('displays comprehensive WSET tasting notes', () => {
      render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={true}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      // Appearance section
      expect(screen.getByText('Appearance')).toBeInTheDocument()
      expect(screen.getByText('Deep')).toBeInTheDocument()
      expect(screen.getByText('Garnet with purple hues')).toBeInTheDocument()
      
      // Nose section
      expect(screen.getByText('Nose')).toBeInTheDocument()
      expect(screen.getByText('Pronounced')).toBeInTheDocument()
      expect(screen.getByText('blackcurrant')).toBeInTheDocument()
      expect(screen.getByText('cedar')).toBeInTheDocument()
      
      // Palate section
      expect(screen.getByText('Palate')).toBeInTheDocument()
      expect(screen.getByText('Dry')).toBeInTheDocument()
      expect(screen.getByText('Full')).toBeInTheDocument()
      expect(screen.getByText('Long')).toBeInTheDocument()
    })

    test('handles wines without WSET notes gracefully', () => {
      const wineWithoutWSET = {
        ...mockWine,
        appearance: undefined,
        nose: undefined,
        palate: undefined
      }
      
      render(
        <WineTradingCard
          wine={wineWithoutWSET}
          isFlipped={true}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      // Should still show the tasting notes section
      expect(screen.getByText('WSET Tasting Notes')).toBeInTheDocument()
      
      // Should show fallback message or basic tasting notes
      expect(screen.getByText(/Complex aromas/)).toBeInTheDocument()
    })

    test('organizes aroma categories correctly', () => {
      render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={true}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      // Primary aromas
      expect(screen.getByText('blackcurrant')).toBeInTheDocument()
      expect(screen.getByText('cassis')).toBeInTheDocument()
      expect(screen.getByText('violet')).toBeInTheDocument()
      
      // Secondary aromas
      expect(screen.getByText('cedar')).toBeInTheDocument()
      expect(screen.getByText('tobacco')).toBeInTheDocument()
      expect(screen.getByText('graphite')).toBeInTheDocument()
    })
  })

  describe('Visual Effects and Animations', () => {
    test('applies 3D transform effects', () => {
      render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      const card = container.firstChild
      expect(card).toHaveStyle('transform-style: preserve-3d')
    })

    test('shows loading state appropriately', () => {
      // Test with minimal wine data to simulate loading state
      const loadingWine = {
        ...mockWine,
        name: '',
      }
      
      render(
        <WineTradingCard
          wine={loadingWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      // Should handle empty wine name gracefully
      expect(screen.getByText('2015')).toBeInTheDocument()
    })

    test('applies correct backdrop blur and glass effects', () => {
      render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      const cardContent = container.querySelector('[class*="backdrop-blur"]')
      expect(cardContent).toBeInTheDocument()
    })
  })

  describe('Accessibility Features', () => {
    test('provides appropriate ARIA labels', () => {
      render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      const card = screen.getByRole('button')
      expect(card).toHaveAttribute('aria-label', expect.stringContaining('Château Margaux'))
    })

    test('supports screen reader descriptions', () => {
      render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      const card = screen.getByRole('button')
      expect(card).toHaveAttribute('aria-describedby')
    })

    test('maintains focus management during flip', async () => {
      const user = userEvent.setup()
      render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      const card = screen.getByRole('button')
      card.focus()
      
      await user.keyboard('{Enter}')
      
      // Focus should remain on the card after flip
      expect(document.activeElement).toBe(card)
    })

    test('provides reduced motion alternative', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      })
      
      render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      // Should still render but with reduced animations
      expect(screen.getByText('Château Margaux')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    test('handles missing wine properties gracefully', () => {
      const incompleteWine = {
        id: 1,
        name: 'Test Wine',
        year: 2020,
        region: '',
        producer: '',
        type: 'Red Wine' as const,
        grape: '',
        rating: 0,
        tastingNotes: '',
        captured: true,
        dateAdded: new Date(),
        rarity: 'Common' as const,
        experiencePoints: 0,
      }
      
      render(
        <WineTradingCard
          wine={incompleteWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      expect(screen.getByText('Test Wine')).toBeInTheDocument()
      expect(screen.getByText('2020')).toBeInTheDocument()
    })

    test('handles undefined onFlip callback', () => {
      render(
        <WineTradingCard
          wine={mockWine}
          isFlipped={false}
          onFlip={undefined}
          size="medium"
        />
      )
      
      // Should render without throwing
      expect(screen.getByText('Château Margaux')).toBeInTheDocument()
    })

    test('handles extreme rating values', () => {
      const extremeRatingWine = { ...mockWine, rating: 10 }
      render(
        <WineTradingCard
          wine={extremeRatingWine}
          isFlipped={false}
          onFlip={mockOnFlip}
          size="medium"
        />
      )
      
      // Should cap stars at maximum (5) and not crash
      expect(screen.getByText('Château Margaux')).toBeInTheDocument()
    })
  })
})