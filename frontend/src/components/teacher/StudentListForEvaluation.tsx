import React, { useState, useEffect } from 'react';
import { User, Class, EvaluationSummaryDto } from '../../types';
import { classService } from '../../services/classService';
import { evaluationService } from '../../services/evaluationService';
import ChildFriendlyCard from '../ui/ChildFriendlyCard';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import OptimizedImage from '../ui/OptimizedImage';

interface StudentListForEvaluationProps {
    teacherId: string;
    onStudentSelect: (student: User, classId: string) => void;
    onBack?: () => void;
}

export const StudentListForEvaluation: React.FC<StudentListForEvaluationProps> = ({
    teacherId,
    onStudentSelect,
    onBack
}) => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [students, setStudents] = useState<User[]>([]);
    const [evaluations, setEvaluations] = useState<EvaluationSummaryDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTeacherClasses();
    }, [teacherId]);

    useEffect(() => {
        if (selectedClass) {
            loadClassStudents();
        }
    }, [selectedClass]);

    const loadTeacherClasses = async () => {
        try {
            setLoading(true);
            const classesData = await classService.getClassesForTeacher();
            setClasses(classesData);

            if (classesData.length > 0) {
                setSelectedClass(classesData[0].id);
            }
        } catch (err) {
            console.error('Error loading classes:', err);
            setError('Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const loadClassStudents = async () => {
        if (!selectedClass) return;

        try {
            setLoading(true);
            const studentsData = await classService.getClassStudents(selectedClass);
            setStudents(studentsData);

            // Load existing evaluations for context
            const evaluationsData = await evaluationService.getTeacherEvaluations(teacherId, selectedClass);
            // Convert Evaluation[] to EvaluationSummaryDto[] for display
            const summaryData: EvaluationSummaryDto[] = evaluationsData.map(e => ({
                evaluationId: e.id,
                studentId: e.student_id,
                studentName: '', // Would need to fetch student name
                teacherId: e.teacher_id,
                teacherName: '', // Would need to fetch teacher name
                classId: e.class_id,
                className: '', // Would need to fetch class name
                overallRating: e.overall_rating,
                score: e.score,
                evaluationDate: e.evaluation_date,
                comments: e.comments
            }));
            setEvaluations(summaryData);
        } catch (err) {
            console.error('Error loading students:', err);
            setError('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const getStudentEvaluation = (studentId: string): EvaluationSummaryDto | undefined => {
        return evaluations.find(e => e.studentId === studentId);
    };

    const handleStudentClick = (student: User) => {
        onStudentSelect(student, selectedClass);
    };

    if (loading) {
        return (
            <ChildFriendlyCard>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading students...</p>
                </div>
            </ChildFriendlyCard>
        );
    }

    if (error) {
        return (
            <ChildFriendlyCard>
                <div className="error-container">
                    <p className="error-message">{error}</p>
                    <ChildFriendlyButton onClick={loadTeacherClasses}>
                        Retry
                    </ChildFriendlyButton>
                </div>
            </ChildFriendlyCard>
        );
    }

    return (
        <ChildFriendlyCard className="student-list-container">
            <div className="list-header">
                <h2>👥 Select Student for Evaluation</h2>
                {onBack && (
                    <ChildFriendlyButton onClick={onBack}>
                        ← Back
                    </ChildFriendlyButton>
                )}
            </div>

            {/* Class Selection */}
            <div className="class-selection">
                <label htmlFor="class-select">Select Class:</label>
                <select
                    id="class-select"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="class-select"
                >
                    {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                            {cls.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Students List */}
            <div className="students-list">
                {students.length === 0 ? (
                    <div className="no-students">
                        <p>No students found in this class</p>
                    </div>
                ) : (
                    students.map(student => {
                        const existingEvaluation = getStudentEvaluation(student.id);
                        return (
                            <div
                                key={student.id}
                                className="student-item"
                                onClick={() => handleStudentClick(student)}
                            >
                                <div className="student-avatar">
                                    <OptimizedImage
                                        src={student.avatar_url || "/default-avatar.png"}
                                        alt={student.full_name}
                                        className="avatar-image"
                                        width={50}
                                        height={50}
                                    />
                                </div>

                                <div className="student-info">
                                    <h3>{student.full_name}</h3>
                                    <p>{student.email}</p>
                                    <span className="gender-badge">{student.gender}</span>
                                </div>

                                <div className="student-status">
                                    {existingEvaluation ? (
                                        <div className="evaluation-status">
                                            <span className="evaluated-badge">
                                                Evaluated: {existingEvaluation.overallRating}/5
                                            </span>
                                            <small>{existingEvaluation.evaluationDate}</small>
                                        </div>
                                    ) : (
                                        <span className="not-evaluated-badge">
                                            Not Evaluated
                                        </span>
                                    )}
                                </div>

                                <div className="action-indicator">
                                    →
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {students.length > 0 && (
                <div className="list-footer">
                    <p>{students.length} student{students.length !== 1 ? 's' : ''} in this class</p>
                </div>
            )}
        </ChildFriendlyCard>
    );
};