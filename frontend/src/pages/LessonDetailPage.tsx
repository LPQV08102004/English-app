import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import Header from '../components/Header';
import { getLessonDetail } from '../services/api';
import type { LessonDetail, VocabPreview, DialogueLine } from '../types';

// ── Mock content keyed by lesson orderIndex ──────────────────────────────────

interface LessonContent {
  estimatedMinutes: number;
  skills: string;
  concepts: string[];
  vocab: VocabPreview[];
  dialogue: DialogueLine[];
}

const LESSON_CONTENT: Record<number, LessonContent> = {
  1: {
    estimatedMinutes: 15,
    skills: 'Listening, Speaking, Reading',
    concepts: [
      'Cách chào hỏi trong các tình huống khác nhau',
      'Sử dụng đại từ nhân xưng: I, You, He, She',
      'Cấu trúc câu: My name is..., I am from...',
      'Hỏi và trả lời về nghề nghiệp',
    ],
    vocab: [
      { word: 'Hello', ipa: '/həˈloʊ/', meaning: 'Xin chào', imageUrl: 'https://picsum.photos/seed/hello/300/200' },
      { word: 'Goodbye', ipa: '/ˌɡʊdˈbaɪ/', meaning: 'Tạm biệt', imageUrl: 'https://picsum.photos/seed/goodbye/300/200' },
      { word: 'Friend', ipa: '/frend/', meaning: 'Bạn bè', imageUrl: 'https://picsum.photos/seed/friend/300/200' },
      { word: 'Name', ipa: '/neɪm/', meaning: 'Tên', imageUrl: 'https://picsum.photos/seed/name/300/200' },
    ],
    dialogue: [
      { speaker: 'A', text: "Hello! My name is Sarah. What's your name?" },
      { speaker: 'B', text: "Hi Sarah! I'm David. Nice to meet you!" },
      { speaker: 'A', text: 'Nice to meet you too, David. Where are you from?' },
      { speaker: 'B', text: "I'm from New York. How about you?" },
      { speaker: 'A', text: "I'm from London. I'm a teacher. What do you do?" },
      { speaker: 'B', text: "I'm a student. I study English." },
    ],
  },
  2: {
    estimatedMinutes: 20,
    skills: 'Vocabulary, Reading',
    concepts: [
      'Từ vựng về đồ vật hàng ngày',
      'Mạo từ a, an, the',
      'Số đếm từ 1 đến 100',
      'Màu sắc và hình dạng cơ bản',
    ],
    vocab: [
      { word: 'Book', ipa: '/bʊk/', meaning: 'Sách', imageUrl: 'https://picsum.photos/seed/book/300/200' },
      { word: 'Table', ipa: '/ˈteɪbəl/', meaning: 'Bàn', imageUrl: 'https://picsum.photos/seed/table/300/200' },
      { word: 'Chair', ipa: '/tʃer/', meaning: 'Ghế', imageUrl: 'https://picsum.photos/seed/chair/300/200' },
      { word: 'Window', ipa: '/ˈwɪndoʊ/', meaning: 'Cửa sổ', imageUrl: 'https://picsum.photos/seed/window/300/200' },
    ],
    dialogue: [
      { speaker: 'A', text: 'What is this?' },
      { speaker: 'B', text: "It's a book." },
      { speaker: 'A', text: 'What colour is it?' },
      { speaker: 'B', text: "It's blue. I like blue books." },
    ],
  },
  3: {
    estimatedMinutes: 25,
    skills: 'Grammar, Writing, Speaking',
    concepts: [
      'Cấu trúc thì hiện tại đơn (Subject + V/Vs/Ves)',
      'Dạng phủ định với do not / does not',
      'Câu hỏi Yes/No với Do/Does',
      'Trạng từ tần suất: always, usually, often, sometimes',
    ],
    vocab: [
      { word: 'Always', ipa: '/ˈɔːlweɪz/', meaning: 'Luôn luôn', imageUrl: 'https://picsum.photos/seed/always/300/200' },
      { word: 'Usually', ipa: '/ˈjuːʒuəli/', meaning: 'Thường thường', imageUrl: 'https://picsum.photos/seed/usually/300/200' },
      { word: 'Sometimes', ipa: '/ˈsʌmtaɪmz/', meaning: 'Đôi khi', imageUrl: 'https://picsum.photos/seed/sometimes/300/200' },
      { word: 'Never', ipa: '/ˈnevər/', meaning: 'Không bao giờ', imageUrl: 'https://picsum.photos/seed/never/300/200' },
    ],
    dialogue: [
      { speaker: 'A', text: 'Do you drink coffee every morning?' },
      { speaker: 'B', text: 'Yes, I always drink coffee. How about you?' },
      { speaker: 'A', text: 'I never drink coffee. I usually drink tea.' },
      { speaker: 'B', text: 'Interesting! Does your family drink tea too?' },
      { speaker: 'A', text: 'My mother does, but my father sometimes drinks coffee.' },
    ],
  },
};

