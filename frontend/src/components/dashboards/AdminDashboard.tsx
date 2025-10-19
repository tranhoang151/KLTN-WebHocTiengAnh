import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';
import { usePermissions } from '../../hooks/usePermissions';
import { apiService } from '../../services/apiService';
import UserManagement from '../admin/UserManagement';
import VideoManagementPage from '../../pages/admin/videos/VideoManagementPage';
import AnalyticsPage from '../../pages/admin/AnalyticsPage';
import { ContentManagement } from '../content';
import CourseManagement from '../course/CourseManagement';
import ClassManagement from '../class/ClassManagement';
import ExerciseManagement from '../exercise/ExerciseManagement';
import QuestionManagement from '../question/QuestionManagement';
import FlashcardManagement from '../flashcard/FlashcardManagement';
import TestManagement from '../test/TestManagement';
import {
  Users,
  School,
  GraduationCap,
  BookOpen,
  BarChart3,
  FileText,
  HelpCircle,
  Plus,
  BookOpenCheck,
  TrendingUp,
  ClipboardList,
  Package,
} from 'lucide-react';

const AdminDashboardHome: React.FC = () => {
  // ⭐ QUAN TRỌNG: Hook quản lý quyền truy cập
  const { hasPermission } = usePermissions();

  // ⭐ QUAN TRỌNG: State quản lý thống kê dashboard
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClasses: 0,
    totalTeachers: 0,
    totalContent: 0,
  });
  const [loading, setLoading] = useState(true);

  // ⭐ QUAN TRỌNG: Fetch dữ liệu thống kê từ API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const dashboardData = await apiService.getDashboardStats();
        setStats({
          totalUsers: dashboardData.stats.totalUsers,
          totalClasses: dashboardData.stats.totalClasses,
          totalTeachers: dashboardData.stats.totalTeachers,
          totalContent: dashboardData.stats.totalContent,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Keep default values (0) on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
      {/* ⭐ QUAN TRỌNG: Section hiển thị thống kê dashboard */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            fontSize: '16px',
            color: '#6b7280',
          }}
        >
          Loading dashboard statistics...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: '600',
              color: '#111827',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <BarChart3 size={18} style={{ color: '#111827' }} />
            Dashboard Overview
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Total Users */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <Users size={24} style={{ color: 'white' }} />
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 8px 0',
                }}
              >
                {stats.totalUsers}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280',
                }}
              >
                Total Users
              </div>
            </div>

            {/* Total Classes */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#eab308',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <School size={24} style={{ color: 'white' }} />
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 8px 0',
                }}
              >
                {stats.totalClasses}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280',
                }}
              >
                Total Classes
              </div>
            </div>

            {/* Total Teachers */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#10b981',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <GraduationCap size={24} style={{ color: 'white' }} />
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 8px 0',
                }}
              >
                {stats.totalTeachers}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280',
                }}
              >
                Total Teachers
              </div>
            </div>

            {/* Total Content */}
            <div
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#8b5cf6',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}
              >
                <BookOpen size={24} style={{ color: 'white' }} />
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827',
                  margin: '0 0 8px 0',
                }}
              >
                {stats.totalContent}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280',
                }}
              >
                Total Content
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ QUAN TRỌNG: Section chứa tất cả các card quản lý */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* ⭐ QUAN TRỌNG: Tiêu đề chính của dashboard */}
        <h2
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: '600',
            color: '#111827',
            margin: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <TrendingUp size={18} style={{ color: '#111827' }} />
          Quick Actions
        </h2>
        {/* ⭐ QUAN TRỌNG: Grid layout chứa tất cả các card quản lý */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          {/* ⭐ QUAN TRỌNG: Card quản lý người dùng */}
          {/* Manage Users */}
          {hasPermission('users', 'read') && (
            <div
              style={{
                backgroundColor: 'white',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#1d4ed8';
                if (link) link.style.color = 'white';
                if (arrow) arrow.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#f9fafb';
                if (link) link.style.color = '#1d4ed8';
                if (arrow) arrow.style.opacity = '0';
              }}
            >
              <div style={{ padding: '20px 20px 0 20px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '0px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Users
                        size={14}
                        style={{
                          color: 'white',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <dl>
                      <dt
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#111827',
                          margin: '0 0 8px 0',
                        }}
                      >
                        User Management
                      </dt>
                      <dd
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#6b7280',
                          margin: '0',
                          lineHeight: '1.4',
                        }}
                      >
                        Manage user accounts and permissions
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div
                className="link-section"
                style={{
                  backgroundColor: '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '14px', padding: '12px 20px' }}>
                  <Link
                    to="/admin/users"
                    className="link-text"
                    style={{
                      fontWeight: '500',
                      color: '#1d4ed8',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>View Users</span>
                    <span
                      className="arrow-icon"
                      style={{
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ⭐ QUAN TRỌNG: Card quản lý lớp học */}
          {/* Manage Classes */}
          {hasPermission('classes', 'read') && (
            <div
              style={{
                backgroundColor: 'white',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#eab308';
                if (link) link.style.color = 'white';
                if (arrow) arrow.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#f9fafb';
                if (link) link.style.color = '#a16207';
                if (arrow) arrow.style.opacity = '0';
              }}
            >
              <div style={{ padding: '20px 20px 0 20px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '0px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#eab308',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <School
                        size={14}
                        style={{
                          color: 'white',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <dl>
                      <dt
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#111827',
                          margin: '0 0 8px 0',
                        }}
                      >
                        Class Management
                      </dt>
                      <dd
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#6b7280',
                          margin: '0',
                          lineHeight: '1.4',
                        }}
                      >
                        Manage classes and student enrollment
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div
                className="link-section"
                style={{
                  backgroundColor: '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '14px', padding: '12px 20px' }}>
                  <Link
                    to="/admin/classes"
                    className="link-text"
                    style={{
                      fontWeight: '500',
                      color: '#a16207',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>View Classes</span>
                    <span
                      className="arrow-icon"
                      style={{
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ⭐ QUAN TRỌNG: Card quản lý khóa học */}
          {/* Manage Courses */}
          {hasPermission('courses', 'read') && (
            <div
              style={{
                backgroundColor: 'white',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#10b981';
                if (link) link.style.color = 'white';
                if (arrow) arrow.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#f9fafb';
                if (link) link.style.color = '#047857';
                if (arrow) arrow.style.opacity = '0';
              }}
            >
              <div style={{ padding: '20px 20px 0 20px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '0px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#10b981',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BookOpen
                        size={14}
                        style={{
                          color: 'white',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <dl>
                      <dt
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#111827',
                          margin: '0 0 8px 0',
                        }}
                      >
                        Course Management
                      </dt>
                      <dd
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#6b7280',
                          margin: '0',
                          lineHeight: '1.4',
                        }}
                      >
                        Create and manage course content
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div
                className="link-section"
                style={{
                  backgroundColor: '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '14px', padding: '12px 20px' }}>
                  <Link
                    to="/admin/courses"
                    className="link-text"
                    style={{
                      fontWeight: '500',
                      color: '#047857',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>View Courses</span>
                    <span
                      className="arrow-icon"
                      style={{
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ⭐ QUAN TRỌNG: Card quản lý thẻ học */}
          {/* Flashcards Management */}
          {hasPermission('content', 'read') && (
            <div
              style={{
                backgroundColor: 'white',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#8b5cf6';
                if (link) link.style.color = 'white';
                if (arrow) arrow.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#f9fafb';
                if (link) link.style.color = '#7c3aed';
                if (arrow) arrow.style.opacity = '0';
              }}
            >
              <div style={{ padding: '20px 20px 0 20px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '0px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#8b5cf6',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FileText
                        size={14}
                        style={{
                          color: 'white',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <dl>
                      <dt
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#111827',
                          margin: '0 0 8px 0',
                        }}
                      >
                        Flashcards Management
                      </dt>
                      <dd
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#6b7280',
                          margin: '0',
                          lineHeight: '1.4',
                        }}
                      >
                        Create and manage flashcard sets
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div
                className="link-section"
                style={{
                  backgroundColor: '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '14px', padding: '12px 20px' }}>
                  <Link
                    to="/admin/flashcards"
                    className="link-text"
                    style={{
                      fontWeight: '500',
                      color: '#7c3aed',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>View Flashcards</span>
                    <span
                      className="arrow-icon"
                      style={{
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ⭐ QUAN TRỌNG: Card quản lý bài tập */}
          {/* Exercises Management */}
          {hasPermission('content', 'read') && (
            <div
              style={{
                backgroundColor: 'white',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#f59e0b';
                if (link) link.style.color = 'white';
                if (arrow) arrow.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#f9fafb';
                if (link) link.style.color = '#d97706';
                if (arrow) arrow.style.opacity = '0';
              }}
            >
              <div style={{ padding: '20px 20px 0 20px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '0px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#f59e0b',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BookOpenCheck
                        size={14}
                        style={{
                          color: 'white',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <dl>
                      <dt
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#111827',
                          margin: '0 0 8px 0',
                        }}
                      >
                        Exercises Management
                      </dt>
                      <dd
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#6b7280',
                          margin: '0',
                          lineHeight: '1.4',
                        }}
                      >
                        Create and manage practice exercises
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div
                className="link-section"
                style={{
                  backgroundColor: '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '14px', padding: '12px 20px' }}>
                  <Link
                    to="/admin/exercises"
                    className="link-text"
                    style={{
                      fontWeight: '500',
                      color: '#d97706',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>View Exercises</span>
                    <span
                      className="arrow-icon"
                      style={{
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ⭐ QUAN TRỌNG: Card quản lý bài kiểm tra */}
          {/* Tests Management */}
          {hasPermission('content', 'read') && (
            <div
              style={{
                backgroundColor: 'white',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#ef4444';
                if (link) link.style.color = 'white';
                if (arrow) arrow.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#f9fafb';
                if (link) link.style.color = '#dc2626';
                if (arrow) arrow.style.opacity = '0';
              }}
            >
              <div style={{ padding: '20px 20px 0 20px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '0px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#ef4444',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <HelpCircle
                        size={14}
                        style={{
                          color: 'white',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <dl>
                      <dt
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#111827',
                          margin: '0 0 8px 0',
                        }}
                      >
                        Tests Management
                      </dt>
                      <dd
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#6b7280',
                          margin: '0',
                          lineHeight: '1.4',
                        }}
                      >
                        Create and manage test questions
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div
                className="link-section"
                style={{
                  backgroundColor: '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '14px', padding: '12px 20px' }}>
                  <Link
                    to="/admin/tests"
                    className="link-text"
                    style={{
                      fontWeight: '500',
                      color: '#dc2626',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>View Tests</span>
                    <span
                      className="arrow-icon"
                      style={{
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ⭐ QUAN TRỌNG: Card quản lý video */}
          {/* Videos Management */}
          {hasPermission('content', 'read') && (
            <div
              style={{
                backgroundColor: 'white',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#06b6d4';
                if (link) link.style.color = 'white';
                if (arrow) arrow.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#f9fafb';
                if (link) link.style.color = '#0891b2';
                if (arrow) arrow.style.opacity = '0';
              }}
            >
              <div style={{ padding: '20px 20px 0 20px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '0px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#06b6d4',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BookOpen
                        size={14}
                        style={{
                          color: 'white',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <dl>
                      <dt
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#111827',
                          margin: '0 0 8px 0',
                        }}
                      >
                        Videos Management
                      </dt>
                      <dd
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#6b7280',
                          margin: '0',
                          lineHeight: '1.4',
                        }}
                      >
                        Upload and manage video content
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div
                className="link-section"
                style={{
                  backgroundColor: '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '14px', padding: '12px 20px' }}>
                  <Link
                    to="/admin/videos"
                    className="link-text"
                    style={{
                      fontWeight: '500',
                      color: '#0891b2',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>View Videos</span>
                    <span
                      className="arrow-icon"
                      style={{
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ⭐ QUAN TRỌNG: Card quản lý câu hỏi */}
          {/* Question Management */}
          {hasPermission('content', 'read') && (
            <div
              style={{
                backgroundColor: 'white',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#7c3aed';
                if (link) link.style.color = 'white';
                if (arrow) arrow.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#f9fafb';
                if (link) link.style.color = '#7c3aed';
                if (arrow) arrow.style.opacity = '0';
              }}
            >
              <div style={{ padding: '20px 20px 0 20px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '0px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#7c3aed',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ClipboardList
                        size={14}
                        style={{
                          color: 'white',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <dl>
                      <dt
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#111827',
                          margin: '0 0 8px 0',
                        }}
                      >
                        Question Management
                      </dt>
                      <dd
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#6b7280',
                          margin: '0',
                        }}
                      >
                        Manage questions for tests and exercises
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div
                className="link-section"
                style={{
                  backgroundColor: '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <div style={{ fontSize: '14px', padding: '12px 20px' }}>
                  <Link
                    to="/admin/questions"
                    className="link-text"
                    style={{
                      fontWeight: '500',
                      color: '#7c3aed',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>View Questions</span>
                    <span
                      className="arrow-icon"
                      style={{
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ⭐ QUAN TRỌNG: Card quản lý nội dung tổng thể */}
          {/* Content Management */}
          {hasPermission('content', 'read') && (
            <div
              style={{
                backgroundColor: 'white',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#059669';
                if (link) link.style.color = 'white';
                if (arrow) arrow.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#f9fafb';
                if (link) link.style.color = '#059669';
                if (arrow) arrow.style.opacity = '0';
              }}
            >
              <div style={{ padding: '20px 20px 0 20px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '0px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#059669',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Package
                        size={14}
                        style={{
                          color: 'white',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <dl>
                      <dt
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#111827',
                          margin: '0 0 8px 0',
                        }}
                      >
                        Content Management
                      </dt>
                      <dd
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#6b7280',
                          margin: '0',
                        }}
                      >
                        Manage all educational content
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div
                className="link-section"
                style={{
                  backgroundColor: '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <div style={{ fontSize: '14px', padding: '12px 20px' }}>
                  <Link
                    to="/admin/content"
                    className="link-text"
                    style={{
                      fontWeight: '500',
                      color: '#059669',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>Manage Content</span>
                    <span
                      className="arrow-icon"
                      style={{
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ⭐ QUAN TRỌNG: Card xem báo cáo hệ thống */}
          {/* System Reports */}
          {hasPermission('reports', 'read') && (
            <div
              style={{
                backgroundColor: 'white',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#6b7280';
                if (link) link.style.color = 'white';
                if (arrow) arrow.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const card = e.currentTarget;
                const linkDiv = card.querySelector(
                  '.link-section'
                ) as HTMLElement;
                const link = card.querySelector('.link-text') as HTMLElement;
                const arrow = card.querySelector('.arrow-icon') as HTMLElement;

                if (linkDiv) linkDiv.style.backgroundColor = '#f9fafb';
                if (link) link.style.color = '#4b5563';
                if (arrow) arrow.style.opacity = '0';
              }}
            >
              <div style={{ padding: '20px 20px 0 20px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ marginBottom: '0px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#6b7280',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BarChart3
                        size={14}
                        style={{
                          color: 'white',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <dl>
                      <dt
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: '#111827',
                          margin: '0 0 8px 0',
                        }}
                      >
                        System Reports
                      </dt>
                      <dd
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#6b7280',
                          margin: '0',
                          lineHeight: '1.4',
                        }}
                      >
                        View analytics and reports
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div
                className="link-section"
                style={{
                  backgroundColor: '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontSize: '14px', padding: '12px 20px' }}>
                  <Link
                    to="/admin/analytics"
                    className="link-text"
                    style={{
                      fontWeight: '500',
                      color: '#4b5563',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>View Reports</span>
                    <span
                      className="arrow-icon"
                      style={{
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        fontSize: '16px',
                        fontWeight: 'bold',
                      }}
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Admin Dashboard">
      {/* ⭐ QUAN TRỌNG: Định nghĩa tất cả routes cho admin dashboard */}
      <Routes>
        {/* ⭐ QUAN TRỌNG: Trang chủ dashboard */}
        <Route path="/" element={<AdminDashboardHome />} />

        {/* ⭐ QUAN TRỌNG: Routes quản lý các module */}
        <Route path="/users" element={<UserManagement />} />
        <Route path="/courses" element={<CourseManagement />} />
        <Route path="/classes" element={<ClassManagement />} />
        <Route path="/exercises" element={<ExerciseManagement />} />
        <Route path="/questions" element={<QuestionManagement />} />
        <Route path="/flashcards" element={<FlashcardManagement />} />
        <Route path="/tests" element={<TestManagement />} />
        <Route path="/content" element={<ContentManagement />} />
        <Route path="/videos" element={<VideoManagementPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />

        {/* Add more routes as needed */}
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;
