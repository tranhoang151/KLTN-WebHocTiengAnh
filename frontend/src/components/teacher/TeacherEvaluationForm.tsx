import React, { useState, useEffect } from 'react';
import { User, Evaluation, CreateEvaluationDto, UpdateEvaluationDto } from '../../types';
import { evaluationService } from '../../services/evaluationService';
import ChildFriendlyCard from '../ui/ChildFriendlyCard';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';

interface TeacherEvaluationFormProps {
    student: User;
    classId?: string;
    existingEvaluation?: Evaluation;
    onSubmit: (evaluation: CreateEvaluationDto | UpdateEvaluationDto) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export const TeacherEvaluationForm: React.FC<TeacherEvaluationFormProps> = ({
    student,
    classId,
    existingEvaluation,
    onSubmit,
    onCancel,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        ratingParticipation: existingEvaluation?.rating_participation || 3,
        ratingUnderstanding: existingEvaluation?.rating_understanding || 3,
        ratingProgress: existingEvaluation?.rating_progress || 3,
        score: existingEvaluation?.score || 0,
        comments: existingEvaluation?.comments || '',
        strengths: existingEvaluation?.strengths || [],
        areasForImprovement: existingEvaluation?.areas_for_improvement || [],
        recommendations: existingEvaluation?.recommendations || []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [newStrength, setNewStrength] = useState('');
    const [newArea, setNewArea] = useState('');
    const [newRecommendation, setNewRecommendation] = useState('');

    const handleRatingChange = (field: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const addStrength = () => {
        if (newStrength.trim() && !formData.strengths.includes(newStrength.trim())) {
            setFormData(prev => ({
                ...prev,
                strengths: [...prev.strengths, newStrength.trim()]
            }));
            setNewStrength('');
        }
    };

    const removeStrength = (index: number) => {
        setFormData(prev => ({
            ...prev,
            strengths: prev.strengths.filter((_, i) => i !== index)
        }));
    };

    const addAreaForImprovement = () => {
        if (newArea.trim() && !formData.areasForImprovement.includes(newArea.trim())) {
            setFormData(prev => ({
                ...prev,
                areasForImprovement: [...prev.areasForImprovement, newArea.trim()]
            }));
            setNewArea('');
        }
    };

    const removeAreaForImprovement = (index: number) => {
        setFormData(prev => ({
            ...prev,
            areasForImprovement: prev.areasForImprovement.filter((_, i) => i !== index)
        }));
    };

    const addRecommendation = () => {
        if (newRecommendation.trim() && !formData.recommendations.includes(newRecommendation.trim())) {
            setFormData(prev => ({
                ...prev,
                recommendations: [...prev.recommendations, newRecommendation.trim()]
            }));
            setNewRecommendation('');
        }
    };

    const removeRecommendation = (index: number) => {
        setFormData(prev => ({
            ...prev,
            recommendations: prev.recommendations.filter((_, i) => i !== index)
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (formData.ratingParticipation < 1 || formData.ratingParticipation > 5) {
            newErrors.ratingParticipation = 'Rating must be between 1 and 5';
        }
        if (formData.ratingUnderstanding < 1 || formData.ratingUnderstanding > 5) {
            newErrors.ratingUnderstanding = 'Rating must be between 1 and 5';
        }
        if (formData.ratingProgress < 1 || formData.ratingProgress > 5) {
            newErrors.ratingProgress = 'Rating must be between 1 and 5';
        }
        if (formData.score < 0 || formData.score > 100) {
            newErrors.score = 'Score must be between 0 and 100';
        }
        if (!formData.comments.trim()) {
            newErrors.comments = 'Comments are required';
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
            const evaluationData = {
                studentId: student.id,
                classId: classId,
                ratingParticipation: formData.ratingParticipation,
                ratingUnderstanding: formData.ratingUnderstanding,
                ratingProgress: formData.ratingProgress,
                score: formData.score,
                comments: formData.comments,
                strengths: formData.strengths,
                areasForImprovement: formData.areasForImprovement,
                recommendations: formData.recommendations
            };

            await onSubmit(evaluationData);
        } catch (error) {
            console.error('Error submitting evaluation:', error);
        }
    };

    const getOverallRating = (): number => {
        return Math.round(((formData.ratingParticipation + formData.ratingUnderstanding + formData.ratingProgress) / 3) * 10) / 10;
    };

    return (
        <ChildFriendlyCard className="teacher-evaluation-form-container">
            <div className="evaluation-form-header">
                <h2>👩‍🏫 Student Evaluation</h2>
                <div className="student-info">
                    <h3>{student.full_name}</h3>
                    <p>{student.email}</p>
                    {classId && <p>Class ID: {classId}</p>}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="evaluation-form">
                {/* Rating Scores */}
                <div className="rating-section">
                    <h3>📊 Performance Ratings</h3>

                    <div className="rating-group">
                        <label>Participation:</label>
                        <div className="rating-input">
                            <input
                                type="range"
                                min="1"
                                max="5"
                                step="0.5"
                                value={formData.ratingParticipation}
                                onChange={(e) => handleRatingChange('ratingParticipation', parseFloat(e.target.value))}
                                disabled={loading}
                            />
                            <span className="rating-value">{formData.ratingParticipation}/5</span>
                        </div>
                        {errors.ratingParticipation && <span className="error">{errors.ratingParticipation}</span>}
                    </div>

                    <div className="rating-group">
                        <label>Understanding:</label>
                        <div className="rating-input">
                            <input
                                type="range"
                                min="1"
                                max="5"
                                step="0.5"
                                value={formData.ratingUnderstanding}
                                onChange={(e) => handleRatingChange('ratingUnderstanding', parseFloat(e.target.value))}
                                disabled={loading}
                            />
                            <span className="rating-value">{formData.ratingUnderstanding}/5</span>
                        </div>
                        {errors.ratingUnderstanding && <span className="error">{errors.ratingUnderstanding}</span>}
                    </div>

                    <div className="rating-group">
                        <label>Progress:</label>
                        <div className="rating-input">
                            <input
                                type="range"
                                min="1"
                                max="5"
                                step="0.5"
                                value={formData.ratingProgress}
                                onChange={(e) => handleRatingChange('ratingProgress', parseFloat(e.target.value))}
                                disabled={loading}
                            />
                            <span className="rating-value">{formData.ratingProgress}/5</span>
                        </div>
                        {errors.ratingProgress && <span className="error">{errors.ratingProgress}</span>}
                    </div>

                    <div className="overall-rating">
                        <strong>Overall Rating: {getOverallRating()}/5</strong>
                    </div>
                </div>

                {/* Score */}
                <div className="score-section">
                    <label htmlFor="score">Score (0-100):</label>
                    <input
                        id="score"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.score}
                        onChange={(e) => handleInputChange('score', e.target.value)}
                        disabled={loading}
                        className={errors.score ? 'error' : ''}
                    />
                    {errors.score && <span className="error">{errors.score}</span>}
                </div>

                {/* Comments */}
                <div className="comments-section">
                    <label htmlFor="comments">Comments:</label>
                    <textarea
                        id="comments"
                        value={formData.comments}
                        onChange={(e) => handleInputChange('comments', e.target.value)}
                        placeholder="Provide detailed feedback about the student's performance..."
                        className={`evaluation-textarea ${errors.comments ? 'error' : ''}`}
                        disabled={loading}
                        rows={4}
                    />
                    {errors.comments && <span className="error">{errors.comments}</span>}
                </div>

                {/* Strengths */}
                <div className="list-section">
                    <h4>✅ Strengths</h4>
                    <div className="add-item">
                        <input
                            type="text"
                            value={newStrength}
                            onChange={(e) => setNewStrength(e.target.value)}
                            placeholder="Add a strength..."
                            disabled={loading}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStrength())}
                        />
                        <ChildFriendlyButton type="button" onClick={addStrength} disabled={loading || !newStrength.trim()}>
                            Add
                        </ChildFriendlyButton>
                    </div>
                    <ul className="item-list">
                        {formData.strengths.map((strength, index) => (
                            <li key={index}>
                                {strength}
                                <button
                                    type="button"
                                    onClick={() => removeStrength(index)}
                                    disabled={loading}
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Areas for Improvement */}
                <div className="list-section">
                    <h4>🔧 Areas for Improvement</h4>
                    <div className="add-item">
                        <input
                            type="text"
                            value={newArea}
                            onChange={(e) => setNewArea(e.target.value)}
                            placeholder="Add an area for improvement..."
                            disabled={loading}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAreaForImprovement())}
                        />
                        <ChildFriendlyButton type="button" onClick={addAreaForImprovement} disabled={loading || !newArea.trim()}>
                            Add
                        </ChildFriendlyButton>
                    </div>
                    <ul className="item-list">
                        {formData.areasForImprovement.map((area, index) => (
                            <li key={index}>
                                {area}
                                <button
                                    type="button"
                                    onClick={() => removeAreaForImprovement(index)}
                                    disabled={loading}
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Recommendations */}
                <div className="list-section">
                    <h4>💡 Recommendations</h4>
                    <div className="add-item">
                        <input
                            type="text"
                            value={newRecommendation}
                            onChange={(e) => setNewRecommendation(e.target.value)}
                            placeholder="Add a recommendation..."
                            disabled={loading}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRecommendation())}
                        />
                        <ChildFriendlyButton type="button" onClick={addRecommendation} disabled={loading || !newRecommendation.trim()}>
                            Add
                        </ChildFriendlyButton>
                    </div>
                    <ul className="item-list">
                        {formData.recommendations.map((recommendation, index) => (
                            <li key={index}>
                                {recommendation}
                                <button
                                    type="button"
                                    onClick={() => removeRecommendation(index)}
                                    disabled={loading}
                                >
                                    ×
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <ChildFriendlyButton type="button" onClick={onCancel} disabled={loading}>
                        Cancel
                    </ChildFriendlyButton>
                    <ChildFriendlyButton type="submit" disabled={loading}>
                        {loading ? 'Saving...' : (existingEvaluation ? 'Update Evaluation' : 'Save Evaluation')}
                    </ChildFriendlyButton>
                </div>
            </form>
        </ChildFriendlyCard>
    );
};