const DEFAULT_CONTENT: LessonContent = {
  estimatedMinutes: 20,
  skills: 'Listening, Speaking, Reading',
  concepts: [
    'Học từ vựng và cấu trúc câu mới',
    'Thực hành nghe và nói',
    'Luyện tập với bài tập tương tác',
    'Ôn tập và củng cố kiến thức',
  ],
  vocab: [
    { word: 'Learn', ipa: '/lɜːrn/', meaning: 'Học', imageUrl: 'https://picsum.photos/seed/learn/300/200' },
    { word: 'Practice', ipa: '/ˈpræktɪs/', meaning: 'Luyện tập', imageUrl: 'https://picsum.photos/seed/practice/300/200' },
    { word: 'Study', ipa: '/ˈstʌdi/', meaning: 'Nghiên cứu', imageUrl: 'https://picsum.photos/seed/study/300/200' },
    { word: 'Understand', ipa: '/ˌʌndərˈstænd/', meaning: 'Hiểu', imageUrl: 'https://picsum.photos/seed/understand/300/200' },
  ],
  dialogue: [
    { speaker: 'A', text: 'Are you ready to start the lesson?' },
    { speaker: 'B', text: "Yes, I'm ready. Let's begin!" },
    { speaker: 'A', text: 'Great! Pay attention and do your best.' },
    { speaker: 'B', text: 'I will. Thank you for teaching me.' },
  ],
};

// ── Level hero gradients ──────────────────────────────────────────────────────

const LEVEL_HERO: Record<string, string> = {
  A1: 'linear-gradient(140deg, #064e3b 0%, #065f46 40%, #0f172a 100%)',
  A2: 'linear-gradient(140deg, #164e63 0%, #155e75 40%, #0f172a 100%)',
  B1: 'linear-gradient(140deg, #1e3a8a 0%, #1d4ed8 40%, #0f172a 100%)',
  B2: 'linear-gradient(140deg, #312e81 0%, #4338ca 40%, #0f172a 100%)',
  C1: 'linear-gradient(140deg, #3b0764 0%, #6d28d9 40%, #0f172a 100%)',
  C2: 'linear-gradient(140deg, #831843 0%, #be185d 40%, #0f172a 100%)',
};

// ── Component ────────────────────────────────────────────────────────────────

