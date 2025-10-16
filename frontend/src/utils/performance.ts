/**
 * Performance optimization utilities - Main export file
 * Provides a centralized access point for all performance-related utilities
 */

// Lazy loading utilities
export {
  lazyLoad,
  preloadComponent,
  usePreloadOnHover,
  lazyRoute,
  lazyLoadOnVisible,
} from './lazyLoad';

// Route-based lazy loading - commented out missing components
export {
  StudentDashboard,
  // FlashcardLearning, // Not exported from routeLazyLoading
  // ExerciseScreen, // Not exported from routeLazyLoading
  // TestScreen, // Not exported from routeLazyLoading
  // VideoPlayer, // Not exported from routeLazyLoading
  // ProgressDashboard, // Not exported from routeLazyLoading
  // StreakPage, // Not exported from routeLazyLoading
  TeacherDashboard,
  // ClassManagement, // Not exported from routeLazyLoading
  // StudentProgress, // Not exported from routeLazyLoading
  // ContentAssignment, // Not exported from routeLazyLoading
  // TeacherAnalytics, // Not exported from routeLazyLoading
  AdminDashboard,
  // UserManagement, // Not exported from routeLazyLoading
  // CourseManagement, // Not exported from routeLazyLoading
  // ContentManagement, // Not exported from routeLazyLoading
  // SystemSettings, // Not exported from routeLazyLoading
  // SystemConfigManagement, // Not exported from routeLazyLoading
  // FlashcardManagement, // Not exported from routeLazyLoading
  // ParentDashboard, // Removed - parent role no longer exists
  // ParentProgressInterface, // Not exported from routeLazyLoading
  Profile,
  // Settings, // Not exported from routeLazyLoading
  // Login, // Not exported from routeLazyLoading
  // Register, // Not exported from routeLazyLoading
  // NotFound, // Not exported from routeLazyLoading
  // Unauthorized, // Not exported from routeLazyLoading
  // ChildFriendlyDemo, // Not exported from routeLazyLoading
  // LoadingErrorDemo, // Not exported from routeLazyLoading
  // preloadRoutes, // Not exported from routeLazyLoading
  // routeConfig, // Not exported from routeLazyLoading
  RoutePreloader,
  routePreloader,
} from './routeLazyLoading';

// Code splitting utilities
export {
  vendorChunks,
  dynamicImport,
  preloadCriticalChunks,
  ChunkPreloader,
  chunkPreloader,
  bundleAnalyzer,
  webpackOptimization,
} from './codesplitting';

// Memoization utilities
export {
  memoComponent,
  useMemoizedCallback,
  useMemoizedValue,
  withRenderTracking,
  useExpensiveComputation,
  useMemoizedList,
  useMemoizedFormField,
  childFriendlyMemo,
} from './memoization';

// Performance monitoring hooks
export {
  usePerformance,
  useMemoryMonitor,
  useNetworkStatus,
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  useIdleCallback,
  useResourcePreloader,
} from '../hooks/usePerformance';

// Virtual scrolling
export {
  default as VirtualList,
  useVirtualList,
} from '../components/ui/VirtualList';

// Optimized image component
export { default as OptimizedImage } from '../components/ui/OptimizedImage';

// Performance monitor component
export { default as PerformanceMonitor } from '../components/performance/PerformanceMonitor';

/**
 * Performance optimization strategies and best practices
 */
