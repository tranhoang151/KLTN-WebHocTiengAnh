import React, { useEffect, useState, useCallback } from 'react';
import { Badge } from '../../types';
import { BadgeNotification } from '../../types';
import badgeService from '../../services/badgeService';
import AchievementNotification from './AchievementNotification';
import AchievementHistory from './AchievementHistory';
import { useAuth } from '../../contexts/AuthContext';

interface AchievementManagerProps {
  onAchievementEarned?: (badge: Badge) => void;
}

const AchievementManager: React.FC<AchievementManagerProps> = ({
  onAchievementEarned,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<BadgeNotification[]>([]);
  const [currentBadge, setCurrentBadge] = useState<Badge | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [badgeDefinitions, setBadgeDefinitions] = useState<Badge[]>([]);

  // Load badge definitions with caching
  useEffect(() => {
    const loadBadgeDefinitions = async () => {
      try {
        // Check if we already have badge definitions cached
        const cachedDefinitions = sessionStorage.getItem('badgeDefinitions');
        if (cachedDefinitions) {
          setBadgeDefinitions(JSON.parse(cachedDefinitions));
          return;
        }

        const definitions = await badgeService.getBadgeDefinitions();
        setBadgeDefinitions(definitions);

        // Cache for 1 hour
        sessionStorage.setItem('badgeDefinitions', JSON.stringify(definitions));
      } catch (error) {
        console.error('Error loading badge definitions:', error);
        // Try to use cached definitions if available
        const cachedDefinitions = sessionStorage.getItem('badgeDefinitions');
        if (cachedDefinitions) {
          setBadgeDefinitions(JSON.parse(cachedDefinitions));
        }
      }
    };

    loadBadgeDefinitions();
  }, []);

  // Check for new notifications
  const checkForNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const newNotifications = await badgeService.getBadgeNotifications(
        user.id
      );
      const unseenNotifications = newNotifications.filter((n) => !n.seen);

      if (unseenNotifications.length > 0) {
        setNotifications(unseenNotifications);
        showNextNotification(unseenNotifications);
      }
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  }, [user?.id]);

  // Show next notification in queue
  const showNextNotification = (notificationQueue: BadgeNotification[]) => {
    if (notificationQueue.length === 0) return;

    const nextNotification = notificationQueue[0];
    const badge = badgeDefinitions.find(
      (b) => b.id === nextNotification.badgeId
    );

    if (badge) {
      setCurrentBadge(badge);
      setShowNotification(true);
      onAchievementEarned?.(badge);
    }
  };

  // Handle notification close
  const handleNotificationClose = async () => {
    if (!user?.id || !currentBadge) return;

    try {
      // Mark as seen
      await badgeService.markNotificationAsSeen(user.id, currentBadge.id);

      // Remove from queue and show next
      const remainingNotifications = notifications.slice(1);
      setNotifications(remainingNotifications);
      setShowNotification(false);
      setCurrentBadge(null);

      // Show next notification after a delay
      if (remainingNotifications.length > 0) {
        setTimeout(() => {
          showNextNotification(remainingNotifications);
        }, 1000);
      }
    } catch (error) {
      console.error('Error closing notification:', error);
    }
  };

  // Handle achievement sharing
  const handleShare = () => {
    if (!currentBadge) return;

    const shareText = `🎉 I just earned the "${currentBadge.name}" badge in BingGo English Learning! ${currentBadge.description}`;

    if (navigator.share) {
      navigator
        .share({
          title: 'Achievement Unlocked!',
          text: shareText,
          url: window.location.origin,
        })
        .catch(console.error);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          alert('Achievement copied to clipboard!');
        })
        .catch(() => {
          // Final fallback: show share text
          alert(`Share this achievement:\n\n${shareText}`);
        });
    }
  };

  // Expose method to manually trigger notification check
  const triggerNotificationCheck = useCallback(() => {
    checkForNotifications();
  }, [checkForNotifications]);

  // Check for notifications on mount and periodically (less frequently)
  useEffect(() => {
    checkForNotifications();

    // Check every 2 minutes for new achievements (reduced frequency)
    const interval = setInterval(checkForNotifications, 120000);

    return () => clearInterval(interval);
  }, [checkForNotifications]);

  // Listen for custom achievement events
  useEffect(() => {
    const handleAchievementEvent = () => {
      setTimeout(checkForNotifications, 1000); // Delay to allow backend processing
    };

    window.addEventListener('achievement-earned', handleAchievementEvent);

    return () => {
      window.removeEventListener('achievement-earned', handleAchievementEvent);
    };
  }, [checkForNotifications]);

  return (
    <>
      {/* Achievement Notification */}
      {showNotification && currentBadge && (
        <AchievementNotification
          badge={currentBadge}
          isVisible={showNotification}
          onClose={handleNotificationClose}
          onShare={handleShare}
        />
      )}

      {/* Achievement History Modal */}
      {showHistory && (
        <AchievementHistory
          userId={user?.id || ''}
          isVisible={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
};

// Helper function to trigger achievement check from anywhere in the app
export const triggerAchievementCheck = () => {
  window.dispatchEvent(new CustomEvent('achievement-earned'));
};

export default AchievementManager;

// Helper function to show achievement notification manually
export const showAchievementNotification = (badge: Badge) => {
  window.dispatchEvent(new CustomEvent('show-achievement', { detail: badge }));
};
