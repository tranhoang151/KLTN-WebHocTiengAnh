import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, CheckCircle, XCircle, Home, RotateCcw } from 'lucide-react';
import './TestResultPage.css';

interface TestQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    type: 'multiple_choice' | 'fill_blank';
    points: number;
}

interface TestSession {
    id: string;
    testId: string;
    startTime: Date;
    endTime?: Date;
    answers: { [questionId: string]: number };
    flaggedQuestions: string[];
    timeRemaining: number;
}

interface QuestionResult {
    question: TestQuestion;
    userAnswer: number;
    isCorrect: boolean;
    points: number;
}

const TestResultPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { session, questions } = location.state || {};

    const [results, setResults] = useState<QuestionResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session && questions) {
            calculateResults();
        } else {
            setLoading(false);
        }
    }, [session, questions]);

    const calculateResults = () => {
        if (!session || !questions) return;

        const questionResults: QuestionResult[] = questions.map((question: TestQuestion) => {
            const userAnswer = session.answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            const points = isCorrect ? question.points : 0;

            return {
                question,
                userAnswer: userAnswer || -1,
                isCorrect,
                points
            };
        });

        setResults(questionResults);
        setLoading(false);
    };

    const getTotalScore = () => {
        return results.reduce((total, result) => total + result.points, 0);
    };

    const getMaxScore = () => {
        return questions?.reduce((total: number, question: TestQuestion) => total + question.points, 0) || 0;
    };

    const getScorePercentage = () => {
        const totalScore = getTotalScore();
        const maxScore = getMaxScore();
        return maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    };

    const getCorrectAnswersCount = () => {
        return results.filter(result => result.isCorrect).length;
    };

    const getIncorrectAnswersCount = () => {
        return results.filter(result => !result.isCorrect && result.userAnswer !== -1).length;
    };

    const getUnansweredCount = () => {
        return results.filter(result => result.userAnswer === -1).length;
    };

    const getTimeSpent = () => {
        if (!session || !session.endTime) return 'N/A';

        const startTime = new Date(session.startTime);
        const endTime = new Date(session.endTime);
        const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

        const minutes = Math.floor(timeSpent / 60);
        const seconds = timeSpent % 60;

        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getPassStatus = () => {
        return getScorePercentage() >= 60;
    };

    const getPerformanceMessage = () => {
        const percentage = getScorePercentage();

        if (percentage >= 90) return { message: 'Excellent work!', type: 'success' };
        if (percentage >= 80) return { message: 'Great job!', type: 'success' };
        if (percentage >= 70) return { message: 'Good work!', type: 'success' };
        if (percentage >= 60) return { message: 'Passed! Keep practicing.', type: 'info' };
        return { message: 'Keep studying and try again!', type: 'warning' };
    };

    if (loading) {
        return (
            <div className="test-result-container">
                <div className="loading-container">
                    <p>Calculating results...</p>
                </div>
            </div>
        );
    }

    if (!session || !questions) {
        return (
            <div className="test-result-container">
                <div className="error-container">
                    <h3>No Results Found</h3>
                    <p>Test results could not be found.</p>
                </div>
            </div>
        );
    }

    const performance = getPerformanceMessage();
    const passed = getPassStatus();

    return (
        <div className="test-result-container">
            {/* Score Overview */}
            <div className="score-overview">
                <div className="score-grid">
                    <div className="score-item">
                        <div className="score-label">Final Score</div>
                        <div
                            className="score-value"
                            style={{ color: passed ? '#3f8600' : '#cf1322' }}
                        >
                            {getTotalScore()} / {getMaxScore()}
                        </div>
                    </div>
                    <div className="score-item">
                        <div className="score-label">Percentage</div>
                        <div
                            className="score-value"
                            style={{ color: passed ? '#3f8600' : '#cf1322' }}
                        >
                            {Math.round(getScorePercentage())}%
                        </div>
                    </div>
                    <div className="score-item">
                        <div className="pass-status">
                            {passed ? (
                                <span className="pass-badge success">
                                    <CheckCircle size={16} />
                                    PASSED
                                </span>
                            ) : (
                                <span className="pass-badge fail">
                                    <XCircle size={16} />
                                    FAILED
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="performance-message">
                    <div className={`performance-alert ${performance.type}`}>
                        {performance.message}
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="statistics-row">
                <div className="stat-card">
                    <div className="stat-icon">
                        <CheckCircle size={24} style={{ color: '#3f8600' }} />
                    </div>
                    <div className="stat-value">{getCorrectAnswersCount()}</div>
                    <div className="stat-label">Correct</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <XCircle size={24} style={{ color: '#cf1322' }} />
                    </div>
                    <div className="stat-value">{getIncorrectAnswersCount()}</div>
                    <div className="stat-label">Incorrect</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <Trophy size={24} style={{ color: '#1890ff' }} />
                    </div>
                    <div className="stat-value">{getUnansweredCount()}</div>
                    <div className="stat-label">Unanswered</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <div style={{ fontSize: '24px', color: '#722ed1' }}>⏱️</div>
                    </div>
                    <div className="stat-value">{getTimeSpent()}</div>
                    <div className="stat-label">Time Spent</div>
                </div>
            </div>

            {/* Question Review */}
            <div className="question-review">
                <h3>Question Review</h3>
                <div className="questions-list">
                    {results.map((result, index) => (
                        <div
                            key={result.question.id}
                            className={`question-item ${result.isCorrect ? 'correct' : result.userAnswer === -1 ? 'unanswered' : 'incorrect'}`}
                        >
                            <div className="question-review-content">
                                <div className="question-header">
                                    <span style={{ fontWeight: 'bold' }}>Question {index + 1}</span>
                                    <div className="question-meta">
                                        <span>{result.points} pts</span>
                                        {result.isCorrect ? (
                                            <span className="result-badge correct">Correct</span>
                                        ) : result.userAnswer === -1 ? (
                                            <span className="result-badge unanswered">Unanswered</span>
                                        ) : (
                                            <span className="result-badge incorrect">Incorrect</span>
                                        )}
                                    </div>
                                </div>

                                <p className="question-text">
                                    {result.question.question}
                                </p>

                                <div className="answer-review">
                                    <div className="user-answer">
                                        <span>Your answer: </span>
                                        {result.userAnswer === -1 ? (
                                            <span style={{ color: '#666' }}>Not answered</span>
                                        ) : (
                                            <code>{result.question.options[result.userAnswer]}</code>
                                        )}
                                    </div>
                                    {!result.isCorrect && (
                                        <div className="correct-answer">
                                            <span>Correct answer: </span>
                                            <code style={{ color: '#3f8600' }}>{result.question.options[result.question.correctAnswer]}</code>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="result-actions">
                <button
                    className="action-button secondary"
                    onClick={() => navigate('/student/dashboard')}
                >
                    <Home size={20} />
                    Back to Dashboard
                </button>
                <button
                    className="action-button primary"
                    onClick={() => navigate(`/student/test/${session.testId}/start`)}
                >
                    <RotateCcw size={20} />
                    Retake Test
                </button>
            </div>
        </div>
    );
};

export default TestResultPage;