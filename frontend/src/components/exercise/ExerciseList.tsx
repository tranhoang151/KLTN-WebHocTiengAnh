import React, { useState, useEffect } from 'react';
import { Exercise, Course } from '../../types';
import { exerciseService, ExerciseFilters } from '../../services/exerciseService';
import { courseService } from '../../services/courseService';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import ChildFriendlyCard from '../ui/ChildFriendlyCard';
import ChildFriendlyInput from '../ui/ChildFriendlyInput';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import './ExerciseList.css';

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
      setFilters(prev => ({ ...prev, courseId: courseFilter }));
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
    if (!window.confirm('Are you sure you want to delete this exercise? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(exerciseId);
      await exerciseService.deleteExercise(exerciseId);
      setExercises(prev => prev.filter(e => e.id !== exerciseId));
      onDeleteExercise?.(exerciseId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete exercise');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicateExercise = async (exerciseId: string) => {
    try {
      const duplicatedExercise = await exerciseService.duplicateExercise(exerciseId);
      setExercises(prev => [duplicatedExercise, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to duplicate exercise');
    }
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.name || 'Unknown Course';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'danger';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice': return '☑️';
      case 'fill_blank': return '✏️';
      default: return '❓';
    }
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCourseName(exercise.course_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="exercise-list-loading">
        <LoadingSpinner />
        <p>Loading exercises...</p>
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
    <div className="exercise-list-container">
      <div className="exercise-list-header">
        <div>
          <h2>Exercise Management</h2>
          <p>Create and manage exercises for your courses</p>
        </div>
        {showActions && onCreateExercise && (
          <ChildFriendlyButton
            variant="primary"
            onClick={onCreateExercise}
          >
            + Create Exercise
          </ChildFriendlyButton>
        )}
      </div>

      {/* Filters */}
      <ChildFriendlyCard className="filters-card">
        <div className="filters-container">
          <div className="filter-row">
            <div className="filter-group">
              <label>Search</label>
              <ChildFriendlyInput
                type="text"
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search exercises..."
              />
            </div>

            <div className="filter-group">
              <label>Course</label>
              <select
                value={filters.courseId || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, courseId: e.target.value }))}
                className="filter-select"
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Difficulty</label>
              <select
                value={filters.difficulty || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value as any }))}
                className="filter-select"
              >
                <option value="">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Type</label>
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                className="filter-select"
              >
                <option value="">All Types</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="fill_blank">Fill in the Blank</option>
              </select>
            </div>
          </div>
        </div>
      </ChildFriendlyCard>

      {filteredExercises.length === 0 ? (
        <ChildFriendlyCard className="empty-state">
          <div className="empty-content">
            <div className="empty-icon">📝</div>
            <h3>No exercises found</h3>
            <p>
              {searchTerm || Object.values(filters).some(v => v !== undefined && v !== '')
                ? 'Try adjusting your search or filters'
                : 'Create your first exercise to get started'
              }
            </p>
            {showActions && onCreateExercise && !searchTerm && (
              <ChildFriendlyButton
                variant="primary"
                onClick={onCreateExercise}
              >
                Create First Exercise
              </ChildFriendlyButton>
            )}
          </div>
        </ChildFriendlyCard>
      ) : (
        <div className="exercise-grid">
          {filteredExercises.map((exercise) => (
            <ChildFriendlyCard key={exercise.id} className="exercise-card">
              <div className="exercise-header">
                <div className="exercise-meta">
                  <span className="exercise-type">
                    {getTypeIcon(exercise.type)} {exercise.type.replace('_', ' ')}
                  </span>
                  <span className={`difficulty-badge ${getDifficultyColor(exercise.difficulty)}`}>
                    {exercise.difficulty}
                  </span>
                </div>
              </div>

              <div className="exercise-content">
                <h3 className="exercise-title">{exercise.title}</h3>

                <div className="exercise-details">
                  <div className="detail-item">
                    <span className="detail-label">📚 Course:</span>
                    <span className="detail-value">{getCourseName(exercise.course_id)}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">❓ Questions:</span>
                    <span className="detail-value">{exercise.questions.length}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">⏱️ Time Limit:</span>
                    <span className="detail-value">{exercise.time_limit} minutes</span>
                  </div>
                </div>

                <div className="question-preview">
                  <h4>Questions Preview:</h4>
                  <div className="question-list-preview">
                    {exercise.questions.slice(0, 3).map((question, index) => (
                      <div key={question.id} className="question-preview-item">
                        <span className="question-number">{index + 1}.</span>
                        <span className="question-text">{question.content}</span>
                      </div>
                    ))}
                    {exercise.questions.length > 3 && (
                      <div className="more-questions">
                        +{exercise.questions.length - 3} more questions
                      </div>
                    )}
                  </div>
                </div>

                {showActions && (
                  <div className="exercise-actions">
                    {/* Preview is always available */}
                    {onPreviewExercise && (
                      <ChildFriendlyButton
                        variant="secondary"
                        onClick={() => onPreviewExercise(exercise)}
                        className="preview-button"
                      >
                        Preview
                      </ChildFriendlyButton>
                    )}

                    {/* Only show duplicate button if edit permission exists (implied by onEditExercise) */}
                    {onEditExercise && (
                      <ChildFriendlyButton
                        variant="secondary"
                        onClick={() => handleDuplicateExercise(exercise.id)}
                        className="duplicate-button"
                      >
                        Duplicate
                      </ChildFriendlyButton>
                    )}

                    {/* Edit button based on permission */}
                    {onEditExercise && (
                      <ChildFriendlyButton
                        variant="secondary"
                        onClick={() => onEditExercise(exercise)}
                        className="edit-button"
                      >
                        Edit
                      </ChildFriendlyButton>
                    )}

                    {/* Delete button based on permission */}
                    {onDeleteExercise && (
                      <ChildFriendlyButton
                        variant="danger"
                        onClick={() => handleDeleteExercise(exercise.id)}
                        loading={deletingId === exercise.id}
                        disabled={deletingId === exercise.id}
                        className="delete-button"
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

export default ExerciseList;