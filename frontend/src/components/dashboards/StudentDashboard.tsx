import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { usePermissions } from '../../hooks/usePermissions';
import { ChildFriendlyCard } from '../ui';
import './StudentDashboard.css';
import FlashcardLearningFlow from '../learning/FlashcardLearningFlow';
import ExerciseFlow from '../learning/ExerciseFlow';
import VideoLecturesPage from '../../pages/student/VideoLecturesPage';
import VideoDetailPage from '../../pages/student/VideoDetailPage';
import VideoProgressPage from '../../pages/student/VideoProgressPage';
import ProgressDashboardPage from '../../pages/student/ProgressDashboardPage';
import StreakPage from '../../pages/student/StreakPage';
import CourseDetailPage from '../../pages/learning/CourseDetailPage';
import FlashcardLearningPage from '../../pages/student/FlashcardLearningPage';
import TestStartPage from '../../pages/student/TestStartPage';
import TestTakingPage from '../../pages/student/TestTakingPage';
import TestResultPage from '../../pages/student/TestResultPage';

const StudentDashboardHome: React.FC = () => {
  const { hasPermission } = usePermissions();

  return (
    <div className="student-dashboard">
      {/* Floating background elements */}
      <div className="floating-elements">
        <div className="floating-element">🌟</div>
        <div className="floating-element">📚</div>
        <div className="floating-element">🎯</div>
        <div className="floating-element">🏆</div>
      </div>

      <div className="dashboard-grid">
        {/* Flashcards */}
        {hasPermission('flashcards', 'read') && (
          <ChildFriendlyCard
            title="Flashcards"
            icon="📚"
            color="blue"
            interactive
            onClick={() => (window.location.href = '/student/flashcards/animals/learn')}
          >
            <p style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>
              Learn new vocabulary with fun, interactive flashcards!
            </p>
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <Link
                to="/student/flashcards/animals/learn"
                style={{
                  color: 'var(--primary-blue)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: 'var(--font-size-md)',
                }}
              >
                Start Learning! 🚀
              </Link>
            </div>
          </ChildFriendlyCard>
        )}

        {/* Exercises */}
        {hasPermission('exercises', 'read') && (
          <ChildFriendlyCard
            title="Exercises"
            icon="✏️"
            color="green"
            interactive
            onClick={() => (window.location.href = '/student/exercises')}
          >
            <p style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>
              Practice your English skills with fun exercises and games!
            </p>
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <Link
                to="/student/exercises"
                style={{
                  color: 'var(--primary-green)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: 'var(--font-size-md)',
                }}
              >
                Start Practicing! 💪
              </Link>
            </div>
          </ChildFriendlyCard>
        )}

        {/* Tests */}
        {hasPermission('tests', 'read') && (
          <ChildFriendlyCard
            title="Tests"
            icon="📝"
            color="orange"
            interactive
            onClick={() => (window.location.href = '/student/tests')}
          >
            <p style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>
              Show what you've learned with fun quizzes and tests!
            </p>
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <Link
                to="/student/tests"
                style={{
                  color: 'var(--primary-orange)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: 'var(--font-size-md)',
                }}
              >
                Take a Test! 🎯
              </Link>
            </div>
          </ChildFriendlyCard>
        )}

        {/* Videos */}
        {hasPermission('videos', 'read') && (
          <ChildFriendlyCard
            title="Videos"
            icon="🎥"
            color="purple"
            interactive
            onClick={() => (window.location.href = '/student/videos')}
          >
            <p style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>
              Watch exciting English lessons and stories!
            </p>
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <Link
                to="/student/videos"
                style={{
                  color: 'var(--primary-purple)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: 'var(--font-size-md)',
                }}
              >
                Watch Videos! 🍿
              </Link>
            </div>
          </ChildFriendlyCard>
        )}

        {/* Progress */}
        {hasPermission('progress', 'read') && (
          <ChildFriendlyCard
            title="My Progress"
            icon="📊"
            color="blue"
            interactive
            onClick={() => (window.location.href = '/student/progress')}
          >
            <p style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>
              See how much you've learned and grown!
            </p>
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <Link
                to="/student/progress"
                style={{
                  color: 'var(--primary-blue)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: 'var(--font-size-md)',
                }}
              >
                Check Progress! 📈
              </Link>
            </div>
          </ChildFriendlyCard>
        )}

        {/* Badges */}
        {hasPermission('badges', 'read') && (
          <ChildFriendlyCard
            title="My Badges"
            icon="🏆"
            color="pink"
            interactive
            onClick={() => (window.location.href = '/student/badges')}
          >
            <p style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>
              Collect awesome badges for your achievements!
            </p>
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <Link
                to="/student/badges"
                style={{
                  color: 'var(--primary-pink)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: 'var(--font-size-md)',
                }}
              >
                See My Badges! 🌟
              </Link>
            </div>
          </ChildFriendlyCard>
        )}
        {/* Video Progress */}
        {hasPermission('progress', 'read') && (
          <ChildFriendlyCard
            title="Video Progress"
            icon="📈"
            color="green"
            interactive
            onClick={() => (window.location.href = '/student/videos/progress')}
          >
            <p style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>
              See all the amazing videos you've watched!
            </p>
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <Link
                to="/student/videos/progress"
                style={{
                  color: 'var(--primary-green)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: 'var(--font-size-md)',
                }}
              >
                View History! 📺
              </Link>
            </div>
          </ChildFriendlyCard>
        )}

        {/* Learning Streak */}
        {hasPermission('progress', 'read') && (
          <ChildFriendlyCard
            title="Learning Streak"
            icon="🔥"
            color="orange"
            interactive
            onClick={() => (window.location.href = '/student/streak')}
          >
            <p style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>
              Keep your learning fire burning every day!
            </p>
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <Link
                to="/student/streak"
                style={{
                  color: 'var(--primary-orange)',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: 'var(--font-size-md)',
                }}
              >
                View Streak! 🔥
              </Link>
            </div>
          </ChildFriendlyCard>
        )}
      </div>

      {/* Welcome Message */}
      <ChildFriendlyCard
        title="Welcome to Your Learning Adventure!"
        icon="👋"
        color="blue"
        className="welcome-card"
      >
        <div style={{ textAlign: 'center' }}>
          <h3 className="heading-child heading-lg text-rainbow">
            Ready to Learn English? 🚀
          </h3>
          <p
            style={{
              fontSize: 'var(--font-size-md)',
              lineHeight: '1.6',
              margin: 'var(--spacing-md) 0',
            }}
          >
            Choose any activity above to start your amazing English learning
            journey! You can learn new words with flashcards, practice with fun
            exercises, watch exciting videos, and collect cool badges! 🌟
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--spacing-sm)',
              marginTop: 'var(--spacing-lg)',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: '2em' }}>🎯</span>
            <span style={{ fontSize: '2em' }}>📚</span>
            <span style={{ fontSize: '2em' }}>🎮</span>
            <span style={{ fontSize: '2em' }}>🏆</span>
            <span style={{ fontSize: '2em' }}>🌈</span>
          </div>
        </div>
      </ChildFriendlyCard>
    </div>
  );
};

