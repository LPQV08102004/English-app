import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CoursesPage from './pages/CoursesPage';
import LessonListPage from './pages/LessonListPage';
import LessonDetailPage from './pages/LessonDetailPage';
import heroMark from './assets/hero.png';

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
          <Route path="/quiz" element={<PlaceholderPage title="Quiz" />} />
          <Route path="/exercises" element={<PlaceholderPage title="Exercise" />} />
          <Route path="/vocab/mistakes" element={<PlaceholderPage title="Vocabulary Mistakes" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="placeholder-page">
      <div className="placeholder-card reveal">
        <img src={heroMark} alt="English Learning" className="placeholder-logo" />
        <h1>{title}</h1>
        <p>This section is under construction. It will be available soon.</p>
        <a href="/" className="placeholder-link">
          Back to home
        </a>
      </div>
    </div>
  );
}
