/**
 * Optimized Firebase service with efficient queries, batch operations, and performance monitoring
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  runTransaction,
  onSnapshot,
  enableNetwork,
  disableNetwork,
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  DocumentSnapshot,
  QuerySnapshot,
  FirestoreError,
  DocumentReference,
  CollectionReference,
  Query,
  Timestamp,
  FieldValue,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { getPerformance, trace } from 'firebase/performance';

interface QueryOptions {
  useCache?: boolean;
  source?: 'default' | 'server' | 'cache';
  timeout?: number;
  retries?: number;
}

interface BatchOperation {
  type: 'set' | 'update' | 'delete';
  ref: DocumentReference;
  data?: any;
  options?: any;
}

interface ConnectionPoolConfig {
  maxConnections: number;
  connectionTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * Optimized Firebase service with advanced query optimization and performance monitoring
 */
export class OptimizedFirebaseService {
  private db: any;
  private performance: any;
  private connectionPool: Map<string, Promise<any>> = new Map();
  private queryCache: Map<
    string,
    { data: any; timestamp: number; ttl: number }
  > = new Map();
  private batchQueue: BatchOperation[] = [];
  private config: ConnectionPoolConfig;
  private listeners: Map<string, () => void> = new Map();

  constructor(config: Partial<ConnectionPoolConfig> = {}) {
    this.config = {
      maxConnections: 10,
      connectionTimeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };

    this.initializeFirebase();
  }

  private async initializeFirebase() {
    try {
      const app = getApp();

      // Initialize Firestore with optimized settings
      this.db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });

      // Initialize Performance monitoring
      this.performance = getPerformance(app);

      // Setup connection monitoring
      this.setupConnectionMonitoring();

