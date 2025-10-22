import React, { useState, useEffect } from 'react';
import { courseService } from '../../services/courseService';
import { Course } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import VideoLecturesPage from '../../pages/student/VideoLecturesPage';

interface StudentVideoLearningFlowProps {
    onExit?: () => void;
}

const StudentVideoLearningFlow: React.FC<StudentVideoLearningFlowProps> = ({
    onExit,
}) => {
    const { getAuthToken } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadEnrolledCourses();
    }, []);

    const loadEnrolledCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await getAuthToken();
            if (!token) {
                setError('Authentication required');
                return;
            }

            const enrolledCourses = await courseService.getEnrolledCourses(token);
            setCourses(enrolledCourses);

            // Auto-select first course if available
            if (enrolledCourses.length > 0) {
                setSelectedCourseId(enrolledCourses[0].id);
            } else {
                setError('No enrolled courses found');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load enrolled courses');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your courses...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Courses</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="space-x-4">
                        <button
                            onClick={loadEnrolledCourses}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                        {onExit && (
                            <button
                                onClick={onExit}
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Go Back
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-4">🎥</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Courses Available</h3>
                    <p className="text-gray-600 mb-4">You are not enrolled in any courses yet.</p>
                    {onExit && (
                        <button
                            onClick={onExit}
                            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Go Back
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // If only one course, show video lectures directly
    if (courses.length === 1 && selectedCourseId) {
        return (
            <div>
                {onExit && (
                    <div className="mb-4">
                        <button
                            onClick={onExit}
                            className="text-blue-600 hover:underline"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                )}
                <VideoLecturesPage courseId={selectedCourseId} />
            </div>
        );
    }

    // If multiple courses, show course selector
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                {onExit && (
                    <button
                        onClick={onExit}
                        className="text-blue-600 hover:underline mb-4"
                    >
                        ← Back to Dashboard
                    </button>
                )}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose a Course</h2>
                <p className="text-gray-600">Select a course to start learning with videos</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className={`bg-white rounded-lg shadow-md border-2 transition-all cursor-pointer ${selectedCourseId === course.id
                                ? 'border-blue-500 shadow-lg'
                                : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'
                            }`}
                        onClick={() => setSelectedCourseId(course.id)}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">{course.name}</h3>
                                {selectedCourseId === course.id && (
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <p className="text-gray-600 text-sm mb-4">
                                {course.description || 'No description available'}
                            </p>

                            <div className="text-xs text-gray-500 mb-4">
                                Course ID: {course.id}
                            </div>

                            <button
                                onClick={() => setSelectedCourseId(course.id)}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Start Learning
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedCourseId && (
                <div className="mt-8">
                    <VideoLecturesPage courseId={selectedCourseId} />
                </div>
            )}
        </div>
    );
};

export default StudentVideoLearningFlow;


