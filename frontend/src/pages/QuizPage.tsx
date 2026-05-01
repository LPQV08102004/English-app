import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { getLessonDetail, submitExercise, restartLesson, logEvent } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { ExercisePreview } from '../types';

function normalise(s: string) {
  return s.trim().toLowerCase().replace(/[.,!?]+$/, '');
}

function IconX() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="#ef4444" strokeWidth="1.8" />
      <path d="M6.5 6.5l7 7M13.5 6.5l-7 7" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="#10b981" strokeWidth="1.8" />
      <path d="M6 10l3 3 5-5" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type QuizState = 'loading' | 'playing' | 'lesson_failed' | 'lesson_completed' | 'error';

export default function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, login, token } = useAuth();

  const lessonId = Number(id);

  const [quizState, setQuizState] = useState<QuizState>('loading');
  const [exercises, setExercises] = useState<ExercisePreview[]>([]);
  const [lessonName, setLessonName] = useState('');
  const [courseId, setCourseId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Per-question state
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [lastXp, setLastXp] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  // Streak + burst
  const [streak, setStreak] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const [burstVisible, setBurstVisible] = useState(false);

  // End-of-session stats
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const loggedStart = useRef(false);

  useEffect(() => {
    if (!lessonId) return;
    getLessonDetail(lessonId)
      .then((lesson) => {
        setExercises(lesson.exercises);
        setLessonName(lesson.name);
        setCourseId(lesson.courseId);
        if (lesson.exercises.length === 0) {
          setErrorMsg('Bài học này chưa có câu hỏi nào.');
          setQuizState('error');
        } else {
          setQuizState('playing');
          if (!loggedStart.current) {
            loggedStart.current = true;
            logEvent('START_LESSON', { lessonId }).catch(() => {});
          }
        }
      })
      .catch(() => {
        setErrorMsg('Không thể tải bài học. Vui lòng thử lại.');
        setQuizState('error');
      });
  }, [lessonId]);

  const q = exercises[idx];
  const total = exercises.length;
  const isFill = q?.type === 'FILL_IN_THE_BLANK';
  const progressPct = total > 0 ? Math.round(((idx + (submitted ? 1 : 0)) / total) * 100) : 0;
  const isLast = idx === total - 1;

  async function handleSubmit(answer: string) {
    if (submitted || !q) return;
    try {
      const res = await submitExercise(lessonId, q.id, answer);
      setSubmitted(true);
      setLastCorrect(res.correct);
      setLastXp(res.xpEarned + res.bonusXp);
      setWrongAttempts(res.wrongAttempts);

      const newStreak = res.correct ? streak + 1 : 0;
      setStreak(newStreak);
      if (res.correct) {
        setCorrectCount((c) => c + 1);
        setTotalXpEarned((x) => x + res.xpEarned + res.bonusXp);
        logEvent('ANSWER_CORRECT', { lessonId, exerciseId: q.id }).catch(() => {});
      } else {
        logEvent('ANSWER_WRONG', { lessonId, exerciseId: q.id }).catch(() => {});
      }
      if (newStreak >= 3) {
        setBurstKey((k) => k + 1);
        setBurstVisible(true);
        setTimeout(() => setBurstVisible(false), 2600);
      }

      // Refresh user XP from profile after backend updates it
      if (res.correct && res.xpEarned > 0 && user && token) {
        import('../services/api').then(({ getProfile }) => {
          getProfile().then((updated) => login(token, updated)).catch(() => {});
        });
      }

      if (res.lessonFailed) {
        logEvent('FINISH_LESSON', { lessonId, result: 'failed' }).catch(() => {});
        setQuizState('lesson_failed');
      } else if (res.lessonCompleted) {
        logEvent('FINISH_LESSON', { lessonId, result: 'completed' }).catch(() => {});
        setQuizState('lesson_completed');
      }
    } catch {
      setErrorMsg('Lỗi khi nộp bài. Vui lòng thử lại.');
    }
  }

  function handleSelectOption(opt: string) {
    if (submitted) return;
    setSelected(opt);
    handleSubmit(opt);
  }

  function handleSubmitFill() {
    if (!typed.trim() || submitted) return;
    handleSubmit(typed);
  }

  function handleNext() {
    if (isLast) return;
    setIdx((i) => i + 1);
    setSelected(null);
    setTyped('');
    setSubmitted(false);
    setLastCorrect(null);
    setLastXp(0);
  }

  async function handleRestart() {
    try {
      await restartLesson(lessonId);
      setIdx(0);
      setSelected(null);
      setTyped('');
      setSubmitted(false);
      setLastCorrect(null);
      setLastXp(0);
      setStreak(0);
      setWrongAttempts(0);
      setCorrectCount(0);
      setTotalXpEarned(0);
      setQuizState('playing');
      loggedStart.current = false;
      logEvent('START_LESSON', { lessonId, restart: true }).catch(() => {});
      loggedStart.current = true;
    } catch {
      setErrorMsg('Không thể khởi động lại bài học.');
    }
  }

  if (quizState === 'loading') {
    return (
      <div className="quiz-page">
        <Header />
        <div className="quiz-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <p style={{ color: 'var(--text-soft)' }}>Đang tải bài học…</p>
        </div>
      </div>
    );
  }

  if (quizState === 'error') {
    return (
      <div className="quiz-page">
        <Header />
        <div className="quiz-inner">
          <div className="quiz-result-card reveal">
            <div className="quiz-result-emoji">😕</div>
            <h2 className="quiz-result-title">Không thể tải bài học</h2>
            <p className="quiz-result-message">{errorMsg}</p>
            <div className="quiz-result-btns">
              <button className="quiz-btn-home" onClick={() => navigate(-1)}>Quay lại</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === 'lesson_failed') {
    return (
      <div className="quiz-page">
        <Header />
        <div className="quiz-inner">
          <div className="quiz-result-card reveal">
            <div className="quiz-result-emoji">💔</div>
            <h2 className="quiz-result-title">Bài học thất bại</h2>
            <p className="quiz-result-message">
              Bạn đã mắc quá nhiều lỗi trong bài <strong>{lessonName}</strong>.<br />
              Hãy ôn lại và thử lại nhé!
            </p>
            <div className="quiz-result-btns">
              <button className="quiz-btn-retry" onClick={handleRestart}>Thử lại</button>
              {courseId && (
                <button className="quiz-btn-home" onClick={() => navigate(`/courses/${courseId}`)}>
                  Quay về khoá học
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === 'lesson_completed') {
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    return (
      <div className="quiz-page">
        <Header />
        <div className="quiz-inner">
          <div className="quiz-result-card reveal">
            <div className="quiz-result-emoji">🎉</div>
            <h2 className="quiz-result-title">Hoàn thành bài học!</h2>
            <div
              className="quiz-score-ring"
              style={{
                background: `conic-gradient(#a855f7 0%, #ec4899 ${pct}%, rgba(109,77,168,0.22) ${pct}%)`,
              }}
            >
              <span className="quiz-score-pct">{pct}%</span>
              <span className="quiz-score-label">{correctCount}/{total} đúng</span>
            </div>
            {totalXpEarned > 0 && (
              <p className="quiz-result-message" style={{ color: '#a855f7', fontWeight: 700 }}>
                +{totalXpEarned} XP earned!
              </p>
            )}
            <p className="quiz-result-message">
              {pct >= 80
                ? 'Xuất sắc! Bạn đã nắm vững nội dung bài học này.'
                : 'Hoàn thành tốt! Hãy ôn lại để củng cố thêm.'}
            </p>
            <div className="quiz-result-btns">
              {courseId && (
                <button className="quiz-btn-home" onClick={() => navigate(`/courses/${courseId}`)}>
                  Bài tiếp theo
                </button>
              )}
              <button className="quiz-btn-home" onClick={() => navigate('/')}>Về trang chủ</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!q) return null;

  const answeredCorrectly = submitted && lastCorrect === true;
  const answeredWrong = submitted && lastCorrect === false;

  return (
    <div className="quiz-page">
      <Header />

      {burstVisible && (
        <div className="streak-burst" key={burstKey}>
          <span>🔥</span>
          <span className="streak-burst-text">{streak} Streak!</span>
          <span>🔥</span>
        </div>
      )}

      <div className="quiz-inner">
        {/* Progress */}
        <div className="quiz-progress-row">
          <span className="quiz-progress-label">
            Câu <b>{idx + 1}</b> / {total}
          </span>
          <span className="quiz-progress-pct">{progressPct}% Hoàn thành</span>
        </div>
        <div className="quiz-progress-track">
          <div className="quiz-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>

        {streak >= 3 && (
          <div className="quiz-streak-bar">🔥 {streak} câu liên tiếp!</div>
        )}

        {wrongAttempts > 0 && wrongAttempts < 3 && (
          <div style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.85rem', marginBottom: 8 }}>
            ⚠️ {wrongAttempts}/3 lỗi — còn {3 - wrongAttempts} lần trước khi bài học thất bại
          </div>
        )}

        <div className={`quiz-card${streak >= 3 ? ' quiz-card--streak' : ''} reveal`}>
          <span className="quiz-type-badge">
            {isFill ? 'Điền vào chỗ trống' : 'Trắc nghiệm'}
          </span>

          <p className="quiz-question">{q.question}</p>

          {!isFill && q.options && (
            <div className="quiz-options">
              {q.options.map((opt) => {
                let cls = 'quiz-option';
                if (submitted) {
                  if (opt === selected && !answeredCorrectly) cls += ' quiz-option--wrong';
                  else if (opt === selected && answeredCorrectly) cls += ' quiz-option--correct';
                }
                return (
                  <button
                    key={opt}
                    className={cls}
                    onClick={() => handleSelectOption(opt)}
                    disabled={submitted}
                  >
                    <span className="quiz-option-icon">
                      {submitted && opt === selected && !answeredCorrectly && <IconX />}
                      {submitted && opt === selected && answeredCorrectly && <IconCheck />}
                      {(!submitted || opt !== selected) && <span className="quiz-radio-ring" />}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {isFill && (
            <input
              className={`quiz-fill-input${answeredCorrectly ? ' quiz-fill-input--correct' : ''}${answeredWrong ? ' quiz-fill-input--wrong' : ''}`}
              type="text"
              placeholder="Nhập câu trả lời..."
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitFill()}
              disabled={submitted}
              autoFocus
            />
          )}

          {submitted && (
            <div className="quiz-feedback">
              <div className="quiz-feedback-result">
                <span className="quiz-feedback-icon">{answeredCorrectly ? '✓' : '✗'}</span>
                <span>
                  {answeredCorrectly
                    ? `Đúng rồi!${lastXp > 0 ? ` +${lastXp} XP` : ''}`
                    : 'Sai rồi! Hãy tiếp tục cố gắng.'}
                </span>
              </div>
            </div>
          )}

          <div className="quiz-nav">
            {isFill && !submitted ? (
              <button
                className="quiz-btn-next"
                onClick={handleSubmitFill}
                disabled={!typed.trim()}
              >
                Nộp câu trả lời
              </button>
            ) : submitted && !isLast ? (
              <button className="quiz-btn-next" onClick={handleNext}>
                Câu tiếp theo
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
