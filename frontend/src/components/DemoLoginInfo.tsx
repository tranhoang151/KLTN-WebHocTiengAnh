import React from 'react';

const DemoLoginInfo: React.FC = () => {
    const demoAccounts = [
        {
            role: 'Student',
            email: 'student@example.com',
            password: '123456',
            description: 'Student account with basic learning features'
        },
        {
            role: 'Teacher',
            email: 'teacher@example.com',
            password: 'teacher123',
            description: 'Teacher account with class management features'
        },
        {
            role: 'Admin',
            email: 'admin@example.com',
            password: 'admin123',
            description: 'Administrator account with full system access'
        }
    ];

    return (
        <div style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: '#f0f8ff',
            border: '2px solid #4CAF50',
            borderRadius: '8px',
            padding: '15px',
            maxWidth: '300px',
            fontSize: '12px',
            zIndex: 1000,
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#2196F3' }}>🔐 Demo Login Accounts</h4>
            {demoAccounts.map((account, index) => (
                <div key={index} style={{
                    marginBottom: '10px',
                    padding: '8px',
                    background: 'white',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                }}>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>{account.role}</div>
                    <div style={{ color: '#666' }}>Email: <code>{account.email}</code></div>
                    <div style={{ color: '#666' }}>Password: <code>{account.password}</code></div>
                    <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>
                        {account.description}
                    </div>
                </div>
            ))}
            <div style={{
                fontSize: '10px',
                color: '#888',
                marginTop: '10px',
                borderTop: '1px solid #ddd',
                paddingTop: '8px'
            }}>
                💡 Backend API not available - using mock authentication
            </div>
        </div>
    );
};

export default DemoLoginInfo;


