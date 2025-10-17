import React from 'react';
import FlashcardSetManager from './FlashcardSetManager';
import { useAuth } from '../../contexts/AuthContext';

interface FlashcardManagementProps {
  courseId?: string;
}

const FlashcardManagement: React.FC<FlashcardManagementProps> = ({
  courseId,
}) => {
  const { user } = useAuth();

  // Check if user has permission to manage flashcards
  const canManageFlashcards =
    user?.role === 'admin' || user?.role === 'teacher';

  if (!canManageFlashcards) {
    return (
      <div className="flashcard-management-unauthorized">
        <p>You don't have permission to manage flashcards.</p>
      </div>
    );
  }

  return (
    <div className="flashcard-management-container">
      <FlashcardSetManager courseId={courseId} onBack={undefined} />
    </div>
  );
};

export default FlashcardManagement;
