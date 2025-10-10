import React, { useEffect, useState } from 'react';
import { Badge } from '../../types';
import badgeService from '../../services/badgeService';
import './AchievementHistory.css';

interface AchievementHistoryProps {
  userId: string;
  isVisible: boolean;
  onClose: () => void;
}

interface UserBadge extends Badge {
  earned: boolean;
  earnedAt?: Date;
}

const AchievementHistory: React.FC<AchievementHistoryProps> = ({
  userId,
  isVisible,
  onClose,
}) => {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');

  useEffect(() => {
    if (isVisible && userId) {
      loadBadges();
    }
  }, [isVisible, userId]);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const userBadges = await badgeService.getUserBadges(userId);
      setBadges(userBadges as UserBadge[]);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = badges.filter((badge) => {
    switch (filter) {
      case 'earned':
        return badge.earned;
      case 'locked':
        return !badge.earned;
      default:
        return true;
    }
  });

  const earnedCount = badges.filter((b) => b.earned).length;
  const totalCount = badges.length;
  const progressPercentage =
    totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  if (!isVisible) return null;

  return (
    <div className="achievement-history-overlay">
      <div className="achievement-history-modal">
        <div className="achievement-history-header">
          <h2>🏆 Achievement Collection</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="achievement-stats">
          <div className="stats-card">
            <div className="stat-number">{earnedCount}</div>
            <div className="stat-label">Earned</div>
          </div>
          <div className="stats-card">
            <div className="stat-number">{totalCount - earnedCount}</div>
            <div className="stat-label">Remaining</div>
          </div>
          <div className="stats-card">
            <div className="stat-number">{Math.round(progressPercentage)}%</div>
            <div className="stat-label">Complete</div>
          </div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="progress-text">
            {earnedCount} of {totalCount} achievements unlocked
          </span>
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({totalCount})
          </button>
          <button
            className={`filter-tab ${filter === 'earned' ? 'active' : ''}`}
            onClick={() => setFilter('earned')}
          >
            Earned ({earnedCount})
          </button>
          <button
            className={`filter-tab ${filter === 'locked' ? 'active' : ''}`}
            onClick={() => setFilter('locked')}
          >
            Locked ({totalCount - earnedCount})
          </button>
        </div>

        <div className="achievement-grid">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading achievements...</p>
            </div>
          ) : (
            filteredBadges.map((badge) => (
              <div
                key={badge.id}
                className={`achievement-card ${badge.earned ? 'earned' : 'locked'}`}
              >
                <div className="badge-image-container">
                  <img
                    src={badge.imageUrl}
                    alt={badge.name}
                    className="badge-image"
                  />
                  {badge.earned && (
                    <div className="earned-overlay">
                      <span className="checkmark">✓</span>
                    </div>
                  )}
                  {!badge.earned && (
                    <div className="locked-overlay">
                      <span className="lock-icon">🔒</span>
                    </div>
                  )}
                </div>

                <div className="badge-info">
                  <h3 className="badge-name">{badge.name}</h3>
                  <p className="badge-description">{badge.description}</p>

                  {badge.earned && badge.earnedAt && (
                    <div className="earned-date">
                      <span className="date-icon">📅</span>
                      Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                    </div>
                  )}

                  {!badge.earned && (
                    <div className="locked-hint">
                      Complete the required action to unlock this badge
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {filteredBadges.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No achievements found</h3>
            <p>
              {filter === 'earned'
                ? "You haven't earned any achievements yet. Keep learning to unlock your first badge!"
                : filter === 'locked'
                  ? 'All achievements have been unlocked! Congratulations!'
                  : 'No achievements available at the moment.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementHistory;
