import React, { useState } from 'react';
import { Exercise } from '../../types';
import { exerciseService } from '../../services/exerciseService';
import ExerciseList from './ExerciseList';
import ExerciseBuilder from './ExerciseBuilder';
import ExercisePreview from './ExercisePreview';
import { usePermissions } from '../../hooks/usePermissions';
import './ExerciseManagement.css';

type ViewMode = 'list' | 'create' | 'edit' | 'preview';

const ExerciseManagement: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
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
            <div className="exercise-management-unauthorized">
                <div className="unauthorized-content">
                    <h2>Access Denied</h2>
                    <p>You don't have permission to view exercises.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="exercise-management-container">
            {error && (
                <div className="error-banner">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {viewMode === 'list' && (
                <ExerciseList
                    onCreateExercise={canCreate ? handleCreateExercise : undefined}
                    onEditExercise={canEdit ? handleEditExercise : undefined}
                    onDeleteExercise={canDelete ? handleDeleteExercise : undefined}
                    onPreviewExercise={handlePreviewExercise}
                    showActions={true}
                />
            )}

            {(viewMode === 'create' || viewMode === 'edit') && (
                <div className="exercise-form-wrapper">
                    <div className="form-navigation">
                        <button
                            className="back-button"
                            onClick={handleBackToList}
                            disabled={loading}
                        >
                            ← Back to Exercises
                        </button>
                    </div>

                    <ExerciseBuilder
                        exercise={selectedExercise}
                        onSubmit={handleSubmitExercise}
                        onCancel={handleBackToList}
                        loading={loading}
                    />
                </div>
            )}

            {viewMode === 'preview' && previewExercise && (
                <ExercisePreview
                    exercise={previewExercise}
                    onClose={handleClosePreview}
                    onEdit={handleEditFromPreview}
                    showEditButton={true}
                />
            )}
        </div>
    );
};

export default ExerciseManagement;