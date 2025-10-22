import React, { memo, useMemo, useCallback, useRef } from 'react';

/**
 * Enhanced memoization utilities for React components and functions
 */

/**
 * Deep comparison function for complex objects
 */
const deepEqual = (a: any, b: any): boolean => {
    if (a === b) return true;

    if (a == null || b == null) return a === b;

    if (typeof a !== typeof b) return false;

    if (typeof a !== 'object') return a === b;

    if (Array.isArray(a) !== Array.isArray(b)) return false;

    if (Array.isArray(a)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
};

/**
 * Shallow comparison function for props
 */
const shallowEqual = (a: any, b: any): boolean => {
    if (a === b) return true;

    if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null) {
        return a === b;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (a[key] !== b[key]) return false;
    }

    return true;
};

/**
 * Enhanced memo with custom comparison options
 */
export const memoComponent = <P extends object,>(
    Component: React.ComponentType<P>,
    options: {
        compareProps?: 'shallow' | 'deep' | ((prev: P, next: P) => boolean);
        displayName?: string;
        debugRenders?: boolean;
    } = {}
) => {
    const { compareProps = 'shallow', displayName, debugRenders = false } = options;

    let compareFn: (prev: P, next: P) => boolean;

    switch (compareProps) {
        case 'shallow':
            compareFn = shallowEqual;
            break;
        case 'deep':
            compareFn = deepEqual;
            break;
        default:
            compareFn = compareProps;
    }

    const MemoizedComponent = memo(Component, (prevProps, nextProps) => {
        const areEqual = compareFn(prevProps, nextProps);

        if (debugRenders) {
            console.log(`${displayName || Component.name} render check:`, {
                areEqual,
                prevProps,
                nextProps
            });
        }

        return areEqual;
    });

    if (displayName) {
        MemoizedComponent.displayName = displayName;
    }

    return MemoizedComponent;
};

/**
 * Memoized callback with dependency tracking
 */
export const useMemoizedCallback = <T extends (...args: any[]) => any,>(
    callback: T,
    deps: React.DependencyList,
    options: {
        debugDeps?: boolean;
        maxCacheSize?: number;
    } = {}
): T => {
    const { debugDeps = false, maxCacheSize = 10 } = options;
    const cacheRef = useRef<Map<string, T>>(new Map());

    return useCallback((...args: Parameters<T>) => {
        const depsKey = JSON.stringify(deps);
        const argsKey = JSON.stringify(args);
        const cacheKey = `${depsKey}:${argsKey}`;

        // Check cache
        if (cacheRef.current.has(cacheKey)) {
            if (debugDeps) {
                console.log('Using cached callback result for:', cacheKey);
            }
            return cacheRef.current.get(cacheKey)!(...args);
        }

        // Execute callback
        const result = callback(...args);

        // Cache result (with size limit)
        if (cacheRef.current.size >= maxCacheSize) {
            const firstKey = cacheRef.current.keys().next().value;
            cacheRef.current.delete(firstKey);
        }

        cacheRef.current.set(cacheKey, callback);

        if (debugDeps) {
            console.log('Cached new callback result for:', cacheKey);
        }

        return result;
    }, deps) as T;
};

/**
 * Memoized value with custom equality check
 */
export const useMemoizedValue = <T,>(
    factory: () => T,
    deps: React.DependencyList,
    equalityFn: (a: T, b: T) => boolean = Object.is
): T => {
    const prevValueRef = useRef<T | undefined>(undefined);
    const prevDepsRef = useRef<React.DependencyList | undefined>(undefined);

    return useMemo(() => {
        // Check if dependencies changed
        const depsChanged = !prevDepsRef.current ||
            prevDepsRef.current.length !== deps.length ||
            deps.some((dep, index) => !Object.is(dep, prevDepsRef.current![index]));

        if (!depsChanged && prevValueRef.current !== undefined) {
            return prevValueRef.current;
        }

        const newValue = factory();

        // Check if value actually changed using custom equality
        if (prevValueRef.current !== undefined && equalityFn(prevValueRef.current, newValue)) {
            return prevValueRef.current;
        }

        prevValueRef.current = newValue;
        prevDepsRef.current = deps;

        return newValue;
    }, deps);
};

/**
 * Memoized component with render tracking
 */
export const withRenderTracking = <P extends object,>(
    Component: React.ComponentType<P>,
    componentName?: string
) => {
    const TrackedComponent: React.FC<P> = (props) => {
        const renderCount = useRef(0);
        const lastRenderTime = useRef(Date.now());

        renderCount.current++;
        const currentTime = Date.now();
        const timeSinceLastRender = currentTime - lastRenderTime.current;
        lastRenderTime.current = currentTime;

        if (process.env.NODE_ENV === 'development') {
            console.log(`${componentName || Component.name} render #${renderCount.current} (${timeSinceLastRender}ms since last)`);
        }

        return <Component {...props} />;
    };

    TrackedComponent.displayName = `withRenderTracking(${componentName || Component.name})`;

    return TrackedComponent;
};

