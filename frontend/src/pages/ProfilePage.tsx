import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, KeyRound, Check } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, login, token } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  async function handleProfileSave(e: FormEvent) {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setSavingProfile(true);
    try {
      const updated = await updateProfile({
        displayName: displayName.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      if (token) login(token, updated);
      setProfileMsg('Cập nhật thành công!');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Cập nhật thất bại.';
      setProfileError(msg);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSave(e: FormEvent) {
    e.preventDefault();
    setPwMsg('');
    setPwError('');
    if (newPassword !== confirmPassword) {
      setPwError('Mật khẩu mới không khớp.');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    setSavingPw(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPwMsg('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Đổi mật khẩu thất bại.';
      setPwError(msg);
    } finally {
      setSavingPw(false);
    }
  }

  const level = user ? Math.floor(user.xp / 200) + 1 : 1;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 80px' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', color: 'var(--text-soft)',
            cursor: 'pointer', fontSize: '0.87rem', fontWeight: 600, marginBottom: 24,
          }}
        >
          <ArrowLeft size={15} /> Quay lại
        </button>

        {/* Stats banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #4338ca 100%)',
          borderRadius: 18, padding: '24px 28px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 20,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', flexShrink: 0,
          }}>
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
              : '👤'}
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
              {user?.displayName}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
              Level {level} · {user?.xp ?? 0} XP · {user?.streakDays ?? 0} ngày streak
            </div>
          </div>
        </div>

        {/* Profile info form */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: 18,
          border: '1px solid var(--border-soft)', padding: '24px 28px', marginBottom: 20,
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Save size={16} /> Thông tin cá nhân
          </h2>
          <form onSubmit={handleProfileSave}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Tên hiển thị
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={inputStyle}
                placeholder="Nhập tên hiển thị"
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                URL ảnh đại diện (tuỳ chọn)
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                style={inputStyle}
                placeholder="https://..."
              />
            </div>
            {profileMsg && <p style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: 12 }}><Check size={14} style={{ display: 'inline', marginRight: 4 }} />{profileMsg}</p>}
            {profileError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 12 }}>{profileError}</p>}
            <button type="submit" disabled={savingProfile} style={btnStyle}>
              {savingProfile ? 'Đang lưu…' : 'Lưu thay đổi'}
            </button>
          </form>
        </div>

        {/* Change password form */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: 18,
          border: '1px solid var(--border-soft)', padding: '24px 28px',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <KeyRound size={16} /> Đổi mật khẩu
          </h2>
          <form onSubmit={handlePasswordSave}>
            {(['Mật khẩu hiện tại', 'Mật khẩu mới', 'Xác nhận mật khẩu mới'] as const).map((label, i) => {
              const values = [currentPassword, newPassword, confirmPassword];
              const setters = [setCurrentPassword, setNewPassword, setConfirmPassword];
              return (
                <div key={label} style={{ marginBottom: i === 2 ? 20 : 16 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                    {label}
                  </label>
                  <input
                    type="password"
                    value={values[i]}
                    onChange={(e) => setters[i](e.target.value)}
                    style={inputStyle}
                    placeholder="••••••••"
                    required
                  />
                </div>
              );
            })}
            {pwMsg && <p style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: 12 }}><Check size={14} style={{ display: 'inline', marginRight: 4 }} />{pwMsg}</p>}
            {pwError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 12 }}>{pwError}</p>}
            <button type="submit" disabled={savingPw} style={btnStyle}>
              {savingPw ? 'Đang đổi…' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border-soft)', borderRadius: 10,
  color: 'var(--text-primary)', padding: '10px 14px', fontSize: '0.95rem',
};

const btnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #6d28d9, #a855f7)',
  color: '#fff', border: 'none', borderRadius: 10,
  padding: '10px 22px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
};
