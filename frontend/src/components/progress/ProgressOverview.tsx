import React from 'react';

interface ProgressOverviewProps {
  streakCount: number;
  totalStudyTimeHours: number;
  completedExercises: number;
}

const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  streakCount,
  totalStudyTimeHours,
  completedExercises,
}) => {
  const stats = [
    {
      name: 'Current Streak',
      value: `${streakCount} days`,
      icon: '🔥',
    },
    {
      name: 'Total Study Time',
      value: `${totalStudyTimeHours} hours`,
      icon: '⏱️',
    },
    {
      name: 'Exercises Completed',
      value: completedExercises,
      icon: '✅',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center text-2xl">
                  {stat.icon}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {stat.value}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressOverview;


