/** @type {import('tailwindcss').Config} */
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
          'technique': {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0f766e', // Primary
            700: '#134e4a', // Dark
            800: '#115e59',
            900: '#134e4a',
          },
          'heritage': {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706', // Primary
            700: '#92400e', // Dark
            800: '#78350f',
            900: '#451a03',
          },
          'modern': {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb', // Primary
            700: '#1e40af', // Dark
            800: '#1e3a8a',
            900: '#1e3a8a',
          },
          'mystical': {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',
            600: '#7c3aed', // Primary
            700: '#5b21b6', // Dark
            800: '#6b21a8',
            900: '#581c87',
          },
          'energy': {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626', // Primary
            700: '#b91c1c', // Dark
            800: '#991b1b',
            900: '#7f1d1d',
          },
          'flow': {
            50: '#ecfeff',
            100: '#cffafe',
            200: '#a5f3fc',
            300: '#67e8f9',
            400: '#22d3ee',
            500: '#06b6d4',
            600: '#0891b2', // Primary
            700: '#0e7490', // Dark
            800: '#155e75',
            900: '#164e63',
          },
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
          'rare': {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
          },
          'epic': {
            50: '#f3e8ff',
            100: '#e9d5ff',
            200: '#d8b4fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
          },
          'legendary': {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
          'mythical': {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
          },
          'divine': {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
        },
        
        // Effectiveness colors
        'effectiveness': {
          'super': '#22c55e',
          'effective': '#84cc16',
          'normal': '#6b7280',
          'weak': '#f97316',
          'immune': '#ef4444',
        },

        // Legacy colors for backward compatibility
        'pokedex-red': '#dc2626',
        'pokedex-blue': '#1d4ed8',
        'pokedex-yellow': '#facc15',
        'pokedex-green': '#16a34a',
        'pokedex-light-blue': '#38bdf8',
        'pokedex-dark-blue': '#1e40af',
        'wine-deep-red': '#722f37',
        'wine-burgundy': '#800020',
        'wine-gold': '#ffd700',
        'wine-rose': '#f4c2c2',
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
        'divine-pulse': 'divine-pulse 2s ease-in-out infinite',
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
        },
        'divine-pulse': {
          '0%, 100%': { 'box-shadow': '0 0 40px rgba(217, 119, 6, 0.8)' },
          '50%': { 'box-shadow': '0 0 60px rgba(217, 119, 6, 1)' }
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
      
      writingMode: {
        'vertical-rl': 'vertical-rl',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
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
        '.writing-vertical-rl': {
          'writing-mode': 'vertical-rl',
        },
        '.animate-sparkle': {
          animation: 'shiny-sparkle 1.5s ease-in-out infinite',
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