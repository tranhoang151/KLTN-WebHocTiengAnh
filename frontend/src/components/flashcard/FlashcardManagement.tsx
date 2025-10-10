import React, { useState } from 'react';
import { FlashcardSetManager } from './index';
import { useAuth } from '../../contexts/AuthContext';
import './FlashcardManagement.css';

interface FlashcardManagementProps {
  courseId?: string;
}

const FlashcardManagement: React.FC<FlashcardManagementProps> = ({
  courseId,
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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

  if (!isOpen) {
    return (
      <div className="flashcard-management-trigger">
        <button
          onClick={() => setIsOpen(true)}
          className="btn-manage-flashcards"
        >
          📚 Manage Flashcards
        </button>
      </div>
    );
  }

  return (
    <div className="flashcard-management-container">
      <FlashcardSetManager
        courseId={courseId}
        onBack={() => setIsOpen(false)}
      />
    </div>
  );
};

export default FlashcardManagement;
