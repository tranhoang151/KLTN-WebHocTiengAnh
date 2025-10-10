import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AchievementNotification from '../AchievementNotification';
import { Badge } from '../../../types';

const mockBadge: Badge = {
  id: 'test-badge',
  name: 'Test Achievement',
  description: 'This is a test achievement',
  imageUrl: 'https://example.com/badge.png',
  condition: 'Complete 5 lessons',
  conditionKey: 'test_condition',
  isActive: true,
  earned: true,
  earnedAt: new Date(),
};

describe('AchievementNotification', () => {
  const mockOnClose = jest.fn();
  const mockOnShare = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders achievement notification correctly', () => {
    render(
      <AchievementNotification
        badge={mockBadge}
        isVisible={true}
        onClose={mockOnClose}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('Achievement Unlocked!')).toBeInTheDocument();
    expect(screen.getByText('Test Achievement')).toBeInTheDocument();
    expect(screen.getByText('This is a test achievement')).toBeInTheDocument();
    expect(screen.getByAltText('Test Achievement')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <AchievementNotification
        badge={mockBadge}
        isVisible={true}
        onClose={mockOnClose}
        onShare={mockOnShare}
      />
    );

    fireEvent.click(screen.getByText('Awesome!'));

    // Should start exit animation, then call onClose after delay
    waitFor(
      () => {
        expect(mockOnClose).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );
  });

  it('calls onShare when share button is clicked', () => {
    render(
      <AchievementNotification
        badge={mockBadge}
        isVisible={true}
        onClose={mockOnClose}
        onShare={mockOnShare}
      />
    );

    fireEvent.click(screen.getByText('Share Achievement'));
    expect(mockOnShare).toHaveBeenCalled();
  });

  it('calls onClose when X button is clicked', () => {
    render(
      <AchievementNotification
        badge={mockBadge}
        isVisible={true}
        onClose={mockOnClose}
        onShare={mockOnShare}
      />
    );

    fireEvent.click(screen.getByLabelText('Close notification'));

    waitFor(
      () => {
        expect(mockOnClose).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );
  });

  it('does not render when isVisible is false', () => {
    render(
      <AchievementNotification
        badge={mockBadge}
        isVisible={false}
        onClose={mockOnClose}
        onShare={mockOnShare}
      />
    );

    expect(screen.queryByText('Achievement Unlocked!')).not.toBeInTheDocument();
  });

  it('auto-closes after 5 seconds', async () => {
    jest.useFakeTimers();

    render(
      <AchievementNotification
        badge={mockBadge}
        isVisible={true}
        onClose={mockOnClose}
        onShare={mockOnShare}
      />
    );

    // Fast-forward 5 seconds
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });

  it('displays celebration particles', () => {
    render(
      <AchievementNotification
        badge={mockBadge}
        isVisible={true}
        onClose={mockOnClose}
        onShare={mockOnShare}
      />
    );

    const particles = document.querySelectorAll('.particle');
    expect(particles).toHaveLength(12);
  });
});
