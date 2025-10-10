import React, { useState, useEffect } from 'react';
import {
  FlashcardSet,
  flashcardService,
} from '../../services/flashcardService';
import { useAuth } from '../../contexts/AuthContext';
import FlashcardSetForm from './FlashcardSetForm';
import FlashcardEditor from './FlashcardEditor';
import AssignDialog from './AssignDialog'; // Import the new dialog
import './FlashcardSetManager.css';

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
    }
  };

  const handleSetSaved = async () => {
    setShowCreateForm(false);
    setEditingSet(null);
    await loadFlashcardSets();
  };

  const handleManageCards = (set: FlashcardSet) => {
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
    await loadFlashcardSets(); // Refresh data to show updated assignments
  };

  if (selectedSet) {
    return (
      <FlashcardEditor
        flashcardSet={selectedSet}
        onBack={() => setSelectedSet(null)}
      />
    );
  }

  if (showCreateForm) {
    return (
      <FlashcardSetForm
        courseId={courseId}
        editingSet={editingSet}
        onSave={handleSetSaved}
        onCancel={() => {
          setShowCreateForm(false);
          setEditingSet(null);
        }}
      />
    );
  }

  if (assigningSet) {
    return (
      <AssignDialog
        flashcardSet={assigningSet}
        onClose={handleCloseAssignDialog}
        onSave={handleAssignSave}
      />
    );
  }

  if (loading) {
    return (
      <div className="flashcard-manager-loading">
        <div className="loading-spinner"></div>
        <p>Loading flashcard sets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flashcard-manager-error">
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

  return (
    <div className="flashcard-set-manager">
      <div className="manager-header">
        {onBack && (
          <button onClick={onBack} className="btn-back">
            ← Back
          </button>
        )}
        <div className="header-content">
          <h2>Flashcard Set Management</h2>
          <p>Create and manage flashcard sets for learning</p>
        </div>
        <button onClick={handleCreateSet} className="btn-primary">
          + Create New Set
        </button>
      </div>

      {sets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No Flashcard Sets</h3>
          <p>Create your first flashcard set to get started.</p>
          <button onClick={handleCreateSet} className="btn-primary">
            Create First Set
          </button>
        </div>
      ) : (
        <div className="sets-grid">
          {sets.map((set) => (
            <div key={set.id} className="set-management-card">
              <div className="set-card-header">
                <h3>{set.title}</h3>
                <div className="set-actions">
                  <button
                    onClick={() => handleEditSet(set)}
                    className="btn-icon"
                    title="Edit Set"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteSet(set.id)}
                    className="btn-icon btn-danger"
                    title="Delete Set"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="set-description">
                <p>{set.description || 'No description available'}</p>
              </div>

              <div className="set-meta">
                <div className="meta-item">
                  <span className="meta-label">Course:</span>
                  <span className="meta-value">{set.course_id}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Created:</span>
                  <span className="meta-value">
                    {new Date(
                      set.created_at?.seconds * 1000 || Date.now()
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Status:</span>
                  <span
                    className={`status ${set.is_active ? 'active' : 'inactive'}`}
                  >
                    {set.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="set-card-footer">
                <button
                  onClick={() => handleOpenAssignDialog(set)}
                  className="btn-secondary"
                >
                  Assign
                </button>
                <button
                  onClick={() => handleManageCards(set)}
                  className="btn-primary"
                >
                  Manage Cards
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardSetManager;
