import React from 'react';
import { ChevronRight } from 'lucide-react';
import './TabLayout.css';

export interface Tab {
    id: string;
    label: string;
    value: string;
}

interface TabLayoutProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabValue: string) => void;
    className?: string;
}

const TabLayout: React.FC<TabLayoutProps> = ({
    tabs,
    activeTab,
    onTabChange,
    className = '',
}) => {
    return (
        <div
            className={`tab-layout ${className}`}
            style={{
                background: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    position: 'relative',
                }}
            >
                {tabs.map((tab, index) => {
                    const is_active = activeTab === tab.value;
                    const isLast = index === tabs.length - 1;

                    return (
                        <React.Fragment key={tab.id}>
                            <button
                                onClick={() => onTabChange(tab.value)}
                                style={{
                                    flex: 1,
                                    padding: '16px 24px',
                                    background: is_active
                                        ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                                        : 'transparent',
                                    color: is_active ? '#ffffff' : '#6b7280',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: is_active ? '600' : '500',
                                    transition: 'all 0.3s ease',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                }}
                                onMouseEnter={(e) => {
                                    if (!is_active) {
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                                        e.currentTarget.style.color = '#374151';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!is_active) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#6b7280';
                                    }
                                }}
                            >
                                <span>{tab.label}</span>
                                {is_active && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            height: '3px',
                                            background: 'linear-gradient(135deg, #ffffff, #e0e7ff)',
                                            borderRadius: '2px 2px 0 0',
                                        }}
                                    />
                                )}
                            </button>

                            {!isLast && (
                                <div
                                    style={{
                                        width: '1px',
                                        background: '#e5e7eb',
                                        alignSelf: 'stretch',
                                    }}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default TabLayout;


