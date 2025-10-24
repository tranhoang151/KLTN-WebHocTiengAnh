import React, { useState } from 'react';
import { Question } from '../../types';
import './MultipleChoiceQuestion.css';

interface MultipleChoiceQuestionProps {
  question: Question;
  selectedAnswer?: string;
  onAnswerSelect: (questionId: string, answer: string) => void;
  isSubmitted?: boolean;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswerSelect,
  isSubmitted,
}) => {
  const [showFeedback, setShowFeedback] = useState(false);

  const handleOptionClick = (option: string) => {
    if (isSubmitted) return;
    onAnswerSelect(question.id, option);
    setShowFeedback(true);
  };

  const getOptionClassName = (option: string) => {
    if (!showFeedback && !isSubmitted) {
      return selectedAnswer === option ? 'selected' : '';
    }

    const isCorrect = option === question.correct_answer;
    const isSelected = option === selectedAnswer;

    if (isCorrect) return 'correct';
    if (isSelected) return 'incorrect';
    return '';
  };

  return (
    <div className="mc-question">
      <h3 className="question-text">{question.content}</h3>
      <div className="options-container">
        {question.options?.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`option-btn ${getOptionClassName(option)}`}
            disabled={isSubmitted || showFeedback}
          >
            {option}
          </button>
        ))}
      </div>
      {showFeedback && !isSubmitted && (
        <div
          className={`feedback ${selectedAnswer === question.correct_answer ? 'correct-feedback' : 'incorrect-feedback'}`}
        >
          {selectedAnswer === question.correct_answer
            ? 'Correct!'
            : `Incorrect. The correct answer is: ${question.correct_answer}`}
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceQuestion;
