export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  xp: number;
  streakDays: number;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
}

export interface Course {
  id: number;
  name: string;
  description: string;
  levelTarget: string;
  lessonCount?: number;
}

export interface CourseWithProgress extends Course {
  progress: number | null;
}

export interface LessonSummary {
  id: number;
  name: string;
  orderIndex: number;
}

export interface CourseDetail {
  id: number;
  name: string;
  description: string;
  levelTarget: string;
  lessonCount: number;
  lessons: LessonSummary[];
}

export interface LessonWithProgress extends LessonSummary {
  progress: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'LOCKED';
}

export interface TopicPriority {
  topic: string;
  totalMistakes: number;
  level?: string;
}

export interface AuthResponse {
  token: string;
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  xp: number;
  streakDays: number;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface HomeStats {
  streak: number;
  totalXp: number;
  needPracticeCount: number;
  topicsNeedPractice: TopicPriority[];
  courses: Course[];
}

export interface ExercisePreview {
  id: number;
  question: string;
  type: string;
  options: string[] | null;
}

export interface LessonDetail {
  id: number;
  name: string;
  courseId: number;
  courseName: string;
  orderIndex: number;
  exercises: ExercisePreview[];
}

export interface VocabPreview {
  word: string;
  ipa: string;
  meaning: string;
  imageUrl: string;
}

export interface DialogueLine {
  speaker: 'A' | 'B';
  text: string;
}

export interface LessonProgress {
  id: number;
  lessonId: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  score: number;
}

export interface SubmitAnswerResponse {
  correct: boolean;
  xpEarned: number;
  wrongAttempts: number;
  lessonFailed: boolean;
  lessonCompleted: boolean;
  bonusXp: number;
}

export interface VocabEntry {
  id: number;
  word: string;
  meaning: string;
  ipa: string | null;
  partOfSpeech: string | null;
  topic: string | null;
  level: string | null;
  audioUrl: string | null;
  example: string | null;
  grammarInfo: Record<string, unknown> | null;
}

export interface VocabSaved {
  id: number;
  word: string;
  meaning: string;
  note: string | null;
  source: string | null;
  createdAt: string;
}

export interface MistakeReview {
  vocabularyId: number;
  word: string;
  meaning: string;
  ipa: string | null;
  topic: string | null;
  level: string | null;
  mistakeCount: number;
  lastReviewedAt: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
