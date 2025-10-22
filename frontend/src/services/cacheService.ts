/**
 * Efficient caching service with memory and localStorage support
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags?: string[];
  persist?: boolean;
  priority?: number;
}

interface CacheOptions {
  ttl?: number;
  tags?: string[];
  persist?: boolean;
  priority?: number;
}

interface CacheStats {
  memoryEntries: number;
  persistentEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
}

/**
 * Advanced caching service with multiple storage layers
 */
export class CacheService {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private maxMemorySize = 100; // Maximum number of entries in memory
  private compressionEnabled = false;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  constructor(options: {
    maxMemorySize?: number;
    compressionEnabled?: boolean;
  } = {}) {
    this.maxMemorySize = options.maxMemorySize || 100;
    this.compressionEnabled = options.compressionEnabled || false;
  }

  /**
   * Initialize the cache service
   */
  async initialize(options: {
    maxSize?: number;
    defaultTTL?: number;
    compressionEnabled?: boolean;
  } = {}): Promise<void> {
    if (options.maxSize) {
      this.maxMemorySize = options.maxSize;
    }
    if (options.compressionEnabled !== undefined) {
      this.compressionEnabled = options.compressionEnabled;
    }
    console.log('✅ Cache service initialized');
  }

  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && this.isValid(memoryEntry)) {
      this.stats.hits++;
      return memoryEntry.data;
    }

    // Check localStorage for persistent entries
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored);
        if (this.isValid(entry)) {
          // Move back to memory cache if there's space
          if (this.memoryCache.size < this.maxMemorySize) {
            this.memoryCache.set(key, entry);
          }
          this.stats.hits++;
          return entry.data;
        } else {
          // Remove expired entry
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Set cached data
   */
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const {
      ttl = 5 * 60 * 1000, // 5 minutes default
      tags = [],
      persist = false,
      priority = 1,
    } = options;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      tags,
      persist,
      priority,
    };

    // Always store in memory cache
    this.memoryCache.set(key, entry);

    // Evict old entries if memory cache is full
    if (this.memoryCache.size > this.maxMemorySize) {
      this.evictOldest();
    }

    // Store in localStorage if persistent
    if (persist) {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      } catch (error) {
        console.warn('Failed to write to localStorage:', error);
      }
    }

    this.stats.sets++;
  }

  /**
   * Delete cached data
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);

    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }

    this.stats.deletes++;
  }

  /**
   * Clear all cached data
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();

    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  /**
   * Clear cache entries by tags
   */
  async clearByTags(tags: string[]): Promise<void> {
    // Clear from memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags && entry.tags.some((tag: string) => tags.includes(tag))) {
        this.memoryCache.delete(key);
      }
    }

    // Clear from localStorage
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('cache_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry = JSON.parse(stored);
            if (entry.tags && entry.tags.some((tag: string) => tags.includes(tag))) {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to clear by tags from localStorage:', error);
    }
  }

  /**
   * Invalidate cache entries by tags (alias for clearByTags)
   */
  async invalidateByTags(tags: string[]): Promise<void> {
    return this.clearByTags(tags);
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidateByPattern(pattern: string | RegExp): Promise<void> {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    // Clear from memory cache
    for (const [key] of this.memoryCache.entries()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear from localStorage
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('cache_')) {
          const cacheKey = key.replace('cache_', '');
          if (regex.test(cacheKey)) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to clear by pattern from localStorage:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    const missRate = totalRequests > 0 ? this.stats.misses / totalRequests : 0;

    let persistentEntries = 0;
    try {
      const keys = Object.keys(localStorage);
      persistentEntries = keys.filter(key => key.startsWith('cache_')).length;
    } catch (error) {
      console.warn('Failed to count localStorage entries:', error);
    }

    return {
      memoryEntries: this.memoryCache.size,
      persistentEntries,
      totalSize: this.memoryCache.size + persistentEntries,
      hitRate,
      missRate,
    };
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Evict oldest entries from memory cache
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }
}

// Global cache service instance
export const cacheService = new CacheService({
  maxMemorySize: 200,
  compressionEnabled: false, // Disabled for compatibility
});
