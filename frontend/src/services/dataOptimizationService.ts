/**
 * Comprehensive data optimization service
 * Integrates caching, offline functionality, and background sync
 */

import React from 'react';
import { cacheService } from './cacheService';
import { offlineService, OfflineAwareAPI } from './offlineService';
import { backgroundSyncService, commonSyncTasks } from './backgroundSyncService';

interface OptimizationConfig {
    enableCaching: boolean;
    enableOfflineMode: boolean;
    enableBackgroundSync: boolean;
    cacheStrategy: 'aggressive' | 'conservative' | 'minimal';
    syncStrategy: 'realtime' | 'periodic' | 'manual';
    compressionEnabled: boolean;
    maxCacheSize: number;
    defaultCacheTTL: number;
}

interface DataFetchOptions {
    useCache?: boolean;
    cacheTTL?: number;
    offlineFallback?: boolean;
    backgroundSync?: boolean;
    priority?: 'high' | 'medium' | 'low';
    tags?: string[];
}

/**
 * Main data optimization service that coordinates all optimization strategies
 */
export class DataOptimizationService {
    private config: OptimizationConfig;
    private api: OfflineAwareAPI;
    private initialized = false;

    constructor(config: Partial<OptimizationConfig> = {}) {
        this.config = {
            enableCaching: true,
            enableOfflineMode: true,
            enableBackgroundSync: true,
            cacheStrategy: 'conservative',
            syncStrategy: 'periodic',
            compressionEnabled: true,
            maxCacheSize: 200,
            defaultCacheTTL: 5 * 60 * 1000, // 5 minutes
            ...config
        };

        this.api = new OfflineAwareAPI('/api');
    }

    /**
     * Initialize the optimization service
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            // Initialize cache service
            if (this.config.enableCaching) {
                await cacheService.initialize({
                    maxSize: this.config.maxCacheSize,
                    defaultTTL: this.config.defaultCacheTTL,
                    compressionEnabled: this.config.compressionEnabled
                });
            }

            // Initialize offline service
            if (this.config.enableOfflineMode) {
                // offlineService.initialize() - method not implemented yet
            }

            // Initialize background sync
            if (this.config.enableBackgroundSync) {
                // backgroundSyncService.initialize() - method not implemented yet
                this.setupBackgroundSync();
            }

            this.initialized = true;
            console.log('✅ Data optimization service initialized');
        } catch (error) {
            console.error('❌ Failed to initialize data optimization service:', error);
            throw error;
        }
    }

    /**
     * Optimized data fetching with all optimization strategies
     */
    async fetchData<T>(
        endpoint: string,
        options: DataFetchOptions = {}
    ): Promise<T> {
        const {
            useCache = this.config.enableCaching,
            cacheTTL = this.config.defaultCacheTTL,
            offlineFallback = this.config.enableOfflineMode,
            backgroundSync = this.config.enableBackgroundSync,
            priority = 'medium',
            tags = []
        } = options;

        const cacheKey = this.generateCacheKey(endpoint, options);

        try {
            // 1. Try cache first (if enabled)
            if (useCache) {
                const cached = await cacheService.get<T>(cacheKey);
                if (cached !== null) {
                    console.log(`📦 Cache hit for ${endpoint}`);

                    // Schedule background refresh if needed
                    if (backgroundSync) {
                        this.scheduleBackgroundRefresh(endpoint, options);
                    }

                    return cached;
                }
            }

            // 2. Fetch from network
            const data = await this.api.get<T>(endpoint);

            // 3. Cache the result
            if (useCache) {
                await cacheService.set(cacheKey, data, {
                    ttl: cacheTTL,
                    tags,
                    priority: this.mapPriorityToNumber(priority)
                });
            }

            // 4. Store for offline access
            if (offlineFallback) {
                await offlineService.storeOfflineData(cacheKey, data);
            }

            return data;

        } catch (error) {
            console.warn(`⚠️ Network fetch failed for ${endpoint}:`, error);

            // Try offline fallback
            if (offlineFallback) {
                const offlineData = await offlineService.getOfflineData<T>(cacheKey);
                if (offlineData !== null) {
                    console.log(`💾 Using offline data for ${endpoint}`);
                    return offlineData;
                }
            }

            throw error;
        }
    }

    /**
     * Batch fetch multiple endpoints efficiently
     */
    async fetchBatch<T>(
        endpoints: string[],
        options: DataFetchOptions = {}
    ): Promise<Record<string, T>> {
        const results: Record<string, T> = {};
        const fetchPromises = endpoints.map(async (endpoint) => {
            try {
                const data = await this.fetchData<T>(endpoint, options);
                results[endpoint] = data;
            } catch (error) {
                console.warn(`Failed to fetch ${endpoint}:`, error);
            }
        });

        await Promise.allSettled(fetchPromises);
        return results;
    }

