import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { usePermissions } from '../../hooks/usePermissions';
// import { ChildFriendlyCard } from '../ui'; // Removed to avoid circular dependency
import {
  BookOpen,
  PenTool,
  FileText,
  Video,
  BarChart3,
  Award,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import './StudentDashboard.css';
import StudentFlashcardLearningFlow from '../learning/StudentFlashcardLearningFlow';
import StudentExerciseList from '../exercise/StudentExerciseList';
import ExerciseScreen from '../exercise/ExerciseScreen';
import StudentVideoLearningFlow from '../learning/StudentVideoLearningFlow';
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
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorations */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '300px',
          height: '300px',
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />

      {/* Welcome Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '40px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontSize: '48px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ffffff, #f0f8ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 16px 0',
            textShadow: '0 4px 8px rgba(0,0,0,0.1)',
          }}
        >
          Welcome to BingGo! 🎉
        </h1>
        <p
          style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.9)',
            margin: '0',
            fontWeight: '500',
          }}
        >
          Choose your learning adventure below
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '30px',
          maxWidth: '1400px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Flashcards */}
        {hasPermission('flashcards', 'read') && (
          <div
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow =
                '0 30px 60px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow =
                '0 20px 40px rgba(0, 0, 0, 0.1)';
            }}
            onClick={() =>
              (window.location.href = '/student/flashcards')
            }
          >
            {/* Background decoration */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '50%',
                opacity: '0.1',
              }}
            />

            {/* Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
              }}
            >
              <BookOpen size={32} color="white" />
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 12px 0',
              }}
            >
              Flashcards
            </h3>

            {/* Description */}
            <p
              style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '0 0 24px 0',
                lineHeight: '1.6',
              }}
            >
              Learn new vocabulary with fun, interactive flashcards!
            </p>

            {/* Action Button */}
            <Link
              to="/student/flashcards"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 20px rgba(59, 130, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(59, 130, 246, 0.4)';
              }}
            >
              Start Learning
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* Exercises */}
        {hasPermission('exercises', 'read') && (
          <div
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow =
                '0 30px 60px rgba(34, 197, 94, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow =
                '0 20px 40px rgba(0, 0, 0, 0.1)';
            }}
            onClick={() => (window.location.href = '/student/exercises')}
          >
            {/* Background decoration */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                borderRadius: '50%',
                opacity: '0.1',
              }}
            />

            {/* Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 8px 16px rgba(34, 197, 94, 0.3)',
              }}
            >
              <PenTool size={32} color="white" />
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 12px 0',
              }}
            >
              Exercises
            </h3>

            {/* Description */}
            <p
              style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '0 0 24px 0',
                lineHeight: '1.6',
              }}
            >
              Practice your English skills with fun exercises and games!
            </p>

            {/* Action Button */}
            <Link
              to="/student/exercises"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 20px rgba(34, 197, 94, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(34, 197, 94, 0.4)';
              }}
            >
              Start Practicing
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* Tests */}
        {hasPermission('tests', 'read') && (
          <div
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow =
                '0 30px 60px rgba(249, 115, 22, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow =
                '0 20px 40px rgba(0, 0, 0, 0.1)';
            }}
            onClick={() => (window.location.href = '/student/tests')}
          >
            {/* Background decoration */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                borderRadius: '50%',
                opacity: '0.1',
              }}
            />

            {/* Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 8px 16px rgba(249, 115, 22, 0.3)',
              }}
            >
              <FileText size={32} color="white" />
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 12px 0',
              }}
            >
              Tests
            </h3>

            {/* Description */}
            <p
              style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '0 0 24px 0',
                lineHeight: '1.6',
              }}
            >
              Show what you've learned with fun quizzes and tests!
            </p>

            {/* Action Button */}
            <Link
              to="/student/tests"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 20px rgba(249, 115, 22, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(249, 115, 22, 0.4)';
              }}
            >
              Take a Test
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* Videos */}
        {hasPermission('videos', 'read') && (
          <div
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow =
                '0 30px 60px rgba(168, 85, 247, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow =
                '0 20px 40px rgba(0, 0, 0, 0.1)';
            }}
            onClick={() => (window.location.href = '/student/videos')}
          >
            {/* Background decoration */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                borderRadius: '50%',
                opacity: '0.1',
              }}
            />

            {/* Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 8px 16px rgba(168, 85, 247, 0.3)',
              }}
            >
              <Video size={32} color="white" />
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 12px 0',
              }}
            >
              Videos
            </h3>

            {/* Description */}
            <p
              style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '0 0 24px 0',
                lineHeight: '1.6',
              }}
            >
              Watch exciting English lessons and stories!
            </p>

            {/* Action Button */}
            <Link
              to="/student/videos"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 20px rgba(168, 85, 247, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(168, 85, 247, 0.4)';
              }}
            >
              Watch Videos
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* Progress */}
        {hasPermission('progress', 'read') && (
          <div
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow =
                '0 30px 60px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow =
                '0 20px 40px rgba(0, 0, 0, 0.1)';
            }}
            onClick={() => (window.location.href = '/student/progress')}
          >
            {/* Background decoration */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '50%',
                opacity: '0.1',
              }}
            />

            {/* Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
              }}
            >
              <BarChart3 size={32} color="white" />
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 12px 0',
              }}
            >
              My Progress
            </h3>

            {/* Description */}
            <p
              style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '0 0 24px 0',
                lineHeight: '1.6',
              }}
            >
              See how much you've learned and grown!
            </p>

            {/* Action Button */}
            <Link
              to="/student/progress"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 20px rgba(59, 130, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(59, 130, 246, 0.4)';
              }}
            >
              Check Progress
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* Badges */}
        {hasPermission('badges', 'read') && (
          <div
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow =
                '0 30px 60px rgba(236, 72, 153, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow =
                '0 20px 40px rgba(0, 0, 0, 0.1)';
            }}
            onClick={() => (window.location.href = '/student/badges')}
          >
            {/* Background decoration */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #ec4899, #db2777)',
                borderRadius: '50%',
                opacity: '0.1',
              }}
            />

            {/* Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #ec4899, #db2777)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                boxShadow: '0 8px 16px rgba(236, 72, 153, 0.3)',
              }}
            >
              <Award size={32} color="white" />
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 12px 0',
              }}
            >
              My Badges
            </h3>

            {/* Description */}
            <p
              style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '0 0 24px 0',
                lineHeight: '1.6',
              }}
            >
              Collect awesome badges for your achievements!
            </p>

            {/* Action Button */}
            <Link
              to="/student/badges"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #ec4899, #db2777)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 20px rgba(236, 72, 153, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(236, 72, 153, 0.4)';
              }}
            >
              See My Badges
              <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// The old StudentDashboardHome can be removed or kept for other purposes.
// For now, we will just replace it in the route.

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

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
            <StudentFlashcardLearningFlow
              onExit={() => navigate('/student')}
            />
          }
        />
        <Route
          path="/flashcards/:setId/learn"
          element={<FlashcardLearningPage />}
        />
        <Route path="/exercises" element={<StudentExerciseList />} />
        <Route path="/exercises/:exerciseId" element={<ExerciseScreen />} />
        <Route
          path="/tests"
          element={<div>Test List Page - Coming Soon</div>}
        />
        <Route path="/tests/:testId/start" element={<TestStartPage />} />
        <Route path="/tests/:testId/take" element={<TestTakingPage />} />
        <Route path="/tests/:testId/results" element={<TestResultPage />} />
        <Route
          path="/flashcards/:setId/learn"
          element={<FlashcardLearningPage />}
        />
        <Route path="/videos" element={<StudentVideoLearningFlow onExit={() => navigate('/student')} />} />
        <Route path="/videos/progress" element={<VideoProgressPage />} />
        <Route path="/videos/:videoId" element={<VideoDetailPage />} />
        <Route path="/course/:courseId" element={<CourseDetailPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </DashboardLayout>
  );
};

export default StudentDashboard;
