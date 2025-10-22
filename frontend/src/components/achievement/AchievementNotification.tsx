import React, { useEffect, useState } from 'react';
import { Badge } from '../../types';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import FocusTrap from '../accessibility/FocusTrap';
import './AchievementNotification.css';

interface AchievementNotificationProps {
  badge: Badge;
  isVisible: boolean;
  onClose: () => void;
  onShare?: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  badge,
  isVisible,
  onClose,
  onShare,
}) => {
  const [animationPhase, setAnimationPhase] = useState<
    'enter' | 'show' | 'exit'
  >('enter');
  const { announceToScreenReader } = useAccessibility();

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('enter');

      // Phase 1: Enter animation
      const enterTimer = setTimeout(() => {
        setAnimationPhase('show');
        // Announce badge achievement to screen readers
        announceToScreenReader(
          `Congratulations! You earned the ${badge.name} badge: ${badge.description}`,
          'assertive'
        );
      }, 100);

      // Auto close after 5 seconds
      const autoCloseTimer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(autoCloseTimer);
      };
    }
  }, [isVisible]);

  const handleClose = () => {
    setAnimationPhase('exit');
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleShare = () => {
    onShare?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`achievement-overlay ${animationPhase}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-title"
      aria-describedby="achievement-description"
    >
      <FocusTrap active={isVisible}>
        <div className={`achievement-notification ${animationPhase}`}>
          {/* Celebration particles */}
          <div className="celebration-particles">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`particle particle-${i}`} />
            ))}
          </div>

          {/* Main content */}
          <div className="achievement-content">
            <div className="achievement-header">
              <div className="achievement-title">
                <span className="trophy-icon">🏆</span>
                <h2>Achievement Unlocked!</h2>
                <span className="trophy-icon">🏆</span>
              </div>
            </div>

            <div className="badge-showcase">
              <div className="badge-glow">
                <img
                  src={badge.imageUrl}
                  alt={badge.name}
                  className="badge-image"
                />
              </div>
            </div>

            <div className="achievement-details">
              <h3 className="badge-name">{badge.name}</h3>
              <p className="badge-description">{badge.description}</p>
            </div>

            <div className="achievement-actions">
              <button className="share-button" onClick={handleShare}>
                <span className="share-icon">📤</span>
                Share Achievement
              </button>
              <button className="close-button" onClick={handleClose}>
                Awesome!
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            className="close-x"
            onClick={handleClose}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      </FocusTrap>
    </div>
  );
};

export default AchievementNotification;


