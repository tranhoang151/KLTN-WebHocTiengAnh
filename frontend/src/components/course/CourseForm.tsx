import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import ChildFriendlyInput from '../ui/ChildFriendlyInput';
import ChildFriendlyCard from '../ui/ChildFriendlyCard';
import './CourseForm.css';

interface CourseFormProps {
    course?: Course | null;
    onSubmit: (courseData: Omit<Course, 'id'>) => Promise<void>;
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
        image_url: '',
        target_age_group: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (course) {
            setFormData({
                name: course.name || '',
                description: course.description || '',
                image_url: course.image_url || '',
                target_age_group: course.target_age_group || '',
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

        if (!formData.target_age_group.trim()) {
            newErrors.target_age_group = 'Target age group is required';
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
            await onSubmit(formData);
        } catch (error) {
            console.error('Error submitting course form:', error);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: '',
            }));
        }
    };

    return (
        <ChildFriendlyCard className="course-form-container">
            <div className="course-form-header">
                <h2>{course ? 'Edit Course' : 'Create New Course'}</h2>
                <p>Fill in the course information below</p>
            </div>

            <form onSubmit={handleSubmit} className="course-form">
                <div className="form-group">
                    <label htmlFor="name">Course Name *</label>
                    <ChildFriendlyInput
                        type="text"
                        value={formData.name}
                        onChange={(value) => handleInputChange('name', value)}
                        placeholder="Enter course name"
                        error={errors.name}
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter course description"
                        className={`course-textarea ${errors.description ? 'error' : ''}`}
                        disabled={loading}
                        rows={4}
                    />
                    {errors.description && (
                        <span className="error-message">{errors.description}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="image_url">Course Image URL</label>
                    <ChildFriendlyInput

                        type="text"
                        value={formData.image_url}
                        onChange={(value) => handleInputChange('image_url', value)}
                        placeholder="Enter image URL (optional)"
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="target_age_group">Target Age Group *</label>
                    <select
                        id="target_age_group"
                        value={formData.target_age_group}
                        onChange={(e) => handleInputChange('target_age_group', e.target.value)}
                        className={`course-select ${errors.target_age_group ? 'error' : ''}`}
                        disabled={loading}
                    >
                        <option value="">Select age group</option>
                        <option value="3-5">3-5 years</option>
                        <option value="6-8">6-8 years</option>
                        <option value="9-12">9-12 years</option>
                        <option value="13-15">13-15 years</option>
                        <option value="16+">16+ years</option>
                    </select>
                    {errors.target_age_group && (
                        <span className="error-message">{errors.target_age_group}</span>
                    )}
                </div>

                <div className="form-actions">
                    <ChildFriendlyButton
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </ChildFriendlyButton>
                    <ChildFriendlyButton
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        loading={loading}
                    >
                        {course ? 'Update Course' : 'Create Course'}
                    </ChildFriendlyButton>
                </div>
            </form>
        </ChildFriendlyCard>
    );
};

export default CourseForm;