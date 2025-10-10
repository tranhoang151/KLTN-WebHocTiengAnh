import React, { useState } from 'react';
import { Exercise, Question } from '../../types';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import ChildFriendlyCard from '../ui/ChildFriendlyCard';
import './ExercisePreview.css';

interface ExercisePreviewProps {
    exercise: Exercise;
    onClose: () => void;
    onEdit?: () => void;
    showEditButton?: boolean;
}

const ExercisePreview: React.FC<ExercisePreviewProps> = ({
    exercise,
    onClose,
    onEdit,
    showEditButton = true,
}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | number>>({});
    const [showResults, setShowResults] = useState(false);

    const currentQuestion = exercise.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === exercise.questions.length - 1;
    const isFirstQuestion = currentQuestionIndex === 0;

    const handleAnswerSelect = (questionId: string, answer: string | number) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: answer,
        }));
    };

    const handleNextQuestion = () => {
        if (isLastQuestion) {
            setShowResults(true);
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (!isFirstQuestion) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleQuestionJump = (index: number) => {
        setCurrentQuestionIndex(index);
        setShowResults(false);
    };

    const calculateScore = () => {
        let correct = 0;
        exercise.questions.forEach(question => {
            const userAnswer = selectedAnswers[question.id];
            if (userAnswer !== undefined && userAnswer === question.correct_answer) {
                correct++;
            }
        });
        return {
            correct,
            total: exercise.questions.length,
            percentage: Math.round((correct / exercise.questions.length) * 100),
        };
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

    if (showResults) {
        const score = calculateScore();

        return (
            <div className="exercise-preview-container">
                <ChildFriendlyCard className="exercise-preview-card">
                    <div className="preview-header">
                        <h2>Exercise Results</h2>
                        <div className="preview-actions">
                            {showEditButton && onEdit && (
                                <ChildFriendlyButton
                                    variant="secondary"
                                    onClick={onEdit}
                                >
                                    Edit Exercise
                                </ChildFriendlyButton>
                            )}
                            <ChildFriendlyButton
                                variant="secondary"
                                onClick={onClose}
                            >
                                Close Preview
                            </ChildFriendlyButton>
                        </div>
                    </div>

                    <div className="results-summary">
                        <div className="score-display">
                            <div className="score-circle">
                                <span className="score-percentage">{score.percentage}%</span>
                                <span className="score-fraction">{score.correct}/{score.total}</span>
                            </div>
                            <div className="score-text">
                                <h3>Great job!</h3>
                                <p>You got {score.correct} out of {score.total} questions correct.</p>
                            </div>
                        </div>
                    </div>

                    <div className="results-breakdown">
                        <h4>Question Breakdown</h4>
                        <div className="question-results">
                            {exercise.questions.map((question, index) => {
                                const userAnswer = selectedAnswers[question.id];
                                const isCorrect = userAnswer === question.correct_answer;

                                return (
                                    <div key={question.id} className={`question-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                                        <div className="question-result-header">
                                            <span className="question-number">Q{index + 1}</span>
                                            <span className={`result-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
                                                {isCorrect ? '✅' : '❌'}
                                            </span>
                                        </div>
                                        <div className="question-result-content">
                                            <p className="question-text">{question.content}</p>
                                            {question.type === 'multiple_choice' && question.options && (
                                                <div className="answer-comparison">
                                                    <div className="user-answer">
                                                        <strong>Your answer:</strong> {
                                                            userAnswer !== undefined
                                                                ? question.options[userAnswer as number] || 'No answer'
                                                                : 'No answer'
                                                        }
                                                    </div>
                                                    <div className="correct-answer">
                                                        <strong>Correct answer:</strong> {question.options[question.correct_answer as number]}
                                                    </div>
                                                </div>
                                            )}
                                            {question.type === 'fill_blank' && (
                                                <div className="answer-comparison">
                                                    <div className="user-answer">
                                                        <strong>Your answer:</strong> {userAnswer || 'No answer'}
                                                    </div>
                                                    <div className="correct-answer">
                                                        <strong>Correct answer:</strong> {question.correct_answer}
                                                    </div>
                                                </div>
                                            )}
                                            {question.explanation && (
                                                <div className="explanation">
                                                    <strong>Explanation:</strong> {question.explanation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="results-actions">
                        <ChildFriendlyButton
                            variant="secondary"
                            onClick={() => {
                                setShowResults(false);
                                setCurrentQuestionIndex(0);
                            }}
                        >
                            Review Questions
                        </ChildFriendlyButton>
                        <ChildFriendlyButton
                            variant="primary"
                            onClick={onClose}
                        >
                            Close Preview
                        </ChildFriendlyButton>
                    </div>
                </ChildFriendlyCard>
            </div>
        );
    }

    return (
        <div className="exercise-preview-container">
            <ChildFriendlyCard className="exercise-preview-card">
                <div className="preview-header">
                    <div className="exercise-info">
                        <h2>{exercise.title}</h2>
                        <div className="exercise-meta">
                            <span className="exercise-type">
                                {getTypeIcon(exercise.type)} {exercise.type.replace('_', ' ')}
                            </span>
                            <span className={`difficulty-badge ${getDifficultyColor(exercise.difficulty)}`}>
                                {exercise.difficulty}
                            </span>
                            <span className="time-limit">⏱️ {exercise.time_limit} min</span>
                        </div>
                    </div>
                    <div className="preview-actions">
                        {showEditButton && onEdit && (
                            <ChildFriendlyButton
                                variant="secondary"
                                onClick={onEdit}
                            >
                                Edit Exercise
                            </ChildFriendlyButton>
                        )}
                        <ChildFriendlyButton
                            variant="secondary"
                            onClick={onClose}
                        >
                            Close Preview
                        </ChildFriendlyButton>
                    </div>
                </div>

                <div className="progress-bar">
                    <div className="progress-info">
                        <span>Question {currentQuestionIndex + 1} of {exercise.questions.length}</span>
                        <span>{Math.round(((currentQuestionIndex + 1) / exercise.questions.length) * 100)}% Complete</span>
                    </div>
                    <div className="progress-track">
                        <div
                            className="progress-fill"
                            style={{ width: `${((currentQuestionIndex + 1) / exercise.questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="question-navigation">
                    {exercise.questions.map((_, index) => (
                        <button
                            key={index}
                            className={`nav-dot ${index === currentQuestionIndex ? 'active' : ''} ${selectedAnswers[exercise.questions[index].id] !== undefined ? 'answered' : ''
                                }`}
                            onClick={() => handleQuestionJump(index)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>

                <div className="question-content">
                    <div className="question-header">
                        <h3>Question {currentQuestionIndex + 1}</h3>
                        <span className={`question-difficulty ${currentQuestion.difficulty}`}>
                            {currentQuestion.difficulty}
                        </span>
                    </div>

                    <p className="question-text">{currentQuestion.content}</p>

                    <div className="answer-section">
                        {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                            <div className="multiple-choice-options">
                                {currentQuestion.options.map((option, index) => (
                                    <label key={index} className="option-label">
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestion.id}`}
                                            value={index}
                                            checked={selectedAnswers[currentQuestion.id] === index}
                                            onChange={() => handleAnswerSelect(currentQuestion.id, index)}
                                        />
                                        <span className="option-text">{option}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {currentQuestion.type === 'fill_blank' && (
                            <div className="fill-blank-input">
                                <input
                                    type="text"
                                    placeholder="Enter your answer..."
                                    value={selectedAnswers[currentQuestion.id] || ''}
                                    onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                                    className="answer-input"
                                />
                            </div>
                        )}
                    </div>

                    {currentQuestion.explanation && (
                        <div className="question-explanation">
                            <details>
                                <summary>Show explanation</summary>
                                <p>{currentQuestion.explanation}</p>
                            </details>
                        </div>
                    )}
                </div>

                <div className="navigation-controls">
                    <ChildFriendlyButton
                        variant="secondary"
                        onClick={handlePreviousQuestion}
                        disabled={isFirstQuestion}
                    >
                        Previous
                    </ChildFriendlyButton>

                    <div className="question-counter">
                        {currentQuestionIndex + 1} / {exercise.questions.length}
                    </div>

                    <ChildFriendlyButton
                        variant="primary"
                        onClick={handleNextQuestion}
                    >
                        {isLastQuestion ? 'Finish' : 'Next'}
                    </ChildFriendlyButton>
                </div>
            </ChildFriendlyCard>
        </div>
    );
};

export default ExercisePreview;