import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Exercise, Course } from '../../types';
import { exerciseService } from '../../services/exerciseService';
import { courseService } from '../../services/courseService';
import { useAuth } from '../../contexts/AuthContext';
import ChildFriendlyButton from '../ui/ChildFriendlyButton';
import ChildFriendlyCard from '../ui/ChildFriendlyCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import './StudentExerciseList.css';

const StudentExerciseList: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<'all' | 'multiple_choice' | 'fill_blank'>('all');

    useEffect(() => {
        loadStudentExercises();
    }, []);

    const loadStudentExercises = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load all exercises and courses
            const [exercisesData, coursesData] = await Promise.all([
                exerciseService.getAllExercises(),
                courseService.getAllCourses(),
            ]);

            setExercises(exercisesData);
            setCourses(coursesData);
        } catch (err: any) {
            setError(err.message || 'Failed to load exercises');
        } finally {
            setLoading(false);
        }
    };

    const getCourseName = (courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        return course?.name || 'Unknown Course';
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'multiple_choice': return '☑️';
            case 'fill_blank': return '✏️';
            default: return '❓';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'multiple_choice': return 'Trắc nghiệm';
            case 'fill_blank': return 'Điền từ';
            default: return type;
        }
    };

    const filteredExercises = exercises.filter(exercise => {
        if (selectedType === 'all') return true;
        return exercise.type === selectedType;
    });

    const handleStartExercise = (exercise: Exercise) => {
        navigate(`/student/exercises/${exercise.id}`);
    };

    if (loading) {
        return (
            <div className="student-exercise-list-loading">
                <LoadingSpinner />
                <p>Đang tải bài tập...</p>
            </div>
        );
    }

    if (error) {
        return (
            <ErrorMessage
                message={error}
                onRetry={loadStudentExercises}
            />
        );
    }

    return (
        <div className="student-exercise-list-container">
            <div className="student-exercise-list-header">
                <div>
                    <h2>🏃‍♂️ Luyện tập cùng bé!</h2>
                    <p>Chọn bài tập yêu thích để bắt đầu học nhé!</p>
                </div>
            </div>

            {/* Type Filter Tabs - Similar to Android app */}
            <div className="exercise-type-tabs">
                <ChildFriendlyButton
                    variant={selectedType === 'all' ? 'primary' : 'secondary'}
                    onClick={() => setSelectedType('all')}
                    className="type-tab-button"
                >
                    🎯 Tất cả
                </ChildFriendlyButton>
                <ChildFriendlyButton
                    variant={selectedType === 'fill_blank' ? 'primary' : 'secondary'}
                    onClick={() => setSelectedType('fill_blank')}
                    className="type-tab-button"
                >
                    ✏️ Điền từ
                </ChildFriendlyButton>
                <ChildFriendlyButton
                    variant={selectedType === 'multiple_choice' ? 'primary' : 'secondary'}
                    onClick={() => setSelectedType('multiple_choice')}
                    className="type-tab-button"
                >
                    ☑️ Trắc nghiệm
                </ChildFriendlyButton>
            </div>

            {filteredExercises.length === 0 ? (
                <ChildFriendlyCard className="empty-state">
                    <div className="empty-content">
                        <div className="empty-icon">📝</div>
                        <h3>Không có bài tập nào</h3>
                        <p>Không tìm thấy bài tập nào trong danh mục này</p>
                    </div>
                </ChildFriendlyCard>
            ) : (
                <div className="student-exercise-grid">
                    {filteredExercises.map((exercise) => (
                        <ChildFriendlyCard key={exercise.id} className="student-exercise-card">
                            <div className="exercise-header">
                                <div className="exercise-type-badge">
                                    <span className="type-icon">{getTypeIcon(exercise.type)}</span>
                                    <span className="type-label">{getTypeLabel(exercise.type)}</span>
                                </div>
                            </div>

                            <div className="exercise-content">
                                <h3 className="exercise-title">{exercise.title}</h3>

                                <div className="exercise-details">
                                    <div className="detail-item">
                                        <span className="detail-label">📚 Khóa học:</span>
                                        <span className="detail-value">{getCourseName(exercise.course_id)}</span>
                                    </div>

                                    <div className="detail-item">
                                        <span className="detail-label">❓ Số câu hỏi:</span>
                                        <span className="detail-value">{exercise.questions.length}</span>
                                    </div>

                                    {exercise.time_limit && (
                                        <div className="detail-item">
                                            <span className="detail-label">⏱️ Thời gian:</span>
                                            <span className="detail-value">{exercise.time_limit} phút</span>
                                        </div>
                                    )}
                                </div>

                                <div className="question-preview">
                                    <h4>Câu hỏi mẫu:</h4>
                                    <div className="sample-question">
                                        {exercise.questions.length > 0 && (
                                            <div className="question-item">
                                                <span className="question-text">
                                                    {exercise.questions[0].content.length > 100
                                                        ? `${exercise.questions[0].content.substring(0, 100)}...`
                                                        : exercise.questions[0].content
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="exercise-actions">
                                    <ChildFriendlyButton
                                        variant="primary"
                                        onClick={() => handleStartExercise(exercise)}
                                        className="start-exercise-button"
                                    >
                                        🚀 Bắt đầu làm bài!
                                    </ChildFriendlyButton>
                                </div>
                            </div>
                        </ChildFriendlyCard>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentExerciseList;