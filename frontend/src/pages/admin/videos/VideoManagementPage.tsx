import React, { useState, useEffect, useMemo } from 'react';
import { videoService } from '../../../services/videoService';
import { Video } from '../../../types/video';
import VideoList from './VideoList';
import VideoForm from './VideoForm';
import AssignVideoDialog from './AssignVideoDialog';
import VideoFilter from './VideoFilter'; // Import the new component

const VideoManagementPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [assigningVideo, setAssigningVideo] = useState<Video | null>(null);
  const [filters, setFilters] = useState({ searchTerm: '', courseId: '' });

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

  if (loading) {
    return <div className="text-center py-8">Loading videos...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Video Management</h1>
        <button
          onClick={handleCreateVideo}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add New Video
        </button>
      </div>

      <VideoFilter onFilterChange={setFilters} />

      <VideoList
        videos={filteredVideos}
        onEdit={handleEditVideo}
        onDelete={handleDeleteVideo}
        onAssign={handleAssignVideo}
      />

      {(showForm || editingVideo) && (
        <VideoForm
          video={editingVideo}
          onSave={handleVideoSaved}
          onCancel={handleCancelForm}
        />
      )}

      {assigningVideo && (
        <AssignVideoDialog
          video={assigningVideo}
          onSave={handleVideoSaved}
          onClose={handleCancelForm}
        />
      )}
    </div>
  );
};

export default VideoManagementPage;
