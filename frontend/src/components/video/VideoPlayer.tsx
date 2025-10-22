import React from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

interface VideoPlayerProps {
  videoId: string;
  onEnd?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  onEnd,
  onPlay,
  onPause,
}) => {
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    // access to player in all event handlers via event.target
    console.log('YouTube player ready for video ID:', videoId);
    event.target.pauseVideo();
  };

  const onPlayerError: YouTubeProps['onError'] = (event) => {
    console.error('YouTube player error:', event.data);
  };

  const opts: YouTubeProps['opts'] = {
    height: '390',
    width: '640',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  };

  console.log('Rendering YouTube player with video ID:', videoId);

  return (
    <YouTube
      videoId={videoId}
      opts={opts}
      onReady={onPlayerReady}
      onError={onPlayerError}
      onEnd={onEnd}
      onPlay={onPlay}
      onPause={onPause}
    />
  );
};

export default VideoPlayer;


