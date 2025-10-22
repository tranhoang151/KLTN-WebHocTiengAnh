import { apiService } from './api';
import { Badge, BadgeNotification } from '../types';




const badgeService = {
  // Get all badge definitions
  async getBadgeDefinitions(): Promise<Badge[]> {
    const response = await apiService.get<Badge[]>('/badges/definitions');
    return response.data || [];
  },

  // Get user's earned badges
  async getUserBadges(userId: string): Promise<Badge[]> {
    const response = await apiService.get<Badge[]>(`/badges/user/${userId}`);
    return response.data || [];
  },

  // Get badge notifications for user
  async getBadgeNotifications(userId: string): Promise<BadgeNotification[]> {
    const response = await apiService.get<BadgeNotification[]>(`/badges/notifications/${userId}`);
    return response.data || [];
  },

  // Mark badge notification as seen
  async markNotificationAsSeen(userId: string, badgeId: string): Promise<void> {
    await apiService.post(`/badges/notifications/${userId}/${badgeId}/seen`);
  },
};

export default badgeService;
