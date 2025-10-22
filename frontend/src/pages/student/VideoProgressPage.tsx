import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { videoService } from '../../services/videoService';
import { LearningActivity } from '../../types';

const VideoProgressPage: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<LearningActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await videoService.getVideoHistory(user.id);
      setHistory(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load video history.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  if (loading) {
    return <div className="text-center p-8">Loading video history...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Video Learning History</h1>
      {history.length === 0 ? (
        <p>You haven't watched any videos yet.</p>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <ul className="divide-y divide-gray-200">
            {history.map((activity, index) => (
              <li key={index} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      Video ID: {activity.videoId}
                    </p>
                    <p className="text-sm text-gray-500">
                      Watched on:{' '}
                      {new Date(
                        activity.completedAt.seconds * 1000
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatTime(activity.timeSpent)}
                    </p>
                    <p className="text-sm text-gray-500">Time Spent</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VideoProgressPage;


