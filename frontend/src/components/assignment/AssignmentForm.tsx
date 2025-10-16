import React, { useState, useEffect } from 'react';
import { Assignment, assignmentService } from '../../services/assignmentService';
import { Course, Class, Exercise, User } from '../../types';
import { courseService } from '../../services/courseService';
import { classService } from '../../services/classService';
import { exerciseService } from '../../services/exerciseService';
import { flashcardService } from '../../services/flashcardService';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import ChildFriendlyInput from '../ui/ChildFriendlyInput';
import ChildFriendlyCard from '../ui/ChildFriendlyCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import './AssignmentForm.css';

interface AssignmentFormProps {
    assignment?: Assignment | null;
    onSubmit: (assignmentData: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({
    assignment,
    onSubmit,
    onCancel,
    loading = false,
}) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'exercise' as Assignment['type'],
        course_id: '',
        class_ids: [] as string[],
        content_ids: [] as string[],
        assigned_by: user?.id || '',
        assigned_to: [] as string[],
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        start_date: new Date(),
        is_active: true,
        allow_late_submission: true,
        max_attempts: 3,
        time_limit: undefined as number | undefined,
        instructions: '',
    });

    const [courses, setCourses] = useState<Course[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [availableContent, setAvailableContent] = useState<{
        exercises: Exercise[];
        flashcard_sets: any[];
        videos: any[];
    }>({ exercises: [], flashcard_sets: [], videos: [] });
    const [selectedStudents, setSelectedStudents] = useState<User[]>([]);
    const [availableStudents, setAvailableStudents] = useState<User[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loadingData, setLoadingData] = useState(true);
    const [loadingContent, setLoadingContent] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (assignment) {
            setFormData({
                title: assignment.title || '',
                description: assignment.description || '',
                type: assignment.type || 'exercise',
                course_id: assignment.course_id || '',
                class_ids: assignment.class_ids || [],
                content_ids: assignment.content_ids || [],
                assigned_by: assignment.assigned_by || user?.id || '',
                assigned_to: assignment.assigned_to || [],
                due_date: assignment.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                start_date: assignment.start_date || new Date(),
                is_active: assignment.is_active ?? true,
                allow_late_submission: assignment.allow_late_submission ?? true,
                max_attempts: assignment.max_attempts || 3,
                time_limit: assignment.time_limit,
                instructions: assignment.instructions || '',
            });
        }
    }, [assignment, user]);

    useEffect(() => {
        if (formData.course_id) {
            loadAvailableContent(formData.course_id);
        }
    }, [formData.course_id, formData.type]);

    useEffect(() => {
        if (formData.class_ids.length > 0) {
            loadStudentsForClasses(formData.class_ids);
        }
    }, [formData.class_ids]);

    const loadInitialData = async () => {
        try {
            setLoadingData(true);
            const [coursesData, classesData] = await Promise.all([
                courseService.getAllCourses(),
                classService.getAllClasses(),
            ]);
            setCourses(coursesData);
            setClasses(classesData as any[]);
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const loadAvailableContent = async (courseId: string) => {
        try {
            setLoadingContent(true);
            const content = await assignmentService.getAvailableContent(courseId);
            setAvailableContent(content);
        } catch (error) {
            console.error('Error loading available content:', error);
        } finally {
            setLoadingContent(false);
        }
    };

    const loadStudentsForClasses = async (classIds: string[]) => {
        try {
            const students = await assignmentService.getStudentsForAssignment(classIds);
            setAvailableStudents(students);
            // Auto-select all students if none are selected
            if (formData.assigned_to.length === 0) {
                setFormData(prev => ({
                    ...prev,
                    assigned_to: students.map(s => s.id),
                }));
                setSelectedStudents(students);
            }
        } catch (error) {
            console.error('Error loading students:', error);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Assignment title is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Assignment description is required';
        }

        if (!formData.course_id) {
            newErrors.course_id = 'Course selection is required';
        }

        if (formData.class_ids.length === 0) {
            newErrors.class_ids = 'At least one class must be selected';
        }

        if (formData.content_ids.length === 0) {
            newErrors.content_ids = 'At least one content item must be selected';
        }

        if (formData.assigned_to.length === 0) {
            newErrors.assigned_to = 'At least one student must be assigned';
        }

        if (formData.due_date <= formData.start_date) {
            newErrors.due_date = 'Due date must be after start date';
        }

        if (formData.max_attempts < 1 || formData.max_attempts > 10) {
            newErrors.max_attempts = 'Max attempts must be between 1 and 10';
        }

        if (formData.time_limit && (formData.time_limit < 1 || formData.time_limit > 300)) {
            newErrors.time_limit = 'Time limit must be between 1 and 300 minutes';
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
            console.error('Error submitting assignment:', error);
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

    const handleClassSelection = (classId: string, selected: boolean) => {
        const newClassIds = selected
            ? [...formData.class_ids, classId]
            : formData.class_ids.filter(id => id !== classId);

        handleInputChange('class_ids', newClassIds);
    };

    const handleContentSelection = (contentId: string, selected: boolean) => {
        const newContentIds = selected
            ? [...formData.content_ids, contentId]
            : formData.content_ids.filter(id => id !== contentId);

        handleInputChange('content_ids', newContentIds);
    };

    const handleStudentSelection = (studentId: string, selected: boolean) => {
        const newStudentIds = selected
            ? [...formData.assigned_to, studentId]
            : formData.assigned_to.filter(id => id !== studentId);

        handleInputChange('assigned_to', newStudentIds);

        const newSelectedStudents = selected
            ? [...selectedStudents, availableStudents.find(s => s.id === studentId)!]
            : selectedStudents.filter(s => s.id !== studentId);

        setSelectedStudents(newSelectedStudents);
    };

    const handleSelectAllStudents = (selected: boolean) => {
        if (selected) {
            handleInputChange('assigned_to', availableStudents.map(s => s.id));
            setSelectedStudents(availableStudents);
        } else {
            handleInputChange('assigned_to', []);
            setSelectedStudents([]);
        }
    };

    const getContentByType = () => {
        switch (formData.type) {
            case 'exercise':
                return availableContent.exercises;
            case 'flashcard_set':
                return availableContent.flashcard_sets;
            case 'video':
                return availableContent.videos;
            default:
                return [];
        }
    };

    const formatDate = (date: Date) => {
        return date.toISOString().slice(0, 16); // Format for datetime-local input
    };

    const parseDate = (dateString: string) => {
        return new Date(dateString);
    };

    if (loadingData) {
        return (
            <div className="assignment-form-loading">
                <LoadingSpinner />
                <p>Loading assignment form...</p>
            </div>
        );
    }

    return (
        <ChildFriendlyCard className="assignment-form-container">
            <div className="assignment-form-header">
                <h2>{assignment ? 'Edit Assignment' : 'Create New Assignment'}</h2>
                <p>Assign content to your students and track their progress</p>
            </div>

            <form onSubmit={handleSubmit} className="assignment-form">
                {/* Basic Information */}
                <div className="form-section">
                    <h3>Assignment Details</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="title">Assignment Title *</label>
                            <ChildFriendlyInput
                                type="text"
                                value={formData.title}
                                onChange={(value) => handleInputChange('title', value)}
                                placeholder="Enter assignment title"
                                error={errors.title}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="type">Content Type *</label>
                            <select
                                id="type"
                                value={formData.type}
                                onChange={(e) => handleInputChange('type', e.target.value)}
                                className={`assignment-select ${errors.type ? 'error' : ''}`}
                                disabled={loading}
                            >
                                <option value="exercise">Exercises</option>
                                <option value="flashcard_set">Flashcard Sets</option>
                                <option value="video">Videos</option>
                                <option value="mixed">Mixed Content</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description *</label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Enter assignment description"
                            className={`assignment-textarea ${errors.description ? 'error' : ''}`}
                            disabled={loading}
                            rows={3}
                        />
                        {errors.description && (
                            <span className="error-message">{errors.description}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="instructions">Instructions</label>
                        <textarea
                            id="instructions"
                            value={formData.instructions}
                            onChange={(e) => handleInputChange('instructions', e.target.value)}
                            placeholder="Enter detailed instructions for students"
                            className="assignment-textarea"
                            disabled={loading}
                            rows={4}
                        />
                    </div>
                </div>

                {/* Course and Class Selection */}
                <div className="form-section">
                    <h3>Course and Classes</h3>

                    <div className="form-group">
                        <label htmlFor="course_id">Course *</label>
                        <select
                            id="course_id"
                            value={formData.course_id}
                            onChange={(e) => handleInputChange('course_id', e.target.value)}
                            className={`assignment-select ${errors.course_id ? 'error' : ''}`}
                            disabled={loading}
                        >
                            <option value="">Select a course</option>
                            {courses.map(course => (
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
                        <label>Classes *</label>
                        <div className="checkbox-grid">
                            {classes
                                .filter(cls => cls.course_id === formData.course_id)
                                .map(cls => (
                                    <label key={cls.id} className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            checked={formData.class_ids.includes(cls.id)}
                                            onChange={(e) => handleClassSelection(cls.id, e.target.checked)}
                                            disabled={loading}
                                        />
                                        <span className="checkbox-label">
                                            {cls.name}
                                        </span>
                                    </label>
                                ))}
                        </div>
                        {errors.class_ids && (
                            <span className="error-message">{errors.class_ids}</span>
                        )}
                    </div>
                </div>

                {/* Content Selection */}
                {formData.course_id && (
                    <div className="form-section">
                        <h3>Content Selection</h3>

                        {loadingContent ? (
                            <LoadingSpinner />
                        ) : (
                            <div className="content-selection">
                                <div className="content-grid">
                                    {getContentByType().map((content: any) => (
                                        <label key={content.id} className="content-item">
                                            <input
                                                type="checkbox"
                                                checked={formData.content_ids.includes(content.id)}
                                                onChange={(e) => handleContentSelection(content.id, e.target.checked)}
                                                disabled={loading}
                                            />
                                            <div className="content-info">
                                                <h4>{content.title || content.name}</h4>
                                                <p>{content.description}</p>
                                                <span className="content-type">{formData.type}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {errors.content_ids && (
                                    <span className="error-message">{errors.content_ids}</span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Student Selection */}
                {availableStudents.length > 0 && (
                    <div className="form-section">
                        <h3>Student Assignment</h3>

                        <div className="student-selection">
                            <div className="select-all-section">
                                <label className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedStudents.length === availableStudents.length}
                                        onChange={(e) => handleSelectAllStudents(e.target.checked)}
                                        disabled={loading}
                                    />
                                    <span className="checkbox-label">
                                        Select All Students ({availableStudents.length})
                                    </span>
                                </label>
                            </div>

                            <div className="student-grid">
                                {availableStudents.map(student => (
                                    <label key={student.id} className="student-item">
                                        <input
                                            type="checkbox"
                                            checked={formData.assigned_to.includes(student.id)}
                                            onChange={(e) => handleStudentSelection(student.id, e.target.checked)}
                                            disabled={loading}
                                        />
                                        <span className="student-name">
                                            {student.full_name || student.email}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.assigned_to && (
                                <span className="error-message">{errors.assigned_to}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Assignment Settings */}
                <div className="form-section">
                    <h3>Assignment Settings</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="start_date">Start Date *</label>
                            <input
                                type="datetime-local"
                                id="start_date"
                                value={formatDate(formData.start_date)}
                                onChange={(e) => handleInputChange('start_date', parseDate(e.target.value))}
                                className={`assignment-input ${errors.start_date ? 'error' : ''}`}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="due_date">Due Date *</label>
                            <input
                                type="datetime-local"
                                id="due_date"
                                value={formatDate(formData.due_date)}
                                onChange={(e) => handleInputChange('due_date', parseDate(e.target.value))}
                                className={`assignment-input ${errors.due_date ? 'error' : ''}`}
                                disabled={loading}
                            />
                            {errors.due_date && (
                                <span className="error-message">{errors.due_date}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="max_attempts">Max Attempts *</label>
                            <input
                                type="number"
                                id="max_attempts"
                                value={formData.max_attempts}
                                onChange={(e) => handleInputChange('max_attempts', parseInt(e.target.value))}
                                className={`assignment-input ${errors.max_attempts ? 'error' : ''}`}
                                disabled={loading}
                                min="1"
                                max="10"
                            />
                            {errors.max_attempts && (
                                <span className="error-message">{errors.max_attempts}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="time_limit">Time Limit (minutes)</label>
                            <input
                                type="number"
                                id="time_limit"
                                value={formData.time_limit || ''}
                                onChange={(e) => handleInputChange('time_limit', e.target.value ? parseInt(e.target.value) : undefined)}
                                className={`assignment-input ${errors.time_limit ? 'error' : ''}`}
                                disabled={loading}
                                min="1"
                                max="300"
                                placeholder="Optional"
                            />
                            {errors.time_limit && (
                                <span className="error-message">{errors.time_limit}</span>
                            )}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                    disabled={loading}
                                />
                                <span className="checkbox-label">Assignment is active</span>
                            </label>
                        </div>

                        <div className="form-group">
                            <label className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={formData.allow_late_submission}
                                    onChange={(e) => handleInputChange('allow_late_submission', e.target.checked)}
                                    disabled={loading}
                                />
                                <span className="checkbox-label">Allow late submissions</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <ChildFriendlyButton
                        type="button"
                        onClick={onCancel}
                        variant="secondary"
                        disabled={loading}
                    >
                        Cancel
                    </ChildFriendlyButton>

                    <ChildFriendlyButton
                        type="submit"
                        variant="primary"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (assignment ? 'Update Assignment' : 'Create Assignment')}
                    </ChildFriendlyButton>
                </div>
            </form>
        </ChildFriendlyCard>
    );
};

export default AssignmentForm;