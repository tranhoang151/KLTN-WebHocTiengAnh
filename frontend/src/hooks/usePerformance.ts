import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Performance monitoring hook
 */
export const usePerformance = (componentName: string) => {
  const renderStartTime = useRef<number>(Date.now());
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    const endTime = Date.now();
    const duration = endTime - renderStartTime.current;
    setRenderTime(duration);

    // Log performance metrics
    if (duration > 100) {
      console.warn(`Slow render detected in ${componentName}: ${duration}ms`);
    }

    // Send to analytics if available
    if ((window as any).gtag) {
      (window as any).gtag('event', 'page_render_time', {
        component_name: componentName,
        render_time: duration,
      });
    }
  }, [componentName]);

  return { renderTime };
};

/**
 * Memory usage monitoring hook
 */
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        setMemoryInfo((performance as any).memory);
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
};

/**
 * Network status monitoring hook
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get connection type if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.effectiveType || 'unknown');

      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || 'unknown');
      };

      connection.addEventListener('change', handleConnectionChange);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionType };
};

/**
 * Debounced value hook for performance optimization
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttled callback hook
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef<number>(Date.now());

  return useCallback(
    ((...args: any[]) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Intersection observer hook for performance
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return { elementRef, isIntersecting, entry };
};

/**
 * Idle callback hook for non-critical tasks
 */
export const useIdleCallback = (callback: () => void, deps: any[] = []) => {
  useEffect(() => {
    const handleIdle = (deadline: IdleDeadline) => {
      if (deadline.timeRemaining() > 0) {
        callback();
      }
    };

    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(handleIdle);
      return () => cancelIdleCallback(id);
    } else {
      // Fallback for browsers without requestIdleCallback
      const timeout = setTimeout(callback, 0);
      return () => clearTimeout(timeout);
    }
  }, deps);
};

/**
 * Resource preloading hook
 */
export const useResourcePreloader = () => {
  const preloadedResources = useRef<Set<string>>(new Set());

  const preloadImage = useCallback((src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        preloadedResources.current.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadScript = useCallback((src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = () => {
        preloadedResources.current.add(src);
        resolve();
      };
      script.onerror = reject;
      script.src = src;
      document.head.appendChild(script);
    });
  }, []);

  const preloadCSS = useCallback((href: string): Promise<void> => {
    if (preloadedResources.current.has(href)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.onload = () => {
        preloadedResources.current.add(href);
        resolve();
      };
      link.onerror = reject;
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

  return {
    preloadImage,
    preloadScript,
    preloadCSS,
    isPreloaded: (src: string) => preloadedResources.current.has(src),
  };
};
