import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CoursesPage from './pages/CoursesPage';
import LessonListPage from './pages/LessonListPage';
import LessonDetailPage from './pages/LessonDetailPage';
import QuizPage from './pages/QuizPage';
import ProfilePage from './pages/ProfilePage';
import VocabDictionaryPage from './pages/VocabDictionaryPage';
import SavedWordsPage from './pages/SavedWordsPage';
import MistakeReviewPage from './pages/MistakeReviewPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import AdminLessonsPage from './pages/admin/AdminLessonsPage';
import AdminExercisesPage from './pages/admin/AdminExercisesPage';
import AdminVocabPage from './pages/admin/AdminVocabPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/lessons" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<LessonListPage />} />
          <Route path="/lessons/:id" element={<LessonDetailPage />} />
          <Route path="/lessons/:id/quiz" element={<QuizPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/vocab/dictionary" element={<VocabDictionaryPage />} />
          <Route path="/vocab/saved" element={<SavedWordsPage />} />
          <Route path="/vocab/mistakes" element={<MistakeReviewPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/courses" element={<AdminCoursesPage />} />
          <Route path="/admin/courses/:courseId/lessons" element={<AdminLessonsPage />} />
          <Route path="/admin/lessons/:lessonId/exercises" element={<AdminExercisesPage />} />
          <Route path="/admin/vocab" element={<AdminVocabPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/events" element={<AdminEventsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

