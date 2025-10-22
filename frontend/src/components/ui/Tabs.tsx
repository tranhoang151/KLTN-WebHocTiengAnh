import React, { createContext, useContext, useState } from 'react';
import './Tabs.css';

interface TabsContextType {
    activeTab: string;
    setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
    defaultValue: string;
    children: React.ReactNode;
    className?: string;
}

interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}

interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className = '' }) => {
    const [activeTab, setActiveTab] = useState(defaultValue);

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={`tabs ${className}`}>
                {children}
            </div>
        </TabsContext.Provider>
    );
};

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
    return (
        <div className={`tabs-list ${className}`} role="tablist">
            {children}
        </div>
    );
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className = '' }) => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('TabsTrigger must be used within a Tabs component');
    }

    const { activeTab, setActiveTab } = context;
    const is_active = activeTab === value;

    return (
        <button
            className={`tabs-trigger ${is_active ? 'tabs-trigger-active' : ''} ${className}`}
            onClick={() => setActiveTab(value)}
            role="tab"
            aria-selected={is_active}
            aria-controls={`tabpanel-${value}`}
            id={`tab-${value}`}
        >
            {children}
        </button>
    );
};

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = '' }) => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('TabsContent must be used within a Tabs component');
    }

    const { activeTab } = context;
    const is_active = activeTab === value;

    if (!is_active) return null;

    return (
        <div
            className={`tabs-content ${className}`}
            role="tabpanel"
            id={`tabpanel-${value}`}
            aria-labelledby={`tab-${value}`}
        >
            {children}
        </div>
    );
};


