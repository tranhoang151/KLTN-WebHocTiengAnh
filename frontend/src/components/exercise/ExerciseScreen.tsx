import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { exerciseService } from '../../services/exerciseService';
import {
  Exercise,
  AnswerDto,
  ExerciseResult,
  Question,
  QuestionResult,
} from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import FillBlankQuestion from './FillBlankQuestion'; // Import FillBlankQuestion
import ExerciseResultDisplay from './ExerciseResult';
import './ExerciseScreen.css';

const ExerciseScreen: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, string>>(
    new Map()
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [startTime] = useState(Date.now());
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const loadExercise = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await exerciseService.getExerciseById(id);
      setExercise(data);
      setSessionQuestions(data.questions); // Initialize sessionQuestions
    } catch (err: any) {
      setError(err.message || 'Failed to load exercise.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (exerciseId) {
      loadExercise(exerciseId);
    }
  }, [exerciseId]);

  const handleRetryIncorrect = (incorrectQuestions: QuestionResult[]) => {
    if (!exercise) return;

    const incorrectQuestionIds = new Set(
      incorrectQuestions.map((q) => q.questionId)
    );
    const newSessionQuestions = exercise.questions.filter((q) =>
      incorrectQuestionIds.has(q.id)
    );

    setSessionQuestions(newSessionQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswers(new Map());
    setIsSubmitted(false);
    setResult(null);
    setIsPaused(false);
    if (exercise.time_limit) {
      setTimeLeft(exercise.time_limit * 60); // Reset timer
    }
  };

  useEffect(() => {
    if (exercise && exercise.time_limit && !isSubmitted) {
      setTimeLeft(exercise.time_limit * 60); // Convert minutes to seconds
    }
  }, [exercise, isSubmitted]);

  useEffect(() => {
    if (timeLeft === null || isSubmitted || isPaused) return;

    if (timeLeft <= 0) {
      handleSubmit(); // Auto-submit when time runs out
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime !== null ? prevTime - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, isPaused]); // Add isPaused to dependencies

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const formatTime = (totalSeconds: number | null) => {
    if (totalSeconds === null) return '--:--';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerClassName = () => {
    if (timeLeft !== null && timeLeft <= 60) {
      // Warning for last 60 seconds
      return 'timer-warning';
    }
    return '';
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => new Map(prev).set(questionId, answer));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < sessionQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user || !exercise || isSubmitted) return; // Prevent multiple submissions

    const submission: any = {
      userId: user.id,
      exerciseId: exercise.id,
      courseId: exercise.course_id,
      answers: Array.from(userAnswers.entries()).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        })
      ),
      timeSpent: Math.floor((Date.now() - startTime) / 1000),
    };

    try {
      setLoading(true);
      const res = await exerciseService.submitExercise(submission);
      setResult(res);
      setIsSubmitted(true);
      setTimeLeft(null); // Stop timer
    } catch (err: any) {
      setError(err.message || 'Failed to submit exercise.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="exercise-loading">Loading Exercise...</div>;
  }

  if (error) {
    return <div className="exercise-error">Error: {error}</div>;
  }

  if (!exercise) {
    return <div className="exercise-error">Exercise not found.</div>;
  }

  if (isSubmitted && result) {
    return (
      <ExerciseResultDisplay
        result={result}
        onRetry={() => navigate(0)}
        onRetryIncorrect={handleRetryIncorrect}
        onExit={() => navigate('/student/exercises')}
      />
    );
  }

  if (!sessionQuestions.length) {
    return (
      <div className="exercise-error">
        No questions available for this session.
      </div>
    );
  }

  const currentQuestion = sessionQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / sessionQuestions.length) * 100;

  return (
    <div className="exercise-screen">
      <div className="exercise-header">
        <h2>{exercise.title}</h2>
        {exercise.time_limit && (
          <div className="timer-container ${getTimerClassName()}">
            <span className="timer-display">{formatTime(timeLeft)}</span>
            <button
              onClick={togglePause}
              className="pause-btn"
              disabled={isSubmitted}
            >
              {isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
          </div>
        )}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span>
          Question {currentQuestionIndex + 1} of {sessionQuestions.length}
        </span>
      </div>

      <div className="question-container">
        {currentQuestion.type === 'multiple_choice' && (
          <MultipleChoiceQuestion
            question={currentQuestion}
            selectedAnswer={userAnswers.get(currentQuestion.id)}
            onAnswerSelect={handleAnswerSelect}
            isSubmitted={isSubmitted} // Pass isSubmitted prop
          />
        )}
        {currentQuestion.type === 'fill_blank' && (
          <FillBlankQuestion
            question={currentQuestion}
            userAnswer={userAnswers.get(currentQuestion.id)}
            onAnswerChange={handleAnswerSelect}
            isSubmitted={isSubmitted} // Pass isSubmitted prop
            correctAnswer={
              result?.questionResults.find(
                (qr) => qr.questionId === currentQuestion.id
              )?.correctAnswer
            } // Pass correct answer for feedback
          />
        )}
      </div>

      <div className="navigation-controls">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </button>
        {currentQuestionIndex < sessionQuestions.length - 1 ? (
          <button onClick={handleNextQuestion} disabled={isSubmitted}>
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} className="submit-btn">
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default ExerciseScreen;
