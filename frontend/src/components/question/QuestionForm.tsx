import React, { useState, useEffect } from 'react';
import { Question, Course } from '../../types';
import { courseService } from '../../services/courseService';
import { questionService } from '../../services/questionService';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import ChildFriendlyInput from '../ui/ChildFriendlyInput';
import ChildFriendlyCard from '../ui/ChildFriendlyCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import './QuestionForm.css';

interface QuestionFormProps {
    question?: Question | null;
    onSubmit: (questionData: Omit<Question, 'id' | 'created_at'>) => Promise<void>;
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
            const validOptions = formData.options.filter(opt => opt.trim());
            if (validOptions.length < 2) {
                newErrors.options = 'At least 2 options are required for multiple choice questions';
            }

            const correctIndex = parseInt(formData.correct_answer);
            if (isNaN(correctIndex) || correctIndex < 0 || correctIndex >= formData.options.length) {
                newErrors.correct_answer = 'Please select a valid correct answer';
            } else if (!formData.options[correctIndex]?.trim()) {
                newErrors.correct_answer = 'The selected correct answer option cannot be empty';
            }
        } else if (formData.type === 'fill_blank') {
            if (!formData.correct_answer.trim()) {
                newErrors.correct_answer = 'Correct answer is required for fill-in-the-blank questions';
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
                correct_answer: formData.type === 'multiple_choice'
                    ? parseInt(formData.correct_answer)
                    : formData.correct_answer,
                options: formData.type === 'multiple_choice'
                    ? formData.options.filter(opt => opt.trim())
                    : undefined,
            };

            await onSubmit(submitData);
        } catch (error) {
            console.error('Error submitting question form:', error);
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
        handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
    };

    const handleTagSelect = (tag: string) => {
        if (!formData.tags.includes(tag)) {
            handleInputChange('tags', [...formData.tags, tag]);
        }
    };

    if (loadingData) {
        return (
            <div className="question-form-loading">
                <LoadingSpinner />
                <p>Loading form data...</p>
            </div>
        );
    }

    return (
        <ChildFriendlyCard className="question-form-container">
            <div className="question-form-header">
                <h2>{question ? 'Edit Question' : 'Create New Question'}</h2>
                <p>Create engaging questions for your students</p>
            </div>

            <form onSubmit={handleSubmit} className="question-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="course_id">Course *</label>
                        <select
                            id="course_id"
                            value={formData.course_id}
                            onChange={(e) => handleInputChange('course_id', e.target.value)}
                            className={`question-select ${errors.course_id ? 'error' : ''}`}
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

                    <div className="form-group">
                        <label htmlFor="type">Question Type *</label>
                        <select
                            id="type"
                            value={formData.type}
                            onChange={(e) => handleInputChange('type', e.target.value)}
                            className="question-select"
                            disabled={loading}
                        >
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="fill_blank">Fill in the Blank</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="content">Question Content *</label>
                    <textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        placeholder="Enter your question here..."
                        className={`question-textarea ${errors.content ? 'error' : ''}`}
                        disabled={loading}
                        rows={4}
                    />
                    {errors.content && (
                        <span className="error-message">{errors.content}</span>
                    )}
                </div>

                {formData.type === 'multiple_choice' && (
                    <div className="form-group">
                        <label>Answer Options *</label>
                        <div className="options-container">
                            {formData.options.map((option, index) => (
                                <div key={index} className="option-row">
                                    <div className="option-input-group">
                                        <input
                                            type="radio"
                                            name="correct_answer"
                                            value={index.toString()}
                                            checked={formData.correct_answer === index.toString()}
                                            onChange={(e) => handleInputChange('correct_answer', e.target.value)}
                                            disabled={loading}
                                        />
                                        <ChildFriendlyInput
                                            type="text"
                                            value={option}
                                            onChange={(value) => handleOptionChange(index, value)}
                                            placeholder={`Option ${index + 1}`}
                                            disabled={loading}
                                        />
                                        {formData.options.length > 2 && (
                                            <ChildFriendlyButton
                                                type="button"
                                                variant="danger"

                                                onClick={() => removeOption(index)}
                                                disabled={loading}
                                            >
                                                ×
                                            </ChildFriendlyButton>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {formData.options.length < 6 && (
                                <ChildFriendlyButton
                                    type="button"
                                    variant="secondary"

                                    onClick={addOption}
                                    disabled={loading}
                                >
                                    + Add Option
                                </ChildFriendlyButton>
                            )}
                        </div>
                        {errors.options && (
                            <span className="error-message">{errors.options}</span>
                        )}
                        {errors.correct_answer && (
                            <span className="error-message">{errors.correct_answer}</span>
                        )}
                    </div>
                )}

                {formData.type === 'fill_blank' && (
                    <div className="form-group">
                        <label htmlFor="correct_answer">Correct Answer *</label>
                        <ChildFriendlyInput
                            type="text"
                            value={formData.correct_answer}
                            onChange={(value) => handleInputChange('correct_answer', value)}
                            placeholder="Enter the correct answer"
                            error={errors.correct_answer}
                            disabled={loading}
                        />
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="difficulty">Difficulty Level *</label>
                        <select
                            id="difficulty"
                            value={formData.difficulty}
                            onChange={(e) => handleInputChange('difficulty', e.target.value)}
                            className="question-select"
                            disabled={loading}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                    disabled={loading}
                                />
                                <span>Question is active</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="explanation">Explanation (Optional)</label>
                    <textarea
                        id="explanation"
                        value={formData.explanation}
                        onChange={(e) => handleInputChange('explanation', e.target.value)}
                        placeholder="Explain why this is the correct answer..."
                        className="question-textarea"
                        disabled={loading}
                        rows={3}
                    />
                </div>

                <div className="form-group">
                    <label>Tags</label>
                    <div className="tags-section">
                        <div className="tag-input-row">
                            <ChildFriendlyInput
                                type="text"
                                value={newTag}
                                onChange={setNewTag}
                                placeholder="Add a tag"
                                disabled={loading}
                            />
                            <ChildFriendlyButton
                                type="button"
                                variant="secondary"

                                onClick={handleAddTag}
                                disabled={loading || !newTag.trim()}
                            >
                                Add Tag
                            </ChildFriendlyButton>
                        </div>

                        {availableTags.length > 0 && (
                            <div className="available-tags">
                                <span className="tags-label">Available tags:</span>
                                <div className="tag-suggestions">
                                    {availableTags.map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            className={`tag-suggestion ${formData.tags.includes(tag) ? 'selected' : ''}`}
                                            onClick={() => handleTagSelect(tag)}
                                            disabled={loading}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formData.tags.length > 0 && (
                            <div className="selected-tags">
                                <span className="tags-label">Selected tags:</span>
                                <div className="tag-list">
                                    {formData.tags.map((tag) => (
                                        <span key={tag} className="tag-item">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                disabled={loading}
                                                className="tag-remove"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

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
                        {question ? 'Update Question' : 'Create Question'}
                    </ChildFriendlyButton>
                </div>
            </form>
        </ChildFriendlyCard>
    );
};

export default QuestionForm;