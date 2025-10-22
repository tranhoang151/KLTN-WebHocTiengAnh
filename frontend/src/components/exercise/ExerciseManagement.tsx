import React, { useState } from 'react';
import { Exercise } from '../../types';
import { exerciseService } from '../../services/exerciseService';
import ExerciseList from './ExerciseList';
import ExerciseForm from './ExerciseForm';
import ExercisePreview from './ExercisePreview';
import { usePermissions } from '../../hooks/usePermissions';
import { BackButton } from '../BackButton';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Plus,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import './ExerciseManagement.css';

type ViewMode = 'list' | 'create' | 'edit' | 'preview';

interface ExerciseManagementProps {
  showBackButton?: boolean;
}

const ExerciseManagement: React.FC<ExerciseManagementProps> = ({
  showBackButton = true,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  );
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permissions = usePermissions();

  const handleCreateExercise = () => {
    setSelectedExercise(null);
    setViewMode('create');
    setError(null);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setViewMode('edit');
    setError(null);
  };

  const handlePreviewExercise = (exercise: Exercise) => {
    setPreviewExercise(exercise);
    setViewMode('preview');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedExercise(null);
    setPreviewExercise(null);
    setError(null);
  };

  const handleClosePreview = () => {
    setPreviewExercise(null);
    setViewMode('list');
  };

  const handleEditFromPreview = () => {
    if (previewExercise) {
      setSelectedExercise(previewExercise);
      setPreviewExercise(null);
      setViewMode('edit');
    }
  };

  const handleSubmitExercise = async (exerciseData: Omit<Exercise, 'id'>) => {
    try {
      setLoading(true);
      setError(null);

      if (viewMode === 'create') {
        await exerciseService.createExercise(exerciseData);
      } else if (viewMode === 'edit' && selectedExercise) {
        await exerciseService.updateExercise(selectedExercise.id, exerciseData);
      }

      setViewMode('list');
      setSelectedExercise(null);
      // Force refresh of exercise list
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to save exercise');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    // This will be handled by ExerciseList component
    console.log('Exercise deleted:', exerciseId);
  };

  // Check specific permissions for exercises
  const canRead = permissions.hasPermission('exercises', 'read');
  const canCreate = permissions.hasPermission('exercises', 'create');
  const canEdit = permissions.hasPermission('exercises', 'update');
  const canDelete = permissions.hasPermission('exercises', 'delete');

  // Require at least read permission to view the management interface
  if (!canRead) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
            }}
          >
            <AlertTriangle size={40} style={{ color: 'white' }} />
          </div>
          <h2
            style={{
              color: 'white',
              fontSize: '28px',
              fontWeight: '700',
              margin: '0 0 16px 0',
              background: 'linear-gradient(135deg, #ffffff, #e0e7ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Access Denied
          </h2>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '16px',
              margin: '0',
              lineHeight: '1.6',
            }}
          >
            You don't have permission to view exercises.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back Button - Only show when showBackButton is true */}
      {showBackButton && (
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <BackButton to="/admin" label="Back to Dashboard" />
        </div>
      )}

      {/* Main Content - Separate Container */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            minHeight: showBackButton ? '100vh' : 'auto',
            background: showBackButton ? '#f8fafc' : 'transparent',
            padding: showBackButton ? '20px' : '0',
          }}
        >
          <div
            style={{
              maxWidth: showBackButton ? '1200px' : '100%',
              margin: showBackButton ? '0 auto' : '0',
            }}
          >
            {/* Error Banner */}
            {error && (
              <div
                style={{
                  background:
                    'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: '24px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <AlertTriangle size={20} color="white" />
                  </div>
                  <span style={{ fontWeight: '600', color: '#1f2937' }}>
                    {error}
                  </span>
                </div>
                <button
                  onClick={() => setError(null)}
                  style={{
                    background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                    border: 'none',
                    color: '#6b7280',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, #ef4444, #dc2626)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                    e.currentTarget.style.color = '#6b7280';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* Main Content */}
            {viewMode === 'list' && (
              <>
                {/* Header Section */}
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
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
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
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
                      background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
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
                          background:
                            'linear-gradient(135deg, #3b82f6, #1d4ed8)',
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
                            background:
                              'linear-gradient(135deg, #1f2937, #374151)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: '0 0 8px 0',
                          }}
                        >
                          Exercise Management
                        </h1>
                        <p
                          style={{
                            fontSize: '16px',
                            color: '#6b7280',
                            margin: '0',
                            fontWeight: '500',
                          }}
                        >
                          Create and manage exercises for your courses
                        </p>
                      </div>
                    </div>
                    {canCreate && (
                      <button
                        onClick={handleCreateExercise}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background:
                            'linear-gradient(135deg, #3b82f6, #1d4ed8)',
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
                          e.currentTarget.style.transform =
                            'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow =
                            '0 4px 12px rgba(59, 130, 246, 0.3)';
                        }}
                      >
                        <Plus size={18} />
                        Create New Exercise
                      </button>
                    )}
                  </div>
                </div>

                {/* Exercise List Content */}
                <div style={{ padding: '0' }}>
                  <ExerciseList
                    onCreateExercise={
                      canCreate ? handleCreateExercise : undefined
                    }
                    onEditExercise={canEdit ? handleEditExercise : undefined}
                    onDeleteExercise={
                      canDelete ? handleDeleteExercise : undefined
                    }
                    onPreviewExercise={handlePreviewExercise}
                    showActions={true}
                  />
                </div>
              </>
            )}

            {/* Create/Edit Form */}
            {(viewMode === 'create' || viewMode === 'edit') && (
              <div
                style={{
                  background:
                    'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
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
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
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
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    borderRadius: '50%',
                    opacity: '0.05',
                    zIndex: 0,
                  }}
                ></div>

                {/* Form Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '24px',
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
                    <button
                      onClick={handleBackToList}
                      disabled={loading}
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
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        opacity: loading ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.background =
                            'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.borderColor = '#3b82f6';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow =
                            '0 8px 25px rgba(59, 130, 246, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.currentTarget.style.background =
                            'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                          e.currentTarget.style.color = '#374151';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      <ArrowLeft size={16} />
                      Back to Exercises
                    </button>
                  </div>
                </div>

                {/* Form Content */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <ExerciseForm
                    exercise={selectedExercise}
                    onSubmit={handleSubmitExercise}
                    onCancel={handleBackToList}
                    loading={loading}
                  />
                </div>
              </div>
            )}

            {/* Preview Popup Overlay */}
            {viewMode === 'preview' && previewExercise && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 1000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                }}
                onClick={handleClosePreview}
              >
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    borderRadius: '20px',
                    padding: '0',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    border: '1px solid #e5e7eb',
                    position: 'relative',
                    overflow: 'hidden',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Preview Header */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Background decorations */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '-20px',
                        width: '60px',
                        height: '60px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                        zIndex: 0,
                      }}
                    ></div>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-15px',
                        left: '-15px',
                        width: '40px',
                        height: '40px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                        zIndex: 0,
                      }}
                    ></div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <Eye size={20} color="white" />
                      </div>
                      <div>
                        <h2
                          style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: 'white',
                            margin: '0 0 4px 0',
                          }}
                        >
                          Exercise Preview
                        </h2>
                        <p
                          style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.8)',
                            margin: '0',
                            fontWeight: '500',
                          }}
                        >
                          Preview how your exercise will appear to students
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleClosePreview}
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        color: 'white',
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease',
                        backdropFilter: 'blur(10px)',
                        position: 'relative',
                        zIndex: 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          'rgba(255, 255, 255, 0.3)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Preview Content */}
                  <div
                    style={{
                      flex: 1,
                      overflow: 'auto',
                      padding: '24px',
                    }}
                  >
                    <ExercisePreview
                      exercise={previewExercise}
                      onClose={handleClosePreview}
                      onEdit={handleEditFromPreview}
                      showEditButton={true}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseManagement;


