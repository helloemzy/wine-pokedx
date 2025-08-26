# Wine Pokédex Design System
## Comprehensive Pokemon-Inspired UI Design Documentation

---

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Component Library](#component-library)
5. [Spacing & Layout](#spacing--layout)
6. [Animation & Transitions](#animation--transitions)
7. [Design Tokens](#design-tokens)
8. [Accessibility](#accessibility)
9. [Responsive Breakpoints](#responsive-breakpoints)
10. [Implementation Guide](#implementation-guide)

---

## Design Philosophy

### Core Principles
- **Pokemon-Inspired Fun**: Capture the excitement and collectible nature of Pokemon while maintaining wine credibility
- **Educational Excellence**: Balance entertainment with serious wine education
- **Mobile-First**: Optimized for touch interactions and mobile collection experiences  
- **Accessibility First**: WCAG 2.1 AA compliant design patterns
- **Performance Focused**: Smooth animations and interactions across all devices

### Design Pillars
1. **Collectible Magic**: Every wine feels special and worth collecting
2. **Strategic Depth**: Complex wine type interactions and evolution mechanics
3. **Educational Value**: Learn wine knowledge through engaging gameplay
4. **Social Connection**: Share discoveries and compete with fellow enthusiasts

---

## Color System

### Primary Brand Colors
```css
/* Core Brand Palette */
:root {
  /* Primary - Pokemon Blue Theme */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6; /* Main Brand Blue */
  --primary-600: #2563eb;
  --primary-700: #1d4ed8; /* Pokedex Deep Blue */
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;
  --primary-950: #172554;

  /* Secondary - Pokemon Yellow Accents */
  --secondary-50: #fefce8;
  --secondary-100: #fef9c3;
  --secondary-200: #fef08a;
  --secondary-300: #fde047;
  --secondary-400: #facc15; /* Pokemon Yellow */
  --secondary-500: #eab308;
  --secondary-600: #ca8a04;
  --secondary-700: #a16207;
  --secondary-800: #854d0e;
  --secondary-900: #713f12;
  --secondary-950: #422006;

  /* Success - Pokedex Green */
  --success-50: #f0fdf4;
  --success-100: #dcfce7;
  --success-200: #bbf7d0;
  --success-300: #86efac;
  --success-400: #4ade80;
  --success-500: #22c55e;
  --success-600: #16a34a; /* Pokemon Green */
  --success-700: #15803d;
  --success-800: #166534;
  --success-900: #14532d;
  --success-950: #052e16;
}
```

### Wine Type Color System
Each of the 8 wine types has a unique color palette with proper contrast ratios:

```css
/* Wine Type Colors - Based on your type system */
:root {
  /* Terroir Type - Earth Tones */
  --type-terroir-primary: #8b4513;
  --type-terroir-secondary: #d2691e;
  --type-terroir-light: #f4a460;
  --type-terroir-dark: #654321;

  /* Varietal Type - Grape Purple */
  --type-varietal-primary: #6b46c1;
  --type-varietal-secondary: #8b5cf6;
  --type-varietal-light: #c4b5fd;
  --type-varietal-dark: #553c9a;

  /* Technique Type - Modern Teal */
  --type-technique-primary: #0f766e;
  --type-technique-secondary: #14b8a6;
  --type-technique-light: #5eead4;
  --type-technique-dark: #134e4a;

  /* Heritage Type - Classic Gold */
  --type-heritage-primary: #d97706;
  --type-heritage-secondary: #f59e0b;
  --type-heritage-light: #fbbf24;
  --type-heritage-dark: #92400e;

  /* Modern Type - Electric Blue */
  --type-modern-primary: #2563eb;
  --type-modern-secondary: #3b82f6;
  --type-modern-light: #93c5fd;
  --type-modern-dark: #1e40af;

  /* Mystical Type - Ethereal Purple */
  --type-mystical-primary: #7c3aed;
  --type-mystical-secondary: #8b5cf6;
  --type-mystical-light: #c4b5fd;
  --type-mystical-dark: #5b21b6;

  /* Energy Type - Vibrant Red */
  --type-energy-primary: #dc2626;
  --type-energy-secondary: #ef4444;
  --type-energy-light: #fca5a5;
  --type-energy-dark: #b91c1c;

  /* Flow Type - Cool Cyan */
  --type-flow-primary: #0891b2;
  --type-flow-secondary: #06b6d4;
  --type-flow-light: #67e8f9;
  --type-flow-dark: #0e7490;
}
```

### Rarity Color System
20+ rarity tiers with appropriate visual hierarchy:

```css
/* Rarity Colors - Progressive Intensity */
:root {
  /* Common Tier (Everyday, Regional, Quality) */
  --rarity-common-bg: #f3f4f6;
  --rarity-common-border: #d1d5db;
  --rarity-common-text: #6b7280;
  --rarity-common-glow: none;

  /* Uncommon Tier (Estate, Vintage, Reserve) */
  --rarity-uncommon-bg: #ecfdf5;
  --rarity-uncommon-border: #10b981;
  --rarity-uncommon-text: #065f46;
  --rarity-uncommon-glow: 0 0 10px rgba(16, 185, 129, 0.3);

  /* Rare Tier (SingleVineyard, GrandCru, MasterSelection) */
  --rarity-rare-bg: #eff6ff;
  --rarity-rare-border: #3b82f6;
  --rarity-rare-text: #1e40af;
  --rarity-rare-glow: 0 0 15px rgba(59, 130, 246, 0.4);

  /* Epic Tier (CultClassic, AllocationOnly, CriticsChoice) */
  --rarity-epic-bg: #f3e8ff;
  --rarity-epic-border: #8b5cf6;
  --rarity-epic-text: #5b21b6;
  --rarity-epic-glow: 0 0 20px rgba(139, 92, 246, 0.5);

  /* Legendary Tier (MuseumPiece, InvestmentGrade, Unicorn) */
  --rarity-legendary-bg: #fffbeb;
  --rarity-legendary-border: #f59e0b;
  --rarity-legendary-text: #92400e;
  --rarity-legendary-glow: 0 0 25px rgba(245, 158, 11, 0.6);

  /* Mythical Tier (GhostVintage, LostLabel, FoundersReserve) */
  --rarity-mythical-bg: #fef2f2;
  --rarity-mythical-border: #ef4444;
  --rarity-mythical-text: #b91c1c;
  --rarity-mythical-glow: 0 0 30px rgba(239, 68, 68, 0.7);

  /* Divine Tier (OnceInLifetime, PerfectStorm, TimeCapsule) */
  --rarity-divine-bg: linear-gradient(45deg, #fbbf24, #f59e0b, #d97706);
  --rarity-divine-border: #d97706;
  --rarity-divine-text: #ffffff;
  --rarity-divine-glow: 0 0 40px rgba(217, 119, 6, 0.8);
  --rarity-divine-animation: divine-pulse 2s ease-in-out infinite;
}

@keyframes divine-pulse {
  0%, 100% { box-shadow: var(--rarity-divine-glow); }
  50% { box-shadow: 0 0 60px rgba(217, 119, 6, 1); }
}
```

### Type Effectiveness Colors
Visual indicators for strategic interactions:

```css
/* Type Effectiveness Visual Feedback */
:root {
  --effectiveness-super: #22c55e; /* 2x effectiveness - bright green */
  --effectiveness-effective: #84cc16; /* 1.5x effectiveness - lime */
  --effectiveness-normal: #6b7280; /* 1x effectiveness - gray */
  --effectiveness-weak: #f97316; /* 0.5x effectiveness - orange */
  --effectiveness-immune: #ef4444; /* 0x effectiveness - red */
}
```

---

## Typography

### Font System
Pokemon-inspired typography with excellent readability:

```css
/* Font Stack */
:root {
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-display: 'Pokemon Solid', 'Orbitron', 'Inter', sans-serif; /* For headers */
  --font-mono: 'JetBrains Mono', 'Menlo', 'Monaco', monospace;
}

/* Typography Scale */
.text-xs { font-size: 0.75rem; line-height: 1rem; } /* 12px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; } /* 14px */
.text-base { font-size: 1rem; line-height: 1.5rem; } /* 16px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; } /* 18px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; } /* 20px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; } /* 24px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* 30px */
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; } /* 36px */
.text-5xl { font-size: 3rem; line-height: 1; } /* 48px */
```

### Font Weights & Styles
```css
/* Font Weights */
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }

/* Pokemon-Style Text Effects */
.text-pokemon-shadow {
  text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.3);
}

.text-glow {
  text-shadow: 0 0 10px currentColor;
}

.text-3d {
  text-shadow: 
    1px 1px 0px rgba(0, 0, 0, 0.2),
    2px 2px 0px rgba(0, 0, 0, 0.15),
    3px 3px 0px rgba(0, 0, 0, 0.1);
}
```

---

## Component Library

### Base Components

#### Button System
```css
/* Primary Button */
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 active:bg-primary-800;
  @apply text-white font-semibold py-3 px-6 rounded-lg;
  @apply transition-all duration-200 ease-in-out;
  @apply shadow-lg hover:shadow-xl active:shadow-md;
  @apply transform hover:scale-105 active:scale-95;
  @apply focus:outline-none focus:ring-4 focus:ring-primary-300;
  @apply min-h-[44px] min-w-[44px]; /* Touch-friendly */
}

/* Type-specific buttons */
.btn-terroir { @apply bg-[var(--type-terroir-primary)] hover:bg-[var(--type-terroir-dark)]; }
.btn-varietal { @apply bg-[var(--type-varietal-primary)] hover:bg-[var(--type-varietal-dark)]; }
.btn-technique { @apply bg-[var(--type-technique-primary)] hover:bg-[var(--type-technique-dark)]; }
.btn-heritage { @apply bg-[var(--type-heritage-primary)] hover:bg-[var(--type-heritage-dark)]; }
.btn-modern { @apply bg-[var(--type-modern-primary)] hover:bg-[var(--type-modern-dark)]; }
.btn-mystical { @apply bg-[var(--type-mystical-primary)] hover:bg-[var(--type-mystical-dark)]; }
.btn-energy { @apply bg-[var(--type-energy-primary)] hover:bg-[var(--type-energy-dark)]; }
.btn-flow { @apply bg-[var(--type-flow-primary)] hover:bg-[var(--type-flow-dark)]; }

/* Rarity buttons with glow effects */
.btn-legendary {
  @apply bg-gradient-to-r from-yellow-400 to-yellow-600 text-black;
  box-shadow: var(--rarity-legendary-glow);
}

.btn-mythical {
  @apply bg-gradient-to-r from-pink-400 to-purple-600 text-white;
  box-shadow: var(--rarity-mythical-glow);
}

.btn-divine {
  background: var(--rarity-divine-bg);
  color: var(--rarity-divine-text);
  box-shadow: var(--rarity-divine-glow);
  animation: var(--rarity-divine-animation);
}
```

#### Card Components
```css
/* Base Card */
.wine-card {
  @apply bg-white rounded-xl shadow-lg border border-gray-200;
  @apply transition-all duration-300 ease-in-out;
  @apply hover:shadow-xl hover:scale-105;
  @apply cursor-pointer select-none;
  @apply relative overflow-hidden;
  perspective: 1000px;
}

/* Trading Card Specific */
.trading-card {
  @apply wine-card;
  @apply w-64 h-96; /* Pokemon card proportions */
  @apply preserve-3d;
}

.trading-card-front,
.trading-card-back {
  @apply absolute inset-0 backface-hidden;
  @apply flex flex-col;
}

.trading-card-back {
  @apply rotate-y-180;
}

/* Rarity-specific card effects */
.card-common { @apply border-gray-300; }
.card-uncommon { 
  @apply border-green-400; 
  box-shadow: var(--rarity-uncommon-glow);
}
.card-rare { 
  @apply border-blue-400;
  box-shadow: var(--rarity-rare-glow);
}
.card-epic { 
  @apply border-purple-400;
  box-shadow: var(--rarity-epic-glow);
}
.card-legendary { 
  @apply border-yellow-400;
  box-shadow: var(--rarity-legendary-glow);
}
.card-mythical { 
  @apply border-pink-400;
  box-shadow: var(--rarity-mythical-glow);
}
.card-divine { 
  border: 3px solid var(--rarity-divine-border);
  box-shadow: var(--rarity-divine-glow);
  animation: var(--rarity-divine-animation);
}
```

#### Badge & Type Indicator Components
```css
/* Type Badge */
.type-badge {
  @apply inline-flex items-center px-3 py-1 rounded-full;
  @apply text-sm font-bold text-white;
  @apply shadow-sm;
  @apply min-h-[32px];
}

.type-badge-terroir { background: var(--type-terroir-primary); }
.type-badge-varietal { background: var(--type-varietal-primary); }
.type-badge-technique { background: var(--type-technique-primary); }
.type-badge-heritage { background: var(--type-heritage-primary); }
.type-badge-modern { background: var(--type-modern-primary); }
.type-badge-mystical { background: var(--type-mystical-primary); }
.type-badge-energy { background: var(--type-energy-primary); }
.type-badge-flow { background: var(--type-flow-primary); }

/* Rarity Badge */
.rarity-badge {
  @apply inline-flex items-center px-2 py-1 rounded-lg;
  @apply text-xs font-bold uppercase tracking-wide;
  @apply border-2;
}

.rarity-badge-common {
  background: var(--rarity-common-bg);
  border-color: var(--rarity-common-border);
  color: var(--rarity-common-text);
}

.rarity-badge-uncommon {
  background: var(--rarity-uncommon-bg);
  border-color: var(--rarity-uncommon-border);
  color: var(--rarity-uncommon-text);
}

.rarity-badge-rare {
  background: var(--rarity-rare-bg);
  border-color: var(--rarity-rare-border);
  color: var(--rarity-rare-text);
}

.rarity-badge-epic {
  background: var(--rarity-epic-bg);
  border-color: var(--rarity-epic-border);
  color: var(--rarity-epic-text);
}

.rarity-badge-legendary {
  background: var(--rarity-legendary-bg);
  border-color: var(--rarity-legendary-border);
  color: var(--rarity-legendary-text);
  box-shadow: var(--rarity-legendary-glow);
}

.rarity-badge-mythical {
  background: var(--rarity-mythical-bg);
  border-color: var(--rarity-mythical-border);
  color: var(--rarity-mythical-text);
  box-shadow: var(--rarity-mythical-glow);
}

.rarity-badge-divine {
  background: var(--rarity-divine-bg);
  border-color: var(--rarity-divine-border);
  color: var(--rarity-divine-text);
  box-shadow: var(--rarity-divine-glow);
  animation: var(--rarity-divine-animation);
}
```

#### Stat Bar Components
```css
/* Pokemon-style stat bars */
.stat-bar {
  @apply flex items-center gap-3 py-2;
}

.stat-label {
  @apply text-sm font-medium text-gray-700 min-w-[80px] uppercase tracking-wide;
}

.stat-bar-container {
  @apply flex-1 bg-gray-200 rounded-full h-3 overflow-hidden;
  @apply relative;
}

.stat-bar-fill {
  @apply h-full transition-all duration-500 ease-out;
  @apply relative overflow-hidden;
}

.stat-bar-fill::after {
  content: '';
  @apply absolute inset-0 bg-white/30;
  @apply animate-pulse;
}

/* Stat-specific colors */
.stat-power { @apply bg-gradient-to-r from-red-400 to-red-600; }
.stat-elegance { @apply bg-gradient-to-r from-blue-400 to-blue-600; }
.stat-complexity { @apply bg-gradient-to-r from-purple-400 to-purple-600; }
.stat-longevity { @apply bg-gradient-to-r from-green-400 to-green-600; }
.stat-rarity { @apply bg-gradient-to-r from-yellow-400 to-yellow-600; }
.stat-terroir { @apply bg-gradient-to-r from-amber-400 to-amber-600; }

.stat-value {
  @apply text-sm font-bold text-gray-800 min-w-[40px] text-right;
}
```

#### Evolution Chain Component
```css
/* Evolution chain visualization */
.evolution-chain {
  @apply flex items-center justify-center gap-4 p-4;
  @apply bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg;
  @apply border border-purple-200;
}

.evolution-wine {
  @apply flex flex-col items-center gap-2;
  @apply relative;
}

.evolution-wine-image {
  @apply w-16 h-16 rounded-full border-4 border-white shadow-lg;
  @apply hover:scale-110 transition-transform duration-200;
  @apply cursor-pointer;
}

.evolution-arrow {
  @apply flex items-center justify-center;
  @apply w-8 h-8 bg-purple-500 rounded-full text-white;
  @apply animate-pulse;
}

.evolution-requirements {
  @apply absolute -bottom-8 left-1/2 transform -translate-x-1/2;
  @apply bg-black/80 text-white text-xs px-2 py-1 rounded;
  @apply opacity-0 hover:opacity-100 transition-opacity;
  @apply whitespace-nowrap;
}
```

### Interactive Components

#### Type Effectiveness Matrix
```css
.effectiveness-grid {
  @apply grid grid-cols-9 gap-1 p-4 bg-gray-50 rounded-lg;
}

.effectiveness-cell {
  @apply w-8 h-8 rounded flex items-center justify-center;
  @apply text-xs font-bold text-white;
  @apply cursor-help;
  @apply hover:scale-110 transition-transform;
}

.effectiveness-super { background: var(--effectiveness-super); }
.effectiveness-effective { background: var(--effectiveness-effective); }
.effectiveness-normal { background: var(--effectiveness-normal); }
.effectiveness-weak { background: var(--effectiveness-weak); }
.effectiveness-immune { background: var(--effectiveness-immune); }
```

#### Collection Grid
```css
.collection-grid {
  @apply grid gap-4 p-4;
  @apply grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6;
}

.collection-item {
  @apply wine-card;
  @apply aspect-[3/4]; /* Pokemon card aspect ratio */
  @apply min-h-[200px];
}

.collection-item-empty {
  @apply collection-item;
  @apply bg-gray-100 border-gray-300 border-dashed;
  @apply flex items-center justify-center;
  @apply opacity-60 hover:opacity-80;
}

.collection-item-locked {
  @apply collection-item-empty;
  @apply relative overflow-hidden;
}

.collection-item-locked::before {
  content: '🔒';
  @apply absolute inset-0 flex items-center justify-center;
  @apply text-4xl text-gray-400;
  @apply bg-gray-100/90;
}
```

---

## Spacing & Layout

### Spacing Scale
Based on 4px base unit for consistent spacing:

```css
:root {
  /* Spacing scale */
  --space-0: 0;
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem;  /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem;    /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem;  /* 24px */
  --space-8: 2rem;    /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem;   /* 48px */
  --space-16: 4rem;   /* 64px */
  --space-20: 5rem;   /* 80px */
  --space-24: 6rem;   /* 96px */
}
```

### Layout Containers
```css
/* Layout containers */
.container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}

.container-sm { @apply max-w-3xl mx-auto px-4; }
.container-md { @apply max-w-5xl mx-auto px-4 sm:px-6; }
.container-lg { @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8; }

/* Pokemon-style bordered containers */
.pokedex-container {
  @apply bg-gradient-to-br from-blue-600 to-blue-800;
  @apply border-8 border-blue-900 rounded-3xl;
  @apply shadow-2xl;
  @apply relative overflow-hidden;
}

.pokedex-container::before {
  content: '';
  @apply absolute top-4 left-4 w-8 h-8;
  @apply bg-yellow-400 rounded-full;
  @apply shadow-lg;
}

.pokedex-container::after {
  content: '';
  @apply absolute top-4 right-4 w-4 h-4;
  @apply bg-red-500 rounded-full;
  @apply animate-pulse;
}
```

### Safe Areas (Mobile)
```css
/* Mobile safe areas */
.safe-top {
  padding-top: max(1rem, env(safe-area-inset-top));
}

.safe-bottom {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

.safe-left {
  padding-left: max(1rem, env(safe-area-inset-left));
}

.safe-right {
  padding-right: max(1rem, env(safe-area-inset-right));
}
```

---

## Animation & Transitions

### Base Animation Principles
- **Performance First**: Use transform and opacity for smooth 60fps animations
- **Meaningful Motion**: Every animation should have a purpose
- **Reduced Motion**: Respect user preferences
- **Touch Feedback**: Immediate visual response to interactions

### Core Animations
```css
/* Pokemon-inspired animations */
@keyframes pokeball-capture {
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.1) rotate(90deg); }
  50% { transform: scale(0.9) rotate(180deg); }
  75% { transform: scale(1.05) rotate(270deg); }
  100% { transform: scale(1) rotate(360deg); }
}

@keyframes type-effectiveness-flash {
  0%, 100% { background-color: currentColor; }
  50% { background-color: transparent; }
}

@keyframes rarity-glow-pulse {
  0%, 100% { box-shadow: var(--glow-intensity, 0 0 10px currentColor); }
  50% { box-shadow: var(--glow-intensity, 0 0 20px currentColor); }
}

@keyframes stat-bar-fill {
  0% { width: 0; }
  100% { width: var(--stat-width, 0%); }
}

@keyframes shiny-sparkle {
  0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
  25% { opacity: 0.7; transform: scale(1.2) rotate(90deg); }
  50% { opacity: 0.4; transform: scale(0.8) rotate(180deg); }
  75% { opacity: 0.7; transform: scale(1.1) rotate(270deg); }
}

@keyframes evolution-glow {
  0% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
  50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.3); }
  100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
}
```

### Interaction Animations
```css
/* Touch feedback animations */
.touch-feedback {
  @apply transition-transform duration-150 ease-out;
  @apply active:scale-95;
}

.haptic-feedback {
  @apply transition-all duration-100 ease-out;
}

.haptic-feedback:active {
  @apply scale-98;
  animation: haptic-pulse 0.1s ease-out;
}

@keyframes haptic-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(0.98); }
  100% { transform: scale(1); }
}

/* Card flip animations */
.card-flip-enter {
  animation: card-flip-in 0.6s cubic-bezier(0.23, 1, 0.320, 1);
}

@keyframes card-flip-in {
  0% { transform: rotateY(-90deg) scale(0.8); opacity: 0; }
  50% { transform: rotateY(-45deg) scale(0.9); opacity: 0.5; }
  100% { transform: rotateY(0deg) scale(1); opacity: 1; }
}
```

### State-based Animations
```css
/* Loading states */
.loading-pokeball {
  animation: pokeball-spin 1s linear infinite;
}

.loading-dots {
  animation: loading-dots 1.4s infinite both;
}

@keyframes loading-dots {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Success/Error states */
.capture-success {
  animation: capture-success 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes capture-success {
  0% { transform: scale(0) rotate(0deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
  100% { transform: scale(1) rotate(360deg); opacity: 1; }
}

.evolution-animation {
  animation: evolution-glow 2s ease-in-out infinite;
}
```

---

## Design Tokens

### TailwindCSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pokemon brand colors
        'pokemon-red': '#dc2626',
        'pokemon-blue': '#1d4ed8',
        'pokemon-yellow': '#facc15',
        'pokemon-green': '#16a34a',
        
        // Wine type colors
        'type': {
          'terroir': {
            50: '#faf7f0',
            100: '#f4ede0',
            200: '#e8dbc1',
            300: '#d2c49e',
            400: '#c4a875',
            500: '#8b4513', // Primary
            600: '#7a3b0f',
            700: '#654321', // Dark
            800: '#4f2f19',
            900: '#3d2414',
          },
          'varietal': {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#6b46c1', // Primary
            700: '#553c9a', // Dark
            800: '#4c1d95',
            900: '#3730a3',
          },
          // Add other wine type color scales...
        },
        
        // Rarity colors
        'rarity': {
          'common': {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
          },
          'uncommon': {
            50: '#ecfdf5',
            100: '#d1fae5',
            200: '#a7f3d0',
            300: '#6ee7b7',
            400: '#34d399',
            500: '#10b981',
            600: '#059669',
            700: '#047857',
            800: '#065f46',
            900: '#064e3b',
          },
          // Add other rarity scales...
        },
        
        // Effectiveness colors
        'effectiveness': {
          'super': '#22c55e',
          'effective': '#84cc16',
          'normal': '#6b7280',
          'weak': '#f97316',
          'immune': '#ef4444',
        }
      },
      
      fontFamily: {
        'pokemon': ['Pokemon Solid', 'Orbitron', 'Inter', 'sans-serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
      },
      
      animation: {
        'pokeball-spin': 'pokeball-spin 2s linear infinite',
        'card-flip': 'card-flip 0.6s cubic-bezier(0.23, 1, 0.320, 1)',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'rarity-glow': 'rarity-glow-pulse 2s ease-in-out infinite',
        'evolution-glow': 'evolution-glow 2s ease-in-out infinite',
        'capture-success': 'capture-success 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'shiny-sparkle': 'shiny-sparkle 1.5s ease-in-out infinite',
        'stat-fill': 'stat-bar-fill 1s ease-out',
      },
      
      keyframes: {
        'pokeball-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'card-flip': {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(180deg)' }
        },
        'shimmer': {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' }
        },
        'rarity-glow-pulse': {
          '0%, 100%': { 'box-shadow': '0 0 10px currentColor' },
          '50%': { 'box-shadow': '0 0 20px currentColor, 0 0 30px currentColor' }
        },
        'evolution-glow': {
          '0%': { 'box-shadow': '0 0 20px rgba(255, 215, 0, 0.5)' },
          '50%': { 'box-shadow': '0 0 40px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.3)' },
          '100%': { 'box-shadow': '0 0 20px rgba(255, 215, 0, 0.5)' }
        },
        'capture-success': {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', opacity: '0.8' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '1' }
        },
        'shiny-sparkle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
          '25%': { opacity: '0.7', transform: 'scale(1.2) rotate(90deg)' },
          '50%': { opacity: '0.4', transform: 'scale(0.8) rotate(180deg)' },
          '75%': { opacity: '0.7', transform: 'scale(1.1) rotate(270deg)' }
        },
        'stat-bar-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--stat-width, 0%)' }
        }
      },
      
      boxShadow: {
        'rarity-common': 'none',
        'rarity-uncommon': '0 0 10px rgba(16, 185, 129, 0.3)',
        'rarity-rare': '0 0 15px rgba(59, 130, 246, 0.4)',
        'rarity-epic': '0 0 20px rgba(139, 92, 246, 0.5)',
        'rarity-legendary': '0 0 25px rgba(245, 158, 11, 0.6)',
        'rarity-mythical': '0 0 30px rgba(239, 68, 68, 0.7)',
        'rarity-divine': '0 0 40px rgba(217, 119, 6, 0.8)',
      },
      
      perspective: {
        '1000': '1000px',
        '1500': '1500px',
      },
      
      transformStyle: {
        'preserve-3d': 'preserve-3d',
      },
      
      backfaceVisibility: {
        'hidden': 'hidden',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    function({ addUtilities, addComponents }) {
      addUtilities({
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.preserve-3d': {
          'transform-style': 'preserve-3d',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
        '.rotate-y-180': {
          transform: 'rotateY(180deg)',
        },
      });
      
      addComponents({
        '.wine-card': {
          '@apply bg-white rounded-xl shadow-lg border border-gray-200': {},
          '@apply transition-all duration-300 ease-in-out': {},
          '@apply hover:shadow-xl hover:scale-105': {},
          '@apply cursor-pointer select-none relative overflow-hidden': {},
          'perspective': '1000px',
        },
        
        '.type-badge': {
          '@apply inline-flex items-center px-3 py-1 rounded-full': {},
          '@apply text-sm font-bold text-white shadow-sm min-h-[32px]': {},
        },
        
        '.rarity-badge': {
          '@apply inline-flex items-center px-2 py-1 rounded-lg': {},
          '@apply text-xs font-bold uppercase tracking-wide border-2': {},
        },
        
        '.stat-bar': {
          '@apply flex items-center gap-3 py-2': {},
        },
        
        '.pokedex-container': {
          '@apply bg-gradient-to-br from-blue-600 to-blue-800': {},
          '@apply border-8 border-blue-900 rounded-3xl shadow-2xl': {},
          '@apply relative overflow-hidden': {},
        },
      });
    }
  ],
}
```

---

## Accessibility

### WCAG 2.1 AA Compliance

#### Color Contrast Ratios
- **Normal text**: 4.5:1 minimum contrast ratio
- **Large text (18pt+ or 14pt+ bold)**: 3:1 minimum contrast ratio  
- **Non-text elements**: 3:1 minimum contrast ratio

#### Focus Management
```css
/* Focus indicators */
.focus-visible {
  @apply outline-none ring-4 ring-primary-300 ring-offset-2 ring-offset-white;
  @apply rounded-lg;
}

/* Custom focus styles for interactive elements */
.wine-card:focus-visible {
  @apply ring-4 ring-primary-300 ring-offset-4;
}

.btn-primary:focus-visible {
  @apply ring-4 ring-primary-300/50;
}

/* Skip link for keyboard navigation */
.skip-link {
  @apply absolute -top-10 left-4 bg-primary-600 text-white px-4 py-2 rounded;
  @apply transition-all duration-200;
  @apply focus:top-4;
}
```

#### Screen Reader Support
```css
/* Screen reader only content */
.sr-only {
  @apply absolute w-px h-px p-0 -m-px overflow-hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only-focusable:focus {
  @apply static w-auto h-auto p-0 m-0 overflow-visible;
  clip: auto;
  white-space: normal;
}
```

#### Touch Target Sizes
All interactive elements meet minimum 44x44px touch target size:
```css
/* Touch-friendly interactive elements */
.touch-target {
  @apply min-h-[44px] min-w-[44px];
  @apply flex items-center justify-center;
}

/* Button minimum sizes */
button, .btn {
  @apply min-h-[44px] min-w-[44px];
}

/* Link minimum sizes */
a {
  @apply min-h-[44px];
  @apply inline-flex items-center;
}
```

#### Motion & Animation Preferences
```css
/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .pokeball-spin {
    animation: none;
  }
  
  .shimmer {
    animation: none;
  }
  
  .rarity-glow {
    animation: none;
  }
}
```

---

## Responsive Breakpoints

### Mobile-First Breakpoint System
```css
/* Tailwind responsive breakpoints */
:root {
  --screen-xs: 475px;  /* Extra small devices */
  --screen-sm: 640px;  /* Small devices (phones) */
  --screen-md: 768px;  /* Medium devices (tablets) */
  --screen-lg: 1024px; /* Large devices (desktops) */
  --screen-xl: 1280px; /* Extra large devices */
  --screen-2xl: 1536px; /* 2x extra large devices */
}
```

### Component Responsive Behavior
```css
/* Trading card responsive sizing */
.trading-card {
  /* Mobile: smaller cards for better fit */
  @apply w-48 h-72;
}

@media (min-width: 640px) {
  .trading-card {
    /* Tablet: medium size */
    @apply w-64 h-96;
  }
}

@media (min-width: 1024px) {
  .trading-card {
    /* Desktop: full size */
    @apply w-80 h-[480px];
  }
}

/* Collection grid responsive */
.collection-grid {
  @apply grid gap-4 p-4;
  /* Mobile: 2 columns */
  @apply grid-cols-2;
}

@media (min-width: 640px) {
  .collection-grid {
    /* Tablet: 3 columns */
    @apply grid-cols-3;
  }
}

@media (min-width: 768px) {
  .collection-grid {
    /* Desktop: 4+ columns */
    @apply grid-cols-4;
  }
}

@media (min-width: 1024px) {
  .collection-grid {
    @apply grid-cols-5;
  }
}

@media (min-width: 1280px) {
  .collection-grid {
    @apply grid-cols-6;
  }
}
```

### Typography Responsive Scaling
```css
/* Fluid typography */
.text-responsive-sm {
  font-size: clamp(0.875rem, 2vw, 1rem);
}

.text-responsive-base {
  font-size: clamp(1rem, 2.5vw, 1.125rem);
}

.text-responsive-lg {
  font-size: clamp(1.125rem, 3vw, 1.5rem);
}

.text-responsive-xl {
  font-size: clamp(1.25rem, 4vw, 2.25rem);
}

.text-responsive-2xl {
  font-size: clamp(1.5rem, 5vw, 3rem);
}
```

---

## Implementation Guide

### Getting Started

#### 1. Install Dependencies
```bash
npm install @tailwindcss/forms @tailwindcss/typography
npm install framer-motion lucide-react
npm install clsx tailwind-merge
```

#### 2. Update Tailwind Config
Copy the complete TailwindCSS configuration from the Design Tokens section above.

#### 3. Add Global Styles
Update your `globals.css` with the CSS custom properties and utility classes provided.

#### 4. Component Implementation Examples

##### Basic Wine Card Component:
```typescript
// components/WineCard.tsx
import { motion } from 'framer-motion';
import { Wine } from '@/types/wine';
import { cn } from '@/lib/utils';

interface WineCardProps {
  wine: Wine;
  rarity?: string;
  onClick?: () => void;
}

export function WineCard({ wine, rarity, onClick }: WineCardProps) {
  return (
    <motion.div
      className={cn(
        "wine-card",
        rarity && `card-${rarity.toLowerCase()}`,
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={cn(
            "rarity-badge",
            `rarity-badge-${rarity?.toLowerCase() || 'common'}`
          )}>
            {rarity || 'Common'}
          </span>
          <span className="text-xs text-gray-500">#{wine.id}</span>
        </div>
        
        <h3 className="text-lg font-bold mb-1">{wine.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{wine.year}</p>
        
        <div className="flex items-center gap-2 mb-3">
          <span className={cn(
            "type-badge",
            `type-badge-${wine.primaryType.toLowerCase()}`
          )}>
            {wine.primaryType}
          </span>
          {wine.secondaryType && (
            <span className={cn(
              "type-badge",
              `type-badge-${wine.secondaryType.toLowerCase()}`
            )}>
              {wine.secondaryType}
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-16">Region:</span>
            <span>{wine.region}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-16">Grape:</span>
            <span>{wine.grape}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
```

##### Type Badge Component:
```typescript
// components/TypeBadge.tsx
import { cn } from '@/lib/utils';
import { WineType } from '@/types/wine';

interface TypeBadgeProps {
  type: WineType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const typeConfig = {
  Terroir: { bg: 'bg-type-terroir-500', icon: '🏔️' },
  Varietal: { bg: 'bg-type-varietal-500', icon: '🍇' },
  Technique: { bg: 'bg-type-technique-500', icon: '⚗️' },
  Heritage: { bg: 'bg-type-heritage-500', icon: '🏛️' },
  Modern: { bg: 'bg-type-modern-500', icon: '🔬' },
  Mystical: { bg: 'bg-type-mystical-500', icon: '🌟' },
  Energy: { bg: 'bg-type-energy-500', icon: '⚡' },
  Flow: { bg: 'bg-type-flow-500', icon: '🌊' },
} as const;

export function TypeBadge({ type, size = 'md', className }: TypeBadgeProps) {
  const config = typeConfig[type];
  
  return (
    <span className={cn(
      'type-badge',
      config.bg,
      {
        'px-2 py-1 text-xs': size === 'sm',
        'px-3 py-1 text-sm': size === 'md',
        'px-4 py-2 text-base': size === 'lg',
      },
      className
    )}>
      <span className="mr-1">{config.icon}</span>
      {type}
    </span>
  );
}
```

##### Stat Bar Component:
```typescript
// components/StatBar.tsx
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatBarProps {
  label: string;
  value: number;
  maxValue?: number;
  type?: 'power' | 'elegance' | 'complexity' | 'longevity' | 'rarity' | 'terroir';
  animated?: boolean;
}

export function StatBar({ 
  label, 
  value, 
  maxValue = 100, 
  type = 'power',
  animated = true 
}: StatBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  return (
    <div className="stat-bar">
      <div className="stat-label">{label}</div>
      <div className="stat-bar-container">
        <motion.div
          className={cn('stat-bar-fill', `stat-${type}`)}
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
```

#### 5. Utility Function Updates
Update your existing `utils.ts` file to support the new type and rarity systems:

```typescript
// lib/utils.ts (additions)
export function getWineTypeColor(type: WineType): string {
  const typeColors = {
    Terroir: 'bg-type-terroir-500',
    Varietal: 'bg-type-varietal-500', 
    Technique: 'bg-type-technique-500',
    Heritage: 'bg-type-heritage-500',
    Modern: 'bg-type-modern-500',
    Mystical: 'bg-type-mystical-500',
    Energy: 'bg-type-energy-500',
    Flow: 'bg-type-flow-500',
  } as const;
  
  return typeColors[type] || 'bg-gray-500';
}

export function getRarityConfig(rarity: WineRarity) {
  const rarityConfigs = {
    // Common tier
    Everyday: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-600', glow: '' },
    Regional: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-600', glow: '' },
    Quality: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-600', glow: '' },
    
    // Uncommon tier
    Estate: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700', glow: 'shadow-rarity-uncommon' },
    Vintage: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700', glow: 'shadow-rarity-uncommon' },
    Reserve: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-700', glow: 'shadow-rarity-uncommon' },
    
    // Rare tier
    SingleVineyard: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700', glow: 'shadow-rarity-rare' },
    GrandCru: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700', glow: 'shadow-rarity-rare' },
    MasterSelection: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-700', glow: 'shadow-rarity-rare' },
    
    // Continue for other rarities...
  } as const;
  
  return rarityConfigs[rarity] || rarityConfigs.Everyday;
}

export function getTypeEffectiveness(attackType: WineType, defendType: WineType): number {
  // Implement your type effectiveness matrix
  const effectiveness: Record<WineType, Record<WineType, number>> = {
    // Your type effectiveness system from wine.ts
  };
  
  return effectiveness[attackType]?.[defendType] ?? 1;
}
```

### Performance Considerations

#### Optimization Tips
1. **Use CSS transforms** instead of changing layout properties
2. **Implement virtual scrolling** for large collections
3. **Lazy load images** and components
4. **Use React.memo** for expensive components
5. **Implement proper image optimization** with Next.js Image component

#### Example Virtual Scrolling Implementation
```typescript
// components/VirtualWineGrid.tsx
import { FixedSizeGrid as Grid } from 'react-window';
import { WineCard } from './WineCard';
import { Wine } from '@/types/wine';

interface VirtualWineGridProps {
  wines: Wine[];
  height: number;
  width: number;
}

export function VirtualWineGrid({ wines, height, width }: VirtualWineGridProps) {
  const columnCount = Math.floor(width / 280); // Card width + gap
  const rowCount = Math.ceil(wines.length / columnCount);
  
  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    const wine = wines[index];
    
    if (!wine) return null;
    
    return (
      <div style={style} className="p-2">
        <WineCard wine={wine} />
      </div>
    );
  };
  
  return (
    <Grid
      columnCount={columnCount}
      columnWidth={280}
      height={height}
      rowCount={rowCount}
      rowHeight={400}
      width={width}
    >
      {Cell}
    </Grid>
  );
}
```

---

## Conclusion

This comprehensive Design System provides:

✅ **Complete color system** with 8 wine types and 20+ rarity tiers
✅ **Pokemon-inspired UI patterns** with proper accessibility
✅ **Mobile-first responsive design** with touch-friendly interactions  
✅ **Performance-optimized animations** with reduced motion support
✅ **Type-safe component patterns** that integrate with your existing TypeScript types
✅ **Scalable design tokens** implemented in TailwindCSS
✅ **Professional wine credibility** balanced with engaging gameplay elements

The design system is ready for immediate implementation by your frontend developers and provides a solid foundation for your Wine Pokédex application's continued growth and evolution.

---

**Next Steps:**
1. Implement the TailwindCSS configuration
2. Add the global CSS styles
3. Create the base components (WineCard, TypeBadge, StatBar)
4. Build out the specialized components (TradingCard, EvolutionChain, Collection Grid)
5. Test accessibility compliance with screen readers and keyboard navigation
6. Optimize performance with virtual scrolling for large collections

This design system will ensure your Wine Pokédex maintains Pokemon's excitement while delivering serious wine education value to your users.