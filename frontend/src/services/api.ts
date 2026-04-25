import axios from 'axios';
import type { User, Course, CourseDetail, LessonDetail, TopicPriority, AuthResponse } from '../types';

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

// Vocab
export const getTopicPriorities = async (): Promise<TopicPriority[]> => {
  const { data } = await api.get<TopicPriority[]>('/api/vocab/topics/priority');
  return data;
};

export default api;
