import React, { useState } from 'react';
import TabLayout, { Tab } from './TabLayout';

const TabLayoutDemo: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('');

    const tabs: Tab[] = [
        { id: 'all', label: 'Tất cả', value: '' },
        { id: 'multiple_choice', label: 'Trắc nghiệm', value: 'multiple_choice' },
        { id: 'fill_blank', label: 'Điền từ', value: 'fill_blank' },
    ];

    const handleTabChange = (tabValue: string) => {
        setActiveTab(tabValue);
        console.log('Active tab changed to:', tabValue);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>
                TabLayout Demo
            </h2>

            <div style={{ marginBottom: '20px' }}>
                <TabLayout
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />
            </div>

            <div
                style={{
                    padding: '20px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                }}
            >
                <h3 style={{ marginBottom: '10px', color: '#374151' }}>
                    Active Tab: {activeTab || 'All'}
                </h3>
                <p style={{ color: '#6b7280', margin: 0 }}>
                    This demonstrates the TabLayout component functionality.
                    Click on different tabs to see the active state change.
                </p>
            </div>
        </div>
    );
};

export default TabLayoutDemo;


