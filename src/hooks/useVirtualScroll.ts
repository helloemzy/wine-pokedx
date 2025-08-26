'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight?: number;
  overscan?: number;
  scrollThreshold?: number;
}

interface VirtualScrollItem<T> {
  index: number;
  style: React.CSSProperties;
  data: T;
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
) {
  const {
    itemHeight,
    containerHeight = 600,
    overscan = 5,
    scrollThreshold = 100 // Currently unused but may be needed for future scroll optimizations
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const scrollTimeout = useRef<NodeJS.Timeout>();

  // Calculate which items should be visible
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(items.length - 1, endIndex + overscan),
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Get visible items with positioning
  const virtualItems: VirtualScrollItem<T>[] = useMemo(() => {
    const result: VirtualScrollItem<T>[] = [];
    
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      result.push({
        index: i,
        style: {
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        },
        data: items[i],
      });
    }

    return result;
  }, [visibleRange, itemHeight, items]);

  // Total height for scrollbar
  const totalHeight = items.length * itemHeight;

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    // Set scrolling to false after scroll stops
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  // Scroll to specific item
  const scrollToItem = useCallback(
    (index: number, align: 'start' | 'center' | 'end' = 'start') => {
      if (!scrollElementRef.current) return;

      let targetScrollTop: number;

      switch (align) {
        case 'start':
          targetScrollTop = index * itemHeight;
          break;
        case 'center':
          targetScrollTop = index * itemHeight - containerHeight / 2 + itemHeight / 2;
          break;
        case 'end':
          targetScrollTop = index * itemHeight - containerHeight + itemHeight;
          break;
      }

      scrollElementRef.current.scrollTo({
        top: Math.max(0, Math.min(targetScrollTop, totalHeight - containerHeight)),
        behavior: 'smooth',
      });
    },
    [itemHeight, containerHeight, totalHeight]
  );

  // Scroll to specific offset
  const scrollToOffset = useCallback((offset: number) => {
    if (!scrollElementRef.current) return;

    scrollElementRef.current.scrollTo({
      top: Math.max(0, Math.min(offset, totalHeight - containerHeight)),
      behavior: 'smooth',
    });
  }, [totalHeight, containerHeight]);

  return {
    virtualItems,
    totalHeight,
    isScrolling,
    scrollElementRef,
    handleScroll,
    scrollToItem,
    scrollToOffset,
    visibleRange,
  };
}

// Hook for intersection observer-based lazy loading
export function useLazyLoading<T>(
  items: T[],
  loadMore: () => void,
  options: {
    threshold?: number;
    rootMargin?: string;
    hasNextPage?: boolean;
    isLoading?: boolean;
  } = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    hasNextPage = true,
    isLoading = false
  } = options;

  const [sentinelRef, setSentinelRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!sentinelRef || !hasNextPage || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(sentinelRef);

    return () => {
      observer.disconnect();
    };
  }, [sentinelRef, hasNextPage, isLoading, loadMore, threshold, rootMargin]);

  return { sentinelRef: setSentinelRef };
}

// Hook for image lazy loading with intersection observer
export function useImageLazyLoad() {
  const [imageRefs, setImageRefs] = useState<Map<string, HTMLImageElement>>(new Map());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const registerImage = useCallback((id: string, element: HTMLImageElement | null) => {
    if (element) {
      setImageRefs(prev => new Map(prev.set(id, element)));
    } else {
      setImageRefs(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    }
  }, []);

  useEffect(() => {
    if (imageRefs.size === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src && !img.src) {
              // Load the actual image
              const imageLoader = new Image();
              imageLoader.onload = () => {
                img.src = src;
                img.classList.remove('opacity-0');
                img.classList.add('opacity-100');
                setLoadedImages(prev => new Set(prev).add(src));
              };
              imageLoader.onerror = () => {
                // Handle error - maybe set a fallback image
                img.classList.add('opacity-50');
              };
              imageLoader.src = src;

              observer.unobserve(img);
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    imageRefs.forEach(img => {
      observer.observe(img);
    });

    return () => {
      observer.disconnect();
    };
  }, [imageRefs]);

  return {
    registerImage,
    loadedImages,
  };
}

// Hook for performance monitoring
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationId = useRef<number>();

  const measureFPS = useCallback(() => {
    const currentTime = performance.now();
    frameCount.current++;

    if (currentTime >= lastTime.current + 1000) {
      const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
      
      setMetrics(prev => ({
        ...prev,
        fps,
        memoryUsage: (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize / 1024 / 1024 || 0,
      }));

      frameCount.current = 0;
      lastTime.current = currentTime;
    }

    animationId.current = requestAnimationFrame(measureFPS);
  }, []);

  useEffect(() => {
    animationId.current = requestAnimationFrame(measureFPS);

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [measureFPS]);

  const measureRenderTime = useCallback(<T extends unknown[]>(
    renderFunction: (...args: T) => React.ReactNode
  ) => {
    return (...args: T) => {
      const startTime = performance.now();
      const result = renderFunction(...args);
      const endTime = performance.now();
      
      setMetrics(prev => ({
        ...prev,
        renderTime: endTime - startTime,
      }));

      return result;
    };
  }, []);

  return {
    metrics,
    measureRenderTime,
  };
}