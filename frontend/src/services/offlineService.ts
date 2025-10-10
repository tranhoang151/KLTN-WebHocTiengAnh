/**
 * Offline functionality and data synchronization service
 */

import React from 'react';
import { cacheService } from './cacheService';

interface QueuedOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data?: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: number;
  pendingOperations: number;
  syncInProgress: boolean;
}

/**
 * Offline service for handling data synchronization and offline functionality
 */
export class OfflineService {
  private operationQueue: QueuedOperation[] = [];
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    lastSync: 0,
    pendingOperations: 0,
    syncInProgress: false,
  };
  private syncListeners: ((status: SyncStatus) => void)[] = [];
  private readonly QUEUE_STORAGE_KEY = 'offline_queue';
  private readonly SYNC_STATUS_KEY = 'sync_status';

  constructor() {
    this.initializeOfflineService();
  }

  private initializeOfflineService() {
    // Load persisted queue and status
    this.loadPersistedData();

    // Setup network event listeners
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Setup periodic sync attempts
    setInterval(() => {
      if (this.syncStatus.isOnline && this.operationQueue.length > 0) {
        this.processSyncQueue();
      }
    }, 30000); // Every 30 seconds

    // Initial sync if online
    if (this.syncStatus.isOnline) {
      this.processSyncQueue();
    }
  }

  /**
   * Queue an operation for offline sync
   */
  queueOperation(
    operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>
  ): void {
    const queuedOp: QueuedOperation = {
      ...operation,
      id: this.generateOperationId(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.operationQueue.push(queuedOp);
    this.updateSyncStatus({ pendingOperations: this.operationQueue.length });
    this.persistQueue();

    // Try to sync immediately if online
    if (this.syncStatus.isOnline) {
      this.processSyncQueue();
    }
  }

  /**
   * Get offline data for a specific endpoint
   */
  async getOfflineData<T>(endpoint: string): Promise<T | null> {
    const cacheKey = `offline_${endpoint}`;
    return await cacheService.get<T>(cacheKey);
  }

  /**
   * Store data for offline access
   */
  async storeOfflineData<T>(
    endpoint: string,
    data: T,
    ttl?: number
  ): Promise<void> {
    const cacheKey = `offline_${endpoint}`;
    await cacheService.set(cacheKey, data, {
      ttl: ttl || 24 * 60 * 60 * 1000, // 24 hours default
      tags: ['offline'],
      persist: true,
    });
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return this.syncStatus.isOnline;
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Add sync status listener
   */
  addSyncListener(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.syncListeners.indexOf(listener);
      if (index > -1) {
        this.syncListeners.splice(index, 1);
      }
    };
  }

  /**
   * Force sync attempt
   */
  async forceSync(): Promise<void> {
    if (this.syncStatus.syncInProgress) {
      return;
    }

    await this.processSyncQueue();
  }

  /**
   * Clear offline data
   */
  async clearOfflineData(): Promise<void> {
    await cacheService.clearByTags(['offline']);
    this.operationQueue = [];
    this.updateSyncStatus({ pendingOperations: 0 });
    this.persistQueue();
  }

  /**
   * Get pending operations count
   */
  getPendingOperationsCount(): number {
    return this.operationQueue.length;
  }

  /**
   * Get pending operations for debugging
   */
  getPendingOperations(): QueuedOperation[] {
    return [...this.operationQueue];
  }

  private handleOnline() {
    console.log('Device came online, starting sync...');
    this.updateSyncStatus({ isOnline: true });
    this.processSyncQueue();
  }

  private handleOffline() {
    console.log('Device went offline');
    this.updateSyncStatus({ isOnline: false });
  }

  private async processSyncQueue(): Promise<void> {
    if (this.syncStatus.syncInProgress || this.operationQueue.length === 0) {
      return;
    }

    this.updateSyncStatus({ syncInProgress: true });

    const operations = [...this.operationQueue];
    const successfulOperations: string[] = [];

    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
        successfulOperations.push(operation.id);
        console.log(`Successfully synced operation ${operation.id}`);
      } catch (error) {
        console.warn(`Failed to sync operation ${operation.id}:`, error);

        // Increment retry count
        operation.retryCount++;

        // Remove if max retries reached
        if (operation.retryCount >= operation.maxRetries) {
          console.error(
            `Operation ${operation.id} exceeded max retries, removing from queue`
          );
          successfulOperations.push(operation.id);
        }
      }
    }

    // Remove successful operations from queue
    this.operationQueue = this.operationQueue.filter(
      (op) => !successfulOperations.includes(op.id)
    );

    this.updateSyncStatus({
      syncInProgress: false,
      lastSync: Date.now(),
      pendingOperations: this.operationQueue.length,
    });

    this.persistQueue();
  }

  private async executeOperation(operation: QueuedOperation): Promise<void> {
    const { type, endpoint, data } = operation;

    let response: Response;

    switch (type) {
      case 'CREATE':
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getAuthToken()}`,
          },
          body: JSON.stringify(data),
        });
        break;

      case 'UPDATE':
        response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getAuthToken()}`,
          },
          body: JSON.stringify(data),
        });
        break;

      case 'DELETE':
        response = await fetch(endpoint, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${await this.getAuthToken()}`,
          },
        });
        break;

      default:
        throw new Error(`Unknown operation type: ${type}`);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private async getAuthToken(): Promise<string> {
    // Get auth token from your auth service
    // This is a placeholder - implement based on your auth system
    return localStorage.getItem('authToken') || '';
  }

  private updateSyncStatus(updates: Partial<SyncStatus>): void {
    this.syncStatus = { ...this.syncStatus, ...updates };

    // Persist sync status
    localStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(this.syncStatus));

    // Notify listeners
    this.syncListeners.forEach((listener) => listener(this.syncStatus));
  }

  private persistQueue(): void {
    localStorage.setItem(
      this.QUEUE_STORAGE_KEY,
      JSON.stringify(this.operationQueue)
    );
  }

  private loadPersistedData(): void {
    // Load operation queue
    const queueData = localStorage.getItem(this.QUEUE_STORAGE_KEY);
    if (queueData) {
      try {
        this.operationQueue = JSON.parse(queueData);
      } catch (error) {
        console.warn('Failed to load persisted operation queue:', error);
        this.operationQueue = [];
      }
    }

    // Load sync status
    const statusData = localStorage.getItem(this.SYNC_STATUS_KEY);
    if (statusData) {
      try {
        const persistedStatus = JSON.parse(statusData);
        this.syncStatus = {
          ...this.syncStatus,
          ...persistedStatus,
          isOnline: navigator.onLine, // Always use current online status
          syncInProgress: false, // Reset sync in progress flag
        };
      } catch (error) {
        console.warn('Failed to load persisted sync status:', error);
      }
    }

    // Update pending operations count
    this.syncStatus.pendingOperations = this.operationQueue.length;
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global offline service instance
export const offlineService = new OfflineService();

/**
 * Hook for using offline service in React components
 */
export const useOfflineService = () => {
  const [syncStatus, setSyncStatus] = React.useState<SyncStatus>(
    offlineService.getSyncStatus()
  );

  React.useEffect(() => {
    const unsubscribe = offlineService.addSyncListener(setSyncStatus);
    return unsubscribe;
  }, []);

  return {
    syncStatus,
    isOnline: syncStatus.isOnline,
    pendingOperations: syncStatus.pendingOperations,
    queueOperation: offlineService.queueOperation.bind(offlineService),
    forceSync: offlineService.forceSync.bind(offlineService),
    getOfflineData: offlineService.getOfflineData.bind(offlineService),
    storeOfflineData: offlineService.storeOfflineData.bind(offlineService),
  };
};

/**
 * Offline-aware API wrapper
 */
export class OfflineAwareAPI {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async get<T>(
    endpoint: string,
    options: {
      useCache?: boolean;
      cacheTTL?: number;
      offlineFallback?: boolean;
    } = {}
  ): Promise<T> {
    const {
      useCache = true,
      cacheTTL = 5 * 60 * 1000,
      offlineFallback = true,
    } = options;

    const fullURL = `${this.baseURL}${endpoint}`;
    const cacheKey = `api_${endpoint}`;

    // Try cache first if enabled
    if (useCache) {
      const cached = await cacheService.get<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    // Try network request
    if (offlineService.isOnline()) {
      try {
        const response = await fetch(fullURL, {
          headers: {
            Authorization: `Bearer ${await this.getAuthToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Cache the response
        if (useCache) {
          await cacheService.set(cacheKey, data, { ttl: cacheTTL });
          await offlineService.storeOfflineData(endpoint, data);
        }

        return data;
      } catch (error) {
        console.warn(`Network request failed for ${endpoint}:`, error);

        // Fall back to offline data if available
        if (offlineFallback) {
          const offlineData = await offlineService.getOfflineData<T>(endpoint);
          if (offlineData !== null) {
            return offlineData;
          }
        }

        throw error;
      }
    } else {
      // Device is offline, try to get offline data
      if (offlineFallback) {
        const offlineData = await offlineService.getOfflineData<T>(endpoint);
        if (offlineData !== null) {
          return offlineData;
        }
      }

      throw new Error('Device is offline and no cached data available');
    }
  }

  async post<T>(
    endpoint: string,
    data: any,
    options: {
      queueIfOffline?: boolean;
      maxRetries?: number;
    } = {}
  ): Promise<T> {
    const { queueIfOffline = true, maxRetries = 3 } = options;

    const fullURL = `${this.baseURL}${endpoint}`;

    if (offlineService.isOnline()) {
      try {
        const response = await fetch(fullURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getAuthToken()}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        if (queueIfOffline) {
          offlineService.queueOperation({
            type: 'CREATE',
            endpoint: fullURL,
            data,
            maxRetries,
          });
        }
        throw error;
      }
    } else {
      if (queueIfOffline) {
        offlineService.queueOperation({
          type: 'CREATE',
          endpoint: fullURL,
          data,
          maxRetries,
        });

        // Return a placeholder response for offline operations
        return { queued: true, timestamp: Date.now() } as any;
      } else {
        throw new Error('Device is offline');
      }
    }
  }

  async put<T>(
    endpoint: string,
    data: any,
    options: {
      queueIfOffline?: boolean;
      maxRetries?: number;
    } = {}
  ): Promise<T> {
    const { queueIfOffline = true, maxRetries = 3 } = options;

    const fullURL = `${this.baseURL}${endpoint}`;

    if (offlineService.isOnline()) {
      try {
        const response = await fetch(fullURL, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${await this.getAuthToken()}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        if (queueIfOffline) {
          offlineService.queueOperation({
            type: 'UPDATE',
            endpoint: fullURL,
            data,
            maxRetries,
          });
        }
        throw error;
      }
    } else {
      if (queueIfOffline) {
        offlineService.queueOperation({
          type: 'UPDATE',
          endpoint: fullURL,
          data,
          maxRetries,
        });

        return { queued: true, timestamp: Date.now() } as any;
      } else {
        throw new Error('Device is offline');
      }
    }
  }

  async delete<T>(
    endpoint: string,
    options: {
      queueIfOffline?: boolean;
      maxRetries?: number;
    } = {}
  ): Promise<T> {
    const { queueIfOffline = true, maxRetries = 3 } = options;

    const fullURL = `${this.baseURL}${endpoint}`;

    if (offlineService.isOnline()) {
      try {
        const response = await fetch(fullURL, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${await this.getAuthToken()}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        if (queueIfOffline) {
          offlineService.queueOperation({
            type: 'DELETE',
            endpoint: fullURL,
            maxRetries,
          });
        }
        throw error;
      }
    } else {
      if (queueIfOffline) {
        offlineService.queueOperation({
          type: 'DELETE',
          endpoint: fullURL,
          maxRetries,
        });

        return { queued: true, timestamp: Date.now() } as any;
      } else {
        throw new Error('Device is offline');
      }
    }
  }

  private async getAuthToken(): Promise<string> {
    return localStorage.getItem('authToken') || '';
  }
}
