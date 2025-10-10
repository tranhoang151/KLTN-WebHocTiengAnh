import React, { useState, useEffect } from 'react';
import {
  FlashcardSet,
  Flashcard,
  flashcardService,
} from '../../services/flashcardService';
import FlashcardForm from './FlashcardForm';
import './FlashcardEditor.css';

interface FlashcardEditorProps {
  flashcardSet: FlashcardSet;
  onBack: () => void;
}

const FlashcardEditor: React.FC<FlashcardEditorProps> = ({
  flashcardSet,
  onBack,
}) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [draggedCard, setDraggedCard] = useState<Flashcard | null>(null);

  useEffect(() => {
    loadFlashcards();
  }, [flashcardSet.id]);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);
      const cards = await flashcardService.getFlashcardsBySet(flashcardSet.id);
      // Sort by order
      cards.sort((a, b) => a.order - b.order);
      setFlashcards(cards);
    } catch (err: any) {
      setError(err.message || 'Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = () => {
    setEditingCard(null);
    setShowCreateForm(true);
  };

  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card);
    setShowCreateForm(true);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm('Are you sure you want to delete this flashcard?')) {
      return;
    }

    try {
      await flashcardService.deleteFlashcard(cardId);
      await loadFlashcards();
    } catch (err: any) {
      setError(err.message || 'Failed to delete flashcard');
    }
  };

  const handleCardSaved = async () => {
    setShowCreateForm(false);
    setEditingCard(null);
    await loadFlashcards();
  };

  const handleDragStart = (e: React.DragEvent, card: Flashcard) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetCard: Flashcard) => {
    e.preventDefault();

    if (!draggedCard || draggedCard.id === targetCard.id) {
      setDraggedCard(null);
      return;
    }

    try {
      // Reorder flashcards
      const newFlashcards = [...flashcards];
      const draggedIndex = newFlashcards.findIndex(
        (c) => c.id === draggedCard.id
      );
      const targetIndex = newFlashcards.findIndex(
        (c) => c.id === targetCard.id
      );

      // Remove dragged card and insert at target position
      newFlashcards.splice(draggedIndex, 1);
      newFlashcards.splice(targetIndex, 0, draggedCard);

      // Update order values
      const updatedCards = newFlashcards.map((card, index) => ({
        ...card,
        order: index + 1,
      }));

      setFlashcards(updatedCards);

      // Save new order to backend
      await flashcardService.reorderFlashcards(flashcardSet.id, updatedCards);
    } catch (err: any) {
      setError(err.message || 'Failed to reorder flashcards');
      await loadFlashcards(); // Reload to reset order
    } finally {
      setDraggedCard(null);
    }
  };

  if (showCreateForm) {
    return (
      <FlashcardForm
        flashcardSetId={flashcardSet.id}
        editingCard={editingCard}
        nextOrder={flashcards.length + 1}
        onSave={handleCardSaved}
        onCancel={() => {
          setShowCreateForm(false);
          setEditingCard(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flashcard-editor-loading">
        <div className="loading-spinner"></div>
        <p>Loading flashcards...</p>
      </div>
    );
  }

  return (
    <div className="flashcard-editor">
      <div className="editor-header">
        <button onClick={onBack} className="btn-back">
          ← Back to Sets
        </button>
        <div className="header-content">
          <h2>{flashcardSet.title}</h2>
          <p>{flashcards.length} flashcards</p>
        </div>
        <button onClick={handleCreateCard} className="btn-primary">
          + Add Flashcard
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {flashcards.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📇</div>
          <h3>No Flashcards</h3>
          <p>Add your first flashcard to get started.</p>
          <button onClick={handleCreateCard} className="btn-primary">
            Add First Flashcard
          </button>
        </div>
      ) : (
        <div className="flashcards-list">
          <div className="list-header">
            <span className="drag-hint">
              💡 Drag and drop to reorder flashcards
            </span>
          </div>

          {flashcards.map((card) => (
            <div
              key={card.id}
              className={`flashcard-item ${draggedCard?.id === card.id ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, card)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, card)}
            >
              <div className="card-order">
                <span className="order-number">{card.order}</span>
                <div className="drag-handle">⋮⋮</div>
              </div>

              <div className="card-content">
                <div className="card-front">
                  <div className="card-text">
                    <strong>Front:</strong> {card.front_text}
                  </div>
                  {card.image_url && (
                    <div className="card-image">
                      <img src={card.image_url} alt="Flashcard" />
                    </div>
                  )}
                </div>

                <div className="card-back">
                  <div className="card-text">
                    <strong>Back:</strong> {card.back_text}
                  </div>
                  {card.example_sentence && (
                    <div className="card-example">
                      <strong>Example:</strong> {card.example_sentence}
                    </div>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <button
                  onClick={() => handleEditCard(card)}
                  className="btn-icon"
                  title="Edit Card"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  className="btn-icon btn-danger"
                  title="Delete Card"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardEditor;
