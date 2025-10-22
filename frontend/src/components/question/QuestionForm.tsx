import React, { useState, useEffect } from 'react';
import { Question, Course } from '../../types';
import { courseService } from '../../services/courseService';
import { questionService } from '../../services/questionService';
import { useAuth } from '../../contexts/AuthContext';
import TagsInput from '../common/TagsInput';
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
    type: 'multiple_choice' as 'multiple_choice' | 'fill_blank' | 'true_false' | 'essay',
    options: ['', ''], // Start with 2 options like Android
    correctAnswer: '',
    explanation: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    course_id: '',
    tags: [] as string[],
    createdBy: user?.id || '',
    isActive: true, // Always true by default
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
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
        options: question.type === 'multiple_choice' ? (question.options || ['', '', '', '']) : [],
        correctAnswer: question.correctAnswer?.toString() || '',
        explanation: question.explanation || '',
        difficulty: question.difficulty || 'medium',
        course_id: question.course_id || question.courseId || '',
        tags: question.tags || [],
        createdBy: question.createdBy || user?.id || '',
        isActive: question.isActive ?? true,
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

      // Load available tags for all courses
      const tags = await questionService.getAvailableTags();
      setAvailableTags(tags);
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

      const correctIndex = parseInt(formData.correctAnswer);
      if (
        isNaN(correctIndex) ||
        correctIndex < 0 ||
        correctIndex >= formData.options.length
      ) {
        newErrors.correctAnswer = 'Please select a valid correct answer';
      } else if (!formData.options[correctIndex]?.trim()) {
        newErrors.correctAnswer =
          'The selected correct answer option cannot be empty';
      }
    } else if (formData.type === 'fill_blank') {
      if (!formData.correctAnswer.trim()) {
        newErrors.correctAnswer =
          'Correct answer is required for fill-in-the-blank questions';
      }
    } else if (formData.type === 'true_false') {
      if (!formData.correctAnswer || (formData.correctAnswer !== 'true' && formData.correctAnswer !== 'false')) {
        newErrors.correctAnswer = 'Please select True or False';
      }
    } else if (formData.type === 'essay') {
      if (!formData.correctAnswer.trim()) {
        newErrors.correctAnswer = 'Sample answer is required for essay questions';
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
      const submitData: any = {
        content: formData.content,
        type: formData.type,
        correctAnswer:
          formData.type === 'multiple_choice'
            ? parseInt(formData.correctAnswer)
            : formData.type === 'true_false'
              ? formData.correctAnswer === 'true'
              : formData.correctAnswer,
        explanation: formData.explanation,
        difficulty: formData.difficulty,
        course_id: formData.course_id,
        tags: formData.tags,
        createdBy: formData.createdBy,
        isActive: formData.isActive,
        created_at: Date.now(),
      };

      // Always include options field - empty array for non-multiple_choice questions
      if (formData.type === 'multiple_choice') {
        submitData.options = formData.options.filter(opt => opt.trim() !== '');
      } else {
        submitData.options = [];
      }

      // Debug logging for tags
      console.log('QuestionForm - Submitting tags:', formData.tags);
      console.log('QuestionForm - Submit data:', submitData);

      // Only include options for multiple choice questions
      if (formData.type === 'multiple_choice') {
        submitData.options = formData.options.filter((opt) => opt.trim());
      } else {
        // Explicitly exclude options for non-multiple choice questions
        delete submitData.options;
      }

      // Ensure correctAnswer is always a string
      if (typeof submitData.correctAnswer === 'number') {
        submitData.correctAnswer = submitData.correctAnswer.toString();
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting question form:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Reset options when question type changes
      if (field === 'type') {
        if (value === 'multiple_choice') {
          newData.options = ['', '', '', ''];
        } else {
          newData.options = [];
        }
      }

      return newData;
    });

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
      const correctIndex = parseInt(formData.correctAnswer);
      if (correctIndex === index) {
        handleInputChange('correctAnswer', '');
      } else if (correctIndex > index) {
        handleInputChange('correctAnswer', (correctIndex - 1).toString());
      }
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
              htmlFor="courseId"
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
              id="courseId"
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
                e.currentTarget.style.borderColor = errors.courseId
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
              <option value="true_false">True/False</option>
              <option value="essay">Essay</option>
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
                marginBottom: '8px',
              }}
            >
              Các lựa chọn *
            </label>
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '12px',
              fontStyle: 'italic'
            }}>
              💡 Nhập các lựa chọn và chọn radio button "Đúng" bên cạnh đáp án đúng
            </div>
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
                    marginBottom: '8px',
                    padding: '8px',
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  {/* Option label like Android (A., B., C., D.) */}
                  <div
                    style={{
                      minWidth: '24px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#3b82f6',
                      textAlign: 'center',
                    }}
                  >
                    {String.fromCharCode(65 + index)}.
                  </div>

                  {/* Option input */}
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder="Nhập lựa chọn..."
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: 'none',
                      background: 'transparent',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />

                  {/* Radio button for correct answer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: formData.correctAnswer === index.toString() ? '#dbeafe' : '#ffffff',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="radio"
                      name="correctAnswer"
                      value={index.toString()}
                      checked={formData.correctAnswer === index.toString()}
                      onChange={(e) =>
                        handleInputChange('correctAnswer', e.target.value)
                      }
                      disabled={loading}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: '#3b82f6',
                        cursor: 'pointer',
                        margin: '0',
                        padding: '0',
                        border: 'none',
                        outline: 'none',
                      }}
                    />
                    <label style={{
                      fontSize: '12px',
                      color: formData.correctAnswer === index.toString() ? '#1d4ed8' : '#6b7280',
                      fontWeight: '500',
                      cursor: 'pointer',
                      margin: '0',
                      userSelect: 'none'
                    }}>
                      Đúng
                    </label>
                  </div>

                  {/* Remove button */}
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      disabled={loading}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <X size={16} />
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
                    padding: '8px 12px',
                    background: 'transparent',
                    color: '#3b82f6',
                    border: '1px solid #3b82f6',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    alignSelf: 'flex-start',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#3b82f6';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#3b82f6';
                  }}
                >
                  <Plus size={14} />
                  + Thêm lựa chọn
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
            {errors.correctAnswer && (
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
                {errors.correctAnswer}
              </div>
            )}
          </div>
        )}

        {/* Multiple Choice Correct Answer */}
        {formData.type === 'multiple_choice' && (
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="correctAnswer"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              Đáp án đúng *
            </label>
            <input
              type="text"
              id="correctAnswer"
              value={formData.correctAnswer}
              onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
              placeholder="Nhập đáp án đúng..."
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${errors.correctAnswer ? '#ef4444' : '#e5e7eb'}`,
                borderRadius: '12px',
                fontSize: '14px',
                backgroundColor: '#ffffff',
                color: '#374151',
                transition: 'all 0.3s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.correctAnswer ? '#ef4444' : '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {errors.correctAnswer && (
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
                {errors.correctAnswer}
              </div>
            )}
          </div>
        )}

        {/* Fill in the Blank Answer */}
        {formData.type === 'fill_blank' && (
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="correctAnswer"
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
              id="correctAnswer"
              value={formData.correctAnswer}
              onChange={(e) =>
                handleInputChange('correctAnswer', e.target.value)
              }
              placeholder="Enter the correct answer"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${errors.correctAnswer ? '#ef4444' : '#e5e7eb'}`,
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
                e.currentTarget.style.borderColor = errors.correctAnswer
                  ? '#ef4444'
                  : '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {errors.correctAnswer && (
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
                {errors.correctAnswer}
              </div>
            )}
          </div>
        )}

        {/* True/False Answer */}
        {formData.type === 'true_false' && (
          <div style={{ marginBottom: '24px' }}>
            <label
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
            <div style={{ display: 'flex', gap: '16px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '12px 16px',
                  border: `2px solid ${formData.correctAnswer === 'true' ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  backgroundColor: formData.correctAnswer === 'true' ? '#eff6ff' : '#ffffff',
                  transition: 'all 0.3s ease',
                }}
              >
                <input
                  type="radio"
                  name="correctAnswer"
                  value="true"
                  checked={formData.correctAnswer === 'true'}
                  onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                  disabled={loading}
                  style={{ accentColor: '#3b82f6' }}
                />
                <span style={{ fontWeight: '500', color: '#374151' }}>True</span>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '12px 16px',
                  border: `2px solid ${formData.correctAnswer === 'false' ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  backgroundColor: formData.correctAnswer === 'false' ? '#eff6ff' : '#ffffff',
                  transition: 'all 0.3s ease',
                }}
              >
                <input
                  type="radio"
                  name="correctAnswer"
                  value="false"
                  checked={formData.correctAnswer === 'false'}
                  onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                  disabled={loading}
                  style={{ accentColor: '#3b82f6' }}
                />
                <span style={{ fontWeight: '500', color: '#374151' }}>False</span>
              </label>
            </div>
            {errors.correctAnswer && (
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
                {errors.correctAnswer}
              </div>
            )}
          </div>
        )}

        {/* Essay Answer */}
        {formData.type === 'essay' && (
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="correctAnswer"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              Sample Answer *
            </label>
            <textarea
              id="correctAnswer"
              value={formData.correctAnswer}
              onChange={(e) =>
                handleInputChange('correctAnswer', e.target.value)
              }
              placeholder="Enter a sample answer for this essay question"
              disabled={loading}
              rows={4}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${errors.correctAnswer ? '#ef4444' : '#e5e7eb'}`,
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
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.correctAnswer ? '#ef4444' : '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {errors.correctAnswer && (
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
                {errors.correctAnswer}
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

          {/* Active status checkbox removed - all questions are active by default */}
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
          <TagsInput
            tags={formData.tags}
            onChange={(tags) => handleInputChange('tags', tags)}
            placeholder="Add tags..."
            suggestions={availableTags}
            maxTags={10}
            disabled={loading}
          />
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


