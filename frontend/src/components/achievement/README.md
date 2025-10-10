# Achievement Notification System

This module provides a comprehensive achievement notification system with beautiful animations and user engagement features.

## Components

### AchievementNotification

A modal component that displays achievement notifications with celebration animations.

**Props:**

- `badge: Badge` - The badge/achievement to display
- `isVisible: boolean` - Controls visibility of the notification
- `onClose: () => void` - Callback when notification is closed
- `onShare?: () => void` - Optional callback for sharing functionality

**Features:**

- Animated entrance with bounce and rotation effects
- Celebration particles animation
- Auto-close after 5 seconds
- Manual close options (button or X)
- Share functionality
- Responsive design

### AchievementManager

The main manager component that handles achievement notifications globally.

**Props:**

- `onAchievementEarned?: (badge: Badge) => void` - Optional callback when achievement is earned

**Features:**

- Automatic notification checking every 30 seconds
- Queue management for multiple notifications
- Event-driven achievement checking
- Integration with badge service
- Notification state management

### AchievementHistory

A modal component that displays the user's achievement collection.

**Props:**

- `userId: string` - User ID to load achievements for
- `isVisible: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed

**Features:**

- Grid display of all achievements
- Filter by earned/locked/all
- Progress statistics
- Achievement details with earn dates
- Responsive grid layout

### AchievementButton

A button component that opens the achievement history modal.

**Props:**

- `userId: string` - User ID for loading achievements
- `variant?: 'icon' | 'full' | 'compact'` - Button style variant
- `showCount?: boolean` - Whether to show achievement count

**Variants:**

- `icon` - Just trophy icon with notification dot
- `compact` - Icon + count in compact format
- `full` - Full button with progress bar and stats

## Usage

### Basic Setup

1. Add `AchievementManager` to your main App component:

```tsx
import { AchievementManager } from './components/achievement';

function App() {
  return (
    <div className="App">
      {/* Your app content */}
      <AchievementManager />
    </div>
  );
}
```

2. Add achievement buttons to your UI:

```tsx
import { AchievementButton } from './components/achievement';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      {user && (
        <AchievementButton
          userId={user.id}
          variant="compact"
          showCount={true}
        />
      )}
    </div>
  );
}
```

### Triggering Achievement Checks

Use the helper function to trigger achievement checks after user actions:

```tsx
import { triggerAchievementCheck } from './components/achievement';

// After completing an exercise
const handleExerciseComplete = async () => {
  await exerciseService.submitExercise(submission);
  triggerAchievementCheck(); // This will check for new achievements
};
```

### Manual Achievement Display

You can manually show achievement notifications:

```tsx
import { showAchievementNotification } from './components/achievement';

const handleManualAchievement = () => {
  const badge = {
    id: 'special-badge',
    name: 'Special Achievement',
    description: 'You did something special!',
    imageUrl: '/badge-image.png',
    // ... other badge properties
  };

  showAchievementNotification(badge);
};
```

## Backend Integration

The system integrates with the following backend endpoints:

- `GET /api/badges/definitions` - Get all badge definitions
- `GET /api/badges/user/{userId}` - Get user's badges
- `GET /api/badges/notifications/{userId}` - Get unseen notifications
- `POST /api/badges/notifications/{userId}/{badgeId}/seen` - Mark notification as seen
- `POST /api/badges/share` - Share achievement
- `GET /api/badges/stats/{userId}` - Get achievement statistics

## Styling

The components use CSS modules with the following files:

- `AchievementNotification.css` - Notification modal styles
- `AchievementHistory.css` - History modal styles
- `AchievementButton.css` - Button component styles

### Customization

You can customize the appearance by overriding CSS variables:

```css
:root {
  --achievement-primary-color: #667eea;
  --achievement-secondary-color: #764ba2;
  --achievement-accent-color: #ffd700;
  --achievement-success-color: #4ecdc4;
}
```

## Animation Features

### Notification Animations

- **Entrance**: Bouncy scale and rotation animation
- **Particles**: 12 floating celebration particles
- **Badge**: Rotating glow effect and bounce animation
- **Text**: Glowing text effect
- **Exit**: Smooth scale-out animation

### Button Animations

- **Hover**: Lift effect with enhanced shadow
- **Trophy Icon**: Continuous bounce animation
- **Notification Dot**: Pulsing red indicator
- **Progress Bar**: Animated fill with glow effect

## Accessibility

The components include:

- ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode compatibility
- Focus management
- Semantic HTML structure

## Performance

- Lazy loading of achievement data
- Efficient re-rendering with React hooks
- Debounced API calls
- Memory leak prevention with cleanup

## Testing

Run tests with:

```bash
npm test -- --testPathPattern=achievement
```

The test suite covers:

- Component rendering
- User interactions
- Animation states
- API integration
- Error handling
