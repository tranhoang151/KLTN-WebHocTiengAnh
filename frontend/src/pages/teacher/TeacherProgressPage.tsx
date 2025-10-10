import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  progressService,
  TeacherClassSummaryDto,
} from '../../services/progressService';
import { Link } from 'react-router-dom';

const TeacherProgressPage: React.FC = () => {
  const { user } = useAuth();
  const [classSummaries, setClassSummaries] = useState<
    TeacherClassSummaryDto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'teacher') {
      loadClassSummaries(user.id);
    }
  }, [user]);

  const loadClassSummaries = async (teacherId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response =
        await progressService.getTeacherClassSummaries(teacherId);
      if (response.success && response.data) {
        setClassSummaries(response.data);
      } else {
        throw new Error(response.error || 'Failed to load class summaries');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading class summaries...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!classSummaries.length) {
    return (
      <div className="text-center p-8">
        <p>No classes assigned to you yet.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        My Classes Progress
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classSummaries.map((summary) => (
          <div
            key={summary.classId}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="p-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {summary.className}
              </h2>
              <p className="text-gray-600">Students: {summary.studentCount}</p>
              <p className="text-gray-600">
                Avg. Completion: {summary.averageCompletionRate.toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link
                to={`/teacher/progress/class/${summary.classId}`}
                className="font-medium text-indigo-600 hover:text-indigo-900"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherProgressPage;
