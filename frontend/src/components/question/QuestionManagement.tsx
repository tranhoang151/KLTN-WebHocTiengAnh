import React, { useState } from 'react';
import { Question } from '../../types';
import { questionService } from '../../services/questionService';
import QuestionList from './QuestionList';
import QuestionForm from './QuestionForm';
import { usePermissions } from '../../hooks/usePermissions';
import { BackButton } from '../BackButton';
import {
  AlertTriangle,
  ArrowLeft,
  HelpCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

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

  // Check specific permissions for questions
  const canRead = permissions.hasPermission('questions', 'read');
  const canCreate = permissions.hasPermission('questions', 'create');
  const canEdit = permissions.hasPermission('questions', 'update');
  const canDelete = permissions.hasPermission('questions', 'delete');

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
            You don't have permission to view questions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '20px',
      }}
    >
      {/* Back Button */}
      <div style={{ marginBottom: '24px' }}>
        <BackButton to="/admin" label="Back to Dashboard" />
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Error Banner */}
        {error && (
          <div
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <HelpCircle size={28} color="white" />
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
                      Question Management
                    </h1>
                    <p
                      style={{
                        fontSize: '16px',
                        color: '#6b7280',
                        margin: '0',
                        fontWeight: '500',
                      }}
                    >
                      Create and manage questions for your exercises and tests
                    </p>
                  </div>
                </div>
                {canCreate && (
                  <button
                    onClick={handleCreateQuestion}
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
                      e.currentTarget.style.transform =
                        'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                  >
                    <Plus size={18} />
                    Add New Question
                  </button>
                )}
              </div>
            </div>

            {/* Question List Content */}
            <div style={{ padding: '0' }}>
              <QuestionList
                onCreateQuestion={canCreate ? handleCreateQuestion : undefined}
                onEditQuestion={canEdit ? handleEditQuestion : undefined}
                onDeleteQuestion={canDelete ? handleDeleteQuestion : undefined}
                showActions={true}
              />
            </div>
          </>
        )}

        {/* Form Section */}
        {(viewMode === 'create' || viewMode === 'edit') && (
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
                  Back to Questions
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <QuestionForm
                question={selectedQuestion}
                onSubmit={handleSubmitQuestion}
                onCancel={handleBackToList}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionManagement;
