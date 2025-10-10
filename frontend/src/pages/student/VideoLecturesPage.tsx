import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { videoService } from '../../services/videoService'; // Assuming you have this api service
import { Video } from '../../types/video'; // Assuming you have this type

const VideoLecturesPage: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded courseId for now. In a real app, you'd get this from user context or a route param.
  const courseId = 'LABTsID1zvPRsVjPjhLd';

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const fetchedVideos = await videoService.getVideosByCourse(courseId);
        setVideos(fetchedVideos);
      } catch (err) {
        setError('Failed to fetch videos. Please try again later.');
        console.error(err);
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
          videos.map((video) => (
            <Link
              key={video.id}
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
