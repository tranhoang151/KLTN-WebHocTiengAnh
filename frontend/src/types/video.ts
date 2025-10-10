export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  courseId: string;
  topic: string;
  assignedClassIds?: string[];
}

export interface VideoProgressDto {
  userId: string;
  videoId: string;
  courseId: string;
  completed: boolean;
  watchTime: number;
}
