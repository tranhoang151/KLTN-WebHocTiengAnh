import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course, User } from '../../types';
import { classService, Class } from '../../services/classService';
import { courseService } from '../../services/courseService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
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
  Search,
  UserCheck,
  UserPlus,
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
  const { getAuthToken } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // Filter classes based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredClasses(classes);
    } else {
      const filtered = classes.filter((cls) => {
        const className = cls.name || '';
        return className.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredClasses(filtered);
    }
  }, [searchQuery, classes]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      const [classesData, coursesData, teachersData] = await Promise.all([
        classService.getAllClasses(),
        courseService.getAllCourses(),
        userService.getAllUsers(token, { role: 'teacher' }), // Load teachers only
      ]);

      setClasses(classesData);
      setFilteredClasses(classesData);
      setCourses(coursesData);
      setTeachers(teachersData);
    } catch (err: any) {
      setError(err.message || 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this class? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(classId);
      await classService.deleteClass(classId);
      setClasses((prev) =>
        prev.filter((cls) => cls.id !== classId)
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

          {/* Total Classes Count */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontSize: '14px',
                color: '#5C748A',
                fontWeight: '500',
                background: 'rgba(59, 130, 246, 0.1)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              Total Classes: {classes.length}
            </div>
          </div>

          {/* Search Bar */}
          <div
            style={{
              position: 'relative',
              marginBottom: '20px',
              zIndex: 1,
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '12px 16px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
            >
              <Search
                size={20}
                style={{
                  color: '#6b7280',
                  marginRight: '12px',
                  flexShrink: 0,
                }}
              />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '16px',
                  color: '#1f2937',
                  background: 'transparent',
                  fontFamily: 'inherit',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              )}
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

      {filteredClasses.length === 0 ? (
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
            {searchQuery ? 'No classes found' : 'No classes yet'}
          </h3>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 24px 0',
            }}
          >
            {searchQuery
              ? `No classes match "${searchQuery}". Try a different search term.`
              : 'Create your first class to get started'
            }
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
          {filteredClasses.map((classData) => (
            <div
              key={classData.id}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={() => {
                navigate(`/admin/classes/detail/${classData.id}`);
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
              {/* Status badge removed - all classes are active by default */}

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
                    {classData.name}
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
                    {getCourseName(classData.courseId || '')}
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
                    {getTeacherName(classData.teacherId || '')}
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
                    {classData.studentIds.length} / {classData.capacity}
                  </span>
                </div>

                {/* Created date hidden as requested */}
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
                    {classData.studentIds.length} / {classData.capacity}
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
                      width: `${Math.min((classData.studentIds.length / classData.capacity) * 100, 100)}%`,
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
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClass(classData);
                      }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClass(classData.id);
                      }}
                      disabled={
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
                          deletingId === classData.id
                            ? 'not-allowed'
                            : 'pointer',
                        transition: 'all 0.3s ease',
                        flex: 1,
                        opacity:
                          deletingId === classData.id
                            ? 0.5
                            : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (
                          !(
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


