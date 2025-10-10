import React, { useState } from 'react';
import { Class } from '../../types';
import { classService } from '../../services/classService';
import ClassList from './ClassList';
import ClassForm from './ClassForm';
import { usePermissions } from '../../hooks/usePermissions';
import './ClassManagement.css';

type ViewMode = 'list' | 'create' | 'edit';

const ClassManagement: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const permissions = usePermissions();

    const handleCreateClass = () => {
        setSelectedClass(null);
        setViewMode('create');
        setError(null);
    };

    const handleEditClass = (classData: Class) => {
        setSelectedClass(classData);
        setViewMode('edit');
        setError(null);
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedClass(null);
        setError(null);
    };

    const handleSubmitClass = async (classData: Omit<Class, 'id' | 'created_at'>) => {
        try {
            setLoading(true);
            setError(null);

            if (viewMode === 'create') {
                await classService.createClass(classData);
            } else if (viewMode === 'edit' && selectedClass) {
                await classService.updateClass(selectedClass.id, classData);
            }

            setViewMode('list');
            setSelectedClass(null);
        } catch (err: any) {
            setError(err.message || 'Failed to save class');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClass = async (classId: string) => {
        // This will be handled by ClassList component
        console.log('Class deleted:', classId);
    };

    // Check permissions
    if (!permissions.canManageClasses) {
        return (
            <div className="class-management-unauthorized">
                <div className="unauthorized-content">
                    <h2>Access Denied</h2>
                    <p>You don't have permission to manage classes.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="class-management-container">
            {error && (
                <div className="error-banner">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {viewMode === 'list' && (
                <ClassList
                    onCreateClass={handleCreateClass}
                    onEditClass={handleEditClass}
                    onDeleteClass={handleDeleteClass}
                    showActions={true}
                />
            )}

            {(viewMode === 'create' || viewMode === 'edit') && (
                <div className="class-form-wrapper">
                    <div className="form-navigation">
                        <button
                            className="back-button"
                            onClick={handleBackToList}
                            disabled={loading}
                        >
                            ← Back to Classes
                        </button>
                    </div>

                    <ClassForm
                        classData={selectedClass}
                        onSubmit={handleSubmitClass}
                        onCancel={handleBackToList}
                        loading={loading}
                    />
                </div>
            )}
        </div>
    );
};

export default ClassManagement;