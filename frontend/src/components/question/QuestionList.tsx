import React, { useState, useEffect } from 'react';
import { Question, Course } from '../../types';
import { questionService, QuestionFilters } from '../../services/questionService';
import { courseService } from '../../services/courseService';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import ChildFriendlyCard from '../ui/ChildFriendlyCard';
import ChildFriendlyInput from '../ui/ChildFriendlyInput';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import './QuestionList.css';

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
    const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
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
            setFilters(prev => ({ ...prev, courseId: courseFilter }));
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
        if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
            return;
        }

        try {
            setDeletingId(questionId);
            await questionService.deleteQuestion(questionId);
            setQuestions(prev => prev.filter(q => q.id !== questionId));
            onDeleteQuestion?.(questionId);
        } catch (err: any) {
            setError(err.message || 'Failed to delete question');
        } finally {
            setDeletingId(null);
        }
    };

    const handleDuplicateQuestion = async (questionId: string) => {
        try {
            const duplicatedQuestion = await questionService.duplicateQuestion(questionId);
            setQuestions(prev => [duplicatedQuestion, ...prev]);
        } catch (err: any) {
            setError(err.message || 'Failed to duplicate question');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedQuestions.size === 0) return;

        if (!window.confirm(`Are you sure you want to delete ${selectedQuestions.size} questions? This action cannot be undone.`)) {
            return;
        }

        try {
            setBulkLoading(true);
            await questionService.bulkDeleteQuestions(Array.from(selectedQuestions));
            setQuestions(prev => prev.filter(q => !selectedQuestions.has(q.id)));
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
            await questionService.bulkUpdateQuestions(Array.from(selectedQuestions), { is_active: isActive });
            setQuestions(prev => prev.map(q =>
                selectedQuestions.has(q.id) ? { ...q, is_active: isActive } : q
            ));
            setSelectedQuestions(new Set());
        } catch (err: any) {
            setError(err.message || 'Failed to update questions');
        } finally {
            setBulkLoading(false);
        }
    };

    const handleQuestionSelect = (questionId: string, selected: boolean) => {
        setSelectedQuestions(prev => {
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
            setSelectedQuestions(new Set(questions.map(q => q.id)));
        } else {
            setSelectedQuestions(new Set());
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

    if (loading) {
        return (
            <div className="question-list-loading">
                <LoadingSpinner />
                <p>Loading questions...</p>
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
        <div className="question-list-container">
            <div className="question-list-header">
                <div>
                    <h2>Question Bank</h2>
                    <p>Manage your question library</p>
                </div>
                {showActions && onCreateQuestion && (
                    <ChildFriendlyButton
                        variant="primary"
                        onClick={onCreateQuestion}
                    >
                        + Create Question
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
                                value={filters.searchTerm || ''}
                                onChange={(value) => setFilters(prev => ({ ...prev, searchTerm: value }))}
                                placeholder="Search questions..."
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
                            <label>Status</label>
                            <select
                                value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    isActive: e.target.value === '' ? undefined : e.target.value === 'true'
                                }))}
                                className="filter-select"
                            >
                                <option value="">All Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
            </ChildFriendlyCard>

            {/* Bulk Actions */}
            {selectedQuestions.size > 0 && (
                <ChildFriendlyCard className="bulk-actions-card">
                    <div className="bulk-actions">
                        <span className="selection-count">
                            {selectedQuestions.size} question{selectedQuestions.size !== 1 ? 's' : ''} selected
                        </span>
                        <div className="bulk-buttons">
                            <ChildFriendlyButton
                                variant="secondary"
                                onClick={() => handleBulkStatusUpdate(true)}
                                disabled={bulkLoading}
                            >
                                Activate
                            </ChildFriendlyButton>
                            <ChildFriendlyButton
                                variant="secondary"
                                onClick={() => handleBulkStatusUpdate(false)}
                                disabled={bulkLoading}
                            >
                                Deactivate
                            </ChildFriendlyButton>
                            <ChildFriendlyButton
                                variant="danger"
                                onClick={handleBulkDelete}
                                disabled={bulkLoading}
                                loading={bulkLoading}
                            >
                                Delete
                            </ChildFriendlyButton>
                        </div>
                    </div>
                </ChildFriendlyCard>
            )}

            {questions.length === 0 ? (
                <ChildFriendlyCard className="empty-state">
                    <div className="empty-content">
                        <div className="empty-icon">❓</div>
                        <h3>No questions found</h3>
                        <p>
                            {Object.values(filters).some(v => v !== undefined && v !== '')
                                ? 'Try adjusting your filters or create a new question'
                                : 'Create your first question to get started'
                            }
                        </p>
                        {showActions && onCreateQuestion && (
                            <ChildFriendlyButton
                                variant="primary"
                                onClick={onCreateQuestion}
                            >
                                Create First Question
                            </ChildFriendlyButton>
                        )}
                    </div>
                </ChildFriendlyCard>
            ) : (
                <>
                    {/* Select All */}
                    <div className="select-all-row">
                        <label className="select-all-label">
                            <input
                                type="checkbox"
                                checked={selectedQuestions.size === questions.length && questions.length > 0}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                            <span>Select all ({questions.length})</span>
                        </label>
                    </div>

                    <div className="question-grid">
                        {questions.map((question) => (
                            <ChildFriendlyCard key={question.id} className="question-card">
                                <div className="question-header">
                                    <div className="question-select">
                                        <input
                                            type="checkbox"
                                            checked={selectedQuestions.has(question.id)}
                                            onChange={(e) => handleQuestionSelect(question.id, e.target.checked)}
                                        />
                                    </div>

                                    <div className="question-meta">
                                        <span className="question-type">
                                            {getTypeIcon(question.type)} {question.type.replace('_', ' ')}
                                        </span>
                                        <span className={`difficulty-badge ${getDifficultyColor(question.difficulty)}`}>
                                            {question.difficulty}
                                        </span>
                                        <span className={`status-badge ${question.is_active ? 'active' : 'inactive'}`}>
                                            {question.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                <div className="question-content">
                                    <h3 className="question-text">{question.content}</h3>

                                    <div className="question-details">
                                        <div className="detail-item">
                                            <span className="detail-label">📚 Course:</span>
                                            <span className="detail-value">{getCourseName(question.course_id)}</span>
                                        </div>

                                        {question.tags.length > 0 && (
                                            <div className="detail-item">
                                                <span className="detail-label">🏷️ Tags:</span>
                                                <div className="question-tags">
                                                    {question.tags.map((tag) => (
                                                        <span key={tag} className="question-tag">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {question.type === 'multiple_choice' && question.options && (
                                            <div className="detail-item">
                                                <span className="detail-label">Options:</span>
                                                <div className="question-options">
                                                    {question.options.map((option, index) => (
                                                        <div
                                                            key={index}
                                                            className={`option-preview ${index === question.correct_answer ? 'correct' : ''}`}
                                                        >
                                                            {index === question.correct_answer && '✓ '}{option}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {question.type === 'fill_blank' && (
                                            <div className="detail-item">
                                                <span className="detail-label">Answer:</span>
                                                <span className="correct-answer">{question.correct_answer}</span>
                                            </div>
                                        )}

                                        <div className="detail-item">
                                            <span className="detail-label">📅 Created:</span>
                                            <span className="detail-value">
                                                {new Date(question.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {showActions && (
                                        <div className="question-actions">
                                            <ChildFriendlyButton
                                                variant="secondary"
                                                onClick={() => handleDuplicateQuestion(question.id)}
                                            >
                                                Duplicate
                                            </ChildFriendlyButton>
                                            {onEditQuestion && (
                                                <ChildFriendlyButton
                                                    variant="secondary"
                                                    onClick={() => onEditQuestion(question)}
                                                >
                                                    Edit
                                                </ChildFriendlyButton>
                                            )}
                                            {onDeleteQuestion && (
                                                <ChildFriendlyButton
                                                    variant="danger"
                                                    onClick={() => handleDeleteQuestion(question.id)}
                                                    loading={deletingId === question.id}
                                                    disabled={deletingId === question.id}
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
                </>
            )}
        </div>
    );
};

export default QuestionList;