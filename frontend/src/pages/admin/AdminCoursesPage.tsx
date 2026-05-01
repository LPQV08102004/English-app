import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import Header from '../../components/Header';
import {
  adminGetCourses, adminCreateCourse, adminUpdateCourse, adminDeleteCourse,
} from '../../services/adminApi';
import type { CourseDetail } from '../../types';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export default function AdminCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CourseDetail | null>(null);
  const [form, setForm] = useState({ name: '', description: '', levelTarget: 'A1' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await adminGetCourses();
      setCourses(res.content);
    } catch { setCourses([]); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '', levelTarget: 'A1' });
    setError('');
    setShowForm(true);
  }

  function openEdit(c: CourseDetail) {
    setEditing(c);
    setForm({ name: c.name, description: c.description, levelTarget: c.levelTarget });
    setError('');
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Tên khoá học không được trống.'); return; }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const updated = await adminUpdateCourse(editing.id, form);
        setCourses((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...updated } : c));
      } else {
        await adminCreateCourse(form);
        await load();
      }
      setShowForm(false);
    } catch {
      setError('Lưu thất bại.');
    } finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm('Xoá khoá học này và tất cả bài học/câu hỏi bên trong?')) return;
    setDeletingId(id);
    try {
      await adminDeleteCourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch { alert('Xoá thất bại.'); }
    finally { setDeletingId(null); }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button type="button" onClick={() => navigate('/admin')} style={backBtnStyle}>
            <ArrowLeft size={15} /> Admin
          </button>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, flex: 1 }}>Khoá học</h1>
          <button type="button" onClick={openCreate} style={addBtnStyle}>
            <Plus size={16} /> Thêm khoá học
          </button>
        </div>

        {showForm && (
          <div style={formCardStyle}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
              {editing ? 'Sửa khoá học' : 'Thêm khoá học mới'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Tên khoá học *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              <input placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={inputStyle} />
              <select value={form.levelTarget} onChange={(e) => setForm({ ...form, levelTarget: e.target.value })} style={inputStyle}>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={handleSave} disabled={saving} style={addBtnStyle}>
                  {saving ? 'Đang lưu…' : 'Lưu'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={cancelBtnStyle}>Huỷ</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p style={{ color: 'var(--text-soft)', textAlign: 'center', padding: 40 }}>Đang tải…</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {courses.map((c) => (
              <div key={c.id} style={rowStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700 }}>{c.name}</span>
                    <span style={levelBadge(c.levelTarget)}>{c.levelTarget}</span>
                  </div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-soft)' }}>{c.description}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button type="button" onClick={() => navigate(`/admin/courses/${c.id}/lessons`)} style={iconBtnStyle('#60a5fa')} title="Quản lý bài học">
                    <ChevronRight size={16} />
                  </button>
                  <button type="button" onClick={() => openEdit(c)} style={iconBtnStyle('#a855f7')} title="Sửa">
                    <Pencil size={15} />
                  </button>
                  <button type="button" onClick={() => handleDelete(c.id)} disabled={deletingId === c.id} style={iconBtnStyle('#ef4444')} title="Xoá">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            {courses.length === 0 && <p style={{ color: 'var(--text-soft)', textAlign: 'center', padding: 40 }}>Chưa có khoá học nào.</p>}
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
const rowStyle: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 };
const levelBadge = (l: string): React.CSSProperties => ({ fontSize: '0.72rem', background: 'rgba(99,102,241,0.2)', color: '#818cf8', padding: '2px 8px', borderRadius: 20, fontWeight: 700 });
const iconBtnStyle = (color: string): React.CSSProperties => ({ background: 'rgba(255,255,255,0.06)', border: `1px solid ${color}33`, borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color, display: 'flex', alignItems: 'center' });
