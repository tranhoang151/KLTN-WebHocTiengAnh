import React from 'react';
import { Question, Course } from '../../types';
import {
    X,
    HelpCircle,
    CheckCircle,
    Edit,
    FileText,
    XCircle,
    BookOpen,
    Tag,
    Calendar,
    User,
    AlertTriangle,
    Copy,
} from 'lucide-react';

interface QuestionDetailDialogProps {
    question: Question | null;
    course: Course | null;
    onClose: () => void;
    onEdit?: (question: Question) => void;
    onDuplicate?: (question: Question) => void;
}

const QuestionDetailDialog: React.FC<QuestionDetailDialogProps> = ({
    question,
    course,
    onClose,
    onEdit,
    onDuplicate,
}) => {
    if (!question) return null;

    // Debug: Log question data
    console.log('QuestionDetailDialog - Question data:', question);
    console.log('QuestionDetailDialog - Course data:', course);
    // Handle correct answer - now should work with proper backend mapping
    const correctAnswer = question.correctAnswer;

    console.log('QuestionDetailDialog - Correct answer:', correctAnswer, 'Type:', typeof correctAnswer);
    console.log('QuestionDetailDialog - All possible answer fields:', {
        correctAnswer: question.correctAnswer,
        answer: (question as any).answer
    });
    // Handle created by - now should work with proper backend mapping
    const createdBy = question.createdBy;
    const displaycreatedBy = createdBy || 'Unknown';

    // Handle created at - now should work with proper backend mapping
    const createdAt = question.createdAt;
    const displaycreatedAt = createdAt || 'Unknown';

    console.log('QuestionDetailDialog - Created by:', createdBy, 'Display:', displaycreatedBy);
    console.log('QuestionDetailDialog - Created at:', createdAt, 'Display:', displaycreatedAt);
    console.log('QuestionDetailDialog - All question keys:', Object.keys(question));
    console.log('QuestionDetailDialog - Question type:', question.type);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'multiple_choice':
                return <CheckCircle size={20} color="#3b82f6" />;
            case 'fill_blank':
                return <Edit size={20} color="#8b5cf6" />;
            case 'true_false':
                return <XCircle size={20} color="#f59e0b" />;
            case 'essay':
                return <FileText size={20} color="#10b981" />;
            default:
                return <HelpCircle size={20} color="#6b7280" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'multiple_choice':
                return 'Multiple Choice';
            case 'fill_blank':
                return 'Fill in the Blank';
            case 'true_false':
                return 'True/False';
            case 'essay':
                return 'Essay';
            default:
                return type.replace('_', ' ');
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return { bg: '#d1fae5', color: '#065f46', border: '#10b981' };
            case 'medium':
                return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' };
            case 'hard':
                return { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' };
            default:
                return { bg: '#f3f4f6', color: '#374151', border: '#d1d5db' };
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp || timestamp === 'Unknown') return 'Unknown';

        try {
            // Handle Firebase Timestamp objects
            if (timestamp && typeof timestamp === 'object') {
                if (timestamp.seconds) {
                    const date = new Date(timestamp.seconds * 1000);
                    return date.toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                } else if (timestamp._seconds) {
                    const date = new Date(timestamp._seconds * 1000);
                    return date.toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    });
                }
            }

            // Handle numeric timestamps
            if (typeof timestamp === 'number') {
                const date = timestamp > 1000000000000
                    ? new Date(timestamp)
                    : new Date(timestamp * 1000);
                return date.toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });
            }

            return 'Unknown';
        } catch (error) {
            console.error('Date formatting error:', error, 'Timestamp:', timestamp);
            return 'Unknown';
        }
    };

    const difficultyStyle = getDifficultyColor(question.difficulty);

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    maxWidth: '800px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '24px 32px',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {getTypeIcon(question.type)}
                        <div>
                            <h2
                                style={{
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: '#1f2937',
                                    margin: '0 0 4px 0',
                                }}
                            >
                                Question Details
                            </h2>
                            <p
                                style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    margin: 0,
                                }}
                            >
                                {getTypeLabel(question.type)} • {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {onEdit && (
                            <button
                                onClick={() => onEdit(question)}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#2563eb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#3b82f6';
                                }}
                            >
                                <Edit size={16} />
                                Edit
                            </button>
                        )}
                        {onDuplicate && (
                            <button
                                onClick={() => onDuplicate(question)}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#059669';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#10b981';
                                }}
                            >
                                <Copy size={16} />
                                Duplicate
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            style={{
                                padding: '8px',
                                backgroundColor: '#f3f4f6',
                                color: '#6b7280',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#e5e7eb';
                                e.currentTarget.style.color = '#374151';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                                e.currentTarget.style.color = '#6b7280';
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div
                    style={{
                        padding: '32px',
                        overflowY: 'auto',
                        flex: 1,
                    }}
                >
                    {/* Question Content */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3
                            style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <HelpCircle size={18} color="#3b82f6" />
                            Question Content
                        </h3>
                        <div
                            style={{
                                padding: '20px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                fontSize: '15px',
                                lineHeight: '1.6',
                                color: '#1f2937',
                            }}
                        >
                            {question.content}
                        </div>
                    </div>

                    {/* Answer Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <h3
                            style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <CheckCircle size={18} color="#10b981" />
                            {question.type === 'essay' ? 'Sample Answer' : 'Correct Answer'}
                        </h3>

                        {question.type === 'multiple_choice' && question.options && (
                            <div>
                                <div
                                    style={{
                                        padding: '16px',
                                        backgroundColor: '#f0fdf4',
                                        borderRadius: '12px',
                                        border: '1px solid #22c55e',
                                        marginBottom: '12px',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#166534',
                                            marginBottom: '8px',
                                        }}
                                    >
                                        Selected Answer:
                                    </div>
                                    <div
                                        style={{
                                            padding: '8px 12px',
                                            backgroundColor: '#ffffff',
                                            borderRadius: '8px',
                                            border: '2px solid #22c55e',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            color: '#166534',
                                        }}
                                    >
                                        {question.options[((question as any).correctAnswer || correctAnswer) as number]}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px',
                                    }}
                                >
                                    All Options:
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {question.options.map((option, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                padding: '12px 16px',
                                                backgroundColor: index === correctAnswer ? '#eff6ff' : '#f9fafb',
                                                borderRadius: '8px',
                                                border: `2px solid ${index === correctAnswer ? '#3b82f6' : '#e5e7eb'}`,
                                                fontSize: '14px',
                                                color: index === correctAnswer ? '#1e40af' : '#374151',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    backgroundColor: index === correctAnswer ? '#3b82f6' : '#d1d5db',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                }}
                                            >
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                            {option}
                                            {index === correctAnswer && (
                                                <CheckCircle size={16} color="#3b82f6" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {question.type === 'fill_blank' && (
                            <div
                                style={{
                                    padding: '16px',
                                    backgroundColor: '#f0fdf4',
                                    borderRadius: '12px',
                                    border: '1px solid #22c55e',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#166534',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Correct Answer:
                                </div>
                                <div
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: '#ffffff',
                                        borderRadius: '8px',
                                        border: '2px solid #22c55e',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#166534',
                                    }}
                                >
                                    {correctAnswer}
                                </div>
                            </div>
                        )}

                        {question.type === 'true_false' && (
                            <div
                                style={{
                                    padding: '16px',
                                    backgroundColor: correctAnswer
                                        ? '#f0fdf4'
                                        : '#fef2f2',
                                    borderRadius: '12px',
                                    border: `1px solid ${correctAnswer ? '#22c55e' : '#ef4444'}`,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: correctAnswer ? '#166534' : '#991b1b',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Correct Answer:
                                </div>
                                <div
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: '#ffffff',
                                        borderRadius: '8px',
                                        border: `2px solid ${correctAnswer ? '#22c55e' : '#ef4444'}`,
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: correctAnswer ? '#166534' : '#991b1b',
                                        display: 'inline-block',
                                    }}
                                >
                                    {correctAnswer === true || correctAnswer === 'true' ? 'True' : 'False'}
                                </div>
                            </div>
                        )}

                        {question.type === 'essay' && (
                            <div
                                style={{
                                    padding: '16px',
                                    backgroundColor: '#f0fdf4',
                                    borderRadius: '12px',
                                    border: '1px solid #22c55e',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#166534',
                                        marginBottom: '8px',
                                    }}
                                >
                                    Sample Answer:
                                </div>
                                <div
                                    style={{
                                        padding: '12px',
                                        backgroundColor: '#ffffff',
                                        borderRadius: '8px',
                                        border: '2px solid #22c55e',
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        color: '#166534',
                                        whiteSpace: 'pre-wrap',
                                    }}
                                >
                                    {correctAnswer}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Explanation */}
                    {question.explanation && (
                        <div style={{ marginBottom: '32px' }}>
                            <h3
                                style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <AlertTriangle size={18} color="#f59e0b" />
                                Explanation
                            </h3>
                            <div
                                style={{
                                    padding: '16px',
                                    backgroundColor: '#fffbeb',
                                    borderRadius: '12px',
                                    border: '1px solid #f59e0b',
                                    fontSize: '14px',
                                    lineHeight: '1.6',
                                    color: '#92400e',
                                }}
                            >
                                {question.explanation}
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '20px',
                        }}
                    >
                        {/* Course */}
                        <div>
                            <h4
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <BookOpen size={16} color="#3b82f6" />
                                Course
                            </h4>
                            <div
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#eff6ff',
                                    borderRadius: '8px',
                                    border: '1px solid #3b82f6',
                                    fontSize: '14px',
                                    color: '#1e40af',
                                }}
                            >
                                {course?.name || `Course ID: ${question.course_id || question.courseId || 'null'}`}
                            </div>
                        </div>

                        {/* Difficulty */}
                        <div>
                            <h4
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <AlertTriangle size={16} color="#f59e0b" />
                                Difficulty
                            </h4>
                            <div
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: difficultyStyle.bg,
                                    borderRadius: '8px',
                                    border: `1px solid ${difficultyStyle.border}`,
                                    fontSize: '14px',
                                    color: difficultyStyle.color,
                                    fontWeight: '500',
                                    textTransform: 'capitalize',
                                }}
                            >
                                {question.difficulty}
                            </div>
                        </div>

                        {/* Created Date and Created By hidden as requested */}
                    </div>

                    {/* Tags */}
                    {question.tags && question.tags.length > 0 && (
                        <div style={{ marginTop: '24px' }}>
                            <h4
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                <Tag size={16} color="#8b5cf6" />
                                Tags
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {question.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#f3e8ff',
                                            color: '#7c3aed',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            border: '1px solid #c4b5fd',
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestionDetailDialog;


