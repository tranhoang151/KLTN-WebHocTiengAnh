import React, { useState, useEffect } from 'react';
import {
  FlashcardSet,
  flashcardService,
} from '../../services/flashcardService';
import { classService } from '../../services/classService';
import { Class } from '../../types';
import { X, Users, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
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
        {/* Modern Header */}
        <div className="dialog-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <h2
                style={{
                  margin: 0,
                  color: '#1e293b',
                  fontSize: '20px',
                  fontWeight: '600',
                }}
              >
                Assign Flashcard Set
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                Select classes to assign this flashcard set
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: '#f1f5f9',
              color: '#64748b',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.background = '#e2e8f0';
                e.currentTarget.style.color = '#475569';
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#64748b';
              }
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Flashcard Set Info */}
        <div className="dialog-subheader">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} color="#10b981" />
            <p style={{ margin: 0, color: '#374151', fontWeight: '500' }}>
              Assigning:{' '}
              <strong style={{ color: '#1e293b' }}>
                "{flashcardSet.title}"
              </strong>
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              margin: '16px 24px',
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Content */}
        <div className="dialog-content">
          {loading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #e2e8f0',
                  borderTop: '3px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                Loading classes...
              </p>
            </div>
          ) : classes.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                gap: '16px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                }}
              >
                <Users size={24} />
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '16px',
                  }}
                >
                  No Classes Available
                </p>
                <p
                  style={{
                    margin: '4px 0 0 0',
                    color: '#64748b',
                    fontSize: '14px',
                  }}
                >
                  You are not assigned to any classes yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="class-list">
              {classes.map((cls) => (
                <label key={cls.id} className="class-item">
                  <input
                    type="checkbox"
                    checked={selectedClassIds.has(cls.id)}
                    onChange={() => handleCheckboxChange(cls.id)}
                    disabled={saving}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#3b82f6',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
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

        {/* Modern Actions */}
        <div className="dialog-actions">
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: 'white',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: saving ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!saving) {
                e.currentTarget.style.background = '#f9fafb';
                e.currentTarget.style.borderColor = '#9ca3af';
              }
            }}
            onMouseLeave={(e) => {
              if (!saving) {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#d1d5db';
              }
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || saving}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: saving
                ? '#94a3b8'
                : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading || saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: saving ? 'none' : '0 2px 4px rgba(59, 130, 246, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!loading && !saving) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 8px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !saving) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 2px 4px rgba(59, 130, 246, 0.3)';
              }
            }}
          >
            {saving ? (
              <>
                <RefreshCw
                  size={16}
                  style={{ animation: 'spin 1s linear infinite' }}
                />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Save Assignments
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignDialog;
