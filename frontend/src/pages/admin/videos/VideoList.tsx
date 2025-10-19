import React from 'react';
import { Video } from '../../../types/video';
import {
  Video as VideoIcon,
  Edit,
  Trash2,
  Link,
  Clock,
  BookOpen,
  FileText,
} from 'lucide-react';

interface VideoListProps {
  videos: Video[];
  onEdit: (video: Video) => void;
  onDelete: (videoId: string) => void;
  onAssign: (video: Video) => void;
}

const VideoList: React.FC<VideoListProps> = ({
  videos,
  onEdit,
  onDelete,
  onAssign,
}) => {
  if (videos.length === 0) {
    return (
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '20px',
          padding: '48px 32px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e7eb',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '50%',
            opacity: '0.05',
            zIndex: 0,
          }}
        ></div>
        <div
          style={{
            position: 'absolute',
            bottom: '-20px',
            left: '-20px',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            borderRadius: '50%',
            opacity: '0.05',
            zIndex: 0,
          }}
        ></div>

        <div
          style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #6b7280, #4b5563)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 20px rgba(107, 114, 128, 0.3)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <VideoIcon size={40} color="white" />
        </div>
        <h3
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 12px 0',
            position: 'relative',
            zIndex: 1,
          }}
        >
          No videos found
        </h3>
        <p
          style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '0',
            lineHeight: '1.6',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Add new videos to start managing your video lessons.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {videos.map((video) => (
        <div
          key={video.id}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e5e7eb',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
            e.currentTarget.style.borderColor = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          {/* Background decorations */}
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '50%',
              opacity: '0.05',
              zIndex: 0,
            }}
          ></div>
          <div
            style={{
              position: 'absolute',
              bottom: '-15px',
              left: '-15px',
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              borderRadius: '50%',
              opacity: '0.05',
              zIndex: 0,
            }}
          ></div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div style={{ flex: 1 }}>
              {/* Header with title and course */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                {video.thumbnailUrl ? (
                  <div
                    style={{
                      width: '60px',
                      height: '40px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      border: '2px solid #e5e7eb',
                    }}
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div style="
                              width: 100%;
                              height: 100%;
                              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                              display: flex;
                              align-items: center;
                              justify-content: center;
                            ">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: '60px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <VideoIcon size={20} color="white" />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #1f2937, #374151)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      margin: '0 0 4px 0',
                    }}
                  >
                    {video.title}
                  </h3>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                      border: '1px solid #93c5fd',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#1e40af',
                      }}
                    >
                      {video.courseId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Video details */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #93c5fd',
                  }}
                >
                  <BookOpen size={16} color="#1e40af" />
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1e40af',
                    }}
                  >
                    {video.topic}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #86efac',
                  }}
                >
                  <Clock size={16} color="#166534" />
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#166534',
                    }}
                  >
                    {video.duration}
                  </span>
                </div>
              </div>

              {/* Description */}
              {video.description && (
                <div
                  style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      fontWeight: '500',
                    }}
                  >
                    {video.description}
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginLeft: '16px',
              }}
            >
              <button
                onClick={() => onEdit(video)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
                  color: '#7c3aed',
                  border: '1px solid #c4b5fd',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #8b5cf6, #7c3aed)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(139, 92, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #f3e8ff, #e9d5ff)';
                  e.currentTarget.style.color = '#7c3aed';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Edit size={14} />
                Edit
              </button>
              <button
                onClick={() => onDelete(video.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #ef4444, #dc2626)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(239, 68, 68, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #fee2e2, #fecaca)';
                  e.currentTarget.style.color = '#dc2626';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>
              <button
                onClick={() => onAssign(video)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                  color: '#166534',
                  border: '1px solid #86efac',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #10b981, #059669)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, #dcfce7, #bbf7d0)';
                  e.currentTarget.style.color = '#166534';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Link size={14} />
                Assign
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoList;
