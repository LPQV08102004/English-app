import { User, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import heroMark from '../assets/hero.png';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const level = user ? Math.floor(user.xp / 200) + 1 : 1;

  return (
    <header className="app-header">
      <div className="brand">
        <div className="brand-mark">
          <img src={heroMark} alt="English Learning" />
        </div>
        <div className="brand-copy">
          <span className="brand-title">English Learning</span>
          <span className="brand-subtitle">Daily fluency studio</span>
        </div>
      </div>

      {user ? (
        <div className="profile-area">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`profile-chip ${menuOpen ? 'profile-chip-open' : ''}`}
          >
            <div className="profile-copy">
              <span className="profile-meta">Level {level}</span>
              <span className="profile-name">{user.displayName}</span>
            </div>
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="profile-avatar-image"
              />
            ) : (
              <div className="profile-avatar-fallback">
                <User size={18} color="white" />
              </div>
            )}
            <ChevronDown size={14} className="profile-chevron" />
          </button>

          {menuOpen && (
            <div className="profile-menu">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                className="profile-menu-item"
              >
                <Settings size={15} />
                Profile
              </button>
              {user.role === 'ROLE_ADMIN' && (
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); navigate('/admin'); }}
                  className="profile-menu-item"
                >
                  <User size={15} />
                  Admin
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="profile-menu-item"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="header-cta"
        >
          Sign in
        </button>
      )}
    </header>
  );
}
