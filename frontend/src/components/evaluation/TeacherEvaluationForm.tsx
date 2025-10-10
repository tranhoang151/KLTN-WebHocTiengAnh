import React, { useState, useEffect } from 'react';
import { EvaluationService } from '../../services/evaluationService';
import {
    CreateEvaluationDto,
    UpdateEvaluationDto,
    Evaluation,
    User
} from '../../types';

interface TeacherEvaluationFormProps {
    student: User;
    teacherId: string;
    classId?: string;
    existingEvaluation?: Evaluation;
    onSubmit: () => void;
    onCancel: () => void;
}

const TeacherEvaluationForm: React.FC<TeacherEvaluationFormProps> = ({
    student,
    teacherId,
    classId,
    existingEvaluation,
    onSubmit,
    onCancel,
}) => {
    const [formData, setFormData] = useState<CreateEvaluationDto>({
        studentId: student.id,
        teacherId: teacherId,
        classId: classId,
        ratingParticipation: 3,
        ratingUnderstanding: 3,
        ratingProgress: 3,
        score: 75,
        comments: '',
        strengths: [],
        areasForImprovement: [],
        recommendations: [],
    });

    const [newStrength, setNewStrength] = useState('');
    const [newAreaForImprovement, setNewAreaForImprovement] = useState('');
    const [newRecommendation, setNewRecommendation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (existingEvaluation) {
            setFormData({
                studentId: existingEvaluation.student_id,
                teacherId: existingEvaluation.teacher_id,
                classId: existingEvaluation.class_id,
                ratingParticipation: existingEvaluation.rating_participation,
                ratingUnderstanding: existingEvaluation.rating_understanding,
                ratingProgress: existingEvaluation.rating_progress,
                score: existingEvaluation.score,
                comments: existingEvaluation.comments,
                strengths: existingEvaluation.strengths || [],
                areasForImprovement: existingEvaluation.areas_for_improvement || [],
                recommendations: existingEvaluation.recommendations || [],
            });
        }
    }, [existingEvaluation]);

    const handleRatingChange = (field: keyof CreateEvaluationDto, value: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));

        // Auto-calculate overall score based on ratings
        if (field !== 'score') {
            const newData = { ...formData, [field]: value };
            const avgRating = (newData.ratingParticipation + newData.ratingUnderstanding + newData.ratingProgress) / 3;
            const calculatedScore = Math.round(avgRating * 25); // Convert 1-5 rating to 25-100 score
            setFormData(prev => ({
                ...prev,
                score: calculatedScore,
            }));
        }
    };

    const handleAddStrength = () => {
        if (newStrength.trim()) {
            setFormData(prev => ({
                ...prev,
                strengths: [...prev.strengths, newStrength.trim()],
            }));
            setNewStrength('');
        }
    };

    const handleRemoveStrength = (index: number) => {
        setFormData(prev => ({
            ...prev,
            strengths: prev.strengths.filter((_, i) => i !== index),
        }));
    };

    const handleAddAreaForImprovement = () => {
        if (newAreaForImprovement.trim()) {
            setFormData(prev => ({
                ...prev,
                areasForImprovement: [...prev.areasForImprovement, newAreaForImprovement.trim()],
            }));
            setNewAreaForImprovement('');
        }
    };

    const handleRemoveAreaForImprovement = (index: number) => {
        setFormData(prev => ({
            ...prev,
            areasForImprovement: prev.areasForImprovement.filter((_, i) => i !== index),
        }));
    };

    const handleAddRecommendation = () => {
        if (newRecommendation.trim()) {
            setFormData(prev => ({
                ...prev,
                recommendations: [...prev.recommendations, newRecommendation.trim()],
            }));
            setNewRecommendation('');
        }
    };

    const handleRemoveRecommendation = (index: number) => {
        setFormData(prev => ({
            ...prev,
            recommendations: prev.recommendations.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (existingEvaluation) {
                // Update existing evaluation
                const updateData: UpdateEvaluationDto = {
                    ratingParticipation: formData.ratingParticipation,
                    ratingUnderstanding: formData.ratingUnderstanding,
                    ratingProgress: formData.ratingProgress,
                    score: formData.score,
                    comments: formData.comments,
                    strengths: formData.strengths,
                    areasForImprovement: formData.areasForImprovement,
                    recommendations: formData.recommendations,
                };
                await EvaluationService.updateEvaluation(existingEvaluation.id, updateData);
            } else {
                // Create new evaluation
                await EvaluationService.createEvaluation(formData);
            }
            onSubmit();
        } catch (error) {
            console.error('Error saving evaluation:', error);
            alert('Error saving evaluation. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    {existingEvaluation ? 'Edit Evaluation' : 'Create Evaluation'}
                </h2>
                <p className="text-gray-600 mt-2">
                    Evaluating: <span className="font-medium">{student.full_name}</span>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Participation Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Participation Rating (1-5)
                        </label>
                        <select
                            value={formData.ratingParticipation}
                            onChange={(e) => handleRatingChange('ratingParticipation', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            {[1, 2, 3, 4, 5].map(rating => (
                                <option key={rating} value={rating}>{rating}</option>
                            ))}
                        </select>
                    </div>

                    {/* Understanding Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Understanding Rating (1-5)
                        </label>
                        <select
                            value={formData.ratingUnderstanding}
                            onChange={(e) => handleRatingChange('ratingUnderstanding', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            {[1, 2, 3, 4, 5].map(rating => (
                                <option key={rating} value={rating}>{rating}</option>
                            ))}
                        </select>
                    </div>

                    {/* Progress Rating */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Progress Rating (1-5)
                        </label>
                        <select
                            value={formData.ratingProgress}
                            onChange={(e) => handleRatingChange('ratingProgress', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            {[1, 2, 3, 4, 5].map(rating => (
                                <option key={rating} value={rating}>{rating}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Overall Score */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Overall Score (Auto-calculated)
                    </label>
                    <input
                        type="number"
                        value={formData.score}
                        onChange={(e) => handleRatingChange('score', Number(e.target.value))}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                {/* Comments */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comments
                    </label>
                    <textarea
                        value={formData.comments}
                        onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add your comments about the student's performance..."
                    />
                </div>

                {/* Strengths */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Strengths
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newStrength}
                            onChange={(e) => setNewStrength(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add a strength..."
                        />
                        <button
                            type="button"
                            onClick={handleAddStrength}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.strengths.map((strength, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                            >
                                {strength}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveStrength(index)}
                                    className="ml-2 text-green-600 hover:text-green-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Areas for Improvement */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Areas for Improvement
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newAreaForImprovement}
                            onChange={(e) => setNewAreaForImprovement(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add an area for improvement..."
                        />
                        <button
                            type="button"
                            onClick={handleAddAreaForImprovement}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.areasForImprovement.map((area, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800"
                            >
                                {area}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveAreaForImprovement(index)}
                                    className="ml-2 text-yellow-600 hover:text-yellow-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Recommendations */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recommendations
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={newRecommendation}
                            onChange={(e) => setNewRecommendation(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Add a recommendation..."
                        />
                        <button
                            type="button"
                            onClick={handleAddRecommendation}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Add
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.recommendations.map((recommendation, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                            >
                                {recommendation}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRecommendation(index)}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : (existingEvaluation ? 'Update Evaluation' : 'Create Evaluation')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TeacherEvaluationForm;