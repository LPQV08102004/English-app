import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import { getMistakes, markMistakeReviewed } from '../services/api';
import type { MistakeReview, PageResponse } from '../types';

export default function MistakeReviewPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<PageResponse<MistakeReview> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLoading(true);
    getMistakes(page)
      .then(setResult)
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [page]);

  async function handleMarkReviewed(id: number) {
    setReviewingId(id);
    try {
      await markMistakeReviewed(id);
      setReviewedIds((prev) => new Set(prev).add(id));
    } catch {
      // ignore
    } finally {
      setReviewingId(null);
    }
  }

  const totalPages = result?.totalPages ?? 0;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 80px' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.87rem', fontWeight: 600, marginBottom: 24 }}
        >
          <ArrowLeft size={15} /> Quay lại
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Ôn luyện lỗi sai</h1>
          {result && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>
              {result.totalElements} từ
            </span>
          )}
        </div>
        <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', marginBottom: 28 }}>
          Những từ bạn hay trả lời sai — hãy ôn lại để củng cố
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-soft)', padding: 40 }}>Đang tải…</div>
        ) : result && result.content.length > 0 ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {result.content.map((item) => (
                <MistakeCard
                  key={item.vocabularyId}
                  item={item}
                  reviewed={reviewedIds.has(item.vocabularyId)}
                  reviewing={reviewingId === item.vocabularyId}
                  onMarkReviewed={() => handleMarkReviewed(item.vocabularyId)}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 28, alignItems: 'center' }}>
                <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} style={pageBtnStyle(page === 0)}>
                  <ChevronLeft size={16} />
                </button>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{page + 1} / {totalPages}</span>
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={pageBtnStyle(page >= totalPages - 1)}>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎯</div>
            <p style={{ color: 'var(--text-soft)' }}>Tuyệt vời! Bạn chưa có lỗi sai nào cần ôn luyện.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MistakeCard({ item, reviewed, reviewing, onMarkReviewed }: {
  item: MistakeReview;
  reviewed: boolean;
  reviewing: boolean;
  onMarkReviewed: () => void;
}) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
      borderRadius: 14, padding: '16px 20px',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      opacity: reviewed ? 0.55 : 1,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>{item.word}</span>
          {item.ipa && <span style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>{item.ipa}</span>}
          {item.level && (
            <span style={{ fontSize: '0.75rem', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
              {item.level}
            </span>
          )}
          <span style={{ fontSize: '0.75rem', background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
            {item.mistakeCount}× sai
          </span>
        </div>
        <div style={{ fontSize: '0.93rem', color: 'var(--text-muted)', marginBottom: item.topic ? 4 : 0 }}>
          {item.meaning}
        </div>
        {item.topic && <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>Chủ đề: {item.topic}</div>}
      </div>
      <button
        type="button"
        onClick={onMarkReviewed}
        disabled={reviewed || reviewing}
        title={reviewed ? 'Đã ôn xong' : 'Đánh dấu đã ôn'}
        style={{
          background: reviewed ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)',
          border: '1px solid ' + (reviewed ? 'rgba(16,185,129,0.4)' : 'var(--border-soft)'),
          borderRadius: 8, padding: '7px 10px', cursor: reviewed ? 'default' : 'pointer',
          color: reviewed ? '#10b981' : 'var(--text-soft)', flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem',
        }}
      >
        <CheckCircle size={15} />
        {!reviewed && <span>Đã ôn</span>}
      </button>
    </div>
  );
}

function pageBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)',
    border: '1px solid var(--border-soft)', borderRadius: 8,
    padding: '7px 10px', cursor: disabled ? 'default' : 'pointer',
    color: disabled ? 'var(--text-soft)' : 'var(--text-primary)',
    opacity: disabled ? 0.4 : 1, display: 'flex', alignItems: 'center',
  };
}
