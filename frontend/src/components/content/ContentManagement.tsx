import React, { useState } from 'react';
import { CourseManagement } from '../course';
import { ClassManagement } from '../class';
import { QuestionManagement } from '../question';
import { ExerciseManagement } from '../exercise';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import { usePermissions } from '../../hooks/usePermissions';
import './ContentManagement.css';

type ContentTab = 'courses' | 'classes' | 'questions' | 'exercises';

const ContentManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ContentTab>('courses');
    const permissions = usePermissions();

    // Check if user has any content management permissions
    const canManageContent = permissions.canManageCourses || permissions.canManageClasses || permissions.hasPermission('questions', 'read');

    if (!canManageContent) {
        return (
            <div className="content-management-unauthorized">
                <div className="unauthorized-content">
                    <h2>Access Denied</h2>
                    <p>You don't have permission to manage content.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="content-management-container">
            <div className="content-management-header">
                <div className="header-content">
                    <h1>Content Management</h1>
                    <p>Manage courses, classes, and educational content</p>
                </div>
            </div>

            <div className="content-tabs">
                {permissions.canManageCourses && (
                    <ChildFriendlyButton
                        variant={activeTab === 'courses' ? 'primary' : 'secondary'}
                        onClick={() => setActiveTab('courses')}
                        className="tab-button"
                    >
                        📚 Courses
                    </ChildFriendlyButton>
                )}

                {permissions.canManageClasses && (
                    <ChildFriendlyButton
                        variant={activeTab === 'classes' ? 'primary' : 'secondary'}
                        onClick={() => setActiveTab('classes')}
                        className="tab-button"
                    >
                        🏫 Classes
                    </ChildFriendlyButton>
                )}

                {permissions.hasPermission('questions', 'read') && (
                    <ChildFriendlyButton
                        variant={activeTab === 'questions' ? 'primary' : 'secondary'}
                        onClick={() => setActiveTab('questions')}
                        className="tab-button"
                    >
                        ❓ Questions
                    </ChildFriendlyButton>
                )}

                {permissions.canManageContent && (
                    <ChildFriendlyButton
                        variant={activeTab === 'exercises' ? 'primary' : 'secondary'}
                        onClick={() => setActiveTab('exercises')}
                        className="tab-button"
                    >
                        📝 Exercises
                    </ChildFriendlyButton>
                )}
            </div>

            <div className="content-tab-panel">
                {activeTab === 'courses' && permissions.canManageCourses && (
                    <CourseManagement />
                )}

                {activeTab === 'classes' && permissions.canManageClasses && (
                    <ClassManagement />
                )}

                {activeTab === 'questions' && permissions.hasPermission('questions', 'read') && (
                    <QuestionManagement />
                )}

                {activeTab === 'exercises' && permissions.canManageContent && (
                    <ExerciseManagement />
                )}
            </div>
        </div>
    );
};

export default ContentManagement;