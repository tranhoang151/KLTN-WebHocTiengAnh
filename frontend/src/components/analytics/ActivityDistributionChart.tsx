import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ActivityDistributionChartProps {
  activityData: Record<string, number>;
}

const ActivityDistributionChart: React.FC<ActivityDistributionChartProps> = ({
  activityData,
}) => {
  const data = {
    labels: Object.keys(activityData),
    datasets: [
      {
        label: '# of Activities',
        data: Object.values(activityData),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Learning Activity Distribution',
      },
    },
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default ActivityDistributionChart;


