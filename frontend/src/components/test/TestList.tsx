import React from 'react';
import { Test, Course } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Edit, Trash2, Eye, Clock, FileText } from 'lucide-react';

interface TestListProps {
    tests: Test[];
    courses: Course[];
    onEdit: (test: Test) => void;
    onDelete: (testId: string) => Promise<void>;
    onPreview: (test: Test) => void;
}

const TestList: React.FC<TestListProps> = ({
    tests,
    courses,
    onEdit,
    onDelete,
    onPreview
}) => {
    const getCourseName = (courseId: string) => {
        const course = courses.find(c => c.id === courseId);
        return course?.name || 'Unknown Course';
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const handleDelete = async (testId: string) => {
        if (window.confirm('Are you sure you want to delete this test?')) {
            await onDelete(testId);
        }
    };

    if (!tests || tests.length === 0) {
        return (
            <Card className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
                <p className="text-gray-600">Create your first test to get started.</p>
            </Card>
        );
    }

    return (
        <div className="grid gap-6">
            {tests && tests.map((test) => (
                <Card key={test.id} className="p-6 bg-gradient-to-r from-white to-blue-50 border border-blue-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{test.title}</h3>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                                    {getCourseName(test.course_id)}
                                </span>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-700 mb-4">
                                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    <span className="font-medium">{test.questions?.length || 0} questions</span>
                                </div>
                                <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-lg">
                                    <Clock className="w-4 h-4 text-green-500" />
                                    <span className="font-medium">{formatDuration(test.duration)}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-lg">
                                    <span className="font-medium text-purple-700">Max Score: {test.maxScore}</span>
                                </div>
                            </div>

                            {test.created_at && (
                                <p className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block">
                                    Created: {new Date(test.created_at.seconds * 1000).toLocaleDateString()}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 ml-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPreview(test)}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200"
                            >
                                <Eye className="w-4 h-4" />
                                Preview
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(test)}
                                className="flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-indigo-300 text-indigo-700 hover:text-indigo-800 transition-all duration-200"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(test.id)}
                                className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-red-300 text-red-600 hover:text-red-700 transition-all duration-200"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default TestList;