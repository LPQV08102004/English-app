import axios from 'axios';
import type {
  User,
  Course,
  CourseDetail,
  LessonDetail,
  TopicPriority,
  AuthResponse,
  SubmitAnswerResponse,
  VocabEntry,
  VocabSaved,
  MistakeReview,
  PageResponse,
} from '../types';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap backend's ApiResponse<T> wrapper { success, data, message }
api.interceptors.response.use((response) => {
  const body = response.data;
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    response.data = body.data;
  }
  return response;
});

// Auth
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/api/auth/login', { email, password });
  return data;
};

export const register = async (
  email: string,
  password: string,
  displayName: string,
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/api/auth/register', {
    email,
    password,
    displayName,
  });
  return data;
};

// Profile
export const getProfile = async (): Promise<User> => {
  const { data } = await api.get<User>('/api/me');
  return data;
};

// Courses
export const getCourses = async (): Promise<Course[]> => {
  const { data } = await api.get<Course[]>('/api/courses');
  return data;
};

export const getCourseDetail = async (id: number): Promise<CourseDetail> => {
  const { data } = await api.get<CourseDetail>(`/api/courses/${id}`);
  return data;
};

// Lessons
export const getLessonDetail = async (id: number): Promise<LessonDetail> => {
  const { data } = await api.get<LessonDetail>(`/api/lessons/${id}`);
  return data;
};

// Lessons — submit & restart
export const submitExercise = async (
  lessonId: number,
  exerciseId: number,
  answer: string,
): Promise<SubmitAnswerResponse> => {
  const { data } = await api.post<SubmitAnswerResponse>(
    `/api/lessons/${lessonId}/exercises/${exerciseId}/submit`,
    { answer },
  );
  return data;
};

export const restartLesson = async (lessonId: number): Promise<void> => {
  await api.post(`/api/lessons/${lessonId}/restart`);
};

// Vocab
export const getTopicPriorities = async (): Promise<TopicPriority[]> => {
  const { data } = await api.get<TopicPriority[]>('/api/vocab/topics/priority');
  return data;
};

export const searchDictionary = async (
  q: string,
  page = 0,
  size = 20,
): Promise<PageResponse<VocabEntry>> => {
  const { data } = await api.get<PageResponse<VocabEntry>>('/api/vocab/dictionary', {
    params: { q, page, size },
  });
  return data;
};

export const getDictionaryByLevel = async (
  level: string,
  page = 0,
  size = 20,
): Promise<PageResponse<VocabEntry>> => {
  const { data } = await api.get<PageResponse<VocabEntry>>('/api/vocab/dictionary/by-level', {
    params: { level, page, size },
  });
  return data;
};

export const getDictionaryByTopic = async (
  topic: string,
  page = 0,
  size = 20,
): Promise<PageResponse<VocabEntry>> => {
  const { data } = await api.get<PageResponse<VocabEntry>>('/api/vocab/dictionary/by-topic', {
    params: { topic, page, size },
  });
  return data;
};

export const getSavedWords = async (page = 0, size = 20): Promise<PageResponse<VocabSaved>> => {
  const { data } = await api.get<PageResponse<VocabSaved>>('/api/vocab/saved', {
    params: { page, size },
  });
  return data;
};

export const saveWord = async (params: {
  vocabularyId?: number;
  word?: string;
  meaning?: string;
  note?: string;
}): Promise<VocabSaved> => {
  const { data } = await api.post<VocabSaved>('/api/vocab/save', params);
  return data;
};

export const deleteSavedWord = async (id: number): Promise<void> => {
  await api.delete(`/api/vocab/saved/${id}`);
};

export const getMistakes = async (page = 0, size = 20): Promise<PageResponse<MistakeReview>> => {
  const { data } = await api.get<PageResponse<MistakeReview>>('/api/vocab/mistakes', {
    params: { page, size },
  });
  return data;
};

export const markMistakeReviewed = async (id: number): Promise<void> => {
  await api.post(`/api/vocab/mistakes/${id}/reviewed`);
};

// Profile
export const updateProfile = async (params: {
  displayName?: string;
  avatarUrl?: string;
}): Promise<User> => {
  const { data } = await api.put<User>('/api/me', params);
  return data;
};

export const changePassword = async (params: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  await api.post('/api/me/change-password', params);
};

// Progress
export const getCourseProgress = async (
  courseId: number,
): Promise<{ lessonId: number; status: string; score: number }[]> => {
  const { data } = await api.get(`/api/progress/courses/${courseId}`);
  return data;
};

// Event logging
export const logEvent = async (
  eventType: 'START_LESSON' | 'FINISH_LESSON' | 'ANSWER_CORRECT' | 'ANSWER_WRONG',
  metadata?: Record<string, unknown>,
): Promise<void> => {
  await api.post('/api/events/log', { eventType, metadata: metadata ?? {} });
};

export default api;
