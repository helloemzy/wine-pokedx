'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { WineType } from '@/types/wine';

interface TypeEffectivenessProps {
  attackingType?: WineType;
  defendingType?: WineType;
  showGrid?: boolean;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const wineTypes: WineType[] = ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified', 'Orange', 'Natural'];

// Type effectiveness matrix based on wine pairing and characteristics
const typeEffectiveness: Record<WineType, Record<WineType, number>> = {
  Red: {
    Red: 1.0,        // Neutral - similar tannin structures
    White: 0.5,      // Weak - contrasting profiles
    Rosé: 1.5,       // Effective - complementary styles
    Sparkling: 0.5,  // Weak - bubbles clash with tannins
    Dessert: 1.5,    // Effective - rich pairs with sweet
    Fortified: 2.0,  // Super effective - intensity matches
    Orange: 1.5,     // Effective - similar complexity
    Natural: 1.0,    // Neutral - natural affinity
  },
  White: {
    Red: 0.5,        // Weak - opposite profiles
    White: 1.0,      // Neutral - similar characteristics
    Rosé: 1.5,       // Effective - bridge between styles
    Sparkling: 2.0,  // Super effective - crisp acidity synergy
    Dessert: 1.5,    // Effective - acidity balances sweetness
    Fortified: 0.5,  // Weak - power mismatch
    Orange: 1.5,     // Effective - shared white wine base
    Natural: 2.0,    // Super effective - purity connection
  },
  Rosé: {
    Red: 1.5,        // Effective - shares red wine heritage
    White: 1.5,      // Effective - shares white wine freshness
    Rosé: 1.0,       // Neutral - similar style
    Sparkling: 2.0,  // Super effective - perfect celebration combo
    Dessert: 1.0,    // Neutral - depends on sweetness level
    Fortified: 0.5,  // Weak - power imbalance
    Orange: 1.5,     // Effective - unique skin contact styles
    Natural: 1.5,    // Effective - artisanal connection
  },
  Sparkling: {
    Red: 0.5,        // Weak - bubbles don't enhance tannins
    White: 2.0,      // Super effective - effervescence enhances crispness
    Rosé: 2.0,       // Super effective - celebration synergy
    Sparkling: 1.0,  // Neutral - similar styles
    Dessert: 1.5,    // Effective - bubbles cut through sweetness
    Fortified: 0.5,  // Weak - competing intensities
    Orange: 1.0,     // Neutral - interesting contrast
    Natural: 1.5,    // Effective - celebration of craftsmanship
  },
  Dessert: {
    Red: 1.5,        // Effective - port-like richness
    White: 1.5,      // Effective - late harvest connection
    Rosé: 1.0,       // Neutral - depends on sweetness
    Sparkling: 1.5,  // Effective - sweet sparkling wines
    Dessert: 1.0,    // Neutral - sweetness levels vary
    Fortified: 2.0,  // Super effective - shared intensity and sweetness
    Orange: 1.0,     // Neutral - complexity matters
    Natural: 0.5,    // Weak - opposing philosophies
  },
  Fortified: {
    Red: 2.0,        // Super effective - power and intensity
    White: 0.5,      // Weak - power mismatch
    Rosé: 0.5,       // Weak - delicacy overwhelmed
    Sparkling: 0.5,  // Weak - competing characteristics
    Dessert: 2.0,    // Super effective - intensity and sweetness
    Fortified: 1.0,  // Neutral - similar power levels
    Orange: 1.5,     // Effective - complexity appreciation
    Natural: 0.5,    // Weak - opposing production methods
  },
  Orange: {
    Red: 1.5,        // Effective - skin contact similarity
    White: 1.5,      // Effective - white grape base
    Rosé: 1.5,       // Effective - skin contact styles
    Sparkling: 1.0,  // Neutral - interesting complexity
    Dessert: 1.0,    // Neutral - depends on style
    Fortified: 1.5,  // Effective - complexity appreciation
    Orange: 1.0,     // Neutral - similar techniques
    Natural: 2.0,    // Super effective - artisanal philosophy
  },
  Natural: {
    Red: 1.0,        // Neutral - natural red wines exist
    White: 2.0,      // Super effective - pure expression
    Rosé: 1.5,       // Effective - delicate natural styles
    Sparkling: 1.5,  // Effective - pet-nat connection
    Dessert: 0.5,    // Weak - intervention vs. natural
    Fortified: 0.5,  // Weak - fortification vs. natural
    Orange: 2.0,     // Super effective - natural skin contact
    Natural: 1.0,    // Neutral - similar philosophy
  },
};

const getEffectivenessColor = (effectiveness: number): string => {
  if (effectiveness >= 2.0) return 'bg-effectiveness-super text-white';
  if (effectiveness >= 1.5) return 'bg-effectiveness-effective text-white';
  if (effectiveness === 1.0) return 'bg-effectiveness-normal text-white';
  if (effectiveness >= 0.5) return 'bg-effectiveness-weak text-white';
  return 'bg-effectiveness-immune text-white';
};

const getEffectivenessText = (effectiveness: number): string => {
  if (effectiveness >= 2.0) return '2×';
  if (effectiveness >= 1.5) return '1.5×';
  if (effectiveness === 1.0) return '1×';
  if (effectiveness >= 0.5) return '0.5×';
  return '0×';
};

const getEffectivenessLabel = (effectiveness: number): string => {
  if (effectiveness >= 2.0) return 'Super Effective';
  if (effectiveness >= 1.5) return 'Effective';
  if (effectiveness === 1.0) return 'Normal';
  if (effectiveness >= 0.5) return 'Not Very Effective';
  return 'No Effect';
};

export function TypeEffectiveness({
  attackingType,
  defendingType,
  showGrid = false,
  interactive = true,
  size = 'md',
  className
}: TypeEffectivenessProps) {
  const [hoveredCell, setHoveredCell] = useState<{ attacking: WineType; defending: WineType } | null>(null);

  const sizeClasses = {
    sm: { cell: 'w-6 h-6 text-xs', text: 'text-xs' },
    md: { cell: 'w-8 h-8 text-xs', text: 'text-sm' },
    lg: { cell: 'w-10 h-10 text-sm', text: 'text-base' },
  };

  // Single effectiveness display
  if (attackingType && defendingType && !showGrid) {
    const effectiveness = typeEffectiveness[attackingType][defendingType];
    
    return (
      <div className={cn('flex items-center gap-3 p-3 bg-gray-50 rounded-lg', className)}>
        <div className="flex items-center gap-2">
          <span className={cn('font-medium', sizeClasses[size].text)}>
            {attackingType} → {defendingType}:
          </span>
          <div className={cn(
            'px-3 py-1 rounded-full font-bold',
            sizeClasses[size].text,
            getEffectivenessColor(effectiveness)
          )}>
            {getEffectivenessText(effectiveness)}
          </div>
          <span className={cn('text-gray-600', sizeClasses[size].text)}>
            {getEffectivenessLabel(effectiveness)}
          </span>
        </div>
      </div>
    );
  }

  // Full effectiveness grid
  if (showGrid) {
    return (
      <div className={cn('p-4 bg-gray-50 rounded-lg', className)}>
        <h3 className={cn('font-bold text-center mb-4', sizeClasses[size].text)}>
          Wine Type Effectiveness Chart
        </h3>
        
        <div className="effectiveness-grid grid grid-cols-9 gap-1">
          {/* Header row */}
          <div className={cn('text-center font-bold', sizeClasses[size].text)}></div>
          {wineTypes.map(type => (
            <div key={type} className={cn(
              'text-center font-bold p-1 text-gray-700',
              sizeClasses[size].text
            )}>
              {type.slice(0, 3)}
            </div>
          ))}
          
          {/* Effectiveness matrix */}
          {wineTypes.map(attackType => (
            <div key={attackType}>
              {/* Row header */}
              <div className={cn(
                'text-center font-bold p-1 text-gray-700',
                sizeClasses[size].text
              )}>
                {attackType.slice(0, 3)}
              </div>
              
              {/* Effectiveness cells */}
              {wineTypes.map(defenseType => {
                const effectiveness = typeEffectiveness[attackType][defenseType];
                return (
                  <div
                    key={`${attackType}-${defenseType}`}
                    className={cn(
                      'effectiveness-cell',
                      sizeClasses[size].cell,
                      getEffectivenessColor(effectiveness),
                      interactive && 'hover:scale-110 cursor-help transition-transform'
                    )}
                    onMouseEnter={() => interactive && setHoveredCell({ attacking: attackType, defending: defenseType })}
                    onMouseLeave={() => interactive && setHoveredCell(null)}
                    title={`${attackType} vs ${defenseType}: ${getEffectivenessLabel(effectiveness)}`}
                  >
                    {getEffectivenessText(effectiveness)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Hover info */}
        {interactive && hoveredCell && (
          <div className="mt-4 p-3 bg-white rounded-lg border shadow-sm">
            <div className={cn('font-medium', sizeClasses[size].text)}>
              {hoveredCell.attacking} attacking {hoveredCell.defending}:
            </div>
            <div className={cn('text-gray-600', sizeClasses[size].text)}>
              {getEffectivenessLabel(typeEffectiveness[hoveredCell.attacking][hoveredCell.defending])} 
              ({getEffectivenessText(typeEffectiveness[hoveredCell.attacking][hoveredCell.defending])})
            </div>
          </div>
        )}
        
        {/* Legend */}
        <div className="mt-4 flex justify-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <div className={cn(
              'w-4 h-4 rounded bg-effectiveness-super',
              sizeClasses[size].cell.split(' ')[0],
              sizeClasses[size].cell.split(' ')[1]
            )}></div>
            <span className={cn('text-gray-600', sizeClasses[size].text)}>Super (2×)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn(
              'w-4 h-4 rounded bg-effectiveness-effective',
              sizeClasses[size].cell.split(' ')[0],
              sizeClasses[size].cell.split(' ')[1]
            )}></div>
            <span className={cn('text-gray-600', sizeClasses[size].text)}>Effective (1.5×)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn(
              'w-4 h-4 rounded bg-effectiveness-normal',
              sizeClasses[size].cell.split(' ')[0],
              sizeClasses[size].cell.split(' ')[1]
            )}></div>
            <span className={cn('text-gray-600', sizeClasses[size].text)}>Normal (1×)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn(
              'w-4 h-4 rounded bg-effectiveness-weak',
              sizeClasses[size].cell.split(' ')[0],
              sizeClasses[size].cell.split(' ')[1]
            )}></div>
            <span className={cn('text-gray-600', sizeClasses[size].text)}>Weak (0.5×)</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}