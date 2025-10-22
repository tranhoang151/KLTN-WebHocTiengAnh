import React, { useState, useEffect } from 'react';
import { TeacherEvaluation, Assignment, AssignmentSubmission, assignmentService } from '../../services/assignmentService';
import { User } from '../../types';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import ChildFriendlyInput from '../ui/ChildFriendlyInput';
import ChildFriendlyCard from '../ui/ChildFriendlyCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import { useAuth } from '../../contexts/AuthContext';
import './TeacherEvaluationForm.css';

interface TeacherEvaluationFormProps {
    assignment: Assignment;
    student: User;
    submission?: AssignmentSubmission;
    existingEvaluation?: TeacherEvaluation;
    onSubmit: (evaluation: Omit<TeacherEvaluation, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

const TeacherEvaluationForm: React.FC<TeacherEvaluationFormProps> = ({
    assignment,
    student,
    submission,
    existingEvaluation,
    onSubmit,
    onCancel,
    loading = false,
}) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        assignment_id: assignment.id,
        student_id: student.id,
        teacher_id: user?.id || '',
        participation_score: 3,
        understanding_score: 3,
        progress_score: 3,
        overall_rating: 3,
        comments: '',
        strengths: [] as string[],
        areas_for_improvement: [] as string[],
        recommendations: [] as string[],
    });

    const [newStrength, setNewStrength] = useState('');
    const [newImprovement, setNewImprovement] = useState('');
    const [newRecommendation, setNewRecommendation] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (existingEvaluation) {
            setFormData({
                assignment_id: existingEvaluation.assignment_id,
                student_id: existingEvaluation.student_id,
                teacher_id: existingEvaluation.teacher_id,
                participation_score: existingEvaluation.participation_score,
                understanding_score: existingEvaluation.understanding_score,
                progress_score: existingEvaluation.progress_score,
                overall_rating: existingEvaluation.overall_rating,
                comments: existingEvaluation.comments,
                strengths: [...existingEvaluation.strengths],
                areas_for_improvement: [...existingEvaluation.areas_for_improvement],
                recommendations: [...existingEvaluation.recommendations],
            });
        }
    }, [existingEvaluation]);

    useEffect(() => {
        // Calculate overall rating based on individual scores
        const average = (formData.participation_score + formData.understanding_score + formData.progress_score) / 3;
        const roundedAverage = Math.round(average * 10) / 10;
        setFormData(prev => ({
            ...prev,
            overall_rating: roundedAverage,
        }));
    }, [formData.participation_score, formData.understanding_score, formData.progress_score]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (formData.participation_score < 1 || formData.participation_score > 5) {
            newErrors.participation_score = 'Participation score must be between 1 and 5';
        }

        if (formData.understanding_score < 1 || formData.understanding_score > 5) {
            newErrors.understanding_score = 'Understanding score must be between 1 and 5';
        }

        if (formData.progress_score < 1 || formData.progress_score > 5) {
            newErrors.progress_score = 'Progress score must be between 1 and 5';
        }

        if (!formData.comments.trim()) {
            newErrors.comments = 'Comments are required';
        }

        if (formData.strengths.length === 0) {
            newErrors.strengths = 'At least one strength must be identified';
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
            await onSubmit(formData);
        } catch (error) {
            console.error('Error submitting evaluation:', error);
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

    const handleScoreChange = (field: string, value: number) => {
        handleInputChange(field, Math.max(1, Math.min(5, value)));
    };

    const addStrength = () => {
        if (newStrength.trim()) {
            setFormData(prev => ({
                ...prev,
                strengths: [...prev.strengths, newStrength.trim()],
            }));
            setNewStrength('');
            if (errors.strengths) {
                setErrors(prev => ({ ...prev, strengths: '' }));
            }
        }
    };

    const removeStrength = (index: number) => {
        setFormData(prev => ({
            ...prev,
            strengths: prev.strengths.filter((_, i) => i !== index),
        }));
    };

    const addImprovement = () => {
        if (newImprovement.trim()) {
            setFormData(prev => ({
                ...prev,
                areas_for_improvement: [...prev.areas_for_improvement, newImprovement.trim()],
            }));
            setNewImprovement('');
        }
    };

    const removeImprovement = (index: number) => {
        setFormData(prev => ({
            ...prev,
            areas_for_improvement: prev.areas_for_improvement.filter((_, i) => i !== index),
        }));
    };

    const addRecommendation = () => {
        if (newRecommendation.trim()) {
            setFormData(prev => ({
                ...prev,
                recommendations: [...prev.recommendations, newRecommendation.trim()],
            }));
            setNewRecommendation('');
        }
    };

    const removeRecommendation = (index: number) => {
        setFormData(prev => ({
            ...prev,
            recommendations: prev.recommendations.filter((_, i) => i !== index),
        }));
    };

    const getScoreLabel = (score: number) => {
        switch (Math.round(score)) {
            case 1: return 'Needs Improvement';
            case 2: return 'Below Average';
            case 3: return 'Average';
            case 4: return 'Good';
            case 5: return 'Excellent';
            default: return 'Average';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 4.5) return 'var(--success-color)';
        if (score >= 3.5) return 'var(--info-color)';
        if (score >= 2.5) return 'var(--warning-color)';
        return 'var(--error-color)';
    };

    const formatSubmissionInfo = () => {
        if (!submission) return null;

        return (
            <div className="submission-info">
                <h4>📊 Submission Details</h4>
                <div className="submission-stats">
                    <div className="stat-item">
                        <span className="stat-label">Score:</span>
                        <span className="stat-value">
                            {submission.score !== undefined ? `${submission.score}/${submission.max_score}` : 'Not graded'}
                        </span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Completion:</span>
                        <span className="stat-value">{submission.completion_percentage}%</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Time Spent:</span>
                        <span className="stat-value">{Math.round(submission.time_spent)} minutes</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Attempts:</span>
                        <span className="stat-value">{submission.attempt_number}/{assignment.max_attempts}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Status:</span>
                        <span className={`stat-value status-${submission.status}`}>
                            {submission.status.replace('_', ' ')}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <ChildFriendlyCard className="teacher-evaluation-form-container">
            <div className="evaluation-form-header">
                <h2>👩‍🏫 Student Evaluation</h2>
                <div className="student-assignment-info">
                    <p><strong>Student:</strong> {student.full_name || student.email}</p>
                    <p><strong>Assignment:</strong> {assignment.title}</p>
                </div>
            </div>

            {formatSubmissionInfo()}

            <form onSubmit={handleSubmit} className="evaluation-form">
                {/* Rating Scores */}
                <div className="form-section">
                    <h3>📈 Performance Ratings</h3>
                    <p className="section-description">Rate the student's performance on a scale of 1-5</p>

                    <div className="rating-grid">
                        <div className="rating-group">
                            <label>Participation Score</label>
                            <div className="rating-controls">
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    step="0.1"
                                    value={formData.participation_score}
                                    onChange={(e) => handleScoreChange('participation_score', parseFloat(e.target.value))}
                                    className="rating-slider"
                                    disabled={loading}
                                />
                                <div className="rating-display">
                                    <span
                                        className="rating-value"
                                        style={{ color: getScoreColor(formData.participation_score) }}
                                    >
                                        {formData.participation_score.toFixed(1)}
                                    </span>
                                    <span className="rating-label">
                                        {getScoreLabel(formData.participation_score)}
                                    </span>
                                </div>
                            </div>
                            {errors.participation_score && (
                                <span className="error-message">{errors.participation_score}</span>
                            )}
                        </div>

                        <div className="rating-group">
                            <label>Understanding Score</label>
                            <div className="rating-controls">
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    step="0.1"
                                    value={formData.understanding_score}
                                    onChange={(e) => handleScoreChange('understanding_score', parseFloat(e.target.value))}
                                    className="rating-slider"
                                    disabled={loading}
                                />
                                <div className="rating-display">
                                    <span
                                        className="rating-value"
                                        style={{ color: getScoreColor(formData.understanding_score) }}
                                    >
                                        {formData.understanding_score.toFixed(1)}
                                    </span>
                                    <span className="rating-label">
                                        {getScoreLabel(formData.understanding_score)}
                                    </span>
                                </div>
                            </div>
                            {errors.understanding_score && (
                                <span className="error-message">{errors.understanding_score}</span>
                            )}
                        </div>

                        <div className="rating-group">
                            <label>Progress Score</label>
                            <div className="rating-controls">
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    step="0.1"
                                    value={formData.progress_score}
                                    onChange={(e) => handleScoreChange('progress_score', parseFloat(e.target.value))}
                                    className="rating-slider"
                                    disabled={loading}
                                />
                                <div className="rating-display">
                                    <span
                                        className="rating-value"
                                        style={{ color: getScoreColor(formData.progress_score) }}
                                    >
                                        {formData.progress_score.toFixed(1)}
                                    </span>
                                    <span className="rating-label">
                                        {getScoreLabel(formData.progress_score)}
                                    </span>
                                </div>
                            </div>
                            {errors.progress_score && (
                                <span className="error-message">{errors.progress_score}</span>
                            )}
                        </div>

                        <div className="overall-rating">
                            <label>Overall Rating</label>
                            <div className="overall-rating-display">
                                <span
                                    className="overall-rating-value"
                                    style={{ color: getScoreColor(formData.overall_rating) }}
                                >
                                    {formData.overall_rating.toFixed(1)}
                                </span>
                                <span className="overall-rating-label">
                                    {getScoreLabel(formData.overall_rating)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments */}
                <div className="form-section">
                    <h3>💬 Comments</h3>
                    <div className="form-group">
                        <label htmlFor="comments">General Comments *</label>
                        <textarea
                            id="comments"
                            value={formData.comments}
                            onChange={(e) => handleInputChange('comments', e.target.value)}
                            placeholder="Provide detailed feedback about the student's performance..."
                            className={`evaluation-textarea ${errors.comments ? 'error' : ''}`}
                            disabled={loading}
                            rows={4}
                        />
                        {errors.comments && (
                            <span className="error-message">{errors.comments}</span>
                        )}
                    </div>
                </div>

                {/* Strengths */}
                <div className="form-section">
                    <h3>💪 Strengths</h3>
                    <div className="list-input-group">
                        <div className="input-with-button">
                            <ChildFriendlyInput
                                type="text"
                                value={newStrength}
                                onChange={setNewStrength}
                                placeholder="Add a strength..."
                                disabled={loading}
                            />
                            <ChildFriendlyButton
                                type="button"
                                variant="secondary"
                                onClick={addStrength}
                                disabled={loading || !newStrength.trim()}
                            >
                                Add
                            </ChildFriendlyButton>
                        </div>

                        <div className="list-items">
                            {formData.strengths.map((strength, index) => (
                                <div key={index} className="list-item">
                                    <span className="list-item-text">{strength}</span>
                                    <ChildFriendlyButton
                                        type="button"
                                        variant="secondary" onClick={() => removeStrength(index)}
                                        disabled={loading}
                                        className="remove-btn"
                                    >
                                        ✕
                                    </ChildFriendlyButton>
                                </div>
                            ))}
                        </div>

                        {errors.strengths && (
                            <span className="error-message">{errors.strengths}</span>
                        )}
                    </div>
                </div>

                {/* Areas for Improvement */}
                <div className="form-section">
                    <h3>📈 Areas for Improvement</h3>
                    <div className="list-input-group">
                        <div className="input-with-button">
                            <ChildFriendlyInput
                                type="text"
                                value={newImprovement}
                                onChange={setNewImprovement}
                                placeholder="Add an area for improvement..."
                                disabled={loading}
                            />
                            <ChildFriendlyButton
                                type="button"
                                variant="secondary" onClick={addImprovement}
                                disabled={loading || !newImprovement.trim()}
                            >
                                Add
                            </ChildFriendlyButton>
                        </div>

                        <div className="list-items">
                            {formData.areas_for_improvement.map((improvement, index) => (
                                <div key={index} className="list-item">
                                    <span className="list-item-text">{improvement}</span>
                                    <ChildFriendlyButton
                                        type="button"
                                        variant="secondary" onClick={() => removeImprovement(index)}
                                        disabled={loading}
                                        className="remove-btn"
                                    >
                                        ✕
                                    </ChildFriendlyButton>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="form-section">
                    <h3>🎯 Recommendations</h3>
                    <div className="list-input-group">
                        <div className="input-with-button">
                            <ChildFriendlyInput
                                type="text"
                                value={newRecommendation}
                                onChange={setNewRecommendation}
                                placeholder="Add a recommendation..."
                                disabled={loading}
                            />
                            <ChildFriendlyButton
                                type="button"
                                variant="secondary" onClick={addRecommendation}
                                disabled={loading || !newRecommendation.trim()}
                            >
                                Add
                            </ChildFriendlyButton>
                        </div>

                        <div className="list-items">
                            {formData.recommendations.map((recommendation, index) => (
                                <div key={index} className="list-item">
                                    <span className="list-item-text">{recommendation}</span>
                                    <ChildFriendlyButton
                                        type="button"
                                        variant="secondary" onClick={() => removeRecommendation(index)}
                                        disabled={loading}
                                        className="remove-btn"
                                    >
                                        ✕
                                    </ChildFriendlyButton>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
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
                        loading={loading}
                        disabled={loading}
                    >
                        {existingEvaluation ? 'Update Evaluation' : 'Submit Evaluation'}
                    </ChildFriendlyButton>
                </div>
            </form>
        </ChildFriendlyCard>
    );
};

export default TeacherEvaluationForm;