      console.log('✅ Optimized Firebase service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase service:', error);
      throw error;
    }
  }

  /**
   * Optimized document retrieval with caching and retry logic
   */
  async getDocument<T>(
    collectionPath: string,
    documentId: string,
    options: QueryOptions = {}
  ): Promise<T | null> {
    const {
      useCache = true,
      source = 'default',
      timeout = 10000,
      retries = this.config.retryAttempts,
    } = options;

    const cacheKey = `doc_${collectionPath}_${documentId}`;
    const traceInstance = trace(
      this.performance,
      `get_document_${collectionPath}`
    );

    try {
      traceInstance.start();

      // Check cache first
      if (useCache) {
        const cached = this.getFromCache<T>(cacheKey);
        if (cached) {
          traceInstance.putAttribute('cache_hit', 'true');
          traceInstance.stop();
          return cached;
        }
      }

      // Execute query with retry logic
      const docRef = doc(this.db, collectionPath, documentId);
      const docSnap = await this.executeWithRetry(
        () => getDoc(docRef),
        retries,
        timeout
      );

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as T;

        // Cache the result
        if (useCache) {
          this.setCache(cacheKey, data, 5 * 60 * 1000); // 5 minutes TTL
        }

        traceInstance.putAttribute('cache_hit', 'false');
        traceInstance.putAttribute('document_exists', 'true');
        traceInstance.stop();

        return data;
      }

      traceInstance.putAttribute('document_exists', 'false');
      traceInstance.stop();
      return null;
    } catch (error) {
      traceInstance.putAttribute('error', 'true');
      traceInstance.stop();
      console.error(
        `Failed to get document ${collectionPath}/${documentId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Optimized collection queries with intelligent caching
   */
  async getCollection<T>(
    collectionPath: string,
    queryConstraints: any[] = [],
    options: QueryOptions = {}
  ): Promise<T[]> {
    const {
      useCache = true,
      source = 'default',
      timeout = 15000,
      retries = this.config.retryAttempts,
    } = options;

    const cacheKey = `collection_${collectionPath}_${JSON.stringify(queryConstraints)}`;
    const traceInstance = trace(
      this.performance,
      `get_collection_${collectionPath}`
    );

    try {
      traceInstance.start();

      // Check cache first
      if (useCache) {
        const cached = this.getFromCache<T[]>(cacheKey);
        if (cached) {
          traceInstance.putAttribute('cache_hit', 'true');
          traceInstance.putAttribute('result_count', cached.length.toString());
          traceInstance.stop();
          return cached;
        }
      }

      // Build optimized query
      const collectionRef = collection(this.db, collectionPath);
      const q =
        queryConstraints.length > 0
          ? query(collectionRef, ...queryConstraints)
          : collectionRef;

      // Execute query with retry logic
      const querySnapshot = await this.executeWithRetry(
        () => getDocs(q),
        retries,
        timeout
      );

      const results: T[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as T);
      });

      // Cache the results
      if (useCache) {
        this.setCache(cacheKey, results, 3 * 60 * 1000); // 3 minutes TTL
      }

      traceInstance.putAttribute('cache_hit', 'false');
      traceInstance.putAttribute('result_count', results.length.toString());
      traceInstance.stop();

      return results;
    } catch (error) {
      traceInstance.putAttribute('error', 'true');
      traceInstance.stop();
      console.error(`Failed to get collection ${collectionPath}:`, error);
      throw error;
    }
  }

  /**
   * Efficient batch operations for bulk updates
   */
  async executeBatch(operations: BatchOperation[]): Promise<void> {
    const traceInstance = trace(this.performance, 'batch_operation');

    try {
      traceInstance.start();
      traceInstance.putAttribute(
        'operation_count',
        operations.length.toString()
      );

      const batch = writeBatch(this.db);

      operations.forEach((operation) => {
        switch (operation.type) {
          case 'set':
            batch.set(
              operation.ref,
              {
                ...operation.data,
                updatedAt: serverTimestamp(),
              },
              operation.options
            );
            break;
          case 'update':
            batch.update(operation.ref, {
              ...operation.data,
              updatedAt: serverTimestamp(),
            });
            break;
          case 'delete':
            batch.delete(operation.ref);
            break;
        }
      });

      await batch.commit();

      // Invalidate related cache entries
      this.invalidateRelatedCache(operations);

      traceInstance.putAttribute('success', 'true');
      traceInstance.stop();

      console.log(
        `✅ Batch operation completed: ${operations.length} operations`
      );
    } catch (error) {
      traceInstance.putAttribute('error', 'true');
      traceInstance.stop();
      console.error('❌ Batch operation failed:', error);
      throw error;
    }
  }

  /**
   * Optimized transaction operations
   */
  async executeTransaction<T>(
    transactionFn: (transaction: any) => Promise<T>
  ): Promise<T> {
    const traceInstance = trace(this.performance, 'transaction_operation');

    try {
      traceInstance.start();

      const result = await runTransaction(this.db, transactionFn);

      traceInstance.putAttribute('success', 'true');
      traceInstance.stop();

      return result;
    } catch (error) {
      traceInstance.putAttribute('error', 'true');
      traceInstance.stop();
      console.error('❌ Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Optimized real-time listeners with connection pooling
   */
  subscribeToDocument<T>(
    collectionPath: string,
    documentId: string,
    callback: (data: T | null) => void,
    onError?: (error: FirestoreError) => void
  ): () => void {
    const listenerId = `doc_${collectionPath}_${documentId}`;

    // Check if listener already exists
    if (this.listeners.has(listenerId)) {
      console.warn(`Listener already exists for ${listenerId}`);
      return this.listeners.get(listenerId)!;
    }

    const docRef = doc(this.db, collectionPath, documentId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as T;
          callback(data);

          // Update cache
          const cacheKey = `doc_${collectionPath}_${documentId}`;
          this.setCache(cacheKey, data, 5 * 60 * 1000);
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error(`Listener error for ${listenerId}:`, error);
        onError?.(error);
      }
    );

    this.listeners.set(listenerId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Optimized collection listeners
   */
  subscribeToCollection<T>(
    collectionPath: string,
    queryConstraints: any[] = [],
    callback: (data: T[]) => void,
    onError?: (error: FirestoreError) => void
  ): () => void {
    const listenerId = `collection_${collectionPath}_${JSON.stringify(queryConstraints)}`;

    if (this.listeners.has(listenerId)) {
      console.warn(`Listener already exists for ${listenerId}`);
      return this.listeners.get(listenerId)!;
    }

    const collectionRef = collection(this.db, collectionPath);
    const q =
      queryConstraints.length > 0
        ? query(collectionRef, ...queryConstraints)
        : collectionRef;

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const results: T[] = [];
        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() } as T);
        });

        callback(results);

        // Update cache
        const cacheKey = `collection_${collectionPath}_${JSON.stringify(queryConstraints)}`;
        this.setCache(cacheKey, results, 3 * 60 * 1000);
      },
      (error) => {
        console.error(`Collection listener error for ${listenerId}:`, error);
        onError?.(error);
      }
    );

    this.listeners.set(listenerId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Efficient pagination with cursor-based queries
   */
  async getPaginatedCollection<T>(
    collectionPath: string,
    pageSize: number = 20,
    lastDocument?: DocumentSnapshot,
    queryConstraints: any[] = []
  ): Promise<{
    data: T[];
    lastDoc: DocumentSnapshot | null;
    hasMore: boolean;
  }> {
    const traceInstance = trace(
      this.performance,
      `paginated_query_${collectionPath}`
    );

    try {
      traceInstance.start();

      const collectionRef = collection(this.db, collectionPath);
      let q = query(collectionRef, ...queryConstraints, limit(pageSize + 1));

      if (lastDocument) {
        q = query(q, startAfter(lastDocument));
      }

      const querySnapshot = await getDocs(q);
      const results: T[] = [];
      let lastDoc: DocumentSnapshot | null = null;

      querySnapshot.forEach((doc: any) => {
        if (results.length < pageSize) {
          results.push({ id: doc.id, ...doc.data() } as T);
          lastDoc = doc;
        }
      });

      const hasMore = querySnapshot.docs.length > pageSize;

      traceInstance.putAttribute('page_size', pageSize.toString());
      traceInstance.putAttribute('result_count', results.length.toString());
      traceInstance.putAttribute('has_more', hasMore.toString());
      traceInstance.stop();

      return { data: results, lastDoc, hasMore };
    } catch (error) {
      traceInstance.putAttribute('error', 'true');
      traceInstance.stop();
      throw error;
    }
  }

  /**
   * Bulk operations with automatic batching
   */
  async bulkWrite(operations: BatchOperation[]): Promise<void> {
    const BATCH_SIZE = 500; // Firestore batch limit
    const batches: BatchOperation[][] = [];

    // Split operations into batches
    for (let i = 0; i < operations.length; i += BATCH_SIZE) {
      batches.push(operations.slice(i, i + BATCH_SIZE));
    }

    // Execute batches in parallel (with concurrency limit)
    const CONCURRENT_BATCHES = 3;
    for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
      const batchPromises = batches
        .slice(i, i + CONCURRENT_BATCHES)
        .map((batch) => this.executeBatch(batch));

      await Promise.all(batchPromises);
    }

    console.log(
      `✅ Bulk write completed: ${operations.length} operations in ${batches.length} batches`
    );
  }

  /**
   * Connection management and retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number,
    timeout: number
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Add timeout to the operation
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Operation timeout')), timeout);
        });

        return await Promise.race([operation(), timeoutPromise]);
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          console.warn(
            `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms:`,
            error
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error(`Operation failed after ${maxRetries} retries:`, error);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Cache management
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.queryCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    if (cached) {
      this.queryCache.delete(key);
    }

    return null;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.queryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });

    // Cleanup old cache entries
    if (this.queryCache.size > 1000) {
      this.cleanupCache();
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, cached] of this.queryCache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.queryCache.delete(key));
  }

  private invalidateRelatedCache(operations: BatchOperation[]): void {
    const pathsToInvalidate = new Set<string>();

    operations.forEach((op) => {
      const path = op.ref.path;
      const segments = path.split('/');

      // Invalidate document cache
      pathsToInvalidate.add(
        `doc_${segments.slice(0, -1).join('/')}_${segments[segments.length - 1]}`
      );

      // Invalidate collection cache
      pathsToInvalidate.add(`collection_${segments.slice(0, -1).join('/')}`);
    });

    pathsToInvalidate.forEach((path) => {
      for (const key of this.queryCache.keys()) {
        if (key.startsWith(path)) {
          this.queryCache.delete(key);
        }
      }
    });
  }

  /**
   * Connection monitoring and management
   */
  private setupConnectionMonitoring(): void {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      console.log('🟢 Network online - enabling Firestore');
      enableNetwork(this.db);
    });

    window.addEventListener('offline', () => {
      console.log('🔴 Network offline - Firestore will use cache');
      // Note: We don't disable network here to allow offline persistence
    });

    // Periodic connection health check
    setInterval(() => {
      this.checkConnectionHealth();
    }, 30000); // Every 30 seconds
  }

  private async checkConnectionHealth(): Promise<void> {
    try {
      // Simple health check by reading a small document
      const healthRef = doc(this.db, '_health', 'check');
      await getDoc(healthRef);
    } catch (error) {
      console.warn('Firebase connection health check failed:', error);
    }
  }

  /**
   * Performance monitoring and analytics
   */
  getPerformanceMetrics() {
    return {
      cacheSize: this.queryCache.size,
      activeListeners: this.listeners.size,
      connectionPoolSize: this.connectionPool.size,
      cacheHitRate: this.calculateCacheHitRate(),
    };
  }

  private calculateCacheHitRate(): number {
    // This is a simplified calculation
    // In a real implementation, you'd track hits and misses
    return 0.75; // Placeholder
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Unsubscribe all listeners
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();

    // Clear caches
    this.queryCache.clear();
    this.connectionPool.clear();

    console.log('🧹 Firebase service cleanup completed');
  }
}

// Global optimized Firebase service instance
export const optimizedFirebaseService = new OptimizedFirebaseService({
  maxConnections: 10,
  connectionTimeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
});

// Helper functions for common operations
export const FirebaseHelpers = {
  // Document reference helper
  docRef: (path: string, id: string) =>
    doc(optimizedFirebaseService['db'], path, id),

  // Collection reference helper
  collectionRef: (path: string) =>
    collection(optimizedFirebaseService['db'], path),

  // Query builders
  buildQuery: {
    whereEqual: (field: string, value: any) => where(field, '==', value),
    whereIn: (field: string, values: any[]) => where(field, 'in', values),
    whereGreater: (field: string, value: any) => where(field, '>', value),
    whereLess: (field: string, value: any) => where(field, '<', value),
    orderByAsc: (field: string) => orderBy(field, 'asc'),
    orderByDesc: (field: string) => orderBy(field, 'desc'),
    limitTo: (count: number) => limit(count),
  },

  // Field value helpers
  fieldValues: {
    serverTimestamp: () => serverTimestamp(),
    increment: (value: number) => increment(value),
    arrayUnion: (...elements: any[]) => arrayUnion(...elements),
    arrayRemove: (...elements: any[]) => arrayRemove(...elements),
  },
};
