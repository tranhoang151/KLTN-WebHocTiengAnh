import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, Question, Course } from '../../types';
import { exerciseService, QuestionSelectionCriteria } from '../../services/exerciseService';
import { questionService } from '../../services/questionService';
import { courseService } from '../../services/courseService';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import ChildFriendlyInput from '../ui/ChildFriendlyInput';
import ChildFriendlyCard from '../ui/ChildFriendlyCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import './ExerciseBuilder.css';

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
        time_limit: 30,
        difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    });

    const [courses, setCourses] = useState<Course[]>([]);
    const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
    const [draggedQuestion, setDraggedQuestion] = useState<Question | null>(null);
    const [showQuestionBank, setShowQuestionBank] = useState(false);
    const [autoSelectCriteria, setAutoSelectCriteria] = useState<QuestionSelectionCriteria>({
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
                time_limit: exercise.time_limit || 30,
                difficulty: exercise.difficulty || 'medium',
            });
            setSelectedQuestions(exercise.questions || []);
        }
    }, [exercise]);

    useEffect(() => {
        if (formData.course_id) {
            loadQuestionsForCourse(formData.course_id);
            setAutoSelectCriteria(prev => ({ ...prev, courseId: formData.course_id }));
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
            setAvailableQuestions(questions.filter(q => q.is_active));
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

        if (formData.time_limit < 1 || formData.time_limit > 180) {
            newErrors.time_limit = 'Time limit must be between 1 and 180 minutes';
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
            await onSubmit({
                ...formData,
                questions: selectedQuestions,
            });
        } catch (error) {
            console.error('Error submitting exercise:', error);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
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
                excludeQuestionIds: selectedQuestions.map(q => q.id),
            });
            setSelectedQuestions(prev => [...prev, ...questions]);
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
        if (draggedQuestion && !selectedQuestions.find(q => q.id === draggedQuestion.id)) {
            setSelectedQuestions(prev => [...prev, draggedQuestion]);
        }
        setDraggedQuestion(null);
    };

    const handleDropToAvailable = (e: React.DragEvent) => {
        e.preventDefault();
        if (draggedQuestion) {
            setSelectedQuestions(prev => prev.filter(q => q.id !== draggedQuestion.id));
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
        setSelectedQuestions(prev => prev.filter(q => q.id !== questionId));
    };

    const addQuestion = (question: Question) => {
        if (!selectedQuestions.find(q => q.id === question.id)) {
            setSelectedQuestions(prev => [...prev, question]);
        }
    };

    if (loadingData) {
        return (
            <div className="exercise-builder-loading">
                <LoadingSpinner />
                <p>Loading exercise builder...</p>
            </div>
        );
    }

    return (
        <div className="exercise-builder-container">
            <div className="exercise-builder-header">
                <h2>{exercise ? 'Edit Exercise' : 'Create New Exercise'}</h2>
                <p>Build engaging exercises for your students</p>
            </div>

            <form onSubmit={handleSubmit} className="exercise-builder-form">
                <div className="form-section">
                    <h3>Exercise Details</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="title">Exercise Title *</label>
                            <ChildFriendlyInput
                                type="text"
                                value={formData.title}
                                onChange={(value) => handleInputChange('title', value)}
                                placeholder="Enter exercise title"
                                error={errors.title}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="course_id">Course *</label>
                            <select
                                id="course_id"
                                value={formData.course_id}
                                onChange={(e) => handleInputChange('course_id', e.target.value)}
                                className={`exercise-select ${errors.course_id ? 'error' : ''}`}
                                disabled={loading}
                            >
                                <option value="">Select a course</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.name}
                                    </option>
                                ))}
                            </select>
                            {errors.course_id && (
                                <span className="error-message">{errors.course_id}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="difficulty">Difficulty Level *</label>
                            <select
                                id="difficulty"
                                value={formData.difficulty}
                                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                                className="exercise-select"
                                disabled={loading}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="time_limit">Time Limit (minutes) *</label>
                            <ChildFriendlyInput
                                type="number"
                                value={formData.time_limit.toString()}
                                onChange={(value) => handleInputChange('time_limit', parseInt(value) || 0)}
                                placeholder="30"
                                error={errors.time_limit}
                                disabled={loading}

                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <div className="section-header">
                        <h3>Question Selection</h3>
                        <div className="section-actions">
                            <ChildFriendlyButton
                                type="button"
                                variant="secondary"
                                onClick={() => setShowQuestionBank(!showQuestionBank)}
                                disabled={!formData.course_id}
                            >
                                {showQuestionBank ? 'Hide' : 'Show'} Question Bank
                            </ChildFriendlyButton>
                            <ChildFriendlyButton
                                type="button"
                                variant="secondary"
                                onClick={handlePreviewExercise}
                                disabled={selectedQuestions.length === 0}
                            >
                                Preview Exercise
                            </ChildFriendlyButton>
                        </div>
                    </div>

                    {/* Auto Selection */}
                    <ChildFriendlyCard className="auto-select-card">
                        <h4>Auto-Select Questions</h4>
                        <div className="auto-select-controls">
                            <div className="auto-select-row">
                                <div className="form-group">
                                    <label>Count</label>
                                    <ChildFriendlyInput
                                        type="number"
                                        value={autoSelectCriteria.count.toString()}
                                        onChange={(value) => setAutoSelectCriteria(prev => ({
                                            ...prev,
                                            count: parseInt(value) || 1
                                        }))}

                                    />
                                </div>

                                <div className="form-group">
                                    <label>Difficulty</label>
                                    <select
                                        value={autoSelectCriteria.difficulty || ''}
                                        onChange={(e) => setAutoSelectCriteria(prev => ({
                                            ...prev,
                                            difficulty: e.target.value as any || undefined
                                        }))}
                                        className="auto-select-select"
                                    >
                                        <option value="">Any Difficulty</option>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Type</label>
                                    <select
                                        value={autoSelectCriteria.type || ''}
                                        onChange={(e) => setAutoSelectCriteria(prev => ({
                                            ...prev,
                                            type: e.target.value as any || undefined
                                        }))}
                                        className="auto-select-select"
                                    >
                                        <option value="">Any Type</option>
                                        <option value="multiple_choice">Multiple Choice</option>
                                        <option value="fill_blank">Fill in the Blank</option>
                                    </select>
                                </div>

                                <ChildFriendlyButton
                                    type="button"
                                    variant="primary"
                                    onClick={handleAutoSelectQuestions}
                                    disabled={!formData.course_id || loadingQuestions}
                                    loading={loadingQuestions}
                                >
                                    Auto-Select
                                </ChildFriendlyButton>
                            </div>
                        </div>
                    </ChildFriendlyCard>

                    {/* Drag and Drop Interface */}
                    <div className="question-selection-area">
                        {showQuestionBank && (
                            <div className="question-bank">
                                <h4>Available Questions ({availableQuestions.length})</h4>
                                <div
                                    className="question-list available-questions"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDropToAvailable}
                                >
                                    {loadingQuestions ? (
                                        <div className="loading-questions">
                                            <LoadingSpinner />
                                            <p>Loading questions...</p>
                                        </div>
                                    ) : (
                                        availableQuestions
                                            .filter(q => !selectedQuestions.find(sq => sq.id === q.id))
                                            .map((question) => (
                                                <div
                                                    key={question.id}
                                                    className="question-item draggable"
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, question)}
                                                    onClick={() => addQuestion(question)}
                                                >
                                                    <div className="question-content">
                                                        <span className="question-type">
                                                            {question.type === 'multiple_choice' ? '☑️' : '✏️'}
                                                        </span>
                                                        <span className="question-text">{question.content}</span>
                                                        <span className={`difficulty-badge ${question.difficulty}`}>
                                                            {question.difficulty}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="selected-questions">
                            <h4>Selected Questions ({selectedQuestions.length})</h4>
                            <div
                                className="question-list selected-questions-list"
                                onDragOver={handleDragOver}
                                onDrop={handleDropToSelected}
                            >
                                {selectedQuestions.map((question, index) => (
                                    <div
                                        key={question.id}
                                        className="question-item selected draggable"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, question)}
                                    >
                                        <div className="question-order">{index + 1}</div>
                                        <div className="question-content">
                                            <span className="question-type">
                                                {question.type === 'multiple_choice' ? '☑️' : '✏️'}
                                            </span>
                                            <span className="question-text">{question.content}</span>
                                            <span className={`difficulty-badge ${question.difficulty}`}>
                                                {question.difficulty}
                                            </span>
                                        </div>
                                        <div className="question-actions">
                                            <button
                                                type="button"
                                                className="move-up"
                                                onClick={() => index > 0 && handleQuestionReorder(index, index - 1)}
                                                disabled={index === 0}
                                            >
                                                ↑
                                            </button>
                                            <button
                                                type="button"
                                                className="move-down"
                                                onClick={() => index < selectedQuestions.length - 1 && handleQuestionReorder(index, index + 1)}
                                                disabled={index === selectedQuestions.length - 1}
                                            >
                                                ↓
                                            </button>
                                            <button
                                                type="button"
                                                className="remove-question"
                                                onClick={() => removeQuestion(question.id)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {selectedQuestions.length === 0 && (
                                    <div className="empty-selection">
                                        <p>Drag questions here or use auto-select to add questions</p>
                                    </div>
                                )}
                            </div>
                            {errors.questions && (
                                <span className="error-message">{errors.questions}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Preview Results */}
                {previewData && (
                    <ChildFriendlyCard className="preview-results">
                        <h4>Exercise Preview</h4>
                        <div className={`preview-status ${previewData.isValid ? 'valid' : 'invalid'}`}>
                            <span className="status-icon">
                                {previewData.isValid ? '✅' : '⚠️'}
                            </span>
                            <span>
                                {previewData.isValid ? 'Exercise is ready to publish' : 'Exercise needs attention'}
                            </span>
                        </div>

                        {previewData.warnings.length > 0 && (
                            <div className="preview-warnings">
                                <h5>Warnings:</h5>
                                <ul>
                                    {previewData.warnings.map((warning, index) => (
                                        <li key={index}>{warning}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {previewData.suggestions.length > 0 && (
                            <div className="preview-suggestions">
                                <h5>Suggestions:</h5>
                                <ul>
                                    {previewData.suggestions.map((suggestion, index) => (
                                        <li key={index}>{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </ChildFriendlyCard>
                )}

                <div className="form-actions">
                    <ChildFriendlyButton
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </ChildFriendlyButton>
                    <ChildFriendlyButton
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        loading={loading}
                    >
                        {exercise ? 'Update Exercise' : 'Create Exercise'}
                    </ChildFriendlyButton>
                </div>
            </form>
        </div>
    );
};

export default ExerciseBuilder;