import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { PerformanceDataPoint } from '../../services/progressService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceChartProps {
  performanceData: PerformanceDataPoint[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  performanceData,
}) => {
  const data = {
    labels: performanceData.map((d) => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Exercise Score',
        data: performanceData.map((d) => d.score),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
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
        text: 'Exercise Performance Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-8">
      {performanceData.length > 1 ? (
        <Line data={data} options={options} />
      ) : (
        <p>Not enough data to display performance chart.</p>
      )}
    </div>
  );
};

export default PerformanceChart;
