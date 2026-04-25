import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Lock, LockOpen, HelpCircle, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import { getCourseDetail } from '../services/api';
import type { CourseDetail, LessonWithProgress } from '../types';

// Hero gradient per CEFR level (matches CoursesPage thumbnails)
const LEVEL_HERO: Record<string, string> = {
  A1: 'linear-gradient(140deg, #064e3b 0%, #065f46 40%, #0f172a 100%)',
  A2: 'linear-gradient(140deg, #164e63 0%, #155e75 40%, #0f172a 100%)',
  B1: 'linear-gradient(140deg, #1e3a8a 0%, #1d4ed8 40%, #0f172a 100%)',
  B2: 'linear-gradient(140deg, #312e81 0%, #4338ca 40%, #0f172a 100%)',
  C1: 'linear-gradient(140deg, #3b0764 0%, #6d28d9 40%, #0f172a 100%)',
  C2: 'linear-gradient(140deg, #831843 0%, #be185d 40%, #0f172a 100%)',
};

// Mock lessons — used when backend is unavailable
const MOCK_COURSE: CourseDetail = {
  id: 1,
  name: 'English for Beginners',
  description: 'Start your English learning journey.',
  levelTarget: 'A1',
  lessonCount: 8,
  lessons: [
    { id: 1, name: 'Lesson 1: Greetings and Introductions', orderIndex: 1 },
    { id: 2, name: 'Lesson 2: Basic Vocabulary', orderIndex: 2 },
    { id: 3, name: 'Lesson 3: Present Simple Tense', orderIndex: 3 },
    { id: 4, name: 'Lesson 4: Questions and Answers', orderIndex: 4 },
    { id: 5, name: 'Lesson 5: Daily Routines', orderIndex: 5 },
    { id: 6, name: 'Lesson 6: Past Simple Tense', orderIndex: 6 },
    { id: 7, name: 'Lesson 7: Future Plans', orderIndex: 7 },
    { id: 8, name: 'Lesson 8: Describing People', orderIndex: 8 },
  ],
};

// Mock progress per lesson (0-100). In a real app this comes from the progress API.
const MOCK_PROGRESS: Record<number, number> = { 1: 100, 2: 85, 3: 45 };

// Derive locked/unlocked status based on previous lesson progress (threshold 80%)
function buildLessonsWithProgress(
  course: CourseDetail,
  progressMap: Record<number, number>,
): LessonWithProgress[] {
  return course.lessons
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((lesson, i, arr) => {
      const progress = progressMap[lesson.id] ?? 0;

      let status: LessonWithProgress['status'];
      if (progress === 100) {
        status = 'COMPLETED';
      } else if (i === 0) {
        // First lesson always unlocked
        status = progress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
      } else {
        const prevProgress = progressMap[arr[i - 1].id] ?? 0;
        if (prevProgress >= 80) {
          status = progress > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';
        } else {
          status = 'LOCKED';
        }
      }

      return { ...lesson, progress, status };
    });
}

export default function LessonListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const courseId = Number(id);
    getCourseDetail(courseId)
      .then((data) => {
        setCourse(data);
        setLessons(buildLessonsWithProgress(data, MOCK_PROGRESS));
      })
      .catch(() => {
        setCourse(MOCK_COURSE);
        setLessons(buildLessonsWithProgress(MOCK_COURSE, MOCK_PROGRESS));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const heroGradient = LEVEL_HERO[course?.levelTarget ?? 'B2'];

  return (
    <div className="lesson-list-page">
      <Header />

      <div className="lesson-list-inner">
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate('/lessons')}
          className="reveal"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: 'var(--text-soft)',
            cursor: 'pointer',
            fontSize: '0.87rem',
            fontWeight: 600,
            padding: '0 0 16px 0',
          }}
        >
          <ArrowLeft size={15} />
          All courses
        </button>

        {/* Hero */}
        <div className="lesson-hero reveal">
          <div className="lesson-hero-bg" style={{ background: heroGradient }} />
          <div className="lesson-hero-content">
            {course && (
              <div className="lesson-hero-level">{course.levelTarget} · {course.lessonCount} lessons</div>
            )}
            <h1 className="lesson-hero-title">
              {loading ? 'Loading…' : course?.name}
            </h1>
            {course?.description && (
              <p className="lesson-hero-meta">{course.description}</p>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="lesson-timeline">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="lesson-skeleton-row">
                  <div className="lesson-skeleton-circle" />
                  <div
                    className="lesson-skeleton-card"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  />
                </div>
              ))
            : lessons.map((lesson, i) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  index={i}
                  isLast={i === lessons.length - 1}
                  onClick={
                    lesson.status !== 'LOCKED'
                      ? () => navigate(`/lessons/${lesson.id}`)
                      : undefined
                  }
                />
              ))}
        </div>
      </div>

      <button className="support-fab" type="button" title="Help">
        <HelpCircle size={20} />
      </button>
    </div>
  );
}

// ── LessonRow ────────────────────────────────────────────────────────────────

function LessonRow({
  lesson,
  index,
  isLast,
  onClick,
}: {
  lesson: LessonWithProgress;
  index: number;
  isLast: boolean;
  onClick?: () => void;
}) {
  const isLocked = lesson.status === 'LOCKED';
  const isCompleted = lesson.status === 'COMPLETED';
  const canClick = !isLocked && !!onClick;

  const iconClass = isCompleted ? 'completed' : isLocked ? 'locked' : 'unlocked';

  return (
    <div
      className="lesson-timeline-item reveal"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Connector line */}
      {!isLast && <div className="lesson-connector" />}

      {/* Icon */}
      <div className="lesson-icon-col">
        <div className={`lesson-icon-circle ${iconClass}`}>
          {isCompleted ? (
            <Check size={18} color="white" strokeWidth={2.5} />
          ) : isLocked ? (
            <Lock size={16} color="rgba(148,163,184,0.7)" strokeWidth={2} />
          ) : (
            <LockOpen size={17} color="white" strokeWidth={2} />
          )}
        </div>
      </div>

      {/* Card */}
      <button
        type="button"
        className={`lesson-card ${canClick ? 'clickable' : 'locked-card'}`}
        onClick={onClick}
        disabled={isLocked}
      >
        <div className="lesson-card-top">
          <span className="lesson-card-name">{lesson.name}</span>
          <span className="lesson-card-pct">{lesson.progress}%</span>
        </div>

        <div className="lesson-progress-track">
          <div
            className="lesson-progress-fill"
            style={{ width: `${lesson.progress}%` }}
          />
        </div>

        <span
          className={`lesson-card-status ${
            isCompleted ? 'done' : isLocked ? 'locked-msg' : 'continue'
          }`}
        >
          {isCompleted && '✓ Hoàn thành'}
          {lesson.status === 'IN_PROGRESS' && 'Nhấp để tiếp tục học'}
          {lesson.status === 'NOT_STARTED' && 'Nhấp để bắt đầu'}
          {isLocked && 'Hoàn thành 80% bài học trước để mở khoá'}
        </span>
      </button>
    </div>
  );
}
