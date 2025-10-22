import React from 'react';
import FlashcardSetManager from './FlashcardSetManager';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';
import { BackButton } from '../BackButton';

interface FlashcardManagementProps {
  courseId?: string;
  showBackButton?: boolean;
}

const FlashcardManagement: React.FC<FlashcardManagementProps> = ({
  courseId,
  showBackButton = true,
}) => {
  const { user } = useAuth();

  // Check if user has permission to manage flashcards
  const canManageFlashcards =
    user?.role === 'admin' || user?.role === 'teacher';

  if (!canManageFlashcards) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
          border: '1px solid #fca5a5',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <AlertTriangle size={24} color="#dc2626" />
          <h3
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#dc2626',
              margin: '0',
            }}
          >
            Access Denied
          </h3>
        </div>
        <p
          style={{
            fontSize: '14px',
            color: '#991b1b',
            margin: '0',
          }}
        >
          You don't have permission to manage flashcards.
        </p>
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
        <FlashcardSetManager courseId={courseId} onBack={undefined} />
      </div>
    </div>
  );
};

export default FlashcardManagement;


