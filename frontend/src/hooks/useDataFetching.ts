/**
 * Efficient data fetching hooks with caching and optimization
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheService } from '../services/cacheService';
import { offlineService, useOfflineService } from '../services/offlineService';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastFetched: number | null;
}

interface UseFetchOptions {
  enabled?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  staleTime?: number;
  offlineFallback?: boolean;
}

/**
 * Enhanced data fetching hook with caching and offline support
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options: UseFetchOptions = {}
) {
  const {
    enabled = true,
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus = false,
    refetchInterval,
    retryCount = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    staleTime = 0,
    offlineFallback = true,
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetched: null,
  });

  const { isOnline } = useOfflineService();
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!enabled) return;

      // Check cache first if not forcing refresh
      if (!forceRefresh && cacheKey) {
        const cached = await cacheService.get<T>(cacheKey);
        if (cached !== null) {
          const now = Date.now();
          const cacheAge = now - (state.lastFetched || 0);

          if (cacheAge < staleTime) {
            setState((prev) => ({
              ...prev,
              data: cached,
              loading: false,
              error: null,
            }));
            return;
          }
        }
      }

      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setState((prev) => ({ ...prev, loading: true, error: null }));

      let attempt = 0;
      const executeWithRetry = async (): Promise<void> => {
        try {
          const data = await fetchFn();

          setState({
            data,
            loading: false,
            error: null,
            lastFetched: Date.now(),
          });

          // Cache the result
          if (cacheKey) {
            await cacheService.set(cacheKey, data, { ttl: cacheTTL });
          }

          // Store for offline access
          if (offlineFallback) {
            await offlineService.storeOfflineData(
              cacheKey || 'fetch_data',
              data
            );
          }

          onSuccess?.(data);
        } catch (error) {
          const err = error as Error;

          // Try offline fallback if network error and offline fallback enabled
          if (!isOnline && offlineFallback && cacheKey) {
            const offlineData =
              await offlineService.getOfflineData<T>(cacheKey);
            if (offlineData !== null) {
              setState({
                data: offlineData,
                loading: false,
                error: null,
                lastFetched: Date.now(),
              });
              return;
            }
          }

          // Retry logic
          if (attempt < retryCount && err.name !== 'AbortError') {
            attempt++;
            retryTimeoutRef.current = setTimeout(
              () => {
                executeWithRetry();
              },
              retryDelay * Math.pow(2, attempt - 1)
            ); // Exponential backoff
            return;
          }

          setState((prev) => ({
            ...prev,
            loading: false,
            error: err,
          }));

          onError?.(err);
        }
      };

      await executeWithRetry();
    },
    [
      enabled,
      fetchFn,
      cacheKey,
      cacheTTL,
      retryCount,
      retryDelay,
      onSuccess,
      onError,
      staleTime,
      offlineFallback,
      isOnline,
      state.lastFetched,
    ]
  );

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (state.data !== null) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, fetchData, state.data]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval) return;

    intervalRef.current = setInterval(() => {
      fetchData();
    }, refetchInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, fetchData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    refetch,
    isStale: state.lastFetched
      ? Date.now() - state.lastFetched > staleTime
      : true,
  };
}

/**
 * Hook for infinite scrolling with caching
 */
