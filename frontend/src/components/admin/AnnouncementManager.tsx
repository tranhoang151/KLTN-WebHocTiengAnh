import React, { useState, useEffect } from 'react';
import systemConfigService, {
  SystemAnnouncement,
} from '../../services/systemConfigService';

const AnnouncementManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<SystemAnnouncement | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const defaultAnnouncement: Omit<SystemAnnouncement, 'id'> = {
    title: '',
    message: '',
    type: 'info',
    priority: 1,
    targetRoles: [],
    active: true,
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await systemConfigService.getSystemAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load announcements' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = () => {
    const newAnnouncement: SystemAnnouncement = {
      ...defaultAnnouncement,
      id: `announcement_${Date.now()}`,
    };
    setEditingAnnouncement(newAnnouncement);
    setShowAddForm(true);
  };

  const handleEditAnnouncement = (announcement: SystemAnnouncement) => {
    setEditingAnnouncement({ ...announcement });
    setShowAddForm(false);
  };

  const handleSaveAnnouncement = async (announcement: SystemAnnouncement) => {
    try {
      setSaving(true);
      if (showAddForm) {
        await systemConfigService.createAnnouncement(announcement);
        setMessage({
          type: 'success',
          text: 'Announcement created successfully',
        });
      } else {
        await systemConfigService.updateAnnouncement(
          announcement.id,
          announcement
        );
        setMessage({
          type: 'success',
          text: 'Announcement updated successfully',
        });
      }
      await loadAnnouncements();
      setEditingAnnouncement(null);
      setShowAddForm(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save announcement' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await systemConfigService.deleteAnnouncement(id);
        setMessage({
          type: 'success',
          text: 'Announcement deleted successfully',
        });
        await loadAnnouncements();
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete announcement' });
      }
    }
  };

  const handleToggleActive = async (announcement: SystemAnnouncement) => {
    try {
      const updated = { ...announcement, active: !announcement.active };
      await systemConfigService.updateAnnouncement(announcement.id, updated);
      await loadAnnouncements();
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to update announcement status',
      });
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1:
        return 'Low';
      case 2:
        return 'Medium';
      case 3:
        return 'High';
      default:
        return 'Low';
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
          <p>Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="config-section">
      <div className="section-header">
        <h2 className="section-title">System Announcements</h2>
        <p className="section-description">
          Create and manage system-wide announcements for users
        </p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          <span>{message.type === 'success' ? '✅' : '❌'}</span>
          {message.text}
        </div>
      )}

      <div className="announcements-header">
        <button className="btn btn-primary" onClick={handleAddAnnouncement}>
          📢 Add Announcement
        </button>
      </div>

      <div className="announcements-list">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className={`announcement-card ${announcement.active ? 'active' : 'inactive'}`}
          >
            <div className="announcement-header">
              <div className="announcement-info">
                <div className="announcement-title">
                  <span className="type-icon">
                    {getTypeIcon(announcement.type)}
                  </span>
                  <h4>{announcement.title}</h4>
                  <span
                    className={`priority-badge priority-${announcement.priority}`}
                  >
                    {getPriorityLabel(announcement.priority)}
                  </span>
                </div>
                <p className="announcement-message">{announcement.message}</p>
              </div>
              <div className="announcement-controls">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={announcement.active}
                    onChange={() => handleToggleActive(announcement)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="announcement-details">
              <div className="detail-item">
                <strong>Type:</strong> {announcement.type}
              </div>
              {announcement.targetRoles.length > 0 && (
                <div className="detail-item">
                  <strong>Target Roles:</strong>{' '}
                  {announcement.targetRoles.join(', ')}
                </div>
              )}
              {announcement.startDate && (
                <div className="detail-item">
                  <strong>Start:</strong>{' '}
                  {new Date(announcement.startDate).toLocaleDateString()}
                </div>
              )}
              {announcement.endDate && (
                <div className="detail-item">
                  <strong>End:</strong>{' '}
                  {new Date(announcement.endDate).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="announcement-actions">
              <button
                className="btn btn-outline"
                onClick={() => handleEditAnnouncement(announcement)}
              >
                ✏️ Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteAnnouncement(announcement.id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📢</div>
            <h3>No Announcements</h3>
            <p>
              Create your first system announcement to communicate with users.
            </p>
          </div>
        )}
      </div>

      {editingAnnouncement && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{showAddForm ? 'Add Announcement' : 'Edit Announcement'}</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setEditingAnnouncement(null);
                  setShowAddForm(false);
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingAnnouncement.title}
                  onChange={(e) =>
                    setEditingAnnouncement({
                      ...editingAnnouncement,
                      title: e.target.value,
                    })
                  }
                  placeholder="Enter announcement title"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  className="form-textarea"
                  value={editingAnnouncement.message}
                  onChange={(e) =>
                    setEditingAnnouncement({
                      ...editingAnnouncement,
                      message: e.target.value,
                    })
                  }
                  placeholder="Enter announcement message"
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={editingAnnouncement.type}
                    onChange={(e) =>
                      setEditingAnnouncement({
                        ...editingAnnouncement,
                        type: e.target.value as any,
                      })
                    }
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="success">Success</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={editingAnnouncement.priority}
                    onChange={(e) =>
                      setEditingAnnouncement({
                        ...editingAnnouncement,
                        priority: parseInt(e.target.value),
                      })
                    }
                  >
                    <option value={1}>Low</option>
                    <option value={2}>Medium</option>
                    <option value={3}>High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Target Roles (comma-separated, leave empty for all)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editingAnnouncement.targetRoles.join(', ')}
                  onChange={(e) =>
                    setEditingAnnouncement({
                      ...editingAnnouncement,
                      targetRoles: handleArrayInput(e.target.value),
                    })
                  }
                  placeholder="admin, teacher, student"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date (optional)</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={
                      editingAnnouncement.startDate
                        ? new Date(editingAnnouncement.startDate)
                          .toISOString()
                          .slice(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      setEditingAnnouncement({
                        ...editingAnnouncement,
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
                      editingAnnouncement.endDate
                        ? new Date(editingAnnouncement.endDate)
                          .toISOString()
                          .slice(0, 16)
                        : ''
                    }
                    onChange={(e) =>
                      setEditingAnnouncement({
                        ...editingAnnouncement,
                        endDate: e.target.value
                          ? new Date(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="announcementActive"
                  checked={editingAnnouncement.active}
                  onChange={(e) =>
                    setEditingAnnouncement({
                      ...editingAnnouncement,
                      active: e.target.checked,
                    })
                  }
                />
                <label htmlFor="announcementActive">Active</label>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => handleSaveAnnouncement(editingAnnouncement)}
                disabled={
                  saving ||
                  !editingAnnouncement.title.trim() ||
                  !editingAnnouncement.message.trim()
                }
              >
                {saving ? (
                  <>
                    <div
                      className="loading-spinner"
                      style={{ width: '16px', height: '16px' }}
                    ></div>
                    Saving...
                  </>
                ) : showAddForm ? (
                  'Create Announcement'
                ) : (
                  'Update Announcement'
                )}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setEditingAnnouncement(null);
                  setShowAddForm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementManager;
