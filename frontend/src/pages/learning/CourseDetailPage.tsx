
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { Course } from '../../types';
import FlashcardLearningFlow from '../../components/learning/FlashcardLearningFlow';

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const courseData = await courseService.getCourseById(courseId);
        if (courseData) {
          setCourse(courseData);
        } else {
          setError('Course not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return <div className="text-center p-8">Loading course...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!course) {
    return <div className="text-center p-8">Course not found.</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <Link to="/student/progress" className="text-blue-600 hover:underline"> &larr; Back to Dashboard</Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">{course.name}</h1>
      <p className="text-md text-gray-600 mb-8">{course.description}</p>

      {/* Render the flashcard learning flow */}
      {courseId && <FlashcardLearningFlow courseId={courseId} />}

      {/* Other course content like exercises, tests can be added here */}
    </div>
  );
};

export default CourseDetailPage;