/**
 * Expensive computation memoization hook
 */
export const useExpensiveComputation = <T, Args extends any[],>(
    computeFn: (...args: Args) => T,
    args: Args,
    options: {
        cacheSize?: number;
        ttl?: number; // Time to live in milliseconds
        debugCache?: boolean;
    } = {}
): T => {
    const { cacheSize = 50, ttl = 5 * 60 * 1000, debugCache = false } = options;

    const cacheRef = useRef<Map<string, { value: T; timestamp: number }>>(new Map());

    return useMemo(() => {
        const cacheKey = JSON.stringify(args);
        const now = Date.now();

        // Check cache
        const cached = cacheRef.current.get(cacheKey);
        if (cached && (now - cached.timestamp) < ttl) {
            if (debugCache) {
                console.log('Using cached computation result for:', cacheKey);
            }
            return cached.value;
        }

        // Compute new value
        const startTime = performance.now();
        const result = computeFn(...args);
        const endTime = performance.now();

        if (debugCache) {
            console.log(`Computed new result in ${(endTime - startTime).toFixed(2)}ms for:`, cacheKey);
        }

        // Cache result
        cacheRef.current.set(cacheKey, { value: result, timestamp: now });

        // Clean up old cache entries
        if (cacheRef.current.size > cacheSize) {
            const entries = Array.from(cacheRef.current.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

            // Remove oldest entries
            const toRemove = entries.slice(0, entries.length - cacheSize);
            toRemove.forEach(([key]) => cacheRef.current.delete(key));
        }

        return result;
    }, args);
};

/**
 * Memoized list rendering for large datasets
 */
export const useMemoizedList = <T,>(
    items: T[],
    renderItem: (item: T, index: number) => React.ReactNode,
    keyExtractor: (item: T, index: number) => string | number = (_, index) => index,
    options: {
        chunkSize?: number;
        enableVirtualization?: boolean;
    } = {}
) => {
    const { chunkSize = 100, enableVirtualization = false } = options;

    const memoizedItems = useMemo(() => {
        if (!enableVirtualization) {
            return items.map((item, index) => ({
                key: keyExtractor(item, index),
                element: renderItem(item, index)
            }));
        }

        // For virtualization, return chunked items
        const chunks: Array<{ key: string; items: T[] }> = [];
        for (let i = 0; i < items.length; i += chunkSize) {
            chunks.push({
                key: `chunk-${i}`,
                items: items.slice(i, i + chunkSize)
            });
        }

        return chunks;
    }, [items, renderItem, keyExtractor, chunkSize, enableVirtualization]);

    return memoizedItems;
};

/**
 * Performance-optimized form field memoization
 */
export const useMemoizedFormField = <T,>(
    value: T,
    onChange: (value: T) => void,
    validator?: (value: T) => string | null
) => {
    const memoizedOnChange = useCallback((newValue: T) => {
        if (!Object.is(value, newValue)) {
            onChange(newValue);
        }
    }, [value, onChange]);

    const memoizedValidation = useMemo(() => {
        return validator ? validator(value) : null;
    }, [value, validator]);

    return {
        value,
        onChange: memoizedOnChange,
        error: memoizedValidation,
        isValid: !memoizedValidation
    };
};

/**
 * Memoization utilities for child-friendly components
 */
export const childFriendlyMemo = {
    // Memoize animation-heavy components
    animatedComponent: <P extends object>(Component: React.ComponentType<P>) =>
        memoComponent(Component, {
            compareProps: 'shallow',
            debugRenders: process.env.NODE_ENV === 'development'
        }),

    // Memoize interactive game components
    gameComponent: <P extends object>(Component: React.ComponentType<P>) =>
        memoComponent(Component, {
            compareProps: (prev, next) => {
                // Custom comparison for game state
                return shallowEqual(prev, next) &&
                    (prev as any).gameState === (next as any).gameState &&
                    (prev as any).score === (next as any).score;
            }
        }),

    // Memoize progress tracking components
    progressComponent: <P extends object>(Component: React.ComponentType<P>) =>
        memoComponent(Component, {
            compareProps: (prev, next) => {
                // Only re-render if progress actually changed
                return (prev as any).progress === (next as any).progress &&
                    (prev as any).total === (next as any).total &&
                    shallowEqual(prev, next);
            }
        })
};


