import React, { useState, useEffect } from 'react';
import { Exercise, Course } from '../../types';
import {
  exerciseService,
  ExerciseFilters,
} from '../../services/exerciseService';
import { courseService } from '../../services/courseService';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import {
  BookOpen,
  Clock,
  HelpCircle,
  Eye,
  Edit,
  Copy,
  Trash2,
  FileText,
  Search,
} from 'lucide-react';

interface ExerciseListProps {
  onEditExercise?: (exercise: Exercise) => void;
  onCreateExercise?: () => void;
  onDeleteExercise?: (exerciseId: string) => void;
  onPreviewExercise?: (exercise: Exercise) => void;
  showActions?: boolean;
  courseFilter?: string;
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  onEditExercise,
  onCreateExercise,
  onDeleteExercise,
  onPreviewExercise,
  showActions = true,
  courseFilter,
}) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filters
  const [filters, setFilters] = useState<ExerciseFilters>({
    courseId: courseFilter || '',
    difficulty: undefined,
    type: undefined,
    isActive: undefined,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  useEffect(() => {
    if (courseFilter) {
      setFilters((prev) => ({ ...prev, courseId: courseFilter }));
    }
  }, [courseFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [exercisesData, coursesData] = await Promise.all([
        exerciseService.getAllExercises(filters),
        courseService.getAllCourses(),
      ]);

      setExercises(exercisesData);
      setCourses(coursesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this exercise? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setDeletingId(exerciseId);
      await exerciseService.deleteExercise(exerciseId);
      setExercises((prev) => prev.filter((e) => e.id !== exerciseId));
      onDeleteExercise?.(exerciseId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete exercise');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicateExercise = async (exerciseId: string) => {
    try {
      const duplicatedExercise =
        await exerciseService.duplicateExercise(exerciseId);
      setExercises((prev) => [duplicatedExercise, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to duplicate exercise');
    }
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    return course?.name || 'Unknown Course';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return <HelpCircle size={16} color="#6b7280" />;
      case 'fill_blank':
        return <Edit size={16} color="#6b7280" />;
      default:
        return <FileText size={16} color="#6b7280" />;
    }
  };

  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCourseName(exercise.course_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          gap: '1rem',
        }}
      >
        <LoadingSpinner />
        <p
          style={{
            color: '#6b7280',
            fontSize: '0.9rem',
            margin: 0,
          }}
        >
          Loading exercises...
        </p>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadData} />;
  }

  return (
    <div style={{ padding: '0' }}>
      {/* Filters Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e7eb',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '50%',
            opacity: '0.05',
            zIndex: 0,
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            bottom: '-20px',
            left: '-20px',
            width: '50px',
            height: '50px',
            background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
            borderRadius: '50%',
            opacity: '0.05',
            zIndex: 0,
          }}
        ></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              alignItems: 'end',
            }}
          >
            {/* Search */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search exercises..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow =
                    '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Course Filter */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                Course
              </label>
              <select
                value={filters.courseId || ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, courseId: e.target.value }))
                }
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                  paddingRight: '40px',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow =
                    '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                Difficulty
              </label>
              <select
                value={filters.difficulty || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    difficulty: e.target.value as any,
                  }))
                }
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                  paddingRight: '40px',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow =
                    '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                Type
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    type: e.target.value as any,
                  }))
                }
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '16px',
                  paddingRight: '40px',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow =
                    '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">All Types</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="fill_blank">Fill in the Blank</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filteredExercises.length === 0 ? (
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
            }}
          >
            <FileText size={32} color="white" />
          </div>
          <h3
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0',
            }}
          >
            No exercises found
          </h3>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 24px 0',
              lineHeight: '1.5',
            }}
          >
            {searchTerm ||
            Object.values(filters).some((v) => v !== undefined && v !== '')
              ? 'Try adjusting your search or filters'
              : 'Create your first exercise to get started'}
          </p>
          {showActions && onCreateExercise && !searchTerm && (
            <button
              onClick={onCreateExercise}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                margin: '0 auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow =
                  '0 8px 25px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              <FileText size={16} />
              Create First Exercise
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
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
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
                  '0 8px 30px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 20px rgba(0, 0, 0, 0.08)';
              }}
            >
              {/* Background decoration */}
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  borderRadius: '50%',
                  opacity: '0.05',
                  zIndex: 0,
                }}
              ></div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>
                      {getTypeIcon(exercise.type)}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#6b7280',
                        textTransform: 'capitalize',
                      }}
                    >
                      {exercise.type.replace('_', ' ')}
                    </span>
                  </div>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      background:
                        exercise.difficulty === 'easy'
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : exercise.difficulty === 'medium'
                            ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                            : 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                    }}
                  >
                    {exercise.difficulty}
                  </span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: '0 0 16px 0',
                    lineHeight: '1.4',
                  }}
                >
                  {exercise.title}
                </h3>

                {/* Details */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    padding: '0.75rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#6b7280',
                        fontWeight: '500',
                      }}
                    >
                      <BookOpen size={14} />
                      <span>Course:</span>
                    </div>
                    <span
                      style={{
                        color: '#1f2937',
                        fontWeight: '500',
                      }}
                    >
                      {getCourseName(exercise.course_id)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#6b7280',
                        fontWeight: '500',
                      }}
                    >
                      <HelpCircle size={14} />
                      <span>Questions:</span>
                    </div>
                    <span
                      style={{
                        color: '#1f2937',
                        fontWeight: '500',
                      }}
                    >
                      {exercise.questions.length}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#6b7280',
                        fontWeight: '500',
                      }}
                    >
                      <Clock size={14} />
                      <span>Time Limit:</span>
                    </div>
                    <span
                      style={{
                        color: '#1f2937',
                        fontWeight: '500',
                      }}
                    >
                      {exercise.time_limit} minutes
                    </span>
                  </div>
                </div>

                {/* Question Preview */}
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '20px',
                  }}
                >
                  <h4
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      margin: '0 0 12px 0',
                    }}
                  >
                    Questions Preview:
                  </h4>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    {exercise.questions.slice(0, 3).map((question, index) => (
                      <div
                        key={question.id}
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          backgroundColor: '#f9fafb',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                        }}
                      >
                        <span
                          style={{
                            color: '#3b82f6',
                            fontWeight: '600',
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}.
                        </span>
                        <span
                          style={{
                            color: '#1f2937',
                            lineHeight: '1.3',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            lineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {question.content}
                        </span>
                      </div>
                    ))}
                    {exercise.questions.length > 3 && (
                      <div
                        style={{
                          padding: '0.5rem',
                          textAlign: 'center',
                          color: '#6b7280',
                          fontSize: '0.8rem',
                          fontStyle: 'italic',
                          backgroundColor: '#f9fafb',
                          borderRadius: '4px',
                        }}
                      >
                        +{exercise.questions.length - 3} more questions
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {showActions && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      justifyContent: 'flex-end',
                      flexWrap: 'wrap',
                      marginTop: '1.5rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid #e5e7eb',
                    }}
                  >
                    {onPreviewExercise && (
                      <button
                        onClick={() => onPreviewExercise(exercise)}
                        style={{
                          minWidth: '90px',
                          padding: '8px 16px',
                          background: '#eef2ff',
                          color: '#3b82f6',
                          border: '1px solid #c7d2fe',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#3b82f6';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#eef2ff';
                          e.currentTarget.style.color = '#3b82f6';
                        }}
                      >
                        <Eye size={14} />
                        Preview
                      </button>
                    )}

                    {onEditExercise && (
                      <button
                        onClick={() => handleDuplicateExercise(exercise.id)}
                        style={{
                          minWidth: '90px',
                          padding: '8px 16px',
                          background: '#f0fdf4',
                          color: '#16a34a',
                          border: '1px solid #bbf7d0',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#16a34a';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f0fdf4';
                          e.currentTarget.style.color = '#16a34a';
                        }}
                      >
                        <Copy size={14} />
                        Duplicate
                      </button>
                    )}

                    {onEditExercise && (
                      <button
                        onClick={() => onEditExercise(exercise)}
                        style={{
                          minWidth: '90px',
                          padding: '8px 16px',
                          background: '#e0f2fe',
                          color: '#0284c7',
                          border: '1px solid #bae6fd',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#0284c7';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#e0f2fe';
                          e.currentTarget.style.color = '#0284c7';
                        }}
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                    )}

                    {onDeleteExercise && (
                      <button
                        onClick={() => handleDeleteExercise(exercise.id)}
                        disabled={deletingId === exercise.id}
                        style={{
                          minWidth: '90px',
                          padding: '8px 16px',
                          background: '#fef2f2',
                          color: '#dc2626',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          cursor:
                            deletingId === exercise.id
                              ? 'not-allowed'
                              : 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: deletingId === exercise.id ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (deletingId !== exercise.id) {
                            e.currentTarget.style.background = '#dc2626';
                            e.currentTarget.style.color = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (deletingId !== exercise.id) {
                            e.currentTarget.style.background = '#fef2f2';
                            e.currentTarget.style.color = '#dc2626';
                          }
                        }}
                      >
                        <Trash2 size={14} />
                        {deletingId === exercise.id ? 'Deleting...' : 'Delete'}
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

export default ExerciseList;
