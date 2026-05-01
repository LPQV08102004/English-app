import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../../components/Header';
import { adminGetEventStats } from '../../services/adminApi';
import type { EventStats } from '../../services/adminApi';

const TYPE_COLORS: Record<string, string> = {
  START_LESSON: '#60a5fa',
  FINISH_LESSON: '#34d399',
  ANSWER_CORRECT: '#a855f7',
  ANSWER_WRONG: '#f87171',
};

export default function AdminEventsPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGetEventStats().then(setStats).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <button type="button" onClick={() => navigate('/admin')} style={backBtnStyle}><ArrowLeft size={15} /> Admin</button>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Thống kê sự kiện</h1>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-soft)', textAlign: 'center', padding: 40 }}>Đang tải…</p>
        ) : stats ? (
          <>
            {/* Total */}
            <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#4338ca)', borderRadius: 18, padding: '24px 28px', marginBottom: 24 }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff' }}>{stats.totalEvents.toLocaleString()}</div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Tổng số sự kiện</div>
            </div>

            {/* By type */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, color: 'var(--text-muted)' }}>THEO LOẠI SỰ KIỆN</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                {Object.entries(stats.countByType).map(([type, count]) => {
                  const color = TYPE_COLORS[type] ?? '#94a3b8';
                  const pct = stats.totalEvents > 0 ? Math.round((count / stats.totalEvents) * 100) : 0;
                  return (
                    <div key={type} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: '16px 18px' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{count.toLocaleString()}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-soft)', margin: '4px 0 8px' }}>{type.replace(/_/g, ' ')}</div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
                        <div style={{ height: 4, borderRadius: 4, background: color, width: `${pct}%` }} />
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginTop: 4 }}>{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top users */}
            {stats.topUsers.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, color: 'var(--text-muted)' }}>NGƯỜI DÙNG HOẠT ĐỘNG NHẤT</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stats.topUsers.map((u, i) => (
                    <div key={u.userId} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: i === 0 ? '#fff' : '#818cf8', flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.93rem' }}>{u.displayName || u.userId.slice(0, 8)}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#a855f7' }}>{u.eventCount.toLocaleString()} events</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p style={{ color: 'var(--text-soft)', textAlign: 'center', padding: 40 }}>Không thể tải thống kê.</p>
        )}
      </div>
    </div>
  );
}

const backBtnStyle: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-soft)', cursor: 'pointer', fontSize: '0.87rem', fontWeight: 600 };
