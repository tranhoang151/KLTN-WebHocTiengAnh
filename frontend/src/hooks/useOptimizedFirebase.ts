/**
 * React hooks for optimized Firebase operations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  optimizedFirebaseService,
  FirebaseHelpers,
} from '../services/optimizedFirebaseService';
import { DocumentSnapshot } from 'firebase/firestore';

interface UseFirebaseDocumentOptions {
  enableRealtime?: boolean;
  useCache?: boolean;
  retries?: number;
  timeout?: number;
}

interface UseFirebaseCollectionOptions extends UseFirebaseDocumentOptions {
  filters?: any[];
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  limit?: number;
}

interface UsePaginatedCollectionOptions extends UseFirebaseCollectionOptions {
  pageSize?: number;
  autoLoad?: boolean;
}

interface FirebaseState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: number | null;
}

interface PaginatedState<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  lastDocument: DocumentSnapshot | null;
  totalLoaded: number;
}

/**
 * Hook for optimized document retrieval with real-time updates
 */
export function useFirebaseDocument<T>(
  collectionPath: string,
  documentId: string | null,
  options: UseFirebaseDocumentOptions = {}
) {
  const {
    enableRealtime = false,
    useCache = true,
    retries = 3,
    timeout = 10000,
  } = options;

  const [state, setState] = useState<FirebaseState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);

  const fetchDocument = useCallback(async () => {
    if (!documentId) {
      setState((prev) => ({ ...prev, data: null, loading: false }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await optimizedFirebaseService.getDocument<T>(
        collectionPath,
        documentId,
        { useCache, retries, timeout }
      );

      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, [collectionPath, documentId, useCache, retries, timeout]);

  const setupRealtimeListener = useCallback(() => {
    if (!documentId || !enableRealtime) return;

    // Cleanup existing listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    unsubscribeRef.current = optimizedFirebaseService.subscribeToDocument<T>(
      collectionPath,
      documentId,
      (data) => {
        setState((prev) => ({
          ...prev,
          data,
          loading: false,
          error: null,
          lastUpdated: Date.now(),
        }));
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error as Error,
        }));
      }
    );
  }, [collectionPath, documentId, enableRealtime]);

  // Initial fetch or setup realtime listener
  useEffect(() => {
    if (enableRealtime) {
      setupRealtimeListener();
    } else {
      fetchDocument();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [enableRealtime, setupRealtimeListener, fetchDocument]);

  const refetch = useCallback(() => {
    if (!enableRealtime) {
      fetchDocument();
    }
  }, [enableRealtime, fetchDocument]);

  return {
    ...state,
    refetch,
  };
}

/**
 * Hook for optimized collection queries with real-time updates
 */
export function useFirebaseCollection<T>(
  collectionPath: string,
  options: UseFirebaseCollectionOptions = {}
) {
  const {
    enableRealtime = false,
    useCache = true,
    retries = 3,
    timeout = 15000,
    filters = [],
    orderBy = [],
    limit: queryLimit,
  } = options;

  const [state, setState] = useState<FirebaseState<T[]>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);

  const buildQueryConstraints = useCallback(() => {
    const constraints: any[] = [];

    // Add filters
    filters.forEach((filter) => {
      constraints.push(filter);
    });

    // Add ordering
    orderBy.forEach((order) => {
      constraints.push(FirebaseHelpers.buildQuery.orderByAsc(order.field));
    });

    // Add limit
    if (queryLimit) {
      constraints.push(FirebaseHelpers.buildQuery.limitTo(queryLimit));
    }

    return constraints;
  }, [filters, orderBy, queryLimit]);

  const fetchCollection = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const queryConstraints = buildQueryConstraints();
      const data = await optimizedFirebaseService.getCollection<T>(
        collectionPath,
        queryConstraints,
        { useCache, retries, timeout }
      );

      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, [collectionPath, buildQueryConstraints, useCache, retries, timeout]);

  const setupRealtimeListener = useCallback(() => {
    if (!enableRealtime) return;

    // Cleanup existing listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const queryConstraints = buildQueryConstraints();
    unsubscribeRef.current = optimizedFirebaseService.subscribeToCollection<T>(
      collectionPath,
      queryConstraints,
      (data) => {
        setState((prev) => ({
          ...prev,
          data,
          loading: false,
          error: null,
          lastUpdated: Date.now(),
        }));
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error as Error,
        }));
      }
    );
  }, [collectionPath, buildQueryConstraints, enableRealtime]);

  // Initial fetch or setup realtime listener
  useEffect(() => {
    if (enableRealtime) {
      setupRealtimeListener();
    } else {
      fetchCollection();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [enableRealtime, setupRealtimeListener, fetchCollection]);

  const refetch = useCallback(() => {
    if (!enableRealtime) {
      fetchCollection();
    }
  }, [enableRealtime, fetchCollection]);

  return {
    ...state,
    refetch,
  };
}

/**
 * Hook for paginated collection queries
 */
export function usePaginatedFirebaseCollection<T>(
  collectionPath: string,
  options: UsePaginatedCollectionOptions = {}
) {
  const {
    pageSize = 20,
    autoLoad = true,
    filters = [],
    orderBy = [],
    useCache = true,
    retries = 3,
    timeout = 15000,
  } = options;

  const [state, setState] = useState<PaginatedState<T>>({
    data: [],
    loading: false,
    error: null,
    hasMore: true,
    lastDocument: null,
    totalLoaded: 0,
  });

  const buildQueryConstraints = useCallback(() => {
    const constraints: any[] = [];

    // Add filters
    filters.forEach((filter) => {
      constraints.push(filter);
    });

    // Add ordering
    orderBy.forEach((order) => {
      constraints.push(
        order.direction === 'desc'
          ? FirebaseHelpers.buildQuery.orderByDesc(order.field)
          : FirebaseHelpers.buildQuery.orderByAsc(order.field)
      );
    });

    return constraints;
  }, [filters, orderBy]);

  const loadNextPage = useCallback(async () => {
    if (state.loading || !state.hasMore) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const queryConstraints = buildQueryConstraints();
      const result = await optimizedFirebaseService.getPaginatedCollection<T>(
        collectionPath,
        pageSize,
        state.lastDocument,
        queryConstraints
      );

      setState((prev) => ({
        data: [...prev.data, ...result.data],
        loading: false,
        error: null,
        hasMore: result.hasMore,
        lastDocument: result.lastDoc,
        totalLoaded: prev.totalLoaded + result.data.length,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
    }
  }, [
    collectionPath,
    pageSize,
    state.loading,
    state.hasMore,
    state.lastDocument,
    buildQueryConstraints,
  ]);

  const reset = useCallback(() => {
    setState({
      data: [],
      loading: false,
      error: null,
      hasMore: true,
      lastDocument: null,
      totalLoaded: 0,
    });
  }, []);

  const refetch = useCallback(() => {
    reset();
    // Load first page after reset
    setTimeout(() => {
      loadNextPage();
    }, 0);
  }, [reset, loadNextPage]);

  // Auto-load first page
  useEffect(() => {
    if (autoLoad && state.data.length === 0 && !state.loading) {
      loadNextPage();
    }
  }, [autoLoad, state.data.length, state.loading, loadNextPage]);

  return {
    ...state,
    loadNextPage,
    reset,
    refetch,
  };
}

/**
 * Hook for Firebase batch operations
 */
export function useFirebaseBatch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeBatch = useCallback(async (operations: any[]) => {
    setLoading(true);
    setError(null);

    try {
      await optimizedFirebaseService.executeBatch(operations);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    executeBatch,
    loading,
    error,
  };
}

/**
 * Hook for Firebase transactions
 */
export function useFirebaseTransaction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeTransaction = useCallback(
    async <T>(transactionFn: (transaction: any) => Promise<T>): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await optimizedFirebaseService.executeTransaction(transactionFn);
        setLoading(false);
        return result;
      } catch (err) {
        setError(err as Error);
        setLoading(false);
        throw err;
      }
    },
    []
  );

  return {
    executeTransaction,
    loading,
    error,
  };
}

/**
 * Hook for Firebase performance monitoring
 */
export function useFirebasePerformance() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const updateMetrics = () => {
      const performanceMetrics =
        optimizedFirebaseService.getPerformanceMetrics();
      setMetrics(performanceMetrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

/**
 * Hook for optimized Firebase writes with offline support
 */
export function useOptimizedFirebaseWrite<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (
      collectionPath: string,
      data: T,
      options: { optimistic?: boolean } = {}
    ) => {
      setLoading(true);
      setError(null);

      try {
        // For optimistic updates, we could update local state immediately
        // and then sync with server
        const docRef = FirebaseHelpers.docRef(collectionPath, '');
        await optimizedFirebaseService.executeBatch([
          {
            type: 'set',
            ref: docRef,
            data: {
              ...data,
              createdAt: FirebaseHelpers.fieldValues.serverTimestamp(),
              updatedAt: FirebaseHelpers.fieldValues.serverTimestamp(),
            },
          },
        ]);

        setLoading(false);
        return docRef.id;
      } catch (err) {
        setError(err as Error);
        setLoading(false);
        throw err;
      }
    },
    []
  );

  const update = useCallback(
    async (
      collectionPath: string,
      documentId: string,
      data: Partial<T>,
      options: { optimistic?: boolean } = {}
    ) => {
      setLoading(true);
      setError(null);

      try {
        const docRef = FirebaseHelpers.docRef(collectionPath, documentId);
        await optimizedFirebaseService.executeBatch([
          {
            type: 'update',
            ref: docRef,
            data: {
              ...data,
              updatedAt: FirebaseHelpers.fieldValues.serverTimestamp(),
            },
          },
        ]);

        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
        throw err;
      }
    },
    []
  );

  const remove = useCallback(
    async (collectionPath: string, documentId: string) => {
      setLoading(true);
      setError(null);

      try {
        const docRef = FirebaseHelpers.docRef(collectionPath, documentId);
        await optimizedFirebaseService.executeBatch([
          {
            type: 'delete',
            ref: docRef,
          },
        ]);

        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
        throw err;
      }
    },
    []
  );

  return {
    create,
    update,
    remove,
    loading,
    error,
  };
}
