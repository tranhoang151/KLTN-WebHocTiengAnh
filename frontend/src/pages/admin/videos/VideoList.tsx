import React from 'react';
import { Video } from '../../../types/video';

interface VideoListProps {
  videos: Video[];
  onEdit: (video: Video) => void;
  onDelete: (videoId: string) => void;
  onAssign: (video: Video) => void;
}

const VideoList: React.FC<VideoListProps> = ({
  videos,
  onEdit,
  onDelete,
  onAssign,
}) => {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🎥</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No videos found
        </h3>
        <p className="text-gray-500">
          Add new videos to start managing your video lessons.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Course
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Topic
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {videos.map((video) => (
            <tr key={video.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {video.thumbnailUrl && (
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-md object-cover"
                        src={video.thumbnailUrl}
                        alt={video.title}
                      />
                    </div>
                  )}
                  <div className={video.thumbnailUrl ? 'ml-4' : ''}>
                    <div className="text-sm font-medium text-gray-900">
                      {video.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {video.description}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {video.courseId} {/* This should ideally be course name */}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {video.topic}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {video.duration}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onEdit(video)}
                    className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded transition-colors"
                    title="Edit video"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(video.id)}
                    className="text-red-600 hover:text-red-900 px-2 py-1 rounded transition-colors"
                    title="Delete video"
                  >
                    🗑️
                  </button>
                  <button
                    onClick={() => onAssign(video)}
                    className="text-green-600 hover:text-green-900 px-2 py-1 rounded transition-colors"
                    title="Assign video to classes"
                  >
                    🔗
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VideoList;
