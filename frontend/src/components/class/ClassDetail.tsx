import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course, User } from '../../types';
import { classService, Class } from '../../services/classService';
import { courseService } from '../../services/courseService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import {
    ArrowLeft,
    School,
    BookOpen,
    Users,
    Calendar,
    User as UserIcon,
    Edit,
    Trash2,
    AlertCircle,
    RefreshCw,
    MoreVertical,
    UserPlus,
    UserCheck,
} from 'lucide-react';
import './ClassDetail.css';

const ClassDetail: React.FC = () => {
    const { classId } = useParams<{ classId: string }>();
    const navigate = useNavigate();
    const { getAuthToken } = useAuth();

    const [classData, setClassData] = useState<Class | null>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [teacher, setTeacher] = useState<User | null>(null);
    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showOptions, setShowOptions] = useState(false);

    useEffect(() => {
        if (classId) {
            loadClassData();
        }
    }, [classId]);

    const loadClassData = async () => {
        if (!classId) return;

        try {
            setLoading(true);
            setError(null);

            const token = await getAuthToken();
            if (!token) {
                setError('Authentication required');
                return;
            }

            // Load class data
            const classInfo = await classService.getClassById(classId);
            setClassData(classInfo);

            // Load course data if courseId exists
            if (classInfo.courseId) {
                try {
                    const courseData = await courseService.getCourseById(classInfo.courseId);
                    setCourse(courseData);
                } catch (err) {
                    console.warn('Failed to load course:', err);
                }
            }

            // Load teacher data if teacherId exists
            if (classInfo.teacherId) {
                try {
                    const teacherData = await userService.getUserById(classInfo.teacherId);
                    setTeacher(teacherData);
                } catch (err) {
                    console.warn('Failed to load teacher:', err);
                }
            }

            // Load students data
            if (classInfo.studentIds && classInfo.studentIds.length > 0) {
                try {
                    const studentsData = await Promise.all(
                        classInfo.studentIds.map(studentId =>
                            userService.getUserById(studentId).catch(() => null)
                        )
                    );
                    setStudents(studentsData.filter(Boolean) as User[]);
                } catch (err) {
                    console.warn('Failed to load students:', err);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load class data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClass = async () => {
        if (!classId || !classData) return;

        if (!window.confirm(
            `Are you sure you want to delete "${classData.name}"? This action cannot be undone.`
        )) {
            return;
        }

        try {
            await classService.deleteClass(classId);
            navigate('/admin/classes');
        } catch (err: any) {
            setError(err.message || 'Failed to delete class');
        }
    };


    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';

        try {
            // Handle different date formats
            let date;
            if (typeof dateStr === 'string') {
                // Handle "2025-07-18" format
                if (dateStr.includes('-') && !dateStr.includes('T')) {
                    date = new Date(dateStr + 'T00:00:00');
                } else {
                    date = new Date(dateStr);
                }
            } else {
                date = new Date(dateStr);
            }

            return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
        } catch {
            return 'Invalid Date';
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading class details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <AlertCircle size={32} color="#ef4444" />
                    <p style={{ marginTop: '16px', color: '#ef4444' }}>{error}</p>
                    <button
                        onClick={loadClassData}
                        style={{
                            marginTop: '16px',
                            padding: '8px 16px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!classData) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <School size={32} color="#6b7280" />
                    <p style={{ marginTop: '16px', color: '#6b7280' }}>Class not found</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '32px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={() => navigate('/admin/classes')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e5e7eb';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f3f4f6';
                        }}
                    >
                        <ArrowLeft size={20} color="#374151" />
                    </button>

                    <div>
                        <h1
                            style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                color: '#1f2937',
                                margin: '0 0 4px 0',
                            }}
                        >
                            {classData.name}
                        </h1>
                        <p
                            style={{
                                fontSize: '16px',
                                color: '#6b7280',
                                margin: '0',
                            }}
                        >
                            Class Details
                        </p>
                    </div>
                </div>

                {/* Options Menu */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e5e7eb';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f3f4f6';
                        }}
                    >
                        <MoreVertical size={20} color="#374151" />
                    </button>

                    {showOptions && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '48px',
                                right: '0',
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                zIndex: 10,
                                minWidth: '160px',
                            }}
                        >
                            <button
                                onClick={() => {
                                    setShowOptions(false);
                                    navigate(`/admin/classes/edit/${classId}`);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: 'none',
                                    border: 'none',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    color: '#374151',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f3f4f6';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white';
                                }}
                            >
                                <Edit size={16} />
                                Edit Class
                            </button>
                            <button
                                onClick={() => {
                                    setShowOptions(false);
                                    handleDeleteClass();
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: 'none',
                                    border: 'none',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    color: '#ef4444',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#fef2f2';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white';
                                }}
                            >
                                <Trash2 size={16} />
                                Delete Class
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '32px',
                }}
            >
                {/* Left Column - Class Information */}
                <div
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e5e7eb',
                    }}
                >
                    <h2
                        style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#1f2937',
                            margin: '0 0 24px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <School size={20} />
                        Class Information
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Class Name */}
                        <div>
                            <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                                Class Name
                            </label>
                            <p style={{ fontSize: '16px', color: '#1f2937', margin: '0', fontWeight: '500' }}>
                                {classData.name}
                            </p>
                        </div>

                        {/* Description */}
                        <div>
                            <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                                Description
                            </label>
                            <p style={{ fontSize: '16px', color: '#1f2937', margin: '0' }}>
                                {classData.description || 'No description provided'}
                            </p>
                        </div>

                        {/* Capacity */}
                        <div>
                            <label style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                                Capacity
                            </label>
                            <p style={{ fontSize: '16px', color: '#1f2937', margin: '0', fontWeight: '500' }}>
                                {students.length} / {classData.capacity} students
                            </p>
                        </div>

                        {/* Created Date hidden as requested */}

                        {/* Status */}
                        {/* Status removed - all classes are active by default */}
                    </div>
                </div>

                {/* Right Column - Course & Teacher Information */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                    }}
                >
                    {/* Course Information */}
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e5e7eb',
                        }}
                    >
                        <h3
                            style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#1f2937',
                                margin: '0 0 16px 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <BookOpen size={18} />
                            Course Information
                        </h3>

                        {course ? (
                            <div>
                                <p style={{ fontSize: '16px', color: '#1f2937', margin: '0 0 8px 0', fontWeight: '500' }}>
                                    {course.name}
                                </p>
                                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                                    {course.description || 'No description available'}
                                </p>
                            </div>
                        ) : (
                            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                                No course assigned
                            </p>
                        )}
                    </div>

                    {/* Teacher Information */}
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '24px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e5e7eb',
                        }}
                    >
                        <h3
                            style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#1f2937',
                                margin: '0 0 16px 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <UserIcon size={18} />
                            Teacher Information
                        </h3>

                        {teacher ? (
                            <div>
                                <p style={{ fontSize: '16px', color: '#1f2937', margin: '0 0 8px 0', fontWeight: '500' }}>
                                    {teacher.full_name}
                                </p>
                                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                                    {teacher.email}
                                </p>
                            </div>
                        ) : (
                            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                                No teacher assigned
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Students Section */}
            <div
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    marginTop: '32px',
                }}
            >
                <h2
                    style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 24px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <Users size={20} />
                    Students ({students.length})
                </h2>

                {students.length > 0 ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '16px',
                        }}
                    >
                        {students.map((student) => (
                            <div
                                key={student.id}
                                style={{
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                }}
                            >
                                <div
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: '600',
                                        fontSize: '16px',
                                    }}
                                >
                                    {student.full_name?.charAt(0) || 'S'}
                                </div>
                                <div>
                                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', margin: '0 0 2px 0' }}>
                                        {student.full_name}
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0' }}>
                                        {student.email}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '32px' }}>
                        <Users size={48} color="#d1d5db" />
                        <p style={{ fontSize: '16px', color: '#6b7280', margin: '16px 0 0 0' }}>
                            No students enrolled in this class
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default ClassDetail;