export function useInfiniteQuery<T>(
  fetchFn: (
    page: number,
    pageSize: number
  ) => Promise<{ data: T[]; hasMore: boolean }>,
  options: {
    pageSize?: number;
    cacheKey?: string;
    enabled?: boolean;
  } = {}
) {
  const { pageSize = 20, cacheKey, enabled = true } = options;

  const [state, setState] = useState({
    data: [] as T[],
    loading: false,
    error: null as Error | null,
    hasMore: true,
    page: 0,
  });

  const fetchNextPage = useCallback(async () => {
    if (!enabled || state.loading || !state.hasMore) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const nextPage = state.page + 1;
      const cacheKeyForPage = cacheKey
        ? `${cacheKey}_page_${nextPage}`
        : undefined;

      // Check cache for this page
      let result: any;
      if (cacheKeyForPage) {
        result = await cacheService.get(cacheKeyForPage);
      }

      if (!result) {
        result = await fetchFn(nextPage, pageSize);

        // Cache the page result
        if (cacheKeyForPage) {
          await cacheService.set(cacheKeyForPage, result, {
            ttl: 5 * 60 * 1000,
          });
        }
      }

      setState((prev) => ({
        ...prev,
        data: [...prev.data, ...result.data],
        hasMore: result.hasMore,
        page: nextPage,
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
    }
  }, [
    enabled,
    state.loading,
    state.hasMore,
    state.page,
    fetchFn,
    pageSize,
    cacheKey,
  ]);

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      error: null,
      hasMore: true,
      page: 0,
    });
  }, []);

  // Initial fetch
  useEffect(() => {
    if (enabled && state.data.length === 0 && !state.loading) {
      fetchNextPage();
    }
  }, [enabled, state.data.length, state.loading, fetchNextPage]);

  return {
    ...state,
    fetchNextPage,
    reset,
  };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate<T>(
  data: T | null,
  updateFn: (optimisticData: T) => Promise<T>
) {
  const [optimisticData, setOptimisticData] = useState<T | null>(data);
  const [isOptimistic, setIsOptimistic] = useState(false);

  useEffect(() => {
    setOptimisticData(data);
    setIsOptimistic(false);
  }, [data]);

  const performOptimisticUpdate = useCallback(
    async (newData: T) => {
      // Apply optimistic update immediately
      setOptimisticData(newData);
      setIsOptimistic(true);

      try {
        // Perform actual update
        const result = await updateFn(newData);
        setOptimisticData(result);
        setIsOptimistic(false);
        return result;
      } catch (error) {
        // Revert optimistic update on error
        setOptimisticData(data);
        setIsOptimistic(false);
        throw error;
      }
    },
    [data, updateFn]
  );

  return {
    data: optimisticData,
    isOptimistic,
    performOptimisticUpdate,
  };
}

/**
 * Hook for background data synchronization
 */
export function useBackgroundSync<T>(
  fetchFn: () => Promise<T>,
  options: {
    syncInterval?: number;
    cacheKey?: string;
    onDataChange?: (newData: T, oldData: T | null) => void;
  } = {}
) {
  const { syncInterval = 30000, cacheKey, onDataChange } = options; // 30 seconds default

  const [data, setData] = useState<T | null>(null);
  const [lastSync, setLastSync] = useState<number>(0);
  const { isOnline } = useOfflineService();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const syncData = useCallback(async () => {
    if (!isOnline) return;

    try {
      const newData = await fetchFn();
      const oldData = data;

      setData(newData);
      setLastSync(Date.now());

      // Cache the new data
      if (cacheKey) {
        await cacheService.set(cacheKey, newData, { ttl: syncInterval * 2 });
      }

      // Notify of data change
      if (onDataChange && oldData !== null) {
        onDataChange(newData, oldData);
      }
    } catch (error) {
      console.warn('Background sync failed:', error);
    }
  }, [fetchFn, data, cacheKey, syncInterval, onDataChange, isOnline]);

  // Setup background sync
  useEffect(() => {
    // Initial sync
    syncData();

    // Setup interval
    intervalRef.current = setInterval(syncData, syncInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [syncData, syncInterval]);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && Date.now() - lastSync > syncInterval) {
      syncData();
    }
  }, [isOnline, lastSync, syncInterval, syncData]);

  return {
    data,
    lastSync,
    syncNow: syncData,
  };
}

/**
 * Hook for prefetching data
 */
export function usePrefetch() {
  const prefetchedData = useRef<Map<string, { data: any; timestamp: number }>>(
    new Map()
  );

  const prefetch = useCallback(
    async <T>(
      key: string,
      fetchFn: () => Promise<T>,
      ttl: number = 5 * 60 * 1000
    ) => {
      try {
        const data = await fetchFn();
        prefetchedData.current.set(key, {
          data,
          timestamp: Date.now(),
        });

        // Also cache it
        await cacheService.set(`prefetch_${key}`, data, { ttl });
      } catch (error) {
        console.warn(`Prefetch failed for ${key}:`, error);
      }
    },
    []
  );

  const getPrefetchedData = useCallback(<T>(key: string): T | null => {
    const cached = prefetchedData.current.get(key);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.data;
    }
    return null;
  }, []);

  const clearPrefetchedData = useCallback((key?: string) => {
    if (key) {
      prefetchedData.current.delete(key);
    } else {
      prefetchedData.current.clear();
    }
  }, []);

  return {
    prefetch,
    getPrefetchedData,
    clearPrefetchedData,
  };
}
