/**
 * Background data synchronization service
 */

import React from 'react';
import { cacheService } from './cacheService';
import { offlineService } from './offlineService';

interface SyncTask {
  id: string;
  name: string;
  fetchFn: () => Promise<any>;
  interval: number;
  lastRun: number;
  nextRun: number;
  enabled: boolean;
  priority: 'high' | 'medium' | 'low';
  cacheKey?: string;
  tags?: string[];
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface SyncStats {
  totalTasks: number;
  activeTasks: number;
  completedSyncs: number;
  failedSyncs: number;
  lastSyncTime: number;
  averageSyncTime: number;
}

/**
 * Background synchronization service for efficient data management
 */
export class BackgroundSyncService {
  private tasks = new Map<string, SyncTask>();
  private isRunning = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private stats: SyncStats = {
    totalTasks: 0,
    activeTasks: 0,
    completedSyncs: 0,
    failedSyncs: 0,
    lastSyncTime: 0,
    averageSyncTime: 0,
  };
  private syncTimes: number[] = [];
  private readonly MAX_SYNC_TIME_SAMPLES = 100;

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    // Start the sync loop
    this.start();

    // Handle visibility change to optimize sync frequency
    document.addEventListener(
      'visibilitychange',
      this.handleVisibilityChange.bind(this)
    );

    // Handle online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Setup periodic cleanup
    setInterval(() => this.cleanup(), 10 * 60 * 1000); // Every 10 minutes
  }

  /**
   * Register a sync task
   */
  registerTask(config: {
    id: string;
    name: string;
    fetchFn: () => Promise<any>;
    interval: number;
    priority?: 'high' | 'medium' | 'low';
    cacheKey?: string;
    tags?: string[];
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
    enabled?: boolean;
  }): void {
    const task: SyncTask = {
      ...config,
      priority: config.priority || 'medium',
      enabled: config.enabled !== false,
      lastRun: 0,
      nextRun: Date.now() + config.interval,
    };

    this.tasks.set(config.id, task);
    this.updateStats();

    console.log(`Registered sync task: ${config.name} (${config.id})`);
  }

  /**
   * Unregister a sync task
   */
  unregisterTask(taskId: string): void {
    if (this.tasks.delete(taskId)) {
      this.updateStats();
      console.log(`Unregistered sync task: ${taskId}`);
    }
  }

  /**
   * Enable/disable a sync task
   */
  setTaskEnabled(taskId: string, enabled: boolean): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.enabled = enabled;
      this.updateStats();
    }
  }

  /**
   * Force sync a specific task
   */
  async syncTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    await this.executeTask(task);
  }

  /**
   * Force sync all tasks
   */
  async syncAll(): Promise<void> {
    const tasks = Array.from(this.tasks.values()).filter(
      (task) => task.enabled
    );
    await Promise.all(tasks.map((task) => this.executeTask(task)));
  }

  /**
   * Start the background sync service
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.syncInterval = setInterval(() => {
      this.processSyncTasks();
    }, 5000); // Check every 5 seconds

    console.log('Background sync service started');
  }

  /**
   * Stop the background sync service
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    console.log('Background sync service stopped');
  }

  /**
   * Get sync statistics
   */
  getStats(): SyncStats {
    return { ...this.stats };
  }

  /**
   * Get all registered tasks
   */
  getTasks(): SyncTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Clear all sync data and reset
   */
  async reset(): Promise<void> {
    this.tasks.clear();
    this.stats = {
      totalTasks: 0,
      activeTasks: 0,
      completedSyncs: 0,
      failedSyncs: 0,
      lastSyncTime: 0,
      averageSyncTime: 0,
    };
    this.syncTimes = [];

    // Clear related cache data
    await cacheService.clearByTags(['background-sync']);
  }

  private async processSyncTasks(): Promise<void> {
    if (!navigator.onLine) return;

    const now = Date.now();
    const tasksToRun = Array.from(this.tasks.values())
      .filter((task) => task.enabled && task.nextRun <= now)
      .sort((a, b) => {
        // Sort by priority and next run time
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff =
          priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.nextRun - b.nextRun;
      });

    // Limit concurrent tasks based on priority
    const maxConcurrentTasks = document.hidden ? 2 : 5;
    const tasksToExecute = tasksToRun.slice(0, maxConcurrentTasks);

    if (tasksToExecute.length > 0) {
      await Promise.allSettled(
        tasksToExecute.map((task) => this.executeTask(task))
      );
    }
  }

  private async executeTask(task: SyncTask): Promise<void> {
    const startTime = Date.now();

    try {
      console.log(`Executing sync task: ${task.name}`);

      const data = await task.fetchFn();

      // Cache the result if cache key is provided
      if (task.cacheKey) {
        await cacheService.set(task.cacheKey, data, {
          ttl: task.interval * 2, // Cache for twice the sync interval
          tags: ['background-sync', ...(task.tags || [])],
        });
      }

      // Update task timing
      const now = Date.now();
      task.lastRun = now;
      task.nextRun = now + task.interval;

      // Update stats
      this.stats.completedSyncs++;
      this.stats.lastSyncTime = now;
      this.recordSyncTime(now - startTime);

      // Call success callback
      task.onSuccess?.(data);

      console.log(`Sync task completed: ${task.name} (${now - startTime}ms)`);
    } catch (error) {
      console.warn(`Sync task failed: ${task.name}`, error);

      // Update task timing (with backoff)
      const now = Date.now();
      task.lastRun = now;
      task.nextRun = now + task.interval * 2; // Double the interval on failure

      // Update stats
      this.stats.failedSyncs++;

      // Call error callback
      task.onError?.(error as Error);
    }
  }

  private recordSyncTime(duration: number): void {
    this.syncTimes.push(duration);

    // Keep only recent samples
    if (this.syncTimes.length > this.MAX_SYNC_TIME_SAMPLES) {
      this.syncTimes.shift();
    }

    // Calculate average
    this.stats.averageSyncTime =
      this.syncTimes.reduce((sum, time) => sum + time, 0) /
      this.syncTimes.length;
  }

  private updateStats(): void {
    this.stats.totalTasks = this.tasks.size;
    this.stats.activeTasks = Array.from(this.tasks.values()).filter(
      (task) => task.enabled
    ).length;
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Reduce sync frequency when page is hidden
      console.log('Page hidden, reducing sync frequency');
    } else {
      // Resume normal sync frequency when page is visible
      console.log('Page visible, resuming normal sync frequency');
      // Trigger immediate sync for high priority tasks
      this.syncHighPriorityTasks();
    }
  }

  private handleOnline(): void {
    console.log('Device came online, resuming background sync');
    this.syncHighPriorityTasks();
  }

  private handleOffline(): void {
    console.log('Device went offline, pausing background sync');
  }

  private async syncHighPriorityTasks(): Promise<void> {
    const highPriorityTasks = Array.from(this.tasks.values()).filter(
      (task) => task.enabled && task.priority === 'high'
    );

    await Promise.allSettled(
      highPriorityTasks.map((task) => this.executeTask(task))
    );
  }

  private cleanup(): void {
    // Remove old cache entries
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

    // This is a simplified cleanup - in a real implementation,
    // you might want to track cache entry timestamps more precisely
    console.log('Performing background sync cleanup');
  }
}

