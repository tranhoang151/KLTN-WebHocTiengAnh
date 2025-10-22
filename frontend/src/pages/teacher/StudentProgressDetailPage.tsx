import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  progressService,
  StudentDashboardDto,
} from '../../services/progressService';
import ProgressOverview from '../../components/progress/ProgressOverview';
import ActivityTimeline from '../../components/progress/ActivityTimeline';
import PerformanceChart from '../../components/progress/PerformanceChart';

const StudentProgressDetailPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [dashboardData, setDashboardData] =
    useState<StudentDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentId) {
      loadStudentDashboardData(studentId);
    }
  }, [studentId]);

  const loadStudentDashboardData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await progressService.getStudentDashboardData(id);
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        throw new Error(
          response.error || 'Failed to load student progress data'
        );
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading student progress...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!dashboardData) {
    return (
      <div className="text-center p-8">No student progress data available.</div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Student Progress: {studentId}
      </h1>

      <ProgressOverview
        streakCount={dashboardData.streakCount}
        totalStudyTimeHours={dashboardData.totalStudyTimeHours}
        completedExercises={dashboardData.completedExercises}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <PerformanceChart performanceData={dashboardData.exercisePerformance} />
        <ActivityTimeline activities={dashboardData.recentActivities} />
      </div>
    </div>
  );
};

export default StudentProgressDetailPage;


