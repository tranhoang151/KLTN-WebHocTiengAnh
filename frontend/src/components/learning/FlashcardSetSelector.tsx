import React, { useState, useEffect } from 'react';
import {
  FlashcardSet,
  flashcardService,
} from '../../services/flashcardService';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Play,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface FlashcardSetSelectorProps {
  courseId: string;
  onSelectSet: (set: FlashcardSet) => void;
  onBack?: () => void;
}

const FlashcardSetSelector: React.FC<FlashcardSetSelectorProps> = ({
  courseId,
  onSelectSet,
  onBack,
}) => {
  const { user } = useAuth();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add CSS animation for spinner
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    loadFlashcardSets();
  }, [courseId]);

  const loadFlashcardSets = async () => {
    try {
      setLoading(true);
      setError(null);
      const flashcardSets =
        await flashcardService.getFlashcardSetsByCourse(courseId);
      setSets(flashcardSets);
    } catch (err: any) {
      setError(err.message || 'Failed to load flashcard sets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '400px',
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
            }}
          >
            <Loader2
              size={40}
              color="white"
              style={{ animation: 'spin 1s linear infinite' }}
            />
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0',
            }}
          >
            Loading Flashcard Sets
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0',
              lineHeight: '1.6',
            }}
          >
            Please wait while we load your flashcard sets...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '500px',
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
            }}
          >
            <AlertTriangle size={40} color="white" />
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0',
            }}
          >
            Error Loading Flashcard Sets
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 32px 0',
              lineHeight: '1.6',
            }}
          >
            {error}
          </p>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <button
              onClick={loadFlashcardSets}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                padding: '14px 24px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 8px 25px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 4px 15px rgba(59, 130, 246, 0.3)';
              }}
            >
              Try Again
            </button>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                  color: '#374151',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #e5e7eb, #d1d5db)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                }}
              >
                <ArrowLeft size={20} />
                Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            left: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '300px',
            height: '300px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            zIndex: 0,
          }}
        />

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '48px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '500px',
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
            }}
          >
            <BookOpen size={40} color="white" />
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
              margin: '0 0 12px 0',
            }}
          >
            No Flashcard Sets Available
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0 0 32px 0',
              lineHeight: '1.6',
            }}
          >
            There are no flashcard sets available for this course yet.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                color: '#374151',
                padding: '14px 24px',
                borderRadius: '12px',
                border: '1px solid #d1d5db',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #e5e7eb, #d1d5db)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
              }}
            >
              <ArrowLeft size={20} />
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '20px',
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          left: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '100px',
          height: '100px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                  color: '#374151',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #e5e7eb, #d1d5db)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                }}
              >
                <ArrowLeft size={20} />
                Back
              </button>
            )}
            <div>
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#1f2937',
                  margin: '0 0 8px 0',
                  background: 'linear-gradient(135deg, #1f2937, #374151)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Choose a Flashcard Set
              </h1>
              <p
                style={{
                  fontSize: '18px',
                  color: '#6b7280',
                  margin: '0',
                  lineHeight: '1.6',
                }}
              >
                Select a flashcard set to start learning
              </p>
            </div>
          </div>
        </div>

        {/* Flashcard Sets Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {sets.map((set) => (
            <div
              key={set.id}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onClick={() => onSelectSet(set)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow =
                  '0 25px 50px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                  '0 20px 40px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                }}
              >
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1f2937',
                    margin: '0',
                    flex: 1,
                  }}
                >
                  {set.title}
                </h3>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginLeft: '12px',
                  }}
                >
                  #{set.setId}
                </div>
              </div>

              {/* Card Description */}
              <div style={{ marginBottom: '20px' }}>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    margin: '0',
                    lineHeight: '1.6',
                  }}
                >
                  {set.description || 'No description available'}
                </p>
              </div>

              {/* Card Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#6b7280',
                    fontSize: '14px',
                  }}
                >
                  <Calendar size={16} />
                  <span>
                    {new Date(
                      set.createdAt?.getTime?.() || Date.now()
                    ).toLocaleDateString()}
                  </span>
                </div>

                <button
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 25px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 15px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  <Play size={16} />
                  Start Learning
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlashcardSetSelector;
