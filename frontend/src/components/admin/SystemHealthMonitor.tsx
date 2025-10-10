import React, { useState, useEffect } from 'react';
import systemConfigService, {
  SystemHealth,
} from '../../services/systemConfigService';

const SystemHealthMonitor: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    loadSystemHealth();

    if (autoRefresh) {
      const interval = setInterval(loadSystemHealth, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh]);

  const loadSystemHealth = async () => {
    try {
      if (loading) setLoading(true);
      const data = await systemConfigService.getSystemHealth();
      setHealth(data);
    } catch (error) {
      console.error('Failed to load system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh((prev) => !prev);
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'connected':
      case 'available':
        return 'status-healthy';
      case 'degraded':
      case 'warning':
        return 'status-warning';
      case 'unhealthy':
      case 'disconnected':
      case 'error':
        return 'status-error';
      default:
        return 'status-info';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'connected':
      case 'available':
        return '✅';
      case 'degraded':
      case 'warning':
        return '⚠️';
      case 'unhealthy':
      case 'disconnected':
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  if (loading && !health) {
    return (
      <div className="config-section">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading system health...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="config-section">
      <div className="section-header">
        <h2 className="section-title">System Health Monitor</h2>
        <p className="section-description">
          Real-time monitoring of system components and performance metrics
        </p>
      </div>

      <div className="health-controls">
        <div className="refresh-controls">
          <button className="btn btn-outline" onClick={loadSystemHealth}>
            🔄 Refresh Now
          </button>

          <div className="auto-refresh-toggle">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={toggleAutoRefresh}
              />
              <span className="toggle-slider"></span>
            </label>
            <span>Auto-refresh (30s)</span>
          </div>
        </div>

        {health && (
          <div className="last-updated">
            Last updated: {new Date(health.lastCheck).toLocaleString()}
          </div>
        )}
      </div>

      {health && (
        <div className="health-dashboard">
          <div className="health-overview">
            <div className="overall-status">
              <div
                className={`status-indicator ${getStatusColor(health.status)}`}
              >
                <span>{getStatusIcon(health.status)}</span>
                System Status: {health.status.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="health-metrics">
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <h4>Database</h4>
                  <div
                    className={`status-indicator ${getStatusColor(health.databaseStatus)}`}
                  >
                    <span>{getStatusIcon(health.databaseStatus)}</span>
                    {health.databaseStatus}
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h4>Firebase</h4>
                  <div
                    className={`status-indicator ${getStatusColor(health.firebaseStatus)}`}
                  >
                    <span>{getStatusIcon(health.firebaseStatus)}</span>
                    {health.firebaseStatus}
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h4>Storage</h4>
                  <div
                    className={`status-indicator ${getStatusColor(health.storageStatus)}`}
                  >
                    <span>{getStatusIcon(health.storageStatus)}</span>
                    {health.storageStatus}
                  </div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h4>Memory Usage</h4>
                </div>
                <div className="metric-value">
                  {formatBytes(health.memoryUsageMB * 1024 * 1024)}
                </div>
                <div className="metric-bar">
                  <div
                    className="metric-fill"
                    style={{
                      width: `${Math.min((health.memoryUsageMB / 1024) * 100, 100)}%`,
                      backgroundColor:
                        health.memoryUsageMB > 800
                          ? '#dc3545'
                          : health.memoryUsageMB > 500
                            ? '#ffc107'
                            : '#28a745',
                    }}
                  ></div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h4>CPU Usage</h4>
                </div>
                <div className="metric-value">
                  {health.cpuUsagePercent.toFixed(1)}%
                </div>
                <div className="metric-bar">
                  <div
                    className="metric-fill"
                    style={{
                      width: `${health.cpuUsagePercent}%`,
                      backgroundColor:
                        health.cpuUsagePercent > 80
                          ? '#dc3545'
                          : health.cpuUsagePercent > 60
                            ? '#ffc107'
                            : '#28a745',
                    }}
                  ></div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h4>Active Users</h4>
                </div>
                <div className="metric-value">{health.activeUsers}</div>
              </div>

              <div className="metric-card">
                <div className="metric-header">
                  <h4>System Uptime</h4>
                </div>
                <div className="metric-value">
                  {formatUptime(health.uptimeSeconds)}
                </div>
              </div>
            </div>
          </div>

          <div className="health-alerts">
            <h4>System Alerts</h4>
            <div className="alerts-list">
              {health.status !== 'healthy' && (
                <div className="alert alert-error">
                  <span>❌</span>
                  System is not healthy. Please check individual components.
                </div>
              )}

              {health.databaseStatus !== 'connected' && (
                <div className="alert alert-error">
                  <span>❌</span>
                  Database connection issue detected.
                </div>
              )}

              {health.memoryUsageMB > 800 && (
                <div className="alert alert-warning">
                  <span>⚠️</span>
                  High memory usage detected (
                  {formatBytes(health.memoryUsageMB * 1024 * 1024)}).
                </div>
              )}

              {health.cpuUsagePercent > 80 && (
                <div className="alert alert-warning">
                  <span>⚠️</span>
                  High CPU usage detected ({health.cpuUsagePercent.toFixed(1)}
                  %).
                </div>
              )}

              {health.status === 'healthy' &&
                health.databaseStatus === 'connected' &&
                health.memoryUsageMB <= 800 &&
                health.cpuUsagePercent <= 80 && (
                  <div className="alert alert-success">
                    <span>✅</span>
                    All systems are operating normally.
                  </div>
                )}
            </div>
          </div>

          <div className="health-recommendations">
            <h4>💡 Performance Recommendations</h4>
            <ul>
              {health.memoryUsageMB > 500 && (
                <li>
                  Consider optimizing memory usage or increasing server
                  resources
                </li>
              )}
              {health.cpuUsagePercent > 60 && (
                <li>
                  Monitor CPU-intensive operations and consider load balancing
                </li>
              )}
              {health.activeUsers > 100 && (
                <li>
                  High user activity detected - monitor system performance
                  closely
                </li>
              )}
              {health.uptimeSeconds < 86400 && (
                <li>System was recently restarted - monitor for stability</li>
              )}
              <li>Regular system backups are recommended</li>
              <li>Monitor logs for any error patterns</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealthMonitor;
