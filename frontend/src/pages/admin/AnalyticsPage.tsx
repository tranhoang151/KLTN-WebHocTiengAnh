import React, { useState, useEffect } from 'react';
import {
  analyticsService,
  AnalyticsSummaryDto,
} from '../../services/analyticsService';
import StatCard from '../../components/analytics/StatCard';
import ActivityDistributionChart from '../../components/analytics/ActivityDistributionChart';

const AnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSummaryData();
  }, []);

  const loadSummaryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsService.getAnalyticsSummary();
      if (response.success && response.data) {
        setSummary(response.data);
      } else {
        throw new Error(response.error || 'Failed to load analytics summary');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading analytics...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!summary) {
    return <div className="text-center p-8">No analytics data available.</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Platform Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={summary.totalUsers} icon="👥" />
        <StatCard
          title="Total Courses"
          value={summary.totalCourses}
          icon="📚"
        />
        <StatCard
          title="Total Classes"
          value={summary.totalClasses}
          icon="🏫"
        />
        <StatCard title="Total Videos" value={summary.totalVideos} icon="▶️" />
        <StatCard
          title="Total Exercises"
          value={summary.totalExercises}
          icon="📝"
        />
        <StatCard
          title="Avg. Score"
          value={`${summary.averageExerciseScore.toFixed(1)}%`}
          icon="🎯"
        />
      </div>

      <div className="mt-8">
        <ActivityDistributionChart
          activityData={summary.activityCountsByType}
        />
      </div>
    </div>
  );
};

export default AnalyticsPage;


