import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import { courseService } from '../../services/courseService';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

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
    if (
      !window.confirm(
        'Are you sure you want to delete this course? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setDeletingId(courseId);
      await courseService.deleteCourse(courseId);
      setCourses((prev) => prev.filter((course) => course.id !== courseId));
      onDeleteCourse?.(courseId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete course');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px',
          }}
        />
        <p
          style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '0',
            fontWeight: '500',
          }}
        >
          Loading courses...
        </p>
        <style>
          {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
          }}
        >
          <AlertCircle size={32} color="white" />
        </div>
        <h3
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: '0 0 12px 0',
          }}
        >
          Error Loading Courses
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 24px 0',
            lineHeight: '1.6',
          }}
        >
          {error}
        </p>
        <button
          onClick={loadCourses}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              'linear-gradient(135deg, #1d4ed8, #1e40af)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow =
              '0 8px 25px rgba(59, 130, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              'linear-gradient(135deg, #3b82f6, #1d4ed8)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow =
              '0 4px 16px rgba(59, 130, 246, 0.4)';
          }}
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Action Buttons */}
      {showActions && onCreateCourse && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '24px',
          }}
        >
          <button
            onClick={onCreateCourse}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #1d4ed8, #1e40af)';
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow =
                '0 8px 30px rgba(59, 130, 246, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #3b82f6, #1d4ed8)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow =
                '0 4px 16px rgba(59, 130, 246, 0.4)';
            }}
          >
            <Plus size={18} />
            Create Course
          </button>
        </div>
      )}

      {courses.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '60px 40px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            }}
          >
            <BookOpen size={40} color="#6b7280" />
          </div>
          <h3
            style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 12px 0',
            }}
          >
            No courses yet
          </h3>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 32px 0',
              lineHeight: '1.6',
            }}
          >
            Create your first course to get started
          </p>
          {showActions && onCreateCourse && (
            <button
              onClick={onCreateCourse}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
                margin: '0 auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #1d4ed8, #1e40af)';
                e.currentTarget.style.transform =
                  'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow =
                  '0 8px 30px rgba(59, 130, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 4px 16px rgba(59, 130, 246, 0.4)';
              }}
            >
              <Plus size={18} />
              Create First Course
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px',
          }}
        >
          {courses.map((course) => (
            <div
              key={course.id}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow =
                  '0 12px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 20px rgba(0, 0, 0, 0.08)';
              }}
            >
              {/* Course Image */}
              <div
                style={{
                  width: '100%',
                  height: '120px',
                  background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {course.image_url ? (
                  <img
                    src={course.image_url}
                    alt={course.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        '/placeholder-course.png';
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <BookOpen size={48} color="#9ca3af" />
                  </div>
                )}
              </div>

              {/* Course Content */}
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 8px 0',
                    lineHeight: '1.4',
                  }}
                >
                  {course.name}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: '0 0 16px 0',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {course.description}
                </p>

                {/* Course Meta */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#1e40af',
                    }}
                  >
                    <Users size={12} />
                    {course.target_age_group}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6b7280',
                    }}
                  >
                    <Calendar size={12} />
                    {new Date(
                      course.created_at?.toDate?.() || course.created_at
                    ).toLocaleDateString()}
                  </div>
                </div>

                {/* Action Buttons */}
                {showActions && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                    }}
                  >
                    {onEditCourse && (
                      <button
                        onClick={() => onEditCourse(course)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px 16px',
                          background:
                            'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.borderColor = '#3b82f6';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow =
                            '0 4px 12px rgba(59, 130, 246, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                          e.currentTarget.style.color = '#475569';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                    )}
                    {onDeleteCourse && (
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        disabled={deletingId === course.id}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '10px 16px',
                          background:
                            deletingId === course.id
                              ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                              : 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                          color: deletingId === course.id ? 'white' : '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor:
                            deletingId === course.id
                              ? 'not-allowed'
                              : 'pointer',
                          transition: 'all 0.3s ease',
                          opacity: deletingId === course.id ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (deletingId !== course.id) {
                            e.currentTarget.style.background =
                              'linear-gradient(135deg, #ef4444, #dc2626)';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderColor = '#ef4444';
                            e.currentTarget.style.transform =
                              'translateY(-2px)';
                            e.currentTarget.style.boxShadow =
                              '0 4px 12px rgba(239, 68, 68, 0.3)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (deletingId !== course.id) {
                            e.currentTarget.style.background =
                              'linear-gradient(135deg, #fef2f2, #fee2e2)';
                            e.currentTarget.style.color = '#dc2626';
                            e.currentTarget.style.borderColor = '#fecaca';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      >
                        {deletingId === course.id ? (
                          <div
                            style={{
                              width: '14px',
                              height: '14px',
                              border: '2px solid rgba(255,255,255,0.3)',
                              borderTop: '2px solid white',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite',
                            }}
                          />
                        ) : (
                          <Trash2 size={14} />
                        )}
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
