import React, { useState, useEffect, useMemo } from 'react';
import { videoService } from '../../../services/videoService';
import { Video } from '../../../types/video';
import VideoList from './VideoList';
import VideoForm from './VideoForm';
import AssignVideoDialog from './AssignVideoDialog';
import VideoFilter from './VideoFilter';
import { usePermissions } from '../../../hooks/usePermissions';
import { BackButton } from '../../../components/BackButton';
import {
  AlertTriangle,
  ArrowLeft,
  Video as VideoIcon,
  Plus,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

const VideoManagementPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [assigningVideo, setAssigningVideo] = useState<Video | null>(null);
  const [filters, setFilters] = useState({ searchTerm: '', courseId: '' });

  const permissions = usePermissions();

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedVideos = await videoService.getAllVideos();
      setVideos(fetchedVideos);
    } catch (err: any) {
      setError(err.message || 'Failed to load videos');
      console.error('Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const searchTermLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        video.title.toLowerCase().includes(searchTermLower) ||
        video.topic.toLowerCase().includes(searchTermLower);

      const matchesCourse =
        !filters.courseId || video.courseId === filters.courseId;

      return matchesSearch && matchesCourse;
    });
  }, [videos, filters]);

  const handleCreateVideo = () => {
    setEditingVideo(null);
    setShowForm(true);
  };

  const handleEditVideo = (video: Video) => {
    setEditingVideo(video);
    setShowForm(true);
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }
    try {
      await videoService.deleteVideo(videoId);
      await loadVideos();
    } catch (err: any) {
      setError(err.message || 'Failed to delete video');
      console.error('Error deleting video:', err);
    }
  };

  const handleAssignVideo = (video: Video) => {
    setAssigningVideo(video);
  };

  const handleVideoSaved = async () => {
    setShowForm(false);
    setEditingVideo(null);
    setAssigningVideo(null);
    await loadVideos();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingVideo(null);
    setAssigningVideo(null);
  };

  // Check specific permissions for videos
  const canRead = permissions.hasPermission('videos', 'read');
  const canCreate = permissions.hasPermission('videos', 'create');
  const canEdit = permissions.hasPermission('videos', 'update');
  const canDelete = permissions.hasPermission('videos', 'delete');

  // Require at least read permission to view the management interface
  if (!canRead) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
            }}
          >
            <AlertTriangle size={40} style={{ color: 'white' }} />
          </div>
          <h2
            style={{
              color: 'white',
              fontSize: '28px',
              fontWeight: '700',
              margin: '0 0 16px 0',
              background: 'linear-gradient(135deg, #ffffff, #e0e7ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Access Denied
          </h2>
          <p
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '16px',
              margin: '0',
              lineHeight: '1.6',
            }}
          >
            You don't have permission to view videos.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              fontWeight: '500',
            }}
          >
            Loading videos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '20px',
      }}
    >
      {/* Back Button */}
      <div style={{ marginBottom: '24px' }}>
        <BackButton to="/admin" label="Back to Dashboard" />
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Error Banner */}
        {error && (
          <div
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                }}
              >
                <AlertTriangle size={20} color="white" />
              </div>
              <span style={{ fontWeight: '600', color: '#1f2937' }}>
                {error}
              </span>
            </div>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                border: 'none',
                color: '#6b7280',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #ef4444, #dc2626)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
                e.currentTarget.style.color = '#6b7280';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Main Content */}
        {!showForm && !editingVideo && (
          <>
            {/* Header Section */}
            <div
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                padding: '32px',
                marginBottom: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e5e7eb',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Background decorations */}
              <div
                style={{
                  position: 'absolute',
                  top: '-50px',
                  right: '-50px',
                  width: '100px',
                  height: '100px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  borderRadius: '50%',
                  opacity: '0.05',
                  zIndex: 0,
                }}
              ></div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '-30px',
                  width: '60px',
                  height: '60px',
                  background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
                  borderRadius: '50%',
                  opacity: '0.05',
                  zIndex: 0,
                }}
              ></div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    <VideoIcon size={28} color="white" />
                  </div>
                  <div>
                    <h1
                      style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #1f2937, #374151)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: '0 0 8px 0',
                      }}
                    >
                      Video Management
                    </h1>
                    <p
                      style={{
                        fontSize: '16px',
                        color: '#6b7280',
                        margin: '0',
                        fontWeight: '500',
                      }}
                    >
                      Upload and manage video content for your courses
                    </p>
                  </div>
                </div>
                {canCreate && (
                  <button
                    onClick={handleCreateVideo}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform =
                        'translateY(-2px) scale(1.02)';
                      e.currentTarget.style.boxShadow =
                        '0 8px 25px rgba(59, 130, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform =
                        'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow =
                        '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                  >
                    <Plus size={18} />
                    Add New Video
                  </button>
                )}
              </div>
            </div>

            {/* Filter Section */}
            <div style={{ marginBottom: '24px' }}>
              <VideoFilter onFilterChange={setFilters} />
            </div>

            {/* Video List Content */}
            <div style={{ padding: '0' }}>
              <VideoList
                videos={filteredVideos}
                onEdit={canEdit ? handleEditVideo : undefined}
                onDelete={canDelete ? handleDeleteVideo : undefined}
                onAssign={handleAssignVideo}
              />
            </div>
          </>
        )}

        {/* Form Section */}
        {(showForm || editingVideo) && (
          <div
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e5e7eb',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background decorations */}
            <div
              style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: '50%',
                opacity: '0.05',
                zIndex: 0,
              }}
            ></div>
            <div
              style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderRadius: '50%',
                opacity: '0.05',
                zIndex: 0,
              }}
            ></div>

            {/* Form Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <button
                  onClick={handleCancelForm}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                    color: '#374151',
                    border: '1px solid #cbd5e1',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: loading ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background =
                        'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow =
                        '0 8px 25px rgba(59, 130, 246, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.background =
                        'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                      e.currentTarget.style.color = '#374151';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <ArrowLeft size={16} />
                  Back to Videos
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <VideoForm
                video={editingVideo}
                onSave={handleVideoSaved}
                onCancel={handleCancelForm}
              />
            </div>
          </div>
        )}

        {/* Assign Video Dialog */}
        {assigningVideo && (
          <AssignVideoDialog
            video={assigningVideo}
            onSave={handleVideoSaved}
            onClose={handleCancelForm}
          />
        )}
      </div>
    </div>
  );
};

export default VideoManagementPage;
