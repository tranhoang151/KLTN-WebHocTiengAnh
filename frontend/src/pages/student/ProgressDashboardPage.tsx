import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  progressService,
  StudentDashboardDto,
} from '../../services/progressService';
import ProgressOverview from '../../components/progress/ProgressOverview';
import ActivityTimeline from '../../components/progress/ActivityTimeline';
import PerformanceChart from '../../components/progress/PerformanceChart';
import StudentStreakCalendar from '../../components/progress/StudentStreakCalendar';
import StreakStatistics from '../../components/progress/StreakStatistics';
import { AchievementButton } from '../../components/achievement';
import StudentCourseList from '../../components/student/StudentCourseList';

const ProgressDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<StudentDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const response = await progressService.getStudentDashboardData(user.id);
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        throw new Error(response.error || 'Failed to load dashboard data');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!dashboardData) {
    return <div className="text-center p-8">No dashboard data available.</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          My Progress Dashboard
        </h1>
        {user && (
          <AchievementButton
            userId={user.id}
            variant="compact"
            showCount={true}
          />
        )}
      </div>

      <ProgressOverview
        streakCount={dashboardData.streakCount}
        totalStudyTimeHours={dashboardData.totalStudyTimeHours}
        completedExercises={dashboardData.completedExercises}
      />

      {/* Enrolled Courses */}
      <StudentCourseList />

      {/* Streak Statistics Section */}
      <div className="mt-8">
        <StreakStatistics showCalendar={true} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <PerformanceChart performanceData={dashboardData.exercisePerformance} />
        <ActivityTimeline activities={dashboardData.recentActivities} />
      </div>

      {/* Full Streak Calendar */}
      <div className="mt-8">
        <StudentStreakCalendar />
      </div>
    </div>
  );
};

export default ProgressDashboardPage;


