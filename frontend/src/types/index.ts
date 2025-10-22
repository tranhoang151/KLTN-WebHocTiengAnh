// User Types
export type UserRole = 'student' | 'teacher' | 'admin';

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
  is_active: boolean;
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
  image_url?: string; // Optional - not used in Android app
  created_at?: any; // Firebase Timestamp - optional since server provides default
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
  // assigned_class_ids: string[]; // Removed - using course-based access instead
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

export interface FlashcardSession {
  id: string;
  flashcardSetId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  currentIndex: number;
  totalCards: number;
  correctAnswers: number;
  responses: FlashcardResponse[];
  completed: boolean;
}

export interface FlashcardResponse {
  cardId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  timestamp: Date;
}

export interface FlashcardProgress {
  userId: string;
  flashcardSetId: string;
  courseId: string;
  completionPercentage: number;
  learnedCardIds: string[];
  timeSpent: number;
  totalSessions: number;
  totalCardsStudied: number;
  averageScore: number;
  bestScore: number;
  lastStudied: Date;
  streakCount: number;
  masteredCards: string[];
  needsReviewCards: string[];
}

// Exercise Types
export interface Exercise {
  id: string;
  title: string;
  type: 'multiple_choice' | 'fill_blank';
  course_id?: string; // For backward compatibility
  courseId?: string; // For new exercises (camelCase from backend)
  questions: Question[];
  total_points?: number; // For backward compatibility
  totalPoints?: number; // For new exercises (camelCase from backend)
  created_by?: string;
  created_at?: any;
  is_active?: boolean;
}

// Test Types
export interface Test {
  id: string;
  title: string;
  courseId?: string; // For backward compatibility
  course_id?: string; // For new tests
  questions: Question[];
  duration: number; // in minutes
  maxScore: number;
  passingScore?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionIds?: string[];
  totalQuestions?: number;
  createdAt?: any; // Firebase Timestamp
  createdBy?: string;
  updatedAt?: Date;
  isPublished?: boolean;
  isActive?: boolean;
  instructions?: string;
  description?: string;
}

export interface Question {
  id: string;
  content?: string; // For new questions
  question_text?: string; // For old questions in backup.json
  type?: 'multiple_choice' | 'fill_blank' | 'true_false' | 'essay'; // Optional for old questions
  options?: string[];
  correctAnswer?: string | number | boolean; // Optional for old questions
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard'; // Optional for old questions
  courseId?: string; // For backward compatibility with old questions
  course_id?: string; // For new questions and backward compatibility
  tags?: string[]; // Optional for old questions
  createdBy?: string; // Optional for old questions
  createdAt?: number; // Optional for old questions
  isActive?: boolean; // Optional for old questions
}

export interface AnswerDto {
  questionId: string;
  answer: string;
}

export interface ExerciseSubmissionDto {
  userId: string;
  exerciseId: string;
  course_id: string;
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
  is_active: boolean;
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

// Flashcard Analytics Types
export interface FlashcardStatistics {
  totalCards: number;
  masteredCards: number;
  needsReviewCards: number;
  averageTimePerCard: number;
  longestStreak: number;
  currentStreak: number;
  totalStudyTime: number; // in minutes
}

export interface TeacherAnalytics {
  totalStudents: number;
  totalSets: number;
  averageProgress: number;
  topPerformingStudents: StudentAnalytics[];
  classProgress: ClassAnalytics[];
}

export interface ClassAnalytics {
  classId: string;
  className: string;
  totalStudents: number;
  averageProgress: number;
  totalStudyTime: number;
  topStudents: StudentAnalytics[];
}

export interface StudentAnalytics {
  studentId: string;
  studentName: string;
  totalStudyTime: number;
  progress: number;
  streak: number;
  masteredCards: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  streakHistory: { [date: string]: boolean };
  streakCalendar: { [date: string]: boolean };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
