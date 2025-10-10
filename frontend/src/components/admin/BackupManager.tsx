import React, { useState, useEffect } from 'react';
import systemConfigService, {
  SystemBackup,
} from '../../services/systemConfigService';

const BackupManager: React.FC = () => {
  const [backups, setBackups] = useState<SystemBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const data = await systemConfigService.getSystemBackups();
      setBackups(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load backups' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      const newBackup = await systemConfigService.createSystemBackup();
      setMessage({
        type: 'success',
        text: 'System backup created successfully',
      });
      await loadBackups();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create system backup' });
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to restore from this backup? This action cannot be undone and will overwrite current data.'
    );

    if (confirmed) {
      try {
        setRestoring(backupId);
        await systemConfigService.restoreFromBackup(backupId);
        setMessage({
          type: 'success',
          text: 'System restored successfully from backup',
        });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to restore from backup' });
      } finally {
        setRestoring(null);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-healthy';
      case 'in_progress':
      case 'pending':
        return 'status-warning';
      case 'failed':
        return 'status-error';
      default:
        return 'status-info';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '✅';
      case 'in_progress':
        return '⏳';
      case 'pending':
        return '⏸️';
      case 'failed':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  if (loading) {
    return (
      <div className="config-section">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading backups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="config-section">
      <div className="section-header">
        <h2 className="section-title">Backup & Restore Management</h2>
        <p className="section-description">
          Create system backups and restore from previous backups
        </p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          <span>{message.type === 'success' ? '✅' : '❌'}</span>
          {message.text}
        </div>
      )}

      <div className="backup-controls">
        <div className="backup-actions">
          <button
            className="btn btn-primary"
            onClick={handleCreateBackup}
            disabled={creating}
          >
            {creating ? (
              <>
                <div
                  className="loading-spinner"
                  style={{ width: '16px', height: '16px' }}
                ></div>
                Creating Backup...
              </>
            ) : (
              <>💾 Create New Backup</>
            )}
          </button>

          <button
            className="btn btn-outline"
            onClick={loadBackups}
            disabled={creating}
          >
            🔄 Refresh List
          </button>
        </div>

        <div className="backup-info">
          <div className="info-card">
            <h4>📊 Backup Statistics</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Backups:</span>
                <span className="stat-value">{backups.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completed:</span>
                <span className="stat-value">
                  {backups.filter((b) => b.status === 'completed').length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Size:</span>
                <span className="stat-value">
                  {formatFileSize(
                    backups.reduce((sum, b) => sum + b.fileSizeBytes, 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="backups-list">
        <h3>Available Backups</h3>

        {backups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💾</div>
            <h4>No Backups Available</h4>
            <p>Create your first system backup to ensure data safety.</p>
          </div>
        ) : (
          <div className="backup-cards">
            {backups.map((backup) => (
              <div key={backup.id} className="backup-card">
                <div className="backup-header">
                  <div className="backup-info">
                    <h4 className="backup-name">{backup.name}</h4>
                    <p className="backup-description">{backup.description}</p>
                  </div>
                  <div
                    className={`status-indicator ${getStatusColor(backup.status)}`}
                  >
                    <span>{getStatusIcon(backup.status)}</span>
                    {backup.status}
                  </div>
                </div>

                <div className="backup-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <strong>Type:</strong> {backup.backupType}
                    </div>
                    <div className="detail-item">
                      <strong>Size:</strong>{' '}
                      {formatFileSize(backup.fileSizeBytes)}
                    </div>
                  </div>

                  <div className="detail-row">
                    <div className="detail-item">
                      <strong>Created:</strong>{' '}
                      {new Date(backup.createdAt).toLocaleString()}
                    </div>
                    {backup.completedAt && (
                      <div className="detail-item">
                        <strong>Completed:</strong>{' '}
                        {new Date(backup.completedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="backup-actions">
                  {backup.status === 'completed' && (
                    <button
                      className="btn btn-warning"
                      onClick={() => handleRestoreBackup(backup.id)}
                      disabled={restoring !== null}
                    >
                      {restoring === backup.id ? (
                        <>
                          <div
                            className="loading-spinner"
                            style={{ width: '16px', height: '16px' }}
                          ></div>
                          Restoring...
                        </>
                      ) : (
                        <>🔄 Restore</>
                      )}
                    </button>
                  )}

                  {backup.status === 'failed' && (
                    <div className="backup-error">
                      <span>❌ Backup failed</span>
                    </div>
                  )}

                  {backup.status === 'in_progress' && (
                    <div className="backup-progress">
                      <span>⏳ In progress...</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="backup-guidelines">
        <h4>💡 Backup Guidelines</h4>
        <div className="guidelines-grid">
          <div className="guideline-card">
            <h5>🔄 Regular Backups</h5>
            <p>
              Create backups regularly, especially before major system updates
              or changes.
            </p>
          </div>

          <div className="guideline-card">
            <h5>🗂️ Backup Storage</h5>
            <p>
              Store backups in multiple locations for redundancy and disaster
              recovery.
            </p>
          </div>

          <div className="guideline-card">
            <h5>🧪 Test Restores</h5>
            <p>
              Periodically test backup restoration in a staging environment.
            </p>
          </div>

          <div className="guideline-card">
            <h5>📋 Documentation</h5>
            <p>Document backup procedures and maintain a recovery plan.</p>
          </div>
        </div>
      </div>

      <div className="backup-warnings">
        <div className="warning-card">
          <div className="warning-header">
            <span className="warning-icon">⚠️</span>
            <h4>Important Warnings</h4>
          </div>
          <ul>
            <li>
              <strong>Restore Operations:</strong> Restoring from a backup will
              overwrite all current data. This action cannot be undone.
            </li>
            <li>
              <strong>System Downtime:</strong> Backup and restore operations
              may cause temporary system unavailability.
            </li>
            <li>
              <strong>Data Loss:</strong> Always ensure you have recent backups
              before making significant system changes.
            </li>
            <li>
              <strong>Testing:</strong> Test backup restoration procedures in a
              non-production environment first.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BackupManager;
