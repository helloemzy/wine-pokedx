import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Wine } from "@/types/wine";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function getWineTypeColor(type: string): string {
  // Pokemon-style wine type colors
  switch (type.toLowerCase()) {
    case "red":
      return "bg-type-energy-600";
    case "white":
      return "bg-type-flow-600";
    case "rosé":
    case "rose":
      return "bg-type-mystical-600";
    case "sparkling":
      return "bg-type-modern-600";
    case "dessert":
      return "bg-type-heritage-600";
    case "fortified":
      return "bg-type-terroir-600";
    case "orange":
      return "bg-type-technique-600";
    case "natural":
      return "bg-type-varietal-600";
    // Legacy support
    case "red wine":
      return "bg-type-energy-600";
    case "white wine":
      return "bg-type-flow-600";
    case "dessert wine":
      return "bg-type-heritage-600";
    case "fortified wine":
      return "bg-type-terroir-600";
    default:
      return "bg-gray-500";
  }
}

export function getRarityColor(rarity: string): string {
  // Pokemon-style rarity colors with comprehensive tier support
  const rarityLower = rarity.toLowerCase();
  
  // Common tier
  if (['everyday', 'regional', 'quality'].includes(rarityLower)) {
    return "text-rarity-common-600 bg-rarity-common-100 border-rarity-common-300";
  }
  
  // Uncommon tier
  if (['estate', 'vintage', 'reserve'].includes(rarityLower)) {
    return "text-rarity-uncommon-700 bg-rarity-uncommon-50 border-rarity-uncommon-500 shadow-rarity-uncommon";
  }
  
  // Superior tier
  if (rarityLower === 'superior') {
    return "text-indigo-700 bg-indigo-50 border-indigo-500 shadow-lg shadow-indigo-500/20";
  }
  
  // Exceptional tier
  if (rarityLower === 'exceptional') {
    return "text-teal-700 bg-teal-50 border-teal-500 shadow-lg shadow-teal-500/20";
  }
  
  // Outstanding tier
  if (rarityLower === 'outstanding') {
    return "text-orange-700 bg-orange-50 border-orange-500 shadow-lg shadow-orange-500/20";
  }
  
  // Rare tier
  if (['singlevineyard', 'grandcru', 'masterselection'].includes(rarityLower)) {
    return "text-rarity-rare-700 bg-rarity-rare-50 border-rarity-rare-500 shadow-rarity-rare";
  }
  
  // Magnificent tier
  if (rarityLower === 'magnificent') {
    return "text-red-700 bg-red-50 border-red-500 shadow-lg shadow-red-500/25";
  }
  
  // Transcendent tier
  if (rarityLower === 'transcendent') {
    return "text-emerald-700 bg-emerald-50 border-emerald-500 shadow-lg shadow-emerald-500/25";
  }
  
  // Phenomenal tier
  if (rarityLower === 'phenomenal') {
    return "text-violet-700 bg-violet-50 border-violet-500 shadow-lg shadow-violet-500/25";
  }
  
  // Epic tier
  if (['cultclassic', 'allocationonly', 'criticschoice'].includes(rarityLower)) {
    return "text-rarity-epic-800 bg-rarity-epic-50 border-rarity-epic-600 shadow-rarity-epic";
  }
  
  // Sublime tier
  if (rarityLower === 'sublime') {
    return "text-rose-700 bg-rose-50 border-rose-500 shadow-xl shadow-rose-500/30";
  }
  
  // Eternal tier
  if (rarityLower === 'eternal') {
    return "text-slate-700 bg-slate-50 border-slate-500 shadow-xl shadow-slate-500/30";
  }
  
  // Legendary tier
  if (['museumpiece', 'investmentgrade', 'unicorn'].includes(rarityLower)) {
    return "text-rarity-legendary-800 bg-rarity-legendary-50 border-rarity-legendary-600 shadow-rarity-legendary animate-rarity-glow";
  }
  
  // Cosmic tier
  if (rarityLower === 'cosmic') {
    return "text-purple-700 bg-purple-50 border-purple-500 shadow-2xl shadow-purple-500/40 animate-rarity-glow";
  }
  
  // Mythical tier
  if (['ghostvintage', 'lostlabel', 'foundersreserve'].includes(rarityLower)) {
    return "text-rarity-mythical-800 bg-rarity-mythical-50 border-rarity-mythical-600 shadow-rarity-mythical animate-rarity-glow";
  }
  
  // Primordial tier
  if (rarityLower === 'primordial') {
    return "text-amber-700 bg-amber-50 border-amber-500 shadow-2xl shadow-amber-500/50 animate-rarity-glow";
  }
  
  // Celestial tier
  if (rarityLower === 'celestial') {
    return "text-cyan-700 bg-cyan-50 border-cyan-500 shadow-2xl shadow-cyan-500/50 animate-rarity-glow";
  }
  
  // Divine tier
  if (['onceinlifetime', 'perfectstorm', 'timecapsule'].includes(rarityLower)) {
    return "text-rarity-divine-800 bg-rarity-divine-50 border-rarity-divine-600 shadow-rarity-divine animate-divine-pulse";
  }
  
  // Legacy support
  switch (rarityLower) {
    case "common":
      return "text-rarity-common-600 bg-rarity-common-100 border-rarity-common-300";
    case "uncommon":
      return "text-rarity-uncommon-700 bg-rarity-uncommon-50 border-rarity-uncommon-500 shadow-rarity-uncommon";
    case "rare":
      return "text-rarity-rare-700 bg-rarity-rare-50 border-rarity-rare-500 shadow-rarity-rare";
    case "epic":
      return "text-rarity-epic-800 bg-rarity-epic-50 border-rarity-epic-600 shadow-rarity-epic";
    case "legendary":
      return "text-rarity-legendary-800 bg-rarity-legendary-50 border-rarity-legendary-600 shadow-rarity-legendary animate-rarity-glow";
    case "mythical":
      return "text-rarity-mythical-800 bg-rarity-mythical-50 border-rarity-mythical-600 shadow-rarity-mythical animate-rarity-glow";
    case "divine":
      return "text-rarity-divine-800 bg-rarity-divine-50 border-rarity-divine-600 shadow-rarity-divine animate-divine-pulse";
    default:
      return "text-rarity-common-600 bg-rarity-common-100 border-rarity-common-300";
  }
}