// The old StudentDashboardHome can be removed or kept for other purposes.
// For now, we will just replace it in the route.

const StudentDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Student Dashboard">
      <Routes>
        <Route path="/" element={<StudentDashboardHome />} />{' '}
        {/* Main home screen with learning options */}
        <Route path="/progress" element={<ProgressDashboardPage />} />{' '}
        {/* Progress tracking page */}
        <Route path="/streak" element={<StreakPage />} />
        <Route
          path="/flashcards"
          element={
            <FlashcardLearningFlow
              courseId="default-course" // TODO: Get from user's enrolled courses
              onExit={() => window.history.back()}
            />
          }
        />
        <Route path="/flashcards/:setId/learn" element={<FlashcardLearningPage />} />
        <Route path="/exercises/*" element={<ExerciseFlow />} />
        <Route path="/tests" element={<div>Test List Page - Coming Soon</div>} />
        <Route path="/tests/:testId/start" element={<TestStartPage />} />
        <Route path="/tests/:testId/take" element={<TestTakingPage />} />
        <Route path="/tests/:testId/results" element={<TestResultPage />} />
        <Route path="/flashcards/:setId/learn" element={<FlashcardLearningPage />} />
        <Route path="/videos" element={<VideoLecturesPage />} />
        <Route path="/videos/progress" element={<VideoProgressPage />} />
        <Route path="/videos/:videoId" element={<VideoDetailPage />} />
        <Route path="/course/:courseId" element={<CourseDetailPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </DashboardLayout>
  );
};

export default StudentDashboard;
