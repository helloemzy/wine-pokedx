'use client';

import { cn } from '@/lib/utils';
import type { WineType } from '@/types/wine';

interface TypeBadgeProps {
  type: WineType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  variant?: 'filled' | 'outline';
}

const typeConfig = {
  Red: { bg: 'bg-type-energy-600', icon: '🍷', name: 'Red' },
  White: { bg: 'bg-type-flow-600', icon: '🥂', name: 'White' },
  Rosé: { bg: 'bg-type-mystical-600', icon: '🌹', name: 'Rosé' },
  Sparkling: { bg: 'bg-type-modern-600', icon: '🍾', name: 'Sparkling' },
  Dessert: { bg: 'bg-type-heritage-600', icon: '🍯', name: 'Dessert' },
  Fortified: { bg: 'bg-type-terroir-600', icon: '⚡', name: 'Fortified' },
  Orange: { bg: 'bg-type-technique-600', icon: '🍊', name: 'Orange' },
  Natural: { bg: 'bg-type-varietal-600', icon: '🌿', name: 'Natural' },
} as const;

export function TypeBadge({ 
  type, 
  size = 'md', 
  className, 
  showIcon = true,
  variant = 'filled'
}: TypeBadgeProps) {
  const config = typeConfig[type];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs min-h-[28px]',
    md: 'px-3 py-1 text-sm min-h-[32px]',
    lg: 'px-4 py-2 text-base min-h-[40px]',
  };

  const variantClasses = {
    filled: `${config.bg} text-white`,
    outline: `bg-transparent border-2 border-current text-current`,
  };
  
  return (
    <span className={cn(
      'type-badge',
      sizeClasses[size],
      variant === 'filled' ? variantClasses.filled : `${config.bg.replace('bg-', 'text-')} ${variantClasses.outline}`,
      className
    )}>
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.name}
    </span>
  );
}