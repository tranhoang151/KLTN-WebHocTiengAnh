import React, { useState, useEffect } from 'react';
import {
  FlashcardSet,
  flashcardService,
} from '../../services/flashcardService';
import { classService } from '../../services/classService';
import { Class } from '../../types';
import './AssignDialog.css';

interface AssignDialogProps {
  flashcardSet: FlashcardSet;
  onClose: () => void;
  onSave: () => void;
}

const AssignDialog: React.FC<AssignDialogProps> = ({
  flashcardSet,
  onClose,
  onSave,
}) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const teacherClasses = await classService.getTeacherClasses();
        setClasses(teacherClasses as any[]);
        setSelectedClassIds(new Set(flashcardSet.assignedClassIds || []));
      } catch (err: any) {
        setError(err.message || 'Failed to load classes.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [flashcardSet]);

  const handleCheckboxChange = (classId: string) => {
    setSelectedClassIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await flashcardService.assignFlashcardSet(
        flashcardSet.id,
        Array.from(selectedClassIds)
      );
      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to save assignments.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="assign-dialog-overlay">
      <div className="assign-dialog">
        <div className="dialog-header">
          <h2>Assign Flashcard Set</h2>
          <button onClick={onClose} className="btn-close" disabled={saving}>
            ✕
          </button>
        </div>
        <div className="dialog-subheader">
          <p>
            Assign "<strong>{flashcardSet.title}</strong>" to one or more
            classes.
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="dialog-content">
          {loading ? (
            <div className="loading-spinner"></div>
          ) : classes.length === 0 ? (
            <p>You are not assigned to any classes.</p>
          ) : (
            <div className="class-list">
              {classes.map((cls) => (
                <label key={cls.id} className="class-item">
                  <input
                    type="checkbox"
                    checked={selectedClassIds.has(cls.id)}
                    onChange={() => handleCheckboxChange(cls.id)}
                    disabled={saving}
                  />
                  <div className="class-info">
                    <span className="class-name">{cls.name}</span>
                    <span className="class-description">{cls.description}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="dialog-actions">
          <button onClick={onClose} className="btn-secondary" disabled={saving}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={loading || saving}
          >
            {saving ? 'Saving...' : 'Save Assignments'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignDialog;
