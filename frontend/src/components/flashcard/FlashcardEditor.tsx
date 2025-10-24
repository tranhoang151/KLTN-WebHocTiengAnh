import React, { useState, useEffect } from 'react';
import {
  FlashcardSet,
  Flashcard,
  flashcardService,
} from '../../services/flashcardService';
import FlashcardForm from './FlashcardForm';
import { BackButton } from '../BackButton';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  RefreshCw,
  FileText,
  ArrowRight,
  GripVertical,
  Lightbulb,
  Image,
} from 'lucide-react';
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

  // Ensure the flashcardSet has an id
  const setId = flashcardSet.id || flashcardSet.setId || '';

  useEffect(() => {
    if (setId) {
      loadFlashcards();
    } else {
      setError('Invalid flashcard set: missing ID');
      setLoading(false);
    }
  }, [setId]);

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);
      const cards = await flashcardService.getFlashcardsBySetId(setId);
      console.log('Fetched cards:', cards);
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
      await flashcardService.reorderFlashcards(setId, updatedCards);
    } catch (err: any) {
      setError(err.message || 'Failed to reorder flashcards');
      await loadFlashcards(); // Reload to reset order
    } finally {
      setDraggedCard(null);
    }
  };

  // Remove the early return for showCreateForm - we'll render it as overlay instead

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f8fafc',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            textAlign: 'center',
            maxWidth: '400px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }}
          ></div>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 8px 0',
            }}
          >
            Loading Flashcards
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0',
            }}
          >
            Please wait while we load your flashcards...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Back Button */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              color: '#374151',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #3b82f6, #1d4ed8)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow =
                '0 8px 25px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
              e.currentTarget.style.color = '#374151';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(0, 0, 0, 0.08)';
            }}
          >
            <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
            Back to Sets
          </button>
        </div>

        {/* Header Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e5e7eb',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decorations */}
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '50%',
              opacity: '0.05',
              zIndex: 0,
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              borderRadius: '50%',
              opacity: '0.05',
              zIndex: 0,
            }}
          ></div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                }}
              >
                <FileText size={28} color="white" />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #1f2937, #374151)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: '0 0 8px 0',
                  }}
                >
                  {flashcardSet.title}
                </h1>
                <p
                  style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    margin: '0',
                    fontWeight: '500',
                  }}
                >
                  {flashcards.length} flashcards in this set
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateCard}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow =
                  '0 8px 25px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              <Plus size={18} />
              Add Flashcard
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={16} color="white" />
            </div>
            <span
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#dc2626',
              }}
            >
              {error}
            </span>
          </div>
        )}

        {flashcards.length === 0 ? (
          <div
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '20px',
              padding: '48px',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e5e7eb',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
              }}
            >
              <FileText size={40} color="#6b7280" />
            </div>
            <h3
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 12px 0',
              }}
            >
              No Flashcards
            </h3>
            <p
              style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '0 0 32px 0',
                lineHeight: '1.5',
              }}
            >
              Add your first flashcard to get started with this set.
            </p>
            <button
              onClick={handleCreateCard}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                margin: '0 auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform =
                  'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow =
                  '0 8px 25px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              <Plus size={18} />
              Add First Flashcard
            </button>
          </div>
        ) : (
          <div>
            {/* Drag Hint */}
            <div
              style={{
                background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                border: '1px solid #bae6fd',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Lightbulb size={16} color="white" />
              </div>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#0369a1',
                }}
              >
                Drag and drop to reorder flashcards
              </span>
            </div>

            {/* Flashcards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: '24px',
              }}
            >
              {flashcards.map((card) => (
                <div
                  key={card.id}
                  style={{
                    background:
                      'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'grab',
                    opacity: draggedCard?.id === card.id ? 0.5 : 1,
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, card)}
                  onMouseEnter={(e) => {
                    if (draggedCard?.id !== card.id) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow =
                        '0 8px 32px rgba(0, 0, 0, 0.12)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (draggedCard?.id !== card.id) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow =
                        '0 4px 20px rgba(0, 0, 0, 0.08)';
                    }
                  }}
                >
                  {/* Order Number and Drag Handle */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      {card.order}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#6b7280',
                      }}
                    >
                      <GripVertical size={16} />
                      <span style={{ fontSize: '12px', fontWeight: '500' }}>
                        Drag
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div
                    style={{
                      marginBottom: '20px',
                    }}
                  >
                    {/* Front */}
                    <div
                      style={{
                        marginBottom: '16px',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
                        borderRadius: '12px',
                        border: '1px solid #bae6fd',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                        }}
                      >
                        <BookOpen size={16} color="#0ea5e9" />
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#0369a1',
                            textTransform: 'uppercase',
                          }}
                        >
                          Front
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: '16px',
                          color: '#1f2937',
                          margin: '0',
                          fontWeight: '500',
                        }}
                      >
                        {card.frontText}
                      </p>
                      {(card.imageUrl || card.imageBase64) && (
                        <div
                          style={{
                            marginTop: '12px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={card.imageUrl || (card.imageBase64 ? `data:image/jpeg;base64,${card.imageBase64}` : '')}
                            alt="Flashcard"
                            style={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '16px',
                      }}
                    >
                      <ArrowRight size={20} color="#6b7280" />
                    </div>

                    {/* Back */}
                    <div
                      style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                        borderRadius: '12px',
                        border: '1px solid #bbf7d0',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                        }}
                      >
                        <BookOpen size={16} color="#10b981" />
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#059669',
                            textTransform: 'uppercase',
                          }}
                        >
                          Back
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: '16px',
                          color: '#1f2937',
                          margin: '0 0 12px 0',
                          fontWeight: '500',
                        }}
                      >
                        {card.backText}
                      </p>
                      {card.exampleSentence && (
                        <div
                          style={{
                            padding: '12px',
                            background: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: '8px',
                            border: '1px solid #a7f3d0',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginBottom: '6px',
                            }}
                          >
                            <Lightbulb size={14} color="#f59e0b" />
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#d97706',
                                textTransform: 'uppercase',
                              }}
                            >
                              Example
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: '14px',
                              color: '#374151',
                              margin: '0',
                              fontStyle: 'italic',
                            }}
                          >
                            {card.exampleSentence}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                    }}
                  >
                    <button
                      onClick={() => handleEditCard(card)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                        color: '#374151',
                        border: '1px solid #cbd5e1',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow =
                          '0 4px 12px rgba(59, 130, 246, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                        e.currentTarget.style.color = '#374151';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          'linear-gradient(135deg, #ef4444, #dc2626)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.borderColor = '#ef4444';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow =
                          '0 4px 12px rgba(239, 68, 68, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          'linear-gradient(135deg, #fef2f2, #fee2e2)';
                        e.currentTarget.style.color = '#dc2626';
                        e.currentTarget.style.borderColor = '#fecaca';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Flashcard Form Popup Overlay */}
      {showCreateForm && (
        <FlashcardForm
          flashcardSetId={setId}
          editingCard={editingCard}
          nextOrder={flashcards.length + 1}
          onSave={handleCardSaved}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingCard(null);
          }}
        />
      )}
    </div>
  );
};

export default FlashcardEditor;
