import React, { useState } from 'react';
import './ParentBadgeCollection.css';

interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  earned: boolean;
  earnedAt?: Date;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ParentBadgeCollectionProps {
  childName: string;
  badges: Badge[];
}

const ParentBadgeCollection: React.FC<ParentBadgeCollectionProps> = ({
  childName,
  badges = [],
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);

  // Default badges if none provided
  const defaultBadges: Badge[] = [
    {
      id: 'badge1',
      name: 'Chăm chỉ đăng nhập',
      description: 'Đăng nhập 3 ngày liên tiếp',
      imageUrl: 'https://i.postimg.cc/Gm7BStxm/Depth-5-Frame-0.png',
      earned: false,
      category: 'consistency',
      rarity: 'common',
    },
    {
      id: 'badge2',
      name: 'Chuyên gia Flashcard',
      description: 'Học xong 1 bộ flashcard',
      imageUrl: 'https://i.postimg.cc/VNqxkrZY/Depth-6-Frame-0.png',
      earned: false,
      category: 'learning',
      rarity: 'common',
    },
    {
      id: 'badge3',
      name: 'Siêng năng làm bài tập',
      description: 'Hoàn thành 1 bài tập',
      imageUrl: 'https://i.postimg.cc/8CQK8yJL/Depth-7-Frame-0.png',
      earned: false,
      category: 'exercises',
      rarity: 'common',
    },
    {
      id: 'badge4',
      name: 'Thi cử tích cực',
      description: 'Hoàn thành 2 bài kiểm tra',
      imageUrl: 'https://i.postimg.cc/L8pLbzpL/Depth-8-Frame-0.png',
      earned: false,
      category: 'tests',
      rarity: 'rare',
    },
    {
      id: 'badge5',
      name: 'Học qua video',
      description: 'Xem hoàn thành 1 video học tập',
      imageUrl: 'https://i.postimg.cc/9FLzJzpL/Depth-9-Frame-0.png',
      earned: false,
      category: 'videos',
      rarity: 'common',
    },
    {
      id: 'badge6',
      name: 'Streak học tập 3 ngày',
      description: 'Học liên tục 3 ngày',
      imageUrl: 'https://i.postimg.cc/L6pLbzpL/Depth-10-Frame-0.png',
      earned: false,
      category: 'consistency',
      rarity: 'rare',
    },
  ];

  const allBadges = badges.length > 0 ? badges : defaultBadges;

  const categories = [
    { id: 'all', name: 'All Badges', icon: '🏆' },
    { id: 'consistency', name: 'Consistency', icon: '🔥' },
    { id: 'learning', name: 'Learning', icon: '📚' },
    { id: 'exercises', name: 'Exercises', icon: '📝' },
    { id: 'tests', name: 'Tests', icon: '🎯' },
    { id: 'videos', name: 'Videos', icon: '📹' },
  ];

  const filteredBadges = allBadges.filter((badge) => {
    const categoryMatch =
      selectedCategory === 'all' || badge.category === selectedCategory;
    const earnedMatch = !showEarnedOnly || badge.earned;
    return categoryMatch && earnedMatch;
  });

  const earnedBadges = allBadges.filter((badge) => badge.earned);
  const totalBadges = allBadges.length;
  const completionPercentage =
    totalBadges > 0 ? (earnedBadges.length / totalBadges) * 100 : 0;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '#95a5a6';
      case 'rare':
        return '#3498db';
      case 'epic':
        return '#9b59b6';
      case 'legendary':
        return '#f39c12';
      default:
        return '#95a5a6';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'Common';
      case 'rare':
        return 'Rare';
      case 'epic':
        return 'Epic';
      case 'legendary':
        return 'Legendary';
      default:
        return 'Common';
    }
  };

  const getMotivationalMessage = () => {
    const earnedCount = earnedBadges.length;

    if (earnedCount === 0) {
      return "Ready to start earning badges? Let's begin the learning journey! 🚀";
    } else if (earnedCount < 3) {
      return `Great start! ${earnedCount} badge${earnedCount > 1 ? 's' : ''} earned. Keep learning! 🌟`;
    } else if (earnedCount < 6) {
      return `Awesome progress! ${earnedCount} badges collected. You're doing amazing! 🎉`;
    } else {
      return `Incredible achievement! ${earnedCount} badges earned. What a dedicated learner! 🏆`;
    }
  };

  return (
    <div className="parent-badge-collection">
      <div className="badge-header">
        <h3>🏆 {childName}'s Badge Collection</h3>
        <p>Celebrate achievements and track learning milestones</p>
      </div>

      {/* Progress Overview */}
      <div className="badge-progress">
        <div className="progress-stats">
          <div className="progress-circle">
            <svg viewBox="0 0 100 100" className="circular-progress">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#ecf0f1"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#f39c12"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${completionPercentage * 2.827} 282.7`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="progress-text">
              <span className="percentage">
                {Math.round(completionPercentage)}%
              </span>
              <span className="label">Complete</span>
            </div>
          </div>

          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-value">{earnedBadges.length}</span>
              <span className="stat-label">Badges Earned</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{totalBadges}</span>
              <span className="stat-label">Total Available</span>
            </div>
          </div>
        </div>

        <div className="motivational-message">
          <p>{getMotivationalMessage()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="badge-filters">
        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>

        <div className="toggle-filters">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showEarnedOnly}
              onChange={(e) => setShowEarnedOnly(e.target.checked)}
            />
            <span className="toggle-text">Show earned only</span>
          </label>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="badge-grid">
        {filteredBadges.map((badge) => (
          <div
            key={badge.id}
            className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}
          >
            <div className="badge-image-container">
              <img
                src={badge.imageUrl}
                alt={badge.name}
                className="badge-image"
                onError={(e) => {
                  // Fallback to emoji if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="badge-fallback" style={{ display: 'none' }}>
                🏆
              </div>

              {!badge.earned && <div className="lock-overlay">🔒</div>}

              <div
                className="rarity-indicator"
                style={{ backgroundColor: getRarityColor(badge.rarity) }}
              >
                {getRarityName(badge.rarity)}
              </div>
            </div>

            <div className="badge-info">
              <h4 className="badge-name">{badge.name}</h4>
              <p className="badge-description">{badge.description}</p>

              {badge.earned && badge.earnedAt && (
                <div className="earned-date">
                  Earned: {badge.earnedAt.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className="no-badges">
          <div className="no-badges-icon">🏆</div>
          <h4>No badges found</h4>
          <p>
            {showEarnedOnly
              ? 'No badges earned yet in this category. Keep learning to unlock achievements!'
              : 'No badges available in this category.'}
          </p>
        </div>
      )}

      {/* Badge Tips */}
      <div className="badge-tips">
        <h4>💡 How to Help Your Child Earn More Badges</h4>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">📅</div>
            <div className="tip-content">
              <h5>Daily Learning</h5>
              <p>
                Encourage consistent daily practice to earn consistency badges
              </p>
            </div>
          </div>

          <div className="tip-card">
            <div className="tip-icon">🎯</div>
            <div className="tip-content">
              <h5>Complete Activities</h5>
              <p>
                Finish flashcard sets, exercises, and tests to unlock
                achievement badges
              </p>
            </div>
          </div>

          <div className="tip-card">
            <div className="tip-icon">🏆</div>
            <div className="tip-content">
              <h5>Celebrate Success</h5>
              <p>
                Acknowledge each badge earned to maintain motivation and
                excitement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentBadgeCollection;
