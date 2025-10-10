import { apiService } from './api';

export interface SystemSettings {
  appName: string;
  appVersion: string;
  maxLoginAttempts: number;
  sessionTimeoutMinutes: number;
  maxFileUploadSizeMB: number;
  allowedFileTypes: string[];
  enableRegistration: boolean;
  enablePasswordReset: boolean;
  defaultLanguage: string;
  supportedLanguages: string[];
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  targetRoles: string[];
  targetUsers: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface MaintenanceMode {
  enabled: boolean;
  message: string;
  startTime?: Date;
  endTime?: Date;
  allowedRoles: string[];
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: number;
  targetRoles: string[];
  active: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface SystemBackup {
  id: string;
  name: string;
  description: string;
  backupType: string;
  fileSizeBytes: number;
  status: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface SystemHealth {
  status: string;
  databaseStatus: string;
  firebaseStatus: string;
  storageStatus: string;
  memoryUsageMB: number;
  cpuUsagePercent: number;
  activeUsers: number;
  uptimeSeconds: number;
  lastCheck: Date;
}

const systemConfigService = {
  // System Settings
  async getSystemSettings(): Promise<SystemSettings> {
    const response = await apiService.get<SystemSettings>(
      '/api/system-config/settings'
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch system settings');
    }
    return response.data!;
  },

  async updateSystemSettings(settings: SystemSettings): Promise<void> {
    const response = await apiService.put(
      '/api/system-config/settings',
      settings
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to update system settings');
    }
  },

  // Feature Flags
  async getFeatureFlags(): Promise<FeatureFlag[]> {
    const response = await apiService.get<FeatureFlag[]>(
      '/api/system-config/feature-flags'
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch feature flags');
    }
    return response.data || [];
  },

  async updateFeatureFlags(flags: FeatureFlag[]): Promise<void> {
    const response = await apiService.put(
      '/api/system-config/feature-flags',
      flags
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to update feature flags');
    }
  },

  // Maintenance Mode
  async getMaintenanceStatus(): Promise<MaintenanceMode> {
    const response = await apiService.get<MaintenanceMode>(
      '/api/system-config/maintenance'
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch maintenance status');
    }
    return response.data!;
  },

  async enableMaintenanceMode(maintenanceInfo: MaintenanceMode): Promise<void> {
    const response = await apiService.post(
      '/api/system-config/maintenance/enable',
      maintenanceInfo
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to enable maintenance mode');
    }
  },

  async disableMaintenanceMode(): Promise<void> {
    const response = await apiService.post(
      '/api/system-config/maintenance/disable'
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to disable maintenance mode');
    }
  },

  // System Announcements
  async getSystemAnnouncements(): Promise<SystemAnnouncement[]> {
    const response = await apiService.get<SystemAnnouncement[]>(
      '/api/system-config/announcements'
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch system announcements');
    }
    return response.data || [];
  },

  async createAnnouncement(
    announcement: Omit<SystemAnnouncement, 'id'>
  ): Promise<SystemAnnouncement> {
    const response = await apiService.post<SystemAnnouncement>(
      '/api/system-config/announcements',
      announcement
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to create announcement');
    }
    return response.data!;
  },

  async updateAnnouncement(
    id: string,
    announcement: Omit<SystemAnnouncement, 'id'>
  ): Promise<void> {
    const response = await apiService.put(
      `/api/system-config/announcements/${id}`,
      announcement
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to update announcement');
    }
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const response = await apiService.delete(
      `/api/system-config/announcements/${id}`
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete announcement');
    }
  },

  // System Backup
  async createSystemBackup(): Promise<SystemBackup> {
    const response = await apiService.post<SystemBackup>(
      '/api/system-config/backup'
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to create system backup');
    }
    return response.data!;
  },

  async getSystemBackups(): Promise<SystemBackup[]> {
    const response = await apiService.get<SystemBackup[]>(
      '/api/system-config/backups'
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch system backups');
    }
    return response.data || [];
  },

  async restoreFromBackup(backupId: string): Promise<void> {
    const response = await apiService.post(
      `/api/system-config/restore/${backupId}`
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to restore from backup');
    }
  },

  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await apiService.get<SystemHealth>(
      '/api/system-config/health'
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch system health');
    }
    return response.data!;
  },
};

export default systemConfigService;
