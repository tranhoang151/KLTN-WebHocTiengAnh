import React, { useState, useEffect } from 'react';
import { Class, Course, User } from '../../types';
import { classService } from '../../services/classService';
import { courseService } from '../../services/courseService';
import { userService } from '../../services/userService';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import ChildFriendlyCard from '../ui/ChildFriendlyCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import './ClassList.css';

interface ClassListProps {
    onEditClass?: (classData: Class) => void;
    onCreateClass?: () => void;
    onDeleteClass?: (classId: string) => void;
    showActions?: boolean;
}

const ClassList: React.FC<ClassListProps> = ({
    onEditClass,
    onCreateClass,
    onDeleteClass,
    showActions = true,
}) => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [classesData, coursesData, teachersData] = await Promise.all([
                classService.getAllClasses(),
                courseService.getAllCourses(),
                classService.getAvailableTeachers(),
            ]);

            setClasses(classesData);
            setCourses(coursesData);
            setTeachers(teachersData);
        } catch (err: any) {
            setError(err.message || 'Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClass = async (classId: string) => {
        if (!window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
            return;
        }

        try {
            setDeletingId(classId);
            await classService.deleteClass(classId);
            setClasses(prev => prev.filter(cls => (cls as any).Id !== classId && cls.id !== classId));
            onDeleteClass?.(classId);
        } catch (err: any) {
            setError(err.message || 'Failed to delete class');
        } finally {
            setDeletingId(null);
        }
    };

    const getCourseName = (courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        return course?.name || 'Unknown Course';
    };

    const getTeacherName = (teacherId: string) => {
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher?.full_name || 'Unknown Teacher';
    };

    if (loading) {
        return (
            <div className="class-list-loading">
                <LoadingSpinner />
                <p>Loading classes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <ErrorMessage
                message={error}
                onRetry={loadData}
            />
        );
    }

    return (
        <div className="class-list-container">
            <div className="class-list-header">
                <div>
                    <h2>Class Management</h2>
                    <p>Manage your classes and student assignments</p>
                </div>
                {showActions && onCreateClass && (
                    <ChildFriendlyButton
                        variant="primary"
                        onClick={onCreateClass}
                    >
                        + Create Class
                    </ChildFriendlyButton>
                )}
            </div>

            {classes.length === 0 ? (
                <ChildFriendlyCard className="empty-state">
                    <div className="empty-content">
                        <div className="empty-icon">🏫</div>
                        <h3>No classes yet</h3>
                        <p>Create your first class to get started</p>
                        {showActions && onCreateClass && (
                            <ChildFriendlyButton
                                variant="primary"
                                onClick={onCreateClass}
                            >
                                Create First Class
                            </ChildFriendlyButton>
                        )}
                    </div>
                </ChildFriendlyCard>
            ) : (
                <div className="class-grid">
                    {classes.map((classData) => (
                        <ChildFriendlyCard key={(classData as any).Id || classData.id} className="class-card">
                            <div className="class-header">
                                <div className="class-title-section">
                                    <h3 className="class-title">{(classData as any).Name || classData.name}</h3>
                                    <div className="class-status">
                                        <span className={`status-badge ${(classData as any).IsActive ?? classData.is_active ? 'active' : 'inactive'}`}>
                                            {(classData as any).IsActive ?? classData.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="class-content">
                                <p className="class-description">{(classData as any).Description || classData.description}</p>

                                <div className="class-details">
                                    <div className="detail-item">
                                        <span className="detail-label">📚 Course:</span>
                                        <span className="detail-value">{getCourseName((classData as any).CourseId || classData.course_id)}</span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-label">👨‍🏫 Teacher:</span>
                                        <span className="detail-value">{getTeacherName((classData as any).TeacherId || classData.teacher_id)}</span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-label">👥 Students:</span>
                                        <span className="detail-value">
                                            {((classData as any).StudentIds || classData.student_ids || []).length}/{classData.capacity}
                                        </span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-label">📅 Created:</span>
                                        <span className="detail-value">
                                            {new Date((classData as any).CreatedAt || classData.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="capacity-bar">
                                    <div className="capacity-label">
                                        <span>Capacity</span>
                                        <span>{((classData as any).StudentIds || classData.student_ids || []).length}/{classData.capacity}</span>
                                    </div>
                                    <div className="capacity-progress">
                                        <div
                                            className="capacity-fill"
                                            style={{
                                                width: `${Math.min(((((classData as any).StudentIds || classData.student_ids || []).length) / classData.capacity) * 100, 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                {showActions && (
                                    <div className="class-actions">
                                        {onEditClass && (
                                            <ChildFriendlyButton
                                                variant="secondary"
                                                onClick={() => onEditClass(classData)}
                                            >
                                                Edit
                                            </ChildFriendlyButton>
                                        )}
                                        {onDeleteClass && (
                                            <ChildFriendlyButton
                                                variant="danger"
                                                onClick={() => handleDeleteClass((classData as any).Id || classData.id)}
                                                loading={deletingId === (classData as any).Id || deletingId === classData.id}
                                                disabled={deletingId === (classData as any).Id || deletingId === classData.id}
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

export default ClassList;