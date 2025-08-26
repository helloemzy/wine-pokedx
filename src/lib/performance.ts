/**
 * Performance Monitoring and Analytics for Wine Pokédex
 * Tracks Core Web Vitals, user interactions, and app performance
 */

// Performance metrics interface
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userId?: string;
}

interface CoreWebVitals {
  CLS?: number;  // Cumulative Layout Shift
  FCP?: number;  // First Contentful Paint
  FID?: number;  // First Input Delay
  LCP?: number;  // Largest Contentful Paint
  TTFB?: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private webVitals: CoreWebVitals = {};
  private observer: PerformanceObserver | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMonitoring();
    }
  }

  private initializeMonitoring() {
    // Monitor Core Web Vitals
    this.monitorWebVitals();
    
    // Monitor user interactions
    this.monitorInteractions();
    
    // Monitor resource loading
    this.monitorResources();
    
    // Monitor memory usage
    this.monitorMemory();
  }

  private monitorWebVitals() {
    // Use web-vitals library if available, otherwise implement basic monitoring
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Largest Contentful Paint
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            this.webVitals.LCP = entry.startTime;
            this.recordMetric('LCP', entry.startTime);
          }
        });
      });

      try {
        this.observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay
      const firstInputObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'first-input') {
            const fid = (entry as any).processingStart - entry.startTime;
            this.webVitals.FID = fid;
            this.recordMetric('FID', fid);
          }
        });
      });

      try {
        firstInputObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.webVitals.CLS = clsValue;
            this.recordMetric('CLS', clsValue);
          }
        });
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }

    // First Contentful Paint
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.webVitals.FCP = fcpEntry.startTime;
          this.recordMetric('FCP', fcpEntry.startTime);
        }
      });
    }
  }

  private monitorInteractions() {
    if (typeof window === 'undefined') return;

    // Wine-specific interactions
    const interactions = [
      'wine-card-flip',
      'wine-search',
      'wine-filter',
      'wine-rating',
      'wine-share',
      'scan-bottle',
      'trade-wine',
      'battle-start'
    ];

    interactions.forEach(interaction => {
      document.addEventListener(interaction, (event) => {
        const customEvent = event as CustomEvent;
        this.recordMetric(`interaction:${interaction}`, Date.now(), {
          data: customEvent.detail
        });
      });
    });

    // Generic click tracking with debouncing
    let clickTimeout: NodeJS.Timeout;
    document.addEventListener('click', (event) => {
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => {
        const target = event.target as HTMLElement;
        const component = target.closest('[data-component]')?.getAttribute('data-component');
        if (component) {
          this.recordMetric('click', Date.now(), { component });
        }
      }, 100);
    });
  }

  private monitorResources() {
    if (typeof window === 'undefined') return;

    // Monitor slow resources
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Flag slow resources (>2s)
          if (resourceEntry.duration > 2000) {
            this.recordMetric('slow-resource', resourceEntry.duration, {
              name: resourceEntry.name,
              type: resourceEntry.initiatorType
            });
          }
          
          // Track wine image loading performance
          if (resourceEntry.name.includes('wine') && resourceEntry.name.match(/\.(jpg|jpeg|png|webp)$/)) {
            this.recordMetric('wine-image-load', resourceEntry.duration);
          }
        }
      });
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Resource observer not supported');
    }
  }

  private monitorMemory() {
    if (typeof window === 'undefined') return;
    
    // Monitor memory usage every 30 seconds
    const memoryCheck = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.recordMetric('memory-used', memory.usedJSHeapSize / 1024 / 1024); // MB
        this.recordMetric('memory-total', memory.totalJSHeapSize / 1024 / 1024); // MB
        
        // Warn if memory usage is high (>100MB)
        if (memory.usedJSHeapSize > 100 * 1024 * 1024) {
          this.recordMetric('memory-warning', memory.usedJSHeapSize);
        }
      }
    };

    memoryCheck();
    setInterval(memoryCheck, 30000);
  }

  private recordMetric(name: string, value: number, metadata?: any) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.pathname : '',
      ...metadata
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log important metrics to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${name}:`, value, metadata);
    }

    // Send to analytics service (implement based on your needs)
    this.sendToAnalytics(metric);
  }

  private sendToAnalytics(metric: PerformanceMetric) {
    // Implement your analytics service integration here
    // Examples: Google Analytics, Mixpanel, Custom API
    
    if (process.env.NODE_ENV === 'production') {
      // Batch metrics and send periodically to avoid overwhelming the server
      // This is a placeholder - implement according to your analytics service
    }
  }

  // Public API for custom metrics
  public trackCustomMetric(name: string, value: number, metadata?: any) {
    this.recordMetric(`custom:${name}`, value, metadata);
  }

  public trackWineInteraction(action: string, wineId: string, duration?: number) {
    this.recordMetric(`wine:${action}`, duration || Date.now(), { wineId });
  }

  public trackPageLoad(page: string) {
    if (typeof window !== 'undefined') {
      const loadTime = performance.now();
      this.recordMetric('page-load', loadTime, { page });
    }
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getWebVitals(): CoreWebVitals {
    return { ...this.webVitals };
  }

  public getPerformanceScore(): number {
    const vitals = this.webVitals;
    let score = 100;

    // Scoring based on Core Web Vitals thresholds
    if (vitals.LCP && vitals.LCP > 2500) score -= 25;
    if (vitals.FID && vitals.FID > 100) score -= 25;
    if (vitals.CLS && vitals.CLS > 0.1) score -= 25;
    if (vitals.FCP && vitals.FCP > 1800) score -= 25;

    return Math.max(0, score);
  }

  // Generate performance report
  public generateReport() {
    const vitals = this.getWebVitals();
    const score = this.getPerformanceScore();
    const recentMetrics = this.metrics.slice(-100);

    return {
      score,
      coreWebVitals: vitals,
      recentMetrics,
      recommendations: this.generateRecommendations()
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const vitals = this.webVitals;

    if (vitals.LCP && vitals.LCP > 2500) {
      recommendations.push('Optimize images and lazy loading to improve LCP');
    }
    if (vitals.FID && vitals.FID > 100) {
      recommendations.push('Reduce JavaScript execution time to improve FID');
    }
    if (vitals.CLS && vitals.CLS > 0.1) {
      recommendations.push('Set explicit dimensions for images and dynamic content');
    }

    const memoryWarnings = this.metrics.filter(m => m.name === 'memory-warning').length;
    if (memoryWarnings > 3) {
      recommendations.push('Memory usage is high - consider implementing cleanup strategies');
    }

    return recommendations;
  }

  public cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Custom hook for React components
export function usePerformanceMonitor() {
  return {
    trackMetric: performanceMonitor.trackCustomMetric.bind(performanceMonitor),
    trackWineInteraction: performanceMonitor.trackWineInteraction.bind(performanceMonitor),
    trackPageLoad: performanceMonitor.trackPageLoad.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getWebVitals: performanceMonitor.getWebVitals.bind(performanceMonitor),
    getScore: performanceMonitor.getPerformanceScore.bind(performanceMonitor),
    generateReport: performanceMonitor.generateReport.bind(performanceMonitor)
  };
}

// Helper to track component render times
export function withPerformanceTracking<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: T) {
    const startTime = performance.now();

    // Track mount time
    React.useEffect(() => {
      const mountTime = performance.now() - startTime;
      performanceMonitor.trackCustomMetric(`component-mount:${componentName}`, mountTime);
    }, []);

    return React.createElement(Component, props);
  };
}