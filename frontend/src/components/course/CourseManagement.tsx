import React, { useState } from 'react';
import { Course } from '../../types';
import { courseService } from '../../services/courseService';
import CourseList from './CourseList';
import CourseForm from './CourseForm';
import { usePermissions } from '../../hooks/usePermissions';
import { BookOpen, AlertTriangle, ArrowLeft, X } from 'lucide-react';
import { BackButton } from '../BackButton';

type ViewMode = 'list' | 'create' | 'edit';

const CourseManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const permissions = usePermissions();

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setViewMode('create');
    setError(null);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setViewMode('edit');
    setError(null);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCourse(null);
    setError(null);
  };

  const handleSubmitCourse = async (courseData: Omit<Course, 'id'>) => {
    try {
      setLoading(true);
      setError(null);

      if (viewMode === 'create') {
        await courseService.createCourse(courseData);
      } else if (viewMode === 'edit' && selectedCourse) {
        await courseService.updateCourse(selectedCourse.id, courseData);
      }

      setViewMode('list');
      setSelectedCourse(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    // This will be handled by CourseList component
    console.log('Course deleted:', courseId);
  };

  // Check permissions
  if (!permissions.canManageCourses) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-150px',
            width: '400px',
            height: '400px',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '500px',
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
            }}
          >
            <AlertTriangle size={40} color="white" />
          </div>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 16px 0',
            }}
          >
            Access Denied
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 32px 0',
              lineHeight: '1.6',
            }}
          >
            You don't have permission to manage courses.
          </p>
          <BackButton />
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
      {/* Error Banner */}
      {error && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
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
                color: '#dc2626',
                fontSize: '14px',
                fontWeight: '600',
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
              color: '#dc2626',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'list' && (
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {/* Back Button */}
          <div style={{ marginBottom: '24px' }}>
            <BackButton to="/admin" label="Back to Dashboard" />
          </div>

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
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '50%',
                opacity: '0.05',
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                borderRadius: '50%',
                opacity: '0.05',
                zIndex: 0,
              }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                }}
              >
                <BookOpen size={32} color="white" />
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
                  Course Management
                </h1>
                <p
                  style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    margin: '0',
                    fontWeight: '500',
                  }}
                >
                  Create and manage your course content
                </p>
              </div>
            </div>
          </div>

          <CourseList
            onCreateCourse={handleCreateCourse}
            onEditCourse={handleEditCourse}
            onDeleteCourse={handleDeleteCourse}
            showActions={true}
          />
        </div>
      )}

      {/* Form Mode */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          <CourseForm
            course={selectedCourse}
            onSubmit={handleSubmitCourse}
            onCancel={handleBackToList}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
