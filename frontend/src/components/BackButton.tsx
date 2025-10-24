import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  label?: string;
  style?: React.CSSProperties;
}

export const BackButton: React.FC<BackButtonProps> = ({
  to = '/admin',
  label = 'Back to Dashboard',
  style = {},
}) => {
  const navigate = useNavigate();

  const defaultStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    color: '#374151',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '12px 20px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  return (
    <button
      onClick={() => navigate(to)}
      style={defaultStyle}
      onMouseEnter={(e) => {
        // Check if custom background is set (for Profile page)
        const currentBg = e.currentTarget.style.background;
        if (currentBg.includes('rgba(255, 255, 255, 0.15)')) {
          // Profile page style
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.boxShadow =
            '0 8px 25px rgba(255, 255, 255, 0.2)';
        } else {
          // Default style
          e.currentTarget.style.background =
            'linear-gradient(135deg, #3b82f6, #1d4ed8)';
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.boxShadow =
            '0 8px 25px rgba(59, 130, 246, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        // Check if custom background is set (for Profile page)
        const currentBg = e.currentTarget.style.background;
        if (currentBg.includes('rgba(255, 255, 255, 0.25)')) {
          // Profile page style
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        } else {
          // Default style
          e.currentTarget.style.background =
            'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
          e.currentTarget.style.color = '#374151';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        }
      }}
    >
      <ArrowLeft size={18} />
      {label}
    </button>
  );
};

export default BackButton;
