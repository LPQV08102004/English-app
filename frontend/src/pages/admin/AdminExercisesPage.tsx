import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import Header from '../../components/Header';
import {
  adminGetExercises, adminCreateExercise, adminUpdateExercise, adminDeleteExercise,
} from '../../services/adminApi';
import type { AdminExercise } from '../../services/adminApi';

const EMPTY_FORM = {
  question: '', type: 'MULTIPLE_CHOICE' as 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK',
  correctAnswer: '', optionsRaw: '', vocabularyId: '',
};

export default function AdminExercisesPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const lId = Number(lessonId);

  const [exercises, setExercises] = useState<AdminExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminExercise | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, [lId]);

  async function load() {
    setLoading(true);
    try { setExercises(await adminGetExercises(lId)); }
    catch { setExercises([]); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setError('');
    setShowForm(true);
  }

  function openEdit(ex: AdminExercise) {
    setEditing(ex);
    setForm({
      question: ex.question, type: ex.type,
      correctAnswer: ex.correctAnswer,
      optionsRaw: (ex.options ?? []).join('\n'),
      vocabularyId: ex.vocabularyId?.toString() ?? '',
    });
    setError('');
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.question.trim() || !form.correctAnswer.trim()) {
      setError('Câu hỏi và đáp án đúng không được trống.');
      return;
    }
    const options = form.type === 'MULTIPLE_CHOICE'
      ? form.optionsRaw.split('\n').map((s) => s.trim()).filter(Boolean)
      : null;
    if (form.type === 'MULTIPLE_CHOICE' && (!options || options.length < 2)) {
      setError('Cần ít nhất 2 lựa chọn cho câu trắc nghiệm.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body = {
        lessonId: lId, question: form.question, type: form.type,
        options, correctAnswer: form.correctAnswer,
        vocabularyId: form.vocabularyId ? Number(form.vocabularyId) : null,
      };
      if (editing) {
        const updated = await adminUpdateExercise(editing.id, body);
        setExercises((prev) => prev.map((e) => e.id === editing.id ? updated : e));
      } else {
        const created = await adminCreateExercise(body);
        setExercises((prev) => [...prev, created]);
      }
      setShowForm(false);
    } catch { setError('Lưu thất bại.'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm('Xoá câu hỏi này?')) return;
    setDeletingId(id);
    try {
      await adminDeleteExercise(id);
      setExercises((prev) => prev.filter((e) => e.id !== id));
    } catch { alert('Xoá thất bại.'); }
    finally { setDeletingId(null); }
  }

  const lessonName = exercises[0]?.lessonName ?? `Lesson #${lId}`;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button type="button" onClick={() => navigate(-1)} style={backBtnStyle}>
            <ArrowLeft size={15} /> Bài học
          </button>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, flex: 1 }}>
            Câu hỏi — {lessonName}
          </h1>
          <button type="button" onClick={openCreate} style={addBtnStyle}>
            <Plus size={16} /> Thêm câu hỏi
          </button>
        </div>

        {showForm && (
          <div style={formCardStyle}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
              {editing ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })} style={inputStyle}>
                <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                <option value="FILL_IN_THE_BLANK">Điền vào chỗ trống</option>
              </select>
              <textarea placeholder="Câu hỏi *" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
              {form.type === 'MULTIPLE_CHOICE' && (
                <textarea
                  placeholder="Các lựa chọn (mỗi dòng 1 lựa chọn, tối thiểu 2) *"
                  value={form.optionsRaw}
                  onChange={(e) => setForm({ ...form, optionsRaw: e.target.value })}
                  style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                />
              )}
              <input placeholder="Đáp án đúng *" value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })} style={inputStyle} />
              <input placeholder="ID từ vựng liên kết (tuỳ chọn)" value={form.vocabularyId} onChange={(e) => setForm({ ...form, vocabularyId: e.target.value })} style={inputStyle} type="number" />
              {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={handleSave} disabled={saving} style={addBtnStyle}>{saving ? 'Đang lưu…' : 'Lưu'}</button>
                <button type="button" onClick={() => setShowForm(false)} style={cancelBtnStyle}>Huỷ</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--text-soft)', textAlign: 'center', padding: 40 }}>Đang tải…</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {exercises.map((ex, i) => (
              <div key={ex.id} style={rowStyle}>
                <div style={{ width: 28, color: 'var(--text-soft)', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0 }}>#{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={typeBadge(ex.type)}>{ex.type === 'MULTIPLE_CHOICE' ? 'Trắc nghiệm' : 'Điền vào chỗ trống'}</span>
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{ex.question}</div>
                  {ex.options && <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)' }}>Lựa chọn: {ex.options.join(' / ')}</div>}
                  <div style={{ fontSize: '0.82rem', color: '#10b981', marginTop: 2 }}>✓ {ex.correctAnswer}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => openEdit(ex)} style={iconBtnStyle('#a855f7')}><Pencil size={15} /></button>
                  <button type="button" onClick={() => handleDelete(ex.id)} disabled={deletingId === ex.id} style={iconBtnStyle('#ef4444')}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
            {exercises.length === 0 && <p style={{ color: 'var(--text-soft)', textAlign: 'center', padding: 40 }}>Chưa có câu hỏi nào.</p>}
          </div>
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
const rowStyle: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 };
const iconBtnStyle = (color: string): React.CSSProperties => ({ background: 'rgba(255,255,255,0.06)', border: `1px solid ${color}33`, borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color, display: 'flex', alignItems: 'center' });
const typeBadge = (t: string): React.CSSProperties => ({ fontSize: '0.72rem', background: t === 'MULTIPLE_CHOICE' ? 'rgba(99,102,241,0.2)' : 'rgba(8,145,178,0.2)', color: t === 'MULTIPLE_CHOICE' ? '#818cf8' : '#38bdf8', padding: '2px 8px', borderRadius: 20, fontWeight: 700 });
