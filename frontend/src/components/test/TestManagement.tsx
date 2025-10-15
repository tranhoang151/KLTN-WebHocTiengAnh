import React, { useState, useEffect } from 'react';
import { Test, Course } from '../../types';
import { testService } from '../../services/testService';
import { courseService } from '../../services/courseService';
import TestList from './TestList';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Plus, BookOpen, Eye } from 'lucide-react';

const TestManagement: React.FC = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedTest, setSelectedTest] = useState<Test | null>(null);
    const [activeTab, setActiveTab] = useState<'list' | 'builder' | 'preview'>('list');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [testsData, coursesData] = await Promise.all([
                testService.getAllTests(),
                courseService.getAllCourses()
            ]);
            setTests(testsData);
            setCourses(coursesData);
        } catch (err) {
            setError('Failed to load data');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTest = () => {
        setSelectedTest(null);
        setActiveTab('builder');
    };

    const handleEditTest = (test: Test) => {
        setSelectedTest(test);
        setActiveTab('builder');
    };

    const handlePreviewTest = (test: Test) => {
        setSelectedTest(test);
        setActiveTab('preview');
    };

    const handleSaveTest = async (testData: Omit<Test, 'id' | 'created_at'>) => {
        try {
            if (selectedTest) {
                await testService.updateTest(selectedTest.id, testData);
            } else {
                await testService.createTest(testData);
            }
            await loadData();
            setActiveTab('list');
            setSelectedTest(null);
        } catch (err) {
            setError('Failed to save test');
            console.error('Error saving test:', err);
        }
    };

    const handleDeleteTest = async (testId: string) => {
        try {
            await testService.deleteTest(testId);
            await loadData();
        } catch (err) {
            setError('Failed to delete test');
            console.error('Error deleting test:', err);
        }
    };

    const handleBackToList = () => {
        setActiveTab('list');
        setSelectedTest(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-6 rounded-lg">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-lg border border-blue-200">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Test Management</h1>
                    <p className="text-gray-600 mt-1">Create and manage tests for your courses</p>
                </div>
                {activeTab === 'list' && (
                    <Button onClick={handleCreateTest} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg">
                        <Plus className="w-4 h-4" />
                        Create New Test
                    </Button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            <Tabs defaultValue={activeTab}>
                <TabsList className="grid w-full grid-cols-3 bg-white shadow-md border border-blue-200">
                    <TabsTrigger value="list" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
                        <BookOpen className="w-4 h-4" />
                        Test List
                    </TabsTrigger>
                    <TabsTrigger value="builder" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
                        <Plus className="w-4 h-4" />
                        Test Builder
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
                        <Eye className="w-4 h-4" />
                        Preview
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4 bg-white p-6 rounded-xl shadow-lg border border-blue-200">
                    <TestList
                        tests={tests}
                        courses={courses}
                        onEdit={handleEditTest}
                        onDelete={handleDeleteTest}
                        onPreview={handlePreviewTest}
                    />
                </TabsContent>

                <TabsContent value="builder" className="space-y-4 bg-white p-6 rounded-xl shadow-lg border border-blue-200">
                    <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Test Builder Coming Soon</h3>
                        <p className="text-gray-600">The test builder functionality is under development.</p>
                    </div>
                </TabsContent>

                <TabsContent value="preview" className="space-y-4 bg-white p-6 rounded-xl shadow-lg border border-blue-200">
                    {selectedTest ? (
                        <div className="text-center py-12">
                            <Eye className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Test Preview Coming Soon</h3>
                            <p className="text-gray-600">The test preview functionality is under development.</p>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Please select a test to preview.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default TestManagement;