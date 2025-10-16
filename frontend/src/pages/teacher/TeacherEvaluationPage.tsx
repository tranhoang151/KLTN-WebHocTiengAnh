import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { classService } from '../../services/classService';
import { evaluationService, Evaluation, StudentEvaluationSummary } from '../../services/evaluationService';
import { userService, User } from '../../services/userService';
import { Class } from '../../types';
import DashboardLayout from '../../components/DashboardLayout';

interface StudentWithClass extends User {
    className: string;
    classId: string;
}

const TeacherEvaluationPage: React.FC = () => {
    const { user } = useAuth();
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [students, setStudents] = useState<StudentWithClass[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentWithClass | null>(null);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showEvaluationForm, setShowEvaluationForm] = useState(false);
    const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        score: 5,
        comment: '',
        category: 'academic' as 'academic' | 'behavior' | 'participation' | 'overall'
    });

    useEffect(() => {
        if (user?.role === 'teacher') {
            loadTeacherClasses();
        }
    }, [user]);

    useEffect(() => {
        if (selectedClass) {
            loadClassStudents(selectedClass.id);
        }
    }, [selectedClass]);

    useEffect(() => {
        if (selectedStudent) {
            loadStudentEvaluations(selectedStudent.id);
        }
    }, [selectedStudent]);

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
            const studentsWithClass: StudentWithClass[] = classStudents.map(student => ({
                ...student,
                className: selectedClass?.name || '',
                classId: classId
            }));
            setStudents(studentsWithClass);
            if (studentsWithClass.length > 0) {
                setSelectedStudent(studentsWithClass[0]);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const loadStudentEvaluations = async (studentId: string) => {
        try {
            const studentEvaluations = await evaluationService.getStudentEvaluations(studentId);
            setEvaluations(studentEvaluations);
        } catch (err: any) {
            console.error('Error loading evaluations:', err);
        }
    };

    const handleSubmitEvaluation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent || !user) return;

        try {
            const evaluationData = {
                studentId: selectedStudent.id,
                classId: selectedStudent.classId,
                score: formData.score,
                comment: formData.comment,
                category: formData.category
            };

            if (editingEvaluation) {
                await evaluationService.updateEvaluation(editingEvaluation.id, {
                    score: formData.score,
                    comment: formData.comment,
                    category: formData.category
                });
            } else {
                await evaluationService.createEvaluation(evaluationData);
            }

            await loadStudentEvaluations(selectedStudent.id);
            setShowEvaluationForm(false);
            setEditingEvaluation(null);
            resetForm();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleEditEvaluation = (evaluation: Evaluation) => {
        setEditingEvaluation(evaluation);
        setFormData({
            score: evaluation.score,
            comment: evaluation.comment,
            category: evaluation.category
        });
        setShowEvaluationForm(true);
    };

    const handleDeleteEvaluation = async (evaluationId: string) => {
        if (!window.confirm('Are you sure you want to delete this evaluation?')) return;

        try {
            await evaluationService.deleteEvaluation(evaluationId);
            if (selectedStudent) {
                await loadStudentEvaluations(selectedStudent.id);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const resetForm = () => {
        setFormData({
            score: 5,
            comment: '',
            category: 'academic'
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-600';
        if (score >= 6) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <DashboardLayout title="Student Evaluations">
                <div className="text-center p-8">Loading...</div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout title="Student Evaluations">
                <div className="text-center p-8 text-red-500">Error: {error}</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Student Evaluations">
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
                            </button>
                        ))}
                    </div>
                </div>

                {selectedClass && (
                    <>
                        {/* Student Selection */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Student</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {students.map((student) => (
                                    <button
                                        key={student.id}
                                        onClick={() => setSelectedStudent(student)}
                                        className={`p-4 border rounded-lg text-left transition-colors ${selectedStudent?.id === student.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={student.avatarUrl || student.avatar_base64 || '/default-avatar.png'}
                                                alt={student.fullName}
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div>
                                                <h4 className="font-medium text-gray-900">{student.fullName}</h4>
                                                <p className="text-sm text-gray-500">{student.email}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedStudent && (
                            <>
                                {/* Student Evaluations */}
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Evaluations for {selectedStudent.fullName}
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setEditingEvaluation(null);
                                                resetForm();
                                                setShowEvaluationForm(true);
                                            }}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                        >
                                            Add Evaluation
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        {evaluations.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No evaluations yet.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {evaluations.map((evaluation) => (
                                                    <div key={evaluation.id} className="border border-gray-200 rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div>
                                                                <div className="flex items-center space-x-2">
                                                                    <span className={`text-2xl font-bold ${getScoreColor(evaluation.score)}`}>
                                                                        {evaluation.score}/10
                                                                    </span>
                                                                    <span className="text-sm text-gray-500 capitalize">
                                                                        ({evaluation.category})
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    {new Date(evaluation.evaluationDate).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleEditEvaluation(evaluation)}
                                                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteEvaluation(evaluation.id)}
                                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {evaluation.comment && (
                                                            <p className="text-gray-700">{evaluation.comment}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Evaluation Form Modal */}
                {showEvaluationForm && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-lg shadow-lg rounded-md bg-white">
                            <div className="mt-3">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {editingEvaluation ? 'Edit Evaluation' : 'Add Evaluation'}
                                </h3>

                                <form onSubmit={handleSubmitEvaluation} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            required
                                        >
                                            <option value="academic">Academic Performance</option>
                                            <option value="behavior">Behavior</option>
                                            <option value="participation">Participation</option>
                                            <option value="overall">Overall</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Score (1-10)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={formData.score}
                                            onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) })}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Comment
                                        </label>
                                        <textarea
                                            value={formData.comment}
                                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                            rows={4}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                            placeholder="Enter your evaluation comments..."
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEvaluationForm(false);
                                                setEditingEvaluation(null);
                                                resetForm();
                                            }}
                                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            {editingEvaluation ? 'Update' : 'Submit'} Evaluation
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TeacherEvaluationPage;