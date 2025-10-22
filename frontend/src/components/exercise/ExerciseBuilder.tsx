import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, Question, Course } from '../../types';
import {
  exerciseService,
  QuestionSelectionCriteria,
} from '../../services/exerciseService';
import { questionService } from '../../services/questionService';
import { courseService } from '../../services/courseService';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import {
  BookOpen,
  Clock,
  HelpCircle,
  Edit,
  FileText,
  Plus,
  Eye,
  X,
  ChevronUp,
  ChevronDown,
  GripVertical,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface ExerciseBuilderProps {
  exercise?: Exercise | null;
  onSubmit: (exerciseData: Omit<Exercise, 'id'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ExerciseBuilder: React.FC<ExerciseBuilderProps> = ({
  exercise,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    type: 'multiple_choice' as 'multiple_choice' | 'fill_blank',
    course_id: '',
    questions: [] as Question[],
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [draggedQuestion, setDraggedQuestion] = useState<Question | null>(null);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [autoSelectCriteria, setAutoSelectCriteria] =
    useState<QuestionSelectionCriteria>({
      courseId: '',
      difficulty: undefined,
      type: undefined,
      tags: [],
      count: 5,
    });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [previewData, setPreviewData] = useState<{
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
  } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (exercise) {
      setFormData({
        title: exercise.title || '',
        type: exercise.type || 'multiple_choice',
        course_id: exercise.course_id || '',
        questions: exercise.questions || [],
      });
      setSelectedQuestions(exercise.questions || []);
    }
  }, [exercise]);

  useEffect(() => {
    if (formData.course_id) {
      loadQuestionsForCourse(formData.course_id);
      setAutoSelectCriteria((prev) => ({
        ...prev,
        courseId: formData.course_id,
      }));
    }
  }, [formData.course_id]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const coursesData = await courseService.getAllCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadQuestionsForCourse = async (courseId: string) => {
    try {
      setLoadingQuestions(true);
      const questions = await questionService.getQuestionsByCourse(courseId);
      setAvailableQuestions(questions.filter((q) => q.isActive));
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Exercise title is required';
    }

    if (!formData.course_id) {
      newErrors.course_id = 'Course selection is required';
    }

    if (selectedQuestions.length === 0) {
      newErrors.questions = 'At least one question is required';
    }

    // Time limit validation removed - not in Android app

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
        questions: selectedQuestions,
      });
    } catch (error) {
      console.error('Error submitting exercise:', error);
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

  const handleAutoSelectQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const questions = await exerciseService.autoSelectQuestions({
        ...autoSelectCriteria,
        excludeQuestionIds: selectedQuestions.map((q) => q.id),
      });
      setSelectedQuestions((prev) => [...prev, ...questions]);
    } catch (error) {
      console.error('Error auto-selecting questions:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handlePreviewExercise = async () => {
    try {
      const preview = await exerciseService.previewExercise({
        ...formData,
        questions: selectedQuestions,
      });
      setPreviewData(preview);
    } catch (error) {
      console.error('Error previewing exercise:', error);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, question: Question) => {
    setDraggedQuestion(question);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropToSelected = (e: React.DragEvent) => {
    e.preventDefault();
    if (
      draggedQuestion &&
      !selectedQuestions.find((q) => q.id === draggedQuestion.id)
    ) {
      setSelectedQuestions((prev) => [...prev, draggedQuestion]);
    }
    setDraggedQuestion(null);
  };

  const handleDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedQuestion) {
      setSelectedQuestions((prev) =>
        prev.filter((q) => q.id !== draggedQuestion.id)
      );
    }
    setDraggedQuestion(null);
  };

  const handleQuestionReorder = (fromIndex: number, toIndex: number) => {
    const newQuestions = [...selectedQuestions];
    const [movedQuestion] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, movedQuestion);
    setSelectedQuestions(newQuestions);
  };

  const removeQuestion = (questionId: string) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const addQuestion = (question: Question) => {
    if (!selectedQuestions.find((q) => q.id === question.id)) {
      setSelectedQuestions((prev) => [...prev, question]);
    }
  };

  if (loadingData) {
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
          Loading exercise builder...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
      }}
    >
      <style>
        {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
      </style>
      {/* Header */}
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
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '8px',
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
              <FileText size={24} color="white" />
            </div>
            <div>
              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #1f2937, #374151)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0 0 4px 0',
                }}
              >
                {exercise ? 'Edit Exercise' : 'Create New Exercise'}
              </h2>
              <p
                style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  margin: '0',
                  fontWeight: '500',
                }}
              >
                Build engaging exercises for your students
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Exercise Details Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e5e7eb',
          }}
        >
          <h3
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 20px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <FileText size={20} color="#3b82f6" />
            Exercise Details
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            <div>
              <label
                htmlFor="title"
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                Exercise Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter exercise title"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${errors.title ? '#ef4444' : '#d1d5db'}`,
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
                  e.target.style.borderColor = errors.title
                    ? '#ef4444'
                    : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.title && (
                <span
                  style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    marginTop: '4px',
                    display: 'block',
                  }}
                >
                  {errors.title}
                </span>
              )}
            </div>

            <div>
              <label
                htmlFor="course_id"
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                }}
              >
                Course *
              </label>
              <select
                id="course_id"
                value={formData.course_id}
                onChange={(e) => handleInputChange('course_id', e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${errors.course_id ? '#ef4444' : '#d1d5db'}`,
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
                  e.target.style.borderColor = errors.course_id
                    ? '#ef4444'
                    : '#d1d5db';
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
                <span
                  style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    marginTop: '4px',
                    display: 'block',
                  }}
                >
                  {errors.course_id}
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Difficulty field removed - not in Android app */}

            {/* Time limit field removed - not in Android app */}
          </div>
        </div>

        {/* Question Selection Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <h3
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <HelpCircle size={20} color="#3b82f6" />
              Question Selection
            </h3>
            <div
              style={{
                display: 'flex',
                gap: '12px',
              }}
            >
              <button
                type="button"
                onClick={() => setShowQuestionBank(!showQuestionBank)}
                disabled={!formData.course_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#f8fafc',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: formData.course_id ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  opacity: formData.course_id ? 1 : 0.6,
                }}
                onMouseEnter={(e) => {
                  if (formData.course_id) {
                    e.currentTarget.style.background = '#3b82f6';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.course_id) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = '#374151';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }
                }}
              >
                <BookOpen size={16} />
                {showQuestionBank ? 'Hide' : 'Show'} Question Bank
              </button>
              <button
                type="button"
                onClick={handlePreviewExercise}
                disabled={selectedQuestions.length === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#f8fafc',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor:
                    selectedQuestions.length > 0 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  opacity: selectedQuestions.length > 0 ? 1 : 0.6,
                }}
                onMouseEnter={(e) => {
                  if (selectedQuestions.length > 0) {
                    e.currentTarget.style.background = '#10b981';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#10b981';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedQuestions.length > 0) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = '#374151';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }
                }}
              >
                <Eye size={16} />
                Preview Exercise
              </button>
            </div>
          </div>

          {/* Auto Selection */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              border: '1px solid #e5e7eb',
            }}
          >
            <h4
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Lightbulb size={16} color="#f59e0b" />
              Auto-Select Questions
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '16px',
                alignItems: 'end',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  Count
                </label>
                <input
                  type="number"
                  value={autoSelectCriteria.count.toString()}
                  onChange={(e) =>
                    setAutoSelectCriteria((prev) => ({
                      ...prev,
                      count: parseInt(e.target.value) || 1,
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
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

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  Difficulty
                </label>
                <select
                  value={autoSelectCriteria.difficulty || ''}
                  onChange={(e) =>
                    setAutoSelectCriteria((prev) => ({
                      ...prev,
                      difficulty: (e.target.value as any) || undefined,
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 8px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '12px',
                    paddingRight: '32px',
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
                  <option value="">Any Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  Type
                </label>
                <select
                  value={autoSelectCriteria.type || ''}
                  onChange={(e) =>
                    setAutoSelectCriteria((prev) => ({
                      ...prev,
                      type: (e.target.value as any) || undefined,
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 8px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '12px',
                    paddingRight: '32px',
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
                  <option value="">Any Type</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="fill_blank">Fill in the Blank</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAutoSelectQuestions}
                disabled={!formData.course_id || loadingQuestions}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor:
                    !formData.course_id || loadingQuestions
                      ? 'not-allowed'
                      : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: !formData.course_id || loadingQuestions ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (formData.course_id && !loadingQuestions) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 12px rgba(59, 130, 246, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (formData.course_id && !loadingQuestions) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {loadingQuestions ? (
                  <>
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #ffffff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    Loading...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Auto-Select
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Drag and Drop Interface */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: showQuestionBank ? '1fr 1fr' : '1fr',
              gap: '20px',
            }}
          >
            {showQuestionBank && (
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <h4
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <BookOpen size={16} color="#3b82f6" />
                  Available Questions ({availableQuestions.length})
                </h4>
                <div
                  style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    padding: '8px',
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: '2px dashed #d1d5db',
                  }}
                  onDragOver={handleDragOver}
                  onDrop={handleDropToAvailable}
                >
                  {loadingQuestions ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem',
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
                        Loading questions...
                      </p>
                    </div>
                  ) : (
                    availableQuestions
                      .filter(
                        (q) => !selectedQuestions.find((sq) => sq.id === q.id)
                      )
                      .map((question) => (
                        <div
                          key={question.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, question)}
                          onClick={() => addQuestion(question)}
                          style={{
                            padding: '12px',
                            marginBottom: '8px',
                            background: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.boxShadow =
                              '0 2px 8px rgba(59, 130, 246, 0.1)';
                            e.currentTarget.style.transform =
                              'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              flex: 1,
                            }}
                          >
                            {question.type === 'multiple_choice' ? (
                              <HelpCircle size={16} color="#6b7280" />
                            ) : (
                              <Edit size={16} color="#6b7280" />
                            )}
                            <span
                              style={{
                                fontSize: '14px',
                                color: '#374151',
                                lineHeight: '1.4',
                                flex: 1,
                              }}
                            >
                              {question.content}
                            </span>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '10px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                background:
                                  question.difficulty === 'easy'
                                    ? '#dcfce7'
                                    : question.difficulty === 'medium'
                                      ? '#fef3c7'
                                      : '#fef2f2',
                                color:
                                  question.difficulty === 'easy'
                                    ? '#16a34a'
                                    : question.difficulty === 'medium'
                                      ? '#d97706'
                                      : '#dc2626',
                              }}
                            >
                              {question.difficulty}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            <div
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e5e7eb',
              }}
            >
              <h4
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 16px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle size={16} color="#10b981" />
                Selected Questions ({selectedQuestions.length})
              </h4>
              <div
                style={{
                  minHeight: '200px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  padding: '8px',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '2px dashed #d1d5db',
                }}
                onDragOver={handleDragOver}
                onDrop={handleDropToSelected}
              >
                {selectedQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, question)}
                    style={{
                      padding: '12px',
                      marginBottom: '8px',
                      background: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'move',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#10b981';
                      e.currentTarget.style.boxShadow =
                        '0 2px 8px rgba(16, 185, 129, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600',
                        flexShrink: 0,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flex: 1,
                      }}
                    >
                      {question.type === 'multiple_choice' ? (
                        <HelpCircle size={16} color="#6b7280" />
                      ) : (
                        <Edit size={16} color="#6b7280" />
                      )}
                      <span
                        style={{
                          fontSize: '14px',
                          color: '#374151',
                          lineHeight: '1.4',
                          flex: 1,
                        }}
                      >
                        {question.content}
                      </span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          background:
                            question.difficulty === 'easy'
                              ? '#dcfce7'
                              : question.difficulty === 'medium'
                                ? '#fef3c7'
                                : '#fef2f2',
                          color:
                            question.difficulty === 'easy'
                              ? '#16a34a'
                              : question.difficulty === 'medium'
                                ? '#d97706'
                                : '#dc2626',
                        }}
                      >
                        {question.difficulty}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '4px',
                        flexShrink: 0,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          index > 0 && handleQuestionReorder(index, index - 1)
                        }
                        disabled={index === 0}
                        style={{
                          width: '28px',
                          height: '28px',
                          background: index === 0 ? '#f3f4f6' : '#ffffff',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: index === 0 ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (index > 0) {
                            e.currentTarget.style.background = '#3b82f6';
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.color = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (index > 0) {
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.color = 'inherit';
                          }
                        }}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          index < selectedQuestions.length - 1 &&
                          handleQuestionReorder(index, index + 1)
                        }
                        disabled={index === selectedQuestions.length - 1}
                        style={{
                          width: '28px',
                          height: '28px',
                          background:
                            index === selectedQuestions.length - 1
                              ? '#f3f4f6'
                              : '#ffffff',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor:
                            index === selectedQuestions.length - 1
                              ? 'not-allowed'
                              : 'pointer',
                          transition: 'all 0.2s ease',
                          opacity:
                            index === selectedQuestions.length - 1 ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (index < selectedQuestions.length - 1) {
                            e.currentTarget.style.background = '#3b82f6';
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.color = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (index < selectedQuestions.length - 1) {
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.color = 'inherit';
                          }
                        }}
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        style={{
                          width: '28px',
                          height: '28px',
                          background: '#ffffff',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ef4444';
                          e.currentTarget.style.borderColor = '#ef4444';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#ffffff';
                          e.currentTarget.style.borderColor = '#d1d5db';
                          e.currentTarget.style.color = 'inherit';
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {selectedQuestions.length === 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2rem',
                      textAlign: 'center',
                    }}
                  >
                    <GripVertical size={32} color="#9ca3af" />
                    <p
                      style={{
                        color: '#6b7280',
                        fontSize: '14px',
                        margin: '8px 0 0 0',
                      }}
                    >
                      Drag questions here or use auto-select to add questions
                    </p>
                  </div>
                )}
              </div>
              {errors.questions && (
                <span
                  style={{
                    fontSize: '12px',
                    color: '#ef4444',
                    marginTop: '8px',
                    display: 'block',
                  }}
                >
                  {errors.questions}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Preview Results */}
        {previewData && (
          <div
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e5e7eb',
            }}
          >
            <h4
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
              <Eye size={18} color="#3b82f6" />
              Exercise Preview
            </h4>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: previewData.isValid ? '#f0fdf4' : '#fef3c7',
                border: `1px solid ${previewData.isValid ? '#bbf7d0' : '#fde68a'}`,
                marginBottom: '16px',
              }}
            >
              {previewData.isValid ? (
                <CheckCircle size={20} color="#16a34a" />
              ) : (
                <AlertTriangle size={20} color="#d97706" />
              )}
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: previewData.isValid ? '#16a34a' : '#d97706',
                }}
              >
                {previewData.isValid
                  ? 'Exercise is ready to publish'
                  : 'Exercise needs attention'}
              </span>
            </div>

            {previewData.warnings.length > 0 && (
              <div
                style={{
                  marginBottom: '16px',
                }}
              >
                <h5
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#dc2626',
                    margin: '0 0 8px 0',
                  }}
                >
                  Warnings:
                </h5>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: '20px',
                  }}
                >
                  {previewData.warnings.map((warning, index) => (
                    <li
                      key={index}
                      style={{
                        fontSize: '13px',
                        color: '#dc2626',
                        marginBottom: '4px',
                      }}
                    >
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {previewData.suggestions.length > 0 && (
              <div>
                <h5
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#3b82f6',
                    margin: '0 0 8px 0',
                  }}
                >
                  Suggestions:
                </h5>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: '20px',
                  }}
                >
                  {previewData.suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      style={{
                        fontSize: '13px',
                        color: '#3b82f6',
                        marginBottom: '4px',
                      }}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '16px',
            padding: '24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e5e7eb',
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
              background: '#f8fafc',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = '#6b7280';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.borderColor = '#d1d5db';
              }
            }}
          >
            <X size={16} />
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
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(59, 130, 246, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                {exercise ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <FileText size={16} />
                {exercise ? 'Update Exercise' : 'Create Exercise'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExerciseBuilder;


