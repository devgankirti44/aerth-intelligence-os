import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './TopBar.css';

export default function TopBar() {
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef();
  const profileRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/home');
  };

  const initial = user?.name?.charAt(0).toUpperCase() || 'G';

  // Mock notifications — later can be from real backend
  const notifications = [
    { id: 1, type: 'trend', text: 'AI Farming Boom trend momentum jumped to 85', time: '2h ago' },
    { id: 2, type: 'opportunity', text: 'New high-priority opportunity: Precision Irrigation', time: '4h ago' },
    { id: 3, type: 'signal', text: 'Dollar decline signal detected in currency_macro', time: '5h ago' },
    { id: 4, type: 'competitor', text: 'Competitor activity: NVIDIA hiring spike', time: '8h ago' },
    { id: 5, type: 'report', text: 'Your weekly report is ready', time: '12h ago' },
    { id: 6, type: 'trend', text: 'US-China Tech War trend accelerating', time: '1d ago' },
    { id: 7, type: 'system', text: 'World signal ingestion completed', time: '1d ago' }
  ];

  return (
    <header className="topbar">
      <div className="topbar__search">
        <SearchIcon />
        <input
          type="text"
          className="topbar__input"
          placeholder="Search for companies, trends, signals, topics..."
        />
        <kbd className="topbar__kbd">⌘ K</kbd>
      </div>

      <div className="topbar__actions">
        <div className="topbar__live">
          <span className="topbar__live-dot" />
          <span>Live Feed</span>
        </div>

        {/* Notifications */}
        <div className="topbar__dropdown-wrap" ref={notifRef}>
          <button 
            className="topbar__icon-btn" 
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <BellIcon />
            <span className="topbar__notif-count">{notifications.length}</span>
          </button>
          
          {notifOpen && (
            <div className="topbar__dropdown topbar__dropdown--notif">
              <div className="topbar__dropdown-header">
                <span>Notifications</span>
                <span className="topbar__dropdown-count">{notifications.length}</span>
              </div>
              <div className="topbar__notif-list">
                {notifications.map(n => (
                  <div key={n.id} className="topbar__notif-item">
                    <div className={`topbar__notif-dot topbar__notif-dot--${n.type}`} />
                    <div className="topbar__notif-body">
                      <div className="topbar__notif-text">{n.text}</div>
                      <div className="topbar__notif-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="topbar__dropdown-footer" onClick={() => setNotifOpen(false)}>
                View all activity
              </button>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="topbar__dropdown-wrap" ref={profileRef}>
          <div 
            className="topbar__profile"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="topbar__avatar">{initial}</div>
            <span className="topbar__chevron">{profileOpen ? '⌃' : '⌄'}</span>
          </div>

          {profileOpen && (
            <div className="topbar__dropdown topbar__dropdown--profile">
              {user ? (
                <>
                  <div className="topbar__profile-info">
                    <div className="topbar__profile-name">{user.name}</div>
                    <div className="topbar__profile-email">{user.email}</div>
                    {user.myCompany?.name && (
                      <div className="topbar__profile-company">
                        ◈ {user.myCompany.name}
                      </div>
                    )}
                  </div>
                  <div className="topbar__dropdown-divider" />
                  {user.hasCompany ? (
                    <Link to="/my-company" className="topbar__menu-item" onClick={() => setProfileOpen(false)}>
                      My Company Dashboard
                    </Link>
                  ) : (
                    <Link to="/onboarding" className="topbar__menu-item topbar__menu-item--accent" onClick={() => setProfileOpen(false)}>
                      ✦ Register Your Company
                    </Link>
                  )}
                  <Link to="/watchlist" className="topbar__menu-item" onClick={() => setProfileOpen(false)}>
                    Watchlist
                  </Link>
                  <Link to="/reports" className="topbar__menu-item" onClick={() => setProfileOpen(false)}>
                    Reports
                  </Link>
                  <div className="topbar__dropdown-divider" />
                  <button className="topbar__menu-item topbar__menu-item--danger" onClick={handleLogout}>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="topbar__profile-info">
                    <div className="topbar__profile-name">Guest</div>
                    <div className="topbar__profile-email">Not signed in</div>
                  </div>
                  <div className="topbar__dropdown-divider" />
                  <Link 
                    to="/signup" 
                    className="topbar__menu-item topbar__menu-item--accent"
                    onClick={() => setProfileOpen(false)}
                  >
                    ✦ Create Account
                  </Link>
                  <Link 
                    to="/login" 
                    className="topbar__menu-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="11" cy="11" r="7"/>
      <path d="M16 16l4 4"/>
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M6 8a6 6 0 1112 0c0 5 2 7 2 7H4s2-2 2-7zM10 20a2 2 0 004 0"/>
    </svg>
  );
}