import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, BarChart3, BookMarked } from 'lucide-react';
import Header from '../../components/Header';
import { adminGetEventStats } from '../../services/adminApi';
import type { EventStats } from '../../services/adminApi';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<EventStats | null>(null);

  useEffect(() => {
    adminGetEventStats().then(setStats).catch(() => {});
  }, []);

  const cards = [
    { label: 'Quản lý khoá học', icon: <BookOpen size={28} />, path: '/admin/courses', color: '#6d28d9' },
    { label: 'Quản lý từ vựng', icon: <BookMarked size={28} />, path: '/admin/vocab', color: '#0891b2' },
    { label: 'Quản lý người dùng', icon: <Users size={28} />, path: '/admin/users', color: '#059669' },
    { label: 'Thống kê sự kiện', icon: <BarChart3 size={28} />, path: '/admin/events', color: '#db2777' },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px 80px' }}>
        <h1 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: 6 }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-soft)', marginBottom: 36 }}>Quản lý nội dung và người dùng</p>

        {/* Quick stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 36 }}>
            <StatCard label="Tổng sự kiện" value={stats.totalEvents} color="#a855f7" />
            {Object.entries(stats.countByType).map(([type, count]) => (
              <StatCard key={type} label={type.replace(/_/g, ' ')} value={count} color="#60a5fa" />
            ))}
          </div>
        )}

        {/* Nav cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 18 }}>
          {cards.map((c) => (
            <button
              key={c.path}
              type="button"
              onClick={() => navigate(c.path)}
              style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
                borderRadius: 18, padding: '28px 24px', cursor: 'pointer', textAlign: 'left',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ color: c.color, marginBottom: 14 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{c.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
      borderRadius: 14, padding: '18px 20px',
    }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color }}>{value.toLocaleString()}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: 4 }}>{label}</div>
    </div>
  );
}
