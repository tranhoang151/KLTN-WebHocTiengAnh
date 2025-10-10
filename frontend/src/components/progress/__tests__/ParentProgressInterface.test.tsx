import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ParentProgressInterface from '../ParentProgressInterface';
import { AuthContext } from '../../../contexts/AuthContext';

// Mock the services
jest.mock('../../../services/progressService', () => ({
  progressService: {
    getChildrenProgressSummaries: jest.fn().mockResolvedValue({
      success: true,
      data: [
        {
          studentId: 'child1',
          studentName: 'Test Child',
          overallScore: 85.5,
          completedActivities: 10,
          totalStudyTimeHours: 5.2,
        },
      ],
    }),
    getStudentDashboardData: jest.fn().mockResolvedValue({
      success: true,
      data: {
        streakCount: 5,
        totalStudyTimeHours: 5.2,
        completedFlashcardSets: 3,
        completedExercises: 7,
        recentActivities: [],
        exercisePerformance: [],
      },
    }),
  },
}));

jest.mock('../../../services/flashcardService', () => ({
  flashcardService: {
    getUserBadges: jest.fn().mockResolvedValue([]),
    getStreakData: jest.fn().mockResolvedValue({
      currentStreak: 5,
      longestStreak: 8,
      streakCalendar: {},
    }),
  },
}));

const mockUser = {
  id: 'parent1',
  full_name: 'Test Parent',
  email: 'parent@test.com',
  role: 'parent' as const,
  gender: 'other',
  streak_count: 0,
  last_login_date: new Date().toISOString(),
  badges: {},
};

const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const mockAuthValue = {
    user: mockUser,
    loading: false,
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    getAuthToken: jest.fn(),
  };

  return (
    <AuthContext.Provider value={mockAuthValue}>
      {children}
    </AuthContext.Provider>
  );
};

describe('ParentProgressInterface', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <MockAuthProvider>
          <ParentProgressInterface />
        </MockAuthProvider>
      </BrowserRouter>
    );
  };

  test('renders parent progress interface header', async () => {
    renderComponent();

    expect(
      screen.getByText(/My Children's Learning Progress/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Monitor your children's learning journey/i)
    ).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    renderComponent();

    expect(
      screen.getByText(/Loading your children's progress/i)
    ).toBeInTheDocument();
  });

  test('renders tab navigation', async () => {
    renderComponent();

    // Wait for loading to complete and check for tabs
    await screen.findByText(/Overview/i);
    expect(screen.getByText(/Learning Streaks/i)).toBeInTheDocument();
    expect(screen.getByText(/Badges & Achievements/i)).toBeInTheDocument();
    expect(screen.getByText(/Progress Reports/i)).toBeInTheDocument();
  });

  test('renders quick actions section', async () => {
    renderComponent();

    await screen.findByText(/Quick Actions/i);
    expect(screen.getByText(/Print Progress Report/i)).toBeInTheDocument();
    expect(screen.getByText(/Refresh Data/i)).toBeInTheDocument();
  });
});
