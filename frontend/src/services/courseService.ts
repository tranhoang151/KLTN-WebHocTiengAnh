import { apiService } from './api';
import { Course } from '../types';
import { profileService } from './profileService';
import { classService } from './classService';

interface CourseFilters {
    search?: string;
}

class CourseService {
    async getAllCourses(filters?: CourseFilters): Promise<Course[]> {
        const params = new URLSearchParams();

        if (filters?.search) {
            params.append('search', filters.search);
        }

        const queryString = params.toString();
        const endpoint = queryString ? `/course?${queryString}` : '/course';

        const response = await apiService.get<Course[]>(endpoint);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch courses');
        }
        return response.data || [];
    }

    async getCourseById(courseId: string): Promise<Course | null> {
        const response = await apiService.get<Course>(`/course/${courseId}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch course');
        }
        return response.data || null;
    }

    async createCourse(courseData: Omit<Course, 'id'>): Promise<Course> {
        const response = await apiService.post<Course>('/course', courseData);
        if (!response.success) {
            throw new Error(response.error || 'Failed to create course');
        }
        return response.data!;
    }

    async updateCourse(courseId: string, courseData: Partial<Course>): Promise<Course> {
        const response = await apiService.put<Course>(`/course/${courseId}`, courseData);
        if (!response.success) {
            throw new Error(response.error || 'Failed to update course');
        }
        return response.data!;
    }

    async deleteCourse(courseId: string): Promise<void> {
        const response = await apiService.delete(`/course/${courseId}`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to delete course');
        }
    }

    async assignClassesToCourse(courseId: string, classIds: string[]): Promise<void> {
        const response = await apiService.post(`/course/${courseId}/assign-classes`, classIds);
        if (!response.success) {
            throw new Error(response.error || 'Failed to assign classes to course');
        }
    }

    async getCourseClasses(courseId: string): Promise<any[]> {
        const response = await apiService.get<any[]>(`/course/${courseId}/classes`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch course classes');
        }
        return response.data || [];
    }

    async getCourseStatistics(courseId: string): Promise<any> {
        const response = await apiService.get(`/course/${courseId}/statistics`);
        if (!response.success) {
            throw new Error(response.error || 'Failed to fetch course statistics');
        }
        return response.data;
    }

    async getEnrolledCourses(token: string): Promise<Course[]> {
        try {
            const profile = await profileService.getProfile();
            if (!profile || !profile.classIds || profile.classIds.length === 0) {
                return [];
            }

            const classPromises = profile.classIds.map(classId => classService.getClassById(classId));
            const classes = await Promise.all(classPromises);

            const courseIds = [...new Set(classes.filter(c => c).map(c => c!.course_id))];

            if (courseIds.length === 0) {
                return [];
            }

            const coursePromises = courseIds.map(courseId => this.getCourseById(courseId as string));
            const courses = await Promise.all(coursePromises);

            return courses.filter(course => course !== null) as Course[];
        } catch (error) {
            console.error("Error fetching enrolled courses:", error);
            throw new Error("Failed to fetch enrolled courses");
        }
    }
}

export const courseService = new CourseService();