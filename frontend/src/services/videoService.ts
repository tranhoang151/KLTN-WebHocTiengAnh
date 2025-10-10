import { apiService } from './api';
import { Video, VideoProgressDto } from '../types/video';

class VideoService {
  async getAllVideos(): Promise<Video[]> {
    const response = await apiService.get<Video[]>('/video');
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch all videos');
    }
    return response.data || [];
  }

  async getVideosByCourse(courseId: string): Promise<Video[]> {
    const response = await apiService.get<Video[]>(`/video/course/${courseId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch videos by course');
    }
    return response.data || [];
  }

  async getVideoById(videoId: string): Promise<Video | null> {
    const response = await apiService.get<Video>(`/video/${videoId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch video');
    }
    return response.data || null;
  }

  async createVideo(videoData: Omit<Video, 'id'>): Promise<Video> {
    const response = await apiService.post<Video>('/video', videoData);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create video');
    }
    return response.data!;
  }

  async updateVideo(
    videoId: string,
    videoData: Partial<Video>
  ): Promise<Video> {
    const response = await apiService.put<Video>(
      `/video/${videoId}`,
      videoData
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to update video');
    }
    return response.data!;
  }

  async deleteVideo(videoId: string): Promise<void> {
    const response = await apiService.delete(`/video/${videoId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete video');
    }
  }

  async updateVideoProgress(progress: VideoProgressDto): Promise<void> {
    const response = await apiService.post<void>('/video/progress', progress);
    if (!response.success) {
      throw new Error(response.error || 'Failed to update video progress');
    }
  }

  async assignVideoToClasses(
    videoId: string,
    classIds: string[]
  ): Promise<void> {
    const response = await apiService.post(
      `/video/${videoId}/assign`,
      classIds
    );
    if (!response.success) {
      throw new Error(response.error || 'Failed to assign video to classes');
    }
  }

  async getVideoHistory(userId: string): Promise<any[]> {
    const response = await apiService.get<any[]>(`/video/history/${userId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch video history');
    }
    return response.data || [];
  }
}

export const videoService = new VideoService();
