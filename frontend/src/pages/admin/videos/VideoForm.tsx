import React, { useState, useEffect } from 'react';
import { Video } from '../../../types/video';
import { videoService } from '../../../services/videoService';

interface VideoFormProps {
  video?: Video | null;
  onSave: () => void;
  onCancel: () => void;
}

const VideoForm: React.FC<VideoFormProps> = ({ video, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: '',
    courseId: '',
    topic: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        courseId: video.courseId,
        topic: video.topic,
      });
    }
  }, [video]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (video) {
        await videoService.updateVideo(video.id, formData);
      } else {
        await videoService.createVideo(formData);
      }
      onSave();
    } catch (err: any) {
      setError(err.message || 'Failed to save video');
      console.error('Error saving video:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6">
          {video ? 'Edit Video' : 'Add New Video'}
        </h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="videoUrl"
              className="block text-sm font-medium text-gray-700"
            >
              Video URL (YouTube)
            </label>
            <input
              type="url"
              name="videoUrl"
              id="videoUrl"
              value={formData.videoUrl}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              required
            />
          </div>
          <div>
            <label
              htmlFor="thumbnailUrl"
              className="block text-sm font-medium text-gray-700"
            >
              Thumbnail URL
            </label>
            <input
              type="url"
              name="thumbnailUrl"
              id="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional thumbnail image URL"
            />
          </div>
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700"
            >
              Duration (e.g., 05:30)
            </label>
            <input
              type="text"
              name="duration"
              id="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 05:30"
            />
          </div>
          <div>
            <label
              htmlFor="courseId"
              className="block text-sm font-medium text-gray-700"
            >
              Course ID
            </label>
            <input
              type="text"
              name="courseId"
              id="courseId"
              value={formData.courseId}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="topic"
              className="block text-sm font-medium text-gray-700"
            >
              Topic
            </label>
            <input
              type="text"
              name="topic"
              id="topic"
              value={formData.topic}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoForm;
