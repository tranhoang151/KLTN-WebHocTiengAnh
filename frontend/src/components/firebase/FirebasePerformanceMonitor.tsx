import React, { useState, useEffect } from 'react';
import { optimizedFirebaseService } from '../../services/optimizedFirebaseService';
import { useFirebasePerformance } from '../../hooks/useOptimizedFirebase';
import './FirebasePerformanceMonitor.css';

interface FirebasePerformanceMonitorProps {
  enabled?: boolean;
  showInProduction?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * Firebase performance monitoring component for development and debugging
 */
const FirebasePerformanceMonitor: React.FC<FirebasePerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  showInProduction = false,
  position = 'bottom-left',
  autoRefresh = true,
  refreshInterval = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'cache' | 'queries'>(
    'metrics'
  );
  const performanceMetrics = useFirebasePerformance();
  const [queryHistory, setQueryHistory] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'disconnected' | 'unknown'
  >('unknown');

  // Don't show in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  if (!enabled) {
    return null;
  }

  useEffect(() => {
    // Monitor connection status
    const checkConnection = () => {
      setConnectionStatus(navigator.onLine ? 'connected' : 'disconnected');
    };

    checkConnection();
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Update query history (in a real implementation, this would come from the service)
      setQueryHistory((prev) => {
        const newEntry = {
          timestamp: Date.now(),
          type: 'query',
          collection: 'sample',
          duration: Math.random() * 100,
          cached: Math.random() > 0.5,
        };
        return [...prev.slice(-19), newEntry]; // Keep last 20 entries
      });
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const positionClasses = {
    'top-right': 'firebase-monitor-top-right',
    'top-left': 'firebase-monitor-top-left',
    'bottom-right': 'firebase-monitor-bottom-right',
    'bottom-left': 'firebase-monitor-bottom-left',
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <>
      {/* Toggle button */}
      <button
        className={`firebase-monitor-toggle ${positionClasses[position]}`}
        onClick={() => setIsVisible(!isVisible)}
        title="Firebase Performance Monitor"
      >
        🔥
      </button>

      {/* Monitor panel */}
      {isVisible && (
        <div className={`firebase-monitor-panel ${positionClasses[position]}`}>
          <div className="firebase-monitor-header">
            <h3>Firebase Monitor</h3>
            <div className="connection-status">
              <span className={`status-indicator ${connectionStatus}`}>
                {connectionStatus === 'connected' ? '🟢' : '🔴'}
              </span>
              <span>{connectionStatus}</span>
            </div>
            <button
              className="firebase-monitor-close"
              onClick={() => setIsVisible(false)}
            >
              ✕
            </button>
          </div>

          {/* Tab navigation */}
          <div className="firebase-monitor-tabs">
            <button
              className={`tab ${activeTab === 'metrics' ? 'active' : ''}`}
              onClick={() => setActiveTab('metrics')}
            >
              Metrics
            </button>
            <button
              className={`tab ${activeTab === 'cache' ? 'active' : ''}`}
              onClick={() => setActiveTab('cache')}
            >
              Cache
            </button>
            <button
              className={`tab ${activeTab === 'queries' ? 'active' : ''}`}
              onClick={() => setActiveTab('queries')}
            >
              Queries
            </button>
          </div>

          {/* Tab content */}
          <div className="firebase-monitor-content">
            {activeTab === 'metrics' && (
              <MetricsTab metrics={performanceMetrics} />
            )}

            {activeTab === 'cache' && <CacheTab metrics={performanceMetrics} />}

            {activeTab === 'queries' && (
              <QueriesTab queryHistory={queryHistory} />
            )}
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Performance metrics tab
 */
const MetricsTab: React.FC<{ metrics: any }> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="loading-state">
        <div className="loading-spinner">⏳</div>
        <div>Loading metrics...</div>
      </div>
    );
  }

  return (
    <div className="metrics-tab">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Cache Size</div>
          <div className="metric-value">{metrics.cacheSize || 0}</div>
          <div className="metric-unit">entries</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Active Listeners</div>
          <div className="metric-value">{metrics.activeListeners || 0}</div>
          <div className="metric-unit">listeners</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Cache Hit Rate</div>
          <div className="metric-value">
            {((metrics.cacheHitRate || 0) * 100).toFixed(1)}%
          </div>
          <div className="metric-unit">hit rate</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Connection Pool</div>
          <div className="metric-value">{metrics.connectionPoolSize || 0}</div>
          <div className="metric-unit">connections</div>
        </div>
      </div>

      <div className="performance-chart">
        <h4>Performance Trends</h4>
        <div className="chart-placeholder">
          <div className="chart-bar" style={{ height: '60%' }}>
            <span>Query Time</span>
          </div>
          <div className="chart-bar" style={{ height: '80%' }}>
            <span>Cache Hit</span>
          </div>
          <div className="chart-bar" style={{ height: '40%' }}>
            <span>Errors</span>
          </div>
          <div className="chart-bar" style={{ height: '90%' }}>
            <span>Throughput</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Cache performance tab
 */
const CacheTab: React.FC<{ metrics: any }> = ({ metrics }) => {
  const [cacheEntries, setCacheEntries] = useState<any[]>([]);

  useEffect(() => {
    // Simulate cache entries (in real implementation, get from service)
    const entries = [
      { key: 'doc_users_123', size: '2.1 KB', ttl: '4m 32s', hits: 15 },
      { key: 'collection_flashcards', size: '15.7 KB', ttl: '2m 18s', hits: 8 },
      { key: 'doc_progress_456', size: '1.3 KB', ttl: '3m 45s', hits: 22 },
      { key: 'collection_badges', size: '8.2 KB', ttl: '1m 12s', hits: 5 },
    ];
    setCacheEntries(entries);
  }, []);

  return (
    <div className="cache-tab">
      <div className="cache-stats">
        <div className="stat-row">
          <span className="stat-label">Total Entries:</span>
          <span className="stat-value">{metrics?.cacheSize || 0}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Memory Usage:</span>
          <span className="stat-value">
            ~{((metrics?.cacheSize || 0) * 2.5).toFixed(1)} KB
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Hit Rate:</span>
          <span className="stat-value">
            {((metrics?.cacheHitRate || 0) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="cache-entries">
        <h4>Cache Entries</h4>
        <div className="entries-list">
          {cacheEntries.map((entry, index) => (
            <div key={index} className="cache-entry">
              <div className="entry-key">{entry.key}</div>
              <div className="entry-details">
                <span className="entry-size">{entry.size}</span>
                <span className="entry-ttl">TTL: {entry.ttl}</span>
                <span className="entry-hits">{entry.hits} hits</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cache-actions">
        <button
          className="action-btn"
          onClick={() => {
            // In real implementation, call service method
            console.log('Clearing cache...');
          }}
        >
          Clear Cache
        </button>
        <button
          className="action-btn"
          onClick={() => {
            // In real implementation, call service method
            console.log('Optimizing cache...');
          }}
        >
          Optimize
        </button>
      </div>
    </div>
  );
};

/**
 * Query history tab
 */
const QueriesTab: React.FC<{ queryHistory: any[] }> = ({ queryHistory }) => {
  const [filter, setFilter] = useState<'all' | 'cached' | 'network'>('all');

  const filteredQueries = queryHistory.filter((query) => {
    if (filter === 'cached') return query.cached;
    if (filter === 'network') return !query.cached;
    return true;
  });

  return (
    <div className="queries-tab">
      <div className="query-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({queryHistory.length})
        </button>
        <button
          className={`filter-btn ${filter === 'cached' ? 'active' : ''}`}
          onClick={() => setFilter('cached')}
        >
          Cached ({queryHistory.filter((q) => q.cached).length})
        </button>
        <button
          className={`filter-btn ${filter === 'network' ? 'active' : ''}`}
          onClick={() => setFilter('network')}
        >
          Network ({queryHistory.filter((q) => !q.cached).length})
        </button>
      </div>

      <div className="query-list">
        {filteredQueries.length === 0 ? (
          <div className="empty-state">
            <div>📊</div>
            <div>No queries yet</div>
          </div>
        ) : (
          filteredQueries
            .slice()
            .reverse()
            .map((query, index) => (
              <div key={index} className="query-item">
                <div className="query-header">
                  <span className="query-type">{query.type}</span>
                  <span className="query-collection">{query.collection}</span>
                  <span
                    className={`query-source ${query.cached ? 'cached' : 'network'}`}
                  >
                    {query.cached ? '💾 Cache' : '🌐 Network'}
                  </span>
                </div>
                <div className="query-details">
                  <span className="query-duration">
                    {query.duration.toFixed(1)}ms
                  </span>
                  <span className="query-time">
                    {new Date(query.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default FirebasePerformanceMonitor;


