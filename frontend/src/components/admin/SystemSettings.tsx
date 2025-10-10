import React, { useState, useEffect } from 'react';
import systemConfigService, {
  SystemSettings as SystemSettingsType,
} from '../../services/systemConfigService';

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettingsType>({
    appName: '',
    appVersion: '',
    maxLoginAttempts: 5,
    sessionTimeoutMinutes: 60,
    maxFileUploadSizeMB: 10,
    allowedFileTypes: [],
    enableRegistration: true,
    enablePasswordReset: true,
    defaultLanguage: 'vi',
    supportedLanguages: ['vi', 'en'],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await systemConfigService.getSystemSettings();
      setSettings(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load system settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await systemConfigService.updateSystemSettings(settings);
      setMessage({
        type: 'success',
        text: 'System settings updated successfully',
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update system settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof SystemSettingsType, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (
    field: 'allowedFileTypes' | 'supportedLanguages',
    value: string
  ) => {
    const array = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item);
    setSettings((prev) => ({ ...prev, [field]: array }));
  };

  if (loading) {
    return (
      <div className="config-section">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading system settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="config-section">
      <div className="section-header">
        <h2 className="section-title">System Settings</h2>
        <p className="section-description">
          Configure global system settings and application behavior
        </p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          <span>{message.type === 'success' ? '✅' : '❌'}</span>
          {message.text}
        </div>
      )}

      <div className="settings-grid">
        <div className="settings-column">
          <h3>Application Settings</h3>

          <div className="form-group">
            <label className="form-label">Application Name</label>
            <input
              type="text"
              className="form-input"
              value={settings.appName}
              onChange={(e) => handleInputChange('appName', e.target.value)}
              placeholder="Enter application name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Application Version</label>
            <input
              type="text"
              className="form-input"
              value={settings.appVersion}
              onChange={(e) => handleInputChange('appVersion', e.target.value)}
              placeholder="e.g., 1.0.0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Default Language</label>
            <select
              className="form-select"
              value={settings.defaultLanguage}
              onChange={(e) =>
                handleInputChange('defaultLanguage', e.target.value)
              }
            >
              <option value="vi">Vietnamese</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Supported Languages (comma-separated)
            </label>
            <input
              type="text"
              className="form-input"
              value={settings.supportedLanguages.join(', ')}
              onChange={(e) =>
                handleArrayChange('supportedLanguages', e.target.value)
              }
              placeholder="vi, en"
            />
          </div>
        </div>

        <div className="settings-column">
          <h3>Security Settings</h3>

          <div className="form-group">
            <label className="form-label">Max Login Attempts</label>
            <input
              type="number"
              className="form-input"
              value={settings.maxLoginAttempts}
              onChange={(e) =>
                handleInputChange('maxLoginAttempts', parseInt(e.target.value))
              }
              min="1"
              max="10"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Session Timeout (minutes)</label>
            <input
              type="number"
              className="form-input"
              value={settings.sessionTimeoutMinutes}
              onChange={(e) =>
                handleInputChange(
                  'sessionTimeoutMinutes',
                  parseInt(e.target.value)
                )
              }
              min="15"
              max="480"
            />
          </div>

          <div className="form-checkbox">
            <input
              type="checkbox"
              id="enableRegistration"
              checked={settings.enableRegistration}
              onChange={(e) =>
                handleInputChange('enableRegistration', e.target.checked)
              }
            />
            <label htmlFor="enableRegistration">Enable User Registration</label>
          </div>

          <div className="form-checkbox">
            <input
              type="checkbox"
              id="enablePasswordReset"
              checked={settings.enablePasswordReset}
              onChange={(e) =>
                handleInputChange('enablePasswordReset', e.target.checked)
              }
            />
            <label htmlFor="enablePasswordReset">Enable Password Reset</label>
          </div>
        </div>

        <div className="settings-column">
          <h3>File Upload Settings</h3>

          <div className="form-group">
            <label className="form-label">Max File Upload Size (MB)</label>
            <input
              type="number"
              className="form-input"
              value={settings.maxFileUploadSizeMB}
              onChange={(e) =>
                handleInputChange(
                  'maxFileUploadSizeMB',
                  parseInt(e.target.value)
                )
              }
              min="1"
              max="100"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Allowed File Types (comma-separated)
            </label>
            <input
              type="text"
              className="form-input"
              value={settings.allowedFileTypes.join(', ')}
              onChange={(e) =>
                handleArrayChange('allowedFileTypes', e.target.value)
              }
              placeholder="jpg, png, pdf, mp4"
            />
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <div
                className="loading-spinner"
                style={{ width: '16px', height: '16px' }}
              ></div>
              Saving...
            </>
          ) : (
            <>💾 Save Settings</>
          )}
        </button>

        <button
          className="btn btn-secondary"
          onClick={loadSettings}
          disabled={saving}
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;
