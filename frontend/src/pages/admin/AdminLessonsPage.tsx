import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import Header from '../../components/Header';
import {
  adminGetLessons, adminCreateLesson, adminUpdateLesson, adminDeleteLesson,
} from '../../services/adminApi';

interface LessonRow {
  id: number;
  name: string;
  courseId: number;
  courseName: string;
  orderIndex: number;
}

export default function AdminLessonsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const cId = Number(courseId);

  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [courseName, setCourseName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LessonRow | null>(null);
  const [form, setForm] = useState({ name: '', orderIndex: 1 });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, [cId]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminGetLessons(cId);
      setLessons(res.content);
      if (res.content[0]) setCourseName(res.content[0].courseName);
    } catch { setLessons([]); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    const nextOrder = lessons.length > 0 ? Math.max(...lessons.map((l) => l.orderIndex)) + 1 : 1;
    setForm({ name: '', orderIndex: nextOrder });
    setError('');
    setShowForm(true);
  }

  function openEdit(l: LessonRow) {
    setEditing(l);
    setForm({ name: l.name, orderIndex: l.orderIndex });
    setError('');
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Tên bài học không được trống.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await adminUpdateLesson(editing.id, { courseId: cId, name: form.name, orderIndex: form.orderIndex });
      } else {
        await adminCreateLesson({ courseId: cId, name: form.name, orderIndex: form.orderIndex });
      }
      await load();
      setShowForm(false);
    } catch { setError('Lưu thất bại.'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm('Xoá bài học và tất cả câu hỏi bên trong?')) return;
    setDeletingId(id);
    try {
      await adminDeleteLesson(id);
      setLessons((prev) => prev.filter((l) => l.id !== id));
    } catch { alert('Xoá thất bại.'); }
    finally { setDeletingId(null); }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button type="button" onClick={() => navigate('/admin/courses')} style={backBtnStyle}>
            <ArrowLeft size={15} /> Khoá học
          </button>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, flex: 1 }}>
            Bài học{courseName ? ` — ${courseName}` : ''}
          </h1>
          <button type="button" onClick={openCreate} style={addBtnStyle}>
            <Plus size={16} /> Thêm bài học
          </button>
        </div>

        {showForm && (
          <div style={formCardStyle}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
              {editing ? 'Sửa bài học' : 'Thêm bài học mới'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Tên bài học *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              <input type="number" placeholder="Thứ tự" value={form.orderIndex} min={1} onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })} style={inputStyle} />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lessons.map((l) => (
              <div key={l.id} style={rowStyle}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                  {l.orderIndex}
                </div>
                <div style={{ flex: 1, fontWeight: 600 }}>{l.name}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => navigate(`/admin/lessons/${l.id}/exercises`)} style={iconBtnStyle('#60a5fa')} title="Câu hỏi">
                    <ChevronRight size={16} />
                  </button>
                  <button type="button" onClick={() => openEdit(l)} style={iconBtnStyle('#a855f7')} title="Sửa">
                    <Pencil size={15} />
                  </button>
                  <button type="button" onClick={() => handleDelete(l.id)} disabled={deletingId === l.id} style={iconBtnStyle('#ef4444')} title="Xoá">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            {lessons.length === 0 && <p style={{ color: 'var(--text-soft)', textAlign: 'center', padding: 40 }}>Chưa có bài học nào.</p>}
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
const rowStyle: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12 };
const iconBtnStyle = (color: string): React.CSSProperties => ({ background: 'rgba(255,255,255,0.06)', border: `1px solid ${color}33`, borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color, display: 'flex', alignItems: 'center' });
