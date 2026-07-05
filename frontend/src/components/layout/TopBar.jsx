import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './TopBar.css';

const API = 'https://aerth-intelligence-os.onrender.com/api';

export default function TopBar() {
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  const notifRef = useRef();
  const profileRef = useRef();
  const searchRef = useRef();
  const searchInputRef = useRef();
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cmd+K / Ctrl+K to focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const [trends, companies, opps] = await Promise.all([
          axios.get(`${API}/trends`).catch(() => ({ data: [] })),
          axios.get(`${API}/companies`).catch(() => ({ data: [] })),
          axios.get(`${API}/opportunities`).catch(() => ({ data: [] }))
        ]);

        const q = searchQuery.toLowerCase();

        const matchedTrends = (trends.data || []).filter(t =>
          t.name?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
        ).slice(0, 5);

        const matchedCompanies = (companies.data || []).filter(c =>
          c.name?.toLowerCase().includes(q) ||
          c.sector?.toLowerCase().includes(q)
        ).slice(0, 5);

        const matchedOpps = (opps.data || []).filter(o =>
          o.title?.toLowerCase().includes(q) ||
          o.sector?.toLowerCase().includes(q) ||
          o.description?.toLowerCase().includes(q)
        ).slice(0, 5);

        setSearchResults({
          trends: matchedTrends,
          companies: matchedCompanies,
          opportunities: matchedOpps
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResultClick = (path) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/home');
  };

  const initial = user?.name?.charAt(0).toUpperCase() || 'G';

  const notifications = [
    { id: 1, type: 'trend', text: 'AI Farming Boom trend momentum jumped to 85', time: '2h ago' },
    { id: 2, type: 'opportunity', text: 'New high-priority opportunity: Precision Irrigation', time: '4h ago' },
    { id: 3, type: 'signal', text: 'Dollar decline signal detected in currency_macro', time: '5h ago' },
    { id: 4, type: 'competitor', text: 'Competitor activity: NVIDIA hiring spike', time: '8h ago' },
    { id: 5, type: 'report', text: 'Your weekly report is ready', time: '12h ago' },
    { id: 6, type: 'trend', text: 'US-China Tech War trend accelerating', time: '1d ago' },
    { id: 7, type: 'system', text: 'World signal ingestion completed', time: '1d ago' }
  ];

  const totalResults = searchResults
    ? searchResults.trends.length + searchResults.companies.length + searchResults.opportunities.length
    : 0;

  return (
    <header className="topbar">
      {/* Search */}
      <div className="topbar__dropdown-wrap topbar__search-wrap" ref={searchRef}>
        <div className={`topbar__search ${searchOpen ? 'topbar__search--active' : ''}`}>
          <SearchIcon />
          <input
            ref={searchInputRef}
            type="text"
            className="topbar__input"
            placeholder="Search for companies, trends, signals, topics..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
          />
          <kbd className="topbar__kbd">⌘ K</kbd>
        </div>

        {searchOpen && searchQuery.length >= 2 && (
          <div className="topbar__dropdown topbar__dropdown--search">
            {searching ? (
              <div className="topbar__search-loading">Searching...</div>
            ) : totalResults === 0 ? (
              <div className="topbar__search-empty">No results for "{searchQuery}"</div>
            ) : (
              <div className="topbar__search-results">
                {searchResults.trends.length > 0 && (
                  <div className="topbar__search-section">
                    <div className="topbar__search-label">TRENDS</div>
                    {searchResults.trends.map(t => (
                      <div
                        key={t._id}
                        className="topbar__search-item"
                        onClick={() => handleResultClick(`/trends/${t.slug}`)}
                      >
                        <div className="topbar__search-item-title">↗ {t.name}</div>
                        <div className="topbar__search-item-sub">{t.category} · momentum {t.momentum}</div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.companies.length > 0 && (
                  <div className="topbar__search-section">
                    <div className="topbar__search-label">COMPANIES</div>
                    {searchResults.companies.map(c => (
                      <div
                        key={c._id}
                        className="topbar__search-item"
                        onClick={() => handleResultClick(`/companies/${c.slug}`)}
                      >
                        <div className="topbar__search-item-title">◈ {c.name}</div>
                        <div className="topbar__search-item-sub">{c.sector}</div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.opportunities.length > 0 && (
                  <div className="topbar__search-section">
                    <div className="topbar__search-label">OPPORTUNITIES</div>
                    {searchResults.opportunities.map(o => (
                      <div
                        key={o._id}
                        className="topbar__search-item"
                        onClick={() => handleResultClick('/opportunities')}
                      >
                        <div className="topbar__search-item-title">◎ {o.title}</div>
                        <div className="topbar__search-item-sub">{o.sector} · score {o.score}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
                      <div className="topbar__profile-company">◈ {user.myCompany.name}</div>
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
                  <Link to="/settings" className="topbar__menu-item" onClick={() => setProfileOpen(false)}>
                    Settings
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
                  <Link to="/signup" className="topbar__menu-item topbar__menu-item--accent" onClick={() => setProfileOpen(false)}>
                    ✦ Create Account
                  </Link>
                  <Link to="/login" className="topbar__menu-item" onClick={() => setProfileOpen(false)}>
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