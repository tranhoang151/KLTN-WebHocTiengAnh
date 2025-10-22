import React from 'react';
import { Search, Filter } from 'lucide-react';

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
    <div
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '24px',
      }}
    >
      {/* Background decorations */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          borderRadius: '50%',
          opacity: '0.05',
          zIndex: 0,
        }}
      ></div>
      <div
        style={{
          position: 'absolute',
          bottom: '-15px',
          left: '-15px',
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          borderRadius: '50%',
          opacity: '0.05',
          zIndex: 0,
        }}
      ></div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          }}
        >
          <Filter size={20} color="white" />
        </div>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #1f2937, #374151)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0',
          }}
        >
          Filter Videos
        </h3>
      </div>

      <div
        style={{
          marginTop: '20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '16px',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Search size={18} color="#6b7280" />
          </div>
          <input
            type="text"
            placeholder="Search by title or topic..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#1f2937',
              background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
              transition: 'all 0.3s ease',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(59, 130, 246, 0.1)';
              e.currentTarget.style.background = '#ffffff';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.background =
                'linear-gradient(135deg, #ffffff, #f9fafb)';
            }}
          />
        </div>
      </div>

      {/* Placeholder for course filter dropdown */}
      {/* <div style={{ marginTop: '16px' }}>
        <select
          value={courseId}
          onChange={handleCourseChange}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#1f2937',
            background: 'linear-gradient(135deg, #ffffff, #f9fafb)',
            transition: 'all 0.3s ease',
            outline: 'none',
            cursor: 'pointer',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.background = '#ffffff';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff, #f9fafb)';
          }}
        >
          <option value="">All Courses</option>
          // Map over courses here
        </select>
      </div> */}
    </div>
  );
};

export default VideoFilter;


