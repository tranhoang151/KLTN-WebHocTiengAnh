import React, { useState, useEffect } from 'react';
import { Test, Course } from '../../types';
import { testService } from '../../services/testService';
import { courseService } from '../../services/courseService';
import TestList from './TestList';
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

interface TestManagementProps {
  showBackButton?: boolean;
}

const TestManagement: React.FC<TestManagementProps> = ({
  showBackButton = true,
}) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'builder' | 'preview'>(
    'list'
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const permissions = usePermissions();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [testsData, coursesData] = await Promise.all([
        testService.getAllTests(),
        courseService.getAllCourses(),
      ]);
      setTests(testsData);
      setCourses(coursesData);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = () => {
    setSelectedTest(null);
    setActiveTab('builder');
  };

  const handleEditTest = (test: Test) => {
    setSelectedTest(test);
    setActiveTab('builder');
  };

  const handlePreviewTest = (test: Test) => {
    setSelectedTest(test);
    setActiveTab('preview');
  };

  const handleSaveTest = async (testData: Omit<Test, 'id' | 'created_at'>) => {
    try {
      if (selectedTest) {
        await testService.updateTest(selectedTest.id, testData);
      } else {
        await testService.createTest(testData);
      }
      await loadData();
      setActiveTab('list');
      setSelectedTest(null);
    } catch (err) {
      setError('Failed to save test');
      console.error('Error saving test:', err);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      await testService.deleteTest(testId);
      await loadData();
    } catch (err) {
      setError('Failed to delete test');
      console.error('Error deleting test:', err);
    }
  };

  const handleBackToList = () => {
    setActiveTab('list');
    setSelectedTest(null);
  };

  // Check specific permissions for tests
  const canRead = permissions.hasPermission('tests', 'read');
  const canCreate = permissions.hasPermission('tests', 'create');
  const canEdit = permissions.hasPermission('tests', 'update');
  const canDelete = permissions.hasPermission('tests', 'delete');

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
            You don't have permission to view tests.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              fontWeight: '500',
            }}
          >
            Loading tests...
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
            {activeTab === 'list' && (
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
                          Test Management
                        </h1>
                        <p
                          style={{
                            fontSize: '16px',
                            color: '#6b7280',
                            margin: '0',
                            fontWeight: '500',
                          }}
                        >
                          Create and manage tests for your courses
                        </p>
                      </div>
                    </div>
                    {canCreate && (
                      <button
                        onClick={handleCreateTest}
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
                        Create New Test
                      </button>
                    )}
                  </div>
                </div>

                {/* Test List Content */}
                <div style={{ padding: '0' }}>
                  <TestList
                    tests={tests}
                    courses={courses}
                    onEdit={canEdit ? handleEditTest : undefined}
                    onDelete={canDelete ? handleDeleteTest : undefined}
                    onPreview={handlePreviewTest}
                  />
                </div>
              </>
            )}

            {/* Builder Tab */}
            {activeTab === 'builder' && (
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
                      Back to Tests
                    </button>
                  </div>
                </div>

                {/* Builder Content */}
                <div
                  style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 24px',
                      boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <BookOpen size={40} color="white" />
                  </div>
                  <h3
                    style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#1f2937',
                      margin: '0 0 12px 0',
                    }}
                  >
                    Test Builder Coming Soon
                  </h3>
                  <p
                    style={{
                      fontSize: '16px',
                      color: '#6b7280',
                      margin: '0',
                      lineHeight: '1.6',
                    }}
                  >
                    The test builder functionality is under development.
                  </p>
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
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
                    background: 'linear-gradient(135deg, #10b981, #059669)',
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
                    background: 'linear-gradient(135deg, #059669, #047857)',
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
                            'linear-gradient(135deg, #10b981, #059669)';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.borderColor = '#10b981';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow =
                            '0 8px 25px rgba(16, 185, 129, 0.3)';
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
                      Back to Tests
                    </button>
                  </div>
                </div>

                {/* Preview Content */}
                <div
                  style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {selectedTest ? (
                    <>
                      <div
                        style={{
                          width: '80px',
                          height: '80px',
                          background:
                            'linear-gradient(135deg, #10b981, #059669)',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 24px',
                          boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        <Eye size={40} color="white" />
                      </div>
                      <h3
                        style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#1f2937',
                          margin: '0 0 12px 0',
                        }}
                      >
                        Test Preview Coming Soon
                      </h3>
                      <p
                        style={{
                          fontSize: '16px',
                          color: '#6b7280',
                          margin: '0',
                          lineHeight: '1.6',
                        }}
                      >
                        The test preview functionality is under development.
                      </p>
                    </>
                  ) : (
                    <>
                      <div
                        style={{
                          width: '80px',
                          height: '80px',
                          background:
                            'linear-gradient(135deg, #6b7280, #4b5563)',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 24px',
                          boxShadow: '0 8px 20px rgba(107, 114, 128, 0.3)',
                        }}
                      >
                        <Eye size={40} color="white" />
                      </div>
                      <h3
                        style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#1f2937',
                          margin: '0 0 12px 0',
                        }}
                      >
                        No Test Selected
                      </h3>
                      <p
                        style={{
                          fontSize: '16px',
                          color: '#6b7280',
                          margin: '0',
                          lineHeight: '1.6',
                        }}
                      >
                        Please select a test to preview.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestManagement;


