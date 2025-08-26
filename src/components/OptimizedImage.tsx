'use client';

import { useState, useRef, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  lazy?: boolean;
  quality?: number;
  blurDataURL?: string;
  onLoadComplete?: () => void;
  onLoadError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/wine-bottle-placeholder.webp',
  lazy = true,
  quality = 75,
  blurDataURL,
  onLoadComplete,
  onLoadError,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(src as string);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
    onLoadComplete?.();
  };

  const handleError = () => {
    setIsError(true);
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    } else {
      onLoadError?.();
    }
  };

  // Generate optimized blur placeholder
  const generateBlurDataURL = (width: number = 8, height: number = 8) => {
    if (blurDataURL) return blurDataURL;
    
    // Simple solid color blur data URL
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Wine-themed gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#7c2d12'); // Brown-800
      gradient.addColorStop(1, '#dc2626'); // Red-600
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      return canvas.toDataURL();
    }
    
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciPjxzdG9wIHN0b3AtY29sb3I9IiM3YzJkMTIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNkYzI2MjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+';
  };

  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}
        style={{ width: props.width, height: props.height }}
      >
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Loading skeleton */}
      {!isLoaded && !isError && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-amber-100 to-red-100 animate-pulse flex items-center justify-center"
          style={{ width: props.width, height: props.height }}
        >
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error state */}
      {isError && imageSrc === fallbackSrc && (
        <div
          className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400"
          style={{ width: props.width, height: props.height }}
        >
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
      )}

      {/* Actual image */}
      <Image
        {...props}
        src={imageSrc}
        alt={alt}
        quality={quality}
        onLoad={handleLoad}
        onError={handleError}
        placeholder="blur"
        blurDataURL={generateBlurDataURL()}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        sizes={
          props.sizes ||
          '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
        }
        priority={!lazy}
      />

      {/* Success indicator for loaded state */}
      {isLoaded && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
}