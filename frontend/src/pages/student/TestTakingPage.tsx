import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testService } from '../../services/testService';
import { TestQuestion, TestSession } from '../../types/test';
import { Question } from '../../types';
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle } from 'lucide-react';
import './TestTakingPage.css';

const TestTakingPage: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [session, setSession] = useState<TestSession | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeWarning, setTimeWarning] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    // Timer effect
    useEffect(() => {
        if (!session) return;

        const timer = setInterval(() => {
            setSession(prev => {
                if (!prev) return prev;

                const newTimeRemaining = prev.timeRemaining - 1;

                // Show warning when 5 minutes left
                if (newTimeRemaining === 300) {
                    setTimeWarning(true);
                    alert('5 minutes remaining!');
                }

                // Auto-submit when time runs out
                if (newTimeRemaining <= 0) {
                    handleSubmitTest();
                    return { ...prev, timeRemaining: 0, endTime: new Date() };
                }

                return { ...prev, timeRemaining: newTimeRemaining };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [session]);

    useEffect(() => {
        loadTestQuestions();
        initializeSession();
    }, [testId]);

    const loadTestQuestions = async () => {
        try {
            const response = await testService.getTestQuestions(testId || 'test1');
            setQuestions(response);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load test questions:', error);
            setLoading(false);
        }
    };

    const initializeSession = () => {
        if (!testId) return;

        const newSession: TestSession = {
            id: `session_${Date.now()}`,
            testId,
            userId: 'current-user',
            startTime: new Date(),
            answers: {},
            flaggedQuestions: [],
            timeRemaining: 15 * 60, // 15 minutes in seconds
            submitted: false
        };
        setSession(newSession);
    };

    const handleAnswerSelect = (answerIndex: number) => {
        setSelectedAnswer(answerIndex);

        if (session) {
            setSession({
                ...session,
                answers: {
                    ...session.answers,
                    [questions[currentQuestionIndex].id]: answerIndex
                }
            });
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(session?.answers[questions[currentQuestionIndex + 1].id] || null);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setSelectedAnswer(session?.answers[questions[currentQuestionIndex - 1].id] || null);
        }
    };

    const handleFlagQuestion = () => {
        if (!session) return;

        const questionId = questions[currentQuestionIndex].id;
        const isFlagged = session.flaggedQuestions.includes(questionId);

        setSession({
            ...session,
            flaggedQuestions: isFlagged
                ? session.flaggedQuestions.filter(id => id !== questionId)
                : [...session.flaggedQuestions, questionId]
        });

        alert(isFlagged ? 'Question unflagged' : 'Question flagged for review');
    };

    const handleSubmitTest = useCallback(async () => {
        if (!session) return;

        try {
            const endTime = new Date();
            const finalSession = { ...session, endTime };

            await testService.submitTestSession(finalSession.id);

            navigate(`/student/test/${testId}/results`, {
                state: { session: finalSession, questions }
            });
        } catch (error) {
            alert('Failed to submit test');
        }
    }, [session, questions, testId, navigate]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getAnsweredCount = () => {
        return Object.keys(session?.answers || {}).length;
    };

    const getProgressPercentage = () => {
        return (getAnsweredCount() / questions.length) * 100;
    };

    if (loading) {
        return (
            <div className="test-taking-container">
                <div className="loading-container">
                    <p>Loading test questions...</p>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="test-taking-container">
                <div className="error-container">
                    <h3>No Questions Available</h3>
                    <p>This test has no questions.</p>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const isFirstQuestion = currentQuestionIndex === 0;
    const isFlagged = session?.flaggedQuestions.includes(currentQuestion.id);

    return (
        <div className="test-taking-container">
            {/* Timer and progress header */}
            <div className="test-header">
                <div className="test-info">
                    <div className="timer-section">
                        <Clock className={timeWarning ? 'warning' : ''} size={20} />
                        <span className={`timer ${timeWarning ? 'warning' : ''}`}>
                            {formatTime(session?.timeRemaining || 0)}
                        </span>
                    </div>
                    <div className="progress-section">
                        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${getProgressPercentage()}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Question card */}
            <div className="question-card">
                <div className="question-header">
                    <div className="question-info">
                        <h4>Question {currentQuestionIndex + 1}</h4>
                        <span style={{ color: '#666' }}>1 point</span>
                    </div>
                    <button
                        className={`flag-button ${isFlagged ? 'flagged' : ''}`}
                        onClick={handleFlagQuestion}
                    >
                        <Flag size={16} />
                        {isFlagged ? 'Flagged' : 'Flag'}
                    </button>
                </div>

                <div className="question-content">
                    <p className="question-text">{currentQuestion.content}</p>

                    <div className="answer-options">
                        {currentQuestion.options.map((option, index) => (
                            <label key={index} className="answer-option">
                                <input
                                    type="radio"
                                    name="answer"
                                    value={index}
                                    checked={selectedAnswer === index}
                                    onChange={() => handleAnswerSelect(index)}
                                />
                                <span className="option-text">{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="navigation-card">
                <div className="question-navigation">
                    <button
                        className="nav-button"
                        onClick={handlePreviousQuestion}
                        disabled={isFirstQuestion}
                    >
                        <ChevronLeft size={20} />
                        Previous
                    </button>

                    <div className="question-indicators">
                        {questions.map((_, index) => {
                            const isAnswered = session?.answers[questions[index].id] !== undefined;
                            const isCurrent = index === currentQuestionIndex;
                            const isFlaggedQ = session?.flaggedQuestions.includes(questions[index].id);

                            return (
                                <div
                                    key={index}
                                    className={`question-indicator ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''} ${isFlaggedQ ? 'flagged' : ''}`}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                >
                                    {index + 1}
                                </div>
                            );
                        })}
                    </div>

                    <button
                        className="nav-button"
                        onClick={handleNextQuestion}
                        disabled={isLastQuestion}
                    >
                        Next
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="test-actions">
                    <button
                        className="submit-test-btn"
                        onClick={() => setShowSubmitModal(true)}
                    >
                        <CheckCircle size={20} />
                        Submit Test
                    </button>
                </div>
            </div>

            {/* Submit confirmation modal */}
            {showSubmitModal && (
                <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Submit Test</h3>
                        <div className="submit-confirmation">
                            <div className="warning-alert">
                                <h4>Are you sure you want to submit?</h4>
                                <div>
                                    <p>You have answered {getAnsweredCount()} out of {questions.length} questions.</p>
                                    <p>Time remaining: {formatTime(session?.timeRemaining || 0)}</p>
                                    <p>You cannot make changes after submission.</p>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="modal-button secondary"
                                    onClick={() => setShowSubmitModal(false)}
                                >
                                    Continue Test
                                </button>
                                <button
                                    className="modal-button primary"
                                    onClick={handleSubmitTest}
                                >
                                    Submit Test
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestTakingPage;


