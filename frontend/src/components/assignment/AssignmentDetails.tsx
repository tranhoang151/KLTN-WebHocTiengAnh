import React, { useState, useEffect } from 'react';
import { Assignment, AssignmentSubmission, TeacherEvaluation, assignmentService } from '../../services/assignmentService';
import { User, Course, Class } from '../../types';
import { courseService } from '../../services/courseService';
import { classService } from '../../services/classService';
import { userService } from '../../services/userService';
import TeacherEvaluationForm from './TeacherEvaluationForm';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import ChildFriendlyCard from '../ui/ChildFriendlyCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import { useAuth } from '../../contexts/AuthContext';
import './AssignmentDetails.css';

interface AssignmentDetailsProps {
    assignmentId: string;
    onBack: () => void;
    onEdit?: (assignment: Assignment) => void;
}

const AssignmentDetails: React.FC<AssignmentDetailsProps> = ({
    assignmentId,
    onBack,
    onEdit,
}) => {
    const { user } = useAuth();
    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
    const [course, setCourse] = useState<Course | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [students, setStudents] = useState<User[]>([]);
    const [evaluations, setEvaluations] = useState<TeacherEvaluation[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
    const [showEvaluationForm, setShowEvaluationForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'evaluations'>('overview');

    useEffect(() => {
        loadAssignmentDetails();
    }, [assignmentId]);

    const loadAssignmentDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const [assignmentData, submissionsData] = await Promise.all([
                assignmentService.getAssignmentById(assignmentId),
                assignmentService.getAssignmentSubmissions(assignmentId),
            ]);

            if (!assignmentData) {
                throw new Error('Assignment not found');
            }

            setAssignment(assignmentData);
            setSubmissions(submissionsData);

            // Load related data
            const [courseData, classesData, studentsData] = await Promise.all([
                courseService.getCourseById(assignmentData.course_id),
                Promise.all(assignmentData.class_ids.map(id => classService.getClassById(id))),
                assignmentService.getStudentsForAssignment(assignmentData.class_ids),
            ]);

            setCourse(courseData);
            setClasses(classesData.filter(Boolean) as any[]);
            setStudents(studentsData);

            // Load evaluations for teacher view
            if (user?.role === 'teacher') {
                const evaluationsData = await Promise.all(
                    studentsData.map(student =>
                        assignmentService.getStudentEvaluations(student.id, assignmentId)
                    )
                );
                setEvaluations(evaluationsData.flat());
            }
        } catch (error) {
            console.error('Error loading assignment details:', error);
            setError(error instanceof Error ? error.message : 'Failed to load assignment details');
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluationSubmit = async (evaluationData: Omit<TeacherEvaluation, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            await assignmentService.createEvaluation(evaluationData);
            setShowEvaluationForm(false);
            setSelectedStudent(null);
            await loadAssignmentDetails(); // Reload to get updated evaluations
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            setError('Failed to submit evaluation');
        }
    };

    const getSubmissionForStudent = (studentId: string) => {
        return submissions.find(sub => sub.student_id === studentId);
    };

    const getEvaluationForStudent = (studentId: string) => {
        return evaluations.find(evaluation => evaluation.student_id === studentId);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'submitted':
                return 'success';
            case 'graded':
                return 'primary';
            case 'late':
                return 'warning';
            case 'not_started':
                return 'secondary';
            default:
                return 'secondary';
        }
    };

    const calculateCompletionRate = () => {
        if (students.length === 0) return 0;
        const completedSubmissions = submissions.filter(sub =>
            sub.status === 'submitted' || sub.status === 'graded'
        ).length;
        return Math.round((completedSubmissions / students.length) * 100);
    };

    const calculateAverageScore = () => {
        const gradedSubmissions = submissions.filter(sub => sub.score !== undefined);
        if (gradedSubmissions.length === 0) return 0;
        const totalScore = gradedSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
        return Math.round(totalScore / gradedSubmissions.length);
    };

    if (loading) {
        return (
            <div className="assignment-details-loading">
                <LoadingSpinner />
                <p>Loading assignment details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="assignment-details-error">
                <ErrorMessage message={error} />
                <ChildFriendlyButton onClick={onBack} variant="secondary">
                    Go Back
                </ChildFriendlyButton>
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="assignment-details-error">
                <ErrorMessage message="Assignment not found" />
                <ChildFriendlyButton onClick={onBack} variant="secondary">
                    Go Back
                </ChildFriendlyButton>
            </div>
        );
    }

    return (
        <div className="assignment-details-container">
            <div className="assignment-details-header">
                <div className="header-actions">
                    <ChildFriendlyButton onClick={onBack} variant="secondary">
                        ← Back to Assignments
                    </ChildFriendlyButton>
                    {user?.role === 'teacher' && onEdit && (
                        <ChildFriendlyButton onClick={() => onEdit(assignment)} variant="primary">
                            Edit Assignment
                        </ChildFriendlyButton>
                    )}
                </div>

                <div className="assignment-info">
                    <h1>{assignment.title}</h1>
                    <p className="assignment-description">{assignment.description}</p>

                    <div className="assignment-meta">
                        <div className="meta-item">
                            <span className="label">Course:</span>
                            <span className="value">{course?.name || 'Unknown Course'}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Classes:</span>
                            <span className="value">{classes.map(c => c.name).join(', ')}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Type:</span>
                            <span className="value">{assignment.type}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Due Date:</span>
                            <span className="value">{formatDate(assignment.due_date)}</span>
                        </div>
                        <div className="meta-item">
                            <span className="label">Max Attempts:</span>
                            <span className="value">{assignment.max_attempts}</span>
                        </div>
                        {assignment.time_limit && (
                            <div className="meta-item">
                                <span className="label">Time Limit:</span>
                                <span className="value">{assignment.time_limit} minutes</span>
                            </div>
                        )}
                    </div>

                    {assignment.instructions && (
                        <div className="assignment-instructions">
                            <h3>Instructions</h3>
                            <p>{assignment.instructions}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="assignment-details-tabs">
                <button
                    className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`tab-button ${activeTab === 'submissions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('submissions')}
                >
                    Submissions ({submissions.length})
                </button>
                {user?.role === 'teacher' && (
                    <button
                        className={`tab-button ${activeTab === 'evaluations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('evaluations')}
                    >
                        Evaluations ({evaluations.length})
                    </button>
                )}
            </div>

            <div className="assignment-details-content">
                {activeTab === 'overview' && (
                    <div className="overview-tab">
                        <div className="stats-grid">
                            <ChildFriendlyCard className="stat-card">
                                <h3>Total Students</h3>
                                <div className="stat-value">{students.length}</div>
                            </ChildFriendlyCard>

                            <ChildFriendlyCard className="stat-card">
                                <h3>Completion Rate</h3>
                                <div className="stat-value">{calculateCompletionRate()}%</div>
                            </ChildFriendlyCard>

                            <ChildFriendlyCard className="stat-card">
                                <h3>Average Score</h3>
                                <div className="stat-value">{calculateAverageScore()}%</div>
                            </ChildFriendlyCard>

                            <ChildFriendlyCard className="stat-card">
                                <h3>Submissions</h3>
                                <div className="stat-value">{submissions.length}</div>
                            </ChildFriendlyCard>
                        </div>

                        <ChildFriendlyCard className="content-preview">
                            <h3>Assigned Content</h3>
                            <div className="content-list">
                                {assignment.content_ids.map((contentId, index) => (
                                    <div key={contentId} className="content-item">
                                        <span className="content-type">{assignment.type}</span>
                                        <span className="content-id">Content ID: {contentId}</span>
                                    </div>
                                ))}
                            </div>
                        </ChildFriendlyCard>
                    </div>
                )}

                {activeTab === 'submissions' && (
                    <div className="submissions-tab">
                        <div className="submissions-list">
                            {students.map(student => {
                                const submission = getSubmissionForStudent(student.id);
                                return (
                                    <ChildFriendlyCard key={student.id} className="submission-card">
                                        <div className="student-info">
                                            <h4>{student.email}</h4>
                                            <span className="student-email">{student.email}</span>
                                        </div>

                                        <div className="submission-status">
                                            {submission ? (
                                                <>
                                                    <span className={`status-badge ${getStatusColor(submission.status)}`}>
                                                        {submission.status}
                                                    </span>
                                                    <div className="submission-details">
                                                        <div>Score: {submission.score || 'Not graded'}/{submission.max_score}</div>
                                                        <div>Submitted: {formatDate(submission.submitted_at)}</div>
                                                        <div>Time Spent: {submission.time_spent} minutes</div>
                                                        <div>Attempt: {submission.attempt_number}/{assignment.max_attempts}</div>
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="status-badge secondary">Not Started</span>
                                            )}
                                        </div>

                                        {user?.role === 'teacher' && (
                                            <div className="submission-actions">
                                                <ChildFriendlyButton
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setShowEvaluationForm(true);
                                                    }}
                                                    variant="primary"
                                                >
                                                    Evaluate
                                                </ChildFriendlyButton>
                                            </div>
                                        )}
                                    </ChildFriendlyCard>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'evaluations' && user?.role === 'teacher' && (
                    <div className="evaluations-tab">
                        <div className="evaluations-list">
                            {students.map(student => {
                                const evaluation = getEvaluationForStudent(student.id);
                                return (
                                    <ChildFriendlyCard key={student.id} className="evaluation-card">
                                        <div className="student-info">
                                            <h4>{student.email}</h4>
                                            <span className="student-email">{student.email}</span>
                                        </div>

                                        {evaluation ? (
                                            <div className="evaluation-details">
                                                <div className="rating-grid">
                                                    <div className="rating-item">
                                                        <span>Participation:</span>
                                                        <span className="rating">{evaluation.participation_score}/5</span>
                                                    </div>
                                                    <div className="rating-item">
                                                        <span>Understanding:</span>
                                                        <span className="rating">{evaluation.understanding_score}/5</span>
                                                    </div>
                                                    <div className="rating-item">
                                                        <span>Progress:</span>
                                                        <span className="rating">{evaluation.progress_score}/5</span>
                                                    </div>
                                                    <div className="rating-item">
                                                        <span>Overall:</span>
                                                        <span className="rating">{evaluation.overall_rating}/5</span>
                                                    </div>
                                                </div>

                                                {evaluation.comments && (
                                                    <div className="evaluation-comments">
                                                        <h5>Comments:</h5>
                                                        <p>{evaluation.comments}</p>
                                                    </div>
                                                )}

                                                {evaluation.strengths.length > 0 && (
                                                    <div className="evaluation-strengths">
                                                        <h5>Strengths:</h5>
                                                        <ul>
                                                            {evaluation.strengths.map((strength, index) => (
                                                                <li key={index}>{strength}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {evaluation.areas_for_improvement.length > 0 && (
                                                    <div className="evaluation-improvements">
                                                        <h5>Areas for Improvement:</h5>
                                                        <ul>
                                                            {evaluation.areas_for_improvement.map((area, index) => (
                                                                <li key={index}>{area}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                <div className="evaluation-date">
                                                    Evaluated on: {formatDate(evaluation.created_at)}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="no-evaluation">
                                                <p>No evaluation yet</p>
                                                <ChildFriendlyButton
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setShowEvaluationForm(true);
                                                    }}
                                                    variant="primary"
                                                >
                                                    Create Evaluation
                                                </ChildFriendlyButton>
                                            </div>
                                        )}
                                    </ChildFriendlyCard>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {showEvaluationForm && selectedStudent && (
                <div className="evaluation-modal">
                    <div className="modal-backdrop" onClick={() => setShowEvaluationForm(false)} />
                    <div className="modal-content">
                        <TeacherEvaluationForm
                            assignment={assignment}
                            student={selectedStudent}
                            onSubmit={handleEvaluationSubmit}
                            onCancel={() => {
                                setShowEvaluationForm(false);
                                setSelectedStudent(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentDetails;