import React, { useState, useEffect } from 'react';
import { Question, Course } from '../../types';
import { courseService } from '../../services/courseService';
import {
    Search,
    X,
    CheckCircle,
    HelpCircle,
    BookOpen,
    FileText,
    Check,
} from 'lucide-react';

interface QuestionPickerDialogProps {
    availableQuestions: Question[];
    selectedQuestions: Question[];
    onSelect: (questions: Question[]) => void;
    onClose: () => void;
}

const QuestionPickerDialog: React.FC<QuestionPickerDialogProps> = ({
    availableQuestions,
    selectedQuestions,
    onSelect,
    onClose,
}) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [courseFilter, setCourseFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(
        new Set(selectedQuestions.map((q) => q.id))
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        filterQuestions();
    }, [availableQuestions, searchTerm, courseFilter, typeFilter, tagFilter]);

    useEffect(() => {
        setSelectedQuestionIds(new Set(selectedQuestions.map((q) => q.id)));
    }, [selectedQuestions]);

    const loadCourses = async () => {
        try {
            const coursesData = await courseService.getAllCourses();
            setCourses(coursesData);
        } catch (error) {
            console.error('Failed to load courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterQuestions = () => {
        let filtered = availableQuestions;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter((q) =>
                q.content.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Course filter
        if (courseFilter) {
            filtered = filtered.filter((q) => (q.course_id || q.courseId) === courseFilter);
        }

        // Type filter
        if (typeFilter) {
            filtered = filtered.filter((q) => q.type === typeFilter);
        }

        // Tag filter
        if (tagFilter) {
            filtered = filtered.filter((q) =>
                q.tags.some((tag) => tag.toLowerCase().includes(tagFilter.toLowerCase()))
            );
        }

        setFilteredQuestions(filtered);
    };

    const handleQuestionToggle = (questionId: string) => {
        const newSelected = new Set(selectedQuestionIds);
        if (newSelected.has(questionId)) {
            newSelected.delete(questionId);
        } else {
            newSelected.add(questionId);
        }
        setSelectedQuestionIds(newSelected);
    };

    const handleSelectAll = () => {
        const allIds = new Set(filteredQuestions.map((q) => q.id));
        setSelectedQuestionIds(allIds);
    };

    const handleDeselectAll = () => {
        setSelectedQuestionIds(new Set());
    };

    const handleConfirm = () => {
        const selectedQuestions = availableQuestions.filter((q) =>
            selectedQuestionIds.has(q.id)
        );
        onSelect(selectedQuestions);
    };

    const getCourseName = (courseId: string | undefined) => {
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
                return <FileText size={16} color="#6b7280" />;
            default:
                return <BookOpen size={16} color="#6b7280" />;
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        if (!difficulty) return '#6b7280';
        switch (difficulty) {
            case 'easy':
                return '#10b981';
            case 'medium':
                return '#f59e0b';
            case 'hard':
                return '#ef4444';
            default:
                return '#6b7280';
        }
    };

    const getUniqueTags = () => {
        const allTags = availableQuestions.flatMap((q) => q.tags || []);
        return Array.from(new Set(allTags)).sort();
    };

    const getUniqueTypes = () => {
        const allTypes = availableQuestions.map((q) => q.type).filter(Boolean);
        return Array.from(new Set(allTypes)).sort();
    };

    if (loading) {
        return (
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }}
            >
                <div
                    style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        textAlign: 'center',
                    }}
                >
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #f3f4f6',
                            borderTop: '4px solid #3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 16px',
                        }}
                    ></div>
                    <p style={{ color: '#6b7280', margin: 0 }}>Loading questions...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
            }}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '800px',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: '24px 24px 0 24px',
                        borderBottom: '1px solid #e5e7eb',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '20px',
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    color: '#1f2937',
                                    margin: '0 0 4px 0',
                                }}
                            >
                                Select Questions
                            </h2>
                            <p
                                style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    margin: 0,
                                }}
                            >
                                Choose questions to add to your exercise
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
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

                    {/* Filters */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '16px',
                            marginBottom: '20px',
                        }}
                    >
                        {/* Search */}
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
                                Search
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Search
                                    size={16}
                                    color="#9ca3af"
                                    style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                    }}
                                />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search questions..."
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px 8px 36px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Course Filter */}
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
                                Course
                            </label>
                            <select
                                value={courseFilter}
                                onChange={(e) => setCourseFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: 'right 8px center',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: '12px',
                                    paddingRight: '28px',
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

                        {/* Type Filter */}
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
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: 'right 8px center',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: '12px',
                                    paddingRight: '28px',
                                }}
                            >
                                <option value="">All Types</option>
                                {getUniqueTypes().map((type) => (
                                    <option key={type} value={type}>
                                        {type ? type.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tag Filter */}
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
                                Tag
                            </label>
                            <select
                                value={tagFilter}
                                onChange={(e) => setTagFilter(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    appearance: 'none',
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundPosition: 'right 8px center',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: '12px',
                                    paddingRight: '28px',
                                }}
                            >
                                <option value="">All Tags</option>
                                {getUniqueTags().map((tag) => (
                                    <option key={tag} value={tag}>
                                        {tag}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    <div
                        style={{
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '16px',
                        }}
                    >
                        <button
                            onClick={handleSelectAll}
                            style={{
                                padding: '6px 12px',
                                background: '#f0fdf4',
                                color: '#16a34a',
                                border: '1px solid #bbf7d0',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#dcfce7';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f0fdf4';
                            }}
                        >
                            Select All
                        </button>
                        <button
                            onClick={handleDeselectAll}
                            style={{
                                padding: '6px 12px',
                                background: '#fef2f2',
                                color: '#dc2626',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#fee2e2';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#fef2f2';
                            }}
                        >
                            Deselect All
                        </button>
                    </div>
                </div>

                {/* Questions List */}
                <div
                    style={{
                        flex: 1,
                        overflow: 'auto',
                        padding: '0 24px',
                    }}
                >
                    {filteredQuestions.length === 0 ? (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                color: '#6b7280',
                            }}
                        >
                            <HelpCircle size={48} color="#d1d5db" />
                            <p style={{ margin: '16px 0 0 0', fontSize: '16px' }}>
                                No questions found
                            </p>
                            <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                                Try adjusting your search or filters
                            </p>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                padding: '16px 0',
                            }}
                        >
                            {filteredQuestions.map((question) => {
                                const isSelected = selectedQuestionIds.has(question.id);
                                return (
                                    <div
                                        key={question.id}
                                        onClick={() => handleQuestionToggle(question.id)}
                                        style={{
                                            background: isSelected ? '#eff6ff' : '#ffffff',
                                            border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
                                            borderRadius: '12px',
                                            padding: '16px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                                e.currentTarget.style.background = '#f9fafb';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) {
                                                e.currentTarget.style.borderColor = '#e5e7eb';
                                                e.currentTarget.style.background = '#ffffff';
                                            }
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '12px',
                                            }}
                                        >
                                            {/* Checkbox */}
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '20px',
                                                    height: '20px',
                                                    background: isSelected ? '#3b82f6' : '#ffffff',
                                                    border: `2px solid ${isSelected ? '#3b82f6' : '#d1d5db'}`,
                                                    borderRadius: '4px',
                                                    marginTop: '2px',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {isSelected && <Check size={12} color="white" />}
                                            </div>

                                            {/* Question Content */}
                                            <div style={{ flex: 1 }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        marginBottom: '8px',
                                                    }}
                                                >
                                                    {getQuestionTypeIcon(question.type)}
                                                    <span
                                                        style={{
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            color: '#6b7280',
                                                            textTransform: 'uppercase',
                                                        }}
                                                    >
                                                        {question.type ? question.type.replace('_', ' ') : 'Unknown'}
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            color: getDifficultyColor(question.difficulty),
                                                            textTransform: 'capitalize',
                                                        }}
                                                    >
                                                        {question.difficulty || 'Unknown'}
                                                    </span>
                                                </div>

                                                <p
                                                    style={{
                                                        fontSize: '14px',
                                                        color: '#1f2937',
                                                        margin: '0 0 8px 0',
                                                        lineHeight: '1.5',
                                                    }}
                                                >
                                                    {question.content || 'No content available'}
                                                </p>

                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        fontSize: '12px',
                                                        color: '#6b7280',
                                                    }}
                                                >
                                                    <span>Course: {getCourseName(question.course_id || question.courseId)}</span>
                                                    {question.tags && question.tags.length > 0 && (
                                                        <span>Tags: {question.tags.join(', ')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: '20px 24px',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <div
                        style={{
                            fontSize: '14px',
                            color: '#6b7280',
                        }}
                    >
                        {selectedQuestionIds.size} question{selectedQuestionIds.size !== 1 ? 's' : ''} selected
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            gap: '12px',
                        }}
                    >
                        <button
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                background: '#f3f4f6',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
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
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            style={{
                                padding: '10px 20px',
                                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                color: 'white',
                                border: 'none',
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
                            Add Selected ({selectedQuestionIds.size})
                        </button>
                    </div>
                </div>
            </div>

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
};

export default QuestionPickerDialog;


