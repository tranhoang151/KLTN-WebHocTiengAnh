import React, { useState, useEffect } from 'react';
import { Test, Course, Question } from '../../types';
import { testService } from '../../services/testService';
import { questionService } from '../../services/questionService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Save, X, Plus, Trash2 } from 'lucide-react';

interface TestBuilderProps {
    test: Test | null;
    courses: Course[];
    onSave: (test: Omit<Test, 'id' | 'created_at'>) => Promise<void>;
    onCancel: () => void;
}

const TestBuilder: React.FC<TestBuilderProps> = ({
    test,
    courses,
    onSave,
    onCancel
}) => {
    const [formData, setFormData] = useState({
        title: '',
        course_id: '',
        duration: 30,
        maxScore: 100,
        questions: [] as Question[]
    });

    const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (test) {
            setFormData({
                title: test.title,
                course_id: test.course_id,
                duration: test.duration,
                maxScore: test.maxScore,
                questions: test.questions
            });
        }
        loadAvailableQuestions();
    }, [test]);

    const loadAvailableQuestions = async () => {
        try {
            const questions = await questionService.getAllQuestions();
            setAvailableQuestions(questions);
        } catch (err) {
            console.error('Error loading questions:', err);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddQuestion = (question: Question) => {
        if (!formData.questions.find(q => q.id === question.id)) {
            setFormData(prev => ({
                ...prev,
                questions: [...prev.questions, question]
            }));
        }
    };

    const handleRemoveQuestion = (questionId: string) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter(q => q.id !== questionId)
        }));
    };

    const handleSave = async () => {
        if (!formData.title.trim() || !formData.course_id || formData.questions.length === 0) {
            setError('Please fill in all required fields and add at least one question');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await onSave(formData);
        } catch (err) {
            setError('Failed to save test');
        } finally {
            setLoading(false);
        }
    };

    const getAvailableQuestionsForCourse = () => {
        return availableQuestions.filter(q => q.course_id === formData.course_id);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    {test ? 'Edit Test' : 'Create New Test'}
                </h2>
                <Button variant="outline" onClick={onCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Test Configuration */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Test Configuration</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Test Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter test title"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course *
                            </label>
                            <select
                                value={formData.course_id}
                                onChange={(e) => handleInputChange('course_id', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a course</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration (minutes) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Score *
                                </label>
                                <input
                                    type="number"
                                    value={formData.maxScore}
                                    onChange={(e) => handleInputChange('maxScore', parseInt(e.target.value))}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Selected Questions */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        Selected Questions ({formData.questions.length})
                    </h3>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {formData.questions.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">
                                No questions selected. Add questions from the list below.
                            </p>
                        ) : (
                            formData.questions.map((question, index) => (
                                <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{question.content}</p>
                                        <p className="text-xs text-gray-500">
                                            Type: {question.type} | Difficulty: {question.difficulty}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemoveQuestion(question.id)}
                                        className="ml-2 text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            {/* Available Questions */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Available Questions</h3>

                {formData.course_id ? (
                    <div className="grid gap-3 max-h-96 overflow-y-auto">
                        {getAvailableQuestionsForCourse().map(question => {
                            const isSelected = formData.questions.some(q => q.id === question.id);
                            return (
                                <div key={question.id} className="flex items-center justify-between p-4 border rounded-md">
                                    <div className="flex-1">
                                        <p className="font-medium">{question.content}</p>
                                        <p className="text-sm text-gray-600">
                                            Type: {question.type} | Difficulty: {question.difficulty}
                                        </p>
                                    </div>
                                    <Button
                                        variant={isSelected ? "secondary" : "outline"}
                                        size="sm"
                                        onClick={() => isSelected ? handleRemoveQuestion(question.id) : handleAddQuestion(question)}
                                        disabled={isSelected}
                                    >
                                        {isSelected ? 'Added' : <Plus className="w-4 h-4" />}
                                    </Button>
                                </div>
                            );
                        })}
                        {getAvailableQuestionsForCourse().length === 0 && (
                            <p className="text-gray-500 text-center py-4">
                                No questions available for this course.
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">
                        Please select a course to view available questions.
                    </p>
                )}
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Test'}
                </Button>
            </div>
        </div>
    );
};

export default TestBuilder;