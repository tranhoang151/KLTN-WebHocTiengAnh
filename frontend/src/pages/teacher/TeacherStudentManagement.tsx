import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { classService } from '../../services/classService';
import { Class } from '../../types';
import { userService } from '../../services/userService';
import { User } from '../../types/index';
import DashboardLayout from '../../components/DashboardLayout';
import { Link } from 'react-router-dom';

const TeacherStudentManagement: React.FC = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [students, setStudents] = useState<User[]>([]);
    const [availableStudents, setAvailableStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedStudentsToAdd, setSelectedStudentsToAdd] = useState<string[]>([]);

    useEffect(() => {
        if (user?.role === 'teacher') {
            loadTeacherClasses();
            loadAvailableStudents();
        }
    }, [user]);

    useEffect(() => {
        if (selectedClass) {
            loadClassStudents(selectedClass.id);
        }
    }, [selectedClass]);

    const loadTeacherClasses = async () => {
        try {
            setLoading(true);
            const teacherClasses = await classService.getTeacherClasses();
            setClasses(teacherClasses);
            if (teacherClasses.length > 0) {
                setSelectedClass(teacherClasses[0]);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadClassStudents = async (classId: string) => {
        try {
            const classStudents = await classService.getClassStudents(classId);
            setStudents(classStudents);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const loadAvailableStudents = async () => {
        try {
            const allStudents = await userService.getAllUsers('', { role: 'student' });
            // Filter students who are not in any class
            const available = allStudents.filter(student =>
                !student.class_ids || student.class_ids.length === 0
            );
            setAvailableStudents(available);
        } catch (err: any) {
            console.error('Error loading available students:', err);
        }
    };

    const handleAddStudents = async () => {
        if (!selectedClass || selectedStudentsToAdd.length === 0) return;

        try {
            await classService.assignStudentsToClass(selectedClass.id, selectedStudentsToAdd);
            await loadClassStudents(selectedClass.id);
            await loadAvailableStudents();
            setShowAddDialog(false);
            setSelectedStudentsToAdd([]);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleRemoveStudent = async (studentId: string) => {
        if (!selectedClass) return;

        if (!window.confirm('Are you sure you want to remove this student from the class?')) {
            return;
        }

        try {
            await classService.removeStudentFromClass(selectedClass.id, studentId);
            await loadClassStudents(selectedClass.id);
            await loadAvailableStudents();
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Student Management">
                <div className="text-center p-8">Loading...</div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout title="Student Management">
                <div className="text-center p-8 text-red-500">Error: {error}</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Student Management">
            <div className="space-y-6">
                {/* Class Selection */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Select Class</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {classes.map((classItem) => (
                            <button
                                key={classItem.id}
                                onClick={() => setSelectedClass(classItem)}
                                className={`p-4 border rounded-lg text-left transition-colors ${selectedClass?.id === classItem.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <h4 className="font-medium text-gray-900">{classItem.name}</h4>
                                <p className="text-sm text-gray-500">{classItem.description}</p>
                                <p className="text-sm text-gray-400">
                                    {classItem.student_ids?.length || 0} / {classItem.capacity} students
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {selectedClass && (
                    <>
                        {/* Class Students */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Students in {selectedClass.name}
                                </h3>
                                <button
                                    onClick={() => setShowAddDialog(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Add Students
                                </button>
                            </div>
                            <div className="p-6">
                                {students.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No students in this class yet.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {students.map((student) => (
                                            <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={student.avatar_url ||
                                                            (student.avatar_base64?.startsWith('data:')
                                                                ? student.avatar_base64
                                                                : `data:image/jpeg;base64,${student.avatar_base64}`) || '/default-avatar.png'}
                                                        alt={student.full_name}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{student.full_name}</h4>
                                                        <p className="text-sm text-gray-500">{student.email}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex justify-between items-center">
                                                    <Link
                                                        to={`/teacher/progress/student/${student.id}`}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        View Progress
                                                    </Link>
                                                    <button
                                                        onClick={() => handleRemoveStudent(student.id)}
                                                        className="text-red-600 hover:text-red-800 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Add Students Dialog */}
                {showAddDialog && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Add Students to {selectedClass?.name}
                                </h3>

                                {availableStudents.length === 0 ? (
                                    <p className="text-gray-500">No available students to add.</p>
                                ) : (
                                    <div className="max-h-96 overflow-y-auto">
                                        {availableStudents.map((student) => (
                                            <div key={student.id} className="flex items-center space-x-3 p-3 border-b">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudentsToAdd.includes(student.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedStudentsToAdd([...selectedStudentsToAdd, student.id]);
                                                        } else {
                                                            setSelectedStudentsToAdd(selectedStudentsToAdd.filter(id => id !== student.id));
                                                        }
                                                    }}
                                                    className="h-4 w-4 text-blue-600"
                                                />
                                                <img
                                                    src={student.avatar_url ||
                                                        (student.avatar_base64?.startsWith('data:')
                                                            ? student.avatar_base64
                                                            : `data:image/jpeg;base64,${student.avatar_base64}`) || '/default-avatar.png'}
                                                    alt={student.full_name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900">{student.full_name}</p>
                                                    <p className="text-sm text-gray-500">{student.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowAddDialog(false);
                                            setSelectedStudentsToAdd([]);
                                        }}
                                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddStudents}
                                        disabled={selectedStudentsToAdd.length === 0}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add Selected Students
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TeacherStudentManagement;


