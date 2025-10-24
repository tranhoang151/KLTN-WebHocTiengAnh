import React from 'react';
import { LearningActivity } from '../../types';

interface ActivityTimelineProps {
  activities: LearningActivity[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '▶️';
      case 'exercise':
        return '📝';
      case 'flashcard_set':
        return '📇';
      default:
        return '⭐';
    }
  };

  const getActivityTitle = (activity: LearningActivity) => {
    switch (activity.type) {
      case 'video':
        return `Watched video`;
      case 'exercise':
        return `Completed an exercise`;
      case 'flashcard_set':
        return `Finished a flashcard set`;
      default:
        return 'New activity';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-8">
      <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
      {activities.length === 0 ? (
        <p className="text-gray-500">No recent activity to display.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {activities.map((activity, index) => (
            <li key={index} className="py-4 flex items-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-grow">
                <p className="font-medium text-gray-800">
                  {getActivityTitle(activity)}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(
                    activity.completedAt.seconds * 1000
                  ).toLocaleString()}
                </p>
              </div>
              {activity.score != null && (
                <div className="text-right">
                  <p className="font-semibold text-lg text-blue-600">
                    {activity.score.toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-500">Score</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityTimeline;
