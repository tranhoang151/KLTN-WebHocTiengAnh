
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { Course } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const StudentCourseList: React.FC = () => {
  const { getAuthToken } = useAuth();

  const getToken = async () => {
    return await getAuthToken();
  };
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const enrolledCourses = await courseService.getEnrolledCourses(token || '');
        setCourses(enrolledCourses);
      } catch (err: any) {
        setError(err.message || 'Failed to load your courses.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading your courses...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">My Courses</h2>
      {courses.length === 0 ? (
        <p className="text-gray-600">You are not enrolled in any courses yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <Link to={`/learn/course/${course.id}`} key={course.id} className="block bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors">
              <h3 className="text-lg font-semibold text-blue-600">{course.name}</h3>
              <p className="text-sm text-gray-700 mt-2">{course.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourseList;
