import React, { useState, useEffect } from 'react';
import SystemSettings from './SystemSettings';
import FeatureFlagManager from './FeatureFlagManager';
import MaintenanceManager from './MaintenanceManager';
import AnnouncementManager from './AnnouncementManager';
import BackupManager from './BackupManager';
import SystemHealthMonitor from './SystemHealthMonitor';
import './SystemConfigManagement.css';

type TabType =
  | 'settings'
  | 'features'
  | 'maintenance'
  | 'announcements'
  | 'backup'
  | 'health';

const SystemConfigManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'settings' as TabType, label: 'System Settings', icon: '⚙️' },
    { id: 'features' as TabType, label: 'Feature Flags', icon: '🚩' },
    { id: 'maintenance' as TabType, label: 'Maintenance', icon: '🔧' },
    { id: 'announcements' as TabType, label: 'Announcements', icon: '📢' },
    { id: 'backup' as TabType, label: 'Backup & Restore', icon: '💾' },
    { id: 'health' as TabType, label: 'System Health', icon: '❤️' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'settings':
        return <SystemSettings />;
      case 'features':
        return <FeatureFlagManager />;
      case 'maintenance':
        return <MaintenanceManager />;
      case 'announcements':
        return <AnnouncementManager />;
      case 'backup':
        return <BackupManager />;
      case 'health':
        return <SystemHealthMonitor />;
      default:
        return <SystemSettings />;
    }
  };

  return (
    <div className="system-config-management">
      <div className="config-header">
        <h1>System Configuration Management</h1>
        <p>Manage system settings, features, and maintenance</p>
      </div>

      <div className="config-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="config-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading configuration...</p>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </div>
  );
};

export default SystemConfigManagement;
