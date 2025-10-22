import React, { useState, useEffect } from 'react';
import { Class } from '../../services/classService';
import { classService } from '../../services/classService';
import { useAuth } from '../../contexts/AuthContext';
import {
    X,
    Search,
    Check,
    Users,
    AlertCircle,
    RefreshCw,
    UserCheck,
} from 'lucide-react';
import './AssignClassesDialog.css';

interface AssignClassesDialogProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    courseName: string;
    currentClassIds: string[];
    onSuccess: () => void;
}

const AssignClassesDialog: React.FC<AssignClassesDialogProps> = ({
    isOpen,
    onClose,
    courseId,
    courseName,
    currentClassIds,
    onSuccess,
}) => {
    const { getAuthToken } = useAuth();
    const [allClasses, setAllClasses] = useState<Class[]>([]);
    const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadClasses();
            setSelectedClassIds(currentClassIds);
        }
    }, [isOpen, currentClassIds]);

    useEffect(() => {
        // Filter available classes (classes not assigned to any course)
        const available = allClasses.filter(
            (cls) => !cls.courseId || cls.courseId === courseId
        );
        setAvailableClasses(available);
    }, [allClasses, courseId]);

    const loadClasses = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await getAuthToken();
            const classes = await classService.getAllClasses(token);
            setAllClasses(classes);
        } catch (err: any) {
            setError(err.message || 'Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const getFilteredClasses = () => {
        if (!searchQuery.trim()) {
            return availableClasses;
        }

        const query = searchQuery.toLowerCase();
        return availableClasses.filter(
            (cls) =>
                cls.name.toLowerCase().includes(query) ||
                cls.description.toLowerCase().includes(query)
        );
    };

    const handleClassToggle = (classId: string) => {
        setSelectedClassIds((prev) => {
            if (prev.includes(classId)) {
                return prev.filter((id) => id !== classId);
            } else {
                return [...prev, classId];
            }
        });
    };

    const handleAssignClasses = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await getAuthToken();

            // Get classes to add and remove
            const classesToAdd = selectedClassIds.filter(
                (id) => !currentClassIds.includes(id)
            );
            const classesToRemove = currentClassIds.filter(
                (id) => !selectedClassIds.includes(id)
            );

            // Remove classes from course
            for (const classId of classesToRemove) {
                await classService.updateClass(
                    classId,
                    { courseId: undefined }
                );
            }

            // Add classes to course
            for (const classId of classesToAdd) {
                await classService.updateClass(
                    classId,
                    { courseId: courseId }
                );
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to assign classes');
        } finally {
            setLoading(false);
        }
    };

    const getSelectedClassesCount = () => {
        return selectedClassIds.length;
    };

    const getAvailableClassesCount = () => {
        return availableClasses.length;
    };

    const getAssignedClassesInfo = () => {
        const assignedToOtherCourses = allClasses.filter(
            (cls) => cls.courseId && cls.courseId !== courseId
        );
        return {
            count: assignedToOtherCourses.length,
            classes: assignedToOtherCourses,
        };
    };

    if (!isOpen) return null;

    const assignedInfo = getAssignedClassesInfo();

    return (
        <div className="assign-classes-overlay">
            <div className="assign-classes-dialog">
                {/* Header */}
                <div className="dialog-header">
                    <div className="header-content">
                        <div className="header-icon">
                            <UserCheck size={24} color="white" />
                        </div>
                        <div className="header-info">
                            <h2>Assign Classes to Course</h2>
                            <p>Select classes to assign to "{courseName}"</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="close-button">
                        <X size={20} />
                    </button>
                </div>

                {/* Warning Banner */}
                {assignedInfo.count > 0 && (
                    <div className="warning-banner">
                        <AlertCircle size={16} />
                        <div>
                            <strong>{assignedInfo.count} classes are already assigned to other courses</strong>
                            <p>These classes will not appear in the selection list below.</p>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="search-section">
                    <div className="search-input-container">
                        <Search size={16} color="#6b7280" />
                        <input
                            type="text"
                            placeholder="Search classes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="selection-info">
                        <span className="selection-count">
                            {getSelectedClassesCount()} selected ({getAvailableClassesCount()} available)
                        </span>
                    </div>
                </div>

                {/* Classes List */}
                <div className="classes-section">
                    {loading ? (
                        <div className="loading-state">
                            <div className="loading-spinner" />
                            <p>Loading classes...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <AlertCircle size={32} color="#ef4444" />
                            <p>{error}</p>
                            <button onClick={loadClasses} className="retry-button">
                                <RefreshCw size={16} />
                                Try Again
                            </button>
                        </div>
                    ) : getFilteredClasses().length === 0 ? (
                        <div className="empty-state">
                            <Users size={48} color="#9ca3af" />
                            <h3>No classes available</h3>
                            <p>
                                {searchQuery
                                    ? 'No classes match your search criteria.'
                                    : assignedInfo.count > 0
                                        ? 'All classes are already assigned to other courses.'
                                        : 'No classes found. Create some classes first.'}
                            </p>
                        </div>
                    ) : (
                        <div className="classes-list">
                            {getFilteredClasses().map((cls) => (
                                <div
                                    key={cls.id}
                                    className={`class-item ${selectedClassIds.includes(cls.id) ? 'selected' : ''
                                        }`}
                                    onClick={() => handleClassToggle(cls.id)}
                                >
                                    <div className="class-checkbox">
                                        {selectedClassIds.includes(cls.id) && (
                                            <Check size={16} color="white" />
                                        )}
                                    </div>
                                    <div className="class-info">
                                        <h4>{cls.name}</h4>
                                        <p>{cls.description}</p>
                                        <div className="class-meta">
                                            <span className="student-count">
                                                <Users size={12} />
                                                {cls.studentIds.length} students
                                            </span>
                                            <span className="capacity">
                                                Capacity: {cls.capacity}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="dialog-actions">
                    <button onClick={onClose} className="cancel-button">
                        Cancel
                    </button>
                    <button
                        onClick={handleAssignClasses}
                        disabled={loading}
                        className="assign-button"
                    >
                        {loading ? (
                            <>
                                <div className="loading-spinner small" />
                                Assigning...
                            </>
                        ) : (
                            <>
                                <UserCheck size={16} />
                                Assign Classes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignClassesDialog;


