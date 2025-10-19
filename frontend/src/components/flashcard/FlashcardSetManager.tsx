import React, { useState, useEffect } from 'react';
import {
  FlashcardSet,
  flashcardService,
} from '../../services/flashcardService';
import { useAuth } from '../../contexts/AuthContext';
import FlashcardSetForm from './FlashcardSetForm';
import FlashcardEditor from './FlashcardEditor';
import AssignDialog from './AssignDialog'; // Import the new dialog
import { BackButton } from '../BackButton';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  UserCheck,
} from 'lucide-react';

interface FlashcardSetManagerProps {
  courseId?: string;
  onBack?: () => void;
}

const FlashcardSetManager: React.FC<FlashcardSetManagerProps> = ({
  courseId,
  onBack,
}) => {
  const { user } = useAuth();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSet, setEditingSet] = useState<FlashcardSet | null>(null);
  const [assigningSet, setAssigningSet] = useState<FlashcardSet | null>(null); // State for assignment dialog
  const [hoveredEditButton, setHoveredEditButton] = useState<string | null>(
    null
  );
  const [hoveredDeleteButton, setHoveredDeleteButton] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadFlashcardSets();
  }, [courseId]);

  const loadFlashcardSets = async () => {
    try {
      setLoading(true);
      setError(null);

      let flashcardSets: FlashcardSet[];
      if (courseId) {
        flashcardSets =
          await flashcardService.getFlashcardSetsByCourse(courseId);
      } else {
        flashcardSets = await flashcardService.getAllFlashcardSets();
      }

      setSets(flashcardSets);
    } catch (err: any) {
      setError(err.message || 'Failed to load flashcard sets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSet = () => {
    setShowCreateForm(true);
    setEditingSet(null);
  };

  const handleEditSet = (set: FlashcardSet) => {
    setEditingSet(set);
    setShowCreateForm(true);
  };

  const handleDeleteSet = async (setId: string) => {
    if (
      !window.confirm('Are you sure you want to delete this flashcard set?')
    ) {
      return;
    }

    try {
      await flashcardService.deleteFlashcardSet(setId);
      await loadFlashcardSets();
    } catch (err: any) {
      setError(err.message || 'Failed to delete flashcard set');
      console.error('Delete error:', err);
    }
  };

  const handleSetSaved = async () => {
    setShowCreateForm(false);
    setEditingSet(null);
    await loadFlashcardSets();
  };

  const handleManageCards = (set: FlashcardSet) => {
    console.log('Selected set:', set);
    // Ensure the set has an id, fallback to setId if id is missing
    if (!set.id && set.setId) {
      set.id = set.setId;
    }
    setSelectedSet(set);
  };

  const handleOpenAssignDialog = (set: FlashcardSet) => {
    setAssigningSet(set);
  };

  const handleCloseAssignDialog = () => {
    setAssigningSet(null);
  };

  const handleAssignSave = async () => {
    setAssigningSet(null);
    await loadFlashcardSets();
  };

  if (selectedSet) {
    return (
      <FlashcardEditor
        flashcardSet={selectedSet}
        onBack={() => setSelectedSet(null)}
      />
    );
  }

  // Remove the early return for showCreateForm - we'll render it as overlay instead

  // Remove the early return for assigningSet - we'll render it as overlay instead

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
            Loading Flashcard Sets
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0',
            }}
          >
            Please wait while we load your flashcard sets...
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

  if (error) {
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
            maxWidth: '500px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            }}
          >
            <AlertCircle size={24} color="white" />
          </div>
          <h3
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0',
            }}
          >
            Error Loading Flashcard Sets
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0 0 24px 0',
              lineHeight: '1.5',
            }}
          >
            {error}
          </p>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={loadFlashcardSets}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
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
              <RefreshCw size={16} />
              Try Again
            </button>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                  color: '#374151',
                  border: '1px solid #cbd5e1',
                  padding: '12px 20px',
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
                    '0 8px 25px rgba(59, 130, 246, 0.3)';
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
                Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: onBack ? '100vh' : 'auto',
        background: onBack ? '#f8fafc' : 'transparent',
        padding: onBack ? '20px' : '0',
      }}
    >
      {/* Back Button - only show when onBack prop is provided */}
      {onBack && (
        <div style={{ marginBottom: '24px' }}>
          <BackButton to="/admin" label="Back to Dashboard" />
        </div>
      )}

      <div
        style={{
          maxWidth: onBack ? '1200px' : '100%',
          margin: onBack ? '0 auto' : '0',
        }}
      >
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
                <BookOpen size={28} color="white" />
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
                  Flashcard Set Management
                </h1>
                <p
                  style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    margin: '0',
                    fontWeight: '500',
                  }}
                >
                  Create and manage flashcard sets for learning
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateSet}
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
              Create New Set
            </button>
          </div>
        </div>

        {sets.length === 0 ? (
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
              <BookOpen size={40} color="#6b7280" />
            </div>
            <h3
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1f2937',
                margin: '0 0 12px 0',
              }}
            >
              No Flashcard Sets
            </h3>
            <p
              style={{
                fontSize: '16px',
                color: '#6b7280',
                margin: '0 0 32px 0',
                lineHeight: '1.5',
              }}
            >
              Create your first flashcard set to get started with interactive
              learning.
            </p>
            <button
              onClick={handleCreateSet}
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
              Create First Set
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '24px',
            }}
          >
            {sets.map((set) => (
              <div
                key={set.id}
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
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow =
                    '0 8px 32px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 20px rgba(0, 0, 0, 0.08)';
                }}
              >
                {/* Status Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '16px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: set.isActive
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {set.isActive ? 'ACTIVE' : 'INACTIVE'}
                </div>

                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                    paddingRight: '80px',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <FileText size={24} color="white" />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: '0 0 4px 0',
                      }}
                    >
                      {set.title}
                    </h3>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: '0',
                      }}
                    >
                      {set.description || 'No description available'}
                    </p>
                  </div>
                </div>

                {/* Action Icons */}
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '90px',
                    display: 'flex',
                    gap: '8px',
                  }}
                >
                  <button
                    onClick={() => handleEditSet(set)}
                    style={{
                      width: '32px',
                      height: '32px',
                      background:
                        hoveredEditButton === set.id
                          ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                          : 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                      border: `1px solid ${hoveredEditButton === set.id ? '#3b82f6' : '#cbd5e1'}`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform:
                        hoveredEditButton === set.id
                          ? 'translateY(-2px)'
                          : 'translateY(0)',
                      boxShadow:
                        hoveredEditButton === set.id
                          ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                          : 'none',
                    }}
                    onMouseEnter={() => setHoveredEditButton(set.id)}
                    onMouseLeave={() => setHoveredEditButton(null)}
                    title="Edit Set"
                  >
                    <Edit
                      size={16}
                      color={hoveredEditButton === set.id ? 'white' : '#6b7280'}
                    />
                  </button>
                  <button
                    onClick={() => handleDeleteSet(set.id)}
                    style={{
                      width: '32px',
                      height: '32px',
                      background:
                        hoveredDeleteButton === set.id
                          ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                          : 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                      border: `1px solid ${hoveredDeleteButton === set.id ? '#ef4444' : '#fecaca'}`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform:
                        hoveredDeleteButton === set.id
                          ? 'translateY(-2px)'
                          : 'translateY(0)',
                      boxShadow:
                        hoveredDeleteButton === set.id
                          ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                          : 'none',
                    }}
                    onMouseEnter={() => setHoveredDeleteButton(set.id)}
                    onMouseLeave={() => setHoveredDeleteButton(null)}
                    title="Delete Set"
                  >
                    <Trash2
                      size={16}
                      color={
                        hoveredDeleteButton === set.id ? 'white' : '#ef4444'
                      }
                    />
                  </button>
                </div>

                {/* Details */}
                <div
                  style={{
                    display: 'grid',
                    gap: '12px',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <BookOpen size={16} color="#6b7280" />
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: '500',
                      }}
                    >
                      Course:
                    </span>
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#1f2937',
                        fontWeight: '600',
                      }}
                    >
                      {set.courseId}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Calendar size={16} color="#6b7280" />
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: '500',
                      }}
                    >
                      Created:
                    </span>
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#1f2937',
                        fontWeight: '600',
                      }}
                    >
                      {new Date(
                        set.createdAt?.getTime?.() || Date.now()
                      ).toLocaleDateString()}
                    </span>
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
                    onClick={() => handleOpenAssignDialog(set)}
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
                    <UserCheck size={16} />
                    Assign
                  </button>
                  <button
                    onClick={() => handleManageCards(set)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 16px',
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
                      e.currentTarget.style.transform =
                        'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                  >
                    <FileText size={16} />
                    Manage Cards
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flashcard Set Form Popup Overlay */}
      {showCreateForm && (
        <FlashcardSetForm
          courseId={courseId}
          editingSet={editingSet}
          onSave={handleSetSaved}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingSet(null);
          }}
        />
      )}

      {/* Assign Dialog Popup Overlay */}
      {assigningSet && (
        <AssignDialog
          flashcardSet={assigningSet}
          onClose={handleCloseAssignDialog}
          onSave={handleAssignSave}
        />
      )}
    </div>
  );
};

export default FlashcardSetManager;
