import api from './api';
import type { CourseDetail, PageResponse } from '../types';

// ── Types ────────────────────────────────────────────────────────────────────

export interface AdminExercise {
  id: number;
  lessonId: number;
  lessonName: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK';
  options: string[] | null;
  correctAnswer: string;
  vocabularyId: number | null;
}

export interface AdminVocab {
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

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  active: boolean;
  xp: number;
  streakDays: number;
  lastStudiedAt: string | null;
  createdAt: string;
}

export interface EventStats {
  totalEvents: number;
  countByType: Record<string, number>;
  topUsers: { userId: string; displayName: string; eventCount: number }[];
}

// ── Courses ──────────────────────────────────────────────────────────────────

export const adminGetCourses = async (page = 0): Promise<PageResponse<CourseDetail>> => {
  const { data } = await api.get('/api/admin/courses', { params: { page, size: 20 } });
  return data;
};

export const adminCreateCourse = async (body: {
  name: string;
  description: string;
  levelTarget: string;
}): Promise<CourseDetail> => {
  const { data } = await api.post('/api/admin/courses', body);
  return data;
};

export const adminUpdateCourse = async (
  id: number,
  body: { name: string; description: string; levelTarget: string },
): Promise<CourseDetail> => {
  const { data } = await api.put(`/api/admin/courses/${id}`, body);
  return data;
};

export const adminDeleteCourse = async (id: number): Promise<void> => {
  await api.delete(`/api/admin/courses/${id}`);
};

// ── Lessons ──────────────────────────────────────────────────────────────────

export const adminGetLessons = async (
  courseId: number,
  page = 0,
): Promise<PageResponse<{ id: number; name: string; courseId: number; courseName: string; orderIndex: number }>> => {
  const { data } = await api.get('/api/admin/lessons', { params: { courseId, page, size: 50 } });
  return data;
};

export const adminCreateLesson = async (body: {
  courseId: number;
  name: string;
  orderIndex: number;
}): Promise<{ id: number; name: string; orderIndex: number }> => {
  const { data } = await api.post('/api/admin/lessons', body);
  return data;
};

export const adminUpdateLesson = async (
  id: number,
  body: { courseId: number; name: string; orderIndex: number },
): Promise<{ id: number; name: string; orderIndex: number }> => {
  const { data } = await api.put(`/api/admin/lessons/${id}`, body);
  return data;
};

export const adminDeleteLesson = async (id: number): Promise<void> => {
  await api.delete(`/api/admin/lessons/${id}`);
};

// ── Exercises ────────────────────────────────────────────────────────────────

export const adminGetExercises = async (lessonId: number): Promise<AdminExercise[]> => {
  const { data } = await api.get('/api/admin/exercises', { params: { lessonId } });
  return data;
};

export const adminCreateExercise = async (body: {
  lessonId: number;
  question: string;
  type: string;
  options: string[] | null;
  correctAnswer: string;
  vocabularyId?: number | null;
}): Promise<AdminExercise> => {
  const { data } = await api.post('/api/admin/exercises', body);
  return data;
};

export const adminUpdateExercise = async (
  id: number,
  body: {
    lessonId: number;
    question: string;
    type: string;
    options: string[] | null;
    correctAnswer: string;
    vocabularyId?: number | null;
  },
): Promise<AdminExercise> => {
  const { data } = await api.put(`/api/admin/exercises/${id}`, body);
  return data;
};

export const adminDeleteExercise = async (id: number): Promise<void> => {
  await api.delete(`/api/admin/exercises/${id}`);
};

// ── Vocabulary ───────────────────────────────────────────────────────────────

export const adminGetVocab = async (
  params: { level?: string; topic?: string; page?: number } = {},
): Promise<PageResponse<AdminVocab>> => {
  const { data } = await api.get('/api/admin/vocab', {
    params: { level: params.level, topic: params.topic, page: params.page ?? 0, size: 20 },
  });
  return data;
};

export const adminCreateVocab = async (body: Partial<AdminVocab> & { word: string; meaning: string }): Promise<AdminVocab> => {
  const { data } = await api.post('/api/admin/vocab', body);
  return data;
};

export const adminUpdateVocab = async (id: number, body: Partial<AdminVocab>): Promise<AdminVocab> => {
  const { data } = await api.put(`/api/admin/vocab/${id}`, body);
  return data;
};

export const adminDeleteVocab = async (id: number): Promise<void> => {
  await api.delete(`/api/admin/vocab/${id}`);
};

// ── Users ────────────────────────────────────────────────────────────────────

export const adminGetUsers = async (page = 0): Promise<PageResponse<AdminUser>> => {
  const { data } = await api.get('/api/admin/users', { params: { page, size: 20 } });
  return data;
};

export const adminDeleteUser = async (id: string): Promise<void> => {
  await api.delete(`/api/admin/users/${id}`);
};

// ── Event stats ──────────────────────────────────────────────────────────────

export const adminGetEventStats = async (): Promise<EventStats> => {
  const { data } = await api.get('/api/admin/events/stats');
  return data;
};
