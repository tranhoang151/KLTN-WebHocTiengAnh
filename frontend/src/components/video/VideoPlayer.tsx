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
    event.target.pauseVideo();
  };

  const opts: YouTubeProps['opts'] = {
    height: '390',
    width: '640',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
    },
  };

  return (
    <YouTube
      videoId={videoId}
      opts={opts}
      onReady={onPlayerReady}
      onEnd={onEnd}
      onPlay={onPlay}
      onPause={onPause}
    />
  );
};

export default VideoPlayer;
