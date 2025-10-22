import React, { useState } from 'react';
import {
  FlashcardSet,
  FlashcardProgress,
} from '../../services/flashcardService';
import FlashcardSetSelector from './FlashcardSetSelector';
import FlashcardLearning from './FlashcardLearning';

interface FlashcardLearningFlowProps {
  courseId: string;
  onExit?: () => void;
}

type FlowState = 'selector' | 'learning' | 'completed';

const FlashcardLearningFlow: React.FC<FlashcardLearningFlowProps> = ({
  courseId,
  onExit,
}) => {
  const [flowState, setFlowState] = useState<FlowState>('selector');
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [completedProgress, setCompletedProgress] =
    useState<FlashcardProgress | null>(null);

  const handleSelectSet = (set: FlashcardSet) => {
    setSelectedSet(set);
    setFlowState('learning');
  };

  const handleLearningComplete = (progress: FlashcardProgress) => {
    setCompletedProgress(progress);
    setFlowState('completed');
  };

  const handleBackToSelector = () => {
    setSelectedSet(null);
    setCompletedProgress(null);
    setFlowState('selector');
  };

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      // Default behavior - go back to selector
      handleBackToSelector();
    }
  };

  if (flowState === 'selector') {
    return (
      <FlashcardSetSelector
        courseId={courseId}
        onSelectSet={handleSelectSet}
        onBack={onExit}
      />
    );
  }

  if (flowState === 'learning' && selectedSet) {
    return (
      <FlashcardLearning
        setId={selectedSet.id}
        courseId={courseId}
        setTitle={selectedSet.title}
        onComplete={handleLearningComplete}
        onExit={handleBackToSelector}
      />
    );
  }

  if (flowState === 'completed' && completedProgress && selectedSet) {
    return (
      <div className="flashcard-completion">
        <div className="completion-content">
          <div className="completion-icon">🎉</div>
          <h2>Congratulations!</h2>
          <p>You've completed the flashcard set:</p>
          <h3>"{selectedSet.title}"</h3>

          <div className="completion-stats">
            <div className="stat-item">
              <div className="stat-value">
                {completedProgress.completionPercentage || 0}%
              </div>
              <div className="stat-label">Completion</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {completedProgress.learnedCardIds?.length || 0}
              </div>
              <div className="stat-label">Cards Learned</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {Math.floor((completedProgress.timeSpent || 0) / 60)}m
              </div>
              <div className="stat-label">Time Spent</div>
            </div>
          </div>

          <div className="completion-actions">
            <button onClick={handleBackToSelector} className="btn-primary">
              Choose Another Set
            </button>
            <button onClick={handleExit} className="btn-secondary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default FlashcardLearningFlow;
