import React, { useState, useEffect } from 'react';
import { X, User, Search, Check, Users } from 'lucide-react';
import { userService } from '../../services/userService';
import { classService } from '../../services/classService';
import { useAuth } from '../../contexts/AuthContext';
import './AssignStudentsDialog.css';

interface AssignStudentsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    className: string;
    currentStudentIds: string[];
    classCapacity: number;
    onSuccess: () => void;
}

interface Student {
    id: string;
    full_name: string;
    email: string;
    avatar?: string;
}

const AssignStudentsDialog: React.FC<AssignStudentsDialogProps> = ({
    isOpen,
    onClose,
    classId,
    className,
    currentStudentIds,
    classCapacity,
    onSuccess,
}) => {
    const { getAuthToken } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(currentStudentIds);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadStudents();
            setSelectedStudentIds(currentStudentIds);
            setSearchQuery('');
            setError(null);
        }
    }, [isOpen, currentStudentIds]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredStudents(students);
        } else {
            const filtered = students.filter(
                (student) =>
                    student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    student.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredStudents(filtered);
        }
    }, [searchQuery, students]);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const token = await getAuthToken();
            const response = await userService.getAllUsers(token, { role: 'student' });
            setStudents(response || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentToggle = (studentId: string) => {
        setSelectedStudentIds(prev => {
            if (prev.includes(studentId)) {
                return prev.filter(id => id !== studentId);
            } else {
                // Check capacity limit
                if (prev.length >= classCapacity) {
                    setError(`Class capacity is ${classCapacity} students. Please remove some students first.`);
                    return prev;
                }
                setError(null);
                return [...prev, studentId];
            }
        });
    };

    const handleSelectAll = () => {
        const availableStudents = filteredStudents.filter(student =>
            !selectedStudentIds.includes(student.id)
        );

        const canSelect = Math.min(
            availableStudents.length,
            classCapacity - selectedStudentIds.length
        );

        if (canSelect === 0) {
            setError('Cannot select more students. Class capacity reached.');
            return;
        }

        const newSelections = availableStudents.slice(0, canSelect).map(s => s.id);
        setSelectedStudentIds(prev => [...prev, ...newSelections]);
        setError(null);
    };

    const handleDeselectAll = () => {
        setSelectedStudentIds([]);
        setError(null);
    };

    const handleAssignStudents = async () => {
        try {
            setAssigning(true);
            setError(null);

            const token = await getAuthToken();
            await classService.updateClass(classId, {
                studentIds: selectedStudentIds,
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to assign students');
        } finally {
            setAssigning(false);
        }
    };

    const getSelectedCount = () => selectedStudentIds.length;
    const getAvailableCount = () => classCapacity - selectedStudentIds.length;

    if (!isOpen) return null;

    return (
        <div className="assign-students-dialog-overlay">
            <div className="assign-students-dialog">
                <div className="assign-students-dialog-header">
                    <h3>Assign Students to {className}</h3>
                    <button
                        onClick={onClose}
                        className="assign-students-dialog-close"
                        disabled={assigning}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="assign-students-dialog-content">
                    <div className="assign-students-info">
                        <div className="assign-students-capacity">
                            <Users size={16} />
                            <span>
                                {getSelectedCount()} / {classCapacity} students assigned
                            </span>
                        </div>
                        {getAvailableCount() > 0 && (
                            <div className="assign-students-available">
                                {getAvailableCount()} slots available
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="assign-students-error">
                            {error}
                        </div>
                    )}

                    <div className="assign-students-search">
                        <div className="assign-students-search-input">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                disabled={loading || assigning}
                            />
                        </div>
                    </div>

                    <div className="assign-students-actions">
                        <button
                            onClick={handleSelectAll}
                            className="assign-students-select-all-btn"
                            disabled={loading || assigning || getAvailableCount() === 0}
                        >
                            Select All Available
                        </button>
                        <button
                            onClick={handleDeselectAll}
                            className="assign-students-deselect-all-btn"
                            disabled={loading || assigning || selectedStudentIds.length === 0}
                        >
                            Deselect All
                        </button>
                    </div>

                    <div className="assign-students-list">
                        {loading ? (
                            <div className="assign-students-loading">
                                Loading students...
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="assign-students-empty">
                                {searchQuery ? 'No students found matching your search' : 'No students available'}
                            </div>
                        ) : (
                            filteredStudents.map((student) => {
                                const isSelected = selectedStudentIds.includes(student.id);
                                const isAtCapacity = !isSelected && getAvailableCount() === 0;

                                return (
                                    <div
                                        key={student.id}
                                        className={`assign-students-item ${isSelected ? 'selected' : ''
                                            } ${isAtCapacity ? 'disabled' : ''}`}
                                        onClick={() => !isAtCapacity && handleStudentToggle(student.id)}
                                    >
                                        <div className="assign-students-item-avatar">
                                            {student.avatar ? (
                                                <img src={student.avatar} alt={student.full_name} />
                                            ) : (
                                                <User size={24} />
                                            )}
                                        </div>
                                        <div className="assign-students-item-info">
                                            <div className="assign-students-item-name">
                                                {student.full_name}
                                            </div>
                                            <div className="assign-students-item-email">
                                                {student.email}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="assign-students-item-check">
                                                <Check size={20} />
                                            </div>
                                        )}
                                        {isAtCapacity && (
                                            <div className="assign-students-item-disabled">
                                                Capacity reached
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="assign-students-dialog-footer">
                    <div className="assign-students-actions">
                        <button
                            onClick={onClose}
                            className="assign-students-cancel-btn"
                            disabled={assigning}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAssignStudents}
                            className="assign-students-assign-btn"
                            disabled={assigning}
                        >
                            {assigning ? 'Assigning...' : 'Assign Students'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignStudentsDialog;
