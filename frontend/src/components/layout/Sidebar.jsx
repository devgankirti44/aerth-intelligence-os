import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const NAV = [
  { path: '/home',                label: 'Home',              icon: HomeIcon },
  { path: '/my-company',          label: 'My Company',         icon: MyCompanyIcon, requiresCompany: true },
  { path: '/micro-plays',         label: 'Micro Plays',        icon: SparkleIcon },
  { path: '/world-intelligence',  label: 'World Intelligence', icon: GlobeIcon },
  { path: '/companies',           label: 'Companies',          icon: CompaniesIcon },
  { path: '/trends',              label: 'Trends',             icon: TrendsIcon },
  { path: '/opportunities',       label: 'Opportunities',      icon: OpportunitiesIcon },
  { path: '/simulations',         label: 'Simulations',        icon: SimulationsIcon },
  { path: '/reports',             label: 'Reports',            icon: ReportsIcon },
  { path: '/research',            label: 'Research',           icon: ResearchIcon },
  { path: '/knowledge',           label: 'Knowledge Graph',    icon: KnowledgeIcon },
  { path: '/watchlist',           label: 'Watchlist',          icon: WatchlistIcon },
  { path: '/settings',            label: 'Settings',           icon: SettingsIcon },
];
export default function Sidebar({ onOpenAsk }) {

  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/home');
  };

  const displayName = user?.name || 'Guest';
  const initial = (user?.name || 'G').charAt(0).toUpperCase();
  const planLabel = user ? (user.hasCompany ? 'My Company Active' : 'Setup Company') : 'Not Signed In';

  return (
    <aside className="nav">
      <div className="nav__brand">
        <LeafMark />
        <div className="nav__brand-text">
          <span className="nav__brand-name">AERTH</span>
          <span className="nav__brand-sub">INTELLIGENCE OS</span>
        </div>
      </div>

      <nav className="nav__items">
        {NAV.map(item => {
          if (item.requiresCompany && !user?.hasCompany) return null;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav__item ${isActive ? 'nav__item--active' : ''}`
              }
            >
              <span className="nav__item-icon"><Icon /></span>
              <span className="nav__item-label">{item.label}</span>
              {item.path === '/my-company' && <span className="nav__item-badge">•</span>}
            </NavLink>
          );
        })}
      </nav>
<div className="nav__assistant">
  <button
    type="button"
    className="nav__assistant-inner"
    onClick={onOpenAsk}
  >
    <div className="nav__assistant-icon"><SparkIcon /></div>
    <div className="nav__assistant-text">
      <span className="nav__assistant-title">Ask AERTH AI</span>
      <span className="nav__assistant-sub">Your intelligence analyst</span>
    </div>
    <span className="nav__assistant-arrow">→</span>
  </button>
</div>
      

      <div className="nav__profile-wrap" ref={menuRef}>
        {menuOpen && (
          <div className="nav__profile-menu">
            {user ? (
              <>
                {!user.hasCompany && (
                  <button
                    className="nav__menu-item nav__menu-item--accent"
                    onClick={() => { setMenuOpen(false); navigate('/onboarding'); }}
                  >
                    ✦ Register Your Company
                  </button>
                )}
                {user.hasCompany && (
                  <button
                    className="nav__menu-item"
                    onClick={() => { setMenuOpen(false); navigate('/my-company'); }}
                  >
                    ◈ My Company
                  </button>
                )}
                <button
                  className="nav__menu-item"
                  onClick={() => { setMenuOpen(false); navigate('/micro-plays'); }}
                >
                  ✦ Micro Plays
                </button>
                <div className="nav__menu-info">
                  <span className="nav__menu-email">{user.email}</span>
                </div>
                <button className="nav__menu-item nav__menu-item--danger" onClick={handleLogout}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  className="nav__menu-item nav__menu-item--accent"
                  onClick={() => { setMenuOpen(false); navigate('/signup'); }}
                >
                  ✦ Create Account
                </button>
                <button
                  className="nav__menu-item"
                  onClick={() => { setMenuOpen(false); navigate('/login'); }}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        )}
        <div className="nav__profile" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="nav__profile-avatar">{initial}</div>
          <div className="nav__profile-info">
            <span className="nav__profile-name">{displayName}</span>
            <span className="nav__profile-plan">{planLabel}</span>
          </div>
          <span className="nav__profile-chevron">{menuOpen ? '⌃' : '⌄'}</span>
        </div>
      </div>
    </aside>
  );
}

/* Icons */
function LeafMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 4C9 4 6 8 6 13c0 6 4 11 8 11 0 0 0-5 0-11 0 6 0 11 0 11 4 0 8-5 8-11 0-5-3-9-8-9z"
        stroke="url(#leafGrad)" strokeWidth="1.2" strokeLinejoin="round"/>
      <defs>
        <linearGradient id="leafGrad" x1="0" y1="0" x2="28" y2="28">
          <stop offset="0" stopColor="#D6C08D"/>
          <stop offset="1" stopColor="#8F7542"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
function HomeIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M3 12L12 4l9 8v9a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-9z"/></svg>; }
function GlobeIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 4 3 14 0 18M12 3c-3 4-3 14 0 18"/></svg>; }
function CompaniesIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="4" y="8" width="16" height="12" rx="1"/><path d="M8 8V5h8v3M9 12h2M13 12h2M9 16h2M13 16h2"/></svg>; }
function TrendsIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M4 17l5-5 4 4 7-8"/><path d="M14 8h6v6"/></svg>; }
function OpportunitiesIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>; }
function SimulationsIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M12 3l9 5v8l-9 5-9-5V8l9-5zM12 3v18M3 8l9 5 9-5"/></svg>; }
function ReportsIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M6 3h9l5 5v13H6V3zM15 3v5h5M9 12h6M9 16h6"/></svg>; }
function ResearchIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L20 20"/></svg>; }
function KnowledgeIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7.5 7.5L11 16M16.5 7.5L13 16M8 6h8"/></svg>; }
function WatchlistIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5L8 14l-5-4.5 6.5-.5L12 3z"/></svg>; }
function SettingsIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="12" cy="12" r="3"/><path d="M12 2l1.5 3 3.3-.5 1 3.2 3 1.5-1 3.2 2 2.6-2 2.6 1 3.2-3 1.5-1 3.2-3.3-.5L12 22l-1.5-3-3.3.5-1-3.2-3-1.5 1-3.2-2-2.6 2-2.6-1-3.2 3-1.5 1-3.2 3.3.5L12 2z"/></svg>; }
function SparkIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/></svg>; }
function MyCompanyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M12 2l3 5 5 1-4 4 1 6-5-3-5 3 1-6-4-4 5-1 3-5z"/>
    </svg>
  );
}
function SparkleIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
    <path d="M12 3l1.5 5 5 1.5-5 1.5L12 16l-1.5-5-5-1.5 5-1.5L12 3z"/>
    <path d="M19 16l0.7 2 2 0.7-2 0.7L19 21l-0.7-2-2-0.7 2-0.7L19 16z"/>
  </svg>;
}