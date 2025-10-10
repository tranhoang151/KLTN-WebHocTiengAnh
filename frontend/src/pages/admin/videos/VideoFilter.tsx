import React from 'react';

interface VideoFilterProps {
  onFilterChange: (filters: { searchTerm: string; courseId: string }) => void;
  // We can add courses here for a dropdown filter later
}

const VideoFilter: React.FC<VideoFilterProps> = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [courseId, setCourseId] = React.useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onFilterChange({ searchTerm: e.target.value, courseId });
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCourseId(e.target.value);
    onFilterChange({ searchTerm, courseId: e.target.value });
  };

  return (
    <div className="mb-4 p-4 bg-gray-100 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Search by title or topic..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* Placeholder for course filter dropdown */}
        {/* <select
          value={courseId}
          onChange={handleCourseChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Courses</option>
          // Map over courses here
        </select> */}
      </div>
    </div>
  );
};

export default VideoFilter;
