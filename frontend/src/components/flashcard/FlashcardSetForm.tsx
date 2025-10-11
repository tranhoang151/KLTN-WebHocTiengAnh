import React, { useState, useEffect } from 'react';
import {
  FlashcardSet,
  flashcardService,
} from '../../services/flashcardService';
import { useAuth } from '../../contexts/AuthContext';
import './FlashcardSetForm.css';

interface FlashcardSetFormProps {
  courseId?: string;
  editingSet?: FlashcardSet | null;
  onSave: () => void;
  onCancel: () => void;
}

interface FormData {
  title: string;
  description: string;
  courseId: string;
  assignedClassIds: string[];
}

const FlashcardSetForm: React.FC<FlashcardSetFormProps> = ({
  courseId,
  editingSet,
  onSave,
  onCancel,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    courseId: courseId || '',
    assignedClassIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    if (editingSet) {
      setFormData({
        title: editingSet.title,
        description: editingSet.description,
        courseId: editingSet.courseId,
        assignedClassIds: editingSet.assignedClassIds || [],
      });
    }
    loadCourses();
    loadClasses();
  }, [editingSet]);

  const loadCourses = async () => {
    try {
      // This would be implemented in a course service
      // For now, we'll use a placeholder
      setCourses([]);
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  };

  const loadClasses = async () => {
    try {
      // This would be implemented in a class service
      // For now, we'll use a placeholder
      setClasses([]);
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClassSelection = (classId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      assignedClassIds: checked
        ? [...prev.assignedClassIds, classId]
        : prev.assignedClassIds.filter((id) => id !== classId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.courseId) {
      setError('Course selection is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editingSet) {
        await flashcardService.updateFlashcardSet(editingSet.id, formData);
      } else {
        await flashcardService.createFlashcardSet(formData);
      }

      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to save flashcard set');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flashcard-set-form">
      <div className="form-header">
        <h2>
          {editingSet ? 'Edit Flashcard Set' : 'Create New Flashcard Set'}
        </h2>
        <button onClick={onCancel} className="btn-close">
          ✕
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter flashcard set title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter a description for this flashcard set"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="courseId">Course *</label>
          {courseId ? (
            <input
              type="text"
              value={courseId}
              disabled
              className="disabled-input"
            />
          ) : (
            <select
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {classes.length > 0 && (
          <div className="form-group">
            <label>Assign to Classes</label>
            <div className="class-selection">
              {classes.map((classItem) => (
                <label key={classItem.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.assignedClassIds.includes(classItem.id)}
                    onChange={(e) =>
                      handleClassSelection(classItem.id, e.target.checked)
                    }
                  />
                  <span className="checkbox-text">{classItem.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : editingSet ? 'Update Set' : 'Create Set'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlashcardSetForm;
