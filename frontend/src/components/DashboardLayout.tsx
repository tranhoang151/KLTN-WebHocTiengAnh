import React from 'react';
import { AdminHeader } from './AdminHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
}) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Admin Header Component */}
      <AdminHeader title={title} />

      {/* Main Content */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '30px',
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;


