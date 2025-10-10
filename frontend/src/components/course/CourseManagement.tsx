import React, { useState } from 'react';
import { Course } from '../../types';
import { courseService } from '../../services/courseService';
import CourseList from './CourseList';
import CourseForm from './CourseForm';
import { usePermissions } from '../../hooks/usePermissions';
import './CourseManagement.css';

type ViewMode = 'list' | 'create' | 'edit';

const CourseManagement: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const permissions = usePermissions();

    const handleCreateCourse = () => {
        setSelectedCourse(null);
        setViewMode('create');
        setError(null);
    };

    const handleEditCourse = (course: Course) => {
        setSelectedCourse(course);
        setViewMode('edit');
        setError(null);
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedCourse(null);
        setError(null);
    };

    const handleSubmitCourse = async (courseData: Omit<Course, 'id' | 'created_at'>) => {
        try {
            setLoading(true);
            setError(null);

            if (viewMode === 'create') {
                await courseService.createCourse(courseData);
            } else if (viewMode === 'edit' && selectedCourse) {
                await courseService.updateCourse(selectedCourse.id, courseData);
            }

            setViewMode('list');
            setSelectedCourse(null);
        } catch (err: any) {
            setError(err.message || 'Failed to save course');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        // This will be handled by CourseList component
        console.log('Course deleted:', courseId);
    };

    // Check permissions
    if (!permissions.canManageCourses) {
        return (
            <div className="course-management-unauthorized">
                <div className="unauthorized-content">
                    <h2>Access Denied</h2>
                    <p>You don't have permission to manage courses.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="course-management-container">
            {error && (
                <div className="error-banner">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {viewMode === 'list' && (
                <CourseList
                    onCreateCourse={handleCreateCourse}
                    onEditCourse={handleEditCourse}
                    onDeleteCourse={handleDeleteCourse}
                    showActions={true}
                />
            )}

            {(viewMode === 'create' || viewMode === 'edit') && (
                <div className="course-form-wrapper">
                    <div className="form-navigation">
                        <button
                            className="back-button"
                            onClick={handleBackToList}
                            disabled={loading}
                        >
                            ← Back to Courses
                        </button>
                    </div>

                    <CourseForm
                        course={selectedCourse}
                        onSubmit={handleSubmitCourse}
                        onCancel={handleBackToList}
                        loading={loading}
                    />
                </div>
            )}
        </div>
    );
};

export default CourseManagement;