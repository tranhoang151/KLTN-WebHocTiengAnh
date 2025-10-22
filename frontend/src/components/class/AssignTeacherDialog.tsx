import React, { useState, useEffect } from 'react';
import { X, User, Search, Check } from 'lucide-react';
import { userService } from '../../services/userService';
import { classService } from '../../services/classService';
import { useAuth } from '../../contexts/AuthContext';
import './AssignTeacherDialog.css';

interface AssignTeacherDialogProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    className: string;
    currentTeacherId?: string;
    onSuccess: () => void;
}

interface Teacher {
    id: string;
    full_name: string;
    email: string;
    avatar?: string;
}

const AssignTeacherDialog: React.FC<AssignTeacherDialogProps> = ({
    isOpen,
    onClose,
    classId,
    className,
    currentTeacherId,
    onSuccess,
}) => {
    const { getAuthToken } = useAuth();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(currentTeacherId || null);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadTeachers();
            setSelectedTeacherId(currentTeacherId || null);
            setSearchQuery('');
            setError(null);
        }
    }, [isOpen, currentTeacherId]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredTeachers(teachers);
        } else {
            const filtered = teachers.filter(
                (teacher) =>
                    teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredTeachers(filtered);
        }
    }, [searchQuery, teachers]);

    const loadTeachers = async () => {
        try {
            setLoading(true);
            const token = await getAuthToken();
            const response = await userService.getAllUsers(token, { role: 'teacher' });
            setTeachers(response || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load teachers');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignTeacher = async () => {
        if (!selectedTeacherId) {
            setError('Please select a teacher');
            return;
        }

        try {
            setAssigning(true);
            setError(null);

            const token = await getAuthToken();
            await classService.updateClass(classId, {
                teacherId: selectedTeacherId,
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to assign teacher');
        } finally {
            setAssigning(false);
        }
    };

    const handleRemoveTeacher = async () => {
        try {
            setAssigning(true);
            setError(null);

            const token = await getAuthToken();
            await classService.updateClass(classId, {
                teacherId: undefined,
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to remove teacher');
        } finally {
            setAssigning(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="assign-teacher-dialog-overlay">
            <div className="assign-teacher-dialog">
                <div className="assign-teacher-dialog-header">
                    <h3>Assign Teacher to {className}</h3>
                    <button
                        onClick={onClose}
                        className="assign-teacher-dialog-close"
                        disabled={assigning}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="assign-teacher-dialog-content">
                    {error && (
                        <div className="assign-teacher-error">
                            {error}
                        </div>
                    )}

                    <div className="assign-teacher-search">
                        <div className="assign-teacher-search-input">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder="Search teachers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                disabled={loading || assigning}
                            />
                        </div>
                    </div>

                    <div className="assign-teacher-list">
                        {loading ? (
                            <div className="assign-teacher-loading">
                                Loading teachers...
                            </div>
                        ) : filteredTeachers.length === 0 ? (
                            <div className="assign-teacher-empty">
                                {searchQuery ? 'No teachers found matching your search' : 'No teachers available'}
                            </div>
                        ) : (
                            filteredTeachers.map((teacher) => (
                                <div
                                    key={teacher.id}
                                    className={`assign-teacher-item ${selectedTeacherId === teacher.id ? 'selected' : ''
                                        }`}
                                    onClick={() => setSelectedTeacherId(teacher.id)}
                                >
                                    <div className="assign-teacher-item-avatar">
                                        {teacher.avatar ? (
                                            <img src={teacher.avatar} alt={teacher.full_name} />
                                        ) : (
                                            <User size={24} />
                                        )}
                                    </div>
                                    <div className="assign-teacher-item-info">
                                        <div className="assign-teacher-item-name">
                                            {teacher.full_name}
                                        </div>
                                        <div className="assign-teacher-item-email">
                                            {teacher.email}
                                        </div>
                                    </div>
                                    {selectedTeacherId === teacher.id && (
                                        <div className="assign-teacher-item-check">
                                            <Check size={20} />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="assign-teacher-dialog-footer">
                    {currentTeacherId && (
                        <button
                            onClick={handleRemoveTeacher}
                            className="assign-teacher-remove-btn"
                            disabled={assigning}
                        >
                            {assigning ? 'Removing...' : 'Remove Current Teacher'}
                        </button>
                    )}
                    <div className="assign-teacher-actions">
                        <button
                            onClick={onClose}
                            className="assign-teacher-cancel-btn"
                            disabled={assigning}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAssignTeacher}
                            className="assign-teacher-assign-btn"
                            disabled={!selectedTeacherId || assigning}
                        >
                            {assigning ? 'Assigning...' : 'Assign Teacher'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignTeacherDialog;


