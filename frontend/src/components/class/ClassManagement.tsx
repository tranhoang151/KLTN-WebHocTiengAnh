import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classService, Class } from '../../services/classService';
import ClassList from './ClassList';
import ClassForm from './ClassForm';
import { usePermissions } from '../../hooks/usePermissions';
import { BackButton } from '../BackButton';
import {
  School,
  Users,
  BookOpen,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import './ClassManagement.css';

type ViewMode = 'list' | 'create' | 'edit';

const ClassManagement: React.FC = () => {
  const { classId } = useParams<{ classId?: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permissions = usePermissions();

  // Handle edit mode from URL
  useEffect(() => {
    if (classId) {
      loadClassForEdit(classId);
    } else {
      setViewMode('list');
      setSelectedClass(null);
    }
  }, [classId]);

  const loadClassForEdit = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const classData = await classService.getClassById(id);
      setSelectedClass(classData);
      setViewMode('edit');
    } catch (err: any) {
      setError(err.message || 'Failed to load class for editing');
      setViewMode('list');
    } finally {
      setLoading(false);
    }
  };

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
    navigate('/admin/classes');
  };

  const handleSubmitClass = async (
    classData: Omit<Class, 'id' | 'created_at'>
  ) => {
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
      navigate('/admin/classes');
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
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
            width: '200px',
            height: '200px',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '300px',
            height: '300px',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            maxWidth: '400px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)',
            }}
          >
            <AlertTriangle size={32} color="white" />
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0',
            }}
          >
            Access Denied
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 24px 0',
              lineHeight: '1.6',
            }}
          >
            You don't have permission to manage classes. Please contact your
            administrator.
          </p>
          <BackButton to="/admin" label="Back to Dashboard" />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* Back Button */}
      <div style={{ marginBottom: '24px' }}>
        <BackButton to="/admin" label="Back to Dashboard" />
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={16} color="white" />
            </div>
            <span
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#dc2626',
              }}
            >
              {error}
            </span>
          </div>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              color: '#dc2626',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {viewMode === 'list' && (
          <ClassList
            onCreateClass={handleCreateClass}
            onEditClass={handleEditClass}
            onDeleteClass={handleDeleteClass}
            showActions={true}
          />
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
            }}
          >
            {/* Form Navigation */}
            <div
              style={{
                marginBottom: '24px',
              }}
            >
              <button
                onClick={handleBackToList}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                  color: '#374151',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  fontWeight: '500',
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  opacity: loading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 20px rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, #e2e8f0, #cbd5e1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 12px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.background =
                      'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                  }
                }}
              >
                <ArrowLeft size={18} />
                Back to Classes
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
    </div>
  );
};

export default ClassManagement;


