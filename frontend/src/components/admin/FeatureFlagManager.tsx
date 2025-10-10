import React, { useState, useEffect } from 'react';
import systemConfigService, {
  FeatureFlag,
} from '../../services/systemConfigService';

const FeatureFlagManager: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const defaultFlag: Omit<FeatureFlag, 'id'> = {
    name: '',
    description: '',
    enabled: false,
    targetRoles: [],
    targetUsers: [],
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const data = await systemConfigService.getFeatureFlags();
      setFlags(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load feature flags' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await systemConfigService.updateFeatureFlags(flags);
      setMessage({
        type: 'success',
        text: 'Feature flags updated successfully',
      });
      setEditingFlag(null);
      setShowAddForm(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update feature flags' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFlag = (id: string) => {
    setFlags((prev) =>
      prev.map((flag) =>
        flag.id === id ? { ...flag, enabled: !flag.enabled } : flag
      )
    );
  };

  const handleEditFlag = (flag: FeatureFlag) => {
    setEditingFlag({ ...flag });
    setShowAddForm(false);
  };

  const handleAddFlag = () => {
    const newFlag: FeatureFlag = {
      ...defaultFlag,
      id: `flag_${Date.now()}`,
    };
    setEditingFlag(newFlag);
    setShowAddForm(true);
  };

  const handleUpdateFlag = (updatedFlag: FeatureFlag) => {
    if (showAddForm) {
      setFlags((prev) => [...prev, updatedFlag]);
    } else {
      setFlags((prev) =>
        prev.map((flag) => (flag.id === updatedFlag.id ? updatedFlag : flag))
      );
    }
    setEditingFlag(null);
    setShowAddForm(false);
  };

  const handleDeleteFlag = (id: string) => {
    if (window.confirm('Are you sure you want to delete this feature flag?')) {
      setFlags((prev) => prev.filter((flag) => flag.id !== id));
    }
  };

  const handleArrayInput = (value: string): string[] => {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item);
  };

  if (loading) {
    return (
      <div className="config-section">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading feature flags...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="config-section">
      <div className="section-header">
        <h2 className="section-title">Feature Flag Management</h2>
        <p className="section-description">
          Control feature availability and rollout across different user groups
        </p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          <span>{message.type === 'success' ? '✅' : '❌'}</span>
          {message.text}
        </div>
      )}

      <div className="feature-flags-header">
        <button className="btn btn-primary" onClick={handleAddFlag}>
          ➕ Add Feature Flag
        </button>
      </div>

      <div className="feature-flags-list">
        {flags.map((flag) => (
          <div key={flag.id} className="feature-flag-card">
            <div className="flag-header">
              <div className="flag-info">
                <h4 className="flag-name">{flag.name}</h4>
                <p className="flag-description">{flag.description}</p>
              </div>
              <div className="flag-controls">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={flag.enabled}
                    onChange={() => handleToggleFlag(flag.id)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="flag-details">
              {flag.targetRoles.length > 0 && (
                <div className="flag-targets">
                  <strong>Target Roles:</strong> {flag.targetRoles.join(', ')}
                </div>
              )}
              {flag.targetUsers.length > 0 && (
                <div className="flag-targets">
                  <strong>Target Users:</strong> {flag.targetUsers.join(', ')}
                </div>
              )}
              {flag.startDate && (
                <div className="flag-dates">
                  <strong>Start:</strong>{' '}
                  {new Date(flag.startDate).toLocaleDateString()}
                </div>
              )}
              {flag.endDate && (
                <div className="flag-dates">
                  <strong>End:</strong>{' '}
                  {new Date(flag.endDate).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="flag-actions">
              <button
                className="btn btn-outline"
                onClick={() => handleEditFlag(flag)}
              >
                ✏️ Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteFlag(flag.id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingFlag && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{showAddForm ? 'Add Feature Flag' : 'Edit Feature Flag'}</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setEditingFlag(null);
                  setShowAddForm(false);
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Flag Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingFlag.name}
                  onChange={(e) =>
                    setEditingFlag({ ...editingFlag, name: e.target.value })
                  }
                  placeholder="Enter flag name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={editingFlag.description}
                  onChange={(e) =>
                    setEditingFlag({
                      ...editingFlag,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe what this flag controls"
                />
              </div>

              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="flagEnabled"
                  checked={editingFlag.enabled}
                  onChange={(e) =>
                    setEditingFlag({
                      ...editingFlag,
                      enabled: e.target.checked,
                    })
                  }
                />
                <label htmlFor="flagEnabled">Enable this flag</label>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Target Roles (comma-separated)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editingFlag.targetRoles.join(', ')}
                  onChange={(e) =>
                    setEditingFlag({
                      ...editingFlag,
                      targetRoles: handleArrayInput(e.target.value),
                    })
                  }
                  placeholder="admin, teacher, student"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Target Users (comma-separated user IDs)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editingFlag.targetUsers.join(', ')}
                  onChange={(e) =>
                    setEditingFlag({
                      ...editingFlag,
                      targetUsers: handleArrayInput(e.target.value),
                    })
                  }
                  placeholder="user1, user2, user3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date (optional)</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={
                      editingFlag.startDate
                        ? new Date(editingFlag.startDate)
                            .toISOString()
                            .slice(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      setEditingFlag({
                        ...editingFlag,
                        startDate: e.target.value
                          ? new Date(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date (optional)</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={
                      editingFlag.endDate
                        ? new Date(editingFlag.endDate)
                            .toISOString()
                            .slice(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      setEditingFlag({
                        ...editingFlag,
                        endDate: e.target.value
                          ? new Date(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => handleUpdateFlag(editingFlag)}
              >
                {showAddForm ? 'Add Flag' : 'Update Flag'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setEditingFlag(null);
                  setShowAddForm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
            <>💾 Save All Changes</>
          )}
        </button>
      </div>
    </div>
  );
};

export default FeatureFlagManager;
