import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  progressService,
  StudentProgressSummaryDto,
} from '../../services/progressService';
import { Link } from 'react-router-dom';

const ParentProgressPage: React.FC = () => {
  const { user } = useAuth();
  const [childrenSummaries, setChildrenSummaries] = useState<
    StudentProgressSummaryDto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'parent') {
      loadChildrenSummaries(user.id);
    }
  }, [user]);

  const loadChildrenSummaries = async (parentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response =
        await progressService.getChildrenProgressSummaries(parentId);
      if (response.success && response.data) {
        setChildrenSummaries(response.data);
      } else {
        throw new Error(
          response.error || "Failed to load children's progress summaries"
        );
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">Loading children's progress...</div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!childrenSummaries.length) {
    return (
      <div className="text-center p-8">
        <p>No children linked to your account yet.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        My Children's Progress
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {childrenSummaries.map((child) => (
          <div
            key={child.studentId}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            <div className="p-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {child.studentName}
              </h2>
              <p className="text-gray-600">
                Overall Score: {child.overallScore.toFixed(1)}%
              </p>
              <p className="text-gray-600">
                Completed Activities: {child.completedActivities}
              </p>
              <p className="text-gray-600">
                Total Study Time: {child.totalStudyTimeHours.toFixed(2)} hours
              </p>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link
                to={`/parent/progress/child/${child.studentId}`}
                className="font-medium text-indigo-600 hover:text-indigo-900"
              >
                View Detailed Report
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParentProgressPage;
