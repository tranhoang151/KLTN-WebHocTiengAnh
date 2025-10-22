import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import {
  BookOpen,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface CourseFormProps {
  course?: Course | null;
  onSubmit: (courseData: Omit<Course, 'id' | 'created_at'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const CourseForm: React.FC<CourseFormProps> = ({
  course,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        description: course.description || '',
      });
    }
  }, [course]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        ...formData,
        image_url: '', // Set empty string for image_url to match Android app
      });
    } catch (error) {
      console.error('Error submitting course form:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorations */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '120px',
          height: '120px',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          borderRadius: '50%',
          opacity: '0.05',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          borderRadius: '50%',
          opacity: '0.05',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          }}
        >
          <BookOpen size={28} color="white" />
        </div>
        <div>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #1f2937, #374151)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 8px 0',
            }}
          >
            {course ? 'Edit Course' : 'Create New Course'}
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: '0',
              fontWeight: '500',
            }}
          >
            Fill in the course information below
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Course Name */}
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            <BookOpen size={16} color="#6b7280" />
            Course Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter course name"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `2px solid ${errors.name ? '#ef4444' : '#e5e7eb'}`,
              borderRadius: '12px',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              background: '#ffffff',
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.name ? '#ef4444' : '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
          {errors.name && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '6px',
                color: '#ef4444',
                fontSize: '14px',
              }}
            >
              <AlertCircle size={14} />
              {errors.name}
            </div>
          )}
        </div>

        {/* Description */}
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            <FileText size={16} color="#6b7280" />
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter course description"
            disabled={loading}
            rows={4}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `2px solid ${errors.description ? '#ef4444' : '#e5e7eb'}`,
              borderRadius: '12px',
              fontSize: '16px',
              transition: 'all 0.3s ease',
              background: '#ffffff',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.description
                ? '#ef4444'
                : '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
          {errors.description && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '6px',
                color: '#ef4444',
                fontSize: '14px',
              }}
            >
              <AlertCircle size={14} />
              {errors.description}
            </div>
          )}
        </div>



        {/* Form Actions */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'flex-end',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #e2e8f0, #cbd5e1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(0, 0, 0, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #f8fafc, #e2e8f0)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            <XCircle size={18} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: loading
                ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #1d4ed8, #1e40af)';
                e.currentTarget.style.transform =
                  'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow =
                  '0 8px 30px rgba(59, 130, 246, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background =
                  'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 4px 16px rgba(59, 130, 246, 0.4)';
              }
            }}
          >
            {loading ? (
              <>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <style>
                  {`
                                        @keyframes spin {
                                            0% { transform: rotate(0deg); }
                                            100% { transform: rotate(360deg); }
                                        }
                                    `}
                </style>
              </>
            ) : (
              <CheckCircle size={18} />
            )}
            {course ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;


