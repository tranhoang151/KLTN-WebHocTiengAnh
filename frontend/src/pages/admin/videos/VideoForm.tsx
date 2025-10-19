import React, { useState, useEffect } from 'react';
import { Video } from '../../../types/video';
import { videoService } from '../../../services/videoService';
import {
  Video as VideoIcon,
  Save,
  X,
  AlertTriangle,
  FileText,
  Link,
  Image,
  Clock,
  BookOpen,
  Tag,
} from 'lucide-react';

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
    <div
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '20px',
        padding: '32px',
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

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          }}
        >
          <VideoIcon size={24} color="white" />
        </div>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #1f2937, #374151)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0',
          }}
        >
          {video ? 'Edit Video' : 'Add New Video'}
        </h2>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
            border: '1px solid #fca5a5',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
            }}
          >
            <AlertTriangle size={16} color="white" />
          </div>
          <span
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#dc2626',
            }}
          >
            {error}
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div>
          <label
            htmlFor="title"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            <FileText size={16} color="#3b82f6" />
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#1f2937',
              background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
              transition: 'all 0.3s ease',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(59, 130, 246, 0.1)';
              e.currentTarget.style.background = '#ffffff';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background =
                'linear-gradient(135deg, #ffffff, #f9fafb)';
            }}
            required
          />
        </div>
        <div>
          <label
            htmlFor="description"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            <FileText size={16} color="#3b82f6" />
            Description
          </label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#1f2937',
              background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
              transition: 'all 0.3s ease',
              outline: 'none',
              resize: 'vertical',
              minHeight: '80px',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(59, 130, 246, 0.1)';
              e.currentTarget.style.background = '#ffffff';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background =
                'linear-gradient(135deg, #ffffff, #f9fafb)';
            }}
            required
          ></textarea>
        </div>
        <div>
          <label
            htmlFor="videoUrl"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            <Link size={16} color="#3b82f6" />
            Video URL (YouTube)
          </label>
          <input
            type="url"
            name="videoUrl"
            id="videoUrl"
            value={formData.videoUrl}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#1f2937',
              background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
              transition: 'all 0.3s ease',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(59, 130, 246, 0.1)';
              e.currentTarget.style.background = '#ffffff';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background =
                'linear-gradient(135deg, #ffffff, #f9fafb)';
            }}
            placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            required
          />
        </div>
        <div>
          <label
            htmlFor="thumbnailUrl"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            <Image size={16} color="#3b82f6" />
            Thumbnail URL
          </label>
          <input
            type="url"
            name="thumbnailUrl"
            id="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#1f2937',
              background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
              transition: 'all 0.3s ease',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(59, 130, 246, 0.1)';
              e.currentTarget.style.background = '#ffffff';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background =
                'linear-gradient(135deg, #ffffff, #f9fafb)';
            }}
            placeholder="Optional thumbnail image URL"
          />
        </div>
        <div>
          <label
            htmlFor="duration"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            <Clock size={16} color="#3b82f6" />
            Duration (e.g., 05:30)
          </label>
          <input
            type="text"
            name="duration"
            id="duration"
            value={formData.duration}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#1f2937',
              background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
              transition: 'all 0.3s ease',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(59, 130, 246, 0.1)';
              e.currentTarget.style.background = '#ffffff';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background =
                'linear-gradient(135deg, #ffffff, #f9fafb)';
            }}
            placeholder="e.g., 05:30"
          />
        </div>
        <div>
          <label
            htmlFor="courseId"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            <BookOpen size={16} color="#3b82f6" />
            Course ID
          </label>
          <input
            type="text"
            name="courseId"
            id="courseId"
            value={formData.courseId}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#1f2937',
              background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
              transition: 'all 0.3s ease',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(59, 130, 246, 0.1)';
              e.currentTarget.style.background = '#ffffff';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background =
                'linear-gradient(135deg, #ffffff, #f9fafb)';
            }}
            required
          />
        </div>
        <div>
          <label
            htmlFor="topic"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            <Tag size={16} color="#3b82f6" />
            Topic
          </label>
          <input
            type="text"
            name="topic"
            id="topic"
            value={formData.topic}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#1f2937',
              background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
              transition: 'all 0.3s ease',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(59, 130, 246, 0.1)';
              e.currentTarget.style.background = '#ffffff';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background =
                'linear-gradient(135deg, #ffffff, #f9fafb)';
            }}
            required
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              color: '#374151',
              border: '1px solid #cbd5e1',
              padding: '12px 24px',
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
                  'linear-gradient(135deg, #e5e7eb, #d1d5db)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <X size={16} />
            Back to Videos
          </button>
          <button
            type="submit"
            disabled={loading}
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
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.6 : 1,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform =
                  'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow =
                  '0 8px 25px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(59, 130, 246, 0.3)';
              }
            }}
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Video'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoForm;
