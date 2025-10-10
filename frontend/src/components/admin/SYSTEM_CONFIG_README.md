# System Configuration Management

This module provides comprehensive system configuration management capabilities for administrators.

## Components

### SystemConfigManagement

Main container component with tabbed interface for different configuration areas.

### SystemSettings

Manage global application settings including:

- Application name and version
- Security settings (login attempts, session timeout)
- File upload settings
- Language configuration
- Registration and password reset toggles

### FeatureFlagManager

Control feature rollout and availability:

- Enable/disable features dynamically
- Target specific user roles or individual users
- Set time-based feature activation
- A/B testing support

### MaintenanceManager

System maintenance mode control:

- Enable/disable maintenance mode
- Custom maintenance messages
- Scheduled maintenance windows
- Role-based access during maintenance

### AnnouncementManager

System-wide announcements:

- Create targeted announcements by role
- Different announcement types (info, warning, error, success)
- Priority levels and scheduling
- Active/inactive status management

### BackupManager

System backup and restore:

- Create full system backups
- View backup history and status
- Restore from previous backups
- Backup size and completion tracking

### SystemHealthMonitor

Real-time system health monitoring:

- Database connectivity status
- Firebase service status
- Memory and CPU usage
- Active user count
- System uptime tracking
- Automated health alerts

## Features

### 🔧 System Settings

- **Application Configuration**: Name, version, language settings
- **Security Settings**: Login limits, session timeouts, registration controls
- **File Upload Settings**: Size limits, allowed file types
- **Multi-language Support**: Default and supported languages

### 🚩 Feature Flags

- **Dynamic Feature Control**: Enable/disable features without deployment
- **Targeted Rollout**: Role-based or user-specific feature access
- **Time-based Activation**: Schedule feature releases
- **A/B Testing**: Gradual feature rollout capabilities

### 🔧 Maintenance Mode

- **Planned Maintenance**: Schedule maintenance windows
- **Custom Messages**: Informative user notifications
- **Role-based Access**: Allow specific roles during maintenance
- **Emergency Mode**: Quick maintenance activation

### 📢 System Announcements

- **Multi-type Announcements**: Info, warning, error, success messages
- **Role Targeting**: Announcements for specific user roles
- **Priority Levels**: High, medium, low priority announcements
- **Scheduling**: Time-based announcement activation

### 💾 Backup & Restore

- **Automated Backups**: One-click system backup creation
- **Backup History**: Track all backup operations
- **Restore Capability**: Restore from any completed backup
- **Status Monitoring**: Real-time backup operation status

### ❤️ System Health

- **Real-time Monitoring**: Live system status updates
- **Component Status**: Database, Firebase, storage monitoring
- **Performance Metrics**: Memory, CPU, user activity tracking
- **Alert System**: Automated health issue notifications

## Usage

### Basic Setup

1. Add to AdminDashboard routes:

```tsx
<Route path="/system-config" element={<SystemConfigManagement />} />
```

2. Add navigation link:

```tsx
<Link to="/admin/system-config">System Configuration</Link>
```

### API Integration

The system uses `systemConfigService` for all backend communication:

```tsx
import systemConfigService from '../../services/systemConfigService';

// Get system settings
const settings = await systemConfigService.getSystemSettings();

// Update feature flags
await systemConfigService.updateFeatureFlags(flags);

// Enable maintenance mode
await systemConfigService.enableMaintenanceMode(maintenanceInfo);
```

### Feature Flag Usage

Check feature flags in components:

```tsx
const isFeatureEnabled =
  await systemConfigService.isFeatureEnabled('new_feature');
```

### Maintenance Mode Check

The system automatically checks maintenance mode status and restricts access based on user roles.

## Security

- **Admin Only Access**: All configuration endpoints require admin role
- **Audit Logging**: All configuration changes are logged
- **Backup Security**: Backup operations are restricted to admin users
- **Maintenance Override**: Emergency maintenance mode for critical issues

## Best Practices

### System Settings

- Test setting changes in staging environment first
- Document all configuration changes
- Keep backup of previous settings
- Monitor system behavior after changes

### Feature Flags

- Use descriptive flag names and descriptions
- Set appropriate target audiences
- Monitor feature usage and performance
- Clean up unused flags regularly

### Maintenance Mode

- Notify users in advance of scheduled maintenance
- Keep maintenance messages clear and informative
- Test maintenance mode in staging first
- Monitor system during maintenance windows

### Announcements

- Use appropriate priority levels
- Target specific user roles when relevant
- Keep messages concise and actionable
- Schedule announcements for optimal visibility

### Backup & Restore

- Create regular automated backups
- Test restore procedures in staging
- Store backups in multiple locations
- Document backup and restore procedures

### Health Monitoring

- Set up automated alerts for critical issues
- Monitor trends in system performance
- Investigate health warnings promptly
- Maintain system performance baselines

## Troubleshooting

### Common Issues

1. **Settings Not Saving**
   - Check admin permissions
   - Verify network connectivity
   - Check browser console for errors

2. **Feature Flags Not Working**
   - Verify flag configuration
   - Check user role targeting
   - Confirm date/time settings

3. **Maintenance Mode Issues**
   - Verify role permissions
   - Check maintenance message configuration
   - Confirm time window settings

4. **Backup Failures**
   - Check system disk space
   - Verify Firebase connectivity
   - Monitor backup operation logs

5. **Health Monitoring Alerts**
   - Check system resources
   - Verify service connectivity
   - Review system logs for errors

## API Endpoints

- `GET /api/system-config/settings` - Get system settings
- `PUT /api/system-config/settings` - Update system settings
- `GET /api/system-config/feature-flags` - Get feature flags
- `PUT /api/system-config/feature-flags` - Update feature flags
- `GET /api/system-config/maintenance` - Get maintenance status
- `POST /api/system-config/maintenance/enable` - Enable maintenance
- `POST /api/system-config/maintenance/disable` - Disable maintenance
- `GET /api/system-config/announcements` - Get announcements
- `POST /api/system-config/announcements` - Create announcement
- `PUT /api/system-config/announcements/{id}` - Update announcement
- `DELETE /api/system-config/announcements/{id}` - Delete announcement
- `POST /api/system-config/backup` - Create backup
- `GET /api/system-config/backups` - Get backup list
- `POST /api/system-config/restore/{id}` - Restore from backup
- `GET /api/system-config/health` - Get system health
