import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course } from '../../types';
import { courseService } from '../../services/courseService';
import { classService, Class } from '../../services/classService';
import { useAuth } from '../../contexts/AuthContext';
import {
    BookOpen,
    Calendar,
    Users,
    ArrowLeft,
    Edit,
    Trash2,
    MoreVertical,
    AlertCircle,
    RefreshCw,
    UserCheck,
    // X, // Removed - no longer needed
} from 'lucide-react';
import './CourseDetail.css';
// import AssignClassesDialog from './AssignClassesDialog'; // Removed - Course is required when creating classes

const CourseDetail: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const { getAuthToken } = useAuth();

    const [course, setCourse] = useState<Course | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showOptions, setShowOptions] = useState(false);
    // const [deletingClassId, setDeletingClassId] = useState<string | null>(null); // Removed
    // const [showAssignClassesDialog, setShowAssignClassesDialog] = useState(false); // Removed

    useEffect(() => {
        if (courseId) {
            loadCourseData();
        }
    }, [courseId]);

    const loadCourseData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [courseData, classesData] = await Promise.all([
                courseService.getCourseById(courseId!),
                courseService.getCourseClasses(courseId!)
            ]);

            if (!courseData) {
                setError('Course not found');
                return;
            }

            console.log('Course data received:', courseData);
            console.log('Course created_at:', courseData.created_at, typeof courseData.created_at);
            console.log('Course (as any).created_at:', (courseData as any).created_at, typeof (courseData as any).created_at);

            setCourse(courseData);
            setClasses(classesData);
        } catch (err: any) {
            setError(err.message || 'Failed to load course data');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToList = () => {
        navigate('/admin/courses');
    };

    const handleEditCourse = () => {
        navigate(`/admin/courses/edit/${courseId}`);
    };

    const handleDeleteCourse = async () => {
        if (!course) return;

        if (
            !window.confirm(
                `Are you sure you want to delete "${course.name}"? This action cannot be undone.`
            )
        ) {
            return;
        }

        try {
            const token = await getAuthToken();
            await courseService.deleteCourse(course.id);
            navigate('/admin/courses');
        } catch (err: any) {
            setError(err.message || 'Failed to delete course');
        }
    };

    // handleRemoveClassFromCourse function removed - Course is required for all classes
    /*
    const handleRemoveClassFromCourse = async (classId: string, className: string) => {
        if (
            !window.confirm(
                `Are you sure you want to remove "${className}" from this course?`
            )
        ) {
            return;
        }

        try {
            setDeletingClassId(classId);
            const token = await getAuthToken();

            // Update class to remove course_id
            await classService.updateClass(classId, { courseId: undefined });

            // Reload data
            await loadCourseData();
        } catch (err: any) {
            setError(err.message || 'Failed to remove class from course');
        } finally {
            setDeletingClassId(null);
        }
    };
    */

    const handleAssignClassesSuccess = () => {
        loadCourseData(); // Reload course data to get updated classes
    };

    // formatDate function temporarily commented out due to date display being hidden
    /*
    const formatDate = (dateData: any) => {
        console.log('formatDate input:', dateData, typeof dateData);

        if (!dateData) {
            console.log('No dateData provided');
            return 'N/A';
        }

        try {
            let date;

            // Handle Firebase Timestamp
            if (dateData._seconds) {
                console.log('Handling Firebase Timestamp with _seconds:', dateData._seconds);
                date = new Date(dateData._seconds * 1000);
            }
            // Handle Firebase Timestamp object (from backend)
            else if (dateData.seconds) {
                console.log('Handling Firebase Timestamp with seconds:', dateData.seconds);
                date = new Date(dateData.seconds * 1000);
            }
            // Handle regular Date
            else if (dateData.toDate) {
                console.log('Handling Date with toDate method');
                date = dateData.toDate();
            }
            // Handle string date
            else if (typeof dateData === 'string') {
                console.log('Handling string date:', dateData);
                date = new Date(dateData);
            }
            // Handle Date object
            else if (dateData instanceof Date) {
                console.log('Handling Date object');
                date = dateData;
            }
            else {
                console.log('Unknown date format, returning N/A');
                return 'N/A';
            }

            const formatted = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
            console.log('Formatted date:', formatted);
            return formatted;
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };
    */

    if (loading) {
        return (
            <div className="course-detail-container">
                <div className="course-detail-loading">
                    <div className="loading-spinner" />
                    <p>Loading course details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="course-detail-container">
                <div className="course-detail-error">
                    <div className="error-icon">
                        <AlertCircle size={48} color="#ef4444" />
                    </div>
                    <h3>Error Loading Course</h3>
                    <p>{error}</p>
                    <button onClick={loadCourseData} className="retry-button">
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="course-detail-container">
                <div className="course-detail-error">
                    <h3>Course Not Found</h3>
                    <p>The course you're looking for doesn't exist.</p>
                    <button onClick={handleBackToList} className="retry-button">
                        <ArrowLeft size={16} />
                        Back to Courses
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="course-detail-container">
            {/* Header */}
            <div className="course-detail-header">
                <div className="header-content">
                    <button onClick={handleBackToList} className="back-button">
                        <ArrowLeft size={20} />
                        Back to Courses
                    </button>

                    <div className="header-info">
                        <div className="course-icon">
                            {course.image_url ? (
                                <img
                                    src={course.image_url}
                                    alt={course.name}
                                    className="course-image"
                                />
                            ) : (
                                <BookOpen size={32} color="white" />
                            )}
                        </div>
                        <div className="course-info">
                            <h1>{course.name}</h1>
                            <p>{course.description}</p>
                            {/* Course Meta - Date display temporarily hidden due to formatting issues */}
                            {/* 
                            <div className="course-meta">
                                <div className="meta-item">
                                    <Calendar size={16} />
                                    <span>Created: {formatDate((course as any).created_at || course.created_at)}</span>
                                </div>
                            </div>
                            */}
                        </div>
                    </div>

                    <div className="header-actions">
                        <div className="options-menu">
                            <button
                                onClick={() => setShowOptions(!showOptions)}
                                className="options-button"
                            >
                                <MoreVertical size={20} />
                            </button>

                            {showOptions && (
                                <div className="options-dropdown">
                                    <button onClick={handleEditCourse} className="option-item">
                                        <Edit size={16} />
                                        Edit Course
                                    </button>
                                    {/* Assign Classes button removed - Course is required when creating classes */}
                                    {/* 
                                    <button
                                        onClick={() => {
                                            setShowOptions(false);
                                            setShowAssignClassesDialog(true);
                                        }}
                                        className="option-item"
                                    >
                                        <UserCheck size={16} />
                                        Assign Classes
                                    </button>
                                    */}
                                    <button onClick={handleDeleteCourse} className="option-item delete">
                                        <Trash2 size={16} />
                                        Delete Course
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Classes Section */}
            <div className="course-classes-section">
                <div className="section-header">
                    <h2>
                        <UserCheck size={24} />
                        Classes in this Course
                    </h2>
                    <span className="class-count">{classes.length} classes</span>
                </div>

                {classes.length === 0 ? (
                    <div className="empty-classes">
                        <div className="empty-icon">
                            <Users size={48} color="#9ca3af" />
                        </div>
                        <h3>No classes assigned</h3>
                        <p>This course doesn't have any classes assigned yet.</p>
                    </div>
                ) : (
                    <div className="classes-list">
                        {classes.map((cls) => (
                            <div key={cls.id} className="class-item">
                                <div className="class-icon">
                                    <Users size={20} color="#3b82f6" />
                                </div>
                                <div className="class-info">
                                    <h3>{cls.name}</h3>
                                    <p>{cls.studentIds.length} students</p>
                                </div>
                                {/* Remove class button removed - Course is required for all classes */}
                                {/* 
                                <button
                                    onClick={() => handleRemoveClassFromCourse(cls.id, cls.name)}
                                    disabled={deletingClassId === cls.id}
                                    className="remove-class-button"
                                >
                                    {deletingClassId === cls.id ? (
                                        <div className="loading-spinner small" />
                                    ) : (
                                        <X size={16} />
                                    )}
                                </button>
                                */}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Assign Classes Dialog removed - Course is required when creating classes */}
            {/* 
            {course && (
                <AssignClassesDialog
                    isOpen={showAssignClassesDialog}
                    onClose={() => setShowAssignClassesDialog(false)}
                    courseId={course.id}
                    courseName={course.name}
                    currentClassIds={classes.map(cls => cls.id)}
                    onSuccess={handleAssignClassesSuccess}
                />
            )}
            */}
        </div>
    );
};

export default CourseDetail;


