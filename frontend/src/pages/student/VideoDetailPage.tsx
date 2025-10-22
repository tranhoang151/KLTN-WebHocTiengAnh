import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { videoService } from '../../services/videoService';
import { Video } from '../../types/video';
import VideoPlayer from '../../components/video/VideoPlayer';
import { authService } from '../../services/authService';

const VideoDetailPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const watchTimeRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!videoId) return;

    const fetchVideo = async () => {
      try {
        console.log('Fetching video with ID:', videoId);
        const fetchedVideo = await videoService.getVideoById(videoId);
        console.log('Fetched video:', fetchedVideo);
        setVideo(fetchedVideo);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to fetch video details.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();

    // Cleanup function to send progress when the component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Send final progress on unmount if video was played
      if (watchTimeRef.current > 0) {
        sendProgress(false); // Not necessarily completed
      }
    };
  }, [videoId]);

  const sendProgress = async (completed: boolean) => {
    const user = authService.getCurrentUser();
    if (videoId && user && video) {
      try {
        // Handle both Firebase User and Backend User types
        const userId = 'uid' in user ? user.uid : (user as any).id;
        await videoService.updateVideoProgress({
          userId: userId,
          videoId: videoId,
          courseId: video.courseId, // Assuming courseId is part of the Video type
          completed: completed,
          watchTime: Math.round(watchTimeRef.current),
        });
        console.log(
          `Video progress updated. Completed: ${completed}, Watch time: ${watchTimeRef.current}`
        );
      } catch (error) {
        console.error('Failed to update video progress', error);
      }
    }
  };

  const handlePlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      watchTimeRef.current += 1;
    }, 1000);
  };

  const handlePause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Send progress update on pause
    sendProgress(false);
  };

  const handleVideoEnd = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    sendProgress(true);
  };

  const extractYouTubeId = (url: string): string => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('v') || '';
    } catch (e) {
      // Fallback for youtu.be links or other formats
      const match = url.match(
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|watch\?v=|embed\/|v\/)|youtu\.be\/)([^"&?\/\s]{11})/
      );
      return match ? match[1] : '';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!video) {
    return <div>Video not found.</div>;
  }

  const youtubeVideoId = extractYouTubeId(video.videoUrl);
  console.log('Video URL:', video.videoUrl);
  console.log('Extracted YouTube ID:', youtubeVideoId);

  return (
    <div className="container mt-4">
      <h2>{video.title}</h2>
      <p>{video.description}</p>
      {youtubeVideoId ? (
        <VideoPlayer
          videoId={youtubeVideoId}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnd={handleVideoEnd}
        />
      ) : (
        <div className="alert alert-danger">
          Invalid YouTube URL provided: {video.videoUrl}
        </div>
      )}
    </div>
  );
};

export default VideoDetailPage;