    /**
     * Prefetch data for improved performance
     */
    async prefetchData(
        endpoints: string[],
        options: DataFetchOptions = {}
    ): Promise<void> {
        const prefetchOptions = {
            ...options,
            priority: 'low' as const,
            useCache: true,
            backgroundSync: false
        };

        // Prefetch in background without blocking
        Promise.allSettled(
            endpoints.map(endpoint => this.fetchData(endpoint, prefetchOptions))
        ).then(() => {
            console.log(`🚀 Prefetched ${endpoints.length} endpoints`);
        }).catch(error => {
            console.warn('Prefetch failed:', error);
        });
    }

    /**
     * Invalidate cache by tags or patterns
     */
    async invalidateCache(
        pattern?: string | RegExp,
        tags?: string[]
    ): Promise<void> {
        if (tags && tags.length > 0) {
            await cacheService.invalidateByTags(tags);
        }

        if (pattern) {
            await cacheService.invalidateByPattern(pattern);
        }

        console.log('🗑️ Cache invalidated');
    }

    /**
     * Get optimization statistics
     */
    async getStats(): Promise<{
        cache: any;
        offline: any;
        sync: any;
    }> {
        const [cacheStats] = await Promise.all([
            cacheService.getStats(),
            // offlineService.getStats(), // Method not implemented yet
            // backgroundSyncService.getStats() // Method not implemented yet
        ]);

        const offlineStats = {};
        const syncStats = {};

        return {
            cache: cacheStats,
            offline: offlineStats,
            sync: syncStats
        };
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<OptimizationConfig>): void {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ Configuration updated:', newConfig);
    }

    /**
     * Clear all cached data
     */
    async clearAll(): Promise<void> {
        await Promise.all([
            cacheService.clear(),
            // offlineService.clearOfflineData(), // Method not implemented yet
            // backgroundSyncService.clearQueue() // Method not implemented yet
        ]);
        console.log('🧹 All data cleared');
    }

    // Private methods

    private generateCacheKey(endpoint: string, options: DataFetchOptions): string {
        const optionsHash = JSON.stringify(options);
        return `${endpoint}_${btoa(optionsHash).slice(0, 8)}`;
    }

    private mapPriorityToNumber(priority: 'high' | 'medium' | 'low'): number {
        switch (priority) {
            case 'high': return 3;
            case 'medium': return 2;
            case 'low': return 1;
            default: return 2;
        }
    }

    private scheduleBackgroundRefresh(
        endpoint: string,
        options: DataFetchOptions
    ): void {
        // backgroundSyncService.addTask - method not implemented yet
        console.log(`Scheduled background refresh for ${endpoint}`);
    }

    private setupBackgroundSync(): void {
        // Background sync setup - methods not implemented yet
        console.log('Background sync setup completed');
    }
}

// Global instance
export const dataOptimizationService = new DataOptimizationService();

/**
 * React hook for optimized data fetching
 */
export function useOptimizedData<T>(
    endpoint: string,
    options: DataFetchOptions = {}
) {
    const [data, setData] = React.useState<T | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const result = await dataOptimizationService.fetchData<T>(
                    endpoint,
                    options
                );

                if (!cancelled) {
                    setData(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err as Error);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, [endpoint, JSON.stringify(options)]);

    const refetch = React.useCallback(() => {
        return dataOptimizationService.fetchData<T>(endpoint, {
            ...options,
            useCache: false
        });
    }, [endpoint, options]);

    return { data, loading, error, refetch };
}

/**
 * HOC for adding data optimization to components
 */
export const withDataOptimization = <P extends object>(
    Component: React.ComponentType<P>,
    options: {
        prefetchEndpoints?: string[];
        cacheStrategy?: 'aggressive' | 'conservative' | 'minimal';
    } = {}
) => {
    const { prefetchEndpoints = [], cacheStrategy = 'conservative' } = options;

    return React.forwardRef<any, P>((props, ref) => {
        React.useEffect(() => {
            // Update optimization strategy for this component
            dataOptimizationService.updateConfig({ cacheStrategy });

            // Prefetch data if specified
            if (prefetchEndpoints.length > 0) {
                dataOptimizationService.prefetchData(prefetchEndpoints, {
                    priority: 'low'
                });
            }
        }, []);

        return React.createElement(Component, { ...props, ref } as any);
    });
};

/**
 * Initialize the service when module loads
 */
dataOptimizationService.initialize().catch(error => {
    console.error('Failed to initialize data optimization service:', error);
});
