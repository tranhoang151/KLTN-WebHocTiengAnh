import React, { useState, useEffect } from 'react';
import {
  FlashcardSet,
  flashcardService,
} from '../../services/flashcardService';
import { useAuth } from '../../contexts/AuthContext';

interface FlashcardSetSelectorProps {
  courseId: string;
  onSelectSet: (set: FlashcardSet) => void;
  onBack?: () => void;
}

const FlashcardSetSelector: React.FC<FlashcardSetSelectorProps> = ({
  courseId,
  onSelectSet,
  onBack,
}) => {
  const { user } = useAuth();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFlashcardSets();
  }, [courseId]);

  const loadFlashcardSets = async () => {
    try {
      setLoading(true);
      setError(null);
      const flashcardSets =
        await flashcardService.getFlashcardSetsByCourse(courseId);
      setSets(flashcardSets);
    } catch (err: any) {
      setError(err.message || 'Failed to load flashcard sets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flashcard-selector-loading">
        <div className="loading-spinner"></div>
        <p>Loading flashcard sets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flashcard-selector-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Flashcard Sets</h3>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={loadFlashcardSets} className="btn-primary">
            Try Again
          </button>
          {onBack && (
            <button onClick={onBack} className="btn-secondary">
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div className="flashcard-selector-empty">
        <div className="empty-icon">📚</div>
        <h3>No Flashcard Sets Available</h3>
        <p>There are no flashcard sets available for this course yet.</p>
        {onBack && (
          <button onClick={onBack} className="btn-secondary">
            Go Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flashcard-selector">
      <div className="selector-header">
        {onBack && (
          <button onClick={onBack} className="btn-back">
            ← Back
          </button>
        )}
        <div className="header-content">
          <h2>Choose a Flashcard Set</h2>
          <p>Select a flashcard set to start learning</p>
        </div>
      </div>

      <div className="sets-grid">
        {sets.map((set) => (
          <div
            key={set.id}
            className="set-card"
            onClick={() => onSelectSet(set)}
          >
            <div className="set-card-header">
              <h3>{set.title}</h3>
              <div className="set-meta">
                <span className="set-id">#{set.set_id}</span>
              </div>
            </div>

            <div className="set-description">
              <p>{set.description || 'No description available'}</p>
            </div>

            <div className="set-card-footer">
              <div className="set-stats">
                <span className="stat">
                  <span className="stat-icon">📅</span>
                  {new Date(
                    set.created_at?.seconds * 1000 || Date.now()
                  ).toLocaleDateString()}
                </span>
              </div>

              <button className="btn-start">Start Learning →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashcardSetSelector;
