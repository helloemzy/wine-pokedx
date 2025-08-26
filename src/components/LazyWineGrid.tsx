'use client';

import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import type { Wine } from '@/types/wine';

// Lazy load wine components
const WineCard = lazy(() => import('./WineCard'));
const WineTradingCard = lazy(() => import('./WineTradingCard'));

interface LazyWineGridProps {
  wines: Wine[];
  viewMode: 'grid' | 'list' | 'cards';
  onCardFlip?: (wineId: number) => void;
  onFavorite?: (wineId: number) => void;
  onShare?: (wine: Wine) => void;
  onRate?: (wineId: number, rating: number) => void;
  flippedCards?: Set<number>;
  favorites?: Set<number>;
  className?: string;
}

const ItemSkeleton = ({ viewMode }: { viewMode: string }) => (
  <div className={`animate-pulse ${
    viewMode === 'cards' ? 'aspect-[3/4] bg-white/10 rounded-xl' :
    viewMode === 'grid' ? 'h-48 bg-white/10 rounded-lg' : 
    'h-20 bg-white/10 rounded-lg'
  }`}>
    <div className="p-4 space-y-2">
      <div className="h-4 bg-white/20 rounded w-3/4"></div>
      <div className="h-3 bg-white/20 rounded w-1/2"></div>
    </div>
  </div>
);

export default function LazyWineGrid({
  wines,
  viewMode,
  onCardFlip,
  onFavorite,
  onShare,
  onRate,
  flippedCards = new Set(),
  favorites = new Set(),
  className = '',
}: LazyWineGridProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate item height based on view mode
  const itemHeight = useMemo(() => {
    switch (viewMode) {
      case 'cards': return 400; // Trading card height
      case 'grid': return 200;  // Grid card height
      case 'list': return 80;   // List item height
      default: return 200;
    }
  }, [viewMode]);

  // Virtual scrolling for performance
  const {
    containerRef,
    virtualItems,
    totalHeight,
    scrollToItem,
    isScrolling,
  } = useVirtualScroll(wines, {
    itemHeight,
    containerHeight: 600,
    overscan: viewMode === 'cards' ? 2 : 5, // Fewer overscan items for heavy cards
  });

  // Grid layout classes
  const gridClasses = useMemo(() => {
    const base = className || '';
    switch (viewMode) {
      case 'cards': return `${base} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8`;
      case 'grid': return `${base} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`;
      case 'list': return `${base} space-y-4`;
      default: return base;
    }
  }, [viewMode, className]);

  // Don't render on server to avoid hydration issues
  if (!isClient) {
    return (
      <div className={gridClasses}>
        {wines.slice(0, 8).map((_, index) => (
          <ItemSkeleton key={index} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  // For small collections, render normally
  if (wines.length <= 20) {
    return (
      <div className={gridClasses}>
        {wines.map((wine, index) => (
          <div key={wine.id} className="relative">
            <Suspense fallback={<ItemSkeleton viewMode={viewMode} />}>
              {viewMode === 'cards' ? (
                <WineTradingCard
                  wine={wine}
                  isFlipped={flippedCards.has(wine.id)}
                  onFlip={onCardFlip ? () => onCardFlip(wine.id) : undefined}
                  onFavorite={onFavorite ? () => onFavorite(wine.id) : undefined}
                  onShare={onShare ? () => onShare(wine) : undefined}
                  onRate={onRate ? (rating) => onRate(wine.id, rating) : undefined}
                  isFavorite={favorites.has(wine.id)}
                  isInteractive={true}
                  size="medium"
                />
              ) : (
                <WineCard wine={wine} viewMode={viewMode} />
              )}
            </Suspense>
          </div>
        ))}
      </div>
    );
  }

  // Virtual scrolling for large collections
  return (
    <div className="relative">
      {/* Scroll indicator */}
      {isScrolling && (
        <div className="fixed top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-50">
          Scrolling...
        </div>
      )}

      <div
        ref={containerRef}
        className="h-[600px] overflow-auto"
        style={{
          contain: 'strict',
        }}
      >
        <div
          style={{
            height: `${totalHeight}px`,
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const wine = wines[virtualItem.index];
            if (!wine) return null;

            return (
              <div
                key={`${wine.id}-${virtualItem.index}`}
                style={{
                  position: 'absolute',
                  top: `${virtualItem.offsetTop}px`,
                  left: 0,
                  right: 0,
                  height: `${virtualItem.height}px`,
                }}
              >
                <Suspense fallback={<ItemSkeleton viewMode={viewMode} />}>
                  {viewMode === 'cards' ? (
                    <WineTradingCard
                      wine={wine}
                      isFlipped={flippedCards.has(wine.id)}
                      onFlip={onCardFlip ? () => onCardFlip(wine.id) : undefined}
                      onFavorite={onFavorite ? () => onFavorite(wine.id) : undefined}
                      onShare={onShare ? () => onShare(wine) : undefined}
                      onRate={onRate ? (rating) => onRate(wine.id, rating) : undefined}
                      isFavorite={favorites.has(wine.id)}
                      isInteractive={true}
                      size="medium"
                    />
                  ) : (
                    <WineCard wine={wine} viewMode={viewMode} />
                  )}
                </Suspense>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick scroll controls */}
      {wines.length > 50 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => scrollToItem(0)}
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Top
          </button>
          <button
            onClick={() => scrollToItem(Math.floor(wines.length / 2))}
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Middle
          </button>
          <button
            onClick={() => scrollToItem(wines.length - 1)}
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Bottom
          </button>
        </div>
      )}
    </div>
  );
}