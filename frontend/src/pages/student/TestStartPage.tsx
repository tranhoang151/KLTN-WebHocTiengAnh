import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testService } from '../../services/testService';
import { Test } from '../../types/test';
import { Clock, HelpCircle, Trophy, Play } from 'lucide-react';
import './TestStartPage.css';

const TestStartPage: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTestDetails();
    }, [testId]);

    const loadTestDetails = async () => {
        try {
            const response = await testService.getTestById(testId || 'test1');
            setTest(response);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load test details:', error);
            setLoading(false);
        }
    };

    const handleStartTest = () => {
        if (!test) return;
        navigate(`/student/test/${test.id}/take`);
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return '#52c41a';
            case 'medium': return '#faad14';
            case 'hard': return '#ff4d4f';
            default: return '#d9d9d9';
        }
    };

    const getDifficultyText = (difficulty: string) => {
        return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    };

    if (loading) {
        return (
            <div className="test-start-container">
                <div className="loading-container">
                    <p>Loading test details...</p>
                </div>
            </div>
        );
    }

    if (!test) {
        return (
            <div className="test-start-container">
                <div className="error-container">
                    <h3>Test Not Found</h3>
                    <p>The requested test could not be found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="test-start-container">
            <div className="test-details-card">
                <div className="test-header">
                    <h2>{test.title}</h2>
                    <div className="test-meta">
                        <div className="meta-item">
                            <Clock size={20} />
                            <span style={{ fontWeight: 'bold' }}>{test.duration} minutes</span>
                        </div>
                        <div className="meta-item">
                            <HelpCircle size={20} />
                            <span style={{ fontWeight: 'bold' }}>{test.totalQuestions} questions</span>
                        </div>
                        <div className="meta-item">
                            <Trophy size={20} />
                            <span style={{ fontWeight: 'bold' }}>{test.passingScore}% to pass</span>
                        </div>
                    </div>
                    <div
                        className="difficulty-tag"
                        style={{ backgroundColor: getDifficultyColor(test.difficulty) }}
                    >
                        {getDifficultyText(test.difficulty)}
                    </div>
                </div>

                <hr />

                {test.description && (
                    <div className="test-description">
                        <h4>Description</h4>
                        <p>{test.description}</p>
                    </div>
                )}

                {test.instructions && (
                    <div className="test-instructions">
                        <h4>Instructions</h4>
                        <div className="instructions-box">
                            <h5>Important Instructions</h5>
                            <div>
                                {test.instructions.split('. ').map((instruction, index) => (
                                    <div key={index}>• {instruction.trim()}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="test-rules">
                    <h4>Test Rules</h4>
                    <ul>
                        {[
                            'You cannot pause the test once started',
                            'All questions must be answered',
                            'Timer cannot be stopped',
                            'Results will be available after submission',
                            'You can review your answers before submitting'
                        ].map((rule, index) => (
                            <li key={index}>{rule}</li>
                        ))}
                    </ul>
                </div>

                <hr />

                <div className="test-actions">
                    <button
                        className="back-button"
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </button>
                    <button
                        className="start-test-btn"
                        onClick={handleStartTest}
                    >
                        <Play size={20} />
                        Start Test
                    </button>
                </div>
            </div>

            {/* Preparation tips */}
            <div className="preparation-tips">
                <h4>Tips for Success</h4>
                <div className="tips-grid">
                    {[
                        'Read each question carefully',
                        'Manage your time wisely',
                        'Don\'t spend too long on one question',
                        'Review your answers if time permits',
                        'Stay calm and focused',
                        'Trust your knowledge'
                    ].map((tip, index) => (
                        <div key={index} className="tip-item">
                            ✓ {tip}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TestStartPage;