import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  progressService,
  ClassProgressDto,
} from '../../services/progressService';

const ClassProgressPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [classProgress, setClassProgress] = useState<ClassProgressDto | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (classId) {
      loadClassProgress(classId);
    }
  }, [classId]);

  const loadClassProgress = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await progressService.getClassProgress(id);
      if (response.success && response.data) {
        setClassProgress(response.data);
      } else {
        throw new Error(response.error || 'Failed to load class progress');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading class progress...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!classProgress) {
    return <div className="text-center p-8">Class progress not found.</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Class Progress: {classProgress.className}
      </h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Overall Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completed Activities
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Study Time (Hours)
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classProgress.students.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                >
                  No students in this class or no progress data.
                </td>
              </tr>
            ) : (
              classProgress.students.map((student) => (
                <tr key={student.studentId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.overallScore.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.completedActivities}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.totalStudyTimeHours.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/teacher/progress/student/${student.studentId}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Detailed Report
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassProgressPage;
