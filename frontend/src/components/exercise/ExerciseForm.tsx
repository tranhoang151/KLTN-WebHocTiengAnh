import React, { useState, useEffect } from 'react';
import { Exercise, Course, Question } from '../../types';
import { courseService } from '../../services/courseService';
import { questionService } from '../../services/questionService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import QuestionPickerDialog from './QuestionPickerDialog';
import {
    BookOpen,
    Clock,
    HelpCircle,
    X,
    Plus,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';

interface ExerciseFormProps {
    exercise?: Exercise;
    onSubmit: (exerciseData: Omit<Exercise, 'id'>) => void;
    onCancel: () => void;
    loading?: boolean;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({
    exercise,
    onSubmit,
    onCancel,
    loading = false,
}) => {
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
    const [showQuestionPicker, setShowQuestionPicker] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        type: 'multiple_choice' as 'multiple_choice' | 'fill_blank',
        course_id: '',
        questions: [] as Question[],
        totalPoints: 0, // Use camelCase for backend
        created_by: user?.id || '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (exercise) {
            setFormData({
                title: exercise.title,
                type: exercise.type,
                course_id: exercise.course_id,
                questions: exercise.questions || [],
                totalPoints: exercise.total_points || exercise.totalPoints || 0,
                created_by: exercise.created_by || user?.id || '',
            });
        }
    }, [exercise, user]);

    const loadData = async () => {
        try {
            setLoadingData(true);
            setError(null);

            const [coursesData, questionsData] = await Promise.all([
                courseService.getAllCourses(),
                questionService.getAllQuestions(),
            ]);

            setCourses(coursesData);
            setAvailableQuestions(questionsData);
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setLoadingData(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleQuestionSelect = (selectedQuestions: Question[]) => {
        setFormData((prev) => ({
            ...prev,
            questions: selectedQuestions,
            totalPoints: selectedQuestions.length * 10, // 10 points per question
        }));
        setShowQuestionPicker(false);
    };

    const handleRemoveQuestion = (questionId: string) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions.filter((q) => q.id !== questionId),
            totalPoints: (prev.questions.length - 1) * 10,
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.course_id) {
            newErrors.course_id = 'Course is required';
        }

        if (formData.questions.length === 0) {
            newErrors.questions = 'At least one question is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Backend will calculate totalPoints automatically based on questions count
        const submitData = {
            ...formData,
        };
        // Remove totalPoints from submission - backend calculates it
        delete submitData.totalPoints;

        // Clean up questions data - remove null/undefined fields
        submitData.questions = submitData.questions.map(question => {
            const cleanedQuestion = { ...question };
            // Remove null/undefined fields
            Object.keys(cleanedQuestion).forEach(key => {
                if (cleanedQuestion[key] === null || cleanedQuestion[key] === undefined) {
                    delete cleanedQuestion[key];
                }
            });
            // Ensure question_text is set to content if not present
            if (cleanedQuestion.content && !cleanedQuestion.question_text) {
                cleanedQuestion.question_text = cleanedQuestion.content;
            }
            return cleanedQuestion;
        });

        console.log('Submitting exercise with:', submitData);
        onSubmit(submitData);
    };

    const getCourseName = (courseId: string) => {
        const course = courses.find((c) => c.id === courseId);
        return course?.name || 'Unknown Course';
    };

    const getQuestionTypeIcon = (type: string) => {
        switch (type) {
            case 'multiple_choice':
                return <HelpCircle size={16} color="#6b7280" />;
            case 'fill_blank':
                return <BookOpen size={16} color="#6b7280" />;
            case 'true_false':
                return <CheckCircle size={16} color="#6b7280" />;
            case 'essay':
                return <BookOpen size={16} color="#6b7280" />;
            default:
                return <BookOpen size={16} color="#6b7280" />;
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
                    Loading form data...
                </p>
            </div>
        );
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={loadData} />;
    }

    return (
        <div
            style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                padding: '32px',
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

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '32px',
                    }}
                >
                    <div>
                        <h2
                            style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                color: '#1f2937',
                                margin: '0 0 8px 0',
                            }}
                        >
                            {exercise ? 'Edit Exercise' : 'Create Exercise'}
                        </h2>
                        <p
                            style={{
                                fontSize: '16px',
                                color: '#6b7280',
                                margin: 0,
                            }}
                        >
                            {exercise
                                ? 'Update exercise details and questions'
                                : 'Create a new exercise with questions'}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e5e7eb';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f3f4f6';
                        }}
                    >
                        <X size={20} color="#6b7280" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Basic Information - Giống Android App */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px',
                            marginBottom: '24px',
                        }}
                    >
                        {/* Title */}
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
                                Exercise Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Enter exercise title"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: `2px solid ${errors.title ? '#ef4444' : '#e5e7eb'}`,
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    backgroundColor: '#ffffff',
                                    transition: 'all 0.2s ease',
                                    outline: 'none',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = errors.title ? '#ef4444' : '#e5e7eb';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            {errors.title && (
                                <p
                                    style={{
                                        color: '#ef4444',
                                        fontSize: '12px',
                                        margin: '4px 0 0 0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    <AlertCircle size={12} />
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Type (Kind) */}
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
                                Exercise Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) =>
                                    handleInputChange('type', e.target.value as 'multiple_choice' | 'fill_blank')
                                }
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: '2px solid #e5e7eb',
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
                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="fill_blank">Fill in the Blank</option>
                            </select>
                        </div>

                        {/* Course */}
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
                                Course *
                            </label>
                            <select
                                value={formData.course_id}
                                onChange={(e) => handleInputChange('course_id', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: `2px solid ${errors.course_id ? '#ef4444' : '#e5e7eb'}`,
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
                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = errors.course_id ? '#ef4444' : '#e5e7eb';
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
                                <p
                                    style={{
                                        color: '#ef4444',
                                        fontSize: '12px',
                                        margin: '4px 0 0 0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    <AlertCircle size={12} />
                                    {errors.course_id}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '16px',
                            }}
                        >
                            <label
                                style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#374151',
                                }}
                            >
                                Questions ({formData.questions.length}) *
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowQuestionPicker(true)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Plus size={16} />
                                Add Questions
                            </button>
                        </div>

                        {errors.questions && (
                            <p
                                style={{
                                    color: '#ef4444',
                                    fontSize: '12px',
                                    margin: '0 0 12px 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                <AlertCircle size={12} />
                                {errors.questions}
                            </p>
                        )}

                        {formData.questions.length === 0 ? (
                            <div
                                style={{
                                    background: '#f9fafb',
                                    border: '2px dashed #d1d5db',
                                    borderRadius: '12px',
                                    padding: '32px',
                                    textAlign: 'center',
                                }}
                            >
                                <HelpCircle size={32} color="#9ca3af" />
                                <p
                                    style={{
                                        color: '#6b7280',
                                        fontSize: '14px',
                                        margin: '12px 0 0 0',
                                    }}
                                >
                                    No questions selected. Click "Add Questions" to get started.
                                </p>
                            </div>
                        ) : (
                            <div
                                style={{
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    border: '1px solid #e5e7eb',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px',
                                    }}
                                >
                                    {formData.questions.map((question, index) => (
                                        <div
                                            key={question.id}
                                            style={{
                                                background: '#ffffff',
                                                borderRadius: '8px',
                                                padding: '16px',
                                                border: '1px solid #e5e7eb',
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
                                                    flex: 1,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        color: '#3b82f6',
                                                        fontWeight: '600',
                                                        fontSize: '14px',
                                                        minWidth: '24px',
                                                    }}
                                                >
                                                    {index + 1}.
                                                </span>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                    }}
                                                >
                                                    {getQuestionTypeIcon(question.type)}
                                                    <span
                                                        style={{
                                                            fontSize: '14px',
                                                            color: '#6b7280',
                                                            textTransform: 'capitalize',
                                                        }}
                                                    >
                                                        {question.type ? question.type.replace('_', ' ') : 'Unknown'}
                                                    </span>
                                                </div>
                                                <span
                                                    style={{
                                                        fontSize: '14px',
                                                        color: '#1f2937',
                                                        flex: 1,
                                                        lineHeight: '1.4',
                                                    }}
                                                >
                                                    {question.content || 'No content available'}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveQuestion(question.id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '32px',
                                                    height: '32px',
                                                    background: '#fef2f2',
                                                    border: '1px solid #fecaca',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = '#fee2e2';
                                                    e.currentTarget.style.borderColor = '#fca5a5';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = '#fef2f2';
                                                    e.currentTarget.style.borderColor = '#fecaca';
                                                }}
                                            >
                                                <X size={16} color="#dc2626" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '12px',
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
                                padding: '12px 24px',
                                background: '#f3f4f6',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.background = '#e5e7eb';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.background = '#f3f4f6';
                                }
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
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
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <LoadingSpinner />
                                    {exercise ? 'Updating...' : 'Creating...'}
                                </div>
                            ) : (
                                exercise ? 'Update Exercise' : 'Create Exercise'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Question Picker Dialog */}
            {showQuestionPicker && (
                <QuestionPickerDialog
                    availableQuestions={availableQuestions}
                    selectedQuestions={formData.questions}
                    onSelect={handleQuestionSelect}
                    onClose={() => setShowQuestionPicker(false)}
                />
            )}
        </div>
    );
};

export default ExerciseForm;


