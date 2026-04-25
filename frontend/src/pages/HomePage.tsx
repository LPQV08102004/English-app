import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Star, TrendingUp, BookOpen, Brain, Pen, HelpCircle } from 'lucide-react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import PracticeTopicCard from '../components/PracticeTopicCard';
import ActivityCard from '../components/ActivityCard';
import { useAuth } from '../context/AuthContext';
import { getCourses, getTopicPriorities } from '../services/api';
import type { Course, TopicPriority } from '../types';

// Fallback mock data when backend is not available
const MOCK_TOPICS: TopicPriority[] = [
  { topic: 'Present Perfect', totalMistakes: 24 },
  { topic: 'Phrasal Verbs', totalMistakes: 18 },
  { topic: 'Conditional Sentences', totalMistakes: 12 },
];

const MOCK_COURSES: Course[] = [
  { id: 1, name: 'Lessons', description: 'Interactive lessons', levelTarget: 'A1', lessonCount: 24 },
  { id: 2, name: 'Quiz', description: 'Test your knowledge', levelTarget: 'B1', lessonCount: 15 },
  { id: 3, name: 'Exercise', description: 'Practice makes perfect', levelTarget: 'B2', lessonCount: 48 },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [topics, setTopics] = useState<TopicPriority[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // useEffect(() => {
  //   if (!loading && !user) {
  //     navigate('/login');
  //   }
  // }, [loading, user, navigate]);

  useEffect(() => {
    Promise.all([
      getTopicPriorities().catch(() => MOCK_TOPICS),
      getCourses().catch(() => MOCK_COURSES),
    ]).then(([t, c]) => {
      setTopics(t.slice(0, 3));
      setCourses(c.slice(0, 3));
    }).finally(() => setDataLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-orb" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // Use mock data for display names when user info isn't available
  const displayUser = user ?? {
    displayName: 'Nguyễn Văn A',
    xp: 2840,
    streakDays: 15,
  };

  const displayTopics = topics.length ? topics : MOCK_TOPICS;
  const displayCourses = courses.length ? courses : MOCK_COURSES;
  const level = Math.floor(displayUser.xp / 200) + 1;
  const xpToNextLevel = Math.max(level * 200 - displayUser.xp, 0);
  const displayName = displayUser.displayName.trim().split(' ').pop() ?? displayUser.displayName;

  const activityDefs = [
    {
      icon: <BookOpen size={24} color="white" />,
      title: 'Lessons',
      description: 'Interactive lessons',
      linkLabel: `${displayCourses[0]?.lessonCount ?? 24} lessons`,
      path: '/lessons',
      tone: 'cyan' as const,
    },
    {
      icon: <Brain size={24} color="white" />,
      title: 'Quiz',
      description: 'Test your knowledge',
      linkLabel: `${displayCourses[1]?.lessonCount ?? 15} available`,
      path: '/quiz',
      tone: 'sunset' as const,
    },
    {
      icon: <Pen size={24} color="white" />,
      title: 'Exercise',
      description: 'Practice makes perfect',
      linkLabel: `${displayCourses[2]?.lessonCount ?? 48} exercises`,
      path: '/exercises',
      tone: 'violet' as const,
    },
  ];

  return (
    <div className="app-shell">
      <Header />

      <main className="dashboard">
        <section className="intro-panel reveal">
          <div>
            <p className="eyebrow">Progress cockpit</p>
            <h1 className="intro-title">Welcome back, {displayName}.</h1>
            <p className="intro-description">
              You are {xpToNextLevel} XP away from Level {level + 1}. Stay consistent and keep your
              streak alive today.
            </p>
          </div>
          <div className="intro-metrics">
            <div className="intro-metric">
              <span className="intro-metric-label">Current level</span>
              <strong className="intro-metric-value">{level}</strong>
            </div>
            <div className="intro-metric">
              <span className="intro-metric-label">Weekly target</span>
              <strong className="intro-metric-value">500 XP</strong>
            </div>
          </div>
        </section>

        <section className="section-block reveal reveal-delay-1">
          <h2 className="section-title">At a glance</h2>
          <div className="stats-grid">
          <StatCard
            icon={<Flame size={20} />}
            label="Streak"
            value={displayUser.streakDays}
            subLabel="days in a row"
            tone="ember"
          />
          <StatCard
            icon={<Star size={20} />}
            label="Total XP"
            value={displayUser.xp.toLocaleString()}
            subLabel="experience points"
            tone="azure"
          />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Need Practice"
            value={displayTopics.length}
            subLabel="topics to improve"
            tone="rose"
          />
          </div>
        </section>

        <section className="section-block reveal reveal-delay-2">
          <h2 className="section-title">Topics that need practice</h2>

          {dataLoading ? (
            <div className="topics-grid">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          ) : (
            <div className="topics-grid">
              {displayTopics.map((topic, i) => (
                <PracticeTopicCard
                  key={topic.topic}
                  topic={topic}
                  index={i}
                  onClick={() => navigate('/vocab/mistakes')}
                />
              ))}
            </div>
          )}
        </section>

        <section className="section-block reveal reveal-delay-3">
          <h2 className="section-title">Learning activities</h2>

          <div className="activities-grid">
            {activityDefs.map((act) => (
              <ActivityCard
                key={act.title}
                icon={act.icon}
                title={act.title}
                description={act.description}
                linkLabel={act.linkLabel}
                tone={act.tone}
                onClick={() => navigate(act.path)}
              />
            ))}
          </div>
        </section>
      </main>

      <button type="button" className="support-fab" title="Help">
        <HelpCircle size={20} />
      </button>
    </div>
  );
}
