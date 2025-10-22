import React from 'react';
import StudentStreakCalendar from '../../components/progress/StudentStreakCalendar';
import StreakStatistics from '../../components/progress/StreakStatistics';

const StreakPage: React.FC = () => {
  return (
    <div className="streak-page">
      <div className="page-header">
        <h1>🔥 My Learning Streak</h1>
        <p>
          Track your daily learning activities and build consistent study habits
        </p>
      </div>

      <div className="streak-content">
        {/* Detailed Statistics */}
        <div className="streak-section">
          <StreakStatistics showCalendar={true} />
        </div>

        {/* Full Calendar View */}
        <div className="streak-section">
          <StudentStreakCalendar />
        </div>
      </div>
    </div>
  );
};

export default StreakPage;


