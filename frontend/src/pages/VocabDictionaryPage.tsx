import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, BookmarkPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import { searchDictionary, getDictionaryByLevel, saveWord } from '../services/api';
import type { VocabEntry, PageResponse } from '../types';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function VocabDictionaryPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [result, setResult] = useState<PageResponse<VocabEntry> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [savingId, setSavingId] = useState<number | null>(null);

  const fetchData = useCallback(async (q: string, level: string | null, p: number) => {
    setLoading(true);
    try {
      let data: PageResponse<VocabEntry>;
      if (level) {
        data = await getDictionaryByLevel(level, p);
      } else if (q.trim()) {
        data = await searchDictionary(q.trim(), p);
      } else {
        data = await searchDictionary('', p);
      }
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(query, activeLevel, page);
  }, [fetchData, query, activeLevel, page]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setActiveLevel(null);
    setPage(0);
  }

  function handleLevelClick(level: string) {
    setActiveLevel(activeLevel === level ? null : level);
    setQuery('');
    setPage(0);
  }

  async function handleSave(entry: VocabEntry) {
    setSavingId(entry.id);
    try {
      await saveWord({ vocabularyId: entry.id });
      setSavedIds((prev) => new Set(prev).add(entry.id));
    } catch {
      // already saved or error — mark saved anyway for UX
      setSavedIds((prev) => new Set(prev).add(entry.id));
    } finally {
      setSavingId(null);
    }
  }

  const totalPages = result?.totalPages ?? 0;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 80px' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.87rem', fontWeight: 600, marginBottom: 24 }}
        >
          <ArrowLeft size={15} /> Quay lại
        </button>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Từ điển</h1>
        <p style={{ color: 'var(--text-soft)', fontSize: '0.9rem', marginBottom: 24 }}>
          Tra cứu từ vựng theo từ hoặc duyệt theo cấp độ CEFR
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm từ tiếng Anh hoặc nghĩa tiếng Việt..."
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-soft)', borderRadius: 10, color: 'var(--text-primary)', padding: '10px 14px', fontSize: '0.95rem' }}
          />
          <button type="submit" style={{ background: 'linear-gradient(135deg,#6d28d9,#a855f7)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={16} />
          </button>
        </form>

        {/* Level filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {LEVELS.map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => handleLevelClick(lv)}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                background: activeLevel === lv ? 'linear-gradient(135deg,#6d28d9,#a855f7)' : 'rgba(255,255,255,0.07)',
                border: activeLevel === lv ? 'none' : '1px solid var(--border-soft)',
                color: activeLevel === lv ? '#fff' : 'var(--text-muted)',
              }}
            >
              {lv}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-soft)', padding: 40 }}>Đang tải…</div>
        ) : result && result.content.length > 0 ? (
          <>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)', marginBottom: 14 }}>
              {result.totalElements} từ · trang {result.number + 1}/{totalPages}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {result.content.map((entry) => (
                <VocabCard
                  key={entry.id}
                  entry={entry}
                  saved={savedIds.has(entry.id)}
                  saving={savingId === entry.id}
                  onSave={() => handleSave(entry)}
                />
              ))}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 28, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={pageBtnStyle(page === 0)}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {page + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  style={pageBtnStyle(page >= totalPages - 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : !loading && (
          <div style={{ textAlign: 'center', color: 'var(--text-soft)', padding: 40 }}>
            {query || activeLevel ? 'Không tìm thấy kết quả.' : 'Nhập từ cần tìm hoặc chọn cấp độ.'}
          </div>
        )}
      </div>
    </div>
  );
}

function VocabCard({ entry, saved, saving, onSave }: {
  entry: VocabEntry;
  saved: boolean;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
      borderRadius: 14, padding: '16px 20px',
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{entry.word}</span>
          {entry.ipa && <span style={{ fontSize: '0.82rem', color: 'var(--text-soft)' }}>{entry.ipa}</span>}
          {entry.partOfSpeech && (
            <span style={{ fontSize: '0.75rem', background: 'rgba(168,85,247,0.2)', color: '#c084fc', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
              {entry.partOfSpeech}
            </span>
          )}
          {entry.level && (
            <span style={{ fontSize: '0.75rem', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
              {entry.level}
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: entry.example ? 6 : 0 }}>
          {entry.meaning}
        </div>
        {entry.example && (
          <div style={{ fontSize: '0.83rem', color: 'var(--text-soft)', fontStyle: 'italic' }}>
            "{entry.example}"
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onSave}
        disabled={saved || saving}
        title={saved ? 'Đã lưu' : 'Lưu từ này'}
        style={{
          background: saved ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.07)',
          border: '1px solid ' + (saved ? 'rgba(16,185,129,0.4)' : 'var(--border-soft)'),
          borderRadius: 8, padding: '7px 10px', cursor: saved ? 'default' : 'pointer',
          color: saved ? '#10b981' : 'var(--text-soft)', flexShrink: 0,
        }}
      >
        <BookmarkPlus size={16} />
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
    opacity: disabled ? 0.4 : 1,
    display: 'flex', alignItems: 'center',
  };
}
