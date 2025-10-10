# Components Directory

This directory contains all reusable React components organized by feature.

## Structure

### `/common`

Common UI components used throughout the application:

- Buttons, inputs, modals, loading spinners
- Layout components (Header, Footer, Sidebar)
- Form components and validation

### `/flashcard`

Flashcard learning system components:

- FlashcardLearning - Main flashcard learning interface
- FlashcardCard - Individual flashcard component
- FlashcardSet - Flashcard set selection and management
- FlashcardProgress - Progress tracking for flashcard learning

### `/exercise`

Exercise and test components:

- ExerciseScreen - Main exercise interface
- MultipleChoiceQuestion - Multiple choice question component
- FillBlankQuestion - Fill-in-the-blank question component
- ExerciseResult - Results and scoring display

### `/video`

Video learning components:

- VideoPlayer - YouTube video player integration
- VideoLibrary - Video lesson library
- VideoProgress - Video watching progress tracking

### `/badge`

Gamification and badge system:

- BadgeSystem - Badge collection and display
- BadgeNotification - Badge award notifications
- BadgeCard - Individual badge component

### `/progress`

Progress tracking and analytics:

- ProgressDashboard - Student progress overview
- ProgressChart - Progress visualization charts
- LearningStreak - Streak tracking and display

### `/auth`

Authentication components:

- LoginForm - User login form
- ProtectedRoute - Route protection wrapper
- RoleBasedAccess - Role-based component access

## Component Guidelines

1. **Naming**: Use PascalCase for component names
2. **Props**: Define TypeScript interfaces for all props
3. **Styling**: Use CSS modules or styled-components
4. **Testing**: Include unit tests for each component
5. **Documentation**: Add JSDoc comments for complex components

## Example Component Structure

```typescript
interface ComponentProps {
  // Define props here
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic here

  return (
    <div className="component">
      {/* JSX here */}
    </div>
  );
};

export default Component;
```
