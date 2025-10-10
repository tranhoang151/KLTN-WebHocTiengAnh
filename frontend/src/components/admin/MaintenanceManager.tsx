import React, { useState, useEffect } from 'react';
import systemConfigService, {
  MaintenanceMode,
} from '../../services/systemConfigService';

const MaintenanceManager: React.FC = () => {
  const [maintenance, setMaintenance] = useState<MaintenanceMode>({
    enabled: false,
    message: '',
    allowedRoles: ['admin'],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    loadMaintenanceStatus();
  }, []);

  const loadMaintenanceStatus = async () => {
    try {
      setLoading(true);
      const data = await systemConfigService.getMaintenanceStatus();
      setMaintenance(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load maintenance status' });
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMaintenance = async () => {
    try {
      setSaving(true);
      await systemConfigService.enableMaintenanceMode(maintenance);
      setMessage({
        type: 'success',
        text: 'Maintenance mode enabled successfully',
      });
      await loadMaintenanceStatus();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to enable maintenance mode' });
    } finally {
      setSaving(false);
    }
  };

  const handleDisableMaintenance = async () => {
    try {
      setSaving(true);
      await systemConfigService.disableMaintenanceMode();
      setMessage({
        type: 'success',
        text: 'Maintenance mode disabled successfully',
      });
      await loadMaintenanceStatus();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to disable maintenance mode' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof MaintenanceMode, value: any) => {
    setMaintenance((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (value: string) => {
    const array = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item);
    setMaintenance((prev) => ({ ...prev, allowedRoles: array }));
  };

  if (loading) {
    return (
      <div className="config-section">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading maintenance status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="config-section">
      <div className="section-header">
        <h2 className="section-title">Maintenance Mode Management</h2>
        <p className="section-description">
          Control system maintenance mode and user access during maintenance
        </p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          <span>{message.type === 'success' ? '✅' : '❌'}</span>
          {message.text}
        </div>
      )}

      <div className="maintenance-status">
        <div className="status-card">
          <div className="status-header">
            <h3>Current Status</h3>
            <div
              className={`status-indicator ${maintenance.enabled ? 'status-warning' : 'status-healthy'}`}
            >
              <span>{maintenance.enabled ? '🔧' : '✅'}</span>
              {maintenance.enabled
                ? 'Maintenance Mode Active'
                : 'System Operational'}
            </div>
          </div>

          {maintenance.enabled && (
            <div className="maintenance-info">
              <div className="info-item">
                <strong>Message:</strong> {maintenance.message}
              </div>
              {maintenance.startTime && (
                <div className="info-item">
                  <strong>Started:</strong>{' '}
                  {new Date(maintenance.startTime).toLocaleString()}
                </div>
              )}
              {maintenance.endTime && (
                <div className="info-item">
                  <strong>Scheduled End:</strong>{' '}
                  {new Date(maintenance.endTime).toLocaleString()}
                </div>
              )}
              <div className="info-item">
                <strong>Allowed Roles:</strong>{' '}
                {maintenance.allowedRoles.join(', ')}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="maintenance-controls">
        <h3>Maintenance Configuration</h3>

        <div className="form-group">
          <label className="form-label">Maintenance Message</label>
          <textarea
            className="form-textarea"
            value={maintenance.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Enter message to display to users during maintenance"
            rows={3}
          />
          <small className="form-help">
            This message will be displayed to users when they try to access the
            system during maintenance.
          </small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Time (optional)</label>
            <input
              type="datetime-local"
              className="form-input"
              value={
                maintenance.startTime
                  ? new Date(maintenance.startTime).toISOString().slice(0, 16)
                  : ''
              }
              onChange={(e) =>
                handleInputChange(
                  'startTime',
                  e.target.value ? new Date(e.target.value) : undefined
                )
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">End Time (optional)</label>
            <input
              type="datetime-local"
              className="form-input"
              value={
                maintenance.endTime
                  ? new Date(maintenance.endTime).toISOString().slice(0, 16)
                  : ''
              }
              onChange={(e) =>
                handleInputChange(
                  'endTime',
                  e.target.value ? new Date(e.target.value) : undefined
                )
              }
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Allowed Roles During Maintenance</label>
          <input
            type="text"
            className="form-input"
            value={maintenance.allowedRoles.join(', ')}
            onChange={(e) => handleArrayChange(e.target.value)}
            placeholder="admin, teacher"
          />
          <small className="form-help">
            Users with these roles will still be able to access the system
            during maintenance.
          </small>
        </div>
      </div>

      <div className="maintenance-actions">
        <div className="action-warning">
          <div className="warning-icon">⚠️</div>
          <div className="warning-text">
            <strong>Warning:</strong> Enabling maintenance mode will prevent
            most users from accessing the system. Only users with allowed roles
            will be able to log in.
          </div>
        </div>

        <div className="action-buttons">
          {!maintenance.enabled ? (
            <button
              className="btn btn-warning"
              onClick={handleEnableMaintenance}
              disabled={saving || !maintenance.message.trim()}
            >
              {saving ? (
                <>
                  <div
                    className="loading-spinner"
                    style={{ width: '16px', height: '16px' }}
                  ></div>
                  Enabling...
                </>
              ) : (
                <>🔧 Enable Maintenance Mode</>
              )}
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={handleDisableMaintenance}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div
                    className="loading-spinner"
                    style={{ width: '16px', height: '16px' }}
                  ></div>
                  Disabling...
                </>
              ) : (
                <>✅ Disable Maintenance Mode</>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="maintenance-tips">
        <h4>💡 Maintenance Mode Tips</h4>
        <ul>
          <li>Always notify users in advance about scheduled maintenance</li>
          <li>Set appropriate start and end times for planned maintenance</li>
          <li>Keep the maintenance message clear and informative</li>
          <li>Test the maintenance mode in a staging environment first</li>
          <li>Monitor system logs during maintenance for any issues</li>
        </ul>
      </div>
    </div>
  );
};

export default MaintenanceManager;
