import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../../components/Header';
import { adminGetVocab, adminCreateVocab, adminUpdateVocab, adminDeleteVocab } from '../../services/adminApi';
import type { AdminVocab } from '../../services/adminApi';
import type { PageResponse } from '../../types';

const LEVELS = ['', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const EMPTY: Partial<AdminVocab> = { word: '', meaning: '', ipa: '', partOfSpeech: '', topic: '', level: 'A1', example: '', audioUrl: '' };

export default function AdminVocabPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<PageResponse<AdminVocab> | null>(null);
  const [page, setPage] = useState(0);
  const [filterLevel, setFilterLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminVocab | null>(null);
  const [form, setForm] = useState<Partial<AdminVocab>>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setResult(await adminGetVocab({ level: filterLevel || undefined, page })); }
    catch { setResult(null); }
    finally { setLoading(false); }
  }, [filterLevel, page]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY });
    setError('');
    setShowForm(true);
  }

  function openEdit(v: AdminVocab) {
    setEditing(v);
    setForm({ ...v });
    setError('');
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.word?.trim() || !form.meaning?.trim()) { setError('Từ và nghĩa không được trống.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const updated = await adminUpdateVocab(editing.id, form);
        setResult((prev) => prev ? { ...prev, content: prev.content.map((v) => v.id === editing.id ? updated : v) } : prev);
      } else {
        await adminCreateVocab(form as AdminVocab & { word: string; meaning: string });
        await load();
      }
      setShowForm(false);
    } catch { setError('Lưu thất bại.'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm('Xoá từ vựng này?')) return;
    setDeletingId(id);
    try {
      await adminDeleteVocab(id);
      setResult((prev) => prev ? { ...prev, content: prev.content.filter((v) => v.id !== id), totalElements: prev.totalElements - 1 } : prev);
    } catch { alert('Xoá thất bại.'); }
    finally { setDeletingId(null); }
  }

  const totalPages = result?.totalPages ?? 0;
  const f = (k: keyof AdminVocab) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button type="button" onClick={() => navigate('/admin')} style={backBtnStyle}><ArrowLeft size={15} /> Admin</button>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, flex: 1 }}>Từ vựng</h1>
          <select value={filterLevel} onChange={(e) => { setFilterLevel(e.target.value); setPage(0); }} style={{ ...inputStyle, width: 100 }}>
            {LEVELS.map((l) => <option key={l} value={l}>{l || 'Tất cả'}</option>)}
          </select>
          <button type="button" onClick={openCreate} style={addBtnStyle}><Plus size={16} /> Thêm từ</button>
        </div>

        {showForm && (
          <div style={formCardStyle}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>{editing ? 'Sửa từ vựng' : 'Thêm từ mới'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input placeholder="Từ *" value={form.word ?? ''} onChange={f('word')} style={inputStyle} />
              <input placeholder="Nghĩa *" value={form.meaning ?? ''} onChange={f('meaning')} style={inputStyle} />
              <input placeholder="IPA" value={form.ipa ?? ''} onChange={f('ipa')} style={inputStyle} />
              <input placeholder="Từ loại (noun, verb...)" value={form.partOfSpeech ?? ''} onChange={f('partOfSpeech')} style={inputStyle} />
              <input placeholder="Chủ đề" value={form.topic ?? ''} onChange={f('topic')} style={inputStyle} />
              <select value={form.level ?? 'A1'} onChange={f('level')} style={inputStyle}>
                {['A1','A2','B1','B2','C1','C2'].map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <input placeholder="Ví dụ" value={form.example ?? ''} onChange={f('example')} style={{ ...inputStyle, gridColumn: '1 / -1' }} />
              <input placeholder="URL âm thanh" value={form.audioUrl ?? ''} onChange={f('audioUrl')} style={{ ...inputStyle, gridColumn: '1 / -1' }} />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: '8px 0 0' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button type="button" onClick={handleSave} disabled={saving} style={addBtnStyle}>{saving ? 'Đang lưu…' : 'Lưu'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={cancelBtnStyle}>Huỷ</button>
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--text-soft)', textAlign: 'center', padding: 40 }}>Đang tải…</p>
        ) : (
          <>
            {result && <div style={{ fontSize: '0.82rem', color: 'var(--text-soft)', marginBottom: 12 }}>{result.totalElements} từ</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result?.content.map((v) => (
                <div key={v.id} style={rowStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                      <span style={{ fontWeight: 700 }}>{v.word}</span>
                      {v.ipa && <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>{v.ipa}</span>}
                      {v.level && <span style={levelBadge}>{v.level}</span>}
                      {v.partOfSpeech && <span style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>{v.partOfSpeech}</span>}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{v.meaning}</div>
                    {v.topic && <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: 2 }}>#{v.topic}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => openEdit(v)} style={iconBtnStyle('#a855f7')}><Pencil size={15} /></button>
                    <button type="button" onClick={() => handleDelete(v.id)} disabled={deletingId === v.id} style={iconBtnStyle('#ef4444')}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
              {(!result || result.content.length === 0) && <p style={{ color: 'var(--text-soft)', textAlign: 'center', padding: 40 }}>Không có từ vựng.</p>}
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24, alignItems: 'center' }}>
                <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} style={pageBtnStyle(page === 0)}><ChevronLeft size={16} /></button>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{page + 1} / {totalPages}</span>
                <button type="button" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={pageBtnStyle(page >= totalPages - 1)}><ChevronRight size={16} /></button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const backBtnStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.87rem', fontWeight: 600 };
const addBtnStyle: React.CSSProperties = { background: 'linear-gradient(135deg,#6d28d9,#a855f7)', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 };
const cancelBtnStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.07)', color: 'var(--text-muted)', border: '1px solid var(--border-soft)', borderRadius: 10, padding: '9px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' };
const inputStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-soft)', borderRadius: 10, color: 'var(--text-primary)', padding: '9px 14px', fontSize: '0.9rem', width: '100%' };
const formCardStyle: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 16, padding: '20px 24px', marginBottom: 20 };
const rowStyle: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 };
const iconBtnStyle = (color: string): React.CSSProperties => ({ background: 'rgba(255,255,255,0.06)', border: `1px solid ${color}33`, borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color, display: 'flex', alignItems: 'center' });
const levelBadge: React.CSSProperties = { fontSize: '0.72rem', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: 20, fontWeight: 700 };
const pageBtnStyle = (disabled: boolean): React.CSSProperties => ({ background: disabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '7px 10px', cursor: disabled ? 'default' : 'pointer', color: disabled ? 'var(--text-soft)' : 'var(--text-primary)', opacity: disabled ? 0.4 : 1, display: 'flex', alignItems: 'center' });
