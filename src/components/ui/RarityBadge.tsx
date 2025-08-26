'use client';

import { cn } from '@/lib/utils';
import type { WineRarity } from '@/types/wine';

interface RarityBadgeProps {
  rarity: WineRarity;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

const rarityConfig = {
  // Common tier
  Everyday: { bg: 'bg-rarity-common-100', border: 'border-rarity-common-300', text: 'text-rarity-common-600', glow: '', tier: 'Common' },
  Regional: { bg: 'bg-rarity-common-100', border: 'border-rarity-common-300', text: 'text-rarity-common-600', glow: '', tier: 'Common' },
  Quality: { bg: 'bg-rarity-common-100', border: 'border-rarity-common-300', text: 'text-rarity-common-600', glow: '', tier: 'Common' },
  
  // Uncommon tier
  Estate: { bg: 'bg-rarity-uncommon-50', border: 'border-rarity-uncommon-500', text: 'text-rarity-uncommon-700', glow: 'shadow-rarity-uncommon', tier: 'Uncommon' },
  Vintage: { bg: 'bg-rarity-uncommon-50', border: 'border-rarity-uncommon-500', text: 'text-rarity-uncommon-700', glow: 'shadow-rarity-uncommon', tier: 'Uncommon' },
  Reserve: { bg: 'bg-rarity-uncommon-50', border: 'border-rarity-uncommon-500', text: 'text-rarity-uncommon-700', glow: 'shadow-rarity-uncommon', tier: 'Uncommon' },
  
  // Superior tier
  Superior: { bg: 'bg-indigo-50', border: 'border-indigo-500', text: 'text-indigo-700', glow: 'shadow-lg shadow-indigo-500/20', tier: 'Superior' },
  
  // Exceptional tier
  Exceptional: { bg: 'bg-teal-50', border: 'border-teal-500', text: 'text-teal-700', glow: 'shadow-lg shadow-teal-500/20', tier: 'Exceptional' },
  
  // Outstanding tier
  Outstanding: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700', glow: 'shadow-lg shadow-orange-500/20', tier: 'Outstanding' },
  
  // Rare tier
  SingleVineyard: { bg: 'bg-rarity-rare-50', border: 'border-rarity-rare-500', text: 'text-rarity-rare-700', glow: 'shadow-rarity-rare', tier: 'Rare' },
  GrandCru: { bg: 'bg-rarity-rare-50', border: 'border-rarity-rare-500', text: 'text-rarity-rare-700', glow: 'shadow-rarity-rare', tier: 'Rare' },
  MasterSelection: { bg: 'bg-rarity-rare-50', border: 'border-rarity-rare-500', text: 'text-rarity-rare-700', glow: 'shadow-rarity-rare', tier: 'Rare' },
  
  // Magnificent tier
  Magnificent: { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-700', glow: 'shadow-lg shadow-red-500/25', tier: 'Magnificent' },
  
  // Transcendent tier
  Transcendent: { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700', glow: 'shadow-lg shadow-emerald-500/25', tier: 'Transcendent' },
  
  // Phenomenal tier
  Phenomenal: { bg: 'bg-violet-50', border: 'border-violet-500', text: 'text-violet-700', glow: 'shadow-lg shadow-violet-500/25', tier: 'Phenomenal' },
  
  // Epic tier
  CultClassic: { bg: 'bg-rarity-epic-50', border: 'border-rarity-epic-600', text: 'text-rarity-epic-800', glow: 'shadow-rarity-epic', tier: 'Epic' },
  AllocationOnly: { bg: 'bg-rarity-epic-50', border: 'border-rarity-epic-600', text: 'text-rarity-epic-800', glow: 'shadow-rarity-epic', tier: 'Epic' },
  CriticsChoice: { bg: 'bg-rarity-epic-50', border: 'border-rarity-epic-600', text: 'text-rarity-epic-800', glow: 'shadow-rarity-epic', tier: 'Epic' },
  
  // Sublime tier
  Sublime: { bg: 'bg-rose-50', border: 'border-rose-500', text: 'text-rose-700', glow: 'shadow-xl shadow-rose-500/30', tier: 'Sublime' },
  
  // Eternal tier
  Eternal: { bg: 'bg-slate-50', border: 'border-slate-500', text: 'text-slate-700', glow: 'shadow-xl shadow-slate-500/30', tier: 'Eternal' },
  
  // Legendary tier
  MuseumPiece: { bg: 'bg-rarity-legendary-50', border: 'border-rarity-legendary-600', text: 'text-rarity-legendary-800', glow: 'shadow-rarity-legendary', tier: 'Legendary' },
  InvestmentGrade: { bg: 'bg-rarity-legendary-50', border: 'border-rarity-legendary-600', text: 'text-rarity-legendary-800', glow: 'shadow-rarity-legendary', tier: 'Legendary' },
  Unicorn: { bg: 'bg-rarity-legendary-50', border: 'border-rarity-legendary-600', text: 'text-rarity-legendary-800', glow: 'shadow-rarity-legendary', tier: 'Legendary' },
  
  // Cosmic tier
  Cosmic: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', glow: 'shadow-2xl shadow-purple-500/40', tier: 'Cosmic' },
  
  // Mythical tier
  GhostVintage: { bg: 'bg-rarity-mythical-50', border: 'border-rarity-mythical-600', text: 'text-rarity-mythical-800', glow: 'shadow-rarity-mythical', tier: 'Mythical' },
  LostLabel: { bg: 'bg-rarity-mythical-50', border: 'border-rarity-mythical-600', text: 'text-rarity-mythical-800', glow: 'shadow-rarity-mythical', tier: 'Mythical' },
  FoundersReserve: { bg: 'bg-rarity-mythical-50', border: 'border-rarity-mythical-600', text: 'text-rarity-mythical-800', glow: 'shadow-rarity-mythical', tier: 'Mythical' },
  
  // Primordial tier
  Primordial: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-700', glow: 'shadow-2xl shadow-amber-500/50', tier: 'Primordial' },
  
  // Celestial tier
  Celestial: { bg: 'bg-cyan-50', border: 'border-cyan-500', text: 'text-cyan-700', glow: 'shadow-2xl shadow-cyan-500/50', tier: 'Celestial' },
  
  // Divine tier
  OnceInLifetime: { bg: 'bg-rarity-divine-50', border: 'border-rarity-divine-600', text: 'text-rarity-divine-800', glow: 'shadow-rarity-divine', tier: 'Divine' },
  PerfectStorm: { bg: 'bg-rarity-divine-50', border: 'border-rarity-divine-600', text: 'text-rarity-divine-800', glow: 'shadow-rarity-divine', tier: 'Divine' },
  TimeCapsule: { bg: 'bg-rarity-divine-50', border: 'border-rarity-divine-600', text: 'text-rarity-divine-800', glow: 'shadow-rarity-divine', tier: 'Divine' },
} as const;

export function RarityBadge({ 
  rarity, 
  size = 'md', 
  className, 
  animated = true 
}: RarityBadgeProps) {
  const config = rarityConfig[rarity] || rarityConfig.Everyday;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-[10px] min-h-[24px]',
    md: 'px-2 py-1 text-xs min-h-[28px]',
    lg: 'px-3 py-2 text-sm min-h-[32px]',
  };

  const isHighRarity = ['Legendary', 'Mythical', 'Divine', 'Cosmic', 'Primordial', 'Celestial'].includes(config.tier);
  
  return (
    <span className={cn(
      'rarity-badge',
      sizeClasses[size],
      config.bg,
      config.border,
      config.text,
      config.glow,
      animated && isHighRarity && 'animate-rarity-glow',
      isHighRarity && 'font-extrabold',
      className
    )}>
      {config.tier === 'Divine' && '✨ '}
      {config.tier === 'Mythical' && '👻 '}
      {config.tier === 'Legendary' && '🏆 '}
      {config.tier === 'Cosmic' && '🌌 '}
      {config.tier === 'Primordial' && '⚡ '}
      {config.tier === 'Celestial' && '☄️ '}
      {rarity}
    </span>
  );
}