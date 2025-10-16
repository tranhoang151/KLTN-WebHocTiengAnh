import React, { useState, useEffect } from 'react';
import { Class, Course, User } from '../../types';
import { courseService } from '../../services/courseService';
import { classService } from '../../services/classService';
import {
  School,
  Users,
  BookOpen,
  UserCheck,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';
import './ClassForm.css';

interface ClassFormProps {
  classData?: Class | null;
  onSubmit: (classData: Omit<Class, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ClassForm: React.FC<ClassFormProps> = ({
  classData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 30,
    course_id: '',
    teacher_id: '',
    student_ids: [] as string[],
    is_active: true,
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<User[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name || '',
        description: classData.description || '',
        capacity: classData.capacity || 30,
        course_id: classData.course_id || '',
        teacher_id: classData.teacher_id || '',
        student_ids: classData.student_ids || [],
        is_active: classData.is_active ?? true,
      });
    }
  }, [classData]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [coursesData] = await Promise.all([courseService.getAllCourses()]);

      setCourses(coursesData);
      setTeachers([]); // TODO: Implement teacher loading
      setAvailableStudents([]); // TODO: Implement student loading
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Class description is required';
    }

    if (!formData.course_id) {
      newErrors.course_id = 'Course selection is required';
    }

    if (!formData.teacher_id) {
      newErrors.teacher_id = 'Teacher assignment is required';
    }

    if (formData.capacity < 1 || formData.capacity > 100) {
      newErrors.capacity = 'Capacity must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        ...formData,
        student_ids: selectedStudents.map((s) => s.id),
      });
    } catch (error) {
      console.error('Error submitting class form:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleStudentToggle = (student: User) => {
    setSelectedStudents((prev) => {
      const isSelected = prev.some((s) => s.id === student.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== student.id);
      } else {
        if (prev.length >= formData.capacity) {
          alert(
            `Cannot add more students. Class capacity is ${formData.capacity}.`
          );
          return prev;
        }
        return [...prev, student];
      }
    });
  };

  if (loadingData) {
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

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorations */}
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

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          }}
        >
          <School size={28} color="white" />
        </div>
        <div>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #1f2937, #374151)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 8px 0',
            }}
          >
            {classData ? 'Edit Class' : 'Create New Class'}
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0',
              fontWeight: '500',
            }}
          >
            Set up your class with students and course content
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Class Name and Capacity */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '24px',
          }}
        >
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              <School size={16} color="#6b7280" />
              Class Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter class name"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${errors.name ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                background: '#ffffff',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.name
                  ? '#ef4444'
                  : '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.name && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '6px',
                  color: '#ef4444',
                  fontSize: '14px',
                }}
              >
                <AlertCircle size={14} />
                {errors.name}
              </div>
            )}
          </div>

          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              <Users size={16} color="#6b7280" />
              Capacity *
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) =>
                handleInputChange('capacity', parseInt(e.target.value) || 0)
              }
              placeholder="30"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${errors.capacity ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                background: '#ffffff',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.capacity
                  ? '#ef4444'
                  : '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
            {errors.capacity && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '6px',
                  color: '#ef4444',
                  fontSize: '14px',
                }}
              >
                <AlertCircle size={14} />
                {errors.capacity}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            <BookOpen size={16} color="#6b7280" />
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter class description"
            disabled={loading}
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `2px solid ${errors.description ? '#ef4444' : '#e5e7eb'}`,
              borderRadius: '12px',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              background: '#ffffff',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.description
                ? '#ef4444'
                : '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
          {errors.description && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '6px',
                color: '#ef4444',
                fontSize: '14px',
              }}
            >
              <AlertCircle size={14} />
              {errors.description}
            </div>
          )}
        </div>

        {/* Course and Teacher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '24px',
          }}
        >
          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              <BookOpen size={16} color="#6b7280" />
              Course *
            </label>
            <select
              value={formData.course_id}
              onChange={(e) => handleInputChange('course_id', e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${errors.course_id ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                background: '#ffffff',
                outline: 'none',
                cursor: 'pointer',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.course_id
                  ? '#ef4444'
                  : '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            {errors.course_id && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '6px',
                  color: '#ef4444',
                  fontSize: '14px',
                }}
              >
                <AlertCircle size={14} />
                {errors.course_id}
              </div>
            )}
          </div>

          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              <UserCheck size={16} color="#6b7280" />
              Teacher *
            </label>
            <select
              value={formData.teacher_id}
              onChange={(e) => handleInputChange('teacher_id', e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${errors.teacher_id ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                background: '#ffffff',
                outline: 'none',
                cursor: 'pointer',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.teacher_id
                  ? '#ef4444'
                  : '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.full_name}
                </option>
              ))}
            </select>
            {errors.teacher_id && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '6px',
                  color: '#ef4444',
                  fontSize: '14px',
                }}
              >
                <AlertCircle size={14} />
                {errors.teacher_id}
              </div>
            )}
          </div>
        </div>

        {/* Active Status */}
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              background: formData.is_active
                ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
                : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
              border: `2px solid ${formData.is_active ? '#10b981' : '#d1d5db'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={() => handleInputChange('is_active', !formData.is_active)}
          >
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              disabled={loading}
              style={{
                width: '20px',
                height: '20px',
                accentColor: '#10b981',
                cursor: 'pointer',
              }}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {formData.is_active ? (
                <CheckCircle size={20} color="#065f46" />
              ) : (
                <XCircle size={20} color="#6b7280" />
              )}
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: formData.is_active ? '#065f46' : '#6b7280',
                }}
              >
                Class is active
              </span>
            </div>
          </label>
        </div>

        {/* Student Assignment */}
        <div style={{ marginBottom: '32px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '16px',
            }}
          >
            <Users size={20} color="#6b7280" />
            Student Assignment
          </label>

          <div
            style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #e5e7eb',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#6b7280',
                }}
              >
                Available Students ({availableStudents.length})
              </span>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#3b82f6',
                  background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                }}
              >
                Selected: {selectedStudents.length}/{formData.capacity}
              </span>
            </div>

            <div
              style={{
                maxHeight: '200px',
                overflowY: 'auto',
                display: 'grid',
                gap: '8px',
              }}
            >
              {availableStudents.map((student) => {
                const isSelected = selectedStudents.some(
                  (s) => s.id === student.id
                );
                return (
                  <div
                    key={student.id}
                    onClick={() => handleStudentToggle(student)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: isSelected
                        ? 'linear-gradient(135deg, #dbeafe, #bfdbfe)'
                        : '#ffffff',
                      border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          background: isSelected
                            ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                            : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Users
                          size={16}
                          color={isSelected ? 'white' : '#6b7280'}
                        />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: isSelected ? '#1e40af' : '#1f2937',
                          }}
                        >
                          {student.full_name}
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: isSelected ? '#3b82f6' : '#6b7280',
                          }}
                        >
                          {student.email}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {isSelected ? (
                        <CheckCircle size={20} color="#3b82f6" />
                      ) : (
                        <Plus size={20} color="#6b7280" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'flex-end',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #e2e8f0, #cbd5e1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <XCircle size={18} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: loading
                ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #1d4ed8, #1e40af)';
                e.currentTarget.style.transform =
                  'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow =
                  '0 8px 30px rgba(59, 130, 246, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 4px 16px rgba(59, 130, 246, 0.4)';
              }
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
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
              </>
            ) : (
              <CheckCircle size={18} />
            )}
            {classData ? 'Update Class' : 'Create Class'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassForm;
