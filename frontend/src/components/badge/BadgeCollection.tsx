import React, { useEffect, useState } from 'react';
import { Badge } from '../../types';
import badgeService from '../../services/badgeService';
import './BadgeCollection.css';

interface BadgeCollectionProps {
  userId: string;
}

const BadgeCollection: React.FC<BadgeCollectionProps> = ({ userId }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const userBadges = await badgeService.getUserBadges(userId);
        setBadges(userBadges);
      } catch (error) {
        console.error('Error loading badges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBadges();
  }, [userId]);

  if (loading) {
    return <div>Loading badges...</div>;
  }

  return (
    <div className="badge-collection">
      <h2>My Badges</h2>
      <div className="badge-grid">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}
            title={badge.description}
          >
            <img src={badge.imageUrl} alt={badge.name} />
            <h3>{badge.name}</h3>
            <p>{badge.description}</p>
            {badge.earned && badge.earnedAt && (
              <span className="earned-date">
                Earned: {new Date(badge.earnedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgeCollection;


