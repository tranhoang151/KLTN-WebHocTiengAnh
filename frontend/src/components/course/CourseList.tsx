import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import { courseService } from '../../services/courseService';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import ChildFriendlyCard from '../ui/ChildFriendlyCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import './CourseList.css';

interface CourseListProps {
    onEditCourse?: (course: Course) => void;
    onCreateCourse?: () => void;
    onDeleteCourse?: (courseId: string) => void;
    showActions?: boolean;
}

const CourseList: React.FC<CourseListProps> = ({
    onEditCourse,
    onCreateCourse,
    onDeleteCourse,
    showActions = true,
}) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const coursesData = await courseService.getAllCourses();
            setCourses(coursesData);
        } catch (err: any) {
            setError(err.message || 'Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            return;
        }

        try {
            setDeletingId(courseId);
            await courseService.deleteCourse(courseId);
            setCourses(prev => prev.filter(course => course.id !== courseId));
            onDeleteCourse?.(courseId);
        } catch (err: any) {
            setError(err.message || 'Failed to delete course');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="course-list-loading">
                <LoadingSpinner />
                <p>Loading courses...</p>
            </div>
        );
    }

    if (error) {
        return (
            <ErrorMessage
                message={error}
                onRetry={loadCourses}
            />
        );
    }

    return (
        <div className="course-list-container">
            <div className="course-list-header">
                <div>
                    <h2>Course Management</h2>
                    <p>Manage your courses and their content</p>
                </div>
                {showActions && onCreateCourse && (
                    <ChildFriendlyButton
                        variant="primary"
                        onClick={onCreateCourse}
                    >
                        + Create Course
                    </ChildFriendlyButton>
                )}
            </div>

            {courses.length === 0 ? (
                <ChildFriendlyCard className="empty-state">
                    <div className="empty-content">
                        <div className="empty-icon">📚</div>
                        <h3>No courses yet</h3>
                        <p>Create your first course to get started</p>
                        {showActions && onCreateCourse && (
                            <ChildFriendlyButton
                                variant="primary"
                                onClick={onCreateCourse}
                            >
                                Create First Course
                            </ChildFriendlyButton>
                        )}
                    </div>
                </ChildFriendlyCard>
            ) : (
                <div className="course-grid">
                    {courses.map((course) => (
                        <ChildFriendlyCard key={course.id} className="course-card">
                            <div className="course-image">
                                {course.image_url ? (
                                    <img
                                        src={course.image_url}
                                        alt={course.name}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder-course.png';
                                        }}
                                    />
                                ) : (
                                    <div className="course-placeholder">
                                        <span>📚</span>
                                    </div>
                                )}
                            </div>

                            <div className="course-content">
                                <h3 className="course-title">{course.name}</h3>
                                <p className="course-description">{course.description}</p>

                                <div className="course-meta">
                                    <span className="age-group">
                                        👶 {course.target_age_group}
                                    </span>
                                    <span className="created-date">
                                        📅 {new Date(course.created_at?.toDate?.() || course.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                {showActions && (
                                    <div className="course-actions">
                                        {onEditCourse && (
                                            <ChildFriendlyButton
                                                variant="secondary"
                                                onClick={() => onEditCourse(course)}
                                            >
                                                Edit
                                            </ChildFriendlyButton>
                                        )}
                                        {onDeleteCourse && (
                                            <ChildFriendlyButton
                                                variant="danger"
                                                onClick={() => handleDeleteCourse(course.id)}
                                                loading={deletingId === course.id}
                                                disabled={deletingId === course.id}
                                            >
                                                Delete
                                            </ChildFriendlyButton>
                                        )}
                                    </div>
                                )}
                            </div>
                        </ChildFriendlyCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CourseList;