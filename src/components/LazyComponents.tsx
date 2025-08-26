/**
 * Lazy Loading Components
 * Implements code splitting for better performance
 */

import dynamic from 'next/dynamic'
import { ComponentType, Suspense, ReactNode } from 'react'

// Loading fallback component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
)

const LoadingCard = () => (
  <div className="bg-gray-100 rounded-lg animate-pulse h-48 w-full"></div>
)

const LoadingGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <LoadingCard key={i} />
    ))}
  </div>
)

// Lazy loading wrapper with error boundary
const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  fallback?: ReactNode
) => {
  const LazyComponent = dynamic(() => Promise.resolve(Component), {
    loading: () => <>{fallback || <LoadingSpinner />}</>,
    ssr: false, // Disable SSR for lazy components to improve initial load
  })

  return LazyComponent
}

// Core wine components - lazy loaded
export const LazyWineTradingCard = dynamic(
  () => import('./WineTradingCard').then(mod => ({ default: mod.WineTradingCard })),
  {
    loading: () => <LoadingCard />,
    ssr: false,
  }
)

export const LazyWineCard = dynamic(
  () => import('./WineCard').then(mod => ({ default: mod.WineCard })),
  {
    loading: () => <LoadingCard />,
    ssr: true, // Keep SSR for wine cards as they're core content
  }
)

export const LazyWineGrid = dynamic(
  () => import('./LazyWineGrid'),
  {
    loading: () => <LoadingGrid />,
    ssr: true,
  }
)

// Search and filter - lazy loaded (not immediately visible)
export const LazyWineSearchAndFilter = dynamic(
  () => import('./WineSearchAndFilter'),
  {
    loading: () => (
      <div className="bg-gray-100 rounded-lg animate-pulse h-16 w-full mb-4"></div>
    ),
    ssr: false,
  }
)

// Scan modal - lazy loaded (only loaded when needed)
export const LazyScanModal = dynamic(
  () => import('./ScanModal'),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <LoadingSpinner />
        </div>
      </div>
    ),
    ssr: false,
  }
)

// Enhanced camera - lazy loaded (only when scanning)
export const LazyEnhancedCamera = dynamic(
  () => import('./EnhancedCamera'),
  {
    loading: () => (
      <div className="bg-gray-900 rounded-lg flex items-center justify-center h-64">
        <LoadingSpinner />
        <span className="ml-2 text-white">Loading Camera...</span>
      </div>
    ),
    ssr: false,
  }
)

// WSET form - lazy loaded (advanced feature)
export const LazyWSETTastingForm = dynamic(
  () => import('./WSETTastingForm'),
  {
    loading: () => (
      <div className="bg-gray-100 rounded-lg animate-pulse h-96 w-full"></div>
    ),
    ssr: false,
  }
)

// Trading interface - lazy loaded (advanced feature)
export const LazyTradingInterface = dynamic(
  () => import('./TradingInterface'),
  {
    loading: () => (
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg animate-pulse h-64 w-full"></div>
    ),
    ssr: false,
  }
)

// Battle interface - lazy loaded (advanced feature)
export const LazyBattleInterface = dynamic(
  () => import('./BattleInterface'),
  {
    loading: () => (
      <div className="bg-gradient-to-r from-red-100 to-orange-100 rounded-lg animate-pulse h-64 w-full"></div>
    ),
    ssr: false,
  }
)

// Guild interface - lazy loaded (advanced feature)
export const LazyGuildInterface = dynamic(
  () => import('./GuildInterface'),
  {
    loading: () => (
      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg animate-pulse h-64 w-full"></div>
    ),
    ssr: false,
  }
)

// UI components - conditionally lazy loaded
export const LazyTypeEffectiveness = dynamic(
  () => import('./ui/TypeEffectiveness'),
  {
    loading: () => (
      <div className="bg-gray-100 rounded-lg animate-pulse h-32 w-full"></div>
    ),
    ssr: false,
  }
)

export const LazyEvolutionChain = dynamic(
  () => import('./ui/EvolutionChain'),
  {
    loading: () => (
      <div className="bg-gray-100 rounded-lg animate-pulse h-24 w-full"></div>
    ),
    ssr: false,
  }
)

// Virtual scrolling component - lazy loaded for large collections
export const LazyVirtualWineCollection = dynamic(
  () => import('./VirtualWineCollection'),
  {
    loading: () => <LoadingGrid />,
    ssr: false,
  }
)

// Mobile-specific components
export const LazyMobileLayout = dynamic(
  () => import('./MobileLayout'),
  {
    loading: () => <LoadingSpinner />,
    ssr: true, // Keep SSR for layout
  }
)

export const LazyMobileNavigation = dynamic(
  () => import('./MobileNavigation'),
  {
    loading: () => (
      <div className="bg-gray-100 animate-pulse h-16 w-full fixed bottom-0"></div>
    ),
    ssr: true,
  }
)

// Optimized image component
export const LazyOptimizedImage = dynamic(
  () => import('./OptimizedImage'),
  {
    loading: () => (
      <div className="bg-gray-200 animate-pulse rounded-lg w-full h-full"></div>
    ),
    ssr: true,
  }
)

// Export the wrapper for custom components
export { withLazyLoading }

// Pre-load critical components on interaction
export const preloadCriticalComponents = () => {
  // Pre-load components likely to be needed soon
  import('./WineTradingCard')
  import('./ScanModal')
  import('./WineSearchAndFilter')
}

// Pre-load advanced components on demand
export const preloadAdvancedComponents = () => {
  import('./TradingInterface')
  import('./BattleInterface')
  import('./GuildInterface')
  import('./WSETTastingForm')
}

// Component priority loading based on user interaction
export const preloadByPriority = (priority: 'immediate' | 'high' | 'low') => {
  switch (priority) {
    case 'immediate':
      // Load components needed for core functionality
      import('./WineCard')
      import('./LazyWineGrid')
      break
    case 'high':
      // Load components for enhanced experience
      import('./WineTradingCard')
      import('./WineSearchAndFilter')
      import('./ScanModal')
      break
    case 'low':
      // Load advanced features
      import('./TradingInterface')
      import('./BattleInterface')
      import('./GuildInterface')
      import('./WSETTastingForm')
      break
  }
}