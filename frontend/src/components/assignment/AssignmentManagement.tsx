import React, { useState, useEffect } from 'react';
import { Assignment, TeacherEvaluation, assignmentService } from '../../services/assignmentService';
import { User } from '../../types';
import AssignmentForm from './AssignmentForm';
import AssignmentList from './AssignmentList';
import TeacherEvaluationForm from './TeacherEvaluationForm';
import AssignmentDetails from './AssignmentDetails';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import ChildFriendlyCard from '../ui/ChildFriendlyCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import { useAuth } from '../../contexts/AuthContext';
import './AssignmentManagement.css';

type ViewMode = 'list' | 'create' | 'edit' | 'view' | 'evaluate';

const AssignmentManagement: React.FC = () => {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [existingEvaluation, setExistingEvaluation] = useState<TeacherEvaluation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleCreateAssignment = () => {
        setSelectedAssignment(null);
        setViewMode('create');
    };

    const handleEditAssignment = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setViewMode('edit');
    };

    const handleViewAssignment = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setViewMode('view');
    };

    const handleEvaluateStudent = async (assignment: Assignment, student: User) => {
        setSelectedAssignment(assignment);
        setSelectedStudent(student);

        try {
            // Check if evaluation already exists
            const evaluations = await assignmentService.getStudentEvaluations(student.id, assignment.id);
            const existing = evaluations.find(e => e.assignment_id === assignment.id);
            setExistingEvaluation(existing || null);
        } catch (err) {
            console.error('Error loading existing evaluation:', err);
            setExistingEvaluation(null);
        }

        setViewMode('evaluate');
    };

    const handleSubmitAssignment = async (assignmentData: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            setLoading(true);
            setError(null);

            if (selectedAssignment) {
                // Update existing assignment
                await assignmentService.updateAssignment(selectedAssignment.id, assignmentData);
            } else {
                // Create new assignment
                await assignmentService.createAssignment(assignmentData);
            }

            setRefreshTrigger(prev => prev + 1);
            setViewMode('list');
            setSelectedAssignment(null);
        } catch (err) {
            console.error('Error submitting assignment:', err);
            setError('Failed to save assignment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitEvaluation = async (evaluationData: Omit<TeacherEvaluation, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            setLoading(true);
            setError(null);

            if (existingEvaluation) {
                // Update existing evaluation
                await assignmentService.updateEvaluation(existingEvaluation.id, evaluationData);
            } else {
                // Create new evaluation
                await assignmentService.createEvaluation(evaluationData);
            }

            setViewMode('view');
            setSelectedStudent(null);
            setExistingEvaluation(null);
        } catch (err) {
            console.error('Error submitting evaluation:', err);
            setError('Failed to save evaluation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setViewMode('list');
        setSelectedAssignment(null);
        setSelectedStudent(null);
        setExistingEvaluation(null);
        setError(null);
    };

    const renderBreadcrumb = () => {
        const breadcrumbItems = [
            { label: 'Assignments', onClick: () => setViewMode('list') }
        ];

        switch (viewMode) {
            case 'create':
                breadcrumbItems.push({ label: 'Create Assignment', onClick: () => { } });
                break;
            case 'edit':
                breadcrumbItems.push(
                    { label: selectedAssignment?.title || 'Assignment', onClick: () => setViewMode('view') },
                    { label: 'Edit', onClick: () => { } }
                );
                break;
            case 'view':
                breadcrumbItems.push({ label: selectedAssignment?.title || 'Assignment', onClick: () => { } });
                break;
            case 'evaluate':
                breadcrumbItems.push(
                    { label: selectedAssignment?.title || 'Assignment', onClick: () => setViewMode('view') },
                    { label: `Evaluate ${selectedStudent?.full_name || 'Student'}`, onClick: () => { } }
                );
                break;
        }

        return (
            <div className="breadcrumb">
                {breadcrumbItems.map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <span className="breadcrumb-separator">›</span>}
                        {item.onClick ? (
                            <button
                                className="breadcrumb-link"
                                onClick={item.onClick}
                                disabled={loading}
                            >
                                {item.label}
                            </button>
                        ) : (
                            <span className="breadcrumb-current">{item.label}</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    const renderContent = () => {
        switch (viewMode) {
            case 'create':
            case 'edit':
                return (
                    <AssignmentForm
                        assignment={selectedAssignment}
                        onSubmit={handleSubmitAssignment}
                        onCancel={handleCancel}
                        loading={loading}
                    />
                );

            case 'view':
                return selectedAssignment ? (
                    <AssignmentDetails
                        assignmentId={selectedAssignment.id}
                        onEdit={() => handleEditAssignment(selectedAssignment)}
                        onBack={handleCancel}
                    />
                ) : null;

            case 'evaluate':
                return selectedAssignment && selectedStudent ? (
                    <TeacherEvaluationForm
                        assignment={selectedAssignment}
                        student={selectedStudent}
                        existingEvaluation={existingEvaluation}
                        onSubmit={handleSubmitEvaluation}
                        onCancel={handleCancel}
                        loading={loading}
                    />
                ) : null;

            case 'list':
            default:
                return (
                    <AssignmentList
                        onCreateAssignment={handleCreateAssignment}
                        onEditAssignment={handleEditAssignment}
                        onViewAssignment={handleViewAssignment}
                        refreshTrigger={refreshTrigger}
                    />
                );
        }
    };

    return (
        <div className="assignment-management-container">
            {error && (
                <ErrorMessage
                    message={error}
                    onDismiss={() => setError(null)}
                />
            )}

            {viewMode !== 'list' && (
                <div className="assignment-management-header">
                    {renderBreadcrumb()}
                </div>
            )}

            <div className="assignment-management-content">
                {renderContent()}
            </div>

            {loading && (
                <div className="loading-overlay">
                    <div className="loading-content">
                        <LoadingSpinner />
                        <p>Processing...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentManagement;


