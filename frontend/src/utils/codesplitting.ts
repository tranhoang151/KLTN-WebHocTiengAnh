/**
 * Code splitting utilities and strategies for optimal bundle loading
 */

// Vendor libraries that should be split into separate chunks
export const vendorChunks = {
  // React ecosystem
  react: ['react', 'react-dom', 'react-router-dom'],

  // Firebase
  firebase: [
    'firebase/app',
    'firebase/auth',
    'firebase/firestore',
    'firebase/storage',
    'firebase/analytics',
  ],

  // UI libraries
  ui: ['@headlessui/react', 'framer-motion', 'react-spring'],

  // Utilities
  utils: ['lodash', 'date-fns', 'uuid'],

  // Charts and visualization
  charts: ['recharts', 'chart.js', 'react-chartjs-2'],
};

/**
 * Dynamic import with retry logic and error handling
 */
export const dynamicImport = async <T>(
  importFn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      lastError = error as Error;

      if (i < retries) {
        console.warn(
          `Import failed, retrying in ${delay}ms... (${i + 1}/${retries})`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, i))
        );
      }
    }
  }

  throw lastError!;
};

/**
 * Preload critical chunks based on user role and route
 */
export const preloadCriticalChunks = async (
  userRole: string,
  currentRoute: string
) => {
  const criticalChunks: Promise<any>[] = [];

  // Always preload React and Firebase
  criticalChunks.push(
    dynamicImport(() => import('react')),
    dynamicImport(() => import('firebase/app'))
  );

  // Role-based chunk preloading
  switch (userRole) {
    case 'student':
      criticalChunks.push(
        dynamicImport(() => import('../components/learning/FlashcardLearning')),
        dynamicImport(() => import('../components/dashboards/StudentDashboard'))
      );
      break;

    case 'teacher':
      criticalChunks.push(
        dynamicImport(
          () => import('../components/dashboards/TeacherDashboard')
        ),
        dynamicImport(
          () => import('../components/progress/TeacherAnalyticsDashboard')
        )
      );
      break;

    case 'admin':
      criticalChunks.push(
        dynamicImport(() => import('../components/dashboards/AdminDashboard')),
        dynamicImport(() => import('../components/admin/UserManagement'))
      );
      break;
  }

  // Route-based chunk preloading
  if (currentRoute.includes('/flashcard')) {
    criticalChunks.push(
      dynamicImport(() => import('../components/learning/FlashcardLearning'))
    );
  }

  // Commented out missing components
  // if (currentRoute.includes('/exercise')) {
  //   criticalChunks.push(
  //     dynamicImport(() => import('../components/learning/ExerciseScreen'))
  //   );
  // }

  // if (currentRoute.includes('/progress')) {
  //   criticalChunks.push(
  //     dynamicImport(() => import('../components/progress/ProgressTracking'))
  //   );
  // }

  try {
    await Promise.all(criticalChunks);
    console.log('Critical chunks preloaded successfully');
  } catch (error) {
    console.warn('Some critical chunks failed to preload:', error);
  }
};

/**
 * Intelligent chunk loading based on user behavior
 */
export class ChunkPreloader {
  private static instance: ChunkPreloader;
  private loadedChunks = new Set<string>();
  private loadingChunks = new Map<string, Promise<any>>();

  static getInstance(): ChunkPreloader {
    if (!ChunkPreloader.instance) {
      ChunkPreloader.instance = new ChunkPreloader();
    }
    return ChunkPreloader.instance;
  }

  async loadChunk(
    chunkName: string,
    importFn: () => Promise<any>
  ): Promise<any> {
    // Return immediately if already loaded
    if (this.loadedChunks.has(chunkName)) {
      return Promise.resolve();
    }

    // Return existing promise if currently loading
    if (this.loadingChunks.has(chunkName)) {
      return this.loadingChunks.get(chunkName);
    }

    // Start loading the chunk
    const loadPromise = dynamicImport(importFn)
      .then((result) => {
        this.loadedChunks.add(chunkName);
        this.loadingChunks.delete(chunkName);
        return result;
      })
      .catch((error) => {
        this.loadingChunks.delete(chunkName);
        throw error;
      });

    this.loadingChunks.set(chunkName, loadPromise);
    return loadPromise;
  }

  preloadOnIdle(chunkName: string, importFn: () => Promise<any>) {
    if (this.loadedChunks.has(chunkName)) return;

    const preload = () => {
      this.loadChunk(chunkName, importFn).catch((error) => {
        console.warn(`Failed to preload chunk ${chunkName}:`, error);
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(preload, { timeout: 5000 });
    } else {
      setTimeout(preload, 100);
    }
  }

  preloadOnInteraction(chunkName: string, importFn: () => Promise<any>) {
    if (this.loadedChunks.has(chunkName)) return;

    const preload = () => {
      this.loadChunk(chunkName, importFn).catch((error) => {
        console.warn(`Failed to preload chunk ${chunkName}:`, error);
      });
    };

    // Preload on first user interaction
    const events = ['mousedown', 'touchstart', 'keydown'];
    const handleInteraction = () => {
      preload();
      events.forEach((event) => {
        document.removeEventListener(event, handleInteraction);
      });
    };

    events.forEach((event) => {
      document.addEventListener(event, handleInteraction, { once: true });
    });
  }

  getLoadedChunks(): string[] {
    return Array.from(this.loadedChunks);
  }

  getLoadingChunks(): string[] {
    return Array.from(this.loadingChunks.keys());
  }
}

/**
 * Bundle analysis utilities
 */
export const bundleAnalyzer = {
  // Analyze bundle size and performance
  analyzeBundleSize: () => {
    if (process.env.NODE_ENV === 'development') {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const totalSize = scripts.reduce((size, script) => {
        const src = (script as HTMLScriptElement).src;
        // This is a simplified analysis - in real scenarios you'd use webpack-bundle-analyzer
        return size + src.length * 8; // Rough estimate
      }, 0);

      console.log(`Estimated bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
      return totalSize;
    }
    return 0;
  },

  // Monitor chunk loading performance
  monitorChunkLoading: () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('chunk') || entry.name.includes('.js')) {
          console.log(
            `Chunk loaded: ${entry.name} in ${entry.duration.toFixed(2)}ms`
          );
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Performance observer not supported');
    }

    return observer;
  },
};

/**
 * Webpack chunk optimization configuration helper
 */
export const webpackOptimization = {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      // Vendor chunks
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
        name: 'react',
        chunks: 'all',
        priority: 20,
      },
      firebase: {
        test: /[\\/]node_modules[\\/]firebase[\\/]/,
        name: 'firebase',
        chunks: 'all',
        priority: 15,
      },
      ui: {
        test: /[\\/]node_modules[\\/](@headlessui|framer-motion|react-spring)[\\/]/,
        name: 'ui',
        chunks: 'all',
        priority: 10,
      },
      utils: {
        test: /[\\/]node_modules[\\/](lodash|date-fns|uuid)[\\/]/,
        name: 'utils',
        chunks: 'all',
        priority: 5,
      },
      // Default vendor chunk for other libraries
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendor',
        chunks: 'all',
        priority: 1,
      },
    },
  },
  runtimeChunk: {
    name: 'runtime',
  },
};

export const chunkPreloader = ChunkPreloader.getInstance();
