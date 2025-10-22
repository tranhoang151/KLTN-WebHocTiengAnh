import React, { useState } from 'react';
import { Exercise, Question } from '../../types';
import {
  Eye,
  Edit,
  X,
  CheckCircle,
  XCircle,
  Clock,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

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
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string | number>
  >({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = exercise.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === exercise.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleAnswerSelect = (questionId: string, answer: string | number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleQuestionJump = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowResults(false);
  };

  const calculateScore = () => {
    let correct = 0;
    exercise.questions.forEach((question) => {
      const userAnswer = selectedAnswers[question.id];
      if (userAnswer !== undefined && userAnswer === question.correctAnswer) {
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
      case 'easy':
        return { bg: '#dcfce7', color: '#16a34a' };
      case 'medium':
        return { bg: '#fef3c7', color: '#d97706' };
      case 'hard':
        return { bg: '#fef2f2', color: '#dc2626' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return <CheckCircle size={16} color="#3b82f6" />;
      case 'fill_blank':
        return <Edit size={16} color="#3b82f6" />;
      default:
        return <HelpCircle size={16} color="#3b82f6" />;
    }
  };

  if (showResults) {
    const score = calculateScore();

    return (
      <div
        style={{
          background: 'white',
          borderRadius: '0',
          boxShadow: 'none',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Results Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            gap: '16px',
          }}
        >
          <h2
            style={{
              color: '#1f2937',
              margin: '0',
              fontSize: '24px',
              fontWeight: '700',
            }}
          >
            Exercise Results
          </h2>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            {showEditButton && onEdit && (
              <button
                onClick={onEdit}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                  e.currentTarget.style.color = '#374151';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                <Edit size={16} />
                Edit Exercise
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                color: '#374151',
                border: '1px solid #d1d5db',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #ef4444, #dc2626)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              <X size={16} />
              Close Preview
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div
          style={{
            padding: '32px 24px',
            textAlign: 'center',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '32px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
              }}
            >
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  lineHeight: '1',
                }}
              >
                {score.percentage}%
              </span>
              <span
                style={{
                  fontSize: '14px',
                  opacity: '0.9',
                }}
              >
                {score.correct}/{score.total}
              </span>
            </div>
            <div>
              <h3
                style={{
                  color: '#1f2937',
                  margin: '0 0 8px 0',
                  fontSize: '20px',
                  fontWeight: '700',
                }}
              >
                Great job!
              </h3>
              <p
                style={{
                  color: '#6b7280',
                  margin: '0',
                  fontSize: '16px',
                }}
              >
                You got {score.correct} out of {score.total} questions correct.
              </p>
            </div>
          </div>
        </div>

        {/* Results Breakdown */}
        <div
          style={{
            padding: '24px',
            flex: 1,
            overflow: 'auto',
          }}
        >
          <h4
            style={{
              color: '#1f2937',
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '600',
            }}
          >
            Question Breakdown
          </h4>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {exercise.questions.map((question, index) => {
              const userAnswer = selectedAnswers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <div
                  key={question.id}
                  style={{
                    border: `1px solid ${isCorrect ? '#16a34a' : '#ef4444'}`,
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      backgroundColor: isCorrect ? '#dcfce7' : '#fef2f2',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: '600',
                        color: '#1f2937',
                      }}
                    >
                      Q{index + 1}
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {isCorrect ? (
                        <CheckCircle size={20} color="#16a34a" />
                      ) : (
                        <XCircle size={20} color="#ef4444" />
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '16px',
                    }}
                  >
                    <p
                      style={{
                        margin: '0 0 16px 0',
                        fontWeight: '500',
                        color: '#1f2937',
                        fontSize: '16px',
                        lineHeight: '1.5',
                      }}
                    >
                      {question.content}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        marginBottom: '16px',
                      }}
                    >
                      <div
                        style={{
                          padding: '8px',
                          borderRadius: '4px',
                          backgroundColor: '#f9fafb',
                          fontSize: '14px',
                        }}
                      >
                        <strong>Your answer:</strong>{' '}
                        {userAnswer || 'No answer'}
                      </div>
                      <div
                        style={{
                          padding: '8px',
                          borderRadius: '4px',
                          backgroundColor: '#dcfce7',
                          fontSize: '14px',
                        }}
                      >
                        <strong>Correct answer:</strong>{' '}
                        {question.correctAnswer}
                      </div>
                    </div>
                    {question.explanation && (
                      <div
                        style={{
                          padding: '12px',
                          backgroundColor: '#eff6ff',
                          borderRadius: '4px',
                          fontSize: '14px',
                          lineHeight: '1.4',
                        }}
                      >
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Results Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            padding: '24px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <button
            onClick={() => {
              setShowResults(false);
              setCurrentQuestionIndex(0);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #6b7280, #4b5563)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = '#6b7280';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
              e.currentTarget.style.color = '#374151';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            <Eye size={16} />
            Review Questions
          </button>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #1d4ed8, #1e40af)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #3b82f6, #1d4ed8)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <X size={16} />
            Close Preview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '0',
        boxShadow: 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Preview Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          gap: '16px',
        }}
      >
        <div
          style={{
            flex: 1,
          }}
        >
          <h2
            style={{
              color: '#1f2937',
              margin: '0 0 8px 0',
              fontSize: '20px',
              fontWeight: '700',
            }}
          >
            {exercise.title}
          </h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '500',
              }}
            >
              {getTypeIcon(exercise.type)}
              {exercise.type ? exercise.type.replace('_', ' ') : 'Unknown'}
            </div>
            {/* Difficulty badge removed - not in Android app */}
            {/* Time limit removed - not in Android app */}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          {showEditButton && onEdit && (
            <button
              onClick={onEdit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                color: '#374151',
                border: '1px solid #d1d5db',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderColor = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              <Edit size={16} />
              Edit Exercise
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #ef4444, #dc2626)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
              e.currentTarget.style.color = '#374151';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            <X size={16} />
            Close Preview
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500',
          }}
        >
          <span>
            Question {currentQuestionIndex + 1} of {exercise.questions.length}
          </span>
          <span>
            {Math.round(
              ((currentQuestionIndex + 1) / exercise.questions.length) * 100
            )}
            % Complete
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: '#f3f4f6',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
              borderRadius: '3px',
              transition: 'width 0.3s ease',
              width: `${((currentQuestionIndex + 1) / exercise.questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          padding: '16px 24px',
          borderBottom: '1px solid #e5e7eb',
          flexWrap: 'wrap',
        }}
      >
        {exercise.questions.map((_, index) => (
          <button
            key={index}
            onClick={() => handleQuestionJump(index)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: `2px solid ${index === currentQuestionIndex
                ? '#3b82f6'
                : selectedAnswers[exercise.questions[index].id] !== undefined
                  ? '#16a34a'
                  : '#e5e7eb'
                }`,
              backgroundColor:
                index === currentQuestionIndex
                  ? '#3b82f6'
                  : selectedAnswers[exercise.questions[index].id] !== undefined
                    ? '#16a34a'
                    : 'white',
              color:
                index === currentQuestionIndex ||
                  selectedAnswers[exercise.questions[index].id] !== undefined
                  ? 'white'
                  : '#6b7280',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              if (
                index !== currentQuestionIndex &&
                selectedAnswers[exercise.questions[index].id] === undefined
              ) {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.color = '#3b82f6';
              }
            }}
            onMouseLeave={(e) => {
              if (
                index !== currentQuestionIndex &&
                selectedAnswers[exercise.questions[index].id] === undefined
              ) {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#6b7280';
              }
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* Question Content */}
      <div
        style={{
          padding: '24px',
          flex: 1,
          overflow: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h3
            style={{
              color: '#1f2937',
              margin: '0',
              fontSize: '18px',
              fontWeight: '600',
            }}
          >
            Question {currentQuestionIndex + 1}
          </h3>
          {/* Difficulty badge removed - not in Android app */}
        </div>

        <p
          style={{
            fontSize: '16px',
            lineHeight: '1.5',
            color: '#1f2937',
            marginBottom: '24px',
          }}
        >
          {(currentQuestion.content || currentQuestion.question_text) || 'No content available'}
        </p>

        <div
          style={{
            marginBottom: '24px',
          }}
        >
          {currentQuestion.type === 'multiple_choice' &&
            currentQuestion.options && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      border: `2px solid ${selectedAnswers[currentQuestion.id] === option
                        ? '#3b82f6'
                        : '#e5e7eb'
                        }`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor:
                        selectedAnswers[currentQuestion.id] === option
                          ? '#eff6ff'
                          : 'white',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedAnswers[currentQuestion.id] !== option) {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedAnswers[currentQuestion.id] !== option) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={selectedAnswers[currentQuestion.id] === option}
                      onChange={() =>
                        handleAnswerSelect(currentQuestion.id, option)
                      }
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontSize: '14px',
                        color: '#1f2937',
                        lineHeight: '1.4',
                        fontWeight:
                          selectedAnswers[currentQuestion.id] === option
                            ? '500'
                            : 'normal',
                      }}
                    >
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            )}

          {currentQuestion.type === 'fill_blank' && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <input
                type="text"
                value={selectedAnswers[currentQuestion.id] || ''}
                onChange={(e) =>
                  handleAnswerSelect(currentQuestion.id, e.target.value)
                }
                placeholder="Enter your answer..."
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  textAlign: 'center',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow =
                    '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          )}
        </div>

        {currentQuestion.explanation && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
            }}
          >
            <details>
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: '500',
                  color: '#3b82f6',
                  marginBottom: '8px',
                }}
              >
                Show Explanation
              </summary>
              <p
                style={{
                  margin: '8px 0 0 0',
                  fontSize: '14px',
                  lineHeight: '1.4',
                  color: '#6b7280',
                }}
              >
                {currentQuestion.explanation}
              </p>
            </details>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px',
          borderTop: '1px solid #e5e7eb',
        }}
      >
        <button
          onClick={handlePreviousQuestion}
          disabled={isFirstQuestion}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: isFirstQuestion
              ? 'linear-gradient(135deg, #f3f4f6, #e5e7eb)'
              : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
            color: isFirstQuestion ? '#9ca3af' : '#374151',
            border: '1px solid #d1d5db',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isFirstQuestion ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: isFirstQuestion ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isFirstQuestion) {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #6b7280, #4b5563)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = '#6b7280';
            }
          }}
          onMouseLeave={(e) => {
            if (!isFirstQuestion) {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
              e.currentTarget.style.color = '#374151';
              e.currentTarget.style.borderColor = '#d1d5db';
            }
          }}
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <div
          style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#6b7280',
          }}
        >
          {currentQuestionIndex + 1}/{exercise.questions.length}
        </div>

        <button
          onClick={handleNextQuestion}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              'linear-gradient(135deg, #1d4ed8, #1e40af)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              'linear-gradient(135deg, #3b82f6, #1d4ed8)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {isLastQuestion ? 'Finish' : 'Next'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default ExercisePreview;


