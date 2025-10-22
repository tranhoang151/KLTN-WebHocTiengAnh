import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { videoService } from '../../services/videoService';
import { Video } from '../../types/video';

interface VideoLecturesPageProps {
  courseId: string;
}

const VideoLecturesPage: React.FC<VideoLecturesPageProps> = ({ courseId }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        console.log('Fetching videos for courseId:', courseId);
        const fetchedVideos = await videoService.getVideosByCourse(courseId);
        console.log('Fetched videos:', fetchedVideos);
        setVideos(fetchedVideos);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to fetch videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [courseId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Video Lectures</h2>
      <div className="list-group">
        {videos.length > 0 ? (
          videos.map((video, index) => (
            <Link
              key={video.id || `video-${index}`}
              to={`/student/videos/${video.id}`}
              className="list-group-item list-group-item-action"
            >
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">{video.title}</h5>
                <small>{video.duration}</small>
              </div>
              <p className="mb-1">{video.description}</p>
              <small>Topic: {video.topic}</small>
            </Link>
          ))
        ) : (
          <p>No videos found for this course.</p>
        )}
      </div>
    </div>
  );
};

export default VideoLecturesPage;


