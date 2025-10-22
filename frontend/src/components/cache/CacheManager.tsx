import React, { useState, useEffect } from 'react';
import { cacheService } from '../../services/cacheService';
import {
  offlineService,
  useOfflineService,
} from '../../services/offlineService';
import {
  backgroundSyncService,
  useBackgroundSync,
} from '../../services/backgroundSyncService';
import './CacheManager.css';

interface CacheManagerProps {
  showInProduction?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Cache management component for monitoring and controlling cache behavior
 */
const CacheManager: React.FC<CacheManagerProps> = ({
  showInProduction = false,
  position = 'bottom-right',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'cache' | 'offline' | 'sync'>(
    'cache'
  );
  const [cacheStats, setCacheStats] = useState<any>({});
  const { syncStatus } = useOfflineService();
  const { stats: syncStats } = useBackgroundSync();

  // Don't show in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  useEffect(() => {
    const updateStats = () => {
      setCacheStats(cacheService.getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleClearCache = async () => {
    await cacheService.clear();
    setCacheStats(cacheService.getStats());
  };

  const handleClearOfflineData = async () => {
    await offlineService.clearOfflineData();
  };

  const handleForceSync = async () => {
    await offlineService.forceSync();
    await backgroundSyncService.syncAll();
  };

  const positionClasses = {
    'top-right': 'cache-manager-top-right',
    'top-left': 'cache-manager-top-left',
    'bottom-right': 'cache-manager-bottom-right',
    'bottom-left': 'cache-manager-bottom-left',
  };

  return (
    <>
      {/* Toggle button */}
      <button
        className={`cache-manager-toggle ${positionClasses[position]}`}
        onClick={() => setIsVisible(!isVisible)}
        title="Cache Manager"
      >
        🗄️
      </button>

      {/* Cache manager panel */}
      {isVisible && (
        <div className={`cache-manager-panel ${positionClasses[position]}`}>
          <div className="cache-manager-header">
            <h3>Cache Manager</h3>
            <button
              className="cache-manager-close"
              onClick={() => setIsVisible(false)}
            >
              ✕
            </button>
          </div>

          {/* Tab navigation */}
          <div className="cache-manager-tabs">
            <button
              className={`tab ${activeTab === 'cache' ? 'active' : ''}`}
              onClick={() => setActiveTab('cache')}
            >
              Cache
            </button>
            <button
              className={`tab ${activeTab === 'offline' ? 'active' : ''}`}
              onClick={() => setActiveTab('offline')}
            >
              Offline
            </button>
            <button
              className={`tab ${activeTab === 'sync' ? 'active' : ''}`}
              onClick={() => setActiveTab('sync')}
            >
              Sync
            </button>
          </div>

          {/* Tab content */}
          <div className="cache-manager-content">
            {activeTab === 'cache' && (
              <CacheTab stats={cacheStats} onClearCache={handleClearCache} />
            )}

            {activeTab === 'offline' && (
              <OfflineTab
                syncStatus={syncStatus}
                onClearOfflineData={handleClearOfflineData}
                onForceSync={handleForceSync}
              />
            )}

            {activeTab === 'sync' && (
              <SyncTab stats={syncStats} onForceSync={handleForceSync} />
            )}
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Cache statistics tab
 */
const CacheTab: React.FC<{
  stats: any;
  onClearCache: () => void;
}> = ({ stats, onClearCache }) => {
  return (
    <div className="cache-tab">
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Memory Cache:</span>
          <span className="stat-value">{stats.memorySize || 0} items</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Persisted Cache:</span>
          <span className="stat-value">{stats.persistedSize || 0} items</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Hit Rate:</span>
          <span className="stat-value">
            {((stats.hitRate || 0) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Compression:</span>
          <span className="stat-value">
            {stats.compressionSupported ? '✅ Supported' : '❌ Not Supported'}
          </span>
        </div>
      </div>

      <div className="cache-actions">
        <button className="action-button danger" onClick={onClearCache}>
          Clear All Cache
        </button>
      </div>

      {stats.memoryKeys && stats.memoryKeys.length > 0 && (
        <div className="cache-keys">
          <h4>Cached Keys:</h4>
          <div className="key-list">
            {stats.memoryKeys.slice(0, 10).map((key: string, index: number) => (
              <div key={index} className="cache-key">
                {key}
              </div>
            ))}
            {stats.memoryKeys.length > 10 && (
              <div className="cache-key more">
                +{stats.memoryKeys.length - 10} more...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Offline functionality tab
 */
const OfflineTab: React.FC<{
  syncStatus: any;
  onClearOfflineData: () => void;
  onForceSync: () => void;
}> = ({ syncStatus, onClearOfflineData, onForceSync }) => {
  return (
    <div className="offline-tab">
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Status:</span>
          <span
            className={`stat-value ${syncStatus.isOnline ? 'online' : 'offline'}`}
          >
            {syncStatus.isOnline ? '🟢 Online' : '🔴 Offline'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pending Operations:</span>
          <span className="stat-value">{syncStatus.pendingOperations}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Last Sync:</span>
          <span className="stat-value">
            {syncStatus.lastSync
              ? new Date(syncStatus.lastSync).toLocaleTimeString()
              : 'Never'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Sync Status:</span>
          <span className="stat-value">
            {syncStatus.syncInProgress ? '🔄 Syncing...' : '✅ Idle'}
          </span>
        </div>
      </div>

      <div className="offline-actions">
        <button
          className="action-button primary"
          onClick={onForceSync}
          disabled={!syncStatus.isOnline || syncStatus.syncInProgress}
        >
          Force Sync
        </button>
        <button className="action-button danger" onClick={onClearOfflineData}>
          Clear Offline Data
        </button>
      </div>

      {syncStatus.pendingOperations > 0 && (
        <div className="pending-operations">
          <h4>Pending Operations:</h4>
          <div className="operation-list">
            <div className="operation-item">
              {syncStatus.pendingOperations} operations queued for sync
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Background sync tab
 */
const SyncTab: React.FC<{
  stats: any;
  onForceSync: () => void;
}> = ({ stats, onForceSync }) => {
  const tasks = backgroundSyncService.getTasks();

  return (
    <div className="sync-tab">
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Total Tasks:</span>
          <span className="stat-value">{stats.totalTasks}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active Tasks:</span>
          <span className="stat-value">{stats.activeTasks}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Completed Syncs:</span>
          <span className="stat-value">{stats.completedSyncs}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Failed Syncs:</span>
          <span className="stat-value">{stats.failedSyncs}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Avg Sync Time:</span>
          <span className="stat-value">
            {stats.averageSyncTime
              ? `${stats.averageSyncTime.toFixed(0)}ms`
              : 'N/A'}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Last Sync:</span>
          <span className="stat-value">
            {stats.lastSyncTime
              ? new Date(stats.lastSyncTime).toLocaleTimeString()
              : 'Never'}
          </span>
        </div>
      </div>

      <div className="sync-actions">
        <button className="action-button primary" onClick={onForceSync}>
          Force Sync All
        </button>
      </div>

      {tasks.length > 0 && (
        <div className="sync-tasks">
          <h4>Sync Tasks:</h4>
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className="task-item">
                <div className="task-info">
                  <span className="task-name">{task.name}</span>
                  <span
                    className={`task-status ${task.enabled ? 'enabled' : 'disabled'}`}
                  >
                    {task.enabled ? '✅' : '❌'}
                  </span>
                </div>
                <div className="task-details">
                  <span className="task-priority priority-{task.priority}">
                    {task.priority}
                  </span>
                  <span className="task-interval">
                    {Math.round(task.interval / 1000)}s
                  </span>
                  <span className="task-next-run">
                    Next:{' '}
                    {task.nextRun > Date.now()
                      ? `${Math.round((task.nextRun - Date.now()) / 1000)}s`
                      : 'Now'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CacheManager;


