import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChildFriendlyCard } from '../ui';
import { Clock, CheckCircle, PlayCircle, BookOpen } from 'lucide-react';
import { apiService } from '../../services/api';

interface Test {
    id: string;
    title: string;
    courseId: string;
    duration: number;
    maxScore: number;
    difficulty: string;
    isActive: boolean;
    createdAt: string;
}

interface Course {
    id: string;
    name: string;
    description: string;
}

const TestList: React.FC = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        fetchTests();
        fetchCourses();
    }, []);

    const fetchTests = async () => {
        try {
            const response = await apiService.get('/tests');
            if (response.success && response.data) {
                setTests(response.data as Test[]);
            }
        } catch (error) {
            console.error('Failed to fetch tests');
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const response = await apiService.get('/courses');
            if (response.success && response.data) {
                setCourses(response.data as Course[]);
            }
        } catch (error) {
            console.error('Failed to fetch courses');
        }
    };

    const getCourseName = (courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        return course ? course.name : 'Unknown Course';
    };

    const getDifficultyColor = (difficulty: string): 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'default' => {
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'green';
            case 'medium': return 'orange';
            case 'hard': return 'purple';
            default: return 'blue';
        }
    };

    const filteredTests = filter === 'all'
        ? tests
        : tests.filter(test => test.difficulty.toLowerCase() === filter);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <BookOpen className="mr-3 h-8 w-8 text-blue-500" />
                        Tests & Quizzes
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Challenge yourself with fun quizzes and tests to track your learning progress!
                    </p>
                </div>

                {/* Filter Buttons */}
                <div className="mb-6 flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'all'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        All Tests
                    </button>
                    <button
                        onClick={() => setFilter('easy')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'easy'
                            ? 'bg-green-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        Easy
                    </button>
                    <button
                        onClick={() => setFilter('medium')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'medium'
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        Medium
                    </button>
                    <button
                        onClick={() => setFilter('hard')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === 'hard'
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        Hard
                    </button>
                </div>

                {/* Tests Grid */}
                {filteredTests.length === 0 ? (
                    <ChildFriendlyCard
                        title="No Tests Available"
                        icon="📝"
                        color="blue"
                        className="text-center py-12"
                    >
                        <p className="text-gray-600 mb-4">
                            {filter === 'all'
                                ? "No tests are available at the moment."
                                : `No ${filter} tests are available at the moment.`
                            }
                        </p>
                        <p className="text-sm text-gray-500">
                            Check back later for new tests and quizzes!
                        </p>
                    </ChildFriendlyCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTests.map((test) => (
                            <ChildFriendlyCard
                                key={test.id}
                                title={test.title}
                                icon="📝"
                                color={getDifficultyColor(test.difficulty)}
                                interactive
                                className="h-full"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span className="flex items-center">
                                            <BookOpen className="h-4 w-4 mr-1" />
                                            {getCourseName(test.courseId)}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getDifficultyColor(test.difficulty)}-100 text-${getDifficultyColor(test.difficulty)}-800`}>
                                            {test.difficulty}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span className="flex items-center">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {test.duration} min
                                        </span>
                                        <span className="flex items-center">
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            {test.maxScore} points
                                        </span>
                                    </div>

                                    <div className="pt-4">
                                        <Link
                                            to={`/student/tests/${test.id}`}
                                            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
                                        >
                                            <PlayCircle className="h-4 w-4 mr-2" />
                                            Start Test
                                        </Link>
                                    </div>
                                </div>
                            </ChildFriendlyCard>
                        ))}
                    </div>
                )}

                {/* Test Tips */}
                <ChildFriendlyCard
                    title="Test Tips"
                    icon="💡"
                    color="purple"
                    className="mt-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-start space-x-3">
                            <span className="text-2xl">⏰</span>
                            <div>
                                <p className="font-medium text-gray-900">Time Management</p>
                                <p className="text-gray-600">Keep track of time and don't spend too long on one question.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <span className="text-2xl">🎯</span>
                            <div>
                                <p className="font-medium text-gray-900">Read Carefully</p>
                                <p className="text-gray-600">Read each question thoroughly before selecting your answer.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <span className="text-2xl">🏆</span>
                            <div>
                                <p className="font-medium text-gray-900">Best Effort</p>
                                <p className="text-gray-600">Answer every question - you might get partial credit!</p>
                            </div>
                        </div>
                    </div>
                </ChildFriendlyCard>
            </div>
        </div>
    );
};

export default TestList;