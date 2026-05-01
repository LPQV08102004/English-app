import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import { getSavedWords, deleteSavedWord } from '../services/api';
import type { VocabSaved, PageResponse } from '../types';

export default function SavedWordsPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<PageResponse<VocabSaved> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    getSavedWords(page)
      .then(setResult)
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [page]);

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      await deleteSavedWord(id);
      setResult((prev) =>
        prev
          ? { ...prev, content: prev.content.filter((w) => w.id !== id), totalElements: prev.totalElements - 1 }
          : prev,
      );
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Từ đã lưu</h1>
          {result && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>
              {result.totalElements} từ
            </span>
          )}
        </div>
        <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', marginBottom: 28 }}>
          Danh sách các từ bạn đã đánh dấu để ôn luyện
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-soft)', padding: 40 }}>Đang tải…</div>
        ) : result && result.content.length > 0 ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.content.map((item) => (
                <SavedCard key={item.id} item={item} deleting={deletingId === item.id} onDelete={() => handleDelete(item.id)} />
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
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📚</div>
            <p style={{ color: 'var(--text-soft)' }}>Bạn chưa lưu từ nào.<br />Hãy vào Từ điển để lưu từ mới!</p>
            <button
              type="button"
              onClick={() => navigate('/vocab/dictionary')}
              style={{ marginTop: 20, background: 'linear-gradient(135deg,#6d28d9,#a855f7)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 700, cursor: 'pointer' }}
            >
              Mở từ điển
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SavedCard({ item, deleting, onDelete }: {
  item: VocabSaved;
  deleting: boolean;
  onDelete: () => void;
}) {
  const date = new Date(item.createdAt).toLocaleDateString('vi-VN');
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
      borderRadius: 14, padding: '14px 18px',
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 2 }}>{item.word}</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: item.note ? 4 : 0 }}>{item.meaning}</div>
        {item.note && <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)', fontStyle: 'italic' }}>Ghi chú: {item.note}</div>}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: 6 }}>Đã lưu: {date}</div>
      </div>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: '#f87171', flexShrink: 0,
          opacity: deleting ? 0.5 : 1,
        }}
      >
        <Trash2 size={15} />
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
