import React, { useState, useEffect } from 'react';
import { Question, Course } from '../../types';
import {
  questionService,
  QuestionFilters,
} from '../../services/questionService';
import { courseService } from '../../services/courseService';
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Copy,
  BookOpen,
  Tag,
  Calendar,
  Check,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';

interface QuestionListProps {
  onEditQuestion?: (question: Question) => void;
  onCreateQuestion?: () => void;
  onDeleteQuestion?: (questionId: string) => void;
  showActions?: boolean;
  courseFilter?: string;
}

const QuestionList: React.FC<QuestionListProps> = ({
  onEditQuestion,
  onCreateQuestion,
  onDeleteQuestion,
  showActions = true,
  courseFilter,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [bulkLoading, setBulkLoading] = useState(false);

  // Filters
  const [filters, setFilters] = useState<QuestionFilters>({
    courseId: courseFilter || '',
    difficulty: undefined,
    type: undefined,
    searchTerm: '',
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

      const [questionsData, coursesData] = await Promise.all([
        questionService.getAllQuestions(filters),
        courseService.getAllCourses(),
      ]);

      setQuestions(questionsData);
      setCourses(coursesData);
    } catch (err: any) {
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this question? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setDeletingId(questionId);
      await questionService.deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      onDeleteQuestion?.(questionId);
    } catch (err: any) {
      setError(err.message || 'Failed to delete question');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicateQuestion = async (questionId: string) => {
    try {
      const duplicatedQuestion =
        await questionService.duplicateQuestion(questionId);
      setQuestions((prev) => [duplicatedQuestion, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to duplicate question');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.size === 0) return;

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedQuestions.size} questions? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setBulkLoading(true);
      await questionService.bulkDeleteQuestions(Array.from(selectedQuestions));
      setQuestions((prev) => prev.filter((q) => !selectedQuestions.has(q.id)));
      setSelectedQuestions(new Set());
    } catch (err: any) {
      setError(err.message || 'Failed to delete questions');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedQuestions.size === 0) return;

    try {
      setBulkLoading(true);
      await questionService.bulkUpdateQuestions(Array.from(selectedQuestions), {
        is_active: isActive,
      });
      setQuestions((prev) =>
        prev.map((q) =>
          selectedQuestions.has(q.id) ? { ...q, is_active: isActive } : q
        )
      );
      setSelectedQuestions(new Set());
    } catch (err: any) {
      setError(err.message || 'Failed to update questions');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleQuestionSelect = (questionId: string, selected: boolean) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(questionId);
      } else {
        newSet.delete(questionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedQuestions(new Set(questions.map((q) => q.id)));
    } else {
      setSelectedQuestions(new Set());
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
        return <CheckCircle size={16} color="#3b82f6" />;
      case 'fill_blank':
        return <Edit size={16} color="#8b5cf6" />;
      default:
        return <HelpCircle size={16} color="#6b7280" />;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
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
          ></div>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              fontWeight: '500',
            }}
          >
            Loading questions...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
          border: '1px solid #fca5a5',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <AlertTriangle size={24} color="#dc2626" />
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#dc2626',
              margin: '0',
            }}
          >
            Error Loading Questions
          </h3>
        </div>
        <p
          style={{
            fontSize: '14px',
            color: '#991b1b',
            margin: '0 0 16px 0',
          }}
        >
          {error}
        </p>
        <button
          onClick={loadData}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow =
              '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Filters Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            padding: '24px',
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
          <div
            style={{
              position: 'absolute',
              bottom: '-15px',
              left: '-15px',
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              borderRadius: '50%',
              opacity: '0.05',
              zIndex: 0,
            }}
          ></div>

          {/* Filter Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
            >
              <Filter size={20} color="white" />
            </div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #1f2937, #374151)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: '0',
              }}
            >
              Filter Questions
            </h3>
          </div>

          {/* Filter Controls */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Search Input */}
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
                <Search size={16} color="#3b82f6" />
                Search
              </label>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <input
                  type="text"
                  value={filters.searchTerm || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      searchTerm: e.target.value,
                    }))
                  }
                  placeholder="Search questions..."
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 40px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1f2937',
                    background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow =
                      '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, #ffffff, #f9fafb)';
                  }}
                />
                <Search
                  size={18}
                  color="#6b7280"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    zIndex: 2,
                  }}
                />
              </div>
            </div>

            {/* Course Filter */}
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
                <BookOpen size={16} color="#3b82f6" />
                Course
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={filters.courseId || ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      courseId: e.target.value,
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1f2937',
                    background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow =
                      '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, #ffffff, #f9fafb)';
                  }}
                >
                  <option value="">All Courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  color="#6b7280"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            {/* Type Filter */}
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
                <HelpCircle size={16} color="#3b82f6" />
                Type
              </label>
              <div style={{ position: 'relative' }}>
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
                    padding: '12px 40px 12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1f2937',
                    background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow =
                      '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, #ffffff, #f9fafb)';
                  }}
                >
                  <option value="">All Types</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="fill_blank">Fill in the Blank</option>
                </select>
                <ChevronDown
                  size={16}
                  color="#6b7280"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            {/* Difficulty Filter */}
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
                <Tag size={16} color="#3b82f6" />
                Difficulty
              </label>
              <div style={{ position: 'relative' }}>
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
                    padding: '12px 40px 12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1f2937',
                    background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow =
                      '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, #ffffff, #f9fafb)';
                  }}
                >
                  <option value="">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <ChevronDown
                  size={16}
                  color="#6b7280"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            {/* Status Filter */}
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
                <CheckCircle size={16} color="#3b82f6" />
                Status
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={
                    filters.isActive === undefined
                      ? ''
                      : filters.isActive.toString()
                  }
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      isActive:
                        e.target.value === ''
                          ? undefined
                          : e.target.value === 'true',
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1f2937',
                    background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    cursor: 'pointer',
                    appearance: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow =
                      '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, #ffffff, #f9fafb)';
                  }}
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <ChevronDown
                  size={16}
                  color="#6b7280"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedQuestions.size > 0 && (
          <div
            style={{
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              border: '1px solid #f59e0b',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
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
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle size={16} color="white" />
                </div>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#92400e',
                  }}
                >
                  {selectedQuestions.size} question
                  {selectedQuestions.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  onClick={() => handleBulkStatusUpdate(true)}
                  disabled={bulkLoading}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: bulkLoading ? 'not-allowed' : 'pointer',
                    opacity: bulkLoading ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!bulkLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(16, 185, 129, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!bulkLoading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate(false)}
                  disabled={bulkLoading}
                  style={{
                    background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: bulkLoading ? 'not-allowed' : 'pointer',
                    opacity: bulkLoading ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!bulkLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(107, 114, 128, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!bulkLoading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  Deactivate
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkLoading}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: bulkLoading ? 'not-allowed' : 'pointer',
                    opacity: bulkLoading ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!bulkLoading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(239, 68, 68, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!bulkLoading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {bulkLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {questions.length === 0 ? (
          <div
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '20px',
              padding: '60px 40px',
              textAlign: 'center',
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
              }}
            ></div>
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: '-20px',
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '50%',
                opacity: '0.05',
              }}
            ></div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                }}
              >
                <HelpCircle size={40} color="white" />
              </div>
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #1f2937, #374151)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: '0',
                }}
              >
                No questions found
              </h3>
              <p
                style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  margin: '0',
                  maxWidth: '400px',
                  lineHeight: '1.6',
                }}
              >
                {Object.values(filters).some((v) => v !== undefined && v !== '')
                  ? 'Try adjusting your filters or create a new question'
                  : 'Create your first question to get started'}
              </p>
              {showActions && onCreateQuestion && (
                <button
                  onClick={onCreateQuestion}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 25px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Plus size={20} />
                  Create First Question
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                borderRadius: '12px',
                padding: '16px 20px',
                border: '1px solid #d1d5db',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    selectedQuestions.size === questions.length &&
                    questions.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#3b82f6',
                    cursor: 'pointer',
                  }}
                />
                <span>Select all ({questions.length})</span>
              </label>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: '20px',
              }}
            >
              {questions.map((question) => (
                <div
                  key={question.id}
                  style={{
                    background:
                      'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #e5e7eb',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 30px rgba(0, 0, 0, 0.12)';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 20px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  {/* Background decorations */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-15px',
                      right: '-15px',
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      borderRadius: '50%',
                      opacity: '0.05',
                    }}
                  ></div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-10px',
                      left: '-10px',
                      width: '30px',
                      height: '30px',
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      borderRadius: '50%',
                      opacity: '0.05',
                    }}
                  ></div>

                  {/* Question Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '20px',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedQuestions.has(question.id)}
                        onChange={(e) =>
                          handleQuestionSelect(question.id, e.target.checked)
                        }
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: '#3b82f6',
                          cursor: 'pointer',
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 12px',
                          background:
                            'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                        }}
                      >
                        {getTypeIcon(question.type)}
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#374151',
                            textTransform: 'capitalize',
                          }}
                        >
                          {question.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          background:
                            question.difficulty === 'easy'
                              ? 'linear-gradient(135deg, #10b981, #059669)'
                              : question.difficulty === 'medium'
                                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                : 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: 'white',
                        }}
                      >
                        {question.difficulty}
                      </span>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          background: question.is_active
                            ? 'linear-gradient(135deg, #10b981, #059669)'
                            : 'linear-gradient(135deg, #6b7280, #4b5563)',
                          color: 'white',
                        }}
                      >
                        {question.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 16px 0',
                        lineHeight: '1.5',
                      }}
                    >
                      {question.content}
                    </h3>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {/* Course */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <BookOpen size={14} color="#3b82f6" />
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#6b7280',
                          }}
                        >
                          Course:
                        </span>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#1f2937',
                          }}
                        >
                          {getCourseName(question.course_id)}
                        </span>
                      </div>

                      {/* Tags */}
                      {question.tags.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <Tag size={14} color="#3b82f6" />
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: '500',
                              color: '#6b7280',
                            }}
                          >
                            Tags:
                          </span>
                          <div
                            style={{
                              display: 'flex',
                              gap: '6px',
                              flexWrap: 'wrap',
                            }}
                          >
                            {question.tags.map((tag) => (
                              <span
                                key={tag}
                                style={{
                                  padding: '2px 8px',
                                  background:
                                    'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                                  color: '#3730a3',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '500',
                                  border: '1px solid #a5b4fc',
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Options for Multiple Choice */}
                      {question.type === 'multiple_choice' &&
                        question.options && (
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px',
                              }}
                            >
                              <HelpCircle size={14} color="#3b82f6" />
                              <span
                                style={{
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  color: '#6b7280',
                                }}
                              >
                                Options:
                              </span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                              }}
                            >
                              {question.options.map((option, index) => (
                                <div
                                  key={index}
                                  style={{
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    background:
                                      index === question.correct_answer
                                        ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
                                        : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                                    color:
                                      index === question.correct_answer
                                        ? '#065f46'
                                        : '#374151',
                                    border: `1px solid ${index === question.correct_answer ? '#10b981' : '#d1d5db'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                  }}
                                >
                                  {index === question.correct_answer && (
                                    <CheckCircle size={12} color="#10b981" />
                                  )}
                                  {option}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Answer for Fill in the Blank */}
                      {question.type === 'fill_blank' && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <CheckCircle size={14} color="#3b82f6" />
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: '500',
                              color: '#6b7280',
                            }}
                          >
                            Answer:
                          </span>
                          <span
                            style={{
                              padding: '4px 8px',
                              background:
                                'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                              color: '#065f46',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              border: '1px solid #10b981',
                            }}
                          >
                            {question.correct_answer}
                          </span>
                        </div>
                      )}

                      {/* Created Date */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <Calendar size={14} color="#3b82f6" />
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#6b7280',
                          }}
                        >
                          Created:
                        </span>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#1f2937',
                          }}
                        >
                          {new Date(question.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {showActions && (
                      <div
                        style={{
                          marginTop: '20px',
                          paddingTop: '16px',
                          borderTop: '1px solid #e5e7eb',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: '8px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <button
                            onClick={() => handleDuplicateQuestion(question.id)}
                            style={{
                              background:
                                'linear-gradient(135deg, #6b7280, #4b5563)',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                'translateY(-1px)';
                              e.currentTarget.style.boxShadow =
                                '0 2px 8px rgba(107, 114, 128, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <Copy size={12} />
                            Duplicate
                          </button>
                          {onEditQuestion && (
                            <button
                              onClick={() => onEditQuestion(question)}
                              style={{
                                background:
                                  'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                  'translateY(-1px)';
                                e.currentTarget.style.boxShadow =
                                  '0 2px 8px rgba(59, 130, 246, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                  'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              <Edit size={12} />
                              Edit
                            </button>
                          )}
                          {onDeleteQuestion && (
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              disabled={deletingId === question.id}
                              style={{
                                background:
                                  'linear-gradient(135deg, #ef4444, #dc2626)',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor:
                                  deletingId === question.id
                                    ? 'not-allowed'
                                    : 'pointer',
                                opacity: deletingId === question.id ? 0.6 : 1,
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              onMouseEnter={(e) => {
                                if (deletingId !== question.id) {
                                  e.currentTarget.style.transform =
                                    'translateY(-1px)';
                                  e.currentTarget.style.boxShadow =
                                    '0 2px 8px rgba(239, 68, 68, 0.3)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (deletingId !== question.id) {
                                  e.currentTarget.style.transform =
                                    'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }
                              }}
                            >
                              <Trash2 size={12} />
                              {deletingId === question.id
                                ? 'Deleting...'
                                : 'Delete'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default QuestionList;
