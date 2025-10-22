import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FlashcardManagement } from '../flashcard';
import { ExerciseManagement } from '../exercise';
import TestManagement from '../test/TestManagement';
import { BackButton } from '../BackButton';
import { usePermissions } from '../../hooks/usePermissions';
import { BookOpen, FileText, ClipboardList, AlertTriangle } from 'lucide-react';

type ContentTab = 'flashcards' | 'exercises' | 'tests';

const ContentManagement: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ContentTab>('flashcards');
  const permissions = usePermissions();

  // Handle URL parameters for tab selection
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['flashcards', 'exercises', 'tests'].includes(tabParam)) {
      setActiveTab(tabParam as ContentTab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: ContentTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Check if user has any content management permissions
  const canManageContent =
    permissions.hasPermission('flashcards', 'read') ||
    permissions.hasPermission('exercises', 'read') ||
    permissions.hasPermission('tests', 'read');

  if (!canManageContent) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
            border: '1px solid #fca5a5',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
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
              margin: '0 auto 24px',
              boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)',
            }}
          >
            <AlertTriangle size={32} color="white" />
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#dc2626',
              margin: '0 0 12px 0',
            }}
          >
            Access Denied
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#991b1b',
              margin: '0',
              lineHeight: '1.5',
            }}
          >
            You don't have permission to manage content.
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
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
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
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              borderRadius: '50%',
              opacity: '0.05',
              zIndex: 0,
            }}
          ></div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              position: 'relative',
              zIndex: 1,
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
              <BookOpen size={28} color="white" />
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
                Content Management
              </h1>
              <p
                style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  margin: '0',
                  fontWeight: '500',
                }}
              >
                Manage educational content including flashcards, exercises, and
                tests
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap',
          }}
        >
          {permissions.hasPermission('flashcards', 'read') && (
            <button
              onClick={() => handleTabChange('flashcards')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: 'none',
                background:
                  activeTab === 'flashcards'
                    ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                    : 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                color: activeTab === 'flashcards' ? 'white' : '#374151',
                boxShadow:
                  activeTab === 'flashcards'
                    ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                    : '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'flashcards') {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(59, 130, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'flashcards') {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                  e.currentTarget.style.color = '#374151';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 2px 8px rgba(0, 0, 0, 0.05)';
                }
              }}
            >
              <BookOpen size={20} />
              Manage Flashcards
            </button>
          )}

          {permissions.hasPermission('exercises', 'read') && (
            <button
              onClick={() => handleTabChange('exercises')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: 'none',
                background:
                  activeTab === 'exercises'
                    ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                    : 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                color: activeTab === 'exercises' ? 'white' : '#374151',
                boxShadow:
                  activeTab === 'exercises'
                    ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                    : '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'exercises') {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(59, 130, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'exercises') {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                  e.currentTarget.style.color = '#374151';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 2px 8px rgba(0, 0, 0, 0.05)';
                }
              }}
            >
              <FileText size={20} />
              Manage Exercises
            </button>
          )}

          {permissions.hasPermission('tests', 'read') && (
            <button
              onClick={() => handleTabChange('tests')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: 'none',
                background:
                  activeTab === 'tests'
                    ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                    : 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                color: activeTab === 'tests' ? 'white' : '#374151',
                boxShadow:
                  activeTab === 'tests'
                    ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                    : '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'tests') {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(59, 130, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'tests') {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                  e.currentTarget.style.color = '#374151';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 2px 8px rgba(0, 0, 0, 0.05)';
                }
              }}
            >
              <ClipboardList size={20} />
              Manage Tests
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e5e7eb',
            minHeight: '400px',
          }}
        >
          {activeTab === 'flashcards' &&
            permissions.hasPermission('flashcards', 'read') && (
              <FlashcardManagement showBackButton={false} />
            )}

          {activeTab === 'exercises' &&
            permissions.hasPermission('exercises', 'read') && (
              <ExerciseManagement showBackButton={false} />
            )}

          {activeTab === 'tests' &&
            permissions.hasPermission('tests', 'read') && (
              <TestManagement showBackButton={false} />
            )}
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;


