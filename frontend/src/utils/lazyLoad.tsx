import React, { Suspense, ComponentType } from 'react';
import { LoadingSpinner } from '../components/ui';

interface LazyLoadOptions {
  fallback?: React.ComponentType;
  delay?: number;
  retryAttempts?: number;
}

/**
 * Enhanced lazy loading utility with error boundaries and retry logic
 */
export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): React.ComponentType<React.ComponentProps<T>> => {
  const { fallback: CustomFallback, delay = 0, retryAttempts = 3 } = options;

  // Create lazy component with retry logic
  const LazyComponent = React.lazy(() => {
    let retryCount = 0;

    const loadWithRetry = async (): Promise<{ default: T }> => {
      try {
        // Add artificial delay if specified (useful for testing)
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        return await importFunc();
      } catch (error) {
        retryCount++;

        if (retryCount <= retryAttempts) {
          console.warn(
            `Failed to load component, retrying... (${retryCount}/${retryAttempts})`
          );
          // Exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
          return loadWithRetry();
        }

        throw error;
      }
    };

    return loadWithRetry();
  });

  // Default fallback component
  const DefaultFallback = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
      }}
    >
      <LoadingSpinner size="large" message="Loading page..." />
    </div>
  );

  const FallbackComponent = CustomFallback || DefaultFallback;

  // Return wrapped component with Suspense and error boundary
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
    <Suspense fallback={<FallbackComponent />}>
      <LazyComponent {...(props as any)} ref={ref} />
    </Suspense>
  ));
};

/**
 * Preload a lazy component
 */
export const preloadComponent = (importFunc: () => Promise<any>) => {
  const componentImport = importFunc();
  return componentImport;
};

/**
 * Hook for preloading components on hover or focus
 */
export const usePreloadOnHover = (importFunc: () => Promise<any>) => {
  const [isPreloaded, setIsPreloaded] = React.useState(false);

  const preload = React.useCallback(() => {
    if (!isPreloaded) {
      preloadComponent(importFunc);
      setIsPreloaded(true);
    }
  }, [importFunc, isPreloaded]);

  return {
    onMouseEnter: preload,
    onFocus: preload,
  };
};

/**
 * Route-based lazy loading with route-specific fallbacks
 */
export const lazyRoute = (
  importFunc: () => Promise<{ default: ComponentType<any> }>,
  routeName?: string
) => {
  const RouteFallback = () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        gap: 'var(--spacing-lg)',
      }}
    >
      <LoadingSpinner
        size="large"
        message={`Loading ${routeName || 'page'}...`}
      />
      <div
        style={{
          textAlign: 'center',
          color: '#6b7280',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        Please wait while we prepare your learning experience! 🚀
      </div>
    </div>
  );

  return lazyLoad(importFunc, { fallback: RouteFallback });
};

/**
 * Component lazy loading with intersection observer for viewport-based loading
 */
export const lazyLoadOnVisible = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyLoadOptions & { rootMargin?: string } = {}
) => {
  const { rootMargin = '50px', ...lazyOptions } = options;

  return React.forwardRef<
    any,
    React.ComponentProps<T> & { className?: string }
  >((props, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [isIntersecting, setIsIntersecting] = React.useState(false);
    const elementRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isIntersecting) {
            setIsIntersecting(true);
            setIsVisible(true);
          }
        },
        { rootMargin }
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    }, [rootMargin, isIntersecting]);

    if (!isVisible) {
      return (
        <div
          ref={elementRef}
          className={props.className}
          style={{
            minHeight: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LoadingSpinner size="medium" message="Loading component..." />
        </div>
      );
    }

    const LazyComponent = lazyLoad(importFunc, lazyOptions);
    return <LazyComponent {...(props as any)} ref={ref} />;
  });
};