export function calculateLevel(experiencePoints: number): number {
  return Math.floor(Math.sqrt(experiencePoints / 100)) + 1;
}

export function getExperienceForNextLevel(currentLevel: number): number {
  return (currentLevel * currentLevel) * 100;
}

export function generateWineId(): string {
  return `wine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function searchWines(wines: Wine[], searchTerm: string): Wine[] {
  if (!searchTerm.trim()) return wines;
  
  const term = searchTerm.toLowerCase();
  return wines.filter(wine => 
    wine.name.toLowerCase().includes(term) ||
    wine.region.toLowerCase().includes(term) ||
    wine.producer.toLowerCase().includes(term) ||
    wine.grape.toLowerCase().includes(term) ||
    wine.tastingNotes.toLowerCase().includes(term) ||
    wine.year.toString().includes(term)
  );
}

export function sortWines(wines: Wine[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Wine[] {
  return [...wines].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle string comparisons
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
}

export function filterWinesByCategory(wines: Wine[], category: string, value: string): Wine[] {
  if (!value || value === 'all') return wines;
  
  switch (category) {
    case 'type':
      return wines.filter(wine => wine.type === value);
    case 'region':
      return wines.filter(wine => wine.region === value);
    case 'grape':
      return wines.filter(wine => wine.grape === value);
    case 'year':
      return wines.filter(wine => wine.year.toString() === value);
    case 'rating':
      return wines.filter(wine => wine.rating >= parseInt(value));
    default:
      return wines;
  }
}

export function getUniqueValues(wines: Wine[], field: string): string[] {
  const values = wines.map(wine => wine[field]);
  return [...new Set(values)].filter(Boolean).sort();
}

// Pokemon-style utility functions
export function getTypeEffectiveness(attackType: string, defendType: string): number {
  // Type effectiveness matrix for wine pairings
  const effectiveness: Record<string, Record<string, number>> = {
    Red: {
      Red: 1.0, White: 0.5, Rosé: 1.5, Sparkling: 0.5,
      Dessert: 1.5, Fortified: 2.0, Orange: 1.5, Natural: 1.0
    },
    White: {
      Red: 0.5, White: 1.0, Rosé: 1.5, Sparkling: 2.0,
      Dessert: 1.5, Fortified: 0.5, Orange: 1.5, Natural: 2.0
    },
    Rosé: {
      Red: 1.5, White: 1.5, Rosé: 1.0, Sparkling: 2.0,
      Dessert: 1.0, Fortified: 0.5, Orange: 1.5, Natural: 1.5
    },
    Sparkling: {
      Red: 0.5, White: 2.0, Rosé: 2.0, Sparkling: 1.0,
      Dessert: 1.5, Fortified: 0.5, Orange: 1.0, Natural: 1.5
    },
    Dessert: {
      Red: 1.5, White: 1.5, Rosé: 1.0, Sparkling: 1.5,
      Dessert: 1.0, Fortified: 2.0, Orange: 1.0, Natural: 0.5
    },
    Fortified: {
      Red: 2.0, White: 0.5, Rosé: 0.5, Sparkling: 0.5,
      Dessert: 2.0, Fortified: 1.0, Orange: 1.5, Natural: 0.5
    },
    Orange: {
      Red: 1.5, White: 1.5, Rosé: 1.5, Sparkling: 1.0,
      Dessert: 1.0, Fortified: 1.5, Orange: 1.0, Natural: 2.0
    },
    Natural: {
      Red: 1.0, White: 2.0, Rosé: 1.5, Sparkling: 1.5,
      Dessert: 0.5, Fortified: 0.5, Orange: 2.0, Natural: 1.0
    }
  };
  
  return effectiveness[attackType]?.[defendType] ?? 1.0;
}

export function getRarityTier(rarity: string): string {
  const rarityLower = rarity.toLowerCase();
  
  if (['everyday', 'regional', 'quality'].includes(rarityLower)) return 'Common';
  if (['estate', 'vintage', 'reserve'].includes(rarityLower)) return 'Uncommon';
  if (rarityLower === 'superior') return 'Superior';
  if (rarityLower === 'exceptional') return 'Exceptional';
  if (rarityLower === 'outstanding') return 'Outstanding';
  if (['singlevineyard', 'grandcru', 'masterselection'].includes(rarityLower)) return 'Rare';
  if (rarityLower === 'magnificent') return 'Magnificent';
  if (rarityLower === 'transcendent') return 'Transcendent';
  if (rarityLower === 'phenomenal') return 'Phenomenal';
  if (['cultclassic', 'allocationonly', 'criticschoice'].includes(rarityLower)) return 'Epic';
  if (rarityLower === 'sublime') return 'Sublime';
  if (rarityLower === 'eternal') return 'Eternal';
  if (['museumpiece', 'investmentgrade', 'unicorn'].includes(rarityLower)) return 'Legendary';
  if (rarityLower === 'cosmic') return 'Cosmic';
  if (['ghostvintage', 'lostlabel', 'foundersreserve'].includes(rarityLower)) return 'Mythical';
  if (rarityLower === 'primordial') return 'Primordial';
  if (rarityLower === 'celestial') return 'Celestial';
  if (['onceinlifetime', 'perfectstorm', 'timecapsule'].includes(rarityLower)) return 'Divine';
  
  // Legacy support
  switch (rarityLower) {
    case 'common': return 'Common';
    case 'uncommon': return 'Uncommon';
    case 'rare': return 'Rare';
    case 'epic': return 'Epic';
    case 'legendary': return 'Legendary';
    case 'mythical': return 'Mythical';
    case 'divine': return 'Divine';
    default: return 'Common';
  }
}

export function calculateStatTotal(stats: Record<string, number>): number {
  return Object.values(stats).reduce((sum, stat) => sum + stat, 0);
}

export function getStatGrade(statValue: number): string {
  if (statValue >= 90) return 'S+';
  if (statValue >= 85) return 'S';
  if (statValue >= 80) return 'A+';
  if (statValue >= 75) return 'A';
  if (statValue >= 70) return 'B+';
  if (statValue >= 65) return 'B';
  if (statValue >= 60) return 'C+';
  if (statValue >= 55) return 'C';
  if (statValue >= 50) return 'D+';
  if (statValue >= 45) return 'D';
  return 'F';
}

export function isShinyWine(wine: { id?: string }): boolean {
  // 1 in 4096 chance for shiny wines (like Pokemon)
  const shinyChance = 1 / 4096;
  const wineHash = wine.id ? wine.id.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0) : 0;
  return (wineHash % 4096) < (4096 * shinyChance);
}

export function generateNature(): string {
  const natures = [
    'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
    'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
    'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
    'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
    'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky'
  ];
  return natures[Math.floor(Math.random() * natures.length)];
}

export function calculateIVs(): Record<string, number> {
  // Individual Values range from 0-31 (Pokemon standard)
  return {
    complexity: Math.floor(Math.random() * 32),
    balance: Math.floor(Math.random() * 32),
    intensity: Math.floor(Math.random() * 32),
    finesse: Math.floor(Math.random() * 32),
    power: Math.floor(Math.random() * 32),
    elegance: Math.floor(Math.random() * 32),
  };
}

export function getWineTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    Red: '🍷',
    White: '🥂',
    Rosé: '🌹',
    Sparkling: '🍾',
    Dessert: '🍯',
    Fortified: '⚡',
    Orange: '🍊',
    Natural: '🌿',
  };
  return icons[type] || '🍷';
}