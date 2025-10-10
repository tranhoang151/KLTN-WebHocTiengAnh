import React, { useState, useEffect } from 'react';
import { Assignment, AssignmentFilters, assignmentService } from '../../services/assignmentService';
import { Course, Class } from '../../types';
import { courseService } from '../../services/courseService';
import { classService } from '../../services/classService';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import ChildFriendlyInput from '../ui/ChildFriendlyInput';
import ChildFriendlyCard from '../ui/ChildFriendlyCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import { useAuth } from '../../contexts/AuthContext';
import './AssignmentList.css';

interface AssignmentListProps {
    onCreateAssignment: () => void;
    onEditAssignment: (assignment: Assignment) => void;
    onViewAssignment: (assignment: Assignment) => void;
    refreshTrigger?: number;
}

const AssignmentList: React.FC<AssignmentListProps> = ({
    onCreateAssignment,
    onEditAssignment,
    onViewAssignment,
    refreshTrigger = 0,
}) => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<AssignmentFilters>({});
    const [sortBy, setSortBy] = useState<'title' | 'due_date' | 'created_at'>('due_date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        loadData();
    }, [refreshTrigger]);

    useEffect(() => {
        applyFiltersAndSearch();
    }, [assignments, searchTerm, filters, sortBy, sortOrder]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [assignmentsData, coursesData, classesData] = await Promise.all([
                assignmentService.getAllAssignments(),
                courseService.getAllCourses(),
                classService.getAllClasses(),
            ]);

            setAssignments(assignmentsData);
            setCourses(coursesData);
            setClasses(classesData);
        } catch (err) {
            console.error('Error loading assignments:', err);
            setError('Failed to load assignments. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndSearch = () => {
        let filtered = [...assignments];

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(assignment =>
                assignment.title.toLowerCase().includes(term) ||
                assignment.description.toLowerCase().includes(term) ||
                assignment.instructions.toLowerCase().includes(term)
            );
        }

        // Apply filters
        if (filters.courseId) {
            filtered = filtered.filter(assignment => assignment.course_id === filters.courseId);
        }

        if (filters.classId) {
            filtered = filtered.filter(assignment => assignment.class_ids.includes(filters.classId));
        }

        if (filters.type) {
            filtered = filtered.filter(assignment => assignment.type === filters.type);
        }

        if (filters.status) {
            const now = new Date();
            filtered = filtered.filter(assignment => {
                switch (filters.status) {
                    case 'active':
                        return assignment.is_active && assignment.start_date <= now && assignment.due_date > now;
                    case 'completed':
                        return assignment.due_date <= now;
                    case 'overdue':
                        return assignment.due_date < now && assignment.is_active;
                    case 'draft':
                        return !assignment.is_active;
                    default:
                        return true;
                }
            });
        }

        if (filters.assignedBy) {
            filtered = filtered.filter(assignment => assignment.assigned_by === filters.assignedBy);
        }

        if (filters.dateRange) {
            filtered = filtered.filter(assignment => {
                const dueDate = new Date(assignment.due_date);
                return dueDate >= filters.dateRange!.start && dueDate <= filters.dateRange!.end;
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue: any, bValue: any;

            switch (sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'due_date':
                    aValue = new Date(a.due_date);
                    bValue = new Date(b.due_date);
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredAssignments(filtered);
    };

    const handleFilterChange = (key: keyof AssignmentFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value || undefined,
        }));
    };

    const clearFilters = () => {
        setFilters({});
        setSearchTerm('');
    };

    const handleDeleteAssignment = async (assignmentId: string) => {
        if (!window.confirm('Are you sure you want to delete this assignment?')) {
            return;
        }

        try {
            await assignmentService.deleteAssignment(assignmentId);
            setAssignments(prev => prev.filter(a => a.id !== assignmentId));
        } catch (err) {
            console.error('Error deleting assignment:', err);
            setError('Failed to delete assignment. Please try again.');
        }
    };

    const handleDuplicateAssignment = async (assignmentId: string) => {
        try {
            const duplicated = await assignmentService.duplicateAssignment(assignmentId);
            setAssignments(prev => [duplicated, ...prev]);
        } catch (err) {
            console.error('Error duplicating assignment:', err);
            setError('Failed to duplicate assignment. Please try again.');
        }
    };

    const getAssignmentStatus = (assignment: Assignment) => {
        const now = new Date();
        const startDate = new Date(assignment.start_date);
        const dueDate = new Date(assignment.due_date);

        if (!assignment.is_active) return 'draft';
        if (dueDate < now) return 'overdue';
        if (startDate <= now && dueDate > now) return 'active';
        return 'scheduled';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'var(--success-color)';
            case 'overdue': return 'var(--error-color)';
            case 'draft': return 'var(--warning-color)';
            case 'scheduled': return 'var(--info-color)';
            default: return 'var(--text-secondary)';
        }
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getCourseNameById = (courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        return course?.name || 'Unknown Course';
    };

    const getClassNamesByIds = (classIds: string[]) => {
        return classIds
            .map(id => classes.find(c => c.id === id)?.name || 'Unknown Class')
            .join(', ');
    };

    if (loading) {
        return (
            <div className="assignment-list-loading">
                <LoadingSpinner />
                <p>Loading assignments...</p>
            </div>
        );
    }

    return (
        <div className="assignment-list-container">
            <div className="assignment-list-header">
                <div className="header-content">
                    <h2>📚 Assignment Management</h2>
                    <p>Create, manage, and track student assignments</p>
                </div>
                <ChildFriendlyButton
                    variant="primary"
                    onClick={onCreateAssignment}
                    className="create-assignment-btn"
                >
                    ➕ Create Assignment
                </ChildFriendlyButton>
            </div>

            {error && (
                <ErrorMessage
                    message={error}
                    onDismiss={() => setError(null)}
                />
            )}

            {/* Filters and Search */}
            <ChildFriendlyCard className="filters-section">
                <div className="filters-header">
                    <h3>🔍 Search & Filter</h3>
                    <ChildFriendlyButton
                        variant="secondary"
                        onClick={clearFilters}
                    >
                        Clear All
                    </ChildFriendlyButton>
                </div>

                <div className="filters-grid">
                    <div className="filter-group">
                        <label>Search</label>
                        <ChildFriendlyInput
                            type="text"
                            value={searchTerm}
                            onChange={setSearchTerm}
                            placeholder="Search assignments..."
                        />
                    </div>

                    <div className="filter-group">
                        <label>Course</label>
                        <select
                            value={filters.courseId || ''}
                            onChange={(e) => handleFilterChange('courseId', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Courses</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Class</label>
                        <select
                            value={filters.classId || ''}
                            onChange={(e) => handleFilterChange('classId', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Classes</option>
                            {classes
                                .filter(cls => !filters.courseId || cls.course_id === filters.courseId)
                                .map(cls => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Type</label>
                        <select
                            value={filters.type || ''}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Types</option>
                            <option value="exercise">Exercises</option>
                            <option value="flashcard_set">Flashcard Sets</option>
                            <option value="video">Videos</option>
                            <option value="mixed">Mixed Content</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Status</label>
                        <select
                            value={filters.status || ''}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="overdue">Overdue</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Sort By</label>
                        <div className="sort-controls">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="filter-select"
                            >
                                <option value="due_date">Due Date</option>
                                <option value="title">Title</option>
                                <option value="created_at">Created Date</option>
                            </select>
                            <ChildFriendlyButton
                                variant="secondary"onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </ChildFriendlyButton>
                        </div>
                    </div>
                </div>
            </ChildFriendlyCard>

            {/* Assignment List */}
            <div className="assignments-grid">
                {filteredAssignments.length === 0 ? (
                    <ChildFriendlyCard className="no-assignments">
                        <div className="no-assignments-content">
                            <span className="no-assignments-icon">📝</span>
                            <h3>No assignments found</h3>
                            <p>
                                {assignments.length === 0
                                    ? "You haven't created any assignments yet."
                                    : "No assignments match your current filters."
                                }
                            </p>
                            {assignments.length === 0 && (
                                <ChildFriendlyButton
                                    variant="primary"
                                    onClick={onCreateAssignment}
                                >
                                    Create Your First Assignment
                                </ChildFriendlyButton>
                            )}
                        </div>
                    </ChildFriendlyCard>
                ) : (
                    filteredAssignments.map((assignment) => {
                        const status = getAssignmentStatus(assignment);
                        return (
                            <ChildFriendlyCard key={assignment.id} className="assignment-card">
                                <div className="assignment-header">
                                    <div className="assignment-title-section">
                                        <h3 className="assignment-title">{assignment.title}</h3>
                                        <span
                                            className="assignment-status"
                                            style={{ backgroundColor: getStatusColor(status) }}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </span>
                                    </div>
                                    <div className="assignment-type">
                                        {assignment.type.replace('_', ' ')}
                                    </div>
                                </div>

                                <div className="assignment-content">
                                    <p className="assignment-description">{assignment.description}</p>

                                    <div className="assignment-details">
                                        <div className="detail-item">
                                            <span className="detail-label">Course:</span>
                                            <span className="detail-value">{getCourseNameById(assignment.course_id)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Classes:</span>
                                            <span className="detail-value">{getClassNamesByIds(assignment.class_ids)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Students:</span>
                                            <span className="detail-value">{assignment.assigned_to.length} assigned</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Content:</span>
                                            <span className="detail-value">{assignment.content_ids.length} items</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Due:</span>
                                            <span className="detail-value">{formatDate(assignment.due_date)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Max Attempts:</span>
                                            <span className="detail-value">{assignment.max_attempts}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="assignment-actions">
                                    <ChildFriendlyButton
                                        variant="secondary"onClick={() => onViewAssignment(assignment)}
                                    >
                                        👁️ View
                                    </ChildFriendlyButton>
                                    <ChildFriendlyButton
                                        variant="secondary"onClick={() => onEditAssignment(assignment)}
                                    >
                                        ✏️ Edit
                                    </ChildFriendlyButton>
                                    <ChildFriendlyButton
                                        variant="secondary"onClick={() => handleDuplicateAssignment(assignment.id)}
                                    >
                                        📋 Duplicate
                                    </ChildFriendlyButton>
                                    <ChildFriendlyButton
                                        variant="secondary"onClick={() => handleDeleteAssignment(assignment.id)}
                                        className="delete-btn"
                                    >
                                        🗑️ Delete
                                    </ChildFriendlyButton>
                                </div>
                            </ChildFriendlyCard>
                        );
                    })
                )}
            </div>

            {/* Summary */}
            {filteredAssignments.length > 0 && (
                <div className="assignments-summary">
                    <p>
                        Showing {filteredAssignments.length} of {assignments.length} assignments
                    </p>
                </div>
            )}
        </div>
    );
};

export default AssignmentList;