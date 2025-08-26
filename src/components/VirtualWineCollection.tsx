'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WineTradingCard from './WineTradingCard';
import WineCard from './WineCard';
import { useVirtualScroll, useLazyLoading, useImageLazyLoad, usePerformanceMonitor } from '@/hooks/useVirtualScroll';
import type { Wine } from '@/types/wine';

interface VirtualWineCollectionProps {
  wines: Wine[];
  viewMode: 'grid' | 'list' | 'cards';
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isLoading?: boolean;
  onCardFlip?: (wineId: number) => void;
  onFavorite?: (wineId: number) => void;
  onShare?: (wine: Wine) => void;
  onRate?: (wineId: number, rating: number) => void;
  favorites?: Set<number>;
  flippedCards?: Set<number>;
  className?: string;
}

// Memoized wine card component to prevent unnecessary re-renders
const MemoizedWineCard = memo(function MemoizedWineCard({
  wine,
  viewMode,
  style,
  ...props
}: {
  wine: Wine;
  viewMode: 'grid' | 'list' | 'cards';
  style: React.CSSProperties;
  onCardFlip?: (wineId: number) => void;
  onFavorite?: (wineId: number) => void;
  onShare?: (wine: Wine) => void;
  onRate?: (wineId: number, rating: number) => void;
  isFavorite?: boolean;
  isFlipped?: boolean;
}) {
  const { registerImage } = useImageLazyLoad();

  if (viewMode === 'cards') {
    return (
      <div style={style} className="px-2">
        <WineTradingCard
          wine={wine}
          isFlipped={props.isFlipped}
          onFlip={() => props.onCardFlip?.(wine.id)}
          onFavorite={() => props.onFavorite?.(wine.id)}
          onShare={() => props.onShare?.(wine)}
          onRate={(rating) => props.onRate?.(wine.id, rating)}
          isFavorite={props.isFavorite}
          isInteractive={true}
          size="medium"
        />
      </div>
    );
  }

  return (
    <div style={style} className="px-2">
      <WineCard wine={wine} viewMode={viewMode} />
    </div>
  );
});

export default function VirtualWineCollection({
  wines,
  viewMode,
  onLoadMore,
  hasNextPage = false,
  isLoading = false,
  onCardFlip,
  onFavorite,
  onShare,
  onRate,
  favorites = new Set(),
  flippedCards = new Set(),
  className = '',
}: VirtualWineCollectionProps) {
  const [containerHeight, setContainerHeight] = useState(600);
  const { metrics } = usePerformanceMonitor();

  // Calculate item height based on view mode
  const itemHeight = useMemo(() => {
    switch (viewMode) {
      case 'cards':
        return 420; // Height for trading cards with padding
      case 'grid':
        return 300; // Height for grid items
      case 'list':
        return 120; // Height for list items
      default:
        return 300;
    }
  }, [viewMode]);

  // Configure virtual scrolling
  const {
    virtualItems,
    totalHeight,
    isScrolling,
    scrollElementRef,
    handleScroll,
    scrollToItem,
    visibleRange,
  } = useVirtualScroll(wines, {
    itemHeight,
    containerHeight,
    overscan: 5,
  });

  // Configure lazy loading for infinite scroll
  const { sentinelRef } = useLazyLoading(wines, onLoadMore || (() => {}), {
    hasNextPage,
    isLoading,
    rootMargin: '200px',
  });

  // Memoize grid configuration
  const gridConfig = useMemo(() => {
    switch (viewMode) {
      case 'cards':
        return {
          columns: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          gap: 'gap-6',
        };
      case 'grid':
        return {
          columns: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
          gap: 'gap-4',
        };
      case 'list':
        return {
          columns: 'grid-cols-1',
          gap: 'gap-2',
        };
      default:
        return {
          columns: 'grid-cols-1',
          gap: 'gap-4',
        };
    }
  }, [viewMode]);

  // Handle container resize
  const handleContainerRef = useCallback((element: HTMLDivElement | null) => {
    if (element) {
      scrollElementRef.current = element;
      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        setContainerHeight(entry.contentRect.height);
      });
      resizeObserver.observe(element);
      
      return () => resizeObserver.disconnect();
    }
  }, [scrollElementRef]);

  // Performance optimization: Only render visible items
  const renderVirtualItem = useCallback((virtualItem: any) => (
    <MemoizedWineCard
      key={`wine-${virtualItem.data.id}`}
      wine={virtualItem.data}
      viewMode={viewMode}
      style={virtualItem.style}
      onCardFlip={onCardFlip}
      onFavorite={onFavorite}
      onShare={onShare}
      onRate={onRate}
      isFavorite={favorites.has(virtualItem.data.id)}
      isFlipped={flippedCards.has(virtualItem.data.id)}
    />
  ), [viewMode, onCardFlip, onFavorite, onShare, onRate, favorites, flippedCards]);

  if (wines.length === 0) {
    return (
      <div className={`text-center py-20 ${className}`}>
        <div className="text-6xl mb-6">🍷</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Wines Found</h2>
        <p className="text-gray-600">Your collection is waiting to be filled!</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Performance metrics (dev mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 bg-black/80 text-white p-2 rounded text-xs z-50">
          <div>FPS: {metrics.fps}</div>
          <div>Memory: {metrics.memoryUsage.toFixed(1)}MB</div>
          <div>Render: {metrics.renderTime.toFixed(2)}ms</div>
          <div>Visible: {visibleRange.start}-{visibleRange.end}</div>
        </div>
      )}

      {/* Virtual scroll container */}
      <div
        ref={handleContainerRef}
        className="relative overflow-auto h-[70vh] scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200"
        onScroll={handleScroll}
        style={{
          contain: 'strict',
        }}
      >
        {/* Virtual container with total height */}
        <div
          className="relative"
          style={{
            height: totalHeight,
            contain: 'layout',
          }}
        >
          {/* Render only visible items */}
          <AnimatePresence mode="popLayout">
            {virtualItems.map((virtualItem) => (
              <motion.div
                key={`virtual-${virtualItem.index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  duration: 0.2,
                  delay: Math.min(virtualItem.index * 0.02, 0.1),
                }}
                style={{
                  ...virtualItem.style,
                  willChange: isScrolling ? 'transform' : 'auto',
                }}
              >
                {renderVirtualItem(virtualItem)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Loading indicator at the bottom */}
        {hasNextPage && (
          <div
            ref={sentinelRef}
            className="h-20 flex items-center justify-center"
          >
            {isLoading ? (
              <motion.div
                className="flex items-center gap-2 text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="w-4 h-4 bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: 0,
                  }}
                />
                <motion.div
                  className="w-4 h-4 bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: 0.2,
                  }}
                />
                <motion.div
                  className="w-4 h-4 bg-blue-500 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: 0.4,
                  }}
                />
                <span className="ml-2">Loading more wines...</span>
              </motion.div>
            ) : (
              <button
                onClick={onLoadMore}
                className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                Load More Wines
              </button>
            )}
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute right-2 top-4 bottom-4 w-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="w-full bg-blue-500 rounded-full"
          style={{
            height: `${Math.min(100, (containerHeight / totalHeight) * 100)}%`,
            top: `${(visibleRange.start * itemHeight / totalHeight) * 100}%`,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        />
      </div>

      {/* Quick jump to top button */}
      <AnimatePresence>
        {visibleRange.start > 10 && (
          <motion.button
            className="fixed bottom-24 right-4 w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center z-40"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scrollToItem(0)}
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}