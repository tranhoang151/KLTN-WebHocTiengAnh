import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FlashcardManagement } from '../flashcard';
import { ExerciseManagement } from '../exercise';
import TestManagement from '../test/TestManagement';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import { usePermissions } from '../../hooks/usePermissions';
import './ContentManagement.css';

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
    const canManageContent = permissions.hasPermission('flashcards', 'read') ||
        permissions.hasPermission('exercises', 'read') ||
        permissions.hasPermission('tests', 'read');

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
                    <p>Manage educational content including flashcards, exercises, and tests</p>
                </div>
            </div>

            <div className="content-tabs">
                {permissions.hasPermission('flashcards', 'read') && (
                    <ChildFriendlyButton
                        variant={activeTab === 'flashcards' ? 'primary' : 'secondary'}
                        onClick={() => handleTabChange('flashcards')}
                        className="tab-button"
                    >
                        🃏 Manage Flashcards
                    </ChildFriendlyButton>
                )}

                {permissions.hasPermission('exercises', 'read') && (
                    <ChildFriendlyButton
                        variant={activeTab === 'exercises' ? 'primary' : 'secondary'}
                        onClick={() => handleTabChange('exercises')}
                        className="tab-button"
                    >
                        📝 Manage Exercises
                    </ChildFriendlyButton>
                )}

                {permissions.hasPermission('tests', 'read') && (
                    <ChildFriendlyButton
                        variant={activeTab === 'tests' ? 'primary' : 'secondary'}
                        onClick={() => handleTabChange('tests')}
                        className="tab-button"
                    >
                        📋 Manage Tests
                    </ChildFriendlyButton>
                )}
            </div>

            <div className="content-tab-panel">
                {activeTab === 'flashcards' && permissions.hasPermission('flashcards', 'read') && (
                    <FlashcardManagement />
                )}

                {activeTab === 'exercises' && permissions.hasPermission('exercises', 'read') && (
                    <ExerciseManagement />
                )}

                {activeTab === 'tests' && permissions.hasPermission('tests', 'read') && (
                    <TestManagement />
                )}
            </div>
        </div>
    );
};

export default ContentManagement;