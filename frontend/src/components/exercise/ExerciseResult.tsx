import React from 'react';
import { ExerciseResult, QuestionResult } from '../../types';
import './ExerciseResult.css';

interface ExerciseResultDisplayProps {
  result: ExerciseResult;
  onRetry: () => void;
  onRetryIncorrect: (incorrectQuestions: QuestionResult[]) => void; // New prop
  onExit: () => void;
}

const ExerciseResultDisplay: React.FC<ExerciseResultDisplayProps> = ({
  result,
  onRetry,
  onRetryIncorrect,
  onExit,
}) => {
  const incorrectQuestions = result.questionResults.filter((q) => !q.isCorrect);

  return (
    <div className="exercise-result">
      <h2>Exercise Complete!</h2>
      <div className="score-summary">
        Your score: <span className="score">{result.score.toFixed(0)}%</span>
        <p>
          You answered {result.correctAnswers} out of {result.totalQuestions}{' '}
          questions correctly.
        </p>
      </div>

      <div className="answer-review">
        <h3>Answer Review</h3>
        {result.questionResults.map((qResult, index) => (
          <div
            key={qResult.questionId}
            className={`review-item ${qResult.isCorrect ? 'correct' : 'incorrect'}`}
          >
            <p>
              <strong>Question {index + 1}:</strong>{' '}
              {qResult.isCorrect ? 'Correct' : 'Incorrect'}
            </p>
            <p>Your answer: {qResult.userAnswer}</p>
            {!qResult.isCorrect && (
              <p>Correct answer: {qResult.correctAnswer}</p>
            )}
            {qResult.explanation && (
              <p className="explanation">
                <strong>Explanation:</strong> {qResult.explanation}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="result-actions">
        <button onClick={onRetry} className="retry-btn">
          Try Again (All)
        </button>
        {incorrectQuestions.length > 0 && (
          <button
            onClick={() => onRetryIncorrect(incorrectQuestions)}
            className="retry-incorrect-btn"
          >
            Retry Incorrect ({incorrectQuestions.length})
          </button>
        )}
        <button onClick={onExit} className="exit-btn">
          Exit
        </button>
      </div>
    </div>
  );
};

export default ExerciseResultDisplay;


