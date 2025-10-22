import React, { useState, useEffect } from 'react';
import { Course, User } from '../../types';
import { courseService } from '../../services/courseService';
import { userService } from '../../services/userService';
import { classService, Class } from '../../services/classService';
import { useAuth } from '../../contexts/AuthContext';
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
  Search,
  User as UserIcon,
  UserPlus,
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
  const { getAuthToken } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 30,
    courseId: '',
    teacherId: '',
    studentIds: [] as string[],
    is_active: true, // Always true by default
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [availableStudents, setAvailableStudents] = useState<User[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<User[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(true);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');

  useEffect(() => {
    loadInitialData();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.teacher-dropdown') && !target.closest('.student-dropdown')) {
        setShowTeacherDropdown(false);
        setShowStudentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name || '',
        description: classData.description || '',
        capacity: classData.capacity || 30,
        courseId: classData.courseId || '',
        teacherId: classData.teacherId || '',
        studentIds: classData.studentIds || [],
        is_active: classData.is_active ?? true,
      });

      // Load selected students based on studentIds
      if (classData.studentIds && classData.studentIds.length > 0) {
        const selectedStudentsData = availableStudents.filter(student =>
          classData.studentIds?.includes(student.id)
        );
        setSelectedStudents(selectedStudentsData);
      }
    }
  }, [classData, availableStudents]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const token = await getAuthToken();
      const [coursesData, teachersData, studentsData, classesData] = await Promise.all([
        courseService.getAllCourses(),
        userService.getAllUsers(token, { role: 'teacher' }),
        userService.getAllUsers(token, { role: 'student' }),
        classService.getAllClasses()
      ]);

      setCourses(coursesData);
      setTeachers(teachersData);
      setAvailableStudents(studentsData);
      setAllClasses(classesData);
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

    if (!formData.courseId) {
      newErrors.courseId = 'Course selection is required';
    }

    if (!formData.teacherId) {
      newErrors.teacherId = 'Teacher assignment is required';
    }

    if (formData.capacity < 1 || formData.capacity > 100) {
      newErrors.capacity = 'Capacity must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper functions for teacher and student management
  const getFilteredTeachers = () => {
    if (!teacherSearchQuery.trim()) return teachers;
    return teachers.filter(teacher =>
      teacher.full_name.toLowerCase().includes(teacherSearchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(teacherSearchQuery.toLowerCase())
    );
  };

  const getFilteredStudents = () => {
    // Get students that are not assigned to any other class
    const unassignedStudents = availableStudents.filter(student => {
      // If we're editing a class, include students already in this class
      if (classData && classData.studentIds?.includes(student.id)) {
        return true;
      }

      // Check if student is assigned to any other class
      const isAssignedToOtherClass = allClasses.some(cls =>
        cls.id !== classData?.id && // Not the current class being edited
        cls.studentIds?.includes(student.id)
      );

      return !isAssignedToOtherClass;
    });

    // Apply search filter
    if (!studentSearchQuery.trim()) return unassignedStudents;
    return unassignedStudents.filter(student =>
      student.full_name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearchQuery.toLowerCase())
    );
  };

  const getSelectedTeacher = () => {
    return teachers.find(teacher => teacher.id === formData.teacherId);
  };

  const handleTeacherSelect = (teacher: User) => {
    setFormData(prev => ({ ...prev, teacherId: teacher.id }));
    setShowTeacherDropdown(false);
    setTeacherSearchQuery('');
  };

  const handleStudentToggle = (student: User) => {
    const isSelected = selectedStudents.some(s => s.id === student.id);
    if (isSelected) {
      setSelectedStudents(prev => prev.filter(s => s.id !== student.id));
    } else {
      if (selectedStudents.length < formData.capacity) {
        setSelectedStudents(prev => [...prev, student]);
      }
    }
  };

  const handleRemoveStudent = (studentId: string) => {
    setSelectedStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const getAssignedStudentsInfo = () => {
    const assignedStudents = availableStudents.filter(student => {
      if (classData && classData.studentIds?.includes(student.id)) {
        return false; // Don't count current class students
      }
      return allClasses.some(cls =>
        cls.id !== classData?.id &&
        cls.studentIds?.includes(student.id)
      );
    });

    return assignedStudents;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        ...formData,
        studentIds: selectedStudents.map((s) => s.id),
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
              value={formData.courseId}
              onChange={(e) => handleInputChange('courseId', e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${errors.courseId ? '#ef4444' : '#e5e7eb'}`,
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
                e.target.style.borderColor = errors.courseId
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
            {errors.courseId && (
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
                {errors.courseId}
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
            <div style={{ position: 'relative' }} className="teacher-dropdown">
              {/* Selected Teacher Display */}
              {getSelectedTeacher() ? (
                <div
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${errors.teacherId ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                  onClick={() => setShowTeacherDropdown(!showTeacherDropdown)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {getSelectedTeacher()?.avatar_url || getSelectedTeacher()?.avatar_base64 ? (
                        <img
                          src={getSelectedTeacher()?.avatar_url || getSelectedTeacher()?.avatar_base64}
                          alt={getSelectedTeacher()?.full_name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <UserIcon size={16} color="#6b7280" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', color: '#111827' }}>
                        {getSelectedTeacher()?.full_name}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {getSelectedTeacher()?.email}
                      </div>
                    </div>
                  </div>
                  <div style={{ color: '#6b7280' }}>
                    {showTeacherDropdown ? '▲' : '▼'}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${errors.teacherId ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    background: '#ffffff',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onClick={() => setShowTeacherDropdown(!showTeacherDropdown)}
                >
                  <span>Select a teacher</span>
                  <span>▼</span>
                </div>
              )}

              {/* Teacher Dropdown */}
              {showTeacherDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    zIndex: 9999,
                    maxHeight: '50vh',
                    overflow: 'hidden',
                    minHeight: '150px',
                  }}
                >
                  {/* Search Input */}
                  <div style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ position: 'relative' }}>
                      <Search
                        size={16}
                        style={{
                          position: 'absolute',
                          left: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#9ca3af',
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Search teachers..."
                        value={teacherSearchQuery}
                        onChange={(e) => setTeacherSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 8px 8px 36px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Teacher List */}
                  <div style={{
                    maxHeight: 'calc(50vh - 100px)',
                    overflowY: 'auto',
                    minHeight: '100px',
                    paddingBottom: '8px'
                  }}>
                    {getFilteredTeachers().length === 0 ? (
                      <div
                        style={{
                          padding: '20px',
                          textAlign: 'center',
                          color: '#6b7280',
                          fontSize: '14px',
                        }}
                      >
                        {teacherSearchQuery ? 'No teachers found' : 'No teachers available'}
                      </div>
                    ) : (
                      getFilteredTeachers().map((teacher) => (
                        <div
                          key={teacher.id}
                          onClick={() => handleTeacherSelect(teacher)}
                          style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            borderBottom: '1px solid #f3f4f6',
                            transition: 'background-color 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                          }}
                        >
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#f3f4f6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                            }}
                          >
                            {teacher.avatar_url || teacher.avatar_base64 ? (
                              <img
                                src={teacher.avatar_url || teacher.avatar_base64}
                                alt={teacher.full_name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <UserIcon size={16} color="#6b7280" />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500', color: '#111827' }}>
                              {teacher.full_name}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                              {teacher.email}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.teacherId && (
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
                {errors.teacherId}
              </div>
            )}
          </div>
        </div>

        {/* Active Status removed - all classes are active by default */}

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
              marginBottom: '8px',
            }}
          >
            <Users size={20} color="#6b7280" />
            Student Assignment
          </label>

          {/* Assigned Students Info */}
          {getAssignedStudentsInfo().length > 0 && (
            <div
              style={{
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#92400e',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <AlertCircle size={16} color="#f59e0b" />
                <span style={{ fontWeight: '600' }}>
                  {getAssignedStudentsInfo().length} students are already assigned to other classes
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#a16207' }}>
                These students will not appear in the selection list below.
              </div>
            </div>
          )}

          {/* Selected Students Display */}
          {selectedStudents.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                <UserPlus size={16} color="#059669" />
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#059669',
                  }}
                >
                  Selected Students ({selectedStudents.length}/{formData.capacity})
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {selectedStudents.map((student) => (
                  <div
                    key={student.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                      border: '1px solid #d1fae5',
                      borderRadius: '20px',
                      fontSize: '14px',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {student.avatar_url || student.avatar_base64 ? (
                        <img
                          src={student.avatar_url || student.avatar_base64}
                          alt={student.full_name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <UserIcon size={12} color="#6b7280" />
                      )}
                    </div>
                    <span style={{ color: '#059669', fontWeight: '500' }}>
                      {student.full_name}
                    </span>
                    <button
                      onClick={() => handleRemoveStudent(student.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444',
                        padding: '2px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Selection */}
          <div style={{ position: 'relative' }} className="student-dropdown">
            <div
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                background: '#ffffff',
                color: '#9ca3af',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onClick={(e) => {
                setShowStudentDropdown(!showStudentDropdown);
                // Check if dropdown would be cut off at bottom
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const dropdownHeight = 500; // max height of dropdown

                if (rect.bottom + dropdownHeight > viewportHeight) {
                  setDropdownPosition('top');
                } else {
                  setDropdownPosition('bottom');
                }
              }}
            >
              <span>
                {selectedStudents.length === 0
                  ? `Select students (${getFilteredStudents().length} available)`
                  : `${selectedStudents.length} students selected (${getFilteredStudents().length} available)`}
              </span>
              <span>▼</span>
            </div>

            {/* Student Dropdown */}
            {showStudentDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: dropdownPosition === 'top' ? 'auto' : '100%',
                  bottom: dropdownPosition === 'top' ? '100%' : 'auto',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  zIndex: 9999,
                  maxHeight: '60vh',
                  overflow: 'hidden',
                  minHeight: '200px',
                }}
              >
                {/* Search Input */}
                <div style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ position: 'relative' }}>
                    <Search
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9ca3af',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 8px 8px 36px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Student List */}
                <div style={{
                  maxHeight: 'calc(60vh - 120px)',
                  overflowY: 'auto',
                  minHeight: '150px',
                  paddingBottom: '8px'
                }}>
                  {getFilteredStudents().length === 0 ? (
                    <div
                      style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: '#6b7280',
                        fontSize: '14px',
                      }}
                    >
                      {studentSearchQuery ? (
                        'No students found matching your search'
                      ) : getAssignedStudentsInfo().length > 0 ? (
                        <div>
                          <div style={{ marginBottom: '8px' }}>
                            All students are already assigned to other classes
                          </div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {getAssignedStudentsInfo().length} students are unavailable
                          </div>
                        </div>
                      ) : (
                        'No students available'
                      )}
                    </div>
                  ) : (
                    getFilteredStudents().map((student) => {
                      const isSelected = selectedStudents.some(s => s.id === student.id);
                      const isAtCapacity = !isSelected && selectedStudents.length >= formData.capacity;

                      return (
                        <div
                          key={student.id}
                          onClick={() => !isAtCapacity && handleStudentToggle(student)}
                          style={{
                            padding: '12px 16px',
                            cursor: isAtCapacity ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            borderBottom: '1px solid #f3f4f6',
                            transition: 'background-color 0.2s',
                            opacity: isAtCapacity ? 0.5 : 1,
                            background: isSelected ? '#eff6ff' : 'white',
                          }}
                          onMouseEnter={(e) => {
                            if (!isAtCapacity) {
                              e.currentTarget.style.backgroundColor = isSelected ? '#eff6ff' : '#f9fafb';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isAtCapacity) {
                              e.currentTarget.style.backgroundColor = isSelected ? '#eff6ff' : 'white';
                            }
                          }}
                        >
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#f3f4f6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                            }}
                          >
                            {student.avatar_url || student.avatar_base64 ? (
                              <img
                                src={student.avatar_url || student.avatar_base64}
                                alt={student.full_name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <UserIcon size={16} color="#6b7280" />
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '500', color: '#111827' }}>
                              {student.full_name}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                              {student.email}
                            </div>
                          </div>
                          {isSelected && (
                            <div style={{ color: '#3b82f6' }}>
                              <CheckCircle size={20} />
                            </div>
                          )}
                          {isAtCapacity && (
                            <div style={{ fontSize: '12px', color: '#ef4444' }}>
                              Capacity reached
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
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


