import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import Header from '../components/Header';
import { getCourses } from '../services/api';
import type { CourseWithProgress } from '../types';

// Gradient per CEFR level for the thumbnail
const LEVEL_THUMB: Record<string, string> = {
  A1: 'linear-gradient(140deg, #34d399, #059669)',
  A2: 'linear-gradient(140deg, #2dd4bf, #0891b2)',
  B1: 'linear-gradient(140deg, #60a5fa, #2563eb)',
  B2: 'linear-gradient(140deg, #818cf8, #4f46e5)',
  C1: 'linear-gradient(140deg, #c084fc, #9333ea)',
  C2: 'linear-gradient(140deg, #f472b6, #db2777)',
};

const MOCK_COURSES: CourseWithProgress[] = [
  {
    id: 1,
    name: 'English Basics',
    description: 'Start your English learning journey with fundamental grammar, vocabulary, and essential phrases.',
    levelTarget: 'A1',
    lessonCount: 12,
    progress: null,
  },
  {
    id: 2,
    name: 'Elementary English',
    description: 'Build on your foundation with more complex sentence structures and everyday conversations.',
    levelTarget: 'A2',
    lessonCount: 15,
    progress: 45,
  },
  {
    id: 3,
    name: 'Intermediate English',
    description: 'Develop confidence in everyday situations and improve your reading and writing skills.',
    levelTarget: 'B1',
    lessonCount: 18,
    progress: 72,
  },
  {
    id: 4,
    name: 'Upper Intermediate',
    description: 'Master complex topics, idiomatic expressions, and professional communication.',
    levelTarget: 'B2',
    lessonCount: 20,
    progress: null,
  },
  {
    id: 5,
    name: 'Advanced English',
    description: 'Refine your language skills with advanced grammar, literature, and nuanced writing.',
    levelTarget: 'C1',
    lessonCount: 22,
    progress: null,
  },
  {
    id: 6,
    name: 'Mastery English',
    description: 'Achieve native-like fluency with sophisticated vocabulary and complex language structures.',
    levelTarget: 'C2',
    lessonCount: 24,
    progress: null,
  },
];

export default function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses()
      .then((data) => {
        // Merge real backend data with mock progress (progress API not yet available)
        const merged: CourseWithProgress[] = data.map((c, i) => ({
          ...c,
          progress: MOCK_COURSES[i]?.progress ?? null,
        }));
        setCourses(merged.length ? merged : MOCK_COURSES);
      })
      .catch(() => setCourses(MOCK_COURSES))
      .finally(() => setLoading(false));
  }, []);

  const displayCourses = courses.length ? courses : MOCK_COURSES;

  return (
    <div className="courses-page">
      <Header />

      <div className="courses-header reveal">
        <h1 className="section-title" style={{ fontSize: 'clamp(1.4rem, 2.6vw, 1.9rem)' }}>
          English Learning Courses
        </h1>
        <p className="courses-eyebrow">Choose your level and start learning English today</p>
      </div>

      <div className="courses-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="course-skeleton" style={{ animationDelay: `${i * 0.07}s` }} />
            ))
          : displayCourses.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                index={i}
                onClick={() => navigate(`/courses/${course.id}`)}
              />
            ))}
      </div>

      <button className="support-fab" title="Help" type="button">
        <HelpCircle size={20} />
      </button>
    </div>
  );
}

// ── CourseCard ──────────────────────────────────────────────────────────────

function CourseCard({
  course,
  index,
  onClick,
}: {
  course: CourseWithProgress;
  index: number;
  onClick: () => void;
}) {
  const thumbGradient = LEVEL_THUMB[course.levelTarget] ?? LEVEL_THUMB.B1;
  const hasProgress = course.progress !== null && course.progress > 0;

  return (
    <button
      type="button"
      className="course-card reveal"
      style={{ animationDelay: `${index * 0.07}s` }}
      onClick={onClick}
    >
      <div className="course-card-body">
        {/* Thumbnail */}
        <div className="course-thumbnail" style={{ background: thumbGradient }}>
          <span className="course-thumb-level">{course.levelTarget}</span>
        </div>

        {/* Info */}
        <div className="course-info">
          <div className="course-name-row">
            <span className="course-name">{course.name}</span>
            <span className="course-level-badge">{course.levelTarget}</span>
          </div>
          <p className="course-description">{course.description}</p>
        </div>
      </div>

      {/* Progress bar (only when in progress) */}
      {hasProgress && (
        <div className="course-progress-section">
          <div className="course-progress-row">
            <span className="course-progress-label">Progress</span>
            <span className="course-progress-pct">{course.progress}%</span>
          </div>
          <div className="course-progress-track">
            <div
              className="course-progress-fill"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action button */}
      <button
        type="button"
        className="course-action-btn"
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        {hasProgress ? 'Continue' : 'Start'}
      </button>
    </button>
  );
}
