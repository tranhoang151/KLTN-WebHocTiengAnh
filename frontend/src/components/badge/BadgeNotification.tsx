import React, { useEffect, useState } from 'react';
import { Badge, BadgeNotification } from '../../types';
import badgeService from '../../services/badgeService';
import './BadgeNotification.css';

interface BadgeNotificationProps {
  userId: string;
  onClose?: () => void;
}

const BadgeNotificationPopup: React.FC<BadgeNotificationProps> = ({
  userId,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<BadgeNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Badge | null>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const newNotifications = await badgeService.getBadgeNotifications(userId);
        if (newNotifications.length > 0) {
          const badges = await badgeService.getBadgeDefinitions();
          const firstBadge = badges.find(
            (b) => b.id === newNotifications[0].badgeId
          );
          if (firstBadge) {
            setCurrentNotification(firstBadge);
          }
        }
        setNotifications(newNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
  }, [userId]);

  const handleClose = async () => {
    if (currentNotification && notifications.length > 0) {
      try {
        await badgeService.markNotificationAsSeen(
          userId,
          notifications[0].badgeId
        );
        setNotifications((prev) => prev.slice(1));
        if (notifications.length > 1) {
          const badges = await badgeService.getBadgeDefinitions();
          const nextBadge = badges.find(
            (b) => b.id === notifications[1].badgeId
          );
          setCurrentNotification(nextBadge || null);
        } else {
          setCurrentNotification(null);
        }
      } catch (error) {
        console.error('Error marking notification as seen:', error);
      }
    }
    onClose?.();
  };

  if (!currentNotification) {
    return null;
  }

  return (
    <div className="badge-notification-overlay">
      <div className="badge-notification-popup">
        <div className="badge-notification-content">
          <h2>🎉 New Badge Earned! 🎉</h2>
          <img
            src={currentNotification.imageUrl}
            alt={currentNotification.name}
            className="badge-image"
          />
          <h3>{currentNotification.name}</h3>
          <p>{currentNotification.description}</p>
          <button onClick={handleClose} className="close-button">
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default BadgeNotificationPopup;


