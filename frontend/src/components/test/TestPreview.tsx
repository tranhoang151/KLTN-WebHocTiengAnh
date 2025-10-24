import React, { useState } from 'react';
import { Test, Question } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowLeft, Clock, FileText, CheckCircle, XCircle } from 'lucide-react';

interface TestPreviewProps {
    test: Test;
    onBack: () => void;
}

const TestPreview: React.FC<TestPreviewProps> = ({ test, onBack }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const currentQuestion = test.questions[currentQuestionIndex];

    const handleAnswerChange = (questionId: string, answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < test.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} minutes`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const renderQuestion = (question: Question) => {
        const userAnswer = answers[question.id];

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Question {currentQuestionIndex + 1} of {test.questions.length}</span>
                    <span className="text-gray-400">•</span>
                    <span>Type: {question.type}</span>
                    <span className="text-gray-400">•</span>
                    <span>Difficulty: {question.difficulty}</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-lg font-medium text-gray-900 mb-4">
                        {question.content}
                    </p>

                    {question.type === 'multiple_choice' && question.options && (
                        <div className="space-y-2">
                            {question.options.map((option, index) => {
                                const isSelected = userAnswer === index.toString();
                                const isCorrect = index === question.correct_answer;

                                return (
                                    <div
                                        key={index}
                                        className={`p-3 rounded-md border cursor-pointer transition-colors ${isSelected
                                            ? isCorrect
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-red-50 border-red-200'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected
                                                ? isCorrect
                                                    ? 'border-green-500 bg-green-500'
                                                    : 'border-red-500 bg-red-500'
                                                : 'border-gray-300'
                                                }`}>
                                                {isSelected && (
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                )}
                                            </div>
                                            <span className="flex-1">{option}</span>
                                            {isSelected && (
                                                <div className="flex items-center gap-1">
                                                    {isCorrect ? (
                                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-600" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {question.type === 'fill_blank' && (
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={userAnswer || ''}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                placeholder="Enter your answer..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {userAnswer && (
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-600">Your answer:</span>
                                    <span className={`font-medium ${typeof userAnswer === 'string' && typeof question.correct_answer === 'string' &&
                                            userAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim()
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                        }`}>
                                        {userAnswer}
                                    </span>
                                    {typeof userAnswer === 'string' && typeof question.correct_answer === 'string' &&
                                        userAnswer.toLowerCase().trim() === question.correct_answer.toLowerCase().trim() ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-600" />
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {question.explanation && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                        <p className="text-blue-800">{question.explanation}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Button variant="outline" onClick={onBack} className="mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Test List
                    </Button>
                    <h2 className="text-2xl font-bold text-gray-900">{test.title}</h2>
                    <p className="text-gray-600">Test Preview</p>
                </div>
            </div>

            {/* Test Info */}
            <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                            <p className="text-sm text-gray-600">Questions</p>
                            <p className="font-semibold">{test.questions.length}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-green-600" />
                        <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-semibold">{formatDuration(test.duration)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                        <div>
                            <p className="text-sm text-gray-600">Max Score</p>
                            <p className="font-semibold">{test.maxScore}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Question Display */}
            <Card className="p-6">
                {currentQuestion ? renderQuestion(currentQuestion) : (
                    <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No questions in this test.</p>
                    </div>
                )}
            </Card>

            {/* Navigation */}
            {test.questions.length > 0 && (
                <div className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                    >
                        Previous
                    </Button>

                    <div className="flex gap-2">
                        {test.questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestionIndex(index)}
                                className={`w-8 h-8 rounded-full text-sm font-medium ${index === currentQuestionIndex
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    <Button
                        onClick={handleNext}
                        disabled={currentQuestionIndex === test.questions.length - 1}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default TestPreview;