export default function LessonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lessonId = Number(id);
    getLessonDetail(lessonId)
      .then(setLesson)
      .catch(() => {
        // Fallback: construct a mock lesson
        setLesson({
          id: lessonId,
          name: 'Greetings and Introductions',
          courseId: 1,
          courseName: 'English Basics',
          orderIndex: 1,
          exercises: [],
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const content = lesson
    ? (LESSON_CONTENT[lesson.orderIndex] ?? DEFAULT_CONTENT)
    : DEFAULT_CONTENT;

  // Derive level from courseName or default to B1
  const levelHint = lesson?.courseName?.match(/\b(A1|A2|B1|B2|C1|C2)\b/)?.[1] ?? 'B1';
  const heroGradient = LEVEL_HERO[levelHint];

  const handleStart = () => {
    navigate(`/lessons/${id}/quiz`);
  };

  const handleBack = () => {
    if (lesson?.courseId) navigate(`/courses/${lesson.courseId}`);
    else navigate(-1);
  };

  return (
    <div className="lesson-detail-page">
      <Header />

      <div className="lesson-detail-inner">
        {/* Back */}
        <button type="button" className="lesson-detail-back reveal" onClick={handleBack}>
          <ArrowLeft size={15} />
          Danh sách bài học
        </button>

        {/* Hero */}
        <div
          className="lesson-detail-hero reveal"
          style={{ background: heroGradient }}
        >
          <div className="lesson-detail-badge">
            {loading ? '…' : `${lesson?.courseName} · ${levelHint}`}
          </div>
          <h1 className="lesson-detail-title">
            {loading ? 'Đang tải…' : lesson?.name}
          </h1>

          <div className="lesson-detail-meta">
            <div className="lesson-detail-meta-item">
              <span className="lesson-detail-meta-icon">⏱</span>
              <div>
                <div className="lesson-detail-meta-label">Thời gian dự kiến</div>
                <div className="lesson-detail-meta-value">{content.estimatedMinutes} phút</div>
              </div>
            </div>
            <div className="lesson-detail-meta-item">
              <span className="lesson-detail-meta-icon">🎯</span>
              <div>
                <div className="lesson-detail-meta-label">Kỹ năng rèn luyện</div>
                <div className="lesson-detail-meta-value">{content.skills}</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="lesson-detail-start-btn"
            onClick={handleStart}
            disabled={loading}
          >
            START LESSON
          </button>
        </div>

        {/* Key Concepts */}
        <div className="lesson-detail-card reveal reveal-delay-1">
          <div className="lesson-detail-card-title">
            <span className="lesson-detail-card-emoji">💡</span>
            Nội dung chính (Key Concepts)
          </div>
          <div className="concept-list">
            {content.concepts.map((c, i) => (
              <div key={i} className="concept-item">
                <span className="concept-number">{i + 1}</span>
                <span className="concept-text">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vocabulary Preview */}
        <div className="lesson-detail-card reveal reveal-delay-2">
          <div className="lesson-detail-card-title">
            <span className="lesson-detail-card-emoji">📚</span>
            Từ vựng xem trước (Vocabulary Preview)
          </div>
          <div className="vocab-preview-grid">
            {content.vocab.map((v) => (
              <VocabCard key={v.word} vocab={v} />
            ))}
          </div>
        </div>

        {/* Sample Dialogue */}
        <div className="lesson-detail-card reveal reveal-delay-3">
          <div className="lesson-detail-card-title">
            <span className="lesson-detail-card-emoji">💬</span>
            Đoạn hội thoại mẫu (Sample Dialogue)
          </div>
          <div className="dialogue-list">
            {content.dialogue.map((line, i) => (
              <div key={i} className={`dialogue-row ${line.speaker === 'B' ? 'row-b' : ''}`}>
                <div className={`dialogue-avatar avatar-${line.speaker.toLowerCase()}`}>
                  {line.speaker}
                </div>
                <div className={`dialogue-bubble bubble-${line.speaker.toLowerCase()}`}>
                  {line.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="support-fab" type="button" title="Help">
        <HelpCircle size={20} />
      </button>
    </div>
  );
}

// ── VocabCard ────────────────────────────────────────────────────────────────

function VocabCard({ vocab }: { vocab: VocabPreview }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="vocab-preview-card">
      {imgError ? (
        <div className="vocab-preview-img-placeholder">
          {vocab.word[0].toUpperCase()}
        </div>
      ) : (
        <img
          className="vocab-preview-img"
          src={vocab.imageUrl}
          alt={vocab.word}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      )}
      <div className="vocab-preview-body">
        <div className="vocab-preview-word">{vocab.word}</div>
        <div className="vocab-preview-ipa">{vocab.ipa}</div>
        <div className="vocab-preview-meaning">{vocab.meaning}</div>
      </div>
    </div>
  );
}
