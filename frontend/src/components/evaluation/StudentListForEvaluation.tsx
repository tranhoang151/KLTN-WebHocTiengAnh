import React, { useState, useEffect } from 'react';
import { User, Evaluation } from '../../types';
import { evaluationService } from '../../services/evaluationService';

interface StudentListForEvaluationProps {
    teacherId: string;
    classId?: string;
    onSelectStudent: (student: User) => void;
}

interface StudentWithEvaluationStatus extends User {
    hasEvaluation?: boolean;
    latestEvaluation?: Evaluation;
    needsEvaluation?: boolean;
}

const StudentListForEvaluation: React.FC<StudentListForEvaluationProps> = ({
    teacherId,
    classId,
    onSelectStudent,
}) => {
    const [students, setStudents] = useState<StudentWithEvaluationStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'needs-evaluation' | 'has-evaluation'>('all');

    useEffect(() => {
        loadStudents();
    }, [teacherId, classId]);

    const loadStudents = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get students needing evaluation
            const studentsNeedingEvaluation = await evaluationService.getTeacherEvaluations(); // TODO: Implement proper method

            // Get existing evaluations for the teacher
            const evaluations = await evaluationService.getTeacherEvaluations();

            // For now, we'll use mock student data since we don't have a direct way to get all students
            // In a real implementation, you'd fetch students from a students service
            const mockStudents: StudentWithEvaluationStatus[] = [
                {
                    id: 'student1',
                    full_name: 'Nguyễn Văn A',
                    email: 'nguyenvana@example.com',
                    role: 'student',
                    gender: 'male',
                    avatar_url: '',
                    streak_count: 5,
                    last_login_date: new Date().toISOString(),
                    class_ids: classId ? [classId] : [],
                    badges: {},
                    is_active: true,
                    needsEvaluation: studentsNeedingEvaluation.some(s => s.id === 'student1'),
                },
                {
                    id: 'student2',
                    full_name: 'Trần Thị B',
                    email: 'tranthib@example.com',
                    role: 'student',
                    gender: 'female',
                    avatar_url: '',
                    streak_count: 3,
                    last_login_date: new Date().toISOString(),
                    class_ids: classId ? [classId] : [],
                    badges: {},
                    is_active: true,
                    needsEvaluation: studentsNeedingEvaluation.some(s => s.id === 'student2'),
                },
                {
                    id: 'student3',
                    full_name: 'Lê Văn C',
                    email: 'levanc@example.com',
                    role: 'student',
                    gender: 'male',
                    avatar_url: '',
                    streak_count: 7,
                    last_login_date: new Date().toISOString(),
                    class_ids: classId ? [classId] : [],
                    badges: {},
                    is_active: true,
                    needsEvaluation: studentsNeedingEvaluation.some(s => s.id === 'student3'),
                },
            ];

            // Add evaluation status to students
            const studentsWithStatus = mockStudents.map(student => {
                const studentEvaluations = evaluations.filter(e => e.studentId === student.id);
                const latestEvaluation = studentEvaluations.length > 0
                    ? studentEvaluations.sort((a, b) =>
                        new Date(b.evaluationDate).getTime() - new Date(a.evaluationDate).getTime()
                    )[0]
                    : undefined;

                return {
                    ...student,
                    hasEvaluation: studentEvaluations.length > 0,
                    latestEvaluation,
                    needsEvaluation: studentsNeedingEvaluation.some(s => s.id === student.id),
                };
            });

            setStudents(studentsWithStatus as any[]);
        } catch (err) {
            console.error('Error loading students:', err);
            setError('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student => {
        switch (filter) {
            case 'needs-evaluation':
                return student.needsEvaluation;
            case 'has-evaluation':
                return student.hasEvaluation;
            default:
                return true;
        }
    });

    const getStatusBadge = (student: StudentWithEvaluationStatus) => {
        if (student.needsEvaluation) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Needs Evaluation
                </span>
            );
        } else if (student.hasEvaluation) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Evaluated
                </span>
            );
        }
        return null;
    };

    const getScoreDisplay = (student: StudentWithEvaluationStatus) => {
        if (student.latestEvaluation) {
            return (
                <div className="text-sm text-gray-600">
                    Latest Score: <span className="font-medium">{student.latestEvaluation.score}/100</span>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800">{error}</div>
                <button
                    onClick={loadStudents}
                    className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Students</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 text-sm rounded-md ${filter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            All ({students.length})
                        </button>
                        <button
                            onClick={() => setFilter('needs-evaluation')}
                            className={`px-3 py-1 text-sm rounded-md ${filter === 'needs-evaluation'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Need Evaluation ({students.filter(s => s.needsEvaluation).length})
                        </button>
                        <button
                            onClick={() => setFilter('has-evaluation')}
                            className={`px-3 py-1 text-sm rounded-md ${filter === 'has-evaluation'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Evaluated ({students.filter(s => s.hasEvaluation).length})
                        </button>
                    </div>
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No students found for the selected filter.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredStudents.map((student) => (
                            <div
                                key={student.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                onClick={() => onSelectStudent(student)}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-medium">
                                                {student.full_name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {student.full_name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {student.email}
                                        </div>
                                        {getScoreDisplay(student)}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {getStatusBadge(student)}
                                    <div className="text-sm text-gray-500">
                                        Streak: {student.streak_count} days
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentListForEvaluation;


