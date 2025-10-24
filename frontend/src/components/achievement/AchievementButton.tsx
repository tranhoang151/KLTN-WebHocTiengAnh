import React, { useState, useEffect } from 'react';
import { Badge } from '../../types';
import badgeService from '../../services/badgeService';
import AchievementHistory from './AchievementHistory';
import './AchievementButton.css';

interface AchievementButtonProps {
  userId: string;
  variant?: 'icon' | 'full' | 'compact';
  showCount?: boolean;
}

const AchievementButton: React.FC<AchievementButtonProps> = ({
  userId,
  variant = 'full',
  showCount = true,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [earnedCount, setEarnedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNewAchievements, setHasNewAchievements] = useState(false);

  useEffect(() => {
    loadBadgeStats();
    checkForNewAchievements();
  }, [userId]);

  const loadBadgeStats = async () => {
    try {
      const badges = await badgeService.getUserBadges(userId);
      const earned = badges.filter((b) => b.earned).length;
      setEarnedCount(earned);
      setTotalCount(badges.length);
    } catch (error) {
      console.error('Error loading badge stats:', error);
    }
  };

  const checkForNewAchievements = async () => {
    try {
      const notifications = await badgeService.getBadgeNotifications(userId);
      const unseenCount = notifications.filter((n) => !n.seen).length;
      setHasNewAchievements(unseenCount > 0);
    } catch (error) {
      console.error('Error checking new achievements:', error);
    }
  };

  const handleClick = () => {
    setShowHistory(true);
    setHasNewAchievements(false); // Clear notification when opened
  };

  const progressPercentage =
    totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  const renderButton = () => {
    switch (variant) {
      case 'icon':
        return (
          <button
            className="achievement-button icon-only"
            onClick={handleClick}
          >
            <span className="trophy-icon">🏆</span>
            {hasNewAchievements && <span className="notification-dot" />}
          </button>
        );

      case 'compact':
        return (
          <button className="achievement-button compact" onClick={handleClick}>
            <span className="trophy-icon">🏆</span>
            {showCount && (
              <span className="badge-count">
                {earnedCount}/{totalCount}
              </span>
            )}
            {hasNewAchievements && <span className="notification-dot" />}
          </button>
        );

      default:
        return (
          <button className="achievement-button full" onClick={handleClick}>
            <div className="button-content">
              <div className="button-header">
                <span className="trophy-icon">🏆</span>
                <span className="button-title">Achievements</span>
                {hasNewAchievements && <span className="notification-dot" />}
              </div>

              {showCount && (
                <div className="button-stats">
                  <div className="stats-text">
                    {earnedCount} of {totalCount} unlocked
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </button>
        );
    }
  };

  return (
    <>
      {renderButton()}

      {showHistory && (
        <AchievementHistory
          userId={userId}
          isVisible={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
};

export default AchievementButton;
