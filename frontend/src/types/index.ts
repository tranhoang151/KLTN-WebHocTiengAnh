// User Types
export type UserRole = 'student' | 'teacher' | 'admin' | 'parent';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  gender: string;
  avatar_url?: string;
  avatar_base64?: string;
  streak_count: number;
  last_login_date: string;
  class_ids?: string[];
  badges: Record<
    string,
    {
      earned: boolean;
      earnedAt?: Date;
    }
  >;
}

// Permission Types
export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  dashboardPath: string;
  allowedRoutes: string[];
}

// Course Types
export interface Course {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at?: any; // Firebase Timestamp - optional since server provides default
  target_age_group: string;
}

// Class Types
export interface Class {
  id: string;
  name: string;
  description: string;
  capacity: number;
  course_id: string;
  teacher_id: string;
  student_ids: string[];
  created_at: string;
  is_active: boolean;
}

// Flashcard Types
export interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  course_id: string;
  created_by: string;
  created_at: any; // Firebase Timestamp
  assigned_class_ids: string[];
  set_id: string;
}

export interface Flashcard {
  id: string;
  flashcard_set_id: string;
  front_text: string;
  back_text: string;
  example_sentence?: string;
  image_url?: string;
  image_base64?: string;
  order: number;
}

// Exercise Types
export interface Exercise {
  id: string;
  title: string;
  type: 'multiple_choice' | 'fill_blank';
  course_id: string;
  questions: Question[];
  time_limit?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Test Types
export interface Test {
  id: string;
  title: string;
  course_id?: string;
  courseId?: string;
  questions: Question[];
  duration: number; // in minutes
  maxScore: number;
  passingScore?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionIds?: string[];
  totalQuestions?: number;
  created_at?: any; // Firebase Timestamp
  created_by?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isPublished?: boolean;
  isActive?: boolean;
  instructions?: string;
  description?: string;
}

export interface Question {
  id: string;
  content: string;
  type: 'multiple_choice' | 'fill_blank';
  options?: string[];
  correct_answer: string | number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  course_id: string;
  tags: string[];
  created_by: string;
  created_at: number;
  is_active: boolean;
}

export interface AnswerDto {
  questionId: string;
  answer: string;
}

export interface ExerciseSubmissionDto {
  userId: string;
  exerciseId: string;
  courseId: string;
  answers: AnswerDto[];
  timeSpent: number;
}

export interface QuestionResult {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface ExerciseResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  questionResults: QuestionResult[];
}

// Progress Types
export interface LearningProgress {
  user_id: string;
  course_id: string;
  flashcard_sets_completed: string[];
  exercises_completed: string[];
  tests_completed: string[];
  videos_watched: string[];
  total_study_time: number;
  last_activity: Date;
  streak_data: {
    current_streak: number;
    longest_streak: number;
    last_activity_date: string;
  };
}

export interface LearningActivity {
  userId: string;
  type: string; // 'flashcard', 'exercise', 'test', 'video'
  exerciseId?: string;
  flashcardSetId?: string;
  videoId?: string;
  score?: number;
  completedAt: any; // Firebase Timestamp
  timeSpent: number;
}

// Badge Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  condition: string;
  conditionKey: string;
  isActive: boolean;
  earned?: boolean;
  earnedAt?: Date;
}

export interface BadgeNotification {
  badgeId: string;
  userId: string;
  earnedAt: Date;
  seen: boolean;
}

// Evaluation Types
export interface Evaluation {
  id: string;
  student_id: string;
  teacher_id: string;
  class_id?: string;
  evaluation_date: string;
  overall_rating: number;
  rating_participation: number;
  rating_understanding: number;
  rating_progress: number;
  score: number;
  comments: string;
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
  created_at: any; // Firebase Timestamp
  updated_at: any; // Firebase Timestamp
}

export interface CreateEvaluationDto {
  studentId: string;
  teacherId: string;
  classId?: string;
  ratingParticipation: number;
  ratingUnderstanding: number;
  ratingProgress: number;
  score: number;
  comments: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
}

export interface UpdateEvaluationDto {
  ratingParticipation?: number;
  ratingUnderstanding?: number;
  ratingProgress?: number;
  score?: number;
  comments?: string;
  strengths?: string[];
  areasForImprovement?: string[];
  recommendations?: string[];
}

export interface EvaluationSummaryDto {
  evaluationId: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  classId?: string;
  className?: string;
  overallRating: number;
  score: number;
  evaluationDate: string;
  comments: string;
}

export interface EvaluationAnalyticsDto {
  totalEvaluations: number;
  averageOverallRating: number;
  averageParticipation: number;
  averageUnderstanding: number;
  averageProgress: number;
  averageScore: number;
  commonStrengths: string[];
  commonAreasForImprovement: string[];
  ratingDistribution: Record<string, number>;
  trendData: EvaluationTrendDto[];
}

export interface EvaluationTrendDto {
  date: string;
  averageRating: number;
  evaluationCount: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
