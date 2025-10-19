import React, { useState, useEffect } from 'react';
import { Question, Course } from '../../types';
import { courseService } from '../../services/courseService';
import { questionService } from '../../services/questionService';
import { useAuth } from '../../contexts/AuthContext';
import {
  HelpCircle,
  Save,
  X,
  AlertTriangle,
  FileText,
  BookOpen,
  Tag,
  Plus,
  Trash2,
} from 'lucide-react';

interface QuestionFormProps {
  question?: Question | null;
  onSubmit: (
    questionData: Omit<Question, 'id' | 'created_at'>
  ) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    content: '',
    type: 'multiple_choice' as 'multiple_choice' | 'fill_blank',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    course_id: '',
    tags: [] as string[],
    created_by: user?.id || '',
    is_active: true,
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (question) {
      setFormData({
        content: question.content || '',
        type: question.type || 'multiple_choice',
        options: question.options || ['', '', '', ''],
        correct_answer: question.correct_answer?.toString() || '',
        explanation: question.explanation || '',
        difficulty: question.difficulty || 'medium',
        course_id: question.course_id || '',
        tags: question.tags || [],
        created_by: question.created_by || user?.id || '',
        is_active: question.is_active ?? true,
      });
    }
  }, [question, user]);

  useEffect(() => {
    if (formData.course_id) {
      loadTagsForCourse(formData.course_id);
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

  const loadTagsForCourse = async (courseId: string) => {
    try {
      const tags = await questionService.getAvailableTags(courseId);
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.content.trim()) {
      newErrors.content = 'Question content is required';
    }

    if (!formData.course_id) {
      newErrors.course_id = 'Course selection is required';
    }

    if (formData.type === 'multiple_choice') {
      const validOptions = formData.options.filter((opt) => opt.trim());
      if (validOptions.length < 2) {
        newErrors.options =
          'At least 2 options are required for multiple choice questions';
      }

      const correctIndex = parseInt(formData.correct_answer);
      if (
        isNaN(correctIndex) ||
        correctIndex < 0 ||
        correctIndex >= formData.options.length
      ) {
        newErrors.correct_answer = 'Please select a valid correct answer';
      } else if (!formData.options[correctIndex]?.trim()) {
        newErrors.correct_answer =
          'The selected correct answer option cannot be empty';
      }
    } else if (formData.type === 'fill_blank') {
      if (!formData.correct_answer.trim()) {
        newErrors.correct_answer =
          'Correct answer is required for fill-in-the-blank questions';
      }
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
      const submitData = {
        ...formData,
        correct_answer:
          formData.type === 'multiple_choice'
            ? parseInt(formData.correct_answer)
            : formData.correct_answer,
        options:
          formData.type === 'multiple_choice'
            ? formData.options.filter((opt) => opt.trim())
            : undefined,
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting question form:', error);
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

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    handleInputChange('options', newOptions);
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      handleInputChange('options', [...formData.options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      handleInputChange('options', newOptions);

      // Adjust correct answer if needed
      const correctIndex = parseInt(formData.correct_answer);
      if (correctIndex === index) {
        handleInputChange('correct_answer', '');
      } else if (correctIndex > index) {
        handleInputChange('correct_answer', (correctIndex - 1).toString());
      }
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange(
      'tags',
      formData.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleTagSelect = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      handleInputChange('tags', [...formData.tags, tag]);
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
          padding: '60px 20px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
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
            fontWeight: '500',
            margin: '0',
          }}
        >
          Loading form data...
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

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
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
            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
          }}
        >
          <HelpCircle size={28} color="white" />
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
            {question ? 'Edit Question' : 'Create New Question'}
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0',
              fontWeight: '500',
            }}
          >
            Create engaging questions for your students
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
        {/* Course and Type Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
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
                border: `2px solid ${errors.course_id ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '12px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                color: '#374151',
                transition: 'all 0.3s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow =
                  '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.course_id
                  ? '#ef4444'
                  : '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
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
                  gap: '8px',
                  marginTop: '8px',
                  color: '#ef4444',
                  fontSize: '14px',
                }}
              >
                <AlertTriangle size={16} />
                {errors.course_id}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="type"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              Question Type *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                color: '#374151',
                transition: 'all 0.3s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow =
                  '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="fill_blank">Fill in the Blank</option>
            </select>
          </div>
        </div>

        {/* Question Content */}
        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="content"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            Question Content *
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder="Enter your question here..."
            disabled={loading}
            rows={4}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `2px solid ${errors.content ? '#ef4444' : '#e5e7eb'}`,
              borderRadius: '12px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              color: '#374151',
              transition: 'all 0.3s ease',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.content
                ? '#ef4444'
                : '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {errors.content && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '8px',
                color: '#ef4444',
                fontSize: '14px',
              }}
            >
              <AlertTriangle size={16} />
              {errors.content}
            </div>
          )}
        </div>

        {/* Multiple Choice Options */}
        {formData.type === 'multiple_choice' && (
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px',
              }}
            >
              Answer Options *
            </label>
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb',
              }}
            >
              {formData.options.map((option, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                    padding: '12px',
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <input
                    type="radio"
                    name="correct_answer"
                    value={index.toString()}
                    checked={formData.correct_answer === index.toString()}
                    onChange={(e) =>
                      handleInputChange('correct_answer', e.target.value)
                    }
                    disabled={loading}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#3b82f6',
                    }}
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      disabled={loading}
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              {formData.options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, #e5e7eb, #d1d5db)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                  }}
                >
                  <Plus size={16} />
                  Add Option
                </button>
              )}
            </div>
            {errors.options && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '8px',
                  color: '#ef4444',
                  fontSize: '14px',
                }}
              >
                <AlertTriangle size={16} />
                {errors.options}
              </div>
            )}
            {errors.correct_answer && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '8px',
                  color: '#ef4444',
                  fontSize: '14px',
                }}
              >
                <AlertTriangle size={16} />
                {errors.correct_answer}
              </div>
            )}
          </div>
        )}

        {/* Fill in the Blank Answer */}
        {formData.type === 'fill_blank' && (
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="correct_answer"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              Correct Answer *
            </label>
            <input
              type="text"
              id="correct_answer"
              value={formData.correct_answer}
              onChange={(e) =>
                handleInputChange('correct_answer', e.target.value)
              }
              placeholder="Enter the correct answer"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${errors.correct_answer ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '12px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                color: '#374151',
                transition: 'all 0.3s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow =
                  '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.correct_answer
                  ? '#ef4444'
                  : '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {errors.correct_answer && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '8px',
                  color: '#ef4444',
                  fontSize: '14px',
                }}
              >
                <AlertTriangle size={16} />
                {errors.correct_answer}
              </div>
            )}
          </div>
        )}

        {/* Difficulty and Active Status */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
          <div>
            <label
              htmlFor="difficulty"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              Difficulty Level *
            </label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                color: '#374151',
                transition: 'all 0.3s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow =
                  '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                padding: '12px 16px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.3s ease',
              }}
            >
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  handleInputChange('is_active', e.target.checked)
                }
                disabled={loading}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#3b82f6',
                }}
              />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                Question is active
              </span>
            </label>
          </div>
        </div>

        {/* Explanation */}
        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="explanation"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            Explanation (Optional)
          </label>
          <textarea
            id="explanation"
            value={formData.explanation}
            onChange={(e) => handleInputChange('explanation', e.target.value)}
            placeholder="Explain why this is the correct answer..."
            disabled={loading}
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              color: '#374151',
              transition: 'all 0.3s ease',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Tags */}
        <div style={{ marginBottom: '32px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px',
            }}
          >
            Tags
          </label>
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #e5e7eb',
            }}
          >
            {/* Add Tag Input */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow =
                    '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={loading || !newTag.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading || !newTag.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !newTag.trim() ? 0.5 : 1,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (!loading && newTag.trim()) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 25px rgba(59, 130, 246, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Tag size={16} />
                Add Tag
              </button>
            </div>

            {/* Available Tags */}
            {availableTags.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#6b7280',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  Available tags:
                </span>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagSelect(tag)}
                      disabled={loading}
                      style={{
                        padding: '6px 12px',
                        background: formData.tags.includes(tag)
                          ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                          : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                        color: formData.tags.includes(tag)
                          ? 'white'
                          : '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Tags */}
            {formData.tags.length > 0 && (
              <div>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#6b7280',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  Selected tags:
                </span>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                      }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={loading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          transition: 'background-color 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            'rgba(255, 255, 255, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
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
              background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #e5e7eb, #d1d5db)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
              e.currentTarget.style.transform = 'translateY(0)';
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
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform =
                  'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow =
                  '0 8px 25px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            <Save size={16} />
            {question ? 'Update Question' : 'Create Question'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
