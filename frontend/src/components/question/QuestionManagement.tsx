import React, { useState } from 'react';
import { Question } from '../../types';
import { questionService } from '../../services/questionService';
import QuestionList from './QuestionList';
import QuestionForm from './QuestionForm';
import { usePermissions } from '../../hooks/usePermissions';
import './QuestionManagement.css';

type ViewMode = 'list' | 'create' | 'edit';

const QuestionManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permissions = usePermissions();

  const handleCreateQuestion = () => {
    setSelectedQuestion(null);
    setViewMode('create');
    setError(null);
  };

  const handleEditQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setViewMode('edit');
    setError(null);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedQuestion(null);
    setError(null);
  };

  const handleSubmitQuestion = async (
    questionData: Omit<Question, 'id' | 'created_at'>
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (viewMode === 'create') {
        await questionService.createQuestion(questionData);
      } else if (viewMode === 'edit' && selectedQuestion) {
        await questionService.updateQuestion(selectedQuestion.id, questionData);
      }

      setViewMode('list');
      setSelectedQuestion(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    // This will be handled by QuestionList component
    console.log('Question deleted:', questionId);
  };

  // Check permissions
  if (!permissions.hasPermission('questions', 'read')) {
    return (
      <div className="question-management-unauthorized">
        <div className="unauthorized-content">
          <h2>Access Denied</h2>
          <p>You don't have permission to manage questions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="question-management-container">
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {viewMode === 'list' && (
        <QuestionList
          onCreateQuestion={handleCreateQuestion}
          onEditQuestion={handleEditQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          showActions={true}
        />
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <div className="question-form-wrapper">
          <div className="form-navigation">
            <button
              className="back-button"
              onClick={handleBackToList}
              disabled={loading}
            >
              ← Back to Questions
            </button>
          </div>

          <QuestionForm
            question={selectedQuestion}
            onSubmit={handleSubmitQuestion}
            onCancel={handleBackToList}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;
