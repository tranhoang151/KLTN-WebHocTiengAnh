import React, { useState, useEffect } from 'react';
import { Question } from '../../types';
import './FillBlankQuestion.css';

interface FillBlankQuestionProps {
  question: Question;
  userAnswer?: string;
  onAnswerChange: (questionId: string, answer: string) => void;
  isSubmitted?: boolean;
  correctAnswer?: string | number; // Pass correct answer for feedback after submission
}

const FillBlankQuestion: React.FC<FillBlankQuestionProps> = ({
  question,
  userAnswer,
  onAnswerChange,
  isSubmitted,
  correctAnswer,
}) => {
  const [inputValue, setInputValue] = useState(userAnswer || '');
  const [showLiveFeedback, setShowLiveFeedback] = useState(false); // Feedback while typing/on blur

  useEffect(() => {
    setInputValue(userAnswer || '');
  }, [userAnswer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isSubmitted) {
      onAnswerChange(question.id, e.target.value);
    }
  };

  const handleBlur = () => {
    if (!isSubmitted) {
      setShowLiveFeedback(true);
    }
  };

  const getLiveFeedbackClassName = () => {
    if (!showLiveFeedback || !inputValue || isSubmitted) return '';
    return inputValue.toLowerCase() ===
      String(question.correct_answer).toLowerCase()
      ? 'correct-feedback'
      : 'incorrect-feedback';
  };

  const renderQuestionContent = () => {
    const blankPlaceholder = '_____';
    const parts = question.content.split(blankPlaceholder);

    return (
      <p className="question-text">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <input
                type="text"
                className="fill-blank-input"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={isSubmitted}
                placeholder="Your answer"
              />
            )}
          </React.Fragment>
        ))}
        {isSubmitted && (
          <span className="submitted-correct-answer">
            ({String(correctAnswer || question.correct_answer)})
          </span>
        )}
      </p>
    );
  };

  const isAnswerCorrect =
    inputValue.toLowerCase() === String(question.correct_answer).toLowerCase();

  return (
    <div className="fb-question">
      {renderQuestionContent()}
      {!isSubmitted && showLiveFeedback && inputValue && (
        <div className={`feedback ${getLiveFeedbackClassName()}`}>
          {isAnswerCorrect
            ? 'Correct!'
            : `Incorrect. The correct answer is: ${question.correct_answer}`}
        </div>
      )}
      {isSubmitted && (
        <div
          className={`feedback submitted-feedback ${isAnswerCorrect ? 'correct-feedback' : 'incorrect-feedback'}`}
        >
          Your answer: {inputValue}{' '}
          {isAnswerCorrect ? ' (Correct)' : ' (Incorrect)'}
          {!isAnswerCorrect && <p>Correct answer: {question.correct_answer}</p>}
        </div>
      )}
    </div>
  );
};

export default FillBlankQuestion;
