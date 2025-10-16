import React, { useState, useEffect } from 'react';
import { Class, Course, User } from '../../types';
import { courseService } from '../../services/courseService';
import { classService } from '../../services/classService';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import ChildFriendlyInput from '../ui/ChildFriendlyInput';
import ChildFriendlyCard from '../ui/ChildFriendlyCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import './ClassForm.css';

interface ClassFormProps {
    classData?: Class | null;
    onSubmit: (classData: Omit<Class, 'id' | 'created_at'>) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

const ClassForm: React.FC<ClassFormProps> = ({
    classData,
    onSubmit,
    onCancel,
    loading = false,
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        capacity: 30,
        course_id: '',
        teacher_id: '',
        student_ids: [] as string[],
        is_active: true,
    });

    const [courses, setCourses] = useState<Course[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [availableStudents, setAvailableStudents] = useState<User[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<User[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (classData) {
            setFormData({
                name: classData.name || '',
                description: classData.description || '',
                capacity: classData.capacity || 30,
                course_id: classData.course_id || '',
                teacher_id: classData.teacher_id || '',
                student_ids: classData.student_ids || [],
                is_active: classData.is_active ?? true,
            });
        }
    }, [classData]);

    const loadInitialData = async () => {
        try {
            setLoadingData(true);
            const [coursesData] = await Promise.all([
                courseService.getAllCourses(),
            ]);

            setCourses(coursesData);
            setTeachers([]); // TODO: Implement teacher loading
            setAvailableStudents([]); // TODO: Implement student loading
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Class name is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Class description is required';
        }

        if (!formData.course_id) {
            newErrors.course_id = 'Course selection is required';
        }

        if (!formData.teacher_id) {
            newErrors.teacher_id = 'Teacher assignment is required';
        }

        if (formData.capacity < 1 || formData.capacity > 100) {
            newErrors.capacity = 'Capacity must be between 1 and 100';
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
                student_ids: selectedStudents.map(s => s.id),
            });
        } catch (error) {
            console.error('Error submitting class form:', error);
        }
    };

    const handleInputChange = (field: string, value: any) => {
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

    const handleStudentToggle = (student: User) => {
        setSelectedStudents(prev => {
            const isSelected = prev.some(s => s.id === student.id);
            if (isSelected) {
                return prev.filter(s => s.id !== student.id);
            } else {
                if (prev.length >= formData.capacity) {
                    alert(`Cannot add more students. Class capacity is ${formData.capacity}.`);
                    return prev;
                }
                return [...prev, student];
            }
        });
    };

    if (loadingData) {
        return (
            <div className="class-form-loading">
                <LoadingSpinner />
                <p>Loading form data...</p>
            </div>
        );
    }

    return (
        <ChildFriendlyCard className="class-form-container">
            <div className="class-form-header">
                <h2>{classData ? 'Edit Class' : 'Create New Class'}</h2>
                <p>Set up your class with students and course content</p>
            </div>

            <form onSubmit={handleSubmit} className="class-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="name">Class Name *</label>
                        <ChildFriendlyInput
                            type="text"
                            value={formData.name}
                            onChange={(value) => handleInputChange('name', value)}
                            placeholder="Enter class name"
                            error={errors.name}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="capacity">Capacity *</label>
                        <ChildFriendlyInput
                            type="number"
                            value={formData.capacity.toString()}
                            onChange={(value) => handleInputChange('capacity', parseInt(value) || 0)}
                            placeholder="30"
                            error={errors.capacity}
                            disabled={loading}

                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter class description"
                        className={`class-textarea ${errors.description ? 'error' : ''}`}
                        disabled={loading}
                        rows={3}
                    />
                    {errors.description && (
                        <span className="error-message">{errors.description}</span>
                    )}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="course_id">Course *</label>
                        <select
                            id="course_id"
                            value={formData.course_id}
                            onChange={(e) => handleInputChange('course_id', e.target.value)}
                            className={`class-select ${errors.course_id ? 'error' : ''}`}
                            disabled={loading}
                        >
                            <option value="">Select a course</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                        {errors.course_id && (
                            <span className="error-message">{errors.course_id}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="teacher_id">Teacher *</label>
                        <select
                            id="teacher_id"
                            value={formData.teacher_id}
                            onChange={(e) => handleInputChange('teacher_id', e.target.value)}
                            className={`class-select ${errors.teacher_id ? 'error' : ''}`}
                            disabled={loading}
                        >
                            <option value="">Select a teacher</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.full_name}
                                </option>
                            ))}
                        </select>
                        {errors.teacher_id && (
                            <span className="error-message">{errors.teacher_id}</span>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                disabled={loading}
                            />
                            <span>Class is active</span>
                        </label>
                    </div>
                </div>

                <div className="form-group">
                    <label>Student Assignment</label>
                    <div className="student-selection">
                        <div className="selection-header">
                            <span>Available Students ({availableStudents.length})</span>
                            <span>Selected: {selectedStudents.length}/{formData.capacity}</span>
                        </div>

                        <div className="student-list">
                            {availableStudents.map((student) => {
                                const isSelected = selectedStudents.some(s => s.id === student.id);
                                return (
                                    <div
                                        key={student.id}
                                        className={`student-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleStudentToggle(student)}
                                    >
                                        <div className="student-info">
                                            <span className="student-name">{student.full_name}</span>
                                            <span className="student-email">{student.email}</span>
                                        </div>
                                        <div className="student-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => { }} // Handled by onClick
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
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
                        {classData ? 'Update Class' : 'Create Class'}
                    </ChildFriendlyButton>
                </div>
            </form>
        </ChildFriendlyCard>
    );
};

export default ClassForm;