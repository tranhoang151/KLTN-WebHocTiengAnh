import React, { useState, useEffect } from 'react';
import { Class, Course, User } from '../../types';
import { classService } from '../../services/classService';
import { courseService } from '../../services/courseService';
import { userService } from '../../services/userService';
import {
  School,
  Plus,
  BookOpen,
  Users,
  Calendar,
  Edit,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
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

      const [classesData, coursesData] = await Promise.all([
        classService.getAllClasses(),
        courseService.getAllCourses(),
      ]);

      setClasses(classesData as any[]);
      setCourses(coursesData);
      setTeachers([]); // TODO: Implement teacher loading
    } catch (err: any) {
      setError(err.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this class? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setDeletingId(classId);
      await classService.deleteClass(classId);
      setClasses((prev) =>
        prev.filter((cls) => (cls as any).Id !== classId && cls.id !== classId)
      );
      onDeleteClass?.(classId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete class');
    } finally {
      setDeletingId(null);
    }
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.name || 'Unknown Course';
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher?.full_name || 'Unknown Teacher';
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '256px',
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
          }}
        />
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
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertCircle size={20} color="#dc2626" />
          <span
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#dc2626',
            }}
          >
            {error}
          </span>
        </div>
        <button
          onClick={loadData}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            color: '#dc2626',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <RefreshCw size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '120px',
            height: '120px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '50%',
            opacity: '0.05',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '50%',
            opacity: '0.05',
            zIndex: 0,
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
            >
              <School size={20} style={{ color: 'white' }} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #1f2937, #374151)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0 0 4px 0',
                }}
              >
                Class Management
              </h3>
              <p
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: '0',
                  fontWeight: '500',
                }}
              >
                Manage your classes and student assignments
              </p>
            </div>
          </div>

          {showActions && onCreateClass && (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <button
                onClick={loadData}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 25px rgba(59, 130, 246, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                    e.currentTarget.style.color = '#475569';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 2px 8px rgba(0, 0, 0, 0.05)';
                  }
                }}
              >
                <RefreshCw
                  size={16}
                  style={{
                    animation: loading ? 'spin 1s linear infinite' : 'none',
                    color: 'inherit',
                  }}
                />
                Refresh
              </button>

              <button
                onClick={onCreateClass}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow =
                    '0 8px 30px rgba(59, 130, 246, 0.5)';
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #1d4ed8, #1e40af)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 16px rgba(59, 130, 246, 0.4)';
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                }}
              >
                <Plus size={16} />
                Create Class
              </button>
            </div>
          )}
        </div>
      </div>

      {classes.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <School size={32} color="#6b7280" />
          </div>
          <h3
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 8px 0',
            }}
          >
            No classes yet
          </h3>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 24px 0',
            }}
          >
            Create your first class to get started
          </p>
          {showActions && onCreateClass && (
            <button
              onClick={onCreateClass}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
                margin: '0 auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow =
                  '0 8px 30px rgba(59, 130, 246, 0.5)';
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #1d4ed8, #1e40af)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 4px 16px rgba(59, 130, 246, 0.4)';
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #3b82f6, #1d4ed8)';
              }}
            >
              <Plus size={20} />
              Create First Class
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '24px',
          }}
        >
          {classes.map((classData) => (
            <div
              key={(classData as any).Id || classData.id}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 25px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Status Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background:
                    ((classData as any).IsActive ?? classData.is_active)
                      ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
                      : 'linear-gradient(135deg, #fee2e2, #fecaca)',
                  color:
                    ((classData as any).IsActive ?? classData.is_active)
                      ? '#065f46'
                      : '#dc2626',
                }}
              >
                {((classData as any).IsActive ?? classData.is_active)
                  ? 'Active'
                  : 'Inactive'}
              </div>

              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <School size={24} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#1f2937',
                      margin: '0 0 4px 0',
                    }}
                  >
                    {(classData as any).Name || classData.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '0',
                    }}
                  >
                    {(classData as any).Description || classData.description}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div
                style={{
                  display: 'grid',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <BookOpen size={16} color="#6b7280" />
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '500',
                    }}
                  >
                    Course:
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#1f2937',
                      fontWeight: '600',
                    }}
                  >
                    {getCourseName(
                      (classData as any).CourseId || classData.course_id
                    )}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Users size={16} color="#6b7280" />
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '500',
                    }}
                  >
                    Teacher:
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#1f2937',
                      fontWeight: '600',
                    }}
                  >
                    {getTeacherName(
                      (classData as any).TeacherId || classData.teacher_id
                    )}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Users size={16} color="#6b7280" />
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '500',
                    }}
                  >
                    Students:
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#1f2937',
                      fontWeight: '600',
                    }}
                  >
                    {
                      (
                        (classData as any).StudentIds ||
                        classData.student_ids ||
                        []
                      ).length
                    }
                    /{classData.capacity}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Calendar size={16} color="#6b7280" />
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontWeight: '500',
                    }}
                  >
                    Created:
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#1f2937',
                      fontWeight: '600',
                    }}
                  >
                    {new Date(
                      (classData as any).CreatedAt || classData.created_at
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Capacity Progress */}
              <div
                style={{
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1f2937',
                    }}
                  >
                    Capacity
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#6b7280',
                    }}
                  >
                    {
                      (
                        (classData as any).StudentIds ||
                        classData.student_ids ||
                        []
                      ).length
                    }
                    /{classData.capacity}
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      borderRadius: '4px',
                      width: `${Math.min((((classData as any).StudentIds || classData.student_ids || []).length / classData.capacity) * 100, 100)}%`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {/* Actions */}
              {showActions && (
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                  }}
                >
                  {onEditClass && (
                    <button
                      onClick={() => onEditClass(classData)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        flex: 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                        e.currentTarget.style.color = '#475569';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                  )}
                  {onDeleteClass && (
                    <button
                      onClick={() =>
                        handleDeleteClass((classData as any).Id || classData.id)
                      }
                      disabled={
                        deletingId === (classData as any).Id ||
                        deletingId === classData.id
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor:
                          deletingId === (classData as any).Id ||
                          deletingId === classData.id
                            ? 'not-allowed'
                            : 'pointer',
                        transition: 'all 0.3s ease',
                        flex: 1,
                        opacity:
                          deletingId === (classData as any).Id ||
                          deletingId === classData.id
                            ? 0.5
                            : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (
                          !(
                            deletingId === (classData as any).Id ||
                            deletingId === classData.id
                          )
                        ) {
                          e.currentTarget.style.background =
                            'linear-gradient(135deg, #ef4444, #dc2626)';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.borderColor = '#ef4444';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (
                          !(
                            deletingId === (classData as any).Id ||
                            deletingId === classData.id
                          )
                        ) {
                          e.currentTarget.style.background =
                            'linear-gradient(135deg, #fee2e2, #fecaca)';
                          e.currentTarget.style.color = '#dc2626';
                          e.currentTarget.style.borderColor = '#fecaca';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassList;
