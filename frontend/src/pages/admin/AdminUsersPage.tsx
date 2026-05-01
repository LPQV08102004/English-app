import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../../components/Header';
import { adminGetUsers, adminDeleteUser } from '../../services/adminApi';
import type { AdminUser } from '../../services/adminApi';
import type { PageResponse } from '../../types';

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<PageResponse<AdminUser> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    adminGetUsers(page).then(setResult).catch(() => setResult(null)).finally(() => setLoading(false));
  }, [page]);

  async function handleDelete(id: string) {
    if (!confirm('Xoá người dùng này vĩnh viễn?')) return;
    setDeletingId(id);
    try {
      await adminDeleteUser(id);
      setResult((prev) => prev ? { ...prev, content: prev.content.filter((u) => u.id !== id), totalElements: prev.totalElements - 1 } : prev);
    } catch { alert('Xoá thất bại.'); }
    finally { setDeletingId(null); }
  }

  const totalPages = result?.totalPages ?? 0;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <button type="button" onClick={() => navigate('/admin')} style={backBtnStyle}><ArrowLeft size={15} /> Admin</button>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, flex: 1 }}>Người dùng</h1>
          {result && <span style={{ fontSize: '0.85rem', color: 'var(--text-soft)' }}>{result.totalElements} người</span>}
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-soft)', textAlign: 'center', padding: 40 }}>Đang tải…</p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result?.content.map((u) => (
                <div key={u.id} style={rowStyle}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', color: '#818cf8', flexShrink: 0 }}>
                    {u.displayName[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontWeight: 700 }}>{u.displayName}</span>
                      <span style={roleBadge(u.role)}>{u.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}</span>
                      {!u.active && <span style={{ fontSize: '0.72rem', background: 'rgba(239,68,68,0.2)', color: '#f87171', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>Inactive</span>}
                    </div>
                    <div style={{ fontSize: '0.83rem', color: 'var(--text-soft)' }}>{u.email}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: 2 }}>
                      {u.xp} XP · {u.streakDays} ngày streak
                    </div>
                  </div>
                  <button type="button" onClick={() => handleDelete(u.id)} disabled={deletingId === u.id || u.role === 'ROLE_ADMIN'} title={u.role === 'ROLE_ADMIN' ? 'Không thể xoá admin' : 'Xoá'} style={{ ...iconBtnStyle('#ef4444'), opacity: u.role === 'ROLE_ADMIN' ? 0.3 : 1, cursor: u.role === 'ROLE_ADMIN' ? 'not-allowed' : 'pointer' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {(!result || result.content.length === 0) && <p style={{ color: 'var(--text-soft)', textAlign: 'center', padding: 40 }}>Không có người dùng.</p>}
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
const rowStyle: React.CSSProperties = { background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12 };
const iconBtnStyle = (color: string): React.CSSProperties => ({ background: 'rgba(255,255,255,0.06)', border: `1px solid ${color}33`, borderRadius: 8, padding: '6px 8px', color, display: 'flex', alignItems: 'center' });
const roleBadge = (r: string): React.CSSProperties => ({ fontSize: '0.72rem', background: r === 'ROLE_ADMIN' ? 'rgba(220,38,38,0.2)' : 'rgba(5,150,105,0.2)', color: r === 'ROLE_ADMIN' ? '#f87171' : '#34d399', padding: '2px 8px', borderRadius: 20, fontWeight: 700 });
const pageBtnStyle = (disabled: boolean): React.CSSProperties => ({ background: disabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '7px 10px', cursor: disabled ? 'default' : 'pointer', color: disabled ? 'var(--text-soft)' : 'var(--text-primary)', opacity: disabled ? 0.4 : 1, display: 'flex', alignItems: 'center' });
