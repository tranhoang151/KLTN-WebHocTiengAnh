import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import FlashcardSetManager from '../flashcard/FlashcardSetManager';
import VideoManagementPage from '../../pages/admin/videos/VideoManagementPage'; // Re-using for teachers to manage their own videos
import TeacherProgressPage from '../../pages/teacher/TeacherProgressPage';
import ClassProgressPage from '../../pages/teacher/ClassProgressPage';
import StudentProgressDetailPage from '../../pages/teacher/StudentProgressDetailPage';
import TeacherAnalyticsDashboard from '../progress/TeacherAnalyticsDashboard';
import TeacherStudentManagement from '../../pages/teacher/TeacherStudentManagement';
import TeacherEvaluationPage from '../../pages/teacher/TeacherEvaluationPage';
import AssignmentManagement from '../assignment/AssignmentManagement';
import DashboardLayout from '../DashboardLayout';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../contexts/AuthContext';
import {
  School,
  Users,
  ClipboardList,
  BarChart3,
  FileText,
  BookOpen,
  CreditCard,
  FileCheck,
  Target,
  ArrowRight,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { hasPermission } = usePermissions();
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/analytics" element={<TeacherAnalyticsDashboard />} />
      <Route path="/flashcards" element={<FlashcardSetManager />} />
      <Route path="/students" element={<TeacherStudentManagement />} />
      <Route path="/evaluations" element={<TeacherEvaluationPage />} />
      <Route path="/assignments" element={<AssignmentManagement />} />
      <Route path="/progress" element={<TeacherProgressPage />} />
      <Route path="/progress/class/:classId" element={<ClassProgressPage />} />
      <Route
        path="/progress/student/:studentId"
        element={<StudentProgressDetailPage />}
      />
      <Route
        path="/"
        element={
          <DashboardLayout title="Teacher Dashboard">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                marginBottom: '32px',
              }}
            >
              {/* Classes */}
              {hasPermission('classes', 'read') && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow =
                      '0 25px 50px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 20px 40px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px',
                        boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
                      }}
                    >
                      <School size={24} color="white" />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#1f2937',
                          margin: '0 0 4px 0',
                        }}
                      >
                        My Classes
                      </h3>
                      <p
                        style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0',
                        }}
                      >
                        Manage classes
                      </p>
                    </div>
                  </div>
                  <a
                    href="/teacher/classes"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#3b82f6',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#1d4ed8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#3b82f6';
                    }}
                  >
                    View classes
                    <ArrowRight size={16} />
                  </a>
                </div>
              )}

              {/* Students */}
              {hasPermission('students', 'read') && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow =
                      '0 25px 50px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 20px 40px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px',
                        boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <Users size={24} color="white" />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#1f2937',
                          margin: '0 0 4px 0',
                        }}
                      >
                        Students
                      </h3>
                      <p
                        style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0',
                        }}
                      >
                        View student list
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/teacher/students"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#10b981',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#059669';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#10b981';
                    }}
                  >
                    Manage students
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}

              {/* Assignments */}
              {hasPermission('assignments', 'read') && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow =
                      '0 25px 50px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 20px 40px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px',
                        boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
                      }}
                    >
                      <ClipboardList size={24} color="white" />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#1f2937',
                          margin: '0 0 4px 0',
                        }}
                      >
                        Assignments
                      </h3>
                      <p
                        style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0',
                        }}
                      >
                        Create & manage
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/teacher/assignments"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#f59e0b',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#d97706';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#f59e0b';
                    }}
                  >
                    Manage assignments
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}

              {/* Progress Tracking */}
              {hasPermission('progress', 'read') && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow =
                      '0 25px 50px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 20px 40px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px',
                        boxShadow: '0 8px 25px rgba(124, 58, 237, 0.3)',
                      }}
                    >
                      <BarChart3 size={24} color="white" />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#1f2937',
                          margin: '0 0 4px 0',
                        }}
                      >
                        Progress
                      </h3>
                      <p
                        style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0',
                        }}
                      >
                        Student progress
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/teacher/progress"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#7c3aed',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#5b21b6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#7c3aed';
                    }}
                  >
                    View progress
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}

              {/* Reports */}
              {hasPermission('reports', 'read') && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow =
                      '0 25px 50px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 20px 40px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px',
                        boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                      }}
                    >
                      <FileText size={24} color="white" />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#1f2937',
                          margin: '0 0 4px 0',
                        }}
                      >
                        Reports
                      </h3>
                      <p
                        style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0',
                        }}
                      >
                        Generate reports
                      </p>
                    </div>
                  </div>
                  <a
                    href="/teacher/reports"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#6366f1',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#4f46e5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#6366f1';
                    }}
                  >
                    View reports
                    <ArrowRight size={16} />
                  </a>
                </div>
              )}

              {/* Content Management */}
              {hasPermission('content', 'read') && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow =
                      '0 25px 50px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 20px 40px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #ec4899, #be185d)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px',
                        boxShadow: '0 8px 25px rgba(236, 72, 153, 0.3)',
                      }}
                    >
                      <BookOpen size={24} color="white" />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#1f2937',
                          margin: '0 0 4px 0',
                        }}
                      >
                        Content
                      </h3>
                      <p
                        style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0',
                        }}
                      >
                        Assign content
                      </p>
                    </div>
                  </div>
                  <a
                    href="/teacher/content"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#ec4899',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#be185d';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#ec4899';
                    }}
                  >
                    Manage content
                    <ArrowRight size={16} />
                  </a>
                </div>
              )}

              {/* Flashcard Management */}
              {hasPermission('content', 'write') && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow =
                      '0 25px 50px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 20px 40px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px',
                        boxShadow: '0 8px 25px rgba(249, 115, 22, 0.3)',
                      }}
                    >
                      <CreditCard size={24} color="white" />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#1f2937',
                          margin: '0 0 4px 0',
                        }}
                      >
                        Flashcards
                      </h3>
                      <p
                        style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0',
                        }}
                      >
                        Create & manage
                      </p>
                    </div>
                  </div>
                  <a
                    href="/teacher/flashcards"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#f97316',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ea580c';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#f97316';
                    }}
                  >
                    Manage flashcards
                    <ArrowRight size={16} />
                  </a>
                </div>
              )}

              {/* Evaluations */}
              {hasPermission('evaluations', 'read') && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow =
                      '0 25px 50px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 20px 40px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '16px',
                        boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
                      }}
                    >
                      <FileCheck size={24} color="white" />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#1f2937',
                          margin: '0 0 4px 0',
                        }}
                      >
                        Evaluations
                      </h3>
                      <p
                        style={{
                          fontSize: '14px',
                          color: '#6b7280',
                          margin: '0',
                        }}
                      >
                        Student assessments
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/teacher/evaluations"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#8b5cf6',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#7c3aed';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#8b5cf6';
                    }}
                  >
                    Manage evaluations
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '16px',
                padding: '24px',
                marginTop: '32px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <Target size={24} color="white" />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#065f46',
                      margin: '0 0 8px 0',
                    }}
                  >
                    Teacher Tools
                  </h3>
                  <p
                    style={{
                      fontSize: '14px',
                      color: '#047857',
                      margin: '0',
                      lineHeight: '1.6',
                    }}
                  >
                    Manage your classes, track student progress, create
                    assignments, and generate reports. Use the content
                    management tools to assign learning materials to your
                    students.
                  </p>
                </div>
              </div>
            </div>
          </DashboardLayout>
        }
      />
    </Routes>
  );
};

export default TeacherDashboard;