// Global background sync service instance
export const backgroundSyncService = new BackgroundSyncService();

/**
 * Predefined sync tasks for common data types
 */
export const commonSyncTasks = {
  // User progress sync
  userProgress: (userId: string) => ({
    id: `user-progress-${userId}`,
    name: 'User Progress Sync',
    fetchFn: async () => {
      const response = await fetch(`/api/users/${userId}/progress`);
      return response.json();
    },
    interval: 2 * 60 * 1000, // 2 minutes
    priority: 'high' as const,
    cacheKey: `user-progress-${userId}`,
    tags: ['user-data', 'progress'],
  }),

  // Flashcard sets sync
  flashcardSets: (courseId: string) => ({
    id: `flashcard-sets-${courseId}`,
    name: 'Flashcard Sets Sync',
    fetchFn: async () => {
      const response = await fetch(`/api/flashcard/sets/${courseId}`);
      return response.json();
    },
    interval: 10 * 60 * 1000, // 10 minutes
    priority: 'medium' as const,
    cacheKey: `flashcard-sets-${courseId}`,
    tags: ['flashcards', 'content'],
  }),

  // Badge updates sync
  badgeUpdates: (userId: string) => ({
    id: `badge-updates-${userId}`,
    name: 'Badge Updates Sync',
    fetchFn: async () => {
      const response = await fetch(`/api/badges/user/${userId}`);
      return response.json();
    },
    interval: 5 * 60 * 1000, // 5 minutes
    priority: 'medium' as const,
    cacheKey: `user-badges-${userId}`,
    tags: ['badges', 'gamification'],
  }),

  // System announcements sync
  systemAnnouncements: () => ({
    id: 'system-announcements',
    name: 'System Announcements Sync',
    fetchFn: async () => {
      const response = await fetch('/api/system/announcements');
      return response.json();
    },
    interval: 15 * 60 * 1000, // 15 minutes
    priority: 'low' as const,
    cacheKey: 'system-announcements',
    tags: ['system', 'announcements'],
  }),
};

/**
 * React hook for using background sync service
 */
export const useBackgroundSync = () => {
  const [stats, setStats] = React.useState<SyncStats>(
    backgroundSyncService.getStats()
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(backgroundSyncService.getStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    registerTask: backgroundSyncService.registerTask.bind(
      backgroundSyncService
    ),
    unregisterTask: backgroundSyncService.unregisterTask.bind(
      backgroundSyncService
    ),
    syncTask: backgroundSyncService.syncTask.bind(backgroundSyncService),
    syncAll: backgroundSyncService.syncAll.bind(backgroundSyncService),
    setTaskEnabled: backgroundSyncService.setTaskEnabled.bind(
      backgroundSyncService
    ),
    getTasks: backgroundSyncService.getTasks.bind(backgroundSyncService),
  };
};