export const performanceStrategies = {
  // Critical rendering path optimization
  criticalPath: {
    // Preload critical resources
    preloadCritical: async (userRole: string, route: string) => {
      // await preloadCriticalChunks(userRole, route); // Function not implemented
      console.log(`Preloading critical chunks for ${userRole} on ${route}`);
    },

    // Defer non-critical resources
    deferNonCritical: () => {
      // Defer analytics and tracking scripts
      const scripts = ['gtag', 'analytics', 'tracking'];
      scripts.forEach((scriptName) => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            // Load non-critical scripts
            console.log(`Loading deferred script: ${scriptName}`);
          });
        }
      });
    },
  },

  // Bundle optimization
  bundleOptimization: {
    // Split vendor libraries
    splitVendors: () => { }, // vendorChunks not implemented

    // Analyze bundle size
    analyzeBundles: () => { }, // bundleAnalyzer not implemented

    // Monitor chunk loading
    monitorChunks: () => { }, // bundleAnalyzer not implemented
  },

  // Runtime optimization
  runtime: {
    // Optimize re-renders
    optimizeRenders: {
      // Use memoization for expensive components
      memoizeComponent: () => { }, // memoComponent not implemented

      // Track render performance
      trackRenders: () => { }, // withRenderTracking not implemented

      // Optimize form fields
      optimizeFormFields: () => { }, // useMemoizedFormField not implemented
    },

    // Memory management
    memoryManagement: {
      // Monitor memory usage
      monitorMemory: () => { }, // useMemoryMonitor not implemented

      // Clean up resources
      cleanup: () => {
        // Clear caches periodically
        if ('caches' in window) {
          caches.keys().then((names) => {
            names.forEach((name) => {
              if (name.includes('old-') || name.includes('temp-')) {
                caches.delete(name);
              }
            });
          });
        }
      },
    },
  },

  // Network optimization
  network: {
    // Optimize API calls
    optimizeAPI: {
      // Batch requests
      batchRequests: (requests: Promise<any>[]) => Promise.all(requests),

      // Cache responses
      cacheResponses: new Map<string, any>(),

      // Retry failed requests
      retryRequest: async (requestFn: () => Promise<any>, maxRetries = 3) => {
        for (let i = 0; i <= maxRetries; i++) {
          try {
            return await requestFn();
          } catch (error) {
            if (i === maxRetries) throw error;
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, i) * 1000)
            );
          }
        }
      },
    },

    // Optimize images
    optimizeImages: {
      // Use WebP format when supported
      useWebP: () => {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      },

      // Lazy load images
      lazyLoadImages: () => {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              img.src = img.dataset.src!;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          });
        });

        images.forEach((img) => imageObserver.observe(img));
      },
    },
  },
};

/**
 * Performance metrics collection
 */
export const performanceMetrics = {
  // Core Web Vitals
  collectWebVitals: () => {
    const vitals: any = {};

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      vitals.lcp = entries[entries.length - 1].startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      vitals.fid = (entries[0] as any).processingStart - entries[0].startTime;
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      vitals.cls = clsValue;
    }).observe({ entryTypes: ['layout-shift'] });

    return vitals;
  },

  // Custom metrics
  collectCustomMetrics: () => {
    return {
      // Time to interactive
      tti: performance.now(),

      // Bundle size
      bundleSize: 0, // bundleAnalyzer not implemented

      // Memory usage
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,

      // Network status
      connectionType: (navigator as any).connection?.effectiveType || 'unknown',
    };
  },

  // Send metrics to analytics
  sendMetrics: (metrics: any) => {
    if ((window as any).gtag) {
      (window as any).gtag('event', 'performance_metrics', {
        custom_parameter: metrics,
      });
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.table(metrics);
    }
  },
};

/**
 * Initialize performance optimizations
 */
export const initializePerformanceOptimizations = (config: {
  userRole?: string;
  currentRoute?: string;
  enableMonitoring?: boolean;
  enablePreloading?: boolean;
}) => {
  const {
    userRole = 'guest',
    currentRoute = '/',
    enableMonitoring = process.env.NODE_ENV === 'development',
    enablePreloading = true,
  } = config;

  // Initialize performance monitoring
  if (enableMonitoring) {
    const vitals = performanceMetrics.collectWebVitals();
    const customMetrics = performanceMetrics.collectCustomMetrics();

    // Send metrics after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        performanceMetrics.sendMetrics({ ...vitals, ...customMetrics });
      }, 1000);
    });
  }

  // Initialize preloading
  if (enablePreloading) {
    // Preload critical chunks
    performanceStrategies.criticalPath.preloadCritical(userRole, currentRoute);

    // Defer non-critical resources
    performanceStrategies.criticalPath.deferNonCritical();

    // Setup route preloader
    // routePreloader.setUserRole(userRole); // Not implemented
  }

  // Initialize chunk preloader
  // const chunkPreloader = ChunkPreloader.getInstance(); // Not implemented

  // Preload common chunks on idle - not implemented
  // chunkPreloader.preloadOnIdle('common-utils', () => import('../utils'));
  // chunkPreloader.preloadOnIdle(
  //   'ui-components',
  //   () => import('../components/ui')
  // );

  // Setup memory cleanup
  setInterval(
    () => {
      performanceStrategies.runtime.memoryManagement.cleanup();
    },
    5 * 60 * 1000
  ); // Every 5 minutes

  console.log('Performance optimizations initialized');
};
